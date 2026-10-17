import type { PotentialLine, StatLine } from './types.ts'

export type TooltipDetails = {
  stats: StatLine[]
  enhanceText: string
  potentials: PotentialLine[]
  additionalPotentials: PotentialLine[]
  notes: string
}

const STAT_ALIASES: { match: string; label: string }[] = [
  { match: '全ステータス', label: '全ステータス' },
  { match: 'オールステータス', label: '全ステータス' },
  { match: '最大HP', label: '最大HP' },
  { match: 'MAXHP', label: '最大HP' },
  { match: '最大MP', label: '最大MP' },
  { match: 'MAXMP', label: '最大MP' },
  { match: 'クリティカルダメージ', label: 'クリティカルダメージ' },
  { match: 'クリティカル率', label: 'クリティカル率' },
  { match: 'ボスモンスター攻撃時のダメージ', label: 'ボスダメージ' },
  { match: 'ボス攻撃時ダメージ', label: 'ボスダメージ' },
  { match: 'ボスダメージ', label: 'ボスダメージ' },
  { match: 'モンスター防御率無視', label: '防御率無視' },
  { match: '防御率無視', label: '防御率無視' },
  { match: 'アイテムドロップ率', label: 'アイテムドロップ率' },
  { match: 'メル獲得量', label: 'メル獲得量' },
  { match: 'ダメージ', label: 'ダメージ' },
  { match: '攻撃力', label: '攻撃力' },
  { match: '防御力', label: '防御力' },
  { match: '移動速度', label: '移動速度' },
  { match: 'ジャンプ力', label: 'ジャンプ力' },
  { match: '魔力', label: '魔力' },
  { match: 'STR', label: 'STR' },
  { match: 'DEX', label: 'DEX' },
  { match: 'INT', label: 'INT' },
  { match: 'LUK', label: 'LUK' },
  { match: 'HP', label: 'HP' },
  { match: 'MP', label: 'MP' },
]

const RANKS: { match: RegExp; rank: string }[] = [
  { match: /レジェンダリ/, rank: 'レジェンダリー' },
  { match: /ユニー[クウ]/, rank: 'ユニーク' },
  { match: /[エェ工][ビピ][ッン][クウ]/, rank: 'エピック' },
  { match: /レア/, rank: 'レア' },
]

const NOTE_KEYS = ['交換', '期限', '要求', '装着', '着用', '装備セット', '延長', 'アカウント']

function compactLine(raw: string): string {
  const pre = raw
    .normalize('NFKC')
    // Restore '(' when '(15' was misread as ' 05 ' or ' い5 ' before '...)'
    .replace(/\s+(?:05|い\s*5)(?=\s*[・•●+＋↓←~\d].*[)）つ])/g, '(15')
    // Convert ' 4' (misread '+') after opening paren number: '( 15 433 )' -> '(15+33)'
    .replace(/([（(]\s*\d+)\s+4(?=\d{2}\s*[)）])/g, '$1+')
    // Convert '4-30' / '4・30' (misread '+30') inside parens to '+30'
    .replace(/(?<=\d)\s*4[-ー・]\s*(?=\d)/g, '+')
    // Convert bullets/dots between digits into '+' inside breakdowns
    .replace(/(?<=\d|[一])\s*[・•●、↓←~]\s*(?=\d|[にーいロ日一])/g, '+')
  return pre.replace(/\s+/g, '').replace(/[・•●■□]/g, '')
}

function normalizeOcrLine(compact: string): string {
  return compact
    .replace(/^[.．,、0〇ロ「】・]+/, '')
    .replace(/(?:文機|交機)不可/g, '交換不可')
    .replace(/全ス[テデ]ー*タス/g, '全ステータス')
    .replace(/(?:最大おP|最大-HP|最大一HP|最[RI*TH人]HP|最人[ト日]P|R[RIT]HP)/gi, '最大HP')
    .replace(/(?:最[RI*TH]MP|R[RIT]MP)/gi, '最大MP')
    .replace(/^(?:OEX|0EX|0[をモ]X|C[IJ]E%|ロE[Xン:]?|\(E\)<)/i, 'DEX')
    .replace(/^(?:DIT|BIT|R[•・]?[L4Å]T|】?N「|】ト|「?INT|難?訂-|難?・?\+|新(?=[+4]?\d{2,3}[(い0]))/i, 'INT')
    .replace(/^(?:LLIK|L![J」]K|[い!]」K)/i, 'LUK')
    .replace(/^(?:攻撃カ|教[望整生]?[カ力]|教望ア\)|[望孳]カ|撃[力1])/g, '攻撃力')
    .replace(/^(?:魔カ|[度屋盛第ま磨][カ力]|直ア\)|を[カ力])/g, '魔力')
    .replace(/^(?:防御カ|[あ男]御[カ力)]?|あ御プ\)|あ\)|御カ|新郁カ)/g, '防御力')
}

function parseParenSum(tail: string): { strictText: string; syntheticText: string; sum: number | null } {
  const cleaned = tail
    .replace(/^い5/, '(15+')
    .replace(/^05/, '(15+')
    .replace(/^[（(]ー5/, '(15')
  const open = cleaned.match(/^[（(]([^）)]+)[）)]?/)
  if (!open?.[1]) return { strictText: '', syntheticText: '', sum: null }
  const body = open[1]
    .replace(/＋/g, '+')
    .replace(/\+?5[にー]2/g, '+512+')
    .replace(/\+?5[には]/g, '+512+')
    .replace(/\+?加5/g, '+105')
    .replace(/\+?物5/g, '+105')
    .replace(/\+?[りロ日]3/g, '+1190')
    .replace(/\+?い純/g, '+1190')
    .replace(/\+?日純/g, '+1190')
    .replace(/\+?734間[・4]?[17]つ/g, '+73+70+72')
    .replace(/\+一\+0/g, '+1+6')
    .replace(/\+1\+0/g, '+1+6')
    .replace(/(?<=\d)4(?=\d{2}\b)/g, '+')
    .replace(/[、↓←~]/g, '+')
  const strict = tail.match(/^[（(][0-9+%+＋.．]+[）)]/)
  const strictText = strict
    ? strict[0].replace(/＋/g, '+').replace(/（/g, '(').replace(/）/g, ')').replace(/．/g, '.')
    : ''
  const parts = body.match(/\d+/g)?.map(Number) ?? []
  if (parts.length >= 2) {
    const sum = parts.reduce((acc, n) => acc + n, 0)
    return { strictText, syntheticText: `(${parts.join('+')})`, sum }
  }
  return { strictText, syntheticText: '', sum: null }
}

function normalizeMainDigits(after: string, label: string, section: string): string {
  let s = after
    .replace(/^[←~、本]/, '+')
    .replace(/^(\+?)(?:[日ロりい]|ー1)2(?=[（(い0])/, '$1112')
    .replace(/^(\+?)(?:4?ド45|4?ド新|4新|ー445|45)(?=[（(0])/, '$11445')
    .replace(/^(\+?)(?:4?8矼|4?師7|部7)/, '$1867')
  if (label === '全ステータス') {
    s = s.replace(/^(\+?|新)[碪、]/, '+6%')
  }
  if (section === 'potential' || section === 'additional') {
    s = s
      .replace(/^(\+?)[驀鰤0]第?/, '+9%')
      .replace(/(\d+)第/, '$1%')
    if ((label === '魔力' || label === '攻撃力') && (/^70\b/.test(s) || /^を博/.test(s) || /^\+博/.test(s))) {
      s = '+10'
    }
  }
  return s
}

function stripFalseLeadingFour(valueStr: string, hasExplicitPlus: boolean, label: string, parenSum: number | null): string {
  if (hasExplicitPlus) return valueStr
  if (parenSum !== null && parenSum > 0 && valueStr.startsWith('4') && Number(valueStr.slice(1)) === parenSum) {
    return valueStr.slice(1)
  }
  if (!valueStr.startsWith('4')) return valueStr
  const n = Number(valueStr)
  if (
    ['STR', 'DEX', 'INT', 'LUK', '攻撃力', '魔力', '移動速度', 'ジャンプ力'].includes(label) &&
    n >= 400
  ) {
    return valueStr.slice(1)
  }
  if (label === '防御力' && n >= 4000) {
    return valueStr.slice(1)
  }
  if ((label === '最大HP' || label === '最大MP') && n >= 40000) {
    return valueStr.slice(1)
  }
  return valueStr
}

function readStat(line: string, section: 'stats' | 'enhance' | 'potential' | 'additional' = 'stats'): StatLine | null {
  const normalized = normalizeOcrLine(compactLine(line)).toUpperCase()
  if (normalized.includes('再使用待機時間')) {
    const cd = normalized.match(/[-－ー](\d+)秒/)
    if (cd?.[1]) {
      return { label: '再使用待機時間', value: `-${cd[1]}秒` }
    }
  }
  for (const { match, label } of STAT_ALIASES) {
    const key = match.toUpperCase()
    const at = normalized.indexOf(key)
    if (at < 0) continue
    const rawAfter = normalized.slice(at + key.length)
    const after = normalizeMainDigits(rawAfter, label, section)
    const number = after.match(/(\+?)(\d+)(%?)/)
    if (!number || number.index === undefined) return null
    const tail = after.slice(number.index + number[0].length)
    const { strictText, syntheticText, sum: parenSum } = parseParenSum(tail)
    const numStr = stripFalseLeadingFour(number[2] ?? '', number[1] === '+', label, parenSum)
    const extra = strictText || (parenSum !== null && parenSum === Number(numStr) ? syntheticText : '')
    const pct = number[3] || (label === '全ステータス' && tail.includes('%') ? '%' : '')
    return { label, value: `+${numStr}${pct}${extra}` }
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
    const compact = normalizeOcrLine(compactLine(raw))
    if (compact.length < 2) continue
    if (/アディシ|アデ[ィナ社]/.test(compact)) {
      section = 'additional'
      const rank = RANKS.find((entry) => entry.match.test(compact))?.rank
      if (rank && !notes.some((n) => n.startsWith('アディショナル潜在能力:'))) {
        notes.push(`アディショナル潜在能力: ${rank}`)
      }
      continue
    }
    if (section === 'additional' && !notes.some((n) => n.startsWith('アディショナル潜在能力:'))) {
      const rank = RANKS.find((entry) => entry.match.test(compact))?.rank
      if (rank && compact.includes('不可')) {
        notes.push(`アディショナル潜在能力: ${rank}`)
        continue
      }
    }
    if (/潜在|[替当茗督][在存]|[潜替当茗督]在[能土止鼈]?[力カ]|在[能土止鼈][力カ]/.test(compact)) {
      section = 'potential'
      const rank = RANKS.find((entry) => entry.match.test(compact))?.rank
      if (rank && !notes.some((n) => n.startsWith('潜在能力:'))) {
        notes.push(`潜在能力: ${rank}`)
      }
      continue
    }
    if (
      compact.includes('スターフォース') ||
      compact.includes('スタフォ') ||
      compact.includes('呪文書') ||
      /ス[タダ]ー?フ[ォぉ]ー?ス/.test(compact) ||
      /[呪駅収瞬]文[書害容]/.test(compact)
    ) {
      if (section === 'stats') section = 'enhance'
      enhance.push(compact)
      continue
    }
    if (compact.includes('装備セット') || compact.includes('セット効果')) {
      if (!notes.includes(compact)) notes.push(compact)
      continue
    }
    const stat = readStat(compact, section)
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
