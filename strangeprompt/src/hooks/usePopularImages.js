import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPopularImages } from '../firebase/firestore'

const PAGE_SIZE = 20

export function usePopularImages({ category, searchTerm }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const lastDocument = useRef(null)
  const resetCounter = useRef(0)

  useEffect(() => {
    setImages([])
    setHasMore(true)
    lastDocument.current = null
    resetCounter.current += 1
  }, [category, searchTerm])

  const loadImages = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)

    try {
      const snapshot = await fetchPopularImages({
        category,
        searchTerm,
        pageSize: PAGE_SIZE,
        lastVisible: lastDocument.current,
      })

      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      setImages((prev) => {
        if (!lastDocument.current || resetCounter.current > 0) {
          resetCounter.current = 0
          return docs
        }
        const merged = [...prev]
        docs.forEach((item) => {
          if (!merged.some((existing) => existing.id === item.id)) {
            merged.push(item)
          }
        })
        return merged
      })

      const last = snapshot.docs[snapshot.docs.length - 1] || null
      lastDocument.current = last
      setHasMore(Boolean(last))
    } catch (err) {
      console.error(err)
      setError(err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [category, hasMore, loading, searchTerm])

  return {
    images,
    loading,
    error,
    hasMore,
    loadImages,
  }
}

export function useInfiniteScroll(callback, hasMore) {
  const observer = useRef(null)

  const intersectionRef = useCallback(
    (node) => {
      if (!hasMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback()
        }
      })
      if (node) observer.current.observe(node)
    },
    [callback, hasMore],
  )

  return intersectionRef
}
