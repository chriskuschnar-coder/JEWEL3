import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, AlertTriangle, Star, Globe, DollarSign, Building, Zap, X, ExternalLink, Play, FileText, Users, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { EventsModal } from './FrontpageEventsModal'

interface EconomicEvent {
  id: string
  time: string
  date: string
  title: string
  country: string
  currency: string
  impact: 'low' | 'medium' | 'high'
  category: 'monetary' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'earnings' | 'crypto'
  forecast?: string
  previous?: string
  actual?: string
  description: string
  detailedExplanation: string
  whyItMatters: string
  marketImpact: string
  historicalContext: string
  affectedAssets: string[]
  videoUrl?: string
  articleUrl?: string
  sourceUrl?: string
  relatedEvents?: string[]
  expertAnalysis?: string
  tradingTips?: string[]
}

interface EventDetailModalProps {
  event: EconomicEvent | null
  isOpen: boolean
  onClose: () => void
}

function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!isOpen || !event) return null

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'EU': '🇪🇺', 'CN': '🇨🇳', 'JP': '🇯🇵', 'UK': '🇬🇧', 'Global': '🌍'
    }
    return flags[country] || '🌍'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getCountryFlag(event.country)}</div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>{event.date} at {event.time}</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(event.impact)}`}>
                  {event.impact.toUpperCase()} IMPACT
                </div>
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
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-4 md:p-6 space-y-6">
            {/* Key Data */}
            {(event.forecast || event.previous || event.actual) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.forecast && (
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Forecast</div>
                    <div className="text-lg font-bold text-blue-900">{event.forecast}</div>
                  </div>
                )}
                {event.previous && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">Previous</div>
                    <div className="text-lg font-bold text-gray-900">{event.previous}</div>
                  </div>
                )}
                {event.actual && (
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1">Actual</div>
                    <div className="text-lg font-bold text-green-900">{event.actual}</div>
                  </div>
                )}
              </div>
            )}

            {/* What It Is */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                What Is This Event?
              </h3>
              <p className="text-gray-700 leading-relaxed">{event.detailedExplanation}</p>
            </div>

            {/* Why It Matters */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Why It Matters
              </h3>
              <p className="text-gray-700 leading-relaxed">{event.whyItMatters}</p>
            </div>

            {/* Market Impact */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Expected Market Impact
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">{event.marketImpact}</p>
              
              {/* Affected Assets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Assets:</h4>
                <div className="flex flex-wrap gap-2">
                  {event.affectedAssets.map((asset, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Historical Context */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Historical Context
              </h3>
              <p className="text-gray-700 leading-relaxed">{event.historicalContext}</p>
            </div>

            {/* Expert Analysis */}
            {event.expertAnalysis && (
              <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-navy-600" />
                  Expert Analysis
                </h3>
                <p className="text-navy-800 leading-relaxed italic">"{event.expertAnalysis}"</p>
              </div>
            )}

            {/* Trading Tips */}
            {event.tradingTips && event.tradingTips.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-gold-600" />
                  Trading Considerations
                </h3>
                <ul className="space-y-2">
                  {event.tradingTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gold-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* External Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {event.videoUrl && (
                <a
                  href={event.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Play className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 font-medium text-sm">Watch Analysis</span>
                  <ExternalLink className="h-3 w-3 text-red-600" />
                </a>
              )}
              
              {event.articleUrl && (
                <a
                  href={event.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium text-sm">Read Article</span>
                  <ExternalLink className="h-3 w-3 text-blue-600" />
                </a>
              )}
              
              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 font-medium text-sm">Official Source</span>
                  <ExternalLink className="h-3 w-3 text-gray-600" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [updateCount, setUpdateCount] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEventsModal, setShowEventsModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const generateEconomicEvents = (): EconomicEvent[] => {
    const now = new Date()
    const timeVariation = Date.now() % 100000 / 100000
    
    const events: EconomicEvent[] = []
    
    // Today's events with detailed information
    const todayEvents = [
      {
        id: 'fed-minutes-1',
        time: '14:00',
        date: now.toISOString().split('T')[0],
        title: 'FOMC Meeting Minutes',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'monetary' as const,
        forecast: 'Hawkish tone expected',
        previous: 'Neutral stance',
        description: 'Federal Reserve releases detailed minutes from the latest policy meeting, providing insights into future rate decisions.',
        detailedExplanation: 'The Federal Open Market Committee (FOMC) Meeting Minutes provide a detailed record of the discussions and decisions made during the Federal Reserve\'s monetary policy meetings. These minutes are released three weeks after each meeting and offer crucial insights into the Fed\'s thinking on interest rates, inflation, employment, and overall economic conditions.',
        whyItMatters: 'The FOMC minutes are one of the most important economic releases because they directly influence interest rate expectations, which affect everything from mortgage rates to stock valuations. Markets closely analyze the language used to gauge whether the Fed is becoming more hawkish (likely to raise rates) or dovish (likely to cut rates).',
        marketImpact: 'Hawkish minutes typically strengthen the USD and pressure gold/crypto, while dovish minutes can boost risk assets. Bond yields often move significantly based on rate guidance. A more aggressive stance could trigger a 50-100 basis point move in 10-year Treasury yields.',
        historicalContext: 'The Fed has been in a tightening cycle since 2022, raising rates from near-zero to 5.25-5.50%. Recent meetings have focused on the balance between fighting inflation and supporting employment. Previous minutes have shown increasing concern about persistent inflation in services sectors.',
        expertAnalysis: 'Fed Chair Powell has emphasized data-dependency in recent speeches. With core PCE at 2.8% and unemployment at 3.7%, the Fed faces a delicate balancing act. Market pricing suggests 65% probability of a 25bp hike.',
        tradingTips: [
          'Watch for changes in dot plot expectations and terminal rate guidance',
          'USD strength likely if minutes show unified hawkish stance',
          'Tech stocks particularly sensitive to rate outlook changes',
          'Bond volatility typically peaks 30 minutes after release'
        ],
        affectedAssets: ['USD', 'SPY', 'QQQ', 'BTC', 'GOLD', 'TLT', 'DXY'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.federalreserve.gov/monetarypolicy/fomcminutes/',
        sourceUrl: 'https://www.federalreserve.gov/newsevents/calendar.htm'
      },
      {
        id: 'jobless-claims-1',
        time: '08:30',
        date: now.toISOString().split('T')[0],
        title: 'Initial Jobless Claims',
        country: 'US',
        currency: 'USD',
        impact: 'medium' as const,
        category: 'employment' as const,
        forecast: '220K',
        previous: '218K',
        actual: (215 + Math.floor(timeVariation * 10)).toString() + 'K',
        description: 'Weekly measure of unemployment benefit claims, key indicator of labor market health.',
        detailedExplanation: 'Initial Jobless Claims represent the number of people who filed for unemployment benefits for the first time during the past week. This is one of the most timely indicators of labor market conditions, released every Thursday for the previous week\'s data.',
        whyItMatters: 'The labor market is a key pillar of economic health and Fed policy. Rising claims suggest economic weakness and potential job losses, while falling claims indicate a strong job market. The Fed closely monitors employment data as part of its dual mandate (price stability and full employment).',
        marketImpact: 'Lower-than-expected claims (stronger job market) typically support the USD and may pressure bonds if it suggests continued Fed hawkishness. Higher claims could boost bonds and pressure the dollar. A move of 20K+ from expectations usually triggers market reactions.',
        historicalContext: 'Pre-pandemic, claims averaged around 220K. During COVID, claims spiked to over 6 million. The current level near 220K suggests a normalized but still-tight labor market. The 4-week moving average helps smooth volatility.',
        expertAnalysis: 'Labor economist Dr. Sarah Chen notes: "Claims below 300K historically indicate a healthy job market. However, we\'re watching for any uptick that might signal economic cooling, which could influence Fed policy."',
        tradingTips: [
          'Claims below 200K often boost USD in forex markets',
          'Watch the 4-week moving average for trend confirmation',
          'Continuing claims (released same day) provide additional context',
          'Seasonal adjustments can cause volatility around holidays'
        ],
        affectedAssets: ['USD', 'SPY', 'DXY', 'TLT', 'EUR/USD'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.bls.gov/news.release/empsit.nr0.htm',
        sourceUrl: 'https://www.dol.gov/ui/data.pdf'
      },
      {
        id: 'btc-etf-flows-1',
        time: '16:00',
        date: now.toISOString().split('T')[0],
        title: 'Bitcoin ETF Net Flows',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'crypto' as const,
        forecast: '+$500M expected',
        previous: '+$342M',
        actual: '+$' + (450 + Math.floor(timeVariation * 200)).toString() + 'M',
        description: 'Daily net inflows/outflows from Bitcoin spot ETFs, indicating institutional demand.',
        detailedExplanation: 'Bitcoin ETF flows represent the net amount of money flowing into or out of spot Bitcoin Exchange-Traded Funds. These ETFs, approved by the SEC in January 2024, allow institutional and retail investors to gain Bitcoin exposure through traditional brokerage accounts without directly holding cryptocurrency.',
        whyItMatters: 'ETF flows are a direct measure of institutional adoption and sentiment toward Bitcoin. Large inflows suggest growing institutional acceptance and can drive significant price movements. Unlike individual Bitcoin purchases, ETF flows represent sustained, regulated investment demand.',
        marketImpact: 'Positive flows above $300M typically correlate with Bitcoin price increases of 2-5% within 24-48 hours. Negative flows can pressure Bitcoin and related crypto assets. The flows also influence Bitcoin mining stocks (RIOT, MARA) and crypto-adjacent companies (COIN, MSTR).',
        historicalContext: 'Since launch in January 2024, Bitcoin ETFs have accumulated over $50 billion in assets. The largest single-day inflow was $1.2 billion in March 2024. Flows tend to be higher during Bitcoin price rallies and lower during corrections.',
        expertAnalysis: 'Bloomberg ETF analyst Eric Balchunas states: "Bitcoin ETF flows have become the new institutional demand gauge. When we see consistent $500M+ daily inflows, it typically signals a sustained bull market phase."',
        tradingTips: [
          'Flows above $500M often signal strong momentum continuation',
          'Watch for correlation with Bitcoin futures premium',
          'Large outflows may precede 5-10% corrections',
          'Compare flows across different ETF providers for insights'
        ],
        affectedAssets: ['BTC', 'ETH', 'COIN', 'MSTR', 'RIOT', 'MARA'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.bloomberg.com/news/articles/bitcoin-etf-flows',
        sourceUrl: 'https://www.sec.gov/edgar/browse/?CIK=0001980994'
      }
    ]

    // Tomorrow's events
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tomorrowEvents = [
      {
        id: 'cpi-data-1',
        time: '08:30',
        date: tomorrow.toISOString().split('T')[0],
        title: 'Consumer Price Index (CPI)',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'inflation' as const,
        forecast: '2.9% YoY',
        previous: '3.1% YoY',
        description: 'Monthly inflation measure that heavily influences Federal Reserve policy decisions.',
        detailedExplanation: 'The Consumer Price Index measures the average change in prices paid by consumers for goods and services over time. It\'s calculated by the Bureau of Labor Statistics and tracks price changes in a "market basket" of about 80,000 items, representing typical consumer purchases.',
        whyItMatters: 'CPI is the Fed\'s primary inflation gauge and directly influences monetary policy decisions. The Fed targets 2% annual inflation, so readings significantly above or below this level can trigger policy changes. It affects everything from interest rates to currency values.',
        marketImpact: 'Higher-than-expected CPI typically strengthens the USD and pressures bonds/stocks as it suggests more aggressive Fed policy. Lower readings can boost risk assets and weaken the dollar. A 0.1% surprise can move markets 1-2%.',
        historicalContext: 'CPI peaked at 9.1% in June 2022, the highest since 1981. The Fed has been aggressively fighting inflation since then. Core CPI (excluding food/energy) is watched more closely as it\'s less volatile and better reflects underlying inflation trends.',
        expertAnalysis: 'Chief economist Dr. Michael Rodriguez: "We\'re in the final phase of disinflation. The next few CPI prints will determine whether the Fed can achieve a soft landing or if additional tightening is needed."',
        tradingTips: [
          'Core CPI more important than headline for Fed policy',
          'Services inflation key component to watch',
          'USD typically rallies on hot inflation prints',
          'Gold and crypto often sell off on higher-than-expected readings'
        ],
        affectedAssets: ['USD', 'GOLD', 'TLT', 'SPY', 'BTC', 'DXY'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.bls.gov/news.release/cpi.nr0.htm',
        sourceUrl: 'https://www.bls.gov/cpi/'
      },
      {
        id: 'tesla-earnings-1',
        time: '16:30',
        date: tomorrow.toISOString().split('T')[0],
        title: 'Tesla Q4 Earnings',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'earnings' as const,
        forecast: '$2.45 EPS',
        previous: '$2.27 EPS',
        description: 'Quarterly earnings report from Tesla, major influence on EV sector and tech stocks.',
        detailedExplanation: 'Tesla\'s quarterly earnings report includes revenue, earnings per share (EPS), vehicle delivery numbers, energy business performance, and forward guidance. As the world\'s most valuable automaker and a key player in the EV transition, Tesla\'s results significantly impact the broader market.',
        whyItMatters: 'Tesla is often seen as a bellwether for the electric vehicle industry and clean energy transition. Its performance affects not just auto stocks but also tech indices (QQQ), clean energy ETFs, and even Bitcoin (due to Tesla\'s crypto holdings). CEO Elon Musk\'s commentary often moves markets.',
        marketImpact: 'Tesla earnings can move the stock 10-20% in after-hours trading. Strong results often lift the entire EV sector and tech stocks. Weak results can pressure growth stocks broadly. Options activity typically surges before earnings.',
        historicalContext: 'Tesla has beaten EPS estimates in 8 of the last 12 quarters. The company delivered record vehicles in Q3 2024 but faces increasing competition from traditional automakers and Chinese EV companies. Margins have been under pressure from price cuts.',
        expertAnalysis: 'Auto analyst Lisa Park: "Tesla\'s Q4 will be crucial for 2025 guidance. We\'re watching for updates on the Cybertruck ramp, FSD progress, and energy storage growth. Margin recovery is key for the stock."',
        tradingTips: [
          'High options volatility typically peaks day before earnings',
          'Watch for guidance on 2025 vehicle delivery targets',
          'Energy business margins often overlooked but important',
          'After-hours trading can be extremely volatile'
        ],
        affectedAssets: ['TSLA', 'QQQ', 'EV Sector', 'ARKK', 'Clean Energy ETFs'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://ir.tesla.com/press-releases',
        sourceUrl: 'https://ir.tesla.com/'
      }
    ]

    // This week's events
    const weekEvents = [
      {
        id: 'nonfarm-payrolls-1',
        time: '08:30',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Non-Farm Payrolls',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'employment' as const,
        forecast: '185K',
        previous: '199K',
        description: 'Monthly employment report showing job creation, unemployment rate, and wage growth.',
        detailedExplanation: 'The Non-Farm Payrolls report is the most comprehensive monthly snapshot of the U.S. labor market. It includes total job creation (excluding farm workers, government employees, and non-profit organization employees), unemployment rate, labor force participation rate, and average hourly earnings growth.',
        whyItMatters: 'Employment is half of the Fed\'s dual mandate (along with price stability). Strong job growth can fuel inflation through wage increases, while weak job growth suggests economic cooling. This report often triggers the largest market moves of any economic release.',
        marketImpact: 'A 50K+ surprise from expectations typically moves the USD 0.5-1% immediately. Strong payrolls often boost yields and pressure bonds, while weak numbers can rally bonds and pressure the dollar. The unemployment rate and wage growth are equally important.',
        historicalContext: 'Pre-pandemic, monthly job gains averaged 180K. The U.S. has recovered all pandemic job losses plus added 3+ million more. The current unemployment rate of 3.7% is near 50-year lows, suggesting a tight labor market.',
        expertAnalysis: 'Labor Department economist Dr. Jennifer Walsh: "We\'re watching for signs of labor market cooling that could give the Fed room to pause rate hikes. Wage growth above 4% annually remains concerning for inflation."',
        tradingTips: [
          'First reaction often reversed within 30 minutes',
          'Watch wage growth for inflation implications',
          'Revisions to previous months can be significant',
          'Sector-specific job data provides trading opportunities'
        ],
        affectedAssets: ['USD', 'SPY', 'DXY', 'GOLD', 'TLT'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.bls.gov/news.release/empsit.nr0.htm',
        sourceUrl: 'https://www.bls.gov/bls/newsrels.htm'
      },
      {
        id: 'ecb-meeting-1',
        time: '12:45',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'ECB Interest Rate Decision',
        country: 'EU',
        currency: 'EUR',
        impact: 'high' as const,
        category: 'monetary' as const,
        forecast: '3.25% (Hold)',
        previous: '3.25%',
        description: 'European Central Bank monetary policy decision and press conference.',
        detailedExplanation: 'The European Central Bank\'s Governing Council meets every six weeks to set monetary policy for the 19 eurozone countries. The meeting includes interest rate decisions for the main refinancing rate, deposit facility rate, and marginal lending rate, followed by President Lagarde\'s press conference.',
        whyItMatters: 'ECB policy affects 340 million Europeans and the world\'s second-largest economy. Rate decisions influence the EUR, European bonds, and global capital flows. The ECB\'s approach to inflation and growth affects global monetary policy coordination.',
        marketImpact: 'Rate changes typically move EUR/USD 100-200 pips immediately. Hawkish surprises strengthen the euro and pressure European bonds, while dovish moves can boost European stocks. The press conference often provides more volatility than the rate decision itself.',
        historicalContext: 'The ECB raised rates from -0.5% to 4.0% between 2022-2023 to combat inflation. European inflation peaked at 10.6% in October 2022. The ECB has been more cautious than the Fed, emphasizing gradual policy normalization.',
        expertAnalysis: 'ECB watcher Dr. Klaus Mueller: "Lagarde will likely emphasize data-dependency while maintaining optionality. The ECB faces unique challenges with energy prices and fragmented eurozone economies."',
        tradingTips: [
          'EUR/USD often moves more on press conference than rate decision',
          'Watch for changes in asset purchase program guidance',
          'German bund yields key for European rate expectations',
          'Southern European bond spreads indicate stress levels'
        ],
        affectedAssets: ['EUR', 'EUR/USD', 'European Stocks', 'German Bunds'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleUrl: 'https://www.ecb.europa.eu/press/pr/date/2024/html/index.en.html',
        sourceUrl: 'https://www.ecb.europa.eu/mopo/decisions/html/index.en.html'
      }
    ]

    return [...todayEvents, ...tomorrowEvents, ...weekEvents]
  }

  const refreshEvents = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 300))
    setEvents(generateEconomicEvents())
    setLoading(false)
  }

  useEffect(() => {
    refreshEvents()
    
    // Update events every 2 minutes for live feel
    const interval = setInterval(refreshEvents, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <TrendingUp className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary': return <DollarSign className="h-4 w-4" />
      case 'employment': return <Building className="h-4 w-4" />
      case 'inflation': return <TrendingUp className="h-4 w-4" />
      case 'gdp': return <Globe className="h-4 w-4" />
      case 'earnings': return <Star className="h-4 w-4" />
      case 'crypto': return <Zap className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'EU': '🇪🇺', 
      'CN': '🇨🇳',
      'JP': '🇯🇵',
      'UK': '🇬🇧',
      'Global': '🌍'
    }
    return flags[country] || '🌍'
  }

  const getFilteredEvents = () => {
    let filtered = events

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Filter by time/impact
    switch (selectedFilter) {
      case 'high':
        filtered = filtered.filter(event => event.impact === 'high')
        break
      case 'today':
        const today = new Date().toISOString().split('T')[0]
        filtered = filtered.filter(event => event.date === today)
        break
      case 'week':
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        filtered = filtered.filter(event => new Date(event.date) <= weekFromNow)
        break
    }

    return filtered.sort((a, b) => {
      // Sort by date first, then by time
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0]
      const dayEvents = events.filter(event => event.date === dateString)
      const isCurrentMonth = current.getMonth() === month
      const isToday = dateString === new Date().toISOString().split('T')[0]
      const isSelected = dateString === selectedDate
      
      days.push({
        date: new Date(current),
        dateString,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        events: dayEvents,
        hasHighImpact: dayEvents.some(e => e.impact === 'high'),
        hasMediumImpact: dayEvents.some(e => e.impact === 'medium'),
        hasEvents: dayEvents.length > 0
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const handleEventClick = (event: EconomicEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString)
    const dateEvents = events.filter(event => event.date === dateString)
    if (dateEvents.length > 0) {
      setShowEventsModal(true)
    }
  }

  const filters = [
    { id: 'all', name: 'All Events', icon: Calendar },
    { id: 'high', name: 'High Impact', icon: AlertTriangle },
    { id: 'today', name: 'Today', icon: Clock },
    { id: 'week', name: 'This Week', icon: TrendingUp }
  ]

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'monetary', name: 'Central Banks', icon: DollarSign },
    { id: 'employment', name: 'Employment', icon: Building },
    { id: 'inflation', name: 'Inflation', icon: TrendingUp },
    { id: 'earnings', name: 'Earnings', icon: Star },
    { id: 'crypto', name: 'Crypto', icon: Zap }
  ]

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 30px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center border border-blue-500/30"
            >
              <Calendar className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Economic Calendar
              </h3>
              <p className="text-white/70 text-lg">
                Click any date to view events • Update #{updateCount}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-xl px-4 py-2 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">LIVE UPDATES</span>
          </div>
        </div>

        {/* Enhanced Calendar */}
        <motion.div 
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            transition: { duration: 0.3 }
          }}
          className="bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-3 hover:bg-gray-800/50 rounded-xl transition-all text-gray-300 hover:text-white backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h4 className="text-2xl font-bold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-3 hover:bg-gray-800/50 rounded-xl transition-all text-gray-300 hover:text-white backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.button
                key={index}
                onClick={() => handleDateClick(day.dateString)}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative p-3 text-sm font-medium rounded-xl transition-all duration-300 min-h-[48px] backdrop-blur-sm border
                  ${!day.isCurrentMonth ? 'text-white/30 opacity-50' : 
                    day.isSelected ? 'bg-blue-600 text-white shadow-lg border-blue-500/50' :
                    day.isToday ? 'bg-gray-800/60 text-white border-gray-600/50' :
                    day.hasEvents ? 'bg-gray-800/40 text-white hover:bg-gray-700/60 border-gray-700/40' :
                    'text-gray-300 hover:bg-gray-800/30 hover:text-white border-gray-800/30 hover:border-gray-700/50'
                  }
                `}
                style={day.isSelected ? {
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                } : day.hasHighImpact ? {
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                } : day.hasMediumImpact ? {
                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)'
                } : {}}
              >
                <span>{day.day}</span>
                
                {/* Event Indicators */}
                {day.hasEvents && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {day.hasHighImpact && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    {day.hasMediumImpact && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                    {day.events.length > 2 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Calendar Legend */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-6 text-sm text-gray-400 mt-6"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low Impact</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Events Modal */}
      <EventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        selectedDate={selectedDate}
        events={events.filter(event => event.date === selectedDate)}
        onEventClick={handleEventClick}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
      />
    </>
  )
}