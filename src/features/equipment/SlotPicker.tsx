import { useEffect, useRef } from 'react'
import { labelForSlotGroup } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotGroup } from '../../domain/equipmentSlots.ts'
import { itemsForSlotGroup } from '../../domain/items.ts'
import type { EquipmentItem } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function SlotPicker({
  open,
  slotLabel,
  slotGroup,
  selectedId,
  onClose,
  onSelect,
  onCreate,
  onEdit,
}: {
  open: boolean
  slotLabel: string
  slotGroup: EquipmentSlotGroup
  selectedId: string | null
  onClose: () => void
  onSelect: (itemId: string | null) => void
  onCreate: () => void
  onEdit: (item: EquipmentItem) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data, removeItem } = useAppStore()
  const items = itemsForSlotGroup(data, slotGroup)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="picker">
        <h2>
          {slotLabel}（{labelForSlotGroup(slotGroup)}）
        </h2>
        <div className="actions">
          <button type="button" onClick={onCreate}>
            新規登録
          </button>
          <button type="button" className="button-quiet" onClick={() => onSelect(null)}>
            はずす
          </button>
        </div>
        {items.length === 0 ? (
          <p className="muted">この部位の装備はまだありません。</p>
        ) : (
          <ul className="picker-list">
            {items.map((item) => (
              <li key={item.id} className="picker-item">
                <button
                  type="button"
                  className={item.id === selectedId ? 'item-card selected' : 'item-card'}
                  onClick={() => onSelect(item.id)}
                >
                  <ItemThumb item={item} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{summarizeItem(item)}</small>
                  </span>
                </button>
                <button type="button" className="button-quiet" onClick={() => onEdit(item)}>
                  編集
                </button>
                <button
                  type="button"
                  className="button-danger"
                  onClick={() => {
                    if (window.confirm(`${item.name} を削除しますか？`)) {
                      removeItem(item.id)
                    }
                  }}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="button-quiet" onClick={onClose}>
          閉じる
        </button>
      </div>
    </dialog>
  )
}

export function ItemThumb({ item }: { item: EquipmentItem }) {
  if (item.imageDataUrl) {
    return <img className="slot-image" src={item.imageDataUrl} alt="" />
  }
  return (
    <span className="slot-image placeholder" aria-hidden="true">
      {item.name.slice(0, 1)}
    </span>
  )
}

function summarizeItem(item: EquipmentItem): string {
  const parts: string[] = []
  if (item.starForce !== null) parts.push(`★${item.starForce}`)
  if (item.enhanceText) parts.push(item.enhanceText)
  if (item.potentials[0]) parts.push(item.potentials[0].text)
  return parts.join(' / ') || '詳細なし'
}
