import React, { useState } from "react"
import {
  ExternalLink,
  Zap,
  Activity,
  ArrowRight,
  Loader2,
  Monitor,
  Shield,
  TrendingUp,
} from "lucide-react"

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({
  isFullscreen = false,
}: HeliosTradingTerminalProps) {
  const [loading, setLoading] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setLoading(false)
    setShowFallback(true)
  }

  const openExternalTerminal = () => {
    window.open("https://helios.luminarygrow.com/", "_blank")
  }

  return (
    <div
      className={`min-h-[calc(100vh-120px)] ${
        isFullscreen ? "min-h-screen" : ""
      } bg-[#0a0e1a] relative`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#0a0e1a] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <Loader2 className="h-8 w-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Helios Terminal</h3>
            <p className="text-gray-400">Connecting to secure terminal environment...</p>
          </div>
        </div>
      )}

      {/* Fallback Content */}
      {showFallback && (
        <div className="absolute inset-0 bg-[#0a0e1a] flex items-center justify-center z-10">
          <div className="max-w-2xl w-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Monitor className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Helios Terminal
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Unable to load the embedded terminal. Click below to open in a new tab.
            </p>
            
            <button
              onClick={openExternalTerminal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <ExternalLink className="w-6 h-6" />
              <span>Open Terminal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded Terminal */}
      {!showFallback && (
        <iframe
          src="https://helios.luminarygrow.com/"
          title="Helios Terminal"
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="fullscreen; camera; microphone; geolocation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          style={{
            minHeight: isFullscreen ? '100vh' : 'calc(100vh - 120px)',
            background: '#0a0e1a'
          }}
        />
      )}

      {/* External Link Button - Always Available */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={openExternalTerminal}
          className="bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 border border-gray-600/30"
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Open in New Tab</span>
        </button>
      </div>
    </div>
  )
}

