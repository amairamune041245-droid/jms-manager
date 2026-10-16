export type WorldDef = {
  id: string
  name: string
  aliases: string[]
  iconFile?: string
}

export const WORLDS: WorldDef[] = [
  { id: 'challengers', name: 'チャレンジャーズ', aliases: ['チェンジャーズ'] },
  { id: 'kaede', name: 'かえで', aliases: ['楓'], iconFile: 'World_Kaede_JP.png' },
  { id: 'kurumi', name: 'くるみ', aliases: [], iconFile: 'World_Kurumi_JP.png' },
  { id: 'yukari', name: 'ゆかり', aliases: [], iconFile: 'World_Yukari_JP.png' },
  { id: 'hinoki', name: 'ひのき', aliases: ['リブート', 'Reboot'], iconFile: 'World_Hinoki_JP.png' },
]

export function worldByValue(value: string): WorldDef | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return WORLDS.find(
    (world) => world.id === trimmed || world.name === trimmed || world.aliases.includes(trimmed),
  )
}

export function canonicalWorldName(value: string): string {
  return worldByValue(value)?.name ?? value.trim()
}

export function worldOptions(current: string): WorldDef[] {
  const trimmed = current.trim()
  if (!trimmed || worldByValue(trimmed)) return WORLDS
  return [...WORLDS, { id: `custom-${trimmed}`, name: trimmed, aliases: [] }]
}
