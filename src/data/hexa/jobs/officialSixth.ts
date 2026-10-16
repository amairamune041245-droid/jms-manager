import type { HexaSkillDef, JobHexaCatalog } from '../types.ts'
import { CORE_RENAMES, OFFICIAL_SIXTH } from './officialSixth.data.ts'

const CHECKED = '2026-10-16'
const JANUS_ID = 'common-sol-janus'
const HECATE_ID = 'common-sol-hecate'
const ORIGIN_BUFF =
  '10レベル：モンスター防御率無視20%増加。20レベル：ボスモンスター攻撃時のダメージ20%増加。30レベル：モンスター防御率無視30%増加、ボスモンスター攻撃時のダメージ30%増加。'
const ASCENT_BUFF =
  '10レベル：モンスター防御率無視10%増加、ボスモンスター攻撃時のダメージ10%増加。20レベル：同効果。30レベル：モンスター防御率無視20%増加。'

type SixthSkill = { name: string; text: string; icon: string }
type SixthBundle = { url: string; origin: SixthSkill; ascent: SixthSkill; shared: SixthSkill }

const sixthByJob = OFFICIAL_SIXTH as unknown as Record<string, SixthBundle>

export function applyOfficialHexa(catalog: JobHexaCatalog): JobHexaCatalog {
  if (catalog.jobId === 'archmage-il') return catalog
  const sixth = sixthByJob[catalog.jobId]
  if (!sixth) return catalog
  const renames = CORE_RENAMES[catalog.jobId] ?? {}
  let sharedUsed = false
  const skills = catalog.skills.map((skill) => {
    if (skill.role === 'origin') return paintSixth(skill, sixth.origin, sixth.url, ORIGIN_BUFF)
    if (skill.role === 'ascent') return paintSixth(skill, sixth.ascent, sixth.url, ASCENT_BUFF)
    if (skill.kind === 'common-core' && skill.id !== JANUS_ID && skill.id !== HECATE_ID) {
      if (sharedUsed) return skill
      sharedUsed = true
      return paintSixth(skill, sixth.shared, sixth.url, '')
    }
    if (skill.kind !== 'mastery-core' && skill.kind !== 'enhance-core') return skill
    const renamed = renames[skill.name]
    if (!renamed) return { ...skill, name: skill.name.replace(/VI/g, 'Ⅵ') }
    return {
      ...skill,
      name: skill.kind === 'enhance-core' ? enhanceName(renamed.name) : masteryName(renamed.name),
      iconUrl: preferHostedIcon(skill.iconUrl, renamed.icon),
    }
  })
  return {
    ...catalog,
    skills,
    masteryNote:
      'オリジン、アセント、共用コアはJMS公式の6次欄。マスタリーと強化は公式のスキル名に合わせ、ページに無いものだけナムウィキの名前を残している。3つ目のスキルコアはゲーム画面では未解放。',
  }
}

function paintSixth(skill: HexaSkillDef, entry: SixthSkill, url: string, buff: string): HexaSkillDef {
  return {
    ...skill,
    name: entry.name,
    description: `${entry.text}${buff}`,
    iconUrl: preferHostedIcon(skill.iconUrl, entry.icon),
    jmsStatus: 'implemented',
    sourceName: 'JMS公式 職業紹介（6次職スキル）',
    sourceUrl: url,
    sourceCheckedOn: CHECKED,
  }
}

/** ナムウィキの画像は直リンクが403になる。公式CDNかウィキの画像が既にあるときはそれを残す。 */
function preferHostedIcon(current: string | undefined, official: string | undefined): string | undefined {
  if (official && (!current || current.includes('namu.wiki'))) return official
  return current || official || undefined
}

function masteryName(officialName: string): string {
  const base = officialName.replace(/(?<=\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})(?:III|II|I)$/u, '')
  return base.endsWith('Ⅵ') ? base : `${base}Ⅵ`
}

function enhanceName(officialName: string): string {
  return officialName.endsWith('強化') ? officialName : `${officialName}強化`
}
