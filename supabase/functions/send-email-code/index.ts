const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('📧 Send email code function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, email } = await req.json()
    
    console.log('📝 Email code request:', { 
      user_id, 
      email: email ? email.substring(0, 3) + '***' : 'none'
    })
    
    // Validate inputs
    if (!user_id) {
      throw new Error('User ID required')
    }
    
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔑 Generated email code for user:', user_id)

    // Clear any existing email codes for this user (method-specific)
    console.log('🧹 Clearing existing email codes for user:', user_id)
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?user_id=eq.${user_id}&method=eq.email`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!deleteResponse.ok) {
      console.warn('⚠️ Failed to clear existing email codes (may not exist)')
    } else {
      console.log('✅ Existing email codes cleared')
    }

    // Store code in database with expiration
    console.log('💾 Storing email verification code in database...')
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user_id,
        code: code,
        method: 'email',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        used: false
      })
    })

    if (!storeResponse.ok) {
      const storeError = await storeResponse.text()
      console.error('❌ Failed to store email code:', storeError)
      console.error('❌ Failed to store email code')
      throw new Error('Failed to store verification code')
    } else {
      const storedCode = await storeResponse.json()
      console.log('✅ Email code stored successfully:', {
        id: storedCode[0]?.id,
        user_id: user_id,
        method: 'email',
        expires_at: storedCode[0]?.expires_at,
        code_preview: '***' + code.slice(-2)
      })
    }

    // Add delay to ensure database transaction is fully committed
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('⏱️ Database commit delay completed')

    // Get SendGrid credentials
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@globalmarketsconsulting.com'
    
    console.log('📧 SendGrid configuration:', {
      hasApiKey: !!sendgridApiKey,
      fromEmail: fromEmail,
      toEmail: email
    })
    
    if (!sendgridApiKey) {
      console.error('❌ SENDGRID_API_KEY not found in environment variables')
      throw new Error('Email service not configured - SENDGRID_API_KEY missing')
    }

    // Create professional HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Global Markets Consulting</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Secure Account Access</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">
              Your Verification Code
            </h2>
            
            <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; text-align: center;">
              Enter this code in your browser to complete the login process:
            </p>
            
            <!-- Verification Code Box -->
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #d1d5db; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="font-size: 48px; font-weight: 800; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; margin-bottom: 10px;">
                ${code}
              </div>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                🔒 Security Notice
              </h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                <li>Never share this code with anyone</li>
                <li>Global Markets staff will never ask for this code</li>
                <li>If you didn't request this, please contact support immediately</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
              © 2025 Global Markets Consulting LLC<br>
              SEC Registered Investment Advisor
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Global Markets Consulting - Verification Code

Your verification code is: ${code}

Enter this code in your browser to complete the login process.

This code expires in 10 minutes for security purposes.

SECURITY NOTICE:
- Never share this code with anyone
- Global Markets staff will never ask for this code
- If you didn't request this, please contact support immediately

© 2025 Global Markets Consulting LLC
SEC Registered Investment Advisor
    `

    // Send email using SendGrid API
    const emailPayload = {
      personalizations: [{
        to: [{ email: email }],
        subject: 'Your Global Markets Verification Code'
      }],
      from: { 
        email: fromEmail,
        name: 'Global Markets Consulting'
      },
      content: [
        {
          type: 'text/plain',
          value: textContent
        },
        {
          type: 'text/html',
          value: htmlContent
        }
      ],
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: false }
      }
    }

    console.log('📧 Sending email via SendGrid API...')

    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    console.log('📧 SendGrid response status:', emailResponse.status)

    if (!emailResponse.ok) {
      const sendgridError = await emailResponse.text()
      console.error('❌ SendGrid API error:', sendgridError)
      
      try {
        const errorData = JSON.parse(sendgridError)
        console.error('❌ SendGrid error details:', errorData)
        
        if (errorData.errors?.[0]?.message?.includes('The from address does not match a verified Sender Identity')) {
          throw new Error(`Email sender not verified in SendGrid. Please verify ${fromEmail} or use a verified sender.`)
        } else if (errorData.errors?.[0]?.message?.includes('credits')) {
          throw new Error('Email service temporarily unavailable - maximum credits exceeded. Please try SMS verification instead.')
        } else {
          throw new Error(`Email delivery failed: ${errorData.errors?.[0]?.message || 'Unknown SendGrid error'}`)
        }
      } catch (parseError) {
        throw new Error(`Email delivery failed: ${sendgridError}`)
      }
    }

    console.log('✅ Email sent successfully via SendGrid')
    
    return new Response(JSON.stringify({
      success: true,
      method: 'email',
      destination: email,
      expires_in: 600, // 10 minutes
      message: `Verification code sent to ${email}`,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
        
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        method: 'email',
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