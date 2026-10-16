import { combatProfileByJobId } from '../../data/combatProfiles.ts'
import {
  attackLabel,
  convertMainStat,
  statSheetForCharacter,
  supportsRuinShield,
} from '../../domain/mainStatConvert.ts'
import type { Character, StatSheet } from '../../domain/types.ts'
import { useState } from 'react'
import { useAppStore } from '../app/useAppStore.ts'

export function MainStatConverter({ character }: { character: Character }) {
  const { data, setStatSheet } = useAppStore()
  const profile = combatProfileByJobId(character.jobId)
  const sheet = statSheetForCharacter(data, character.id)

  if (!profile) {
    return (
      <section className="panel">
        <h2>メインステ換算</h2>
        <ConvertCapture />
        <p className="muted">この職業の換算データは未確認です。</p>
      </section>
    )
  }

  const result = convertMainStat(profile, sheet, character.level)
  const atkLabel = attackLabel(profile.attack)

  function update(patch: Partial<StatSheet>) {
    setStatSheet(character.id, patch)
  }

  return (
    <section className="panel convert-panel">
      <h2>メインステ換算</h2>
      <ConvertCapture />
      {profile.model === 'xenon' ? (
        <p className="muted">ゼノンはSTR・DEX・LUKを同じ重みで換算します。</p>
      ) : null}
      <div className="convert-layout">
        <div>
          <table className="convert-table">
            <thead>
              <tr>
                <th />
                <th>基本数値</th>
                <th>%数値</th>
                <th>%未適用</th>
              </tr>
            </thead>
            <tbody>
              <StatRow
                label={profile.main}
                pure={sheet.mainPure}
                percent={sheet.mainPercent}
                flat={sheet.mainFlat}
                onPure={(mainPure) => update({ mainPure })}
                onPercent={(mainPercent) => update({ mainPercent })}
                onFlat={(mainFlat) => update({ mainFlat })}
              />
              {profile.sub ? (
                <StatRow
                  label={profile.sub}
                  pure={sheet.subPure}
                  percent={sheet.subPercent}
                  flat={sheet.subFlat}
                  onPure={(subPure) => update({ subPure })}
                  onPercent={(subPercent) => update({ subPercent })}
                  onFlat={(subFlat) => update({ subFlat })}
                />
              ) : null}
              {profile.sub2 ? (
                <StatRow
                  label={profile.sub2}
                  pure={sheet.sub2Pure}
                  percent={sheet.sub2Percent}
                  flat={sheet.sub2Flat}
                  onPure={(sub2Pure) => update({ sub2Pure })}
                  onPercent={(sub2Percent) => update({ sub2Percent })}
                  onFlat={(sub2Flat) => update({ sub2Flat })}
                />
              ) : null}
              <StatRow
                label={atkLabel}
                pure={sheet.atkPure}
                percent={sheet.atkPercent}
                flat={sheet.atkFlat}
                onPure={(atkPure) => update({ atkPure })}
                onPercent={(atkPercent) => update({ atkPercent })}
                onFlat={(atkFlat) => update({ atkFlat })}
              />
            </tbody>
          </table>
          <div className="convert-percents">
            <PercentField
              label="ダメージ"
              value={sheet.damagePercent}
              onChange={(damagePercent) => update({ damagePercent })}
            />
            <PercentField
              label="ボスダメージ"
              value={sheet.bossDamagePercent}
              onChange={(bossDamagePercent) => update({ bossDamagePercent })}
            />
            <PercentField
              label="防御率無視"
              value={sheet.ignoreDefensePercent}
              max={100}
              onChange={(ignoreDefensePercent) => update({ ignoreDefensePercent })}
            />
            <PercentField
              label="クリティカルダメージ"
              value={sheet.criticalDamagePercent}
              onChange={(criticalDamagePercent) => update({ criticalDamagePercent })}
            />
          </div>
          <div className="convert-options">
            {profile.finalDamage !== profile.finalDamage2 ? (
              <Option
                label="パッシブスキルレベルアップ"
                checked={sheet.passiveSkillLevelUp}
                onChange={(passiveSkillLevelUp) => update({ passiveSkillLevelUp })}
              />
            ) : null}
            <Option
              label="ジェネシス/デスティニー武器1次解放"
              checked={sheet.liberatedWeapon}
              onChange={(liberatedWeapon) => update({ liberatedWeapon })}
            />
            {profile.oneHandWeaponConstant !== null ? (
              <Option
                label="片手剣"
                checked={sheet.oneHandSword}
                onChange={(oneHandSword) => update({ oneHandSword })}
              />
            ) : null}
            {supportsRuinShield(profile.jobId) ? (
              <Option
                label="ルインフォースシールド"
                checked={sheet.ruinForceShield}
                onChange={(ruinForceShield) => update({ ruinForceShield })}
              />
            ) : null}
          </div>
        </div>
        <div className="convert-result">
          <p>
            ステータス攻撃力{' '}
            <strong>{result.statusAttackPower.toLocaleString('ja-JP')}</strong>
          </p>
          <p>
            最終ダメージ{' '}
            <strong>{result.finalDamagePercent.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}%</strong>
          </p>
          {result.note ? <p className="notice">{result.note}</p> : null}
          {result.rows.length > 0 ? (
            <table className="convert-table">
              <thead>
                <tr>
                  <th>増加</th>
                  <th>{result.mainLabel}換算</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <th>{row.label}</th>
                    <td>{formatMain(row.mainStat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : result.note ? null : (
            <p className="muted">数値を入れると、1ポイントあたりの換算が出ます。</p>
          )}
        </div>
      </div>
    </section>
  )
}

function StatRow({
  label,
  pure,
  percent,
  flat,
  onPure,
  onPercent,
  onFlat,
}: {
  label: string
  pure: number
  percent: number
  flat: number
  onPure: (value: number) => void
  onPercent: (value: number) => void
  onFlat: (value: number) => void
}) {
  return (
    <tr>
      <th>{label}</th>
      <td>
        <NumberInput label={`${label}の基本数値`} value={pure} onChange={onPure} />
      </td>
      <td>
        <NumberInput label={`${label}の%数値`} value={percent} onChange={onPercent} suffix="%" />
      </td>
      <td>
        <NumberInput label={`${label}の%未適用`} value={flat} onChange={onFlat} />
      </td>
    </tr>
  )
}

function PercentField({
  label,
  value,
  max,
  onChange,
}: {
  label: string
  value: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <NumberInput label={label} value={value} max={max} onChange={onChange} suffix="%" />
    </label>
  )
}

function NumberInput({
  label,
  value,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  max?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <span className="convert-number">
      <input
        aria-label={label}
        type="number"
        min={0}
        max={max}
        step="any"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {suffix ? <span className="muted">{suffix}</span> : null}
    </span>
  )
}

function Option({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="convert-option">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

function ConvertCapture() {
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('数値の読み取りはあとから付けます。いまは画面の確認だけです。')

  async function capture() {
    setNote('画面を取り込んでいます。')
    try {
      const response = await fetch('/api/screen-frame', { cache: 'no-store' })
      if (!response.ok) {
        setNote('画面を読めませんでした。ゲームを手前に出して、もう一度押してください。')
        return
      }
      const blob = await response.blob()
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(blob))
      setNote('画面を取り込みました。ステータスへの反映はあとから付けます。')
    } catch {
      setNote('画面を読めませんでした。ゲームを手前に出して、もう一度押してください。')
    }
  }

  return (
    <div>
      <div className="capture-actions">
        <button type="button" onClick={() => void capture()}>
          画面を取り込む
        </button>
      </div>
      <p className="muted">{note}</p>
      {preview ? <img className="capture-preview" src={preview} alt="取り込んだ換算画面" /> : null}
    </div>
  )
}

function formatMain(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'データ未確認'
  const rounded = Math.round((value + 1e-8) * 100) / 100
  return rounded.toLocaleString('ja-JP', { maximumFractionDigits: 2 })
}
