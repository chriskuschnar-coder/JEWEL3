const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mt5-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MT5AccountData {
  account_number: string
  balance: number
  equity: number
  margin: number
  free_margin: number
  profit: number
  positions_count: number
  timestamp: string
  positions?: any[]
  orders?: any[]
}

Deno.serve(async (req) => {
  console.log('🤖 MT5 Data Processor function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Verify API key for security (your Python bot will send this)
    const apiKey = req.headers.get('x-mt5-api-key')
    const expectedApiKey = Deno.env.get('MT5_API_KEY') || 'your-secure-mt5-api-key'
    
    if (apiKey !== expectedApiKey) {
      throw new Error('Invalid MT5 API key')
    }

    const mt5Data: MT5AccountData = await req.json()
    console.log('📊 Received MT5 data:', {
      account: mt5Data.account_number,
      equity: mt5Data.equity,
      balance: mt5Data.balance,
      profit: mt5Data.profit,
      timestamp: mt5Data.timestamp
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // STEP 1: Store raw MT5 data
    console.log('💾 Storing MT5 data feed...')
    const mt5Response = await fetch(`${supabaseUrl}/rest/v1/mt5_data_feed`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        account_number: mt5Data.account_number,
        balance: mt5Data.balance,
        equity: mt5Data.equity,
        margin: mt5Data.margin,
        free_margin: mt5Data.free_margin,
        profit: mt5Data.profit,
        positions_count: mt5Data.positions_count,
        raw_data: mt5Data,
        processed: false,
        timestamp: mt5Data.timestamp
      })
    })

    if (!mt5Response.ok) {
      throw new Error('Failed to store MT5 data')
    }

    const storedData = await mt5Response.json()
    console.log('✅ MT5 data stored with ID:', storedData[0]?.id)

    // STEP 2: Calculate NAV update
    console.log('📈 Calculating NAV update...')
    
    // Get current fund NAV
    const navResponse = await fetch(`${supabaseUrl}/rest/v1/fund_nav?order=date.desc&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let currentNav = null
    if (navResponse.ok) {
      const navData = await navResponse.json()
      currentNav = navData[0]
    }

    // Calculate daily P&L and new NAV
    const previousEquity = currentNav?.mt5_equity || mt5Data.balance
    const dailyPnL = mt5Data.equity - previousEquity
    const dailyReturnPct = previousEquity > 0 ? (dailyPnL / previousEquity) * 100 : 0

    // Get total units outstanding
    const unitsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units?select=units_held.sum()`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let totalUnits = 0
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json()
      totalUnits = unitsData[0]?.sum || 0
    }

    // Calculate new NAV per unit
    const newNavPerUnit = totalUnits > 0 ? (mt5Data.equity / totalUnits) : 1000.0000

    console.log('🧮 NAV Calculation:', {
      previousEquity,
      currentEquity: mt5Data.equity,
      dailyPnL,
      dailyReturnPct,
      totalUnits,
      newNavPerUnit
    })

    // STEP 3: Update fund NAV
    const today = new Date().toISOString().split('T')[0]
    const navUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/fund_nav`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        date: today,
        total_aum: mt5Data.equity,
        nav_per_unit: newNavPerUnit,
        units_outstanding: totalUnits,
        daily_pnl: dailyPnL,
        daily_return_pct: dailyReturnPct,
        mt5_equity: mt5Data.equity,
        mt5_balance: mt5Data.balance,
        updated_at: new Date().toISOString()
      })
    })

    if (!navUpdateResponse.ok) {
      console.error('❌ Failed to update fund NAV')
    } else {
      console.log('✅ Fund NAV updated')
    }

    // STEP 4: Update all investor allocations
    console.log('👥 Updating investor allocations...')
    
    // Get all investors with units
    const investorsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units?select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (investorsResponse.ok) {
      const investors = await investorsResponse.json()
      
      for (const investor of investors) {
        const newValue = investor.units_held * newNavPerUnit
        const unrealizedPnL = newValue - investor.total_invested
        
        // Update investor units record
        await fetch(`${supabaseUrl}/rest/v1/investor_units?id=eq.${investor.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            current_value: newValue,
            unrealized_pnl: unrealizedPnL,
            last_nav_update: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        })

        // Update main accounts table for dashboard display
        await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${investor.account_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            balance: newValue,
            available_balance: newValue,
            nav_per_unit: newNavPerUnit,
            updated_at: new Date().toISOString()
          })
        })
      }
      
      console.log(`✅ Updated ${investors.length} investor allocations`)
    }

    // STEP 5: Mark MT5 data as processed
    await fetch(`${supabaseUrl}/rest/v1/mt5_data_feed?id=eq.${storedData[0]?.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        processed: true
      })
    })

    console.log('🎉 MT5 data processing complete!')

    return new Response(JSON.stringify({
      success: true,
      nav_per_unit: newNavPerUnit,
      total_aum: mt5Data.equity,
      daily_pnl: dailyPnL,
      daily_return_pct: dailyReturnPct,
      investors_updated: (await investorsResponse.json()).length,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ MT5 data processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})