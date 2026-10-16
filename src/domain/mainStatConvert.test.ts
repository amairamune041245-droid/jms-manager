import { describe, expect, it } from 'vitest'
import { combatProfileByJobId } from '../data/combatProfiles.ts'
import { convertMainStat, emptyStatSheet } from './mainStatConvert.ts'

describe('main stat conversion', () => {
  it('matches the kinoko status-attack formula for an ice/lightning mage', () => {
    const profile = combatProfileByJobId('archmage-il')
    expect(profile).not.toBeNull()
    if (!profile) return
    const result = convertMainStat(
      profile,
      {
        ...emptyStatSheet(),
        mainPure: 10000,
        subPure: 1000,
        atkPure: 2000,
        damagePercent: 100,
        bossDamagePercent: 200,
        ignoreDefensePercent: 90,
        criticalDamagePercent: 50,
      },
      285,
    )
    expect(result.statusAttackPower).toBe(5262432)
    expect(result.finalDamagePercent).toBeCloseTo(167.4, 5)
    expect(result.rows.find((row) => row.id === 'attack')?.mainStat).toBeCloseTo(5.125, 5)
    expect(result.rows.find((row) => row.id === 'boss')?.mainStat).toBeCloseTo(34.166666, 4)
    expect(result.rows.find((row) => row.id === 'crit')?.mainStat).toBeCloseTo(68.333333, 4)
    expect(result.rows.find((row) => row.id === 'damage')?.mainStat).toBeCloseTo(51.25, 4)
    expect(result.rows.find((row) => row.id === 'ied')?.mainStat).toBeCloseTo(628.225806, 3)
    expect(result.rows.find((row) => row.id === 'main-percent')?.mainStat).toBeCloseTo(100, 5)
  })

  it('uses the one-hand sword constant for hero', () => {
    const profile = combatProfileByJobId('hero')
    expect(profile).not.toBeNull()
    if (!profile) return
    const base = {
      ...emptyStatSheet(),
      mainPure: 100,
      atkPure: 100,
      ignoreDefensePercent: 90,
    }
    const twoHand = convertMainStat(profile, base, 200)
    const oneHand = convertMainStat(profile, { ...base, oneHandSword: true }, 200)
    expect(twoHand.statusAttackPower).toBe(1821)
    expect(oneHand.statusAttackPower).toBe(1695)
    expect(oneHand.rows.find((row) => row.id === 'attack')?.mainStat).toBeCloseTo(
      twoHand.rows.find((row) => row.id === 'attack')?.mainStat ?? 0,
      5,
    )
  })

  it('weights xenon stats equally', () => {
    const profile = combatProfileByJobId('xenon')
    expect(profile).not.toBeNull()
    if (!profile) return
    const result = convertMainStat(
      profile,
      {
        ...emptyStatSheet(),
        mainPure: 100,
        subPure: 100,
        sub2Pure: 100,
        atkPure: 100,
        ignoreDefensePercent: 90,
      },
      200,
    )
    expect(result.rows.find((row) => row.id === 'attack')?.mainStat).toBeCloseTo(3, 5)
  })

  it('reports zero damage against 380% defense when ignore defense is too low', () => {
    const profile = combatProfileByJobId('archmage-il')
    expect(profile).not.toBeNull()
    if (!profile) return
    const result = convertMainStat(
      profile,
      { ...emptyStatSheet(), mainPure: 1000, atkPure: 100, ignoreDefensePercent: 50 },
      285,
    )
    expect(result.note).toContain('380%')
    expect(result.rows).toEqual([])
    expect(result.statusAttackPower).toBeGreaterThan(0)
  })
})
