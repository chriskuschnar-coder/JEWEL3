import * as React from "react"
import { useState, useEffect } from 'react'
import { ArrowRight, TrendingUp, TrendingDown, Shield, Award, Users, Globe, BarChart3, Zap, Activity, DollarSign, Target, Eye, ChevronRight, Star, Download, Brain, Play } from 'lucide-react'
import { LivePortfolioDashboard } from './LivePortfolioDashboard'

export function Hero() {
  const [animatedStats, setAnimatedStats] = useState({
    aum: 0,
    investors: 0,
    countries: 0,
    performance: 0
  })

  const [marketData, setMarketData] = useState([
    { symbol: 'BTC', price: 106250, change: 2.34, volume: '$2.1B' },
    { symbol: 'ETH', price: 3195, change: 4.12, volume: '$1.8B' },
    { symbol: 'SOL', price: 245, change: -1.2, volume: '$890M' },
    { symbol: 'ADA', price: 1.08, change: 3.45, volume: '$420M' }
  ])

  const [isVisible, setIsVisible] = useState(false)
  const [tickerIndex, setTickerIndex] = useState(0)

  const targetStats = {
    aum: 2.4,
    investors: 1247,
    countries: 23,
    performance: 28.7
  }

  // Live market data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price + (Math.random() - 0.5) * asset.price * 0.001,
        change: asset.change + (Math.random() - 0.5) * 0.1
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % marketData.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [marketData.length])

  // Animated counter effect
  useEffect(() => {
    setIsVisible(true)
    const duration = 2500
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = Math.min(currentStep / steps, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimatedStats({
        aum: targetStats.aum * easeOut,
        investors: Math.floor(targetStats.investors * easeOut),
        countries: Math.floor(targetStats.countries * easeOut),
        performance: targetStats.performance * easeOut
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedStats(targetStats)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* Main Hero Content */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div>
                <h1 className="font-extrabold tracking-tight leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-900 mb-4 md:mb-6">
                  AI-Powered
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Automated Trading
                  </span>
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mt-3 md:mt-4 text-gray-600 font-light max-w-2xl">
                  Let algorithms and AI trade smarter, faster, and without emotion — giving you hedge-fund grade execution with complete transparency. No charts, no stress, no guesswork.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 px-4">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-login'))}
                  className="w-full group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Brain className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Explore Algorithms</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button className="w-full group border-2 border-gray-600 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Animated Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-6 md:pt-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    ${animatedStats.aum.toFixed(1)}B
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium text-xs uppercase tracking-wider">
                    Managed by AI
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {animatedStats.investors.toLocaleString()}+
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium text-xs uppercase tracking-wider">
                    Algorithm Users
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {animatedStats.countries}
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium text-xs uppercase tracking-wider">
                    Active Algorithms
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    +{animatedStats.performance.toFixed(1)}%
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium text-xs uppercase tracking-wider">
                    AI Performance
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Terminal Interface Preview */}
            <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} w-full lg:w-auto`}>
              <div className="transform hover:scale-[1.02] transition-transform duration-500 w-full max-w-sm lg:max-w-none flex justify-center">
                <LivePortfolioDashboard />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}