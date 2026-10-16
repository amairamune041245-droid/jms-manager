import type { EquipmentItem } from './types.ts'

export const READ_LABELS = {
  name: '名前',
  stars: '★',
  stats: '能力値',
  potentials: '潜在',
  additional: 'アディショナル',
  notes: 'メモ',
} as const

export type ReadField = keyof typeof READ_LABELS

const PLACEHOLDER_NOTE = '画面から読み取り'

export function fieldReady(item: EquipmentItem, slotLabel: string, field: ReadField): boolean {
  if (field === 'name') return item.name.trim().length > 0 && item.name !== slotLabel
  if (field === 'stars') return item.starForce !== null
  if (field === 'stats') return item.stats.length > 0
  if (field === 'potentials') return item.potentials.length > 0
  if (field === 'additional') return item.additionalPotentials.length > 0
  return item.notes.trim().length > 0 && item.notes !== PLACEHOLDER_NOTE
}

export function readMarks(item: EquipmentItem, slotLabel: string): { got: string[]; missing: string[] } {
  const got: string[] = []
  const missing: string[] = []
  for (const field of Object.keys(READ_LABELS) as ReadField[]) {
    const label = READ_LABELS[field]
    if (fieldReady(item, slotLabel, field)) got.push(label)
    else missing.push(label)
  }
  return { got, missing }
}
