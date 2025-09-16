const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔍 Check Didit status function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { session_id, user_id } = await req.json()
    
    console.log('🔍 Checking Didit status for session:', session_id, 'user:', user_id)
    
    if (!session_id || !user_id) {
      throw new Error('Missing session_id or user_id')
    }

    // Get user from JWT token for security
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

    // Check Didit API directly for real-time status
    const diditApiKey = Deno.env.get('DIDIT_API_KEY')
    if (!diditApiKey) {
      console.error('❌ DIDIT_API_KEY not found')
      throw new Error('Didit API key not configured')
    }

    console.log('📡 Checking Didit API for session status...')
    
    // Call Didit API to get session status
    const diditResponse = await fetch(`https://verification.didit.me/v2/session/${session_id}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': diditApiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Didit API response status:', diditResponse.status)

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text()
      console.error('❌ Didit API error:', errorText)
      
      // If session not found, check our database
      if (diditResponse.status === 404) {
        console.log('🔍 Session not found in Didit, checking database...')
        
        const dbResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}&user_id=eq.${user_id}&select=*`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (dbResponse.ok) {
          const records = await dbResponse.json()
          if (records.length > 0) {
            const record = records[0]
            console.log('📊 Found database record with status:', record.status)
            
            return new Response(JSON.stringify({
              session_id: session_id,
              status: record.status,
              source: 'database',
              message: `Verification status: ${record.status}`,
              timestamp: new Date().toISOString()
            }), {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            })
          }
        }
      }
      
      throw new Error(`Didit API error: ${errorText}`)
    }

    const sessionData = await diditResponse.json()
    console.log('📊 Didit session data:', {
      session_id: sessionData.session_id,
      status: sessionData.status,
      workflow_id: sessionData.workflow_id,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at
    })

    // Map Didit status to our internal status
    let internalStatus = 'pending'
    let shouldUpdateUser = false

    switch (sessionData.status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
      case 'success':
        internalStatus = 'approved'
        shouldUpdateUser = true
        console.log('✅ Didit verification APPROVED')
        break
      
      case 'rejected':
      case 'failed':
      case 'declined':
        internalStatus = 'rejected'
        console.log('❌ Didit verification REJECTED')
        break
      
      case 'expired':
        internalStatus = 'expired'
        console.log('⏰ Didit verification EXPIRED')
        break
      
      case 'pending':
      case 'in_progress':
      case 'processing':
      default:
        internalStatus = 'pending'
        console.log('⏳ Didit verification still PENDING')
    }

    // Update our compliance record with latest status
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: internalStatus,
        data_blob: {
          ...sessionData,
          last_status_check: new Date().toISOString(),
          didit_raw_status: sessionData.status
        },
        updated_at: new Date().toISOString()
      })
    })

    if (!updateResponse.ok) {
      console.error('❌ Failed to update compliance record')
    } else {
      console.log('✅ Compliance record updated with status:', internalStatus)
    }

    // If approved, update user's KYC status
    if (shouldUpdateUser) {
      console.log('✅ Updating user KYC status to verified')
      
      const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
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
      session_id: session_id,
      status: internalStatus,
      didit_status: sessionData.status,
      source: 'didit_api',
      is_approved: shouldUpdateUser,
      message: shouldUpdateUser 
        ? 'Identity verification approved! You can now fund your account.'
        : internalStatus === 'rejected'
        ? 'Identity verification was rejected. Please contact support.'
        : internalStatus === 'expired'
        ? 'Verification session expired. Please start a new verification.'
        : 'Verification is still being processed. Please wait and check again.',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Didit status check error:', error)
    
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