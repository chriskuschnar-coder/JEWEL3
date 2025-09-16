import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Globe, TrendingUp, Brain, Target, Activity, BarChart3 } from 'lucide-react'
import { ResearchSection } from './ResearchSection'
import type { MacroInsight } from '../../lib/researchData'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

interface MacroInsightsProps {
  insights: MacroInsight[]
  loading: boolean
  onInsightClick?: (insight: MacroInsight) => void
  onRefresh?: () => void
  updateCount?: number
}

export function MacroInsights({ insights, loading, onInsightClick, onRefresh, updateCount }: MacroInsightsProps) {
  const getMockInsights = (): MacroInsight[] => {
    const timeVariation = Math.sin(Date.now() / 100000) * 0.5 + 0.5
    
    return [
      {
        id: 'fed-policy-shift',
        headline: 'Federal Reserve Policy Inflection Point',
        summary: `Economic data suggests ${(70 + timeVariation * 20).toFixed(0)}% probability of Fed pivot within 6 months. Inflation trending toward target while employment remains robust.`,
        impact: 'bullish',
        confidence: Math.floor(78 + timeVariation * 15),
        timeframe: '3-6 months',
        keyPoints: [
          'Core PCE inflation declining for 4 consecutive months',
          'Labor market showing signs of gradual cooling',
          'Fed officials increasingly dovish in recent speeches',
          'Market pricing 75% chance of rate cuts by Q2 2025'
        ],
        category: 'monetary'
      },
      {
        id: 'china-reopening',
        headline: 'China Economic Stimulus Accelerating',
        summary: `Beijing announces $${(800 + timeVariation * 400).toFixed(0)}B infrastructure package. Commodity demand and global growth expectations rising.`,
        impact: 'bullish',
        confidence: Math.floor(82 + timeVariation * 12),
        timeframe: '6-12 months',
        keyPoints: [
          'Largest stimulus package since 2008 financial crisis',
          'Focus on green energy and technology infrastructure',
          'Expected to boost global commodity demand by 15-20%'
        ],
        category: 'economic'
      }
    ]
  }

  const [mockInsights, setMockInsights] = useState(getMockInsights)

  useEffect(() => {
    const interval = setInterval(() => {
      setMockInsights(getMockInsights())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400'
      case 'bearish': return 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400'
      default: return 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'bullish': return <TrendingUp className="h-5 w-5" />
      case 'bearish': return <TrendingUp className="h-5 w-5 rotate-180" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary': return '🏦'
      case 'geopolitical': return '🌍'
      case 'economic': return '📊'
      case 'technological': return '🤖'
      default: return '📈'
    }
  }

  const insightVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <ResearchSection
        title="Macro Insights"
        subtitle="Global economic intelligence"
        icon={<Globe className="h-6 w-6 text-purple-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-4/5"></div>
                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-5/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ResearchSection>
    )
  }

  return (
    <div className="relative">
      <ResearchSection
        title="Macro Insights"
        subtitle="Global economic intelligence"
        icon={<Globe className="h-6 w-6 text-purple-400" />}
        onRefresh={onRefresh}
        loading={loading}
        updateCount={updateCount}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.2 }}
          className="space-y-6"
        >
          {((insights && insights.length > 0) ? insights : mockInsights || []).map((insight, index) => (
            <motion.div
              key={insight.id}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.3 }
              }}
              className={`
                relative overflow-hidden rounded-3xl backdrop-blur-xl
                bg-gradient-to-br ${getImpactColor(insight.impact)} mb-8
                border shadow-2xl hover:shadow-3xl
                transition-all duration-500 cursor-pointer group
                p-8
              `}
              onClick={() => onInsightClick?.(insight)}
            >
              {/* Floating Background Elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
                className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"
              />
              
              <div className="relative z-10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        bg-white/10 backdrop-blur-sm border border-white/20
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        {getImpactIcon(insight.impact)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {insight.headline}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className={`
                              font-semibold border-0 backdrop-blur-sm
                              ${insight.impact === 'bullish' ? 'bg-emerald-600/30 text-emerald-300' :
                                insight.impact === 'bearish' ? 'bg-red-600/30 text-red-300' :
                                'bg-amber-600/30 text-amber-300'}
                            `}
                          >
                            {insight.impact.toUpperCase()}
                          </Badge>
                          <span className="text-white/70 text-sm">
                            {insight.confidence}% confidence
                          </span>
                          <span className="text-white/70 text-sm">
                            {insight.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-white/90 text-lg leading-relaxed">
                    {insight.summary}
                  </p>
                  
                  {/* Key Points */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span>Key Developments</span>
                    </h4>
                    <ul className="space-y-2">
                      {insight.keyPoints.map((point, pointIndex) => (
                        <motion.li
                          key={pointIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: pointIndex * 0.1, duration: 0.3 }}
                          className="flex items-start space-x-3 text-white/80 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Click Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-xs text-blue-400 font-medium flex items-center">
                      Click for detailed analysis <Target className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute inset-0 bg-gradient-to-r ${getImpactColor(insight.impact)} blur-xl`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </ResearchSection>
    </div>
  )
}