const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SubscriptionRequest {
  user_id: string
  amount: number
  bank_reference?: string
  settlement_date?: string
}

Deno.serve(async (req) => {
  console.log('💰 Processing subscription request')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, amount, bank_reference, settlement_date }: SubscriptionRequest = await req.json()
    
    console.log('📝 Subscription details:', { user_id, amount, bank_reference })
    
    if (!user_id || !amount || amount < 1000) {
      throw new Error('Invalid subscription: minimum $1,000 required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // STEP 1: Get current NAV per unit
    console.log('📊 Getting current NAV...')
    const navResponse = await fetch(`${supabaseUrl}/rest/v1/fund_nav?order=date.desc&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let currentNavPerUnit = 1000.0000 // Default starting NAV
    if (navResponse.ok) {
      const navData = await navResponse.json()
      if (navData.length > 0) {
        currentNavPerUnit = navData[0].nav_per_unit
      }
    }

    console.log('💎 Current NAV per unit:', currentNavPerUnit)

    // STEP 2: Calculate units to issue
    const unitsToIssue = amount / currentNavPerUnit
    console.log('🎯 Units to issue:', unitsToIssue, 'for amount:', amount)

    // STEP 3: Get or create user account
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${user_id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let account = null
    if (accountResponse.ok) {
      const accounts = await accountResponse.json()
      account = accounts[0]
    }

    if (!account) {
      throw new Error('User account not found')
    }

    // STEP 4: Create fund transaction record
    console.log('📋 Creating fund transaction record...')
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/fund_transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user_id,
        account_id: account.id,
        type: 'subscription',
        amount: amount,
        units: unitsToIssue,
        nav_per_unit: currentNavPerUnit,
        status: 'confirmed',
        settlement_date: settlement_date || new Date().toISOString().split('T')[0],
        bank_reference: bank_reference,
        notes: `Subscription: $${amount.toLocaleString()} at NAV $${currentNavPerUnit.toFixed(4)}`
      })
    })

    if (!transactionResponse.ok) {
      throw new Error('Failed to create fund transaction')
    }

    const transaction = await transactionResponse.json()
    console.log('✅ Fund transaction created:', transaction[0]?.id)

    // STEP 5: Update or create investor units record
    console.log('🎯 Updating investor units...')
    
    // Check if investor units record exists
    const unitsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units?user_id=eq.${user_id}&account_id=eq.${account.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let existingUnits = null
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json()
      existingUnits = unitsData[0]
    }

    if (existingUnits) {
      // Update existing units record
      const newTotalUnits = existingUnits.units_held + unitsToIssue
      const newTotalInvested = existingUnits.total_invested + amount
      const newAvgNav = newTotalInvested / newTotalUnits
      const newCurrentValue = newTotalUnits * currentNavPerUnit
      const newUnrealizedPnL = newCurrentValue - newTotalInvested

      await fetch(`${supabaseUrl}/rest/v1/investor_units?id=eq.${existingUnits.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          units_held: newTotalUnits,
          avg_purchase_nav: newAvgNav,
          total_invested: newTotalInvested,
          current_value: newCurrentValue,
          unrealized_pnl: newUnrealizedPnL,
          last_nav_update: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })
    } else {
      // Create new units record
      await fetch(`${supabaseUrl}/rest/v1/investor_units`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user_id,
          account_id: account.id,
          units_held: unitsToIssue,
          avg_purchase_nav: currentNavPerUnit,
          total_invested: amount,
          current_value: amount, // At subscription, current value = invested amount
          unrealized_pnl: 0,
          last_nav_update: new Date().toISOString()
        })
      })
    }

    // STEP 6: Update main account balance for dashboard display
    console.log('💳 Updating account balance...')
    const newAccountBalance = (existingUnits?.current_value || 0) + amount
    
    await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${account.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        balance: newAccountBalance,
        available_balance: newAccountBalance,
        total_deposits: account.total_deposits + amount,
        units_held: (existingUnits?.units_held || 0) + unitsToIssue,
        nav_per_unit: currentNavPerUnit,
        updated_at: new Date().toISOString()
      })
    })

    console.log('🎉 Subscription processing complete!')

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transaction[0]?.id,
      units_issued: unitsToIssue,
      nav_per_unit: currentNavPerUnit,
      total_investment: amount,
      current_value: newAccountBalance,
      message: `Successfully processed $${amount.toLocaleString()} subscription`
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Subscription processing error:', error)
    
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