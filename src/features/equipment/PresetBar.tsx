import { useState } from 'react'
import type { CharacterLoadout } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function PresetBar({
  characterId,
  loadout,
}: {
  characterId: string
  loadout: CharacterLoadout
}) {
  const { setActivePreset, renamePreset, duplicatePreset } = useAppStore()
  const [editing, setEditing] = useState<0 | 1 | 2 | null>(null)
  const [draft, setDraft] = useState('')
  const [copyFrom, setCopyFrom] = useState<0 | 1 | 2>(loadout.activePresetIndex)

  const active = loadout.presets[loadout.activePresetIndex]

  return (
    <div className="preset-bar">
      <div className="preset-line">
        <span className="preset-label">PRESETS</span>
        <div className="preset-tabs" role="tablist" aria-label="装備プリセット">
          {loadout.presets.map((preset, index) => {
            const presetIndex = index as 0 | 1 | 2
            const selected = loadout.activePresetIndex === presetIndex
            return (
              <button
                key={presetIndex}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={preset.name}
                title={preset.name}
                className={selected ? 'preset-tab active' : 'preset-tab'}
                onClick={() => setActivePreset(characterId, presetIndex)}
                onDoubleClick={() => {
                  setEditing(presetIndex)
                  setDraft(preset.name)
                }}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        <span className="preset-name">{active?.name}</span>
      </div>
      {editing !== null ? (
        <form
          className="preset-rename"
          onSubmit={(event) => {
            event.preventDefault()
            renamePreset(characterId, editing, draft)
            setEditing(null)
          }}
        >
          <label className="field inline-field">
            <span>プリセット名</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
          </label>
          <button type="submit">保存</button>
          <button type="button" className="button-quiet" onClick={() => setEditing(null)}>
            取消
          </button>
        </form>
      ) : (
        <form
          className="preset-copy"
          onSubmit={(event) => {
            event.preventDefault()
            duplicatePreset(characterId, copyFrom, loadout.activePresetIndex)
          }}
        >
          <button
            type="button"
            className="button-quiet"
            onClick={() => {
              setEditing(loadout.activePresetIndex)
              setDraft(active?.name ?? '')
            }}
          >
            名前
          </button>
          <label className="field inline-field">
            <span>複製元</span>
            <select
              value={copyFrom}
              onChange={(event) =>
                setCopyFrom(Number(event.target.value) as 0 | 1 | 2)
              }
            >
              {loadout.presets.map((preset, index) => (
                <option key={preset.name + index} value={index}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">複製</button>
        </form>
      )}
    </div>
  )
}
