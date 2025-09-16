import * as React from "react"
import { useState, useEffect, useRef } from 'react'
import { Shield, Brain, Users, Zap, Award, Globe, Target, BarChart3, TrendingUp, CheckCircle, ArrowRight, Eye, Lock, Smartphone, RefreshCw, Activity, Play, Pause, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'

// AI Strategies Showcase Component - Cloned from FuturisticAIStrategies
function AIStrategiesShowcase() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [liveUpdateCount, setLiveUpdateCount] = useState(0)
  const [strategiesAnimated, setStrategiesAnimated] = useState(false)
  const [currentStrategySet, setCurrentStrategySet] = useState(0)

  const generateAIStrategies = () => {
    const timeVariation = Math.sin(Date.now() / 20000) * 0.3 + 0.7
    const marketCycle = Math.cos(Date.now() / 30000) * 0.2 + 0.8

    // Multiple strategy sets to rotate through
    const strategySets = [
      [
        {
          id: 'helios-momentum-btc',
          name: 'Helios Momentum BTC',
          assets: ['BTC'],
          performance_30d: 21.6 + (timeVariation * 6),
          risk_rating: 'Medium',
          strategy_type: 'Momentum',
          is_active: true,
          subscribers: Math.floor(1671 + timeVariation * 200),
          aum: Math.floor(3200000 + timeVariation * 500000),
          sharpe_ratio: 3.35 + (timeVariation * 0.3),
          max_drawdown: 10.9 + (timeVariation * 2),
          win_rate: 88.5 + (timeVariation * 8),
          last_trade: '12 minutes ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.3 + timeVariation * 5) * 15 + (timeVariation * 8)),
          icon: '₿',
          color: '#F7931A',
          glowColor: 'rgba(247, 147, 26, 0.4)',
          status: 'running',
          trades_today: Math.floor(23 + timeVariation * 8)
        },
        {
          id: 'helios-multi-asset',
          name: 'Helios Multi-Asset Alpha',
          assets: ['BTC', 'ETH', 'SOL'],
          performance_30d: 24.7 + (timeVariation * 7),
          risk_rating: 'High',
          strategy_type: 'Trend Following',
          is_active: true,
          subscribers: Math.floor(864 + timeVariation * 150),
          aum: Math.floor(4100000 + timeVariation * 800000),
          sharpe_ratio: 3.21 + (timeVariation * 0.4),
          max_drawdown: 16.8 + (timeVariation * 3),
          win_rate: 81.1 + (timeVariation * 10),
          last_trade: '8 minutes ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.4 + timeVariation * 3) * 20 + (timeVariation * 12)),
          icon: '🚀',
          color: '#8B5CF6',
          glowColor: 'rgba(139, 92, 246, 0.4)',
          status: 'running',
          trades_today: Math.floor(31 + timeVariation * 12)
        },
        {
          id: 'helios-solana-specialist',
          name: 'Helios Solana Specialist',
          assets: ['SOL'],
          performance_30d: 30.3 + (timeVariation * 8),
          risk_rating: 'High',
          strategy_type: 'Momentum',
          is_active: true,
          subscribers: Math.floor(423 + timeVariation * 100),
          aum: Math.floor(950000 + timeVariation * 300000),
          sharpe_ratio: 3.18 + (timeVariation * 0.5),
          max_drawdown: 20.7 + (timeVariation * 4),
          win_rate: 87.7 + (timeVariation * 12),
          last_trade: '25 minutes ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.6 + timeVariation * 4) * 25 + (timeVariation * 15)),
          icon: '◎',
          color: '#9945FF',
          glowColor: 'rgba(153, 69, 255, 0.4)',
          status: 'running',
          trades_today: Math.floor(18 + timeVariation * 6)
        }
      ],
      [
        {
          id: 'helios-arbitrage-eth',
          name: 'Helios Arbitrage ETH',
          assets: ['ETH'],
          performance_30d: 12.8 + (timeVariation * 4),
          risk_rating: 'Low',
          strategy_type: 'Arbitrage',
          is_active: true,
          subscribers: Math.floor(789 + timeVariation * 120),
          aum: Math.floor(1800000 + timeVariation * 400000),
          sharpe_ratio: 3.67 + (timeVariation * 0.2),
          max_drawdown: 4.2 + (timeVariation * 1),
          win_rate: 94.3 + (timeVariation * 4),
          last_trade: '3 minutes ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.2 + timeVariation * 2) * 8 + (timeVariation * 5)),
          icon: 'Ξ',
          color: '#627EEA',
          glowColor: 'rgba(98, 126, 234, 0.4)',
          status: 'running',
          trades_today: Math.floor(47 + timeVariation * 15)
        },
        {
          id: 'helios-mean-reversion',
          name: 'Helios Mean Reversion',
          assets: ['BTC', 'ETH'],
          performance_30d: 8.9 + (timeVariation * 2.5),
          risk_rating: 'Low',
          strategy_type: 'Mean Reversion',
          is_active: true,
          subscribers: Math.floor(456 + timeVariation * 80),
          aum: Math.floor(890000 + timeVariation * 200000),
          sharpe_ratio: 3.12 + (timeVariation * 0.25),
          max_drawdown: 5.8 + (timeVariation * 1.2),
          win_rate: 91.2 + (timeVariation * 6),
          last_trade: '1 hour ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.5 + timeVariation * 3) * 10 + (timeVariation * 4)),
          icon: '⚖️',
          color: '#10B981',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          status: 'running',
          trades_today: Math.floor(12 + timeVariation * 4)
        },
        {
          id: 'helios-market-maker',
          name: 'Helios Market Maker',
          assets: ['BTC', 'ETH', 'SOL'],
          performance_30d: 6.2 + (timeVariation * 1.5),
          risk_rating: 'Low',
          strategy_type: 'Market Making',
          is_active: true,
          subscribers: Math.floor(234 + timeVariation * 40),
          aum: Math.floor(5200000 + timeVariation * 1000000),
          sharpe_ratio: 3.89 + (timeVariation * 0.15),
          max_drawdown: 2.8 + (timeVariation * 0.6),
          win_rate: 96.4 + (timeVariation * 2),
          last_trade: '2 minutes ago',
          sparkline: Array.from({ length: 30 }, (_, i) => 100 + Math.cos(i * 0.1 + timeVariation) * 5 + (timeVariation * 2)),
          icon: '🎯',
          color: '#06B6D4',
          glowColor: 'rgba(6, 182, 212, 0.4)',
          status: 'running',
          trades_today: Math.floor(89 + timeVariation * 25)
        }
      ]
    ]

    return strategySets[currentStrategySet % strategySets.length]
  }

  const refreshStrategies = () => {
    setLiveUpdateCount(prev => prev + 1)
    setStrategies(generateAIStrategies())
  }

  useEffect(() => {
    refreshStrategies()
    setStrategiesAnimated(true)
    
    // Rotate strategy sets every 15 seconds
    const strategyRotation = setInterval(() => {
      setCurrentStrategySet(prev => prev + 1)
      refreshStrategies()
    }, 15000)
    
    // Live updates every 5 seconds
    const liveUpdates = setInterval(refreshStrategies, 5000)
    
    return () => {
      clearInterval(strategyRotation)
      clearInterval(liveUpdates)
    }
  }, [])

  const generateHolographicSparkline = (data: number[], color: string, glowColor: string, id: string) => {
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
            <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
            <filter id={`glow-${id}`}>
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
            fill={`url(#gradient-${id})`}
          />
          
          {/* Glowing line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${id})`}
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

  const totalAllocated = strategies.reduce((sum, strategy) => sum + (strategy.aum || 0), 0)
  const avgPerformance = strategies.reduce((sum, strategy) => sum + strategy.performance_30d, 0) / Math.max(strategies.length, 1)

  return (
    <div className="space-y-8">
      {/* Futuristic Header - Exact Clone */}
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
              <Logo size="medium" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Active AI Strategies
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium tracking-wide">
                    LIVE EXECUTION
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Update #{liveUpdateCount}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Control Center Stats */}
            <div className="hidden lg:flex items-center space-x-6 bg-white dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl px-6 py-3 border border-gray-200 dark:border-gray-700/30 shadow-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {(totalAllocated / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Allocated</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600/50"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +{avgPerformance.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Avg Performance</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600/50"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {strategies.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Active Strategies</div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshStrategies}
              className="p-3 bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 shadow-lg"
            >
              <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Strategy Grid - Exact Clone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {strategies.map((strategy, index) => (
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
                bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/80 dark:to-gray-800/60
                backdrop-blur-xl rounded-3xl p-6
                border border-gray-200 dark:border-gray-700/40
                hover:border-gray-300 dark:hover:border-gray-600/60
                shadow-xl hover:shadow-2xl
                transition-all duration-500
                overflow-hidden
              `}
              style={{
                boxShadow: `0 8px 32px ${strategy.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
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
                    className="absolute w-1 h-1 bg-white dark:bg-white rounded-full"
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
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
                      className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      +{strategy.performance_30d.toFixed(1)}%
                    </motion.div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">30 days</div>
                  </div>
                </div>

                {/* Holographic Sparkline */}
                <div className="mb-4 flex justify-center">
                  {generateHolographicSparkline(strategy.sparkline, strategy.color, strategy.glowColor, strategy.id)}
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Sharpe Ratio</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((strategy.sharpe_ratio / 4) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium text-sm">
                        {strategy.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${strategy.win_rate}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        {strategy.win_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <span>Max DD:</span>
                    <span className="text-red-500 dark:text-red-400 font-medium">
                      -{strategy.max_drawdown.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{strategy.subscribers.toLocaleString()}</span>
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
                  className="bg-blue-500/10 dark:bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Monitored Strategy</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Auto-managed by GMC
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Last trade: {strategy.last_trade}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show All Strategies Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl text-white font-medium transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 shadow-lg hover:shadow-xl"
        >
          <span>Show All 6 Strategies</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  )
}

export function WhyGMCSection() {
  const [isVisible, setIsVisible] = useState(false)
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

  const features = [
    {
      icon: Brain,
      title: 'No Charts, No Guesswork',
      description: 'Our AI analyzes market patterns and executes trades automatically — no need to read charts or make emotional decisions.',
      details: 'Advanced algorithms process millions of data points to make optimal trading decisions for you.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      icon: Shield,
      title: 'Choose Your Algorithm',
      description: 'Browse and select from multiple algorithmic strategies — momentum, mean reversion, arbitrage, and more.',
      details: 'Each algorithm is backtested and optimized for different market conditions and risk profiles.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      icon: Zap,
      title: 'Data > Feelings',
      description: 'Mathematical models and professional execution eliminate emotional trading and human error.',
      details: 'Algorithms execute trades based on data, not fear or greed, leading to more consistent results.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      icon: Users,
      title: 'Institutional Speed & Scale',
      description: 'Access the same high-frequency execution and risk management used by professional trading firms.',
      details: 'Sub-millisecond execution with institutional-grade infrastructure and compliance.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Connect to Institutional Technologies
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Access the same algorithmic trading infrastructure, quantitative strategies, and risk-managed execution 
            used by hedge funds and institutional investors — without the complexity or high minimums.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${feature.borderColor} ${feature.bgColor} cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
                  {feature.description}
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.details}
                </p>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active AI Strategies Section */}
        <div className={`mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <AIStrategiesShowcase />
        </div>
      </div>
    </section>
  )
}