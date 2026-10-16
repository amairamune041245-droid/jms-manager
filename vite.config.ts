/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ocrLinePlugin } from './server/ocrLine.ts'
import { screenCapturePlugin } from './server/screenFrame.ts'

export default defineConfig({
  plugins: [react(), screenCapturePlugin(), ocrLinePlugin()],
  test: {
    environment: 'node',
  },
})
