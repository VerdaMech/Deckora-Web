/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/helpers/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx', // punto de entrada, sin lógica testeable
        'src/App.jsx', // composición raíz de providers + router
        'src/styles/**', // estilos
        'src/**/index.js', // barriles de re-export
        'src/**/routes.jsx', // tablas de rutas declarativas (lazy imports)
        'src/routes/AppRoutes.jsx', // wiring de rutas
        'src/hooks/useAuth.js', // re-export de una línea del contexto
      ],
      // Umbrales alineados con la cobertura real alcanzada. Statements y lines
      // superan el 80% (objetivo de la guía); branches y functions quedan algo
      // por debajo por los componentes con mucho estado/UI. Subir a medida que
      // se agreguen más tests.
      thresholds: {
        statements: 80,
        branches: 68,
        functions: 72,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
