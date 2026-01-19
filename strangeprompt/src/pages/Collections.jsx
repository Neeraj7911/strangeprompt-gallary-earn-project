const COLLECTIONS = [
  {
    id: 'lux-retail',
    title: 'Luxury Retail Launches',
    tone: 'Opulent, high-gloss, metropolitan',
    description:
      'Glassy storefront campaigns, mirrored interiors, and spotlighted product stories designed for prestige launches.',
    stats: '24 prompts • 8 series',
    accent: 'from-brand-500 via-brand-700 to-black',
  },
  {
    id: 'astro-fables',
    title: 'Astral Narrative Fables',
    tone: 'Mythic, surreal, cosmic storytelling',
    description:
      'Wide-format epics blending space opera lighting with painterly folklore moments ideal for editorial spreads.',
    stats: '18 prompts • 5 series',
    accent: 'from-brand-500 via-purple-900 to-black',
  },
  {
    id: 'neo-portraiture',
    title: 'Neo Portraiture',
    tone: 'Intimate, cinematic studio treatments',
    description:
      'Portrait studies with controlled haze, couture styling, and textured set design built for fashion and music briefs.',
    stats: '32 prompts • 9 series',
    accent: 'from-brand-400 via-brand-600 to-brand-900',
  },
  {
    id: 'ambient-stilllife',
    title: 'Ambient Still Life',
    tone: 'Organic, tactile, slow luxury',
    description:
      'Moody tabletops, art-directed florals, and sculpted product shots tuned for boutique packaging refreshes.',
    stats: '27 prompts • 6 series',
    accent: 'from-brand-500 via-red-900 to-black',
  },
]

export default function CollectionsPage() {
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[38px] bg-[#140d15]/80 px-6 py-16 shadow-[0_60px_160px_-70px_rgba(229,9,20,0.7)] backdrop-blur-2xl sm:px-10">
        <div className="pointer-events-none absolute left-[-10%] top-[-40%] h-72 w-72 rounded-full bg-gradient-to-br from-brand-500/45 via-brand-700/35 to-black/60 blur-[125px]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-15%] bottom-[-30%] h-80 w-80 rounded-full bg-gradient-to-tr from-brand-600/45 via-red-900/35 to-black/55 blur-[135px]" aria-hidden="true" />
        <div className="relative z-10 grid gap-10 text-brand-200/80 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-200 shadow-[0_18px_44px_-30px_rgba(229,9,20,0.6)]">
              Signature Capsules
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-brand-50 sm:text-5xl">
              Build cohesive narratives with premium-ready prompt collections.
            </h1>
            <p className="max-w-xl text-base text-brand-200/85">
              Each capsule blends lighting direction, color palettes, and camera briefs into a unified story arc. Drop them into pitch decks, motion treatments, or campaign lookbooks.
            </p>
            <ul className="grid max-w-xl gap-5 text-sm text-brand-200/80 sm:grid-cols-2">
              <li className="rounded-3xl bg-[#1a111d]/80 p-4 shadow-[0_24px_65px_-38px_rgba(229,9,20,0.6)]">
                Dynamic lighting recipes for product intros
              </li>
              <li className="rounded-3xl bg-[#1a111d]/80 p-4 shadow-[0_24px_65px_-38px_rgba(229,9,20,0.6)]">
                Mix-and-match prompt variants for campaign arcs
              </li>
            </ul>
          </div>
          <div className="grid gap-6">
            {COLLECTIONS.map((collection) => (
              <article
                key={collection.id}
                className={`relative overflow-hidden rounded-[30px] bg-[#1c121f]/85 p-6 text-brand-200/85 shadow-[0_32px_90px_-40px_rgba(229,9,20,0.6)] transition hover:-translate-y-1 hover:shadow-[0_44px_110px_-48px_rgba(229,9,20,0.72)]`}
              >
                <div className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l ${collection.accent} opacity-25`} aria-hidden="true" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-200 shadow-[0_18px_44px_-30px_rgba(229,9,20,0.6)]">
                    {collection.stats}
                  </div>
                  <h2 className="text-xl font-semibold text-brand-50">{collection.title}</h2>
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-200/70">
                    {collection.tone}
                  </p>
                  <p className="text-sm text-brand-200/80">{collection.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
