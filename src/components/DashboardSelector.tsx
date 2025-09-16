import React, { useState, useEffect } from 'react'
import InvestorDashboard from './InvestorDashboard'
import HeliosDashboard from './HeliosDashboard'
import { AppShell } from './shell/AppShell'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminNavManagement } from './admin/AdminNavManagement'
import { AdminSubscriptionManagement } from './admin/AdminSubscriptionManagement'
import { AIInsights } from './portfolio/AIInsights'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { SecuritySettings } from './SecuritySettings'
import { useAuth } from './auth/AuthProvider'
import { Shield } from 'lucide-react'

interface DashboardSelectorProps {
  onShowKYCProgress?: () => void
}

export function DashboardSelector({ onShowKYCProgress }: DashboardSelectorProps) {
  const { user, account } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'markets' | 'research' | 'trading' | 'security' | 'admin' | 'admin-nav' | 'admin-subscriptions'>('portfolio')

  const isAdmin = user?.role === 'admin' || user?.is_admin === true
  
  useEffect(() => {
    if (user) {
      console.debug('🔍 DashboardSelector user context:', {
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        isAdmin: isAdmin
      })
    }
  }, [user, isAdmin])

  // Handle URL-based routing for admin pages
  useEffect(() => {
    const path = window.location.pathname
    console.log('🔍 Current path:', path)
    if (path === '/admin/nav') {
      setSelectedTab('admin-nav')
    } else if (path === '/admin/subscriptions') {
      setSelectedTab('admin-subscriptions')
    } else if (path.startsWith('/admin')) {
      setSelectedTab('admin')
    } else if (path === '/markets') {
      setSelectedTab('markets')
    } else if (path === '/research') {
      setSelectedTab('research')
    } else if (path === '/trading' || path === '/terminal') {
      setSelectedTab('trading')
    } else if (path === '/security') {
      setSelectedTab('security')
    } else {
      setSelectedTab('portfolio')
    }
  }, [])

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab as any)
    
    // Always scroll to top immediately when changing tabs
    if (tab === 'portfolio') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    
    // Update URL without page reload using pushState
    const newPath = tab === 'portfolio' ? '/' : 
                   tab === 'admin-nav' ? '/admin/nav' :
                   tab === 'admin-subscriptions' ? '/admin/subscriptions' :
                   `/${tab}`
    console.log('🔄 Navigating to:', newPath)
    window.history.pushState({}, '', newPath)
  }

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      console.log('🔙 Browser navigation to:', path)
      
      // Always scroll to top when navigating
      window.scrollTo({ top: 0, behavior: 'auto' })
      
      if (path === '/admin/nav') {
        setSelectedTab('admin-nav')
      } else if (path === '/admin/subscriptions') {
        setSelectedTab('admin-subscriptions')
      } else if (path.startsWith('/admin')) {
        setSelectedTab('admin')
      } else if (path === '/markets') {
        setSelectedTab('markets')
      } else if (path === '/research') {
        setSelectedTab('research')
      } else if (path === '/trading' || path === '/terminal') {
        setSelectedTab('trading')
      } else if (path === '/security') {
        setSelectedTab('security')
      } else {
        setSelectedTab('portfolio')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleRefresh = async () => {
    // Refresh functionality for mobile pull-to-refresh
    window.location.reload()
  }

  // Render selected page content
  const renderPageContent = () => {
    const currentBalance = account?.balance || 0
    
    switch (selectedTab) {
      case 'admin':
        return <AdminDashboard />
      case 'admin-nav':
        return <AdminNavManagement />
      case 'admin-subscriptions':
        return <AdminSubscriptionManagement />
      case 'markets':
        return <MarketsTab />
      case 'research':
        return <ResearchTab />
      case 'trading':
        return <HeliosDashboard />
      case 'security':
        return <SecuritySettings onBack={() => setSelectedTab('portfolio')} />
      default:
        return <InvestorDashboard onShowKYCProgress={onShowKYCProgress} />
    }
  }

  const getPageTitle = () => {
    switch (selectedTab) {
      case 'markets': return 'Markets'
      case 'research': return 'Research'
      case 'trading': return 'Terminal'
      case 'compliance': return 'Compliance'
      case 'security': return 'Security'
      case 'admin': return 'Admin'
      case 'admin-nav': return 'NAV Management'
      case 'admin-subscriptions': return 'Subscriptions'
      default: return 'Portfolio'
    }
  }

  return (
    <AppShell
      activeTab={selectedTab}
      onTabChange={handleTabChange}
      onRefresh={handleRefresh}
    >
      {renderPageContent()}
    </AppShell>
  )
}