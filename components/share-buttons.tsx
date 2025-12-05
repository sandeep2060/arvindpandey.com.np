'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy } from 'lucide-react'

export function ShareButtons() {
  const pathname = usePathname()

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${pathname ?? ''}`

  const handleCopy = useCallback(async () => {
    if (typeof navigator === 'undefined') return

    try {
      await navigator.clipboard.writeText(currentUrl)
    } catch (err) {
      console.error('Failed to copy url', err)
    }
  }, [currentUrl])

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: document?.title ?? 'Check this out',
          text: 'Thought you might like this.',
          url: currentUrl,
        })
        return
      } catch (err) {
        console.error('Share failed', err)
      }
    }

    // Fallback to copying the link if the share API isn't supported
    await handleCopy()
  }, [currentUrl, handleCopy])

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-2 transition duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2 transition duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
      >
        <Copy className="h-4 w-4" />
        Copy Link
      </Button>
    </div>
  )
}


