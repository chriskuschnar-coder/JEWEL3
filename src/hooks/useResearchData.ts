import { useState, useEffect, useCallback } from 'react'
import type { MarketSentiment, MarketDriver, AssetSignal, MacroInsight } from '../lib/researchData'
import { 
  generateMarketSentiment, 
  generateKeyDrivers, 
  generateAssetSignals, 
  generateMacroInsights 
} from '../lib/researchData'

interface UseResearchDataReturn {
  marketSentiment: MarketSentiment | null
  keyDrivers: MarketDriver[]
  assetSignals: AssetSignal[]
  macroInsights: MacroInsight[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  lastUpdated: Date | null
}

export function useResearchData(): UseResearchDataReturn {
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  const [keyDrivers, setKeyDrivers] = useState<MarketDriver[]>([])
  const [assetSignals, setAssetSignals] = useState<AssetSignal[]>([])
  const [macroInsights, setMacroInsights] = useState<MacroInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Simulate API delay for realistic loading experience
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Generate fresh data
      const sentiment = generateMarketSentiment()
      const drivers = generateKeyDrivers()
      const signals = generateAssetSignals()
      const insights = generateMacroInsights()
      
      setMarketSentiment(sentiment)
      setKeyDrivers(drivers)
      setAssetSignals(signals)
      setMacroInsights(insights)
      setLastUpdated(new Date())
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research data')
      console.error('Research data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [fetchData])

  return {
    marketSentiment,
    keyDrivers,
    assetSignals,
    macroInsights,
    loading,
    error,
    refreshData,
    lastUpdated
  }
}