/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.ts',
      'tests/**/*.{test,spec}.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})