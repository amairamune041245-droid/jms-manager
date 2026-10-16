import { useEffect, useRef, useState } from 'react'
import { canonicalWorldName, worldByValue, worldOptions } from '../../data/worlds.ts'
import { WorldIcon } from './WorldIcon.tsx'

export function WorldSelect({
  labelledBy,
  value,
  onChange,
}: {
  labelledBy: string
  value: string
  onChange: (world: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = worldByValue(value)
  const label = value ? canonicalWorldName(value) : '未選択'

  useEffect(() => {
    if (!open) return

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="world-select" ref={rootRef}>
      <button
        type="button"
        className="world-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelledBy} world-value`}
        onClick={() => setOpen((current) => !current)}
      >
        {value ? <WorldIcon world={value} /> : null}
        <span
          id="world-value"
          className={value ? (selected ? 'visually-hidden' : undefined) : 'muted'}
        >
          {label}
        </span>
      </button>
      {open ? (
        <ul className="world-select-list" role="listbox" aria-labelledby={labelledBy}>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              未選択
            </button>
          </li>
          {worldOptions(value).map((world) => (
            <li key={world.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected?.id === world.id || value === world.name}
                onClick={() => {
                  onChange(world.name)
                  setOpen(false)
                }}
              >
                <WorldIcon world={world.id} />
                {world.iconFile ? <span className="visually-hidden">{world.name}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
