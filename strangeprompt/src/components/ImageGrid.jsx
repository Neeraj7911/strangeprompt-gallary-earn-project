import { useEffect } from 'react'
import ImageCard from './ImageCard'
import { useInfiniteScroll } from '../hooks/usePopularImages'

export default function ImageGrid({ images, loadMore, hasMore, onOpen, onLike, onCopy, loading }) {
  const sentinelRef = useInfiniteScroll(loadMore, hasMore)

  useEffect(() => {
    if (!images.length && hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, images.length, loadMore, loading])

  const shouldShowEmptyState = !loading && !images.length

  return (
    <div className="mt-6">
      {images.length > 0 && (
        <div className="columns-1 gap-x-8 pb-32 sm:columns-2 xl:columns-3 2xl:columns-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onOpen={onOpen}
              onLike={onLike}
              onCopy={onCopy}
              className="mb-8"
            />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="mt-10 h-10 w-full" />}

      {shouldShowEmptyState && (
        <div className="rounded-3xl bg-[#18101c]/80 p-12 text-center text-brand-200/75 shadow-[0_30px_84px_-52px_rgba(229,9,20,0.6)]">
          <p>No uploads yet. Be the first to share your prompt!</p>
        </div>
      )}
    </div>
  )
}
