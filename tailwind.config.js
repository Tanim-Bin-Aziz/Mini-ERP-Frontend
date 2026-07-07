/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF8',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#15171C',
          soft: '#4B4E58',
          faint: '#8A8D97',
        },
        border: '#E7E5DF',
        brand: {
          DEFAULT: '#2B3A67',
          light: '#3E5290',
          dark: '#1C2745',
        },
        gold: {
          DEFAULT: '#C99A3B',
          light: '#E0B75C',
          dark: '#A87D28',
        },
        success: '#0F6B5C',
        danger: '#B3432B',
        warn: '#C99A3B',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.2rem' }],
        base: ['0.875rem', { lineHeight: '1.35rem' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(21, 23, 28, 0.04), 0 1px 1px rgba(21, 23, 28, 0.03)',
        pop: '0 8px 24px rgba(21, 23, 28, 0.10)',
      },
    },
  },
  plugins: [],
};
