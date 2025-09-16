const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mt5-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MT5NavUpdate {
  mt5_equity: number
  mt5_balance: number
  daily_pnl: number
  timestamp: string
}

Deno.serve(async (req) => {
  console.log('📈 NAV update from MT5 function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Verify MT5 API key for security
    const apiKey = req.headers.get('x-mt5-api-key')
    const expectedApiKey = Deno.env.get('MT5_API_KEY') || 'your-secure-mt5-api-key'
    
    if (apiKey !== expectedApiKey) {
      throw new Error('Invalid MT5 API key')
    }

    const { mt5_equity, mt5_balance, daily_pnl, timestamp }: MT5NavUpdate = await req.json()
    
    console.log('📊 MT5 NAV update:', { mt5_equity, mt5_balance, daily_pnl })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // STEP 1: Get total units outstanding
    console.log('🔍 Getting total units outstanding...')
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

    console.log('📊 Total units outstanding:', totalUnits)

    // STEP 2: Calculate new NAV per unit
    const newNavPerUnit = totalUnits > 0 ? (mt5_equity / totalUnits) : 1000.0000
    const dailyReturnPct = mt5_balance > 0 ? (daily_pnl / mt5_balance) * 100 : 0

    console.log('🧮 NAV Calculation:', {
      mt5_equity,
      totalUnits,
      newNavPerUnit,
      dailyReturnPct
    })

    // STEP 3: Update fund NAV
    const today = new Date().toISOString().split('T')[0]
    console.log('📈 Updating fund NAV for date:', today)
    
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
        total_aum: mt5_equity,
        nav_per_unit: newNavPerUnit,
        units_outstanding: totalUnits,
        daily_pnl: daily_pnl,
        daily_return_pct: dailyReturnPct,
        mt5_equity: mt5_equity,
        mt5_balance: mt5_balance,
        updated_at: new Date().toISOString()
      })
    })

    if (!navUpdateResponse.ok) {
      console.error('❌ Failed to update fund NAV')
      throw new Error('Failed to update fund NAV')
    }

    console.log('✅ Fund NAV updated')

    // STEP 4: Update all investor allocations
    console.log('👥 Updating all investor allocations...')
    
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
      console.log(`📊 Updating ${investors.length} investor allocations`)
      
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

    console.log('🎉 NAV update processing complete!')

    return new Response(JSON.stringify({
      success: true,
      nav_per_unit: newNavPerUnit,
      total_aum: mt5_equity,
      daily_pnl: daily_pnl,
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
    console.error('❌ NAV update error:', error)
    
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