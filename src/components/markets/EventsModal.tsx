import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, TrendingUp, AlertTriangle, DollarSign, Building, Zap, Globe, ExternalLink, Star } from 'lucide-react'

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

interface EventsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  events: EconomicEvent[]
  onEventClick: (event: EconomicEvent) => void
}

export function EventsModal({ isOpen, onClose, selectedDate, events, onEventClick }: EventsModalProps) {
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

  const eventVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                  <Calendar className="h-6 w-6 text-blue-600" />
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
                    {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-xs font-medium">LIVE</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Events Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Events Scheduled</h4>
                  <p className="text-gray-600">No economic events are scheduled for this date</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                  className="space-y-4"
                >
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      variants={eventVariants}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => onEventClick(event)}
                      className={`p-6 rounded-xl border transition-all cursor-pointer group bg-white hover:bg-gray-50 border-gray-200 shadow-sm ${
                        isEventSoon(event.time) ? 'ring-2 ring-orange-300 bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div className="text-center min-w-[80px] flex-shrink-0">
                            <div className="text-lg font-bold text-gray-900 mb-1">{event.time}</div>
                            <div className="text-2xl mb-2">{getCountryFlag(event.country)}</div>
                            <div className="text-xs text-gray-500">
                              {getTimeUntilEvent(event.time)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(event.category)}
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                  {event.title}
                                </h4>
                              </div>
                              
                              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getImpactColor(event.impact)}`}>
                                {getImpactIcon(event.impact)}
                                <span className="capitalize">{event.impact} Impact</span>
                              </div>
                              
                              {isEventSoon(event.time) && (
                                <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                  <Clock className="h-4 w-4" />
                                  <span>Soon</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>
                            
                            {(event.forecast || event.previous || event.actual) && (
                              <div className="flex flex-wrap gap-4 text-sm mb-4">
                                {event.forecast && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Forecast:</span>
                                    <span className="font-bold text-gray-900">{event.forecast}</span>
                                  </div>
                                )}
                                {event.previous && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Previous:</span>
                                    <span className="font-bold text-gray-700">{event.previous}</span>
                                  </div>
                                )}
                                {event.actual && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Actual:</span>
                                    <span className="font-bold text-blue-600">{event.actual}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 font-medium">Affects:</span>
                              <div className="flex flex-wrap gap-2">
                                {event.affectedAssets.map((asset, assetIndex) => (
                                  <span
                                    key={assetIndex}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                                  >
                                    {asset}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}