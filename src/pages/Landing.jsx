import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Design tokens ────────────────────────────────────────────
const LINE     = 'rgba(255,255,255,0.08)'
const LINE_STR = 'rgba(255,255,255,0.14)'
const V400     = '#818cf8'
const V300     = '#a5b4fc'
const FG       = '#f4f4fb'
const FG_SOFT  = 'rgba(244,244,251,0.72)'
const FG_MUTE  = 'rgba(244,244,251,0.46)'
const GOLD     = '#d4b888'

// ── Typography helpers ───────────────────────────────────────
const SERIF = {
  fontFamily: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
  fontWeight: 400,
}
const MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  letterSpacing: 0,
}

// ── Shared style objects ─────────────────────────────────────
const CARD = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))',
  border: `1px solid ${LINE}`,
  borderRadius: 18,
}

const HR = {
  height: 1,
  background: `linear-gradient(90deg, transparent, ${LINE_STR} 40%, ${LINE_STR} 60%, transparent)`,
  border: 0,
  margin: 0,
}

// ── Page background — "glow" variant ────────────────────────
const PAGE_BG = {
  background: `
    radial-gradient(900px 600px at 80% -10%, rgba(99,102,241,0.22), transparent 60%),
    radial-gradient(700px 500px at 10% 110%, rgba(99,102,241,0.14), transparent 65%),
    #0a0f1e
  `,
  color: FG,
  fontFamily: "'Inter', system-ui, sans-serif",
  letterSpacing: '-0.01em',
  minHeight: '100vh',
}

// ── Data ─────────────────────────────────────────────────────
const HEADLINE = {
  before: 'Your 80,000 points.',
  accent: '$7,400',
  after: ' in lie-flat.',
}

const REDEMPTIONS = [
  {
    route: 'JFK → HND', airline: 'ANA', cls: 'First · The Suite',
    points: '80,000', program: 'Virgin Atlantic Flying Club',
    retail: '$22,400', cpp: '28.0¢', tag: 'Sweet spot',
    bg: `
      radial-gradient(ellipse at 30% 40%, rgba(212,184,136,0.35), transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.4), transparent 60%),
      linear-gradient(135deg, #1a1530, #0a0f1e)
    `,
  },
  {
    route: 'ORD → ZRH', airline: 'Swiss', cls: 'Business · Throne',
    points: '63,000', program: 'Air Canada Aeroplan',
    retail: '$7,200', cpp: '11.4¢', tag: 'Best value',
    bg: `
      radial-gradient(ellipse at 70% 30%, rgba(123,227,200,0.25), transparent 60%),
      radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.35), transparent 65%),
      linear-gradient(140deg, #0f1530, #06070d)
    `,
  },
  {
    route: 'LAX → SYD', airline: 'Qantas', cls: 'Business · Skybed',
    points: '108,000', program: 'American AAdvantage',
    retail: '$9,800', cpp: '9.1¢', tag: 'Hot route',
    bg: `
      radial-gradient(ellipse at 50% 30%, rgba(212,184,136,0.45), transparent 60%),
      radial-gradient(ellipse at 50% 90%, rgba(60,30,80,0.6), transparent 70%),
      linear-gradient(180deg, #1c1438, #060914)
    `,
  },
]

const PROGRAMS = [
  { name: 'Chase',       sub: 'Ultimate Rewards',   value: '2.05¢', tone: 'violet' },
  { name: 'Amex',        sub: 'Membership Rewards',  value: '2.20¢', tone: 'gold'   },
  { name: 'Capital One', sub: 'Venture Miles',       value: '1.85¢', tone: 'violet' },
  { name: 'Citi',        sub: 'ThankYou Points',     value: '1.95¢', tone: 'violet' },
  { name: 'Bilt',        sub: 'Rewards',             value: '2.05¢', tone: 'violet' },
  { name: 'United',      sub: 'MileagePlus',         value: '1.35¢', tone: 'muted'  },
  { name: 'Delta',       sub: 'SkyMiles',            value: '1.20¢', tone: 'muted'  },
  { name: 'American',    sub: 'AAdvantage',          value: '1.65¢', tone: 'muted'  },
]

const PARTNER_PILLS = [
  '+ Marriott Bonvoy', '· Hilton Honors', '· Hyatt', '· ANA Mileage Club',
  '· Aeroplan', '· Virgin Atlantic', '· Avianca LifeMiles', '· Alaska',
  '· Iberia Plus', '· Turkish Miles&Smiles',
]

// ── Reusable primitives ──────────────────────────────────────

function PpMark({ onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontWeight: 600, letterSpacing: '-0.01em', fontSize: 18,
        cursor: 'pointer', userSelect: 'none', color: FG,
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: 'linear-gradient(135deg, #7c7fff, #5558e6)',
        position: 'relative',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px -4px rgba(99,102,241,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          position: 'absolute', inset: 6, borderRadius: 2,
          background: 'rgba(255,255,255,0.95)',
          clipPath: 'polygon(50% 0%, 100% 100%, 50% 75%, 0% 100%)',
        }} />
      </span>
      PointPilot
    </span>
  )
}

function BtnPrimary({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 24px', borderRadius: 999, fontSize: 15, fontWeight: 500,
        cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', fontFamily: 'inherit',
        background: 'linear-gradient(180deg, #7c7fff, #5558e6)', color: '#fff',
        boxShadow: '0 8px 28px -4px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 14px 34px -4px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
      }}
    >
      {children}
    </button>
  )
}

function BtnGhost({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 24px', borderRadius: 999, fontSize: 15, fontWeight: 500,
        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
        background: 'transparent', color: FG,
        border: `1px solid ${LINE_STR}`,
        transition: 'border-color 0.2s, background 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = LINE_STR
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

// ── Mini calculator widget ───────────────────────────────────

function MiniCalculator({ onSearch }) {
  const [card, setCard] = useState('Chase Sapphire')
  const [points, setPoints] = useState(80000)

  const cpp = card.includes('Amex') ? 2.2
    : card.includes('Capital') ? 1.85
    : card.includes('Citi') ? 1.95
    : card.includes('Bilt') ? 2.05
    : 2.05
  const value = Math.round((points * cpp) / 100)

  return (
    <div style={{ ...CARD, padding: 22, width: 360, backdropFilter: 'blur(6px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ ...MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: FG_MUTE }}>
          Live valuation
        </span>
        <span style={{ ...MONO, fontSize: 10, color: V300, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: 99,
            background: V400, boxShadow: `0 0 8px ${V400}`,
          }} />
          live
        </span>
      </div>

      <label style={{ display: 'block', marginBottom: 14 }}>
        <div style={{ ...MONO, fontSize: 11, color: FG_MUTE, marginBottom: 6, letterSpacing: '0.04em' }}>YOUR CARD</div>
        <select
          value={card}
          onChange={e => setCard(e.target.value)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.03)', color: FG,
            border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px',
            fontSize: 14, appearance: 'none', fontFamily: 'inherit', outline: 'none',
          }}
        >
          <option>Chase Sapphire</option>
          <option>Amex Platinum</option>
          <option>Capital One Venture X</option>
          <option>Citi Premier</option>
          <option>Bilt Mastercard</option>
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 18 }}>
        <div style={{ ...MONO, fontSize: 11, color: FG_MUTE, marginBottom: 6, letterSpacing: '0.04em' }}>BALANCE</div>
        <input
          type="range" min="10000" max="500000" step="5000"
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: FG_MUTE, ...MONO }}>
          <span>{points.toLocaleString()} pts</span>
          <span>500k</span>
        </div>
      </label>

      <div style={{ paddingTop: 16, borderTop: `1px solid ${LINE}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: FG_MUTE }}>Peak award value</span>
        <span style={{ ...SERIF, fontSize: 32, color: FG, letterSpacing: '-0.02em' }}>
          ${value.toLocaleString()}
          <span style={{ ...MONO, fontSize: 13, color: FG_MUTE, marginLeft: 6 }}>/ {cpp}¢ cpp</span>
        </span>
      </div>

      <BtnPrimary onClick={onSearch} style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}>
        Find best redemption →
      </BtnPrimary>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────

function Hero({ navigate, user, isPro }) {
  return (
    <section style={{
      padding: 'clamp(28px,4vw,56px) clamp(24px,5vw,64px) clamp(40px,5vw,64px)',
      position: 'relative',
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'clamp(48px,7vw,96px)',
      }}>
        <PpMark onClick={() => navigate('/')} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user && isPro ? (
            <button
              onClick={() => navigate('/account')}
              style={{
                fontSize: 14, color: FG_SOFT, background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0',
              }}
            >
              Account
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                fontSize: 14, color: FG_SOFT, background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = FG}
              onMouseLeave={e => e.currentTarget.style.color = FG_SOFT}
            >
              Sign in
            </button>
          )}
          <BtnPrimary onClick={() => navigate('/signup')} style={{ padding: '10px 18px', fontSize: 14 }}>
            Get Pro
          </BtnPrimary>
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>

        {/* Left: headline + stats */}
        <div style={{ flex: '1 1 380px', minWidth: 0 }}>
          {/* Eyebrow chip */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 999, fontSize: 12,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)',
            color: V300, fontWeight: 500,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: V400, boxShadow: `0 0 8px ${V400}` }} />
            Award travel, optimized
          </span>

          {/* Headline */}
          <h1 style={{
            ...SERIF,
            fontSize: 'clamp(48px,6.5vw,96px)',
            lineHeight: 0.95,
            margin: '28px 0',
            letterSpacing: '-0.035em',
            color: FG,
          }}>
            {HEADLINE.before}
            <br />
            <span style={{
              fontStyle: 'italic',
              background: 'linear-gradient(180deg, #fff 20%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {HEADLINE.accent}
            </span>
            {HEADLINE.after}
          </h1>

          <p style={{
            fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.55,
            color: FG_SOFT, maxWidth: 520, margin: '0 0 36px',
          }}>
            PointPilot finds the highest cents-per-point redemption across 24 transfer
            partners — first class, lie-flat, or the surprise off-peak gem nobody talks about.
          </p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <BtnPrimary onClick={() => navigate('/search')}>Find my redemption →</BtnPrimary>
            <BtnGhost onClick={() => navigate('/search')}>Browse sweet spots</BtnGhost>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 36, marginTop: 56, color: FG_MUTE, fontSize: 13, flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...SERIF, fontSize: 28, color: FG }}>24</div>
              <div style={{ marginTop: 2 }}>Transfer partners</div>
            </div>
            <div style={{ width: 1, background: LINE }} />
            <div>
              <div style={{ ...SERIF, fontSize: 28, color: FG }}>28.0<span style={{ fontSize: 16, color: FG_MUTE }}>¢</span></div>
              <div style={{ marginTop: 2 }}>Best logged cpp</div>
            </div>
            <div style={{ width: 1, background: LINE }} />
            <div>
              <div style={{ ...SERIF, fontSize: 28, color: FG }}>~90<span style={{ fontSize: 16, color: FG_MUTE }}>s</span></div>
              <div style={{ marginTop: 2 }}>Median search</div>
            </div>
          </div>
        </div>

        {/* Right: calculator */}
        <div style={{ flexShrink: 0 }}>
          <MiniCalculator onSearch={() => navigate('/search')} />
        </div>

      </div>
    </section>
  )
}

// ── Sample redemptions ───────────────────────────────────────

function StatLabel({ label, value, accent, mono, small }) {
  return (
    <div>
      <div style={{ ...MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: FG_MUTE, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        ...(mono ? MONO : {}),
        fontSize: small ? 13 : 18,
        color: accent ? V300 : FG,
        fontWeight: small ? 400 : 500,
        letterSpacing: small ? 0 : '-0.01em',
      }}>
        {value}
      </div>
    </div>
  )
}

function RedemptionCard({ r }) {
  return (
    <article style={{ ...CARD, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cabin image placeholder */}
      <div style={{
        height: 220, position: 'relative', overflow: 'hidden',
        borderRadius: '18px 18px 0 0',
        background: r.bg,
      }}>
        {/* Subtle stripe overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 14px)',
        }} />
        <span style={{
          position: 'absolute', bottom: 12, left: 14, zIndex: 2,
          ...MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}>
          cabin · {r.airline}
        </span>
        <span style={{
          position: 'absolute', top: 14, left: 14, zIndex: 2,
          ...MONO, fontSize: 11, padding: '5px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', backdropFilter: 'blur(6px)',
        }}>
          {r.tag}
        </span>
      </div>

      <div style={{ padding: '22px 22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ ...SERIF, fontSize: 30, margin: 0, letterSpacing: '-0.02em', color: FG }}>{r.route}</h3>
          <span style={{ ...MONO, fontSize: 11, color: FG_MUTE }}>{r.airline.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 13, color: FG_SOFT, marginTop: 4 }}>{r.cls}</div>

        <div style={{ ...HR, margin: '18px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 12, columnGap: 16 }}>
          <StatLabel label="Points"     value={r.points}  mono />
          <StatLabel label="Cash price" value={r.retail}  />
          <StatLabel label="Program"    value={r.program} small />
          <StatLabel label="Value / pt" value={r.cpp}     accent mono />
        </div>
      </div>
    </article>
  )
}

function RedemptionsSection() {
  return (
    <section style={{
      padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(48px,6vw,96px)',
      borderTop: `1px solid ${LINE}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 48, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.16em', color: V300, textTransform: 'uppercase' }}>
            01 · This week's sweet spots
          </span>
          <h2 style={{
            ...SERIF,
            fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.02,
            margin: '16px 0 0', letterSpacing: '-0.025em', maxWidth: 720, color: FG,
          }}>
            Real redemptions, <span style={{ fontStyle: 'italic', color: V300 }}>real math</span>.
          </h2>
        </div>
        <span style={{ ...MONO, fontSize: 12, color: FG_SOFT, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'default' }}>
          See all 312 →
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {REDEMPTIONS.map(r => <RedemptionCard key={r.route} r={r} />)}
      </div>
    </section>
  )
}

// ── Programs ─────────────────────────────────────────────────

function ProgramCard({ p }) {
  const bg = p.tone === 'gold'   ? 'linear-gradient(135deg, #3c2e10, #1a1308)'
           : p.tone === 'muted'  ? 'linear-gradient(135deg, #14182a, #0a0d18)'
           :                       'linear-gradient(135deg, #1f1f4c, #0e1130)'
  const accent = p.tone === 'gold' ? GOLD : p.tone === 'muted' ? '#9ca3af' : V300

  return (
    <div style={{
      padding: '22px 22px 20px', borderRadius: 14,
      background: bg, border: `1px solid ${LINE}`,
      position: 'relative', overflow: 'hidden',
      aspectRatio: '1.6 / 1',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Card chip */}
        <div style={{
          width: 32, height: 22, borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))',
          border: '1px solid rgba(255,255,255,0.18)',
        }} />
        <span style={{ ...MONO, fontSize: 10, color: accent, letterSpacing: '0.1em' }}>{p.value} / PT</span>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: FG }}>{p.name}</div>
        <div style={{ fontSize: 12, color: FG_MUTE, marginTop: 2 }}>{p.sub}</div>
      </div>
    </div>
  )
}

function ProgramsSection() {
  return (
    <section style={{
      padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(48px,6vw,96px)',
      borderTop: `1px solid ${LINE}`,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(32px,5vw,80px)', marginBottom: 56,
      }}>
        <div>
          <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.16em', color: V300, textTransform: 'uppercase' }}>
            02 · The library
          </span>
          <h2 style={{
            ...SERIF,
            fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.02,
            margin: '16px 0 0', letterSpacing: '-0.025em', color: FG,
          }}>
            Every program <span style={{ fontStyle: 'italic' }}>that matters</span>.
          </h2>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: FG_SOFT, alignSelf: 'end', maxWidth: 520 }}>
          Five transferable currencies. Nineteen airline and hotel partners. We track award
          charts, fuel surcharges, and transfer bonuses so you don't have to bookmark
          another spreadsheet.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
        {PROGRAMS.map(p => <ProgramCard key={p.name} p={p} />)}
      </div>

      <div style={{
        marginTop: 32, paddingTop: 24, borderTop: `1px solid ${LINE}`,
        display: 'flex', flexWrap: 'wrap', gap: '8px 22px',
        fontSize: 12, color: FG_MUTE, ...MONO,
      }}>
        {PARTNER_PILLS.map(s => <span key={s}>{s}</span>)}
      </div>
    </section>
  )
}

// ── Pricing ──────────────────────────────────────────────────

function PricingCard({ tier, price, per, tagline, features, cta, primary, featured, onCta }) {
  return (
    <div style={{
      ...CARD,
      padding: 32, position: 'relative', overflow: 'hidden',
      background: featured
        ? 'linear-gradient(180deg, rgba(99,102,241,0.18), rgba(99,102,241,0.04) 40%, rgba(255,255,255,0.01))'
        : CARD.background,
      borderColor: featured ? 'rgba(99,102,241,0.4)' : LINE,
    }}>
      {featured && (
        <span style={{
          position: 'absolute', top: 20, right: 20,
          ...MONO, fontSize: 10, padding: '5px 10px', borderRadius: 999,
          background: 'rgba(99,102,241,0.2)', color: V300, letterSpacing: '0.1em',
        }}>
          MOST POPULAR
        </span>
      )}

      <div style={{ ...MONO, fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: FG_MUTE }}>
        {tier}
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ ...SERIF, fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1, color: FG }}>{price}</span>
        {per && <span style={{ fontSize: 16, color: FG_MUTE }}>{per}</span>}
      </div>

      <p style={{ marginTop: 10, color: FG_SOFT, fontSize: 15, lineHeight: 1.5, maxWidth: 360 }}>{tagline}</p>

      <div style={{ ...HR, margin: '26px 0' }} />

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', gap: 12, fontSize: 14, color: FG_SOFT }}>
            <span style={{ color: V400, flexShrink: 0 }}>✦</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {primary
        ? <BtnPrimary onClick={onCta} style={{ marginTop: 28, width: '100%' }}>{cta}</BtnPrimary>
        : <BtnGhost   onClick={onCta} style={{ marginTop: 28, width: '100%' }}>{cta}</BtnGhost>
      }
    </div>
  )
}

function PricingSection({ navigate }) {
  return (
    <section style={{
      padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,64px) clamp(48px,6vw,96px)',
      borderTop: `1px solid ${LINE}`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.16em', color: V300, textTransform: 'uppercase' }}>
          03 · Pricing
        </span>
        <h2 style={{
          ...SERIF,
          fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.02,
          margin: '16px 0 0', letterSpacing: '-0.025em', color: FG,
        }}>
          One redemption <span style={{ fontStyle: 'italic' }}>pays for years</span>.
        </h2>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24, maxWidth: 920, margin: '0 auto',
      }}>
        <PricingCard
          tier="Compass" price="Free" tagline="The basics, on the house."
          features={[
            '5 redemption searches / month',
            'All 24 transfer partners',
            'Standard award chart data',
            'Email recap, weekly',
          ]}
          cta="Start free" primary={false} onCta={() => navigate('/search')}
        />
        <PricingCard
          tier="Sextant" price="$9" per="/ month"
          tagline="Power tools for serious mileage runners."
          featured primary
          features={[
            'Unlimited searches & saved trips',
            'Sweet-spot & transfer bonus alerts',
            'Phantom availability monitoring',
            'Off-peak & shoulder calendar',
            'Multi-card pooled valuations',
            'Concierge import (CSV / OCR)',
          ]}
          cta="Get Pro →" onCta={() => navigate('/signup')}
        />
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: FG_MUTE }}>
        Cancel any time. The points you save in a single trip pay for a decade of Sextant.
      </p>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────

function FootCol({ title, items }) {
  return (
    <div>
      <div style={{ ...MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: FG_MUTE }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <li key={item.label}>
            <span
              onClick={item.onClick}
              style={{
                fontSize: 14, color: FG_SOFT,
                cursor: item.onClick ? 'pointer' : 'default',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (item.onClick) e.currentTarget.style.color = FG }}
              onMouseLeave={e => { if (item.onClick) e.currentTarget.style.color = FG_SOFT }}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer({ navigate }) {
  return (
    <footer style={{
      padding: 'clamp(40px,5vw,64px) clamp(24px,5vw,64px) 40px',
      borderTop: `1px solid ${LINE}`,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 48 }}>
        <div>
          <PpMark onClick={() => navigate('/')} />
          <p style={{ marginTop: 16, fontSize: 14, color: FG_MUTE, maxWidth: 300, lineHeight: 1.55 }}>
            A small instrument for award travel. Built for the r/awardtravel diaspora.
          </p>
        </div>

        <FootCol title="Product" items={[
          { label: 'Redemptions',  onClick: () => navigate('/search') },
          { label: 'Sweet spots',  onClick: () => navigate('/search') },
          { label: 'Sextant Pro',  onClick: () => navigate('/signup') },
        ]} />

        <FootCol title="Account" items={[
          { label: 'Sign in',          onClick: () => navigate('/login')   },
          { label: 'Get Pro',          onClick: () => navigate('/signup')  },
          { label: 'Account settings', onClick: () => navigate('/account') },
        ]} />

        <FootCol title="Legal" items={[
          { label: 'Terms of Service', onClick: () => navigate('/terms') },
        ]} />
      </div>

      <div style={{ ...HR, margin: '48px 0 24px' }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
        fontSize: 12, color: FG_MUTE, ...MONO,
      }}>
        <span>© 2026 PointPilot. Estimates only — always verify award availability before transferring points.</span>
        <span>v1.0</span>
      </div>
    </footer>
  )
}

// ── Page ─────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  return (
    <div style={PAGE_BG}>
      <Hero navigate={navigate} user={user} isPro={isPro} />
      <RedemptionsSection />
      <ProgramsSection />
      <PricingSection navigate={navigate} />
      <Footer navigate={navigate} />
    </div>
  )
}
