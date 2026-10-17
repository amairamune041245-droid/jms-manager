import { slotById } from './equipmentSlots.ts'
import type { EquipmentSlotId } from './equipmentSlots.ts'
import { isPaperdollSlot } from './equipmentLayout.ts'
import type { PaperdollSlotId } from './equipmentLayout.ts'
import { findCharacter, updateCharacter } from './characters.ts'
import { deleteItem, findItem, upsertItem } from './items.ts'
import { activePreset, assignSlot, setActivePreset } from './presets.ts'
import type { AppData, EquipmentItem } from './types.ts'

export type CaptureImage = {
  width: number
  height: number
  data: Uint8ClampedArray
}

export type CaptureRect = { x: number; y: number; w: number; h: number }

export type WindowGrid = { originX: number; originY: number; pitch: number; size: number }

/** filled は枠が見えている、empty は枠がない、hidden は説明などで隠れている。 */
export type SlotState = 'filled' | 'empty' | 'hidden'

export type SlotReading = CaptureRect & {
  id: PaperdollSlotId
  state: SlotState
}

export type EquipmentWindowReading = {
  grid: WindowGrid
  slots: SlotReading[]
  character: CaptureRect
  characterVisible: boolean
  presetIndex: 0 | 1 | 2 | null
}

export type EquipmentCaptureSlot = {
  id: EquipmentSlotId
  occupied: boolean
  imageDataUrl: string | null
}

export type EquipmentCaptureInput = {
  presetIndex: 0 | 1 | 2 | null
  portraitDataUrl: string | null
  slots: EquipmentCaptureSlot[]
}

export type StarTrack = {
  raw: number | null
  seen: number
  value: number | null
}

const STAR_STABLE_READS = 2

const GRID: (PaperdollSlotId | null)[][] = [
  ['ring1', 'badge', null, null, null, 'hat', 'cape'],
  ['ring2', 'face', null, null, null, 'top', 'gloves'],
  ['ring3', 'earring', null, null, null, 'bottom', 'shoes'],
  ['ring4', 'pendant2', null, null, null, 'shoulder', 'medal'],
  ['belt', 'pendant1', 'weapon', 'subWeapon', 'emblem', 'android', 'heart'],
  ['pocket', null, null, null, null, null, 'androidHeart'],
]

const WEAPON_ROW = 4

type Blob = { x: number; y: number; w: number; h: number; cx: number; cy: number; count: number }

function pixelIndex(x: number, y: number, width: number): number {
  return (y * width + x) * 4
}

function rgbAt(image: CaptureImage, x: number, y: number): [number, number, number] {
  const index = pixelIndex(x, y, image.width)
  return [image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0]
}

function isSheetPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return min > 200 && max - min < 36
}

function isGraySheetPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  return min > 168 && lum > 176 && max - min < 32
}

function isStarYellow(r: number, g: number, b: number): boolean {
  return r > 150 && g > 120 && b < r - 70 && Math.abs(r - g) < 60
}

function isStarGray(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  return lum > 95 && lum < 190 && max - min < 30
}

function isTooltipBackground(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  return lum > 25 && lum < 95 && max - min < 40
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length === 0) return 0
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
}

function componentBlobs(
  image: CaptureImage,
  mask: (index: number) => boolean,
  bounds: CaptureRect,
  minSide = 9,
  minCount = 13,
): Blob[] {
  const { width, height } = image
  const seen = new Uint8Array(width * height)
  const blobs: Blob[] = []
  const x1 = Math.max(0, bounds.x)
  const y1 = Math.max(0, bounds.y)
  const x2 = Math.min(width, bounds.x + bounds.w)
  const y2 = Math.min(height, bounds.y + bounds.h)
  const queue = new Int32Array(Math.max(1, (x2 - x1) * (y2 - y1)))

  for (let y = y1; y < y2; y += 1) {
    for (let x = x1; x < x2; x += 1) {
      const start = y * width + x
      if (seen[start] || !mask(pixelIndex(x, y, width))) continue
      let head = 0
      let tail = 0
      queue[tail] = start
      tail += 1
      seen[start] = 1
      let minX = x
      let maxX = x
      let minY = y
      let maxY = y
      let count = 0
      while (head < tail) {
        const current = queue[head] ?? 0
        head += 1
        count += 1
        const cx = current % width
        const cy = (current - cx) / width
        if (cx < minX) minX = cx
        if (cx > maxX) maxX = cx
        if (cy < minY) minY = cy
        if (cy > maxY) maxY = cy
        const neighbors = [current - 1, current + 1, current - width, current + width]
        for (const next of neighbors) {
          if (next < 0 || next >= width * height || seen[next]) continue
          const nx = next % width
          const ny = (next - nx) / width
          if (nx < x1 || ny < y1 || nx >= x2 || ny >= y2) continue
          if (!mask(next * 4)) continue
          seen[next] = 1
          queue[tail] = next
          tail += 1
        }
      }
      const w = maxX - minX + 1
      const h = maxY - minY + 1
      if (count >= minCount && w >= minSide && h >= minSide) {
        blobs.push({ x: minX, y: minY, w, h, cx: minX + w / 2, cy: minY + h / 2, count })
      }
    }
  }
  return blobs
}

function sheetPanels(image: CaptureImage): CaptureRect[] {
  const blobs = componentBlobs(
    image,
    (index) => isSheetPixel(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0),
    { x: 0, y: 0, w: image.width, h: image.height },
  )
  return blobs
    .filter((blob) => {
      const ratio = blob.w / blob.h
      return blob.w > 90 && blob.h > 90 && ratio > 0.35 && ratio < 2.8
    })
    .map((blob) => ({ x: blob.x, y: blob.y, w: blob.w, h: blob.h }))
}

function slotBlobs(image: CaptureImage, panel: CaptureRect, gray = false): Blob[] {
  const blobs = componentBlobs(
    image,
    (index) => !(gray ? isGraySheetPixel : isSheetPixel)(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0),
    panel,
  )
  const maxSlotWidth = Math.min(panel.w * 0.28, 120)
  const square = blobs.filter((blob) => {
    const ratio = blob.w / blob.h
    return ratio > 0.72 && ratio < 1.4 && blob.w >= 16 && blob.w < maxSlotWidth
  })
  if (square.length < 8) return []
  const size = median(square.map((blob) => blob.w))
  return square.filter((blob) => blob.w > size * 0.78 && blob.w < size * 1.28)
}

function pitchOf(blobs: Blob[]): number {
  const sorted = [...blobs].sort((a, b) => a.cx - b.cx)
  const gaps: number[] = []
  for (let index = 1; index < sorted.length; index += 1) {
    gaps.push((sorted[index]?.cx ?? 0) - (sorted[index - 1]?.cx ?? 0))
  }
  const size = median(blobs.map((blob) => blob.w))
  const likely = gaps.filter((gap) => gap > size * 0.85 && gap < size * 1.45)
  return median(likely.length > 0 ? likely : gaps)
}

function sheetRatio(image: CaptureImage, rect: CaptureRect): number {
  let sheet = 0
  let total = 0
  const x2 = Math.min(image.width, rect.x + rect.w)
  const y2 = Math.min(image.height, rect.y + rect.h)
  for (let y = Math.max(0, rect.y); y < y2; y += 2) {
    for (let x = Math.max(0, rect.x); x < x2; x += 2) {
      total += 1
      if (isSheetPixel(...rgbAt(image, x, y))) sheet += 1
    }
  }
  return total === 0 ? 0 : sheet / total
}

/** 枠のすぐ外側がシートの白で囲まれていれば、上に何も重なっていない。 */
function ringIsSheet(image: CaptureImage, rect: CaptureRect, offset: number): boolean {
  const left = Math.round(rect.x - offset)
  const right = Math.round(rect.x + rect.w - 1 + offset)
  const top = Math.round(rect.y - offset)
  const bottom = Math.round(rect.y + rect.h - 1 + offset)
  let sheet = 0
  let total = 0
  const visit = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return
    total += 1
    if (isSheetPixel(...rgbAt(image, x, y))) sheet += 1
  }
  for (let x = left; x <= right; x += 2) {
    visit(x, top)
    visit(x, bottom)
  }
  for (let y = top; y <= bottom; y += 2) {
    visit(left, y)
    visit(right, y)
  }
  return total > 0 && sheet / total > 0.85
}

export function slotRectsFor(grid: WindowGrid): { id: PaperdollSlotId; rect: CaptureRect }[] {
  const rects: { id: PaperdollSlotId; rect: CaptureRect }[] = []
  for (let row = 0; row < GRID.length; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const id = GRID[row]?.[column]
      if (!id) continue
      rects.push({
        id,
        rect: {
          x: Math.round(grid.originX + column * grid.pitch),
          y: Math.round(grid.originY + row * grid.pitch),
          w: Math.round(grid.size),
          h: Math.round(grid.size),
        },
      })
    }
  }
  return rects
}

export function slotAt(grid: WindowGrid, x: number, y: number): PaperdollSlotId | null {
  const hit = slotRectsFor(grid).find(
    ({ rect }) => x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h,
  )
  return hit?.id ?? null
}

function fitPanel(image: CaptureImage, blobs: Blob[]): EquipmentWindowReading | null {
  if (blobs.length < 12) return null
  const size = median(blobs.map((blob) => blob.w))
  const rows = new Map<number, Blob[]>()
  const tolerance = size * 0.45
  const ordered = [...blobs].sort((a, b) => a.cy - b.cy)
  for (const blob of ordered) {
    const key = [...rows.keys()].find((row) => Math.abs(row - blob.cy) <= tolerance)
    const bucket = key === undefined ? blob.cy : key
    const list = rows.get(bucket) ?? []
    list.push(blob)
    rows.set(bucket, list)
  }
  const candidateRows = [...rows.values()].filter((row) => row.length >= 6).sort((a, b) => b.length - a.length)
  let bestReading: EquipmentWindowReading | null = null
  let bestMatched = 0
  for (const weapon of candidateRows) {
    const byX = [...weapon].sort((a, b) => a.cx - b.cx)
    for (let startIdx = 0; startIdx <= byX.length - 6; startIdx += 1) {
      const slice = byX.slice(startIdx, startIdx + 7)
      const pitch = pitchOf(slice)
      if (pitch < size * 1.01 || pitch > size * 1.4) continue
      const columns: number[] = []
      for (const blob of byX.slice(startIdx)) {
        const expected = columns.length === 0 ? blob.cx : (columns[0] ?? blob.cx) + columns.length * pitch
        if (blob.cx - expected > pitch * 0.55) columns.push(expected)
        columns.push(blob.cx)
        if (columns.length >= 7) break
      }
      while (columns.length < 7) {
        const last = columns[columns.length - 1]
        if (last === undefined) break
        columns.push(last + pitch)
      }
      if (columns.length < 7 || columns[0] === undefined) continue
      const grid: WindowGrid = {
        originX: columns[0] - size / 2,
        originY: median(slice.map((blob) => blob.cy)) - size / 2 - WEAPON_ROW * pitch,
        pitch,
        size,
      }
      const described = describeSlots(image, grid, blobs)
      if (!described) continue
      const matched = described.slots.filter((slot) => slot.state === 'filled').length
      if (matched > bestMatched) {
        bestMatched = matched
        bestReading = { grid, ...described, presetIndex: readPresetIndex(image, grid) }
      }
    }
  }
  return bestReading
}

function describeSlots(
  image: CaptureImage,
  grid: WindowGrid,
  blobs: Blob[],
): Pick<EquipmentWindowReading, 'slots' | 'character' | 'characterVisible'> | null {
  const slots: SlotReading[] = []
  let matched = 0
  for (const { id, rect } of slotRectsFor(grid)) {
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > image.width || rect.y + rect.h > image.height) {
      return null
    }
    const centerX = rect.x + rect.w / 2
    const centerY = rect.y + rect.h / 2
    const blob = blobs.find(
      (entry) =>
        Math.abs(entry.cx - centerX) < grid.pitch * 0.38 && Math.abs(entry.cy - centerY) < grid.pitch * 0.38,
    )
    let state: SlotState = 'hidden'
    if (blob) state = 'filled'
    else if (sheetRatio(image, rect) > 0.6) state = 'empty'
    if (blob) matched += 1
    slots.push({ id, ...rect, state })
  }
  if (matched < 12) return null
  const character = {
    x: Math.round(grid.originX + 2 * grid.pitch),
    y: Math.round(grid.originY),
    w: Math.round(2 * grid.pitch + grid.size),
    h: Math.round(3 * grid.pitch + grid.size),
  }
  const gap = Math.max(1, (grid.pitch - grid.size) / 2)
  return { slots, character, characterVisible: ringIsSheet(image, character, gap) }
}

function gridsClose(previous: WindowGrid, next: WindowGrid): boolean {
  return (
    Math.abs(previous.originX - next.originX) <= 6 &&
    Math.abs(previous.originY - next.originY) <= 6 &&
    Math.abs(previous.pitch - next.pitch) <= 2 &&
    Math.abs(previous.size - next.size) <= 2
  )
}

/**
 * 検出位置が数ピクセル揺れただけでは、前の枠位置のまま読む。
 * 切り抜く場所が揺れると、装備画像がガタガタ動いて見える。
 */
export function preferStableGrid(
  image: CaptureImage,
  previous: WindowGrid | null,
  next: EquipmentWindowReading,
): EquipmentWindowReading {
  if (!previous || !gridsClose(previous, next.grid)) return next
  const blobs = slotBlobs(image, {
    x: Math.floor(previous.originX - previous.pitch),
    y: Math.floor(previous.originY - previous.pitch),
    w: Math.ceil(previous.pitch * 7 + previous.size),
    h: Math.ceil(previous.pitch * 6 + previous.size),
  })
  const described = describeSlots(image, previous, blobs)
  if (!described) return next
  return {
    grid: previous,
    ...described,
    presetIndex: readPresetIndex(image, previous),
  }
}

function readPresetIndex(image: CaptureImage, grid: WindowGrid): 0 | 1 | 2 | null {
  const { originX, originY, pitch, size } = grid
  const y1 = Math.round(originY + 5 * pitch + size + 2)
  const y2 = Math.round(y1 + size * 2.4)
  const x1 = Math.round(originX + pitch)
  const x2 = Math.round(originX + 6 * pitch + size)
  const seenX = new Set<number>()
  for (let y = y1; y < y2 && y < image.height; y += 1) {
    const row: number[] = []
    for (let x = x1; x < x2 && x < image.width; x += 1) {
      const [r, g, b] = rgbAt(image, x, y)
      const lum = (r + g + b) / 3
      const sat = Math.max(r, g, b) - Math.min(r, g, b)
      if (lum < 100 || lum > 175 || sat > 42) continue
      row.push(x)
    }
    if (row.length === 0 || row.length > size * 2.4) continue
    for (const x of row) seenX.add(x)
  }
  const grouped: number[][] = []
  for (const x of [...seenX].sort((a, b) => a - b)) {
    const last = grouped[grouped.length - 1]
    if (!last || x - (last[last.length - 1] ?? x) > 3) grouped.push([x])
    else last.push(x)
  }
  const buttons = grouped
    .map((group) => ({
      x: median(group),
      width: (group[group.length - 1] ?? 0) - (group[0] ?? 0),
    }))
    .filter((button) => button.width >= 6 && button.width <= size * 0.9)
  const trio = presetTrio(buttons)
  if (!trio) return null
  const scores = trio.map((button) => {
    let score = 0
    const left = Math.round(button.x - size * 0.35)
    const right = Math.round(button.x + size * 0.35)
    for (let y = y1 - 2; y < y2 + 2; y += 1) {
      for (let x = left; x <= right; x += 1) {
        if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue
        const [r, g, b] = rgbAt(image, x, y)
        if (b > 235 && g > 215 && r > 170 && b > r + 8 && b >= g - 8) score += 1
      }
    }
    return score
  })
  const best = Math.max(...scores)
  const winner = scores.indexOf(best)
  const runnerUp = Math.max(...scores.filter((_, index) => index !== winner))
  if (winner >= 0 && best >= 10 && best >= runnerUp + 6) return winner as 0 | 1 | 2
  const darkness = trio.map((button) => buttonLuminance(image, button.x, y1, y2))
  const darkest = darkness.indexOf(Math.min(...darkness))
  const others = darkness.filter((_, index) => index !== darkest)
  const next = Math.min(...others)
  if (darkest < 0 || (darkness[darkest] ?? 255) > (next ?? 0) - 12) return null
  return darkest as 0 | 1 | 2
}

function presetTrio(
  buttons: { x: number; width: number }[],
): [{ x: number; width: number }, { x: number; width: number }, { x: number; width: number }] | null {
  for (let index = 0; index + 2 < buttons.length; index += 1) {
    const left = buttons[index]
    const middle = buttons[index + 1]
    const right = buttons[index + 2]
    if (!left || !middle || !right) continue
    const firstGap = middle.x - left.x
    const secondGap = right.x - middle.x
    if (firstGap < 14 || firstGap > 40 || secondGap < 14 || secondGap > 40) continue
    if (Math.abs(firstGap - secondGap) > 10) continue
    return [left, middle, right]
  }
  return null
}

function buttonLuminance(
  image: CaptureImage,
  center: number,
  y1: number,
  y2: number,
): number {
  let sum = 0
  let count = 0
  const left = Math.round(center - 5)
  const right = Math.round(center + 5)
  for (let y = y1; y < y2 && y < image.height; y += 1) {
    for (let x = left; x <= right && x < image.width; x += 1) {
      if (x < 0 || y < 0) continue
      const [r, g, b] = rgbAt(image, x, y)
      const lum = (r + g + b) / 3
      if (lum < 70 || lum > 210) continue
      sum += lum
      count += 1
    }
  }
  return count === 0 ? 255 : sum / count
}

export function locateEquipmentWindow(image: CaptureImage): EquipmentWindowReading | null {
  return locateWhiteWindow(image) ?? locateGrayWindow(image)
}

function grayPanels(image: CaptureImage): CaptureRect[] {
  const blobs = componentBlobs(
    image,
    (index) =>
      isGraySheetPixel(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0),
    { x: 0, y: 0, w: image.width, h: image.height },
  )
  return blobs
    .filter((blob) => {
      const ratio = blob.w / blob.h
      return blob.w > 140 && blob.h > 140 && ratio > 0.7 && ratio < 1.35
    })
    .map((blob) => ({ x: blob.x, y: blob.y, w: blob.w, h: blob.h }))
}

function inkRatio(image: CaptureImage, rect: CaptureRect): number {
  let ink = 0
  let total = 0
  const x2 = Math.min(image.width, rect.x + rect.w)
  const y2 = Math.min(image.height, rect.y + rect.h)
  for (let y = Math.max(0, rect.y); y < y2; y += 2) {
    for (let x = Math.max(0, rect.x); x < x2; x += 2) {
      total += 1
      if (!isGraySheetPixel(...rgbAt(image, x, y))) ink += 1
    }
  }
  return total === 0 ? 0 : ink / total
}

function graySheetRatio(image: CaptureImage, rect: CaptureRect): number {
  let sheet = 0
  let total = 0
  const x2 = Math.min(image.width, rect.x + rect.w)
  const y2 = Math.min(image.height, rect.y + rect.h)
  for (let y = Math.max(0, rect.y); y < y2; y += 2) {
    for (let x = Math.max(0, rect.x); x < x2; x += 2) {
      total += 1
      if (isGraySheetPixel(...rgbAt(image, x, y))) sheet += 1
    }
  }
  return total === 0 ? 0 : sheet / total
}

function frameScore(image: CaptureImage, rect: CaptureRect): number {
  let hits = 0
  let total = 0
  for (let t = 5; t < rect.w - 5; t += 3) {
    for (const [x, y, ox, oy] of [
      [rect.x + t, rect.y, rect.x + t, rect.y - 2],
      [rect.x + t, rect.y + rect.h - 1, rect.x + t, rect.y + rect.h + 1],
      [rect.x, rect.y + t, rect.x - 2, rect.y + t],
      [rect.x + rect.w - 1, rect.y + t, rect.x + rect.w + 1, rect.y + t],
    ]) {
      if (x === undefined || y === undefined || ox === undefined || oy === undefined) continue
      total += 1
      const inside = rgbAt(image, x, y)
      const outside = rgbAt(image, ox, oy)
      if (isGraySheetPixel(...outside) && inside.some((v, i) => Math.abs(v - (outside[i] ?? v)) > 25)) hits += 1
    }
  }
  return total ? hits / total : 0
}

function describeGraySlots(
  image: CaptureImage,
  grid: WindowGrid,
): Pick<EquipmentWindowReading, 'slots' | 'character' | 'characterVisible'> | null {
  const slots: SlotReading[] = []
  let matched = 0
  for (const { id, rect } of slotRectsFor(grid)) {
    const inner = {
      x: rect.x + 4,
      y: rect.y + 4,
      w: Math.max(1, rect.w - 8),
      h: Math.max(1, rect.h - 8),
    }
    let state: SlotState = 'hidden'
    if (frameScore(image, rect) > 0.2 && inkRatio(image, inner) > 0.18) state = 'filled'
    else if (graySheetRatio(image, rect) > 0.55) state = 'empty'
    if (state === 'filled') matched += 1
    slots.push({ id, ...rect, state })
  }
  if (matched < 12) return null
  const character = {
    x: Math.round(grid.originX + 2 * grid.pitch),
    y: Math.round(grid.originY),
    w: Math.round(2 * grid.pitch + grid.size),
    h: Math.round(3 * grid.pitch + grid.size),
  }
  return { slots, character, characterVisible: inkRatio(image, character) > 0.2 }
}

function fitGrayPanel(image: CaptureImage, panel: CaptureRect): EquipmentWindowReading | null {
  const framed = fitPanel(image, slotBlobs(image, panel, true))
  if (framed) return framed
  let best: { grid: WindowGrid; score: number } | null = null
  // 背景以外の画素数だけではキャラクター絵まで装備枠として数えてしまう。
  // 独立した正方形の枠からサイズと間隔の候補を作り、実際の枠線を照合する。
  const squares = componentBlobs(image, (i) => !isGraySheetPixel(
    image.data[i] ?? 0, image.data[i + 1] ?? 0, image.data[i + 2] ?? 0,
  ), panel).filter((b) => b.w >= 26 && b.w <= 60 && Math.abs(b.w - b.h) <= 3)
  for (const square of squares) {
    for (let size = square.w - 2; size <= square.w + 1; size += 1) {
      for (let extra = 1; extra <= 6; extra += 0.25) {
        const pitch = size + extra
        for (let column = 0; column < 7; column += 1) {
          for (let row = 0; row < 6; row += 1) {
            const grid = { originX: square.x - column * pitch, originY: square.y - row * pitch, pitch, size }
            if (grid.originX < panel.x || grid.originY < panel.y ||
                grid.originX + 6 * pitch + size > panel.x + panel.w + 2 ||
                grid.originY + 5 * pitch + size > panel.y + panel.h + 2) continue
            const score = slotRectsFor(grid).reduce((sum, { rect }) => sum + frameScore(image, rect), 0)
            if (!best || score > best.score) best = { grid, score }
          }
        }
      }
    }
  }
  if (!best || best.score < 6) return null
  const described = describeGraySlots(image, best.grid)
  if (!described) return null
  return { grid: best.grid, ...described, presetIndex: readPresetIndex(image, best.grid) }
}

function locateGrayWindow(image: CaptureImage): EquipmentWindowReading | null {
  let best: EquipmentWindowReading | null = null
  let bestMatched = 0
  for (const panel of grayPanels(image)) {
    const reading = fitGrayPanel(image, panel)
    if (!reading) continue
    const matched = reading.slots.filter((slot) => slot.state === 'filled').length
    if (matched > bestMatched) {
      best = reading
      bestMatched = matched
    }
  }
  return best
}

function locateWhiteWindow(image: CaptureImage): EquipmentWindowReading | null {
  let best: EquipmentWindowReading | null = null
  let bestMatched = 0
  for (const panel of sheetPanels(image)) {
    const reading = fitPanel(image, slotBlobs(image, panel))
    if (!reading) continue
    const matched = reading.slots.filter((slot) => slot.state === 'filled').length
    if (matched > bestMatched) {
      best = reading
      bestMatched = matched
    }
  }
  return best
}

type StarMark = Blob & { yellow: boolean }

function starMarks(image: CaptureImage, slotSize: number, yellow: boolean, bounds: CaptureRect): StarMark[] {
  const minSide = Math.max(3, Math.round(slotSize * 0.09))
  const maxSide = Math.max(minSide + 2, Math.round(slotSize * 0.45))
  const test = yellow ? isStarYellow : isStarGray
  const blobs = componentBlobs(
    image,
    (index) => test(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0),
    bounds,
    minSide,
    Math.max(4, Math.round(minSide * minSide * 0.35)),
  )
  return blobs
    .filter((blob) => {
      const ratio = blob.w / blob.h
      if (blob.w > maxSide || blob.h > maxSide || ratio < 0.6 || ratio > 1.6) return false
      return ringIsTooltip(image, blob)
    })
    .map((blob) => ({ ...blob, yellow }))
}

/** 星は横に詰めて並ぶので、上下だけが説明の背景色になっているかを見る。 */
function ringIsTooltip(image: CaptureImage, blob: Blob): boolean {
  const offset = Math.max(2, Math.round(blob.h * 0.4))
  const left = blob.x
  const right = blob.x + blob.w - 1
  const top = blob.y - offset
  const bottom = blob.y + blob.h - 1 + offset
  let hit = 0
  let total = 0
  const visit = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return
    total += 1
    if (isTooltipBackground(...rgbAt(image, x, y))) hit += 1
  }
  for (let x = left; x <= right; x += 1) {
    visit(x, top)
    visit(x, bottom)
  }
  return total > 0 && hit / total > 0.6
}

function isIconWellPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  return min > 115 && max - min < 48 && lum > 135 && lum < 230
}

/** 説明の中にある、装備画像が載った明るい四角。 */
function iconWells(image: CaptureImage, bounds: CaptureRect): Blob[] {
  return componentBlobs(
    image,
    (index) => isIconWellPixel(image.data[index] ?? 0, image.data[index + 1] ?? 0, image.data[index + 2] ?? 0),
    bounds,
    8,
    20,
  ).filter((blob) => {
    const ratio = blob.w / blob.h
    return blob.w >= 24 && blob.w <= 160 && blob.h >= 24 && blob.h <= 160 && ratio > 0.8 && ratio < 1.25 && ringIsTooltip(image, blob)
  })
}

/**
 * マウスを乗せた装備の説明にある★を数える。
 * 黄色が付いた星、灰色が空き。星の列が見つからなければ null。
 */
export function readTooltipStars(
  image: CaptureImage,
  slotSize: number,
  near?: { x: number; y: number },
): number | null {
  return locateStarCluster(image, slotSize, near)?.stars ?? null
}

type StarCluster = { stars: number; x: number; y: number; w: number; h: number }

function starCluster(clusters: StarMark[][], near?: { x: number; y: number }): StarCluster | null {
  const distance = (cluster: StarMark[]) => {
    const first = cluster[0]
    if (!first) return Infinity
    return near ? Math.hypot(first.cx - near.x, first.cy - near.y) : first.cy
  }
  const chosen = [...clusters].sort((a, b) => distance(a) - distance(b))[0] ?? []
  if (chosen.length === 0) return null
  const stars = chosen.filter((mark) => mark.yellow).length
  if (stars > 30) return null
  const x = Math.min(...chosen.map((mark) => mark.x))
  const y = Math.min(...chosen.map((mark) => mark.y))
  const right = Math.max(...chosen.map((mark) => mark.x + mark.w))
  const bottom = Math.max(...chosen.map((mark) => mark.y + mark.h))
  return { stars, x, y, w: right - x, h: bottom - y }
}

/**
 * 同じ間隔で並んだ星のまとまりを返す。星は5個ごとに少し空くので、
 * 間隔は1つ分か2つ分のどちらかになる。文字の並びはここで落ちる。
 */
function regularRuns(row: StarMark[], starHeight: number): StarMark[][] {
  const sorted = [...row].sort((a, b) => a.cx - b.cx)
  const gaps = sorted.slice(1).map((mark, index) => mark.cx - (sorted[index]?.cx ?? 0))
  const step = Math.min(...gaps.filter((gap) => gap >= starHeight * 0.9))
  if (!Number.isFinite(step)) return sorted.length === 1 ? [sorted] : []
  const runs: StarMark[][] = []
  let run: StarMark[] = []
  let inGroup = 0
  sorted.forEach((mark, index) => {
    const gap = index === 0 ? 0 : (gaps[index - 1] ?? 0)
    const single = gap >= step * 0.85 && gap <= step * 1.18
    const double = gap >= step * 1.65 && gap <= step * 2.3
    const fits = index > 0 && ((single && inGroup < 5) || (double && inGroup === 5))
    if (index > 0 && !fits) {
      runs.push(run)
      run = []
      inGroup = 0
    } else if (double) {
      inGroup = 0
    }
    run.push(mark)
    inGroup += 1
  })
  runs.push(run)
  return runs
}

export type HoveredTooltip = {
  stars: number
  icon: CaptureRect
  name: CaptureRect | null
  /** クエストヘルパーを含まない、アイテム説明そのものの範囲。 */
  body: CaptureRect
}

/**
 * 説明の★の数と、その下に出ている装備アイコンの位置。
 * アイコンは取り込み済みの画像と照合する。
 */
function aroundCursor(image: CaptureImage, near: { x: number; y: number }): CaptureRect {
  const x = Math.max(0, near.x - 420)
  const y = Math.max(0, near.y - 560)
  return {
    x,
    y,
    w: Math.min(900, image.width - x),
    h: Math.min(760, image.height - y),
  }
}

function tooltipAt(image: CaptureImage, cluster: StarCluster): HoveredTooltip | null {
  const below = iconWells(image, {
    x: Math.max(0, cluster.x - 80),
    y: Math.max(0, cluster.y),
    w: Math.min(image.width, cluster.w + 360),
    h: Math.min(image.height - Math.max(0, cluster.y), cluster.h + 140),
  }).filter((well) => {
    const gap = well.y - (cluster.y + cluster.h)
    const overlaps = well.x < cluster.x + cluster.w + 12 && well.x + well.w > cluster.x - 12
    return gap >= -2 && gap < Math.max(28, cluster.h * 6) && overlaps
  })
  const chosen = [...below].sort((a, b) => a.y - b.y || Math.abs(a.x - cluster.x) - Math.abs(b.x - cluster.x))[0]
  if (!chosen) return null
  const icon = { x: chosen.x, y: chosen.y, w: chosen.w, h: chosen.h }
  return {
    stars: cluster.stars,
    icon,
    name: readTooltipNameRect(image, cluster, icon),
    body: readTooltipBody(image, cluster),
  }
}

export function readHoveredTooltip(
  image: CaptureImage,
  near?: { x: number; y: number } | null,
): HoveredTooltip | null {
  const onScreen =
    near != null && near.x >= 0 && near.y >= 0 && near.x < image.width && near.y < image.height
  if (onScreen) {
    const local = locateStarCluster(image, 36, near, aroundCursor(image, near))
    const found = local ? tooltipAt(image, local) : null
    if (found) return found
  }
  const cluster = locateStarCluster(image, 36, onScreen ? near : undefined)
  const found = cluster ? tooltipAt(image, cluster) : null
  if (found) return found
  // 星のないイベントリングや、黄色い見出しを星と誤認した場合は、
  // 説明欄の大きなアイコン枠を起点にその説明欄だけを調べる。
  const wells = iconWells(image, { x: 0, y: 0, w: image.width, h: image.height })
    .filter((well) => well.w >= 48 && well.h >= 48)
    .sort((a, b) => near
      ? Math.hypot(a.x - near.x, a.y - near.y) - Math.hypot(b.x - near.x, b.y - near.y)
      : a.y - b.y)
  for (const icon of wells) {
    const anchor = { x: icon.x + icon.w + 12, y: icon.y - 25, w: icon.w, h: 1, stars: 0 }
    const body = readTooltipBody(image, anchor)
    if (body.w < icon.w * 2.5 || body.w > icon.w * 6 || body.h < icon.h * 2 ||
        icon.x < body.x || icon.x + icon.w > body.x + body.w) continue
    const stars = locateStarCluster(image, 36, undefined, {
      x: body.x, y: body.y, w: body.w, h: Math.max(1, icon.y - body.y),
    })
    const nameAnchor = stars ?? { x: body.x + 8, y: body.y + 2, w: body.w - 16, h: 0, stars: 0 }
    const name = readTooltipNameRect(image, nameAnchor, icon)
    if (!name) continue
    return { icon, body, name, stars: stars?.stars ?? 0 }
  }
  return null
}

function isTooltipDark(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return (r + g + b) / 3 < 108 && max - min < 72
}

function bandDark(image: CaptureImage, fixed: number, from: number, to: number, vertical: boolean): number {
  let dark = 0
  let total = 0
  for (let cursor = from; cursor <= to; cursor += 1) {
    const x = vertical ? fixed : cursor
    const y = vertical ? cursor : fixed
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue
    total += 1
    if (isTooltipDark(...rgbAt(image, x, y))) dark += 1
  }
  return total === 0 ? 0 : dark / total
}

/** 星の並びが載っている暗い説明欄。右隣の別ウィンドウは隙間で切る。 */
function readTooltipBody(image: CaptureImage, cluster: StarCluster): CaptureRect {
  const sampleTop = Math.max(0, cluster.y - 2)
  const sampleBottom = Math.min(image.height - 1, cluster.y + cluster.h + 28)
  let left = cluster.x
  let right = Math.min(image.width - 1, cluster.x + cluster.w)
  for (let x = cluster.x; x >= 0; x -= 1) {
    if (bandDark(image, x, sampleTop, sampleBottom, true) < 0.42) break
    left = x
  }
  for (let x = cluster.x + cluster.w; x < image.width; x += 1) {
    if (bandDark(image, x, sampleTop, sampleBottom, true) < 0.42) break
    right = x
  }
  const innerLeft = Math.min(right, left + 6)
  const innerRight = Math.max(innerLeft, right - 6)
  let top = cluster.y
  let bottom = cluster.y
  for (let y = cluster.y; y >= 0; y -= 1) {
    if (bandDark(image, y, innerLeft, innerRight, false) < 0.35) break
    top = y
  }
  for (let y = cluster.y; y < image.height; y += 1) {
    if (bandDark(image, y, innerLeft, innerRight, false) < 0.22) break
    bottom = y
  }
  return {
    x: left,
    y: top,
    w: Math.max(1, right - left + 1),
    h: Math.max(1, bottom - top + 1),
  }
}

/** 説明の白文字と、色の付いた数値。 */
export function isTooltipInk(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  const chroma = max - min
  if (lum > 150 && chroma < 80) return true
  return chroma > 30 && lum > 52 && lum < 230
}

function overlaps(icon: CaptureRect, x: number, y: number): boolean {
  return x >= icon.x - 2 && x < icon.x + icon.w + 2 && y >= icon.y - 2 && y < icon.y + icon.h + 2
}

/** 説明欄の中の、1行ずつの文字帯。アイコンと★の列は除く。 */
export function tooltipTextLines(image: CaptureImage, body: CaptureRect, icon: CaptureRect): CaptureRect[] {
  const x1 = body.x + 12
  const x2 = body.x + body.w - 12
  const rows: number[] = []
  for (let y = body.y + 6; y < body.y + body.h - 4; y += 1) {
    let count = 0
    let yellow = 0
    for (let x = x1; x < x2; x += 1) {
      if (overlaps(icon, x, y)) continue
      const [r, g, b] = rgbAt(image, x, y)
      if (!isTooltipInk(r, g, b)) continue
      count += 1
      if (isStarYellow(r, g, b)) yellow += 1
    }
    // 黄色い潜在見出しも必要。星列はアイコンより上なので範囲で除外する。
    if (count >= 6 && (y >= icon.y - 45 || yellow < count * 0.5)) rows.push(y)
  }
  const bands: { y: number; end: number }[] = []
  for (const y of rows) {
    const last = bands[bands.length - 1]
    if (last && y <= last.end + 2) last.end = y
    else bands.push({ y, end: y })
  }
  const lines: CaptureRect[] = []
  for (const band of bands) {
    if (band.end - band.y < 3) continue
    let left = x2
    let right = x1
    for (let y = band.y; y <= band.end; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        if (overlaps(icon, x, y)) continue
        if (!isTooltipInk(...rgbAt(image, x, y))) continue
        if (x < left) left = x
        if (x > right) right = x
      }
    }
    if (right - left < 28) continue
    lines.push({
      x: Math.max(0, left - 2),
      y: Math.max(0, band.y - 1),
      w: Math.min(image.width - left, right - left + 5),
      h: band.end - band.y + 3,
    })
    if (lines.length >= 64) break
  }
  return lines
}

function isNameInk(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return (r + g + b) / 3 > 168 && max - min < 55 && b > 120
}

function locateNameBand(
  image: CaptureImage,
  cluster: StarCluster,
  icon: CaptureRect,
  inkTest: (r: number, g: number, b: number) => boolean,
  maxGap: number,
): CaptureRect | null {
  const y1 = cluster.y + cluster.h + 2
  const y2 = Math.min(image.height - 1, icon.y - 1)
  const x1 = Math.max(0, Math.min(cluster.x, icon.x) - 8)
  const x2 = Math.min(image.width - 1, Math.max(cluster.x + cluster.w, icon.x + icon.w + 180))
  if (y2 - y1 < 6 || x2 - x1 < 20) return null
  const rows: number[] = []
  for (let y = y1; y <= y2; y += 1) {
    let count = 0
    for (let x = x1; x <= x2; x += 1) {
      if (inkTest(...rgbAt(image, x, y))) count += 1
    }
    if (count >= 8) rows.push(y)
  }
  const first = rows[0]
  if (first === undefined) return null
  let end = first
  for (const y of rows) {
    if (y <= end + maxGap && y - first <= 15) end = y
    else break
  }
  const inkX: number[] = []
  for (let y = first; y <= end; y += 1) {
    for (let x = x1; x <= x2; x += 1) {
      if (inkTest(...rgbAt(image, x, y))) inkX.push(x)
    }
  }
  inkX.sort((a, b) => a - b)
  const groups: number[][] = []
  for (const x of inkX) {
    const last = groups[groups.length - 1]
    const previous = last?.[last.length - 1]
    if (!last || previous === undefined || x - previous > 22) groups.push([x])
    else last.push(x)
  }
  const line = groups.find((group) => (group[group.length - 1] ?? 0) - (group[0] ?? 0) >= 24)
  const left = line?.[0]
  const right = line?.[line.length - 1]
  if (left === undefined || right === undefined || right - left < 16) return null
  return {
    x: Math.max(0, left - 3),
    y: Math.max(0, first - 2),
    w: Math.min(image.width - left, right - left + 7),
    h: end - first + 6,
  }
}

/** 星の下、アイコンの上にあるアイテム名（白文字または強化色文字）。 */
function readTooltipNameRect(image: CaptureImage, cluster: StarCluster, icon: CaptureRect): CaptureRect | null {
  return (
    locateNameBand(image, cluster, icon, isNameInk, 2) ??
    locateNameBand(image, cluster, icon, isTooltipInk, 1)
  )
}

function locateStarCluster(
  image: CaptureImage,
  slotSize: number,
  near?: { x: number; y: number },
  bounds: CaptureRect = { x: 0, y: 0, w: image.width, h: image.height },
): StarCluster | null {
  const yellow = starMarks(image, slotSize, true, bounds)
  if (yellow.length === 0) return null
  const starHeight = median(yellow.map((mark) => mark.h))
  const sameSize = (mark: StarMark) =>
    mark.h >= starHeight * 0.7 &&
    mark.h <= starHeight * 1.4 &&
    mark.w >= starHeight * 0.7 &&
    mark.w <= starHeight * 1.6
  const marks = [...yellow, ...starMarks(image, slotSize, false, bounds)].filter(sameSize)
  const rows: StarMark[][] = []
  for (const mark of [...marks].sort((a, b) => a.cy - b.cy)) {
    const row = rows.find((entry) => Math.abs((entry[0]?.cy ?? 0) - mark.cy) <= starHeight * 0.5)
    if (row) row.push(mark)
    else rows.push([mark])
  }
  const lines = rows
    .flatMap((row) => regularRuns(row, starHeight))
    .sort((a, b) => (a[0]?.cy ?? 0) - (b[0]?.cy ?? 0))
  const clusters: StarMark[][] = []
  for (const line of lines) {
    if (line.length < 5 || !line.some((mark) => mark.yellow)) continue
    const left = Math.min(...line.map((mark) => mark.x))
    const right = Math.max(...line.map((mark) => mark.x + mark.w))
    const cy = line[0]?.cy ?? 0
    const below = lines.find((other) => {
      const gap = (other[0]?.cy ?? 0) - cy
      const otherLeft = Math.min(...other.map((mark) => mark.x))
      return gap > starHeight && gap < starHeight * 3.5 && otherLeft >= left - starHeight && otherLeft <= right
    })
    clusters.push(below ? [...line, ...below] : line)
  }
  return starCluster(clusters, near)
}

function insetRect(rect: CaptureRect, amount: number): CaptureRect {
  const shrink = Math.min(amount, Math.floor(Math.min(rect.w, rect.h) / 4))
  return {
    x: rect.x + shrink,
    y: rect.y + shrink,
    w: Math.max(1, rect.w - shrink * 2),
    h: Math.max(1, rect.h - shrink * 2),
  }
}

/** 下地や枠を除き、絵そのものの色だけを残す。 */
function isSpritePixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = (r + g + b) / 3
  const chroma = max - min
  if (lum > 235 && chroma < 30) return true
  return chroma > 48 && lum > 35 && lum < 230
}

/** 明るい下地を除いた色の分布。大きさや位置が違っても同じ絵なら近くなる。 */
function colorHistogram(image: CaptureImage, rect: CaptureRect): number[] {
  const bins = Array.from({ length: 64 }, () => 0)
  let count = 0
  const x2 = Math.min(image.width, rect.x + rect.w)
  const y2 = Math.min(image.height, rect.y + rect.h)
  for (let y = Math.max(0, rect.y); y < y2; y += 1) {
    for (let x = Math.max(0, rect.x); x < x2; x += 1) {
      const [r, g, b] = rgbAt(image, x, y)
      if (!isSpritePixel(r, g, b)) continue
      bins[(Math.min(3, r >> 6) << 4) | (Math.min(3, g >> 6) << 2) | Math.min(3, b >> 6)] += 1
      count += 1
    }
  }
  if (count === 0) return bins
  return bins.map((value) => value / count)
}

function histogramDistance(left: number[], right: number[]): number {
  let overlap = 0
  for (let index = 0; index < left.length; index += 1) {
    overlap += Math.min(left[index] ?? 0, right[index] ?? 0)
  }
  return 1 - overlap
}

export type IconMatch =
  | { status: 'matched'; id: EquipmentSlotId; distance: number }
  | { status: 'ambiguous' }
  | { status: 'none' }

/** 説明のアイコンと、取り込み済みの装備画像との近さ。小さいほど同じ絵。 */
export function rankSlotIcons(
  frame: CaptureImage,
  icon: CaptureRect,
  slots: { id: EquipmentSlotId; image: CaptureImage }[],
): { id: EquipmentSlotId; distance: number }[] {
  if (slots.length === 0) return []
  const hovered = colorHistogram(frame, insetRect(icon, Math.round(Math.min(icon.w, icon.h) * 0.18)))
  return slots
    .map((slot) => ({
      id: slot.id,
      distance: histogramDistance(
        hovered,
        colorHistogram(
          slot.image,
          insetRect(
            { x: 0, y: 0, w: slot.image.width, h: slot.image.height },
            Math.round(Math.min(slot.image.width, slot.image.height) * 0.18),
          ),
        ),
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
}

/**
 * 説明のアイコンを、取り込み済みの装備画像と比べる。
 * 一番近いものが次点よりはっきり近ければ、その枠。
 */
export function matchSlotIcon(
  frame: CaptureImage,
  icon: CaptureRect,
  slots: { id: EquipmentSlotId; image: CaptureImage }[],
): IconMatch {
  const scored = rankSlotIcons(frame, icon, slots)
  const best = scored[0]
  const second = scored[1]
  if (!best || best.distance > 0.62) return { status: 'none' }
  if (second && second.distance - best.distance < 0.06) return { status: 'ambiguous' }
  return { status: 'matched', id: best.id, distance: best.distance }
}

/**
 * 名前で部位が一つに決まるときはその枠。
 * 同じ絵が複数あるときは、マウスが乗っている枠。
 * 絵がはっきり一つなら、その枠。
 */
export function chooseHoveredSlot(input: {
  distances: { id: EquipmentSlotId; distance: number }[]
  cursorSlot: EquipmentSlotId | null
  namedSlots: EquipmentSlotId[]
}): EquipmentSlotId | null {
  const distanceOf = (id: EquipmentSlotId) => input.distances.find((entry) => entry.id === id)?.distance ?? 1
  const pictured = (id: EquipmentSlotId, limit: number) => distanceOf(id) <= limit
  const named = input.namedSlots.filter((id) => pictured(id, 0.75))
  if (named.length === 1) return named[0] ?? null
  if (input.cursorSlot && named.includes(input.cursorSlot)) return input.cursorSlot
  const ranked = [...input.distances].sort((a, b) => a.distance - b.distance)
  const best = ranked[0]
  const cursorDistance = input.cursorSlot ? distanceOf(input.cursorSlot) : 1
  if (
    input.cursorSlot &&
    input.distances.some((entry) => entry.id === input.cursorSlot) &&
    cursorDistance <= 0.75 &&
    (!best || best.id === input.cursorSlot || cursorDistance <= best.distance + 0.08)
  ) {
    return input.cursorSlot
  }
  const second = ranked[1]
  if (best && best.distance <= 0.62 && (!second || second.distance - best.distance >= 0.06)) return best.id
  return null
}

export function captureItemId(
  characterId: string,
  presetIndex: 0 | 1 | 2,
  slotId: EquipmentSlotId,
): string {
  return `capture:${characterId}:${presetIndex}:${slotId}`
}

export function commitStarReadings(
  tracks: Record<string, StarTrack>,
  readings: { id: EquipmentSlotId; starForce: number | null }[],
): { tracks: Record<string, StarTrack>; updates: { id: EquipmentSlotId; starForce: number }[] } {
  const next = { ...tracks }
  const updates: { id: EquipmentSlotId; starForce: number }[] = []
  for (const reading of readings) {
    const current = next[reading.id] ?? { raw: null, seen: 0, value: null }
    if (reading.starForce === null) {
      next[reading.id] = { ...current, raw: null, seen: 0 }
      continue
    }
    const seen = current.raw === reading.starForce ? current.seen + 1 : 1
    const value = seen >= STAR_STABLE_READS ? reading.starForce : current.value
    next[reading.id] = { raw: reading.starForce, seen, value }
    if (value !== null && value !== current.value) {
      updates.push({ id: reading.id, starForce: value })
    }
  }
  return { tracks: next, updates }
}

export function clearCapturedEquipment(data: AppData, characterId: string): AppData {
  const prefix = `capture:${characterId}:`
  return data.items.reduce(
    (next, item) => (item.id.startsWith(prefix) ? deleteItem(next, item.id) : next),
    data,
  )
}

export type EquipmentRead = {
  imageDataUrl?: string
  starForce?: number
  name?: string
  stats?: { label: string; value: string }[]
  enhanceText?: string
  potentials?: { text: string }[]
  additionalPotentials?: { text: string }[]
  notes?: string
}

/** 説明から読んだ名前、星力、能力値を、今の枠の装備へ書く。 */
export function applyEquipmentInfo(
  data: AppData,
  characterId: string,
  slotId: EquipmentSlotId,
  info: EquipmentRead,
  now: string,
): AppData {
  const loadout = data.loadoutsByCharacterId[characterId]
  if (!loadout) return data
  const item = findItem(data, activePreset(loadout).slots[slotId])
  if (!item) return data
  const next = {
    name: info.name?.trim() || item.name,
    slotGroup: item.slotGroup,
    stats: info.stats ?? item.stats,
    starForce: info.starForce ?? item.starForce,
    enhanceText: info.enhanceText ?? item.enhanceText,
    potentials: info.potentials ?? item.potentials,
    additionalPotentials: info.additionalPotentials ?? item.additionalPotentials,
    imageDataUrl: info.imageDataUrl || item.imageDataUrl,
    notes: info.notes ?? item.notes,
  }
  const current = {
    name: item.name,
    slotGroup: item.slotGroup,
    stats: item.stats,
    starForce: item.starForce,
    enhanceText: item.enhanceText,
    potentials: item.potentials,
    additionalPotentials: item.additionalPotentials,
    imageDataUrl: item.imageDataUrl,
    notes: item.notes,
  }
  if (JSON.stringify(next) === JSON.stringify(current)) return data
  return upsertItem(data, next, { id: item.id, now, existing: item })
}

function withStarForce(item: EquipmentItem, starForce: number) {
  return {
    name: item.name,
    slotGroup: item.slotGroup,
    stats: item.stats,
    starForce,
    enhanceText: item.enhanceText,
    potentials: item.potentials,
    additionalPotentials: item.additionalPotentials,
    imageDataUrl: item.imageDataUrl,
    notes: item.notes,
  }
}

/** 今のプリセットでその枠に入っている装備へ星力を書く。装備がなければ何もしない。 */
export function applyStarForce(
  data: AppData,
  characterId: string,
  slotId: EquipmentSlotId,
  starForce: number,
  now: string,
): AppData {
  const loadout = data.loadoutsByCharacterId[characterId]
  if (!loadout) return data
  const item = findItem(data, activePreset(loadout).slots[slotId])
  if (!item || item.starForce === starForce) return data
  return upsertItem(data, withStarForce(item, starForce), { id: item.id, now, existing: item })
}

export function applyEquipmentCapture(
  data: AppData,
  characterId: string,
  reading: EquipmentCaptureInput,
  now: string,
): AppData {
  let next = data
  if (reading.portraitDataUrl) {
    const character = findCharacter(next, characterId)
    if (character) {
      next = updateCharacter(
        next,
        characterId,
        {
          name: character.name,
          world: character.world,
          job: character.job,
          jobId: character.jobId,
          level: character.level,
          portraitDataUrl: reading.portraitDataUrl,
        },
        now,
      )
    }
  }

  const presetIndex =
    reading.presetIndex ??
    next.loadoutsByCharacterId[characterId]?.activePresetIndex ??
    0
  if (reading.presetIndex !== null) {
    next = setActivePreset(next, characterId, reading.presetIndex)
  }

  for (const slot of reading.slots) {
    if (!isPaperdollSlot(slot.id)) continue
    const itemId = captureItemId(characterId, presetIndex, slot.id)
    if (!slot.occupied || !slot.imageDataUrl) {
      next = assignSlot(next, characterId, slot.id, null)
      continue
    }
    const existing = next.items.find((item) => item.id === itemId)
    const spec = slotById(slot.id)
    const input = {
      name: existing?.name || spec.label,
      slotGroup: spec.group,
      stats: existing?.stats ?? [],
      starForce: existing?.starForce ?? null,
      enhanceText: existing?.enhanceText ?? '',
      potentials: existing?.potentials ?? [],
      additionalPotentials: existing?.additionalPotentials ?? [],
      imageDataUrl: slot.imageDataUrl,
      notes: existing?.notes || '画面から読み取り',
    }
    next = upsertItem(next, input, {
      id: itemId,
      now,
      existing,
    })
    next = assignSlot(next, characterId, slot.id, itemId)
  }
  return next
}
