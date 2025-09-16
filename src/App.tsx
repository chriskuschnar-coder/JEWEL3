import * as React from "react"
import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { WhyGMCSection } from './components/WhyGMCSection'
import { BuildPortfolioSection } from './components/BuildPortfolioSection'
import { MarketBuzzSection } from './components/MarketBuzzSection'
import { TradeAnywhereSection } from './components/TradeAnywhereSection'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { PWAInstallBanner } from './components/PWAInstallBanner'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWAUpdateNotification } from './components/PWAUpdateNotification'
import { usePWA } from './hooks/usePWA'
import { useAuth } from './components/auth/AuthProvider'

export default function App() {
  const { user } = useAuth()
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)
  const [platformLoading, setPlatformLoading] = useState(false)
  const { showInstallBanner, installApp, dismissInstallBanner, isInstallable, isStandalone } = usePWA()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [debugPWA, setDebugPWA] = useState(false)

  // Check if app is running in standalone mode (PWA)
  // PWA Mode: Launch directly to login if no user is authenticated
  useEffect(() => {
    if (isStandalone && !user && !showInvestmentPlatform) {
      console.log('📱 PWA Mode: Launching directly to login page')
      setShowInvestmentPlatform(true)
    }
  }, [isStandalone, user, showInvestmentPlatform])

  // Handle admin routing
  useEffect(() => {
    const handleAdminRouting = () => {
      const path = window.location.pathname
      if (path.startsWith('/admin') && !showInvestmentPlatform) {
        setShowInvestmentPlatform(true)
      }
    }

    handleAdminRouting()
    window.addEventListener('popstate', handleAdminRouting)
    
    return () => {
      window.removeEventListener('popstate', handleAdminRouting)
    }
  }, [showInvestmentPlatform])

  const handleAppUpdate = async () => {
    if (serviceWorkerRegistration?.waiting) {
      console.log('🔄 Manually triggering service worker update...')
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Force reload after a short delay
      setTimeout(() => {
        console.log('🔄 Reloading page for manual update...')
        window.location.reload()
      }, 500)
      return true
    }
    return false
  }

  const handleNavigateToLogin = () => {
    setPlatformLoading(true)
    // Small delay to show loading state
    setTimeout(() => {
      setPlatformLoading(false)
      setShowInvestmentPlatform(true)
    }, 500)
  }

  useEffect(() => {
    window.addEventListener('navigate-to-login', handleNavigateToLogin)
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      // Allow service worker in development for PWA testing
      const shouldRegisterSW = process.env.NODE_ENV === 'production' || 
                              window.location.hostname.includes('localhost') ||
                              window.location.hostname.includes('127.0.0.1') ||
                              window.location.hostname.includes('stackblitz')
      
      if (shouldRegisterSW) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope)
            setServiceWorkerRegistration(registration)
            
            // Force update check on every page load
            console.log('🔄 Checking for service worker updates...')
            registration.update()
            
            // Listen for service worker updates
            registration.addEventListener('updatefound', () => {
              console.log('🆕 New service worker found, installing...')
          console.log('🔧 Registering service worker for PWA functionality...')
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New service worker installed, activating immediately...')
                    // Auto-activate new service worker immediately
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    // Reload page to get latest code
                    setTimeout(() => {
                      console.log('🔄 Reloading page to activate new code...')
                      window.location.reload()
                    }, 1000)
                  }
                })
              }
            })
            
            // Listen for controlling service worker changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('👑 Service worker controller changed - reloading for latest code')
              window.location.reload()
            })
            
            // Listen for force reload messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'FORCE_RELOAD') {
                console.log('🔄 Service worker requesting force reload for new version')
                window.location.reload()
              }
            })
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error)
          })
      })
    }
    }
    
    // Development mode: Force cache clear and reload on every page load
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Clearing caches for fresh code')
    }
    // Show install prompt after 30 seconds if installable
    const installTimer = setTimeout(() => {
      if (isInstallable && !isStandalone && !showInstallBanner) {
        console.log('🔍 PWA Debug: Showing install prompt after 30s timer')
        setShowInstallPrompt(true)
      }
      console.log('🔍 PWA Debug: Timer fired - isInstallable:', isInstallable, 'isStandalone:', isStandalone, 'showInstallBanner:', showInstallBanner)
    }, 10000) // Reduced to 10 seconds for better UX
    
    // Debug: Show install prompt immediately for testing
    const debugTimer = setTimeout(() => {
      if (!isStandalone) {
        console.log('🔍 PWA Debug: Force showing install prompt for testing')
        setShowInstallPrompt(true)
      }
    }, 3000) // Show after 3 seconds for testing
    
    return () => {
      window.removeEventListener('navigate-to-login', handleNavigateToLogin)
      clearTimeout(installTimer)
      clearTimeout(debugTimer)
    }
  }, [isInstallable, isStandalone, showInstallBanner])
  
  const handleBackToHome = () => {
    setShowInvestmentPlatform(false)
    setPlatformLoading(false)
  }

  if (platformLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-navy-600 dark:text-primary-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Client Portal</h3>
          <p className="text-gray-600 dark:text-gray-400">Initializing secure connection...</p>
        </div>
      </div>
    )
  }

  if (showInvestmentPlatform) {
    return <InvestmentPlatform onBackToHome={handleBackToHome} />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-300 overflow-x-hidden">
      <Header onNavigateToLogin={handleNavigateToLogin} isLoggedIn={!!user} />
      <Hero />
      <WhyGMCSection />
      <BuildPortfolioSection />
      <MarketBuzzSection />
      <TradeAnywhereSection />
      <Footer />
      
      {/* PWA Install Components */}
      <PWAInstallBanner />
      <PWAInstallPrompt
        onInstall={installApp}
        onDismiss={() => setShowInstallPrompt(false)}
        isVisible={showInstallPrompt}
      />
      
      {/* Debug PWA Status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black text-white p-3 rounded-lg text-xs z-50">
          <div>PWA Debug:</div>
          <div>Installable: {isInstallable ? '✅' : '❌'}</div>
          <div>Standalone: {isStandalone ? '✅' : '❌'}</div>
          <div>Show Banner: {showInstallBanner ? '✅' : '❌'}</div>
          <div>Show Prompt: {showInstallPrompt ? '✅' : '❌'}</div>
          <button 
            onClick={() => setShowInstallPrompt(true)}
            className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
          >
            Force Show Prompt
          </button>
        </div>
      )}
      
      <PWAUpdateNotification
        isVisible={showUpdateNotification}
        onUpdate={handleAppUpdate}
        onDismiss={() => setShowUpdateNotification(false)}
      />
    </div>
  )
}