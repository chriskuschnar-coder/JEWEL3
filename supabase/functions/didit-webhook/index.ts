const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔔 Didit v2 webhook received')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const DIDIT_WEBHOOK_SECRET = Deno.env.get("DIDIT_WEBHOOK_SECRET")
    if (!DIDIT_WEBHOOK_SECRET) {
      console.error('❌ Missing DIDIT_WEBHOOK_SECRET in environment variables')
      throw new Error("Missing DIDIT_WEBHOOK_SECRET")
    }

    console.log('🔑 Webhook secret found')

    const signature = req.headers.get("x-signature")
    const body = await req.text()
    
    console.log('📦 Didit v2 webhook details:', {
      signature: signature?.substring(0, 20) + '...',
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    })

    // Verify webhook signature for security
    if (DIDIT_WEBHOOK_SECRET && signature) {
      try {
        const encoder = new TextEncoder()
        const keyData = encoder.encode(DIDIT_WEBHOOK_SECRET)
        const messageData = encoder.encode(body)
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
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
    } else {
      console.warn('⚠️ No webhook secret or signature provided - skipping verification')
    }

    // Parse webhook payload
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 Didit v2 webhook event:', {
        session_id: event.session_id,
        vendor_data: event.vendor_data,
        status: event.status,
        workflow_id: event.workflow_id
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle verification status updates
    const { session_id, vendor_data, status, workflow_id } = event
    
    console.log('🔄 Processing Didit v2 verification result:', {
      session_id,
      vendor_data, // This is the user_id
      status,
      workflow_id
    })

    // Map Didit v2 status to our compliance status
    let complianceStatus = 'pending'
    let shouldMarkUserVerified = false

    switch (status) {
      case 'Approved':
      case 'verified':
      case 'completed':
        complianceStatus = 'approved'
        shouldMarkUserVerified = true
        console.log('✅ Verification APPROVED for user:', vendor_data)
        break
      
      case 'Rejected':
      case 'failed':
      case 'declined':
        complianceStatus = 'rejected'
        console.log('❌ Verification REJECTED for user:', vendor_data)
        break
      
      case 'Expired':
      case 'expired':
        complianceStatus = 'expired'
        console.log('⏰ Verification EXPIRED for user:', vendor_data)
        break
      
      default:
        console.log('ℹ️ Verification status update:', status, 'for user:', vendor_data)
    }

    // Update compliance record
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: complianceStatus,
        data_blob: {
          didit_session_id: session_id,
          verification_status: status,
          vendor_data: vendor_data,
          workflow_id: workflow_id,
          webhook_received_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
    })

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text()
      console.error('❌ Failed to update compliance record:', updateError)
    } else {
      const updatedRecord = await updateResponse.json()
      console.log('✅ Compliance record updated:', updatedRecord[0]?.id)
    }

    // If verification approved, update user's KYC status
    if (shouldMarkUserVerified && vendor_data) {
      console.log('✅ Marking user as KYC verified:', vendor_data)
      
      const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${vendor_data}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          kyc_status: 'verified',
          updated_at: new Date().toISOString()
        })
      })

      if (!userUpdateResponse.ok) {
        console.error('❌ Failed to update user KYC status')
      } else {
        console.log('✅ User KYC status updated to verified')
      }
    }

    return new Response(JSON.stringify({ 
      received: true,
      processed: true,
      session_id: session_id,
      status: complianceStatus,
      user_verified: shouldMarkUserVerified,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Didit v2 webhook processing error:', error)
    
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