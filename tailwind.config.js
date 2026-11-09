/** @type {import('tailwindcss').Config} */
const v = (nom) => `rgb(var(--${nom}) / <alpha-value>)`;
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--police)', 'system-ui', 'sans-serif'] },
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
        bouton: v('bouton'),
        'bouton-fonce': v('bouton-fonce'),
        succes: v('succes'),
        danger: v('danger'),
        alerte: v('alerte'),
      },
      borderRadius: { sm: '0.375rem', DEFAULT: '0.5rem', md: '0.5rem', lg: '0.625rem', xl: '0.875rem', '2xl': '1rem' },
    },
  },
  plugins: [],
};
