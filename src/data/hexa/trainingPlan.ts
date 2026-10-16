import type { HexaSkillDef } from './types.ts'

export type TrainingPlanSource = 'provisional' | 'recommended' | 'custom'

/**
 * One upgrade step. Array order is the training order.
 * `id` stays stable when the array is reordered, so a future custom
 * or recommended plan can move steps without renaming them.
 */
export type TrainingStep = {
  id: string
  skillId: string
  targetLevel: number
}

export type TrainingPlan = {
  id: string
  label: string
  source: TrainingPlanSource
  steps: TrainingStep[]
}

const PROVISIONAL_LABEL =
  '暫定の育成順です。同じ目標レベルを、オリジン、ソルヤーヌス、アセント、強化と職業群共用、ソル・ヘカテ、マスタリー、その他のスキルの順に一周します。公式のおすすめ順ではありません。目標レベルに到達した段は点灯します。'

export function buildProvisionalTrainingPlan(skills: HexaSkillDef[]): TrainingPlan {
  const ordered = skills
    .filter((skill) => skill.jmsStatus !== 'unlisted')
    .slice()
    .sort((a, b) => skillRank(a) - skillRank(b) || a.name.localeCompare(b.name, 'ja'))

  const steps: TrainingStep[] = []
  for (let level = 1; level <= 30; level += 1) {
    for (const skill of ordered) {
      steps.push({
        id: `${skill.id}@${level}`,
        skillId: skill.id,
        targetLevel: level,
      })
    }
  }

  return {
    id: 'provisional-round-robin',
    label: PROVISIONAL_LABEL,
    source: 'provisional',
    steps,
  }
}

export function stepReached(currentLevel: number, step: Pick<TrainingStep, 'targetLevel'>): boolean {
  return currentLevel >= step.targetLevel
}

function skillRank(skill: HexaSkillDef): number {
  if (skill.role === 'origin') return 0
  if (skill.id === 'common-sol-janus') return 1
  if (skill.role === 'ascent') return 2
  if (skill.role === 'enhance') return 3
  if (skill.role === 'common' && skill.id !== 'common-sol-hecate') return 3
  if (skill.id === 'common-sol-hecate') return 4
  if (skill.role === 'mastery') return 5
  return 6
}
