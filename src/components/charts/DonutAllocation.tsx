import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'

interface AllocationData {
  name: string
  value: number
  percentage: number
  performance: number
  color: string
  target: number
  risk: 'Low' | 'Medium' | 'High'
  category: 'crypto' | 'stocks' | 'bonds' | 'cash'
  icon: string
}

interface DonutAllocationProps {
  currentBalance: number
  onSegmentClick?: (data: AllocationData) => void
}

export function DonutAllocation({ currentBalance, onSegmentClick }: DonutAllocationProps) {
  const [allocationData, setAllocationData] = useState<AllocationData[]>([])
  const [selectedFilter, setSelectedFilter] = useState('All Assets')

  const generateAllocationData = (): AllocationData[] => {
    const marketMovement = Math.sin(Date.now() / 20000) * 0.02
    const performanceDrift = Math.cos(Date.now() / 40000) * 0.015
    const timeVariation = marketMovement + performanceDrift
    
    if (currentBalance === 0) {
      return [
        { 
          name: 'Bitcoin', 
          value: 0, 
          percentage: 50, 
          performance: 0, 
          color: '#F7931A', 
          target: 50, 
          risk: 'High', 
          category: 'crypto', 
          icon: '₿' 
        },
        { 
          name: 'Ethereum', 
          value: 0, 
          percentage: 35, 
          performance: 0, 
          color: '#627EEA', 
          target: 35, 
          risk: 'High', 
          category: 'crypto', 
          icon: 'Ξ' 
        },
        { 
          name: 'Cash', 
          value: 0, 
          percentage: 15, 
          performance: 0, 
          color: '#10B981', 
          target: 15, 
          risk: 'Low', 
          category: 'cash', 
          icon: '💵' 
        }
      ]
    }

    return [
      {
        name: 'Bitcoin',
        value: currentBalance * 0.50,
        percentage: 50 + (timeVariation * 3),
        performance: 28.7 + (timeVariation * 8),
        color: '#F7931A',
        target: 50,
        risk: 'High',
        category: 'crypto',
        icon: '₿'
      },
      {
        name: 'Ethereum',
        value: currentBalance * 0.35,
        percentage: 35 + (timeVariation * 2),
        performance: 24.3 + (timeVariation * 6),
        color: '#627EEA',
        target: 35,
        risk: 'High',
        category: 'crypto',
        icon: 'Ξ'
      },
      {
        name: 'Cash',
        value: currentBalance * 0.15,
        percentage: 15 + (timeVariation * 1),
        performance: 4.8 + (timeVariation * 1),
        color: '#10B981',
        target: 15,
        risk: 'Low', 
        category: 'cash',
        icon: '💵'
      }
    ]
  }

  useEffect(() => {
    setAllocationData(generateAllocationData())
    
    // Update allocation data every 10 seconds
    const interval = setInterval(() => {
      setAllocationData(generateAllocationData())
    }, 10000)
    
    return () => clearInterval(interval)
  }, [currentBalance])

  const handleSegmentClick = (data: AllocationData) => {
    if (onSegmentClick) {
      onSegmentClick(data)
    }
  }

  const generateSparkline = (percentage: number, performance: number) => {
    // Generate mini sparkline based on performance
    const points = Array.from({ length: 20 }, (_, i) => {
      const trend = performance > 0 ? 1 : -1
      const base = 50
      const trendComponent = (i / 19) * trend * 8
      const noise = Math.sin(i * 0.4) * 4
      return Math.max(30, Math.min(70, base + trendComponent + noise))
    })

    const max = Math.max(...points)
    const min = Math.min(...points)
    const range = max - min || 1
    
    const pathPoints = points.map((value, index) => {
      const x = (index / (points.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 16
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="60" height="20" className="overflow-visible">
        <polyline
          points={pathPoints}
          fill="none"
          stroke={performance >= 0 ? "#10b981" : "#ef4444"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'High': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Filter Dropdown - Crypto.com Style */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Running Algorithms</h3>
        
        {/* Small Dropdown Filter */}
        <div className="relative">
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
            <span>{selectedFilter}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Clean Asset List - Crypto.com Style */}
      <div className="space-y-3">
        {allocationData.map((item, index) => (
          <div 
            key={index}
            onClick={() => handleSegmentClick(item)}
            className="flex items-center justify-between py-4 hover:bg-gray-800/20 transition-colors cursor-pointer rounded-lg px-2"
          >
            {/* Left: Asset Info */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-white text-base">
                  {item.name}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={getRiskColor(item.risk)}>
                    {item.risk} Risk
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">Target: {item.target}%</span>
                </div>
              </div>
            </div>
            
            {/* Center: Mini Sparkline */}
            <div className="hidden md:flex justify-center flex-1">
              {generateSparkline(item.percentage, item.performance)}
            </div>
            
            {/* Right: Performance & Value */}
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {item.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mb-1">
                ${item.value.toLocaleString()}
              </div>
              <div className={`text-sm font-medium flex items-center justify-end space-x-1 ${
                item.performance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.performance >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {item.performance >= 0 ? '+' : ''}{item.performance.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}