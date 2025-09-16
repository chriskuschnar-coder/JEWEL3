import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Clock, Loader2, Phone, MessageSquare, X } from 'lucide-react'
import { Logo } from '../Logo'
import { useAuth } from './AuthProvider'
import { useMobileDetection } from '../../hooks/useMobileDetection'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
  userData: any
  session: any
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail,
  userData,
  session
}) => {
  const { complete2FA } = useAuth()
  const { isMobile } = useMobileDetection()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email')
  const [userPhone, setUserPhone] = useState('')
  const [hasPhoneOnFile, setHasPhoneOnFile] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)

  // Auto-focus and format code input
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').substring(0, 6)
    setVerificationCode(numericValue)
    setError(null)
  }

  // Handle Enter key submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && !loading) {
      verifyCode()
    }
  }

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCountdown, canResend])

  // Check for phone number on mount
  useEffect(() => {
    if (userData?.phone || userData?.user_metadata?.phone) {
      const phoneNumber = userData.phone || userData.user_metadata?.phone
      setUserPhone(phoneNumber)
      setHasPhoneOnFile(true)
    } else {
      setHasPhoneOnFile(false)
    }
  }, [])

  const sendEmailCode = async () => {
    if (resendCount >= 5) {
      setError('Maximum resend attempts reached. Please wait 5 minutes before trying again.')
      return
    }

    setSendingCode(true)
    setError(null)
    setSuccess(null)
    setCodeSent(false)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: userData?.id,
          email: userEmail
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Email delivery failed. Please try SMS verification instead.')
        return
      }

      setCodeSent(true)
      setSuccess(`Verification code sent to ${userEmail}`)
      setResendCount(prev => prev + 1)
      setCanResend(false)
      setResendCountdown(30)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send email verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const sendSmsCode = async () => {
    if (!hasPhoneOnFile || !userPhone) {
      setError('No phone number on file. SMS verification not available.')
      return
    }

    if (resendCount >= 5) {
      setError('Maximum resend attempts reached. Please wait 5 minutes before trying again.')
      return
    }

    setSendingCode(true)
    setError(null)
    setSuccess(null)
    setCodeSent(false)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-sms-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: userData?.id,
          phone: userPhone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'SMS delivery failed. Please try email verification instead.')
        return
      }

      setCodeSent(true)
      setSuccess(`Verification code sent via SMS to ${userPhone}`)
      setResendCount(prev => prev + 1)
      setCanResend(false)
      setResendCountdown(30)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send SMS verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('🔐 Starting 2FA verification process...')
      const authResult = await complete2FA(verificationCode, userData, session, verificationMethod)
      
      if (authResult.success) {
        console.log('✅ 2FA verification successful, calling onSuccess immediately')
        setSuccess(`${verificationMethod === 'email' ? 'Email' : 'SMS'} verification successful! Redirecting...`)
        
        // Call onSuccess immediately without any delay to prevent flash
        setLoading(false)
        onSuccess()
      } else {
        throw new Error('Session setup failed after verification')
      }
      
    } catch (error) {
      console.error('❌ 2FA verification failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const switchToSMS = () => {
    if (!hasPhoneOnFile || !userPhone) {
      setError('No phone number on file. SMS verification not available.')
      return
    }
    
    setVerificationMethod('sms')
    setError(null)
    setSuccess(null)
    setVerificationCode('')
    setCodeSent(false)
    
    setTimeout(() => {
      sendSmsCode()
    }, 100)
  }

  const switchToEmail = () => {
    setVerificationMethod('email')
    setError(null)
    setSuccess(null)
    setVerificationCode('')
    setCodeSent(false)
    
    setTimeout(() => {
      sendEmailCode()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header - Fixed at Top */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
        <button
          onClick={() => {
            onCancel()
            // Scroll to top when canceling
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Sign In</span>
        </button>
      </div>
      
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Main 2FA Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Logo size="xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Two-Factor Authentication
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Choose your verification method and enter the 6-digit code
              </p>
            </div>

            {/* Method Selector */}
            {hasPhoneOnFile && userPhone && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Choose Verification Method:</h4>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={switchToEmail}
                    disabled={sendingCode}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      verificationMethod === 'email'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={switchToSMS}
                    disabled={sendingCode}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      verificationMethod === 'sms'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            )}

            {/* Send Code Button */}
            {!codeSent && !sendingCode && (
              <div className="mb-8">
                <button
                  onClick={verificationMethod === 'email' ? sendEmailCode : sendSmsCode}
                  disabled={sendingCode}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending {verificationMethod === 'email' ? 'Email' : 'SMS'}...</span>
                    </>
                  ) : (
                    <>
                      {verificationMethod === 'email' ? (
                        <Mail className="w-5 h-5" />
                      ) : (
                        <MessageSquare className="w-5 h-5" />
                      )}
                      <span>Send {verificationMethod === 'email' ? 'Email' : 'SMS'} Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Code Sent Status */}
            {codeSent && !success && (
              <div className={`mb-8 p-4 rounded-2xl border-2 ${
                verificationMethod === 'email' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    verificationMethod === 'email' 
                      ? 'bg-blue-100' 
                      : 'bg-green-100'
                  }`}>
                    {verificationMethod === 'email' ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Phone className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      verificationMethod === 'email' ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      Verification Code Sent
                    </h3>
                    <p className={`text-sm ${
                      verificationMethod === 'email' ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      Check your {verificationMethod === 'email' ? 'email' : 'phone'}:{' '}
                      <span className="font-medium">
                        {verificationMethod === 'email' ? userEmail : userPhone}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Verification Successful</h4>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Verification Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
                
                {/* Alternative method suggestions */}
                {verificationMethod === 'email' && error?.includes('credits exceeded') && hasPhoneOnFile && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <button
                      onClick={switchToSMS}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Try SMS Verification Instead</span>
                    </button>
                  </div>
                )}
                
                {verificationMethod === 'sms' && error?.includes('configuration issue') && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <button
                      onClick={switchToEmail}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Try Email Verification Instead</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Verification Code Input */}
            {codeSent && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                      disabled={loading || sendingCode}
                      className="w-full px-6 py-4 text-center text-2xl font-mono font-bold tracking-widest border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Enter the 6-digit code from your {verificationMethod === 'email' ? 'email' : 'text message'}
                  </p>
                </div>

                {/* Verify Button */}
                <button
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6 || sendingCode}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                {/* Resend Section */}
                <div className="text-center pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn't receive the code?
                  </p>
                  <div className="space-y-3">
                    {canResend && !sendingCode ? (
                      <button
                        onClick={verificationMethod === 'email' ? sendEmailCode : sendSmsCode}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend {verificationMethod === 'email' ? 'Email' : 'SMS'} Code</span>
                      </button>
                    ) : sendingCode ? (
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending {verificationMethod === 'email' ? 'email' : 'SMS'}...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Resend available in{' '}
                        <span className="font-mono font-bold text-blue-600">
                          {resendCountdown}s
                        </span>
                      </div>
                    )}
                    
                    {resendCount > 0 && (
                      <p className="text-xs text-gray-400">
                        Attempts: {resendCount}/5
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Initial method selection if no code sent yet */}
            {!codeSent && !sendingCode && !hasPhoneOnFile && (
              <div className="mb-8">
                <button
                  onClick={sendEmailCode}
                  disabled={sendingCode}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Email Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Security Notice</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Never share your verification code with anyone</li>
                      <li>• This code expires in {verificationMethod === 'email' ? '10' : '5'} minutes</li>
                      <li>• If you didn't request this, contact support immediately</li>
                      {verificationMethod === 'sms' && (
                        <li>• SMS charges may apply from your carrier</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center p-6 bg-white border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Need help? Contact{' '}
          <a 
            href="mailto:support@globalmarketsconsulting.com" 
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            support@globalmarketsconsulting.com
          </a>
        </p>
      </div>
    </div>
  )
}