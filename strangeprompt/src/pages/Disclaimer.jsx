import { Fragment } from 'react'

const sections = [
  {
    title: '1. Informational purposes only',
    body: [
      'StrangePrompt shares product guidance, campaign playbooks, and estimated revenue insights to help creators plan their launch. These materials are educational. They do not constitute legal, financial, or business advice and should not be relied on as such.',
      'You are responsible for evaluating whether StrangePrompt offerings, sponsor relationships, or community guidance meet your personal and professional objectives.'
    ]
  },
  {
    title: '2. Earnings based on StrangePrompt revenue',
    body: [
      'Creator earnings are funded solely by advertising, sponsorship, licensing, or referral revenue StrangePrompt actually earns from your prompts or the net-new users they attract. If StrangePrompt does not generate attributable revenue or growth from your activity, no payment obligation exists.',
      'Dashboards, calculators, or historical averages are illustrative and should not be interpreted as guaranteed payouts.'
    ]
  },
  {
    title: '3. Payment timing & delays',
    body: [
      'Payouts are only released after StrangePrompt collects the corresponding revenue from third-party advertisers, partners, or platforms. External settlement timelines, banking holds, chargebacks, or compliance reviews may delay disbursement.',
      'StrangePrompt is not liable for payment delays caused by third parties, payment processors, sponsor nonpayment, or inaccurate payout details supplied by the creator.'
    ]
  },
  {
    title: '4. No guaranteed results',
    body: [
      'Participation in StrangePrompt campaigns does not guarantee viral distribution, sponsor bookings, or sustained earnings. Performance depends on audience demand, compliance status, competitive inventory, and other factors outside StrangePrompt control.',
      'You should not view StrangePrompt payouts as assured income or rely on them for essential living expenses.'
    ]
  },
  {
    title: '5. Creator responsibilities',
    body: [
      'You must maintain accurate tax information, payout details, and compliance with local regulations governing digital earnings. StrangePrompt may suspend or withhold payments if fraud, policy violations, or disputes arise.',
      'Creators are responsible for evaluating their obligations related to taxes, licensing, and intellectual property when monetizing prompts or image assets.'
    ]
  },
  {
    title: '6. Changes & questions',
    body: [
      'StrangePrompt may update this disclaimer when products or policies evolve. Updates will be posted with a revised “Last updated” date.',
      'For clarifications about earnings, payouts, or legal obligations, contact legal@strangeprompt.com.'
    ]
  }
]

function DisclaimerPage() {
  return (
    <section className="space-y-12 pb-16 pt-12">
      <header className="space-y-4" data-reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-26px_rgba(229,9,20,0.3)]">
          Legal notice
        </span>
        <div className="space-y-3 text-[var(--text-muted)] lg:flex lg:items-end lg:justify-between lg:space-x-6 lg:space-y-0">
          <h1 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl lg:text-5xl">Earnings Disclaimer</h1>
          <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
            Understand how StrangePrompt calculates creator payouts, why earnings depend on platform revenue, and what to expect regarding settlement timelines.
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

export default DisclaimerPage
