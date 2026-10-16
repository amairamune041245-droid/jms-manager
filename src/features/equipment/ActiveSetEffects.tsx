import { activeEquipmentSets, formatBonus, setBonuses, totalSetBonuses } from '../../domain/equipmentSets.ts'
import type { ActiveEquipmentSet, BonusTotal, SetPiece } from '../../domain/equipmentSets.ts'

export function ActiveSetEffects({ pieces }: { pieces: SetPiece[] }) {
  const sets = activeEquipmentSets(pieces)
  const active = sets.filter((set) => set.activeTiers.length > 0)
  const partial = sets.filter((set) => set.activeTiers.length === 0)
  const total = totalSetBonuses(active)

  return (
    <aside className="set-panel" aria-label="現在発動中のセット効果">
      <h3>現在発動中のセット効果</h3>
      <section className="set-block" aria-label="合計">
        <h4>合計</h4>
        {total.length === 0 ? (
          <p className="set-empty">発動中の効果はありません。</p>
        ) : (
          <BonusTable bonuses={total} />
        )}
      </section>
      <section className="set-block" aria-label="個別">
        <h4>個別</h4>
        {active.length === 0 && partial.length === 0 ? (
          <p className="set-empty">
            「装備情報を読む」で、説明のアイテム名をセットの名前と照合します。
          </p>
        ) : (
          <ul className="set-list">
            {active.map((set) => (
              <SetCard key={set.id} set={set} />
            ))}
            {partial.map((set) => (
              <li key={set.id} className="set-card partial">
                <h5>{set.name}</h5>
                <p className="set-count">
                  {set.count}個。あと{(set.nextCount ?? set.count) - set.count}個で{set.nextCount}セット
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="set-source">効果の出典は「装備セットの裏技」の現行効果。キノコ装備セットはゲーム内の表示。</p>
    </aside>
  )
}

function SetCard({ set }: { set: ActiveEquipmentSet }) {
  const bonuses = setBonuses(set)
  const reached = set.activeTiers.map((tier) => tier.count)
  const range = reached.length === 0 ? '' : `${reached[0]}〜${reached[reached.length - 1]}セット`
  return (
    <li className="set-card">
      <h5>{set.name}</h5>
      <p className="set-count">
        {set.count}個{range ? `　${range}` : ''}
      </p>
      <BonusTable bonuses={bonuses} />
      {set.nextCount !== null ? <p className="set-count">次は{set.nextCount}セット</p> : null}
    </li>
  )
}

function BonusTable({ bonuses }: { bonuses: BonusTotal[] }) {
  return (
    <dl className="set-stats">
      {bonuses.map((bonus) => (
        <div key={bonus.key}>
          <dt>{bonus.label}</dt>
          <dd>{formatBonus(bonus)}</dd>
        </div>
      ))}
    </dl>
  )
}
