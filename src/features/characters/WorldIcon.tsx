import { wikiSkillIcon } from '../../data/hexa/icons.ts'
import { worldByValue } from '../../data/worlds.ts'

export function WorldIcon({
  world,
  className = 'world-icon',
}: {
  world: string
  className?: string
}) {
  const known = worldByValue(world)
  if (!known) {
    return <span className={`${className} empty`} aria-hidden="true" />
  }

  if (known.iconFile) {
    return (
      <img
        className={`${className} world-banner`}
        src={wikiSkillIcon(known.iconFile)}
        alt=""
      />
    )
  }

  return (
    <span className={`${className} world-fallback`}>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          fill="#c9b4ff"
          d="M10 1.6 11.7 7.4 17.6 9.1 11.7 10.8 10 16.6 8.3 10.8 2.4 9.1 8.3 7.4Z"
        />
      </svg>
      {known.name}
    </span>
  )
}
