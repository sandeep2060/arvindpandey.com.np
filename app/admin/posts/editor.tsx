'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface PostEditorProps {
	initialData?: {
		id?: string
		title: string
		slug: string
		content: string
		excerpt: string
		featured_image?: string | null
	}
	isEditing?: boolean
}

export default function PostEditor({ initialData, isEditing = false }: PostEditorProps) {
	const router = useRouter()
	const [formData, setFormData] = useState({
		title: initialData?.title || '',
		slug: initialData?.slug || '',
		content: initialData?.content || '',
		excerpt: initialData?.excerpt || '',
		featured_image: initialData?.featured_image || '',
	})
	const [loading, setLoading] = useState(false)
	const [uploadingImage, setUploadingImage] = useState(false)
	const [uploadError, setUploadError] = useState('')

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const url = isEditing && initialData?.id
				? `/api/admin/posts/${initialData.id}`
				: '/api/admin/posts'

			const method = isEditing ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			if (response.ok) {
				router.push('/admin/dashboard')
			} else {
				throw new Error('Failed to save post')
			}
		} catch (error) {
			console.error('Error saving post:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleImageUpload = async (file: File) => {
		setUploadError('')
		setUploadingImage(true)
		try {
			const body = new FormData()
			body.append('file', file)
			const response = await fetch('/api/admin/posts/upload', {
				method: 'POST',
				body,
			})
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to upload image')
			}
			setFormData((prev) => ({ ...prev, featured_image: data.url }))
		} catch (error) {
			console.error('Image upload failed:', error)
			const message = error instanceof Error ? error.message : 'Failed to upload image'
			setUploadError(message)
		} finally {
			setUploadingImage(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<Button variant="ghost" onClick={() => router.back()} className="mb-8">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Dashboard
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => {
									setFormData({
										...formData,
										title: e.target.value,
										slug: generateSlug(e.target.value)
									})
								}}
								required
								placeholder="Enter post title"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								value={formData.slug}
								onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
								required
								placeholder="post-slug"
							/>
							<p className="text-sm text-muted-foreground">
								This will be used in the URL: /blog/{formData.slug}
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="featured_image">Featured image URL</Label>
							<Input
								id="featured_image"
								value={formData.featured_image}
								onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
								placeholder="https://example.com/image.jpg"
								disabled={loading}
							/>
							<div className="flex flex-col gap-2">
								<Input
									type="file"
									accept="image/*"
									onChange={(event) => {
										const file = event.target.files?.[0]
										if (file) {
											void handleImageUpload(file)
										}
									}}
									disabled={loading || uploadingImage}
								/>
								{uploadingImage && <p className="text-sm text-muted-foreground">Uploading...</p>}
								{uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
							</div>
							<p className="text-sm text-muted-foreground">
								Displayed on the blog listing and detail page. Leave empty to use the default placeholder.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="excerpt">Excerpt</Label>
							<Textarea
								id="excerpt"
								value={formData.excerpt}
								onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
								rows={3}
								placeholder="Brief description of the post"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="content">Content</Label>
							<Textarea
								id="content"
								value={formData.content}
								onChange={(e) => setFormData({ ...formData, content: e.target.value })}
								rows={10}
								placeholder="Write your post content here..."
								className="font-mono"
							/>
						</div>

						<div className="flex justify-end">
							<Button type="submit" disabled={loading}>
								<Save className="mr-2 h-4 w-4" />
								{loading ? 'Saving...' : 'Save Post'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
