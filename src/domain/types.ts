import type { EquipmentSlotGroup, EquipmentSlotId } from './equipmentSlots.ts'

export const APP_DATA_VERSION = 2 as const
export const PRESET_COUNT = 3
export const HEXA_STAT_CORE_COUNT = 6
export const HEXA_SKILL_MAX_LEVEL = 30
export const HEXA_STAT_CORE_MAX_LEVEL = 20
export const HEXA_STAT_LINE_MAX_LEVEL = 10

export type Character = {
  id: string
  name: string
  world: string
  job: string
  jobId: string | null
  level: number | null
  portraitDataUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CharacterInput = {
  name: string
  world: string
  job: string
  jobId: string | null
  level: number | null
  portraitDataUrl: string | null
}

export type StatLine = {
  label: string
  value: string
}

export type PotentialLine = {
  text: string
}

export type EquipmentItem = {
  id: string
  name: string
  slotGroup: EquipmentSlotGroup
  stats: StatLine[]
  starForce: number | null
  enhanceText: string
  potentials: PotentialLine[]
  additionalPotentials: PotentialLine[]
  imageDataUrl: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type EquipmentItemInput = {
  name: string
  slotGroup: EquipmentSlotGroup
  stats: StatLine[]
  starForce: number | null
  enhanceText: string
  potentials: PotentialLine[]
  additionalPotentials: PotentialLine[]
  imageDataUrl: string | null
  notes: string
}

export type EquipmentPreset = {
  name: string
  slots: Record<EquipmentSlotId, string | null>
}

export type CharacterLoadout = {
  activePresetIndex: 0 | 1 | 2
  presets: [EquipmentPreset, EquipmentPreset, EquipmentPreset]
}

export type HexaStatType =
  | 'critDamage'
  | 'bossDamage'
  | 'ignoreDefense'
  | 'damage'
  | 'attack'
  | 'mainStat'

export type HexaStatCoreState = {
  index: number
  main: HexaStatType | null
  additional1: HexaStatType | null
  additional2: HexaStatType | null
  mainLevel: number
  additional1Level: number
  additional2Level: number
  saved: {
    mainLevel: number
    additional1Level: number
    additional2Level: number
  } | null
}

export type HexaProgress = {
  skillLevels: Record<string, number>
  statCores: HexaStatCoreState[]
  materials: {
    solErda: number
    solErdaFragment: number
  }
}

export type StatSheet = {
  mainPure: number
  mainPercent: number
  mainFlat: number
  subPure: number
  subPercent: number
  subFlat: number
  sub2Pure: number
  sub2Percent: number
  sub2Flat: number
  atkPure: number
  atkPercent: number
  atkFlat: number
  damagePercent: number
  bossDamagePercent: number
  ignoreDefensePercent: number
  criticalDamagePercent: number
  passiveSkillLevelUp: boolean
  liberatedWeapon: boolean
  oneHandSword: boolean
  ruinForceShield: boolean
}

export type GachaCount = {
  name: string
  count: number
}

export type GachaPool = {
  id: string
  name: string
  counts: GachaCount[]
}

export type AppData = {
  version: typeof APP_DATA_VERSION
  characters: Character[]
  items: EquipmentItem[]
  loadoutsByCharacterId: Record<string, CharacterLoadout>
  hexaByCharacterId: Record<string, HexaProgress>
  statSheetsByCharacterId: Record<string, StatSheet>
  bossClearsByCharacterId: Record<string, string[]>
  gachaPools: GachaPool[]
}

/** 旧バージョン互換。画面からは使わない。 */
export type LegacyEquippedItem = { name: string }
export type CharacterEquipment = Partial<
  Record<EquipmentSlotId, LegacyEquippedItem | null>
>
