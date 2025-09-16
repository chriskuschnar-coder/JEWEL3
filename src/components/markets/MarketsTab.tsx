import React from 'react'
import { AIMarketNarrative } from './AIMarketNarrative'
import { SocialSentimentTracker } from './SocialSentimentTracker'
import { EconomicCalendar } from './EconomicCalendar'
import { LiveMarketData } from './LiveMarketData'

export function MarketsTab() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-3 md:p-4 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* AI Market Narrative - Top Priority */}
      <div className="bg-transparent">
        <AIMarketNarrative />
      </div>
      
      {/* Live Market Data */}
      <div className="bg-transparent">
        <LiveMarketData />
      </div>
      
      {/* Social Sentiment Tracker */}
      <div className="bg-transparent">
        <SocialSentimentTracker />
      </div>
      
      {/* Economic Calendar */}
      <div className="bg-transparent">
        <EconomicCalendar />
      </div>
    </div>
  )
}