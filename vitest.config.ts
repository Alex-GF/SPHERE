import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
      include: ['api/**/*.test.ts'], // Solo incluye los tests del directorio API
      globals: true, // Habilita la API global de Vitest
      environment: 'node', // Usa el entorno Node.js
      typecheck: {
        tsconfig: 'tsconfig.node.json', // Asegura que Vitest utilice el tsconfig específico
      },
    },
  });