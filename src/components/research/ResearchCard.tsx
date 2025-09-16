import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

interface ResearchCardProps {
  title: string
  subtitle?: string
  value: string
  change?: number
  icon: React.ReactNode
  color: string
  bgGradient: string
  onClick?: () => void
  loading?: boolean
  confidence?: number
  timeframe?: string
  sparkline?: number[]
  className?: string
}

export function ResearchCard({
  title,
  subtitle,
  value,
  change,
  icon,
  color,
  bgGradient,
  onClick,
  loading = false,
  confidence,
  timeframe,
  sparkline,
  className = ''
}: ResearchCardProps) {
  const generateSparkline = (data: number[]) => {
    if (!data || data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 80
      const y = 25 - ((value - min) / range) * 20
      return `${x},${y}`
    }).join(' ')
    
    const isPositive = data[data.length - 1] > data[0]
    
    return (
      <svg width="80" height="25" className="overflow-visible">
        <defs>
          <linearGradient id={`sparkline-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 25 L ${points} L 80 25 Z`}
          fill={`url(#sparkline-${title})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (loading) {
    return (
      <Card className={`bg-white/5 backdrop-blur-xl border-white/10 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card 
        className={`
          relative overflow-hidden backdrop-blur-xl cursor-pointer group
          bg-gradient-to-br ${bgGradient}
          border border-white/10 shadow-xl hover:shadow-2xl
          transition-all duration-300
          ${onClick ? 'cursor-pointer' : ''}
        `}
        onClick={onClick}
      >
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} blur-xl`}></div>
        </div>
        
        <CardContent className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                bg-white/10 backdrop-blur-sm border border-white/20
                group-hover:scale-110 transition-transform duration-300
              `}>
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-white/70 text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            
            {onClick && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="h-5 w-5 text-white/60" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="text-2xl font-bold text-white">
              {value}
            </div>
            
            {change !== undefined && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
              </div>
            )}
            
            {sparkline && (
              <div className="flex justify-center">
                {generateSparkline(sparkline)}
              </div>
            )}
            
            {(confidence || timeframe) && (
              <div className="flex items-center justify-between text-xs text-white/60">
                {confidence && (
                  <span>{confidence}% confidence</span>
                )}
                {timeframe && (
                  <span>{timeframe}</span>
                )}
              </div>
            )}
          </div>
          
          {onClick && (
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-xs text-blue-400 font-medium flex items-center">
                Click for detailed analysis <ArrowUpRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}