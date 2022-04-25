import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const _dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(_dirname, './src'),
      a: resolve(_dirname, './src/api'),
      c: resolve(_dirname, './src/components'),
      h: resolve(_dirname, './src/hooks'),
      p: resolve(_dirname, './src/pages'),
      s: resolve(_dirname, './src/supabase'),
      u: resolve(_dirname, './src/utils')
    }
  }
})
