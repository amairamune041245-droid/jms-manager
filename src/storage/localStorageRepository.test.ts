import { describe, expect, it } from 'vitest'
import { parseAppData } from './localStorageRepository.ts'

describe('parseAppData', () => {
  it('migrates v1 named slots into items and preset 1', () => {
    const data = parseAppData({
      version: 1,
      characters: [
        {
          id: 'c1',
          name: 'ネム',
          world: 'アウロラ',
          job: 'ヒーロー',
          level: 210,
          createdAt: 'a',
          updatedAt: 'b',
        },
      ],
      equipmentByCharacterId: {
        c1: { hat: { name: 'ファファント' }, weapon: { name: 'ファフニール' } },
      },
    })
    expect(data.version).toBe(2)
    expect(data.characters[0]?.jobId).toBe('hero')
    expect(data.items.map((item) => item.name).sort()).toEqual([
      'ファファント',
      'ファフニール',
    ])
    expect(data.loadoutsByCharacterId.c1.presets[0].slots.hat).toBeTruthy()
    expect(data.loadoutsByCharacterId.c1.presets[1].slots.hat).toBeNull()
    expect(data.hexaByCharacterId.c1.statCores).toHaveLength(6)
    expect(data.statSheetsByCharacterId).toEqual({})
  })

  it('reads a stat sheet stored with a version 2 save', () => {
    const data = parseAppData({
      version: 2,
      characters: [
        {
          id: 'c1',
          name: 'らむね',
          world: '楓',
          job: 'アークメイジ（氷、雷）',
          jobId: 'archmage-il',
          level: 285,
          portraitDataUrl: null,
          createdAt: 'a',
          updatedAt: 'b',
        },
      ],
      items: [],
      loadoutsByCharacterId: {},
      hexaByCharacterId: {},
      statSheetsByCharacterId: {
        c1: { mainPure: 12000, ignoreDefensePercent: 93.5, liberatedWeapon: true },
      },
    })
    expect(data.characters).toHaveLength(1)
    expect(data.statSheetsByCharacterId.c1?.mainPure).toBe(12000)
    expect(data.statSheetsByCharacterId.c1?.ignoreDefensePercent).toBe(93.5)
    expect(data.statSheetsByCharacterId.c1?.liberatedWeapon).toBe(true)
    expect(data.statSheetsByCharacterId.c1?.bossDamagePercent).toBe(0)

    const legacy = parseAppData({
      version: 2,
      characters: data.characters,
      items: [],
      loadoutsByCharacterId: {},
      hexaByCharacterId: {},
    })
    expect(legacy.characters).toHaveLength(1)
    expect(legacy.statSheetsByCharacterId).toEqual({})
  })

  it('opens broken json-like objects as empty data', () => {
    expect(parseAppData(null).characters).toEqual([])
    expect(parseAppData({ version: 9 }).items).toEqual([])
  })
})
