import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#1a472a',
        gold: '#d4af37',
      },
    },
  },
  plugins: [],
} satisfies Config;
