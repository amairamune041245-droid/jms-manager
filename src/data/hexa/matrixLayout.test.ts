import { describe, expect, it } from 'vitest'
import { JOBS } from '../jobs.ts'
import { hexaCatalogForJob } from './index.ts'
import { bindMatrixSlots } from './matrixLayout.ts'
import { buildProvisionalTrainingPlan, stepReached } from './trainingPlan.ts'

describe('HEXA matrix slots', () => {
  it('pins hero cores and leaves later skill slots locked', () => {
    const slots = bindMatrixSlots(hexaCatalogForJob('hero').skills)
    expect(slots.find((slot) => slot.id === 'origin')?.skill?.role).toBe('origin')
    expect(slots.find((slot) => slot.id === 'ascent')?.skill?.role).toBe('ascent')
    expect(slots.find((slot) => slot.id === 'janus')?.skill?.id).toBe('common-sol-janus')
    expect(slots.find((slot) => slot.id === 'hecate')?.skill?.id).toBe('common-sol-hecate')
    expect(slots.find((slot) => slot.id === 'common-0')?.skill?.name).toBe('ブリッツシールドⅥ')
    expect(slots.find((slot) => slot.id === 'enhance-0')?.skill?.name).toBe('ソードオブバーニングソウル強化')
    expect(slots.find((slot) => slot.id === 'common-locked')?.skill).toBeNull()
    expect(slots.find((slot) => slot.id === 'common-locked')?.group).toBe('common')
    expect(slots.find((slot) => slot.id === 'mastery-3')?.skill?.name).toBe('レイジングブローⅥ')
    expect(slots.find((slot) => slot.id === 'mastery-0')?.skill?.name).toBe('ヴァルハラⅥ')
    expect(slots.find((slot) => slot.id === 'skill-3')?.skill).toBeNull()
    expect(slots.find((slot) => slot.id === 'skill-extra')?.skill).toBeNull()
    expect(slots.find((slot) => slot.id === 'origin')?.skill?.iconUrl).toContain(
      'Skill_Spirit_Calibur.png',
    )
    expect(slots.find((slot) => slot.id === 'mastery-0')?.skill?.iconUrl).toContain('static.nexon.co.jp')
    expect(hexaCatalogForJob('nightwalker').skills.find((skill) => skill.role === 'origin')?.iconUrl).toContain(
      'static.nexon.co.jp',
    )
    const cannon = hexaCatalogForJob('cannoneer')
    expect(cannon.skills.find((skill) => skill.role === 'origin')?.iconUrl).toContain(
      'media.maplestorywiki.net',
    )
    expect(cannon.skills.find((skill) => skill.role === 'boost')?.iconUrl).toContain('i.namu.wiki')
    expect(cannon.skills.find((skill) => skill.id === 'cannoneer-enhance-flag')?.iconUrl).toContain(
      'media.maplestorywiki.net',
    )
    expect(hexaCatalogForJob('hayato').skills.find((skill) => skill.role === 'mastery')?.iconUrl).toBeUndefined()
    expect(hexaCatalogForJob('kanna').skills.find((skill) => skill.role === 'boost')).toBeUndefined()
    expect(slots.find((slot) => slot.id === 'janus')?.skill?.kmsSkillId).toBe(500001000)
    const ice = bindMatrixSlots(hexaCatalogForJob('archmage-il').skills)
    expect(ice.find((slot) => slot.id === 'skill-extra')?.skill).toBeNull()
    expect(hexaCatalogForJob('archmage-il').skills.find((skill) => skill.role === 'boost')?.jmsStatus).toBe(
      'unlisted',
    )
    expect(ice.find((slot) => slot.id === 'ascent')?.skill?.name).toBe('パラボリックボルト')
    expect(ice.find((slot) => slot.id === 'origin')?.skill?.name).toBe('フローズンライトニング')
    expect(ice.find((slot) => slot.id === 'mastery-3')?.skill?.name).toBe('チェインライトニングⅥ')
    expect(ice.find((slot) => slot.id === 'mastery-2')?.skill?.name).toBe('フローズンオーブⅥ')
    expect(ice.find((slot) => slot.id === 'mastery-1')?.skill?.name).toBe('ライトニングスフィアⅥ')
    expect(ice.find((slot) => slot.id === 'mastery-0')?.skill?.name).toBe('サンダースフィアⅥ')
    expect(ice.find((slot) => slot.id === 'enhance-0')?.skill?.name).toBe('フロストアーク強化')
    expect(ice.find((slot) => slot.id === 'common-0')?.skill?.name).toBe('アルカナオーバーライドⅥ')
    expect(ice.find((slot) => slot.id === 'common-locked')?.skill).toBeNull()
    expect(ice.find((slot) => slot.id === 'janus')?.x).toBe(299)
    expect(ice.find((slot) => slot.id === 'ascent')?.x).toBe(135)
    expect(ice.find((slot) => slot.id === 'origin')?.x).toBe(205)
    expect(ice.find((slot) => slot.id === 'mastery-0')?.y).toBe(62)
    expect(ice.find((slot) => slot.id === 'mastery-0')?.x).toBe(443)
  })

  it('keeps the same slot ids when the job has no origin', () => {
    const slots = bindMatrixSlots(hexaCatalogForJob('missing-job').skills)
    expect(slots.map((slot) => slot.id)).toEqual(bindMatrixSlots([]).map((slot) => slot.id))
    expect(slots.find((slot) => slot.id === 'origin')?.skill).toBeNull()
    expect(slots.find((slot) => slot.id === 'janus')?.skill?.name).toBe('ソルヤーヌス')
  })

  it('shows origin, four masteries, four enhances and a shared core for every job', () => {
    for (const job of JOBS) {
      const slots = bindMatrixSlots(hexaCatalogForJob(job.id).skills)
      expect(slots.find((slot) => slot.id === 'origin')?.skill?.name, job.id).toBeTruthy()
      expect(slots.filter((slot) => slot.group === 'mastery' && slot.skill), job.id).toHaveLength(4)
      expect(slots.filter((slot) => slot.group === 'enhance' && slot.skill), job.id).toHaveLength(4)
      expect(slots.find((slot) => slot.id === 'common-0')?.skill?.name, job.id).toBeTruthy()
    }
    expect(bindMatrixSlots(hexaCatalogForJob('kanna').skills).find((slot) => slot.id === 'skill-extra')?.skill).toBeNull()
    expect(bindMatrixSlots(hexaCatalogForJob('soulmaster').skills).find((slot) => slot.id === 'origin')?.skill?.name).toBe(
      'アストラルブリッツ',
    )
    expect(hexaCatalogForJob('striker').skills.find((skill) => skill.role === 'origin')?.name).toBe('雷鳴碧海波')
    expect(hexaCatalogForJob('lara').skills.find((skill) => skill.role === 'origin')?.name).toBe('麗らかお花畑')
    expect(
      hexaCatalogForJob('hayato').skills.find(
        (skill) =>
          skill.kind === 'common-core' && skill.id !== 'common-sol-janus' && skill.id !== 'common-sol-hecate',
      )?.name,
    ).toBe('曙光開花・陸')
    expect(hexaCatalogForJob('hero').skills.find((skill) => skill.role === 'boost')?.jmsStatus).toBe('unlisted')
  })
})

describe('HEXA training plan', () => {
  it('keeps step identity when the order array is rearranged', () => {
    const skills = hexaCatalogForJob('hero').skills
    const plan = buildProvisionalTrainingPlan(skills)
    expect(plan.source).toBe('provisional')
    expect(plan.steps[0]).toMatchObject({ targetLevel: 1 })
    expect(plan.steps[0]?.skillId).toContain('origin')
    const listed = skills.filter((skill) => skill.jmsStatus !== 'unlisted')
    expect(plan.steps).toHaveLength(listed.length * 30)
    expect(plan.steps.some((step) => step.skillId.endsWith('mastery-1') && step.targetLevel === 3)).toBe(true)

    const custom = {
      ...plan,
      id: 'custom',
      source: 'custom' as const,
      steps: [plan.steps[1]!, plan.steps[0]!, ...plan.steps.slice(2)],
    }
    expect(custom.steps[0]?.id).toBe(plan.steps[1]?.id)
    expect(stepReached(10, { targetLevel: 10 })).toBe(true)
    expect(stepReached(9, { targetLevel: 10 })).toBe(false)
  })
})
