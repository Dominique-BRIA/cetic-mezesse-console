/** @type {import('tailwindcss').Config} */
const v = (nom) => `rgb(var(--${nom}) / <alpha-value>)`;
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: { sans: ['"Public Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        fond: v('fond'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        bord: v('bord'),
        encre: v('encre'),
        'encre-2': v('encre-2'),
        'encre-3': v('encre-3'),
        primaire: v('primaire'),
        'primaire-fonce': v('primaire-fonce'),
        'primaire-pale': v('primaire-pale'),
        succes: v('succes'),
        danger: v('danger'),
        alerte: v('alerte'),
      },
      borderRadius: { DEFAULT: '6px', md: '6px', lg: '8px' },
    },
  },
  plugins: [],
};
