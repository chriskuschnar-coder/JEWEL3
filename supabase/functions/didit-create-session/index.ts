import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, first_name, last_name, return_url } = await req.json()

    // Validate required fields
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Didit API key from environment
    const apiKey = Deno.env.get('DIDIT_API_KEY')
    if (!apiKey) {
      console.error('❌ DIDIT_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Didit API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hardcoded workflow ID
    const workflowId = 'f8d62959-9009-422b-a49a-364909986ab7'

    console.log('🚀 Creating Didit v2 session for user:', user_id)

    // Create Didit v2 session
    const diditResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: user_id,
        callback: return_url || `${new URL(req.url).origin}/kyc/callback`,
        contact_details: {
          email: email,
          email_lang: 'en'
        },
        metadata: {
          user_id: user_id,
          first_name: first_name || '',
          last_name: last_name || ''
        }
      })
    })

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text()
      console.error('❌ Didit API error:', diditResponse.status, errorText)
      
      let errorMessage = 'Failed to create verification session'
      if (diditResponse.status === 401) {
        errorMessage = 'Invalid API key - check Didit credentials'
      } else if (diditResponse.status === 400) {
        errorMessage = 'Invalid workflow ID or request parameters'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          status: diditResponse.status
        }),
        { 
          status: diditResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const sessionData = await diditResponse.json()
    console.log('✅ Didit v2 session created:', sessionData.session_id)

    // Store compliance record
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('compliance_records')
      .insert({
        user_id: user_id,
        provider: 'didit',
        verification_type: 'identity',
        status: 'pending',
        verification_id: sessionData.session_id,
        data_blob: {
          session_number: sessionData.session_number,
          workflow_id: workflowId,
          created_at: new Date().toISOString()
        }
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
    } else {
      console.log('✅ Compliance record created')
    }

    // Return session data with client URL for iframe
    return new Response(
      JSON.stringify({
        session_id: sessionData.session_id,
        session_number: sessionData.session_number,
        client_url: sessionData.url, // This is the URL for the iframe
        status: sessionData.status,
        workflow_id: sessionData.workflow_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})