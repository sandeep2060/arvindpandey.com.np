import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
	try {
		const supabase = createRouteClient(request)
		const { data: posts, error } = await supabase
			.from('posts')
			.select('*')
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

export async function POST(request: NextRequest) {
	try {
		// For development, skip auth check
		// In production, add proper authentication

		const supabase = createRouteClient(request)
		const body = await request.json()
		const { title, slug, content, excerpt, featured_image } = body

		// Validate required fields
		if (!title || !slug || !content) {
			return NextResponse.json(
				{ error: 'Title, slug, and content are required' },
				{ status: 400 }
			)
		}

		const now = new Date().toISOString()
		const postData = {
			title,
			slug: slugify(slug || title),
			content,
			excerpt: excerpt || '',
			featured_image: featured_image || null,
			published: true,
			published_at: now,
			updated_at: now,
		}

		const { data, error } = await supabase
			.from('posts')
			.insert([postData])
			.select()
			.single()

		if (error) {
			console.error('Insert error:', error)
			return NextResponse.json(
				{ error: error.message || 'Failed to create post' },
				{ status: 500 }
			)
		}

		return NextResponse.json(data, { status: 201 })
	} catch (error) {
		console.error('Unexpected error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
