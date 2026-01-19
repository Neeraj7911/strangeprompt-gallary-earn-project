/**
 * Tailwind configuration for StrangePrompt.
 * Dark mode relies on a class toggle handled in the app shell.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ffe8ea',
          100: '#ffcfd3',
          200: '#ff9ea6',
          300: '#ff5662',
          400: '#f52938',
          500: '#e50914',
          600: '#c40811',
          700: '#9c050d',
          800: '#730309',
          900: '#4b0105',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
      },
    },
  },
  plugins: [],
}
