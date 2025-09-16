import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  X,
  AlertTriangle,
  Calendar,
  BarChart3,
  Settings,
  Download,
  UserPlus,
  CreditCard,
  Building,
  Clock,
  Target,
  Activity,
  Database,
  Server,
  Zap
} from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

interface AdminUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  kyc_status: string
  documents_completed: boolean
  two_factor_enabled: boolean
  role: string
  is_admin: boolean
  created_at: string
  last_login?: string
  account?: {
    balance: number
    total_deposits: number
    total_withdrawals: number
    status: string
  }
}

interface AdminTransaction {
  id: string
  user_id: string
  type: string
  method: string
  amount: number
  status: string
  created_at: string
  description?: string
  user_email?: string
  user_name?: string
}

interface ComplianceRecord {
  id: string
  user_id: string
  provider: string
  verification_type: string
  status: string
  verification_id?: string
  created_at: string
  updated_at: string
  user_email?: string
  user_name?: string
}

interface SignedDocument {
  id: string
  user_id: string
  document_title: string
  document_type: string
  signed_at: string
  ip_address?: string
  user_email?: string
  user_name?: string
}

interface SystemStats {
  totalUsers: number
  totalAUM: number
  totalDeposits: number
  totalTransactions: number
  pendingKYC: number
  verifiedUsers: number
  activeAccounts: number
  totalDocuments: number
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // Data states
  const [users, setUsers] = useState<AdminUser[]>([])
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([])
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAUM: 0,
    totalDeposits: 0,
    totalTransactions: 0,
    pendingKYC: 0,
    verifiedUsers: 0,
    activeAccounts: 0,
    totalDocuments: 0
  })
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [complianceSearch, setComplianceSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  // Check if user is admin
  const isAdmin = user?.is_admin === true || user?.role === 'admin'

  const loadAllData = async () => {
    if (!isAdmin) return
    
    setLoading(true)
    setError('')
    
    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      console.log('🔍 Loading all admin data from Supabase...')
      
      // Load all users with their account data
      console.log('👥 Loading users...')
      const { data: usersData, error: usersError } = await supabaseClient
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          kyc_status,
          documents_completed,
          two_factor_enabled,
          role,
          is_admin,
          created_at,
          last_login,
          accounts (
            balance,
            total_deposits,
            total_withdrawals,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('❌ Users query error:', usersError)
        throw new Error(`Failed to load users: ${usersError.message}`)
      }

      console.log('✅ Users loaded:', usersData?.length || 0)
      setUsers(usersData || [])

      // Load all transactions with user info
      console.log('💰 Loading transactions...')
      const { data: transactionsData, error: transactionsError } = await supabaseClient
        .from('transactions')
        .select(`
          id,
          user_id,
          type,
          method,
          amount,
          status,
          created_at,
          description,
          users!inner (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (transactionsError) {
        console.error('❌ Transactions query error:', transactionsError)
        // Don't throw error, just log it
        console.warn('Transactions table may not exist or have different structure')
        setTransactions([])
      } else {
        console.log('✅ Transactions loaded:', transactionsData?.length || 0)
        const formattedTransactions = transactionsData?.map(t => ({
          ...t,
          user_email: t.users?.email,
          user_name: t.users?.full_name
        })) || []
        setTransactions(formattedTransactions)
      }

      // Load compliance records
      console.log('🛡️ Loading compliance records...')
      const { data: complianceData, error: complianceError } = await supabaseClient
        .from('compliance_records')
        .select(`
          id,
          user_id,
          provider,
          verification_type,
          status,
          verification_id,
          created_at,
          updated_at,
          users!inner (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (complianceError) {
        console.error('❌ Compliance query error:', complianceError)
        setComplianceRecords([])
      } else {
        console.log('✅ Compliance records loaded:', complianceData?.length || 0)
        const formattedCompliance = complianceData?.map(c => ({
          ...c,
          user_email: c.users?.email,
          user_name: c.users?.full_name
        })) || []
        setComplianceRecords(formattedCompliance)
      }

      // Load signed documents
      console.log('📄 Loading signed documents...')
      const { data: documentsData, error: documentsError } = await supabaseClient
        .from('signed_documents')
        .select(`
          id,
          user_id,
          document_title,
          document_type,
          signed_at,
          ip_address,
          users!inner (
            email,
            full_name
          )
        `)
        .order('signed_at', { ascending: false })

      if (documentsError) {
        console.error('❌ Documents query error:', documentsError)
        setSignedDocuments([])
      } else {
        console.log('✅ Documents loaded:', documentsData?.length || 0)
        const formattedDocuments = documentsData?.map(d => ({
          ...d,
          user_email: d.users?.email,
          user_name: d.users?.full_name
        })) || []
        setSignedDocuments(formattedDocuments)
      }

      // Calculate system stats
      const stats: SystemStats = {
        totalUsers: usersData?.length || 0,
        totalAUM: usersData?.reduce((sum, user) => sum + (user.accounts?.[0]?.balance || 0), 0) || 0,
        totalDeposits: usersData?.reduce((sum, user) => sum + (user.accounts?.[0]?.total_deposits || 0), 0) || 0,
        totalTransactions: transactionsData?.length || 0,
        pendingKYC: usersData?.filter(user => user.kyc_status === 'pending').length || 0,
        verifiedUsers: usersData?.filter(user => user.kyc_status === 'verified').length || 0,
        activeAccounts: usersData?.filter(user => user.accounts?.[0]?.status === 'active').length || 0,
        totalDocuments: documentsData?.length || 0
      }
      
      setSystemStats(stats)
      setLastUpdated(new Date())
      
      console.log('📊 System stats calculated:', stats)

    } catch (err) {
      console.error('❌ Failed to load admin data:', err)
      setError(`Failed to load admin data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const updateUserKYCStatus = async (userId: string, newStatus: string) => {
    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      const { error } = await supabaseClient
        .from('users')
        .update({
          kyc_status: newStatus,
          kyc_verified_at: newStatus === 'verified' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setMessage(`User KYC status updated to ${newStatus}`)
      await loadAllData() // Refresh data
    } catch (err) {
      setError(`Failed to update KYC status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      const { error } = await supabaseClient
        .from('transactions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (error) throw error

      setMessage(`Transaction status updated to ${newStatus}`)
      await loadAllData() // Refresh data
    } catch (err) {
      setError(`Failed to update transaction: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const exportData = (dataType: string) => {
    let data: any[] = []
    let filename = ''
    
    switch (dataType) {
      case 'users':
        data = users
        filename = 'users_export.json'
        break
      case 'transactions':
        data = transactions
        filename = 'transactions_export.json'
        break
      case 'compliance':
        data = complianceRecords
        filename = 'compliance_export.json'
        break
      case 'documents':
        data = signedDocuments
        filename = 'documents_export.json'
        break
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isAdmin) {
      loadAllData()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  const getFilteredUsers = () => {
    if (!userSearch.trim()) return users
    const search = userSearch.toLowerCase()
    return users.filter(user => 
      user.email.toLowerCase().includes(search) ||
      (user.full_name && user.full_name.toLowerCase().includes(search)) ||
      user.id.toLowerCase().includes(search)
    )
  }

  const getFilteredTransactions = () => {
    if (!transactionSearch.trim()) return transactions
    const search = transactionSearch.toLowerCase()
    return transactions.filter(transaction => 
      transaction.user_email?.toLowerCase().includes(search) ||
      transaction.type.toLowerCase().includes(search) ||
      transaction.method.toLowerCase().includes(search) ||
      transaction.status.toLowerCase().includes(search)
    )
  }

  const getFilteredCompliance = () => {
    if (!complianceSearch.trim()) return complianceRecords
    const search = complianceSearch.toLowerCase()
    return complianceRecords.filter(record => 
      record.user_email?.toLowerCase().includes(search) ||
      record.provider.toLowerCase().includes(search) ||
      record.status.toLowerCase().includes(search) ||
      record.verification_type.toLowerCase().includes(search)
    )
  }

  const getStatusBadge = (status: string, type: 'kyc' | 'transaction' | 'compliance' | 'account') => {
    const statusMap = {
      kyc: {
        verified: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        unverified: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      transaction: {
        completed: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        failed: 'bg-red-100 text-red-800 border-red-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      compliance: {
        approved: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        expired: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      account: {
        active: 'bg-green-100 text-green-800 border-green-200',
        frozen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        closed: 'bg-red-100 text-red-800 border-red-200'
      }
    }
    
    return statusMap[type][status as keyof typeof statusMap[typeof type]] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                <p className="text-gray-600">Complete fund management and oversight</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">Admin: {user?.email}</div>
                <div className="text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</div>
              </div>
              <Button
                onClick={loadAllData}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh All Data</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>KYC/Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="nav" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>NAV Management</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${systemStats.totalAUM.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total AUM</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.verifiedUsers}</div>
                      <div className="text-sm text-gray-600">Verified Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.totalTransactions}</div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name || user.email}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                        <Badge className={getStatusBadge(user.kyc_status, 'kyc')}>
                          {user.kyc_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Recent Transactions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">${transaction.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{transaction.user_email}</div>
                        </div>
                        <Badge className={getStatusBadge(transaction.status, 'transaction')}>
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Connection</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending KYC</span>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        {systemStats.pendingKYC}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Accounts</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {systemStats.activeAccounts}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>All Users ({users.length})</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => exportData('users')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by email, name, or ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">KYC Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">2FA</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Balance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredUsers().map(user => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.full_name || 'No name'}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                              <div className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(user.kyc_status, 'kyc')}>
                              {user.kyc_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={user.two_factor_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-gray-900">
                              ${(user.account?.balance || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                              {user.role || 'investor'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowUserModal(true)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {user.kyc_status === 'pending' && (
                                <Button
                                  onClick={() => updateUserKYCStatus(user.id, 'verified')}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {getFilteredUsers().length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {userSearch ? 'No users found matching your search' : 'No users found'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>All Accounts ({users.filter(u => u.account).length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account Holder</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Balance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total Deposits</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total Withdrawals</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">KYC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => user.account).map(user => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.full_name || user.email}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-gray-900">
                              ${(user.account?.balance || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-green-600">
                              ${(user.account?.total_deposits || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-red-600">
                              ${(user.account?.total_withdrawals || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(user.account?.status || 'unknown', 'account')}>
                              {user.account?.status || 'unknown'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(user.kyc_status, 'kyc')}>
                              {user.kyc_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>All Transactions ({transactions.length})</span>
                  </CardTitle>
                  <Button
                    onClick={() => exportData('transactions')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredTransactions().map(transaction => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{transaction.user_name || 'Unknown'}</div>
                              <div className="text-sm text-gray-600">{transaction.user_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="capitalize">
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 capitalize">{transaction.method}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-mono font-bold ${
                              transaction.type === 'deposit' ? 'text-green-600' : 
                              transaction.type === 'withdrawal' ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(transaction.status, 'transaction')}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {transaction.status === 'pending' && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>KYC & Compliance Records ({complianceRecords.length})</span>
                  </CardTitle>
                  <Button
                    onClick={() => exportData('compliance')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search compliance records..."
                    value={complianceSearch}
                    onChange={(e) => setComplianceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Verification ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredCompliance().map(record => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{record.user_name || 'Unknown'}</div>
                              <div className="text-sm text-gray-600">{record.user_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="capitalize">
                              {record.provider}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 capitalize">{record.verification_type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(record.status, 'compliance')}>
                              {record.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-gray-600">
                              {record.verification_id || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(record.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(record.updated_at).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Signed Documents ({signedDocuments.length})</span>
                  </CardTitle>
                  <Button
                    onClick={() => exportData('documents')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Signed Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signedDocuments.map(doc => (
                        <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{doc.user_name || 'Unknown'}</div>
                              <div className="text-sm text-gray-600">{doc.user_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{doc.document_title}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="capitalize">
                              {doc.document_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(doc.signed_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-gray-600">
                              {doc.ip_address || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NAV Management Tab */}
          <TabsContent value="nav" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Publish Daily NAV</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gross Fund Value (USD)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter total fund value"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <Button className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Publish NAV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Fund Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total AUM:</span>
                      <span className="font-bold">${systemStats.totalAUM.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Investors:</span>
                      <span className="font-bold">{systemStats.activeAccounts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified Users:</span>
                      <span className="font-bold">{systemStats.verifiedUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Detail Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <div className="text-gray-900">{selectedUser.full_name || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="text-gray-900">{selectedUser.email}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <div className="text-gray-900">{selectedUser.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">User ID</label>
                        <div className="font-mono text-xs text-gray-600">{selectedUser.id}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">KYC Status</label>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadge(selectedUser.kyc_status, 'kyc')}>
                            {selectedUser.kyc_status}
                          </Badge>
                          {selectedUser.kyc_status === 'pending' && (
                            <Button
                              onClick={() => {
                                updateUserKYCStatus(selectedUser.id, 'verified')
                                setShowUserModal(false)
                              }}
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              Verify Now
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Documents Completed</label>
                        <div className="text-gray-900">{selectedUser.documents_completed ? 'Yes' : 'No'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Two-Factor Auth</label>
                        <div className="text-gray-900">{selectedUser.two_factor_enabled ? 'Enabled' : 'Disabled'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Role</label>
                        <div className="text-gray-900">{selectedUser.role || 'investor'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.account && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Current Balance</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${selectedUser.account.balance.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Total Deposits</div>
                        <div className="text-xl font-bold text-green-600">
                          ${selectedUser.account.total_deposits.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Total Withdrawals</div>
                        <div className="text-xl font-bold text-red-600">
                          ${selectedUser.account.total_withdrawals.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}