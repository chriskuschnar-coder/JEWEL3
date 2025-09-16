import React, { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp, AlertTriangle, DollarSign, Building, Zap, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface EconomicEvent {
  id: string
  time: string
  title: string
  country: string
  impact: 'low' | 'medium' | 'high'
  category: 'monetary' | 'employment' | 'inflation' | 'crypto'
  forecast?: string
  previous?: string
  actual?: string
  description: string
  affectedAssets: string[]
  date: string
}

interface CalendarDay {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: EconomicEvent[]
  hasHighImpact: boolean
  hasMediumImpact: boolean
  hasEvents: boolean
}

export default function TerminalDashboard() {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [updateCount, setUpdateCount] = useState(0)

  const generateEventsForDate = (dateString: string): EconomicEvent[] => {
    const timeVariation = Date.now() % 100000 / 100000
    const today = new Date().toISOString().split('T')[0]
    
    // Generate events for today and next few days
    const eventsByDate: { [key: string]: EconomicEvent[] } = {}
    
    // Today's events
    eventsByDate[today] = [
      {
        id: 'fomc-minutes',
        time: '14:00',
        title: 'FOMC Meeting Minutes',
        country: 'US',
        impact: 'high',
        category: 'monetary',
        forecast: 'Hawkish tone expected',
        previous: 'Neutral stance',
        actual: undefined,
        description: 'Federal Reserve releases detailed minutes from the latest policy meeting, providing insights into future rate decisions.',
        affectedAssets: ['USD', 'SPY', 'QQQ', 'BTC', '+3'],
        date: today
      },
      {
        id: 'jobless-claims',
        time: '08:30',
        title: 'Initial Jobless Claims',
        country: 'US',
        impact: 'medium',
        category: 'employment',
        forecast: '220K',
        previous: '218K',
        actual: (215 + Math.floor(timeVariation * 10)).toString() + 'K',
        description: 'Weekly measure of unemployment benefit claims, key indicator of labor market health.',
        affectedAssets: ['USD', 'SPY', 'DXY', 'TLT', '+1'],
        date: today
      },
      {
        id: 'btc-etf-flows',
        time: '16:00',
        title: 'Bitcoin ETF Net Flows',
        country: 'US',
        impact: 'high',
        category: 'crypto',
        forecast: '+$500M expected',
        previous: '+$342M',
        actual: '+$' + (450 + Math.floor(timeVariation * 200)).toString() + 'M',
        description: 'Daily net inflows/outflows from Bitcoin spot ETFs, indicating institutional demand.',
        affectedAssets: ['BTC', 'ETH', 'COIN', 'MSTR', '+2'],
        date: today
      }
    ]

    // Tomorrow's events
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]
    
    eventsByDate[tomorrowString] = [
      {
        id: 'cpi-data',
        time: '08:30',
        title: 'Consumer Price Index (CPI)',
        country: 'US',
        impact: 'high',
        category: 'inflation',
        forecast: '2.9% YoY',
        previous: '3.1% YoY',
        actual: undefined,
        description: 'Monthly inflation measure that heavily influences Federal Reserve policy decisions.',
        affectedAssets: ['USD', 'GOLD', 'TLT', 'SPY', 'BTC'],
        date: tomorrowString
      },
      {
        id: 'tesla-earnings',
        time: '16:30',
        title: 'Tesla Q4 Earnings',
        country: 'US',
        impact: 'high',
        category: 'employment',
        forecast: '$2.45 EPS',
        previous: '$2.27 EPS',
        actual: undefined,
        description: 'Quarterly earnings report from Tesla, major influence on EV sector and tech stocks.',
        affectedAssets: ['TSLA', 'QQQ', 'EV Sector', 'ARKK'],
        date: tomorrowString
      }
    ]

    // Day after tomorrow
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    const dayAfterString = dayAfter.toISOString().split('T')[0]
    
    eventsByDate[dayAfterString] = [
      {
        id: 'nonfarm-payrolls',
        time: '08:30',
        title: 'Non-Farm Payrolls',
        country: 'US',
        impact: 'high',
        category: 'employment',
        forecast: '185K',
        previous: '199K',
        actual: undefined,
        description: 'Monthly employment report showing job creation, unemployment rate, and wage growth.',
        affectedAssets: ['USD', 'SPY', 'DXY', 'GOLD', 'TLT'],
        date: dayAfterString
      }
    ]

    return eventsByDate[dateString] || []
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days: CalendarDay[] = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0]
      const dayEvents = generateEventsForDate(dateString)
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

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 300))
    setEvents(generateEventsForDate(selectedDate))
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Update events every 30 seconds for live feel
    const interval = setInterval(() => {
      setEvents(generateEventsForDate(selectedDate))
      setUpdateCount(prev => prev + 1)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedDate])

  // Update events when selected date changes
  useEffect(() => {
    setEvents(generateEventsForDate(selectedDate))
  }, [selectedDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <TrendingUp className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary': return <DollarSign className="h-4 w-4" />
      case 'employment': return <Building className="h-4 w-4" />
      case 'inflation': return <TrendingUp className="h-4 w-4" />
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
      'UK': '🇬🇧'
    }
    return flags[country] || '🌍'
  }

  const isEventSoon = (eventTime: string) => {
    const eventDateTime = new Date(`${selectedDate}T${eventTime}:00`)
    const now = new Date()
    const diffHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours <= 2 && diffHours > 0
  }

  const getTimeUntilEvent = (eventTime: string) => {
    const eventDateTime = new Date(`${selectedDate}T${eventTime}:00`)
    const now = new Date()
    const diffMs = eventDateTime.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Past'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours === 0) return `${diffMinutes}m`
    if (diffHours < 24) return `${diffHours}h ${diffMinutes}m`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ${diffHours % 24}h`
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="flex justify-center items-center min-h-[600px]">
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-transparent p-6">
          
          {/* Interactive Calendar */}
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h4 className="text-xl font-bold text-gray-900 text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`
                    relative p-2 text-sm font-medium rounded-lg transition-all duration-200 min-h-[40px]
                    ${!day.isCurrentMonth ? 'text-gray-400 opacity-50' : 
                      day.isSelected ? 'bg-blue-600 text-white shadow-lg' :
                      day.isToday ? 'bg-blue-100 text-blue-600 border border-blue-300' :
                      day.hasEvents ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' :
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                      {day.hasHighImpact && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {day.hasMediumImpact && (
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      )}
                      {day.events.length > 2 && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Events Section Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Events for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-gray-600">
                  {events.length} event{events.length !== 1 ? 's' : ''} • Update #{updateCount}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            </div>
            </div>
          
            {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No events scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group bg-gray-700/30 border-gray-600/20 hover:border-blue-500/40 ${
                    isEventSoon(event.time) ? 'ring-2 ring-orange-300 bg-orange-50' : 'bg-gray-50 hover:bg-gray-100'
                  } border-gray-200`}
                  style={{
                    boxShadow: event.impact === 'high' ? '0 2px 8px rgba(239, 68, 68, 0.15)' :
                               event.impact === 'medium' ? '0 2px 8px rgba(245, 158, 11, 0.15)' :
                               '0 2px 8px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="text-center min-w-[60px] flex-shrink-0">
                        <div className="text-sm font-bold text-gray-900">{event.time}</div>
                        <div className="text-xl">{getCountryFlag(event.country)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getTimeUntilEvent(event.time)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(event.category)}
                            <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </h4>
                          </div>
                          
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getImpactColor(event.impact)}`}>
                            {getImpactIcon(event.impact)}
                            <span className="hidden sm:inline capitalize">{event.impact}</span>
                          </div>
                          
                          {isEventSoon(event.time) && (
                            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-600/20 text-orange-400 border border-orange-500/30 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              <span className="hidden sm:inline">Soon</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                        
                        {(event.forecast || event.previous || event.actual) && (
                          <div className="flex flex-wrap gap-3 text-xs mb-2">
                            {event.forecast && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">F:</span>
                                <span className="font-medium text-gray-900">{event.forecast}</span>
                              </div>
                            )}
                            {event.previous && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">P:</span>
                                <span className="font-medium text-gray-700">{event.previous}</span>
                              </div>
                            )}
                            {event.actual && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">A:</span>
                                <span className="font-bold text-blue-600">{event.actual}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Affects:</span>
                          <div className="flex flex-wrap gap-1">
                            {event.affectedAssets.map((asset, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-200 border border-gray-300 rounded text-xs font-medium text-gray-700"
                              >
                                {asset}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-2">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Calendar Legend */}
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}