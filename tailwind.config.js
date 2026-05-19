/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Body & UI — clean modern sans
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Editorial display — heavy condensed bold (hero headlines, FITAURA wordmark)
        display: ['Anton', 'Impact', 'Inter', 'sans-serif'],
        // Legacy aliases (kept for any leftover usage in non-home pages)
        serif: ['"Playfair Display"', 'serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
      colors: {
        // FITAURA brand palette
        sienna: {
          50: '#FBF1EC',
          100: '#F6E0D5',
          200: '#EDC0A8',
          300: '#E29D7C',
          400: '#D87854',
          500: '#D14F2B', // brand primary — burnt sienna
          600: '#B83F1E',
          700: '#92301A',
          800: '#6D2415',
          900: '#481910',
          950: '#2B0D08',
        },
        cream: {
          50: '#FBF7F1', // page background — warm off-white
          100: '#F7F0E6',
          200: '#EFE3D1',
          300: '#E5D2B8',
          400: '#D6BC97',
          500: '#C6A578',
          600: '#A98758',
          700: '#7D6240',
          800: '#544228',
          900: '#2E2417',
        },
        ink: {
          50: '#F4F4F3',
          100: '#E5E5E3',
          200: '#C8C8C5',
          300: '#A1A19D',
          400: '#6E6E6A',
          500: '#494945',
          600: '#33332F',
          700: '#26261F', // footer & dark sections
          800: '#1A1A14',
          900: '#0F0F0B', // deepest charcoal
        },
        // Preserve legacy `brand` token (used by stray components) but realign to sienna
        brand: {
          DEFAULT: '#D14F2B',
          light: '#D87854',
          dark: '#92301A',
          accent: '#E5D2B8',
          muted: '#F7F0E6',
        },
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      letterSpacing: {
        'widest-x': '0.25em',
        'mega': '0.35em',
      },
      boxShadow: {
        'soft': '0 8px 28px -12px rgba(38, 38, 31, 0.18)',
        'soft-lg': '0 24px 48px -18px rgba(38, 38, 31, 0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
