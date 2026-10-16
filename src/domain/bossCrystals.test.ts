import { describe, expect, it } from 'vitest'
import { crystalTotal, formatMeso } from './bossCrystals.ts'

describe('crystal totals', () => {
  it('adds weekly crystals and keeps the monthly boss separate', () => {
    const week = crystalTotal(['cygnus-normal', 'zakum-chaos', 'black-mage-hard'], 'week')
    expect(week).toEqual({ count: 2, meso: 10_530_000 + 11_150_000 })
    expect(crystalTotal(['black-mage-hard'], 'month').meso).toBe(575_660_000)
    expect(formatMeso(102_500_000)).toBe('1億250万メル')
    expect(formatMeso(90_870_000)).toBe('9087万メル')
  })
})
