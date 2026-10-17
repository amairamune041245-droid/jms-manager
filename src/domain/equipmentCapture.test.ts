import { inflateSync } from 'node:zlib'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createEmptyHexaProgress } from './hexa.ts'
import {
  applyEquipmentCapture,
  applyEquipmentInfo,
  applyStarForce,
  clearCapturedEquipment,
  commitStarReadings,
  locateEquipmentWindow,
  chooseHoveredSlot,
  matchSlotIcon,
  readHoveredTooltip,
  readTooltipStars,
  slotAt,
  tooltipTextLines,
} from './equipmentCapture.ts'
import type { CaptureImage } from './equipmentCapture.ts'
import { createDefaultLoadout } from './presets.ts'
import { APP_DATA_VERSION } from './types.ts'
import type { AppData, Character } from './types.ts'

type Rgb = [number, number, number]

function image(width: number, height: number, fill: Rgb): CaptureImage {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let index = 0; index < data.length; index += 4) {
    data[index] = fill[0]
    data[index + 1] = fill[1]
    data[index + 2] = fill[2]
    data[index + 3] = 255
  }
  return { width, height, data }
}

function fillRect(target: CaptureImage, x: number, y: number, w: number, h: number, color: Rgb) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      if (px < 0 || py < 0 || px >= target.width || py >= target.height) continue
      const index = (py * target.width + px) * 4
      target.data[index] = color[0]
      target.data[index + 1] = color[1]
      target.data[index + 2] = color[2]
    }
  }
}

const ORIGIN_X = 28
const ORIGIN_Y = 36
const PITCH = 36
const SIZE = 32

function sampleWindow(): CaptureImage {
  const target = image(340, 360, [244, 244, 244])
  const grid = [
    [0, 1, -1, -1, -1, 5, 6],
    [0, 1, -1, -1, -1, 5, 6],
    [0, 1, -1, -1, -1, 5, 6],
    [0, 1, -1, -1, -1, 5, 6],
    [0, 1, 2, 3, 4, 5, 6],
    [0, -1, -1, -1, -1, -1, 6],
  ]
  fillRect(target, ORIGIN_X + 2 * PITCH, ORIGIN_Y, 2 * PITCH + SIZE, 3 * PITCH + SIZE, [180, 40, 160])
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      if ((grid[row]?.[column] ?? -1) < 0) continue
      const x = ORIGIN_X + column * PITCH
      const y = ORIGIN_Y + row * PITCH
      fillRect(target, x, y, SIZE, SIZE, [70, 48, 32])
      fillRect(target, x + 1, y + 1, 8, 9, [150, 220, 20])
    }
  }
  const buttonY = ORIGIN_Y + 5 * PITCH + SIZE + 8
  for (let index = 0; index < 3; index += 1) {
    const x = ORIGIN_X + 2 * PITCH + 8 + index * 28
    fillRect(target, x, buttonY, 18, 16, [120, 128, 136])
    if (index === 1) fillRect(target, x - 2, buttonY - 2, 22, 2, [230, 246, 255])
  }
  return target
}

const TOOLTIP: Rgb = [55, 62, 70]
const STAR = ['..#..', '.###.', '#####', '.###.', '##.##']

function paintStar(target: CaptureImage, x: number, y: number, color: Rgb) {
  STAR.forEach((row, rowIndex) => {
    ;[...row].forEach((cell, column) => {
      if (cell === '#') fillRect(target, x + column, y + rowIndex, 1, 1, color)
    })
  })
}

/** 1段目15個、2段目10個。filled 個まで黄色、残りは灰色。shown を超える星は描かない。 */
function tooltipWithStars(filled: number, shown = 25): CaptureImage {
  const target = image(260, 140, TOOLTIP)
  for (let index = 0; index < shown; index += 1) {
    const row = index < 15 ? 0 : 1
    const within = row === 0 ? index : index - 15
    const x = 20 + within * 8 + Math.floor(within / 5) * 8
    const y = 20 + row * 13
    paintStar(target, x, y, index < filled ? [215, 200, 70] : [140, 140, 140])
  }
  fillRect(target, 30, 110, 8, 8, [210, 195, 80])
  return target
}

function blitCenter(target: CaptureImage, sprite: CaptureImage) {
  const scale = Math.min(target.width, target.height) * 0.62 / Math.max(sprite.width, sprite.height)
  const width = Math.max(1, Math.round(sprite.width * scale))
  const height = Math.max(1, Math.round(sprite.height * scale))
  const originX = Math.round((target.width - width) / 2)
  const originY = Math.round((target.height - height) / 2)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const fromX = Math.min(sprite.width - 1, Math.floor((x / width) * sprite.width))
      const fromY = Math.min(sprite.height - 1, Math.floor((y / height) * sprite.height))
      const from = (fromY * sprite.width + fromX) * 4
      const to = ((originY + y) * target.width + originX + x) * 4
      target.data[to] = sprite.data[from] ?? 0
      target.data[to + 1] = sprite.data[from + 1] ?? 0
      target.data[to + 2] = sprite.data[from + 2] ?? 0
      target.data[to + 3] = 255
    }
  }
}

function cropImage(source: CaptureImage, rect: { x: number; y: number; w: number; h: number }): CaptureImage {
  const data = new Uint8ClampedArray(rect.w * rect.h * 4)
  for (let y = 0; y < rect.h; y += 1) {
    for (let x = 0; x < rect.w; x += 1) {
      const from = ((rect.y + y) * source.width + rect.x + x) * 4
      const to = (y * rect.w + x) * 4
      data[to] = source.data[from] ?? 0
      data[to + 1] = source.data[from + 1] ?? 0
      data[to + 2] = source.data[from + 2] ?? 0
      data[to + 3] = 255
    }
  }
  return { width: rect.w, height: rect.h, data }
}

function decodePng(bytes: Uint8Array): CaptureImage {
  let offset = 8
  let width = 0
  let height = 0
  let colorType = 6
  const parts: Uint8Array[] = []
  while (offset + 8 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0)
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    const chunk = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = new DataView(chunk.buffer, chunk.byteOffset, 4).getUint32(0)
      height = new DataView(chunk.buffer, chunk.byteOffset + 4, 4).getUint32(0)
      colorType = chunk[9] ?? 6
    } else if (type === 'IDAT') {
      parts.push(chunk)
    } else if (type === 'IEND') {
      break
    }
    offset += 12 + length
  }
  const compressed = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let cursor = 0
  for (const part of parts) {
    compressed.set(part, cursor)
    cursor += part.length
  }
  const raw = inflateSync(compressed)
  const channels = colorType === 6 ? 4 : 3
  const stride = width * channels
  const data = new Uint8ClampedArray(width * height * 4)
  let source = 0
  let previous = new Uint8Array(stride)
  const paeth = (left: number, up: number, upLeft: number) => {
    const estimate = left + up - upLeft
    const leftDistance = Math.abs(estimate - left)
    const upDistance = Math.abs(estimate - up)
    const diagonal = Math.abs(estimate - upLeft)
    if (leftDistance <= upDistance && leftDistance <= diagonal) return left
    if (upDistance <= diagonal) return up
    return upLeft
  }
  for (let y = 0; y < height; y += 1) {
    const filter = raw[source] ?? 0
    source += 1
    const current = new Uint8Array(stride)
    for (let index = 0; index < stride; index += 1) {
      const left = index >= channels ? (current[index - channels] ?? 0) : 0
      const up = previous[index] ?? 0
      const upLeft = index >= channels ? (previous[index - channels] ?? 0) : 0
      const value = raw[source + index] ?? 0
      if (filter === 1) current[index] = (value + left) & 255
      else if (filter === 2) current[index] = (value + up) & 255
      else if (filter === 3) current[index] = (value + ((left + up) >> 1)) & 255
      else if (filter === 4) current[index] = (value + paeth(left, up, upLeft)) & 255
      else current[index] = value
    }
    source += stride
    previous = current
    for (let x = 0; x < width; x += 1) {
      const from = x * channels
      const to = (y * width + x) * 4
      data[to] = current[from] ?? 0
      data[to + 1] = current[from + 1] ?? 0
      data[to + 2] = current[from + 2] ?? 0
      data[to + 3] = channels === 4 ? (current[from + 3] ?? 255) : 255
    }
  }
  return { width, height, data }
}

function sampleData(): AppData {
  const character: Character = {
    id: 'c1',
    name: 'らむね',
    world: '楓',
    job: 'キャノンマスター',
    jobId: 'cannoneer',
    level: 285,
    portraitDataUrl: null,
    createdAt: 't',
    updatedAt: 't',
  }
  const hexa = createEmptyHexaProgress()
  hexa.skillLevels['origin'] = 4
  return {
    version: APP_DATA_VERSION,
    characters: [character],
    items: [],
    loadoutsByCharacterId: { c1: createDefaultLoadout() },
    hexaByCharacterId: { c1: hexa },
    statSheetsByCharacterId: {},
    bossClearsByCharacterId: {},
    gachaPools: [],
  }
}

describe('equipment window capture', () => {
  it('finds slots, the character and the selected preset in one frame', () => {
    const reading = locateEquipmentWindow(sampleWindow())
    expect(reading).not.toBeNull()
    expect(reading?.slots.find((slot) => slot.id === 'ring1')?.state).toBe('filled')
    expect(reading?.slots.find((slot) => slot.id === 'weapon')?.state).toBe('filled')
    expect(reading?.slots.find((slot) => slot.id === 'pocket')?.state).toBe('filled')
    expect(reading?.slots.every((slot) => slot.state === 'filled')).toBe(true)
    expect(reading?.presetIndex).toBe(1)
    expect(reading?.characterVisible).toBe(true)
    expect(reading?.grid.pitch).toBe(PITCH)
  })

  it('marks slots under a tooltip as hidden instead of reading them', () => {
    const frame = sampleWindow()
    fillRect(frame, ORIGIN_X + 4 * PITCH + 20, ORIGIN_Y + 10, 200, 2 * PITCH + 10, TOOLTIP)
    const reading = locateEquipmentWindow(frame)
    expect(reading).not.toBeNull()
    expect(reading?.slots.find((slot) => slot.id === 'hat')?.state).toBe('hidden')
    expect(reading?.slots.find((slot) => slot.id === 'cape')?.state).toBe('hidden')
    expect(reading?.slots.find((slot) => slot.id === 'top')?.state).toBe('hidden')
    expect(reading?.slots.find((slot) => slot.id === 'ring1')?.state).toBe('filled')
    expect(reading?.slots.find((slot) => slot.id === 'weapon')?.state).toBe('filled')
    expect(reading?.characterVisible).toBe(false)
  })

  it('maps a mouse position to the slot under it', () => {
    const grid = { originX: ORIGIN_X, originY: ORIGIN_Y, pitch: PITCH, size: SIZE }
    expect(slotAt(grid, ORIGIN_X + 6 * PITCH + 10, ORIGIN_Y + 10)).toBe('cape')
    expect(slotAt(grid, ORIGIN_X + 2 * PITCH + 10, ORIGIN_Y + 4 * PITCH + 10)).toBe('weapon')
    expect(slotAt(grid, ORIGIN_X + 3 * PITCH, ORIGIN_Y + PITCH)).toBeNull()
  })

  it('counts yellow stars in the item tooltip and ignores a lone yellow icon', () => {
    expect(readTooltipStars(tooltipWithStars(18), SIZE)).toBe(18)
    expect(readTooltipStars(tooltipWithStars(7), SIZE)).toBe(7)
    expect(readTooltipStars(tooltipWithStars(22), SIZE)).toBe(22)
    expect(readTooltipStars(tooltipWithStars(18, 18), SIZE)).toBe(18)
    expect(readTooltipStars(tooltipWithStars(0), SIZE)).toBeNull()
    expect(readTooltipStars(image(200, 100, TOOLTIP), SIZE)).toBeNull()
  })

  it('matches the tooltip picture to the captured slot, not a different item', () => {
    const frame = tooltipWithStars(18)
    fillRect(frame, 24, 55, 36, 36, [214, 216, 220])
    fillRect(frame, 30, 64, 22, 16, [28, 26, 30])
    fillRect(frame, 36, 68, 4, 4, [210, 40, 40])
    const hovered = readHoveredTooltip(frame)
    expect(hovered?.stars).toBe(18)
    expect(hovered?.icon.w).toBeGreaterThan(20)
    if (!hovered) return

    const cape = image(32, 32, [70, 48, 32])
    fillRect(cape, 8, 10, 16, 12, [28, 26, 30])
    fillRect(cape, 12, 13, 4, 4, [210, 40, 40])
    const ring = image(32, 32, [70, 48, 32])
    fillRect(ring, 8, 8, 16, 16, [214, 170, 40])
    const match = matchSlotIcon(frame, hovered.icon, [
      { id: 'cape', image: cape },
      { id: 'ring1', image: ring },
    ])
    expect(match).toMatchObject({ status: 'matched', id: 'cape' })

    const twin = image(32, 32, [70, 48, 32])
    fillRect(twin, 8, 10, 16, 12, [28, 26, 30])
    fillRect(twin, 12, 13, 4, 4, [210, 40, 40])
    expect(
      matchSlotIcon(frame, hovered.icon, [
        { id: 'cape', image: cape },
        { id: 'hat', image: twin },
      ]).status,
    ).toBe('ambiguous')
  })

  it('uses the item name when several equipped pictures look alike', () => {
    expect(
      chooseHoveredSlot({
        distances: [
          { id: 'badge', distance: 0.25 },
          { id: 'face', distance: 0.25 },
          { id: 'cape', distance: 0.26 },
        ],
        cursorSlot: null,
        namedSlots: ['cape'],
      }),
    ).toBe('cape')
    expect(
      chooseHoveredSlot({
        distances: [
          { id: 'badge', distance: 0.25 },
          { id: 'cape', distance: 0.26 },
        ],
        cursorSlot: 'cape',
        namedSlots: [],
      }),
    ).toBe('cape')
    expect(
      chooseHoveredSlot({
        distances: [
          { id: 'badge', distance: 0.24 },
          { id: 'cape', distance: 0.3 },
        ],
        cursorSlot: 'cape',
        namedSlots: [],
      }),
    ).toBe('cape')
    expect(
      chooseHoveredSlot({
        distances: [
          { id: 'badge', distance: 0.25 },
          { id: 'face', distance: 0.25 },
          { id: 'cape', distance: 0.26 },
        ],
        cursorSlot: null,
        namedSlots: [],
      }),
    ).toBeNull()
  })

  it('updates icons only for visible slots and keeps HEXA and the job', () => {
    const next = applyEquipmentCapture(
      sampleData(),
      'c1',
      {
        presetIndex: 1,
        portraitDataUrl: 'data:image/jpeg;base64,abc',
        slots: [
          { id: 'hat', occupied: true, imageDataUrl: 'data:image/png;base64,hat' },
          { id: 'weapon', occupied: false, imageDataUrl: null },
        ],
      },
      'now',
    )
    expect(next.characters[0]?.portraitDataUrl).toBe('data:image/jpeg;base64,abc')
    expect(next.characters[0]?.jobId).toBe('cannoneer')
    expect(next.loadoutsByCharacterId.c1?.activePresetIndex).toBe(1)
    expect(next.loadoutsByCharacterId.c1?.presets[1].slots.hat).toBe('capture:c1:1:hat')
    expect(next.loadoutsByCharacterId.c1?.presets[0].slots.hat).toBeNull()
    expect(next.loadoutsByCharacterId.c1?.presets[1].slots.weapon).toBeNull()
    expect(next.hexaByCharacterId.c1?.skillLevels.origin).toBe(4)

    const starred = applyStarForce(next, 'c1', 'hat', 18, 'later')
    expect(starred.items.find((item) => item.id === 'capture:c1:1:hat')).toMatchObject({
      starForce: 18,
      imageDataUrl: 'data:image/png;base64,hat',
    })
    expect(applyStarForce(starred, 'c1', 'hat', 18, 'again')).toBe(starred)
    expect(applyStarForce(starred, 'c1', 'cape', 10, 'again')).toBe(starred)

    const detailed = applyEquipmentInfo(
      starred,
      'c1',
      'hat',
      {
        stats: [{ label: 'INT', value: '+48' }],
        notes: '交換不可',
      },
      'detail',
    )
    expect(detailed.items.find((item) => item.id === 'capture:c1:1:hat')).toMatchObject({
      name: '帽子',
      starForce: 18,
      imageDataUrl: 'data:image/png;base64,hat',
      stats: [{ label: 'INT', value: '+48' }],
      notes: '交換不可',
    })
    expect(
      applyEquipmentInfo(detailed, 'c1', 'hat', { starForce: undefined }, 'same'),
    ).toBe(detailed)

    // 説明のアイコン・星・能力値を同じ装備へ保存し、既存のメモを保持する。
    const combined = applyEquipmentInfo(detailed, 'c1', 'hat', {
      imageDataUrl: 'data:image/png;base64,tooltip-icon',
      starForce: 22,
      stats: [{ label: 'INT', value: '+80' }],
    }, 'combined')
    expect(combined.items.find((item) => item.id === 'capture:c1:1:hat')).toMatchObject({
      imageDataUrl: 'data:image/png;base64,tooltip-icon',
      starForce: 22,
      stats: [{ label: 'INT', value: '+80' }],
      notes: '交換不可',
    })
    expect(combined.loadoutsByCharacterId).toEqual(detailed.loadoutsByCharacterId)

    const recaptured = applyEquipmentCapture(
      starred,
      'c1',
      {
        presetIndex: null,
        portraitDataUrl: null,
        slots: [{ id: 'hat', occupied: true, imageDataUrl: 'data:image/png;base64,hat2' }],
      },
      'later',
    )
    expect(recaptured.items.find((item) => item.id === 'capture:c1:1:hat')).toMatchObject({
      starForce: 18,
      imageDataUrl: 'data:image/png;base64,hat2',
    })
    expect(recaptured.characters[0]?.portraitDataUrl).toBe('data:image/jpeg;base64,abc')

    const cleared = clearCapturedEquipment(recaptured, 'c1')
    expect(cleared.items.some((item) => item.id.startsWith('capture:'))).toBe(false)
    expect(cleared.loadoutsByCharacterId.c1?.presets[1].slots.hat).toBeNull()
    expect(cleared.characters[0]?.portraitDataUrl).toBe('data:image/jpeg;base64,abc')
    expect(cleared.hexaByCharacterId.c1?.skillLevels.origin).toBe(4)
  })

  it('keeps the last stable star until a new number repeats', () => {
    const first = commitStarReadings({}, [{ id: 'hat', starForce: 22 }])
    expect(first.updates).toEqual([])
    const second = commitStarReadings(first.tracks, [{ id: 'hat', starForce: 22 }])
    expect(second.updates).toEqual([{ id: 'hat', starForce: 22 }])
    const flicker = commitStarReadings(second.tracks, [{ id: 'hat', starForce: 1 }])
    expect(flicker.updates).toEqual([])
    expect(flicker.tracks.hat?.value).toBe(22)
    const gone = commitStarReadings(flicker.tracks, [{ id: 'hat', starForce: null }])
    expect(gone.tracks.hat?.value).toBe(22)
    const changed = [17, 17].reduce(
      (state, starForce) => commitStarReadings(state.tracks, [{ id: 'hat', starForce }]),
      gone,
    )
    expect(changed.updates).toEqual([{ id: 'hat', starForce: 17 }])
  })
})

const realShot =
  'C:/Users/amai_/.cursor/projects/c-Users-amai-jms-manager/assets/c__Users_amai__AppData_Roaming_Cursor_User_workspaceStorage_b2303ce511860edbdb964843de5324a7_images_7987194769413bf0d4809469b6932e30-ffae3f2a-e60e-468f-9b93-e504b3b7007d.png'

const fullGame =
  'C:/Users/amai_/.cursor/projects/c-Users-amai-jms-manager/assets/fullgame-tooltip.png'

describe('hovered tooltip on the full game shot', () => {
  it('reads the cape tooltip stars and the icon under them', () => {
    if (!existsSync(fullGame)) return
    const frame = decodePng(readFileSync(fullGame))
    const hovered = readHoveredTooltip(frame)
    expect(hovered?.stars).toBe(18)
    expect(hovered?.icon.x).toBeGreaterThan(480)
    expect(hovered?.icon.x).toBeLessThan(540)
    expect(hovered?.icon.y).toBeGreaterThan(200)
    expect(hovered?.icon.y).toBeLessThan(260)
    expect(hovered?.icon.w).toBeGreaterThan(40)
    expect(hovered?.icon.h).toBeGreaterThan(40)
    expect(hovered?.name?.y).toBeGreaterThan(170)
    expect(hovered?.name?.y).toBeLessThan(190)
    expect(hovered?.name?.x).toBeGreaterThan(540)
    expect(hovered?.name?.w).toBeGreaterThan(80)
    expect(hovered?.name?.w).toBeLessThan(180)
    const nearCursor = readHoveredTooltip(frame, { x: hovered?.icon.x ?? 520, y: hovered?.icon.y ?? 230 })
    expect(nearCursor?.stars).toBe(18)
    expect(nearCursor?.body.x).toBe(hovered?.body.x)
    expect(hovered?.body.x).toBeLessThan(520)
    expect((hovered?.body.x ?? 0) + (hovered?.body.w ?? 0)).toBeLessThan(760)
    expect(hovered?.body.y).toBeLessThan(160)
    expect(hovered?.body.h).toBeGreaterThan(300)
    if (!hovered) return
    const lines = tooltipTextLines(frame, hovered.body, hovered.icon)
    expect(lines.length).toBeGreaterThan(8)
    expect(lines.every((line) => line.x + line.w < hovered.body.x + hovered.body.w + 4)).toBe(true)
    expect(lines.some((line) => line.y < hovered.icon.y && line.x > hovered.icon.x)).toBe(true)
    const cape = image(36, 36, [62, 44, 30])
    blitCenter(cape, cropImage(frame, hovered.icon))
    const ring = image(36, 36, [62, 44, 30])
    fillRect(ring, 8, 8, 18, 18, [214, 170, 40])
    const match = matchSlotIcon(frame, hovered.icon, [
      { id: 'cape', image: cape },
      { id: 'ring1', image: ring },
    ])
    expect(match).toMatchObject({ status: 'matched', id: 'cape' })
  })
})

describe('user shots from 2026-10-15', () => {
  const fixtureDir = fileURLToPath(new URL('./fixtures/', import.meta.url))
  const tooltipShot = `${fixtureDir}tooltip-shot.png`
  const boardShot = `${fixtureDir}board-shot.png`

  it('reads the cape tooltip and still finds the equipment window', () => {
    if (!existsSync(tooltipShot)) return
    const frame = decodePng(readFileSync(tooltipShot))
    const hovered = readHoveredTooltip(frame)
    const located = locateEquipmentWindow(frame)
    const lines = hovered ? tooltipTextLines(frame, hovered.body, hovered.icon) : []
    expect(hovered?.stars).toBe(18)
    expect(hovered?.name?.w ?? 0).toBeGreaterThan(40)
    expect((hovered?.body.x ?? 0) + (hovered?.body.w ?? 999)).toBeLessThan(760)
    expect(lines.length).toBeGreaterThan(8)
    expect(located?.slots.filter((slot) => slot.state === 'filled').length ?? 0).toBeGreaterThan(12)
    const cape = located?.slots.find((slot) => slot.id === 'cape')
    expect(cape?.state).toBe('filled')
    expect(cape?.x ?? 999).toBeLessThan(hovered?.icon.x ?? 0)
    const again = locateEquipmentWindow(frame)
    expect(again?.grid).toEqual(located?.grid)
    expect(readHoveredTooltip(frame)?.stars).toBe(18)
  })

  it('finds the equipment window when no tooltip is open', () => {
    if (!existsSync(boardShot)) return
    const frame = decodePng(readFileSync(boardShot))
    const hovered = readHoveredTooltip(frame, { x: 430, y: 400 })
    const located = locateEquipmentWindow(frame)
    expect(hovered).toBeNull()
    expect(located?.slots.filter((slot) => slot.state === 'filled').length ?? 0).toBeGreaterThan(18)
    expect(located?.characterVisible).toBe(true)
    expect(located?.presetIndex, JSON.stringify(located?.grid)).toBe(1)
    expect(locateEquipmentWindow(frame)?.grid).toEqual(located?.grid)
  })
})

describe('real equipment screenshot', () => {
  it('finds the in-game equipment window', () => {
    if (!existsSync(realShot)) return
    const reading = locateEquipmentWindow(decodePng(readFileSync(realShot)))
    expect(reading?.slots.find((slot) => slot.id === 'ring1')?.state).toBe('filled')
    expect(reading?.slots.find((slot) => slot.id === 'weapon')?.state).toBe('filled')
    expect(reading?.slots.filter((slot) => slot.state === 'filled').length).toBeGreaterThan(18)
    expect(reading?.characterVisible).toBe(true)
    expect(reading?.presetIndex).toBe(1)
  })

  it('finds the equipment window inside a wide browser viewport with sidebar elements', () => {
    const win = sampleWindow()
    const browser = image(960, 440, [246, 246, 246])
    const offsetX = 280
    const offsetY = 40
    for (let y = 0; y < win.height; y += 1) {
      for (let x = 0; x < win.width; x += 1) {
        const src = (y * win.width + x) * 4
        const dst = ((offsetY + y) * browser.width + (offsetX + x)) * 4
        browser.data[dst] = win.data[src] ?? 0
        browser.data[dst + 1] = win.data[src + 1] ?? 0
        browser.data[dst + 2] = win.data[src + 2] ?? 0
        browser.data[dst + 3] = 255
      }
    }
    // Sidebar icon aligned with the weapon row to the left of the equipment window
    fillRect(browser, 40, offsetY + ORIGIN_Y + 4 * PITCH, SIZE, SIZE, [60, 80, 120])
    const reading = locateEquipmentWindow(browser)
    expect(reading).not.toBeNull()
    expect(reading?.grid.originX).toBe(offsetX + ORIGIN_X)
    expect(reading?.grid.originY).toBe(offsetY + ORIGIN_Y)
    expect(reading?.slots.filter((slot) => slot.state === 'filled').length).toBe(25)
  })
})

describe('2026-10-17 JPEG capture regressions', () => {
  const fixture = (stamp: string) => decodePng(readFileSync(
    new URL(`./fixtures/capture-${stamp}.png`, import.meta.url),
  ))
  it('locates the real 45px inventory grid instead of the portrait background', () => {
    const found = locateEquipmentWindow(fixture('181657'))
    expect(found?.grid.originX).toBeCloseTo(256, 0)
    expect(found?.grid.pitch).toBeCloseTo(45, 0)
    expect(found?.slots.find((slot) => slot.id === 'cape')?.x).toBeGreaterThan(520)
    expect(readHoveredTooltip(fixture('181657'))).toBeNull()
  })
  it.each([
    ['181659', 18, 568, 875],
    ['181703', 17, 346, 653],
    ['181706', 0, 300, 606],
  ] as const)('reads %s including starless items without the adjacent set panel', (stamp, stars, iconX, right) => {
    const frame = fixture(stamp)
    const tip = readHoveredTooltip(frame, null)
    expect(tip).not.toBeNull()
    expect(tip?.stars).toBe(stars)
    expect(tip?.icon.x).toBeCloseTo(iconX, 0)
    if (!tip) return
    expect(tip.body.x + tip.body.w).toBeLessThanOrEqual(right)
    const lines = tooltipTextLines(frame, tip.body, tip.icon)
    expect(lines.some((line) => line.y > (stamp === '181703' ? 720 : 650))).toBe(true)
    expect(lines.every((line) => line.x + line.w <= right)).toBe(true)
  })
})
