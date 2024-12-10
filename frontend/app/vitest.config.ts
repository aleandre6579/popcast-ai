import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true, // Ensures globals like expect, describe, it are available
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts', // Optional, if you have additional setup files
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias for the '@' symbol to the src directory
    },
  },
});
