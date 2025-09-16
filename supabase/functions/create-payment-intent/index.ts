const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🚀 Payment Intent function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('📝 Parsing request body...')
    const { amount, currency = 'usd', user_id, metadata = {} } = await req.json()
    
    console.log('💰 Payment intent request:', { amount, currency, user_id, metadata })
    
    // Validate amount (minimum $1.00)
    if (!amount || amount < 100) {
      throw new Error('Minimum amount is $1.00 (100 cents)')
    }

    // Get Stripe secret key from environment or use the provided key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_live_51•••••itV'
    
    console.log('🔑 Using LIVE Stripe key for payment intent')

    // Create Stripe payment intent
    const paymentIntentData = new URLSearchParams({
      amount: amount.toString(),
      currency: currency,
      'automatic_payment_methods[enabled]': 'true',
      'metadata[user_id]': user_id || 'anonymous',
      'metadata[user_email]': metadata.user_email || '',
      'metadata[investment_amount]': metadata.investment_amount || '',
      'metadata[purpose]': 'hedge_fund_investment',
      'metadata[investment_type]': 'capital_contribution',
      'metadata[fund_name]': 'Global Market Consulting Fund',
      'description': `Hedge fund investment - $${(amount / 100).toLocaleString()}`
    })

    console.log('📡 Creating Stripe payment intent...')
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paymentIntentData.toString()
    })

    console.log('📊 Stripe response status:', stripeResponse.status)

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      console.error('❌ Stripe API error:', errorText)
      
      let errorMessage = 'Failed to create payment intent'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // If we can't parse the error, use the raw text
        errorMessage = errorText.substring(0, 200)
      }
      
      throw new Error(errorMessage)
    }

    const paymentIntent = await stripeResponse.json()
    console.log('✅ Payment intent created successfully:', paymentIntent.id)

    // Try to create payment record in database (don't fail if this fails)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

      if (supabaseUrl && supabaseServiceKey) {
        const paymentRecord = {
          user_id: user_id || 'anonymous',
          product_id: 'hedge_fund_investment',
          quantity: 1,
          total_amount: amount / 100, // Convert from cents to dollars
          status: 'pending',
          stripe_payment_intent_id: paymentIntent.id,
          metadata: {
            stripe_payment_intent: paymentIntent.id,
            currency: currency,
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

        if (dbResponse.ok) {
          console.log('✅ Payment record created in database')
        } else {
          console.warn('⚠️ Payment record creation failed, but payment intent created successfully')
        }
      }
    } catch (dbError) {
      console.warn('⚠️ Database operation failed:', dbError)
      // Don't fail the payment intent creation if DB insert fails
    }

    // Return the client secret for frontend
    const response = {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'success'
    }

    console.log('📤 Returning response:', { ...response, client_secret: response.client_secret.substring(0, 20) + '...' })

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Payment intent creation error:', error)
    
    const errorResponse = { 
      error: { 
        message: error.message || 'Unknown error occurred',
        type: 'payment_intent_creation_failed'
      },
      status: 'error'
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
})