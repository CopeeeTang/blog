/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Orange accent — Anthropic brand feel
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Near-black text scale
        ink: {
          DEFAULT: '#141413',
          light:   '#525252',
          lighter: '#737373',
          faint:   '#d4d4d4',
        },
        // Surface backgrounds — pure white + neutral greys
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f5f5f5',
          subtle:  '#fafafa',
        },
      },
      fontFamily: {
        sans:  ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body':     theme('colors.ink.DEFAULT'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-links':    theme('colors.primary.700'),
            maxWidth: '72ch',
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
