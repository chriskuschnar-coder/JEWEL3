import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Key, Edit3, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'

interface RecoveryMethod {
  type: 'email' | 'phone' | 'backup_codes'
  label: string
  value?: string
  status: 'verified' | 'unverified' | 'missing'
  icon: React.ComponentType<any>
  description: string
}

export function RecoveryOptions() {
  const { user } = useAuth()
  const [recoveryMethods, setRecoveryMethods] = useState<RecoveryMethod[]>([])
  const [editingMethod, setEditingMethod] = useState<string | null>(null)
  const [newValue, setNewValue] = useState('')

  const generateRecoveryMethods = (): RecoveryMethod[] => {
    return [
      {
        type: 'email',
        label: 'Recovery Email',
        value: user?.email,
        status: 'verified',
        icon: Mail,
        description: 'Primary email for account recovery and security notifications'
      },
      {
        type: 'phone',
        label: 'Recovery Phone',
        value: user?.phone || undefined,
        status: user?.phone ? 'verified' : 'missing',
        icon: Phone,
        description: 'Phone number for SMS recovery codes and alerts'
      },
      {
        type: 'backup_codes',
        label: 'Backup Codes',
        value: user?.two_factor_backup_codes?.length ? `${user.two_factor_backup_codes.length} codes` : undefined,
        status: user?.two_factor_backup_codes?.length ? 'verified' : 'missing',
        icon: Key,
        description: 'One-time backup codes for account recovery'
      }
    ]
  }

  React.useEffect(() => {
    setRecoveryMethods(generateRecoveryMethods())
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      case 'unverified': return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      case 'missing': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'unverified': return <AlertCircle className="h-4 w-4" />
      case 'missing': return <AlertCircle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const handleSaveMethod = (methodType: string) => {
    // In a real app, this would update the user's recovery method
    console.log(`Updating ${methodType} to:`, newValue)
    setEditingMethod(null)
    setNewValue('')
    
    // Update local state for demo
    setRecoveryMethods(prev => prev.map(method => 
      method.type === methodType 
        ? { ...method, value: newValue, status: 'verified' as const }
        : method
    ))
  }

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    )
    
    // In a real app, this would save to the database
    console.log('Generated backup codes:', codes)
    
    setRecoveryMethods(prev => prev.map(method => 
      method.type === 'backup_codes' 
        ? { ...method, value: `${codes.length} codes`, status: 'verified' as const }
        : method
    ))
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

  const methodVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
            <Key className="h-5 w-5 text-orange-400" />
          </div>
          <span>Account Recovery</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {recoveryMethods.map((method, index) => (
            <motion.div
              key={method.type}
              variants={methodVariants}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className={`
                group p-6 rounded-xl border backdrop-blur-sm transition-all duration-300
                ${getStatusColor(method.status)} hover:shadow-lg
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${method.status === 'verified' ? 'bg-emerald-600/30' : 
                      method.status === 'unverified' ? 'bg-amber-600/30' : 'bg-red-600/30'}
                  `}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-white">{method.label}</h3>
                      <Badge 
                        variant={method.status === 'verified' ? 'success' : method.status === 'unverified' ? 'warning' : 'error'}
                        className="backdrop-blur-sm"
                      >
                        {getStatusIcon(method.status)}
                        <span className="ml-1 capitalize">{method.status}</span>
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{method.description}</p>
                    {method.value && (
                      <div className="font-mono text-white/90 text-sm">
                        {method.type === 'phone' && method.value.length > 10 
                          ? `***-***-${method.value.slice(-4)}`
                          : method.type === 'email' && method.value.includes('@')
                          ? `${method.value.split('@')[0].slice(0, 3)}***@${method.value.split('@')[1]}`
                          : method.value
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {method.type === 'backup_codes' ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          {method.status === 'missing' ? 'Generate' : 'Regenerate'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50">
                        <DialogHeader>
                          <DialogTitle className="text-white">Backup Recovery Codes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-gray-300">
                            Generate new backup codes for account recovery. Store these securely.
                          </p>
                          <Button
                            onClick={generateBackupCodes}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            Generate New Codes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Dialog open={editingMethod === method.type} onOpenChange={(open) => setEditingMethod(open ? method.type : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          {method.status === 'missing' ? 'Add' : 'Edit'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50">
                        <DialogHeader>
                          <DialogTitle className="text-white">Update {method.label}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type={method.type === 'email' ? 'email' : 'tel'}
                            placeholder={method.type === 'email' ? 'Enter email address' : 'Enter phone number'}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleSaveMethod(method.type)}
                              disabled={!newValue}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingMethod(null)
                                setNewValue('')
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 p-6 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-300">Security Best Practices</h3>
          </div>
          <ul className="space-y-2 text-blue-200/80 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Keep recovery methods up to date</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Store backup codes in a secure location</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Review login history regularly</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Never share recovery codes with anyone</span>
            </li>
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  )
}