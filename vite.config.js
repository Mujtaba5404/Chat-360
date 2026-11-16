import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    strictPort: true,
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache independently of app code changes.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
            { name: 'mantine', test: /node_modules[\\/]@mantine[\\/]/ },
          ],
        },
      },
    },
  },
})
