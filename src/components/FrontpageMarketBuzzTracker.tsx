import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, TrendingDown, Users, Hash, Eye, RefreshCw, ExternalLink, X, Clock, Heart, MessageSquare, Repeat2 } from 'lucide-react'

interface SentimentData {
  platform: string
  symbol: string
  sentiment: number // -100 to +100
  volume: number
  trending: boolean
  keyMentions: string[]
  influencerScore: number
}

interface SocialMetrics {
  overall_sentiment: number
  fear_greed_index: number
  viral_coefficient: number
  institutional_mentions: number
  retail_mentions: number
  trending_topics: string[]
  sentiment_data: SentimentData[]
}

interface LiveComment {
  id: string
  platform: string
  author: string
  content: string
  timestamp: string
  likes: number
  retweets?: number
  replies?: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  symbol: string
}

interface LiveFeedModalProps {
  isOpen: boolean
  onClose: () => void
  platform: string
  symbol: string
}

function LiveFeedModal({ isOpen, onClose, platform, symbol }: LiveFeedModalProps) {
  const [comments, setComments] = useState<LiveComment[]>([])
  const [loading, setLoading] = useState(true)
  const [liveUpdateCount, setLiveUpdateCount] = useState(0)

  const generateLiveComments = (): LiveComment[] => {
    const timeVariation = Date.now() % 100000 / 100000
    const platforms = {
      'Crypto Twitter': {
        authors: ['@CryptoWhale', '@BitcoinMaxi', '@DeFiAlpha', '@CoinDesk', '@CryptoPunk', '@BlockchainBro'],
        templates: [
          `${symbol} looking strong here. Technical analysis shows bullish divergence on the 4H chart. Target: $${(Math.random() * 10000 + 100000).toFixed(0)}`,
          `Just loaded up on more ${symbol}. This dip is a gift. Diamond hands 💎🙌`,
          `${symbol} breaking out of ascending triangle. Volume confirming the move. This could run to $${(Math.random() * 5000 + 110000).toFixed(0)}`,
          `Institutional flow data shows massive ${symbol} accumulation. Smart money is positioning for the next leg up.`,
          `${symbol} correlation with traditional markets weakening. This is what we've been waiting for.`,
          `On-chain metrics for ${symbol} are screaming bullish. HODL strong through this volatility.`
        ]
      },
      'Reddit Investors': {
        authors: ['u/DiamondHands', 'u/ToTheMoon', 'u/YOLO_Trader', 'u/StockGuru', 'u/MarketMaker', 'u/BullRun2025'],
        templates: [
          `${symbol} to the moon! 🚀🚀🚀 Just YOLO'd my entire portfolio. This is the way!`,
          `DD: ${symbol} is severely undervalued. P/E ratio suggests 40% upside minimum. Loading up!`,
          `${symbol} short squeeze incoming? Options chain looking spicy 🌶️`,
          `Bought the ${symbol} dip with diamond hands. Paper hands will regret selling here.`,
          `${symbol} earnings beat expectations. This stock is going parabolic! 📈`,
          `Technical analysis on ${symbol}: RSI oversold, MACD bullish crossover. Easy money.`
        ]
      },
      'Financial Twitter': {
        authors: ['@WallStreetPro', '@QuantTrader', '@HedgeFundCIO', '@MarketAnalyst', '@TradingDesk', '@AlphaSeeker'],
        templates: [
          `${symbol} institutional flow analysis: $${(Math.random() * 500 + 200).toFixed(0)}M net buying over 5 days. Momentum building.`,
          `${symbol} options flow: Heavy call buying in Feb expiry. Gamma squeeze potential if we break $${(Math.random() * 1000 + 50000).toFixed(0)}.`,
          `Risk-adjusted returns on ${symbol} looking attractive here. Sharpe ratio improving with recent volatility compression.`,
          `${symbol} correlation breakdown with broader market creates alpha opportunity. Position sizing accordingly.`,
          `${symbol} technical setup: Clean breakout above 200MA with volume confirmation. Target $${(Math.random() * 5000 + 55000).toFixed(0)}.`,
          `Fundamental analysis on ${symbol}: Strong balance sheet, growing market share. Fair value $${(Math.random() * 2000 + 60000).toFixed(0)}.`
        ]
      },
      'Professional Networks': {
        authors: ['John Smith, CFA', 'Sarah Johnson, Portfolio Manager', 'Mike Chen, Analyst', 'Lisa Wang, CIO', 'David Brown, Strategist', 'Emma Davis, Research'],
        templates: [
          `${symbol} represents a compelling investment opportunity in the current macro environment. Our models suggest 15-20% upside.`,
          `Institutional perspective on ${symbol}: Quality management team, strong competitive moat, attractive valuation metrics.`,
          `${symbol} fits well in diversified portfolios as inflation hedge. Historical correlation with CPI at 0.73.`,
          `Risk management note on ${symbol}: Volatility has compressed to 12-month lows. Opportunity for position sizing increase.`,
          `${symbol} sector rotation play: Beneficiary of current monetary policy stance. Fed pivot could accelerate gains.`,
          `ESG considerations for ${symbol}: Strong sustainability metrics align with institutional mandates. Long-term hold.`
        ]
      }
    }

    const platformData = platforms[platform as keyof typeof platforms]
    if (!platformData) return []

    return Array.from({ length: 8 + Math.floor(timeVariation * 4) }, (_, i) => {
      const author = platformData.authors[Math.floor((timeVariation * 1000 + i * 100) % platformData.authors.length)]
      const template = platformData.templates[Math.floor((timeVariation * 1000 + i * 200) % platformData.templates.length)]
      const sentiment = Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish'
      
      return {
        id: `${platform}-${i}-${Date.now()}`,
        platform,
        author,
        content: template,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
        likes: Math.floor(Math.random() * 500 + 10),
        retweets: platform === 'Crypto Twitter' ? Math.floor(Math.random() * 200 + 5) : undefined,
        replies: Math.floor(Math.random() * 50 + 2),
        sentiment,
        symbol
      }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const refreshComments = () => {
    setLoading(true)
    setLiveUpdateCount(prev => prev + 1)
    setTimeout(() => {
      setComments(generateLiveComments())
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    if (isOpen) {
      refreshComments()
      
      // Update comments every 10 seconds for live feel
      const interval = setInterval(refreshComments, 10000)
      return () => clearInterval(interval)
    }
  }, [isOpen, platform, symbol])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200'
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {platform} - {symbol} Live Feed
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Updates: {liveUpdateCount}</span>
                </div>
                <span>{comments.length} recent mentions</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshComments}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="h-[600px] overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {comment.author.charAt(comment.author.includes('@') ? 1 : 0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{comment.author}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeAgo(comment.timestamp)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(comment.sentiment)}`}>
                            {comment.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1 hover:text-red-500 cursor-pointer transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{comment.likes}</span>
                    </div>
                    {comment.retweets && (
                      <div className="flex items-center space-x-1 hover:text-green-500 cursor-pointer transition-colors">
                        <Repeat2 className="h-4 w-4" />
                        <span>{comment.retweets}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>{comment.replies}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live feed updating every 10 seconds</span>
            </div>
            <div>
              Data from {platform} • {symbol} mentions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SocialSentimentTracker() {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [updateCount, setUpdateCount] = useState(0)
  const [selectedFeed, setSelectedFeed] = useState<{ platform: string; symbol: string } | null>(null)

  const generateSentimentData = (): SocialMetrics => {
    const timeMultiplier = selectedTimeframe === '1h' ? 0.3 : selectedTimeframe === '24h' ? 1 : 7
    const liveVariation = Math.sin(Date.now() / 30000) * 0.3 + 0.7 // 0.4-1.0 multiplier
    const trendingBoost = Math.cos(Date.now() / 45000) * 0.2 + 0.8 // 0.6-1.0 multiplier

    return {
      overall_sentiment: Math.floor((Math.random() * 40 + 30) * liveVariation), // Dynamic 30-70 range
      fear_greed_index: Math.floor((Math.random() * 30 + 45) * liveVariation), // Dynamic 45-75 range  
      viral_coefficient: (Math.random() * 2 + 1) * trendingBoost, // Dynamic 1-3 range
      institutional_mentions: Math.floor(Math.random() * 500 * timeMultiplier * liveVariation + 200),
      retail_mentions: Math.floor(Math.random() * 5000 * timeMultiplier * liveVariation + 2000),
      trending_topics: [
        '#Bitcoin', '#Ethereum', '#FedPolicy', '#Inflation', '#TechStocks', '#AI', '#DeFi', '#Web3'
      ],
      sentiment_data: [
        {
          platform: 'Crypto Twitter',
          symbol: 'BTC',
          sentiment: Math.floor((Math.random() * 40 + 40) * liveVariation), // Dynamic 40-80
          volume: Math.floor(Math.random() * 10000 * liveVariation + 5000),
          trending: Math.random() * trendingBoost > 0.3,
          keyMentions: ['@elonmusk', '@michael_saylor', '@cz_binance'],
          influencerScore: Math.floor((Math.random() * 30 + 70) * liveVariation)
        },
        {
          platform: 'Reddit Investors',
          symbol: 'SPY',
          sentiment: Math.floor((Math.random() * 60 + 20) * liveVariation), // Dynamic 20-80
          volume: Math.floor(Math.random() * 5000 * liveVariation + 2000),
          trending: Math.random() * trendingBoost > 0.4,
          keyMentions: ['diamond hands', 'to the moon', 'HODL'],
          influencerScore: Math.floor((Math.random() * 40 + 40) * liveVariation)
        },
        {
          platform: 'Financial Twitter',
          symbol: 'TSLA',
          sentiment: Math.floor((Math.random() * 50 + 25) * liveVariation), // Dynamic 25-75
          volume: Math.floor(Math.random() * 3000 * liveVariation + 1000),
          trending: Math.random() * trendingBoost > 0.5,
          keyMentions: ['earnings', 'delivery numbers', 'FSD'],
          influencerScore: Math.floor((Math.random() * 35 + 55) * liveVariation)
        },
        {
          platform: 'Professional Networks',
          symbol: 'GOLD',
          sentiment: Math.floor((Math.random() * 30 + 50) * liveVariation), // Dynamic 50-80
          volume: Math.floor(Math.random() * 1000 * liveVariation + 500),
          trending: Math.random() * trendingBoost > 0.6,
          keyMentions: ['inflation hedge', 'central banks', 'safe haven'],
          influencerScore: Math.floor((Math.random() * 25 + 65) * liveVariation)
        }
      ]
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    // Simulate API call delay (shorter for more responsive feel)
    await new Promise(resolve => setTimeout(resolve, 500))
    setMetrics(generateSentimentData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // LIVE UPDATES: Refresh every 15 seconds for continuous live feel
    const interval = setInterval(refreshData, 15 * 1000)
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-600 bg-green-50'
    if (sentiment >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 60) return <TrendingUp className="h-4 w-4" />
    if (sentiment >= 40) return <Eye className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const getFearGreedLabel = (score: number) => {
    if (score >= 75) return 'Extreme Greed'
    if (score >= 55) return 'Greed'
    if (score >= 45) return 'Neutral'
    if (score >= 25) return 'Fear'
    return 'Extreme Fear'
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          transition: { duration: 0.3 }
        }}
        className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.2)',
                  '0 0 30px rgba(168, 85, 247, 0.3)',
                  '0 0 20px rgba(168, 85, 247, 0.2)'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-lg"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Market Buzz Tracker
              </h3>
              <p className="text-gray-600 text-lg">
                Live updates: {updateCount} • Real-time social sentiment analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-50 backdrop-blur-xl px-4 py-2 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 text-sm font-medium">LIVE UPDATES</span>
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
            
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !metrics ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : metrics && (
          <>
            <div className="space-y-6">
              {/* Overall Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-50 backdrop-blur-xl rounded-xl p-4 text-center border border-gray-200 shadow-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metrics.overall_sentiment}
                  </div>
                  <div className="text-sm text-gray-600">Overall Sentiment</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    {metrics.overall_sentiment >= 60 ? 'Bullish' : 
                     metrics.overall_sentiment >= 40 ? 'Neutral' : 'Bearish'}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(168, 85, 247, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-50 backdrop-blur-xl rounded-xl p-4 text-center border border-gray-200 shadow-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metrics.fear_greed_index}
                  </div>
                  <div className="text-sm text-gray-600">Fear & Greed</div>
                  <div className="text-xs text-purple-600 mt-1 font-medium">
                    {getFearGreedLabel(metrics.fear_greed_index)}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-50 backdrop-blur-xl rounded-xl p-4 text-center border border-gray-200 shadow-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metrics.viral_coefficient.toFixed(1)}x
                  </div>
                  <div className="text-sm text-gray-600">Viral Coefficient</div>
                  <div className="text-xs text-emerald-600 mt-1 font-medium">
                    {metrics.viral_coefficient > 2 ? 'High' : 
                     metrics.viral_coefficient > 1.5 ? 'Medium' : 'Low'}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-50 backdrop-blur-xl rounded-xl p-4 text-center border border-gray-200 shadow-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(metrics.institutional_mentions / metrics.retail_mentions * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Institutional Ratio</div>
                  <div className="text-xs text-amber-600 mt-1 font-medium">vs Retail</div>
                </motion.div>
              </div>

              {/* Platform Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 text-lg">What Investors Are Saying</h4>
                <div className="space-y-3">
                  {metrics.sentiment_data.map((data, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 0 25px rgba(59, 130, 246, 0.2)",
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => setSelectedFeed({ platform: data.platform, symbol: data.symbol })}
                      className="flex items-center justify-between p-4 bg-gray-50 backdrop-blur-xl rounded-xl hover:bg-gray-100 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group shadow-lg"
                      style={{
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          data.sentiment >= 60 ? 'bg-green-100 border border-green-300' :
                          data.sentiment >= 40 ? 'bg-yellow-100 border border-yellow-300' :
                          'bg-red-100 border border-red-300'
                        }`}>
                          {getSentimentIcon(data.sentiment)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{data.platform}</div>
                          <div className="text-sm text-gray-600">{data.symbol} • {data.volume.toLocaleString()} discussions</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{data.sentiment}/100</div>
                          <div className="text-sm text-gray-600">
                            Investor Mood: {data.influencerScore}%
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 text-lg">What's Trending</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.trending_topics.map((topic, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                        transition: { duration: 0.2 }
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-all cursor-pointer border border-blue-300 backdrop-blur-sm shadow-lg"
                      style={{
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      {topic}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Live Updates Indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-2 text-sm text-gray-600 pt-6 border-t border-gray-200"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }}></div>
                <span className="text-gray-700">Live updates every 15 seconds • Update #{updateCount}</span>
              </motion.div>
              </div>
          </>
        )}
      </motion.div>
      
      {/* Live Feed Modal */}
      <LiveFeedModal
        isOpen={selectedFeed !== null}
        onClose={() => setSelectedFeed(null)}
        platform={selectedFeed?.platform || ''}
        symbol={selectedFeed?.symbol || ''}
      />
    </>
  )
}