import type { EquipmentSlotGroup } from './equipmentSlots.ts'

export type SetPiece = {
  name: string
  slotGroup: EquipmentSlotGroup
}

export type ActiveEquipmentSet = {
  id: string
  name: string
  count: number
  activeTiers: { count: number; lines: string[] }[]
  nextCount: number | null
}

type SetTier = { count: number; lines: string[] }

type EquipmentSetDefinition = {
  id: string
  name: string
  tiers: SetTier[]
  pieceCount: (name: string, slotGroup: EquipmentSlotGroup) => number
}

function compact(name: string): string {
  return name.normalize('NFKC').replace(/[\s　・]/g, '')
}

function has(name: string, needle: string): boolean {
  return compact(name).includes(compact(needle))
}

function any(name: string, needles: string[]): boolean {
  return needles.some((needle) => has(name, needle))
}

function once(name: string, slotGroup: EquipmentSlotGroup, needles: string[], groups?: EquipmentSlotGroup[]): number {
  if (groups && !groups.includes(slotGroup)) return 0
  return any(name, needles) ? 1 : 0
}

const KINOKO_SLOTS: EquipmentSlotGroup[] = ['hat', 'top', 'bottom', 'overall', 'shoes', 'gloves', 'cape', 'shoulder']

/**
 * 現行のセット効果。旧効果は載せない。
 * 数値はメ淫プルストーリー Wiki「装備セットの裏技」。
 * キノコ装備セットだけは、ゲーム内のセット表示にある効果。
 * セット効果は到達した段まで重なる。
 */
const EQUIPMENT_SETS: EquipmentSetDefinition[] = [
  {
    id: 'glory',
    name: '光輝のボスアクセサリーセット',
    tiers: [
      { count: 2, lines: ['オールステータス +20', '最大HP +500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +15%'] },
      { count: 3, lines: ['オールステータス +20', '最大HP +500', '攻撃力 / 魔力 +20', 'モンスター防御率無視 +15%'] },
      { count: 4, lines: ['オールステータス +20', '最大HP +500', '攻撃力 / 魔力 +20', 'クリティカルダメージ +5%'] },
      { count: 5, lines: ['オールステータス +20', '最大HP +500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +15%'] },
    ],
    pieceCount: (name) => once(name, 'ring', ['根源の囁き', '死の誓い', '不滅の遺産', '恍惚の悪夢', '傲慢の原罪']),
  },
  {
    id: 'pitched',
    name: '漆黒のボスアクセサリーセット',
    tiers: [
      { count: 2, lines: ['オールステータス +10', '最大HP +250', '攻撃力 / 魔力 +10', 'ボス攻撃時ダメージ +10%'] },
      { count: 3, lines: ['オールステータス +10', '最大HP +250', '攻撃力 / 魔力 +10', 'モンスター防御率無視 +10%'] },
      { count: 4, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'クリティカルダメージ +5%'] },
      { count: 5, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'ボス攻撃時ダメージ +10%'] },
      { count: 6, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'モンスター防御率無視 +10%'] },
      { count: 7, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'クリティカルダメージ +5%'] },
      { count: 8, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'ボス攻撃時ダメージ +10%'] },
      { count: 9, lines: ['オールステータス +15', '最大HP +375', '攻撃力 / 魔力 +15', 'クリティカルダメージ +5%'] },
      { count: 10, lines: ['オールステータス +20', '最大HP +500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +10%'] },
    ],
    pieceCount: (name) =>
      once(name, 'ring', [
        'ブラックハート',
        'ルージュコントロール',
        'コンプリートアンダー',
        '魔力が宿った眼帯',
        '夢幻のベルト',
        '呪われた魔導書',
        '凄まじい恐怖',
        'コマンダーフォース',
        '苦痛の根源',
        '創世のバッジ',
        'ミトラの怒り',
      ]),
  },
  {
    id: 'dawn',
    name: '黎明のボスアクセサリーセット',
    tiers: [
      { count: 2, lines: ['オールステータス +10', '攻撃力 / 魔力 +10', '最大HP +250', 'ボス攻撃時ダメージ +10%'] },
      { count: 3, lines: ['オールステータス +10', '攻撃力 / 魔力 +10', '最大HP +250'] },
      { count: 4, lines: ['オールステータス +10', '攻撃力 / 魔力 +10', '防御力 +100', '最大HP +250', 'モンスター防御率無視 +10%'] },
    ],
    pieceCount: (name) =>
      once(name, 'ring', ['トワイライトマーク', 'デイブレイクペンダント', 'ガーディアンエンジェルリング', 'エステライヤリング']),
  },
  {
    id: 'verus-top',
    name: 'ヴェラッドセット（最上級）',
    tiers: [
      { count: 2, lines: ['オールステータス +20', '最大HP +1500 / 最大MP +1500'] },
      { count: 3, lines: ['攻撃力 / 魔力 +35', '最大HP +13% / 最大MP +13%'] },
      { count: 4, lines: ['ボス攻撃時ダメージ +30%', 'モンスター防御率無視 +30%'] },
    ],
    pieceCount: (name) => (has(name, 'ヴェラッド') && has(name, '最上級') ? 1 : 0),
  },
  {
    id: 'verus-high',
    name: 'ヴェラッドセット（上級）',
    tiers: [
      { count: 2, lines: ['オールステータス +15', '最大HP +1200 / 最大MP +1200'] },
      { count: 3, lines: ['攻撃力 / 魔力 +30', '最大HP +10% / 最大MP +10%'] },
      { count: 4, lines: ['ボス攻撃時ダメージ +30%', 'モンスター防御率無視 +15%'] },
    ],
    pieceCount: (name) => (has(name, 'ヴェラッド') && has(name, '上級') && !has(name, '最上級') ? 1 : 0),
  },
  {
    id: 'verus-mid',
    name: 'ヴェラッドセット（中級）',
    tiers: [
      { count: 2, lines: ['オールステータス +12', '最大HP +800 / 最大MP +800'] },
      { count: 3, lines: ['攻撃力 / 魔力 +20', '最大HP +8% / 最大MP +8%'] },
      { count: 4, lines: ['モンスター防御率無視 +15%', '攻撃時 5%の確率で2レベル氷結'] },
    ],
    pieceCount: (name) => (has(name, 'ヴェラッド') && has(name, '中級') ? 1 : 0),
  },
  {
    id: 'verus-low',
    name: 'ヴェラッドセット（下級）',
    tiers: [
      { count: 2, lines: ['オールステータス +10', '最大HP +500 / 最大MP +500'] },
      { count: 3, lines: ['攻撃力 / 魔力 +12', '最大HP +5% / 最大MP +5%'] },
      { count: 4, lines: ['モンスター防御率無視 +15%', '攻撃時 5%の確率で2レベル氷結'] },
    ],
    pieceCount: (name) => (has(name, 'ヴェラッド') && has(name, '下級') ? 1 : 0),
  },
  {
    id: 'boss',
    name: 'ボスアクセサリーセット',
    tiers: [
      { count: 3, lines: ['オールステータス +10', '攻撃力 / 魔力 +5', '防御力 +60', '最大HP +5% / 最大MP +5%'] },
      { count: 5, lines: ['オールステータス +10', '攻撃力 / 魔力 +5', '防御力 +60', '最大HP +5% / 最大MP +5%'] },
      { count: 7, lines: ['オールステータス +10', '攻撃力 / 魔力 +10', '防御力 +80', 'モンスター防御率無視 +10%'] },
      { count: 9, lines: ['オールステータス +15', '攻撃力 / 魔力 +10', '防御力 +100', 'ボス攻撃時ダメージ +10%'] },
    ],
    pieceCount: (name) =>
      once(name, 'ring', [
        '凝縮された力の結晶石',
        'アクアティックレター',
        'ブラックビーンマーク',
        'ビシャスプラントマーク',
        '地獄の炎',
        'デアセデュース',
        'シルバーブロッサムリング',
        '高貴なイピアのリング',
        'カオスホーンテイルのネックレス',
        'ホーンテイルのネックレス',
        'メーカーネイターペンダント',
        'ドミネーターペンダント',
        'ゴールデングローバーベルト',
        '怒ったジャクムのベルト',
        'ロイヤルブラックメタルショルダー',
        'ピンクの聖杯',
        '永遠の命の石',
        'クリスタルウェントゥスバッジ',
      ]),
  },
  {
    id: 'eternal',
    name: 'エテルネルセット',
    tiers: [
      { count: 2, lines: ['最大HP +2500 / 最大MP +2500', '攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +10%'] },
      { count: 3, lines: ['オールステータス +50', '攻撃力 / 魔力 +40', '防御力 +600', 'ボス攻撃時ダメージ +10%'] },
      { count: 4, lines: ['最大HP +15% / 最大MP +15%', '攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +10%'] },
      { count: 5, lines: ['攻撃力 / 魔力 +40', 'モンスター防御率無視 +20%'] },
      { count: 6, lines: ['攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +15%'] },
      { count: 7, lines: ['最大HP +2500 / 最大MP +2500', 'オールステータス +50', '攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +15%'] },
      { count: 8, lines: ['攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +15%'] },
    ],
    pieceCount: (name, slotGroup) => {
      if (has(name, 'エテルネル')) return 1
      if (slotGroup === 'weapon' && any(name, ['ジェネシス', 'デスティニー'])) return 1
      return 0
    },
  },
  {
    id: 'arcane',
    name: 'アーケインシェードセット',
    tiers: [
      { count: 2, lines: ['最大HP +1500 / 最大MP +1500', '攻撃力 / 魔力 +30', 'ボス攻撃時ダメージ +10%'] },
      { count: 3, lines: ['オールステータス +30', '攻撃力 / 魔力 +30', '防御力 +400', 'モンスター防御率無視 +10%'] },
      { count: 4, lines: ['攻撃力 / 魔力 +35', 'ボス攻撃時ダメージ +10%'] },
      { count: 5, lines: ['攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +10%'] },
      { count: 6, lines: ['最大HP +20% / 最大MP +20%', '攻撃力 / 魔力 +30'] },
      { count: 7, lines: ['攻撃力 / 魔力 +30', 'モンスター防御率無視 +10%'] },
    ],
    pieceCount: (name) => once(name, 'hat', ['アーケインシェイド', 'アーケインシェード']),
  },
  {
    id: 'absolabs',
    name: 'アブソレスセット',
    tiers: [
      { count: 2, lines: ['最大HP +1500 / 最大MP +1500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +10%'] },
      { count: 3, lines: ['オールステータス +30', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +10%'] },
      { count: 4, lines: ['攻撃力 / 魔力 +25', '防御力 +200', 'モンスター防御率無視 +10%'] },
      { count: 5, lines: ['攻撃力 / 魔力 +30', 'ボス攻撃時ダメージ +10%'] },
      { count: 6, lines: ['最大HP +20% / 最大MP +20%', '攻撃力 / 魔力 +20'] },
      { count: 7, lines: ['攻撃力 / 魔力 +20', 'モンスター防御率無視 +10%'] },
    ],
    pieceCount: (name) => once(name, 'hat', ['アブソラボ', 'アブソラス']),
  },
  {
    id: 'abyss',
    name: 'ルートアビスセット',
    tiers: [
      { count: 2, lines: ['メインステータス +20', 'サブステータス +20', '最大HP +1000 / 最大MP +1000'] },
      { count: 3, lines: ['最大HP +10% / 最大MP +10%', '攻撃力または魔力 +50'] },
      { count: 4, lines: ['ボス攻撃時ダメージ +30%'] },
    ],
    pieceCount: (name) => {
      if (has(name, 'ラピッド')) return 0
      return any(name, ['ハイネス', 'イーグルアイ', 'トリックスター', 'ファフニール']) ? 1 : 0
    },
  },
  {
    id: 'sengoku',
    name: '戦国セット',
    tiers: [
      { count: 2, lines: ['オールステータス +10', '防御力 +200'] },
      { count: 3, lines: ['オールステータス +10', '最大HP +1000 / 最大MP +1000', '攻撃力 / 魔力 +5'] },
      { count: 4, lines: ['オールステータス +15', '攻撃力 / 魔力 +10', '移動速度 +20', 'ジャンプ力 +10'] },
      { count: 5, lines: ['最大HP +20% / 最大MP +20%', '攻撃力 / 魔力 +10', 'モンスター防御率無視 +10%'] },
      { count: 6, lines: ['オールステータス +20', '攻撃力 / 魔力 +20'] },
      { count: 7, lines: ['オールステータス +30', '攻撃力 / 魔力 +30', 'モンスター防御率無視 +10%'] },
      { count: 8, lines: ['攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +30%'] },
      { count: 9, lines: ['攻撃力 / 魔力 +40', 'クリティカルダメージ +5%', 'モンスター防御率無視 +10%'] },
    ],
    pieceCount: (name, slotGroup) => {
      if (slotGroup === 'weapon' && has(name, '銀狼')) return 2
      return any(name, ['アマテラス', 'アメノウズメ', 'オオヤマツミ', 'ツクヨミ', 'スサノオ']) ? 1 : 0
    },
  },
  {
    id: 'kinoko',
    name: 'キノコ装備セット',
    tiers: [
      { count: 3, lines: ['全ステータス +20', '最大HP +1000 / 最大MP +1000', '攻撃力 / 魔力 +20'] },
      { count: 4, lines: ['最大HP +1500 / 最大MP +1500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +10%'] },
      { count: 5, lines: ['全ステータス +30', '最大HP +1500 / 最大MP +1500', '攻撃力 / 魔力 +20', 'ボス攻撃時ダメージ +10%'] },
      { count: 6, lines: ['攻撃力 / 魔力 +40', '防御力 +200', 'モンスター防御率無視 +10%'] },
      { count: 7, lines: ['攻撃力 / 魔力 +40', 'ボス攻撃時ダメージ +10%'] },
    ],
    pieceCount: (name, slotGroup) => once(name, slotGroup, ['キノコ'], KINOKO_SLOTS),
  },
]

const ITEM_CATALOG = [
  'キノコダンウィッチハット',
  'キノコダンウィッチローブ',
  'キノコダンウィッチパンツ',
  'キノコメイジシューズ',
  'キノコメイジグローブ',
  'キノコメイジケープ',
  'キノコメイジショルダー',
  '凝縮された力の結晶石',
  'アクアティックレター目飾り',
  'ブラックビーンマーク',
  'ビシャスプラントマーク',
  'デアセデュースイヤリング',
  'シルバーブロッサムリング',
  '高貴なイピアのリング',
  'ホーンテイルのネックレス',
  'カオスホーンテイルのネックレス',
  'メーカーネイターペンダント',
  'ドミネーターペンダント',
  'ゴールデングローバーベルト',
  '怒ったジャクムのベルト',
  'ロイヤルブラックメタルショルダー',
  'クリスタルウェントゥスバッジ',
  'ヴェラッドイヤリング(最上級)',
  'ヴェラッド刻印ベルト(最上級)',
  'ヴェラッドリング(最上級)',
  'ヴェラッド刻印ペンダント(最上級)',
  'ヴェラッドイヤリング(上級)',
  'ヴェラッド刻印ベルト(上級)',
  'ヴェラッドリング(上級)',
  'ヴェラッド刻印ペンダント(上級)',
  'ヴェラッドイヤリング(中級)',
  'ヴェラッド刻印ベルト(中級)',
  'ヴェラッドリング(中級)',
  'ヴェラッド刻印ペンダント(中級)',
  'ヴェラッドイヤリング(下級)',
  'ヴェラッド刻印ベルト(下級)',
  'ヴェラッドリング(下級)',
  'ヴェラッド刻印ペンダント(下級)',
  'トワイライトマーク',
  'デイブレイクペンダント',
  '黎明のガーディアンエンジェルリング',
  'エステライヤリング',
  'ルージュコントロールマシンマーク',
  'コンプリートアンダーコントロール',
  '魔力が宿った眼帯',
  '夢幻のベルト',
  '呪われた魔導書',
  '凄まじい恐怖',
  'コマンダーフォースイヤリング',
  '苦痛の根源',
  '創世のバッジ',
  'ミトラの怒り',
  '根源の囁き',
  '死の誓い',
  '不滅の遺産',
  '恍惚の悪夢',
  '傲慢の原罪',
  '永遠の命の石',
  'ピンクの聖杯',
  '地獄の炎',
  'ブラックハート',
]

function cleanReadName(raw: string): string {
  return raw.normalize('NFKC').replace(/[^\u3040-\u30ff\u4e00-\u9fff0-9()（）]/g, '')
}

function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0] ?? 0
    row[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const saved = row[j] ?? 0
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      row[j] = Math.min((row[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, previous + cost)
      previous = saved
    }
  }
  return row[right.length] ?? left.length
}

function looksLikeSetItem(name: string): boolean {
  return EQUIPMENT_SETS.some((set) =>
    (['hat', 'top', 'bottom', 'shoes', 'gloves', 'cape', 'shoulder', 'weapon', 'ring', 'earring', 'pendant', 'belt', 'face', 'eye', 'pocket', 'badge', 'medal', 'heart', 'emblem'] as const).some(
      (group) => set.pieceCount(name, group) > 0,
    ),
  )
}

/**
 * 説明から読んだ文字列を、知っているアイテム名と比べる。
 * 近い名前があればその名前、セット名だけ分かるときは読んだまま。
 */
/** アイテム名から部位が分かるとき、その部位。指輪のように複数枠ある部位もある。 */
export function slotGroupForItem(name: string): EquipmentSlotGroup | null {
  if (name.includes('イヤリング')) return 'earring'
  if (name.includes('リング')) return 'ring'
  if (name.includes('ネックレス') || name.includes('ペンダント')) return 'pendant'
  if (name.includes('ベルト')) return 'belt'
  if (name.includes('ショルダー')) return 'shoulder'
  if (name.includes('バッジ')) return 'badge'
  if (name.includes('目飾り') || name.includes('眼帯')) return 'eye'
  if (name.includes('ハット') || name.includes('帽子')) return 'hat'
  if (name.includes('グローブ')) return 'gloves'
  if (name.includes('シューズ') || name.includes('靴')) return 'shoes'
  if (name.includes('ケープ') || name.includes('マント')) return 'cape'
  if (name.includes('パンツ')) return 'bottom'
  if (name.includes('ローブ')) return 'top'
  return null
}

export function matchItemName(raw: string): string | null {
  const text = cleanReadName(raw)
  if (text.length < 4) return null
  let best: { name: string; distance: number } | null = null
  let second = Infinity
  for (const name of ITEM_CATALOG) {
    const distance = editDistance(text, compact(name))
    if (!best || distance < best.distance) {
      second = best?.distance ?? Infinity
      best = { name, distance }
    } else if (distance < second) {
      second = distance
    }
  }
  if (best) {
    const limit = Math.max(1, Math.floor(compact(best.name).length * 0.25))
    if (best.distance <= limit && (best.distance === 0 || second - best.distance >= 1)) return best.name
  }
  return looksLikeSetItem(text) ? text : null
}

export type BonusTotal = {
  key: string
  label: string
  amount: number
  percent: boolean
}

const BONUS_LABELS: Record<string, string> = {
  all: '全ステータス',
  main: 'メインステータス',
  sub: 'サブステータス',
  hp: '最大HP',
  mp: '最大MP',
  attack: '攻撃力 / 魔力',
  defense: '防御力',
  boss: 'ボス攻撃時ダメージ',
  ied: '防御率無視',
  crit: 'クリティカルダメージ',
  speed: '移動速度',
  jump: 'ジャンプ力',
}

function bonusKey(label: string): string {
  if (label.includes('全ステ') || label.includes('オールステ')) return 'all'
  if (label.includes('メイン')) return 'main'
  if (label.includes('サブ')) return 'sub'
  if (label.includes('最大HP') || label.includes('MAXHP') || label.includes('MaxHP')) return 'hp'
  if (label.includes('最大MP') || label.includes('MAXMP') || label.includes('MaxMP')) return 'mp'
  if (label.includes('ボス')) return 'boss'
  if (label.includes('防御率')) return 'ied'
  if (label.includes('クリティカル')) return 'crit'
  if (label.includes('防御力')) return 'defense'
  if (label.includes('移動')) return 'speed'
  if (label.includes('ジャンプ')) return 'jump'
  if (label.includes('攻撃') || label.includes('魔力')) return 'attack'
  return label
}

function parseBonusLine(line: string): BonusTotal[] {
  const parts = line.includes('攻撃力 / 魔力') || line.includes('攻撃力または魔力') ? [line] : line.split(' / ')
  const found: BonusTotal[] = []
  for (const part of parts) {
    const matched = part.match(/(.+?)\s*\+\s*(\d+)\s*(%?)/)
    if (!matched) continue
    const key = bonusKey(matched[1] ?? '')
    const amount = Number(matched[2])
    const percent = matched[3] === '%'
    if (!Number.isFinite(amount)) continue
    found.push({ key: percent ? `${key}%` : key, label: BONUS_LABELS[key] ?? (matched[1] ?? '').trim(), amount, percent })
  }
  return found
}

function mergeBonuses(lines: string[]): BonusTotal[] {
  const totals = new Map<string, BonusTotal>()
  for (const line of lines) {
    for (const bonus of parseBonusLine(line)) {
      const current = totals.get(bonus.key)
      if (current) current.amount += bonus.amount
      else totals.set(bonus.key, { ...bonus })
    }
  }
  const order = ['all', 'main', 'sub', 'hp', 'hp%', 'mp', 'mp%', 'attack', 'defense', 'boss', 'boss%', 'ied', 'ied%', 'crit', 'crit%', 'speed', 'jump']
  return [...totals.values()].sort((left, right) => {
    const leftIndex = order.indexOf(left.key)
    const rightIndex = order.indexOf(right.key)
    return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex)
  })
}

export function setBonuses(set: ActiveEquipmentSet): BonusTotal[] {
  return mergeBonuses(set.activeTiers.flatMap((tier) => tier.lines))
}

export function totalSetBonuses(sets: ActiveEquipmentSet[]): BonusTotal[] {
  return mergeBonuses(sets.flatMap((set) => set.activeTiers.flatMap((tier) => tier.lines)))
}

export function formatBonus(bonus: BonusTotal): string {
  return bonus.percent ? `+${bonus.amount}%` : `+${bonus.amount}`
}

export function activeEquipmentSets(pieces: SetPiece[]): ActiveEquipmentSet[] {
  const counts = new Map<string, number>()
  for (const piece of pieces) {
    if (!piece.name.trim()) continue
    const set = EQUIPMENT_SETS.find((entry) => entry.pieceCount(piece.name, piece.slotGroup) > 0)
    if (!set) continue
    counts.set(set.id, (counts.get(set.id) ?? 0) + set.pieceCount(piece.name, piece.slotGroup))
  }
  return EQUIPMENT_SETS.flatMap((set) => {
    const count = counts.get(set.id) ?? 0
    if (count === 0) return []
    const activeTiers = set.tiers.filter((tier) => tier.count <= count)
    const nextCount = set.tiers.find((tier) => tier.count > count)?.count ?? null
    return [{ id: set.id, name: set.name, count, activeTiers, nextCount }]
  }).sort((left, right) => right.activeTiers.length - left.activeTiers.length || right.count - left.count)
}
