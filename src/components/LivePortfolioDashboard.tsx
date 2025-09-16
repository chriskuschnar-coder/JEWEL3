import React, { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, BarChart3, ArrowRight, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface LivePortfolioDashboardProps {
  className?: string
}

interface ChartDataPoint {
  date: string
  value: number
  timestamp: number
  formattedDate: string
}

export function LivePortfolioDashboard({ className = '' }: LivePortfolioDashboardProps) {
  const [currentBalance, setCurrentBalance] = useState(0)
  const [displayBalance, setDisplayBalance] = useState(0)
  const [dailyChange, setDailyChange] = useState(0)
  const [dailyChangePct, setDailyChangePct] = useState(0)
  const [showBalance, setShowBalance] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24H' | '1W' | '1M' | '3M' | '6M' | 'ALL'>('1M')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const animationRef = useRef<number>()
  const intervalRef = useRef<number>()
  const [chartAnimationProgress, setChartAnimationProgress] = useState(0)

  // Generate realistic chart data
  const generateChartData = () => {
    const now = new Date()
    const periods = 30
    const intervalMs = 24 * 60 * 60 * 1000 // 1 day
    
    const initialValue = Math.max(currentBalance * 0.75, 30000)
    const finalValue = currentBalance
    const totalGrowth = (finalValue - initialValue) / initialValue

    return Array.from({ length: periods }, (_, i) => {
      const timestamp = now.getTime() - (periods - 1 - i) * intervalMs
      const date = new Date(timestamp)
      const progress = i / (periods - 1)
      
      // Create smooth, realistic market movements
      const baseGrowth = Math.pow(progress, 0.9) * totalGrowth
      const volatility = Math.sin(i * 0.4) * 0.025 + Math.cos(i * 0.7) * 0.015
      const trendComponent = Math.sin(progress * Math.PI * 0.6) * totalGrowth * 0.2
      const microMovements = Math.sin(i * 1.2) * 0.008
      
      const value = Math.max(
        initialValue * (1 + baseGrowth + volatility + trendComponent + microMovements), 
        initialValue * 0.85
      )
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
        timestamp,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        })
      }
    })
  }

  // Generate simple SVG chart
  const generateSimpleChart = (data: ChartDataPoint[]) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 280
      const y = 80 - ((point.value - min) / range) * 60
      return `${x},${y}`
    }).join(' ')
    
    const areaPoints = `0,80 ${points} 280,80`
    
    return (
      <svg width="280" height="80" className="w-full h-full">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        
        <polygon
          points={areaPoints}
          fill="url(#chartGradient)"
        />
        
        <polyline
          points={points}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Money printer animation - count from 0 to 50k quickly, then steady growth
  useEffect(() => {
    let startTime: number
    const targetValue = 38000 // Start lower for more dramatic growth
    const animationDuration = 2000 // Faster 2 seconds
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      
      // Ease-out curve for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = targetValue * easeOut
      
      setDisplayBalance(currentValue)
      setCurrentBalance(currentValue)
      
      // Calculate change based on growth from 38k
      const change = currentValue - 30000
      const changePct = (change / 30000) * 100
      setDailyChange(change)
      setDailyChangePct(changePct)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete, start steady growth
        setAnimationComplete(true)
        setCurrentBalance(38000)
        setDisplayBalance(38000)
      }
    }
    
    // Show content immediately
    setShowContent(true)
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Continuous growth cycle that resets at 100k
  useEffect(() => {
    if (!animationComplete) return
    
    intervalRef.current = setInterval(() => {
      setCurrentBalance(prev => {
        // Always growing with occasional small dips - more dramatic
        const baseGrowth = Math.random() * 1200 + 600 // $600-$1800 growth
        const direction = Math.random() < 0.90 ? 1 : -0.2 // 90% chance up, smaller dips
        const variation = baseGrowth * direction
        
        let newValue = prev + variation
        
        // Reset cycle when reaching 100k
        if (newValue >= 100000) {
          newValue = 35000 + Math.random() * 8000 // Reset to 35k-43k range
          console.log('🔄 Portfolio cycle reset at 100k')
        }
        
        // Ensure minimum floor with slight growth bias
        newValue = Math.max(newValue, 32000)
        
        // Update display balance smoothly
        setDisplayBalance(newValue)
        
        const change = newValue - 30000
        const changePct = (change / 30000) * 100
        setDailyChange(change)
        setDailyChangePct(changePct)
        
        return newValue
      })
    }, 1200) // Update every 1.2 seconds for more dynamic feel

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [animationComplete])

  // Update chart data when balance changes significantly
  useEffect(() => {
    if (showContent) {
      setChartData(generateChartData())
    }
  }, [Math.floor(currentBalance / 5000)]) // Update chart every $5k change

  const isPositive = dailyChange >= 0

  return (
    <div className={`relative ${className} flex items-center justify-center min-h-[500px] py-8`}>
      {/* iPhone 15 Pro Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-56 sm:w-72 lg:w-80 max-w-xs mx-auto"
      >
        {/* iPhone Frame with Enhanced Styling */}
        <div className="relative w-full aspect-[9/18] bg-black rounded-[2.5rem] sm:rounded-[3rem] p-1 shadow-2xl border-2 sm:border-4 border-gray-800"
             style={{
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
             }}>
          {/* iPhone Screen */}
          <div className="w-full h-full bg-[#0a0e1a] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative backdrop-blur-xl">
            
            {/* Realistic iOS Status Bar */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-1.5 sm:py-2 text-white text-xs sm:text-sm bg-black">
              <div className="flex items-center space-x-1">
                <span className="font-medium">1:20</span>
                <div className="w-3 sm:w-4 h-2 sm:h-3 flex items-center">
                  <svg width="12" height="9" viewBox="0 0 16 12" fill="white" className="sm:w-4 sm:h-3">
                    <path d="M1 4h2v4H1V4zm3-1h2v6H4V3zm3-1h2v8H7V2zm3 2h2v4h-2V4z"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs hidden sm:inline">5G</span>
                <div className="flex space-x-0.5">
                  <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white rounded-full"></div>
                  <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white rounded-full"></div>
                  <div className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-white rounded-full"></div>
                  <div className="w-0.5 sm:w-1 h-1 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-xs hidden sm:inline">78</span>
                <div className="w-4 sm:w-6 h-2 sm:h-3 border border-white rounded-sm">
                  <div className="w-3 sm:w-4 h-1 sm:h-2 bg-white rounded-sm m-0.5"></div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-full pb-4">
              {/* Portfolio Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="px-3 sm:px-4 py-4 sm:py-6 bg-[#0a0e1a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-xs uppercase tracking-wider text-gray-400 font-medium">
                      PORTFOLIO VALUE
                    </span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 text-gray-400 hover:text-white transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      {showBalance ? <Eye className="h-2.5 sm:h-3 w-2.5 sm:w-3" /> : <EyeOff className="h-2.5 sm:h-3 w-2.5 sm:w-3" />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <motion.h1 
                    className="text-xl sm:text-2xl font-bold text-white mb-1 font-mono tracking-tight"
                    key={Math.floor(displayBalance / 1000)} // Re-animate on significant changes
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {showBalance 
                      ? `$${Math.floor(displayBalance).toLocaleString('en-US')}`
                      : '••••••••'
                    }
                  </motion.h1>
                  {showBalance && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 sm:h-4 w-3 sm:w-4" />
                      ) : (
                        <ArrowDownRight className="h-3 sm:h-4 w-3 sm:w-4" />
                      )}
                      <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                      <span className="opacity-80">({isPositive ? '+' : ''}{dailyChangePct.toFixed(1)}%)</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Split Content: Chart and Strategy */}
              <div className="flex-1 min-h-0 flex flex-col gap-2 sm:gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col px-3 sm:px-4"
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-xs sm:text-xs text-gray-400 font-medium">Performance</span>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-400">
                      <span>HIGH</span>
                      <span>LOW</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2">
                    <span>+{dailyChangePct.toFixed(1)}%</span>
                    <span>${(currentBalance * 1.1).toLocaleString('en-US', { maximumFractionDigits: 0 })}k</span>
                    <span>${(currentBalance * 0.9).toLocaleString('en-US', { maximumFractionDigits: 0 })}k</span>
                  </div>
                  
                  {/* Chart Container */}
                  <div className="flex-1 w-full flex items-center justify-center min-h-[50px] sm:min-h-[60px]">
                    <div className="w-full h-full">
                      {generateSimpleChart(chartData)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5 sm:mt-1">
                    <span>Sep 14</span>
                    <span>Oct 14</span>
                  </div>
                </motion.div>

                {/* Strategy Section - Bottom Half */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="flex-1 flex flex-col px-3 sm:px-4"
                >
                  <h3 className="text-xs sm:text-xs text-gray-400 font-medium mb-1 sm:mb-2">Active Strategy</h3>
                  
                  {/* Helios Momentum BTC Strategy Card */}
                  <div className={`
                    flex-1 min-h-[120px] sm:min-h-0
                    relative group cursor-pointer
                    bg-gradient-to-br from-gray-900/80 to-gray-800/60
                    backdrop-blur-xl rounded-xl sm:rounded-2xl p-2 sm:p-3
                    border border-gray-700/40
                    hover:border-gray-600/60
                    shadow-lg hover:shadow-xl
                    transition-all duration-500
                    overflow-hidden
                  `}
                  style={{
                    boxShadow: '0 8px 32px rgba(247, 147, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
                  >
                    {/* Animated background gradient */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: 'linear-gradient(135deg, rgba(247, 147, 26, 0.4) 0%, transparent 50%)'
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div 
                            className="w-5 sm:w-6 h-5 sm:h-6 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold border group-hover:scale-110 transition-transform duration-300"
                            style={{ 
                              backgroundColor: '#F7931A20',
                              borderColor: '#F7931A40',
                              color: '#F7931A',
                              boxShadow: '0 0 15px rgba(247, 147, 26, 0.4)'
                            }}
                          >
                            ₿
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              Helios Momentum BTC
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold text-emerald-400">
                            +21.4%
                          </div>
                          <div className="text-xs text-gray-400">30d</div>
                        </div>
                      </div>
                      
                      {/* Mini Sparkline */}
                      <div className="mb-1 sm:mb-2 flex justify-center">
                        <svg width="50" height="16" className="overflow-visible sm:w-[60px] sm:h-[20px]">
                          <defs>
                            <linearGradient id="gradient-btc" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#F7931A" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#F7931A" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          
                          {/* Area fill */}
                          <path
                            d="M 0 16 Q 12 11 25 8 Q 37 5 50 3 L 50 16 Z"
                            fill="url(#gradient-btc)"
                            className="sm:d-[M 0 20 Q 15 14 30 10 Q 45 6 60 4 L 60 20 Z]"
                          />
                          
                          {/* Line */}
                          <path
                            d="M 0 13 Q 12 9 25 6 Q 37 3 50 1"
                            stroke="#F7931A"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="sm:d-[M 0 16 Q 15 12 30 8 Q 45 4 60 2] sm:stroke-[2]"
                          />
                        </svg>
                      </div>
                      
                      {/* Key Metrics */}
                      <div className="space-y-0.5 sm:space-y-1 mb-1 sm:mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Sharpe</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                style={{ width: '83%' }}
                              />
                            </div>
                            <span className="text-white font-medium text-xs">3.35</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Win Rate</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                style={{ width: '88.5%' }}
                              />
                            </div>
                            <span className="text-emerald-400 font-medium text-xs">88.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Show All Strategies Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="flex-shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 mt-2"
              >
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 flex items-center justify-center space-x-1 sm:space-x-2 min-h-[40px] sm:min-h-[44px] touch-manipulation shadow-lg"
                >
                  <span>All Strategies</span>
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4" />
                </button>
              </motion.div>
            </div>

            {/* Bottom Navigation */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex-shrink-0 bg-[#0a0e1a] border-t border-gray-800/50 px-3 sm:px-4 py-1.5 sm:py-2"
            >
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 min-h-[24px] sm:min-h-[28px] min-w-[24px] sm:min-w-[28px] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                  </div>
                  <span className="text-blue-400 text-xs font-medium hidden sm:inline">Portfolio</span>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500 min-h-[24px] sm:min-h-[28px] min-w-[24px] sm:min-w-[28px] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z"/>
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </div>
                  <span className="text-gray-500 text-xs hidden sm:inline">Trade</span>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="min-h-[24px] sm:min-h-[28px] min-w-[24px] sm:min-w-[28px] flex items-center justify-center">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-xs hidden sm:inline">Futures</span>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500 min-h-[24px] sm:min-h-[28px] min-w-[24px] sm:min-w-[28px] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="text-gray-500 text-xs hidden sm:inline">Assets</span>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  <div className="min-h-[24px] sm:min-h-[28px] min-w-[24px] sm:min-w-[28px] flex items-center justify-center">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-xs hidden sm:inline">Profile</span>
                </div>
              </div>
              
              {/* Home Indicator */}
              <div className="flex justify-center mt-1 sm:mt-2">
                <div className="w-20 sm:w-24 h-0.5 sm:h-1 bg-white rounded-full opacity-60"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}