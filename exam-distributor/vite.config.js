import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  plugins: [viteSingleFile()],
  // Use relative paths instead of absolute paths
  base: './',
  build: {
    // Ensure assets use relative paths
    assetsDir: 'assets',
    // Inline images smaller than 100kb (default is 4kb) to avoid path issues
    assetsInlineLimit: 100000,
  }
})
