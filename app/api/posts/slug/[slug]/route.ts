import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

type RouteContext = {
	params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
	try {
		const { slug } = await context.params
		const supabase = createPublicClient()
		const { data: post, error } = await supabase
			.from('posts')
			.select('*')
			.eq('slug', slug)
			.eq('published', true)
			.single()

		if (error) {
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: 'Post not found' },
					{ status: 404 }
				)
			}
			return NextResponse.json(
				{ error: error.message },
				{ status: 500 }
			)
		}

		return NextResponse.json(post)
	} catch (error) {
		console.error('Error fetching post:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch post' },
			{ status: 500 }
		)
	}
}
