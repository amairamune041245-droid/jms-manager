import type { EquipmentSlotId } from './equipmentSlots.ts'

/**
 * Frames measured on the official JMS equipment window
 * (static.nexon.co.jp .../ver2025/preset1.png, 1677×2035).
 * Empty slots there are labeled RING / MEDAL / SUB WEAPON / EMBLEM / ANDROID / HEART / POCKET.
 * Values are fractions of the slot area, so the board scales without reflow.
 */
export const EQUIPMENT_BOARD = { width: 1432, height: 1223 }

export type SlotFrame = { x: number; y: number; w: number; h: number }

const SLOT_W = 195
const SLOT_H = 192
const COLS = [122, 328, 534, 741, 947, 1153, 1360]
const ROWS = [458, 663, 870, 1076, 1289, 1489]
const ORIGIN_X = 122
const ORIGIN_Y = 458

function frame(column: number, row: number): SlotFrame {
  return {
    x: (COLS[column]! - ORIGIN_X) / EQUIPMENT_BOARD.width,
    y: (ROWS[row]! - ORIGIN_Y) / EQUIPMENT_BOARD.height,
    w: SLOT_W / EQUIPMENT_BOARD.width,
    h: SLOT_H / EQUIPMENT_BOARD.height,
  }
}

/** Portrait covers columns 2–4 and rows 0–3, stopping above the weapon row. */
export const EQUIPMENT_CHARACTER: SlotFrame = {
  x: (534 - ORIGIN_X) / EQUIPMENT_BOARD.width,
  y: 0,
  w: (1142 - 534) / EQUIPMENT_BOARD.width,
  h: (1270 - ORIGIN_Y) / EQUIPMENT_BOARD.height,
}

export const EQUIPMENT_SLOT_FRAMES = {
  ring1: frame(0, 0),
  ring2: frame(0, 1),
  ring3: frame(0, 2),
  ring4: frame(0, 3),
  belt: frame(0, 4),
  pocket: frame(0, 5),
  badge: frame(1, 0),
  face: frame(1, 1),
  earring: frame(1, 2),
  pendant2: frame(1, 3),
  pendant1: frame(1, 4),
  weapon: frame(2, 4),
  subWeapon: frame(3, 4),
  emblem: frame(4, 4),
  hat: frame(5, 0),
  top: frame(5, 1),
  bottom: frame(5, 2),
  shoulder: frame(5, 3),
  android: frame(5, 4),
  cape: frame(6, 0),
  gloves: frame(6, 1),
  shoes: frame(6, 2),
  medal: frame(6, 3),
  heart: frame(6, 4),
  androidHeart: frame(6, 5),
} as const satisfies Record<string, SlotFrame>

export type PaperdollSlotId = keyof typeof EQUIPMENT_SLOT_FRAMES

/** JMSにない称号・眼飾り・全身の追加欄は表示しない。 */
export const DOCK_SLOT_IDS = [] as const satisfies readonly EquipmentSlotId[]

export function isPaperdollSlot(id: EquipmentSlotId): id is PaperdollSlotId {
  return id in EQUIPMENT_SLOT_FRAMES
}

export function frameStyle(frame: SlotFrame): {
  left: string
  top: string
  width: string
  height: string
} {
  return {
    left: `${frame.x * 100}%`,
    top: `${frame.y * 100}%`,
    width: `${frame.w * 100}%`,
    height: `${frame.h * 100}%`,
  }
}

