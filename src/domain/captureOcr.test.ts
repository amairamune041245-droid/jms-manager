import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseTooltipLines } from './tooltipText.ts'

describe('Windows OCR of supplied equipment screenshots', () => {
  it.each([
    ['cape', 9, ['INT +9%', 'INT +6%'], ['INT +4%', '魔力 +10']],
    ['earring', 10, ['INT +6%', 'INT +6%', 'LUK +6%'], ['魔力 +10', '最大HP +60', '移動速度 +4']],
    ['ring', 8, ['INT +12%', 'INT +9%', 'INT +9%'], ['魔力 +10', '最大HP +60', 'INT +6']],
  ] as const)('preserves base stats and both potential sections for %s', (name, count, potential, additional) => {
    const text = readFileSync(new URL(`./fixtures/ocr-${name}.txt`, import.meta.url), 'utf8')
    const details = parseTooltipLines(text.split('\n'))
    expect(details.stats).toHaveLength(count)
    expect(details.potentials.map((entry) => entry.text)).toEqual(potential)
    expect(details.additionalPotentials.map((entry) => entry.text)).toEqual(additional)
  })
})
