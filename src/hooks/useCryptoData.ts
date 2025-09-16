import { useState, useEffect, useCallback } from 'react'
import { cryptoDataService, type CryptoAsset, type MarketData } from '../lib/cryptoDataService'

interface UseCryptoDataReturn {
  assets: CryptoAsset[]
  marketData: MarketData
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  searchAssets: (query: string) => CryptoAsset[]
  getTopMovers: (type: 'gainers' | 'losers' | 'volume') => CryptoAsset[]
  getTrendingAssets: () => CryptoAsset[]
  getAssetsByMarketCap: (limit?: number) => CryptoAsset[]
  getAssetsByVolume: (limit?: number) => CryptoAsset[]
  lastUpdated: Date | null
}

export function useCryptoData(category: string = 'all'): UseCryptoDataReturn {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Simulate API delay for realistic loading experience
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Fetch real-time data
      await cryptoDataService.fetchRealTimeData()
      
      // Get assets by category
      const categoryAssets = cryptoDataService.getAssetsByCategory(category === 'popular' ? 'popular' : 
                                                                   category === 'defi' ? 'defi' :
                                                                   category === 'layer1' ? 'layer1' :
                                                                   category === 'stablecoins' ? 'stablecoins' :
                                                                   category === 'new' ? 'new' : 'all')
      const globalMarketData = cryptoDataService.getMarketData()
      
      setAssets(categoryAssets)
      setMarketData(globalMarketData)
      setLastUpdated(new Date())
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crypto data')
      console.error('Crypto data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  const refreshData = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  const searchAssets = useCallback((query: string): CryptoAsset[] => {
    return cryptoDataService.searchAssets(query)
  }, [])

  const getTopMovers = useCallback((type: 'gainers' | 'losers' | 'volume'): CryptoAsset[] => {
    return cryptoDataService.getTopMovers(type)
  }, [])

  const getTrendingAssets = useCallback((): CryptoAsset[] => {
    return cryptoDataService.getTrendingAssets()
  }, [])

  const getAssetsByMarketCap = useCallback((limit: number = 50): CryptoAsset[] => {
    return cryptoDataService.getAssetsByMarketCap(limit)
  }, [])

  const getAssetsByVolume = useCallback((limit: number = 50): CryptoAsset[] => {
    return cryptoDataService.getAssetsByVolume(limit)
  }, [])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds for live data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchData])

  return {
    assets,
    marketData: marketData || {
      totalMarketCap: 0,
      totalVolume24h: 0,
      btcDominance: 0,
      ethDominance: 0,
      marketCapChange24h: 0,
      volumeChange24h: 0,
      activeCryptocurrencies: 0,
      lastUpdated: new Date().toISOString()
    },
    loading,
    error,
    refreshData,
    searchAssets,
    getTopMovers,
    getTrendingAssets,
    getAssetsByMarketCap,
    getAssetsByVolume,
    lastUpdated
  }
}