/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // SYSTÈME DE COULEURS WECCOO
      // Basé sur l'identité visuelle du logo
      // ============================================

      // COULEURS PRIMAIRES (Bleu WECCOO)
      colors: {
        // Primary - Bleu principal #1E63D6
        primary: {
          50: '#e6edfc',
          100: '#c2d4f6',
          200: '#9bb9ef',
          300: '#739de8',
          400: '#5586e2',
          500: '#1E63D6', // Bleu principal
          600: '#1a56bf',
          700: '#0F4FBF', // Bleu foncé (hover/actif)
          800: '#0d4499',
          900: '#0a3373',
          950: '#07224a',
        },

        // Secondary - Jaune WECCOO
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#F5C400', // Jaune secondaire
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#451a03',
        },

        // Accent - Combinaison bleu/jaune pour certains éléments
        accent: {
          50: '#fef7e6',
          100: '#fdedc2',
          200: '#fce299',
          300: '#fbd76f',
          400: '#f9cc4a',
          500: '#F5C400', // Jaune accent
          600: '#d4a800',
          700: '#b08c00',
          800: '#8c7000',
          900: '#685400',
        },

        // Background - Gris clair
        background: {
          DEFAULT: '#F2F2F2',
          50: '#fafafa',
          100: '#F2F2F2',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
        },

        // Surface - Blanc pour les cartes
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
        },

        // Texte principal
        text: {
          primary: '#1a1a1a',
          secondary: '#525252',
          tertiary: '#737373',
          inverse: '#FFFFFF',
        },

        // Marque (Brand)
        brand: {
          DEFAULT: '#1E63D6',
          light: '#3b82f6',
          dark: '#0F4FBF',
        },

        // États des composants
        states: {
          hover: '#0F4FBF',
          active: '#0a3373',
          disabled: '#d4d4d4',
          focus: '#1E63D6',
        },

        // Couleurs fonctionnelles
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        info: {
          DEFAULT: '#1E63D6',
          light: '#dbeafe',
          dark: '#2563eb',
        },

        // Neutral - Gris pour les éléments UI
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Border
        border: {
          DEFAULT: '#e5e5e5',
          light: '#f5f5f5',
          dark: '#d4d4d4',
        },
      },

      // SPACING
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },

      // BORDER RADIUS - Design moderne
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },

      // BOX SHADOW - Ombres modernes
      boxShadow: {
        // Ombres douces pour les cartes
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        // Ombres colorées (effet moderne)
        'primary': '0 4px 14px 0 rgb(30 99 214 / 0.25)',
        'primary-lg': '0 10px 25px 0 rgb(30 99 214 / 0.3)',
        'secondary': '0 4px 14px 0 rgb(245 196 0 / 0.25)',
      },

      // TYPOGRAPHIE
      fontSize: {
        // Sizes pour une meilleure lisibilité
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },

      // OPACITY
      opacity: {
        '15': '0.15',
        '25': '0.25',
        '35': '0.35',
        '45': '0.45',
      },

      // ANIMATION
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
