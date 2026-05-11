/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Colors from DESIGN.md ─────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#8127cf',
          container: '#9c48ea',
          fixed: '#f0dbff',
          'fixed-dim': '#ddb7ff',
          'on': '#ffffff',
          'on-container': '#fffbff',
          'on-fixed': '#2c0051',
          'on-fixed-variant': '#6900b3',
          inverse: '#ddb7ff',
          tint: '#842bd2',
        },
        secondary: {
          DEFAULT: '#635b6e',
          container: '#e9def5',
          fixed: '#e9def5',
          'fixed-dim': '#cdc2d9',
          'on': '#ffffff',
          'on-container': '#696174',
          'on-fixed': '#1e1929',
          'on-fixed-variant': '#4a4456',
        },
        tertiary: {
          DEFAULT: '#7b5500',
          container: '#9b6b00',
          fixed: '#ffdead',
          'fixed-dim': '#fabc4e',
          'on': '#ffffff',
          'on-container': '#fffbff',
          'on-fixed': '#281900',
          'on-fixed-variant': '#604100',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f5',
          container: '#edeeef',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          tint: '#842bd2',
          variant: '#e1e3e4',
          'on': '#191c1d',
          'on-variant': '#4d4354',
          inverse: '#2e3132',
          'inverse-on': '#f0f1f2',
        },
        outline: {
          DEFAULT: '#7e7385',
          variant: '#cfc2d6',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          'on': '#ffffff',
          'on-container': '#93000a',
        },
      },

      // ── Typography ────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['13px', { lineHeight: '1.2', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      // ── Border radius ─────────────────────────────────────────────
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },

      // ── Spacing ───────────────────────────────────────────────────
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2.5rem',
        '2xl': '4rem',
        sidebar: '280px',
      },

      // ── Box shadows (lavender-tinted ambient) ─────────────────────
      boxShadow: {
        float: '0 8px 40px 0 rgba(168,85,247,0.06), 0 2px 8px 0 rgba(0,0,0,0.05)',
        card: '0 2px 16px 0 rgba(168,85,247,0.05), 0 1px 4px 0 rgba(0,0,0,0.04)',
      },

      // ── Backdrop blur (glassmorphism) ─────────────────────────────
      backdropBlur: {
        glass: '16px',
      },

      maxWidth: {
        thread: '48rem',
      },
    },
  },
  plugins: [],
}
