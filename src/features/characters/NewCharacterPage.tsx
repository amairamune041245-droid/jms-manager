import { useNavigate } from 'react-router-dom'
import { emptyCharacterForm } from '../../domain/characters.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { CharacterForm } from './CharacterForm.tsx'

export function NewCharacterPage() {
  const navigate = useNavigate()
  const { register } = useAppStore()

  return (
    <>
      <CharacterForm
        title="キャラクター登録"
        submitLabel="登録"
        initialValues={emptyCharacterForm}
        initialPortrait={null}
        onSubmit={(input) => {
          const character = register(input)
          navigate(`/characters/${character.id}`)
        }}
      />
      <section className="panel">
        <h2>装備スロット</h2>
        <p className="muted">登録すると表示されます</p>
      </section>
    </>
  )
}
