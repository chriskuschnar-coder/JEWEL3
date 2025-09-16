import { useEffect, useRef } from 'react'

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      console.warn('TickerTape container not ready')
      return
    }

    // Clear any existing content
    containerRef.current.innerHTML = ''
    
    // Add delay to ensure DOM is ready
    const initTicker = () => {
      if (!containerRef.current) {
        console.warn('TickerTape container lost during initialization')
        return
      }
      
      const widgetContainer = document.createElement('div')
      widgetContainer.className = 'tradingview-widget-container__widget'
      containerRef.current.appendChild(widgetContainer)

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
          { proName: "COINBASE:BTCUSD", title: "Bitcoin" },
          { proName: "COINBASE:ETHUSD", title: "Ethereum" },
          { proName: "FOREXCOM:XAUUSD", title: "Gold" }
        ],
        showSymbolLogo: true,
        colorTheme: "dark",
        isTransparent: false,
        displayMode: "adaptive",
        locale: "en"
      })
      
      script.onerror = () => {
        console.error('Failed to load TradingView ticker script')
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-center text-gray-400 py-2">Market data unavailable</div>'
        }
      }

      containerRef.current.appendChild(script)
    }
    
    // Small delay to ensure DOM is stable
    const timer = setTimeout(initTicker, 100)

    return () => {
      clearTimeout(timer)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ width: '100%', height: '46px' }}
    />
  )
}