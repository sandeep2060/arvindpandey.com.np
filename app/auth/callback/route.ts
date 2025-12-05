import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseEnv } from '@/lib/supabase/config'

export async function POST(request: NextRequest) {
	const response = NextResponse.json({ success: true })

	const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return request.cookies.get(name)?.value
			},
			set(name: string, value: string, options: CookieOptions) {
				response.cookies.set({
					name,
					value,
					...options,
				})
			},
			remove(name: string, options: CookieOptions) {
				response.cookies.set({
					name,
					value: '',
					...options,
					maxAge: 0,
				})
			},
		},
	})

	const { event, session } = await request.json()

	if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event) && session) {
		await supabase.auth.setSession(session)
	}

	if (event === 'SIGNED_OUT') {
		await supabase.auth.signOut()
	}

	return response
}

