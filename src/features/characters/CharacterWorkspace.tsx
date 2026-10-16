import { useState } from 'react'
import { characterToFormValues } from '../../domain/characters.ts'
import type { Character } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { EquipmentBoard } from '../equipment/EquipmentBoard.tsx'
import { ItemInventory } from '../equipment/ItemInventory.tsx'
import { HexaPage } from '../hexa/HexaPage.tsx'
import { TrainingOrder } from '../hexa/TrainingOrder.tsx'
import { MainStatConverter } from '../stats/MainStatConverter.tsx'
import { CharacterForm } from './CharacterForm.tsx'

type MainView = 'equipment' | 'hexa' | 'convert' | 'profile'

export function CharacterWorkspace({ character }: { character: Character }) {
  const { update } = useAppStore()
  const [view, setView] = useState<MainView>('equipment')
  const [notice, setNotice] = useState('')

  return (
    <div className="workspace">
      <div className="workspace-tabs" role="tablist" aria-label="表示">
        <ViewTab id="profile" current={view} onSelect={setView}>
          キャラクター編集
        </ViewTab>
        <ViewTab id="equipment" current={view} onSelect={setView}>
          装備
        </ViewTab>
        <ViewTab id="hexa" current={view} onSelect={setView}>
          6次スキル
        </ViewTab>
        <ViewTab id="convert" current={view} onSelect={setView}>
          換算
        </ViewTab>
      </div>
      {view === 'equipment' ? <EquipmentBoard character={character} /> : null}
      {view === 'equipment' ? <ItemInventory characterId={character.id} /> : null}
      {view === 'hexa' ? <HexaPage character={character} /> : null}
      {view === 'hexa' ? <TrainingOrder character={character} /> : null}
      {view === 'convert' ? <MainStatConverter character={character} /> : null}
      {view === 'profile' ? (
        <CharacterForm
          key={`${character.id}:${character.updatedAt}`}
          title="キャラクター編集"
          submitLabel="保存"
          initialValues={characterToFormValues(character)}
          initialPortrait={character.portraitDataUrl}
          notice={notice}
          onDirty={() => setNotice('')}
          onSubmit={(input) => {
            update(character.id, input)
            setNotice('保存しました')
          }}
        />
      ) : null}
    </div>
  )
}

function ViewTab({
  id,
  current,
  onSelect,
  children,
}: {
  id: MainView
  current: MainView
  onSelect: (id: MainView) => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={current === id}
      className={current === id ? 'workspace-tab active' : 'workspace-tab'}
      onClick={() => onSelect(id)}
    >
      {children}
    </button>
  )
}
