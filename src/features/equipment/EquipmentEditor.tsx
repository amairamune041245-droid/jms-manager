import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { SLOT_GROUPS } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotGroup } from '../../domain/equipmentSlots.ts'
import {
  emptyItemInput,
  itemToInput,
  validateItemInput,
} from '../../domain/items.ts'
import type { ItemFormErrors } from '../../domain/items.ts'
import type { EquipmentItem, EquipmentItemInput } from '../../domain/types.ts'
import { readImageFile } from '../../lib/image.ts'
import { useAppStore } from '../app/useAppStore.ts'

const STAT_SUGGESTIONS = [
  'STR',
  'DEX',
  'INT',
  'LUK',
  '攻撃力',
  '魔力',
  'HP',
  'MP',
  '防御力',
  'ボスダメージ',
  '防御率無視',
  'ダメージ',
  'オールステータス',
]

export function EquipmentEditor({
  open,
  slotGroup,
  item,
  onClose,
  onSaved,
}: {
  open: boolean
  slotGroup: EquipmentSlotGroup
  item: EquipmentItem | null
  onClose: () => void
  onSaved: (itemId: string) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { saveItem } = useAppStore()
  const editorKey = item?.id ?? `new-${slotGroup}`
  const [values, setValues] = useState<EquipmentItemInput>(() =>
    item ? itemToInput(item) : emptyItemInput(slotGroup),
  )
  const [errors, setErrors] = useState<ItemFormErrors>({})
  const [formKey, setFormKey] = useState(editorKey)
  if (formKey !== editorKey) {
    setFormKey(editorKey)
    setValues(item ? itemToInput(item) : emptyItemInput(slotGroup))
    setErrors({})
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  async function handleImage(file: File | undefined) {
    if (!file) return
    const dataUrl = await readImageFile(file, 192)
    setValues((current) => ({ ...current, imageDataUrl: dataUrl }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateItemInput(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const id = saveItem(result.value, item?.id)
    onSaved(id)
  }

  function updateStat(index: number, key: 'label' | 'value', value: string) {
    setValues((current) => {
      const stats = [...current.stats]
      stats[index] = { ...stats[index], [key]: value }
      return { ...current, stats }
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      aria-labelledby="item-editor-title"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <h2 id="item-editor-title">{item ? '装備を編集' : '装備を登録'}</h2>
        <label className="field">
          <span className="field-label">装備名</span>
          <input
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />
          {errors.name ? <p className="error">{errors.name}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">部位</span>
          <select
            value={values.slotGroup}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                slotGroup: event.target.value as EquipmentSlotGroup,
              }))
            }
          >
            {SLOT_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">星力</span>
          <input
            inputMode="numeric"
            value={values.starForce ?? ''}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                starForce:
                  event.target.value.trim() === ''
                    ? null
                    : Number(event.target.value),
              }))
            }
          />
          {errors.starForce ? <p className="error">{errors.starForce}</p> : null}
        </label>
        <label className="field">
          <span className="field-label">強化情報</span>
          <input
            value={values.enhanceText}
            placeholder="例: +12 / 黄金槌"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                enhanceText: event.target.value,
              }))
            }
          />
        </label>
        <fieldset className="field">
          <legend>能力値</legend>
          {values.stats.map((line, index) => (
            <div key={index} className="stat-row">
              <input
                list="stat-suggestions"
                placeholder="項目"
                value={line.label}
                onChange={(event) => updateStat(index, 'label', event.target.value)}
              />
              <input
                placeholder="値"
                value={line.value}
                onChange={(event) => updateStat(index, 'value', event.target.value)}
              />
            </div>
          ))}
          <datalist id="stat-suggestions">
            {STAT_SUGGESTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
          <button
            type="button"
            className="button-quiet"
            onClick={() =>
              setValues((current) => ({
                ...current,
                stats: [...current.stats, { label: '', value: '' }],
              }))
            }
          >
            能力値を追加
          </button>
        </fieldset>
        <PotentialFields
          title="潜在能力"
          lines={values.potentials}
          onChange={(potentials) =>
            setValues((current) => ({ ...current, potentials }))
          }
        />
        <PotentialFields
          title="アディショナル潜在能力"
          lines={values.additionalPotentials}
          onChange={(additionalPotentials) =>
            setValues((current) => ({ ...current, additionalPotentials }))
          }
        />
        <label className="field">
          <span className="field-label">画像</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void handleImage(event.target.files?.[0])}
          />
          {values.imageDataUrl ? (
            <img className="item-preview" src={values.imageDataUrl} alt="" />
          ) : (
            <span className="muted">仮アイコンで表示します。</span>
          )}
        </label>
        <label className="field">
          <span className="field-label">メモ</span>
          <textarea
            rows={3}
            value={values.notes}
            onChange={(event) =>
              setValues((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>
        <div className="actions">
          <button type="submit">保存</button>
          <button type="button" className="button-quiet" onClick={onClose}>
            閉じる
          </button>
        </div>
      </form>
    </dialog>
  )
}

function PotentialFields({
  title,
  lines,
  onChange,
}: {
  title: string
  lines: { text: string }[]
  onChange: (lines: { text: string }[]) => void
}) {
  return (
    <fieldset className="field">
      <legend>{title}</legend>
      {lines.map((line, index) => (
        <input
          key={index}
          value={line.text}
          placeholder={`ライン${index + 1}`}
          onChange={(event) => {
            const next = lines.map((entry, entryIndex) =>
              entryIndex === index ? { text: event.target.value } : entry,
            )
            onChange(next)
          }}
        />
      ))}
    </fieldset>
  )
}
