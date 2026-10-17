export const SLOT_GROUPS = [
  { id: 'hat', label: '帽子' },
  { id: 'face', label: '顔飾り' },
  { id: 'eye', label: '眼飾り' },
  { id: 'earring', label: '耳飾り' },
  { id: 'top', label: '上着' },
  { id: 'bottom', label: '下衣' },
  { id: 'overall', label: '全身' },
  { id: 'shoes', label: '靴' },
  { id: 'gloves', label: '手袋' },
  { id: 'cape', label: 'マント' },
  { id: 'shoulder', label: '肩飾り' },
  { id: 'weapon', label: '武器' },
  { id: 'subWeapon', label: '補助武器' },
  { id: 'emblem', label: 'エンブレム' },
  { id: 'pendant', label: 'ペンダント' },
  { id: 'ring', label: '指輪' },
  { id: 'pocket', label: 'ポケット' },
  { id: 'belt', label: 'ベルト' },
  { id: 'medal', label: 'メダル' },
  { id: 'badge', label: 'バッジ' },
  { id: 'heart', label: 'ハート' },
  { id: 'android', label: 'アンドロイド' },
  { id: 'androidHeart', label: 'アンドロイドハート' },
  { id: 'title', label: '称号' },
] as const

export type EquipmentSlotGroup = (typeof SLOT_GROUPS)[number]['id']

/** Slot identity. Display coordinates live in equipmentLayout.ts and are keyed by id. */
export const EQUIPMENT_SLOTS = [
  { id: 'ring1', label: '指輪1', group: 'ring' },
  { id: 'ring2', label: '指輪2', group: 'ring' },
  { id: 'ring3', label: '指輪3', group: 'ring' },
  { id: 'ring4', label: '指輪4', group: 'ring' },
  { id: 'badge', label: '顔飾り', group: 'face' },
  { id: 'face', label: '目飾り', group: 'eye' },
  { id: 'earring', label: '耳飾り', group: 'earring' },
  { id: 'pendant2', label: 'ペンダント2', group: 'pendant' },
  { id: 'pendant1', label: 'ペンダント1', group: 'pendant' },
  { id: 'hat', label: '帽子', group: 'hat' },
  { id: 'top', label: '上着', group: 'top' },
  { id: 'bottom', label: '下衣', group: 'bottom' },
  { id: 'shoulder', label: '肩飾り', group: 'shoulder' },
  { id: 'cape', label: 'マント', group: 'cape' },
  { id: 'gloves', label: '手袋', group: 'gloves' },
  { id: 'shoes', label: '靴', group: 'shoes' },
  { id: 'medal', label: 'バッジ', group: 'badge' },
  { id: 'belt', label: 'ベルト', group: 'belt' },
  { id: 'weapon', label: '武器', group: 'weapon' },
  { id: 'subWeapon', label: '補助武器', group: 'subWeapon' },
  { id: 'emblem', label: 'エンブレム', group: 'emblem' },
  { id: 'android', label: 'アンドロイド', group: 'android' },
  { id: 'heart', label: 'ハート', group: 'heart' },
  { id: 'pocket', label: 'ポケット', group: 'pocket' },
  { id: 'androidHeart', label: 'アンドロイドハート', group: 'androidHeart' },
] as const

export type EquipmentSlotId = (typeof EQUIPMENT_SLOTS)[number]['id']

export function slotById(id: EquipmentSlotId) {
  const slot = EQUIPMENT_SLOTS.find((entry) => entry.id === id)
  if (!slot) throw new Error(`未知のスロット: ${id}`)
  return slot
}

export function isEquipmentSlotId(value: string): value is EquipmentSlotId {
  return EQUIPMENT_SLOTS.some((slot) => slot.id === value)
}

export function isSlotGroup(value: string): value is EquipmentSlotGroup {
  return SLOT_GROUPS.some((group) => group.id === value)
}

export function labelForSlotGroup(group: EquipmentSlotGroup): string {
  return SLOT_GROUPS.find((entry) => entry.id === group)?.label ?? group
}

