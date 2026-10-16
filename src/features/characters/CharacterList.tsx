import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { canonicalWorldName, worldByValue } from '../../data/worlds.ts'
import type { Character } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { WorldIcon } from './WorldIcon.tsx'

export function CharacterList({
  side,
  onSide,
}: {
  side: 'character' | 'boss' | 'gacha'
  onSide: (side: 'character' | 'boss' | 'gacha') => void
}) {
  const { data } = useAppStore()

  return (
    <nav aria-labelledby="character-list-heading">
      <div className="sidebar-header">
        <h2 id="character-list-heading">キャラクター</h2>
        <NavLink to="/" end className="link-button" onClick={() => onSide('character')}>
          新規登録
        </NavLink>
      </div>
      {data.characters.length === 0 ? (
        <p className="muted">まだキャラクターはいません</p>
      ) : (
        <ul className="character-list">
          {data.characters.map((character) => (
            <li key={character.id}>
              <NavLink
                to={`/characters/${character.id}`}
                className="character-link"
                onClick={() => onSide('character')}
              >
                {character.portraitDataUrl ? (
                  <img
                    className="character-thumb"
                    src={character.portraitDataUrl}
                    alt=""
                  />
                ) : (
                  <span className="character-thumb placeholder" aria-hidden="true">
                    {character.name.slice(0, 1)}
                  </span>
                )}
                <span className="character-text">
                  <span className="character-name">{character.name}</span>
                  <CharacterSummary character={character} />
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
      <div className="sidebar-tabs" role="tablist" aria-label="キャラクター以外">
        <button
          type="button"
          role="tab"
          aria-selected={side === 'boss'}
          className={side === 'boss' ? 'workspace-tab active' : 'workspace-tab'}
          onClick={() => onSide(side === 'boss' ? 'character' : 'boss')}
        >
          月/週ボス
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={side === 'gacha'}
          className={side === 'gacha' ? 'workspace-tab active' : 'workspace-tab'}
          onClick={() => onSide(side === 'gacha' ? 'character' : 'gacha')}
        >
          ガチャ
        </button>
      </div>
    </nav>
  )
}

function CharacterSummary({ character }: { character: Character }) {
  const parts: ReactNode[] = []
  if (character.level !== null) parts.push(`Lv.${character.level}`)
  if (character.world) {
    const world = worldByValue(character.world)
    parts.push(
      <span className="world-chip">
        <WorldIcon world={character.world} />
        {world?.iconFile ? (
          <span className="visually-hidden">{canonicalWorldName(character.world)}</span>
        ) : world ? null : (
          canonicalWorldName(character.world)
        )}
      </span>,
    )
  }
  if (character.job) parts.push(character.job)
  if (parts.length === 0) return null

  return (
    <span className="character-summary">
      {parts.map((part, index) => (
        <span key={index} className="character-summary-part">
          {index > 0 ? <span aria-hidden="true"> / </span> : null}
          {part}
        </span>
      ))}
    </span>
  )
}
