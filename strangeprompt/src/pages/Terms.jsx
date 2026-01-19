import { Fragment } from 'react'

const sections = [
  {
    title: '1. Agreement Overview',
    body: [
      'These Terms & Conditions (\"Terms\") govern your access to and use of the StrangePrompt platform, including any content, functionality, and services offered. By accessing or using the platform you agree to be bound by these Terms.',
      'If you are using the platform on behalf of an organization, you represent that you have authority to bind that organization and that it agrees to these Terms.'
    ]
  },
  {
    title: '2. Account Responsibilities',
    body: [
      'You are responsible for maintaining the confidentiality of your credentials and for any activity that occurs under your account. Notify us immediately of any unauthorized use of your account.',
      'We reserve the right to suspend or terminate accounts that violate these Terms or that pose security risks to the community.'
    ]
  },
  {
    title: '3. Content Ownership',
    body: [
      'You retain ownership of the prompts, renders, and other creative assets you upload to StrangePrompt. By publishing content, you grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute it solely for operating and promoting the service.',
      'You confirm that you have all necessary rights to share the content you submit and that it does not infringe on any intellectual property or privacy rights.'
    ]
  },
  {
    title: '4. Acceptable Use',
    body: [
      'Do not upload or share content that is unlawful, abusive, hateful, violent, or otherwise harmful. We may remove content or suspend accounts that violate community standards.',
      'Automated scraping, rate-limiting circumvention, or attempting to compromise StrangePrompt infrastructure is strictly prohibited.'
    ]
  },
  {
    title: '5. Payment & Sponsorships',
    body: [
      'Certain features, including sponsor redirects and premium analytics, may require additional agreements. When applicable, payment terms and revenue shares will be disclosed within the campaign workflow.',
      'Creator payouts are calculated solely on net advertising, sponsorship, and referral revenue StrangePrompt actually receives and attributes to your prompts or resulting user growth. If StrangePrompt does not earn attributable revenue, no payout obligation arises.',
      'Payouts are issued only after StrangePrompt collects funds from third-party advertisers, partners, or platforms. Banking delays, chargebacks, or partner nonpayment may extend disbursement timelines, and StrangePrompt is not liable for such delays.',
      'We may update pricing or fees with reasonable notice. Continued use after changes become effective constitutes acceptance of the new terms.'
    ]
  },
  {
    title: '6. Termination',
    body: [
      'You may discontinue using StrangePrompt at any time. We may suspend or terminate access if you breach these Terms or if required for legal compliance.',
      'Upon termination, your right to use the service ends, but certain provisions such as intellectual property licenses and disclaimers will survive.'
    ]
  },
  {
    title: '7. Updates to These Terms',
    body: [
      'We may revise these Terms periodically. The updated policy will be posted with a revised \"Last updated\" date. Continued use after changes signals your acceptance.',
      'If changes materially impact your rights, we will provide additional notice through email or an in-app announcement when feasible.'
    ]
  },
  {
    title: '8. Contact',
    body: [
      'For questions about these Terms, reach out to legal@strangeprompt.com. We aim to respond within two business days.'
    ]
  },
  {
    title: '9. Earnings Disclaimer',
    body: [
      'StrangePrompt does not guarantee any specific income levels, sponsor deals, or audience outcomes. Your earnings depend on advertiser demand, campaign performance, compliance status, and other factors beyond StrangePrompt’s control.',
      'Any projections, dashboards, or examples provided through the platform are illustrative only and should not be interpreted as promises of payment. You should not rely on StrangePrompt revenue to cover essential expenses.',
      'By using revenue features, you acknowledge that StrangePrompt may, at its discretion, delay, adjust, or withhold payouts if fraudulent activity, policy violations, or uncollected partner revenue is detected.'
    ]
  }
]

function TermsPage() {
  return (
    <section className="space-y-12 pb-16 pt-12">
      <header className="space-y-4" data-reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-26px_rgba(229,9,20,0.3)]">
          Legal hub
        </span>
        <div className="space-y-3 text-[var(--text-muted)] lg:flex lg:items-end lg:justify-between lg:space-x-6 lg:space-y-0">
          <h1 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl lg:text-5xl">Terms & Conditions</h1>
          <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
            Read how StrangePrompt empowers creators while protecting community safety, intellectual property, and sponsor integrity across the platform.
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

export default TermsPage
