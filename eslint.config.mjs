import { defineConfig, globalIgnores } from 'eslint/config'
import convexPlugin from '@convex-dev/eslint-plugin'

export default defineConfig([
  ...convexPlugin.configs.recommended,
  globalIgnores(['convex/_generated', 'dist']),
])
