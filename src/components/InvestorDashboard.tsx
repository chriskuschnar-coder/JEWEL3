import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  BarChart3,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { ModernPortfolioChart } from './charts/ModernPortfolioChart'
import { DonutAllocation } from './charts/DonutAllocation'
import { FundingModal } from './FundingModal'
import { ReadOnlyPortfolioOverlay, DisabledFundingButton } from './ReadOnlyPortfolioOverlay'
import { useAuth } from './auth/AuthProvider'
import { FuturisticAIStrategies } from './portfolio/FuturisticAIStrategies'
import { ProfitBlipTracker } from './ProfitBlipTracker'

interface InvestorDashboardProps {
  onShowKYCProgress?: () => void
}

export default function InvestorDashboard({ onShowKYCProgress }: InvestorDashboardProps) {
  const { user, account } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24H' | '1W' | '1M' | '3M' | '6M' | 'ALL'>('1M')
  const [showBalance, setShowBalance] = useState(true)

  const currentBalance = account?.balance || 0
  const totalDeposits = account?.total_deposits || 0
  const totalWithdrawals = account?.total_withdrawals || 0
  const netDeposits = totalDeposits - totalWithdrawals
  const totalPnL = currentBalance - netDeposits
  const dailyChange = netDeposits > 0 ? totalPnL * 0.02 : 0
  const dailyChangePct = netDeposits > 0 ? (dailyChange / netDeposits) * 100 : 0
  const isPositive = dailyChange >= 0

  const kycStatus = user?.kyc_status || 'unverified'
  const hasCompletedDocuments = user?.documents_completed || false
  const isKYCVerified = kycStatus === 'verified'

  const handleFundPortfolio = (amount?: number) => {
    setShowFundingModal(true)
  }

  const handleWithdraw = () => {
    console.log('Withdraw clicked')
  }

  const timeframes = [
    { id: '24H', label: '24H' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: 'ALL', label: 'ALL' }
  ]

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12 overflow-x-hidden">
      {/* KYC Status Overlay */}
      {!isKYCVerified && (
        <ReadOnlyPortfolioOverlay
          kycStatus={kycStatus}
          hasCompletedDocuments={hasCompletedDocuments}
          onCheckKYC={onShowKYCProgress}
          onResubmitKYC={onShowKYCProgress}
        />
      )}

      {/* Portfolio Balance Section - iOS HIG Optimized */}
      <section className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden pt-4" id="portfolio-balance">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 items-start">
          {/* Left Column - Portfolio Balance */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8 min-w-0">
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 font-medium">
                  PORTFOLIO VALUE
                </span>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 text-gray-400 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-800/50 touch-manipulation"
                >
                  {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
              </div>
              {/* iOS HIG: Balance Text - 20pt max on mobile per Apple guidelines */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 font-mono tracking-tight leading-tight">
                {showBalance 
                  ? `$${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '••••••••'
                }
              </h1>
              {/* iOS HIG: Secondary info - 16pt body text minimum */}
              {showBalance && (
                <div className={`flex items-center space-x-2 text-sm sm:text-base font-medium mb-6 sm:mb-8 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 sm:h-5 sm:w-5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 sm:h-5 sm:w-5" />
                  )}
                  <span className="text-xs sm:text-base">{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="opacity-80 text-xs sm:text-base">({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)</span>
                  <span className="text-gray-400 text-xs sm:text-base">today</span>
                </div>
              )}
            </div>
            {/* iOS HIG: Touch targets 44×44pt minimum */}
            <div className="space-y-2 sm:space-y-3 w-full">
              <DisabledFundingButton
                kycStatus={kycStatus}
                onClick={() => handleFundPortfolio()}
                className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg text-xs sm:text-base min-h-[44px] touch-manipulation"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Funds</span>
              </DisabledFundingButton>
              
              <DisabledFundingButton
                kycStatus={kycStatus}
                onClick={handleWithdraw}
                className="w-full flex items-center justify-center space-x-2 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-3 py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Withdraw</span>
              </DisabledFundingButton>
            </div>
          
            {/* Profit Blip Tracker - Under buttons in left column */}
            <div className="hidden lg:block mt-6">
              {/* Recent Activity Section */}
              <div className="space-y-4">
                {/* Section Header */}
                <div className="border-b border-white/10 pb-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-white font-medium text-sm">Recent Activity</h3>
                  </div>
                </div>

                {/* Activity Cards */}
                <div className="space-y-3">
                  {/* Card 1 */}
                  <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 shadow-lg shadow-black/30 border border-gray-700/20 hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-sm font-medium">Market Maker</span>
                          <div className="text-lg">🎯</div>
                        </div>
                        <div className="text-xl font-semibold text-green-400 mb-1 drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">$374.21</div>
                        <div className="text-gray-400 text-xs">Just now</div>
                      </div>
                      <div className="text-green-400 font-medium text-sm drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">
                        +$374.21
                      </div>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 shadow-lg shadow-black/30 border border-gray-700/20 hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-sm font-medium">Helios BTC</span>
                          <div className="text-lg">₿</div>
                        </div>
                        <div className="text-xl font-semibold text-green-400 mb-1 drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">$298.45</div>
                        <div className="text-gray-400 text-xs">8m ago</div>
                      </div>
                      <div className="text-green-400 font-medium text-sm drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">
                        +$298.45
                      </div>
                    </div>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 shadow-lg shadow-black/30 border border-gray-700/20 hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-sm font-medium">Multi-Asset Alpha</span>
                          <div className="text-lg">🚀</div>
                        </div>
                        <div className="text-xl font-semibold text-green-400 mb-1 drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">$185.67</div>
                        <div className="text-gray-400 text-xs">15m ago</div>
                      </div>
                      <div className="text-green-400 font-medium text-sm drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]">
                        +$185.67
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Summary Pill */}
                <div className="flex justify-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-gray-800/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>3 profits today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Portfolio Performance Chart */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8 min-w-0 overflow-visible">
            {/* iOS HIG: Clear hierarchy with 8pt spacing system */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-xl lg:text-2xl font-semibold text-white leading-tight">Performance</h2>
              
              {/* iOS HIG: 44×44pt touch targets with horizontal scroll */}
              <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto min-w-0">
                {timeframes.map(timeframe => (
                  <button
                    key={timeframe.id}
                    onClick={() => setSelectedTimeframe(timeframe.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] min-w-[50px] flex items-center justify-center touch-manipulation flex-shrink-0 ${
                      selectedTimeframe === timeframe.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
                    }`}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Optimized chart container */}
            <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] overflow-visible">
              <ModernPortfolioChart 
                currentBalance={currentBalance}
                selectedTimeframe={selectedTimeframe}
              />
            </div>
          </div>
        </div>
      </section>

      {/* iOS HIG: Assets Section with 8pt spacing system */}
      <div className="space-y-1 sm:space-y-2 overflow-x-hidden mt-4 sm:mt-6">
        <div className="relative">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight">Your Assets</h2>
          <DonutAllocation
            currentBalance={currentBalance}
            onSegmentClick={(data) => {
              console.log('Asset clicked:', data)
            }}
          />
        </div>
      </div>

      {/* iOS HIG: Strategies Section with 8pt spacing system */}
      <div className="space-y-1 sm:space-y-2 overflow-x-hidden mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight">Your Strategies</h2>
        <FuturisticAIStrategies 
          currentBalance={currentBalance}
          onStrategyClick={(strategy) => {
            console.log('Strategy clicked:', strategy)
          }}
        />
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
      />
    </div>
  )
}