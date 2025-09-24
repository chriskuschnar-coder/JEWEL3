import React from 'react'
import { Lock, Shield, Clock, AlertTriangle, ArrowRight, FileText } from 'lucide-react'

interface ReadOnlyPortfolioOverlayProps {
  kycStatus: string
  hasCompletedDocuments?: boolean
  onCheckKYC?: () => void
  onResubmitKYC?: () => void
  onStartOnboarding?: () => void
}

export function ReadOnlyPortfolioOverlay({ kycStatus, hasCompletedDocuments = false, onCheckKYC, onResubmitKYC, onStartOnboarding }: ReadOnlyPortfolioOverlayProps) {
  const getStatusMessage = () => {
    // If documents not completed, don't show KYC-related messages
    if (!hasCompletedDocuments) {
      return {
        icon: <Shield className="h-6 w-6 text-gray-600" />,
        title: 'Complete Account Setup',
        message: 'Complete your onboarding documents first, then proceed with identity verification to unlock funding features.',
        color: 'gray',
        action: onStartOnboarding ? (
          <button
            onClick={onStartOnboarding}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
          >
            <FileText className="h-5 w-5" />
            Complete Onboarding Documents
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null
      }
    }
    
    switch (kycStatus) {
      case 'unverified':
        return {
          icon: <Shield className="h-6 w-6 text-gray-600" />,
          title: 'Identity Verification Required',
          message: 'Your documents are complete. Now complete identity verification to unlock funding features.',
          color: 'gray',
          action: null
        }
      
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6 text-blue-600" />,
          title: 'Identity Verification in Progress',
          message: 'Funding is temporarily locked until your identity is verified. You can browse the portal in read-only mode.',
          color: 'blue',
          action: onCheckKYC ? (
            <button
              onClick={onCheckKYC}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Check Verification Status
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null
        }
      
      case 'rejected':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          title: 'Identity Verification Required',
          message: 'Your verification could not be approved. Please resubmit your documents to unlock funding features.',
          color: 'red',
          action: onResubmitKYC ? (
            <button
              onClick={onResubmitKYC}
              className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Resubmit Documents
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null
        }
      
      default:
        return {
          icon: <Lock className="h-6 w-6 text-gray-600" />,
          title: 'Account Setup Required',
          message: 'Complete identity verification to unlock funding and trading features.',
          color: 'gray',
          action: null
        }
    }
  }

  const status = getStatusMessage()

  return (
    <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-xl p-4 mb-6`}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 bg-${status.color}-100 rounded-lg flex-shrink-0`}>
          {status.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-${status.color}-900 mb-2`}>
            {status.title}
          </h3>
          <p className={`text-${status.color}-800 text-sm mb-3 leading-relaxed`}>
            {status.message}
          </p>
          {status.action && (
            <div>
              {status.action}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Disabled button component for funding actions
export function DisabledFundingButton({ 
  children, 
  kycStatus, 
  className = "",
  onClick 
}: { 
  children: React.ReactNode
  kycStatus: string
  className?: string
  onClick?: () => void
}) {
  const isDisabled = kycStatus !== 'verified'
  
  const getTooltipMessage = () => {
    switch (kycStatus) {
      case 'pending':
        return 'Funding locked - Identity verification in progress'
      case 'rejected':
        return 'Funding locked - Please resubmit verification documents'
      default:
        return 'Funding locked - Complete identity verification first'
    }
  }

  if (isDisabled) {
    return (
      <div className="relative group">
        <button
          disabled
          className={`${className} opacity-50 cursor-not-allowed relative`}
          title={getTooltipMessage()}
        >
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            {children}
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {getTooltipMessage()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}