import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock, ArrowLeft, BookOpen, Tag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShareButtons } from '@/components/share-buttons'
import Image from 'next/image'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { Post } from '@/types/post'
import { createPublicClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server component to fetch post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Failed to fetch post:', error)
      return null
    }

    return data as Post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// Fetch related posts
async function getRelatedPosts(currentSlug: string): Promise<Post[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Failed to fetch related posts:', error)
      return []
    }

    return (data as Post[]) || []
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function generateEstimatedReadTime(content: string): string {
  const minutes = getReadingTime(content)
  if (minutes < 1) return 'Less than 1 min'
  return `${minutes} min read`
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const relatedPosts = await getRelatedPosts(slug)

  if (!post || !post.published) {
    notFound()
  }

  const readingTime = getReadingTime(post.content)
  const publishedDate = new Date(post.published_at || post.created_at)
  const formattedDate = format(publishedDate, 'MMMM d, yyyy')

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4" />
            Article
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Image
                src="/img0.jpg"
                alt="Arvind Pandey"
                width={48}
                height={46}
                className="h-8 w-8 rounded-full object-cover"
                priority
              />
              <span>Arvind Pandey</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishedDate.toISOString()}>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{generateEstimatedReadTime(post.content)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{Math.floor(readingTime * 100)} views</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              <Tag className="h-3 w-3" />
              Web Development
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Next.js
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Tutorial
            </span>
          </div>

          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-linear-to-r from-primary/20 to-purple-600/20">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-muted-foreground">Featured Image</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Article Content with Markdown */}
        <article className="mb-16">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>

        {/* Share Section */}
        <Card className="p-6 mb-12 bg-white border border-muted/30 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Enjoyed this article?</h3>
              <p className="text-muted-foreground">Share it with others!</p>
            </div>
            <ShareButtons />
          </div>
        </Card>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Articles</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog">View all</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="text-xs text-muted-foreground mb-3">
                      {format(new Date(relatedPost.published_at || relatedPost.created_at), 'MMM d, yyyy')}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {getReadingTime(relatedPost.content)} min read
                      </span>
                      <Button variant="ghost" size="sm" asChild className="text-primary">
                        <Link href={`/blog/${relatedPost.slug}`}>Read →</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Between Posts */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <Button variant="outline" asChild className="flex-1 justify-start">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Articles
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 justify-center">
            <Link href="/">
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
