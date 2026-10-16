import { JOBS } from '../jobs.ts'
import { emptyJobCatalog, mergeCatalog } from './factory.ts'
import { ADVENTURER_HEXA } from './jobs/adventurer.ts'
import { HERO_HEXA } from './jobs/heroes.ts'
import { namuDraftsFor } from './jobs/namuExtra.ts'
import { withNamuIcons } from './jobs/namuIcons.ts'
import { applyOfficialHexa } from './jobs/officialSixth.ts'
import type { HexaSkillDef, JobHexaCatalog } from './types.ts'

const catalogs = [...ADVENTURER_HEXA, ...HERO_HEXA]

export function hexaCatalogForJob(jobId: string | null | undefined): JobHexaCatalog {
  if (!jobId) {
    return {
      jobId: '',
      skills: emptyJobCatalog('unknown').skills,
      masteryNote: '職業を選ぶと、その職業の6次スキル一覧を表示します。共用コアは職業なしでも記録できます。',
    }
  }
  const base = catalogs.find((catalog) => catalog.jobId === jobId) ?? emptyJobCatalog(jobId)
  return applyOfficialHexa(withNamuIcons(mergeCatalog(base, namuDraftsFor(jobId))))
}

export function hexaSkillById(
  jobId: string | null | undefined,
  skillId: string,
): HexaSkillDef | undefined {
  return hexaCatalogForJob(jobId).skills.find((skill) => skill.id === skillId)
}

export function jobsWithDetailedHexa(): string[] {
  return catalogs.map((catalog) => catalog.jobId)
}

export function jobsMissingDetailedHexa(): string[] {
  const detailed = new Set(jobsWithDetailedHexa())
  return JOBS.map((job) => job.id).filter((id) => !detailed.has(id))
}

export type { HexaSkillDef, JobHexaCatalog } from './types.ts'
