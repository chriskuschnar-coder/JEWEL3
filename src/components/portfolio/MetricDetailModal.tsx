import React from 'react'
import { X, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Calendar, DollarSign } from 'lucide-react'

interface MetricDetail {
  name: string
  value: string
  description: string
  calculation: string
  interpretation: string
  benchmark?: string
  percentile?: number
  trend: 'up' | 'down' | 'stable'
  historicalData?: { period: string; value: number }[]
  relatedMetrics?: { name: string; value: string; correlation: number }[]
  actionableInsights?: string[]
}

interface MetricDetailModalProps {
  metric: MetricDetail | null
  isOpen: boolean
  onClose: () => void
}

export function MetricDetailModal({ metric, isOpen, onClose }: MetricDetailModalProps) {
  if (!isOpen || !metric) return null

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'down': return <TrendingDown className="h-5 w-5 text-red-600" />
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600 bg-green-50'
    if (percentile >= 75) return 'text-blue-600 bg-blue-50'
    if (percentile >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{metric.name}</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="font-mono text-lg font-bold text-navy-900">{metric.value}</span>
                {metric.percentile && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentileColor(metric.percentile)}`}>
                    {metric.percentile}th Percentile
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                What This Metric Means
              </h3>
              <p className="text-gray-700 leading-relaxed">{metric.description}</p>
            </div>

            {/* Calculation */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                How It's Calculated
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <code className="text-sm text-gray-800 font-mono">{metric.calculation}</code>
              </div>
            </div>

            {/* Interpretation */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Interpretation
              </h3>
              <p className="text-gray-700 leading-relaxed">{metric.interpretation}</p>
            </div>

            {/* Benchmark Comparison */}
            {metric.benchmark && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Your Portfolio</div>
                  <div className="text-2xl font-bold text-blue-900">{metric.value}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Market Benchmark</div>
                  <div className="text-2xl font-bold text-gray-900">{metric.benchmark}</div>
                </div>
              </div>
            )}

            {/* Historical Data */}
            {metric.historicalData && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Historical Trend
                </h3>
                <div className="space-y-2">
                  {metric.historicalData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{data.period}</span>
                      <span className={`font-bold ${data.value > 0 ? 'text-green-600' : data.value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {data.value > 0 ? '+' : ''}{data.value.toFixed(2)}
                        {metric.name.includes('%') || metric.name.includes('Ratio') ? '' : '%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Metrics */}
            {metric.relatedMetrics && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-gold-600" />
                  Related Metrics
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {metric.relatedMetrics.map((related, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{related.name}</span>
                        <span className="text-sm font-bold text-gray-900">{related.value}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Correlation: {related.correlation > 0 ? '+' : ''}{related.correlation.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Insights */}
            {metric.actionableInsights && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-navy-600" />
                  Actionable Insights
                </h3>
                <ul className="space-y-2">
                  {metric.actionableInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-navy-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}