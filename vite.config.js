import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
	root: './client/',
	base: './',
	build: {
		outDir: '../dist'
	}
})
