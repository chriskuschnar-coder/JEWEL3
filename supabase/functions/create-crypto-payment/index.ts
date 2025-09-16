const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🪙 NOWPayments invoice creation function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { amount, currency, user_id, user_email } = await req.json()
    
    console.log('💰 Creating NOWPayments invoice:', { amount, currency, user_id })
    
    // Validate inputs
    if (!amount || amount < 10) {
      throw new Error('Minimum amount is $10')
    }
    
    if (!currency || !['btc', 'eth', 'usdt', 'usdterc20', 'usdc'].includes(currency.toLowerCase())) {
      throw new Error('Unsupported cryptocurrency')
    }

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
    console.log('✅ User authenticated:', user.email)

    // NOWPayments API configuration
    const nowPaymentsApiKey = 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
    const orderId = `GMC-${user.id}-${Date.now()}`
    
    console.log('🔍 Creating NOWPayments invoice with order ID:', orderId)

    // Create NOWPayments invoice
    const invoiceData = {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: currency.toLowerCase() === 'usdt' ? 'usdterc20' : currency.toLowerCase(),
      order_id: orderId,
      order_description: `Global Market Consulting Investment - $${amount.toLocaleString()}`,
      ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
      success_url: `${req.headers.get('origin') || 'https://globalmarketsconsulting.com'}/funding-success?amount=${amount}`,
      cancel_url: `${req.headers.get('origin') || 'https://globalmarketsconsulting.com'}/funding-cancelled`,
      customer_email: user.email,
      is_fixed_rate: true,
      is_fee_paid_by_user: true
    }

    console.log('📡 Sending request to NOWPayments API...')
    
    const nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': nowPaymentsApiKey
      },
      body: JSON.stringify(invoiceData)
    })

    console.log('📊 NOWPayments response status:', nowPaymentsResponse.status)

    if (!nowPaymentsResponse.ok) {
      const errorText = await nowPaymentsResponse.text()
      console.error('❌ NOWPayments API error:', errorText)
      
      let errorMessage = 'Failed to create crypto payment'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = errorText.substring(0, 200)
      }
      
      throw new Error(errorMessage)
    }

    const invoice = await nowPaymentsResponse.json()
    console.log('✅ NOWPayments invoice created:', {
      payment_id: invoice.payment_id,
      pay_address: invoice.pay_address,
      pay_amount: invoice.pay_amount,
      pay_currency: invoice.pay_currency
    })

    // Store the invoice in our database for tracking
    try {
      const invoiceRecord = {
        user_id: user.id,
        amount: amount,
        cryptocurrency: currency.toLowerCase(),
        address: invoice.pay_address,
        status: 'pending',
        payment_address: invoice.pay_address
      }

      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(invoiceRecord)
      })

      if (dbResponse.ok) {
        console.log('✅ Crypto invoice stored in database')
      } else {
        console.warn('⚠️ Failed to store invoice in database')
      }
    } catch (dbError) {
      console.warn('⚠️ Database storage failed:', dbError)
      // Don't fail the payment creation if DB insert fails
    }

    // Return the payment details for the frontend
    return new Response(JSON.stringify({
      payment_id: invoice.payment_id,
      pay_address: invoice.pay_address,
      pay_amount: invoice.pay_amount,
      pay_currency: invoice.pay_currency,
      price_amount: invoice.price_amount,
      price_currency: invoice.price_currency,
      order_id: invoice.order_id,
      payment_status: invoice.payment_status,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Crypto payment creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        type: 'crypto_payment_creation_failed'
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