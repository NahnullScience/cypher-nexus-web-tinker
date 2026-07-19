import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	// project page, served at https://nahnullscience.github.io/cypher-nexus-web-tinker/
	// change to '/' if this ever moves to a user/org page or a custom domain
	base: '/cypher-nexus-web-tinker/',
	plugins: [preact()],
	resolve: {
		alias: {
			// most drag/dnd + UI libs on npm are written against the React API surface.
			// preact/compat is a shim that makes them work unmodified - tsconfig.json
			// already does this for type-checking, this is the runtime/bundle equivalent.
			react: 'preact/compat',
			'react-dom': 'preact/compat',
		},
	},
});
