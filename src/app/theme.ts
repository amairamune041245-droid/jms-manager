export const SITE_THEMES = [
  { id: 'system', label: 'システム' },
  { id: 'pink', label: 'ピンク' },
  { id: 'orange', label: 'オレンジ' },
  { id: 'aqua', label: '水色' },
] as const

export type SiteTheme = (typeof SITE_THEMES)[number]['id']

const THEME_KEY = 'jms-manager.theme'

export function isSiteTheme(value: string | null): value is SiteTheme {
  return SITE_THEMES.some((theme) => theme.id === value)
}

export function readTheme(): SiteTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return isSiteTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(theme: SiteTheme): void {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // 保存できない環境でも、今の画面の色は切り替える。
  }
}

export function applyStoredTheme(): void {
  applyTheme(readTheme())
}
