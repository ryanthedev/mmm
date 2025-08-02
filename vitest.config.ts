import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['v1/**', 'node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      },
      exclude: [
        'node_modules',
        'dist',
        'v1',
        '**/*.config.ts',
        '**/*.d.ts'
      ]
    }
  }
});