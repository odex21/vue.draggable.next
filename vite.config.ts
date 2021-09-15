import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@/vuedraggable',
        replacement: 'src/vuedraggable.ts',
      },
    ],
  },
  server: {},
  build: {
    lib: {
      entry: 'src/vuedraggable.ts',
      name: 'vuedraggable',
      fileName: (format) => `vuedraggable.${format}.min.js`,
      formats: ['umd', 'es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['sortablejs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          sortablejs: 'Sortable',
        },
      },
    },
  },
})
