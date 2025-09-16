import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, Phone, Shield, X } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onBackToHome?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin, onBackToHome }) => {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '')
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ]

  const isPasswordValid = passwordRequirements.every(req => req.met)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone
      })
      
      if (result.error) {
        setError(result.error.message)
      } else if (result.showWelcome) {
        onSuccess?.(result.userData)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8 md:p-8 transition-colors duration-300">
      <div className="w-full max-w-lg mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8 md:mb-10 px-2">
          <button
            onClick={() => {
              onBackToHome?.()
              // Scroll to top when going back to home
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center space-x-2 text-neutral-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
            Back to Home
            </span>
          </button>
          <button
            onClick={() => {
              onBackToHome?.()
              // Scroll to top when going back to home
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 -mr-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Signup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 p-6 md:p-8 shadow-xl backdrop-blur-sm transition-colors duration-300 mx-2 md:mx-0">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-gray-100 mb-4 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-neutral-600 dark:text-gray-400 text-base md:text-lg mb-4">
              Join our exclusive investment platform
            </p>
            
            {/* Security Badges */}
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-neutral-600 dark:text-gray-400 border border-neutral-300 dark:border-gray-600">
                <Shield className="w-3 h-3 mr-1" />
                <span>SEC Registered</span>
              </div>
              <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-neutral-600 dark:text-gray-400 border border-neutral-300 dark:border-gray-600">
                <span>SIPC Protected</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-50 border-red-200 mx-2 md:mx-0 mb-8">
              <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-error-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-error-900">Registration Error</h4>
                  <p className="text-sm text-error-700">{error}</p>
                </div>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 px-2 md:px-0">
            <div>
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Phone Number (Optional)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                placeholder="(555) 123-4567"
                maxLength={14}
                autoComplete="tel"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                required
                autoComplete="new-password"
              />
            </div>
            
            {/* Password Requirements */}
            {formData.password && (
              <Card className="bg-neutral-50 border-neutral-200 mx-2 md:mx-0">
                <CardContent className="p-4">
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Password Requirements</h4>
                <div className="grid grid-cols-1 gap-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.met ? (
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-neutral-300 rounded-full" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-success-700' : 'text-neutral-600'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}

            {/* Terms Agreement */}
            <Card className="bg-neutral-50 border-neutral-200 mx-2 md:mx-0">
              <CardContent className="p-4">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-primary-600 bg-white border-2 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5 transition-colors"
                  required
                />
                <div className="ml-3">
                  <p className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium underline">
                      Privacy Policy
                    </a>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    By creating an account, you acknowledge our regulatory disclosures
                  </p>
                </div>
              </label>
              </CardContent>
            </Card>

            {/* Create Account Button */}
            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={loading || !isPasswordValid || !passwordsMatch || !agreedToTerms}
              variant="gradient"
            >
              {loading ? 'Creating Account...' : 'Create Investment Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center px-2 md:px-0">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <Button
                onClick={onSwitchToLogin}
                variant="link"
                className="p-0 h-auto"
              >
                Access Portal
              </Button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-10 text-center px-4">
          <div className="flex items-center justify-center space-x-4 md:space-x-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
          </div>
          <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
            © 2025 Global Markets Consulting LLC • SEC Registered Investment Advisor
          </p>
        </div>
      </div>
    </div>
  )
}