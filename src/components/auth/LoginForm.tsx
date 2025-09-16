import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Mail, Lock, AlertCircle, ArrowLeft, Shield, X } from 'lucide-react'
import { Logo } from '../Logo'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  onBackToHome?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, onBackToHome }) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login for:', email)
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('❌ Login failed:', result.error.message)
        setError(result.error.message)
        setLoading(false)
      } else if (result.requires2FA) {
        console.log('🔐 2FA REQUIRED - login successful, 2FA challenge will show')
        setLoading(false)
        // Don't call onSuccess yet - wait for 2FA completion
      } else {
        console.log('✅ Login successful, no 2FA required')
        setLoading(false)
        onSuccess?.()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error - please try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header - Fixed at Top */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
        <button
          onClick={() => {
            onBackToHome?.()
            // Scroll to top when going back to home
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </button>
        <button
          onClick={onBackToHome}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Sign in to your investment account
            </p>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200">
                <Shield className="w-4 h-4" />
                <span>SEC Registered • SIPC Protected</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-900">Sign In Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <span>{loading ? 'Accessing Portal...' : 'Access Professional Portal'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">New to Global Markets?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Join our exclusive investment platform
            </p>
            <button
              onClick={onSwitchToSignup}
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200"
            >
              Create Investment Account
            </button>
          </div>
        </div>

      </div>
      </div>
      
      {/* Footer */}
      <div className="text-center p-6 bg-white border-t border-gray-100">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
        </div>
        <p className="text-xs text-gray-400">
          © 2025 Global Markets Consulting LLC • SEC Registered Investment Advisor
        </p>
      </div>
    </div>
  )
}