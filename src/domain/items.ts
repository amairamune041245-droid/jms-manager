import { EQUIPMENT_SLOTS } from './equipmentSlots.ts'
import type { EquipmentSlotGroup, EquipmentSlotId } from './equipmentSlots.ts'
import type {
  AppData,
  EquipmentItem,
  EquipmentItemInput,
  EquipmentPreset,
} from './types.ts'

const NAME_MAX = 40

export type ItemFormErrors = {
  name?: string
  starForce?: string
}

export function emptyItemInput(
  slotGroup: EquipmentSlotGroup,
): EquipmentItemInput {
  return {
    name: '',
    slotGroup,
    stats: [],
    starForce: null,
    enhanceText: '',
    potentials: [{ text: '' }, { text: '' }, { text: '' }],
    additionalPotentials: [{ text: '' }, { text: '' }, { text: '' }],
    imageDataUrl: null,
    notes: '',
  }
}

export function itemToInput(item: EquipmentItem): EquipmentItemInput {
  return {
    name: item.name,
    slotGroup: item.slotGroup,
    stats: item.stats.map((line) => ({ ...line })),
    starForce: item.starForce,
    enhanceText: item.enhanceText,
    potentials: padLines(item.potentials),
    additionalPotentials: padLines(item.additionalPotentials),
    imageDataUrl: item.imageDataUrl,
    notes: item.notes,
  }
}

export function validateItemInput(
  input: EquipmentItemInput,
): { ok: true; value: EquipmentItemInput } | { ok: false; errors: ItemFormErrors } {
  const errors: ItemFormErrors = {}
  const name = input.name.trim()
  if (name.length === 0) errors.name = '装備名を入力してください'
  else if ([...name].length > NAME_MAX) {
    errors.name = '装備名は40文字以内で入力してください'
  }

  if (
    input.starForce !== null &&
    (!Number.isSafeInteger(input.starForce) || input.starForce < 0)
  ) {
    errors.starForce = '星力は0以上の整数で入力してください'
  }

  if (errors.name || errors.starForce) return { ok: false, errors }

  return {
    ok: true,
    value: {
      ...input,
      name,
      enhanceText: input.enhanceText.trim(),
      notes: input.notes.trim(),
      stats: input.stats
        .map((line) => ({
          label: line.label.trim(),
          value: line.value.trim(),
        }))
        .filter((line) => line.label.length > 0 || line.value.length > 0),
      potentials: compactLines(input.potentials),
      additionalPotentials: compactLines(input.additionalPotentials),
    },
  }
}

export function upsertItem(
  data: AppData,
  input: EquipmentItemInput,
  meta: { id: string; now: string; existing?: EquipmentItem },
): AppData {
  const item: EquipmentItem = {
    id: meta.id,
    name: input.name,
    slotGroup: input.slotGroup,
    stats: input.stats,
    starForce: input.starForce,
    enhanceText: input.enhanceText,
    potentials: input.potentials,
    additionalPotentials: input.additionalPotentials,
    imageDataUrl: input.imageDataUrl,
    notes: input.notes,
    createdAt: meta.existing?.createdAt ?? meta.now,
    updatedAt: meta.now,
  }

  const exists = data.items.some((entry) => entry.id === item.id)
  return {
    ...data,
    items: exists
      ? data.items.map((entry) => (entry.id === item.id ? item : entry))
      : [...data.items, item],
  }
}

export function deleteItem(data: AppData, itemId: string): AppData {
  return {
    ...data,
    items: data.items.filter((item) => item.id !== itemId),
    loadoutsByCharacterId: Object.fromEntries(
      Object.entries(data.loadoutsByCharacterId).map(([characterId, loadout]) => [
        characterId,
        {
          ...loadout,
          presets: loadout.presets.map((preset) =>
            unassignItem(preset, itemId),
          ) as CharacterLoadoutPresets,
        },
      ]),
    ),
  }
}

export function findItem(
  data: AppData,
  itemId: string | null | undefined,
): EquipmentItem | undefined {
  if (!itemId) return undefined
  return data.items.find((item) => item.id === itemId)
}

export function itemsForSlotGroup(
  data: AppData,
  group: EquipmentSlotGroup,
): EquipmentItem[] {
  return data.items.filter((item) => item.slotGroup === group)
}

export function itemFitsSlot(
  item: EquipmentItem,
  slotId: EquipmentSlotId,
): boolean {
  const slot = EQUIPMENT_SLOTS.find((entry) => entry.id === slotId)
  return slot?.group === item.slotGroup
}

function unassignItem(preset: EquipmentPreset, itemId: string): EquipmentPreset {
  const slots = { ...preset.slots }
  for (const slot of EQUIPMENT_SLOTS) {
    if (slots[slot.id] === itemId) slots[slot.id] = null
  }
  return { ...preset, slots }
}

function padLines(lines: { text: string }[]): { text: string }[] {
  const next = lines.map((line) => ({ text: line.text }))
  while (next.length < 3) next.push({ text: '' })
  return next.slice(0, 3)
}

function compactLines(lines: { text: string }[]): { text: string }[] {
  return lines
    .map((line) => ({ text: line.text.trim() }))
    .filter((line) => line.text.length > 0)
}

type CharacterLoadoutPresets = AppData['loadoutsByCharacterId'][string]['presets']
