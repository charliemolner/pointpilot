import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAVY = '#1a3a6b'

function CreditCardIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="15" rx="2.5" stroke={NAVY} strokeWidth="1.2" fill="white" />
      <rect x="0" y="4" width="22" height="3.5" fill={NAVY} opacity="0.15" />
      <rect x="2.5" y="10" width="7" height="2" rx="1" fill={NAVY} opacity="0.35" />
      <rect x="11.5" y="10" width="4" height="2" rx="1" fill={NAVY} opacity="0.2" />
    </svg>
  )
}

function Barcode() {
  const bars = [3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,2,3,1,2,4,3,1,2,3,1,4,2,1,3,2,4,1,3]
  let x = 0
  const rects = bars.map((w, i) => {
    const rect = { x, w, draw: i % 2 === 0 }
    x += w + 1
    return rect
  })
  const totalW = x
  return (
    <svg width="100%" height="36" viewBox={`0 0 ${totalW} 36`} preserveAspectRatio="none" aria-hidden="true">
      {rects.filter(r => r.draw).map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={36} fill={NAVY} opacity="0.55" />
      ))}
    </svg>
  )
}

function BoardingPass() {
  return (
    <div
      className="boarding-pass-float"
      style={{
        width: '300px',
        background: 'white',
        borderRadius: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        transform: 'rotate(6deg)',
        flexShrink: 0,
      }}
    >
      {/* Top section */}
      <div style={{ padding: '22px 24px 20px' }}>
        {/* Card label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CreditCardIcon />
          <span style={{ color: NAVY, fontSize: '12px', fontWeight: '600', letterSpacing: '0.01em', opacity: 0.75 }}>
            Chase Sapphire Preferred
          </span>
        </div>

        {/* Thin divider */}
        <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '18px' }} />

        {/* Route */}
        <div style={{ color: NAVY, fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '10px' }}>
          JFK → NRT
        </div>

        {/* Details */}
        <div style={{ color: NAVY, fontSize: '14px', fontWeight: '600', marginBottom: '5px', opacity: 0.8 }}>
          ANA Business Class
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: NAVY, fontSize: '14px', fontWeight: '700' }}>47,500 pts</span>
          <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: '700' }}>✓</span>
        </div>
        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
          Est. value $4,200
        </div>
      </div>

      {/* Perforation divider */}
      <div style={{ position: 'relative', margin: '0 -1px' }}>
        {/* Left notch */}
        <div style={{
          position: 'absolute', left: '-13px', top: '-13px',
          width: '26px', height: '26px', borderRadius: '50%',
          background: NAVY,
        }} />
        {/* Right notch */}
        <div style={{
          position: 'absolute', right: '-13px', top: '-13px',
          width: '26px', height: '26px', borderRadius: '50%',
          background: NAVY,
        }} />
        <div style={{
          borderTop: '2px dashed #d1d5db',
          margin: '0 16px',
        }} />
      </div>

      {/* Barcode section */}
      <div style={{ padding: '18px 24px 20px' }}>
        <Barcode />
        <div style={{ color: '#9ca3af', fontSize: '10px', textAlign: 'center', marginTop: '6px', letterSpacing: '0.15em' }}>
          PP-2026-JFK-NRT-0042
        </div>
      </div>
    </div>
  )
}

function PilotButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white',
        color: NAVY,
        fontWeight: '700',
        fontSize: '17px',
        padding: '16px 40px',
        borderRadius: '50px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 6px 28px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.24), 0 4px 10px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)'
      }}
    >
      Pilot My Points
    </button>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  return (
    <div style={{ backgroundColor: NAVY }} className="dot-bg min-h-screen flex flex-col text-white">

      {/* Navbar */}
      <nav style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', flexShrink: 0 }}>
        <span style={{ color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', userSelect: 'none' }}>
          PointPilot™
        </span>

        {/* Log in link — hidden when Pro badge is already showing */}
        {!(user && isPro) && (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.45)',
              borderRadius: '50px',
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent' }}
          >
            Log in
          </button>
        )}
      </nav>


      {/* Hero — full viewport height, true side-by-side on md+ */}
      <section className="hero-section">
        {/* Left: copy */}
        <div className="hero-left">
          <h1
            style={{ color: 'white', fontSize: 'clamp(36px, 4.5vw, 58px)', fontWeight: '800', lineHeight: 1.08, letterSpacing: '-2px', marginBottom: '24px' }}
          >
            Simplify your journey.<br />
            We'll pilot your points.
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '18px',
              lineHeight: 1.65,
              maxWidth: '520px',
              marginBottom: '36px',
            }}
          >
            Enter your card and points balance. Find the cheapest redemptions
            or the most luxurious upgrades — we'll show you both.
          </p>

          <PilotButton onClick={() => navigate('/search')} />
        </div>

        {/* Right: boarding pass */}
        <div className="hero-right">
          <div style={{ marginRight: '60px' }}>
            <BoardingPass />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '60px 32px 80px', textAlign: 'center' }}>
        <p style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '12px' }}>
          Your next adventure is already paid for.
        </p>
        <p style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: '600', marginBottom: '36px' }}>
          See how.
        </p>
        <PilotButton onClick={() => navigate('/search')} />
      </section>

    </div>
  )
}
