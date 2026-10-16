import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { unlink, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Connect, Plugin } from 'vite'

const framePath = join(tmpdir(), 'jms-manager-screen.png')

type Frame = {
  png: Buffer
  source: 'window' | 'screen'
  cursor: { x: number; y: number } | null
}

function isLocal(address: string | undefined): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

export class ScreenFrames {
  private child: ChildProcessWithoutNullStreams | null = null
  private pending: ((line: string) => void) | null = null
  private buffer = ''
  private queue: Promise<unknown> = Promise.resolve()
  private idle: ReturnType<typeof setTimeout> | null = null

  grab(): Promise<Frame> {
    this.armIdle()
    const job = this.queue.then(() => this.snap())
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
    void unlink(framePath).catch(() => undefined)
    void unlink(`${framePath}.part`).catch(() => undefined)
  }

  private armIdle(): void {
    if (this.idle) clearTimeout(this.idle)
    this.idle = setTimeout(() => this.stop(), 4000)
    this.idle.unref()
  }

  private ensure(): ChildProcessWithoutNullStreams {
    if (this.child && this.child.exitCode === null && !this.child.killed) return this.child
    const script = join(process.cwd(), 'scripts', 'screen-capture.ps1')
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-Sta', '-ExecutionPolicy', 'Bypass', '-File', script, '-OutPath', framePath],
      { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] },
    )
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      this.buffer += chunk
      let newline = this.buffer.indexOf('\n')
      while (newline >= 0) {
        const line = this.buffer.slice(0, newline).replace(/\r/g, '').trim()
        this.buffer = this.buffer.slice(newline + 1)
        if (line.startsWith('ready') || line.startsWith('error')) {
          const waiter = this.pending
          this.pending = null
          waiter?.(line)
        }
        newline = this.buffer.indexOf('\n')
      }
    })
    this.child = child
    return child
  }

  private snap(): Promise<Frame> {
    const child = this.ensure()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null
        this.stop()
        reject(new Error('画面の取得が時間内に終わりませんでした'))
      }, 8000)
      this.pending = (line) => {
        clearTimeout(timer)
        if (line.startsWith('ready')) {
          const [, kind, x, y] = line.split(/\s+/)
          const source = kind === 'window' ? 'window' : 'screen'
          const cursor =
            x !== undefined && y !== undefined && Number.isFinite(Number(x)) && Number.isFinite(Number(y))
              ? { x: Number(x), y: Number(y) }
              : null
          readFile(framePath).then((png) => resolve({ png, source, cursor }), reject)
          return
        }
        reject(new Error(line.replace(/^error\s*/, '') || '画面を取得できませんでした'))
      }
      child.stdin.write('snap\n')
    })
  }
}

function attach(frames: ScreenFrames, middlewares: Connect.Server): void {
  middlewares.use('/api/screen-frame', (req, res) => {
    if (!isLocal(req.socket.remoteAddress)) {
      res.statusCode = 403
      res.end()
      return
    }
    if (req.method === 'DELETE') {
      frames.stop()
      res.statusCode = 204
      res.end()
      return
    }
    if (req.method !== 'GET') {
      res.statusCode = 405
      res.end()
      return
    }
    frames.grab().then(
      ({ png, source, cursor }) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('X-Capture-Source', source)
        if (cursor) {
          res.setHeader('X-Cursor-X', String(cursor.x))
          res.setHeader('X-Cursor-Y', String(cursor.y))
        }
        res.end(png)
      },
      (error: unknown) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(error instanceof Error ? error.message : '画面を取得できませんでした')
      },
    )
  })
}

export function screenCapturePlugin(): Plugin {
  const frames = new ScreenFrames()
  return {
    name: 'screen-frame',
    configureServer(server) {
      attach(frames, server.middlewares)
      server.httpServer?.on('close', () => frames.stop())
    },
    configurePreviewServer(server) {
      attach(frames, server.middlewares)
      server.httpServer?.on('close', () => frames.stop())
    },
  }
}
