import * as React from "react"
import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Star, ArrowRight, Eye, BarChart3, Activity, Zap, Plus, Target, Shield, Brain, Play } from 'lucide-react'
import { useCryptoData } from '../hooks/useCryptoData'
import { formatPrice, formatVolume, formatMarketCap, getChangeColor, getChangeIcon } from '../lib/cryptoDataService'

export function BuildPortfolioSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Popular')
  const sectionRef = useRef<HTMLElement>(null)
  
  // Use real crypto data
  const { 
    assets, 
    loading, 
    error, 
    refreshData, 
    lastUpdated 
  } = useCryptoData(selectedCategory.toLowerCase().replace(' ', ''))

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

  const generateSparkline = (data: number[], color: string) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 80
      const y = 30 - ((value - min) / range) * 20
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="80" height="30" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
      </svg>
    )
  }

  const handleAssetClick = (asset: any) => {
    // Navigate to professional portal
    window.dispatchEvent(new CustomEvent('navigate-to-login'))
  }

  const categories = [
    { id: 'popular', label: 'Popular', count: 10 },
    { id: 'defi', label: 'DeFi', count: 10 },
    { id: 'layer1', label: 'Layer 1', count: 15 },
    { id: 'stablecoins', label: 'Stablecoins', count: 8 },
    { id: 'new', label: 'New Listings', count: 12 }
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Choose Your Algorithm Strategy
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Select from multiple AI-powered algorithmic strategies that automatically trade 
            cryptocurrencies based on data, not emotions. No experience required.
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-white dark:bg-gray-700 rounded-xl p-1 border border-gray-200 dark:border-gray-600 shadow-lg overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm sm:text-base">{category.label}</span>
                    <span className="text-xs opacity-70 hidden sm:inline">{category.count} assets</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Crypto Assets Grid */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {[...Array(20)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg font-semibold mb-2">Failed to load market data</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <button
                onClick={refreshData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mb-8">
            {assets.slice(0, 20).map((asset, index) => (
              <div 
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div 
                      className="w-6 sm:w-10 h-6 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-base"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.icon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{asset.symbol}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="mb-2 sm:mb-3">
                  <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {formatPrice(asset.price)}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium flex items-center space-x-1 ${
                    getChangeColor(asset.changePercent24h)
                  }`}>
                    {asset.changePercent24h >= 0 ? (
                      <TrendingUp className="h-2 sm:h-3 w-2 sm:w-3" />
                    ) : (
                      <TrendingDown className="h-2 sm:h-3 w-2 sm:w-3" />
                    )}
                    <span>{asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="mb-2 sm:mb-3 flex justify-center">
                  {generateSparkline(asset.sparkline, asset.changePercent24h >= 0 ? '#10b981' : '#ef4444')}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 sm:space-y-1">
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span>{formatVolume(asset.volume24h)}</span>
                  </div>
                  <div className="flex justify-between hidden sm:flex">
                    <span>Market Cap:</span>
                    <span>{formatMarketCap(asset.marketCap)}</span>
                  </div>
                  <div className="flex justify-between hidden sm:flex">
                    <span>Rank:</span>
                    <span>#{asset.rank}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
          
          {/* Live Data Indicator */}
          {lastUpdated && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-200 dark:border-green-800 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                  Live data • {assets.length} assets • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
          
          {/* Sign Up CTA */}
          <div className="text-center">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <Brain className="h-6 w-6" />
              <span>Browse AI Strategies</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}