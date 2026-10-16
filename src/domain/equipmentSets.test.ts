import { describe, expect, it } from 'vitest'
import { activeEquipmentSets, matchItemName, slotGroupForItem, totalSetBonuses } from './equipmentSets.ts'
import type { SetPiece } from './equipmentSets.ts'

function pieces(names: [string, SetPiece['slotGroup']][]): SetPiece[] {
  return names.map(([name, slotGroup]) => ({ name, slotGroup }))
}

describe('active equipment sets', () => {
  it('stacks every reached tier and leaves the next one off', () => {
    const sets = activeEquipmentSets(
      pieces([
        ['ハイネスダンウィッチハット', 'hat'],
        ['イーグルアイダンウィッチローブ', 'top'],
        ['トリックスターダンウィッチパンツ', 'bottom'],
      ]),
    )
    expect(sets.map((set) => set.name)).toEqual(['ルートアビスセット'])
    expect(sets[0]?.activeTiers.map((tier) => tier.count)).toEqual([2, 3])
    expect(sets[0]?.nextCount).toBe(4)
  })

  it('counts a silver wolf weapon as two sengoku pieces', () => {
    const sets = activeEquipmentSets(
      pieces([
        ['スサノオグローブ', 'gloves'],
        ['銀狼の剣', 'weapon'],
      ]),
    )
    expect(sets[0]).toMatchObject({ name: '戦国セット', count: 3, nextCount: 4 })
    expect(sets[0]?.activeTiers.map((tier) => tier.count)).toEqual([2, 3])
  })

  it('does not mix verus grades or count a fafnir blade', () => {
    const mixed = activeEquipmentSets(
      pieces([
        ['ヴェラッドリング(最上級)', 'ring'],
        ['ヴェラッドイヤリング(上級)', 'earring'],
      ]),
    )
    expect(mixed.map((set) => [set.name, set.count])).toEqual([
      ['ヴェラッドセット（最上級）', 1],
      ['ヴェラッドセット（上級）', 1],
    ])
    expect(mixed.every((set) => set.activeTiers.length === 0)).toBe(true)

    expect(
      activeEquipmentSets(pieces([['ファフニールラピッドフエッジ', 'subWeapon']])),
    ).toEqual([])
  })

  it('turns the mushroom armor into the in-game set', () => {
    const sets = activeEquipmentSets(
      pieces([
        ['キノコダンウィッチハット', 'hat'],
        ['キノコダンウィッチローブ', 'top'],
        ['キノコダンウィッチパンツ', 'bottom'],
        ['キノコメイジシューズ', 'shoes'],
        ['キノコメイジグローブ', 'gloves'],
        ['キノコメイジケープ', 'cape'],
        ['キノコメイジショルダー', 'shoulder'],
      ]),
    )
    expect(sets[0]?.name).toBe('キノコ装備セット')
    expect(sets[0]?.count).toBe(7)
    expect(sets[0]?.activeTiers.at(-1)?.lines).toContain('ボス攻撃時ダメージ +10%')
  })

  it('ignores a captured slot that is still named after the slot', () => {
    expect(activeEquipmentSets(pieces([['マント', 'cape']]))).toEqual([])
  })

  it('snaps a slightly misread tooltip name to the catalog', () => {
    expect(matchItemName('キ ノ コ ノ イ ジ ケ ー プ')).toBe('キノコメイジケープ')
    expect(matchItemName('交換不可')).toBeNull()
    expect(slotGroupForItem('キノコメイジケープ')).toBe('cape')
    expect(slotGroupForItem('キノコダンウィッチローブ')).toBe('top')
    expect(slotGroupForItem('ヴェラッドイヤリング(最上級)')).toBe('earring')
    expect(slotGroupForItem('ヴェラッドリング(最上級)')).toBe('ring')
  })

  it('adds the active tiers into one total', () => {
    const sets = activeEquipmentSets(
      pieces([
        ['キノコダンウィッチハット', 'hat'],
        ['キノコダンウィッチローブ', 'top'],
        ['キノコダンウィッチパンツ', 'bottom'],
        ['キノコメイジシューズ', 'shoes'],
        ['キノコメイジグローブ', 'gloves'],
        ['キノコメイジケープ', 'cape'],
        ['キノコメイジショルダー', 'shoulder'],
      ]),
    )
    const total = totalSetBonuses(sets)
    expect(total.find((bonus) => bonus.key === 'all')?.amount).toBe(50)
    expect(total.find((bonus) => bonus.key === 'attack')?.amount).toBe(140)
    expect(total.find((bonus) => bonus.key === 'boss%')?.amount).toBe(30)
    expect(total.find((bonus) => bonus.key === 'hp')?.amount).toBe(4000)
  })
})
