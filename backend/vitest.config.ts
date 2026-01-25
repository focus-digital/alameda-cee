import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/helpers/test-setup.ts'],
    globalSetup: ['./tests/helpers/test-global-setup.ts'],    
    environment: 'node',
    // Force single-threaded execution for now to keep things simple
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
});
