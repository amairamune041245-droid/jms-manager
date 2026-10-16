import { useEffect, useRef, useState } from 'react'
import {
  chooseHoveredSlot,
  isTooltipInk,
  locateEquipmentWindow,
  preferStableGrid,
  rankSlotIcons,
  readHoveredTooltip,
  slotAt,
  tooltipTextLines,
} from '../../domain/equipmentCapture.ts'
import type {
  CaptureImage,
  CaptureRect,
  EquipmentCaptureInput,
  SlotReading,
  WindowGrid,
} from '../../domain/equipmentCapture.ts'
import { matchItemName, slotGroupForItem } from '../../domain/equipmentSets.ts'
import { parseTooltipLines } from '../../domain/tooltipText.ts'
import { EQUIPMENT_SLOTS, slotById } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotGroup, EquipmentSlotId } from '../../domain/equipmentSlots.ts'
import { useAppStore } from '../app/useAppStore.ts'

type Mode = 'icons' | 'info'

type Frame = {
  image: CaptureImage
  context: CanvasRenderingContext2D
  cursor: { x: number; y: number } | null
}

async function cropBlob(
  context: CanvasRenderingContext2D,
  rect: CaptureRect,
  scale: number,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(rect.w * scale))
  canvas.height = Math.max(1, Math.round(rect.h * scale))
  const target = canvas.getContext('2d')
  if (!target) return null
  target.imageSmoothingEnabled = false
  target.drawImage(context.canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

async function stackInk(context: CanvasRenderingContext2D, rects: CaptureRect[]): Promise<Blob | null> {
  const rows = rects.slice(0, 28)
  if (rows.length === 0) return null
  const gap = 18
  const pad = 14
  let width = 80
  let height = pad
  const placed = rows.map((rect) => {
    const scale = Math.max(3, Math.ceil(56 / Math.max(1, rect.h)))
    const w = Math.max(1, Math.round(rect.w * scale))
    const h = Math.max(56, Math.round(rect.h * scale))
    const y = height
    height += h + gap
    width = Math.max(width, w + pad * 2)
    return { rect, w, h, y }
  })
  height += pad
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const target = canvas.getContext('2d', { willReadFrequently: true })
  if (!target) return null
  target.imageSmoothingEnabled = false
  target.fillStyle = '#000'
  target.fillRect(0, 0, width, height)
  for (const row of placed) {
    target.drawImage(context.canvas, row.rect.x, row.rect.y, row.rect.w, row.rect.h, pad, row.y, row.w, row.h)
  }
  const pixels = target.getImageData(0, 0, width, height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const on = isTooltipInk(pixels.data[index] ?? 0, pixels.data[index + 1] ?? 0, pixels.data[index + 2] ?? 0)
    const color = on ? 255 : 0
    pixels.data[index] = color
    pixels.data[index + 1] = color
    pixels.data[index + 2] = color
    pixels.data[index + 3] = 255
  }
  target.putImageData(pixels, 0, 0)
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

function tonesClose(previous: string, next: string): boolean {
  const left = previous.split('-').map(Number)
  const right = next.split('-').map(Number)
  if (left.length !== 3 || right.length !== 3 || left.some((value) => Number.isNaN(value))) return previous === next
  return left.every((value, index) => Math.abs(value - (right[index] ?? 99)) <= 1)
}

function tone(image: CaptureImage, rect: CaptureRect): string {
  let red = 0
  let green = 0
  let blue = 0
  let count = 0
  const y2 = Math.min(image.height, rect.y + rect.h)
  const x2 = Math.min(image.width, rect.x + rect.w)
  for (let y = Math.max(0, rect.y); y < y2; y += 4) {
    for (let x = Math.max(0, rect.x); x < x2; x += 4) {
      const index = (y * image.width + x) * 4
      red += image.data[index] ?? 0
      green += image.data[index + 1] ?? 0
      blue += image.data[index + 2] ?? 0
      count += 1
    }
  }
  if (count === 0) return '0'
  return `${Math.round(red / count / 18)}-${Math.round(green / count / 18)}-${Math.round(blue / count / 18)}`
}

function crop(
  source: CanvasRenderingContext2D,
  rect: CaptureRect,
  maxSize: number,
  type: 'image/png' | 'image/jpeg',
  quality?: number,
): string {
  const scale = Math.min(1, maxSize / Math.max(rect.w, rect.h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(rect.w * scale))
  canvas.height = Math.max(1, Math.round(rect.h * scale))
  const context = canvas.getContext('2d')
  if (!context) return ''
  context.drawImage(source.canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL(type, quality)
}

const idleNote =
  '先にアイコンを取り込みます。装備情報は、説明の画像を出してから名前と★を付けます。'

const CONFIRM_GROUPS = new Set<EquipmentSlotGroup>([
  'ring',
  'pendant',
  'badge',
  'face',
  'earring',
  'belt',
  'pocket',
])

type TooltipPreview = {
  key: string
  imageUrl: string
  stars: number
  slotId: EquipmentSlotId | ''
  name: string
}

export function EquipmentCapture({ characterId }: { characterId: string }) {
  const { captureEquipment, clearCapturedEquipment, setSlotEquipmentInfo, data } = useAppStore()
  const [mode, setMode] = useState<Mode | null>(null)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState(idleNote)
  const [preview, setPreview] = useState<TooltipPreview | null>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const noteRef = useRef(note)
  const pendingRef = useRef('')
  const keyRef = useRef('')
  const seenRef = useRef(0)
  const toneRef = useRef<Record<string, string>>({})
  const emptyRef = useRef<Record<string, number>>({})
  const gridRef = useRef<WindowGrid | null>(null)
  const shownKeyRef = useRef('')
  const iconsRef = useRef<Map<string, { url: string; image: CaptureImage }>>(new Map())
  const sessionRef = useRef(0)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    return () => stopRef.current?.()
  }, [])

  function show(text: string, error = false) {
    setFailed(error)
    if (noteRef.current === text) return
    noteRef.current = text
    setNote(text)
  }

  function haltCapture() {
    sessionRef.current += 1
    stopRef.current?.()
    stopRef.current = null
    pendingRef.current = ''
    keyRef.current = ''
    seenRef.current = 0
    toneRef.current = {}
    emptyRef.current = {}
    shownKeyRef.current = ''
    setPreview(null)
    void fetch('/api/screen-frame', { method: 'DELETE' }).catch(() => undefined)
  }

  function stop() {
    haltCapture()
    setMode(null)
    show('読み取りを止めました。')
  }

  function readIcons({ image, context, cursor }: Frame) {
    const found = locateEquipmentWindow(image)
    if (!found) {
      pendingRef.current = ''
      seenRef.current = 0
      show(
        gridRef.current
          ? '装備ウィンドウが説明などで隠れています。マウスを装備から外すと続けます。'
          : '装備ウィンドウが見つかりません。ゲームの装備画面を開いて、手前に出してください。',
        true,
      )
      return
    }
    const located = preferStableGrid(image, gridRef.current, found)
    gridRef.current = located.grid
    const hover = cursor ? slotAt(located.grid, cursor.x, cursor.y) : null
    const visible = located.slots.filter((slot) => slot.state !== 'hidden' && slot.id !== hover)
    const held = visible.map((slot) => holdSlot(image, slot))
    const characterTone = located.characterVisible ? tone(image, located.character) : 'hidden'
    const signature = [String(located.presetIndex), ...held.map((slot) => `${slot.id}:${slot.state}:${slot.tone}`)].join(
      '|',
    )
    if (signature !== pendingRef.current) {
      pendingRef.current = signature
      seenRef.current = 1
      show('アイコンを確認しています（1/2）。マウスは装備から外しておいてください。')
      return
    }
    seenRef.current += 1
    const presetLabel =
      located.presetIndex === null ? '今開いているプリセット' : `プリセット${located.presetIndex + 1}`
    const skipped = located.slots.length - visible.length
    const tail = skipped > 0 ? `隠れていた${skipped}枠は前のままです。` : ''
    if (signature === keyRef.current) {
      show(`${presetLabel}のアイコンは取り込み済みです。${tail}`)
      return
    }
    const changed = held.filter((slot) => toneRef.current[slot.id] !== `${slot.state}:${slot.tone}`)
    const portraitChanged = toneRef.current.character !== settleTone('character', characterTone)
    if (changed.length === 0 && !portraitChanged && signature === keyRef.current) return
    keyRef.current = signature
    for (const slot of changed) toneRef.current[slot.id] = `${slot.state}:${slot.tone}`
    if (portraitChanged) toneRef.current.character = settleTone('character', characterTone)
    const input: EquipmentCaptureInput = {
      presetIndex: located.presetIndex,
      portraitDataUrl:
        portraitChanged && located.characterVisible
          ? crop(context, located.character, 320, 'image/jpeg', 0.86) || null
          : null,
      slots: changed.map((slot) => ({
        id: slot.id,
        occupied: slot.state === 'filled',
        imageDataUrl: slot.state === 'filled' ? crop(context, slot.rect, 72, 'image/png') : null,
      })),
    }
    captureEquipment(characterId, input)
    show(`${presetLabel}のアイコンと中央の画像を取り込みました。${tail}`)
  }

  function holdSlot(image: CaptureImage, slot: SlotReading) {
    const nextTone = tone(image, slot)
    if (slot.state === 'filled') {
      emptyRef.current[slot.id] = 0
      return { id: slot.id, rect: slot, state: 'filled' as const, tone: settleTone(slot.id, nextTone) }
    }
    const streak = (emptyRef.current[slot.id] ?? 0) + 1
    emptyRef.current[slot.id] = streak
    if (streak < 4 && toneRef.current[slot.id]?.startsWith('filled:')) {
      const kept = toneRef.current[slot.id]?.slice('filled:'.length) ?? nextTone
      return { id: slot.id, rect: slot, state: 'filled' as const, tone: kept }
    }
    return { id: slot.id, rect: slot, state: 'empty' as const, tone: nextTone }
  }

  function settleTone(id: string, next: string): string {
    const previous = toneRef.current[id]
    const stored = previous?.startsWith('filled:') ? previous.slice('filled:'.length) : previous
    if (!stored || stored === 'hidden') return next
    return tonesClose(stored, next) ? stored : next
  }

  function cursorInside(image: CaptureImage, cursor: { x: number; y: number } | null): boolean {
    return cursor != null && cursor.x >= 0 && cursor.y >= 0 && cursor.x < image.width && cursor.y < image.height
  }

  async function readInfo({ image, context, cursor }: Frame) {
    const session = sessionRef.current
    if (!cursorInside(image, cursor)) {
      show('マウスがゲーム画面の外にあります。メイプルのウィンドウ上へ動かしてください。')
      return
    }
    const pointer = cursor ?? { x: 0, y: 0 }
    if (!gridRef.current) {
      const found = locateEquipmentWindow(image)
      if (found) gridRef.current = found.grid
    }
    const hovered = readHoveredTooltip(image, pointer)
    if (!hovered) {
      const under = gridRef.current ? slotAt(gridRef.current, pointer.x, pointer.y) : null
      show(
        under
          ? `${slotById(under).label}の上にカーソルがあります。説明が開いたら読みます。`
          : 'カーソルの位置に説明がありません。装備の上で止めてください。',
      )
      return
    }
    const shotKey = `${hovered.body.x}:${hovered.body.y}:${hovered.body.w}:${hovered.stars}`
    const shot = crop(context, hovered.body, 480, 'image/png')
    const slots = await equippedIcons()
    if (slots.length === 0) {
      show('先に「アイコンを取り込む」をしてください。', true)
      return
    }
    const distances = rankSlotIcons(image, hovered.icon, slots)
    const onTooltip =
      pointer.x >= hovered.body.x &&
      pointer.y >= hovered.body.y &&
      pointer.x < hovered.body.x + hovered.body.w &&
      pointer.y < hovered.body.y + hovered.body.h
    const cursorSlot = !onTooltip && gridRef.current ? slotAt(gridRef.current, pointer.x, pointer.y) : null
    if (shownKeyRef.current === shotKey) return
    shownKeyRef.current = shotKey
    setPreview({
      key: shotKey,
      imageUrl: shot,
      stars: hovered.stars,
      slotId: cursorSlot ?? '',
      name: '',
    })
    const readName = hovered.name ? matchItemName(await recognizeName(context, hovered.name)) : null
    const group = readName ? slotGroupForItem(readName) : null
    const namedSlots = group
      ? slots.filter((slot) => slotById(slot.id).group === group).map((slot) => slot.id)
      : []
    const slotId = cursorSlot ?? chooseHoveredSlot({ distances, cursorSlot, namedSlots })
    const needsConfirm = !slotId || CONFIRM_GROUPS.has(slotById(slotId).group)
    setPreview((current) =>
      current?.key === shotKey
        ? { ...current, slotId: slotId ?? current.slotId, name: readName ?? current.name }
        : current,
    )
    if (sessionRef.current !== session) return
    if (needsConfirm || !slotId) {
      show(
        slotId
          ? `${slotById(slotId).label}の説明です。枠を確認して付けてください。`
          : '説明を取り込みました。付ける枠を選んでください。',
      )
      return
    }
    const chosenGroup = readName ? slotGroupForItem(readName) : null
    const nameFits = Boolean(readName && (!chosenGroup || slotById(slotId).group === chosenGroup))
    setSlotEquipmentInfo(characterId, slotId, {
      starForce: hovered.stars,
      ...(nameFits && readName ? { name: readName } : {}),
    })
    show(`${slotById(slotId).label}に${[nameFits ? readName : '', `★${hovered.stars}`].filter(Boolean).join('、')}を付けました。`)
    void readDetails(context, image, hovered).then((detail) => {
      if (sessionRef.current !== session || !detail) return
      setSlotEquipmentInfo(characterId, slotId, {
        ...(detail.fields.stats.length > 0 ? { stats: detail.fields.stats } : {}),
        ...(detail.fields.enhanceText ? { enhanceText: detail.fields.enhanceText } : {}),
        ...(detail.fields.potentials.length > 0 ? { potentials: detail.fields.potentials } : {}),
        ...(detail.fields.additionalPotentials.length > 0
          ? { additionalPotentials: detail.fields.additionalPotentials }
          : {}),
        ...(detail.fields.notes ? { notes: detail.fields.notes } : {}),
      })
    })
  }

  async function readDetails(
    context: CanvasRenderingContext2D,
    image: CaptureImage,
    hovered: { body: CaptureRect; icon: CaptureRect },
  ) {
    const rects = tooltipTextLines(image, hovered.body, hovered.icon)
    if (rects.length < 2) return null
    const blob = await stackInk(context, rects)
    if (!blob) return null
    try {
      const response = await fetch('/api/item-name', {
        method: 'POST',
        headers: { 'content-type': 'image/png' },
        body: blob,
        signal: AbortSignal.timeout(4000),
      })
      if (!response.ok) return null
      const payload = (await response.json()) as { text?: string }
      const lines = (payload.text ?? '')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
      if (lines.length === 0) return null
      return { fields: parseTooltipLines(lines) }
    } catch {
      return null
    }
  }

  function applyPreview() {
    if (!preview?.slotId) {
      show('付ける枠を選んでください。', true)
      return
    }
    const slotId = preview.slotId
    setSlotEquipmentInfo(characterId, slotId, {
      starForce: preview.stars,
      ...(preview.name.trim() ? { name: preview.name.trim() } : {}),
    })
    show(`${slotById(slotId).label}に${[preview.name.trim(), `★${preview.stars}`].filter(Boolean).join('、')}を付けました。`)
  }

  async function recognizeName(context: CanvasRenderingContext2D, rect: CaptureRect): Promise<string> {
    try {
      const blob = await cropBlob(context, rect, 4)
      if (!blob) return ''
      const response = await fetch('/api/item-name', {
        method: 'POST',
        headers: { 'content-type': 'image/png' },
        body: blob,
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) return ''
      const payload = (await response.json()) as { text?: string }
      return payload.text ?? ''
    } catch {
      return ''
    }
  }

  async function equippedIcons() {
    const loadout = dataRef.current.loadoutsByCharacterId[characterId]
    if (!loadout) return []
    const assigned = loadout.presets[loadout.activePresetIndex].slots
    const slots: { id: EquipmentSlotId; image: CaptureImage }[] = []
    for (const [slotId, itemId] of Object.entries(assigned)) {
      if (!itemId) continue
      const item = dataRef.current.items.find((entry) => entry.id === itemId)
      if (!item?.imageDataUrl) continue
      const image = await decodeIcon(item.id, item.imageDataUrl)
      if (image) slots.push({ id: slotId as EquipmentSlotId, image })
    }
    return slots
  }

  async function decodeIcon(itemId: string, url: string): Promise<CaptureImage | null> {
    const cached = iconsRef.current.get(itemId)
    if (cached?.url === url) return cached.image
    const picture = new Image()
    const loaded = new Promise<CaptureImage | null>((resolve) => {
      picture.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = picture.naturalWidth
        canvas.height = picture.naturalHeight
        const context = canvas.getContext('2d')
        if (!context || canvas.width === 0 || canvas.height === 0) {
          resolve(null)
          return
        }
        context.drawImage(picture, 0, 0)
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
        resolve({ width: canvas.width, height: canvas.height, data: pixels.data })
      }
      picture.onerror = () => resolve(null)
    })
    picture.src = url
    const image = await loaded
    if (image) iconsRef.current.set(itemId, { url, image })
    return image
  }

  function loop(session: number, next: Mode) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) {
      setMode(null)
      show('画面を読めませんでした。', true)
      return
    }
    let timer = 0
    let stopped = false
    let busy = false
    stopRef.current = () => {
      stopped = true
      window.clearInterval(timer)
    }
    const pull = async () => {
      if (stopped || busy || sessionRef.current !== session) return
      busy = true
      try {
        const response = await fetch('/api/screen-frame', { cache: 'no-store' })
        if (sessionRef.current !== session) return
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('image/png')) {
          show('画面を読めませんでした。ゲームを起動して、もう一度押してください。', true)
          return
        }
        const x = Number(response.headers.get('X-Cursor-X'))
        const y = Number(response.headers.get('X-Cursor-Y'))
        const cursor =
          response.headers.has('X-Cursor-X') && Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
        const bitmap = await createImageBitmap(await response.blob())
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        context.drawImage(bitmap, 0, 0)
        bitmap.close()
        if (sessionRef.current !== session) return
        const frame: Frame = {
          image: context.getImageData(0, 0, canvas.width, canvas.height),
          context,
          cursor,
        }
        if (next === 'icons') readIcons(frame)
        else await readInfo(frame)
      } catch {
        if (sessionRef.current === session) {
          show('画面を読めませんでした。ゲームを手前に出して、もう一度押してください。', true)
        }
      } finally {
        busy = false
      }
    }
    timer = window.setInterval(() => void pull(), next === 'info' ? 700 : 900)
    void pull()
  }

  function start(next: Mode) {
    haltCapture()
    const session = sessionRef.current
    setMode(next)
    show(
      next === 'icons'
        ? 'アイコンを取り込んでいます。マウスは装備から外しておいてください。'
        : 'ゲームで装備にマウスを乗せてください。説明の名前、★、能力値を読みます。',
    )
    loop(session, next)
  }

  const captured = data.items.some((item) => item.id.startsWith(`capture:${characterId}:`))

  function clearReadings() {
    haltCapture()
    setMode(null)
    if (!captured) {
      show('読み取った装備はありません。')
      return
    }
    clearCapturedEquipment(characterId)
    show('読み取った装備を外しました。')
  }

  return (
    <div className="capture-controls">
      <div className="capture-actions">
        <button
          type="button"
          className={mode === 'icons' ? 'button-quiet' : 'link-button'}
          onClick={() => (mode === 'icons' ? stop() : start('icons'))}
        >
          {mode === 'icons' ? 'アイコン取り込みを止める' : 'アイコンを取り込む'}
        </button>
        <button
          type="button"
          className={mode === 'info' ? 'button-quiet' : 'link-button'}
          onClick={() => (mode === 'info' ? stop() : start('info'))}
        >
          {mode === 'info' ? '装備情報の読み取りを止める' : '装備情報を読む'}
        </button>
        <button type="button" className="button-quiet" onClick={clearReadings}>
          読み取った装備を外す
        </button>
      </div>
      <p className={failed ? 'capture-note error' : 'capture-note'}>{note}</p>
      {preview ? (
        <div className="capture-confirm">
          <img className="capture-preview" src={preview.imageUrl} alt="取り込んだ装備の説明" />
          <label className="field">
            <span className="field-label">枠</span>
            <select
              value={preview.slotId}
              onChange={(event) =>
                setPreview({ ...preview, slotId: event.target.value as EquipmentSlotId | '' })
              }
            >
              <option value="">選んでください</option>
              {EQUIPMENT_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">名前</span>
            <input
              value={preview.name}
              onChange={(event) => setPreview({ ...preview, name: event.target.value })}
            />
          </label>
          <p>★{preview.stars}</p>
          <button type="button" onClick={applyPreview}>
            この説明を付ける
          </button>
        </div>
      ) : null}
    </div>
  )
}
