import { COMMON_HEXA_SKILLS } from './common.ts'
import { wikiSkillIcon } from './icons.ts'
import type { HexaSkillDef, JobHexaCatalog } from './types.ts'

const CHECKED = '2026-10-13'
const NAMU_CHECKED = '2026-10-14'
const NAMU_SHARED_CORE =
  'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4'

export type JobSkillDraft = {
  id: string
  name: string
  role: Extract<HexaSkillDef['role'], 'origin' | 'ascent' | 'boost' | 'mastery' | 'enhance'>
  description: string
  sourceUrl: string
  iconFile?: string
  iconUrl?: string
  kmsSkillId?: number
  /** ナムウィキ由来。JMS公式6次欄では未確認。 */
  fromNamu?: boolean
  sourceName?: string
  /** 職業群共用コア。マトリックスもヘキサ強化も共用枠に置く。 */
  shared?: boolean
  /** false のとき一覧に出さない。JMSのゲーム画面では未解放。 */
  listed?: boolean
}

/** 職業群共用コア。強化コアと同じidでも、ヘキサ強化とマトリックスでは共用に置く。 */
const SHARED_DRAFT_IDS = new Set([
  'enhance-blitz',
  'enhance-arcana',
  'enhance-evolve',
  'enhance-ds',
  'enhance-flag',
  'enhance-fried',
  'enhance-phalanx',
  'enhance-infantry',
  'enhance-mastema',
  'enhance-pantheon',
  'enhance-transcendent',
  'enhance-afterimage',
  'enhance-circuit',
  'enhance-fury',
  'enhance-gentleman',
])

function isShared(skill: JobSkillDraft): boolean {
  return skill.shared === true || SHARED_DRAFT_IDS.has(skill.id)
}

function coreKind(skill: JobSkillDraft): HexaSkillDef['kind'] {
  if (isShared(skill)) return 'common-core'
  if (skill.role === 'enhance') return 'enhance-core'
  if (skill.role === 'mastery') return 'mastery-core'
  return 'skill-core'
}

export function jobCatalog(
  jobId: string,
  sourceUrl: string,
  skills: JobSkillDraft[],
  masteryNote?: string,
): JobHexaCatalog {
  return {
    jobId,
    skills: [
      ...COMMON_HEXA_SKILLS,
      ...skills.map((skill) => ({
        id: `${jobId}-${skill.id}`,
        name: skill.name,
        kind: coreKind(skill),
        role: isShared(skill) ? 'common' : skill.role,
        description: skill.description,
        maxLevel: 30 as const,
        jmsStatus:
          skill.listed === false ? ('unlisted' as const) : skill.fromNamu ? ('wiki' as const) : ('implemented' as const),
        sourceName: skill.fromNamu
          ? (skill.sourceName ?? 'ナムウィキ HEXAマトリックス/共用コア')
          : 'JMS公式 職業紹介（6次職スキル）',
        sourceUrl: skill.fromNamu ? skill.sourceUrl || NAMU_SHARED_CORE : skill.sourceUrl || sourceUrl,
        sourceCheckedOn: skill.fromNamu ? NAMU_CHECKED : CHECKED,
        iconUrl: skill.iconUrl ?? (skill.iconFile ? wikiSkillIcon(skill.iconFile) : undefined),
        kmsSkillId: skill.kmsSkillId,
      })),
    ],
    masteryNote:
      masteryNote ??
      'マスタリーコア（4次以下スキル強化）の個別一覧は、確認したJMS公式職業ページの6次欄に掲載されていません。',
  }
}

export function mergeCatalog(base: JobHexaCatalog, drafts: JobSkillDraft[]): JobHexaCatalog {
  const hasMastery = base.skills.some((skill) => skill.kind === 'mastery-core')
  const hasEnhance = base.skills.some((skill) => skill.kind === 'enhance-core')
  const hasBoost = base.skills.some((skill) => skill.role === 'boost')
  const hasShared = base.skills.some(
    (skill) =>
      skill.kind === 'common-core' &&
      skill.id !== 'common-sol-janus' &&
      skill.id !== 'common-sol-hecate',
  )
  const kept = drafts.filter((draft) => {
    if (draft.role === 'origin' && base.skills.some((skill) => skill.role === 'origin')) return false
    if (draft.role === 'ascent' && base.skills.some((skill) => skill.role === 'ascent')) return false
    if (draft.role === 'mastery' && hasMastery) return false
    if (draft.role === 'enhance' && hasEnhance && !isShared(draft)) return false
    if (draft.role === 'boost' && hasBoost) return false
    if (isShared(draft) && hasShared) return false
    return true
  })
  if (kept.length === 0) return base
  const added = jobCatalog(base.jobId, '', kept).skills.filter(
    (skill) => skill.id !== 'common-sol-janus' && skill.id !== 'common-sol-hecate',
  )
  return {
    ...base,
    skills: [...base.skills, ...added],
    masteryNote: kept.some((draft) => draft.role === 'mastery')
      ? 'マスタリーコアはナムウィキのHEXA欄に4つある。スキルコアは掲載分だけ置き、残りはロックしている。'
      : base.masteryNote,
  }
}

export function emptyJobCatalog(jobId: string): JobHexaCatalog {
  return {
    jobId,
    skills: [...COMMON_HEXA_SKILLS],
    masteryNote:
      'この職業のオリジン／アセント／強化コア名称は、今回JMS公式職業ページから未取得です。共用コアのみ表示します。',
  }
}
