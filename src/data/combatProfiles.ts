import type { CombatProfile } from '../domain/mainStatConvert.ts'

/**
 * きのこツール（https://kinokohub.net/tools/main-stats-converter）の
 * クライアントにある職業ごとの武器定数と最終ダメージ。
 * JMS公式の表ではない。
 */
export const COMBAT_PROFILES: CombatProfile[] = [
  { jobId: 'adele', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 68.597, finalDamage2: 69.884 },
  { jobId: 'angelicbuster', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 64.89872, finalDamage2: 64.89872 },
  { jobId: 'aran', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.49, oneHandWeaponConstant: null, finalDamage: 34.2, finalDamage2: 34.2 },
  { jobId: 'archmage-fp', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 167.4, finalDamage2: 167.4 },
  { jobId: 'archmage-il', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 167.4, finalDamage2: 167.4 },
  { jobId: 'ark', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 42.296, finalDamage2: 43.472 },
  { jobId: 'battlemage', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 58.6, finalDamage2: 59.9 },
  { jobId: 'bishop', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 203.1743, finalDamage2: 203.1743 },
  { jobId: 'blaster', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 89.2, finalDamage2: 89.2 },
  { jobId: 'bowmaster', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 61.226, finalDamage2: 62.604 },
  { jobId: 'cadena', model: 'standard', main: 'LUK', sub: 'DEX', sub2: 'STR', attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 4, finalDamage2: 4 },
  { jobId: 'cannoneer', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.5, oneHandWeaponConstant: null, finalDamage: 61.29575, finalDamage2: 62.5085 },
  { jobId: 'captain', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.5, oneHandWeaponConstant: null, finalDamage: 64.592, finalDamage2: 64.592 },
  { jobId: 'darkknight', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.49, oneHandWeaponConstant: null, finalDamage: 164.384, finalDamage2: 166.328 },
  { jobId: 'demonavenger', model: 'demon-avenger', main: 'HP', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 19, finalDamage2: 19 },
  { jobId: 'demonslayer', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 45.2, finalDamage2: 45.2 },
  { jobId: 'dualblade', model: 'standard', main: 'LUK', sub: 'DEX', sub2: 'STR', attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 41.264, finalDamage2: 42.4412 },
  { jobId: 'evan', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 53.4, finalDamage2: 53.4 },
  { jobId: 'flamewizard', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 106.55, finalDamage2: 110.6 },
  { jobId: 'hayato', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.25, oneHandWeaponConstant: null, finalDamage: 15, finalDamage2: 15 },
  { jobId: 'hero', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.44, oneHandWeaponConstant: 1.34, finalDamage: 216.25, finalDamage2: 218.78 },
  { jobId: 'hoyoung', model: 'standard', main: 'LUK', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 85.8587885, finalDamage2: 88.943216 },
  { jobId: 'illium', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 50, finalDamage2: 50 },
  { jobId: 'kain', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 124.3375, finalDamage2: 126.05 },
  { jobId: 'kaiser', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.34, oneHandWeaponConstant: null, finalDamage: 33, finalDamage2: 33 },
  { jobId: 'kanna', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.35, oneHandWeaponConstant: null, finalDamage: 0, finalDamage2: 0 },
  { jobId: 'khali', model: 'standard', main: 'LUK', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 72.8, finalDamage2: 72.8 },
  { jobId: 'kinesis', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 160.4888, finalDamage2: 160.4888 },
  { jobId: 'lara', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 89.8, finalDamage2: 92.57 },
  { jobId: 'len', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 70.640855, finalDamage2: 72.17816 },
  { jobId: 'luminous', model: 'standard', main: 'INT', sub: 'LUK', sub2: null, attack: 'magic', weaponConstant: 1.2, oneHandWeaponConstant: null, finalDamage: 88.94, finalDamage2: 91.7 },
  { jobId: 'marksman', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.35, oneHandWeaponConstant: null, finalDamage: 71.38304, finalDamage2: 74.3768 },
  { jobId: 'mechanic', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.5, oneHandWeaponConstant: null, finalDamage: 42, finalDamage2: 42 },
  { jobId: 'mercedes', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 50.0642, finalDamage2: 51.3044 },
  { jobId: 'mihile', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.24, oneHandWeaponConstant: null, finalDamage: 87.5, finalDamage2: 89 },
  { jobId: 'nightlord', model: 'standard', main: 'LUK', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.75, oneHandWeaponConstant: null, finalDamage: 48.35, finalDamage2: 48.35 },
  { jobId: 'nightwalker', model: 'standard', main: 'LUK', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.75, oneHandWeaponConstant: null, finalDamage: 54.56, finalDamage2: 54.56 },
  { jobId: 'paladin', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.34, oneHandWeaponConstant: 1.24, finalDamage: 65.77, finalDamage2: 66.98 },
  { jobId: 'pathfinder', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 43.36, finalDamage2: 44.64 },
  { jobId: 'phantom', model: 'standard', main: 'LUK', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 70.3, finalDamage2: 71.6 },
  { jobId: 'shade', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 85.59827, finalDamage2: 87.226325 },
  { jobId: 'shadower', model: 'standard', main: 'LUK', sub: 'DEX', sub2: 'STR', attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 58.1372, finalDamage2: 58.1372 },
  { jobId: 'soulmaster', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.34, oneHandWeaponConstant: 1.24, finalDamage: 46.25, finalDamage2: 46.25 },
  { jobId: 'striker', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 26.26, finalDamage2: 27.33 },
  { jobId: 'viper', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.7, oneHandWeaponConstant: null, finalDamage: 36.73, finalDamage2: 37.973 },
  { jobId: 'wildhunter', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.35, oneHandWeaponConstant: null, finalDamage: 106.2203, finalDamage2: 106.2203 },
  { jobId: 'windbreaker', model: 'standard', main: 'DEX', sub: 'STR', sub2: null, attack: 'attack', weaponConstant: 1.3, oneHandWeaponConstant: null, finalDamage: 67.552, finalDamage2: 67.552 },
  { jobId: 'xenon', model: 'xenon', main: 'STR', sub: 'DEX', sub2: 'LUK', attack: 'attack', weaponConstant: 1.3125, oneHandWeaponConstant: null, finalDamage: 17, finalDamage2: 17 },
  { jobId: 'zero', model: 'standard', main: 'STR', sub: 'DEX', sub2: null, attack: 'attack', weaponConstant: 1.49, oneHandWeaponConstant: null, finalDamage: 47.42, finalDamage2: 47.42 },
]

export function combatProfileByJobId(
  jobId: string | null | undefined,
): CombatProfile | null {
  if (!jobId) return null
  return COMBAT_PROFILES.find((profile) => profile.jobId === jobId) ?? null
}
