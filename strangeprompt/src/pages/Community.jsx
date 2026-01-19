const COMMUNITY_PILLARS = [
  {
    title: 'Mentored feedback loops',
    description: 'Seasoned art directors leave scene-by-scene critique to refine your prompt craft and visual language.',
  },
  {
    title: 'Real-time trend briefings',
    description: 'Weekly drops decode emerging aesthetics across fashion, tech, and entertainment verticals.',
  },
  {
    title: 'Collaboration rituals',
    description: 'Live build sessions pair concept artists with writers to storyboard premium brand universes together.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Isabella Chen',
    role: 'Creative Director, Nouvelle Studios',
    quote:
      'StrangePrompt has become our internal reference room. The talent pool here thinks in cinematic beats, not just keywords.',
  },
  {
    name: 'Marcos De León',
    role: 'Head of Experiential, Aura Collective',
    quote:
      'The collective critique format accelerates our explorations. Moodboards feel production-ready in a single evening.',
  },
]

export default function CommunityPage() {
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[38px] bg-[#140d15]/80 px-6 py-16 shadow-[0_60px_160px_-70px_rgba(229,9,20,0.7)] backdrop-blur-2xl sm:px-10">
        <div className="pointer-events-none absolute left-[-20%] top-[-30%] h-72 w-72 rounded-full bg-gradient-to-br from-brand-500/45 via-brand-700/35 to-black/55 blur-[125px]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-15%] bottom-[-35%] h-80 w-80 rounded-full bg-gradient-to-tr from-brand-600/45 via-red-900/35 to-black/55 blur-[135px]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-12 text-brand-200/80 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-200 shadow-[0_18px_44px_-30px_rgba(229,9,20,0.6)]">
              Community Atelier
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-brand-50 sm:text-5xl">
              Where prompt designers, storytellers, and producers shape immersive worlds together.
            </h1>
            <p className="text-base text-brand-200/85">
              Join a curated network of multidisciplinary creatives. Share pitch decks, co-build style frames, and exchange briefs that push the StrangePrompt aesthetic forward.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-brand-200/75">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 font-semibold text-brand-200 shadow-[0_22px_48px_-32px_rgba(229,9,20,0.58)]">
                5k+ active creatives
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 font-semibold text-brand-200 shadow-[0_22px_48px_-32px_rgba(229,9,20,0.58)]">
                Invite-only salons weekly
              </span>
            </div>
          </div>
          <div className="grid gap-6 rounded-3xl bg-[#1a111d]/80 p-6 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.65)] backdrop-blur-xl">
            {COMMUNITY_PILLARS.map((pillar) => (
              <article key={pillar.title} className="space-y-3 text-brand-200/80">
                <h2 className="text-base font-semibold text-brand-50">{pillar.title}</h2>
                <p className="text-sm text-brand-200/75">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-10 text-brand-200/80 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 rounded-[32px] bg-[#18101c]/85 p-8 shadow-[0_38px_98px_-55px_rgba(229,9,20,0.6)] backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-200/70">
            Residency tracks
          </h2>
          <ul className="grid gap-4 text-sm text-brand-200/75">
            <li className="rounded-3xl bg-[#1a111d]/80 p-4 shadow-[0_26px_70px_-38px_rgba(229,9,20,0.6)]">
              Capsule residencies pair you with brand strategists to produce lived-in worlds ready for client presentation decks.
            </li>
            <li className="rounded-3xl bg-[#1a111d]/80 p-4 shadow-[0_26px_70px_-38px_rgba(229,9,20,0.6)]">
              Monthly showings spotlight community releases with live critique and sync sessions.
            </li>
          </ul>
        </div>
        <div className="space-y-6 rounded-[32px] bg-[#18101c]/85 p-8 shadow-[0_38px_98px_-55px_rgba(229,9,20,0.6)] backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-200/70">
            Voices from the studio
          </h2>
          <div className="space-y-5 text-brand-200/80">
            {TESTIMONIALS.map((entry) => (
              <blockquote key={entry.name} className="space-y-3">
                <p className="text-base font-medium text-brand-50">“{entry.quote}”</p>
                <footer className="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                  {entry.name} • {entry.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
