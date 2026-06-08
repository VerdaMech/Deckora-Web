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
      include: [
        'src/utils/validators.js',
        'src/utils/formatters.js',
        'src/utils/deck-helpers.js',
        'src/utils/torneos-helpers.js',
        'src/hooks/useDebounce.js',
        'src/components/domain/CommanderBadge.jsx',
        'src/components/domain/EstadoBadge.jsx',
        'src/components/domain/FormatBadge.jsx',
        'src/components/domain/RoleBadge.jsx',
        'src/modules/mazos/components/PanelValidacion.jsx',
      ],
      thresholds: {
        statements: 95,
        branches: 80,
        functions: 95,
        lines: 95,
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
