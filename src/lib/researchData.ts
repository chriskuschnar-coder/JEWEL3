// Research Data - Professional Mock Data Generators
// Realistic market data for institutional-grade research dashboard

export interface MarketSentiment {
  id: string
  headline: string
  summary: string
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  keyMetric: {
    name: string
    value: number
    change: number
  }
  drivers: string[]
  opportunities: string[]
  chartData: number[]
  lastUpdated: string
}

export interface MarketDriver {
  id: string
  title: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  timeframe: string
  category: 'monetary' | 'geopolitical' | 'economic' | 'technological'
  icon: string
  color: string
  bgGradient: string
  detailedContext: string
  historicalData?: { period: string; value: number }[]
  actionableInsights?: string[]
}

export interface AssetSignal {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  signal: 'buy' | 'watch' | 'sell'
  confidence: number
  timeframe: string
  reasoning: string
  technicalScore: number
  fundamentalScore: number
  sentimentScore: number
  sparkline: number[]
  category: 'crypto' | 'stocks' | 'forex' | 'commodities'
  icon: string
  color: string
  targetPrice?: number
  stopLoss?: number
  riskReward?: number
  volume24h?: string
  detailedAnalysis?: {
    technicalAnalysis: string
    fundamentalAnalysis: string
    tradingStrategy: string
  }
}

export interface MacroInsight {
  id: string
  headline: string
  summary: string
  impact: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  timeframe: string
  keyPoints: string[]
  category: 'monetary' | 'geopolitical' | 'economic' | 'technological'
  detailedAnalysis?: string
  historicalContext?: string
  marketImplications?: string[]
  tradingOpportunities?: string[]
}

// Generate realistic market sentiment
export function generateMarketSentiment(): MarketSentiment {
  const timeVariation = Date.now() % 100000 / 100000
  const marketCycle = Math.sin(Date.now() / 60000) * 0.5 + 0.5
  
  const sentiments = [
    {
      id: 'crypto-momentum',
      headline: 'Crypto Momentum Accelerating',
      summary: `Bitcoin's institutional adoption continues with ${(85 + timeVariation * 10).toFixed(0)}% of major corporations now holding crypto reserves. Technical indicators align bullishly across multiple timeframes.`,
      direction: 'bullish' as const,
      confidence: Math.floor(82 + timeVariation * 15),
      keyMetric: {
        name: 'Institutional Flow',
        value: 2.4 + timeVariation * 0.8,
        change: 12.3 + timeVariation * 5
      },
      drivers: [
        'Bitcoin ETF inflows accelerating (+$1.2B this week)',
        'Ethereum staking yields attractive vs traditional assets',
        'Regulatory clarity improving in major markets',
        'On-chain metrics showing strong accumulation'
      ],
      opportunities: [
        'Position for continued institutional adoption',
        'Altcoin rotation as Bitcoin dominance stabilizes',
        'DeFi yield farming with improved risk/reward'
      ]
    },
    {
      id: 'market-consolidation',
      headline: 'Market Consolidation Phase',
      summary: `Markets entering healthy consolidation after recent gains. Mixed signals suggest patience while fundamentals remain strong across ${Math.floor(12 + timeVariation * 8)} key sectors.`,
      direction: 'neutral' as const,
      confidence: Math.floor(68 + timeVariation * 20),
      keyMetric: {
        name: 'Volatility Index',
        value: 18.2 + timeVariation * 3,
        change: -2.1 + timeVariation * 2
      },
      drivers: [
        'Range-bound trading in major indices',
        'Earnings season providing mixed results',
        'Federal Reserve policy uncertainty',
        'Geopolitical tensions creating caution'
      ],
      opportunities: [
        'Range trading strategies in consolidation',
        'Sector rotation opportunities emerging',
        'Volatility selling in low-vol environment'
      ]
    }
  ]
  
  const selectedSentiment = sentiments[Math.floor(timeVariation * sentiments.length)]
  
  // Generate chart data
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const trend = selectedSentiment.direction === 'bullish' ? 1 : selectedSentiment.direction === 'bearish' ? -1 : 0
    const base = 100
    const trendComponent = (i / 29) * trend * 15
    const noise = Math.sin(i * 0.4 + timeVariation * 5) * 8
    const momentum = Math.cos(i * 0.3) * 5
    return Math.max(80, Math.min(120, base + trendComponent + noise + momentum))
  })
  
  return {
    ...selectedSentiment,
    chartData,
    lastUpdated: new Date().toISOString()
  }
}

// Generate key market drivers
export function generateKeyDrivers(): MarketDriver[] {
  const timeVariation = Date.now() % 100000 / 100000
  
  return [
    {
      id: 'fed-policy',
      title: 'Federal Reserve Policy',
      insight: `${(75 + timeVariation * 20).toFixed(0)}% probability of policy shift in Q2`,
      impact: 'high',
      confidence: Math.floor(78 + timeVariation * 15),
      timeframe: '3-6 months',
      category: 'monetary',
      icon: '🏦',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-indigo-500/10',
      detailedContext: 'Federal Reserve policy decisions continue to be the primary driver of market sentiment and asset allocation decisions. Recent economic data suggests a potential shift in monetary policy stance.',
      historicalData: [
        { period: 'Q4 2024', value: 65 },
        { period: 'Q1 2025', value: 72 },
        { period: 'Current', value: 75 + timeVariation * 20 }
      ],
      actionableInsights: [
        'Position for potential rate environment changes',
        'Monitor Fed communications for policy signals',
        'Consider duration risk in fixed income allocations'
      ]
    },
    {
      id: 'crypto-adoption',
      title: 'Institutional Crypto Adoption',
      insight: `${Math.floor(12 + timeVariation * 8)} major corporations added crypto to treasury`,
      impact: 'high',
      confidence: Math.floor(85 + timeVariation * 10),
      timeframe: '6-12 months',
      category: 'technological',
      icon: '₿',
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/20 to-amber-500/10',
      detailedContext: 'Corporate treasury adoption of cryptocurrency continues to accelerate, driven by inflation hedging strategies and digital transformation initiatives.',
      historicalData: [
        { period: '2023', value: 8 },
        { period: '2024', value: 15 },
        { period: 'Current', value: 12 + timeVariation * 8 }
      ],
      actionableInsights: [
        'Increased institutional demand supports higher valuations',
        'Corporate adoption reduces regulatory risk',
        'Treasury diversification trend likely to continue'
      ]
    },
    {
      id: 'geopolitical-risk',
      title: 'Geopolitical Tensions',
      insight: `Risk-off sentiment affecting ${Math.floor(8 + timeVariation * 4)} major markets`,
      impact: 'medium',
      confidence: Math.floor(72 + timeVariation * 18),
      timeframe: '1-3 months',
      category: 'geopolitical',
      icon: '🌍',
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-rose-500/10',
      detailedContext: 'Ongoing geopolitical tensions continue to create periodic risk-off episodes, affecting global capital flows and asset correlations.',
      historicalData: [
        { period: 'Low Risk', value: 25 },
        { period: 'Moderate', value: 50 },
        { period: 'Current', value: 72 + timeVariation * 18 }
      ],
      actionableInsights: [
        'Maintain defensive positioning in uncertain periods',
        'Consider safe-haven assets during escalations',
        'Monitor correlation changes during stress events'
      ]
    },
    {
      id: 'ai-revolution',
      title: 'AI Technology Revolution',
      insight: `AI productivity gains driving ${(15 + timeVariation * 8).toFixed(1)}% sector outperformance`,
      impact: 'high',
      confidence: Math.floor(88 + timeVariation * 8),
      timeframe: '12-24 months',
      category: 'technological',
      icon: '🤖',
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-violet-500/10',
      detailedContext: 'Artificial intelligence adoption across industries is accelerating productivity gains and creating new investment opportunities in technology and adjacent sectors.',
      historicalData: [
        { period: '2023', value: 8 },
        { period: '2024', value: 18 },
        { period: 'Projected', value: 15 + timeVariation * 8 }
      ],
      actionableInsights: [
        'Technology sector leadership likely to continue',
        'AI infrastructure investments showing strong returns',
        'Productivity gains supporting margin expansion'
      ]
    },
    {
      id: 'inflation-dynamics',
      title: 'Inflation Dynamics',
      insight: `Core PCE trending toward ${(2.2 + timeVariation * 0.6).toFixed(1)}% target range`,
      impact: 'medium',
      confidence: Math.floor(76 + timeVariation * 16),
      timeframe: '6-9 months',
      category: 'economic',
      icon: '📊',
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/10',
      detailedContext: 'Inflation metrics continue to moderate toward Federal Reserve targets, supporting the case for potential monetary policy normalization.',
      historicalData: [
        { period: 'Peak (2022)', value: 7.1 },
        { period: '2024 Avg', value: 3.2 },
        { period: 'Current Trend', value: 2.2 + timeVariation * 0.6 }
      ],
      actionableInsights: [
        'Disinflationary trend supports risk asset valuations',
        'Real yields becoming more attractive',
        'Fed policy flexibility increasing with lower inflation'
      ]
    }
  ]
}

// Generate asset signals with AI reasoning
export function generateAssetSignals(): AssetSignal[] {
  const timeVariation = Date.now() % 100000 / 100000
  const marketCycle = Math.sin(Date.now() / 30000) * 0.5 + 0.5
  
  const baseAssets = [
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 106250, category: 'crypto', icon: '₿', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 3195, category: 'crypto', icon: 'Ξ', color: '#627EEA' },
    { symbol: 'SOL', name: 'Solana', basePrice: 245, category: 'crypto', icon: '◎', color: '#9945FF' },
    { symbol: 'TSLA', name: 'Tesla', basePrice: 248, category: 'stocks', icon: '🚗', color: '#CC0000' },
    { symbol: 'NVDA', name: 'NVIDIA', basePrice: 875, category: 'stocks', icon: '🔥', color: '#76B900' },
    { symbol: 'AAPL', name: 'Apple', basePrice: 185, category: 'stocks', icon: '🍎', color: '#007AFF' },
    { symbol: 'EUR/USD', name: 'Euro Dollar', basePrice: 1.0845, category: 'forex', icon: '💱', color: '#4A90E2' },
    { symbol: 'GLD', name: 'Gold ETF', basePrice: 2685, category: 'commodities', icon: '🥇', color: '#FFD700' }
  ]
  
  return baseAssets.map(asset => {
    const priceVariation = (Math.random() - 0.5) * 0.03
    const currentPrice = asset.basePrice * (1 + priceVariation)
    const change = asset.basePrice * priceVariation
    const changePercent = priceVariation * 100
    
    // Generate AI signal based on multiple factors
    const technicalScore = Math.floor(60 + marketCycle * 35)
    const fundamentalScore = Math.floor(65 + timeVariation * 30)
    const sentimentScore = Math.floor(55 + (Math.sin(Date.now() / 20000) * 0.5 + 0.5) * 40)
    
    const averageScore = (technicalScore + fundamentalScore + sentimentScore) / 3
    const signal: 'buy' | 'watch' | 'sell' = 
      averageScore > 70 ? 'buy' : 
      averageScore > 50 ? 'watch' : 'sell'
    
    const confidence = Math.floor(70 + timeVariation * 25)
    
    // Generate sparkline
    const sparkline = Array.from({ length: 24 }, (_, i) => {
      const trend = signal === 'buy' ? 1 : signal === 'sell' ? -1 : 0
      const base = 100
      const trendComponent = (i / 23) * trend * 12
      const noise = Math.sin(i * 0.4 + timeVariation * 5) * 8
      const momentum = Math.cos(i * 0.3) * 5
      return Math.max(75, Math.min(125, base + trendComponent + noise + momentum))
    })
    
    const reasonings = {
      buy: [
        'Strong momentum breakout with volume confirmation',
        'Oversold bounce with positive catalysts emerging',
        'Institutional accumulation pattern detected',
        'Technical bullish convergence across timeframes'
      ],
      sell: [
        'Overbought with bearish divergence patterns',
        'Technical breakdown below key support levels',
        'Risk-off sentiment affecting correlation structure',
        'Fundamental headwinds creating downside pressure'
      ],
      watch: [
        'Consolidation phase with mixed signals',
        'Range-bound trading awaiting catalyst',
        'Balanced indicators suggest patience',
        'Market regime uncertainty requires monitoring'
      ]
    }
    
    const reasoning = reasonings[signal][Math.floor(timeVariation * reasonings[signal].length)]
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      price: currentPrice,
      change,
      changePercent,
      signal,
      confidence,
      timeframe: signal === 'buy' ? '1-2 weeks' : signal === 'sell' ? '3-5 days' : '2-4 weeks',
      reasoning,
      technicalScore,
      fundamentalScore,
      sentimentScore,
      sparkline,
      category: asset.category as any,
      icon: asset.icon,
      color: asset.color,
      targetPrice: signal === 'buy' ? currentPrice * 1.15 : signal === 'sell' ? currentPrice * 0.85 : undefined,
      stopLoss: signal === 'buy' ? currentPrice * 0.92 : signal === 'sell' ? currentPrice * 1.08 : undefined,
      riskReward: signal === 'buy' ? 3.2 : signal === 'sell' ? 2.8 : undefined,
      volume24h: `$${(Math.random() * 50 + 10).toFixed(1)}B`,
      detailedAnalysis: {
        technicalAnalysis: `Technical indicators show ${signal === 'buy' ? 'bullish' : signal === 'sell' ? 'bearish' : 'mixed'} signals with RSI at ${technicalScore}, MACD showing ${signal === 'buy' ? 'positive' : signal === 'sell' ? 'negative' : 'neutral'} momentum, and price action ${signal === 'buy' ? 'above' : signal === 'sell' ? 'below' : 'near'} key moving averages.`,
        fundamentalAnalysis: `Fundamental metrics indicate ${fundamentalScore > 70 ? 'strong' : fundamentalScore > 50 ? 'moderate' : 'weak'} underlying value with improving ${asset.category === 'crypto' ? 'on-chain metrics' : asset.category === 'stocks' ? 'earnings quality' : 'economic indicators'} and ${fundamentalScore > 65 ? 'positive' : 'mixed'} forward guidance.`,
        tradingStrategy: `Recommended approach: ${signal === 'buy' ? 'Accumulate on dips with 3-5% position sizing' : signal === 'sell' ? 'Reduce exposure or hedge with protective puts' : 'Monitor for breakout signals before committing capital'}. Risk management essential with ${confidence}% confidence level.`
      }
    }
  })
}

// Generate macro insights
export function generateMacroInsights(): MacroInsight[] {
  const timeVariation = Date.now() % 100000 / 100000
  
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
      category: 'monetary',
      detailedAnalysis: 'The Federal Reserve appears to be approaching a policy inflection point as inflation continues to moderate while employment metrics suggest a cooling but still-healthy labor market. This combination creates conditions for potential monetary policy easing.',
      historicalContext: 'Historical analysis shows that Fed policy pivots typically occur 6-9 months after peak hawkishness, with current indicators suggesting we may be approaching this transition period.',
      marketImplications: [
        'Lower rates typically support higher equity valuations',
        'Growth stocks often outperform during easing cycles',
        'Credit spreads tend to compress with easier policy',
        'Dollar weakness possible with dovish pivot'
      ],
      tradingOpportunities: [
        'Position in rate-sensitive sectors before pivot',
        'Consider long-duration bonds for capital appreciation',
        'Growth stock rotation may accelerate',
        'Emerging markets could benefit from dollar weakness'
      ]
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
        'Expected to boost global commodity demand by 15-20%',
        'Manufacturing PMI already showing improvement'
      ],
      category: 'economic',
      detailedAnalysis: 'China\'s comprehensive economic stimulus package represents a significant shift toward growth-oriented policies, with particular emphasis on infrastructure and technology sectors that could drive global commodity demand.',
      historicalContext: 'Previous Chinese stimulus packages have historically led to 12-18 month commodity super-cycles, with base metals and energy seeing the largest impacts.',
      marketImplications: [
        'Commodity prices likely to see sustained upward pressure',
        'Global growth expectations may need to be revised higher',
        'Emerging market currencies could strengthen',
        'Inflation expectations may tick higher globally'
      ],
      tradingOpportunities: [
        'Position in commodity-exposed equities and ETFs',
        'Consider emerging market exposure',
        'Infrastructure and materials sectors attractive',
        'Monitor inflation-protected securities'
      ]
    }
  ]
}

// Export all generators for easy access
export const researchDataGenerators = {
  generateMarketSentiment,
  generateKeyDrivers,
  generateAssetSignals,
  generateMacroInsights
}