const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('📧 Send welcome email function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, email, full_name } = await req.json()
    
    console.log('📝 Welcome email request:', { 
      user_id, 
      email: email ? email.substring(0, 3) + '***' : 'none',
      full_name: full_name ? full_name.substring(0, 3) + '***' : 'none'
    })
    
    // Validate inputs
    if (!user_id || !email) {
      throw new Error('User ID and email required')
    }
    
    if (!email.includes('@')) {
      throw new Error('Valid email address required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Check if welcome email already sent
    const { data: userData, error: userError } = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}&select=welcome_email_sent`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())

    if (userError) {
      console.error('❌ Failed to check user data:', userError)
    } else if (userData && userData.length > 0 && userData[0].welcome_email_sent) {
      console.log('ℹ️ Welcome email already sent for user:', user_id)
      return new Response(JSON.stringify({
        success: true,
        message: 'Welcome email already sent',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

    console.log('📧 Sending welcome email via SendGrid to:', email)
    
    // Get SendGrid credentials
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'welcome@globalmarketsconsulting.com'
    
    console.log('📧 SendGrid configuration:', {
      hasApiKey: !!sendgridApiKey,
      fromEmail: fromEmail,
      toEmail: email
    })
    
    if (!sendgridApiKey) {
      console.error('❌ SENDGRID_API_KEY not found in environment variables')
      throw new Error('Email service not configured - SENDGRID_API_KEY missing')
    }

    const displayName = full_name || email.split('@')[0]
    const loginUrl = `${req.headers.get('origin') || 'https://globalmarketsconsulting.com'}`

    // Create professional welcome email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Global Markets Consulting</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.9); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; padding: 16px;">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 75 L45 55 L55 65 L75 25" stroke="#2563eb" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M65 25 L75 25 L75 35 Z" fill="#2563eb"/>
                <path d="M25 25 L35 35 L45 55 L75 75" stroke="#000000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; font-family: Georgia, serif;">Global Markets Consulting</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 18px;">Professional Investment Advisory</p>
          </div>
          
          <!-- Welcome Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">
                Welcome to Global Markets Consulting!
              </h2>
              <p style="color: #6b7280; margin: 0; font-size: 18px;">
                Hello ${displayName},
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #d1d5db; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">
                Your Account Has Been Created Successfully
              </h3>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">
                You're now ready to access our institutional-grade investment platform and begin your journey with sophisticated portfolio management.
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3); transition: all 0.3s ease;">
                Sign In to Your Account
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                🔐 Next Steps
              </h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                <li>Complete two-factor authentication setup for enhanced security</li>
                <li>Review and sign investment documents</li>
                <li>Complete identity verification (KYC)</li>
                <li>Fund your account to begin investing</li>
              </ul>
            </div>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                🏛️ Why Choose Global Markets Consulting?
              </h3>
              <ul style="color: #0c4a6e; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                <li><strong>SEC Registered:</strong> Fully compliant investment advisor</li>
                <li><strong>SIPC Protected:</strong> Your investments protected up to $500,000</li>
                <li><strong>Institutional Grade:</strong> Professional portfolio management</li>
                <li><strong>Quantitative Strategies:</strong> Data-driven investment approach</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
              Questions? Our team is here to help at 
              <a href="mailto:support@globalmarketsconsulting.com" style="color: #1e40af; text-decoration: none; font-weight: 600;">
                support@globalmarketsconsulting.com
              </a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px; line-height: 1.5;">
              © 2025 Global Markets Consulting LLC<br>
              200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131<br>
              SEC Registered Investment Advisor • SIPC Member Firm
            </p>
            <div style="margin-top: 20px;">
              <a href="${loginUrl}" style="color: #1e40af; text-decoration: none; font-size: 14px; margin: 0 15px;">Privacy Policy</a>
              <a href="${loginUrl}" style="color: #1e40af; text-decoration: none; font-size: 14px; margin: 0 15px;">Terms of Service</a>
              <a href="${loginUrl}" style="color: #1e40af; text-decoration: none; font-size: 14px; margin: 0 15px;">Unsubscribe</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Welcome to Global Markets Consulting! 🚀

Hello ${displayName},

Congratulations! Your account has been created successfully.

You're now ready to access our institutional-grade investment platform and begin your journey with sophisticated portfolio management.

NEXT STEPS:
• Complete two-factor authentication setup for enhanced security
• Review and sign investment documents  
• Complete identity verification (KYC)
• Fund your account to begin investing

WHY CHOOSE GLOBAL MARKETS CONSULTING?
• SEC Registered: Fully compliant investment advisor
• SIPC Protected: Your investments protected up to $500,000
• Institutional Grade: Professional portfolio management
• Quantitative Strategies: Data-driven investment approach

Sign in to your account: ${loginUrl}

Questions? Contact us at support@globalmarketsconsulting.com

© 2025 Global Markets Consulting LLC
200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131
SEC Registered Investment Advisor • SIPC Member Firm
    `

    // Send email using SendGrid API
    const emailPayload = {
      personalizations: [{
        to: [{ email: email, name: displayName }],
        subject: 'Welcome to Global Markets Consulting 🚀'
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
        click_tracking: { enable: true },
        open_tracking: { enable: true }
      },
      categories: ['welcome', 'onboarding']
    }

    console.log('📧 Sending welcome email via SendGrid API...')

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
        }
        
        throw new Error(`Welcome email delivery failed: ${errorData.errors?.[0]?.message || 'Unknown SendGrid error'}`)
      } catch (parseError) {
        throw new Error(`Welcome email delivery failed: ${sendgridError}`)
      }
    }

    console.log('✅ Welcome email sent successfully via SendGrid')

    // Mark welcome email as sent in database
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    if (!updateResponse.ok) {
      console.error('❌ Failed to mark welcome email as sent')
    } else {
      console.log('✅ Welcome email status updated in database')
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Welcome email sent to ${email}`,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
    
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error)
    
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