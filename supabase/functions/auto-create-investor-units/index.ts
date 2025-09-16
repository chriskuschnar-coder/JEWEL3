const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('👤 Auto-create investor units function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Verify user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Invalid user token')
    }
    
    const user = await userResponse.json()
    console.log('✅ User authenticated:', user.email)

    // Get user's account
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${user.id}&select=*`, {
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

    // Check if investor_units already exists
    const unitsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units?user_id=eq.${user.id}&account_id=eq.${account.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (unitsResponse.ok) {
      const existingUnits = await unitsResponse.json()
      if (existingUnits.length > 0) {
        console.log('✅ Investor units already exist for user')
        return new Response(JSON.stringify({
          success: true,
          message: 'Investor units already exist',
          units: existingUnits[0]
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        })
      }
    }

    // Create investor_units record
    console.log('📝 Creating investor_units record for user:', user.id)
    const createUnitsResponse = await fetch(`${supabaseUrl}/rest/v1/investor_units`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        account_id: account.id,
        units_held: 0,
        total_invested: 0,
        current_value: 0,
        unrealized_pnl: 0,
        avg_purchase_nav: 1000.0000,
        last_nav_update: new Date().toISOString()
      })
    })

    if (!createUnitsResponse.ok) {
      const error = await createUnitsResponse.text()
      console.error('❌ Failed to create investor_units:', error)
      throw new Error('Failed to create investor units record')
    }

    const newUnits = await createUnitsResponse.json()
    console.log('✅ Investor units created:', newUnits[0]?.id)

    return new Response(JSON.stringify({
      success: true,
      message: 'Investor units created successfully',
      units: newUnits[0]
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Auto-create investor units error:', error)
    
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