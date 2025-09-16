import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface ModernPortfolioChartProps {
  currentBalance: number
  selectedTimeframe: '24H' | '1W' | '1M' | '3M' | '6M' | 'ALL'
  className?: string
}

interface ChartDataPoint {
  date: string
  value: number
  timestamp: number
  formattedDate: string
}

export function ModernPortfolioChart({ 
  currentBalance, 
  selectedTimeframe, 
  className = '' 
}: ModernPortfolioChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [animationProgress, setAnimationProgress] = useState(0)

  const generateChartData = (timeframe: string): ChartDataPoint[] => {
    const now = new Date()
    let periods: number
    let intervalMs: number
    
    switch (timeframe) {
      case '24H':
        periods = 48
        intervalMs = 30 * 60 * 1000 // 30 minutes
        break
      case '1W':
        periods = 168
        intervalMs = 60 * 60 * 1000 // 1 hour
        break
      case '1M':
        periods = 30
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
      case '3M':
        periods = 90
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
      case '6M':
        periods = 180
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
      case 'ALL':
        periods = 365
        intervalMs = 24 * 60 * 60 * 1000 // 1 day
        break
      default:
        periods = 30
        intervalMs = 24 * 60 * 60 * 1000
    }

    if (!currentBalance || currentBalance === 0) {
      return Array.from({ length: periods }, (_, i) => {
        const timestamp = now.getTime() - (periods - 1 - i) * intervalMs
        const date = new Date(timestamp)
        
        return {
          date: timeframe === '24H' 
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 0,
          timestamp,
          formattedDate: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: timeframe === '24H' ? '2-digit' : undefined,
            minute: timeframe === '24H' ? '2-digit' : undefined
          })
        }
      })
    }

    // Generate dramatic growth data like Coinbase
    const initialValue = Math.max(currentBalance * 0.65, 10000)
    const finalValue = currentBalance
    const totalGrowth = (finalValue - initialValue) / initialValue

    return Array.from({ length: periods }, (_, i) => {
      const timestamp = now.getTime() - (periods - 1 - i) * intervalMs
      const date = new Date(timestamp)
      const progress = i / (periods - 1)
      
      // Create dramatic, eye-catching growth curves like Coinbase
      const baseGrowth = Math.pow(progress, 0.7) * totalGrowth // More dramatic curve
      const volatility = Math.sin(i * 0.3) * 0.04 + Math.cos(i * 0.8) * 0.025 // More volatility
      const trendComponent = Math.sin(progress * Math.PI * 0.8) * totalGrowth * 0.3 // Stronger trend
      const microMovements = Math.sin(i * 1.5) * 0.015 // More micro-movements
      const momentumBoost = Math.pow(progress, 2) * totalGrowth * 0.2 // Acceleration effect
      
      const value = Math.max(
        initialValue * (1 + baseGrowth + volatility + trendComponent + microMovements + momentumBoost), 
        initialValue * 0.75
      )
      
      return {
        date: timeframe === '24H' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
        timestamp,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: timeframe === '24H' ? '2-digit' : undefined,
          minute: timeframe === '24H' ? '2-digit' : undefined
        })
      }
    })
  }

  useEffect(() => {
    // Start animation immediately when balance changes
    const data = generateChartData(selectedTimeframe)
    setChartData(data)
    
    // Animate chart growth to sync with balance
    setAnimationProgress(0)
    setIsAnimating(true)
    
    const animateChart = () => {
      let start = 0
      const duration = 1200 // Faster animation
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease-out animation for smooth growth
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setAnimationProgress(easeOut)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }
      
      requestAnimationFrame(animate)
    }
    
    // Start animation after brief delay
    const timer = setTimeout(animateChart, 100)
    return () => clearTimeout(timer)
  }, [currentBalance, selectedTimeframe])

  // Calculate performance metrics
  const startValue = chartData[0]?.value || 0
  const currentValue = chartData[chartData.length - 1]?.value || 0
  const periodReturn = startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0
  const periodHigh = Math.max(...chartData.map(d => d.value))
  const periodLow = Math.min(...chartData.map(d => d.value))
  const isPositive = periodReturn >= 0

  // Format currency values like Crypto.com
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value.toFixed(0)}`
  }

  // Custom Tooltip - Crypto.com style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600/50">
          <p className="text-xs text-gray-300 mb-1">{data.formattedDate}</p>
          <p className="text-sm font-bold text-white">
            {formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Crypto.com Style Container */}
      <div className="bg-[#0d1117] rounded-2xl p-4 sm:p-6 border border-gray-800/50">
        {/* Header with Icon and Title */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Portfolio Performance</h3>
        </div>

        {/* Metrics Row - Crypto.com Style */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 font-medium">
              PERIOD RETURN
            </div>
            <div className={`text-base sm:text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{periodReturn.toFixed(2)}%
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 font-medium">
              PERIOD HIGH
            </div>
            <div className="text-base sm:text-xl font-bold text-white">
              {formatCurrency(periodHigh)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 font-medium">
              PERIOD LOW
            </div>
            <div className="text-base sm:text-xl font-bold text-white">
              {formatCurrency(periodLow)}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] relative overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 15, bottom: 10 }}
            >
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="0%" 
                    stopColor="#3B82F6" 
                    stopOpacity={0.9} 
                  />
                  <stop 
                    offset="20%" 
                    stopColor="#3B82F6" 
                    stopOpacity={0.7} 
                  />
                  <stop 
                    offset="60%" 
                    stopColor="#3B82F6" 
                    stopOpacity={0.4} 
                  />
                  <stop 
                    offset="100%" 
                    stopColor="#3B82F6" 
                    stopOpacity={0.05} 
                  />
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                height={25}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                width={50}
                domain={['dataMin * 0.85', 'dataMax * 1.05']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '4 4', strokeOpacity: 0.6 }}
              />
              
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={4}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: "#3B82F6",
                  stroke: "#0d1117",
                  strokeWidth: 4
                }}
                animationDuration={1200}
                animationEasing="ease-in-out"
                animationBegin={0}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}