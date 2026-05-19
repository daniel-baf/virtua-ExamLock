import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const domains = ['auth', 'sessions', 'monitoring', 'users', 'admin', 'audit']

function crossDomainRestrictions(current) {
  return domains
    .filter(domain => domain !== current)
    .map(domain => ({
      group: [`@${domain}/*`],
      message: `Usa @${domain} para consumir solo la API publica del dominio.`,
    }))
}

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../../../*', '../../../../*', '../../../../../*'],
            message: 'Usa aliases del dominio o @shared en lugar de imports relativos largos.',
          },
          {
            group: ['@domains/*/*'],
            message: 'Importa desde @domains o desde el barrel publico del dominio correspondiente.',
          },
        ],
      }],
    },
  },
  ...domains.map(domain => ({
    files: [`src/domains/${domain}/**/*.{js,jsx}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: crossDomainRestrictions(domain),
      }],
    },
  })),
  {
    files: ['src/domains/index.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['./*/**'],
            message: 'domains/index.js solo puede importar desde los barrels publicos de cada dominio.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/**/context/*.jsx', 'src/shared/theme/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
