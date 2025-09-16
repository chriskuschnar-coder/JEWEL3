import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { SecurityOverview } from './security/SecurityOverview'
import { AuthSettings } from './security/AuthSettings'
import { LoginHistoryTable } from './security/LoginHistoryTable'
import { RecoveryOptions } from './security/RecoveryOptions'
import { Button } from './ui/button'

interface SecuritySettingsProps {
  onBack?: () => void
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Floating Background Orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Security Center
              </h1>
              <p className="text-gray-400 text-lg">
                Protect your investment account
              </p>
            </div>
          </div>
          
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </motion.div>
        
        {/* Security Overview */}
        <SecurityOverview />
        
        {/* Authentication Settings */}
        <AuthSettings />
        
        {/* Login History */}
        <LoginHistoryTable />
        
        {/* Recovery Options */}
        <RecoveryOptions />
      </div>
    </div>
  )
}