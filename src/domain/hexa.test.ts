import { describe, expect, it } from 'vitest'
import {
  createEmptyHexaProgress,
  setHexaSkillLevel,
  setHexaStatCore,
  validateHexaStatCores,
} from './hexa.ts'
import { APP_DATA_VERSION } from './types.ts'
import type { AppData, HexaStatCoreState } from './types.ts'

function data(): AppData {
  return {
    version: APP_DATA_VERSION,
    characters: [],
    items: [],
    loadoutsByCharacterId: {},
    hexaByCharacterId: { c1: createEmptyHexaProgress() },
    statSheetsByCharacterId: {},
    bossClearsByCharacterId: {},
    gachaPools: [],
  }
}

function core(
  index: number,
  patch: Partial<HexaStatCoreState>,
): HexaStatCoreState {
  return {
    index,
    main: null,
    additional1: null,
    additional2: null,
    mainLevel: 0,
    additional1Level: 0,
    additional2Level: 0,
    saved: null,
    ...patch,
  }
}

describe('hexa stats', () => {
  it('blocks duplicate stats inside a core', () => {
    const error = validateHexaStatCores([
      core(0, { main: 'bossDamage', additional1: 'bossDamage' }),
    ])
    expect(error).toMatch(/重複/)
  })

  it('allows an additional stat on two cores only', () => {
    const ok = validateHexaStatCores([
      core(0, { additional1: 'critDamage' }),
      core(1, { additional1: 'critDamage' }),
    ])
    expect(ok).toBeNull()
    const tooMany = validateHexaStatCores([
      core(0, { additional1: 'critDamage' }),
      core(1, { additional1: 'critDamage' }),
      core(2, { additional1: 'critDamage' }),
    ])
    expect(tooMany).toMatch(/2つまで/)
  })

  it('allows a main stat only once', () => {
    const error = validateHexaStatCores([
      core(0, { main: 'attack' }),
      core(1, { main: 'attack' }),
    ])
    expect(error).toMatch(/1つのみ/)
  })

  it('keeps skill levels when other data changes', () => {
    const next = setHexaSkillLevel(data(), 'c1', 'hero-origin', 12)
    expect(next.hexaByCharacterId.c1.skillLevels['hero-origin']).toBe(12)
  })

  it('rejects invalid core writes', () => {
    const result = setHexaStatCore(
      data(),
      'c1',
      core(0, { main: 'damage', additional1: 'damage' }),
    )
    expect(result.ok).toBe(false)
  })
})
