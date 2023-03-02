import { resolve } from 'path';
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const pkgRoot = resolve(__dirname, '../src');

export default defineConfig({
	server: {
		host: true,
		port: '8080'
	},
	plugins: [
		vue()
	],
	resolve: {
		alias: [
			{
				find: /^recycle-list/,
				replacement: resolve(pkgRoot),
			}
		],
	}
});