import type { AppData, StatSheet } from './types.ts'

export type PrimaryStat = 'STR' | 'DEX' | 'INT' | 'LUK' | 'HP'
export type StatModel = 'standard' | 'xenon' | 'demon-avenger'
export type AttackKind = 'attack' | 'magic'

export type CombatProfile = {
  jobId: string
  model: StatModel
  main: PrimaryStat
  sub: PrimaryStat | null
  sub2: PrimaryStat | null
  attack: AttackKind
  weaponConstant: number
  oneHandWeaponConstant: number | null
  finalDamage: number
  finalDamage2: number
}

export type ConversionRow = {
  id: string
  label: string
  mainStat: number | null
}

export type MainStatConversion = {
  statusAttackPower: number
  finalDamagePercent: number
  mainLabel: string
  attackLabel: string
  rows: ConversionRow[]
  note: string | null
}

const BOSS_DEFENSE_PERCENT = 380
const MAIN_WEIGHT = 4

export function setStatSheet(
  data: AppData,
  characterId: string,
  sheet: StatSheet,
): AppData {
  if (!data.characters.some((character) => character.id === characterId)) return data
  return {
    ...data,
    statSheetsByCharacterId: {
      ...data.statSheetsByCharacterId,
      [characterId]: normalizeStatSheet(sheet),
    },
  }
}

export function statSheetForCharacter(data: AppData, characterId: string): StatSheet {
  return data.statSheetsByCharacterId[characterId] ?? emptyStatSheet()
}

export function readStoredStatSheet(value: unknown): StatSheet | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  return normalizeStatSheet({
    mainPure: numberOrZero(source.mainPure),
    mainPercent: numberOrZero(source.mainPercent),
    mainFlat: numberOrZero(source.mainFlat),
    subPure: numberOrZero(source.subPure),
    subPercent: numberOrZero(source.subPercent),
    subFlat: numberOrZero(source.subFlat),
    sub2Pure: numberOrZero(source.sub2Pure),
    sub2Percent: numberOrZero(source.sub2Percent),
    sub2Flat: numberOrZero(source.sub2Flat),
    atkPure: numberOrZero(source.atkPure),
    atkPercent: numberOrZero(source.atkPercent),
    atkFlat: numberOrZero(source.atkFlat),
    damagePercent: numberOrZero(source.damagePercent),
    bossDamagePercent: numberOrZero(source.bossDamagePercent),
    ignoreDefensePercent: numberOrZero(source.ignoreDefensePercent),
    criticalDamagePercent: numberOrZero(source.criticalDamagePercent),
    passiveSkillLevelUp: source.passiveSkillLevelUp === true,
    liberatedWeapon: source.liberatedWeapon === true,
    oneHandSword: source.oneHandSword === true,
    ruinForceShield: source.ruinForceShield === true,
  })
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function emptyStatSheet(): StatSheet {
  return {
    mainPure: 0,
    mainPercent: 0,
    mainFlat: 0,
    subPure: 0,
    subPercent: 0,
    subFlat: 0,
    sub2Pure: 0,
    sub2Percent: 0,
    sub2Flat: 0,
    atkPure: 0,
    atkPercent: 0,
    atkFlat: 0,
    damagePercent: 0,
    bossDamagePercent: 0,
    ignoreDefensePercent: 0,
    criticalDamagePercent: 0,
    passiveSkillLevelUp: false,
    liberatedWeapon: false,
    oneHandSword: false,
    ruinForceShield: false,
  }
}

export function attackLabel(attack: AttackKind): string {
  return attack === 'magic' ? '魔力' : '攻撃力'
}

export function supportsRuinShield(jobId: string): boolean {
  return jobId === 'demonslayer' || jobId === 'demonavenger'
}

export function combineFinal(pure: number, percent: number, flat: number): number {
  const value = pure * (1 + percent / 100) + flat
  return Math.floor(Number(value.toFixed(10)))
}

export function displayedFinalDamage(
  profile: CombatProfile,
  sheet: StatSheet,
): number {
  const base = sheet.passiveSkillLevelUp ? profile.finalDamage2 : profile.finalDamage
  const genesis = sheet.liberatedWeapon ? 1.1 : 1
  const ruin =
    sheet.ruinForceShield && supportsRuinShield(profile.jobId) ? 1.1 : 1
  return Number((100 * ((1 + base / 100) * genesis * ruin - 1)).toFixed(10))
}

export function convertMainStat(
  profile: CombatProfile,
  sheet: StatSheet,
  level: number | null,
): MainStatConversion {
  const finals = sheetFinals(profile, sheet)
  const attack = finals.attack
  const weapon = sheet.oneHandSword
    ? (profile.oneHandWeaponConstant ?? profile.weaponConstant)
    : profile.weaponConstant
  const term = statTerm(profile, finals, level)
  const finalDamage = displayedFinalDamage(profile, sheet)
  const statusAttackPower =
    term === null
      ? 0
      : Math.floor(
          Math.round((attack * weapon * term) / 100) *
            (1 + sheet.damagePercent / 100) *
            (1 + finalDamage / 100),
        )
  const mainLabel = profile.main
  const atkLabel = attackLabel(profile.attack)
  const base: MainStatConversion = {
    statusAttackPower,
    finalDamagePercent: finalDamage,
    mainLabel,
    attackLabel: atkLabel,
    rows: [],
    note: null,
  }

  if (isBlank(sheet)) return base
  if (profile.model === 'demon-avenger' && level === null) {
    return { ...base, note: 'デーモンアヴェンジャーの換算にはレベルが必要です。' }
  }
  if (term === null || term <= 0) {
    return { ...base, note: 'メインステータスが0のため換算できません。' }
  }
  if (attack <= 0) {
    return { ...base, note: `${atkLabel}が0のため換算できません。` }
  }

  const defenseFactor = ignoreDefenseFactor(sheet.ignoreDefensePercent)
  if (defenseFactor <= 0) {
    return {
      ...base,
      note: '敵防御率380%では、この防御率無視だとダメージが0です。',
    }
  }

  const rows: ConversionRow[] = [
    {
      id: 'attack',
      label: `${atkLabel} +1`,
      mainStat: equivalent(profile, finals, level, term, (attack + 1) / attack),
    },
    {
      id: 'attack-percent',
      label: `${atkLabel}% +1`,
      mainStat: equivalent(profile, finals, level, term, attackRatio(sheet, 1)),
    },
    {
      id: 'damage',
      label: 'ダメージ +1%',
      mainStat: equivalent(
        profile,
        finals,
        level,
        term,
        (100 + sheet.damagePercent + 1) / (100 + sheet.damagePercent),
      ),
    },
    {
      id: 'boss',
      label: 'ボスダメージ +1%',
      mainStat: equivalent(
        profile,
        finals,
        level,
        term,
        (100 + sheet.bossDamagePercent + 1) / (100 + sheet.bossDamagePercent),
      ),
    },
    {
      id: 'crit',
      label: 'クリティカルダメージ +1%',
      mainStat: equivalent(
        profile,
        finals,
        level,
        term,
        (100 + sheet.criticalDamagePercent + 1) /
          (100 + sheet.criticalDamagePercent),
      ),
    },
    {
      id: 'ied',
      label: '防御率無視 +1%',
      mainStat: iedEquivalent(profile, finals, level, term, sheet.ignoreDefensePercent),
    },
    {
      id: 'main-percent',
      label: `${mainLabel}% +1`,
      mainStat: mainPercentEquivalent(profile, sheet, level),
    },
  ]

  return { ...base, rows }
}

function sheetFinals(profile: CombatProfile, sheet: StatSheet) {
  return {
    main: combineFinal(sheet.mainPure, sheet.mainPercent, sheet.mainFlat),
    sub: profile.sub
      ? combineFinal(sheet.subPure, sheet.subPercent, sheet.subFlat)
      : 0,
    sub2: profile.sub2
      ? combineFinal(sheet.sub2Pure, sheet.sub2Percent, sheet.sub2Flat)
      : 0,
    attack: combineFinal(sheet.atkPure, sheet.atkPercent, sheet.atkFlat),
  }
}

function statTerm(
  profile: CombatProfile,
  finals: { main: number; sub: number; sub2: number },
  level: number | null,
): number | null {
  if (profile.model === 'demon-avenger') {
    if (level === null) return null
    const pureHp = level * 90 + 545
    return (
      Math.floor(pureHp / 3.5) +
      0.8 * Math.floor((finals.main - pureHp) / 3.5) +
      finals.sub
    )
  }
  if (profile.model === 'xenon') {
    return (finals.main + finals.sub + finals.sub2) * MAIN_WEIGHT
  }
  return finals.main * MAIN_WEIGHT + finals.sub + finals.sub2
}

function ignoreDefenseFactor(ignoreDefensePercent: number): number {
  return 1 - (BOSS_DEFENSE_PERCENT / 100) * (1 - ignoreDefensePercent / 100)
}

function equivalent(
  profile: CombatProfile,
  finals: { main: number; sub: number; sub2: number },
  level: number | null,
  term: number,
  ratio: number,
): number | null {
  if (!Number.isFinite(ratio) || ratio <= 0) return null
  const extra = term * (ratio - 1)
  if (extra === 0) return 0
  if (profile.model === 'demon-avenger') {
    if (level === null) return null
    return hpForTermIncrease(level * 90 + 545, finals.main, extra)
  }
  return extra / MAIN_WEIGHT
}

function iedEquivalent(
  profile: CombatProfile,
  finals: { main: number; sub: number; sub2: number },
  level: number | null,
  term: number,
  ignoreDefensePercent: number,
): number | null {
  const next = ignoreDefenseFactor(ignoreDefensePercent + 1)
  const current = ignoreDefenseFactor(ignoreDefensePercent)
  if (current <= 0 || next <= 0) return null
  return equivalent(profile, finals, level, term, next / current)
}

function mainPercentEquivalent(
  profile: CombatProfile,
  sheet: StatSheet,
  level: number | null,
): number | null {
  const current = sheetFinals(profile, sheet)
  const next = sheetFinals(profile, {
    ...sheet,
    mainPercent: sheet.mainPercent + 1,
  })
  const currentTerm = statTerm(profile, current, level)
  const nextTerm = statTerm(profile, next, level)
  if (currentTerm === null || nextTerm === null || currentTerm <= 0) return null
  return equivalent(profile, current, level, currentTerm, nextTerm / currentTerm)
}

function attackRatio(sheet: StatSheet, percentPoint: number): number {
  const current = combineFinal(sheet.atkPure, sheet.atkPercent, sheet.atkFlat)
  const next = combineFinal(
    sheet.atkPure,
    sheet.atkPercent + percentPoint,
    sheet.atkFlat,
  )
  if (current <= 0 || next <= 0) return Number.NaN
  return next / current
}

function hpForTermIncrease(pureHp: number, currentHp: number, extraTerm: number): number | null {
  if (extraTerm <= 0) return 0
  const gained = (hp: number) => 0.8 * Math.floor((hp - pureHp) / 3.5)
  const base = gained(currentHp)
  let lo = 0
  let hi = 1
  while (gained(currentHp + hi) - base < extraTerm && hi < 1e12) hi *= 2
  if (gained(currentHp + hi) - base < extraTerm) return null
  for (let step = 0; step < 60; step += 1) {
    const mid = (lo + hi) / 2
    if (gained(currentHp + mid) - base >= extraTerm) hi = mid
    else lo = mid
  }
  return hi
}

function normalizeStatSheet(sheet: StatSheet): StatSheet {
  return {
    mainPure: readAmount(sheet.mainPure),
    mainPercent: readPercent(sheet.mainPercent),
    mainFlat: readAmount(sheet.mainFlat),
    subPure: readAmount(sheet.subPure),
    subPercent: readPercent(sheet.subPercent),
    subFlat: readAmount(sheet.subFlat),
    sub2Pure: readAmount(sheet.sub2Pure),
    sub2Percent: readPercent(sheet.sub2Percent),
    sub2Flat: readAmount(sheet.sub2Flat),
    atkPure: readAmount(sheet.atkPure),
    atkPercent: readPercent(sheet.atkPercent),
    atkFlat: readAmount(sheet.atkFlat),
    damagePercent: readPercent(sheet.damagePercent),
    bossDamagePercent: readPercent(sheet.bossDamagePercent),
    ignoreDefensePercent: readIed(sheet.ignoreDefensePercent),
    criticalDamagePercent: readPercent(sheet.criticalDamagePercent),
    passiveSkillLevelUp: sheet.passiveSkillLevelUp === true,
    liberatedWeapon: sheet.liberatedWeapon === true,
    oneHandSword: sheet.oneHandSword === true,
    ruinForceShield: sheet.ruinForceShield === true,
  }
}

function readAmount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(1e15, value)
}

function readPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(10000, value)
}

function readIed(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(100, value)
}

function isBlank(sheet: StatSheet): boolean {
  return (
    sheet.mainPure === 0 &&
    sheet.mainFlat === 0 &&
    sheet.subPure === 0 &&
    sheet.subFlat === 0 &&
    sheet.sub2Pure === 0 &&
    sheet.sub2Flat === 0 &&
    sheet.atkPure === 0 &&
    sheet.atkFlat === 0 &&
    sheet.damagePercent === 0 &&
    sheet.bossDamagePercent === 0 &&
    sheet.ignoreDefensePercent === 0 &&
    sheet.criticalDamagePercent === 0
  )
}
