import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import Pages from "vite-plugin-pages";
import path from "path";

console.log("path", path.resolve(__dirname, "./src/components/"));

export default defineConfig({
  plugins: [
    vue(),
    Components({
      /* options */
      // allow auto load markdown components under `./components/`
      dirs: "components",

      dts: true,

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/]
    }),
    Pages({
      pagesDir: path.resolve(__dirname, "./components/")
    })
  ],
  resolve: {
    alias: [
      {
        find: "@/vuedraggable",
        replacement: path.resolve(__dirname, "../src/vuedraggable.ts")
      }
    ]
  },
  server: {},
  build: {
    lib: {
      entry: "src/vuedraggable.ts",
      name: "vuedraggable",
      fileName: format => `vuedraggable.${format}.min.js`,
      formats: ["umd", "es"]
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["sortablejs"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          sortablejs: "Sortable"
        }
      }
    }
  }
});
