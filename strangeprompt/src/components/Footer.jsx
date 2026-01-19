import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Discover', to: '/' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Collections', to: '/collections' },
  { label: 'Community', to: '/community' },
  { label: 'Earn', to: '/earn' },
  { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
]

const resourceLinks = [
  { label: 'Creator handbook', to: '/community' },
  { label: 'Upload guidelines', to: '/collections' },
  { label: 'Earnings program', to: '/earn' },
  { label: 'Sponsor decks', to: '/dashboard', requiresAuth: true },
]

const legalLinks = [
  { label: 'Terms & Conditions', to: '/legal/terms' },
  { label: 'Privacy Policy', to: '/legal/privacy' },
  { label: 'Cookie Policy', to: '/legal/cookies' },
  { label: 'Earnings Disclaimer', to: '/legal/disclaimer' },
]

export default function Footer() {
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  const filteredNav = navLinks.filter((link) =>
    link.requiresAuth ? isAuthenticated : true,
  )
  const filteredResources = resourceLinks.filter((link) =>
    link.requiresAuth ? isAuthenticated : true,
  )

  useEffect(() => {
    if (!status) return
    const timeout = setTimeout(() => setStatus(null), 4000)
    return () => clearTimeout(timeout)
  }, [status])

  const handleSubscribe = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' })
      return
    }
    setStatus({ type: 'success', message: 'Thanks for subscribing! We will keep you posted.' })
    setEmail('')
  }

  return (
    <footer className="relative w-full border-t border-[var(--surface-border)] bg-[var(--surface-card-strong)]/90 text-[var(--text-muted)] backdrop-blur-xl transition-colors duration-500 dark:border-[rgba(255,126,140,0.18)] dark:bg-[rgba(9,6,18,0.82)] dark:text-[rgba(255,212,220,0.78)]">
      <div className="absolute inset-0 pointer-events-none border-t border-white/5 bg-gradient-to-b from-transparent via-white/[0.02] to-white/[0.06] dark:via-white/[0.04] dark:to-white/[0.1]" aria-hidden="true" />
      <div className="relative page-padding py-14">
        <div className="flex w-full flex-wrap items-start justify-between gap-12">
          <div className="max-w-sm space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-white"
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-sky-500 to-sky-400 text-xl font-bold text-slate-950 shadow-lg shadow-sky-500/40">
                SP
              </span>
              StrangePrompt
            </Link>
            <p className="text-sm leading-relaxed text-slate-300/80">
              Discover AI-crafted visuals, collaborate with the community, and push creative boundaries. StrangePrompt is your launchpad for imaginative storytelling.
            </p>
            <div className="space-y-3 text-xs uppercase tracking-wide text-[var(--text-muted)]/70">
              <span className="block text-[11px] font-semibold">Join us:</span>
              <div className="flex gap-3 text-[var(--text-base)]/90">
                <SocialIcon label="Follow on Twitter">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25M10.5 6L8.25 3.75 6 6m9.75 5.25V6M18 7.5l-2.25-2.25L13.5 7.5M3 13.5h3.75M9 18H3m3.75 0V9.75M21 10.5h-3.75M15 18h6m-3.75 0v-7.5"
                  />
                </SocialIcon>
                <SocialIcon label="Join Discord" isSolid>
                  <path d="M20.317 4.369a19.91 19.91 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.163-.398-.398-.874-.618-1.249a.077.077 0 00-.079-.037 19.736 19.736 0 00-4.886 1.515.07.07 0 00-.032.026C2.18 9.045 1.37 13.58 1.806 18.056c.001.013.01.026.02.033 2.052 1.507 4.035 2.422 5.993 3.03a.077.077 0 00.084-.027c.461-.63.873-1.295 1.226-1.993a.076.076 0 00-.041-.105c-.652-.247-1.274-.549-1.872-.892a.077.077 0 01-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.099.246.197.372.291a.077.077 0 01-.006.127 12.298 12.298 0 01-1.873.892.077.077 0 00-.04.106c.36.696.772 1.361 1.225 1.992a.076.076 0 00.084.028c1.96-.608 3.944-1.522 5.996-3.03a.08.08 0 00.021-.032c.5-5.177-.838-9.673-3.548-13.661a.061.061 0 00-.03-.028zM8.68 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.955 2.419-2.157 2.419zm6.64 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419z" />
                </SocialIcon>
                <SocialIcon label="Follow on Instagram">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487c1.948.001 3.526 1.584 3.527 3.533.001 1.949-1.577 3.533-3.525 3.534-1.95 0-3.533-1.584-3.533-3.533-.001-1.95 1.583-3.534 3.532-3.534zm0-1.487c-2.77 0-5.02 2.25-5.02 5.02 0 2.771 2.25 5.02 5.02 5.02 2.77 0 5.02-2.249 5.02-5.02 0-2.77-2.25-5.02-5.02-5.02zM7.138 10.53c-1.949.001-3.526 1.584-3.527 3.533-.001 1.95 1.577 3.533 3.525 3.534 1.95 0 3.533-1.584 3.533-3.533.001-1.95-1.583-3.534-3.532-3.534zm0-1.487c2.77 0 5.02 2.25 5.02 5.02 0 2.771-2.25 5.02-5.02 5.02-2.77 0-5.02-5.02-5.02-5.02 0-2.77 2.25-5.02 5.02-5.02zm9.724 7.54c-.29 0-.525.235-.525.525 0 .29.235.525.525.525.29 0 .525-.235.525-.525 0-.29-.235-.525-.525-.525z"
                  />
                </SocialIcon>
              </div>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <LinkGroup title="Navigation" links={filteredNav} />
            <LinkGroup title="Resources" links={filteredResources} />
            <LinkGroup title="Legal" links={legalLinks} />
          </div>
          <div className="w-full max-w-sm rounded-3xl border border-[var(--surface-border)]/70 bg-[var(--surface-card)]/80 p-6 text-[var(--text-muted)] shadow-[0_32px_64px_-48px_rgba(17,12,32,0.75)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]/80">
              Subscribe
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]/90">
              Get drops, creator spotlights, and product updates in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="mt-5 space-y-3">
              <label htmlFor="footer-subscribe" className="sr-only">
                Email address
              </label>
              <input
                id="footer-subscribe"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-full border border-[var(--surface-border)] bg-[var(--surface-card-strong)] px-4 py-2 text-sm text-[var(--text-base)] transition duration-300 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 dark:border-[rgba(255,126,140,0.3)] dark:bg-[rgba(8,5,18,0.9)] dark:text-[rgba(255,236,240,0.92)]"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[rgba(116,103,255,0.85)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white transition duration-300 hover:brightness-110"
              >
                Subscribe
              </button>
            </form>
            {status && (
              <p
                className={`mt-3 text-xs tracking-wide ${
                  status.type === 'error'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="relative w-full border-t border-[var(--surface-border)]/60 bg-[var(--surface-card)]/80">
        <div className="relative page-padding flex w-full flex-wrap items-center justify-between gap-6 py-6 text-xs text-[var(--text-muted)]">
          <p>&copy; {year} StrangePrompt. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="transition duration-300 hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function LinkGroup({ title, links }) {
  return (
    <div className="space-y-4 text-sm text-[var(--text-muted)]">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]/70">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="transition duration-300 hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ children, label, isSolid = false }) {
  return (
    <button className="rounded-full border border-[var(--surface-border)]/80 bg-[var(--surface-card)]/70 p-2 text-[var(--text-base)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]">
      <span className="sr-only">{label}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isSolid ? 'currentColor' : 'none'}
        stroke={isSolid ? 'none' : 'currentColor'}
        strokeWidth="1.5"
        className="h-5 w-5"
      >
        {children}
      </svg>
    </button>
  )
}
