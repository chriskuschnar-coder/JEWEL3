import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { ResearchCard } from './ResearchCard'
import { ResearchSection } from './ResearchSection'
import type { AssetSignal } from '../../lib/researchData'

interface AssetSignalsProps {
  signals: AssetSignal[]
  loading: boolean
  onSignalClick?: (signal: AssetSignal) => void
  onRefresh?: () => void
  updateCount?: number
}

export function AssetSignals({ signals, loading, onSignalClick, onRefresh, updateCount }: AssetSignalsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'stocks' | 'forex' | 'commodities'>('all')
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 800], [0, -120])
  const y2 = useTransform(scrollY, [0, 800], [0, -80])

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-emerald-400'
      case 'sell': return 'text-red-400'
      default: return 'text-amber-400'
    }
  }

  const filteredSignals = selectedCategory === 'all' 
    ? signals 
    : signals.filter(signal => signal.category === selectedCategory)

  if (loading) {
    return (
      <ResearchSection
        title="AI Asset Signals"
        subtitle="Real-time algorithmic trading signals"
        icon={<Zap className="h-6 w-6 text-yellow-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ResearchCard
              key={i}
              title=""
              value=""
              icon={<div />}
              color=""
              bgGradient=""
              loading={true}
            />
          ))}
        </div>
      </ResearchSection>
    )
  }

  return (
    <div className="relative">
      {/* Floating Background Elements */}
      <motion.div
        style={{ y: y1 }}
        animate={{ 
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-1/3 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"
      />
      
      <motion.div
        style={{ y: y2 }}
        animate={{ 
          rotate: [360, 180, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-green-500/10 rounded-full blur-3xl"
      />
      
      <ResearchSection
        title="AI Asset Signals"
        subtitle="Real-time algorithmic trading signals"
        icon={<Zap className="h-6 w-6 text-yellow-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center space-x-2 mb-8"
        >
          {['all', 'crypto', 'stocks', 'forex', 'commodities'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-xl
                ${selectedCategory === category
                  ? 'bg-blue-600/80 text-white shadow-lg border border-blue-500/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>
        
        {/* Asset Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.05 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {(filteredSignals || []).map((signal, index) => (
            <motion.div
              key={signal.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <ResearchCard
                title={signal.symbol}
                subtitle={signal.name}
                value={`$${signal.price.toLocaleString()}`}
                change={signal.changePercent}
                icon={<span className="text-xl">{signal.icon}</span>}
                color={getSignalColor(signal.signal)}
                bgGradient={`from-${signal.signal === 'buy' ? 'emerald' : signal.signal === 'sell' ? 'red' : 'amber'}-500/20 to-${signal.signal === 'buy' ? 'green' : signal.signal === 'sell' ? 'rose' : 'orange'}-500/10`}
                onClick={() => onSignalClick?.(signal)}
                confidence={signal.confidence}
                timeframe={signal.timeframe}
                sparkline={signal.sparkline}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </ResearchSection>
    </div>
  )
}