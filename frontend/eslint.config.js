import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default {
  files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  languageOptions: {
    globals: globals.browser,
  },
  plugins: {
    react: pluginReact,
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Custom rule
    ...pluginJs.configs.recommended.rules, // Add rules from recommended config
    ...tseslint.configs.recommended.rules, // Add rules from TypeScript ESLint recommended config
    ...pluginReact.configs.flat.recommended.rules, // Add rules from React plugin recommended config
  },
};
