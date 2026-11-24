/** @type {import('tailwindcss').Config} */
module.exports = {
  // Theme is switched by adding/removing the `dark` class on <html> (see src/js/theme.js)
  darkMode: 'class',
  content: ['./*.html', './src/**/*.js'],
  theme: {
    // Full-screen layout: fluid container up to 1440px with generous gutters
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.75rem', lg: '2.5rem', xl: '3.5rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        // Primary — royal blue taken from the reference logo (#0d5bc9)
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6fe',
          300: '#8ebcfc',
          400: '#5a98f7',
          500: '#2f76ec',
          600: '#0d5bc9', // primary
          700: '#0b4aa6',
          800: '#0f3f87',
          900: '#12376f',
          950: '#0d2247',
        },
        // Accent — sunny amber → orange gradient from the logo (#fdab12 → #e46b00)
        accent: {
          50: '#fff8eb',
          100: '#ffecc6',
          200: '#ffd688',
          300: '#ffbd4a',
          400: '#fdab12', // logo amber
          500: '#f28c06',
          600: '#e46b00', // logo orange
          700: '#b14b06', // accessible orange text on white
          800: '#8f3a0c',
          900: '#76310d',
        },
        // Cool light surfaces
        sand: {
          50: '#f6f8fc',
          100: '#eef2f9',
          200: '#dfe6f2',
          300: '#c5d0e3',
        },
        // Text
        ink: {
          DEFAULT: '#2b3445',
          500: '#5b6577', // muted text (≈5.9:1 on white)
          900: '#0f1a2e',
        },
        // Dark mode — deep navy
        night: {
          950: '#060b16',
          900: '#0a1120', // page background
          800: '#111a2d', // surface
          700: '#1a263d',
          600: '#283955',
          300: '#a3b0c6', // muted text
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        // Fluid display sizes for the full-screen hero and section titles
        'display-xl': ['clamp(2.6rem, 6.2vw, 5.75rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.1rem, 4.2vw, 3.6rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,26,46,.04), 0 10px 30px -14px rgba(15,26,46,.14)',
        lift: '0 2px 6px rgba(15,26,46,.05), 0 24px 48px -20px rgba(13,91,201,.35)',
        glow: '0 0 0 1px rgba(13,91,201,.08), 0 30px 60px -24px rgba(13,91,201,.45)',
        warm: '0 18px 40px -18px rgba(228,107,0,.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0d5bc9 0%, #2f76ec 55%, #5a98f7 100%)',
        'accent-gradient': 'linear-gradient(135deg, #fdab12 0%, #e46b00 100%)',
        'text-gradient': 'linear-gradient(100deg, #0d5bc9 10%, #2f76ec 45%, #f28c06 90%)',
        'text-gradient-dark': 'linear-gradient(100deg, #8ebcfc 10%, #5a98f7 45%, #ffbd4a 90%)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.08)' },
          '66%': { transform: 'translate(-24px,20px) scale(.95)' },
        },
        'scroll-dot': { '0%': { transform: 'translateY(0)', opacity: 1 }, '80%': { transform: 'translateY(14px)', opacity: 0 }, '100%': { opacity: 0 } },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        'scroll-dot': 'scroll-dot 1.8s ease-in-out infinite',
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(.2,.7,.2,1)' },
    },
  },
  plugins: [],
};
