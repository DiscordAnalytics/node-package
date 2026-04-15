import { defineConfig, globalIgnores } from 'eslint/config';
import skipFormatting from 'eslint-config-prettier/flat';
import eslintPluginConfigPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig(
  ...tseslint.configs.recommended,
  {
    name: 'packages/files-to-lint',
    files: ['**/*.ts'],
  },
  globalIgnores(['**/dist/**', '**/coverage/**']),
  skipFormatting,
  eslintPluginConfigPrettierRecommended,
);
