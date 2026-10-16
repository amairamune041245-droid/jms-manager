import {
  HEXA_SKILL_MAX_LEVEL,
  HEXA_STAT_CORE_COUNT,
  HEXA_STAT_CORE_MAX_LEVEL,
  HEXA_STAT_LINE_MAX_LEVEL,
} from './types.ts'
import type {
  AppData,
  HexaProgress,
  HexaStatCoreState,
  HexaStatType,
} from './types.ts'

export const HEXA_STAT_OPTIONS: { id: HexaStatType; label: string }[] = [
  { id: 'critDamage', label: 'クリティカルダメージ' },
  { id: 'bossDamage', label: 'ボスモンスター攻撃時のダメージ' },
  { id: 'ignoreDefense', label: '防御率無視' },
  { id: 'damage', label: 'ダメージ' },
  { id: 'attack', label: '攻撃力/魔力' },
  { id: 'mainStat', label: 'メインステータス' },
]

export function createEmptyHexaProgress(): HexaProgress {
  return {
    skillLevels: {},
    statCores: Array.from({ length: HEXA_STAT_CORE_COUNT }, (_, index) =>
      emptyStatCore(index),
    ),
    materials: { solErda: 0, solErdaFragment: 0 },
  }
}

export function hexaForCharacter(
  data: AppData,
  characterId: string,
): HexaProgress {
  return data.hexaByCharacterId[characterId] ?? createEmptyHexaProgress()
}

export function setHexaSkillLevel(
  data: AppData,
  characterId: string,
  skillId: string,
  level: number,
): AppData {
  const current = hexaForCharacter(data, characterId)
  const nextLevel = clampInt(level, 0, HEXA_SKILL_MAX_LEVEL)
  return putHexa(data, characterId, {
    ...current,
    skillLevels: { ...current.skillLevels, [skillId]: nextLevel },
  })
}

export function setHexaMaterials(
  data: AppData,
  characterId: string,
  materials: { solErda: number; solErdaFragment: number },
): AppData {
  const current = hexaForCharacter(data, characterId)
  return putHexa(data, characterId, {
    ...current,
    materials: {
      solErda: toCount(materials.solErda),
      solErdaFragment: toCount(materials.solErdaFragment),
    },
  })
}

export function setHexaStatCore(
  data: AppData,
  characterId: string,
  core: HexaStatCoreState,
): { ok: true; data: AppData } | { ok: false; error: string } {
  const current = hexaForCharacter(data, characterId)
  const cores = current.statCores.map((entry) =>
    entry.index === core.index ? normalizeCore(core) : entry,
  )
  const error = validateHexaStatCores(cores)
  if (error) return { ok: false, error }
  return {
    ok: true,
    data: putHexa(data, characterId, { ...current, statCores: cores }),
  }
}

export function saveHexaStatState(
  data: AppData,
  characterId: string,
  index: number,
): AppData {
  const current = hexaForCharacter(data, characterId)
  const cores = current.statCores.map((core) => {
    if (core.index !== index) return core
    const total = coreLevel(core)
    if (total < HEXA_STAT_CORE_MAX_LEVEL) return core
    return {
      ...core,
      saved: {
        mainLevel: core.mainLevel,
        additional1Level: core.additional1Level,
        additional2Level: core.additional2Level,
      },
    }
  })
  return putHexa(data, characterId, { ...current, statCores: cores })
}

export function applySavedHexaStatState(
  data: AppData,
  characterId: string,
  index: number,
): AppData {
  const current = hexaForCharacter(data, characterId)
  const cores = current.statCores.map((core) => {
    if (core.index !== index || !core.saved) return core
    return {
      ...core,
      mainLevel: core.saved.mainLevel,
      additional1Level: core.saved.additional1Level,
      additional2Level: core.saved.additional2Level,
    }
  })
  return putHexa(data, characterId, { ...current, statCores: cores })
}

export function coreLevel(core: HexaStatCoreState): number {
  return core.mainLevel + core.additional1Level + core.additional2Level
}

export function hexaStatLabel(type: HexaStatType | null): string {
  if (!type) return '未設定'
  return HEXA_STAT_OPTIONS.find((option) => option.id === type)?.label ?? type
}

export function validateHexaStatCores(cores: HexaStatCoreState[]): string | null {
  const mains = new Map<HexaStatType, number>()
  const additionals = new Map<HexaStatType, number>()

  for (const core of cores) {
    const types = [core.main, core.additional1, core.additional2].filter(
      (value): value is HexaStatType => value !== null,
    )
    if (new Set(types).size !== types.length) {
      return `ステータスコア${core.index + 1}内で同じ能力値を重複できません`
    }
    if (coreLevel(core) > HEXA_STAT_CORE_MAX_LEVEL) {
      return `ステータスコア${core.index + 1}は合計${HEXA_STAT_CORE_MAX_LEVEL}までです`
    }
    if (core.main) mains.set(core.main, (mains.get(core.main) ?? 0) + 1)
    for (const additional of [core.additional1, core.additional2]) {
      if (additional) {
        additionals.set(additional, (additionals.get(additional) ?? 0) + 1)
      }
    }
  }

  for (const [type, count] of mains) {
    if (count > 1) {
      return `メインステータスの「${hexaStatLabel(type)}」は全コアで1つのみです`
    }
  }
  for (const [type, count] of additionals) {
    if (count > 2) {
      return `付加ステータスの「${hexaStatLabel(type)}」は全コアで2つまでです`
    }
  }
  return null
}

function emptyStatCore(index: number): HexaStatCoreState {
  return {
    index,
    main: null,
    additional1: null,
    additional2: null,
    mainLevel: 0,
    additional1Level: 0,
    additional2Level: 0,
    saved: null,
  }
}

function normalizeCore(core: HexaStatCoreState): HexaStatCoreState {
  return {
    ...core,
    mainLevel: clampInt(core.mainLevel, 0, HEXA_STAT_LINE_MAX_LEVEL),
    additional1Level: clampInt(core.additional1Level, 0, HEXA_STAT_LINE_MAX_LEVEL),
    additional2Level: clampInt(core.additional2Level, 0, HEXA_STAT_LINE_MAX_LEVEL),
  }
}

function putHexa(
  data: AppData,
  characterId: string,
  hexa: HexaProgress,
): AppData {
  return {
    ...data,
    hexaByCharacterId: {
      ...data.hexaByCharacterId,
      [characterId]: hexa,
    },
  }
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.floor(value)))
}

function toCount(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

export const HEXA_COST_NOTE =
  'JMS公式6次ガイドおよびKMS公式HEXAガイドに、レベル別のソルエルダ必要数は記載されていません。不足数はデータ未確認です。'
