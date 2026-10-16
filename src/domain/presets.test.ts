import { describe, expect, it } from 'vitest'
import { EQUIPMENT_SLOTS } from './equipmentSlots.ts'
import { deleteItem, upsertItem } from './items.ts'
import {
  assignSlot,
  createDefaultLoadout,
  duplicatePreset,
  setActivePreset,
} from './presets.ts'
import { APP_DATA_VERSION } from './types.ts'
import type { AppData, EquipmentItem } from './types.ts'

function emptyData(): AppData {
  return {
    version: APP_DATA_VERSION,
    characters: [],
    items: [],
    loadoutsByCharacterId: {
      c1: createDefaultLoadout(),
    },
    hexaByCharacterId: {},
    statSheetsByCharacterId: {},
    bossClearsByCharacterId: {},
    gachaPools: [],
  }
}

function item(id: string, group: EquipmentItem['slotGroup']): EquipmentItem {
  return {
    id,
    name: id,
    slotGroup: group,
    stats: [],
    starForce: null,
    enhanceText: '',
    potentials: [],
    additionalPotentials: [],
    imageDataUrl: null,
    notes: '',
    createdAt: 't',
    updatedAt: 't',
  }
}

describe('presets', () => {
  it('keeps the same item in multiple presets', () => {
    let data = emptyData()
    data = {
      ...data,
      items: [item('hat-a', 'hat')],
    }
    data = assignSlot(data, 'c1', 'hat', 'hat-a')
    data = duplicatePreset(data, 'c1', 0, 1)
    expect(data.loadoutsByCharacterId.c1.presets[0].slots.hat).toBe('hat-a')
    expect(data.loadoutsByCharacterId.c1.presets[1].slots.hat).toBe('hat-a')
  })

  it('does not clear other presets when switching', () => {
    let data = emptyData()
    data = { ...data, items: [item('hat-a', 'hat'), item('hat-b', 'hat')] }
    data = assignSlot(data, 'c1', 'hat', 'hat-a')
    data = setActivePreset(data, 'c1', 1)
    data = assignSlot(data, 'c1', 'hat', 'hat-b')
    expect(data.loadoutsByCharacterId.c1.presets[0].slots.hat).toBe('hat-a')
    expect(data.loadoutsByCharacterId.c1.presets[1].slots.hat).toBe('hat-b')
    data = setActivePreset(data, 'c1', 0)
    expect(data.loadoutsByCharacterId.c1.activePresetIndex).toBe(0)
    expect(data.loadoutsByCharacterId.c1.presets[1].slots.hat).toBe('hat-b')
  })

  it('unassigns a deleted item from every preset', () => {
    let data = emptyData()
    data = {
      ...data,
      items: [item('ring-a', 'ring')],
    }
    data = assignSlot(data, 'c1', 'ring1', 'ring-a')
    data = duplicatePreset(data, 'c1', 0, 2)
    data = deleteItem(data, 'ring-a')
    for (const preset of data.loadoutsByCharacterId.c1.presets) {
      expect(preset.slots.ring1).toBeNull()
    }
    expect(data.items).toHaveLength(0)
  })

  it('rejects assigning an item to the wrong slot group', () => {
    let data = emptyData()
    data = { ...data, items: [item('hat-a', 'hat')] }
    data = assignSlot(data, 'c1', 'weapon', 'hat-a')
    expect(data.loadoutsByCharacterId.c1.presets[0].slots.weapon).toBeNull()
  })

  it('creates an item through upsertItem', () => {
    const data = upsertItem(emptyData(), {
      name: 'ファファント',
      slotGroup: 'hat',
      stats: [{ label: 'STR', value: '40' }],
      starForce: 22,
      enhanceText: '+12',
      potentials: [{ text: 'STR+12%' }],
      additionalPotentials: [],
      imageDataUrl: null,
      notes: '',
    }, { id: 'i1', now: 't' })
    expect(data.items[0]?.name).toBe('ファファント')
    expect(EQUIPMENT_SLOTS.length).toBe(28)
  })
})
