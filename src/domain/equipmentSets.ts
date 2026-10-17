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
    pieceCount: (name) => once(name, 'hat', ['アブソレス', 'アブソラボ', 'アブソラス']),
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
  // キノコ装備
  'キノコダンウィッチハット',
  'キノコダンウィッチローブ',
  'キノコダンウィッチパンツ',
  'キノコメイジシューズ',
  'キノコメイジグローブ',
  'キノコメイジケープ',
  'キノコメイジショルダー',
  // ボスアクセサリーセット
  '凝縮された力の結晶石',
  'アクアティックレター目飾り',
  'ブラックビーンマーク',
  'ビシャスプラントマーク',
  'デアセデュースイヤリング',
  '地獄の炎',
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
  'ピンクの聖杯',
  '永遠の命の石',
  // ヴェラッドセット
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
  // 黎明のボスアクセサリーセット
  'トワイライトマーク',
  'デイブレイクペンダント',
  '黎明のガーディアンエンジェルリング',
  'ガーディアンエンジェルリング',
  'エステライヤリング',
  // 漆黒のボスアクセサリーセット
  'ルージュコントロールマシンマーク',
  'コンプリートアンダーコントロール',
  '魔力が宿った眼帯',
  '夢幻のベルト',
  '呪われた魔導書',
  '呪われた赤の魔導書',
  '呪われた青の魔導書',
  '呪われた緑の魔導書',
  '呪われた黄の魔導書',
  '凄まじい恐怖',
  'コマンダーフォースイヤリング',
  '苦痛の根源',
  '創世のバッジ',
  'ミトラの怒り',
  'ミトラの怒り：戦士',
  'ミトラの怒り：魔法使い',
  'ミトラの怒り：弓使い',
  'ミトラの怒り：盗賊',
  'ミトラの怒り：海賊',
  'ブラックハート',
  // 光輝のボスアクセサリーセット
  '根源の囁き',
  '死の誓い',
  '不滅の遺産',
  '恍惚の悪夢',
  '傲慢の原罪',
  // ルートアビスセット（150防具）
  'ハイネスウォーリアヘルム',
  'ハイネスダンウィッチハット',
  'ハイネスレンジャーベレー',
  'ハイネスアサシンボンネット',
  'ハイネスワンダラーハット',
  'イーグルアイウォーリアアーマー',
  'イーグルアイダンウィッチローブ',
  'イーグルアイレンジャーフード',
  'イーグルアイアサシンシャツ',
  'イーグルアイワンダラーコート',
  'トリックスターウォーリアパンツ',
  'トリックスターダンウィッチパンツ',
  'トリックスターレンジャーパンツ',
  'トリックスターアサシンパンツ',
  'トリックスターワンダラーパンツ',
  // アブソレスセット（160防具）
  'アブソレスナイトヘルム',
  'アブソレスメイジクラウン',
  'アブソレスアーチャーフード',
  'アブソレスシーフキャップ',
  'アブソレスパイレーツフェドラ',
  'アブソレスナイトスーツ',
  'アブソレスメイジスーツ',
  'アブソレスアーチャースーツ',
  'アブソレスシーフスーツ',
  'アブソレスパイレーツスーツ',
  'アブソレスナイトシューズ',
  'アブソレスメイジシューズ',
  'アブソレスアーチャーシューズ',
  'アブソレスシーフシューズ',
  'アブソレスパイレーツシューズ',
  'アブソレスナイトグローブ',
  'アブソレスメイジグローブ',
  'アブソレスアーチャーグローブ',
  'アブソレスシーフグローブ',
  'アブソレスパイレーツグローブ',
  'アブソレスナイトケープ',
  'アブソレスメイジケープ',
  'アブソレスアーチャーケープ',
  'アブソレスシーフケープ',
  'アブソレスパイレーツケープ',
  'アブソレスナイトショルダー',
  'アブソレスメイジショルダー',
  'アブソレスアーチャーショルダー',
  'アブソレスシーフショルダー',
  'アブソレスパイレーツショルダー',
  // アーケインシェードセット（200防具）
  'アーケインシェードナイトハット',
  'アーケインシェードメイジクラウン',
  'アーケインシェードアーチャーハット',
  'アーケインシェードシーフハット',
  'アーケインシェードパイレーツハット',
  'アーケインシェードナイトスーツ',
  'アーケインシェードメイジスーツ',
  'アーケインシェードアーチャースーツ',
  'アーケインシェードシーフスーツ',
  'アーケインシェードパイレーツスーツ',
  'アーケインシェードナイトシューズ',
  'アーケインシェードメイジシューズ',
  'アーケインシェードアーチャーシューズ',
  'アーケインシェードシーフシューズ',
  'アーケインシェードパイレーツシューズ',
  'アーケインシェードナイトグローブ',
  'アーケインシェードメイジグローブ',
  'アーケインシェードアーチャーグローブ',
  'アーケインシェードシーフグローブ',
  'アーケインシェードパイレーツグローブ',
  'アーケインシェードナイトマント',
  'アーケインシェードメイジマント',
  'アーケインシェードアーチャーマント',
  'アーケインシェードシーフマント',
  'アーケインシェードパイレーツマント',
  'アーケインシェードナイトショルダー',
  'アーケインシェードメイジショルダー',
  'アーケインシェードアーチャーショルダー',
  'アーケインシェードシーフショルダー',
  'アーケインシェードパイレーツショルダー',
  // エテルネルセット（250防具）
  'エテルネルナイトヘルム',
  'エテルネルメイジハット',
  'エテルネルアーチャーフード',
  'エテルネルシーフバンダナ',
  'エテルネルパイレーツハット',
  'エテルネルナイトアーマー',
  'エテルネルメイジローブ',
  'エテルネルアーチャーフード',
  'エテルネルシーフシャツ',
  'エテルネルパイレーツコート',
  'エテルネルナイトパンツ',
  'エテルネルメイジパンツ',
  'エテルネルアーチャーパンツ',
  'エテルネルシーフパンツ',
  'エテルネルパイレーツパンツ',
  'エテルネルナイトシューズ',
  'エテルネルメイジシューズ',
  'エテルネルアーチャーシューズ',
  'エテルネルシーフシューズ',
  'エテルネルパイレーツシューズ',
  'エテルネルナイトグローブ',
  'エテルネルメイジグローブ',
  'エテルネルアーチャーグローブ',
  'エテルネルシーフグローブ',
  'エテルネルパイレーツグローブ',
  'エテルネルナイトケープ',
  'エテルネルメイジケープ',
  'エテルネルアーチャーケープ',
  'エテルネルシーフケープ',
  'エテルネルパイレーツケープ',
  'エテルネルナイトショルダー',
  'エテルネルメイジショルダー',
  'エテルネルアーチャーショルダー',
  'エテルネルシーフショルダー',
  'エテルネルパイレーツショルダー',
  // ルートアビス武器（ファフニール）
  'ファフニールミスティルテイン',
  'ファフニールツインクリーバー',
  'ファフニールゴルディアンハンマー',
  'ファフニールペニテントティアーズ',
  'ファフニールブリューナク',
  'ファフニールムーングレイブ',
  'ファフニールマナテイカー',
  'ファフニールマナクラウン',
  'ファフニールウインドウィングシューター',
  'ファフニールウインドチェイサー',
  'ファフニールデュアルウインドウイング',
  'ファフニールエンシェントボウ',
  'ファフニールリスクホルダー',
  'ファフニールダマスカス',
  'ファフニールクレセントディバイダー',
  'ファフニールスプリットエッジ',
  'ファフニールペルディション',
  'ファフニールチェーン',
  'ファフニールチャクラム',
  'ファフニールゼファーフーリガン',
  'ファフニールゼリスカ',
  'ファフニールロストキャノン',
  'ファフニールエンジェルレイス',
  'ファフニールデスブリンガー',
  'ファフニールインディゴフラッシュ',
  'ファフニールナイトチェイサー',
  'ファフニールソウルシューター',
  'ファフニールESPリミッター',
  'ファフニールマジカルガントレット',
  'ファフニールビッグファン',
  'ファフニール玄扇',
  'ファフニールブレスシューター',
  'ファフニールチューナー',
  'ファフニール霊剣',
  'ファフニール朱雀刀',
  'ファフニール白虎扇',
  // アブソレス武器（160武器）
  'アブソレスセイバー',
  'アブソレスアックス',
  'アブソレスビットハンマー',
  'アブソレスブロードセイバー',
  'アブソレスハルバード',
  'アブソレスバトルアックス',
  'アブソレスツヴァイハンダー',
  'アブソレスピアシングスピア',
  'アブソレススペルケーシング',
  'アブソレスクラウンスタッフ',
  'アブソレスシャイニングロッド',
  'アブソレスシューティングボウ',
  'アブソレスクロスボウ',
  'アブソレスデュアルボウガン',
  'アブソレスエンシェントボウ',
  'アブソレススラッシャー',
  'アブソレスブレイド',
  'アブソレスリベンジガード',
  'アブソレスファントムケイン',
  'アブソレスチェーン',
  'アブソレス怪扇',
  'アブソレスチャクラム',
  'アブソレスクロー',
  'アブソレスポインティングガン',
  'アブソレスブラストキャノン',
  'アブソレスソウルシューター',
  'アブソレスデスペラード',
  'アブソレスエネルギーソード',
  'アブソレスESPリミッター',
  'アブソレスマジカルガントレット',
  'アブソレスブレスシューター',
  'アブソレスチューナー',
  'アブソレス霊剣',
  'アブソレス刀',
  'アブソレス扇',
  // アーケインシェード武器（200武器）
  'アーケインシェードセイバー',
  'アーケインシェードアックス',
  'アーケインシェードハンマー',
  'アーケインシェードツーハンドソード',
  'アーケインシェードツーハンドアックス',
  'アーケインシェードツーハンドハンマー',
  'アーケインシェードスピア',
  'アーケインシェードポールアーム',
  'アーケインシェードワンド',
  'アーケインシェードスタッフ',
  'アーケインシェードシャイニングロッド',
  'アーケインシェードボウ',
  'アーケインシェードクロスボウ',
  'アーケインシェードデュアルボウガン',
  'アーケインシェードエンシェントボウ',
  'アーケインシェードダガー',
  'アーケインシェードブレイド',
  'アーケインシェードガード',
  'アーケインシェードケイン',
  'アーケインシェードチェーン',
  'アーケインシェード扇',
  'アーケインシェードチャクラム',
  'アーケインシェードクロー',
  'アーケインシェードピストル',
  'アーケインシェードシーズガン',
  'アーケインシェードソウルシューター',
  'アーケインシェードデスペラード',
  'アーケインシェードエネルギーソード',
  'アーケインシェードESPリミッター',
  'アーケインシェードマジカルガントレット',
  'アーケインシェードブレスシューター',
  'アーケインシェードチューナー',
  'アーケインシェード霊剣',
  'アーケインシェード刀',
  'アーケインシェード玄扇',
  // ジェネシス武器・デスティニー武器
  'ジェネシスセイバー',
  'ジェネシスアックス',
  'ジェネシスハンマー',
  'ジェネシスツーハンドソード',
  'ジェネシスツーハンドアックス',
  'ジェネシスツーハンドハンマー',
  'ジェネシススピア',
  'ジェネシスポールアーム',
  'ジェネシスワンド',
  'ジェネシススタッフ',
  'ジェネシスシャイニングロッド',
  'ジェネシスボウ',
  'ジェネシスクロスボウ',
  'ジェネシスデュアルボウガン',
  'ジェネシスエンシェントボウ',
  'ジェネシスダガー',
  'ジェネシスブレイド',
  'ジェネシスガード',
  'ジェネシスケイン',
  'ジェネシスチェーン',
  'ジェネシス扇',
  'ジェネシスチャクラム',
  'ジェネシスクロー',
  'ジェネシスピストル',
  'ジェネシスシーズガン',
  'ジェネシスソウルシューター',
  'ジェネシスデスペラード',
  'ジェネシスエネルギーソード',
  'ジェネシスESPリミッター',
  'ジェネシスマジカルガントレット',
  'ジェネシスブレスシューター',
  'ジェネシスチューナー',
  'ジェネシス霊剣',
  'ジェネシスラピス',
  'ジェネシスラズリ',
  'ジェネシス刀',
  'ジェネシス玄扇',
  'デスティニーセイバー',
  'デスティニーツーハンドソード',
  'デスティニースタッフ',
  'デスティニーワンド',
  'デスティニーボウ',
  'デスティニークロスボウ',
  'デスティニーガード',
  'デスティニーダガー',
  'デスティニークロー',
  'デスティニーピストル',
  // 戦国セット（150装備）
  'アマテラスの兜',
  'アマテラスの鎧',
  'アマテラスの靴',
  'アマテラスの手袋',
  'アマテラスの外套',
  'アマテラスの肩章',
  'アマテラスの腰帯',
  'アメノウズメの烏帽子',
  'アメノウズメの衣',
  'アメノウズメの靴',
  'アメノウズメの手袋',
  'アメノウズメの外套',
  'アメノウズメの肩章',
  'アメノウズメの腰帯',
  'オオヤマツミの兜',
  'オオヤマツミの装束',
  'オオヤマツミの靴',
  'オオヤマツミの手袋',
  'オオヤマツミの外套',
  'オオヤマツミの肩章',
  'オオヤマツミの腰帯',
  'ツクヨミの兜',
  'ツクヨミの忍装束',
  'ツクヨミの靴',
  'ツクヨミの手袋',
  'ツクヨミの外套',
  'ツクヨミの肩章',
  'ツクヨミの腰帯',
  'スサノオの兜',
  'スサノオの鎧',
  'スサノオの靴',
  'スサノオの手袋',
  'スサノオの外套',
  'スサノオの肩章',
  'スサノオの腰帯',
  '銀狼の剣',
  '銀狼の杖',
  '銀狼の弓',
  '銀狼の短剣',
  '銀狼の篭手',
  '銀狼の刀',
  '銀狼の扇',
  // シードリング・イベントリング・定番装備
  'リストレイントリング',
  'コンティニュアスリング',
  'ウェポンバフ-Sリング',
  'ウェポンバフ-Dリング',
  'ウェポンバフ-Iリング',
  'ウェポンバフ-Lリング',
  'ウェポンパフ-Sリング',
  'ウェポンパフ-Dリング',
  'ウェポンパフ-Iリング',
  'ウェポンパフ-Lリング',
  'リスクテイカーリング',
  'クライシス-HMリング',
  'デュラビリティリング',
  'アルティメイタムリング',
  'リングオブサム',
  'オーバードパスリング',
  'テネブリス遠征隊の指輪',
  'アウェイクリング',
  'グローリオンリング：シュープリーム',
  'エターナルフレイムリング',
  'アビスハンターズリング',
  'ディープダーククリティカルリング',
  'コスモスリング',
  'ヴェンジャンスリング',
  'シナジーリング',
  'マスターSSリング',
  '結束の指輪',
  'カオスリング',
  'マイスターリング',
  'スカーレットリング',
  '強力な魔性の指輪',
  '新・強力な魔性の指輪',
  '魔性のペンダント',
  'マイスターイヤリング',
  'マイスターショルダー',
  'スカーレットショルダー',
  'フェアリーハート',
  'チタンハート',
  'リチウムハート',
  'パーマネントリチウムハート',
  'プラチナハート',
  'ゴールドハート',
  'クリスタルハート',
  'アイアンハート',
  'ゴールドエムブレム',
  'ゴールドメイプルリーフエンブレム',
  'ゴールドヒーローエンブレム',
  'ゴールドドラゴンエンブレム',
  'ゴールドルミナスエンブレム',
  'ゴールドカイザーエンブレム',
  'ゴールドエンジェルエンブレム',
  'ゴールドフォースエンブレム',
  'ゴールドゼノンエンブレム',
  'ゴールドデーモンエンブレム',
  'ゴールドレジスタンスエンブレム',
  'ゴールドシグナスエンブレム',
  'ゴールドアカツキエンブレム',
  'ゴールドハイレフエンブレム',
  'ゴールドアニマエンブレム',
  'ゴールドキネシスエンブレム',
  'ゴールドゼロエンブレム',
  'ルインフォースシールド',
  '極限のフォースシールド',
  'デーモンイージス',
  'エreveの輝き',
  'エレヴの輝き',
  'ノウ姫の補助武器',
  '七曜のバッジ',
  '七曜のモンスターパーカー',
  'カオスベルルムのヘルム',
  '輪廻の碑石',
]

function normalizeKatakanaDash(text: string): string {
  return text.replace(/(?<=[\u30a0-\u30ff])[一―─ｰ-](?=[\u30a0-\u30ff])/g, 'ー')
}

function cleanReadName(raw: string): string {
  const normalized = normalizeKatakanaDash(raw.normalize('NFKC'))
    // 強化回数の表記 (+8) や (8) などを末尾から取り除く（(最上級) 等の漢字括弧は残す）
    .replace(/[（(]\+?\d+[）)]\s*$/g, '')
  return normalized.replace(/[^\u3040-\u30ff\u4e00-\u9fffA-Za-z0-9()（）:：-]/g, '')
}

function baseKana(ch: string): string {
  return ch.normalize('NFD').replace(/[\u3099\u309a]/g, '')
}

function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0] ?? 0
    row[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const saved = row[j] ?? 0
      const lc = left[i - 1] ?? ''
      const rc = right[j - 1] ?? ''
      const cost =
        lc === rc
          ? 0
          : baseKana(lc) === baseKana(rc) ||
              (lc === 'ノ' && rc === 'メ') ||
              (lc === 'メ' && rc === 'ノ') ||
              (lc === 'ク' && rc === 'ケ') ||
              (lc === 'ケ' && rc === 'ク')
            ? 0.35
            : 1
      const delCost = lc === 'ー' ? 0.4 : 1
      const insCost = rc === 'ー' ? 0.4 : 1
      row[j] = Math.min((row[j] ?? 0) + delCost, (row[j - 1] ?? 0) + insCost, previous + cost)
      previous = saved
    }
  }
  return row[right.length] ?? left.length
}

function looksLikeSetItem(name: string): boolean {
  return EQUIPMENT_SETS.some((set) =>
    (['hat', 'top', 'bottom', 'overall', 'shoes', 'gloves', 'cape', 'shoulder', 'weapon', 'ring', 'earring', 'pendant', 'belt', 'face', 'eye', 'pocket', 'badge', 'medal', 'heart', 'emblem'] as const).some(
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
  if (name.includes('イヤリング') || name.includes('死の誓い') || name.includes('地獄の炎')) return 'earring'
  if (name.includes('リング') || name.includes('指輪') || name.includes('凄まじい恐怖') || name.includes('根源の囁き')) return 'ring'
  if (
    name.includes('ネックレス') ||
    name.includes('ペンダント') ||
    name.includes('苦痛の根源') ||
    name.includes('不滅の遺産')
  ) {
    return 'pendant'
  }
  if (name.includes('ベルト') || name.includes('腰帯')) return 'belt'
  if (name.includes('ショルダー') || name.includes('肩章')) return 'shoulder'
  if (name.includes('バッジ')) return 'badge'
  if (
    name.includes('結晶石') ||
    name.includes('トワイライトマーク') ||
    name.includes('ルージュコントロール') ||
    name.includes('マシンマーク') ||
    name.includes('傲慢の原罪')
  ) {
    return 'face'
  }
  if (
    name.includes('目飾り') ||
    name.includes('眼帯') ||
    name.includes('ブラックビーンマーク') ||
    name.includes('ビシャスプラントマーク') ||
    name.includes('恍惚の悪夢') ||
    name.includes('モノクル')
  ) {
    return 'eye'
  }
  if (name.includes('聖杯') || name.includes('魔導書') || name.includes('命の石')) return 'pocket'
  if (name.includes('エムブレム') || name.includes('エンブレム') || name.includes('ミトラの怒り')) return 'emblem'
  if (name.includes('ハート') || name.includes('コンプリートアンダーコントロール')) return 'heart'
  if (name.includes('勲章') || name.includes('モンスターパーカー')) return 'medal'
  if (
    name.includes('フォースシールド') ||
    name.includes('デーモンイージス') ||
    name.includes('エレヴの輝き') ||
    name.includes('ラピッド') ||
    name.includes('補助武器')
  ) {
    return 'subWeapon'
  }
  if (
    name.startsWith('ファフニール') ||
    name.startsWith('ジェネシス') ||
    name.startsWith('デスティニー') ||
    name.startsWith('銀狼')
  ) {
    return 'weapon'
  }
  if (name.includes('イーグルアイ')) return 'top'
  if (
    name.includes('ハット') ||
    name.includes('帽子') ||
    name.includes('兜') ||
    name.includes('烏帽子') ||
    name.includes('ヘルム') ||
    name.includes('クラウン') ||
    name.includes('キャップ') ||
    name.includes('ベレー') ||
    name.includes('ボンネット') ||
    name.includes('フェドラ') ||
    name.includes('バンダナ') ||
    name.includes('サークレット') ||
    name.includes('フード')
  ) {
    return 'hat'
  }
  if (name.includes('スーツ') || name.includes('鎧') || name.includes('衣') || name.includes('装束')) return 'overall'
  if (name.includes('グローブ') || name.includes('手袋')) return 'gloves'
  if (name.includes('シューズ') || name.includes('靴')) return 'shoes'
  if (name.includes('ケープ') || name.includes('マント') || name.includes('外套')) return 'cape'
  if (name.includes('パンツ') || name.includes('スカート')) return 'bottom'
  if (
    name.includes('ローブ') ||
    name.includes('アーマー') ||
    name.includes('シャツ') ||
    name.includes('コート')
  ) {
    return 'top'
  }
  if (
    name.startsWith('ファフニール') ||
    name.startsWith('ジェネシス') ||
    name.startsWith('デスティニー') ||
    name.startsWith('銀狼') ||
    name.includes('セイバー') ||
    name.includes('ソード') ||
    name.includes('アックス') ||
    name.includes('ハンマー') ||
    name.includes('スピア') ||
    name.includes('ハルバード') ||
    name.includes('ポールアーム') ||
    name.includes('ワンド') ||
    name.includes('スタッフ') ||
    name.includes('ロッド') ||
    name.includes('ボウ') ||
    name.includes('ダガー') ||
    name.includes('ブレイド') ||
    name.includes('ガード') ||
    name.includes('ケイン') ||
    name.includes('チェーン') ||
    name.includes('チャクラム') ||
    name.includes('クロー') ||
    name.includes('ピストル') ||
    name.includes('ガン') ||
    name.includes('キャノン') ||
    name.includes('シューター') ||
    name.includes('デスペラード') ||
    name.includes('リミッター') ||
    name.includes('ガントレット') ||
    name.includes('チューナー') ||
    name.includes('霊剣') ||
    name.includes('扇') ||
    name.includes('刀')
  ) {
    return 'weapon'
  }
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
    if (best.distance <= limit && (best.distance === 0 || second - best.distance >= 0.3)) return best.name
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
