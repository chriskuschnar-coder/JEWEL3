import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Target, 
  BarChart3, 
  Users, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Play,
  Pause,
  Settings,
  ChevronDown,
  Maximize2,
  RefreshCw
} from 'lucide-react'

interface AIStrategy {
  id: string
  name: string
  description: string
  assets: string[]
  performance_30d: number
  performance_ytd: number
  risk_rating: 'Low' | 'Medium' | 'High'
  strategy_type: 'Momentum' | 'Mean Reversion' | 'Arbitrage' | 'Trend Following' | 'Market Making'
  current_allocation?: number
  is_active: boolean
  subscribers: number
  aum: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  last_trade: string
  fees: number
  sparkline: number[]
  icon: string
  color: string
  glowColor: string
  status: 'running' | 'paused' | 'optimizing'
  trades_today: number
  avg_trade_duration: string
  volatility: number
  alpha: number
}

interface FuturisticAIStrategiesProps {
  currentBalance: number
  onStrategyClick?: (strategy: AIStrategy) => void
}

export function FuturisticAIStrategies({ currentBalance, onStrategyClick }: FuturisticAIStrategiesProps) {
  const [strategies, setStrategies] = useState<AIStrategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [liveUpdateCount, setLiveUpdateCount] = useState(0)
  const [showAllStrategies, setShowAllStrategies] = useState(false)

  const generateAIStrategies = (): AIStrategy[] => {
    const timeVariation = Math.sin(Date.now() / 20000) * 0.3 + 0.7
    const marketCycle = Math.cos(Date.now() / 30000) * 0.2 + 0.8

    return [
      {
        id: 'helios-momentum-btc',
        name: 'Helios Momentum BTC',
        description: 'Advanced momentum strategy specifically designed for Bitcoin, using machine learning to identify trend continuations and reversals with institutional-grade execution.',
        assets: ['BTC'],
        performance_30d: 16.8 + (timeVariation * 6),
        performance_ytd: 28.6 + (timeVariation * 12),
        risk_rating: 'Medium',
        strategy_type: 'Momentum',
        current_allocation: Math.floor(25000 + timeVariation * 10000),
        is_active: true,
        subscribers: Math.floor(1519 + timeVariation * 200),
        aum: Math.floor(2900000 + timeVariation * 500000),
        sharpe_ratio: 3.11 + (timeVariation * 0.3),
        max_drawdown: 9.3 + (timeVariation * 2),
        win_rate: 82 + (timeVariation * 8),
        last_trade: '12 minutes ago',
        fees: 1.5,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.3 + timeVariation * 5) * 15 + (timeVariation * 8)),
        icon: '₿',
        color: '#F7931A',
        glowColor: 'rgba(247, 147, 26, 0.4)',
        status: 'running',
        trades_today: Math.floor(23 + timeVariation * 8),
        avg_trade_duration: '2.3 days',
        volatility: 12.4 + (timeVariation * 3),
        alpha: 8.7 + (timeVariation * 2)
      },
      {
        id: 'helios-multi-asset',
        name: 'Helios Multi-Asset Alpha',
        description: 'Diversified strategy trading Bitcoin, Ethereum, and Solana with dynamic allocation based on market conditions and cross-asset momentum signals.',
        assets: ['BTC', 'ETH', 'SOL'],
        performance_30d: 19.0 + (timeVariation * 7),
        performance_ytd: 32.1 + (timeVariation * 15),
        risk_rating: 'High',
        strategy_type: 'Trend Following',
        current_allocation: Math.floor(17500 + timeVariation * 8000),
        is_active: true,
        subscribers: Math.floor(743 + timeVariation * 150),
        aum: Math.floor(3600000 + timeVariation * 800000),
        sharpe_ratio: 2.89 + (timeVariation * 0.4),
        max_drawdown: 14.4 + (timeVariation * 3),
        win_rate: 73 + (timeVariation * 10),
        last_trade: '8 minutes ago',
        fees: 2.5,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.4 + timeVariation * 3) * 20 + (timeVariation * 12)),
        icon: '🚀',
        color: '#8B5CF6',
        glowColor: 'rgba(139, 92, 246, 0.4)',
        status: 'running',
        trades_today: Math.floor(31 + timeVariation * 12),
        avg_trade_duration: '1.8 days',
        volatility: 18.7 + (timeVariation * 4),
        alpha: 12.3 + (timeVariation * 3)
      },
      {
        id: 'helios-solana-specialist',
        name: 'Helios Solana Specialist',
        description: 'Specialized algorithm for Solana ecosystem tokens, capturing unique opportunities in the fastest-growing blockchain with high-frequency execution.',
        assets: ['SOL'],
        performance_30d: 23.8 + (timeVariation * 8),
        performance_ytd: 45.6 + (timeVariation * 18),
        risk_rating: 'High',
        strategy_type: 'Momentum',
        current_allocation: Math.floor(12500 + timeVariation * 6000),
        is_active: true,
        subscribers: Math.floor(343 + timeVariation * 100),
        aum: Math.floor(800000 + timeVariation * 300000),
        sharpe_ratio: 2.78 + (timeVariation * 0.5),
        max_drawdown: 17.5 + (timeVariation * 4),
        win_rate: 78 + (timeVariation * 12),
        last_trade: '25 minutes ago',
        fees: 2.2,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.6 + timeVariation * 4) * 25 + (timeVariation * 15)),
        icon: '◎',
        color: '#9945FF',
        glowColor: 'rgba(153, 69, 255, 0.4)',
        status: 'running',
        trades_today: Math.floor(18 + timeVariation * 6),
        avg_trade_duration: '1.1 days',
        volatility: 22.1 + (timeVariation * 5),
        alpha: 15.2 + (timeVariation * 4)
      },
      {
        id: 'helios-arbitrage-eth',
        name: 'Helios Arbitrage ETH',
        description: 'Cross-exchange arbitrage opportunities in Ethereum markets, capturing price discrepancies with minimal risk and high-frequency execution.',
        assets: ['ETH'],
        performance_30d: 8.9 + (timeVariation * 3),
        performance_ytd: 18.3 + (timeVariation * 6),
        risk_rating: 'Low',
        strategy_type: 'Arbitrage',
        current_allocation: Math.floor(8000 + timeVariation * 4000),
        is_active: true,
        subscribers: Math.floor(567 + timeVariation * 120),
        aum: Math.floor(1200000 + timeVariation * 400000),
        sharpe_ratio: 3.45 + (timeVariation * 0.2),
        max_drawdown: 3.1 + (timeVariation * 1),
        win_rate: 94 + (timeVariation * 4),
        last_trade: '3 minutes ago',
        fees: 2.0,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.2 + timeVariation * 2) * 8 + (timeVariation * 5)),
        icon: 'Ξ',
        color: '#627EEA',
        glowColor: 'rgba(98, 126, 234, 0.4)',
        status: 'running',
        trades_today: Math.floor(47 + timeVariation * 15),
        avg_trade_duration: '45 minutes',
        volatility: 6.2 + (timeVariation * 1.5),
        alpha: 4.8 + (timeVariation * 1)
      },
      {
        id: 'helios-mean-reversion',
        name: 'Helios Mean Reversion',
        description: 'Statistical mean reversion strategy targeting oversold/overbought conditions across major cryptocurrencies with quantitative precision.',
        assets: ['BTC', 'ETH'],
        performance_30d: 6.8 + (timeVariation * 2.5),
        performance_ytd: 14.2 + (timeVariation * 5),
        risk_rating: 'Low',
        strategy_type: 'Mean Reversion',
        current_allocation: Math.floor(6000 + timeVariation * 3000),
        is_active: true,
        subscribers: Math.floor(289 + timeVariation * 80),
        aum: Math.floor(650000 + timeVariation * 200000),
        sharpe_ratio: 2.91 + (timeVariation * 0.25),
        max_drawdown: 4.7 + (timeVariation * 1.2),
        win_rate: 87 + (timeVariation * 6),
        last_trade: '1 hour ago',
        fees: 1.8,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.5 + timeVariation * 3) * 10 + (timeVariation * 4)),
        icon: '⚖️',
        color: '#10B981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        status: 'running',
        trades_today: Math.floor(12 + timeVariation * 4),
        avg_trade_duration: '6.2 hours',
        volatility: 8.1 + (timeVariation * 2),
        alpha: 3.2 + (timeVariation * 1)
      },
      {
        id: 'helios-market-maker',
        name: 'Helios Market Maker',
        description: 'Automated market making strategy providing liquidity while capturing bid-ask spreads across multiple exchanges with institutional precision.',
        assets: ['BTC', 'ETH', 'SOL'],
        performance_30d: 4.2 + (timeVariation * 1.5),
        performance_ytd: 11.8 + (timeVariation * 3),
        risk_rating: 'Low',
        strategy_type: 'Market Making',
        current_allocation: Math.floor(15000 + timeVariation * 7000),
        is_active: true,
        subscribers: Math.floor(156 + timeVariation * 40),
        aum: Math.floor(4500000 + timeVariation * 1000000),
        sharpe_ratio: 3.67 + (timeVariation * 0.15),
        max_drawdown: 2.1 + (timeVariation * 0.6),
        win_rate: 96 + (timeVariation * 2),
        last_trade: '2 minutes ago',
        fees: 1.2,
        sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.1 + timeVariation) * 5 + (timeVariation * 2)),
        icon: '🎯',
        color: '#06B6D4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        status: 'running',
        trades_today: Math.floor(89 + timeVariation * 25),
        avg_trade_duration: '12 minutes',
        volatility: 4.3 + (timeVariation * 1),
        alpha: 2.1 + (timeVariation * 0.8)
      }
    ]
  }

  const refreshStrategies = () => {
    setLiveUpdateCount(prev => prev + 1)
    setStrategies(generateAIStrategies())
  }

  useEffect(() => {
    refreshStrategies()
    
    // Live updates every 15 seconds for futuristic feel
    const interval = setInterval(refreshStrategies, 15000)
    return () => clearInterval(interval)
  }, [currentBalance])

  const getRiskGlow = (risk: string) => {
    switch (risk) {
      case 'Low': return 'shadow-emerald-500/30 border-emerald-500/30'
      case 'Medium': return 'shadow-amber-500/30 border-amber-500/30'
      case 'High': return 'shadow-red-500/30 border-red-500/30'
      default: return 'shadow-gray-500/30 border-gray-500/30'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/40'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      case 'optimizing': return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'optimizing': return <Settings className="h-3 w-3 animate-spin" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const generateHolographicSparkline = (data: number[], color: string, glowColor: string) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 120
      const y = 40 - ((value - min) / range) * 30
      return `${x},${y}`
    }).join(' ')
    
    return (
      <div className="relative">
        <svg width="120" height="40" className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${data[0]}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
            <filter id={`glow-${data[0]}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Area fill */}
          <path
            d={`M 0 40 L ${points} L 120 40 Z`}
            fill={`url(#gradient-${data[0]})`}
          />
          
          {/* Glowing line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${data[0]})`}
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          
          {/* Floating data points */}
          {data.slice(-3).map((_, index) => (
            <circle
              key={index}
              cx={120 - index * 20}
              cy={40 - ((data[data.length - 1 - index] - min) / range) * 30}
              r="2"
              fill={color}
              className="animate-pulse"
              style={{ 
                animationDelay: `${index * 0.5}s`,
                filter: `drop-shadow(0 0 4px ${glowColor})`
              }}
            />
          ))}
        </svg>
      </div>
    )
  }

  const AnimatedCounter = ({ value, suffix = '', duration = 1000 }: { value: number; suffix?: string; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      let startTime: number
      let startValue = displayValue

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (value - startValue) * easeOut
        
        setDisplayValue(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, [value, duration])

    return (
      <span>
        {displayValue.toFixed(suffix.includes('%') ? 1 : 2)}{suffix}
      </span>
    )
  }

  const displayedStrategies = showAllStrategies ? strategies : strategies.slice(0, 3)
  const totalAllocated = strategies.reduce((sum, strategy) => sum + (strategy.current_allocation || 0), 0)
  const avgPerformance = strategies.reduce((sum, strategy) => sum + strategy.performance_30d, 0) / strategies.length

  return (
    <div className="space-y-8">
      {/* Futuristic Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Floating background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-0 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 30px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center border border-blue-500/30"
            >
              <Brain className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Active AI Strategies
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <span className="text-emerald-400 text-sm font-medium tracking-wide">
                    LIVE EXECUTION
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm">
                  Update #{liveUpdateCount}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Control Center Stats */}
            <div className="hidden lg:flex items-center space-x-6 bg-gray-800/30 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-700/30">
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  <AnimatedCounter value={totalAllocated} />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Allocated</div>
              </div>
              <div className="w-px h-8 bg-gray-600/50"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">
                  +<AnimatedCounter value={avgPerformance} suffix="%" />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Avg Performance</div>
              </div>
              <div className="w-px h-8 bg-gray-600/50"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  <AnimatedCounter value={strategies.length} />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Active Strategies</div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshStrategies}
              className="p-3 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5 text-gray-400 hover:text-blue-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {displayedStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
              }}
              className={`
                relative group cursor-pointer
                bg-gradient-to-br from-gray-900/80 to-gray-800/60
                backdrop-blur-xl rounded-3xl p-6
                border border-gray-700/40
                hover:border-gray-600/60
                ${getRiskGlow(strategy.risk_rating)}
                transition-all duration-500
                overflow-hidden
              `}
              style={{
                boxShadow: `0 8px 32px ${strategy.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={() => {
                setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)
                onStrategyClick?.(strategy)
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  background: [
                    `linear-gradient(135deg, ${strategy.glowColor} 0%, transparent 50%)`,
                    `linear-gradient(135deg, transparent 0%, ${strategy.glowColor} 50%)`,
                    `linear-gradient(135deg, ${strategy.glowColor} 0%, transparent 50%)`
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 opacity-20"
              />

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-20, -100],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                      ease: "easeOut"
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      bottom: '10px'
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          `0 0 15px ${strategy.glowColor}`,
                          `0 0 25px ${strategy.glowColor}`,
                          `0 0 15px ${strategy.glowColor}`
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border"
                      style={{ 
                        backgroundColor: `${strategy.color}20`,
                        borderColor: `${strategy.color}40`,
                        color: strategy.color
                      }}
                    >
                      {strategy.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                        {strategy.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRiskColor(strategy.risk_rating)}`}>
                          {strategy.risk_rating} Risk
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(strategy.status)} flex items-center space-x-1`}>
                          {getStatusIcon(strategy.status)}
                          <span className="capitalize">{strategy.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <motion.div
                      key={strategy.performance_30d}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-emerald-400"
                    >
                      +<AnimatedCounter value={strategy.performance_30d} suffix="%" />
                    </motion.div>
                    <div className="text-xs text-gray-400">30 days</div>
                  </div>
                </div>

                {/* Holographic Sparkline */}
                <div className="mb-4 flex justify-center">
                  {generateHolographicSparkline(strategy.sparkline, strategy.color, strategy.glowColor)}
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Sharpe Ratio</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((strategy.sharpe_ratio / 4) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        />
                      </div>
                      <span className="text-white font-medium text-sm">
                        <AnimatedCounter value={strategy.sharpe_ratio} />
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${strategy.win_rate}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                      </div>
                      <span className="text-emerald-400 font-medium text-sm">
                        <AnimatedCounter value={strategy.win_rate} suffix="%" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <span>Max DD:</span>
                    <span className="text-red-400 font-medium">
                      -<AnimatedCounter value={strategy.max_drawdown} suffix="%" />
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span><AnimatedCounter value={strategy.subscribers} /></span>
                  </div>
                </div>

                {/* Live Status */}
                <motion.div
                  animate={{ 
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.1)',
                      'rgba(59, 130, 246, 0.2)',
                      'rgba(59, 130, 246, 0.1)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">Monitored Strategy</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedStrategy === strategy.id ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Auto-managed by GMC
                  </div>
                  <div className="text-xs text-blue-400 mt-1">
                    Last trade: {strategy.last_trade}
                  </div>
                </motion.div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedStrategy === strategy.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-700/50 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">AUM:</span>
                          <div className="text-white font-medium">
                            $<AnimatedCounter value={strategy.aum / 1000000} suffix="M" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Fee:</span>
                          <div className="text-white font-medium">
                            <AnimatedCounter value={strategy.fees} suffix="%" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Trades Today:</span>
                          <div className="text-emerald-400 font-medium">
                            <AnimatedCounter value={strategy.trades_today} />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Duration:</span>
                          <div className="text-white font-medium">{strategy.avg_trade_duration}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-300 leading-relaxed">
                        {strategy.description}
                      </div>
                      
                      <div className="flex space-x-2">
                        {strategy.assets.map((asset) => (
                          <span key={asset} className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {strategies.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllStrategies(!showAllStrategies)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl text-white font-medium transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50"
          >
            <span>{showAllStrategies ? 'Show Less' : `Show All ${strategies.length} Strategies`}</span>
            <ArrowRight className={`h-4 w-4 transition-transform ${showAllStrategies ? 'rotate-180' : ''}`} />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}