import { EQUIPMENT_SLOTS } from './equipmentSlots.ts'
import type { EquipmentSlotId } from './equipmentSlots.ts'
import { itemFitsSlot } from './items.ts'
import type {
  AppData,
  CharacterLoadout,
  EquipmentPreset,
} from './types.ts'

export function createEmptySlots(): Record<EquipmentSlotId, string | null> {
  const slots = {} as Record<EquipmentSlotId, string | null>
  for (const slot of EQUIPMENT_SLOTS) slots[slot.id] = null
  return slots
}

export function createDefaultLoadout(): CharacterLoadout {
  return {
    activePresetIndex: 0,
    presets: [
      { name: 'プリセット1', slots: createEmptySlots() },
      { name: 'プリセット2', slots: createEmptySlots() },
      { name: 'プリセット3', slots: createEmptySlots() },
    ],
  }
}

export function loadoutForCharacter(
  data: AppData,
  characterId: string,
): CharacterLoadout {
  return data.loadoutsByCharacterId[characterId] ?? createDefaultLoadout()
}

export function activePreset(
  loadout: CharacterLoadout,
): EquipmentPreset {
  return loadout.presets[loadout.activePresetIndex]
}

export function setActivePreset(
  data: AppData,
  characterId: string,
  index: 0 | 1 | 2,
): AppData {
  const loadout = loadoutForCharacter(data, characterId)
  return putLoadout(data, characterId, {
    ...loadout,
    activePresetIndex: index,
  })
}

export function renamePreset(
  data: AppData,
  characterId: string,
  index: 0 | 1 | 2,
  name: string,
): AppData {
  const trimmed = name.trim()
  if (trimmed.length === 0) return data
  const loadout = loadoutForCharacter(data, characterId)
  const presets = [...loadout.presets] as CharacterLoadout['presets']
  presets[index] = { ...presets[index], name: trimmed.slice(0, 20) }
  return putLoadout(data, characterId, { ...loadout, presets })
}

export function duplicatePreset(
  data: AppData,
  characterId: string,
  fromIndex: 0 | 1 | 2,
  toIndex: 0 | 1 | 2,
): AppData {
  if (fromIndex === toIndex) return data
  const loadout = loadoutForCharacter(data, characterId)
  const source = loadout.presets[fromIndex]
  const presets = [...loadout.presets] as CharacterLoadout['presets']
  presets[toIndex] = {
    ...presets[toIndex],
    slots: { ...source.slots },
  }
  return putLoadout(data, characterId, { ...loadout, presets })
}

export function assignSlot(
  data: AppData,
  characterId: string,
  slotId: EquipmentSlotId,
  itemId: string | null,
): AppData {
  if (itemId) {
    const item = data.items.find((entry) => entry.id === itemId)
    if (!item || !itemFitsSlot(item, slotId)) return data
  }

  const loadout = loadoutForCharacter(data, characterId)
  const index = loadout.activePresetIndex
  const presets = [...loadout.presets] as CharacterLoadout['presets']
  presets[index] = {
    ...presets[index],
    slots: { ...presets[index].slots, [slotId]: itemId },
  }
  return putLoadout(data, characterId, { ...loadout, presets })
}

/** 画面キャプチャ連携用。名前から装備を用意して、今のプリセットのスロットへ入れる。 */
export function setEquipmentSlot(
  data: AppData,
  characterId: string,
  slotId: EquipmentSlotId,
  itemName: string | null,
  meta: { id: string; now: string },
): AppData {
  const name = itemName?.trim() ?? ''
  if (name.length === 0) return assignSlot(data, characterId, slotId, null)

  const slot = EQUIPMENT_SLOTS.find((entry) => entry.id === slotId)
  if (!slot) return data

  const existing = data.items.find(
    (item) => item.slotGroup === slot.group && item.name === name,
  )
  if (existing) return assignSlot(data, characterId, slotId, existing.id)

  const withItem: AppData = {
    ...data,
    items: [
      ...data.items,
      {
        id: meta.id,
        name,
        slotGroup: slot.group,
        stats: [],
        starForce: null,
        enhanceText: '',
        potentials: [],
        additionalPotentials: [],
        imageDataUrl: null,
        notes: '',
        createdAt: meta.now,
        updatedAt: meta.now,
      },
    ],
  }
  return assignSlot(withItem, characterId, slotId, meta.id)
}

function putLoadout(
  data: AppData,
  characterId: string,
  loadout: CharacterLoadout,
): AppData {
  return {
    ...data,
    loadoutsByCharacterId: {
      ...data.loadoutsByCharacterId,
      [characterId]: loadout,
    },
  }
}
