/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: '#FAFBF7',
        surface: '#FFFFFF',
        ink: {
          900: '#0F1B14',
          700: '#33433A',
          500: '#5C6B62',
          300: '#94A199',
          200: '#D8DED9',
          100: '#EDF1EC',
        },
        forest: {
          950: '#0A2A18',
          900: '#0E3B22',
          800: '#125230',
          700: '#166B3E',
          600: '#1B8A4E',
          500: '#22A85F',
          400: '#4FC27E',
          300: '#8AD9A8',
          200: '#C3EDD3',
          100: '#E6F7EC',
          50: '#F2FBF5',
        },
        mist: {
          600: '#0D8A82',
          500: '#14A69C',
          200: '#CDEFEC',
        },
        aqi: {
          good: '#22A85F',
          moderate: '#D6A70C',
          sensitive: '#E5822A',
          unhealthy: '#D8492E',
          veryunhealthy: '#9A3FBF',
          hazardous: '#7A2035',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 27, 20, 0.04), 0 8px 24px -8px rgba(15, 27, 20, 0.08)',
        card: '0 1px 3px rgba(15, 27, 20, 0.06), 0 12px 32px -12px rgba(15, 27, 20, 0.10)',
        lift: '0 4px 8px rgba(15, 27, 20, 0.06), 0 20px 40px -16px rgba(15, 27, 20, 0.16)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.35' },
          '50%': { transform: 'translateY(-14px) translateX(6px)', opacity: '0.65' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
