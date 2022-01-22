import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import reactJsx from 'vite-react-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), reactJsx()],
  server: {
    port: 40800
  },
  optimizeDeps: {
    include: ['shaka-player']
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
