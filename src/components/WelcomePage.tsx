import React, { useState, useEffect } from 'react'
import { CheckCircle, ArrowRight, Mail, TrendingUp, Shield, Award, Sparkles } from 'lucide-react'
import { Logo } from './Logo'

interface WelcomePageProps {
  userEmail: string
  userName?: string
  onContinueToLogin: () => void
}

export function WelcomePage({ userEmail, userName, onContinueToLogin }: WelcomePageProps) {
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Staggered animation entrance
    setTimeout(() => setShowContent(true), 300)
    setTimeout(() => setShowButton(true), 800)
    setTimeout(() => setShowConfetti(true), 500)
  }, [])

  const displayName = userName || userEmail.split('@')[0]

  return (
    <>
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Particles */}
        {showConfetti && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#3b82f6', '#1e40af', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-up {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Main Success Icon */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 animate-scale-in">
              <Logo size="xl" />
            </div>

            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                🎉 Congratulations!
              </h1>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-600 mb-6">
                Welcome to Global Markets Consulting
              </h2>
              
              <p className="text-lg md:text-xl text-gray-600 mb-2">
                Hello <span className="font-semibold text-gray-900">{displayName}</span>,
              </p>
              
              <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                Your account has been created successfully. You're now ready to access our institutional-grade investment platform.
              </p>
            </div>
          </div>

          {/* Welcome Features */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-xl mb-8 animate-slide-up">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <Logo size="large" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">SEC Registered</h3>
                  <p className="text-sm text-gray-600">Fully compliant investment advisor</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">SIPC Protected</h3>
                  <p className="text-sm text-gray-600">Investments protected up to $500,000</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Institutional Grade</h3>
                  <p className="text-sm text-gray-600">Professional portfolio management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-8 animate-slide-up">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-blue-900">Welcome Email Sent</span>
              </div>
              <p className="text-blue-800 text-sm md:text-base">
                We've sent a welcome email to <span className="font-semibold">{userEmail}</span> with your account details and next steps.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <button
              onClick={onContinueToLogin}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-scale-in"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                <span>Continue to Login</span>
                <ArrowRight className="h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              You'll complete 2FA setup and account verification next
            </p>
          </div>

          {/* Next Steps Preview */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="mt-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-2 text-gold-600" />
                What's Next?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Secure your account with 2FA</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Document Review</h4>
                    <p className="text-sm text-gray-600">Sign investment agreements</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Identity Verification</h4>
                    <p className="text-sm text-gray-600">Complete KYC process</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fund Account</h4>
                    <p className="text-sm text-gray-600">Begin investing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}