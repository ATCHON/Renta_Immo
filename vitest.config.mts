import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/server/**/*.ts',
        'src/lib/**/*.ts',
        'src/stores/**/*.ts',
        'src/hooks/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**',
        'src/lib/auth.ts',
        'src/lib/auth-client.ts',
        'src/lib/email.ts',
        'src/instrumentation*.ts',
        'src/server/migrations/**',
        'src/server/config/config-service.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
