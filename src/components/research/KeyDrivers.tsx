import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Zap, 
  Building, 
  Users,
  Brain,
  Target,
  Activity,
  BarChart3
} from 'lucide-react'
import { ResearchCard } from './ResearchCard'
import { ResearchSection } from './ResearchSection'
import type { MarketDriver } from '../../lib/researchData'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface KeyDriversProps {
  drivers: MarketDriver[]
  loading: boolean
  onDriverClick?: (driver: MarketDriver) => void
  onRefresh?: () => void
  updateCount?: number
}

export function KeyDrivers({ drivers, loading, onDriverClick, onRefresh, updateCount }: KeyDriversProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, -100])
  const y2 = useTransform(scrollY, [0, 500], [0, -60])

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '💡'
      default: return '📊'
    }
  }

  if (loading) {
    return (
      <ResearchSection
        title="Key Market Drivers"
        subtitle="Institutional-grade market intelligence"
        icon={<Target className="h-6 w-6 text-blue-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
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
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
      />
      
      <motion.div
        style={{ y: y2 }}
        animate={{ 
          scale: [1, 1.2, 1],
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
      
      <ResearchSection
        title="Key Market Drivers"
        subtitle="Institutional-grade market intelligence"
        icon={<Target className="h-6 w-6 text-blue-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(drivers || []).map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ResearchCard
                        title={driver.title}
                        subtitle={driver.insight}
                        value={`${driver.confidence}%`}
                        icon={<span className="text-2xl">{driver.icon}</span>}
                        color={driver.color}
                        bgGradient={driver.bgGradient}
                        onClick={() => onDriverClick?.(driver)}
                        confidence={driver.confidence}
                        timeframe={driver.timeframe}
                      />
                    </div>
                  </TooltipTrigger>
                  
                  <TooltipContent 
                    side="top" 
                    className="max-w-sm p-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">{driver.title}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {driver.detailedContext}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700/50">
                        <span>Impact: {driver.impact}</span>
                        <span>Timeframe: {driver.timeframe}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </motion.div>
      </ResearchSection>
    </div>
  )
}