import * as React from "react"
import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Activity, Zap, Eye, RefreshCw, ArrowRight, BarChart3, Globe, Clock, Users, MessageCircle, Shield, Brain, Play } from 'lucide-react'
import { useCryptoData } from '../hooks/useCryptoData'
import { formatPrice, formatVolume, formatMarketCap, getChangeColor } from '../lib/cryptoDataService'

interface LiveTrade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: string
  user: string
}

interface TopMover {
  symbol: string
  name: string
  price: number
  change: number
  volume: string
  icon: string
  color: string
  sparkline: number[]
}

export function MarketBuzzSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'gainers' | 'losers' | 'volume'>('gainers')
  const sectionRef = useRef<HTMLElement>(null)
  
  // Use real crypto data for top movers
  const { getTopMovers, refreshData } = useCryptoData()
  const [topMovers, setTopMovers] = useState<any[]>([])

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

  // Update top movers when category changes
  useEffect(() => {
    const movers = getTopMovers(selectedCategory)
    setTopMovers(movers.slice(0, 8))
  }, [selectedCategory, getTopMovers])

  const generateTopMovers = (): TopMover[] => {
    const assets = [
      { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.29, icon: '🐕', color: '#C2A633' },
      { symbol: 'SHIB', name: 'Shiba Inu', basePrice: 0.000014, icon: '🐕', color: '#FFA409' },
      { symbol: 'PEPE', name: 'Pepe', basePrice: 0.000012, icon: '🐸', color: '#00D4AA' },
      { symbol: 'WIF', name: 'Dogwifhat', basePrice: 3.45, icon: '🐕', color: '#FF6B9D' },
      { symbol: 'BONK', name: 'Bonk', basePrice: 0.000045, icon: '🐕', color: '#FF8C42' },
      { symbol: 'FLOKI', name: 'Floki', basePrice: 0.00018, icon: '🐕', color: '#F0B90B' },
      { symbol: 'MEME', name: 'Memecoin', basePrice: 0.025, icon: '😂', color: '#FF69B4' },
      { symbol: 'WLD', name: 'Worldcoin', basePrice: 4.25, icon: '🌍', color: '#000000' }
    ]

    return assets.map(asset => {
      const changeMultiplier = selectedCategory === 'gainers' ? 1 : selectedCategory === 'losers' ? -1 : 0.5
      const change = (Math.random() * 15 + 5) * changeMultiplier + (Math.random() - 0.5) * 2
      const price = asset.basePrice * (1 + change / 100)
      
      // Generate sparkline
      const sparkline = Array.from({ length: 12 }, (_, i) => {
        const baseValue = 50
        const trend = change > 0 ? 1 : -1
        const noise = (Math.random() - 0.5) * 10
        return Math.max(0, baseValue + (i * trend * 2) + noise)
      })

      return {
        symbol: asset.symbol,
        name: asset.name,
        price,
        change,
        volume: `$${(Math.random() * 500 + 100).toFixed(0)}M`,
        icon: asset.icon,
        color: asset.color,
        sparkline
      }
    }).sort((a, b) => {
      if (selectedCategory === 'gainers') return b.change - a.change
      if (selectedCategory === 'losers') return a.change - b.change
      return Math.random() - 0.5 // Random for volume
    })
  }

  const generateLiveTrades = (): LiveTrade[] => {
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'AVAX']
    const users = ['Trader_Pro', 'CryptoWhale', 'InvestorX', 'AlphaSeeker', 'MarketMaker', 'DiamondHands']
    
    return Array.from({ length: 8 }, (_, i) => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const side = Math.random() > 0.5 ? 'buy' : 'sell'
      const amount = Math.random() * 10 + 0.1
      const price = Math.random() * 100000 + 1000
      
      return {
        id: `trade-${i}-${Date.now()}`,
        symbol,
        side,
        amount,
        price,
        timestamp: new Date(Date.now() - Math.random() * 60000).toISOString(),
        user: users[Math.floor(Math.random() * users.length)]
      }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  useEffect(() => {
    setLiveTrades(generateLiveTrades())
    
    // Update live trades every 3 seconds
    const interval = setInterval(() => {
      setLiveTrades(prev => {
        const newTrade = generateLiveTrades()[0]
        return [newTrade, ...prev.slice(0, 7)]
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const generateSparkline = (data: number[], isPositive: boolean) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 16
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="60" height="20" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  const handleAssetClick = (mover: any) => {
    // Handle asset click
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Algorithms Never Miss
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Market Opportunities
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            While you sleep, our AI algorithms monitor markets 24/7, automatically executing trades 
            based on mathematical models and institutional-grade data analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Movers Table */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} overflow-hidden`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Market Movers</h3>
                
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  {[
                    { id: 'gainers', label: 'Gainers', icon: TrendingUp },
                    { id: 'losers', label: 'Losers', icon: TrendingDown },
                    { id: 'volume', label: 'Volume', icon: BarChart3 }
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {topMovers.slice(0, 8).map((mover, index) => (
                  <div 
                    key={mover.id}
                    onClick={() => handleAssetClick(mover)}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="text-gray-500 dark:text-gray-400 font-mono text-sm w-6">
                        #{index + 1}
                      </div>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg text-sm"
                        style={{ backgroundColor: mover.color }}
                      >
                        {mover.icon}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{mover.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{mover.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-4">
                      <div className="flex items-center space-x-1 sm:space-x-3 min-w-0">
                        <div className="font-mono font-bold text-gray-900 dark:text-white">
                          {formatPrice(mover.price)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{formatVolume(mover.volume24h)}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-right">
                          <div className={`font-bold ${getChangeColor(mover.changePercent24h)}`}>
                            {mover.changePercent24h >= 0 ? '+' : ''}{mover.changePercent24h.toFixed(2)}%
                          </div>
                          <div className="mt-1">
                            {generateSparkline(mover.sparkline, mover.changePercent24h >= 0)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Trades Feed */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Trades</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Real-time activity</span>
                    </div>
                  </div>
                </div>
                
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveTrades.map((trade, index) => (
                  <div 
                    key={trade.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 animate-in slide-in-from-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                        trade.side === 'buy' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.symbol.charAt(0)}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {trade.user}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {trade.side.toUpperCase()} {trade.symbol}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {trade.amount.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        ${trade.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {getTimeAgo(trade.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Brain className="h-4 w-4" />
                  <span>Let AI Trade For You</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}