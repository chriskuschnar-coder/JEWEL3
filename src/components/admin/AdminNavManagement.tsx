import React, { useState, useEffect } from 'react'
import { Shield, TrendingUp, Save, RefreshCw, Calendar, DollarSign, Users, BarChart3, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

interface NavData {
  date: string
  total_aum: number
  nav_per_unit: number
  units_outstanding: number
  daily_pnl: number
  daily_return_pct: number
  mt5_equity: number
  mt5_balance: number
  created_at: string
}

export function AdminNavManagement() {
  const { user } = useAuth()
  const [currentNav, setCurrentNav] = useState<NavData | null>(null)
  const [grossFundValue, setGrossFundValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [navHistory, setNavHistory] = useState<NavData[]>([])
  const [totalInvestors, setTotalInvestors] = useState(0)
  const [totalUnitsOutstanding, setTotalUnitsOutstanding] = useState(0)
  const [validationError, setValidationError] = useState('')

  // Check if user is admin using database role
  const isAdmin = user?.is_admin === true || user?.role === 'admin'

  const loadAdminData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Get latest NAV
      const { data: navData, error: navError } = await supabaseClient
        .from('fund_nav')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)

      if (navError) throw navError

      if (navData && navData.length > 0) {
        setCurrentNav(navData[0])
        setGrossFundValue(navData[0].total_aum.toString())
      }

      // Get NAV history (last 30 entries)
      const { data: historyData, error: historyError } = await supabaseClient
        .from('fund_nav')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (historyError) throw historyError
      setNavHistory(historyData || [])

      // Get total investors count
      const { count: investorCount } = await supabaseClient
        .from('investor_units')
        .select('*', { count: 'exact', head: true })

      setTotalInvestors(investorCount || 0)

      // Get total units outstanding
      const { data: unitsData } = await supabaseClient
        .from('investor_units')
        .select('units_held')

      const totalUnits = unitsData?.reduce((sum, record) => sum + (record.units_held || 0), 0) || 0
      setTotalUnitsOutstanding(totalUnits)

    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const publishNav = async () => {
    // Clear previous validation errors
    setValidationError('')
    
    // Validate gross fund value
    if (!grossFundValue || grossFundValue.trim() === '') {
      setValidationError('Please enter a gross fund value')
      return
    }
    
    const fundValue = parseFloat(grossFundValue)
    if (isNaN(fundValue)) {
      setValidationError('Please enter a valid numeric value')
      return
    }
    
    if (fundValue <= 0) {
      setValidationError('Gross fund value must be greater than $0')
      return
    }
    
    // Validate units outstanding
    if (totalUnitsOutstanding <= 0) {
      setValidationError('Cannot publish NAV: No units outstanding. Process investor subscriptions first.')
      return
    }


    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Calculate NAV per unit
      const navPerUnit = totalUnitsOutstanding > 0 ? fundValue / totalUnitsOutstanding : 1000.0000
      
      // Calculate daily P&L if we have previous data
      let dailyPnl = 0
      let dailyReturnPct = 0
      
      if (currentNav && currentNav.total_aum > 0) {
        dailyPnl = fundValue - currentNav.total_aum
        dailyReturnPct = (dailyPnl / currentNav.total_aum) * 100
      }

      const today = new Date().toISOString().split('T')[0]

      // Insert new NAV record
      const { data: newNavData, error: navError } = await supabaseClient
        .from('fund_nav')
        .upsert({
          date: today,
          total_aum: fundValue,
          nav_per_unit: navPerUnit,
          units_outstanding: totalUnitsOutstanding,
          daily_pnl: dailyPnl,
          daily_return_pct: dailyReturnPct,
          mt5_equity: fundValue, // For consistency with existing schema
          mt5_balance: fundValue,
          updated_at: new Date().toISOString()
        })
        .select()

      if (navError) throw navError

      // Update all investor unit values
      const { data: investorUnits } = await supabaseClient
        .from('investor_units')
        .select('*')

      if (investorUnits) {
        for (const investor of investorUnits) {
          const newValue = investor.units_held * navPerUnit
          const unrealizedPnl = newValue - investor.total_invested

          await supabaseClient
            .from('investor_units')
            .update({
              current_value: newValue,
              unrealized_pnl: unrealizedPnl,
              last_nav_update: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', investor.id)

          // Update main accounts table for dashboard display
          await supabaseClient
            .from('accounts')
            .update({
              balance: newValue,
              available_balance: newValue,
              nav_per_unit: navPerUnit,
              updated_at: new Date().toISOString()
            })
            .eq('id', investor.account_id)
        }
      }

      setMessage(`NAV published successfully: $${navPerUnit.toFixed(4)} per unit`)
      await loadAdminData() // Refresh data

    } catch (err) {
      console.error('Failed to publish NAV:', err)
      setError('Failed to publish NAV: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
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
              <div className="w-12 h-12 bg-navy-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fund Administration</h1>
                <p className="text-gray-600">NAV Management & Fund Operations</p>
              </div>
            </div>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Fund Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Current NAV</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${currentNav?.nav_per_unit.toFixed(4) || '1000.0000'}
            </div>
            <div className="text-sm text-gray-500">Per Unit</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total AUM</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${currentNav?.total_aum.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Gross Fund Value</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Investors</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalInvestors}
            </div>
            <div className="text-sm text-gray-500">Active Accounts</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="h-5 w-5 text-gold-600" />
              <span className="text-sm font-medium text-gray-600">Units Outstanding</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalUnitsOutstanding.toFixed(4)}
            </div>
            <div className="text-sm text-gray-500">Total Units</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* NAV Publishing Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Publish Daily NAV</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-900 font-medium">{error}</span>
                </div>
              </div>
            )}

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-900 font-medium">{validationError}</span>
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

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gross Fund Value (USD)
                </label>
                <input
                  type="number"
                  value={grossFundValue}
                  onChange={(e) => {
                    setGrossFundValue(e.target.value)
                    setValidationError('') // Clear validation error on input change
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Enter total fund value"
                  step="0.01"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total value of all fund assets and positions
                </p>
              </div>

              {grossFundValue && totalUnitsOutstanding > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">NAV Calculation Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Gross Fund Value:</span>
                      <span className="font-medium text-blue-900">${parseFloat(grossFundValue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Units Outstanding:</span>
                      <span className="font-medium text-blue-900">{totalUnitsOutstanding.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-blue-700 font-medium">NAV per Unit:</span>
                      <span className="font-bold text-blue-900">
                        ${(parseFloat(grossFundValue) / totalUnitsOutstanding).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={publishNav}
                disabled={saving || !grossFundValue || totalUnitsOutstanding === 0 || !!validationError}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Publishing NAV...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Publish NAV</span>
                  </>
                )}
              </button>

              {totalUnitsOutstanding === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-900 font-medium">No units outstanding</span>
                  </div>
                  <p className="text-yellow-800 text-sm mt-1">
                    Cannot calculate NAV with zero units outstanding. Process investor subscriptions first.
                  </p>
                </div>
              )}
              
              {grossFundValue && totalUnitsOutstanding > 0 && !validationError && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 font-medium">Ready to publish</span>
                  </div>
                  <p className="text-green-800 text-sm">
                    NAV will be set to ${(parseFloat(grossFundValue) / totalUnitsOutstanding).toFixed(4)} per unit
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NAV History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">NAV History</h2>
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {navHistory.map((nav, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{nav.date}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(nav.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${nav.nav_per_unit.toFixed(4)}
                      </div>
                      {nav.daily_return_pct !== 0 && (
                        <div className={`text-sm ${nav.daily_return_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {nav.daily_return_pct > 0 ? '+' : ''}{nav.daily_return_pct.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {navHistory.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No NAV history available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}