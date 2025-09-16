import React, { useState, useEffect } from 'react'
import { RefreshCw, X, Download } from 'lucide-react'

interface PWAUpdateNotificationProps {
  isVisible: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function PWAUpdateNotification({ isVisible, onUpdate, onDismiss }: PWAUpdateNotificationProps) {
  const [updating, setUpdating] = useState(false)

  if (!isVisible) return null

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await onUpdate()
      // Reload the page to activate the new service worker
      window.location.reload()
    } catch (error) {
      console.error('Update failed:', error)
      setUpdating(false)
    }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
      <div className="bg-blue-600 text-white rounded-xl shadow-2xl border border-blue-500 max-w-sm mx-auto">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">
                App Update Available
              </h3>
              <p className="text-sm text-blue-100 mb-3">
                A new version of GMC is ready with improvements and bug fixes
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Update Now</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={onDismiss}
                  disabled={updating}
                  className="text-blue-200 hover:text-white transition-colors p-2 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}