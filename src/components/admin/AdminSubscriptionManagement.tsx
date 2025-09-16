import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, X, Clock, DollarSign, ArrowLeft, RefreshCw, AlertCircle, FileText, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

interface PendingSubscription {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
  metadata: any
  users: {
    email: string
    full_name?: string
  }
}

export function AdminSubscriptionManagement() {
  const { user } = useAuth()
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<PendingSubscription[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Check if user is admin using database role
  const isAdmin = user?.is_admin === true || user?.role === 'admin'

  const loadPendingSubscriptions = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Get pending fund transactions (subscriptions)
      const { data: subscriptionsData, error: subscriptionsError } = await supabaseClient
        .from('fund_transactions')
        .select(`
          id,
          user_id,
          amount,
          status,
          created_at,
          metadata,
          users!inner(email, full_name)
        `)
        .eq('type', 'subscription')
        .order('created_at', { ascending: false })

      if (subscriptionsError) throw subscriptionsError

      setPendingSubscriptions(subscriptionsData || [])
      setFilteredSubscriptions(subscriptionsData || [])

    } catch (err) {
      console.error('Failed to load pending subscriptions:', err)
      setError('Failed to load pending subscriptions')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  useEffect(() => {
    let filtered = pendingSubscriptions

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.users.email.toLowerCase().includes(search) ||
        (sub.users.full_name && sub.users.full_name.toLowerCase().includes(search))
      )
    }

    setFilteredSubscriptions(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [pendingSubscriptions, searchTerm, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentMethodBadge = (metadata: any) => {
    const method = metadata?.payment_method || 'unknown'
    switch (method.toLowerCase()) {
      case 'stripe':
      case 'card':
        return { text: 'Credit Card', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'wire':
        return { text: 'Wire Transfer', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'crypto':
        return { text: 'Cryptocurrency', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      case 'bank':
        return { text: 'Bank Transfer', color: 'bg-green-100 text-green-800 border-green-200' }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const approveSubscription = async (subscriptionId: string, amount: number, userId: string) => {
    setProcessing(subscriptionId)
    setError('')
    setMessage('')

    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      // Call the existing process-deposit-allocation function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-deposit-allocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          user_id: userId,
          deposit_amount: amount,
          payment_method: 'admin_approval',
          reference_id: `admin-approved-${subscriptionId}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process subscription')
      }

      // Update subscription status to approved
      const { error: updateError } = await supabaseClient
        .from('fund_transactions')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (updateError) throw updateError

      setMessage('Subscription approved successfully')
      await loadPendingSubscriptions() // Refresh list

    } catch (err) {
      console.error('Failed to approve subscription:', err)
      setError('Failed to approve subscription: ' + (err as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const rejectSubscription = async (subscriptionId: string) => {
    setProcessing(subscriptionId)
    setError('')
    setMessage('')

    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Update subscription status to rejected
      const { error: updateError } = await supabaseClient
        .from('fund_transactions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (updateError) throw updateError

      setMessage('Subscription rejected')
      await loadPendingSubscriptions() // Refresh list

    } catch (err) {
      console.error('Failed to reject subscription:', err)
      setError('Failed to reject subscription: ' + (err as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadPendingSubscriptions()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access subscription management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-gray-600">Review and approve investor subscriptions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPendingSubscriptions}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
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

        {/* Pending Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Subscriptions</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {filteredSubscriptions.length} of {pendingSubscriptions.length} subscriptions
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-orange-600 font-medium">
                {pendingSubscriptions.filter(s => s.status === 'pending').length} Pending
              </span>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by investor name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Approved</option>
                  <option value="cancelled">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No Matching Subscriptions' : 'No Subscriptions Found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No subscription requests have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSubscriptions.map((subscription) => (
                <div key={subscription.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {subscription.users.full_name || subscription.users.email}
                        </h4>
                        <p className="text-sm text-gray-600">{subscription.users.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(subscription.status)}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </div>
                          {subscription.metadata && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodBadge(subscription.metadata).color}`}>
                              {getPaymentMethodBadge(subscription.metadata).text}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${subscription.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {subscription.metadata && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h5>
                      <div className="text-sm text-gray-600">
                        Method: {subscription.metadata.payment_method || 'Not specified'}
                        {subscription.metadata.reference_id && (
                          <div>Reference: {subscription.metadata.reference_id}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Only show action buttons for pending subscriptions */}
                  {subscription.status === 'pending' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => approveSubscription(subscription.id, subscription.amount, subscription.user_id)}
                        disabled={processing === subscription.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        {processing === subscription.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => rejectSubscription(subscription.id)}
                        disabled={processing === subscription.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredSubscriptions.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length} subscriptions
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}