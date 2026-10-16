import { HEXA_SKILL_MAX_LEVEL } from '../../domain/types.ts'
import type { BoundMatrixSlot, MatrixGroup } from '../../data/hexa/matrixLayout.ts'
import { SkillIcon } from './SkillIcon.tsx'

const ROWS: { group: MatrixGroup; label: string }[] = [
  { group: 'skill', label: 'スキル' },
  { group: 'mastery', label: 'マスタリー' },
  { group: 'enhance', label: '強化' },
  { group: 'common', label: '共用' },
]

export function HexaLevelSheet({
  slots,
  levels,
  onLevel,
}: {
  slots: BoundMatrixSlot[]
  levels: Record<string, number>
  onLevel: (skillId: string, level: number) => void
}) {
  return (
    <section className="hexa-levels" aria-label="ヘキサ強化">
      <h3>ヘキサ強化</h3>
      {ROWS.map((row) => {
        const cells = slots.filter((slot) => slot.group === row.group && slot.skill)
        if (row.group === 'skill') {
          cells.sort((a, b) => a.x - b.x || a.y - b.y)
        }
        if (row.group === 'mastery') {
          cells.sort((a, b) => bindIndex(a, 'mastery-index') - bindIndex(b, 'mastery-index'))
        }
        if (row.group === 'common') {
          cells.sort((a, b) => commonOrder(a.skill?.id) - commonOrder(b.skill?.id))
        }
        if (cells.length === 0) return null
        return (
          <div className="hexa-level-row" key={row.group}>
            <span className="hexa-level-label">{row.label}</span>
            <div className="hexa-level-cells">
              {cells.map((slot) => {
                const skill = slot.skill!
                const level = levels[skill.id] ?? 0
                return (
                  <label className="hexa-level-cell" key={slot.id}>
                    <SkillIcon skill={skill} className="hexa-level-icon" />
                    <input
                      className="hexa-level-input"
                      type="number"
                      min={0}
                      max={HEXA_SKILL_MAX_LEVEL}
                      aria-label={`${skill.name}のレベル`}
                      value={level}
                      onChange={(event) => onLevel(skill.id, Number(event.target.value || 0))}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function bindIndex(slot: BoundMatrixSlot, type: 'mastery-index' | 'enhance-index'): number {
  return slot.bind.type === type ? slot.bind.index : 99
}

function commonOrder(skillId: string | undefined): number {
  if (skillId === 'common-sol-janus') return 0
  if (skillId === 'common-sol-hecate') return 1
  return 2
}
