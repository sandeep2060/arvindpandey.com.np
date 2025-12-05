type SupabaseEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
}

type EnvOptions = {
  allowFallback?: boolean
}

export function getSupabaseEnv(options: EnvOptions = {}): SupabaseEnv {
  const { allowFallback = false } = options

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    if (allowFallback) {
      return {
        supabaseUrl: supabaseUrl || '',
        supabaseAnonKey: supabaseAnonKey || '',
      }
    }

    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}
