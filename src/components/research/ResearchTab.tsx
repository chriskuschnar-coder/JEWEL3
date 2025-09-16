import React, { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useResearchData } from '../../hooks/useResearchData'
import { ResearchHero } from './ResearchHero'
import { KeyDrivers } from './KeyDrivers'
import { AssetSignals } from './AssetSignals'
import { MacroInsights } from './MacroInsights'
import { ResearchDetailModal } from './ResearchDetailModal'
import { Brain } from 'lucide-react'
import type { MarketSentiment, MarketDriver, AssetSignal, MacroInsight } from '../../lib/researchData'

export function ResearchTab() {
  console.log('🔬 ResearchTab component rendering...')
  
  const { 
    marketSentiment, 
    keyDrivers, 
    assetSignals, 
    macroInsights, 
    loading, 
    error, 
    refreshData,
    lastUpdated
  } = useResearchData()
  
  const [selectedDetail, setSelectedDetail] = useState<{
    type: 'driver' | 'signal' | 'insight'
    title: string
    subtitle?: string
    confidence?: number
    timeframe?: string
    impact?: string
    category?: string
    data: any
  } | null>(null)
  
  const [updateCount, setUpdateCount] = useState(0)
  const { scrollY } = useScroll()
  
  // Parallax effects for floating background elements
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -150])
  const y3 = useTransform(scrollY, [0, 1000], [0, -100])
  
  const handleSentimentClick = (sentiment: MarketSentiment) => {
    setSelectedDetail({
      type: 'insight',
      title: sentiment.headline,
      subtitle: sentiment.summary,
      confidence: sentiment.confidence,
      timeframe: sentiment.direction === 'bullish' ? '1-2 weeks' : sentiment.direction === 'bearish' ? '3-5 days' : '2-4 weeks',
      data: {
        ...sentiment,
        detailedAnalysis: `Our AI sentiment analysis engine processes over 10,000 data points across social media, news sentiment, institutional flows, and technical indicators to generate this ${sentiment.direction} signal. The ${sentiment.confidence}% confidence level reflects strong alignment across multiple analytical frameworks.`,
        historicalContext: `Historical analysis shows that similar sentiment patterns have preceded significant market moves with ${sentiment.confidence > 80 ? 'high' : sentiment.confidence > 60 ? 'moderate' : 'low'} accuracy. The current ${sentiment.direction} signal aligns with institutional positioning and technical momentum indicators.`,
        marketImplications: sentiment.drivers,
        tradingOpportunities: sentiment.opportunities,
        icon: sentiment.direction === 'bullish' ? '📈' : sentiment.direction === 'bearish' ? '📉' : '📊',
        bgGradient: sentiment.direction === 'bullish' ? 'from-emerald-500/20 to-green-500/10' : sentiment.direction === 'bearish' ? 'from-red-500/20 to-rose-500/10' : 'from-amber-500/20 to-orange-500/10'
      }
    })
  }
  
  const handleDriverClick = (driver: MarketDriver) => {
    setSelectedDetail({
      type: 'driver',
      title: driver.title,
      subtitle: driver.insight,
      confidence: driver.confidence,
      timeframe: driver.timeframe,
      impact: driver.impact,
      category: driver.category,
      data: driver
    })
  }
  
  const handleSignalClick = (signal: AssetSignal) => {
    setSelectedDetail({
      type: 'signal',
      title: `${signal.symbol} - ${signal.name}`,
      subtitle: signal.reasoning,
      confidence: signal.confidence,
      timeframe: signal.timeframe,
      data: signal
    })
  }
  
  const handleInsightClick = (insight: MacroInsight) => {
    setSelectedDetail({
      type: 'insight',
      title: insight.headline,
      subtitle: insight.summary,
      confidence: insight.confidence,
      timeframe: insight.timeframe,
      data: insight
    })
  }
  
  const handleRefresh = async () => {
    await refreshData()
    setUpdateCount(prev => prev + 1)
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-semibold mb-2">Failed to load research data</div>
          <div className="text-white/70 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  try {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          {/* Animated Background Orbs */}
          <motion.div
            style={{ y: y1 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: y2 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: y3 }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.08, 0.18, 0.08]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl">
                <Brain className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Research & Analytics
                </h1>
                <p className="text-gray-400 text-lg">
                  AI-powered market intelligence
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 bg-emerald-500/10 backdrop-blur-xl px-4 py-2 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">LIVE AI ANALYSIS</span>
            </div>
          </motion.div>
          
          {/* Hero Section */}
          <div className="mb-16">
            <ResearchHero 
              sentiment={marketSentiment}
              loading={loading}
              onSentimentClick={handleSentimentClick}
            />
          </div>
          
          {/* Key Drivers */}
          <div className="mb-16">
            <KeyDrivers 
              drivers={keyDrivers || []}
              loading={loading}
              onDriverClick={handleDriverClick}
              onRefresh={handleRefresh}
              updateCount={updateCount}
            />
          </div>
          
          {/* Asset Signals */}
          <div className="mb-16">
            <AssetSignals 
              signals={assetSignals || []}
              loading={loading}
              onSignalClick={handleSignalClick}
              onRefresh={handleRefresh}
              updateCount={updateCount}
            />
          </div>
          
          {/* Macro Insights */}
          <div className="mb-16 pb-20">
            <MacroInsights 
              insights={macroInsights || []}
              loading={loading}
              onInsightClick={handleInsightClick}
              onRefresh={handleRefresh}
              updateCount={updateCount}
            />
          </div>
        </div>
        
        {/* Detail Modal */}
        <ResearchDetailModal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          data={selectedDetail}
        />
      </div>
    )
  } catch (error) {
    console.error('❌ ResearchTab render error:', error)
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/30">
            <Brain className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Research Tab Error</h3>
          <p className="text-gray-400 mb-4">Failed to load research components</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}