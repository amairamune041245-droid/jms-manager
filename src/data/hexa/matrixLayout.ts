import type { HexaSkillDef, HexaSkillRole } from './types.ts'

export type MatrixGroup = 'mastery' | 'skill' | 'enhance' | 'common'

export type MatrixBind =
  | { type: 'mastery-index'; index: number }
  | { type: 'role'; role: Extract<HexaSkillRole, 'origin' | 'ascent'> }
  | { type: 'extra-skill'; index: number }
  | { type: 'enhance-index'; index: number }
  | { type: 'common-index'; index: number }
  | { type: 'skill-id'; skillId: string }

export type MatrixSlotDef = {
  id: string
  group: MatrixGroup
  /** Center, in the same pixel space as SKILL_MATRIX_LAYOUT. */
  x: number
  y: number
  bind: MatrixBind
  lockedReason: string
}

export type BoundMatrixSlot = MatrixSlotDef & {
  skill: HexaSkillDef | null
}

/**
 * Centers measured on the 氷雷 HEXAマトリックス reference (519×516).
 * Each cluster sits on one pointy-top pitch: 横70px、段60px。
 * The same frame is used for every job.
 */
export const SKILL_MATRIX_LAYOUT = {
  viewX: 0,
  viewY: 0,
  viewWidth: 519,
  viewHeight: 516,
  hexWidth: 66,
  hexHeight: 74,
  mark: { x: 255, y: 256 },
}

/** Links along the four right-hand mastery hexes. */
export const SKILL_MATRIX_LINKS: ReadonlyArray<readonly [number, number, number, number]> = [
  [443, 62, 408, 122],
  [408, 122, 338, 122],
  [338, 122, 303, 182],
]

const MASTERY_LOCK =
  'この枠のマスタリーコアは、ナムウィキの6次欄に名前がありません。'
const ENHANCE_LOCK = 'この強化枠に対応するスキルは未確認です。'
const THIRD_SKILL_LOCK =
  '3つ目のスキルコアは、確認したJMSのゲーム画面では未解放です。'
const LATER_SKILL_LOCK =
  'スキルコアは6枠のうち3枠まで解放、とナムウィキのHEXAマトリックスにあります。4枠目以降は未解放です。'
const LATER_COMMON_LOCK = 'この共用枠は、確認したJMSのゲーム画面では未解放です。'
const ORIGIN_LOCK = 'この職業のオリジンは公式6次欄から未取得です。'
const ASCENT_LOCK = 'この職業のアセントは公式6次欄から未取得です。'

/**
 * Fixed centers from the reference screenshot.
 * A missing skill stays locked in the same hex.
 */
export const MATRIX_SLOTS: MatrixSlotDef[] = [
  // Skills occupy the left cluster. On the ice/lightning reference, ascent is the lower-left hex and origin is the lower-right.
  { id: 'origin', group: 'skill', x: 205, y: 182, bind: { type: 'role', role: 'origin' }, lockedReason: ORIGIN_LOCK },
  { id: 'ascent', group: 'skill', x: 135, y: 182, bind: { type: 'role', role: 'ascent' }, lockedReason: ASCENT_LOCK },
  { id: 'skill-extra', group: 'skill', x: 100, y: 122, bind: { type: 'extra-skill', index: 0 }, lockedReason: THIRD_SKILL_LOCK },
  { id: 'skill-2', group: 'skill', x: 170, y: 122, bind: { type: 'extra-skill', index: 1 }, lockedReason: LATER_SKILL_LOCK },
  { id: 'skill-3', group: 'skill', x: 65, y: 62, bind: { type: 'extra-skill', index: 2 }, lockedReason: LATER_SKILL_LOCK },
  { id: 'skill-4', group: 'skill', x: 135, y: 62, bind: { type: 'extra-skill', index: 3 }, lockedReason: LATER_SKILL_LOCK },
  // Four named masteries fill the right cluster, first core at lower-left then up-right.
  { id: 'mastery-0', group: 'mastery', x: 443, y: 62, bind: { type: 'mastery-index', index: 3 }, lockedReason: MASTERY_LOCK },
  { id: 'mastery-1', group: 'mastery', x: 408, y: 122, bind: { type: 'mastery-index', index: 2 }, lockedReason: MASTERY_LOCK },
  { id: 'mastery-2', group: 'mastery', x: 338, y: 122, bind: { type: 'mastery-index', index: 1 }, lockedReason: MASTERY_LOCK },
  { id: 'mastery-3', group: 'mastery', x: 303, y: 182, bind: { type: 'mastery-index', index: 0 }, lockedReason: MASTERY_LOCK },
  { id: 'enhance-0', group: 'enhance', x: 208, y: 322, bind: { type: 'enhance-index', index: 0 }, lockedReason: ENHANCE_LOCK },
  { id: 'janus', group: 'common', x: 299, y: 322, bind: { type: 'skill-id', skillId: 'common-sol-janus' }, lockedReason: 'ソルヤーヌスのデータがありません。' },
  { id: 'enhance-1', group: 'enhance', x: 100, y: 386, bind: { type: 'enhance-index', index: 1 }, lockedReason: ENHANCE_LOCK },
  { id: 'enhance-2', group: 'enhance', x: 170, y: 386, bind: { type: 'enhance-index', index: 2 }, lockedReason: ENHANCE_LOCK },
  { id: 'hecate', group: 'common', x: 338, y: 386, bind: { type: 'skill-id', skillId: 'common-sol-hecate' }, lockedReason: 'ソル・ヘカテのデータがありません。' },
  { id: 'common-0', group: 'common', x: 408, y: 386, bind: { type: 'common-index', index: 0 }, lockedReason: 'この職業群の共用コアは未確認です。' },
  { id: 'enhance-3', group: 'enhance', x: 65, y: 446, bind: { type: 'enhance-index', index: 3 }, lockedReason: ENHANCE_LOCK },
  { id: 'common-locked', group: 'common', x: 443, y: 446, bind: { type: 'common-index', index: 1 }, lockedReason: LATER_COMMON_LOCK },
]

export function matrixNodeBox(slot: { x: number; y: number }): {
  left: string
  top: string
  width: string
  height: string
} {
  const board = SKILL_MATRIX_LAYOUT
  return {
    left: `${((slot.x - board.viewX) / board.viewWidth) * 100}%`,
    top: `${((slot.y - board.viewY) / board.viewHeight) * 100}%`,
    width: `${(board.hexWidth / board.viewWidth) * 100}%`,
    height: `${(board.hexHeight / board.viewHeight) * 100}%`,
  }
}

export function skillGroup(skill: HexaSkillDef): MatrixGroup {
  if (skill.kind === 'common-core' || skill.role === 'common') return 'common'
  if (skill.kind === 'enhance-core' || skill.role === 'enhance') return 'enhance'
  if (skill.kind === 'mastery-core' || skill.role === 'mastery') return 'mastery'
  return 'skill'
}

const JANUS_ID = 'common-sol-janus'
const HECATE_ID = 'common-sol-hecate'

export function bindMatrixSlots(skills: HexaSkillDef[]): BoundMatrixSlot[] {
  const usable = skills.filter((skill) => skill.jmsStatus !== 'unlisted')
  const masteries = usable.filter((skill) => skill.kind === 'mastery-core')
  const enhances = usable.filter((skill) => skill.kind === 'enhance-core')
  const extras = usable.filter(
    (skill) =>
      skill.kind === 'skill-core' &&
      skill.role !== 'origin' &&
      skill.role !== 'ascent' &&
      skill.role !== 'boost',
  )
  const shared = usable.filter(
    (skill) => skill.kind === 'common-core' && skill.id !== JANUS_ID && skill.id !== HECATE_ID,
  )
  const byId = new Map(usable.map((skill) => [skill.id, skill]))

  return MATRIX_SLOTS.map((slot) => ({
    ...slot,
    skill: skillForBind(slot.bind, usable, masteries, enhances, extras, shared, byId),
  }))
}

function skillForBind(
  bind: MatrixBind,
  usable: HexaSkillDef[],
  masteries: HexaSkillDef[],
  enhances: HexaSkillDef[],
  extras: HexaSkillDef[],
  shared: HexaSkillDef[],
  byId: Map<string, HexaSkillDef>,
): HexaSkillDef | null {
  switch (bind.type) {
    case 'mastery-index':
      return masteries[bind.index] ?? null
    case 'enhance-index':
      return enhances[bind.index] ?? null
    case 'extra-skill':
      return extras[bind.index] ?? null
    case 'common-index':
      return shared[bind.index] ?? null
    case 'role':
      return usable.find((skill) => skill.role === bind.role) ?? null
    case 'skill-id':
      return byId.get(bind.skillId) ?? null
  }
}
