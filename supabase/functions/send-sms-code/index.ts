const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('📱 Send SMS code function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, phone } = await req.json()
    
    console.log('📝 SMS code request:', { 
      user_id, 
      phone: phone ? '***-***-' + phone.slice(-4) : 'none'
    })
    
    // Validate inputs
    if (!user_id) {
      throw new Error('User ID required')
    }
    
    if (!phone || phone.length < 10) {
      throw new Error('Valid phone number required for SMS verification')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔑 Generated SMS code for user:', user_id)

    // Clear any existing SMS codes for this user
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?user_id=eq.${user_id}&method=eq.sms`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!deleteResponse.ok) {
      console.warn('⚠️ Failed to clear existing SMS 2FA codes (may not exist)')
    }

    // Store code in database with expiration
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: user_id,
        code: code,
        method: 'sms',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        used: false
      })
    })

    if (!storeResponse.ok) {
      console.error('❌ Failed to store SMS code')
      throw new Error('Failed to store verification code')
    }

    console.log('✅ SMS code stored in database')

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
    
    console.log('📱 Twilio configuration:', {
      hasAccountSid: !!twilioAccountSid,
      hasAuthToken: !!twilioAuthToken,
      hasPhoneNumber: !!twilioPhoneNumber,
      fromNumber: twilioPhoneNumber,
      toNumber: phone
    })
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('❌ Missing Twilio credentials')
      throw new Error('SMS service not configured - missing Twilio credentials')
    }
    
    // Format phone number for Twilio (ensure it starts with +1)
    let formattedPhone = phone.replace(/[^\d]/g, '') // Remove all non-digits
    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone // Add country code for US numbers
    }
    formattedPhone = '+' + formattedPhone // Add + prefix
    
    console.log('📱 Formatted phone number:', formattedPhone)
    
    // Create SMS message
    const messageBody = `Global Markets Consulting

Your verification code is: ${code}

This code expires in 5 minutes.

Never share this code with anyone. If you didn't request this, please contact support.

- Global Markets Security Team`
    
    console.log('📱 Sending SMS via Twilio API...')
    
    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: messageBody
      })
    })

    console.log('📱 Twilio response status:', twilioResponse.status)

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.text()
      console.error('❌ Twilio API error:', twilioError)
      
      try {
        const errorData = JSON.parse(twilioError)
        console.error('❌ Twilio error details:', errorData)
        
        if (errorData.code === 21211) {
          throw new Error('Phone number not verified for trial account. Please verify this number in Twilio console first.')
        } else if (errorData.code === 21614) {
          throw new Error('Invalid phone number format. Please use format: +1234567890')
        } else if (errorData.code === 21408) {
          throw new Error('Permission denied - phone number may be blocked or invalid')
        } else {
          throw new Error(`SMS delivery failed: ${errorData.message || 'Unknown error'}`)
        }
      } catch (parseError) {
        throw new Error(`SMS delivery failed: ${twilioError}`)
      }
    }

    const twilioResult = await twilioResponse.json()
    console.log('✅ SMS sent successfully via Twilio:', twilioResult.sid)
    
    return new Response(JSON.stringify({
      success: true,
      method: 'sms',
      destination: formattedPhone,
      expires_in: 300, // 5 minutes
      message: `Verification code sent via SMS to ${formattedPhone}`,
      message_sid: twilioResult.sid,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
        
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
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