import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
      include: ['**/*.test.ts'], // Solo incluye los tests del directorio API
      globals: true, // Habilita la API global de Vitest
      environment: 'node', // Usa el entorno Node.js
      fileParallelism: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 60,
          statements: 70,
        },
      },
      typecheck: {
        tsconfig: 'tsconfig.json', // Asegura que Vitest utilice el tsconfig específico
      },
    },
  });
