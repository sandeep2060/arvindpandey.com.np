import { notFound } from 'next/navigation'
import PostEditor from '../editor'
import { createPublicClient } from '@/lib/supabase/server'
import { Post } from '@/types/post'

interface PageProps {
	params: Promise<{
		id: string
	}>
}

const mapPostToEditorData = (post: Post) => ({
	id: post.id?.toString(),
	title: post.title ?? '',
	slug: post.slug ?? '',
	content: post.content ?? '',
	excerpt: post.excerpt ?? '',
	featured_image: post.featured_image ?? '',
})

export default async function EditPostPage({ params }: PageProps) {
	const { id } = await params
	const supabase = createPublicClient()
	const { data: post, error } = await supabase
		.from('posts')
		.select('*')
		.eq('id', id)
		.single<Post>()

	if (error) {
		if (error.code === 'PGRST116') {
			notFound()
		}
		throw new Error(error.message ?? 'Failed to load post')
	}

	if (!post) {
		notFound()
	}

	return <PostEditor initialData={mapPostToEditorData(post)} isEditing />
}
