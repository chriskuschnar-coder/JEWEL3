import React from 'react'
import { TrendingUp, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from './auth/AuthProvider'

interface EmptyPortfolioStateProps {
  onFundAccount: () => void
  onAmountSelect: (amount: number) => void
}

export function EmptyPortfolioState({ onFundAccount, onAmountSelect }: EmptyPortfolioStateProps) {
  const { user, profile } = useAuth()

  const hasCompletedDocuments = user?.documents_completed || profile?.documents_completed || false
  const kycStatus = user?.kyc_status || 'unverified'
  const isKYCVerified = kycStatus === 'verified'

  // Determine the appropriate message and button text based on user status
  const getStatusMessage = () => {
    if (hasCompletedDocuments && isKYCVerified) {
      return {
        title: 'Add Capital to Your Account',
        description: 'Add additional capital to your existing managed account. Your onboarding and verification are complete.',
        buttonText: 'Add Account Capital'
      }
    } else if (hasCompletedDocuments) {
      return {
        title: 'Complete Identity Verification',
        description: 'Complete identity verification to unlock funding capabilities. This one-time process ensures regulatory compliance.',
        buttonText: 'Complete Identity Verification'
      }
    } else {
      return {
        title: 'Activate Your Account',
        description: 'Begin your journey with our quantitative strategies. Complete the onboarding process to access institutional-grade portfolio management.',
        buttonText: 'Complete Onboarding Documents'
      }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {statusMessage.title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          {statusMessage.description}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Shield className="w-4 h-4 text-green-600" />
          <span>SIPC Protected up to $500,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Award className="w-4 h-4 text-green-600" />
          <span>SEC Registered Investment Advisor</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Institutional-Grade Risk Management</span>
        </div>
      </div>

      {/* Always enabled button to start the appropriate flow */}
      <button
        onClick={onFundAccount}
        className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg hover:scale-105 shadow-lg"
      >
        {statusMessage.buttonText}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}