import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export async function GET() {
	try {
		const supabase = createPublicClient()
		const { data: posts, error } = await supabase
			.from('posts')
			.select('*')
			.eq('published', true)
			.order('published_at', { ascending: false })
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Database error:', error)
			return NextResponse.json([], { status: 200 })
		}

		return NextResponse.json(posts || [])
	} catch (error) {
		console.error('Unexpected error:', error)
		return NextResponse.json([], { status: 200 })
	}
}
