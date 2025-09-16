import * as React from "react"
import { useState, useEffect } from 'react'
import { Menu, X, TrendingUp, Shield, ArrowRight, Globe, BarChart3, Play } from 'lucide-react'
import { Logo } from './Logo'

interface HeaderProps {
  onNavigateToLogin?: () => void
  isLoggedIn?: boolean
}

export function Header({ onNavigateToLogin, isLoggedIn = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Insights', href: '/insights' },
    { name: 'Strategies', href: '/strategies' },
    { name: 'Approach', href: '/approach' },
    { name: 'Institutions', href: '#institutions' },
    { name: 'Explore Markets', href: '#markets' },
    { name: 'Learn', href: '#learn' },
    { name: 'Why GMC?', href: '#why' }
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[60] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-lg border-b border-gray-200/50 shadow-lg' 
        : 'bg-white/95 backdrop-blur-sm'
    }`} style={{ 
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      <nav className="w-full relative z-[60]">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            <Logo size="small" />
            <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg">GMC</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm xl:text-base"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            <button
              onClick={() => {
                onNavigateToLogin?.()
                // Scroll to top when navigating to login
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 rounded-xl text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 shadow-lg whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden sm:inline">{isLoggedIn ? 'Go to Dashboard' : 'Access Terminal'}</span>
              <span className="sm:hidden">{isLoggedIn ? 'Dashboard' : 'Access'}</span>
            </button>

            {/* Mobile menu button */}
            <div className="lg:hidden flex-shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-2 bg-white/98 backdrop-blur-lg relative z-[60]">
            <div className="space-y-1 px-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              {/* Mobile Login Button */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    onNavigateToLogin?.()
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Access Terminal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}