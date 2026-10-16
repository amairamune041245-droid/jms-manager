import { describe, expect, it } from 'vitest'
import { fieldReady, readMarks } from './readCoverage.ts'
import type { EquipmentItem } from './types.ts'

function item(patch: Partial<EquipmentItem>): EquipmentItem {
  return {
    id: 'capture:c:1:cape',
    name: 'マント',
    slotGroup: 'cape',
    stats: [],
    starForce: null,
    enhanceText: '',
    potentials: [],
    additionalPotentials: [],
    imageDataUrl: null,
    notes: '画面から読み取り',
    createdAt: 'now',
    updatedAt: 'now',
    ...patch,
  }
}

describe('readMarks', () => {
  it('marks the slot label and the placeholder note as unread', () => {
    expect(readMarks(item({}), 'マント')).toEqual({
      got: [],
      missing: ['名前', '★', '能力値', '潜在', 'アディショナル', 'メモ'],
    })
    const read = item({
      name: 'キノコメイジケープ',
      starForce: 18,
      stats: [{ label: 'INT', value: '+48' }],
      notes: '交換不可',
    })
    expect(fieldReady(read, 'マント', 'name')).toBe(true)
    expect(fieldReady(read, 'マント', 'stars')).toBe(true)
    expect(fieldReady(read, 'マント', 'stats')).toBe(true)
    expect(fieldReady(read, 'マント', 'potentials')).toBe(false)
    expect(readMarks(read, 'マント').missing).toEqual(['潜在', 'アディショナル'])
  })
})
