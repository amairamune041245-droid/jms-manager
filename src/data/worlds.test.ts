import { describe, expect, it } from 'vitest'
import { canonicalWorldName, worldByValue, worldOptions } from './worlds.ts'

describe('worlds', () => {
  it('maps 楓 to かえで', () => {
    expect(worldByValue('楓')?.id).toBe('kaede')
    expect(canonicalWorldName('楓')).toBe('かえで')
  })

  it('maps チェンジャーズ to チャレンジャーズ', () => {
    expect(canonicalWorldName('チェンジャーズ')).toBe('チャレンジャーズ')
  })

  it('keeps unknown worlds in the option list', () => {
    const options = worldOptions('アウロラ')
    expect(options.some((world) => world.name === 'アウロラ')).toBe(true)
  })
})
