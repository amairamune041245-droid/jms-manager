import { useState } from 'react'
import type { HexaSkillDef } from '../../data/hexa/types.ts'

export function SkillIcon({
  skill,
  className,
}: {
  skill: HexaSkillDef
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const src = skill.iconUrl
  if (!src || failedSrc === src) {
    return (
      <span className={className} aria-hidden="true">
        {skill.name.slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      className={className}
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailedSrc(src)}
    />
  )
}
