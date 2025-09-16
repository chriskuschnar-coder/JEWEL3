import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  installPrompt: BeforeInstallPromptEvent | null
  showInstallBanner: boolean
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    installPrompt: null,
    showInstallBanner: false
  })

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://') ||
                        window.location.search.includes('utm_source=homescreen')

    // Check if app is installable
    const checkInstallability = () => {
      setPWAState(prev => ({
        ...prev,
        isStandalone,
        isInstalled: isStandalone,
        showInstallBanner: !isStandalone && prev.isInstallable
      }))
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('📱 PWA install prompt available')
      e.preventDefault() // Prevent automatic prompt
      
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
        showInstallBanner: !isStandalone
      }))
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully')
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
        showInstallBanner: false
      }))
    }

    // Force installable state in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Forcing PWA installable state for testing')
      setTimeout(() => {
        setPWAState(prev => ({
          ...prev,
          isInstallable: true,
          showInstallBanner: !isStandalone
        }))
      }, 1000) // Faster in development
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    checkInstallability()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!pwaState.installPrompt) {
      console.warn('⚠️ No install prompt available')
      return false
    }

    try {
      console.log('📱 Triggering PWA install prompt')
      await pwaState.installPrompt.prompt()
      
      const choiceResult = await pwaState.installPrompt.userChoice
      console.log('📱 User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        setPWAState(prev => ({
          ...prev,
          installPrompt: null,
          showInstallBanner: false
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ PWA install failed:', error)
      return false
    }
  }

  const dismissInstallBanner = () => {
    setPWAState(prev => ({
      ...prev,
      showInstallBanner: false
    }))
    
    // Remember user dismissed the banner
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Check if user previously dismissed the banner (don't show for 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      if (dismissedTime > sevenDaysAgo) {
        setPWAState(prev => ({
          ...prev,
          showInstallBanner: false
        }))
      }
    }
  }, [])

  return {
    ...pwaState,
    installApp,
    dismissInstallBanner
  }
}