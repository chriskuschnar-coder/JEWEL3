import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Shield, Trash2, MapPin, Monitor, Clock, MoreVertical } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { TwoFactorSetup } from '../auth/TwoFactorSetup'

interface TrustedDevice {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  lastUsed: string
  current: boolean
  trusted: boolean
}

export function AuthSettings() {
  const { user } = useAuth()
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([])

  const generateTrustedDevices = (): TrustedDevice[] => {
    return [
      {
        id: '1',
        name: 'MacBook Pro',
        type: 'desktop',
        browser: 'Chrome 120',
        location: 'Miami, FL',
        lastUsed: '2 minutes ago',
        current: true,
        trusted: true
      },
      {
        id: '2',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        browser: 'Safari Mobile',
        location: 'Miami, FL',
        lastUsed: '1 hour ago',
        current: false,
        trusted: true
      },
      {
        id: '3',
        name: 'Windows Desktop',
        type: 'desktop',
        browser: 'Edge 120',
        location: 'New York, NY',
        lastUsed: '2 days ago',
        current: false,
        trusted: false
      }
    ]
  }

  React.useEffect(() => {
    setTrustedDevices(generateTrustedDevices())
  }, [])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5" />
      case 'tablet': return <Smartphone className="h-5 w-5" />
      default: return <Monitor className="h-5 w-5" />
    }
  }

  const getDeviceColor = (device: TrustedDevice) => {
    if (device.current) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    if (device.trusted) return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
  }

  const revokeDevice = (deviceId: string) => {
    setTrustedDevices(prev => prev.filter(device => device.id !== deviceId))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Two-Factor Authentication */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <span>Two-Factor Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-center space-x-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${user?.two_factor_enabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                `}>
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user?.two_factor_enabled ? 'Two-Factor Enabled' : 'Two-Factor Disabled'}
                  </h3>
                  <p className="text-white/70">
                    {user?.two_factor_enabled 
                      ? `Protected with ${user.two_factor_method || 'email'} verification`
                      : 'Add an extra layer of security to your account'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={user?.two_factor_enabled ? 'success' : 'error'}
                  className="backdrop-blur-sm"
                >
                  {user?.two_factor_enabled ? 'Active' : 'Inactive'}
                </Badge>
                
                <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
                  <DialogTrigger asChild>
                    <Button
                      variant={user?.two_factor_enabled ? 'outline' : 'default'}
                      className="backdrop-blur-sm"
                    >
                      {user?.two_factor_enabled ? 'Manage' : 'Enable 2FA'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50">
                    <DialogHeader>
                      <DialogTitle className="text-white">Two-Factor Authentication Setup</DialogTitle>
                    </DialogHeader>
                    <TwoFactorSetup
                      onComplete={() => setShowTwoFactorSetup(false)}
                      onCancel={() => setShowTwoFactorSetup(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {user?.two_factor_enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">2FA Protection Active</span>
                </div>
                <p className="text-emerald-200/80 text-sm">
                  Your account requires verification codes for all sign-ins and sensitive operations.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trusted Devices */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Monitor className="h-5 w-5 text-purple-400" />
                </div>
                <span>Trusted Devices</span>
              </div>
              <Badge variant="outline" className="text-white/70 border-white/20">
                {trustedDevices.length} devices
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trustedDevices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className={`
                  group p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
                  ${getDeviceColor(device)} hover:shadow-lg
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${device.current ? 'bg-emerald-600/30' : device.trusted ? 'bg-blue-600/30' : 'bg-amber-600/30'}
                    `}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{device.name}</h4>
                        {device.current && (
                          <Badge variant="success" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <span>{device.browser}</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{device.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{device.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!device.current && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeDevice(device.id)}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/20 backdrop-blur-sm"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Revoke
                        </Button>
                      </motion.div>
                    )}
                    
                    <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center pt-4"
            >
              <p className="text-white/60 text-sm">
                Devices you've used to sign in are automatically added to your trusted list
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}