import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, Lock, Key, Smartphone, Eye } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

interface SecurityScore {
  overall: number
  factors: {
    twoFactor: boolean
    strongPassword: boolean
    recentActivity: boolean
    deviceSecurity: boolean
    recoverySetup: boolean
  }
  recommendations: string[]
}

export function SecurityOverview() {
  const { user } = useAuth()
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)

  const calculateSecurityScore = (): SecurityScore => {
    const factors = {
      twoFactor: user?.two_factor_enabled || false,
      strongPassword: true, // Assume strong password for demo
      recentActivity: true, // Recent login activity
      deviceSecurity: true, // Trusted devices
      recoverySetup: !!(user?.phone) // Has recovery phone
    }

    const enabledFactors = Object.values(factors).filter(Boolean).length
    const overall = Math.floor((enabledFactors / 5) * 100)

    const recommendations = []
    if (!factors.twoFactor) recommendations.push('Enable two-factor authentication')
    if (!factors.recoverySetup) recommendations.push('Add recovery phone number')
    if (recommendations.length === 0) recommendations.push('Your security is excellent!')

    return { overall, factors, recommendations }
  }

  useEffect(() => {
    const score = calculateSecurityScore()
    setSecurityScore(score)

    // Animate score counter
    let current = 0
    const target = score.overall
    const increment = target / 60 // 60 frames for smooth animation
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedScore(target)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, 16) // ~60fps

    return () => clearInterval(timer)
  }, [user])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-green-500/10'
    if (score >= 60) return 'from-amber-500/20 to-yellow-500/10'
    return 'from-red-500/20 to-rose-500/10'
  }

  const getScoreBorder = (score: number) => {
    if (score >= 80) return 'border-emerald-500/30'
    if (score >= 60) return 'border-amber-500/30'
    return 'border-red-500/30'
  }

  if (!securityScore) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
            <div className="h-32 bg-white/10 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Create circular progress path
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Security Score Hero Card */}
      <Card className={`
        relative overflow-hidden backdrop-blur-xl
        bg-gradient-to-br ${getScoreGradient(securityScore.overall)}
        border ${getScoreBorder(securityScore.overall)} shadow-2xl
      `}>
        {/* Floating Background Elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"
        />
        
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Security Score */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="relative inline-block mb-6"
              >
                <svg width="140" height="140" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className={getScoreColor(securityScore.overall)}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                
                {/* Score Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className={`text-3xl font-bold ${getScoreColor(securityScore.overall)}`}
                    >
                      {animatedScore}%
                    </motion.div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">
                      Secure
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Account Security
                </h2>
                <p className="text-white/80 text-lg">
                  Your account is {securityScore.overall >= 80 ? 'highly' : securityScore.overall >= 60 ? 'moderately' : 'minimally'} secure
                </p>
              </motion.div>
            </div>
            
            {/* Right: Security Factors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="space-y-4"
            >
              {[
                { key: 'twoFactor', label: 'Two-Factor Authentication', icon: Smartphone },
                { key: 'strongPassword', label: 'Strong Password', icon: Lock },
                { key: 'recentActivity', label: 'Recent Activity', icon: Eye },
                { key: 'deviceSecurity', label: 'Device Security', icon: Shield },
                { key: 'recoverySetup', label: 'Recovery Setup', icon: Key }
              ].map((factor, index) => (
                <motion.div
                  key={factor.key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                  className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${securityScore.factors[factor.key as keyof typeof securityScore.factors] 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'}
                    `}>
                      <factor.icon className="h-4 w-4" />
                    </div>
                    <span className="text-white font-medium">{factor.label}</span>
                  </div>
                  
                  <Badge 
                    variant={securityScore.factors[factor.key as keyof typeof securityScore.factors] ? 'success' : 'error'}
                    className="backdrop-blur-sm"
                  >
                    {securityScore.factors[factor.key as keyof typeof securityScore.factors] ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {securityScore.factors[factor.key as keyof typeof securityScore.factors] ? 'Enabled' : 'Disabled'}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Recommendations */}
          {securityScore.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-400" />
                Security Recommendations
              </h3>
              <ul className="space-y-2">
                {securityScore.recommendations.map((rec, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 + index * 0.1, duration: 0.4 }}
                    className="flex items-center space-x-2 text-white/80"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}