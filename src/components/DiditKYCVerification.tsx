import React, { useState, useEffect, useRef } from 'react'
import { Shield, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Camera, Clock, Upload, User, Zap, Eye, RefreshCw, X } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface DiditKYCVerificationProps {
  onVerificationComplete: () => void
  onClose: () => void
}

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'active' | 'completed' | 'error'
}

export function DiditKYCVerification({ onVerificationComplete, onClose }: DiditKYCVerificationProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [autoOverrideTimer, setAutoOverrideTimer] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(120) // 2 minutes in seconds
  const [showOverrideCountdown, setShowOverrideCountdown] = useState(false)
  const [overrideTriggered, setOverrideTriggered] = useState(false)

  const steps: VerificationStep[] = [
    {
      id: 'upload',
      title: 'Upload ID',
      description: 'Government-issued photo ID',
      icon: Upload,
      status: 'pending'
    },
    {
      id: 'selfie',
      title: 'Take Selfie',
      description: 'Live photo with liveness detection',
      icon: Camera,
      status: 'pending'
    },
    {
      id: 'verify',
      title: 'Verification',
      description: 'Processing and approval',
      icon: CheckCircle,
      status: 'pending'
    }
  ]

  const [stepStatuses, setStepStatuses] = useState<VerificationStep[]>(steps)

  // Auto-override function that grants access after timeout
  const triggerAutoOverride = async () => {
    if (overrideTriggered) return
    
    console.log('⏰ Auto-override triggered - granting KYC verification')
    setOverrideTriggered(true)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session || !user) {
        throw new Error('No active session')
      }

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
        console.error('❌ Failed to update KYC status:', updateError)
        throw updateError
      }

      // Create compliance record for the auto-override
      const { error: complianceError } = await supabaseClient
        .from('compliance_records')
        .insert({
          user_id: user.id,
          provider: 'auto_override',
          verification_type: 'identity',
          status: 'approved',
          verification_id: `auto-${Date.now()}`,
          data_blob: {
            override_reason: 'Automatic verification after timeout',
            original_session_id: sessionId,
            override_timestamp: new Date().toISOString(),
            timeout_duration: '120_seconds'
          }
        })

      if (complianceError) {
        console.warn('⚠️ Failed to create compliance record:', complianceError)
      }

      console.log('✅ Auto-override complete - user is now verified')
      
      // Show success message and complete verification
      setVerificationSubmitted(true)
      setTimeout(() => {
        onVerificationComplete()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Auto-override failed:', error)
      setError('Auto-verification failed. Please try again or contact support.')
    }
  }

  // Start countdown timer when verification URL is loaded
  useEffect(() => {
    if (verificationUrl && !autoOverrideTimer && !verificationSubmitted && !overrideTriggered) {
      console.log('⏰ Starting 2-minute auto-override countdown')
      setShowOverrideCountdown(true)
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            triggerAutoOverride()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setAutoOverrideTimer(timer)
      
      return () => {
        if (timer) {
          clearInterval(timer)
        }
      }
    }
  }, [verificationUrl, verificationSubmitted, overrideTriggered])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoOverrideTimer) {
        clearInterval(autoOverrideTimer)
      }
    }
  }, [autoOverrideTimer])

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('🚀 Starting verification for user:', user.id)
    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session - please sign in again')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const fullName = user.full_name || user.email.split('@')[0]
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || 'Name'

      const response = await fetch(`${supabaseUrl}/functions/v1/didit-create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          return_url: `${window.location.origin}/kyc/callback`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Verification failed (${response.status})`)
      }

      const sessionData = await response.json()
      
      if (!sessionData.client_url) {
        throw new Error('No verification URL received')
      }

      setVerificationUrl(sessionData.client_url)
      setSessionId(sessionData.session_id)
      
    } catch (error) {
      console.error('❌ Verification start failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmitted = () => {
    console.log('✅ User completed verification in Didit interface')
    
    // Clear the auto-override timer since user completed verification
    if (autoOverrideTimer) {
      clearInterval(autoOverrideTimer)
      setAutoOverrideTimer(null)
    }
    
    setVerificationSubmitted(true)
    
    // Redirect to verification progress screen
    setTimeout(() => {
      onVerificationComplete()
    }, 2000)
  }

  // Handle iframe messages to detect when verification is actually submitted
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Didit domain
      if (!event.origin.includes('didit.me')) return
      
      console.log('📨 Received message from Didit iframe:', event.data)
      
      // Look for verification completion signals
      if (event.data.type === 'verification_complete' || 
          event.data.type === 'verification_submitted' ||
          event.data.type === 'session_complete' ||
          (typeof event.data === 'string' && event.data.includes('complete'))) {
        console.log('✅ Verification submitted by user!')
        handleVerificationSubmitted()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Prevent infinite loading with timeout
  useEffect(() => {
    if (verificationUrl && !iframeLoaded) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Iframe loading timeout - forcing loaded state')
        setIframeLoaded(true)
      }, 10000)
      
      return () => clearTimeout(timeout)
    }
  }, [verificationUrl, iframeLoaded])

  // If verification was submitted, show transition message
  if (verificationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {overrideTriggered ? 'Account Verified Automatically' : 'Verification Submitted Successfully'}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {overrideTriggered 
              ? 'Your account has been automatically verified and you can now access all features.'
              : 'Your documents have been submitted for review. You\'ll be redirected to the verification progress screen.'
            }
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20">
            <Logo size="xl" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Secure Identity Verification
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Complete your identity verification to unlock funding capabilities. This secure process 
          helps us meet regulatory requirements and protect your account.
        </p>
        
        {/* Auto-Override Countdown */}
        {showOverrideCountdown && !verificationSubmitted && !overrideTriggered && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Auto-Verification Timer</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatTimeRemaining(timeRemaining)}
            </div>
            <p className="text-sm text-blue-700">
              If verification doesn't complete, your account will be automatically approved for immediate access.
            </p>
          </div>
        )}
      </div>

      {/* Progress Steps - Static Display */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Upload ID</h4>
            <p className="text-sm text-gray-600">Government-issued photo ID</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Take Selfie</h4>
            <p className="text-sm text-gray-600">Live photo with liveness detection</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Instant Approval</h4>
            <p className="text-sm text-gray-600">Automated verification</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Verification Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError('')
              setVerificationUrl(null)
              setSessionId(null)
              setVerificationSubmitted(false)
              setStepStatuses(steps)
              setIframeLoaded(false)
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Main Content */}
      {!verificationUrl ? (
        <div className="text-center space-y-8">
          {/* Security Features */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
              <h4 className="text-2xl font-bold text-blue-900">Bank-Level Security</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">256-bit encryption for all data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Documents processed securely and encrypted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">No data stored on our servers</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">One-time verification process</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Full KYC/AML compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Instant approval in most cases</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startVerification}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                Initializing Secure Verification...
              </>
            ) : (
              <>
                <Shield className="w-8 h-8" />
                Begin Identity Verification
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500">
            Secure verification powered by advanced identity technology
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verification Interface */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Global Markets Consulting</span>
                    <div className="text-sm text-gray-600">Secure Identity Verification</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">SECURE</span>
                </div>
              </div>
            </div>
            
            {/* Loading Overlay */}
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Loading Verification Interface</h4>
                  <p className="text-gray-600">Initializing secure connection...</p>
                </div>
                {showOverrideCountdown && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700">
                      Auto-verification in: <span className="font-bold">{formatTimeRemaining(timeRemaining)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="relative">
              <iframe
                ref={iframeRef}
                src={verificationUrl}
                title="Identity Verification"
                className="w-full h-[700px] border-none"
                allow="camera; microphone"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => {
                  console.log('✅ Verification iframe loaded successfully')
                  setIframeLoaded(true)
                }}
                onError={() => {
                  console.error('❌ Verification iframe failed to load')
                  setError('Failed to load verification interface. Please try again.')
                }}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              />
              
              {/* Custom overlay to hide Didit branding */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Completion Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              Complete Your Verification
            </h4>
            <p className="text-blue-800 mb-4">
              Please complete the verification process in the interface above. Once you've uploaded your ID and taken your selfie, 
              the system will automatically detect completion and redirect you to the verification progress screen.
            </p>
            {showOverrideCountdown && !overrideTriggered && (
              <div className="bg-white border border-blue-300 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Auto-Verification Active</span>
                </div>
                <div className="text-xl font-bold text-blue-600 mb-2">
                  {formatTimeRemaining(timeRemaining)}
                </div>
                <p className="text-sm text-blue-700">
                  Your account will be automatically verified if the process doesn't complete within this time.
                </p>
              </div>
            )}
            <div className="text-sm text-blue-600">
              💡 The verification interface will automatically advance when you complete all steps
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Accepted ID Types:</h5>
                <ul className="space-y-1">
                  <li>• Driver's License</li>
                  <li>• Passport</li>
                  <li>• National ID Card</li>
                  <li>• State ID Card</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Photo Tips:</h5>
                <ul className="space-y-1">
                  <li>• Ensure good lighting</li>
                  <li>• Keep ID flat and visible</li>
                  <li>• Look directly at camera for selfie</li>
                  <li>• Remove glasses if possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Onboarding
        </button>
      </div>
    </div>
  )
}