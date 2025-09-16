import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Zap, DollarSign, Sparkles } from 'lucide-react'

interface ProfitBlip {
  id: string
  amount: number
  timestamp: Date
  strategy: string
  type: 'profit' | 'gain' | 'yield'
  icon: string
}

interface ProfitBlipTrackerProps {
  currentBalance: number
}

export function ProfitBlipTracker({ currentBalance }: ProfitBlipTrackerProps) {
  const [activeBlips, setActiveBlips] = useState<ProfitBlip[]>([])
  const [blipCount, setBlipCount] = useState(0)

  const strategies = [
    { name: 'Helios BTC', icon: '₿' },
    { name: 'Multi-Asset Alpha', icon: '🚀' },
    { name: 'Arbitrage ETH', icon: 'Ξ' },
    { name: 'Mean Reversion', icon: '⚖️' },
    { name: 'Market Maker', icon: '🎯' },
    { name: 'Momentum', icon: '📈' }
  ]

  const generateProfitBlip = (): ProfitBlip => {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    const types: ('profit' | 'gain' | 'yield')[] = ['profit', 'gain', 'yield']
    const type = types[Math.floor(Math.random() * types.length)]
    
    // Generate realistic profit amounts based on balance
    const baseAmount = currentBalance > 0 ? currentBalance * 0.002 : 75 // 0.2% of balance or $75 minimum
    const variation = Math.random() * 4 + 1 // 1x to 5x multiplier for bigger amounts
    const amount = Math.floor(baseAmount * variation * 100) / 100 // Round to cents
    
    return {
      id: `blip-${Date.now()}-${Math.random()}`,
      amount,
      timestamp: new Date(),
      strategy: strategy.name,
      type,
      icon: strategy.icon
    }
  }

  // Generate new profit blips every 8-15 seconds
  useEffect(() => {
    // Always ensure we have 3 blips visible
    const ensureThreeBlips = () => {
      const currentTime = new Date()
      const initialBlips = []
      
      for (let i = 0; i < 3; i++) {
        const blip = generateProfitBlip()
        blip.timestamp = new Date(currentTime.getTime() - (i * 10 * 60 * 1000)) // Spread over last 30 minutes
        initialBlips.push(blip)
      }
      
      setActiveBlips(initialBlips)
      setBlipCount(3)
    }
    
    // Initialize with 3 blips immediately
    ensureThreeBlips()
    
    const generateBlip = () => {
      const newBlip = generateProfitBlip()
      setBlipCount(prev => prev + 1)
      
      setActiveBlips(prev => {
        // Keep only the most recent 3 blips
        const updated = [newBlip, ...prev].slice(0, 3)
        return updated
      })
      
      // Remove blip after 1 hour (3600 seconds)
      setTimeout(() => {
        setActiveBlips(prev => prev.filter(blip => blip.id !== newBlip.id))
      }, 3600000) // 1 hour
    }

    // Then generate new blips every 8-15 seconds
    const interval = setInterval(() => {
      const randomDelay = Math.random() * 7000 + 8000 // 8-15 seconds
      setTimeout(generateBlip, randomDelay)
    }, 15000) // Check every 15 seconds

    return () => {
      clearInterval(interval)
    }
  }, [currentBalance])

  const getBlipMessage = (blip: ProfitBlip) => {
    const messages = {
      profit: [
        `You earned $${blip.amount.toFixed(2)}`,
        `Profit: +$${blip.amount.toFixed(2)}`,
        `Made $${blip.amount.toFixed(2)}`,
        `Earned $${blip.amount.toFixed(2)}`
      ],
      gain: [
        `You gained $${blip.amount.toFixed(2)}`,
        `Gain: +$${blip.amount.toFixed(2)}`,
        `Up $${blip.amount.toFixed(2)}`,
        `Gained $${blip.amount.toFixed(2)}`
      ],
      yield: [
        `Yield: +$${blip.amount.toFixed(2)}`,
        `Interest: $${blip.amount.toFixed(2)}`,
        `Earned $${blip.amount.toFixed(2)}`,
        `Yield $${blip.amount.toFixed(2)}`
      ]
    }
    
    const typeMessages = messages[blip.type]
    return typeMessages[Math.floor(Math.random() * typeMessages.length)]
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return 'Just now'
  }

  return (
    <div className="w-full max-w-sm mx-0">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="grid grid-rows-3 gap-2 h-72">
        <AnimatePresence mode="popLayout">
          {activeBlips.slice(0, 3).map((blip, index) => (
            <motion.div
              key={blip.id}
              initial={{ 
                opacity: 1, 
                scale: 1, 
                y: 0
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -10,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                delay: 0
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
              className={`
                relative group cursor-default h-full
                bg-gray-900/90 backdrop-blur-xl rounded-lg p-2 
                border border-gray-700/50 shadow-xl
                w-full flex flex-col justify-center
              `}
              style={{
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4)',
                animation: 'none'
              }}
            >
              {/* Subtle glow effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                }}
              />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-40" />
                    </div>
                    <span className="text-green-400 text-sm font-medium">
                      {blip.strategy}
                    </span>
                  </div>
                  
                  <div className="text-xl">{blip.icon}</div>
                </div>
                
                <div className="mb-2">
                  <div className="text-white font-semibold text-sm">
                    {getBlipMessage(blip)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {getTimeAgo(blip.timestamp)}
                  </div>
                </div>
                
                {/* Receipt-style dotted line */}
                <div className="border-t border-dotted border-gray-600/50 my-2" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {blip.type.charAt(0).toUpperCase() + blip.type.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 font-medium text-sm">
                      +${blip.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sparkle effect on hover */}
              <motion.div
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Blip counter - at bottom */}
      {blipCount > 0 && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gray-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-xs font-medium">
              {blipCount} profit{blipCount !== 1 ? 's' : ''} today
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}