import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔍 KYC status check function called')
  
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
    console.log('✅ Checking KYC status for user:', user.email)

    // Check user's KYC status from users table
    const userKycResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=kyc_status`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let userKycStatus = 'pending'
    if (userKycResponse.ok) {
      const userData = await userKycResponse.json()
      if (userData.length > 0) {
        userKycStatus = userData[0].kyc_status || 'pending'
      }
    }

    // Check compliance records for detailed verification info
    const complianceResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?user_id=eq.${user.id}&verification_type=eq.identity&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let verificationDetails = null
    if (complianceResponse.ok) {
      const complianceData = await complianceResponse.json()
      if (complianceData.length > 0) {
        verificationDetails = complianceData[0]
      }
    }

    const response = {
      user_id: user.id,
      kyc_status: userKycStatus,
      is_verified: userKycStatus === 'verified',
      can_fund: userKycStatus === 'verified',
      verification_details: verificationDetails ? {
        provider: verificationDetails.provider,
        status: verificationDetails.status,
        verification_id: verificationDetails.verification_id,
        created_at: verificationDetails.created_at,
        updated_at: verificationDetails.updated_at,
        expires_at: verificationDetails.expires_at
      } : null,
      message: userKycStatus === 'verified' 
        ? 'User is verified and can fund their account'
        : userKycStatus === 'rejected'
        ? 'Verification was rejected - contact support'
        : 'Identity verification required before funding'
    }

    console.log('📊 KYC status response:', response)

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ KYC status check error:', error)
    
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