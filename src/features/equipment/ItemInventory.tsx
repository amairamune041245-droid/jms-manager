import { useMemo, useState } from 'react'
import { EQUIPMENT_SLOTS, labelForSlotGroup } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotGroup } from '../../domain/equipmentSlots.ts'
import { READ_LABELS, fieldReady, readMarks } from '../../domain/readCoverage.ts'
import type { ReadField } from '../../domain/readCoverage.ts'
import type { EquipmentItem } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { EquipmentEditor } from './EquipmentEditor.tsx'
import { ItemThumb } from './SlotPicker.tsx'

const FIELDS = Object.keys(READ_LABELS) as ReadField[]

export function ItemInventory({ characterId }: { characterId: string }) {
  const { data, removeItem } = useAppStore()
  const [query, setQuery] = useState('')
  const [editorItem, setEditorItem] = useState<EquipmentItem | null | 'new'>(null)
  const loadout = data.loadoutsByCharacterId[characterId]
  const preset = loadout?.presets[loadout.activePresetIndex]

  const equipped = useMemo(() => {
    const keyword = query.trim()
    return EQUIPMENT_SLOTS.flatMap((slot) => {
      const itemId = preset?.slots[slot.id]
      const item = data.items.find((entry) => entry.id === itemId)
      if (!item) return []
      const text = `${slot.label} ${item.name} ${labelForSlotGroup(item.slotGroup)}`
      if (keyword.length > 0 && !text.includes(keyword)) return []
      return [{ slot, item }]
    })
  }, [data.items, preset, query])

  const equippedIds = new Set(EQUIPMENT_SLOTS.map((slot) => preset?.slots[slot.id]).filter((id): id is string => Boolean(id)))
  const extra = data.items.filter(
    (item) => !equippedIds.has(item.id) && !item.id.startsWith(`capture:${characterId}:`),
  )

  const counts = FIELDS.map((field) => ({
    field,
    ready: equipped.filter(({ slot, item }) => fieldReady(item, slot.label, field)).length,
    total: equipped.length,
  }))

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>装備一覧</h2>
        <button type="button" onClick={() => setEditorItem('new')}>
          装備を追加
        </button>
      </div>
      <p className="read-summary">
        {counts.map((entry) => (
          <span key={entry.field} className={entry.ready === entry.total && entry.total > 0 ? 'read-chip' : 'read-chip missing'}>
            {READ_LABELS[entry.field]} {entry.ready}/{entry.total}
          </span>
        ))}
      </p>
      <label className="field">
        <span className="field-label">検索</span>
        <input
          value={query}
          placeholder="名前または部位"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {equipped.length === 0 ? (
        <p className="muted">このプリセットに読み取った装備はありません。</p>
      ) : (
        <ul className="inventory-list">
          {equipped.map(({ slot, item }) => (
            <InventoryRow
              key={item.id}
              slotLabel={slot.label}
              item={item}
              onEdit={() => setEditorItem(item)}
              onDelete={() => {
                if (window.confirm(`${item.name} を削除しますか？`)) removeItem(item.id)
              }}
            />
          ))}
        </ul>
      )}
      {extra.length > 0 ? (
        <>
          <h3>手入力</h3>
          <ul className="inventory-list">
            {extra.map((item) => (
              <InventoryRow
                key={item.id}
                slotLabel={labelForSlotGroup(item.slotGroup)}
                item={item}
                onEdit={() => setEditorItem(item)}
                onDelete={() => {
                  if (window.confirm(`${item.name} を削除しますか？`)) removeItem(item.id)
                }}
              />
            ))}
          </ul>
        </>
      ) : null}
      {editorItem !== null ? (
        <EquipmentEditor
          open
          slotGroup={
            editorItem === 'new' ? ('weapon' satisfies EquipmentSlotGroup) : editorItem.slotGroup
          }
          item={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => setEditorItem(null)}
        />
      ) : null}
    </section>
  )
}

function InventoryRow({
  slotLabel,
  item,
  onEdit,
  onDelete,
}: {
  slotLabel: string
  item: EquipmentItem
  onEdit: () => void
  onDelete: () => void
}) {
  const marks = readMarks(item, slotLabel)
  return (
    <li className="inventory-item">
      <ItemThumb item={item} />
      <div>
        <strong>
          {slotLabel}
          {item.name !== slotLabel ? `　${item.name}` : ''}
        </strong>
        <p className="muted">
          {item.starForce !== null ? `★${item.starForce}` : '★未取得'}
          {item.enhanceText ? ` / ${item.enhanceText}` : ''}
        </p>
        <p className="read-summary">
          {marks.got.map((label) => (
            <span key={label} className="read-chip">
              {label} 取得
            </span>
          ))}
          {marks.missing.map((label) => (
            <span key={label} className="read-chip missing">
              {label} 未取得
            </span>
          ))}
        </p>
        {item.stats.length > 0 ? (
          <p>{item.stats.map((line) => `${line.label} ${line.value}`).join(' / ')}</p>
        ) : null}
        {item.potentials.length > 0 ? <p>潜在 {item.potentials.map((line) => line.text).join(' / ')}</p> : null}
        {item.additionalPotentials.length > 0 ? (
          <p>アディショナル {item.additionalPotentials.map((line) => line.text).join(' / ')}</p>
        ) : null}
        {item.notes && item.notes !== '画面から読み取り' ? (
          <p className="muted">{item.notes.replaceAll('\n', ' / ')}</p>
        ) : null}
      </div>
      <div className="inventory-actions">
        <button type="button" className="button-quiet" onClick={onEdit}>
          編集
        </button>
        <button type="button" className="button-danger" onClick={onDelete}>
          削除
        </button>
      </div>
    </li>
  )
}
