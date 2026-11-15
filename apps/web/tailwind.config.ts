import type { Config } from 'tailwindcss';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const uiPreset = require('../../packages/ui-tokens/dist/tailwind.preset.cjs');

const config: Config = {
  presets: [uiPreset],
  content: ['./src/**/*.{ts,tsx}'],
};

export default config;
