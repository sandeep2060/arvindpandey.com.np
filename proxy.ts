import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const transferCookies = (from: NextResponse, to: NextResponse) => {
	from.cookies.getAll().forEach(({ name, value }) => {
		to.cookies.set(name, value)
	})
}

export async function proxy(request: NextRequest) {
	const { supabase, response } = createClient(request)
	const {
		data: { session },
	} = await supabase.auth.getSession()

	const pathname = request.nextUrl.pathname

	if (pathname.startsWith('/admin') && !session) {
		const loginUrl = new URL('/login', request.url)
		const redirectResponse = NextResponse.redirect(loginUrl)
		transferCookies(response, redirectResponse)
		return redirectResponse
	}

	if (pathname === '/login' && session) {
		const dashboardUrl = new URL('/admin/dashboard', request.url)
		const redirectResponse = NextResponse.redirect(dashboardUrl)
		transferCookies(response, redirectResponse)
		return redirectResponse
	}

	return response
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}


