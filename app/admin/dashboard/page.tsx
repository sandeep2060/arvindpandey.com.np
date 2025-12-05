'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, LogOut, FileText, Loader2 } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Post {
	id: string
	title: string
	slug: string
	published: boolean
	published_at: string | null
}

export default function AdminDashboard() {
	const { user, signOut, loading: authLoading } = useAuth()
	const router = useRouter()
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [postToDelete, setPostToDelete] = useState<string | null>(null)

	const fetchPosts = useCallback(async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/admin/posts')

			if (response.status === 401) {
				router.push('/login')
				return
			}

			if (!response.ok) {
				const errorData = await response.json()
				console.error('API Error:', errorData)
				setPosts([])
				return
			}

			const data = await response.json()

			// Ensure data is an array
			if (Array.isArray(data)) {
				setPosts(data)
			} else {
				console.error('Invalid data format:', data)
				setPosts([])
			}
		} catch (error) {
			console.error('Error fetching posts:', error)
			setPosts([])
		} finally {
			setLoading(false)
		}
	}, [router])

	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/login')
		} else if (user) {
			fetchPosts()
		}
	}, [user, authLoading, router, fetchPosts])

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/posts/${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				fetchPosts()
				setDeleteDialogOpen(false)
				setPostToDelete(null)
			} else {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to delete post')
			}
		} catch (error) {
			console.error('Error deleting post:', error)
		}
	}

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (!user) return null

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold">Admin Dashboard</h1>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground">
							{user.email}
						</span>
						<Button variant="outline" size="sm" onClick={signOut}>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h2 className="text-3xl font-bold">Blog Posts</h2>
						<p className="text-muted-foreground">Manage your blog posts</p>
					</div>
					<Button onClick={() => router.push('/admin/posts/new')}>
						<Plus className="mr-2 h-4 w-4" />
						New Post
					</Button>
				</div>

				{loading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="grid gap-4">
						{posts.length > 0 ? (
							posts.map((post) => (
								<Card key={post.id}>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle>{post.title}</CardTitle>
												<p className="text-sm text-muted-foreground mt-1">
													{post.published ? 'Published' : 'Draft'} • {post.slug}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => router.push(`/admin/posts/${post.id}`)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setPostToDelete(post.id)
														setDeleteDialogOpen(true)
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardHeader>
								</Card>
							))
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">No posts yet</h3>
									<p className="text-muted-foreground mb-4">
										Create your first blog post to get started
									</p>
									<Button onClick={() => router.push('/admin/posts/new')}>
										<Plus className="mr-2 h-4 w-4" />
										Create Post
									</Button>
								</CardContent>
							</Card>
						)}
					</div>
				)}
			</main>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the post.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => postToDelete && handleDelete(postToDelete)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
