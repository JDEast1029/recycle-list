import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	mode: 'production',
	plugins: [vue()],
	build: {
		target: 'esnext',
		outDir: 'lib',
		assetsDir: '',
		rollupOptions: {
			input: "./src/index.ts",
			external: ['vue'],
			output: [{
				format: 'cjs',
				name: 'index',
				entryFileNames: '[name].cjs.js'
			}, {
				format: 'esm',
				name: 'index',
				entryFileNames: '[name].esm.js'
			}],
		},
	},
	optimizeDeps: {
		include: ['vue'],
	},
});
