import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToApprovedImages, fetchTopCopies } from '../firebase/firestore'

export default function CreatorHubPage() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    // Subscribe to recent approved images and build a simple keyword frequency map
    const unsub = subscribeToApprovedImages({ take: 200 }, (snapshot) => {
      try {
        const counts = Object.create(null)
        snapshot.docs.forEach((doc) => {
          const data = doc.data() || {}
          const keywords = Array.isArray(data.searchKeywords) && data.searchKeywords.length
            ? data.searchKeywords
            : [
                ...(data.tags || []),
                ...((data.prompt || '').toLowerCase().split(/\s+/).slice(0, 12)),
              ]

          keywords.forEach((raw) => {
            if (!raw) return
            const key = String(raw).toLowerCase().trim().replace(/[^a-z0-9#-]/g, '')
            if (!key) return
            counts[key] = (counts[key] || 0) + 1
          })
        })

        const items = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 24)
          .map(([k, v]) => ({ keyword: k, count: v }))

        setTrending(items)
      } catch (e) {
        // fail gracefully
        console.error('build trending keywords', e)
      }
    }, (err) => console.error('subscribeToApprovedImages error', err))

    return () => unsub && typeof unsub === 'function' && unsub()
  }, [])

  const [topCopies, setTopCopies] = useState([])

  useEffect(() => {
    let mounted = true
    fetchTopCopies({ limitTo: 5 })
      .then((items) => {
        if (!mounted) return
        setTopCopies(items)
      })
      .catch((err) => console.error('fetchTopCopies error', err))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-10 pb-24">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgba(229,9,20,0.12)] via-[rgba(112,28,68,0.06)] to-transparent p-8" data-reveal>
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.03)] px-3 py-1 text-sm font-semibold uppercase tracking-wider text-[rgba(255,186,204,0.95)]">Creator hub</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white">Showcase your prompts. Design once. Earn forever.</h1>
            <p className="max-w-2xl text-base sm:text-lg text-[rgba(255,230,236,0.9)]">StrangePrompt helps creators monetize creative work — collect sponsor redirects, sell premium prompt packs, and get featured to the right audiences.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-lg">Open dashboard</Link>
              <Link to="/profile/settings" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] px-5 py-3 text-sm font-semibold text-[rgba(255,230,236,0.95)]">Complete profile</Link>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div>
                <p className="text-2xl font-bold text-white">$0</p>
                <p className="text-xs text-[rgba(255,230,236,0.8)]">Estimated day-one earnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24h</p>
                <p className="text-xs text-[rgba(255,230,236,0.8)]">Typical review time</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src="/assets/creator-hero.jpg" alt="Creator showcase" className="h-56 sm:h-80 w-full object-cover brightness-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="text-sm text-white">
                <div className="font-semibold">Featured prompt pack</div>
                <div className="text-xs text-[rgba(255,230,236,0.85)]">Curated by StrangePrompt</div>
              </div>
              <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs font-semibold text-white">Explore</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-3">
        <article className="col-span-2 rounded-2xl bg-[var(--surface-card)]/85 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-[var(--text-base)]">How it works</h3>
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
              <h4 className="font-semibold">Prototype</h4>
              <p className="text-sm text-[var(--text-muted)] mt-2">Iterate quickly with previews and prompts stored with each upload.</p>
            </div>
            <div className="rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
              <h4 className="font-semibold">Review</h4>
              <p className="text-sm text-[var(--text-muted)] mt-2">Automated checks + human review to keep content signal-ready.</p>
            </div>
            <div className="rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
              <h4 className="font-semibold">Earn</h4>
              <p className="text-sm text-[var(--text-muted)] mt-2">Combine redirects, premium copies, and gallery boosts to maximize revenue.</p>
            </div>
          </div>
        </article>

        <aside className="rounded-2xl bg-[var(--surface-card)]/85 p-6 shadow-lg">
          <h4 className="font-semibold">Upload tips</h4>
          <ul className="mt-3 text-sm text-[var(--text-muted)] list-disc list-inside">
            <li>Use 1400px+ final renders with no UI chrome.</li>
            <li>Include the exact prompt so others can remix.</li>
            <li>Add at least three tags to improve discovery.</li>
          </ul>
        </aside>
      </section>

      <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-[var(--surface-card)]/85 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[var(--text-base)]">Trending Keywords</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Live keywords and hashtags from recent uploads — tap to explore or add to your tags.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {trending.length === 0 && <span className="text-sm text-[var(--text-muted)]">Loading trending keywords…</span>}
            {trending.map((t) => (
              <Link
                key={t.keyword}
                to={`/gallery?search=${encodeURIComponent(t.keyword)}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.06)] to-transparent px-4 py-2 text-sm font-medium text-white hover:scale-105 transition"
              >
                <span className="text-[rgba(229,9,20,0.95)]">#{t.keyword.replace(/^#/, '')}</span>
                <span className="text-[var(--text-muted)]">{t.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-[var(--surface-card)]/85 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[var(--text-base)]">Top copied packs</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Most purchased premium prompt packs — creators are selling these now.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {topCopies.length === 0 && <div className="text-sm text-[var(--text-muted)]">Loading top copies…</div>}
            {topCopies.map((post) => (
              <Link key={post.id} to={post.shareSlug ? `/image/${post.shareSlug}` : `/image/${post.id}`} className="group relative overflow-hidden rounded-lg">
                <img src={post.imageUrl} alt={post.prompt?.slice(0, 80) || 'prompt image'} className="h-36 sm:h-40 w-full object-cover rounded-md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute left-3 bottom-3 flex items-center gap-3">
                  <div className="text-sm text-white font-semibold truncate max-w-[10rem]">{post.prompt ? post.prompt.slice(0, 48) : 'Prompt'}</div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.5)] px-2 py-1 text-xs font-semibold text-[rgba(229,9,20,0.95)]">{post.copies || 0}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
