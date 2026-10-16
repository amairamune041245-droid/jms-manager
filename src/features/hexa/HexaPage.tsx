import { useState } from 'react'
import { hexaCatalogForJob } from '../../data/hexa/index.ts'
import type { Character } from '../../domain/types.ts'
import { HexaMatrix } from './HexaMatrix.tsx'
import { HexaStats } from './HexaStats.tsx'

type HexaView = 'skills' | 'stats'

export function HexaPage({ character }: { character: Character }) {
  const catalog = hexaCatalogForJob(character.jobId)
  const [view, setView] = useState<HexaView>('skills')

  return (
    <section className="panel hexa-panel">
      <div className="panel-heading">
        <h2>HEXAマトリックス</h2>
        <div className="workspace-tabs" role="tablist" aria-label="HEXA表示">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'skills'}
            className={view === 'skills' ? 'workspace-tab active' : 'workspace-tab'}
            onClick={() => setView('skills')}
          >
            HEXAスキル
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'stats'}
            className={view === 'stats' ? 'workspace-tab active' : 'workspace-tab'}
            onClick={() => setView('stats')}
          >
            HEXAステータス
          </button>
        </div>
      </div>
      {view === 'skills' ? (
        <>
          <HexaMatrix character={character} skills={catalog.skills} />
        </>
      ) : (
        <HexaStats character={character} embedded />
      )}
    </section>
  )
}
