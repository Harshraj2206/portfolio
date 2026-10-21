/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0C10',
        apple: {
          blue: '#0A84FF',
          blueLink: '#409CFF', // Optimal contrast link/text on dark graphite (6.2:1 WCAG AA)
          blueText: '#0071E3', // High-contrast Apple Blue for text on light backgrounds
          gray: {
            50: '#FBFBFD',
            100: '#F5F5F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#A1A1A6', // Secondary text on dark
            500: '#6E6E73', // Secondary text on light
            600: '#515154', // Body text on light
            700: '#3A3A3C',
            800: '#22232A',
            900: '#16171D',
            950: '#0B0C10',
          },
          darkSurface: 'rgba(255, 255, 255, 0.07)',
          darkBorder: 'rgba(255, 255, 255, 0.12)',
          darkHighlight: 'rgba(255, 255, 255, 0.18)',
        },
      },
      fontFamily: {
        apple: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'panel': '36px',
        'card': '28px',
        'chip': '12px',
        'pill': '9999px',
      },
      backdropBlur: {
        'glass': '24px',
        'heavy': '36px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 10px 40px rgba(0, 0, 0, 0.45)',
        'panel-dark': '0 10px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
        'featured-dark': '0 16px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
        'glow-soft-blue': '0 0 80px 20px rgba(10, 132, 255, 0.22)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'glow-slow': 'glowDrift 30s ease-in-out infinite alternate',
      },
      keyframes: {
        glowDrift: {
          '0%': { transform: 'scale(1) translateY(0px)' },
          '50%': { transform: 'scale(1.08) translateY(-15px)' },
          '100%': { transform: 'scale(1.02) translateY(12px)' },
        },
      },
    },
  },
  plugins: [],
};
