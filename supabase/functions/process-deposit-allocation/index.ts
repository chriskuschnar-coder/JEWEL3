const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DepositAllocationRequest {
  user_id: string
  deposit_amount: number
  payment_method: string
  reference_id?: string
}

Deno.serve(async (req) => {
  console.log('💰 Processing deposit allocation')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, deposit_amount, payment_method, reference_id }: DepositAllocationRequest = await req.json()
    
    console.log('📝 Deposit allocation details:', { user_id, deposit_amount, payment_method })
    
    if (!user_id || !deposit_amount || deposit_amount < 100) {
      throw new Error('Invalid deposit: minimum $100 required')
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

    // STEP 2: Calculate units to allocate
    const unitsToAllocate = deposit_amount / currentNavPerUnit
    console.log('🎯 Units to allocate:', unitsToAllocate, 'for deposit:', deposit_amount)

    // STEP 3: Get user account and investor_units
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${user_id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!accountResponse.ok) {
      throw new Error('Failed to get user account')
    }

    const accounts = await accountResponse.json()
    if (accounts.length === 0) {
      throw new Error('No account found for user')
    }

    const account = accounts[0]

    // Get investor_units record
    const unitsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units?user_id=eq.${user_id}&account_id=eq.${account.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let investorUnits = null
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json()
      investorUnits = unitsData[0]
    }

    // STEP 4: Update investor_units with new allocation
    if (investorUnits) {
      console.log('📈 Updating existing investor_units record...')
      
      const newTotalUnits = investorUnits.units_held + unitsToAllocate
      const newTotalInvested = investorUnits.total_invested + deposit_amount
      const newAvgNav = newTotalInvested / newTotalUnits
      const newCurrentValue = newTotalUnits * currentNavPerUnit
      const newUnrealizedPnL = newCurrentValue - newTotalInvested

      await fetch(`${supabaseUrl}/rest/v1/investor_units?id=eq.${investorUnits.id}`, {
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
      console.log('📝 Creating new investor_units record...')
      
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
          units_held: unitsToAllocate,
          avg_purchase_nav: currentNavPerUnit,
          total_invested: deposit_amount,
          current_value: deposit_amount, // At deposit, current value = invested amount
          unrealized_pnl: 0,
          last_nav_update: new Date().toISOString()
        })
      })
    }

    // STEP 5: Update main account balance for dashboard display
    console.log('💳 Updating account balance...')
    const newAccountBalance = account.balance + deposit_amount
    
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
        total_deposits: account.total_deposits + deposit_amount,
        units_held: (investorUnits?.units_held || 0) + unitsToAllocate,
        nav_per_unit: currentNavPerUnit,
        fund_allocation_pct: 100, // 100% allocated to fund
        updated_at: new Date().toISOString()
      })
    })

    // STEP 6: Create fund transaction record
    console.log('📋 Creating fund transaction record...')
    await fetch(`${supabaseUrl}/rest/v1/fund_transactions`, {
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
        type: 'subscription',
        amount: deposit_amount,
        units: unitsToAllocate,
        nav_per_unit: currentNavPerUnit,
        status: 'confirmed',
        settlement_date: new Date().toISOString().split('T')[0],
        bank_reference: reference_id,
        notes: `${payment_method} deposit: $${deposit_amount.toLocaleString()} at NAV $${currentNavPerUnit.toFixed(4)}`,
        metadata: {
          payment_method: payment_method,
          nav_at_purchase: currentNavPerUnit,
          units_allocated: unitsToAllocate,
          reference_id: reference_id
        }
      })
    })

    console.log('🎉 Deposit allocation complete!')

    return new Response(JSON.stringify({
      success: true,
      units_allocated: unitsToAllocate,
      nav_per_unit: currentNavPerUnit,
      total_investment: deposit_amount,
      new_account_balance: newAccountBalance,
      message: `Successfully allocated ${unitsToAllocate.toFixed(4)} units for $${deposit_amount.toLocaleString()} deposit`
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Deposit allocation error:', error)
    
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