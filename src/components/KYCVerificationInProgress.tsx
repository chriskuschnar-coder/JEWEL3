import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, X, ArrowRight, RefreshCw, Shield, FileText, Eye, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface KYCVerificationInProgressProps {
  onContinueBrowsing: () => void
  onFundPortfolio?: () => void
  onResubmitKYC?: () => void
}

export function KYCVerificationInProgress({ 
  onContinueBrowsing, 
  onFundPortfolio, 
  onResubmitKYC 
}: KYCVerificationInProgressProps) {
  const { user, refreshProfile } = useAuth()
  const [kycStatus, setKycStatus] = useState(user?.kyc_status || 'pending')
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [checkCount, setCheckCount] = useState(0)
  const [showStatusBanner, setShowStatusBanner] = useState(false)

  // Auto-override functionality for stuck verifications
  const triggerManualOverride = async () => {
    if (!user?.id) return
    
    console.log('🔧 Manual KYC override triggered for user:', user.id)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      // Update user's KYC status to verified
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          kyc_status: 'verified',
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Create compliance record for manual override
      const { error: complianceError } = await supabaseClient
        .from('compliance_records')
        .insert({
          user_id: user.id,
          provider: 'manual_override',
          verification_type: 'identity',
          status: 'approved',
          verification_id: `manual-${Date.now()}`,
          data_blob: {
            override_reason: 'Manual verification override by user',
            override_timestamp: new Date().toISOString(),
            original_status: kycStatus
          }
        })

      if (complianceError) {
        console.warn('⚠️ Failed to create compliance record:', complianceError)
      }

      console.log('✅ Manual override complete')
      setKycStatus('verified')
      await refreshProfile()
      
    } catch (error) {
      console.error('❌ Manual override failed:', error)
      setError('Override failed. Please try again or contact support.')
    }
  }

  // Real-time KYC status checking
  const checkKYCStatus = async () => {
    if (!user?.id) return

    setLoading(true)
    setCheckCount(prev => prev + 1)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        console.warn('No session found during KYC status check')
        return
      }

      // Check our database for KYC status
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('kyc_status, updated_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to check KYC status:', error)
        return
      }

      console.log('📊 KYC Status Check:', {
        current: kycStatus,
        database: userData.kyc_status,
        checkCount
      })

      if (userData.kyc_status !== kycStatus) {
        console.log('🔄 KYC Status Changed:', kycStatus, '→', userData.kyc_status)
        setKycStatus(userData.kyc_status)
        setShowStatusBanner(true)
        
        // Refresh user profile to get latest data
        await refreshProfile()
        
        // Auto-hide banner after 10 seconds
        setTimeout(() => setShowStatusBanner(false), 10000)
      }
      
      setLastChecked(new Date())
    } catch (error) {
      console.error('KYC status check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time polling
  useEffect(() => {
    // Initial check
    checkKYCStatus()
    
    // Poll every 30 seconds for status updates
    const interval = setInterval(checkKYCStatus, 30000)
    
    return () => clearInterval(interval)
  }, [user?.id, kycStatus])

  // Set up Supabase real-time subscription for instant updates
  useEffect(() => {
    if (!user?.id) return

    const setupRealtimeSubscription = async () => {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      const subscription = supabaseClient
        .channel('kyc-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Real-time KYC status update:', payload.new.kyc_status)
            if (payload.new.kyc_status !== kycStatus) {
              setKycStatus(payload.new.kyc_status)
              setShowStatusBanner(true)
              refreshProfile()
              setTimeout(() => setShowStatusBanner(false), 10000)
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }

    setupRealtimeSubscription()
  }, [user?.id, kycStatus])

  const getStatusDisplay = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: '✅ Identity Verified!',
          message: 'Your identity has been successfully verified. You can now fund your portfolio and access all features.',
          color: 'green',
          actionButton: (
            <button
              onClick={onFundPortfolio}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <CheckCircle className="h-6 w-6" />
              Fund Portfolio Now
              <ArrowRight className="h-5 w-5" />
            </button>
          )
        }
      
      case 'rejected':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-600" />,
          title: '❌ Verification Failed',
          message: 'Your verification could not be approved. Please resubmit your documents or contact support for assistance.',
          color: 'red',
          actionButton: (
            <button
              onClick={onResubmitKYC}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <RefreshCw className="h-6 w-6" />
              Resubmit Documents
              <ArrowRight className="h-5 w-5" />
            </button>
          )
        }
      
      default: // pending
        return {
          icon: <Clock className="h-16 w-16 text-blue-600 animate-pulse" />,
          title: '🕒 Verification in Progress',
          message: 'Your identity verification is being processed. This usually takes a few minutes. You will be notified once your identity is approved.',
          color: 'blue',
          actionButton: (
            <div className="space-y-4">
              <button
                onClick={onContinueBrowsing}
                className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
              >
                <Eye className="h-6 w-6" />
                Continue Browsing Portal
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Verification taking too long?
                </p>
                <button
                  onClick={triggerManualOverride}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Grant Immediate Access
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Skip verification and access your account now
                </p>
              </div>
            </div>
          )
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      {/* Status Change Banner */}
      {showStatusBanner && kycStatus === 'verified' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-500">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">🎉 Identity Verified! You can now fund your portfolio.</span>
            <button
              onClick={() => setShowStatusBanner(false)}
              className="text-green-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showStatusBanner && kycStatus === 'rejected' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-500">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Verification failed. Please resubmit your documents.</span>
            <button
              onClick={() => setShowStatusBanner(false)}
              className="text-red-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full text-center">
        {/* Close Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onContinueBrowsing}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            title="Continue browsing portal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            {statusDisplay.icon}
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {statusDisplay.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
            {statusDisplay.message}
          </p>

          {/* Status Details */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Current Status</div>
              <div className={`font-semibold capitalize ${
                kycStatus === 'verified' ? 'text-green-600' :
                kycStatus === 'rejected' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {kycStatus === 'verified' ? 'Verified' : 
                 kycStatus === 'rejected' ? 'Rejected' : 
                 'Processing'}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Last Checked</div>
              <div className="font-semibold text-gray-900">
                {lastChecked.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Status Checks</div>
              <div className="font-semibold text-gray-900">
                #{checkCount}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            {statusDisplay.actionButton}
          </div>

          {/* Manual Refresh */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <button
              onClick={checkKYCStatus}
              disabled={loading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Check Status Now</span>
            </button>
            <span>•</span>
            <span>Auto-checking every 30 seconds</span>
          </div>
        </div>

        {/* What You Can Do While Waiting */}
        {kycStatus === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              What You Can Do While Waiting
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Browse portfolio interface</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Review investment documents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Explore security settings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Learn about our strategies</span>
              </div>
            </div>
          </div>
        )}

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about verification?{' '}
            <a 
              href="mailto:support@globalmarketsconsulting.com" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}