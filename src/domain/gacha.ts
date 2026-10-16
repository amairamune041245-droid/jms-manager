import type { GachaCount, GachaPool } from './types.ts'

export type { GachaCount, GachaPool }

export function emptyGachaPool(id: string, name: string): GachaPool {
  return { id, name, counts: [] }
}

export function gachaTrials(pool: GachaPool): number {
  return pool.counts.reduce((sum, entry) => sum + entry.count, 0)
}

export function gachaRate(count: number, trials: number): number {
  if (trials <= 0) return 0
  return count / trials
}

/** 確認したアイテムを、その場の集計へ足す。空欄は数えない。 */
export function recordGachaItems(pool: GachaPool, names: string[]): GachaPool {
  const counts = new Map(pool.counts.map((entry) => [entry.name, entry.count]))
  for (const raw of names) {
    const name = raw.trim()
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return {
    ...pool,
    counts: [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ja')),
  }
}

/** ほかの人の集計を、同じアイテム名で足す。 */
export function mergeGachaCounts(pool: GachaPool, extra: GachaCount[]): GachaPool {
  return recordGachaItems(
    pool,
    extra.flatMap((entry) => Array.from({ length: Math.max(0, Math.floor(entry.count)) }, () => entry.name)),
  )
}
