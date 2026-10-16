import { Link, useParams } from 'react-router-dom'
import { findCharacter } from '../../domain/characters.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { CharacterWorkspace } from './CharacterWorkspace.tsx'

export function EditCharacterPage() {
  const { id } = useParams()
  const { data } = useAppStore()
  const character = id ? findCharacter(data, id) : undefined

  if (!id || !character) {
    return (
      <section className="panel">
        <h2>キャラクターが見つかりません</h2>
        <Link to="/" className="link-button">
          一覧へ戻る
        </Link>
      </section>
    )
  }

  return <CharacterWorkspace character={character} />
}
