const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('👑 Promote user to admin function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { email } = await req.json()
    
    console.log('📝 Admin promotion request for email:', email ? email.substring(0, 3) + '***' : 'none')
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('🔐 Calling promote_user_to_admin function...')
    
    // Call the database function using service role
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/promote_user_to_admin`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_email: email
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Database function error:', errorText)
      throw new Error(`Database error: ${errorText}`)
    }

    const result = await response.json()
    console.log('📊 Promotion result:', result)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to promote user')
    }

    console.log('✅ User successfully promoted to admin:', result.email)
    
    return new Response(JSON.stringify({
      success: true,
      message: result.message,
      user_id: result.user_id,
      email: result.email,
      role: result.new_role || result.role,
      is_admin: result.is_admin,
      promoted_at: result.promoted_at,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
    
  } catch (error) {
    console.error('❌ Admin promotion failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
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