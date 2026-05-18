import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Design tokens ──────────────────────────────────────────
const BG        = '#0a0f1e'           // deep navy base
const SURFACE   = '#0f1629'           // slightly lifted
const ELEVATED  = '#141d35'           // cards / inputs
const TEXT      = '#f1f5f9'           // near-white
const MUTED     = '#94a3b8'           // slate-400
const SUBTLE    = '#475569'           // slate-600 — tertiary
const ACCENT    = '#6366f1'           // indigo-500
const ACCENT_LT = '#818cf8'           // indigo-400 — hover / lighter
const BORDER    = 'rgba(255,255,255,0.07)'
const GLOW      = 'rgba(99,102,241,0.35)'

// ── Reusable section layout ────────────────────────────────
function Section({ children, style, id }) {
  return (
    <section id={id} style={{ width: '100%', ...style }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
        {children}
      </div>
    </section>
  )
}

// ── Tiny eyebrow chip ──────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '12px', fontWeight: '500',
      color: ACCENT_LT,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      border: `1px solid rgba(129,140,248,0.25)`,
      borderRadius: '999px',
      padding: '4px 12px',
      marginBottom: '24px',
      background: 'rgba(99,102,241,0.08)',
    }}>
      {children}
    </span>
  )
}

// ── CTA button ─────────────────────────────────────────────
function PrimaryBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ACCENT,
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        padding: '13px 28px',
        fontSize: '15px',
        fontWeight: '500',
        letterSpacing: '-0.2px',
        cursor: 'pointer',
        boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px ${GLOW}`,
        transition: 'background 0.15s, box-shadow 0.15s, transform 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#4f46e5'
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(99,102,241,0.5), 0 6px 32px rgba(99,102,241,0.5)`
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ACCENT
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px ${GLOW}`
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        color: MUTED,
        border: `1px solid ${BORDER}`,
        borderRadius: '999px',
        padding: '13px 24px',
        fontSize: '15px',
        fontWeight: '400',
        letterSpacing: '-0.2px',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = TEXT
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = MUTED
        e.currentTarget.style.borderColor = BORDER
      }}
    >
      {children}
    </button>
  )
}

// ── Data ───────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Enter your card',
    body: 'Select your rewards card and enter your current point or mile balance.',
  },
  {
    n: '02',
    title: 'Choose your route',
    body: 'Any origin, any destination — domestic hop or transatlantic upgrade.',
  },
  {
    n: '03',
    title: 'See your redemption',
    body: 'We surface the highest-value transfer partner for your exact card and route.',
  },
]

const STATS = [
  { value: '20+',     label: 'Transfer partners' },
  { value: '8.8¢',    label: 'Peak value/point' },
  { value: '< 2 min', label: 'Time to answer' },
]

const CARDS = ['Chase', 'Amex', 'Citi', 'Capital One', 'Bilt', 'United', 'Delta', 'American']

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '52px',
        background: `rgba(10,15,30,0.75)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '16px', fontWeight: '600',
            letterSpacing: '-0.3px', color: TEXT,
            userSelect: 'none',
          }}>
            PointPilot
          </span>

          {!(user && isPro) && (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', color: ACCENT_LT,
                fontWeight: '400', padding: '4px 0',
                letterSpacing: '-0.1px',
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      {/* Subtle radial glow behind headline */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 70%)',
        }} />

        <Section style={{ paddingTop: '60px', paddingBottom: '56px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Eyebrow>✦ Award travel, simplified</Eyebrow>

            {/* Gradient headline */}
            <h1 style={{
              fontSize: 'clamp(40px, 7vw, 80px)',
              fontWeight: '700',
              letterSpacing: '-0.04em',
              lineHeight: '1.04',
              marginBottom: '20px',
              background: `linear-gradient(180deg, ${TEXT} 30%, ${MUTED} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Your points.<br />Maximum value.
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              fontWeight: '400',
              color: MUTED,
              lineHeight: '1.6',
              maxWidth: '480px',
              marginBottom: '28px',
              letterSpacing: '-0.2px',
            }}>
              Enter your rewards card and balance.
              We find the smartest redemption — from budget economy to lie-flat business class.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <PrimaryBtn onClick={() => navigate('/search')}>
                Get started →
              </PrimaryBtn>
              <GhostBtn onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                How it works
              </GhostBtn>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          }}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  borderRight: i < 2 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <div style={{
                  fontSize: 'clamp(22px, 3.5vw, 32px)',
                  fontWeight: '700',
                  letterSpacing: '-0.04em',
                  lineHeight: '1',
                  marginBottom: '6px',
                  color: ACCENT_LT,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '13px', color: SUBTLE, letterSpacing: '-0.1px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <Section id="how-it-works" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <p style={{
          fontSize: '11px', fontWeight: '600',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: SUBTLE, marginBottom: '10px',
        }}>
          How it works
        </p>

        <h2 style={{
          fontSize: 'clamp(24px, 3.5vw, 38px)',
          fontWeight: '700',
          letterSpacing: '-0.035em',
          lineHeight: '1.08',
          color: TEXT,
          marginBottom: '28px',
          maxWidth: '480px',
        }}>
          From card to cabin
          in three steps.
        </h2>

        {/* Steps — hairline bordered grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {STEPS.map(({ n, title, body }, i) => (
            <div
              key={n}
              style={{
                padding: '24px 22px',
                borderRight: i < STEPS.length - 1 ? `1px solid ${BORDER}` : 'none',
                background: ELEVATED,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a2540'}
              onMouseLeave={e => e.currentTarget.style.background = ELEVATED}
            >
              <div style={{
                fontSize: '11px', fontWeight: '600',
                color: ACCENT, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                {n}
              </div>
              <h3 style={{
                fontSize: '17px',
                fontWeight: '600',
                letterSpacing: '-0.3px',
                color: TEXT,
                marginBottom: '10px',
                lineHeight: '1.25',
              }}>
                {title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: MUTED,
                lineHeight: '1.6',
                letterSpacing: '-0.1px',
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Supported cards band ─────────────────────────── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              color: SUBTLE,
              letterSpacing: '-0.1px',
              lineHeight: '1.6',
              maxWidth: '560px',
            }}>
              Works with{' '}
              {CARDS.map((name, i, arr) => (
                <span key={name}>
                  <span style={{ color: MUTED }}>{name}</span>
                  {i < arr.length - 1 ? ', ' : '.'}
                </span>
              ))}
            </p>
            <button
              onClick={() => navigate('/search')}
              style={{
                background: 'none', border: 'none',
                color: ACCENT_LT, fontSize: '14px',
                fontWeight: '400', cursor: 'pointer',
                letterSpacing: '-0.1px', whiteSpace: 'nowrap', padding: 0,
              }}
            >
              Find my redemption →
            </button>
          </div>
        </div>
      </div>

      {/* ── Final CTA ────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Bottom glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />

        <Section style={{ paddingTop: '56px', paddingBottom: '64px', textAlign: 'center', position: 'relative' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 52px)',
            fontWeight: '700',
            letterSpacing: '-0.04em',
            lineHeight: '1.06',
            marginBottom: '16px',
            background: `linear-gradient(180deg, ${TEXT} 30%, ${MUTED} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Your next trip
            <br />is already paid for.
          </h2>

          <p style={{
            fontSize: '16px',
            color: SUBTLE,
            marginBottom: '28px',
            letterSpacing: '-0.2px',
          }}>
            Find out how many points it takes.
          </p>

          <PrimaryBtn onClick={() => navigate('/search')}>
            Get started →
          </PrimaryBtn>
        </Section>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: SUBTLE, letterSpacing: '-0.1px' }}>
          Copyright © 2026 PointPilot. Results are estimates. Always verify award availability before transferring points.
        </p>
      </footer>

    </div>
  )
}
