import { createContext } from 'react'
import type { EquipmentSlotId } from '../../domain/equipmentSlots.ts'
import type { EquipmentCaptureInput, EquipmentRead } from '../../domain/equipmentCapture.ts'
import type {
  AppData,
  Character,
  CharacterInput,
  EquipmentItemInput,
  HexaStatCoreState,
  StatSheet,
} from '../../domain/types.ts'

export type SaveState =
  | { status: 'saved'; at: string }
  | { status: 'error'; message: string }

export type AppStoreValue = {
  data: AppData
  saveState: SaveState
  register: (input: CharacterInput) => Character
  update: (id: string, input: CharacterInput) => void
  saveItem: (input: EquipmentItemInput, existingId?: string) => string
  removeItem: (itemId: string) => void
  assignSlot: (characterId: string, slotId: EquipmentSlotId, itemId: string | null) => void
  setActivePreset: (characterId: string, index: 0 | 1 | 2) => void
  renamePreset: (characterId: string, index: 0 | 1 | 2, name: string) => void
  duplicatePreset: (characterId: string, fromIndex: 0 | 1 | 2, toIndex: 0 | 1 | 2) => void
  setHexaSkillLevel: (characterId: string, skillId: string, level: number) => void
  setHexaMaterials: (
    characterId: string,
    materials: { solErda: number; solErdaFragment: number },
  ) => void
  setHexaStatCore: (
    characterId: string,
    core: HexaStatCoreState,
  ) => string | null
  saveHexaStat: (characterId: string, index: number) => void
  applyHexaStat: (characterId: string, index: number) => void
  setStatSheet: (characterId: string, patch: Partial<StatSheet>) => void
  captureEquipment: (characterId: string, reading: EquipmentCaptureInput) => void
  clearCapturedEquipment: (characterId: string) => void
  setSlotStarForce: (characterId: string, slotId: EquipmentSlotId, starForce: number) => boolean
  setSlotEquipmentInfo: (
    characterId: string,
    slotId: EquipmentSlotId,
    info: EquipmentRead,
  ) => boolean
  toggleBossClear: (characterId: string, bossId: string) => void
  recordGacha: (poolId: string, names: string[]) => void
  renameGachaPool: (poolId: string, name: string) => void
  addGachaPool: (name: string) => string
  mergeGacha: (poolId: string, counts: { name: string; count: number }[]) => void
}

export const AppStoreContext = createContext<AppStoreValue | null>(null)
