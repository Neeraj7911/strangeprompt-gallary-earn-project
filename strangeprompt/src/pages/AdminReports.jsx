import { useEffect, useState } from 'react'
import { subscribeToReports, resolveReport, fetchImageById } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase/config'

export default function AdminReportsPage() {
  const { isAuthenticated } = useAuth()
  const [reports, setReports] = useState([])
  const [imagesMap, setImagesMap] = useState({})

  useEffect(() => {
    if (!isAuthenticated) return
    let unsub = null
    const checkAdminAndSubscribe = async () => {
      try {
        const idToken = await auth.currentUser?.getIdTokenResult()
        const isAdmin = Boolean(idToken?.claims?.admin)
        if (!isAdmin) {
          setReports([])
          return
        }
        unsub = subscribeToReports((snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setReports(items)
          // prefetch image data
          items.forEach(async (r) => {
            if (r.imageId && !imagesMap[r.imageId]) {
              try {
                const img = await fetchImageById(r.imageId)
                setImagesMap((prev) => ({ ...prev, [r.imageId]: img }))
              } catch (err) {
                console.error('fetchImageById', err)
              }
            }
          })
        })
      } catch (err) {
        console.error('admin subscription error', err)
      }
    }
    checkAdminAndSubscribe()
    return () => unsub && unsub()
  }, [isAuthenticated])

  const handleResolve = async (reportId) => {
    try {
      await resolveReport(reportId, { status: 'resolved' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDismiss = async (reportId) => {
    try {
      await resolveReport(reportId, { status: 'dismissed' })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Reports queue</h1>
      {!reports.length && <p className="text-sm text-[var(--text-muted)]">No reports found.</p>}
      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-black/20">
                {imagesMap[r.imageId] && (
                  <img src={imagesMap[r.imageId].imageUrl} alt={imagesMap[r.imageId].title || 'image'} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Report {r.id}</div>
                  <div className="text-sm text-[var(--text-muted)]">Status: {r.status}</div>
                </div>
                <p className="mt-2 text-sm">Reason: {r.reason}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Reporter: {r.reporterId || 'anonymous'}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleResolve(r.id)} className="rounded-full bg-emerald-500 px-3 py-1 text-sm text-white">Resolve</button>
                  <button onClick={() => handleDismiss(r.id)} className="rounded-full bg-rose-500 px-3 py-1 text-sm text-white">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
