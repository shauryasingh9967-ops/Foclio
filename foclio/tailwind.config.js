/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Geist"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      colors: {
        bg: {
          base:    '#08090a',
          surface: '#0f1011',
          raised:  '#161819',
          overlay: '#1d1f21',
          border:  '#252729',
          muted:   '#2e3133',
        },
        text: {
          primary:   '#f0f0f0',
          secondary: '#8b8f94',
          muted:     '#4a4e53',
          accent:    '#f5a623',
        },
        accent: {
          DEFAULT: '#f5a623',
          dim:     '#f5a62320',
          border:  '#f5a62340',
          hover:   '#f0971a',
        },
        danger: {
          DEFAULT: '#ef4444',
          dim:     '#ef444420',
        },
        success: {
          DEFAULT: '#22c55e',
          dim:     '#22c55e20',
        },
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(245,166,35,0.12)',
        'glow':     '0 0 24px rgba(245,166,35,0.15)',
        'card':     '0 1px 3px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        'modal':    '0 8px 64px rgba(0,0,0,0.7)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:     { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeDown:   { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-500px 0' }, '100%': { backgroundPosition: '500px 0' } },
        pulse:      { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        spin:       { to: { transform: 'rotate(360deg)' } },
        bounce:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease forwards',
        'fade-up':     'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-down':   'fadeDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':    'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right': 'slideRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':     'shimmer 1.6s linear infinite',
        'pulse-soft':  'pulse 2.5s ease-in-out infinite',
        'spin-slow':   'spin 1.2s linear infinite',
        'bounce-soft': 'bounce 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
