import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(
	request: NextRequest,
	context: RouteContext
) {
	try {
		const { id } = await context.params
		const supabase = createRouteClient(request)
		const { data: post, error } = await supabase
			.from('posts')
			.select('*')
			.eq('id', id)
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

export async function PUT(
	request: NextRequest,
	context: RouteContext
) {
	try {
		const { id } = await context.params
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
			updated_at: now,
			published_at: body.published_at || now,
		}

		const { data, error } = await supabase
			.from('posts')
			.update(postData)
			.eq('id', id)
			.select()
			.single()

		if (error) {
			console.error('Update error:', error)
			return NextResponse.json(
				{ error: error.message || 'Failed to update post' },
				{ status: 500 }
			)
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('Unexpected error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	context: RouteContext
) {
	try {
		const { id } = await context.params
		const supabase = createRouteClient(request)
		const { error } = await supabase
			.from('posts')
			.delete()
			.eq('id', id)

		if (error) {
			console.error('Delete error:', error)
			return NextResponse.json(
				{ error: error.message || 'Failed to delete post' },
				{ status: 500 }
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Unexpected error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
