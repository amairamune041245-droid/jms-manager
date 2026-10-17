import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Connect, Plugin } from 'vite'

const imagePath = join(tmpdir(), 'jms-manager-ocr.png')
const textPath = join(tmpdir(), 'jms-manager-ocr.txt')

function isLocal(address: string | undefined): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

export class OcrLines {
  private child: ChildProcessWithoutNullStreams | null = null
  private pending: ((line: string) => void) | null = null
  private buffer = ''
  private queue: Promise<unknown> = Promise.resolve()
  private idle: ReturnType<typeof setTimeout> | null = null

  read(png: Buffer): Promise<string> {
    this.armIdle()
    const job = this.queue.then(() => this.recognize(png))
    this.queue = job.then(
      () => undefined,
      () => undefined,
    )
    return job
  }

  stop(): void {
    if (this.idle) clearTimeout(this.idle)
    this.idle = null
    const child = this.child
    this.child = null
    this.pending = null
    this.buffer = ''
    if (child && child.exitCode === null) {
      child.stdin.write('quit\n')
      child.kill()
    }
  }

  private armIdle(): void {
    if (this.idle) clearTimeout(this.idle)
    this.idle = setTimeout(() => this.stop(), 20000)
    this.idle.unref()
  }

  private ensure(): ChildProcessWithoutNullStreams {
    if (this.child && this.child.exitCode === null && !this.child.killed) return this.child
    const script = join(process.cwd(), 'scripts', 'ocr-line.ps1')
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-Sta', '-ExecutionPolicy', 'Bypass', '-File', script, '-ImagePath', imagePath, '-OutPath', textPath],
      { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] },
    )
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      this.buffer += chunk
      let newline = this.buffer.indexOf('\n')
      while (newline >= 0) {
        const line = this.buffer.slice(0, newline).replace(/\r/g, '').trim()
        this.buffer = this.buffer.slice(newline + 1)
        if (line === 'ready' || line.startsWith('error')) {
          const waiter = this.pending
          this.pending = null
          waiter?.(line)
        }
        newline = this.buffer.indexOf('\n')
      }
    })
    child.on('exit', () => {
      if (this.child === child) {
        this.child = null
        this.buffer = ''
        const waiter = this.pending
        this.pending = null
        waiter?.('error process-exited')
      }
    })
    this.child = child
    return child
  }

  private recognize(png: Buffer): Promise<string> {
    const child = this.ensure()
    return writeFile(imagePath, png).then(
      () =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            this.pending = null
            this.stop()
            reject(new Error('名前の読み取りが時間内に終わりませんでした'))
          }, 8000)
          this.pending = (line) => {
            clearTimeout(timer)
            if (line === 'ready') {
              readFile(textPath, 'utf8').then((text) => resolve(text.trim()), reject)
              return
            }
            reject(new Error('名前を読めませんでした'))
          }
          child.stdin.write('read\n')
        }),
    )
  }
}

function readBody(req: Connect.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 1_500_000) {
        reject(new Error('画像が大きすぎます'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function attachOcr(ocr: OcrLines, middlewares: Connect.Server): void {
  middlewares.use('/api/item-name', (req, res) => {
    if (!isLocal(req.socket.remoteAddress)) {
      res.statusCode = 403
      res.end()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }
    readBody(req).then(
      (png) =>
        ocr.read(png).then(
          (text) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify({ text }))
          },
          (error: unknown) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(error instanceof Error ? error.message : '名前を読めませんでした')
          },
        ),
      () => {
        res.statusCode = 400
        res.end()
      },
    )
  })
}

export function ocrLinePlugin(): Plugin {
  const ocr = new OcrLines()
  return {
    name: 'ocr-line',
    configureServer(server) {
      attachOcr(ocr, server.middlewares)
      server.httpServer?.on('close', () => ocr.stop())
    },
    configurePreviewServer(server) {
      attachOcr(ocr, server.middlewares)
      server.httpServer?.on('close', () => ocr.stop())
    },
  }
}
