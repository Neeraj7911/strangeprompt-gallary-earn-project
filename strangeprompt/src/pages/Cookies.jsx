import { Fragment } from 'react'

const sections = [
  {
    title: '1. What Are Cookies?',
    body: [
      'Cookies are small text files stored on your device to remember settings, authenticate sessions, and understand how you interact with StrangePrompt.',
      'We categorize cookies into essential, analytics, and marketing buckets to clarify how they influence your browsing experience.'
    ]
  },
  {
    title: '2. Essential Cookies',
    body: [
      'These cookies enable core functionality such as account login, anti-abuse protection, and prompt submissions. Blocking essential cookies may prevent the platform from working correctly.'
    ]
  },
  {
    title: '3. Analytics Cookies',
    body: [
      'Analytics cookies help us measure engagement, optimize gallery layouts, and experiment with new features. Data is aggregated and does not identify individual creators.'
    ]
  },
  {
    title: '4. Marketing Cookies',
    body: [
      'Marketing cookies support sponsor redirects and partner integrations. They are optional and only activated when you opt in through our preferences center.'
    ]
  },
  {
    title: '5. Managing Preferences',
    body: [
      'You can review or update cookie preferences anytime within Settings → Privacy. Browser-level controls are also available if you prefer global management.',
      'When disabling cookies, previously stored data may persist until manually cleared from your browser.'
    ]
  },
  {
    title: '6. Policy Updates',
    body: [
      'We may adjust this Cookie Policy to reflect new features or compliance requirements. Changes will be posted here with a revised date.'
    ]
  }
]

function CookiesPage() {
  return (
    <section className="space-y-12 pb-16 pt-12">
      <header className="space-y-4" data-reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-26px_rgba(229,9,20,0.3)]">
          Cookies & controls
        </span>
        <div className="space-y-3 text-[var(--text-muted)] lg:flex lg:items-end lg:justify-between lg:space-x-6 lg:space-y-0">
          <h1 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl lg:text-5xl">Cookie Policy</h1>
          <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
            Understand how StrangePrompt uses cookies to power secure sessions, capture insights, and respect your advertising preferences.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]/80">
          Last updated: January 2026
        </p>
      </header>

      <div className="veil-border space-y-10 p-8 sm:p-10">
        {sections.map((section) => (
          <Fragment key={section.title}>
            <h2 className="text-xl font-semibold text-[var(--text-base)] sm:text-2xl">{section.title}</h2>
            <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="h-px w-full bg-[var(--surface-border)]/50 last:hidden" aria-hidden="true" />
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export default CookiesPage
