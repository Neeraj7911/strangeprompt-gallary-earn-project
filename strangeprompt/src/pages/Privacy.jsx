import { Fragment } from 'react'

const sections = [
  {
    title: '1. Data We Collect',
    body: [
      'We collect account details (name, email), usage patterns, and analytics relating to gallery interactions. Additional context such as IP address and device characteristics may be captured for security and performance tuning.',
      'If you connect third-party accounts or sponsors, we will store the credentials and metadata required to manage those integrations securely.'
    ]
  },
  {
    title: '2. How We Use Data',
    body: [
      'Account data personalizes your experience, enables authentication, and powers feed recommendations. Engagement metrics help us surface trending prompts and reward high-performing creators.',
      'We do not sell personal data. Aggregated insights may be shared with sponsors or partners without identifying individual creators unless you provide explicit consent.'
    ]
  },
  {
    title: '3. Cookies & Tracking',
    body: [
      'StrangePrompt uses functional cookies to maintain sessions and remember preferences, plus analytics cookies to understand feature adoption. Optional marketing cookies may be used for sponsor redirects.',
      'You can adjust cookie preferences through your browser or our in-app controls. Disabling essential cookies may impact core functionality.'
    ]
  },
  {
    title: '4. Data Retention',
    body: [
      'Account data is retained while your profile remains active. When you delete your account, we remove or anonymize personal data within 30 days, except where retention is required by law.',
      'Backups and cached data may persist for limited periods but are purged on a rolling schedule.'
    ]
  },
  {
    title: '5. Security',
    body: [
      'We apply industry best practices, including encryption at rest and in transit, role-based access controls, and continuous monitoring to protect StrangePrompt infrastructure.',
      'Despite safeguards, no system is perfectly secure. Report suspected vulnerabilities to security@strangeprompt.com and we will investigate promptly.'
    ]
  },
  {
    title: '6. Your Rights',
    body: [
      'Depending on your jurisdiction, you may request access, correction, deletion, or export of your personal data. Contact privacy@strangeprompt.com to exercise these rights.',
      'We will verify your identity before processing requests. Response times vary by request type but typically occur within 14 days.'
    ]
  },
  {
    title: '7. Changes to this Policy',
    body: [
      'We may update this Privacy Policy to reflect product enhancements or legal requirements. Material updates will be announced through in-app notices or email.',
      'Your continued use of StrangePrompt after updates take effect indicates acceptance of the revised policy.'
    ]
  }
]

function PrivacyPage() {
  return (
    <section className="space-y-12 pb-16 pt-12">
      <header className="space-y-4" data-reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-26px_rgba(229,9,20,0.3)]">
          Privacy first
        </span>
        <div className="space-y-3 text-[var(--text-muted)] lg:flex lg:items-end lg:justify-between lg:space-x-6 lg:space-y-0">
          <h1 className="text-3xl font-semibold text-[var(--text-base)] sm:text-4xl lg:text-5xl">Privacy Policy</h1>
          <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
            Learn how StrangePrompt protects creator data, manages analytics safely, and empowers you with control over your information.
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

export default PrivacyPage
