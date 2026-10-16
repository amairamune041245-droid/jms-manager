import { useState } from 'react'
import {
  HEXA_STAT_OPTIONS,
  coreLevel,
  hexaForCharacter,
  hexaStatLabel,
} from '../../domain/hexa.ts'
import {
  HEXA_STAT_CORE_MAX_LEVEL,
  HEXA_STAT_LINE_MAX_LEVEL,
} from '../../domain/types.ts'
import type { Character, HexaStatCoreState, HexaStatType } from '../../domain/types.ts'
import { STAT_LAYOUT } from '../../data/hexa/statLayout.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function HexaStats({
  character,
  embedded = false,
}: {
  character: Character
  embedded?: boolean
}) {
  const { data, setHexaStatCore, saveHexaStat, applyHexaStat } = useAppStore()
  const hexa = hexaForCharacter(data, character.id)
  const [error, setError] = useState('')

  function updateCore(core: HexaStatCoreState) {
    const message = setHexaStatCore(character.id, core)
    setError(message ?? '')
  }

  const Tag = embedded ? 'div' : 'section'
  return (
    <Tag className={embedded ? 'hexa-stats' : 'panel'}>
      {embedded ? null : <h2>HEXAステータス</h2>}
      <p className="muted">
        1コアにつきメイン1・付加2。同一コア内の重複不可。メインは全コアで1種のみ、付加は全コアで2つまで（JMS公式6次ガイド）。
      </p>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <div
        className="stat-core-grid"
        style={{ gridTemplateColumns: `repeat(${STAT_LAYOUT.columns}, minmax(220px, 1fr))` }}
      >
        {hexa.statCores.map((core) => (
          <article key={core.index} className="stat-core">
            <h3>
              ステータスコア {core.index + 1}
              <span className="muted">
                {' '}
                Lv.{coreLevel(core)} / {HEXA_STAT_CORE_MAX_LEVEL}
              </span>
            </h3>
            <StatSelect
              label="メイン"
              value={core.main}
              onChange={(main) => updateCore({ ...core, main })}
            />
            <label className="field">
              <span className="field-label">メインレベル</span>
              <input
                type="number"
                min={0}
                max={HEXA_STAT_LINE_MAX_LEVEL}
                value={core.mainLevel}
                onChange={(event) =>
                  updateCore({ ...core, mainLevel: Number(event.target.value) })
                }
              />
            </label>
            <StatSelect
              label="付加1"
              value={core.additional1}
              onChange={(additional1) => updateCore({ ...core, additional1 })}
            />
            <label className="field">
              <span className="field-label">付加1レベル</span>
              <input
                type="number"
                min={0}
                max={HEXA_STAT_LINE_MAX_LEVEL}
                value={core.additional1Level}
                onChange={(event) =>
                  updateCore({
                    ...core,
                    additional1Level: Number(event.target.value),
                  })
                }
              />
            </label>
            <StatSelect
              label="付加2"
              value={core.additional2}
              onChange={(additional2) => updateCore({ ...core, additional2 })}
            />
            <label className="field">
              <span className="field-label">付加2レベル</span>
              <input
                type="number"
                min={0}
                max={HEXA_STAT_LINE_MAX_LEVEL}
                value={core.additional2Level}
                onChange={(event) =>
                  updateCore({
                    ...core,
                    additional2Level: Number(event.target.value),
                  })
                }
              />
            </label>
            <p className="muted">
              強化素材: データ未確認（公式ガイドにレベル別必要数なし）
            </p>
            <div className="actions">
              <button
                type="button"
                disabled={coreLevel(core) < HEXA_STAT_CORE_MAX_LEVEL}
                onClick={() => saveHexaStat(character.id, core.index)}
              >
                強化状態を保存
              </button>
              <button
                type="button"
                className="button-quiet"
                disabled={!core.saved}
                onClick={() => applyHexaStat(character.id, core.index)}
              >
                保存状態を適用
              </button>
            </div>
            {core.saved ? (
              <p className="notice">
                保存済: メイン{core.saved.mainLevel} / 付加
                {core.saved.additional1Level}/{core.saved.additional2Level}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Tag>
  )
}

function StatSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: HexaStatType | null
  onChange: (value: HexaStatType | null) => void
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) =>
          onChange((event.target.value || null) as HexaStatType | null)
        }
      >
        <option value="">未設定</option>
        {HEXA_STAT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="muted">{hexaStatLabel(value)}</span>
    </label>
  )
}
