export type BossCadence = 'week' | 'month'

export type BossCrystal = {
  id: string
  name: string
  cadence: BossCadence
  /** 2026年9月23日時点の公開まとめ。その後の公式差額は未反映。 */
  priceMeso: number
}

export const CRYSTAL_PRICE_NOTE = '結晶のメルは2026年9月23日時点の公開まとめです。その後の公式調整はデータ未確認。'

const MAN = 10_000
const OKU = 100_000_000

function meso(oku: number, man = 0, rest = 0): number {
  return oku * OKU + man * MAN + rest
}

export const BOSS_CRYSTALS: BossCrystal[] = [
  { id: 'black-mage-extreme', name: '暗黒の魔法使い エクストリーム', cadence: 'month', priceMeso: meso(40) },
  { id: 'black-mage-hard', name: '暗黒の魔法使い ハード', cadence: 'month', priceMeso: meso(5, 7566) },
  { id: 'malisha-extreme', name: 'マリシャ エクストリーム', cadence: 'week', priceMeso: meso(21, 8191, 7000) },
  { id: 'kaling-extreme', name: 'カリーン エクストリーム', cadence: 'week', priceMeso: meso(20, 9944) },
  { id: 'jupiter-hard', name: 'ユピテル ハード', cadence: 'week', priceMeso: meso(20, 4000) },
  { id: 'adversary-extreme', name: '最初の対敵者 エクストリーム', cadence: 'week', priceMeso: meso(17, 8452, 4000) },
  { id: 'kalos-extreme', name: 'カロス エクストリーム', cadence: 'week', priceMeso: meso(16, 8480) },
  { id: 'baldrix-hard', name: 'バルドリックス ハード', cadence: 'week', priceMeso: meso(11, 6334) },
  { id: 'seren-extreme', name: 'セレン エクストリーム', cadence: 'week', priceMeso: meso(11, 6160) },
  { id: 'star-hard', name: '燦爛たる凶星 ハード', cadence: 'week', priceMeso: meso(11, 302) },
  { id: 'limbo-hard', name: 'リンボ ハード', cadence: 'week', priceMeso: meso(9, 8484) },
  { id: 'kaling-hard', name: 'カリーン ハード', cadence: 'week', priceMeso: meso(8, 6250) },
  { id: 'jupiter-normal', name: 'ユピテル ノーマル', cadence: 'week', priceMeso: meso(8, 4129) },
  { id: 'adversary-hard', name: '最初の対敵者 ハード', cadence: 'week', priceMeso: meso(7, 7625) },
  { id: 'baldrix-normal', name: 'バルドリックス ノーマル', cadence: 'week', priceMeso: meso(7, 35) },
  { id: 'kalos-chaos', name: 'カロス カオス', cadence: 'week', priceMeso: meso(5, 8000) },
  { id: 'limbo-normal', name: 'リンボ ノーマル', cadence: 'week', priceMeso: meso(4, 8774) },
  { id: 'star-normal', name: '燦爛たる凶星 ノーマル', cadence: 'week', priceMeso: meso(3, 4267) },
  { id: 'kaling-normal', name: 'カリーン ノーマル', cadence: 'week', priceMeso: meso(3, 2637) },
  { id: 'suu-extreme', name: 'スウ エクストリーム', cadence: 'week', priceMeso: meso(3, 1438) },
  { id: 'adversary-normal', name: '最初の対敵者 ノーマル', cadence: 'week', priceMeso: meso(2, 7130) },
  { id: 'kalos-normal', name: 'カロス ノーマル', cadence: 'week', priceMeso: meso(2, 5400) },
  { id: 'kaling-easy', name: 'カリーン イージー', cadence: 'week', priceMeso: meso(2, 2597) },
  { id: 'seren-hard', name: 'セレン ハード', cadence: 'week', priceMeso: meso(1, 8604) },
  { id: 'adversary-easy', name: '最初の対敵者 イージー', cadence: 'week', priceMeso: meso(1, 8240) },
  { id: 'kalos-easy', name: 'カロス イージー', cadence: 'week', priceMeso: meso(1, 7850) },
  { id: 'seren-normal', name: 'セレン ノーマル', cadence: 'week', priceMeso: meso(1, 7500) },
  { id: 'malisha-normal', name: 'マリシャ ノーマル', cadence: 'week', priceMeso: meso(1, 4300) },
  { id: 'verus-hilla-hard', name: '真・ヒルラ ハード', cadence: 'week', priceMeso: meso(1, 250) },
  { id: 'dunkell-hard', name: 'デュンケル ハード', cadence: 'week', priceMeso: meso(0, 9087) },
  { id: 'will-hard', name: 'ウィル ハード', cadence: 'week', priceMeso: meso(0, 8622) },
  { id: 'slime-chaos', name: 'ガーディアンエンジェルスライム カオス', cadence: 'week', priceMeso: meso(0, 8553) },
  { id: 'verus-hilla-normal', name: '真・ヒルラ ノーマル', cadence: 'week', priceMeso: meso(0, 8279) },
  { id: 'dusk-chaos', name: 'ダスク カオス', cadence: 'week', priceMeso: meso(0, 8136) },
  { id: 'lucid-hard', name: 'ルシード ハード', cadence: 'week', priceMeso: meso(0, 7031) },
  { id: 'suu-hard', name: 'スウ ハード', cadence: 'week', priceMeso: meso(0, 6362) },
  { id: 'damien-hard', name: 'デミアン ハード', cadence: 'week', priceMeso: meso(0, 6169) },
  { id: 'dunkell-normal', name: 'デュンケル ノーマル', cadence: 'week', priceMeso: meso(0, 5656) },
  { id: 'dusk-normal', name: 'ダスク ノーマル', cadence: 'week', priceMeso: meso(0, 5309) },
  { id: 'will-normal', name: 'ウィル ノーマル', cadence: 'week', priceMeso: meso(0, 4972) },
  { id: 'lucid-normal', name: 'ルシード ノーマル', cadence: 'week', priceMeso: meso(0, 4366) },
  { id: 'will-easy', name: 'ウィル イージー', cadence: 'week', priceMeso: meso(0, 4105) },
  { id: 'lucid-easy', name: 'ルシード イージー', cadence: 'week', priceMeso: meso(0, 3757) },
  { id: 'slime-normal', name: 'ガーディアンエンジェルスライム ノーマル', cadence: 'week', priceMeso: meso(0, 3089) },
  { id: 'damien-normal', name: 'デミアン ノーマル', cadence: 'week', priceMeso: meso(0, 2217) },
  { id: 'suu-normal', name: 'スウ ノーマル', cadence: 'week', priceMeso: meso(0, 2079) },
  { id: 'akechi-normal', name: 'アケチミツヒデ ノーマル', cadence: 'week', priceMeso: meso(0, 1797) },
  { id: 'plant-chaos', name: 'ビシャスプラント カオス', cadence: 'week', priceMeso: meso(0, 1650) },
  { id: 'princess-no', name: 'ノウ姫 ノーマル', cadence: 'week', priceMeso: meso(0, 1443) },
  { id: 'vellum-chaos', name: 'ベルルム カオス', cadence: 'week', priceMeso: meso(0, 1345) },
  { id: 'magnus-hard', name: 'マグナス ハード', cadence: 'week', priceMeso: meso(0, 1217) },
  { id: 'zakum-chaos', name: 'ジャクム カオス', cadence: 'week', priceMeso: meso(0, 1115) },
  { id: 'vonbon-chaos', name: 'バンバン カオス', cadence: 'week', priceMeso: meso(0, 1115) },
  { id: 'pierre-chaos', name: 'ピエール カオス', cadence: 'week', priceMeso: meso(0, 1115) },
  { id: 'queen-chaos', name: 'ブラッディクイーン カオス', cadence: 'week', priceMeso: meso(0, 1115) },
  { id: 'cygnus-normal', name: 'シグナス ノーマル', cadence: 'week', priceMeso: meso(0, 1053) },
  { id: 'pinkbean-chaos', name: 'ピンクビーン カオス', cadence: 'week', priceMeso: meso(0, 945) },
  { id: 'hilla-hard', name: 'ヒルラ ハード', cadence: 'week', priceMeso: meso(0, 901) },
  { id: 'cygnus-easy', name: 'シグナス イージー', cadence: 'week', priceMeso: meso(0, 738) },
]

const byId = new Map(BOSS_CRYSTALS.map((boss) => [boss.id, boss]))

export function bossById(id: string): BossCrystal | null {
  return byId.get(id) ?? null
}

export const WEEKLY_SALE_LIMIT = 12

export function crystalTotal(clearedIds: string[], cadence: BossCadence): { count: number; meso: number } {
  const bosses = clearedIds.flatMap((id) => {
    const boss = bossById(id)
    return boss && boss.cadence === cadence ? [boss] : []
  })
  return {
    count: bosses.length,
    meso: bosses.reduce((sum, boss) => sum + boss.priceMeso, 0),
  }
}

export function formatMeso(value: number): string {
  const oku = Math.floor(value / OKU)
  const man = Math.floor((value % OKU) / MAN)
  if (oku > 0 && man > 0) return `${oku}億${man}万メル`
  if (oku > 0) return `${oku}億メル`
  if (man > 0) return `${man}万メル`
  return `${value}メル`
}
