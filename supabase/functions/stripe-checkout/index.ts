const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { price_id, mode, amount, success_url, cancel_url } = await req.json()
    
    console.log('Creating Stripe checkout session:', { price_id, mode, amount, success_url, cancel_url })
    
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT and get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
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
    console.log('User authenticated:', user.email)

    // Get Stripe secret key from environment or use the provided key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_live_51•••••itV'
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }
    
    console.log('🔍 Using Stripe key:', stripeSecretKey.substring(0, 20) + '...')
    console.log('🔍 Key type:', stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST')

    // Check if customer exists in Stripe
    let customerId = null
    
    // First check our database for existing Stripe customer
    const customerResponse = await fetch(`${supabaseUrl}/rest/v1/stripe_customers?user_id=eq.${user.id}&select=customer_id`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (customerResponse.ok) {
      const customers = await customerResponse.json()
      if (customers.length > 0) {
        customerId = customers[0].customer_id
        console.log('Found existing Stripe customer:', customerId)
      }
    }
    
    // If no customer exists, create one
    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.email)
      
      const customerData = new URLSearchParams({
        email: user.email,
        'metadata[user_id]': user.id,
        'metadata[full_name]': user.user_metadata?.full_name || user.email,
        name: user.user_metadata?.full_name || user.email
      })
      
      const stripeCustomerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: customerData.toString()
      })

      if (!stripeCustomerResponse.ok) {
        const error = await stripeCustomerResponse.json()
        console.error('Stripe customer creation error:', error)
        throw new Error(error.error?.message || 'Failed to create customer')
      }

      const customer = await stripeCustomerResponse.json()
      customerId = customer.id
      console.log('✅ Stripe customer created:', customerId)

      // Save customer to our database
      const dbCustomerResponse = await fetch(`${supabaseUrl}/rest/v1/stripe_customers`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user.id,
          customer_id: customerId
        })
      })

      if (!dbCustomerResponse.ok) {
        console.error('Failed to save customer to database')
      } else {
        console.log('✅ Customer saved to database')
      }
    }

    // Create Stripe checkout session
    const sessionData = new URLSearchParams({
      'payment_method_types[]': 'card',
      mode: mode,
      customer: customerId,
      success_url: success_url,
      cancel_url: cancel_url,
      'metadata[user_id]': user.id,
      'metadata[purpose]': 'hedge_fund_investment'
    })

    if (mode === 'payment') {
      sessionData.append('line_items[0][price_data][currency]', 'usd')
      sessionData.append('line_items[0][price_data][product_data][name]', 'Hedge Fund Investment')
      sessionData.append('line_items[0][price_data][product_data][description]', `Investment in Global Market Consulting Fund`)
      sessionData.append('line_items[0][price_data][unit_amount]', amount.toString())
      sessionData.append('line_items[0][quantity]', '1')
    } else {
      sessionData.append('line_items[0][price]', price_id)
      sessionData.append('line_items[0][quantity]', '1')
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionData.toString()
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      console.error('Stripe session creation error:', error)
      throw new Error(error.error?.message || 'Failed to create checkout session')
    }

    const session = await stripeResponse.json()
    console.log('✅ Checkout session created:', session.id)

    // Create payment record in database
    const paymentRecord = {
      user_id: user.id,
      product_id: 'hedge_fund_investment',
      quantity: 1,
      total_amount: amount / 100, // Convert from cents to dollars
      status: 'pending',
      stripe_session_id: session.id,
      metadata: {
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        investment_type: 'hedge_fund_capital',
        fund_name: 'Global Market Consulting Fund'
      }
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(paymentRecord)
    })

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json()
      console.error('Database error:', dbError)
      console.warn('Payment record creation failed, but checkout session created successfully')
    } else {
      console.log('✅ Payment record created in database')
    }

    return new Response(JSON.stringify({
      url: session.url,
      session_id: session.id
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message
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