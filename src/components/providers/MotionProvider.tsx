// Motion Provider - Fortune 500 Grade
// Framer Motion configuration and global animation settings

import React from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'

interface MotionProviderProps {
  children: React.ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        transition={{
          type: 'tween',
          duration: 0.2,
          ease: 'easeOut'
        }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

// Utility hook for consistent motion values
export function useMotionValues() {
  return {
    // Standard transitions
    fast: { duration: 0.15, ease: 'easeOut' },
    normal: { duration: 0.2, ease: 'easeOut' },
    slow: { duration: 0.3, ease: 'easeOut' },
    
    // Hover states
    hover: {
      scale: 1.02,
      transition: { duration: 0.15, ease: 'easeOut' }
    },
    
    // Tap states
    tap: {
      scale: 0.98,
      transition: { duration: 0.1, ease: 'easeInOut' }
    },
    
    // Layout animations
    layout: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  }
}

// Animation variants for common patterns
export const commonVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  }
}