import { describe, expect, it } from 'vitest'
import { parseTooltipLines, tooltipDetailSignature } from './tooltipText.ts'

describe('parseTooltipLines', () => {
  it('keeps only lines that match a known item field', () => {
    const detail = parseTooltipLines([
      'キノコメイジケープ',
      'STR +48 (15+33)',
      'INT +12 (15+72+42)',
      '最大HP +1446 (0+256+1190)',
      '魔力 +39',
      '読み取れない文字',
      '交換不可',
      '現在装着中の装備',
      'スターフォース 呪文の書',
      '潜在能力 ユニーク',
      'INT +6%',
      '攻撃力 +12',
      'アディショナル潜在能力 エピック',
      'DEX +3%',
      '3セット効果攻撃力+20',
    ])
    expect(detail.stats.map((line) => `${line.label} ${line.value}`)).toEqual([
      'STR +48(15+33)',
      'INT +12(15+72+42)',
      '最大HP +1446(0+256+1190)',
      '魔力 +39',
    ])
    expect(detail.enhanceText).toContain('スターフォース')
    expect(detail.potentials.map((line) => line.text)).toEqual(['INT +6%', '攻撃力 +12'])
    expect(detail.additionalPotentials.map((line) => line.text)).toEqual(['DEX +3%'])
    expect(detail.notes).toContain('潜在能力: ユニーク')
    expect(detail.notes).toContain('アディショナル潜在能力: エピック')
    expect(detail.notes).toContain('交換不可')
    expect(detail.notes).toContain('現在装着中の装備')
    expect(detail.notes).not.toContain('読み取れない')
    expect(detail.notes).toContain('3セット効果攻撃力+20')
    expect(detail.stats.some((line) => line.value === '+20')).toBe(false)
    expect(tooltipDetailSignature(parseTooltipLines(['???']))).toBe('')
  })
})
