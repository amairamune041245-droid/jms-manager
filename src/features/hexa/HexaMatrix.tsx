import { useState } from 'react'
import {
  SKILL_MATRIX_LAYOUT,
  SKILL_MATRIX_LINKS,
  bindMatrixSlots,
  matrixNodeBox,
} from '../../data/hexa/matrixLayout.ts'
import type { BoundMatrixSlot, MatrixGroup } from '../../data/hexa/matrixLayout.ts'
import type { HexaSkillDef, HexaSkillRole } from '../../data/hexa/types.ts'
import { hexaForCharacter } from '../../domain/hexa.ts'
import { HEXA_SKILL_MAX_LEVEL } from '../../domain/types.ts'
import type { Character } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { SkillIcon } from './SkillIcon.tsx'
import { HexaLevelSheet } from './HexaLevelSheet.tsx'

const GROUP_LABEL: Record<MatrixGroup, string> = {
  skill: 'スキル',
  mastery: 'マスタリー',
  enhance: '強化',
  common: '共用',
}

const ROLE_LABEL: Record<HexaSkillRole, string> = {
  origin: 'オリジン',
  ascent: 'アセント',
  boost: 'スキル',
  mastery: 'マスタリー',
  enhance: '強化',
  common: '共用',
}

export function HexaMatrix({
  character,
  skills,
}: {
  character: Character
  skills: HexaSkillDef[]
}) {
  const { data, setHexaSkillLevel } = useAppStore()
  const hexa = hexaForCharacter(data, character.id)
  const slots = bindMatrixSlots(skills)
  const board = SKILL_MATRIX_LAYOUT
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = slots.find((slot) => slot.id === selectedId) ?? null

  return (
    <div className="hexa-stage">
      <div className="matrix-wrap">
        <div
          className="matrix-board"
          role="group"
          aria-label="HEXAマトリックス"
          style={{ aspectRatio: `${board.viewWidth} / ${board.viewHeight}` }}
        >
          <svg
            className="matrix-links"
            viewBox={`${board.viewX} ${board.viewY} ${board.viewWidth} ${board.viewHeight}`}
            aria-hidden="true"
          >
            {SKILL_MATRIX_LINKS.map(([x1, y1, x2, y2]) => (
              <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </svg>
          <div
            className="matrix-seal"
            aria-hidden="true"
            style={{
              left: `${((board.mark.x - board.viewX) / board.viewWidth) * 100}%`,
              top: `${((board.mark.y - board.viewY) / board.viewHeight) * 100}%`,
            }}
          />
          {slots.map((slot) => (
            <MatrixNode
              key={slot.id}
              slot={slot}
              level={slot.skill ? (hexa.skillLevels[slot.skill.id] ?? 0) : 0}
              selected={slot.id === selectedId}
              onSelect={() => setSelectedId(slot.id === selectedId ? null : slot.id)}
            />
          ))}
        </div>
        <ul className="matrix-legend">
          <li className="group-skill">スキル</li>
          <li className="group-mastery">マスタリー</li>
          <li className="group-enhance">強化</li>
          <li className="group-common">共用</li>
          <li className="group-locked">未解放</li>
        </ul>
      </div>
      <HexaLevelSheet
        slots={slots}
        levels={hexa.skillLevels}
        onLevel={(skillId, level) => setHexaSkillLevel(character.id, skillId, level)}
      />
      <div className="hexa-side">
        {selected ? (
          <NodeDetail
            slot={selected}
            level={selected.skill ? (hexa.skillLevels[selected.skill.id] ?? 0) : 0}
            onLevel={(level) => {
              if (selected.skill) setHexaSkillLevel(character.id, selected.skill.id, level)
            }}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <p className="matrix-hint">活性化または強化するコアを選択してください。</p>
        )}
      </div>
    </div>
  )
}

function MatrixNode({
  slot,
  level,
  selected,
  onSelect,
}: {
  slot: BoundMatrixSlot
  level: number
  selected: boolean
  onSelect: () => void
}) {
  const locked = slot.skill === null
  const name = slot.skill?.name ?? '未解放'
  const label = locked
    ? `${GROUP_LABEL[slot.group]}、未解放。${slot.lockedReason}`
    : `${name}、${ROLE_LABEL[slot.skill!.role]}、現在レベル ${level}`

  return (
    <button
      type="button"
      className={[
        'hex-node',
        `group-${slot.group}`,
        locked ? 'locked' : '',
        !locked && level > 0 ? 'charged' : '',
        selected ? 'selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={matrixNodeBox(slot)}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
    >
      <span className="hex-face">
        <span className="hex-core">
          {locked ? <LockIcon /> : <SkillIcon skill={slot.skill!} className="hex-icon" />}
          {locked ? null : (
            <span className="hex-level">{String(level).padStart(2, '0')}</span>
          )}
        </span>
      </span>
    </button>
  )
}

function NodeDetail({
  slot,
  level,
  onLevel,
  onClose,
}: {
  slot: BoundMatrixSlot
  level: number
  onLevel: (level: number) => void
  onClose: () => void
}) {
  if (!slot.skill) {
    return (
      <div className="hex-popover" role="dialog" aria-label="未解放ノード">
        <strong>{GROUP_LABEL[slot.group]}</strong>
        <span className="chip">未解放</span>
        <p>{slot.lockedReason}</p>
        <button type="button" className="button-quiet" onClick={onClose}>
          閉じる
        </button>
      </div>
    )
  }

  const skill = slot.skill
  return (
    <div className="hex-popover" role="dialog" aria-label={skill.name}>
      <strong>{skill.name}</strong>
      <span className="chip">{ROLE_LABEL[skill.role]}</span>
      <span className="chip">{skill.jmsStatus === 'wiki' ? 'ナムウィキ' : 'JMS'}</span>
      <p>{skill.description}</p>
      <p className="muted">{skill.sourceName}</p>
      <label className="field hex-level-field">
        <span className="field-label">現在レベル / {skill.maxLevel}</span>
        <input
          type="number"
          min={0}
          max={HEXA_SKILL_MAX_LEVEL}
          value={level}
          onChange={(event) => onLevel(Number(event.target.value || 0))}
        />
      </label>
      <button type="button" className="button-quiet" onClick={onClose}>
        閉じる
      </button>
    </div>
  )
}

function LockIcon() {
  return (
    <svg className="hex-lock" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" fill="currentColor" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
