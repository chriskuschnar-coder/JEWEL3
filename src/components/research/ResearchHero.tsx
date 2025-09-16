import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Brain, Zap, Target, ArrowUpRight } from 'lucide-react'
import { ResearchCard } from './ResearchCard'
import type { MarketSentiment } from '../../lib/researchData'

interface ResearchHeroProps {
  sentiment: MarketSentiment | null
  loading: boolean
  onSentimentClick?: (sentiment: MarketSentiment) => void
}

export function ResearchHero({ sentiment, loading, onSentimentClick }: ResearchHeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effects for floating elements
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -30])

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-6 w-6" />
      case 'bearish': return <TrendingDown className="h-6 w-6" />
      default: return <Activity className="h-6 w-6" />
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish': return 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400'
      case 'bearish': return 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400'
      default: return 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400'
    }
  }

  const generateMicroChart = (data: number[], direction: string) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 120
      const y = 40 - ((value - min) / range) * 30
      return `${x},${y}`
    }).join(' ')
    
    const isPositive = data[data.length - 1] > data[0]
    
    return (
      <div className="relative">
        <svg width="120" height="40" className="overflow-visible">
        <defs>
            <linearGradient id="heroChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.05" />
          </linearGradient>
            <filter id="heroGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
        </defs>
        <path
          d={`M 0 40 L ${points} L 120 40 Z`}
            fill="url(#heroChartGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
            filter="url(#heroGlow)"
        />
      </svg>
        
        {/* Floating data points */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    )
  }

  if (loading || !sentiment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-64 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur-xl border border-blue-500/30"
          >
            <Brain className="h-8 w-8 text-blue-400" />
          </motion.div>
          <div className="text-white/70 font-medium">Analyzing market sentiment...</div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Floating Background Elements */}
      <motion.div
        style={{ y: y1 }}
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-8 right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
      />
      
      <motion.div
        style={{ y: y2 }}
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-8 left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
      />
      
      <ResearchCard
        title={sentiment.headline}
        subtitle={sentiment.summary}
        value={`${sentiment.confidence}% Confidence`}
        change={sentiment.keyMetric.change}
        icon={getDirectionIcon(sentiment.direction)}
        color={sentiment.direction === 'bullish' ? 'text-emerald-400' : sentiment.direction === 'bearish' ? 'text-red-400' : 'text-amber-400'}
        bgGradient={getDirectionColor(sentiment.direction)}
        onClick={() => onSentimentClick?.(sentiment)}
        loading={loading}
        confidence={sentiment.confidence}
        timeframe={sentiment.direction === 'bullish' ? '1-2 weeks' : sentiment.direction === 'bearish' ? '3-5 days' : '2-4 weeks'}
        sparkline={sentiment.chartData}
        className="mb-8"
      />
    </div>
  )
}