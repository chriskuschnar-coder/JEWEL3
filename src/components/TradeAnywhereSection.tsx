import * as React from "react"
import { useState, useEffect, useRef } from 'react'
import { Smartphone, Monitor, Download, ArrowRight, BarChart3, TrendingUp, Globe, Zap, QrCode, Apple, Play, TrendingDown, Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from './Logo'
import TerminalDashboard from './TradingDashboard'
import { SocialSentimentTracker } from './FrontpageMarketBuzzTracker'

export function TradeAnywhereSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [portfolioValue, setPortfolioValue] = useState(347250)
  const [portfolioChange, setPortfolioChange] = useState(12450)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animate portfolio values
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioValue(prev => prev + (Math.random() - 0.5) * 1000)
      setPortfolioChange(prev => prev + (Math.random() - 0.5) * 100)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const allocationData = [
    { name: 'Bitcoin', percentage: 40, color: '#F7931A' },
    { name: 'Ethereum', percentage: 30, color: '#627EEA' },
    { name: 'Altcoins', percentage: 20, color: '#8B5CF6' },
    { name: 'Cash', percentage: 10, color: '#10B981' }
  ]

  const createPieChart = () => {
    const centerX = 100
    const centerY = 100
    const radius = 80
    let currentAngle = -90

    return allocationData.map((item, index) => {
      const angle = (item.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
      
      const largeArcFlag = angle > 180 ? 1 : 0
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      currentAngle += angle
      
      return (
        <path
          key={index}
          d={pathData}
          fill={item.color}
          className="hover:opacity-80 transition-opacity duration-200"
        />
      )
    })
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            AI Never Sleeps. Neither Should Your Portfolio.
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your AI algorithms work 24/7 across global markets. Monitor performance and adjust strategies 
            from any device while algorithms handle all the complex trading decisions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Platform Features */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="space-y-8">
              {/* Realistic KuCoin-Style iPhone */}
              <div className="flex justify-center">
                <div className="relative w-64 sm:w-80 max-w-xs sm:max-w-sm mx-auto">
                  {/* iPhone Frame */}
                  <div className="relative w-full aspect-[9/16] sm:aspect-[9/19.5] bg-black rounded-[2rem] sm:rounded-[3rem] p-1 shadow-2xl border-2 sm:border-4 border-gray-800">
                    {/* iPhone Screen */}
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden relative">
                      
                      {/* Realistic iOS Status Bar */}
                      <div className="flex justify-between items-center px-3 sm:px-6 py-1 sm:py-2 text-white text-xs sm:text-sm bg-black">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">1:20</span>
                          <div className="w-3 sm:w-4 h-2 sm:h-3 flex items-center">
                            <svg width="12" height="9" viewBox="0 0 16 12" fill="white" className="sm:w-4 sm:h-3">
                              <path d="M1 4h2v4H1V4zm3-1h2v6H4V3zm3-1h2v8H7V2zm3 2h2v4h-2V4z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs hidden sm:inline">5G</span>
                          <div className="flex space-x-0.5">
                            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white rounded-full"></div>
                            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white rounded-full"></div>
                            <div className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-white rounded-full"></div>
                            <div className="w-0.5 sm:w-1 h-1 bg-gray-500 rounded-full"></div>
                          </div>
                          <span className="text-xs hidden sm:inline">78</span>
                          <div className="w-4 sm:w-6 h-2 sm:h-3 border border-white rounded-sm">
                            <div className="w-3 sm:w-4 h-1 sm:h-2 bg-white rounded-sm m-0.5"></div>
                          </div>
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Logo size="small" />
                            <span className="text-white font-medium text-xs sm:text-sm">GMC</span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="relative">
                              <div className="w-5 sm:w-6 h-5 sm:h-6 border border-gray-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-2 sm:h-3 w-2 sm:w-3 text-gray-400" />
                              </div>
                              <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <div className="w-5 sm:w-6 h-5 sm:h-6 border border-gray-600 rounded-lg flex items-center justify-center">
                              <div className="w-2 sm:w-3 h-2 sm:h-3 border border-gray-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Navigation Tabs */}
                      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center space-x-3 sm:space-x-6">
                          <span className="text-gray-500 text-xs sm:text-sm">Favorites</span>
                          <div className="relative">
                            <span className="text-white text-xs sm:text-sm font-medium">Markets</span>
                            <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-0.5 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">Strategies</span>
                        </div>
                      </div>

                      {/* Sub Navigation */}
                      <div className="px-4 py-2 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center space-x-6">
                          <span className="text-gray-500 text-sm">Holdings</span>
                          <span className="text-gray-500 text-sm">Spot</span>
                          <div className="relative">
                            <span className="text-white text-sm font-medium">Futures</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                          </div>
                          <span className="text-gray-500 text-sm">ETF</span>
                        </div>
                      </div>

                      {/* Filter Pills */}
                      <div className="px-4 py-3 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center space-x-3 overflow-x-auto">
                          <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">All</span>
                          <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-full">
                            <span className="text-orange-500 text-xs">🔥</span>
                            <span className="text-white text-xs font-medium">New</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-full">
                            <span className="text-orange-500 text-xs">🔥</span>
                            <span className="text-white text-xs font-medium">Hot</span>
                          </div>
                          <span className="text-gray-400 px-3 py-1 text-xs whitespace-nowrap">SOL Eco</span>
                          <span className="text-gray-400 px-3 py-1 text-xs whitespace-nowrap">Meme</span>
                          <div className="flex items-center space-x-1 text-white text-xs">
                            <span>USDT</span>
                            <TrendingDown className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      {/* Table Headers */}
                      <div className="px-4 py-2 bg-[#0a0a0a] border-b border-gray-800">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <span>Name</span>
                            <TrendingUp className="h-3 w-3" />
                            <span>/Amount</span>
                            <TrendingDown className="h-3 w-3" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Price</span>
                            <TrendingUp className="h-3 w-3" />
                            <span>24h Change</span>
                            <TrendingDown className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      {/* Asset List - KuCoin Style */}
                      <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                        {[
                          { symbol: 'ETH', name: 'Ethereum', pair: '/USDT', price: '4,664.19', prevPrice: '$4,665.12', volume: '331M', change: '-0.16%', changeColor: 'bg-red-500' },
                          { symbol: 'BTC', name: 'Bitcoin', pair: '/USDT', price: '116,209.7', prevPrice: '$116,232.94', volume: '208.33M', change: '+0.37%', changeColor: 'bg-green-500' },
                          { symbol: 'SOL', name: 'Solana', pair: '/USDT', price: '243.197', prevPrice: '$243.24', volume: '197.6M', change: '-1.25%', changeColor: 'bg-red-500' },
                          { symbol: 'PEPE', name: 'Pepe', pair: '/USDT', price: '0.000115934', prevPrice: '$0.000011', volume: '83.87M', change: '-0.86%', changeColor: 'bg-red-500' },
                          { symbol: 'XRP', name: 'XRP', pair: '/USDT', price: '3.06415', prevPrice: '$3.06', volume: '80.17M', change: '-1.18%', changeColor: 'bg-red-500' },
                          { symbol: 'DOGE', name: 'Dogecoin', pair: '/USDT', price: '0.2813', prevPrice: '$0.28', volume: '59.59M', change: '-2.24%', changeColor: 'bg-red-500' },
                          { symbol: 'HIFI', name: 'Hifi Finance', pair: '/USDT', price: '0.39433', prevPrice: '$0.39', volume: '58.81M', change: '-35.46%', changeColor: 'bg-red-500', badge: 'HOT' },
                          { symbol: 'PUMP', name: 'Pump', pair: '/USDT', price: '0.008096', prevPrice: '$0.008097', volume: '38.49M', change: '+2.09%', changeColor: 'bg-green-500' },
                          { symbol: 'AVNT', name: 'Aventus', pair: '/USDT', price: '1.0745', prevPrice: '$1.07', volume: '33.45M', change: '+34.26%', changeColor: 'bg-green-500', badge: 'NEW' },
                          { symbol: 'LINK', name: 'Chainlink', pair: '/USDT', price: '24.374', prevPrice: '$24.37', volume: '30.86M', change: '-1.63%', changeColor: 'bg-red-500' },
                          { symbol: 'SUI', name: 'Sui', pair: '/USDT', price: '3.7189', prevPrice: '$3.71', volume: '28.39M', change: '-1.58%', changeColor: 'bg-red-500' }
                        ].map((asset, index) => (
                          <div key={index} className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="flex flex-col">
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <span className="text-white font-medium text-xs sm:text-sm">{asset.symbol}</span>
                                    <span className="text-gray-500 text-xs hidden sm:inline">Perp</span>
                                    <span className="text-gray-600 text-xs">{asset.pair}</span>
                                    {asset.badge && (
                                      <span className={`text-xs px-1 py-0.5 rounded font-bold ${
                                        asset.badge === 'HOT' ? 'bg-orange-500 text-black' : 'bg-green-500 text-black'
                                      }`}>
                                        {asset.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-gray-500 text-xs">{asset.volume}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-white font-medium text-xs sm:text-sm">{asset.price}</span>
                                  <span className="text-gray-500 text-xs">{asset.prevPrice}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`${asset.changeColor} text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium min-w-[50px] sm:min-w-[60px] text-center`}>
                                  {asset.change}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Navigation - KuCoin Style */}
                      <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 px-2 sm:px-4 py-1 sm:py-2">
                        <div className="flex items-center justify-around">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                              </svg>
                            </div>
                            <span className="text-gray-500 text-xs hidden sm:inline">Home</span>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-1">
                            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                            <span className="text-white text-xs font-medium hidden sm:inline">Markets</span>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 14l5-5 5 5z"/>
                                <path d="M7 10l5 5 5-5z"/>
                              </svg>
                            </div>
                            <span className="text-gray-500 text-xs hidden sm:inline">Trade</span>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-1">
                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                            <span className="text-gray-500 text-xs hidden sm:inline">Futures</span>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <span className="text-gray-500 text-xs hidden sm:inline">Assets</span>
                          </div>
                        </div>
                        
                        {/* Home Indicator */}
                        <div className="flex justify-center mt-1 sm:mt-2">
                          <div className="w-24 sm:w-32 h-0.5 sm:h-1 bg-white rounded-full opacity-60"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Apple className="h-8 w-8 text-gray-900 dark:text-white" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">App Store</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Download for iOS</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Play className="h-8 w-8 text-gray-900 dark:text-white" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Google Play</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Download for Android</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Monitor className="h-8 w-8 text-gray-900 dark:text-white" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Web Platform</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Trade in browser</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mobile Devices */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            {/* Live Terminal */}
            <div className="max-w-4xl mx-auto">
              <TerminalDashboard />
            </div>
          </div>
        </div>
      </div>

      {/* What are the insiders saying? Section */}
      <div className={`text-center mb-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          What are the insiders saying?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Real-time sentiment analysis from crypto Twitter, Reddit, and professional networks. 
          See what institutional investors and retail traders are discussing right now.
        </p>
      </div>

      {/* Economic Calendar Section */}
      <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialSentimentTracker />
        </div>
      </div>
    </section>
  )
}