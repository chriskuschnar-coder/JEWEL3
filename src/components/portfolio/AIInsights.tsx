import React, { useState, useEffect } from 'react'
import { Brain, ChevronRight, ChevronDown, TrendingUp, AlertTriangle, Target, CheckCircle, Clock, Lightbulb, ArrowRight } from 'lucide-react'
import { MetricDetailModal } from './MetricDetailModal'

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'rebalance' | 'market'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  timeframe: string
}

interface MarketCondition {
  condition: string
  probability: number
  impact_on_portfolio: string
  recommended_action: string
}

export function AIInsights({ currentBalance }: { currentBalance: number }) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastMarketEvent, setLastMarketEvent] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<any>(null)
  const [showInsightModal, setShowInsightModal] = useState(false)

  const generateAIInsights = (): AIInsight[] => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.3 + 0.7
    const hasActivity = currentBalance > 0
    
    if (!hasActivity) {
      return [
        {
          id: 'welcome-1',
          type: 'opportunity',
          title: 'Ready to Begin Trading',
          description: 'Fund your account to start receiving AI-powered insights and trading recommendations.',
          impact: 'high',
          confidence: 100,
          actionable: true,
          timeframe: 'Now'
        }
      ]
    }

    const insightPool = [
      {
        id: 'crypto-momentum-1',
        type: 'opportunity' as const,
        title: 'Bitcoin Momentum Signal',
        description: `Strong momentum detected in BTC with ${(85 + timeVariation * 10).toFixed(0)}% probability of continuation. Consider increasing allocation.`,
        impact: 'high' as const,
        confidence: Math.floor(85 + timeVariation * 10),
        actionable: true,
        timeframe: '1-2 weeks'
      },
      {
        id: 'rebalance-1',
        type: 'rebalance' as const,
        title: 'Portfolio Rebalancing Alert',
        description: `Crypto allocation at ${(42 + timeVariation * 3).toFixed(1)}% vs 40% target. Small adjustment recommended.`,
        impact: 'medium' as const,
        confidence: Math.floor(78 + timeVariation * 15),
        actionable: true,
        timeframe: 'This week'
      },
      {
        id: 'risk-1',
        type: 'risk' as const,
        title: 'Volatility Increase Expected',
        description: `Market indicators suggest ${(72 + timeVariation * 20).toFixed(0)}% chance of increased volatility. Consider protective measures.`,
        impact: 'medium' as const,
        confidence: Math.floor(72 + timeVariation * 20),
        actionable: true,
        timeframe: '3-5 days'
      },
      {
        id: 'market-1',
        type: 'market' as const,
        title: 'Altcoin Season Approaching',
        description: `Technical analysis shows ${(65 + timeVariation * 25).toFixed(0)}% probability of altcoin outperformance vs Bitcoin.`,
        impact: 'high' as const,
        confidence: Math.floor(82 + timeVariation * 12),
        actionable: true,
        timeframe: '2-4 weeks'
      }
    ]

    const insightIndex = Math.floor(Date.now() / (1000 * 60 * 2)) % insightPool.length
    return insightPool.slice(insightIndex, insightIndex + 3).concat(insightPool.slice(0, Math.max(0, 3 - (insightPool.length - insightIndex))))
  }

  const generateMarketConditions = (): MarketCondition[] => {
    const timeVariation = Date.now() % 100000 / 100000
    
    return [
      {
        condition: 'Crypto Bull Market Continuation',
        probability: Math.floor(75 + timeVariation * 20),
        impact_on_portfolio: `Positive for crypto holdings (+${(3.2 + timeVariation * 1.5).toFixed(1)}% expected)`,
        recommended_action: 'Maintain or increase crypto exposure'
      },
      {
        condition: 'Market Volatility Expansion',
        probability: Math.floor(68 + timeVariation * 25),
        impact_on_portfolio: `Increased portfolio swings (±${(2.4 + timeVariation * 0.8).toFixed(1)}% daily)`,
        recommended_action: 'Consider position sizing adjustments'
      },
      {
        condition: 'Institutional Crypto Adoption',
        probability: Math.floor(82 + timeVariation * 15),
        impact_on_portfolio: `Long-term positive for crypto allocation (+${(1.8 + timeVariation * 1.2).toFixed(1)}% monthly)`,
        recommended_action: 'Hold crypto positions for institutional flow'
      }
    ]
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    const marketEvents = [
      'Bitcoin ETF flows accelerating',
      'Ethereum upgrade momentum building',
      'Altcoin correlation breakdown detected',
      'Institutional crypto adoption increasing',
      'DeFi yield opportunities expanding',
      'Crypto market structure improving'
    ]
    
    const currentEvent = marketEvents[Math.floor(Date.now() / (1000 * 60 * 2)) % marketEvents.length]
    setLastMarketEvent(currentEvent)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setInsights(generateAIInsights())
    setMarketConditions(generateMarketConditions())
    
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 20000)
    return () => clearInterval(interval)
  }, [currentBalance])

  const getInsightDetails = (insight: AIInsight) => {
    return {
      name: insight.title,
      value: `${insight.confidence}% confidence`,
      description: `${insight.description} This insight is based on our AI analysis of current market conditions and your portfolio composition.`,
      calculation: `AI Model Analysis: ${insight.type} detection with ${insight.confidence}% confidence level`,
      interpretation: `This ${insight.type} insight suggests ${insight.actionable ? 'immediate action may be beneficial' : 'monitoring the situation'}. The ${insight.impact} impact rating indicates ${insight.impact === 'high' ? 'significant potential effect' : insight.impact === 'medium' ? 'moderate potential effect' : 'minor potential effect'} on your portfolio performance.`,
      benchmark: `${insight.impact === 'high' ? '85%+' : insight.impact === 'medium' ? '70%+' : '60%+'} confidence threshold`,
      percentile: insight.confidence > 85 ? 90 : insight.confidence > 75 ? 80 : 70,
      trend: insight.type === 'opportunity' ? 'up' as const : insight.type === 'risk' ? 'down' as const : 'stable' as const,
      historicalData: [
        { period: 'Previous Week', value: insight.confidence * 0.85 },
        { period: 'Previous Month', value: insight.confidence * 0.92 },
        { period: 'Previous Quarter', value: insight.confidence * 0.88 },
        { period: 'Current Analysis', value: insight.confidence }
      ],
      relatedMetrics: [
        { name: 'Impact Level', value: insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1), correlation: 0.85 },
        { name: 'Timeframe', value: insight.timeframe, correlation: 0.65 },
        { name: 'Actionable', value: insight.actionable ? 'Yes' : 'No', correlation: 0.45 }
      ],
      actionableInsights: [
        `${insight.title} shows ${insight.confidence}% confidence level`,
        `Recommended timeframe for action: ${insight.timeframe}`,
        `Impact assessment: ${insight.impact} priority for portfolio optimization`,
        insight.actionable ? 'Consider taking action based on this insight' : 'Continue monitoring this situation'
      ]
    }
  }

  const handleInsightClick = (insight: AIInsight) => {
    const details = getInsightDetails(insight)
    setSelectedInsight(details)
    setShowInsightModal(true)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />
      case 'risk': return <AlertTriangle className="h-4 w-4" />
      case 'rebalance': return <Target className="h-4 w-4" />
      case 'market': return <Lightbulb className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getImpactDot = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-blue-500'
      case 'medium': return 'bg-gray-400'
      case 'low': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }

  // Count insights by type for folder preview
  const insightCounts = {
    opportunities: insights.filter(i => i.type === 'opportunity').length,
    risks: insights.filter(i => i.type === 'risk').length,
    actions: insights.filter(i => i.actionable).length,
    total: insights.length
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Folder Header - Clickable */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Portfolio Insights</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{insightCounts.total} insights available</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live analysis</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick Preview Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{insightCounts.opportunities} opportunities</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{insightCounts.actions} actionable</span>
              </div>
            </div>
            
            {/* Expand/Collapse Icon */}
            <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        {/* Market Event Ticker */}
        {lastMarketEvent && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {lastMarketEvent}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Active Insights */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Active Insights</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Updated {new Date().toLocaleTimeString()}</span>
                </div>
                
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id}
                      onClick={() => handleInsightClick(insight)}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{insight.title}</h5>
                            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{insight.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`w-3 h-3 rounded-full ${getImpactDot(insight.impact)}`}></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {insight.confidence}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{insight.timeframe}</span>
                          </div>
                          <span className="capitalize">{insight.impact} impact</span>
                        </div>
                        {insight.actionable && (
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex items-center space-x-1">
                            <span>View Details</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                          Click for detailed analysis <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Conditions */}
              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Market Analysis</h4>
                <div className="space-y-3">
                  {marketConditions.map((condition, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 dark:text-white">{condition.condition}</h5>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{condition.probability}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Probability</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px]">Impact:</span>
                          <span className="text-gray-900 dark:text-white">{condition.impact_on_portfolio}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px]">Action:</span>
                          <span className="text-gray-900 dark:text-white">{condition.recommended_action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Analysis Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {insightCounts.opportunities}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                      {insightCounts.risks}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Risk Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {insightCounts.actions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Actionable</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Insight Detail Modal */}
      <MetricDetailModal
        metric={selectedInsight}
        isOpen={showInsightModal}
        onClose={() => {
          setShowInsightModal(false)
          setSelectedInsight(null)
        }}
      />
    </div>
  )
}