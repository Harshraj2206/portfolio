/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0A84FF',
          blueText: '#0071E3', // High-contrast Apple Blue for text on light backgrounds (4.6:1+ WCAG AA)
          purple: '#AF52DE',
          teal: '#30B0C7',
          pink: '#FF375F',
          green: '#34C759',
          yellow: '#FFD60A',
          gray: {
            50: '#FBFBFD',
            100: '#F5F5F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#A1A1A6',
            500: '#6E6E73', // High-contrast secondary text
            600: '#515154', // High-contrast body text
            700: '#3A3A3C',
            800: '#2C2C2E',
            900: '#1D1D1F',
            950: '#000000',
          },
          darkSurface: 'rgba(28, 28, 30, 0.65)',
          lightSurface: 'rgba(255, 255, 255, 0.65)',
        },
      },
      fontFamily: {
        apple: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        'panel': '36px',
        'card': '28px',
        'chip': '14px',
        'pill': '9999px',
      },
      backdropBlur: {
        'glass': '24px',
        'heavy': '40px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.40), 0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'glow-blue': '0 0 24px -2px rgba(10, 132, 255, 0.35)',
        'glow-purple': '0 0 24px -2px rgba(175, 82, 222, 0.35)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'mesh-slow': 'meshGradient 20s ease-in-out infinite alternate',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        meshGradient: {
          '0%': { transform: 'scale(1) translate(0px, 0px) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) translate(25px, -20px) rotate(3deg)' },
          '100%': { transform: 'scale(1) translate(-20px, 20px) rotate(-3deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
