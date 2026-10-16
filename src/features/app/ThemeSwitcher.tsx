import { useState } from 'react'
import { applyTheme, readTheme, SITE_THEMES } from '../../app/theme.ts'
import type { SiteTheme } from '../../app/theme.ts'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SiteTheme>(() => readTheme())

  return (
    <div className="theme-switch" role="group" aria-label="サイトの色">
      {SITE_THEMES.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className="button-quiet"
          aria-pressed={theme === entry.id}
          onClick={() => {
            applyTheme(entry.id)
            setTheme(entry.id)
          }}
        >
          {entry.label}
        </button>
      ))}
    </div>
  )
}
