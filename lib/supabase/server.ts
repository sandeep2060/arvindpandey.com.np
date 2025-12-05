import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { getSupabaseEnv } from './config'

export const createClient = () => {
  const cookieStore = cookies() as unknown as Awaited<ReturnType<typeof cookies>>
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Handle cookies in middleware
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Handle cookies in middleware
        }
      },
    },
  })
}

export const createPublicClient = () =>
  createSupabaseClient(getSupabaseEnv().supabaseUrl, getSupabaseEnv().supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })

export const createRouteClient = (request: NextRequest) =>
  createServerClient(getSupabaseEnv().supabaseUrl, getSupabaseEnv().supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set() {
        // No-op; route handlers can't mutate request cookies directly
      },
      remove() {
        // No-op
      },
    },
  })
