import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback to hardcoded values for deployment troubleshooting
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhokimvcyycddvcqdxml.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2tpbXZjeXljZGR2Y3FkeG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDY0OTUsImV4cCI6MjA2NTAyMjQ5NX0.nErjNSkSoLyLopDN_KkMpUOMZs39zeYWT0das1ajm9Y'
  
  console.log('Supabase config:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length
  })
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}