import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL ?? '/api'

  return {
    plugins: [react()],
    test: {
      globals: true,
      setupFiles: ['./tests/helpers/test-setup.ts'],
      globalSetup: ['./tests/helpers/test-global-setup.ts'],
      environment: 'jsdom',
      // Force single-threaded execution for now to keep things simple
      fileParallelism: false,
      env: {
        VITE_ENV: 'test'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: { // only applies when running in dev mode i.e. yarn dev
      proxy: {
        '/api': { // This is the path prefix in your frontend requests
          target: apiUrl, // The URL of your backend server
          changeOrigin: true, // Rewrites the origin header to match the target
          secure: false, // Set to true if your backend uses HTTPS with a valid certificate
          rewrite: (path) => path.replace(/^\/api/, ''), // Optional: remove the '/api' prefix from the forwarded request path
        },
      },
    },
  }
})
