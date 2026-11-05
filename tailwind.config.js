/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 深靛蓝主色
        ink: {
          DEFAULT: '#1E1B3A',
          900: '#15132B',
          800: '#1E1B3A',
          700: '#2A2750',
          600: '#37336A',
        },
        // 柔和紫色
        lilac: {
          DEFAULT: '#9B8DE5',
          light: '#C4BBF0',
          dark: '#7C6DD0',
        },
        // 米白色（浅色主题背景）
        cream: {
          DEFAULT: '#F8F6F2',
          dark: '#EDE9E1',
        },
        // 淡金色
        gold: {
          DEFAULT: '#D8B77C',
          light: '#E8D2A6',
          dark: '#BFA06A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(30, 27, 58, 0.12)',
        glow: '0 0 24px rgba(155, 141, 229, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.96)' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop': 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
