import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    assetsInlineLimit: 0,
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/scss/variables" as *;
          @use "@/scss/mixins" as mixins;
        `,
      },
    },
  },
});