import { BOSS_CRYSTALS, CRYSTAL_PRICE_NOTE, WEEKLY_SALE_LIMIT, crystalTotal, formatMeso } from '../../domain/bossCrystals.ts'
import type { BossCadence } from '../../domain/bossCrystals.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function BossTracker({ characterId }: { characterId: string }) {
  const { data, toggleBossClear } = useAppStore()
  const cleared = data.bossClearsByCharacterId[characterId] ?? []
  const week = crystalTotal(cleared, 'week')
  const month = crystalTotal(cleared, 'month')

  return (
    <section className="panel">
      <h2>月/週ボス</h2>
      <p className="muted">{CRYSTAL_PRICE_NOTE} パーティーの人数割りは入れていません。表示は1人で倒したときの売却額です。</p>
      <p>
        週 {formatMeso(week.meso)}（{week.count}個 / 販売{WEEKLY_SALE_LIMIT}個）
        {week.count > WEEKLY_SALE_LIMIT ? '　今週の販売枠を超えています。' : ''}
      </p>
      <p>月 {formatMeso(month.meso)}（{month.count}個）</p>
      <BossTable cadence="week" title="週ボス" cleared={cleared} onToggle={(id) => toggleBossClear(characterId, id)} />
      <BossTable cadence="month" title="月ボス" cleared={cleared} onToggle={(id) => toggleBossClear(characterId, id)} />
    </section>
  )
}

function BossTable({
  cadence,
  title,
  cleared,
  onToggle,
}: {
  cadence: BossCadence
  title: string
  cleared: string[]
  onToggle: (id: string) => void
}) {
  const bosses = BOSS_CRYSTALS.filter((boss) => boss.cadence === cadence)
  return (
    <>
      <h3>{title}</h3>
      <table className="boss-list">
        <tbody>
          {bosses.map((boss) => (
            <tr key={boss.id}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={cleared.includes(boss.id)}
                    onChange={() => onToggle(boss.id)}
                  />{' '}
                  {boss.name}
                </label>
              </td>
              <td>{formatMeso(boss.priceMeso)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
