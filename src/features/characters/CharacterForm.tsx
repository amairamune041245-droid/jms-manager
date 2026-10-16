import { useState } from 'react'
import type { FormEvent } from 'react'
import { JOB_CATEGORIES, JOBS } from '../../data/jobs.ts'
import {
  validateCharacterForm,
} from '../../domain/characters.ts'
import type {
  CharacterFormErrors,
  CharacterFormValues,
} from '../../domain/characters.ts'
import type { CharacterInput } from '../../domain/types.ts'
import { readImageFile } from '../../lib/image.ts'
import { WorldSelect } from './WorldSelect.tsx'

type CharacterFormProps = {
  title: string
  submitLabel: string
  initialValues: CharacterFormValues
  initialPortrait: string | null
  notice?: string
  onDirty?: () => void
  onSubmit: (input: CharacterInput) => void
}

export function CharacterForm({
  title,
  submitLabel,
  initialValues,
  initialPortrait,
  notice,
  onDirty,
  onSubmit,
}: CharacterFormProps) {
  const [values, setValues] = useState(initialValues)
  const [portrait, setPortrait] = useState<string | null>(initialPortrait)
  const [errors, setErrors] = useState<CharacterFormErrors>({})
  const [imageError, setImageError] = useState('')

  function updateField(key: keyof CharacterFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    onDirty?.()
  }

  async function handlePortrait(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await readImageFile(file, 256)
      setPortrait(dataUrl)
      setImageError('')
      onDirty?.()
    } catch {
      setImageError('画像を読み込めませんでした')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateCharacterForm(values, portrait)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    onSubmit(result.value)
  }

  return (
    <section className="panel" aria-labelledby="character-form-heading">
      <h2 id="character-form-heading">{title}</h2>
      <form className="form-grid" noValidate onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">
            キャラクター名
            <span className="required">必須</span>
          </span>
          <input
            name="name"
            value={values.name}
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
            onChange={(event) => updateField('name', event.target.value)}
          />
          {errors.name ? (
            <p id="name-error" className="error" role="alert">
              {errors.name}
            </p>
          ) : null}
        </label>
        <div className="field">
          <span className="field-label" id="world-label">
            ワールド
          </span>
          <WorldSelect
            labelledBy="world-label"
            value={values.world}
            onChange={(world) => updateField('world', world)}
          />
        </div>
        <label className="field">
          <span className="field-label">職業</span>
          <select
            name="jobId"
            value={values.jobId}
            onChange={(event) => updateField('jobId', event.target.value)}
          >
            <option value="">未選択</option>
            {JOB_CATEGORIES.map((category) => (
              <optgroup key={category} label={category}>
                {JOBS.filter((job) => job.category === category).map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">レベル</span>
          <input
            name="level"
            value={values.level}
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={errors.level ? true : undefined}
            aria-describedby={errors.level ? 'level-error' : undefined}
            onChange={(event) => updateField('level', event.target.value)}
          />
          {errors.level ? (
            <p id="level-error" className="error" role="alert">
              {errors.level}
            </p>
          ) : null}
        </label>
        <label className="field">
          <span className="field-label">キャラクター画像</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handlePortrait(event.target.files?.[0])}
          />
          <span className="muted">公式素材は使わず、手元の画像のみ保存します。</span>
          {imageError ? <p className="error">{imageError}</p> : null}
          {portrait ? (
            <img className="portrait-preview" src={portrait} alt="" />
          ) : null}
          {portrait ? (
            <button
              type="button"
              className="button-quiet"
              onClick={() => {
                setPortrait(null)
                onDirty?.()
              }}
            >
              画像を外す
            </button>
          ) : null}
        </label>
        <div className="actions">
          <button type="submit">{submitLabel}</button>
          {notice ? (
            <p className="notice" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
