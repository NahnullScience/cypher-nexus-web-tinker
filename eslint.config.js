import preactConfig from 'eslint-config-preact';
import tseslint from 'typescript-eslint';

export default [
	// JS/JSX: preact's own rules (react-hooks, jsx-key, etc.) via its babel parser
	...preactConfig,

	// TS/TSX: same preact rule intent, but with a parser that actually understands
	// TypeScript syntax - eslint-config-preact's babel parser doesn't.
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: ['**/*.{ts,tsx}'],
	})),
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// signals + explicit ids make plain functions read fine without this
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},

	{ ignores: ['dist/**'] },
];
