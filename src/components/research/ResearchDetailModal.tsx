import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Activity, Target, BarChart3, Brain, Clock, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

interface DetailData {
  type: 'driver' | 'signal' | 'insight'
  title: string
  subtitle?: string
  confidence?: number
  timeframe?: string
  impact?: string
  category?: string
  data: any
}

interface ResearchDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: DetailData | null
}

export function ResearchDetailModal({ isOpen, onClose, data }: ResearchDetailModalProps) {
  if (!data) return null

  const renderDriverDetails = (driver: any) => (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-400" />
            Market Impact Analysis
          </h3>
          <p className="text-white/80 leading-relaxed mb-4">
            {driver.detailedContext}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{driver.confidence}%</div>
              <div className="text-sm text-white/60">Confidence</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{driver.impact.toUpperCase()}</div>
              <div className="text-sm text-white/60">Impact Level</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{driver.timeframe}</div>
              <div className="text-sm text-white/60">Timeframe</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Data */}
      {driver.historicalData && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
              Historical Trend
            </h3>
            <div className="space-y-3">
              {driver.historicalData.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <span className="text-white/80">{item.period}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Insights */}
      {driver.actionableInsights && (
        <Card className="bg-emerald-500/10 backdrop-blur-xl border-emerald-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Actionable Insights
            </h3>
            <ul className="space-y-3">
              {driver.actionableInsights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-emerald-200/90 text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderSignalDetails = (signal: any) => (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-white/10 backdrop-blur-xl border-white/10">
        <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">Overview</TabsTrigger>
        <TabsTrigger value="technical" className="text-white data-[state=active]:bg-blue-600">Technical</TabsTrigger>
        <TabsTrigger value="fundamental" className="text-white data-[state=active]:bg-blue-600">Fundamental</TabsTrigger>
        <TabsTrigger value="strategy" className="text-white data-[state=active]:bg-blue-600">Strategy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  ${signal.price.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Current Price</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${signal.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {signal.changePercent >= 0 ? '+' : ''}{signal.changePercent.toFixed(2)}%
                </div>
                <div className="text-sm text-white/60">24h Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{signal.confidence}%</div>
                <div className="text-sm text-white/60">AI Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{signal.timeframe}</div>
                <div className="text-sm text-white/60">Timeframe</div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">AI Reasoning</h4>
              <p className="text-blue-200/90 text-sm leading-relaxed">{signal.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="technical" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Technical Analysis</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {signal.detailedAnalysis?.technicalAnalysis}
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-xl font-bold text-white mb-1">{signal.technicalScore}</div>
                <div className="text-sm text-white/60">Technical Score</div>
              </div>
              {signal.targetPrice && (
                <div className="text-center p-4 bg-emerald-500/20 rounded-xl">
                  <div className="text-xl font-bold text-emerald-400 mb-1">
                    ${signal.targetPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-300/80">Target Price</div>
                </div>
              )}
              {signal.stopLoss && (
                <div className="text-center p-4 bg-red-500/20 rounded-xl">
                  <div className="text-xl font-bold text-red-400 mb-1">
                    ${signal.stopLoss.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-300/80">Stop Loss</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="fundamental" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fundamental Analysis</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {signal.detailedAnalysis?.fundamentalAnalysis}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-xl font-bold text-white mb-1">{signal.fundamentalScore}</div>
                <div className="text-sm text-white/60">Fundamental Score</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-xl font-bold text-white mb-1">{signal.volume24h}</div>
                <div className="text-sm text-white/60">24h Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="strategy" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trading Strategy</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {signal.detailedAnalysis?.tradingStrategy}
            </p>
            
            {signal.riskReward && (
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2">Risk/Reward Analysis</h4>
                <div className="text-blue-200/90 text-sm">
                  Risk/Reward Ratio: {signal.riskReward}:1
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  const renderInsightDetails = (insight: any) => (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
          <p className="text-white/80 leading-relaxed mb-6">
            {insight.detailedAnalysis}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{insight.confidence}%</div>
              <div className="text-sm text-white/60">Confidence Level</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">{insight.timeframe}</div>
              <div className="text-sm text-white/60">Expected Timeframe</div>
            </div>
          </div>
          
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <h4 className="font-semibold text-purple-300 mb-2">Historical Context</h4>
            <p className="text-purple-200/90 text-sm leading-relaxed">
              {insight.historicalContext}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Market Implications */}
      {insight.marketImplications && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Market Implications</h3>
            <ul className="space-y-3">
              {insight.marketImplications.map((implication: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white/80 text-sm">{implication}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Trading Opportunities */}
      {insight.tradingOpportunities && (
        <Card className="bg-emerald-500/10 backdrop-blur-xl border-emerald-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4">Trading Opportunities</h3>
            <ul className="space-y-3">
              {insight.tradingOpportunities.map((opportunity: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-emerald-200/90 text-sm">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${data.data.bgGradient} border border-white/20`}>
                  <span className="text-2xl">{data.data.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{data.title}</h2>
                  {data.subtitle && (
                    <p className="text-white/70">{data.subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {data.confidence && (
                  <Badge variant="outline" className="text-white/70 border-white/20">
                    {data.confidence}% confidence
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {data.type === 'driver' && renderDriverDetails(data.data)}
              {data.type === 'signal' && renderSignalDetails(data.data)}
              {data.type === 'insight' && renderInsightDetails(data.data)}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}