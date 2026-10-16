export type JobCategory =
  | '冒険者'
  | 'シグナス騎士団'
  | '英雄'
  | 'レジスタンス'
  | 'ノヴァ'
  | 'レフ'
  | '暁の陣'
  | 'アニマ'
  | 'その他'

export type JobDef = {
  id: string
  name: string
  category: JobCategory
  sourceUrl?: string
}

export const JOBS: JobDef[] = [
  { id: 'hero', name: 'ヒーロー', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/hero/' },
  { id: 'paladin', name: 'パラディン', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/paladin/' },
  { id: 'darkknight', name: 'ダークナイト', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/darkknight/' },
  { id: 'archmage-fp', name: 'アークメイジ（火、毒）', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage01/' },
  { id: 'archmage-il', name: 'アークメイジ（氷、雷）', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage02/' },
  { id: 'bishop', name: 'ビショップ', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bishop/' },
  { id: 'bowmaster', name: 'ボウマスター', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bowmaster/' },
  { id: 'marksman', name: 'クロスボウマスター', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/crossbowmaster/' },
  { id: 'pathfinder', name: 'パスファインダー', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/pathfinder/' },
  { id: 'nightlord', name: 'ナイトロード', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/nightload/' },
  { id: 'shadower', name: 'シャドー', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/shadower/' },
  { id: 'dualblade', name: 'デュアルブレイド', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/dualblade/' },
  { id: 'viper', name: 'バイパー', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/viper/' },
  { id: 'captain', name: 'キャプテン', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/captain/' },
  { id: 'cannoneer', name: 'キャノンマスター', category: '冒険者', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/cannonshooter/' },
  { id: 'soulmaster', name: 'ソウルマスター', category: 'シグナス騎士団' },
  { id: 'flamewizard', name: 'フレイムウィザード', category: 'シグナス騎士団' },
  { id: 'windbreaker', name: 'ウィンドブレーカー', category: 'シグナス騎士団' },
  { id: 'nightwalker', name: 'ナイトウォーカー', category: 'シグナス騎士団' },
  { id: 'striker', name: 'ストライカー', category: 'シグナス騎士団' },
  { id: 'mihile', name: 'ミハイル', category: 'シグナス騎士団' },
  { id: 'aran', name: 'アラン', category: '英雄' },
  { id: 'evan', name: 'エヴァン', category: '英雄' },
  { id: 'mercedes', name: 'メルセデス', category: '英雄' },
  { id: 'phantom', name: 'ファントム', category: '英雄' },
  { id: 'luminous', name: 'ルミナス', category: '英雄', sourceUrl: 'https://maplestory.nexon.co.jp/job/hero/luminous/' },
  { id: 'shade', name: '隠月', category: '英雄' },
  { id: 'blaster', name: 'ブラスター', category: 'レジスタンス' },
  { id: 'battlemage', name: 'バトルメイジ', category: 'レジスタンス' },
  { id: 'wildhunter', name: 'ワイルドハンター', category: 'レジスタンス' },
  { id: 'mechanic', name: 'メカニック', category: 'レジスタンス' },
  { id: 'demonslayer', name: 'デーモンスレイヤー', category: 'レジスタンス' },
  { id: 'demonavenger', name: 'デーモンアヴェンジャー', category: 'レジスタンス' },
  { id: 'xenon', name: 'ゼノン', category: 'レジスタンス' },
  { id: 'kaiser', name: 'カイザー', category: 'ノヴァ' },
  { id: 'angelicbuster', name: 'エンジェリックバスター', category: 'ノヴァ' },
  { id: 'cadena', name: 'カデナ', category: 'ノヴァ' },
  { id: 'kain', name: 'カイン', category: 'ノヴァ' },
  { id: 'illium', name: 'イリウム', category: 'レフ' },
  { id: 'ark', name: 'アーク', category: 'レフ' },
  { id: 'adele', name: 'アデル', category: 'レフ' },
  { id: 'khali', name: 'カリ', category: 'レフ' },
  { id: 'hayato', name: 'ハヤト', category: '暁の陣' },
  { id: 'kanna', name: 'カンナ', category: '暁の陣' },
  { id: 'hoyoung', name: '虎影', category: 'アニマ' },
  { id: 'lara', name: 'ララ', category: 'アニマ' },
  { id: 'len', name: 'レン', category: 'アニマ' },
  { id: 'zero', name: 'ゼロ', category: 'その他' },
  { id: 'kinesis', name: 'キネシス', category: 'その他' },
]

export function jobById(id: string | null | undefined): JobDef | undefined {
  if (!id) return undefined
  return JOBS.find((job) => job.id === id)
}

export function jobIdFromName(name: string): string | null {
  const trimmed = name.trim()
  return JOBS.find((job) => job.name === trimmed)?.id ?? null
}

export const JOB_CATEGORIES: JobCategory[] = [
  '冒険者',
  'シグナス騎士団',
  '英雄',
  'レジスタンス',
  'ノヴァ',
  'レフ',
  '暁の陣',
  'アニマ',
  'その他',
]
