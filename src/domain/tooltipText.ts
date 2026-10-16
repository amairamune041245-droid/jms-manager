import type { PotentialLine, StatLine } from './types.ts'

export type TooltipDetails = {
  stats: StatLine[]
  enhanceText: string
  potentials: PotentialLine[]
  additionalPotentials: PotentialLine[]
  notes: string
}

const STAT_LABELS = [
  '全ステータス',
  '最大HP',
  '最大MP',
  'クリティカルダメージ',
  'ボスダメージ',
  '防御率無視',
  '攻撃力',
  '防御力',
  '移動速度',
  'ジャンプ力',
  '魔力',
  'STR',
  'DEX',
  'INT',
  'LUK',
  'HP',
  'MP',
]

const RANKS = ['レジェンダリー', 'ユニーク', 'エピック', 'レア']

const NOTE_KEYS = ['交換', '期限', '要求', '装着', '着用', '装備セット', '延長', 'アカウント']

function compactLine(raw: string): string {
  return raw.normalize('NFKC').replace(/\s+/g, '').replace(/[・•●■□]/g, '')
}

function breakdown(tail: string): string {
  const matched = tail.match(/^[（(][0-9+%+＋.．]+[）)]/)
  if (!matched) return ''
  return matched[0].replace(/＋/g, '+').replace(/（/g, '(').replace(/）/g, ')').replace(/．/g, '.')
}

function readStat(line: string): StatLine | null {
  const compact = compactLine(line).toUpperCase()
  for (const label of STAT_LABELS) {
    const key = label.toUpperCase()
    const at = compact.indexOf(key)
    if (at < 0) continue
    const after = compact.slice(at + key.length)
    const number = after.match(/(\d+)(%?)/)
    if (!number || number.index === undefined) return null
    const tail = after.slice(number.index + number[0].length)
    const extra = breakdown(tail)
    return { label, value: `+${number[1]}${number[2] ?? ''}${extra}` }
  }
  return null
}

/**
 * 説明から読んだ行を、能力値・潜在・メモに分ける。
 * 項目として読めない行は捨てる。
 */
export function parseTooltipLines(lines: string[]): TooltipDetails {
  const stats: StatLine[] = []
  const potentials: PotentialLine[] = []
  const additional: PotentialLine[] = []
  const enhance: string[] = []
  const notes: string[] = []
  let section: 'stats' | 'enhance' | 'potential' | 'additional' = 'stats'
  for (const raw of lines) {
    const compact = compactLine(raw)
    if (compact.length < 2) continue
    if (compact.includes('アディショナル')) {
      section = 'additional'
      const rank = RANKS.find((entry) => compact.includes(entry))
      if (rank) notes.push(`アディショナル潜在能力: ${rank}`)
      continue
    }
    if (compact.includes('潜在')) {
      section = 'potential'
      const rank = RANKS.find((entry) => compact.includes(entry))
      if (rank) notes.push(`潜在能力: ${rank}`)
      continue
    }
    if (compact.includes('スターフォース') || compact.includes('呪文書')) {
      section = 'enhance'
      enhance.push(compact)
      continue
    }
    if (compact.includes('装備セット') || compact.includes('セット効果')) {
      if (!notes.includes(compact)) notes.push(compact)
      continue
    }
    const stat = readStat(compact)
    if (stat) {
      if (section === 'potential' && potentials.length < 3) potentials.push({ text: `${stat.label} ${stat.value}` })
      else if (section === 'additional' && additional.length < 3) additional.push({ text: `${stat.label} ${stat.value}` })
      else if (section === 'stats' && !stats.some((entry) => entry.label === stat.label)) stats.push(stat)
      continue
    }
    if (NOTE_KEYS.some((key) => compact.includes(key)) && !notes.includes(compact)) notes.push(compact)
  }
  return {
    stats,
    enhanceText: enhance.join(' / '),
    potentials,
    additionalPotentials: additional,
    notes: notes.join('\n'),
  }
}

export function tooltipDetailSignature(detail: TooltipDetails): string {
  if (
    detail.stats.length === 0 &&
    detail.potentials.length === 0 &&
    detail.additionalPotentials.length === 0 &&
    detail.enhanceText.length === 0 &&
    detail.notes.length === 0
  ) {
    return ''
  }
  return JSON.stringify(detail)
}
