/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#09090b',
          raised: '#0f0f12',
          overlay: '#15151a',
        },
        line: {
          DEFAULT: '#1f1f26',
          soft: '#2a2a33',
          strong: '#3f3f4a',
        },
        mist: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
        },
        accent: {
          DEFAULT: '#2dd4bf',
          dim: '#14b8a6',
          soft: 'rgba(45, 212, 191, 0.12)',
          glow: 'rgba(45, 212, 191, 0.08)',
        },
        signal: {
          open: '#fb923c',
          progress: '#38bdf8',
          closed: '#2dd4bf',
          high: '#f87171',
          medium: '#fbbf24',
          low: '#a1a1aa',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.35)',
        lift: '0 0 0 1px rgba(45,212,191,0.25), 0 12px 40px rgba(0,0,0,0.45)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.35s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
