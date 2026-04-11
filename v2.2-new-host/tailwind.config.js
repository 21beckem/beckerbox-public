import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'becker': {
          50:  '#f0faf4',
          100: '#daf3e6',
          200: '#b6e6ce',
          300: '#84d1ae',
          400: '#4fb587',
          500: '#2d9a6b',
          600: '#1f7d54',
          700: '#1a6344',
          800: '#174f38',
          900: '#14422f',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slot-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'slot-pulse': 'slot-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Custom "ch" variant: applies when :hover OR the element has the .hover class
    // This enables dual-mode navigation (mouse + game controller)
    plugin(function ({ addVariant }) {
      addVariant('ch', ['&:hover', '&.hover']);
    }),
  ],
};
