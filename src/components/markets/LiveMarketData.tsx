import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Globe, Zap, DollarSign, BarChart3, X } from 'lucide-react'
import { TradingViewChart } from './TradingViewChart'
import { useCryptoData } from '../../hooks/useCryptoData'
import { formatPrice, formatVolume, formatMarketCap, getChangeColor } from '../../lib/cryptoDataService'

export function LiveMarketData() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'stocks' | 'forex' | 'commodities'>('all')
  const [tickCount, setTickCount] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showChart, setShowChart] = useState(false)
  
  // Use real crypto data
  const { 
    assets: cryptoAssets, 
    marketData, 
    loading, 
    error, 
    refreshData,
    getTopMovers 
  } = useCryptoData('all')

  // Generate mock data for non-crypto assets
  const [stocksData, setStocksData] = useState<any[]>([])
  const [forexData, setForexData] = useState<any[]>([])
  const [commoditiesData, setCommoditiesData] = useState<any[]>([])
  const [allCryptoAssets, setAllCryptoAssets] = useState<any[]>([])

  const generateStocksData = () => {
    const now = Date.now()

    const timeVariation = Math.sin(now / 30000) * 0.02
    
    return [
      {
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        tradingViewSymbol: 'AMEX:SPY',
        price: 597.05 * (1 + timeVariation),
        change: 597.05 * timeVariation,
        changePercent: timeVariation * 100,
        volume24h: 125000000 * (1 + Math.random() * 0.3),
        category: 'stocks',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i * 0.3) * 8)
      },
      {
        symbol: 'QQQ',
        name: 'Nasdaq 100 ETF',
        tradingViewSymbol: 'NASDAQ:QQQ',
        price: 485.30 * (1 + timeVariation * 1.2),
        change: 485.30 * timeVariation * 1.2,
        changePercent: timeVariation * 120,
        volume24h: 95000000 * (1 + Math.random() * 0.3),
        category: 'stocks',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.cos(i * 0.4) * 10)
      }
    ]
  }

  const generateForexData = () => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.01
    
    return [
      {
        symbol: 'EUR/USD',
        name: 'Euro / US Dollar',
        tradingViewSymbol: 'FX:EURUSD',
        price: 1.0845 * (1 + timeVariation),
        change: 1.0845 * timeVariation,
        changePercent: timeVariation * 100,
        volume24h: 125000000000,
        category: 'forex',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i * 0.2) * 3)
      },
      {
        symbol: 'GBP/USD',
        name: 'British Pound / US Dollar',
        tradingViewSymbol: 'FX:GBPUSD',
        price: 1.2650 * (1 + timeVariation * 0.8),
        change: 1.2650 * timeVariation * 0.8,
        changePercent: timeVariation * 80,
        volume24h: 85000000000,
        category: 'forex',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.cos(i * 0.3) * 4)
      },
      {
        symbol: 'USD/JPY',
        name: 'US Dollar / Japanese Yen',
        tradingViewSymbol: 'FX:USDJPY',
        price: 155.25 * (1 + timeVariation * 0.5),
        change: 155.25 * timeVariation * 0.5,
        changePercent: timeVariation * 50,
        volume24h: 95000000000,
        category: 'forex',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i * 0.25) * 2)
      }
    ]
  }

  const generateCommoditiesData = () => {
    const timeVariation = Math.sin(Date.now() / 40000) * 0.02
    
    return [
      {
        symbol: 'GOLD',
        name: 'Gold Spot',
        tradingViewSymbol: 'TVC:GOLD',
        price: 2685.50 * (1 + timeVariation),
        change: 2685.50 * timeVariation,
        changePercent: timeVariation * 100,
        volume24h: 15000000000,
        category: 'commodities',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i * 0.15) * 5)
      },
      {
        symbol: 'SILVER',
        name: 'Silver Spot',
        tradingViewSymbol: 'TVC:SILVER',
        price: 31.25 * (1 + timeVariation * 1.5),
        change: 31.25 * timeVariation * 1.5,
        changePercent: timeVariation * 150,
        volume24h: 8000000000,
        category: 'commodities',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.cos(i * 0.2) * 8)
      },
      {
        symbol: 'OIL',
        name: 'Crude Oil WTI',
        tradingViewSymbol: 'TVC:USOIL',
        price: 78.50 * (1 + timeVariation * 2),
        change: 78.50 * timeVariation * 2,
        changePercent: timeVariation * 200,
        volume24h: 25000000000,
        category: 'commodities',
        sparkline: Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i * 0.3) * 12)
      }
    ]
  }

  const refreshAllData = async () => {
    setTickCount(prev => prev + 1)
    setStocksData(generateStocksData())
    setForexData(generateForexData())
    setCommoditiesData(generateCommoditiesData())
    
    // Get all crypto assets for the 'all' category
    const allCrypto = [
      ...cryptoAssets,
      ...getTopMovers('gainers').slice(0, 5),
      ...getTopMovers('volume').slice(0, 5)
    ]
    setAllCryptoAssets(allCrypto)
    
    await refreshData()
  }

  useEffect(() => {
    refreshAllData()
    
    // Update every 30 seconds
    const interval = setInterval(refreshAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
    return <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
  }

  const generateSparkline = (data: number[], color: string) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 40
      const y = 15 - ((value - min) / range) * 12
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="40" height="15" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
      </svg>
    )
  }

  const getAllData = () => {
    switch (selectedCategory) {
      case 'crypto':
        return allCryptoAssets.length > 0 ? allCryptoAssets : cryptoAssets
      case 'stocks':
        return stocksData
      case 'forex':
        return forexData
      case 'commodities':
        return commoditiesData
      default:
        return [...allCryptoAssets, ...stocksData, ...forexData, ...commoditiesData]
    }
  }

  const getFilteredData = () => {
    return getAllData()
  }

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset)
    setShowChart(true)
  }

  const closeChart = () => {
    setShowChart(false)
    setSelectedAsset(null)
  }

  const categories = [
    { id: 'all', name: 'All Markets', icon: Globe },
    { id: 'crypto', name: 'Crypto', icon: Zap },
    { id: 'stocks', name: 'Indices', icon: TrendingUp },
    { id: 'forex', name: 'Forex', icon: DollarSign },
    { id: 'commodities', name: 'Commodities', icon: Activity }
  ]

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <Globe className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-white">Live Market Data</h3>
              <p className="text-xs text-gray-400">
                Live tick #{tickCount} • Click any asset for chart
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">LIVE • 3s updates</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 border border-gray-600/20'
              }`}
            >
              <category.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg font-semibold mb-2">Failed to load market data</div>
            <div className="text-gray-400 mb-4">{error}</div>
            <button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredData().slice(0, 50).map((item, index) => (
               <div
                 key={`${item.symbol || item.id}-${index}`}
                 onClick={() => handleAssetClick(item)}
                 className="flex items-center justify-between py-2 px-3 sm:p-4 hover:bg-gray-700/20 transition-all cursor-pointer group border-b border-gray-700/10 last:border-b-0"
              >
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="hidden sm:block">
                      {getChangeIcon(item.changePercent24h || item.changePercent || 0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block">{item.name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-6">
                  {/* Tiny Sparkline Chart - Centered */}
                  <div className="hidden sm:flex flex-1 justify-center">
                    {generateSparkline(item.sparkline, (item.changePercent24h || item.changePercent || 0) >= 0 ? '#10b981' : '#ef4444')}
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono text-sm sm:text-base font-medium text-white">
                      {formatPrice(item.price)}
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">{formatVolume(item.volume24h || 0)}</div>
                  </div>
                  
                  <div className="text-right min-w-[60px] sm:min-w-[80px]">
                    <div className={`text-sm sm:text-base font-medium ${getChangeColor(item.changePercent24h || item.changePercent || 0)}`}>
                      {(item.changePercent24h || item.changePercent || 0) > 0 ? '+' : ''}{(item.change24h || item.change || 0).toFixed(2)}
                    </div>
                    <div className={`text-xs sm:text-sm ${getChangeColor(item.changePercent24h || item.changePercent || 0)}`}>
                      {(item.changePercent24h || item.changePercent || 0) > 0 ? '+' : ''}{(item.changePercent24h || item.changePercent || 0).toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
               </div>
            ))}
          </div>
        )}

        {/* Market Summary */}
        {marketData && (
          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <h4 className="text-lg font-semibold text-white mb-4">Market Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {getAllData().filter(item => (item.changePercent24h || item.changePercent || 0) > 0).length}
                </div>
                <div className="text-sm text-gray-400">Advancing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {getAllData().filter(item => (item.changePercent24h || item.changePercent || 0) < 0).length}
                </div>
                <div className="text-sm text-gray-400">Declining</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {(getAllData().reduce((sum, item) => sum + Math.abs(item.changePercent24h || item.changePercent || 0), 0) / Math.max(getAllData().length, 1)).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Avg Volatility</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {getAllData().length}
                </div>
                <div className="text-sm text-gray-400">Total Assets</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-700/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-xs font-medium">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TradingView Chart Modal */}
      {showChart && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b26] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700/30">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getChangeIcon(selectedAsset.change)}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedAsset.symbol} - {selectedAsset.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="font-mono font-medium text-white">
                        {formatPrice(selectedAsset.price)}
                      </span>
                      <span className={`font-medium ${getChangeColor(selectedAsset.changePercent24h || selectedAsset.changePercent || 0)}`}>
                        {(selectedAsset.change24h || selectedAsset.change || 0) > 0 ? '+' : ''}{(selectedAsset.change24h || selectedAsset.change || 0).toFixed(2)} 
                        ({(selectedAsset.changePercent24h || selectedAsset.changePercent || 0) > 0 ? '+' : ''}{(selectedAsset.changePercent24h || selectedAsset.changePercent || 0).toFixed(2)}%)
                      </span>
                      <span className="text-gray-400">Vol: {formatVolume(selectedAsset.volume24h || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChart}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <div className="h-[600px] bg-[#0a0e1a]">
              <TradingViewChart symbol={selectedAsset.tradingViewSymbol || `COINBASE:${selectedAsset.symbol}USD`} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}