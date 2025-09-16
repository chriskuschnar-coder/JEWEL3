import React from 'react'
import { Home, BarChart3, Globe, User, TrendingUp, Activity, Brain, Shield } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasNotification?: boolean
}

export function BottomNavigation({ activeTab, onTabChange, hasNotification = false }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'portfolio',
      label: 'Dashboard',
      icon: BarChart3,
      activeColor: 'text-blue-400',
      inactiveColor: 'text-gray-500'
    },
    {
      id: 'markets',
      label: 'Markets',
      icon: TrendingUp,
      activeColor: 'text-green-400',
      inactiveColor: 'text-gray-500'
    },
    {
      id: 'research',
      label: 'Research',
      icon: Brain,
      activeColor: 'text-purple-400',
      inactiveColor: 'text-gray-500'
    },
    {
      id: 'trading',
      label: 'Terminal',
      icon: Activity,
      activeColor: 'text-orange-400',
      inactiveColor: 'text-gray-500'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      activeColor: 'text-gray-300',
      inactiveColor: 'text-gray-500'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1117]/98 backdrop-blur-lg border-t border-gray-800/40 transition-colors duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 py-1 mobile-safe-area">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id)
                // Always scroll to top immediately on mobile
                window.scrollTo({ top: 0, behavior: 'auto' })
              }}
              className={`
                flex flex-col items-center justify-center p-1.5 rounded-xl min-w-[56px] min-h-[40px] transition-all duration-200 ease-out
                ${isActive 
                  ? 'bg-blue-600 scale-105 shadow-md' 
                  : 'hover:bg-gray-700/30 active:scale-95'
                }
              `}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <div className="relative">
                <Icon 
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isActive ? 'text-white' : tab.inactiveColor
                  }`} 
                />
                
                {/* Notification Badge */}
                {tab.id === 'security' && hasNotification && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0d1117]"></div>
                )}
              </div>
              
              <span className={`
                text-[10px] font-bold mt-0.5 transition-colors duration-200 leading-tight
                ${isActive ? 'text-white' : tab.inactiveColor}
              `}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}