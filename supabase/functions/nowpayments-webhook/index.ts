const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
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
    console.log('🔔 NOWPayments webhook received')
    
    const signature = req.headers.get('x-nowpayments-sig')
    const body = await req.text()
    
    console.log('📦 Webhook details:', {
      signature: signature?.substring(0, 20) + '...',
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    })

    // Parse the webhook payload
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 NOWPayments webhook event:', {
        payment_id: event.payment_id,
        payment_status: event.payment_status,
        price_amount: event.price_amount,
        price_currency: event.price_currency,
        pay_currency: event.pay_currency,
        pay_amount: event.pay_amount,
        order_id: event.order_id,
        outcome_amount: event.outcome_amount,
        payin_hash: event.payin_hash
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    // Verify webhook signature for security
    const ipnSecret = 'T8kk7npqjaovmsRdbeO2VbnSHESmFS7Y'
    if (ipnSecret && signature) {
      try {
        const encoder = new TextEncoder()
        const keyData = encoder.encode(ipnSecret)
        const messageData = encoder.encode(body)
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-512' },
          false,
          ['sign']
        )
        
        const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
        const computedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        
        if (signature !== computedSignature) {
          console.error('❌ Invalid webhook signature')
          return new Response('Invalid signature', { status: 401 })
        }
        
        console.log('✅ Webhook signature verified')
      } catch (sigError) {
        console.error('❌ Signature verification failed:', sigError)
        // Continue processing but log the error
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle payment status updates
    switch (event.payment_status) {
      case 'finished':
      case 'confirmed':
        console.log('✅ Processing CONFIRMED NOWPayments payment')
        
        // Extract user_id from order_id (format: GMC-{user_id}-{timestamp})
        const orderParts = event.order_id.split('-')
        if (orderParts.length < 2 || orderParts[0] !== 'GMC') {
          console.error('❌ Invalid order_id format:', event.order_id)
          break
        }
        
        const userId = orderParts[1]
        console.log('👤 Processing confirmed payment for user:', userId)
        
        // CRITICAL: Get user's account with error handling
        console.log('🔍 Fetching user account...')
        const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!accountResponse.ok) {
          console.error('❌ Failed to get user account, status:', accountResponse.status)
          const errorText = await accountResponse.text()
          console.error('❌ Account fetch error:', errorText)
          break
        }

        const accounts = await accountResponse.json()
        console.log('📊 Account query result:', accounts)
        
        if (!accounts || accounts.length === 0) {
          console.error('❌ No account found for user:', userId)
          break
        }

        const account = accounts[0]
        const paymentAmount = parseFloat(event.price_amount)

        console.log('💰 UPDATING ACCOUNT BALANCE:', {
          accountId: account.id,
          currentBalance: account.balance,
          paymentAmount: paymentAmount,
          newBalance: account.balance + paymentAmount,
          currentDeposits: account.total_deposits,
          newDeposits: account.total_deposits + paymentAmount
        })

        // CRITICAL: Update account balance with detailed logging
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
          console.error('❌ FAILED TO UPDATE ACCOUNT BALANCE')
          const updateError = await updateAccountResponse.text()
          console.error('❌ Update error details:', updateError)
        } else {
          const updatedAccount = await updateAccountResponse.json()
          console.log('✅ ACCOUNT BALANCE UPDATED SUCCESSFULLY:', updatedAccount)
        }

        // Create detailed transaction record
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
            method: 'crypto',
            amount: paymentAmount,
            status: 'completed',
            external_id: event.payment_id,
            reference_id: event.order_id,
            description: `NOWPayments crypto deposit - ${event.pay_amount} ${event.pay_currency.toUpperCase()} → $${paymentAmount.toLocaleString()}`,
            metadata: {
              nowpayments_payment_id: event.payment_id,
              nowpayments_status: event.payment_status,
              crypto_currency: event.pay_currency,
              crypto_amount: event.pay_amount,
              payin_hash: event.payin_hash || null,
              payout_hash: event.payout_hash || null,
              outcome_amount: event.outcome_amount || null,
              outcome_currency: event.outcome_currency || null,
              exchange_rate: event.pay_amount ? (paymentAmount / event.pay_amount) : null
            }
          })
        })

        if (!transactionResponse.ok) {
          console.error('❌ Failed to create transaction record')
          const transactionError = await transactionResponse.text()
          console.error('❌ Transaction error:', transactionError)
        } else {
          const transaction = await transactionResponse.json()
          console.log('✅ Transaction record created:', transaction)
        }

        // CRITICAL: Also update the crypto_payment_invoices table if it exists
        try {
          console.log('🔍 Updating crypto payment invoice status...')
          const invoiceUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?payment_address=eq.${event.pay_address}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: 'confirmed',
              updated_at: new Date().toISOString()
            })
          })

          if (invoiceUpdateResponse.ok) {
            console.log('✅ Crypto invoice status updated')
          }
        } catch (invoiceError) {
          console.log('ℹ️ Crypto invoice update skipped (table may not exist)')
        }

        console.log('🎉 PAYMENT PROCESSING COMPLETE - User balance should be updated!')
        break

      case 'partially_paid':
        console.log('⚠️ NOWPayments partial payment received:', event.payment_id)
        // Log partial payment but don't update balance yet
        break

      case 'failed':
      case 'expired':
        console.log('❌ NOWPayments payment failed/expired:', event.payment_id)
        
        // Update any pending payment records to failed status
        try {
          const failedUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/transactions?external_id=eq.${event.payment_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
          })

          if (failedUpdateResponse.ok) {
            console.log('✅ Failed payment record updated')
          }
        } catch (error) {
          console.error('❌ Failed to update failed payment record:', error)
        }
        break

      case 'waiting':
      case 'confirming':
        console.log('ℹ️ NOWPayments status update:', event.payment_status, 'for payment:', event.payment_id)
        // Payment is in progress - no balance update yet
        break

      default:
        console.log('ℹ️ Unknown NOWPayments status:', event.payment_status, 'for payment:', event.payment_id)
    }

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      payment_id: event.payment_id,
      status: event.payment_status,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ NOWPayments webhook processing error:', error)
    
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