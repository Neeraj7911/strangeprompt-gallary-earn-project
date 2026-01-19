import { useState } from 'react'
import { Link } from 'react-router-dom'

const heroStats = [
  {
    value: '$38.40',
    label: 'Avg sponsor CPM',
  },
  {
    value: '< 7 days',
    label: 'Payout window',
  },
  {
    value: '93%',
    label: 'First-pass approvals',
  },
]

const revenueStreams = [
  {
    title: 'Redirect sponsorships',
    description:
      'Brands auto-match to your prompt based on niche signals and engagement history. Payouts scale with CTR tiers and seasonal bonuses.',
    metric: '+22% average CTR bonus',
  },
  {
    title: 'Premium prompt copies',
    description:
      'Unlock premium downloads of your prompt pack. StrangePrompt manages access, licensing, and caption bundles so you keep creating.',
    metric: 'Global licensing handled',
  },
  {
    title: 'Gallery features',
    description:
      'Homepage takeovers, newsletters, and trend playlists broadcast your prompt to new collectors and brand partners every week.',
    metric: '2M monthly impressions',
  },
]

const acceleratorHighlights = [
  {
    title: 'Signal boost drops',
    description: 'Top-performing prompts land in paid discovery slots across partner newsletters and carousel placements.',
    stat: '+410% visibility window lift',
  },
  {
    title: 'Dynamic pricing engine',
    description: 'Experiment with premium copy pricing using live elasticity hints informed by your redirect data.',
    stat: 'Suggested sweet-spot alerts',
  },
  {
    title: 'Creator-to-brand warm intro',
    description: 'Match with briefs from lifestyle, tech, and entertainment partners the moment your prompt breaks trend thresholds.',
    stat: 'New briefs weekly',
  },
]

const sponsorTiers = [
  {
    tier: 'Starter',
    cpm: '$24 – $32',
    requirements: '1k+ redirects · 2 approved prompts',
    perks: 'Auto-match queue, shared analytics, instant payouts',
  },
  {
    tier: 'Growth',
    cpm: '$33 – $42',
    requirements: '5k+ redirects · 6 approved prompts',
    perks: 'Audience lookalike boosts, premium copy up-sells, concierge review',
  },
  {
    tier: 'Elite',
    cpm: '$43 – $62',
    requirements: '15k+ redirects · 12 approved prompts',
    perks: 'Custom sponsor briefs, paid gallery takeovers, residency priority',
  },
]

const supportChannels = [
  {
    title: '1:1 launch diagnostics',
    description: 'Review heatmaps with a strategist before shipping. Walk away with a three-week optimization plan.',
    action: 'Book a diagnostics session',
  },
  {
    title: 'Creator-only Discord',
    description: 'Swap prompt builds, share sponsor feedback loops, and test caption hooks with peers in real time.',
    action: 'Join the creator Discord',
  },
  {
    title: 'Monthly masterclasses',
    description: 'Live breakdowns from top earners covering redirect funnels, licensing, and remix tactics.',
    action: 'Reserve your seat',
  },
]

const seoPlaybook = [
  {
    title: 'Rank for "online work" searches',
    description:
      'Publish prompt breakdowns that highlight workflow, tools, and timelines. Use structured headings like “How I earn online with prompts” to surface in work-from-home queries.',
    takeaway: 'Add weekly how-to threads inside your gallery captions.',
  },
  {
    title: 'Capture "earn money by uploading images" intent',
    description:
      'Show the exact steps from render export to paid redirect link. Include payout screenshots and average CPM figures to build trust with searchers ready to upload assets today.',
    takeaway: 'Embed mini case studies on each prompt detail page.',
  },
  {
    title: 'Own "prompt marketplaces" keywords',
    description:
      'Optimize a pillar post comparing StrangePrompt tiers to marketplaces. Link every section back to your prompt packs to convert long-tail traffic.',
    takeaway: 'Create an evergreen comparison landing page in Notion or your site.',
  },
]

const socialFlywheels = [
  {
    title: 'Hook in three beats',
    description: 'Lead with the before image, flash your prompt, and close with the campaign-ready render inside 7 seconds.',
    format: 'Short-form video · Reels, TikTok, Shorts',
  },
  {
    title: 'Thread the process',
    description: 'Share prompt tokens, style references, and metrics across five-step carousels so followers can replicate—and click.',
    format: 'Carousel threads · LinkedIn, X, Instagram',
  },
  {
    title: 'Drop the remix challenge',
    description: 'Post your base prompt and invite creators to remix. Feature the best results and redirect traffic back to your premium pack.',
    format: 'Duet-friendly · TikTok, Instagram Collabs',
  },
]

const viralSignals = [
  {
    label: 'Visual stopper',
    detail: 'High-contrast cover image cropped for vertical feeds with bold headline text.',
  },
  {
    label: 'Prompt reveal',
    detail: 'On-screen captions or pinned comments containing the exact prompt for copy-ready engagement.',
  },
  {
    label: 'CTA loop',
    detail: 'End every post with “grab the full prompt pack” plus a StrangePrompt redirect link.',
  },
  {
    label: 'Social proof',
    detail: 'Share redirect counts and sponsor wins within 24 hours to propel algorithmic boosts.',
  },
]

const marqueeMessages = [
  'Prompt makers earning on redirect ads',
  'Upload once · collect sponsor revenue',
  'Premium copies priced by you',
  'StrangePrompt accelerates creator payouts',
  'Sponsor-ready prompts unlock brand briefs',
  'AI images fueling multi-channel campaigns',
]

const toolkitFeatures = [
  {
    title: 'AI policy scan',
    description: 'Automated compliance checks flag likeness, safety, and brand issues before you hit submit.',
  },
  {
    title: 'Prompt version control',
    description: 'Iterate fast with side-by-side comparisons, heatmap history, and easy rollbacks.',
  },
  {
    title: 'Social launch playbooks',
    description: 'Generate caption kits, platform-specific hooks, and best post times instantly.',
  },
  {
    title: 'Performance heatmaps',
    description: 'See which assets convert across redirect funnels so you can optimize in real time.',
  },
  {
    title: 'Sponsor matchmaking',
    description: 'Machine learning pairs your aesthetic with briefs from global brands and agencies.',
  },
  {
    title: 'Creator concierge',
    description: 'Hit five approvals and unlock 1:1 strategy sessions with the StrangePrompt revenue team.',
  },
]

const requirements = [
  {
    label: 'Original & licensed',
    points: [
      'Only submit prompts you authored with rights secured for every output.',
      'Share the exact prompt (and negative prompt if used) for transparency.',
      'Upload final renders at 1400px+ with zero UI chrome or watermarks.',
    ],
  },
  {
    label: 'Quality & polish',
    points: [
      'Keep anatomy, typography, and lighting consistent—no obvious artifacts.',
      'Apply finishing passes so assets feel campaign-ready out of the box.',
      'Avoid real brands or likenesses you cannot legally represent.',
    ],
  },
  {
    label: 'Conversion setup',
    points: [
      'Pair each prompt with a two-line caption suggestion for social launch.',
      'Tag at least three keywords so sponsors can find your aesthetic fast.',
      'Link layered files when overlays or editable text need adjustments.',
    ],
  },
]

const journeySteps = [
  {
    id: '01',
    title: 'Prototype your prompt',
    description:
      'Build inside StrangePrompt templates or your preferred AI stack. Upload the render, prompt, and caption concept in minutes.',
  },
  {
    id: '02',
    title: 'Signal-ready review',
    description:
      'Our review layer scores originality, compliance, and conversion signals. Feedback lands with exact adjustments when needed.',
  },
  {
    id: '03',
    title: 'Launch and optimize',
    description:
      'Once approved, routes go live instantly. Track redirect clicks, premium copies, and gallery lifts from a single dashboard.',
  },
]

const faqItems = [
  {
    question: 'How do approvals work?',
    answer:
      'Every prompt is reviewed by StrangePrompt specialists. Approved assets activate immediately; flagged items return with specific edits to fast-track resubmission.',
  },
  {
    question: 'Which models can I use?',
    answer:
      'Use any generator—ChatGPT (Images), Midjourney, Stable Diffusion, Ideogram, custom fine-tunes—just include the exact prompt and usage confirmation.',
  },
  {
    question: 'When do payouts happen?',
    answer:
      'Payouts batch at the start of each month once you meet the minimum threshold. Redirects, premium copies, and feature bonuses accrue automatically.',
  },
  {
    question: 'Do I keep commercial rights?',
    answer:
      'Yes. You retain ownership and license StrangePrompt to distribute on your behalf. You can remove assets or adjust pricing whenever you like.',
  },
]

function EarnPage() {
  const [monthlyRedirects, setMonthlyRedirects] = useState(2500)
  const [premiumPrice, setPremiumPrice] = useState(12)
  const [galleryBoosts, setGalleryBoosts] = useState(3)

  const redirectRevenue = (monthlyRedirects / 1000) * 38.4
  const premiumPurchases = Math.round(monthlyRedirects / 28)
  const premiumRevenue = premiumPurchases * premiumPrice
  const galleryRevenue = galleryBoosts * 65
  const totalRevenue = Math.round(redirectRevenue + premiumRevenue + galleryRevenue)

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

  return (
    <div className="space-y-24 pb-28">
      <section className="relative overflow-hidden rounded-[44px] border border-[rgba(255,126,140,0.12)] bg-[rgba(14,6,20,0.92)] px-6 py-16 shadow-[0_70px_180px_-80px_rgba(229,9,20,0.75)] backdrop-blur-xl sm:px-12 lg:px-16" data-reveal>
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-[rgba(255,136,160,0.32)] via-[rgba(112,28,68,0.32)] to-transparent blur-[140px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-[-60px] h-96 w-96 rounded-full bg-gradient-to-tr from-[rgba(229,9,20,0.32)] via-[rgba(82,16,32,0.28)] to-transparent blur-[160px]" aria-hidden="true" />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-7 text-[rgba(255,236,240,0.9)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.16)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.85)]">
              Creator revenue studio
            </span>
            <h1 className="text-[34px] font-semibold leading-[1.2] text-white sm:text-[44px] lg:text-[58px] lg:leading-[1.14]">
              Design prompts. Launch briefs. Get paid for the momentum you create.
            </h1>
            <p className="max-w-2xl text-sm text-[rgba(255,218,228,0.78)] sm:text-base">
              StrangePrompt turns high-performing prompts into multi-channel campaigns. Submit your concept, pass the guided review, and unlock brand partners who pay for every redirect, copy, and feature placement.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/creator"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.9)] to-[rgba(121,5,13,0.82)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_40px_110px_-46px_rgba(229,9,20,0.78)] transition duration-300 hover:brightness-110"
              >
                Enter creator hub
              </Link>
              <a
                href="#journey"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,140,0.28)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(255,216,226,0.82)] transition duration-300 hover:border-[rgba(255,190,204,0.52)] hover:text-white"
              >
                See the journey
              </a>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-[rgba(255,126,140,0.2)] bg-[rgba(10,4,16,0.82)] p-5 text-left">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.32em] text-[rgba(255,190,204,0.78)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -top-8 right-12 h-24 w-24 rounded-full bg-[rgba(255,126,140,0.18)] blur-[70px]" aria-hidden="true" />
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-[32px] border border-[rgba(255,126,140,0.16)] bg-[rgba(8,3,14,0.88)] p-5 shadow-[0_40px_120px_-70px_rgba(229,9,20,0.78)]">
                <img
                  src="https://images.unsplash.com/photo-1521579776152-133d372b7830?auto=format&fit=crop&w=900&q=80"
                  alt="Creator building AI visuals"
                  className="h-48 w-full rounded-[26px] object-cover sm:h-56"
                />
                <div className="mt-4 space-y-2 text-sm text-[rgba(255,220,228,0.82)]">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">Prototype lab</p>
                  <p>Build variants, compare scores, and approve the strongest direction with one click.</p>
                </div>
              </article>
              <article className="rounded-[32px] border border-[rgba(255,126,140,0.16)] bg-[rgba(12,5,18,0.88)] p-5 shadow-[0_44px_130px_-72px_rgba(229,9,20,0.75)]">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
                  alt="Team reviewing submissions"
                  className="h-44 w-full rounded-[26px] object-cover sm:h-52"
                />
                <div className="mt-4 space-y-2 text-sm text-[rgba(255,220,228,0.86)]">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,190,204,0.78)]">Guided review</p>
                  <p>Policy-safe scanners + human editors remove guesswork so you pass faster.</p>
                </div>
              </article>
              <article className="sm:col-span-2 rounded-[32px] border border-[rgba(255,126,140,0.16)] bg-[rgba(6,2,12,0.88)] p-5 shadow-[0_48px_140px_-76px_rgba(229,9,20,0.78)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">Creator dashboards</p>
                    <p className="mt-2 text-sm text-[rgba(255,220,228,0.82)]">Live redirects, premium copy sales, and funnel heatmaps in one view.</p>
                  </div>
                  <Link
                    to="/creator"
                    className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,140,0.28)] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,216,226,0.85)] transition duration-300 hover:border-[rgba(255,190,204,0.52)] hover:text-white"
                  >
                    Preview hub
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="marquee-wrapper shadow-[0_44px_140px_-82px_rgba(229,9,20,0.75)]" data-reveal>
        <div className="marquee-track">
          {marqueeMessages.map((message) => (
            <span key={`marquee-primary-${message}`} className="marquee-item">
              {message}
            </span>
          ))}
          {marqueeMessages.map((message) => (
            <span key={`marquee-duplicate-${message}`} className="marquee-item" aria-hidden="true">
              {message}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-8" data-reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              Revenue streams
            </span>
            <h2 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl">Three ways to earn from every prompt.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Start with redirect sponsorships, layer in premium copies, and amplify with gallery features. Mix and match until your revenue stack fits your creative cadence.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,140,0.24)] px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(229,9,20,0.85)] transition duration-300 hover:border-[rgba(229,9,20,0.4)] hover:text-[rgba(229,9,20,0.95)]"
          >
            View payout tiers
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {revenueStreams.map((stream) => (
            <article
              key={stream.title}
              className="group h-full rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)]/85 p-8 text-[var(--text-muted)] shadow-[0_36px_110px_-60px_rgba(229,9,20,0.55)] transition duration-500 hover:border-[var(--accent)]/75 hover:bg-[var(--surface-card-strong)]/90 hover:text-[var(--text-base)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">{stream.metric}</p>
              <h3 className="mt-4 text-xl font-semibold text-[var(--text-base)]">{stream.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{stream.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[40px] border border-[rgba(255,126,140,0.18)] bg-[rgba(12,5,18,0.9)] px-6 py-12 shadow-[0_60px_170px_-90px_rgba(229,9,20,0.68)] sm:px-12" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-6 text-[rgba(255,220,228,0.85)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              Revenue planning lab
            </span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Model your earnings before you submit.</h2>
            <p className="max-w-2xl text-sm">
              Adjust redirect volume, premium pricing, and spotlight boosts to understand how your prompt can scale inside the StrangePrompt ecosystem.
            </p>
            <div className="grid gap-5 text-sm">
              {acceleratorHighlights.map((item) => (
                <article key={item.title} className="rounded-3xl border border-[rgba(255,126,140,0.22)] bg-[rgba(8,3,14,0.88)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">{item.stat}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-[rgba(255,214,224,0.82)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-[rgba(255,126,140,0.22)] bg-[rgba(6,3,12,0.92)] p-6 text-[rgba(255,220,228,0.85)] sm:p-8">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
                  <span>Monthly redirects</span>
                  <span>{monthlyRedirects.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={monthlyRedirects}
                  onChange={(event) => setMonthlyRedirects(Number(event.target.value))}
                  className="mt-3 w-full accent-[rgba(229,9,20,0.9)]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
                  <span>Premium copy price</span>
                  <span>{formatCurrency(premiumPrice)}</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="1"
                  value={premiumPrice}
                  onChange={(event) => setPremiumPrice(Number(event.target.value))}
                  className="mt-3 w-full accent-[rgba(229,9,20,0.9)]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
                  <span>Gallery spotlights / month</span>
                  <span>{galleryBoosts}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={galleryBoosts}
                  onChange={(event) => setGalleryBoosts(Number(event.target.value))}
                  className="mt-3 w-full accent-[rgba(229,9,20,0.9)]"
                />
              </div>
            </div>
            <div className="mt-6 space-y-4 rounded-3xl border border-[rgba(255,126,140,0.24)] bg-[rgba(4,2,10,0.9)] p-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[rgba(255,186,204,0.8)]">Redirect revenue</span>
                <span className="text-white">{formatCurrency(Math.round(redirectRevenue))}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[rgba(255,186,204,0.8)]">Premium copy revenue</span>
                <span className="text-white">{formatCurrency(premiumRevenue)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[rgba(255,186,204,0.8)]">Gallery boosts</span>
                <span className="text-white">{formatCurrency(galleryRevenue)}</span>
              </div>
              <div className="h-px bg-[rgba(255,126,140,0.2)]" aria-hidden="true" />
              <div className="flex items-baseline justify-between text-lg font-semibold text-white">
                <span>Total potential</span>
                <span>{formatCurrency(totalRevenue)}</span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,126,140,0.7)]">
                Forecast uses StrangePrompt median rates · adjust live for your funnel
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="rounded-[40px] border border-[var(--surface-border)] bg-[var(--surface-card)]/80 px-6 py-14 shadow-[0_60px_170px_-80px_rgba(229,9,20,0.68)] sm:px-12" data-reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              Guided journey
            </span>
            <h2 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl">From concept to sponsor-ready in three steps.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Follow the StrangePrompt workflow and you will know exactly what to polish, when payouts hit, and how to scale the next drop.
            </p>
          </div>
          <a
            href="mailto:hello@strangeprompt.com"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,140,0.24)] px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.85)] transition duration-300 hover:border-[rgba(255,190,204,0.5)] hover:text-white"
          >
            Book concierge call
          </a>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {journeySteps.map((step, index) => (
            <article
              key={step.id}
              className="relative h-full rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card-strong)]/75 p-7 text-[var(--text-muted)] transition duration-500 hover:border-[var(--accent)]/80 hover:text-[var(--text-base)]"
            >
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[rgba(229,9,20,0.08)] text-xs font-semibold uppercase tracking-[0.32em]">{step.id}</span>
                <span className="h-px flex-1 bg-[var(--surface-border)]" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[var(--text-base)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{step.description}</p>
              {index < journeySteps.length - 1 && <div className="absolute bottom-0 left-1/2 hidden h-6 w-px translate-x-[-50%] bg-[var(--surface-border)] lg:block" aria-hidden="true" />}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-center" data-reveal>
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
            Review playbook
          </span>
          <h2 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl">Pass review on the first upload.</h2>
          <p className="max-w-xl text-sm text-[var(--text-muted)]">
            The StrangePrompt compliance team curates for brand safety and conversion readiness. Align with the checklist and your prompt unlocks the premium feed without revisions.
          </p>
          <div className="grid gap-4 text-sm text-[rgba(255,220,228,0.85)]">
            <div className="rounded-3xl border border-[rgba(255,126,140,0.2)] bg-[rgba(10,4,16,0.85)] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.8)]">Avg. approval window</p>
              <p className="mt-2 text-lg font-semibold text-white">Under 24 hours on business days</p>
            </div>
            <div className="rounded-3xl border border-[rgba(255,126,140,0.2)] bg-[rgba(10,4,16,0.85)] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.8)]">Feedback guarantee</p>
              <p className="mt-2">If we request changes, you receive timestamped notes, reference examples, and priority re-review.</p>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {requirements.map((section) => (
            <article key={section.label} className="rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)]/80 p-6 shadow-[0_40px_120px_-70px_rgba(229,9,20,0.55)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-base)]">{section.label}</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[44px] border border-[var(--surface-border)] bg-[var(--surface-card)]/85 px-6 py-14 shadow-[0_64px_180px_-88px_rgba(229,9,20,0.62)] sm:px-12" data-reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              Sponsor readiness tiers
            </span>
            <h2 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl">Grow into bigger brand retainers.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Tier up as your prompts perform. StrangePrompt automatically unlocks new brands, audience boosts, and specialist support when you hit each milestone.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(229,9,20,0.28)] px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(229,9,20,0.85)] transition duration-300 hover:border-[rgba(229,9,20,0.45)] hover:text-[rgba(229,9,20,0.95)]"
          >
            Unlock next tier
          </Link>
        </div>
        <div className="mt-10 overflow-hidden rounded-[32px] border border-[var(--surface-border)]">
          <div className="grid overflow-x-auto bg-[var(--surface-card-strong)]/70 text-sm text-[var(--text-muted)] sm:grid-cols-3">
            {sponsorTiers.map((tier) => (
              <div key={tier.tier} className="border-b border-[var(--surface-border)] p-6 text-left sm:border-b-0 sm:border-r last:border-r-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">{tier.tier}</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--text-base)]">{tier.cpm}</p>
                <p className="mt-4 text-[var(--text-muted)]">{tier.requirements}</p>
                <div className="mt-4 rounded-2xl border border-[rgba(229,9,20,0.2)] bg-[rgba(229,9,20,0.08)] p-4 text-[var(--text-base)]">
                  {tier.perks}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[40px] border border-[rgba(255,126,140,0.18)] bg-[rgba(12,5,18,0.88)] px-6 py-14 text-[rgba(255,220,228,0.85)] shadow-[0_60px_160px_-78px_rgba(229,9,20,0.72)] sm:px-12 lg:px-16" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              What creators ask
            </span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Everything you need to know before launching.</h2>
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-[rgba(255,126,140,0.22)] bg-[rgba(6,3,12,0.88)] p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm text-[rgba(255,214,224,0.82)]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-[rgba(255,126,140,0.24)] bg-[rgba(8,3,14,0.88)] p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.8)]">Creator residency</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">Join the monthly spotlight cohort.</h3>
            <p className="mt-3 text-sm">
              Five prompts with the strongest performance index earn a StrangePrompt residency: paid promotion, social takeovers, and sponsor briefings tailored to your style.
            </p>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-3xl border border-[rgba(255,126,140,0.28)] bg-[rgba(6,3,12,0.9)] px-5 py-3">
                <span className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">What you get</span>
                <p className="mt-2">Newsletter feature (120k readers), TikTok carousel slot, and custom redirect boosts.</p>
              </div>
              <div className="rounded-3xl border border-[rgba(255,126,140,0.28)] bg-[rgba(6,3,12,0.9)] px-5 py-3">
                <span className="text-[11px] uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">How to qualify</span>
                <p className="mt-2">Maintain a 90% approval rate and generate 5k+ combined redirects/copies in 14 days.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[44px] border border-[rgba(255,126,140,0.18)] bg-[rgba(10,4,16,0.9)] px-6 py-14 text-[rgba(255,220,228,0.85)] shadow-[0_60px_170px_-86px_rgba(229,9,20,0.7)] sm:px-12 lg:px-16" data-reveal>
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
            Search intent toolkit
          </span>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Turn SEO searches into paid prompt downloads.</h2>
          <p className="max-w-3xl text-sm">
            People are searching daily for ways to earn money online by uploading images and prompts. Use these evergreen content plays to capture that demand, warm up sponsors, and point traffic straight to your StrangePrompt listings.
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {seoPlaybook.map((item) => (
              <article key={item.title} className="rounded-[32px] border border-[rgba(255,126,140,0.22)] bg-[rgba(6,3,12,0.9)] p-6">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgba(255,214,224,0.82)]">{item.description}</p>
                <div className="mt-4 rounded-2xl border border-[rgba(255,126,140,0.28)] bg-[rgba(229,9,20,0.08)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
                  {item.takeaway}
                </div>
              </article>
            ))}
          </div>
          <div className="rounded-[32px] border border-[rgba(255,126,140,0.24)] bg-[rgba(4,2,10,0.92)] p-6 text-sm">
            <p className="text-[rgba(255,186,204,0.78)]">SEO execution checklist</p>
            <ul className="mt-3 space-y-2 text-[rgba(255,214,224,0.82)]">
              <li>Layer "earn money online" keywords into your prompt titles and meta descriptions.</li>
              <li>Link back to StrangePrompt profile pages from every external case study or tutorial.</li>
              <li>Use schema markup (FAQ, HowTo) for walkthrough posts to win featured snippets.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[44px] border border-[rgba(255,126,140,0.18)] bg-[rgba(12,5,18,0.88)] px-6 py-14 text-[rgba(255,220,228,0.85)] shadow-[0_62px_176px_-88px_rgba(229,9,20,0.72)] sm:px-12 lg:px-16" data-reveal>
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
            Social flywheel
          </span>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Go viral with AI prompt drops.</h2>
          <p className="max-w-3xl text-sm">
            Turn every StrangePrompt submission into a social media storyline. Blend quick hooks, transparent prompts, and sponsor-ready links to convert virality into revenue.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {socialFlywheels.map((play) => (
              <article key={play.title} className="rounded-[32px] border border-[rgba(255,126,140,0.22)] bg-[rgba(6,3,12,0.9)] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">{play.format}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{play.title}</h3>
                <p className="mt-2 text-sm text-[rgba(255,214,224,0.82)]">{play.description}</p>
              </article>
            ))}
          </div>
          <div className="rounded-[32px] border border-[rgba(255,126,140,0.24)] bg-[rgba(4,2,10,0.92)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">Signals to bake into every post</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {viralSignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-[rgba(255,126,140,0.22)] bg-[rgba(229,9,20,0.08)] px-4 py-3 text-sm">
                  <p className="text-white">{signal.label}</p>
                  <p className="mt-1 text-[rgba(255,214,224,0.82)]">{signal.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-[rgba(255,126,140,0.7)]">
              Drop your StrangePrompt profile link in bio tools and pin the latest prompt pack for binge traffic.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[40px] border border-[var(--surface-border)] bg-[var(--surface-card)]/85 px-6 py-14 shadow-[0_62px_180px_-90px_rgba(229,9,20,0.62)] sm:px-12 lg:px-16" data-reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[rgba(255,186,204,0.78)]">
              Always-on support
            </span>
            <h2 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl">Build alongside the StrangePrompt team.</h2>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Stay in the loop with feedback, live workshops, and community testing sprints designed to keep your prompts conversion-ready.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {supportChannels.map((channel) => (
            <article key={channel.title} className="rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card-strong)]/80 p-6 text-[var(--text-muted)] transition duration-300 hover:border-[var(--accent)]/70 hover:text-[var(--text-base)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">{channel.action}</p>
              <h3 className="mt-4 text-xl font-semibold text-[var(--text-base)]">{channel.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{channel.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[44px] border border-[rgba(255,126,140,0.2)] bg-[rgba(10,4,16,0.92)] px-6 py-14 text-center text-[rgba(255,220,228,0.85)] shadow-[0_70px_180px_-82px_rgba(229,9,20,0.78)] sm:px-12" data-reveal>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to launch your earning stack?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm">
          Submit your prompt with the final render, caption, and redirect settings today. We will review within 24 hours and plug you into sponsors actively scouting for fresh ideas.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.9)] to-[rgba(121,5,13,0.82)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_38px_100px_-48px_rgba(229,9,20,0.78)] transition duration-300 hover:brightness-110"
          >
            Submit your prompt
          </Link>
          <a
            href="mailto:hello@strangeprompt.com"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,140,0.28)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(255,216,226,0.82)] transition duration-300 hover:border-[rgba(255,190,204,0.52)] hover:text-white"
          >
            Talk to our team
          </a>
        </div>
      </section>
    </div>
  )
}

export default EarnPage
