import { useState, useEffect } from 'react'

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPWA: boolean
  isIOS: boolean
  isAndroid: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  orientation: 'portrait' | 'landscape'
  hasTouch: boolean
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPWA: false,
    isIOS: false,
    isAndroid: false,
    screenSize: 'lg',
    orientation: 'landscape',
    hasTouch: false
  })

  useEffect(() => {
    const updateDetection = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Device detection
      const isMobile = width < 768 || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = width >= 768 && width < 1024 && /ipad|android/i.test(userAgent)
      const isDesktop = width >= 1024 && !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      
      // PWA detection
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   (window.navigator as any).standalone === true ||
                   document.referrer.includes('android-app://') ||
                   window.location.search.includes('utm_source=homescreen')
      
      // OS detection
      const isIOS = /iphone|ipad|ipod/i.test(userAgent)
      const isAndroid = /android/i.test(userAgent)
      
      // Screen size
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg'
      if (width < 375) screenSize = 'xs'
      else if (width < 640) screenSize = 'sm'
      else if (width < 768) screenSize = 'md'
      else if (width < 1024) screenSize = 'lg'
      else screenSize = 'xl'
      
      // Orientation
      const orientation = height > width ? 'portrait' : 'landscape'
      
      // Touch support
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isPWA,
        isIOS,
        isAndroid,
        screenSize,
        orientation,
        hasTouch
      })
    }

    updateDetection()
    
    // Listen for resize and orientation changes
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)
    
    return () => {
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return detection
}