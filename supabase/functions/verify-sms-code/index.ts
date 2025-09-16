const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔍 Verify SMS code function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const requestBody = await req.json()
    const { user_id, code, phone } = requestBody
    
    console.log('🔍 SMS verification request:', { 
      user_id, 
      code: code ? '***' + code.slice(-2) : 'none', 
      phone: phone ? '***-***-' + phone.slice(-4) : 'none'
    })
    
    // Validate inputs
    if (!user_id) {
      console.error('❌ Missing user_id in request')
      throw new Error('User ID required')
    }
    
    if (!phone || !phone.startsWith('+')) {
      console.error('❌ Missing or invalid phone in request')
      throw new Error('Valid phone number required for SMS verification')
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.error('❌ Invalid code format:', code)
      throw new Error('Invalid verification code format - must be 6 digits')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('🔍 Checking database for SMS verification codes...')
    
    // Get the most recent unused SMS code for this user
    const codesResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?user_id=eq.${user_id}&method=eq.sms&used=eq.false&expires_at=gte.${new Date().toISOString()}&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!codesResponse.ok) {
      console.error('❌ Failed to retrieve SMS verification codes')
      throw new Error('Failed to retrieve verification codes')
    }

    const codes = await codesResponse.json()
    console.log('📊 Found SMS codes:', codes.length)
    
    if (codes.length === 0) {
      console.error('❌ No valid SMS codes found for user:', user_id)
      throw new Error('No valid verification code found. Code may have expired. Please request a new SMS code.')
    }

    const storedCode = codes[0]
    console.log('🔍 Comparing SMS codes:', { 
      provided: '***' + code.slice(-2), 
      stored: '***' + storedCode.code.slice(-2),
      expires: storedCode.expires_at,
      used: storedCode.used
    })

    // Check if code has expired
    if (new Date(storedCode.expires_at) < new Date()) {
      console.log('⏰ SMS code has expired')
      throw new Error('Verification code has expired. Please request a new SMS code.')
    }

    // Verify the code matches
    if (code === storedCode.code) {
      console.log('✅ SMS code verification successful')
      
      // Mark code as used to prevent reuse
      const markUsedResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?id=eq.${storedCode.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          used: true
        })
      })

      if (!markUsedResponse.ok) {
        console.error('❌ Failed to mark SMS code as used')
      }

      // Update user's last login timestamp
      const updateLoginResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          last_login: new Date().toISOString(),
          two_factor_verified_at: new Date().toISOString()
        })
      })

      if (!updateLoginResponse.ok) {
        console.error('❌ Failed to update last login')
      }

      return new Response(JSON.stringify({
        valid: true,
        success: true,
        user_id: user_id,
        method: 'sms',
        message: 'SMS verification successful',
        redirect_to: 'dashboard',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    } else {
      console.log('❌ SMS code verification failed - codes do not match')
      
      return new Response(JSON.stringify({
        valid: false,
        success: false,
        method: 'sms',
        message: 'Invalid verification code',
        error: 'The verification code you entered is incorrect. Please check your text message and try again.',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }
  } catch (error) {
    console.error('❌ SMS verification error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        valid: false,
        success: false,
        method: 'sms',
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