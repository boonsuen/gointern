import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#1677ff',
          hover: '#4096ff',
        },
        ...colors,
      },
    },
  },
  plugins: [],
}
export default config
