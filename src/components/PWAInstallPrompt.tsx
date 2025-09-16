import React, { useState } from 'react'
import { Download, Smartphone, X, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react'
import { Logo } from './Logo'

interface PWAInstallPromptProps {
  onInstall: () => Promise<boolean>
  onDismiss: () => void
  isVisible: boolean
}

export function PWAInstallPrompt({ onInstall, onDismiss, isVisible }: PWAInstallPromptProps) {
  const [installing, setInstalling] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  if (!isVisible) return null

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const success = await onInstall()
      if (!success) {
        // Show manual installation instructions
        setShowInstructions(true)
      }
    } catch (error) {
      console.error('Install failed:', error)
      setShowInstructions(true)
    } finally {
      setInstalling(false)
    }
  }

  const getDeviceInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        device: 'iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      }
    } else if (userAgent.includes('android')) {
      return {
        device: 'Android',
        steps: [
          'Tap the menu (⋮) in Chrome',
          'Tap "Add to Home screen"',
          'Tap "Add" to install the app'
        ]
      }
    } else {
      return {
        device: 'Desktop',
        steps: [
          'Click the install icon in your browser address bar',
          'Click "Install" to add to your desktop',
          'The app will open in its own window'
        ]
      }
    }
  }

  const instructions = getDeviceInstructions()

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Install on {instructions.device}</h3>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">App Benefits:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Faster loading and better performance</li>
              <li>• Works offline for viewing portfolio</li>
              <li>• Push notifications for market alerts</li>
              <li>• Home screen access like a native app</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-6">
            <Logo size="xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Install GMC App
          </h2>
          <p className="text-gray-600">
            Get the full mobile experience with faster loading and offline access
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 text-sm">Works offline</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 text-sm">Faster performance</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="text-purple-800 text-sm">Push notifications</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-navy-600 hover:from-blue-700 hover:to-navy-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {installing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Installing...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Install App</span>
              </>
            )}
          </button>
          
          <button
            onClick={onDismiss}
            className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Free to install • No app store required • Instant updates
        </p>
      </div>
    </div>
  )
}