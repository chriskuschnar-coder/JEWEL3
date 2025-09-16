import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Monitor, Smartphone, Shield, AlertTriangle, CheckCircle, Eye, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface LoginAttempt {
  id: string
  timestamp: string
  device: string
  browser: string
  location: string
  ip: string
  status: 'success' | 'failed' | 'suspicious'
  method: '2fa' | 'password' | 'biometric'
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export function LoginHistoryTable() {
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'success' | 'failed' | 'suspicious'>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const generateLoginHistory = (): LoginAttempt[] => {
    const now = new Date()
    const history: LoginAttempt[] = []
    
    for (let i = 0; i < 12; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000 * Math.random() * 24) // Random within last 24 days
      const statuses: ('success' | 'failed' | 'suspicious')[] = ['success', 'success', 'success', 'failed', 'suspicious']
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      const devices = [
        { name: 'MacBook Pro', browser: 'Chrome 120', type: 'desktop' as const },
        { name: 'iPhone 15 Pro', browser: 'Safari Mobile', type: 'mobile' as const },
        { name: 'Windows Desktop', browser: 'Edge 120', type: 'desktop' as const },
        { name: 'iPad Air', browser: 'Safari', type: 'tablet' as const }
      ]
      
      const locations = ['Miami, FL', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Unknown Location']
      const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1']
      
      const device = devices[Math.floor(Math.random() * devices.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const ip = ips[Math.floor(Math.random() * ips.length)]
      
      history.push({
        id: `login-${i}`,
        timestamp: timestamp.toISOString(),
        device: device.name,
        browser: device.browser,
        location,
        ip,
        status,
        method: status === 'success' ? '2fa' : 'password',
        deviceType: device.type
      })
    }
    
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  useEffect(() => {
    setLoginHistory(generateLoginHistory())
  }, [])

  const getFilteredHistory = () => {
    if (selectedFilter === 'all') return loginHistory
    return loginHistory.filter(attempt => attempt.status === selectedFilter)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'suspicious': return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'suspicious': return <Eye className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredHistory = getFilteredHistory()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <span>Login History</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {(['all', 'success', 'failed', 'suspicious'] as const).map(filter => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`
                  backdrop-blur-sm transition-all duration-200
                  ${selectedFilter === filter 
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No login history found for selected filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className={`
                  group p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer
                  ${attempt.status === 'suspicious' 
                    ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' 
                    : attempt.status === 'failed'
                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }
                `}
                onClick={() => setShowDetails(showDetails === attempt.id ? null : attempt.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${getStatusColor(attempt.status)}
                    `}>
                      {attempt.deviceType === 'mobile' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{attempt.device}</h4>
                        <Badge 
                          variant={attempt.status === 'success' ? 'success' : attempt.status === 'failed' ? 'error' : 'warning'}
                          className="backdrop-blur-sm"
                        >
                          {getStatusIcon(attempt.status)}
                          <span className="ml-1 capitalize">{attempt.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <span>{attempt.browser}</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{attempt.location}</span>
                        </div>
                        <span>{formatTimestamp(attempt.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className="text-white/60 border-white/20 backdrop-blur-sm"
                    >
                      {attempt.method.toUpperCase()}
                    </Badge>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                {/* Expandable Details */}
                {showDetails === attempt.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">IP Address:</span>
                        <div className="font-mono text-white">{attempt.ip}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Full Timestamp:</span>
                        <div className="font-mono text-white">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/60">Method:</span>
                        <div className="text-white capitalize">{attempt.method}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Device Type:</span>
                        <div className="text-white capitalize">{attempt.deviceType}</div>
                      </div>
                    </div>
                    
                    {attempt.status === 'suspicious' && (
                      <div className="mt-4 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-300 font-medium">Suspicious Activity Detected</span>
                        </div>
                        <p className="text-amber-200/80 text-sm">
                          This login attempt was flagged due to unusual location or device patterns.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center pt-6 border-t border-white/10"
        >
          <p className="text-white/60 text-sm">
            Login history is retained for 90 days for security monitoring
          </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}