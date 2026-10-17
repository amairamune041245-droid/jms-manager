import { useEffect, useRef, useState } from 'react'
import {
  chooseHoveredSlot,
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
import type { TooltipDetails } from '../../domain/tooltipText.ts'
import { EQUIPMENT_SLOTS, slotById } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotId } from '../../domain/equipmentSlots.ts'
import { useAppStore } from '../app/useAppStore.ts'

type Mode = 'capture'

type Frame = {
  image: CaptureImage
  context: CanvasRenderingContext2D
  cursor: { x: number; y: number } | null
}

function invertInkToWhite(target: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = target.getImageData(0, 0, width, height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const r = pixels.data[index] ?? 0
    const g = pixels.data[index + 1] ?? 0
    const b = pixels.data[index + 2] ?? 0
    const lum = Math.max(r, g, b)
    const ink = Math.max(0, Math.min(255, Math.round(Math.max(0, lum - 58) * 1.5)))
    const color = 255 - ink
    pixels.data[index] = color
    pixels.data[index + 1] = color
    pixels.data[index + 2] = color
    pixels.data[index + 3] = 255
  }
  target.putImageData(pixels, 0, 0)
}

async function cropBlob(
  context: CanvasRenderingContext2D,
  rect: CaptureRect,
  scale = 3.5,
): Promise<Blob | null> {
  const pad = 14
  const rx = Math.max(0, rect.x - 3)
  const ry = Math.max(0, rect.y - 2)
  const rw = Math.min(context.canvas.width - rx, rect.w + 6)
  const rh = Math.min(context.canvas.height - ry, rect.h + 4)
  const w = Math.max(1, Math.round(rw * scale))
  const h = Math.max(1, Math.round(rh * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w + pad * 2
  canvas.height = h + pad * 2
  const target = canvas.getContext('2d', { willReadFrequently: true })
  if (!target) return null
  target.imageSmoothingEnabled = true
  target.imageSmoothingQuality = 'high'
  target.fillStyle = '#000'
  target.fillRect(0, 0, canvas.width, canvas.height)
  target.drawImage(context.canvas, rx, ry, rw, rh, pad, pad, w, h)
  invertInkToWhite(target, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

async function stackInk(context: CanvasRenderingContext2D, rects: CaptureRect[]): Promise<Blob | null> {
  const rows = rects.slice(0, 64)
  if (rows.length === 0) return null
  const scaleX = 3
  // Windows OCR loses small strokes when rows are stretched by different ratios.
  // Keep glyphs proportional; the 3x scale restores enough detail from game text.
  const scaleY = scaleX
  const gap = 16
  const pad = 16
  let width = 80
  let height = pad
  const placed = rows.map((rect) => {
    const rx = Math.max(0, rect.x - 4)
    const ry = Math.max(0, rect.y - 2)
    const rw = Math.min(context.canvas.width - rx, rect.w + 8)
    const rh = Math.min(context.canvas.height - ry, rect.h + 4)
    const w = Math.max(1, Math.round(rw * scaleX))
    const h = Math.max(1, Math.round(rh * scaleY))
    const y = height
    height += h + gap
    width = Math.max(width, w + pad * 2)
    return { rect: { x: rx, y: ry, w: rw, h: rh }, w, h, y }
  })
  height += pad
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const target = canvas.getContext('2d', { willReadFrequently: true })
  if (!target) return null
  target.imageSmoothingEnabled = true
  target.imageSmoothingQuality = 'high'
  target.fillStyle = '#000'
  target.fillRect(0, 0, width, height)
  for (const row of placed) {
    target.drawImage(context.canvas, row.rect.x, row.rect.y, row.rect.w, row.rect.h, pad, row.y, row.w, row.h)
  }
  invertInkToWhite(target, width, height)
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

/** MapleStory's character art is pixel art; enlarge it without smoothing away the pixels. */
function cropPixelPortrait(source: CanvasRenderingContext2D, rect: CaptureRect): string {
  const scale = Math.min(4, 320 / Math.max(rect.w, rect.h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(rect.w * scale))
  canvas.height = Math.max(1, Math.round(rect.h * scale))
  const context = canvas.getContext('2d')
  if (!context) return ''
  context.imageSmoothingEnabled = false
  context.drawImage(source.canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

/** 装備画面中央の広い背景領域から、キャラクターが立つ中央部分を切り出す。 */
function centeredPortrait(rect: CaptureRect): CaptureRect {
  const w = rect.w * 0.64
  const h = rect.h * 0.62
  return {
    x: rect.x + (rect.w - w) / 2,
    y: rect.y + rect.h * 0.32,
    w,
    h,
  }
}

const idleNote =
  '装備にマウスを乗せて説明を表示すると、アイコン・★・装備詳細をまとめて読み取ります。説明が閉じると中央キャラクターの画像を保存します。'

type TooltipPreview = {
  key: string
  imageUrl: string
  iconUrl: string
  stars: number | null
  slotId: EquipmentSlotId | ''
  name: string
  details: TooltipDetails | null
}

function detailPayload(fields: TooltipDetails | null | undefined) {
  if (!fields) return {}
  return {
    ...(fields.stats.length > 0 ? { stats: fields.stats } : {}),
    ...(fields.enhanceText ? { enhanceText: fields.enhanceText } : {}),
    ...(fields.potentials.length > 0 ? { potentials: fields.potentials } : {}),
    ...(fields.additionalPotentials.length > 0
      ? { additionalPotentials: fields.additionalPotentials }
      : {}),
    ...(fields.notes ? { notes: fields.notes } : {}),
  }
}

export function EquipmentCapture({ characterId }: { characterId: string }) {
  const { captureEquipment, clearCapturedEquipment, setSlotEquipmentInfo, data } = useAppStore()
  const [mode, setMode] = useState<Mode | null>(null)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState(idleNote)
  const [preview, setPreview] = useState<TooltipPreview | null>(null)
  const [hasDisplayStream, setHasDisplayStream] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const mediaRef = useRef<{ stream: MediaStream; video: HTMLVideoElement } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const noteRef = useRef(note)
  const pendingRef = useRef('')
  const keyRef = useRef('')
  const seenRef = useRef(0)
  const toneRef = useRef<Record<string, string>>({})
  const emptyRef = useRef<Record<string, number>>({})
  const gridRef = useRef<WindowGrid | null>(null)
  const shownKeyRef = useRef('')
  const confirmedSlotRef = useRef<{ key: string; slotId: EquipmentSlotId } | null>(null)
  const iconsRef = useRef<Map<string, { url: string; image: CaptureImage }>>(new Map())
  const sessionRef = useRef(0)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  function stopDisplayStream() {
    const current = mediaRef.current
    mediaRef.current = null
    setHasDisplayStream(false)
    if (current) {
      for (const track of current.stream.getTracks()) track.stop()
      current.video.srcObject = null
    }
  }

  useEffect(() => {
    return () => {
      stopRef.current?.()
      stopDisplayStream()
    }
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
    confirmedSlotRef.current = null
    setPreview(null)
    void fetch('/api/screen-frame', { method: 'DELETE' }).catch(() => undefined)
  }

  function stop() {
    haltCapture()
    setMode(null)
    show('読み取りを止めました。')
  }

  function ensureSlotIcon(slotId: EquipmentSlotId, iconUrl: string) {
    const loadout = dataRef.current.loadoutsByCharacterId[characterId]
    if (!loadout || !iconUrl) return
    const existingId = loadout.presets[loadout.activePresetIndex].slots[slotId]
    if (existingId && dataRef.current.items.some((entry) => entry.id === existingId)) return
    captureEquipment(characterId, {
      presetIndex: null,
      portraitDataUrl: null,
      slots: [{ id: slotId, occupied: true, imageDataUrl: iconUrl }],
    })
  }

  function readIcons({ image, context, cursor }: Frame, immediate = false): boolean {
    const found = locateEquipmentWindow(image)
    if (!found) {
      pendingRef.current = ''
      seenRef.current = 0
      if (!immediate) {
        show(
          gridRef.current
            ? '装備ウィンドウが説明などで隠れています。マウスを装備から外すと続けます。'
            : '装備ウィンドウが見つかりません。ゲームの装備画面を開いて、手前に出してください。',
          true,
        )
      }
      return false
    }
    const located = preferStableGrid(image, gridRef.current, found)
    gridRef.current = located.grid
    const hover = cursor ? slotAt(located.grid, cursor.x, cursor.y) : null
    const visible = located.slots.filter((slot) => slot.state !== 'hidden' && slot.id !== hover)
    const held = visible.map((slot) => holdSlot(image, slot))
    const characterTone = located.characterVisible ? tone(image, located.character) : 'hidden'
    // Tooltips are drawn over the middle of the equipment window and can cover the avatar.
    // Wait for a clear frame before saving its portrait.
    const portraitCanCapture = located.characterVisible && !readHoveredTooltip(image, cursor)
    const signature = [String(located.presetIndex), ...held.map((slot) => `${slot.id}:${slot.state}:${slot.tone}`)].join(
      '|',
    )
    if (!immediate && signature !== pendingRef.current) {
      pendingRef.current = signature
      seenRef.current = 1
      show('アイコンを確認しています（1/2）。マウスは装備から外しておいてください。')
      return true
    }
    pendingRef.current = signature
    seenRef.current += 1
    const presetLabel =
      located.presetIndex === null ? '今開いているプリセット' : `プリセット${located.presetIndex + 1}`
    const skipped = located.slots.length - visible.length
    const tail = skipped > 0 ? `隠れていた${skipped}枠は前のままです。` : ''
    const portraitChanged =
      immediate || toneRef.current.character !== settleTone('character', characterTone)
    const portraitNeedsUpdate = portraitCanCapture && portraitChanged
    if (!immediate && signature === keyRef.current && !portraitNeedsUpdate) {
      show(`${presetLabel}のアイコンは取り込み済みです。${tail}`)
      return true
    }
    const changed = immediate
      ? held
      : held.filter((slot) => toneRef.current[slot.id] !== `${slot.state}:${slot.tone}`)
    if (changed.length === 0 && !portraitNeedsUpdate && signature === keyRef.current) return true
    keyRef.current = signature
    for (const slot of changed) toneRef.current[slot.id] = `${slot.state}:${slot.tone}`
    if (portraitNeedsUpdate) toneRef.current.character = settleTone('character', characterTone)
    const input: EquipmentCaptureInput = {
      presetIndex: located.presetIndex,
      portraitDataUrl:
        portraitNeedsUpdate
          ? cropPixelPortrait(context, centeredPortrait(located.character)) || null
          : null,
      slots: changed.map((slot) => ({
        id: slot.id,
        occupied: slot.state === 'filled',
        imageDataUrl: slot.state === 'filled' ? crop(context, slot.rect, 72, 'image/png') : null,
      })),
    }
    captureEquipment(characterId, input)
    show(`${presetLabel}のアイコンと中央の画像を取り込みました。${tail}`)
    return true
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

  async function readInfo({ image, context, cursor }: Frame): Promise<boolean> {
    const session = sessionRef.current
    // OCR中にライブ映像のcanvasが更新されても、名前と詳細は同じ画像から読む。
    const snapshot = document.createElement('canvas')
    snapshot.width = image.width
    snapshot.height = image.height
    const snapshotContext = snapshot.getContext('2d', { willReadFrequently: true })
    if (!snapshotContext) return false
    snapshotContext.drawImage(context.canvas, 0, 0)
    context = snapshotContext
    if (cursor !== null && !cursorInside(image, cursor)) {
      show('マウスがゲーム画面の外にあります。メイプルのウィンドウ上へ動かしてください。')
      return false
    }
    if (!gridRef.current) {
      const found = locateEquipmentWindow(image)
      if (found) gridRef.current = found.grid
    }
    const hovered = readHoveredTooltip(image, cursor)
    if (!hovered) {
      const under = cursor && gridRef.current ? slotAt(gridRef.current, cursor.x, cursor.y) : null
      show(
        under
          ? `${slotById(under).label}の上にカーソルがあります。説明が開いたら読みます。`
          : '説明ウィンドウが見つかりません。装備の上にマウスを乗せて説明を出してください。',
      )
      return false
    }
    const shot = crop(context, hovered.body, 480, 'image/png')
    // 同じ位置・同じ★数でも、別の装備や変更された能力値は読み直す。
    const shotKey = shot
    const iconUrl = crop(context, hovered.icon, 72, 'image/png')
    let slots = await equippedIcons()
    if (slots.length === 0) {
      const capturedNow = readIcons({ image, context, cursor }, true)
      if (capturedNow) slots = await equippedIcons()
    }
    const distances = slots.length > 0 ? rankSlotIcons(image, hovered.icon, slots) : []
    const onTooltip =
      cursor != null &&
      cursor.x >= hovered.body.x &&
      cursor.y >= hovered.body.y &&
      cursor.x < hovered.body.x + hovered.body.w &&
      cursor.y < hovered.body.y + hovered.body.h
    const cursorSlot =
      cursor && !onTooltip && gridRef.current ? slotAt(gridRef.current, cursor.x, cursor.y) : null
    if (shownKeyRef.current === shotKey) return true
    shownKeyRef.current = shotKey
    confirmedSlotRef.current = null
    setPreview({
      key: shotKey,
      imageUrl: shot,
      iconUrl,
      stars: hovered.stars,
      slotId: cursorSlot ?? '',
      name: '',
      details: null,
    })
    const readName = hovered.name ? matchItemName(await recognizeName(context, hovered.name)) : null
    if (sessionRef.current !== session) return true
    const group = readName ? slotGroupForItem(readName) : null
    const equippedNamed = group
      ? slots.filter((slot) => slotById(slot.id).group === group).map((slot) => slot.id)
      : []
    const fallbackNamed = group
      ? EQUIPMENT_SLOTS.filter((slot) => slot.group === group).map((slot) => slot.id)
      : []
    const namedSlots = equippedNamed.length > 0 ? equippedNamed : fallbackNamed
    const slotId =
      cursorSlot ??
      chooseHoveredSlot({ distances, cursorSlot, namedSlots }) ??
      (namedSlots.length === 1 ? (namedSlots[0] ?? null) : null)
    const needsConfirm = !slotId
    setPreview((current) =>
      current?.key === shotKey
        ? { ...current, slotId: slotId ?? current.slotId, name: readName ?? current.name }
        : current,
    )
    if (sessionRef.current !== session) return true
    if (needsConfirm || !slotId) {
      show(
        slotId
          ? `${slotById(slotId).label}の説明です。枠を確認して付けてください。`
          : '説明を取り込みました。付ける枠を選んでください。',
      )
      await readDetails(context, image, hovered).then((detail) => {
        if (sessionRef.current !== session) return
        if (!detail) {
          shownKeyRef.current = ''
          show('アイコンと★は取得しましたが、詳細OCRに失敗しました。読み取りを再試行するか、画像をもう一度選んでください。', true)
          return
        }
        setPreview((current) =>
          current?.key === shotKey ? { ...current, details: detail.fields } : current,
        )
        if (confirmedSlotRef.current?.key === shotKey) {
          ensureSlotIcon(confirmedSlotRef.current.slotId, iconUrl)
          setSlotEquipmentInfo(characterId, confirmedSlotRef.current.slotId, detailPayload(detail.fields))
        }
      })
      return true
    }
    const chosenGroup = readName ? slotGroupForItem(readName) : null
    const nameFits = Boolean(readName && (!chosenGroup || slotById(slotId).group === chosenGroup))
    ensureSlotIcon(slotId, iconUrl)
    setSlotEquipmentInfo(characterId, slotId, {
      ...(hovered.stars !== null ? { starForce: hovered.stars } : {}),
      ...(nameFits && readName ? { name: readName } : {}),
    })
    show(`${slotById(slotId).label}に${[nameFits ? readName : '', hovered.stars === null ? '★未確認' : `★${hovered.stars}`].filter(Boolean).join('、')}を付けました。`)
    await readDetails(context, image, hovered).then((detail) => {
      if (sessionRef.current !== session) return
      if (!detail) {
        shownKeyRef.current = ''
        show('アイコンと★は保存しましたが、詳細OCRに失敗しました。読み取りを再試行するか、画像をもう一度選んでください。', true)
        return
      }
      ensureSlotIcon(slotId, iconUrl)
      setSlotEquipmentInfo(characterId, slotId, detailPayload(detail.fields))
      show(`${slotById(slotId).label}のアイコン・${hovered.stars === null ? '★未確認' : `★${hovered.stars}`}・装備詳細を保存しました。`)
    })
    return true
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
        signal: AbortSignal.timeout(6000),
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
    confirmedSlotRef.current = { key: preview.key, slotId }
    ensureSlotIcon(slotId, preview.iconUrl)
    setSlotEquipmentInfo(characterId, slotId, {
      ...(preview.stars !== null ? { starForce: preview.stars } : {}),
      ...(preview.name.trim() ? { name: preview.name.trim() } : {}),
      ...detailPayload(preview.details),
    })
    show(`${slotById(slotId).label}に${[preview.name.trim(), preview.stars === null ? '★未確認' : `★${preview.stars}`].filter(Boolean).join('、')}を付けました。`)
  }

  async function recognizeName(context: CanvasRenderingContext2D, rect: CaptureRect): Promise<string> {
    try {
      const blob = await cropBlob(context, rect, 3.5)
      if (!blob) return ''
      const response = await fetch('/api/item-name', {
        method: 'POST',
        headers: { 'content-type': 'image/png' },
        body: blob,
        signal: AbortSignal.timeout(5000),
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

  async function ensureDisplayVideo(): Promise<HTMLVideoElement | null> {
    const existing = mediaRef.current
    if (existing && existing.stream.active && existing.video.videoWidth > 0) {
      return existing.video
    }
    stopDisplayStream()
    if (!navigator.mediaDevices?.getDisplayMedia) return null
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false,
      })
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.srcObject = stream
      await video.play()
      const track = stream.getVideoTracks()[0]
      track?.addEventListener('ended', () => {
        stopDisplayStream()
      })
      mediaRef.current = { stream, video }
      setHasDisplayStream(true)
      return video
    } catch {
      return null
    }
  }

  async function handleBlobFrame(blob: Blob) {
    haltCapture()
    setMode(null)
    const session = sessionRef.current
    try {
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        bitmap.close()
        show('画像を読めませんでした。', true)
        return
      }
      context.drawImage(bitmap, 0, 0)
      bitmap.close()
      if (sessionRef.current !== session) return
      const frame: Frame = {
        image: context.getImageData(0, 0, canvas.width, canvas.height),
        context,
        cursor: null,
      }
      const hadWindow = readIcons(frame, true)
      const hadTooltip = await readInfo(frame)
      if (!hadWindow && !hadTooltip) {
        show('画像の中に装備ウィンドウや説明欄が見つかりませんでした。', true)
      }
    } catch {
      show('画像を読めませんでした。', true)
    }
  }

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            event.preventDefault()
            void handleBlobFrame(file)
            return
          }
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  function loop(session: number) {
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
    let useBrowserCapture = Boolean(mediaRef.current?.stream.active)
    stopRef.current = () => {
      stopped = true
      window.clearInterval(timer)
    }
    const pullFromVideo = async (video: HTMLVideoElement) => {
      if (video.videoWidth === 0 || video.videoHeight === 0) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      if (sessionRef.current !== session) return
      const frame: Frame = {
        image: context.getImageData(0, 0, canvas.width, canvas.height),
        context,
        cursor: null,
      }
      readIcons(frame)
      await readInfo(frame)
    }
    const pull = async () => {
      if (stopped || busy || sessionRef.current !== session) return
      busy = true
      try {
        if (useBrowserCapture) {
          const video = await ensureDisplayVideo()
          if (sessionRef.current !== session) return
          if (!video) {
            stop()
            show('画面の共有がキャンセルされました。もう一度押して共有する画面を選んでください。', true)
            return
          }
          await pullFromVideo(video)
          return
        }
        const response = await fetch('/api/screen-frame', { cache: 'no-store' })
        if (sessionRef.current !== session) return
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('image/png')) {
          useBrowserCapture = true
          show('ブラウザから取り込む画面（ウィンドウまたは画面全体）を選んでください。')
          const video = await ensureDisplayVideo()
          if (sessionRef.current !== session) return
          if (!video) {
            stop()
            show('画面を読めませんでした。画面共有を選ぶか、スクショをCtrl+Vで貼り付けてください。', true)
            return
          }
          await pullFromVideo(video)
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
        readIcons(frame)
        await readInfo(frame)
      } catch {
        if (sessionRef.current === session) {
          useBrowserCapture = true
          const video = await ensureDisplayVideo()
          if (sessionRef.current !== session) return
          if (video) {
            await pullFromVideo(video)
          } else {
            stop()
            show('画面を読めませんでした。画面共有を選ぶか、スクショをCtrl+Vで貼り付けてください。', true)
          }
        }
      } finally {
        busy = false
      }
    }
    timer = window.setInterval(() => void pull(), 700)
    void pull()
  }

  function start() {
    haltCapture()
    const session = sessionRef.current
    setMode('capture')
    show('ゲームで装備にマウスを乗せてください。アイコン・★・詳細を読み取り、説明が閉じた後に中央キャラクターの画像を保存します。')
    loop(session)
  }

  async function reselectScreen() {
    stopDisplayStream()
    const video = await ensureDisplayVideo()
    if (!video) {
      show('画面の選択がキャンセルされました。', true)
      return
    }
    start()
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
    <div
      className="capture-controls"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
          void handleBlobFrame(file)
        }
      }}
    >
      <div className="capture-actions">
        <button
          type="button"
          className={mode ? 'button-quiet' : 'link-button'}
          onClick={() => (mode ? stop() : start())}
        >
          {mode ? '装備読み取りを止める' : '装備を読み取る'}
        </button>
        <button
          type="button"
          className="button-quiet"
          onClick={() => fileInputRef.current?.click()}
        >
          スクショ画像を読む
        </button>
        {hasDisplayStream ? (
          <button type="button" className="button-quiet" onClick={() => void reselectScreen()}>
            画面を選び直す
          </button>
        ) : null}
        <button type="button" className="button-quiet" onClick={clearReadings}>
          読み取った装備を外す
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleBlobFrame(file)
            event.target.value = ''
          }}
        />
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
          <p>{preview.stars === null ? '★ 未確認（保存済みの値を維持）' : `★${preview.stars}`}</p>
          <button type="button" onClick={applyPreview}>
            この説明を付ける
          </button>
        </div>
      ) : null}
    </div>
  )
}
