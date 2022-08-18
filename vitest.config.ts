import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    setupFiles: ['./test/vitest.setup.js'],
    include: ['./test/**/*.spec.{js,ts}'],
    environment: 'jsdom',
  },
  define: {
    __DEV__: true,
    __VERSION__: true,
    _refBrand: true,
  },
})
