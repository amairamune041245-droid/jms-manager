import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { CharacterList } from '../features/characters/CharacterList.tsx'
import { ThemeSwitcher } from '../features/app/ThemeSwitcher.tsx'
import { useAppStore } from '../features/app/useAppStore.ts'
import { BossTracker } from '../features/boss/BossTracker.tsx'
import { GachaBoard } from '../features/gacha/GachaBoard.tsx'

type Side = 'character' | 'boss' | 'gacha'

export function AppShell() {
  const { saveState, data } = useAppStore()
  const { id } = useParams()
  const [side, setSide] = useState<Side>('character')
  const characterId = id ?? data.characters[0]?.id ?? ''
  const savedLabel =
    saveState.status === 'saved'
      ? `保存済み ${formatTime(saveState.at)}`
      : saveState.message

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="brand">NEM Maple</p>
          <h1>メイプルストーリー管理</h1>
        </div>
        <div className="header-tools">
          <ThemeSwitcher />
          <p
            className={saveState.status === 'error' ? 'save-state error' : 'save-state'}
            role="status"
          >
            {savedLabel}
          </p>
        </div>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <CharacterList side={side} onSide={setSide} />
        </aside>
        <main className="main">
          {side === 'boss' ? (
            characterId ? (
              <BossTracker characterId={characterId} />
            ) : (
              <p className="muted">キャラクターを登録すると、月/週ボスを付けられます。</p>
            )
          ) : null}
          {side === 'gacha' ? <GachaBoard /> : null}
          {side === 'character' ? <Outlet /> : null}
        </main>
      </div>
    </div>
  )
}

function formatTime(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
