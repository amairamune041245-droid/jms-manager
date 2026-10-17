import { useState } from 'react'
import {
  DOCK_SLOT_IDS,
  EQUIPMENT_BOARD,
  EQUIPMENT_CHARACTER,
  EQUIPMENT_SLOT_FRAMES,
  frameStyle,
} from '../../domain/equipmentLayout.ts'
import { EQUIPMENT_SLOTS } from '../../domain/equipmentSlots.ts'
import type { EquipmentSlotGroup, EquipmentSlotId } from '../../domain/equipmentSlots.ts'
import { findItem } from '../../domain/items.ts'
import { activePreset } from '../../domain/presets.ts'
import type { Character, EquipmentItem } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { ActiveSetEffects } from './ActiveSetEffects.tsx'
import { EquipmentCapture } from './EquipmentCapture.tsx'
import { EquipmentEditor } from './EquipmentEditor.tsx'
import { ItemThumb, SlotPicker } from './SlotPicker.tsx'
import { PresetBar } from './PresetBar.tsx'

export function EquipmentBoard({ character }: { character: Character }) {
  const { data, assignSlot } = useAppStore()
  const loadout = data.loadoutsByCharacterId[character.id]
  const preset = loadout ? activePreset(loadout) : null
  const [pickerSlot, setPickerSlot] = useState<EquipmentSlotId | null>(null)
  const [editor, setEditor] = useState<{
    group: EquipmentSlotGroup
    item: EquipmentItem | null
    assignTo?: EquipmentSlotId
  } | null>(null)

  if (!loadout || !preset) return null
  const picker = pickerSlot
    ? EQUIPMENT_SLOTS.find((slot) => slot.id === pickerSlot)
    : undefined
  const paperdoll = EQUIPMENT_SLOTS.filter((slot) => slot.id in EQUIPMENT_SLOT_FRAMES)
  const tabs = EQUIPMENT_SLOTS.filter((slot) =>
    (DOCK_SLOT_IDS as readonly string[]).includes(slot.id),
  )

  return (
    <section className="panel equipment-panel">
      <div className="panel-heading">
        <h2>装備</h2>
        <EquipmentCapture characterId={character.id} />
      </div>
      <div className="eq-window">
        <div className="eq-stage">
        <div className="eq-main">
        <div
          className="eq-board"
          role="group"
          aria-label="装備スロット"
          style={{ aspectRatio: `${EQUIPMENT_BOARD.width} / ${EQUIPMENT_BOARD.height}` }}
        >
          <div
            className="eq-character"
            style={frameStyle(EQUIPMENT_CHARACTER)}
          >
            <div className="eq-portrait">
              <div className="eq-silhouette">{character.name.slice(0, 2)}</div>
            </div>
            <p className="eq-character-meta">
              <span>{character.job || '職業未設定'}</span>
              {character.level !== null ? <span>Lv.{character.level}</span> : null}
            </p>
          </div>
          {paperdoll.map((slot) => {
            const item = findItem(data, preset.slots[slot.id])
            const placed = EQUIPMENT_SLOT_FRAMES[slot.id as keyof typeof EQUIPMENT_SLOT_FRAMES]
            return (
              <button
                key={slot.id}
                type="button"
                className={item ? 'eq-slot filled' : 'eq-slot'}
                style={frameStyle(placed)}
                title={item ? `${slot.label}：${item.name}` : slot.label}
                aria-label={
                  item
                    ? `${slot.label}、${item.name}${item.starForce !== null ? `、星力${item.starForce}` : ''}`
                    : `${slot.label}、未装備`
                }
                onClick={() => setPickerSlot(slot.id)}
              >
                {item?.starForce !== null && item ? (
                  <span className="eq-star">★{item.starForce}</span>
                ) : null}
                {item ? <ItemThumb item={item} /> : <span className="eq-slot-name">{slot.label}</span>}
              </button>
            )
          })}
        </div>
        <PresetBar characterId={character.id} loadout={loadout} />
        {tabs.length > 0 ? <div className="eq-tab-row" role="group" aria-label="追加装備">
          {tabs.map((slot) => {
            const item = findItem(data, preset.slots[slot.id])
            return (
              <button
                key={slot.id}
                type="button"
                className={item ? 'eq-tab-slot filled' : 'eq-tab-slot'}
                title={item ? `${slot.label}：${item.name}` : slot.label}
                aria-label={item ? `${slot.label}、${item.name}` : `${slot.label}、未装備`}
                onClick={() => setPickerSlot(slot.id)}
              >
                {item ? <ItemThumb item={item} /> : <span className="eq-tab-mark" aria-hidden="true" />}
                <span>{slot.label}</span>
              </button>
            )
          })}
        </div> : null}
        </div>
        <ActiveSetEffects
          pieces={EQUIPMENT_SLOTS.flatMap((slot) => {
            const item = findItem(data, preset.slots[slot.id])
            return item ? [{ name: item.name, slotGroup: item.slotGroup }] : []
          })}
        />
        </div>
      </div>
      {picker ? (
        <SlotPicker
          open
          slotLabel={picker.label}
          slotGroup={picker.group}
          selectedId={preset.slots[picker.id]}
          onClose={() => setPickerSlot(null)}
          onSelect={(itemId) => {
            assignSlot(character.id, picker.id, itemId)
            setPickerSlot(null)
          }}
          onCreate={() => {
            setEditor({ group: picker.group, item: null, assignTo: picker.id })
          }}
          onEdit={(item) => setEditor({ group: item.slotGroup, item, assignTo: picker.id })}
        />
      ) : null}
      {editor ? (
        <EquipmentEditor
          open
          slotGroup={editor.group}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSaved={(itemId) => {
            if (editor.assignTo) assignSlot(character.id, editor.assignTo, itemId)
            setEditor(null)
            setPickerSlot(null)
          }}
        />
      ) : null}
    </section>
  )
}

