import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ── Design tokens ──────────────────────────────────────────
const APPLE_DARK    = '#1d1d1f'
const APPLE_MID     = '#6e6e73'
const APPLE_LIGHT   = '#f5f5f7'
const APPLE_BLUE    = '#0071e3'
const APPLE_BORDER  = 'rgba(0,0,0,0.08)'

// ── How it works data ──────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Enter your card',
    body: 'Tell us which rewards card you carry and how many points or miles you\'ve accumulated.',
  },
  {
    n: '02',
    title: 'Pick your route',
    body: 'Search any origin and destination. Domestic weekend getaway or transatlantic upgrade — we handle both.',
  },
  {
    n: '03',
    title: 'Get your redemption',
    body: 'We surface the highest-value transfer partner for your card and route. Every time.',
  },
]

const STATS = [
  { value: '20+',   label: 'Transfer partners' },
  { value: '8.8¢',  label: 'Peak value per point' },
  { value: '< 2 min', label: 'Time to an answer' },
]

// ── Shared section wrapper ────────────────────────────────
function Section({ children, style, className = '', id }) {
  return (
    <section
      id={id}
      className={className}
      style={{ width: '100%', ...style }}
    >
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 24px' }}>
        {children}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  return (
    <div style={{ background: '#ffffff', color: APPLE_DARK, minHeight: '100vh' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '52px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${APPLE_BORDER}`,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '980px', margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '17px', fontWeight: '600',
            letterSpacing: '-0.3px', color: APPLE_DARK,
            userSelect: 'none',
          }}>
            PointPilot
          </span>

          {!(user && isPro) && (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', color: APPLE_BLUE,
                fontWeight: '400', letterSpacing: '-0.1px',
                padding: '4px 0',
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <Section style={{ paddingTop: '120px', paddingBottom: '100px', textAlign: 'center' }}>
        <div>
          {/* Eyebrow */}
          <p style={{
            fontSize: '17px', fontWeight: '400',
            color: APPLE_BLUE, marginBottom: '16px',
            letterSpacing: '-0.2px',
          }}>
            Award travel, demystified.
          </p>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: '700',
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
            color: APPLE_DARK,
            marginBottom: '28px',
          }}>
            Your points.<br />Maximum value.
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 'clamp(17px, 2vw, 21px)',
            fontWeight: '400',
            color: APPLE_MID,
            lineHeight: '1.6',
            maxWidth: '540px',
            margin: '0 auto 44px',
            letterSpacing: '-0.2px',
          }}>
            Enter your rewards card and point balance.
            We'll find the smartest redemption — from budget economy to lie-flat business class.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/search')}
              style={{
                background: APPLE_BLUE,
                color: '#fff',
                border: 'none',
                borderRadius: '980px',
                padding: '14px 28px',
                fontSize: '17px',
                fontWeight: '400',
                letterSpacing: '-0.2px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Get started
            </button>
            <button
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                background: 'none',
                color: APPLE_BLUE,
                border: 'none',
                borderRadius: '980px',
                padding: '14px 4px',
                fontSize: '17px',
                fontWeight: '400',
                letterSpacing: '-0.2px',
                cursor: 'pointer',
              }}
            >
              Learn more ↓
            </button>
          </div>
        </div>
      </Section>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${APPLE_BORDER}`, borderBottom: `1px solid ${APPLE_BORDER}`, background: APPLE_LIGHT }}>
        <div style={{
          maxWidth: '980px', margin: '0 auto', padding: '0 24px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '36px 24px',
                textAlign: 'center',
                borderRight: i < STATS.length - 1 ? `1px solid ${APPLE_BORDER}` : 'none',
              }}
            >
              <div style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '700',
                letterSpacing: '-0.03em',
                color: APPLE_DARK,
                lineHeight: '1',
                marginBottom: '8px',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: APPLE_MID,
                letterSpacing: '-0.1px',
                fontWeight: '400',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <Section
        id="how-it-works"
        style={{ paddingTop: '100px', paddingBottom: '100px' }}
      >
        {/* Section label */}
        <p style={{
          fontSize: '13px', fontWeight: '600',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: APPLE_MID, marginBottom: '16px',
        }}>
          How it works
        </p>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: '700',
          letterSpacing: '-0.03em',
          lineHeight: '1.07',
          color: APPLE_DARK,
          marginBottom: '64px',
          maxWidth: '560px',
        }}>
          From card to cabin
          in three steps.
        </h2>

        {/* Steps grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1px',
          background: APPLE_BORDER,
          borderRadius: '18px',
          overflow: 'hidden',
          border: `1px solid ${APPLE_BORDER}`,
        }}>
          {STEPS.map(({ n, title, body }) => (
            <div
              key={n}
              style={{
                background: '#fff',
                padding: '40px 36px',
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: APPLE_BLUE,
                letterSpacing: '-0.1px',
                marginBottom: '20px',
              }}>
                {n}
              </div>
              <h3 style={{
                fontSize: '21px',
                fontWeight: '600',
                letterSpacing: '-0.4px',
                color: APPLE_DARK,
                marginBottom: '12px',
                lineHeight: '1.2',
              }}>
                {title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: APPLE_MID,
                lineHeight: '1.6',
                letterSpacing: '-0.1px',
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Supported cards ──────────────────────────────── */}
      <div style={{ background: APPLE_LIGHT, borderTop: `1px solid ${APPLE_BORDER}` }}>
        <Section style={{ paddingTop: '56px', paddingBottom: '56px' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: '24px',
          }}>
            <p style={{
              fontSize: '17px', fontWeight: '400',
              color: APPLE_MID, letterSpacing: '-0.2px',
              maxWidth: '600px', lineHeight: '1.55',
            }}>
              Works with{' '}
              {['Chase', 'Amex', 'Citi', 'Capital One', 'Bilt', 'United', 'Delta', 'American'].map((name, i, arr) => (
                <span key={name}>
                  <span style={{ color: APPLE_DARK, fontWeight: '500' }}>{name}</span>
                  {i < arr.length - 1 ? ', ' : '.'}
                </span>
              ))}
            </p>
            <button
              onClick={() => navigate('/search')}
              style={{
                background: 'none', border: 'none',
                color: APPLE_BLUE, fontSize: '17px',
                fontWeight: '400', cursor: 'pointer',
                letterSpacing: '-0.2px', whiteSpace: 'nowrap',
                padding: '0',
              }}
            >
              Find my redemption →
            </button>
          </div>
        </Section>
      </div>

      {/* ── Final CTA ────────────────────────────────────── */}
      <Section style={{ paddingTop: '120px', paddingBottom: '140px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: '700',
          letterSpacing: '-0.03em',
          lineHeight: '1.05',
          color: APPLE_DARK,
          marginBottom: '20px',
        }}>
          Your next trip
          <br />
          is already paid for.
        </h2>
        <p style={{
          fontSize: '19px',
          color: APPLE_MID,
          marginBottom: '44px',
          letterSpacing: '-0.2px',
        }}>
          Find out how many points it takes.
        </p>
        <button
          onClick={() => navigate('/search')}
          style={{
            background: APPLE_BLUE,
            color: '#fff',
            border: 'none',
            borderRadius: '980px',
            padding: '16px 36px',
            fontSize: '19px',
            fontWeight: '400',
            letterSpacing: '-0.2px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Get started
        </button>
      </Section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${APPLE_BORDER}`,
        background: APPLE_LIGHT,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: APPLE_MID, letterSpacing: '-0.1px' }}>
          Copyright © 2026 PointPilot. Results are estimates. Always verify award availability before transferring points.
        </p>
      </footer>

    </div>
  )
}
