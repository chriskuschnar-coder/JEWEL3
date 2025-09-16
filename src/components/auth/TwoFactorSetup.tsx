import React, { useState } from 'react'
import { Shield, Mail, Smartphone, CheckCircle, AlertCircle, ArrowLeft, Copy, RefreshCw, Fingerprint, Phone, MessageSquare } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
  preferredMethod?: 'email' | 'sms'
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel, preferredMethod }) => {
  const { user } = useAuth()
  const [step, setStep] = useState<'method' | 'email' | 'biometric' | 'verify'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | 'biometric' | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [userPhone, setUserPhone] = useState('')

  // Check biometric support on component mount
  React.useEffect(() => {
    checkBiometricSupport()
    // Get user phone number if available
    if (user?.phone) {
      setUserPhone(user.phone)
    }
    // Auto-select preferred method if provided
    if (preferredMethod && preferredMethod !== 'biometric') {
      setSelectedMethod(preferredMethod)
      setStep(preferredMethod === 'email' ? 'email' : 'email') // Reuse email step for SMS
    }
  }, [])

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn is supported
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricSupported(available)
        console.log('🔐 Biometric authentication available:', available)
      }
    } catch (error) {
      console.log('🔐 Biometric check failed:', error)
      setBiometricSupported(false)
    }
  }

  const sendEmailCode = async () => {
    if (!user?.email && selectedMethod === 'email') {
      setError('No email address found')
      return
    }
    
    if (!userPhone && selectedMethod === 'sms') {
      setError('No phone number found')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get user session for authentication
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      // Call the send-2fa-code edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          method: selectedMethod,
          email: user.email,
          phone: selectedMethod === 'sms' ? userPhone : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      const result = await response.json()
      setSuccess(`Verification code sent to ${selectedMethod === 'email' ? user.email : userPhone}`)
      setStep('verify')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const setupBiometric = async () => {
    setLoading(true)
    setError('')

    try {
      // Create WebAuthn credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Global Markets Consulting",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(user?.id || 'user'),
            name: user?.email || 'user@example.com',
            displayName: user?.full_name || user?.email || 'User',
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      })

      if (credential) {
        console.log('🔐 Biometric credential created:', credential.id)
        setBiometricEnabled(true)
        setSuccess('Biometric authentication enabled successfully!')
        
        // Store credential ID for future use
        localStorage.setItem('biometric_credential_id', credential.id)
        
        setTimeout(() => {
          onComplete()
        }, 1500)
      }
    } catch (error) {
      console.error('🔐 Biometric setup failed:', error)
      if (error.name === 'NotAllowedError') {
        setError('Biometric authentication was cancelled or not allowed')
      } else if (error.name === 'NotSupportedError') {
        setError('Biometric authentication is not supported on this device')
      } else {
        setError('Failed to set up biometric authentication')
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get user session for authentication
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      // Call the verify-2fa-code edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          code: verificationCode,
          method: 'email',
          email: user.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Verification failed')
      }

      const result = await response.json()
      
      if (result.valid) {
        setSuccess('Email verification successful!')
        
        // Update user's 2FA status in database
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ two_factor_enabled: true })
          .eq('id', user?.id)

        if (updateError) {
          console.error('Failed to update 2FA status:', updateError)
        }

        setTimeout(() => {
          onComplete()
        }, 1500)
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    await sendEmailCode()
  }

  if (step === 'method') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enable Two-Factor Authentication</h2>
          <p className="text-gray-600">Choose your preferred security method</p>
        </div>

        <div className="space-y-4">
          {/* Email 2FA Option */}
          <button
            onClick={() => {
              setSelectedMethod('email')
              setStep('email')
            }}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Email Verification</h3>
                <p className="text-sm text-gray-600">Receive codes via email</p>
                <p className="text-xs text-green-600 mt-1">✓ Works on all devices</p>
              </div>
            </div>
          </button>

          {/* SMS 2FA Option */}
          {userPhone && (
            <button
              onClick={() => {
                setSelectedMethod('sms')
                setStep('email') // Reuse the same step for SMS
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">SMS Verification</h3>
                  <p className="text-sm text-gray-600">Receive codes via text message</p>
                  <p className="text-xs text-green-600 mt-1">✓ Works without internet • {userPhone}</p>
                </div>
              </div>
            </button>
          )}

          {/* Biometric 2FA Option */}
          <button
            onClick={() => {
              setSelectedMethod('biometric')
              setStep('biometric')
            }}
            disabled={!biometricSupported}
            className={`w-full p-6 border-2 rounded-xl transition-all text-left group ${
              biometricSupported 
                ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50' 
                : 'border-gray-100 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                biometricSupported 
                  ? 'bg-purple-100 group-hover:bg-purple-200' 
                  : 'bg-gray-200'
              }`}>
                <Fingerprint className={`h-6 w-6 ${biometricSupported ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${biometricSupported ? 'text-gray-900' : 'text-gray-500'}`}>
                  Biometric Authentication
                </h3>
                <p className={`text-sm ${biometricSupported ? 'text-gray-600' : 'text-gray-400'}`}>
                  {biometricSupported ? 'Face ID, Touch ID, or Fingerprint' : 'Not supported on this device'}
                </p>
                {biometricSupported && (
                  <p className="text-xs text-purple-600 mt-1">✓ Most secure option</p>
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Why Enable 2FA?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Protects your investment account from unauthorized access</li>
            <li>• Required for withdrawals and sensitive operations</li>
            <li>• Industry standard for financial platforms</li>
            <li>• Can be disabled later if needed</li>
            {userPhone && <li>• SMS backup available if email is unavailable</li>}
          </ul>
        </div>
      </div>
    )
  }

  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('method')}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            selectedMethod === 'email' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {selectedMethod === 'email' ? (
              <Mail className="h-8 w-8 text-blue-600" />
            ) : (
              <Phone className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedMethod === 'email' ? 'Email' : 'SMS'} Verification
          </h2>
          <p className="text-gray-600">
            We'll send verification codes to your {selectedMethod === 'email' ? 'email' : 'phone'}
          </p>
        </div>

        <div className={`border rounded-lg p-4 mb-6 ${
          selectedMethod === 'email' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {selectedMethod === 'email' ? (
              <Mail className="h-5 w-5 text-blue-600" />
            ) : (
              <Phone className="h-5 w-5 text-green-600" />
            )}
            <span className={`font-medium ${
              selectedMethod === 'email' ? 'text-blue-900' : 'text-green-900'
            }`}>
              {selectedMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </span>
          </div>
          <p className={selectedMethod === 'email' ? 'text-blue-800' : 'text-green-800'}>
            {selectedMethod === 'email' ? user?.email : userPhone}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            When you sign in, we'll send a 6-digit verification code to your {selectedMethod === 'email' ? 'email address' : 'phone number'}. 
            You'll need to enter this code to complete the login process.
          </p>

          <button
            onClick={sendEmailCode}
            disabled={loading}
            className={`w-full disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
              selectedMethod === 'email' 
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' 
                : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending Test {selectedMethod === 'email' ? 'Email' : 'SMS'}...
              </>
            ) : (
              <>
                {selectedMethod === 'email' ? (
                  <Mail className="h-4 w-4 mr-2" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Send Test {selectedMethod === 'email' ? 'Email' : 'SMS'} Code
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            We'll send a test code to verify your {selectedMethod === 'email' ? 'email' : 'phone'} works correctly
          </p>
        </div>
      </div>
    )
  }

  if (step === 'biometric') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('method')}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Biometric Authentication</h2>
          <p className="text-gray-600">Use Face ID, Touch ID, or fingerprint to secure your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-purple-900 mb-2">Biometric Features</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Works with Face ID, Touch ID, Windows Hello</li>
            <li>• Most secure authentication method</li>
            <li>• No codes to remember or type</li>
            <li>• Works offline on your device</li>
          </ul>
        </div>

        <button
          onClick={setupBiometric}
          disabled={loading || biometricEnabled}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Setting up biometric...
            </>
          ) : biometricEnabled ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Biometric Enabled
            </>
          ) : (
            <>
              <Fingerprint className="h-4 w-4 mr-2" />
              Enable Biometric Authentication
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your biometric data stays on your device and is never sent to our servers
        </p>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('email')}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600">Check your email for the 6-digit code</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <button
            onClick={verifyEmailCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={resendCode}
              disabled={loading}
              className={`text-sm font-medium ${
                selectedMethod === 'email' 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              Resend {selectedMethod === 'email' ? 'Email' : 'SMS'} Code
            </button>
          </div>

        </div>
      </div>
    )
  }

  return null
}