import { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { TwoFactorChallenge } from './auth/TwoFactorChallenge'
import { KYCVerificationInProgress } from './KYCVerificationInProgress'
import { DashboardSelector } from './DashboardSelector'
import { WelcomePage } from './WelcomePage'
import { Loader2, X } from 'lucide-react'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}

function AuthenticatedApp({ onBackToHome }: AuthenticatedAppProps) {
  const { user, loading, pending2FA, pendingAuthData, signOut } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [error, setError] = useState('')
  const [showKYCProgress, setShowKYCProgress] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeUserData, setWelcomeUserData] = useState<{ email: string; full_name?: string } | null>(null)

  const handleBackToHome = () => {
    setShowInvestmentPlatform(false)
    setPlatformLoading(false)
    
    // Scroll to top when going back to home
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading only when actually loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-navy-600 mx-auto mb-3 animate-spin" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Loading Portal</h3>
        </div>
      </div>
    )
  }

  // CRITICAL: Show 2FA challenge if pending2FA is true
  if (pending2FA && pendingAuthData) {
    return (
      <TwoFactorChallenge
        onSuccess={() => {
          console.log('✅ 2FA verification successful - redirecting to dashboard')
          // Force immediate re-render by clearing pending state
          // User state should already be set by AuthProvider
        }}
        onCancel={async () => {
          console.log('❌ 2FA cancelled by user - signing out')
          await signOut()
        }}
        userEmail={pendingAuthData.userData.email}
        userData={pendingAuthData.userData}
        session={pendingAuthData.session}
      />
    )
  }

  // Show auth forms if no user AND not pending 2FA
  if (!user && !pending2FA) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={(userData?: { email: string; full_name?: string }) => {
              try {
                console.log('✅ Signup success')
                if (userData) {
                  // Show welcome page for new users
                  setWelcomeUserData(userData)
                  setShowWelcome(true)
                  setShowSignup(false)
                } else {
                  // Fallback to login
                  setShowSignup(false)
                }
              } catch (err) {
                console.error('❌ Signup success handler error:', err);
                setError('Login transition failed');
              }
            }}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {
              try {
                console.log('🎉 Login success callback - checking for 2FA requirement')
                // Login success is handled by AuthProvider
              } catch (err) {
                console.error('❌ Login success handler error:', err);
                setError('Login transition failed');
              }
            }}
            onSwitchToSignup={() => setShowSignup(true)}
            onBackToHome={onBackToHome}
          />
        )}
      </div>
    )
  }

  // Show welcome page for new users
  if (showWelcome && welcomeUserData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WelcomePage
          userEmail={welcomeUserData.email}
          userName={welcomeUserData.full_name}
          onContinueToLogin={() => {
            setShowWelcome(false)
            setWelcomeUserData(null)
            setShowSignup(false)
            // This will show the login form
          }}
        />
      </div>
    )
  }

  // Show KYC verification progress if user is authenticated but not verified
  if (user && !pending2FA && showKYCProgress) {
    return (
      <KYCVerificationInProgress
        onContinueBrowsing={() => setShowKYCProgress(false)}
        onFundPortfolio={() => {
          setShowKYCProgress(false)
          // Will be handled by DashboardSelector
        }}
        onResubmitKYC={() => {
          // Trigger KYC resubmission flow
          setShowKYCProgress(false)
          // Could trigger DiditKYCVerification component
        }}
      />
    )
  }

  // Block access if pending 2FA (safety check)
  if (pending2FA) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Required</h3>
          <p className="text-gray-600 mb-4">Please complete 2FA verification to continue</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  try {
    return <DashboardSelector onShowKYCProgress={() => setShowKYCProgress(true)} />
  } catch (err) {
    console.error('❌ Dashboard render error:', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

interface InvestmentPlatformProps {
  onBackToHome?: () => void
}

export function InvestmentPlatform({ onBackToHome }: InvestmentPlatformProps) {
  try {
    return (
      <AuthenticatedApp onBackToHome={onBackToHome} />
    )
  } catch (err) {
    console.error('❌ Investment platform error:', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Error</h3>
          <p className="text-gray-600 mb-4">Failed to initialize investment platform</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}