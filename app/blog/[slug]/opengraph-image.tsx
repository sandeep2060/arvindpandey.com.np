import { ImageResponse } from 'next/og'
import { getPostBySlug } from './page'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Blog Post'
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {post?.title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
          }}
        >
          {post?.excerpt}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          myportfolio.com
        </div>
      </div>
    ),
    size
  )
}
