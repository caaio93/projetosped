/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais do Taiga
        primary: {
          50: '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#00afaf', // Cor principal ciano/teal
          600: '#008c8c',
          700: '#006969',
          800: '#004646',
          900: '#002323',
        },
        sidebar: {
          DEFAULT: '#2c3e50', // Azul escuro do sidebar
          dark: '#1a252f',
          light: '#34495e',
        },
        // Status colors
        status: {
          new: '#70728f',
          inProgress: '#e44057',
          readyForTest: '#ffc107',
          closed: '#a8e6cf',
          needsInfo: '#ff9800',
        },
        // Priority colors
        priority: {
          low: '#4caf50',
          normal: '#ffc107',
          high: '#f44336',
        },
        // Severity colors
        severity: {
          wishlist: '#9e9e9e',
          minor: '#4caf50',
          normal: '#4caf50',
          important: '#ffc107',
          critical: '#f44336',
        },
        // Type colors
        type: {
          bug: '#f44336',
          enhancement: '#2196f3',
          question: '#9c27b0',
          support: '#607d8b',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
