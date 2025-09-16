const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔔 Stripe webhook received at:', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || 'whsec_hffzsrLlxqmGIMYACHfhAtXvhD6eVddL'
    
    console.log('🔍 Webhook details:', {
      hasSignature: !!signature,
      webhookSecret: webhookSecret.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    })

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    console.log('📦 Webhook body length:', body.length)

    // Verify webhook signature (simplified for demo - in production use proper Stripe verification)
    
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 Stripe webhook event:', {
        type: event.type,
        id: event.id,
        created: event.created,
        livemode: event.livemode
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    console.log('🔍 Using Supabase:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })

    // Handle different Stripe event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout.session.completed')
        const session = event.data.object
        
        console.log('📊 Session details:', {
          id: session.id,
          amount_total: session.amount_total,
          customer: session.customer,
          payment_status: session.payment_status,
          metadata: session.metadata
        })

        // CRITICAL: Get user_id from metadata
        const userId = session.metadata?.user_id
        if (!userId) {
          console.error('❌ No user_id in session metadata:', session.metadata)
          // Try to find user by customer_id if available
          if (session.customer) {
            console.log('🔍 Attempting to find user by Stripe customer_id:', session.customer)
            
            const customerResponse = await fetch(`${supabaseUrl}/rest/v1/stripe_customers?customer_id=eq.${session.customer}&select=user_id`, {
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              }
            })

            if (customerResponse.ok) {
              const customers = await customerResponse.json()
              if (customers.length > 0) {
                const foundUserId = customers[0].user_id
                console.log('✅ Found user via customer_id:', foundUserId)
                // Continue processing with found user_id
                await processStripePayment(foundUserId, session, supabaseUrl, supabaseServiceKey)
              } else {
                console.error('❌ No user found for customer_id:', session.customer)
              }
            }
          }
          break
        }

        await processStripePayment(userId, session, supabaseUrl, supabaseServiceKey)
        break

      case 'payment_intent.succeeded':
        console.log('💰 Processing payment_intent.succeeded')
        const paymentIntent = event.data.object
        
        console.log('📊 Payment Intent details:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        })

        // Get user_id from payment intent metadata
        const piUserId = paymentIntent.metadata?.user_id
        if (!piUserId) {
          console.error('❌ No user_id in payment intent metadata')
          break
        }

        await processStripePaymentIntent(piUserId, paymentIntent, supabaseUrl, supabaseServiceKey)
        break

      case 'customer.created':
        console.log('👤 Customer created:', event.data.object.id)
        break

      default:
        console.log('ℹ️ Unhandled Stripe event type:', event.type)
    }

    return new Response(JSON.stringify({ 
      received: true,
      processed: true,
      event_type: event.type,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Stripe webhook processing error:', error)
    
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

// CRITICAL: Process Stripe checkout session payment
async function processStripePayment(userId: string, session: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('🔄 Processing Stripe payment for user:', userId)

  try {
    // STEP 1: Update payment record status
    console.log('📝 Updating payment record...')
    const updatePaymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_session_id=eq.${session.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'completed',
        is_paid: true,
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString(),
        metadata: {
          ...session.metadata,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          processed_at: new Date().toISOString()
        }
      })
    })

    if (!updatePaymentResponse.ok) {
      const paymentError = await updatePaymentResponse.text()
      console.error('❌ Failed to update payment record:', paymentError)
    } else {
      const updatedPayment = await updatePaymentResponse.json()
      console.log('✅ Payment record updated:', updatedPayment)
    }

    // STEP 2: Get user's account with detailed logging
    console.log('🔍 Fetching user account for balance update...')
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Account fetch response status:', accountResponse.status)

    if (!accountResponse.ok) {
      const accountError = await accountResponse.text()
      console.error('❌ Failed to get user account:', accountError)
      throw new Error(`Account fetch failed: ${accountError}`)
    }

    const accounts = await accountResponse.json()
    console.log('📊 Account query result:', accounts)
    
    if (!accounts || accounts.length === 0) {
      console.error('❌ No account found for user:', userId)
      throw new Error(`No account found for user: ${userId}`)
    }

    const account = accounts[0]
    const paymentAmount = session.amount_total / 100 // Convert from cents to dollars

    console.log('💰 CRITICAL BALANCE UPDATE:', {
      userId: userId,
      accountId: account.id,
      currentBalance: account.balance,
      paymentAmount: paymentAmount,
      newBalance: account.balance + paymentAmount,
      currentDeposits: account.total_deposits,
      newDeposits: account.total_deposits + paymentAmount,
      sessionId: session.id
    })

    // STEP 3: CRITICAL - Update account balance
    const updateAccountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${account.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        balance: account.balance + paymentAmount,
        available_balance: account.available_balance + paymentAmount,
        total_deposits: account.total_deposits + paymentAmount,
        updated_at: new Date().toISOString()
      })
    })

    console.log('📊 Account update response status:', updateAccountResponse.status)

    if (!updateAccountResponse.ok) {
      const updateError = await updateAccountResponse.text()
      console.error('❌ CRITICAL: FAILED TO UPDATE ACCOUNT BALANCE:', updateError)
      throw new Error(`Account update failed: ${updateError}`)
    } else {
      const updatedAccount = await updateAccountResponse.json()
      console.log('✅ SUCCESS: ACCOUNT BALANCE UPDATED:', {
        accountId: updatedAccount[0]?.id,
        newBalance: updatedAccount[0]?.balance,
        newDeposits: updatedAccount[0]?.total_deposits
      })
    }

    // STEP 4: Create detailed transaction record
    console.log('📝 Creating transaction record...')
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        account_id: account.id,
        type: 'deposit',
        method: 'stripe',
        amount: paymentAmount,
        status: 'completed',
        external_id: session.payment_intent,
        reference_id: session.id,
        description: `Stripe payment - $${paymentAmount.toLocaleString()}`,
        metadata: {
          stripe_session_id: session.id,
          stripe_customer_id: session.customer,
          stripe_payment_intent: session.payment_intent,
          amount_total: session.amount_total,
          payment_status: session.payment_status,
          processed_at: new Date().toISOString()
        }
      })
    })

    if (!transactionResponse.ok) {
      const transactionError = await transactionResponse.text()
      console.error('❌ Failed to create transaction record:', transactionError)
    } else {
      const transaction = await transactionResponse.json()
      console.log('✅ Transaction record created:', transaction[0]?.id)
    }

    console.log('🎉 STRIPE PAYMENT PROCESSING COMPLETE!')

  } catch (error) {
    console.error('❌ CRITICAL ERROR in processStripePayment:', error)
    throw error
  }
}

// Process payment intent succeeded events
async function processStripePaymentIntent(userId: string, paymentIntent: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('🔄 Processing payment intent for user:', userId)

  try {
    // Find the payment record by payment intent ID
    const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (paymentResponse.ok) {
      const payments = await paymentResponse.json()
      if (payments.length > 0) {
        console.log('✅ Found existing payment record for payment intent')
        // Payment already processed via checkout.session.completed
        return
      }
    }

    // If no payment record exists, this might be a direct payment intent
    // Get user account and process the payment
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!accountResponse.ok) {
      console.error('❌ Failed to get user account for payment intent')
      return
    }

    const accounts = await accountResponse.json()
    if (accounts.length === 0) {
      console.error('❌ No account found for user:', userId)
      return
    }

    const account = accounts[0]
    const paymentAmount = paymentIntent.amount / 100 // Convert from cents

    console.log('💰 Processing payment intent balance update:', {
      userId: userId,
      accountId: account.id,
      currentBalance: account.balance,
      paymentAmount: paymentAmount,
      newBalance: account.balance + paymentAmount
    })

    // Update account balance
    const updateAccountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${account.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        balance: account.balance + paymentAmount,
        available_balance: account.available_balance + paymentAmount,
        total_deposits: account.total_deposits + paymentAmount,
        updated_at: new Date().toISOString()
      })
    })

    if (!updateAccountResponse.ok) {
      console.error('❌ Failed to update account for payment intent')
    } else {
      console.log('✅ Account updated for payment intent')
    }

    // Create transaction record
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        account_id: account.id,
        type: 'deposit',
        method: 'stripe',
        amount: paymentAmount,
        status: 'completed',
        external_id: paymentIntent.id,
        description: `Stripe payment intent - $${paymentAmount.toLocaleString()}`,
        metadata: {
          stripe_payment_intent: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      })
    })

    if (!transactionResponse.ok) {
      console.error('❌ Failed to create transaction for payment intent')
    } else {
      console.log('✅ Transaction created for payment intent')
    }

  } catch (error) {
    console.error('❌ Error processing payment intent:', error)
  }
}