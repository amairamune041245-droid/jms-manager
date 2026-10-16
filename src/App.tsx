import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell.tsx'
import { AppStoreProvider } from './features/app/AppStore.tsx'
import { EditCharacterPage } from './features/characters/EditCharacterPage.tsx'
import { NewCharacterPage } from './features/characters/NewCharacterPage.tsx'

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<NewCharacterPage />} />
            <Route path="characters/:id" element={<EditCharacterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStoreProvider>
  )
}
