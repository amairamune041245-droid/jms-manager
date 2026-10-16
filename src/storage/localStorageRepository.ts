import { jobIdFromName } from '../data/jobs.ts'
import { EQUIPMENT_SLOTS, isSlotGroup } from '../domain/equipmentSlots.ts'
import type { EquipmentSlotId } from '../domain/equipmentSlots.ts'
import { createEmptyHexaProgress } from '../domain/hexa.ts'
import { readStoredStatSheet } from '../domain/mainStatConvert.ts'
import { createDefaultLoadout, createEmptySlots } from '../domain/presets.ts'
import { bossById } from '../domain/bossCrystals.ts'
import { APP_DATA_VERSION } from '../domain/types.ts'
import type {
  AppData,
  Character,
  CharacterLoadout,
  EquipmentItem,
  EquipmentPreset,
  GachaPool,
  HexaProgress,
  HexaStatCoreState,
  HexaStatType,
  StatSheet,
} from '../domain/types.ts'

const STORAGE_KEY = 'jms-manager.v1'
const HEXA_STAT_TYPES: HexaStatType[] = [
  'critDamage',
  'bossDamage',
  'ignoreDefense',
  'damage',
  'attack',
  'mainStat',
]

export function createEmptyAppData(): AppData {
  return {
    version: APP_DATA_VERSION,
    characters: [],
    items: [],
    loadoutsByCharacterId: {},
    hexaByCharacterId: {},
    statSheetsByCharacterId: {},
    bossClearsByCharacterId: {},
    gachaPools: [],
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyAppData()
    return parseAppData(JSON.parse(raw))
  } catch {
    return createEmptyAppData()
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function parseAppData(value: unknown): AppData {
  if (!isRecord(value)) return createEmptyAppData()
  if (value.version === 1) return migrateV1(value)
  if (value.version !== APP_DATA_VERSION) {
    if (isRecord(value.equipmentByCharacterId)) return migrateV1(value)
    return createEmptyAppData()
  }
  return parseV2(value)
}

function parseV2(value: Record<string, unknown>): AppData {
  if (!Array.isArray(value.characters)) return createEmptyAppData()
  const characters = value.characters.flatMap((entry) => {
    const character = readCharacter(entry)
    return character ? [character] : []
  })
  const items = Array.isArray(value.items)
    ? value.items.flatMap((entry) => {
        const item = readItem(entry)
        return item ? [item] : []
      })
    : []
  const itemIds = new Set(items.map((item) => item.id))
  const loadoutsSource = isRecord(value.loadoutsByCharacterId)
    ? value.loadoutsByCharacterId
    : {}
  const hexaSource = isRecord(value.hexaByCharacterId)
    ? value.hexaByCharacterId
    : {}
  const sheetSource = isRecord(value.statSheetsByCharacterId)
    ? value.statSheetsByCharacterId
    : {}

  const loadoutsByCharacterId: Record<string, CharacterLoadout> = {}
  const hexaByCharacterId: Record<string, HexaProgress> = {}
  const statSheetsByCharacterId: Record<string, StatSheet> = {}
  for (const character of characters) {
    loadoutsByCharacterId[character.id] = readLoadout(
      loadoutsSource[character.id],
      itemIds,
    )
    hexaByCharacterId[character.id] = readHexa(hexaSource[character.id])
    const sheet = readStoredStatSheet(sheetSource[character.id])
    if (sheet) statSheetsByCharacterId[character.id] = sheet
  }

  return {
    version: APP_DATA_VERSION,
    characters,
    items,
    loadoutsByCharacterId,
    hexaByCharacterId,
    statSheetsByCharacterId,
    bossClearsByCharacterId: readBossClears(value.bossClearsByCharacterId),
    gachaPools: readGachaPools(value.gachaPools),
  }
}

function migrateV1(value: Record<string, unknown>): AppData {
  const characters = Array.isArray(value.characters)
    ? value.characters.flatMap((entry) => {
        const character = readCharacter(entry)
        return character ? [character] : []
      })
    : []
  const oldEquipment = isRecord(value.equipmentByCharacterId)
    ? value.equipmentByCharacterId
    : {}
  const items: EquipmentItem[] = []
  const loadoutsByCharacterId: Record<string, CharacterLoadout> = {}
  const hexaByCharacterId: Record<string, HexaProgress> = {}
  const now = new Date().toISOString()

  for (const character of characters) {
    const loadout = createDefaultLoadout()
    const source = isRecord(oldEquipment[character.id])
      ? oldEquipment[character.id]
      : {}
    for (const slot of EQUIPMENT_SLOTS) {
      const entry = isRecord(source) ? source[slot.id] : null
      const name =
        isRecord(entry) && typeof entry.name === 'string' ? entry.name.trim() : ''
      if (!name) continue
      const id = `migrated-${character.id}-${slot.id}`
      items.push({
        id,
        name,
        slotGroup: slot.group,
        stats: [],
        starForce: null,
        enhanceText: '',
        potentials: [],
        additionalPotentials: [],
        imageDataUrl: null,
        notes: '',
        createdAt: now,
        updatedAt: now,
      })
      loadout.presets[0].slots[slot.id] = id
    }
    loadoutsByCharacterId[character.id] = loadout
    hexaByCharacterId[character.id] = createEmptyHexaProgress()
  }

  return {
    version: APP_DATA_VERSION,
    characters,
    items,
    loadoutsByCharacterId,
    hexaByCharacterId,
    statSheetsByCharacterId: {},
    bossClearsByCharacterId: {},
    gachaPools: [],
  }
}

function readBossClears(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {}
  const clears: Record<string, string[]> = {}
  for (const [characterId, entry] of Object.entries(value)) {
    if (!Array.isArray(entry)) continue
    const ids = entry.filter((id): id is string => typeof id === 'string' && bossById(id) !== null)
    if (ids.length > 0) clears[characterId] = [...new Set(ids)]
  }
  return clears
}

function readGachaPools(value: unknown): GachaPool[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string') return []
    const counts = Array.isArray(entry.counts)
      ? entry.counts.flatMap((count) => {
          if (!isRecord(count) || typeof count.name !== 'string') return []
          const times = typeof count.count === 'number' && Number.isFinite(count.count) ? Math.max(0, Math.floor(count.count)) : 0
          const name = count.name.trim()
          if (!name || times === 0) return []
          return [{ name, count: times }]
        })
      : []
    return [{ id: entry.id, name: entry.name, counts }]
  })
}

function readCharacter(value: unknown): Character | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (typeof value.name !== 'string') return null
  if (typeof value.world !== 'string') return null
  const job = typeof value.job === 'string' ? value.job : ''
  const jobId =
    typeof value.jobId === 'string' && value.jobId.length > 0
      ? value.jobId
      : jobIdFromName(job)
  if (!isLevel(value.level)) return null
  if (typeof value.createdAt !== 'string') return null
  if (typeof value.updatedAt !== 'string') return null

  return {
    id: value.id,
    name: value.name,
    world: value.world,
    job,
    jobId,
    level: value.level,
    portraitDataUrl:
      typeof value.portraitDataUrl === 'string' ? value.portraitDataUrl : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function readItem(value: unknown): EquipmentItem | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (typeof value.name !== 'string') return null
  if (typeof value.slotGroup !== 'string' || !isSlotGroup(value.slotGroup)) {
    return null
  }
  return {
    id: value.id,
    name: value.name,
    slotGroup: value.slotGroup,
    stats: readStatLines(value.stats),
    starForce: isStarForce(value.starForce) ? value.starForce : null,
    enhanceText: typeof value.enhanceText === 'string' ? value.enhanceText : '',
    potentials: readPotentials(value.potentials),
    additionalPotentials: readPotentials(value.additionalPotentials),
    imageDataUrl: typeof value.imageDataUrl === 'string' ? value.imageDataUrl : null,
    notes: typeof value.notes === 'string' ? value.notes : '',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  }
}

function readLoadout(value: unknown, itemIds: Set<string>): CharacterLoadout {
  const fallback = createDefaultLoadout()
  if (!isRecord(value) || !Array.isArray(value.presets)) return fallback
  const presetValues = value.presets
  const index = value.activePresetIndex
  const activePresetIndex: 0 | 1 | 2 =
    index === 1 || index === 2 ? index : 0
  const presets = [0, 1, 2].map((presetIndex) =>
    readPreset(presetValues[presetIndex], fallback.presets[presetIndex], itemIds),
  ) as CharacterLoadout['presets']
  return { activePresetIndex, presets }
}

function readPreset(
  value: unknown,
  fallback: EquipmentPreset,
  itemIds: Set<string>,
): EquipmentPreset {
  if (!isRecord(value)) return fallback
  const slots = createEmptySlots()
  const source = isRecord(value.slots) ? value.slots : {}
  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = source[slot.id]
    slots[slot.id] =
      typeof itemId === 'string' && itemIds.has(itemId) ? itemId : null
  }
  return {
    name:
      typeof value.name === 'string' && value.name.trim().length > 0
        ? value.name.trim().slice(0, 20)
        : fallback.name,
    slots,
  }
}

function readHexa(value: unknown): HexaProgress {
  const empty = createEmptyHexaProgress()
  if (!isRecord(value)) return empty
  const skillLevels: Record<string, number> = {}
  if (isRecord(value.skillLevels)) {
    for (const [id, level] of Object.entries(value.skillLevels)) {
      if (typeof level === 'number' && Number.isSafeInteger(level) && level >= 0) {
        skillLevels[id] = Math.min(30, level)
      }
    }
  }
  const cores = Array.isArray(value.statCores) ? value.statCores : []
  const statCores = empty.statCores.map((_, index) =>
    readStatCore(cores[index], index),
  )
  const materials = isRecord(value.materials) ? value.materials : {}
  return {
    skillLevels,
    statCores,
    materials: {
      solErda: readCount(materials.solErda),
      solErdaFragment: readCount(materials.solErdaFragment),
    },
  }
}

function readStatCore(value: unknown, index: number): HexaStatCoreState {
  if (!isRecord(value)) {
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
  return {
    index,
    main: readStatType(value.main),
    additional1: readStatType(value.additional1),
    additional2: readStatType(value.additional2),
    mainLevel: readStatLevel(value.mainLevel),
    additional1Level: readStatLevel(value.additional1Level),
    additional2Level: readStatLevel(value.additional2Level),
    saved: isRecord(value.saved)
      ? {
          mainLevel: readStatLevel(value.saved.mainLevel),
          additional1Level: readStatLevel(value.saved.additional1Level),
          additional2Level: readStatLevel(value.saved.additional2Level),
        }
      : null,
  }
}

function readStatType(value: unknown): HexaStatType | null {
  return typeof value === 'string' && HEXA_STAT_TYPES.includes(value as HexaStatType)
    ? (value as HexaStatType)
    : null
}

function readStatLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return 0
  }
  return Math.min(10, value)
}

function readCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return 0
  }
  return value
}

function readStatLines(value: unknown): EquipmentItem['stats'] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return []
    if (typeof entry.label !== 'string' || typeof entry.value !== 'string') {
      return []
    }
    return [{ label: entry.label, value: entry.value }]
  })
}

function readPotentials(value: unknown): EquipmentItem['potentials'] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.text !== 'string') return []
    const text = entry.text.trim()
    return text ? [{ text }] : []
  })
}

function isLevel(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isSafeInteger(value) && value >= 1)
  )
}

function isStarForce(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isEquipmentSlotId(value: string): value is EquipmentSlotId {
  return EQUIPMENT_SLOTS.some((slot) => slot.id === value)
}
