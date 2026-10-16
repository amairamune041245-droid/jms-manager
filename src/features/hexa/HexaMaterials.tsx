import { HEXA_COST_NOTE, hexaForCharacter } from '../../domain/hexa.ts'
import type { Character } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function HexaMaterials({
  character,
  embedded = false,
}: {
  character: Character
  embedded?: boolean
}) {
  const { data, setHexaMaterials } = useAppStore()
  const hexa = hexaForCharacter(data, character.id)
  const Tag = embedded ? 'div' : 'section'

  return (
    <Tag className={embedded ? 'hexa-materials' : 'panel'}>
      <h2>所持材料</h2>
      <div className={embedded ? 'material-list' : 'form-grid'}>
        <label className={embedded ? 'material-row' : 'field'}>
          <span className="material-orb erda" aria-hidden="true" />
          <span className="material-copy">
            <span className="field-label">ソルエルダ</span>
            {embedded ? <span className="material-cap">/ 20</span> : null}
          </span>
          <input
            inputMode="numeric"
            aria-label="ソルエルダ"
            value={hexa.materials.solErda}
            onChange={(event) =>
              setHexaMaterials(character.id, {
                ...hexa.materials,
                solErda: Number(event.target.value || 0),
              })
            }
          />
        </label>
        <label className={embedded ? 'material-row' : 'field'}>
          <span className="material-orb fragment" aria-hidden="true" />
          <span className="material-copy">
            <span className="field-label">ソルエルダの欠片</span>
          </span>
          <input
            inputMode="numeric"
            aria-label="ソルエルダの欠片"
            value={hexa.materials.solErdaFragment}
            onChange={(event) =>
              setHexaMaterials(character.id, {
                ...hexa.materials,
                solErdaFragment: Number(event.target.value || 0),
              })
            }
          />
        </label>
      </div>
      <p className="notice">必要数 / 不足数: データ未確認</p>
      <p className="muted">
        {embedded
          ? 'ソルエルダの所持上限の目安は20（JMS公式6次ガイド）。必要数はデータ未確認です。'
          : HEXA_COST_NOTE}
      </p>
    </Tag>
  )
}
