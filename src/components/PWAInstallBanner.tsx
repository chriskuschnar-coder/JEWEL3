import React from 'react'
import { Download, X, Smartphone, TrendingUp } from 'lucide-react'
import { Logo } from './Logo'
import { usePWA } from '../hooks/usePWA'

export function PWAInstallBanner() {
  const { showInstallBanner, installApp, dismissInstallBanner, isStandalone } = usePWA()

  // Don't show if already installed
  if (isStandalone) {
    return null
  }

  // Force show in development for testing
  const shouldShow = showInstallBanner || (process.env.NODE_ENV === 'development' && !isStandalone)
  if (!shouldShow) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      console.log('✅ App installed successfully')
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-navy-600 to-blue-600 text-white rounded-xl shadow-2xl border border-navy-500 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Logo size="medium" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">
              Install GMC App
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              Get faster access to your portfolio with our mobile app
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="bg-white text-navy-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
              
              <button
                onClick={dismissInstallBanner}
                className="text-blue-200 hover:text-white transition-colors p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center space-x-4 text-xs text-blue-200">
          <div className="flex items-center space-x-1">
            <Smartphone className="h-3 w-3" />
            <span>Works offline</span>
          </div>
          <span>•</span>
          <span>Push notifications</span>
          <span>•</span>
          <span>Home screen access</span>
        </div>
      </div>
    </div>
  )
}