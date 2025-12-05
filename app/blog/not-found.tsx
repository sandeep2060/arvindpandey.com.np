import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
          <FileText className="h-10 w-10" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>

        <p className="text-muted-foreground mb-8">
          The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
          Check out our other articles below.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/blog">
              Browse All Posts
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
