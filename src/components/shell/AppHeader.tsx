import React from 'react'
import { Bell, LogOut, TrendingUp, Globe } from 'lucide-react'
import { Logo } from '../Logo'
import { useAuth } from '../auth/AuthProvider'

interface AppHeaderProps {
  currentBalance?: number
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppHeader({ currentBalance = 0, activeTab, onTabChange }: AppHeaderProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.warn('Sign out error:', error)
      window.location.reload()
    }
  }

  const isAdmin = user?.is_admin === true || user?.role === 'admin'

  const tabs = [
    { id: 'portfolio', name: 'Dashboard', href: '/' },
    { id: 'markets', name: 'Markets', href: '/markets' },
    { id: 'research', name: 'Research', href: '/research' },
    { id: 'trading', name: 'Terminal', href: '/trading' },
    { id: 'security', name: 'Security', href: '/security' },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin', href: '/admin' }] : []),
  ]

  const handleTabClick = (tab: { id: string; href: string }) => {
    onTabChange(tab.id)
    
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    window.history.pushState({}, '', tab.href)
  }

  return (
    <header className="w-full bg-[#0d1117]/98 backdrop-blur-lg border-b border-gray-800/30 shadow-lg min-h-[68px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-16">
          {/* Left: Logo + Brand */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Logo size="medium" />
            <div className="font-bold text-white text-lg tracking-tight">GMC</div>
          </div>
          
          {/* Center: Navigation Tabs - Hidden on Mobile */}
          <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`relative group px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] rounded-lg ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="relative z-10">{tab.name}</span>

                  {/* Active underline */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm"></div>
                  )}

                  {/* Hover underline */}
                  {!isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></div>
                  )}
                </button>
              )
            })}
          </nav>
          
          {/* Right: Portfolio Value + User Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* User Email - Desktop Only */}
            <div className="hidden xl:block text-right">
              <div className="text-sm font-medium text-gray-300 truncate max-w-[200px]">
                {user?.email || 'user@example.com'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrator' : 'Investor'}
              </div>
            </div>
            
            {/* Notification Bell */}
            <button 
              className="relative p-2.5 text-gray-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              {user?.kyc_status === 'pending' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-[#0d1117] animate-pulse shadow-lg"></div>
              )}
            </button>
            
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="group flex items-center space-x-2 text-sm text-gray-300 hover:text-red-400 transition-all duration-200 font-medium px-3 py-2.5 rounded-xl hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
              aria-label="Sign out"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}