import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    TradingView: any
  }
}

interface TradingViewChartProps {
  symbol: string
  interval?: string
  theme?: 'light' | 'dark'
  height?: number
}

export function TradingViewChart({ 
  symbol, 
  interval = '5', 
  theme = 'light',
  height = 600 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    const initWidget = () => {
      if (!containerRef.current) return
      
      // Clear any existing content
      containerRef.current.innerHTML = ''
      
      // Create unique container ID
      const containerId = `tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create chart container
      const chartDiv = document.createElement('div')
      chartDiv.id = containerId
      chartDiv.style.height = '100%'
      chartDiv.style.width = '100%'
      
      containerRef.current.appendChild(chartDiv)

      // Initialize TradingView widget
      if (window.TradingView) {
        try {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: 'Etc/UTC',
            theme: theme,
            style: '1',
            locale: 'en',
            toolbar_bg: theme === 'dark' ? '#1a1b1f' : '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: containerId,
            hide_side_toolbar: false,
            studies: [
              'STD;Volume',
              'STD;MACD',
              'STD;RSI'
            ],
            save_image: false,
            hide_top_toolbar: false,
            hide_legend: false,
            details: true,
            hotlist: true,
            calendar: true,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650'
          })
          
          console.log('✅ TradingView chart initialized for:', symbol)
        } catch (error) {
          console.error('❌ TradingView widget error:', error)
          
          // Fallback content
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <div class="text-center">
                  <div class="text-gray-600 mb-2">Chart Loading...</div>
                  <div class="text-sm text-gray-500">${symbol}</div>
                </div>
              </div>
            `
          }
        }
      } else {
        // TradingView not loaded yet, show loading
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div class="text-gray-600">Loading TradingView...</div>
              </div>
            </div>
          `
        }
      }
    }

    // Load TradingView script if not already loaded
    const scriptId = 'tradingview-widget-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        console.log('✅ TradingView script loaded')
        setTimeout(initWidget, 100)
      }
      script.onerror = () => {
        console.error('❌ Failed to load TradingView script')
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
              <div class="text-center text-red-600">
                <div class="mb-2">Failed to load chart</div>
                <div class="text-sm">Please check your internet connection</div>
              </div>
            </div>
          `
        }
      }
      document.head.appendChild(script)
    } else {
      // Script already loaded
      if (window.TradingView) {
        setTimeout(initWidget, 100)
      } else {
        // Script loaded but TradingView not ready yet
        script.onload = () => setTimeout(initWidget, 100)
      }
    }

    // Cleanup function
    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        try {
          widgetRef.current.remove()
        } catch (error) {
          console.log('Chart cleanup completed')
        }
      }
      widgetRef.current = null
    }
  }, [symbol, interval, theme])

  return (
    <div 
      ref={containerRef} 
      className="w-full bg-white rounded-lg overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">Initializing Chart...</div>
          <div className="text-sm text-gray-500 mt-1">{symbol}</div>
        </div>
      </div>
    </div>
  )
}