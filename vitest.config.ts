import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['__tests__/setup/vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                '__tests__/',
                '*.config.{js,ts}',
                'src/types/',
                'src/app/**/loading.tsx',
                'src/app/**/layout.tsx',
                '.next/',
                'coverage/',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
        include: ['__tests__/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', '.next', 'coverage'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
