import { hexaCatalogForJob } from '../../data/hexa/index.ts'
import { skillGroup } from '../../data/hexa/matrixLayout.ts'
import type { HexaSkillDef } from '../../data/hexa/types.ts'
import { buildProvisionalTrainingPlan, stepReached } from '../../data/hexa/trainingPlan.ts'
import { hexaForCharacter } from '../../domain/hexa.ts'
import type { Character } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'
import { SkillIcon } from './SkillIcon.tsx'

export function TrainingOrder({ character }: { character: Character }) {
  const { data } = useAppStore()
  const hexa = hexaForCharacter(data, character.id)
  const catalog = hexaCatalogForJob(character.jobId)
  const plan = buildProvisionalTrainingPlan(catalog.skills)
  const skills = new Map(catalog.skills.map((skill) => [skill.id, skill]))
  const nextIndex = plan.steps.findIndex(
    (step) => !stepReached(hexa.skillLevels[step.skillId] ?? 0, step),
  )

  return (
    <section className="panel training-panel">
      <div className="panel-heading">
        <h2>HEXAスキル育成順</h2>
      </div>
      <p className="muted">{plan.label}</p>
      <ul className="training-current">
        {catalog.skills
          .filter((skill) => skill.jmsStatus !== 'unlisted')
          .map((skill) => (
            <li key={skill.id}>
              {skill.name}
              <span>Lv.{hexa.skillLevels[skill.id] ?? 0}</span>
            </li>
          ))}
      </ul>
      {plan.steps.length === 0 ? (
        <p className="muted">表示できるスキルがありません。</p>
      ) : (
        <ol className="training-row">
          {plan.steps.map((step, index) => {
            const skill = skills.get(step.skillId)
            if (!skill) return null
            const current = hexa.skillLevels[step.skillId] ?? 0
            const done = stepReached(current, step)
            return (
              <li
                key={step.id}
                className={[
                  'training-step',
                  `group-${skillGroup(skill)}`,
                  done ? 'done' : 'pending',
                  index === nextIndex ? 'next' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={`育成順 ${index + 1} ${skill.name} 目標Lv.${step.targetLevel} 現在Lv.${current}`}
                aria-label={`育成順 ${index + 1}、${skill.name}、目標レベル ${step.targetLevel}、現在レベル ${current}`}
              >
                <span className="training-token">
                  <TrainingIcon skill={skill} />
                  <span className="training-badge">{step.targetLevel}</span>
                </span>
                {index < plan.steps.length - 1 ? (
                  <span className="training-arrow" aria-hidden="true">
                    ›
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function TrainingIcon({ skill }: { skill: HexaSkillDef }) {
  return (
    <span className="training-icon" aria-hidden="true">
      <SkillIcon skill={skill} className="training-skill-img" />
    </span>
  )
}
