import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  findCharacter,
  registerCharacter,
  updateCharacter,
} from '../../domain/characters.ts'
import type { EquipmentSlotId } from '../../domain/equipmentSlots.ts'
import {
  applySavedHexaStatState,
  saveHexaStatState,
  setHexaMaterials as writeHexaMaterials,
  setHexaSkillLevel as writeHexaSkillLevel,
  setHexaStatCore as writeHexaStatCore,
} from '../../domain/hexa.ts'
import { setStatSheet as writeStatSheet, statSheetForCharacter } from '../../domain/mainStatConvert.ts'
import {
  applyEquipmentCapture,
  applyEquipmentInfo,
  applyStarForce,
  clearCapturedEquipment as writeClearCaptured,
} from '../../domain/equipmentCapture.ts'
import type { EquipmentCaptureInput, EquipmentRead } from '../../domain/equipmentCapture.ts'
import { deleteItem, upsertItem } from '../../domain/items.ts'
import {
  assignSlot as writeAssignSlot,
  duplicatePreset as writeDuplicatePreset,
  renamePreset as writeRenamePreset,
  setActivePreset as writeActivePreset,
} from '../../domain/presets.ts'
import type {
  Character,
  CharacterInput,
  EquipmentItemInput,
  HexaStatCoreState,
  StatSheet,
} from '../../domain/types.ts'
import { bossById } from '../../domain/bossCrystals.ts'
import { emptyGachaPool, mergeGachaCounts, recordGachaItems } from '../../domain/gacha.ts'
import { loadAppData, saveAppData } from '../../storage/localStorageRepository.ts'
import { AppStoreContext } from './appStoreContext.ts'
import type { AppStoreValue, SaveState } from './appStoreContext.ts'

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => loadAppData())
  const [saveState, setSaveState] = useState<SaveState>({
    status: 'saved',
    at: '',
  })
  const dataRef = useRef(data)

  const persist = useCallback((next: typeof data) => {
    dataRef.current = next
    try {
      saveAppData(next)
      setData(next)
      setSaveState({ status: 'saved', at: new Date().toISOString() })
    } catch {
      setSaveState({
        status: 'error',
        message: '保存に失敗しました。画像サイズを小さくしてください。',
      })
      throw new Error('保存に失敗しました')
    }
  }, [])

  const register = useCallback((input: CharacterInput): Character => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const next = registerCharacter(dataRef.current, input, { id, now })
    persist(next)
    const character = findCharacter(next, id)
    if (!character) throw new Error('キャラクターを登録できませんでした')
    return character
  }, [persist])

  const update = useCallback((id: string, input: CharacterInput) => {
    persist(updateCharacter(dataRef.current, id, input, new Date().toISOString()))
  }, [persist])

  const saveItem = useCallback((input: EquipmentItemInput, existingId?: string) => {
    const id = existingId ?? crypto.randomUUID()
    const existing = dataRef.current.items.find((item) => item.id === id)
    persist(
      upsertItem(dataRef.current, input, {
        id,
        now: new Date().toISOString(),
        existing,
      }),
    )
    return id
  }, [persist])

  const removeItem = useCallback((itemId: string) => {
    persist(deleteItem(dataRef.current, itemId))
  }, [persist])

  const assignSlot = useCallback(
    (characterId: string, slotId: EquipmentSlotId, itemId: string | null) => {
      persist(writeAssignSlot(dataRef.current, characterId, slotId, itemId))
    },
    [persist],
  )

  const setActivePreset = useCallback((characterId: string, index: 0 | 1 | 2) => {
    persist(writeActivePreset(dataRef.current, characterId, index))
  }, [persist])

  const renamePreset = useCallback(
    (characterId: string, index: 0 | 1 | 2, name: string) => {
      persist(writeRenamePreset(dataRef.current, characterId, index, name))
    },
    [persist],
  )

  const duplicatePreset = useCallback(
    (characterId: string, fromIndex: 0 | 1 | 2, toIndex: 0 | 1 | 2) => {
      persist(writeDuplicatePreset(dataRef.current, characterId, fromIndex, toIndex))
    },
    [persist],
  )

  const setHexaSkillLevel = useCallback(
    (characterId: string, skillId: string, level: number) => {
      persist(writeHexaSkillLevel(dataRef.current, characterId, skillId, level))
    },
    [persist],
  )

  const setHexaMaterials = useCallback(
    (
      characterId: string,
      materials: { solErda: number; solErdaFragment: number },
    ) => {
      persist(writeHexaMaterials(dataRef.current, characterId, materials))
    },
    [persist],
  )

  const setHexaStatCore = useCallback(
    (characterId: string, core: HexaStatCoreState) => {
      const result = writeHexaStatCore(dataRef.current, characterId, core)
      if (!result.ok) return result.error
      persist(result.data)
      return null
    },
    [persist],
  )

  const saveHexaStat = useCallback((characterId: string, index: number) => {
    persist(saveHexaStatState(dataRef.current, characterId, index))
  }, [persist])

  const applyHexaStat = useCallback((characterId: string, index: number) => {
    persist(applySavedHexaStatState(dataRef.current, characterId, index))
  }, [persist])

  const setStatSheet = useCallback((characterId: string, patch: Partial<StatSheet>) => {
    const current = statSheetForCharacter(dataRef.current, characterId)
    persist(writeStatSheet(dataRef.current, characterId, { ...current, ...patch }))
  }, [persist])

  const captureEquipment = useCallback((characterId: string, reading: EquipmentCaptureInput) => {
    persist(applyEquipmentCapture(dataRef.current, characterId, reading, new Date().toISOString()))
  }, [persist])

  const clearCapturedEquipment = useCallback((characterId: string) => {
    persist(writeClearCaptured(dataRef.current, characterId))
  }, [persist])

  const setSlotEquipmentInfo = useCallback(
    (characterId: string, slotId: EquipmentSlotId, info: EquipmentRead): boolean => {
      const next = applyEquipmentInfo(dataRef.current, characterId, slotId, info, new Date().toISOString())
      if (next === dataRef.current) return false
      persist(next)
      return true
    },
    [persist],
  )

  const toggleBossClear = useCallback((characterId: string, bossId: string) => {
    if (!bossById(bossId)) return
    const current = dataRef.current.bossClearsByCharacterId[characterId] ?? []
    const next = current.includes(bossId) ? current.filter((id) => id !== bossId) : [...current, bossId]
    persist({
      ...dataRef.current,
      bossClearsByCharacterId: { ...dataRef.current.bossClearsByCharacterId, [characterId]: next },
    })
  }, [persist])

  const addGachaPool = useCallback((name: string) => {
    const id = crypto.randomUUID()
    persist({
      ...dataRef.current,
      gachaPools: [...dataRef.current.gachaPools, emptyGachaPool(id, name.trim() || 'ガチャ')],
    })
    return id
  }, [persist])

  const renameGachaPool = useCallback((poolId: string, name: string) => {
    persist({
      ...dataRef.current,
      gachaPools: dataRef.current.gachaPools.map((pool) =>
        pool.id === poolId ? { ...pool, name: name.trim() || pool.name } : pool,
      ),
    })
  }, [persist])

  const recordGacha = useCallback((poolId: string, names: string[]) => {
    persist({
      ...dataRef.current,
      gachaPools: dataRef.current.gachaPools.map((pool) =>
        pool.id === poolId ? recordGachaItems(pool, names) : pool,
      ),
    })
  }, [persist])

  const mergeGacha = useCallback((poolId: string, counts: { name: string; count: number }[]) => {
    persist({
      ...dataRef.current,
      gachaPools: dataRef.current.gachaPools.map((pool) =>
        pool.id === poolId ? mergeGachaCounts(pool, counts) : pool,
      ),
    })
  }, [persist])

  const setSlotStarForce = useCallback(
    (characterId: string, slotId: EquipmentSlotId, starForce: number): boolean => {
      const next = applyStarForce(dataRef.current, characterId, slotId, starForce, new Date().toISOString())
      if (next === dataRef.current) return false
      persist(next)
      return true
    },
    [persist],
  )

  const value = useMemo<AppStoreValue>(
    () => ({
      data,
      saveState,
      register,
      update,
      saveItem,
      removeItem,
      assignSlot,
      setActivePreset,
      renamePreset,
      duplicatePreset,
      setHexaSkillLevel,
      setHexaMaterials,
      setHexaStatCore,
      saveHexaStat,
      applyHexaStat,
      setStatSheet,
      captureEquipment,
      clearCapturedEquipment,
      setSlotStarForce,
      setSlotEquipmentInfo,
      toggleBossClear,
      recordGacha,
      renameGachaPool,
      addGachaPool,
      mergeGacha,
    }),
    [
      data,
      saveState,
      register,
      update,
      saveItem,
      removeItem,
      assignSlot,
      setActivePreset,
      renamePreset,
      duplicatePreset,
      setHexaSkillLevel,
      setHexaMaterials,
      setHexaStatCore,
      saveHexaStat,
      applyHexaStat,
      setStatSheet,
      captureEquipment,
      clearCapturedEquipment,
      setSlotStarForce,
      setSlotEquipmentInfo,
      toggleBossClear,
      recordGacha,
      renameGachaPool,
      addGachaPool,
      mergeGacha,
    ],
  )

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  )
}
