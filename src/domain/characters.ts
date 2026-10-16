import { jobById, jobIdFromName } from '../data/jobs.ts'
import { canonicalWorldName } from '../data/worlds.ts'
import { createEmptyHexaProgress } from './hexa.ts'
import { createDefaultLoadout } from './presets.ts'
import type { AppData, Character, CharacterInput } from './types.ts'

const NAME_MAX_LENGTH = 20

export type CharacterFormValues = {
  name: string
  world: string
  jobId: string
  level: string
}

export type CharacterFormErrors = {
  name?: string
  level?: string
}

export type CharacterValidation =
  | { ok: true; value: CharacterInput }
  | { ok: false; errors: CharacterFormErrors }

export const emptyCharacterForm: CharacterFormValues = {
  name: '',
  world: '',
  jobId: '',
  level: '',
}

export function characterToFormValues(character: Character): CharacterFormValues {
  return {
    name: character.name,
    world: canonicalWorldName(character.world),
    jobId: character.jobId ?? jobIdFromName(character.job) ?? '',
    level: character.level === null ? '' : String(character.level),
  }
}

export function validateCharacterForm(
  values: CharacterFormValues,
  portraitDataUrl: string | null,
): CharacterValidation {
  const errors: CharacterFormErrors = {}
  const name = values.name.trim()
  const world = values.world.trim()
  const jobId = values.jobId.trim() || null
  const job = jobById(jobId)?.name ?? ''
  const levelText = values.level.trim()

  if (name.length === 0) {
    errors.name = 'キャラクター名を入力してください'
  } else if ([...name].length > NAME_MAX_LENGTH) {
    errors.name = 'キャラクター名は20文字以内で入力してください'
  }

  let level: number | null = null
  if (levelText.length > 0) {
    if (!/^[1-9]\d*$/.test(levelText)) {
      errors.level = 'レベルは1以上の整数で入力してください'
    } else {
      level = Number(levelText)
      if (!Number.isSafeInteger(level)) {
        errors.level = 'レベルは1以上の整数で入力してください'
      }
    }
  }

  if (errors.name || errors.level) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: { name, world, job, jobId, level, portraitDataUrl },
  }
}

export function findCharacter(
  data: AppData,
  id: string,
): Character | undefined {
  return data.characters.find((character) => character.id === id)
}

export function registerCharacter(
  data: AppData,
  input: CharacterInput,
  meta: { id: string; now: string },
): AppData {
  const character: Character = {
    id: meta.id,
    name: input.name,
    world: input.world,
    job: input.job,
    jobId: input.jobId,
    level: input.level,
    portraitDataUrl: input.portraitDataUrl,
    createdAt: meta.now,
    updatedAt: meta.now,
  }

  return {
    ...data,
    characters: [...data.characters, character],
    loadoutsByCharacterId: {
      ...data.loadoutsByCharacterId,
      [character.id]: createDefaultLoadout(),
    },
    hexaByCharacterId: {
      ...data.hexaByCharacterId,
      [character.id]: createEmptyHexaProgress(),
    },
  }
}

export function updateCharacter(
  data: AppData,
  id: string,
  input: CharacterInput,
  now: string,
): AppData {
  if (!findCharacter(data, id)) return data

  return {
    ...data,
    characters: data.characters.map((character) =>
      character.id === id
        ? {
            ...character,
            name: input.name,
            world: input.world,
            job: input.job,
            jobId: input.jobId,
            level: input.level,
            portraitDataUrl: input.portraitDataUrl,
            updatedAt: now,
          }
        : character,
    ),
  }
}
