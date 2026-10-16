import { describe, expect, it } from 'vitest'
import { emptyGachaPool, gachaRate, gachaTrials, mergeGachaCounts, recordGachaItems } from './gacha.ts'

describe('gacha tally', () => {
  it('counts confirmed items immediately and merges another tally', () => {
    const pool = recordGachaItems(emptyGachaPool('p', 'いまのガチャ'), ['椅子', ' 椅子 ', '', 'ダメージスキン'])
    expect(gachaTrials(pool)).toBe(3)
    expect(pool.counts).toEqual([
      { name: '椅子', count: 2 },
      { name: 'ダメージスキン', count: 1 },
    ])
    expect(gachaRate(2, gachaTrials(pool))).toBeCloseTo(2 / 3)
    const merged = mergeGachaCounts(pool, [{ name: '椅子', count: 4 }])
    expect(merged.counts[0]).toEqual({ name: '椅子', count: 6 })
    expect(gachaTrials(merged)).toBe(7)
  })
})
