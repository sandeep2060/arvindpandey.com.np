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

		// Check if user is authenticated
		const { data: { session }, error: authError } = await supabase.auth.getSession()

		if (authError || !session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { data: post, error } = await supabase
			.from('posts')
			.select('*')
			.eq('id', id)
			.single()

		if (error) throw error
		return NextResponse.json(post)
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

export async function PUT(
	request: NextRequest,
	context: RouteContext
) {
	try {
		const { id } = await context.params
		const supabase = createRouteClient(request)

		// Check if user is authenticated
		const { data: { session }, error: authError } = await supabase.auth.getSession()

		if (authError || !session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { title, slug, content, excerpt, featured_image } = body

		const now = new Date().toISOString()
		const postData = {
			title,
			slug: slugify(slug || title),
			content,
			excerpt,
			featured_image: featured_image || null,
			published: true,
			updated_at: now,
			published_at: body.published_at || now
		}

		const { data, error } = await supabase
			.from('posts')
			.update(postData)
			.eq('id', id)
			.select()
			.single()

		if (error) throw error
		return NextResponse.json(data)
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

export async function DELETE(
	request: NextRequest,
	context: RouteContext
) {
	try {
		const { id } = await context.params
		const supabase = createRouteClient(request)

		// Check if user is authenticated
		const { data: { session }, error: authError } = await supabase.auth.getSession()

		if (authError || !session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { error } = await supabase
			.from('posts')
			.delete()
			.eq('id', id)

		if (error) throw error
		return NextResponse.json({ success: true })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
