export type HexaCoreKind =
  | 'skill-core'
  | 'mastery-core'
  | 'enhance-core'
  | 'common-core'

export type HexaSkillRole = 'origin' | 'ascent' | 'boost' | 'mastery' | 'enhance' | 'common'

export type HexaSkillDef = {
  id: string
  name: string
  kind: HexaCoreKind
  role: HexaSkillRole
  description: string
  maxLevel: 30
  jmsStatus: 'implemented' | 'wiki' | 'unlisted'
  sourceName: string
  sourceUrl: string
  sourceCheckedOn: string
  notes?: string
  /** Client skill icon. Hotlinked, not stored in this repo. */
  iconUrl?: string
  /** Skill id used by KMS/GMS skill data. Present only when the wiki template listed it. */
  kmsSkillId?: number
}

export type JobHexaCatalog = {
  jobId: string
  skills: HexaSkillDef[]
  masteryNote: string
}
