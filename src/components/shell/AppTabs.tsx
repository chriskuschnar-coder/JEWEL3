import React from 'react'
import { Home, TrendingUp, Brain, Activity, Shield, Settings } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

interface AppTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppTabs({ activeTab, onTabChange }: AppTabsProps) {
  const { user } = useAuth()

  const tabs = [
    { id: 'portfolio', name: 'Dashboard', href: '/', icon: Home },
    { id: 'markets', name: 'Markets', href: '/markets', icon: TrendingUp },
    { id: 'research', name: 'Research', href: '/research', icon: Brain },
    { id: 'trading', name: 'Terminal', href: '/trading', icon: Activity },
    { id: 'security', name: 'Security', href: '/security', icon: Shield },
    ...(user?.is_admin === true || user?.role === 'admin'
      ? [{ id: 'admin', name: 'Admin', href: '/admin', icon: Settings }]
      : []),
  ]

  const handleTabClick = (tab: { id: string; href: string }) => {
    onTabChange(tab.id)
    window.history.pushState({}, '', tab.href)
  }

  return (
    <>
      {/* Desktop Navigation - Integrated into Header */}
      <div className="hidden lg:block">
        {/* Navigation is now part of AppHeader */}
      </div>

      {/* Mobile Navigation - Bottom Navigation */}
      <div className="lg:hidden">
        {/* Mobile tabs are handled by BottomNavigation component */}
      </div>
    </>
  )
}