export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string | null
  published: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image?: string | null
  published_at: string | null
  created_at?: string | null
}
