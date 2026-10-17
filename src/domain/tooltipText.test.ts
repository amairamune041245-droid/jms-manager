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

  it('recognizes JMS potential phrasing for boss damage, IED, all stat, cooldown, and drop/meso', () => {
    const detail = parseTooltipLines([
      'オールステータス +40 (10+30)',
      '潜在能力 レジェンダリー',
      'ボスモンスター攻撃時のダメージ +40%',
      'モンスター防御率無視 +35%',
      'ダメージ +9%',
      'アディショナル潜在能力 レジェンダリー',
      'すべてのスキルの再使用待機時間 -2秒',
      'アイテムドロップ率 +20%',
      'メル獲得量 +20%',
    ])
    expect(detail.stats).toEqual([{ label: '全ステータス', value: '+40(10+30)' }])
    expect(detail.potentials.map((line) => line.text)).toEqual([
      'ボスダメージ +40%',
      '防御率無視 +35%',
      'ダメージ +9%',
    ])
    expect(detail.additionalPotentials.map((line) => line.text)).toEqual([
      '再使用待機時間 -2秒',
      'アイテムドロップ率 +20%',
      'メル獲得量 +20%',
    ])
  })

  it('parses spaced Windows Japanese OCR output and recovers bitmap font confusions', () => {
    const detail = parseTooltipLines([
      'キ ノ コ メ イ ジ ケ ー ブ',
      '文 機 不 可',
      '現 在 装 着 中 の 装 備',
      'STR 448 ( 15 433 )',
      'DEX 448 05 ・ 33 )',
      '】 N 「 4230 い 5 ・ 73 4 間 ・ 7 つ',
      'LUK ロ 2 05 ・ 73 ・ 24 )',
      '全 ス テ タ ス 新 、 ( 新 め',
      '・ 最 大 お P 4 新 ( 0 ・ 255 ・ い 純 )',
      '教 望 カ ・ 32 ( 2 + 30 )',
      '. 第 カ ・ 39 ( 2 4-30 ・ 一 ・ 0',
      '防 御 カ 48 矼 ( 250 ・ 5 に ・ 105 )',
      'ー ス タ ー フ ォ ー ス 文 各 . 「 追 加 オ プ シ ン 化 不 可',
      '替 在 力 ユ ニ ー ク ( 追 加 強 化 不 可 )',
      '・ DIT ← 驀',
      '・ DIT ← 6 第',
      '0 ア デ ィ シ ョ ナ ル 在 能 力 工 ビ ッ ク ( 加 強 化 不 可 )',
      '. r•lT ← 4 第',
      '・ ま カ 70',
    ])
    expect(detail.stats.map((line) => `${line.label} ${line.value}`)).toEqual([
      'STR +48(15+33)',
      'DEX +48(15+33)',
      'INT +230(15+73+70+72)',
      'LUK +112(15+73+24)',
      '全ステータス +6%',
      '最大HP +1445(0+255+1190)',
      '攻撃力 +32(2+30)',
      '魔力 +39(2+30+1+6)',
      '防御力 +867(250+512+105)',
    ])
    expect(detail.potentials.map((line) => line.text)).toEqual(['INT +9%', 'INT +6%'])
    expect(detail.additionalPotentials.map((line) => line.text)).toEqual(['INT +4%', '魔力 +10'])
    expect(detail.notes).toContain('交換不可')
    expect(detail.notes).toContain('現在装着中の装備')
    expect(detail.notes).toContain('潜在能力: ユニーク')
    expect(detail.notes).toContain('アディショナル潜在能力: エピック')
  })
})
