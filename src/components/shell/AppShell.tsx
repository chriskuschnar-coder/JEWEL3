import * as React from "react"
import { AppHeader } from './AppHeader'
import { AppTabs } from './AppTabs'
import { BottomNavigation } from '../mobile/BottomNavigation'
import { PullToRefresh } from '../mobile/PullToRefresh'
import { useAuth } from '../auth/AuthProvider'
import TickerTape from '../TickerTape'

interface AppShellProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onRefresh?: () => Promise<void>
}

export function AppShell({ 
  children, 
  activeTab, 
  onTabChange, 
  onRefresh 
}: AppShellProps) {
  const { account, user, refreshAccount, refreshProfile } = useAuth()
  const currentBalance = account?.balance || 0

  // Soft refresh function that doesn't reload the page
  const handleSoftRefresh = async () => {
    try {
      console.log('🔄 Performing soft refresh...')
      await Promise.all([
        refreshAccount(),
        refreshProfile()
      ])
      console.log('✅ Soft refresh completed')
    } catch (error) {
      console.error('❌ Soft refresh failed:', error)
      // Only fall back to hard reload if soft refresh fails
      if (onRefresh) {
        await onRefresh()
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col overflow-hidden">
      {/* Rolling Ticker - Fixed at Top - Only show for non-terminal tabs */}
      {activeTab !== 'trading' && (
        <div className="hidden lg:block fixed left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 h-12" style={{ top: 'calc(env(safe-area-inset-top) + 64px)' }}>
          <TickerTape />
        </div>
      )}

      {/* App Header with Integrated Navigation - Sticky Below Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/98 backdrop-blur-lg border-b border-gray-800/30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <AppHeader 
          currentBalance={currentBalance} 
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top))' }}>
        {/* Mobile Content with Pull to Refresh */}
        <div className="md:hidden">
          <PullToRefresh onRefresh={handleSoftRefresh}>
            <div className="min-h-full">
              {children}
            </div>
          </PullToRefresh>
        </div>
        
        {/* Desktop Content */}
        <div className="hidden md:block min-h-full pt-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={onTabChange}
          hasNotification={user?.kyc_status === 'pending'}
        />
      </div>
    </div>
  )
}