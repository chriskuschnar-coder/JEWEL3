/** @type {import('tailwindcss').Config} */
import { designTokens } from './src/lib/design-tokens.ts'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // shadcn/ui theme integration
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Design system colors
        ...designTokens.colors,
        // Semantic mappings
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        error: designTokens.colors.error,
        neutral: designTokens.colors.neutral,
        // Backward compatibility
        navy: designTokens.colors.neutral,
        gold: designTokens.colors.warning,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Design system border radius
        ...designTokens.borderRadius,
      },
      
      // Typography system
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      
      // Spacing system
      spacing: designTokens.spacing,
      
      // Shadow system
      boxShadow: designTokens.shadows,
      
      // Animation system
      transitionTimingFunction: designTokens.animations.easing,
      transitionDuration: designTokens.animations.duration,
      
      // Enhanced animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite'
      },
      
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      },
      
      // Fortune 500 enhancements
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        }
      },
      
      // Prevent horizontal overflow
      maxWidth: {
        'screen': '100vw',
        'full': '100%',
        'none': 'none',
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        // Enhanced utilities for Fortune 500 experience
        '.animate-shimmer': {
          'background-size': '200% 100%',
          'animation': 'shimmer 1.5s ease-in-out infinite'
        },
        
        '.animate-in': {
          'animation-fill-mode': 'both'
        },
        
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        
        '.touch-manipulation': {
          'touch-action': 'manipulation'
        },
        
        '.hardware-acceleration': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'will-change': 'transform'
        },
        
        '.glass-effect': {
          'background': 'hsl(var(--background) / 0.9)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid hsl(var(--border) / 0.2)'
        },
        
        '.professional-shadow': {
          'box-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        },
        
        '.enterprise-gradient': {
          'background': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
        },
        
        // Mobile-specific utilities
        '.mobile-container': {
          'width': '100%',
          'max-width': '100vw',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          'overflow-x': 'hidden'
        },
        
        '.mobile-no-overflow': {
          'overflow-x': 'hidden',
          'max-width': '100vw',
          'width': '100%'
        }
      }
      addUtilities(newUtilities)
    }
  ],
}