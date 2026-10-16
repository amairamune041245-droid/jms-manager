import { useContext } from 'react'
import { AppStoreContext } from './appStoreContext.ts'
import type { AppStoreValue } from './appStoreContext.ts'

export function useAppStore(): AppStoreValue {
  const value = useContext(AppStoreContext)
  if (!value) {
    throw new Error('AppStoreProvider の内側で使ってください')
  }
  return value
}
