import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for WebContainer
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

console.log('🔧 Supabase client configuration:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
})

// Create Supabase client with proper configuration
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'hedge-fund-platform'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test connection on initialization with better error handling
supabaseClient.from('users').select('count', { count: 'exact', head: true }).limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      console.log('✅ Supabase connection test successful')
    }
  })
  .catch(err => {
    console.error('❌ Supabase connection test error:', {
      message: err.message,
      stack: err.stack,
      url: supabaseUrl,
      keyLength: supabaseAnonKey?.length
    })
  })