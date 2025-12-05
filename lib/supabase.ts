import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './supabase/config'

export const createClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()
