import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Design tokens ──────────────────────────────────────────
const BG        = '#0a0f1e'
const SURFACE   = '#0f1629'
const ELEVATED  = '#141d35'
const TEXT      = '#f1f5f9'
const MUTED     = '#94a3b8'
const ACCENT    = '#6366f1'
const ACCENT_LT = '#818cf8'
const BORDER    = 'rgba(255,255,255,0.07)'
const BORDER_MID = 'rgba(255,255,255,0.10)'
const GLOW      = 'rgba(99,102,241,0.35)'

export default function ProSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.log('[ProSuccess] No active session found. User can log in at /login.')
      }
    })
  }, [])

  return (
    <div style={{
      background: BG,
      minHeight: '100vh',
      color: TEXT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.14) 0%, transparent 70%)',
      }} />

      {/* Wordmark */}
      <div style={{ marginBottom: '28px', position: 'relative' }}>
        <span
          onClick={() => navigate('/')}
          style={{
            fontSize: '16px', fontWeight: '600',
            letterSpacing: '-0.3px', color: TEXT,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          PointPilot
        </span>
      </div>

      {/* Card */}
      <div style={{
        background: SURFACE,
        border: `1px solid rgba(99,102,241,0.25)`,
        borderRadius: '20px',
        padding: '40px 36px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 0 1px rgba(99,102,241,0.08), 0 32px 80px rgba(0,0,0,0.45)`,
        position: 'relative',
      }}>

        {/* Icon */}
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '14px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '22px',
        }}>
          ✦
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 26px)',
          fontWeight: '700',
          letterSpacing: '-0.04em',
          lineHeight: 1.2,
          marginBottom: '12px',
          background: `linear-gradient(180deg, ${TEXT} 30%, ${MUTED} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          You're a PointPilot Pro member.
        </h1>

        <p style={{
          color: MUTED, fontSize: '14px',
          lineHeight: 1.65, marginBottom: '32px',
          letterSpacing: '-0.1px',
        }}>
          Unlimited searches are now unlocked.
          Go find your next redemption.
        </p>

        <button
          onClick={() => navigate('/search')}
          style={{
            background: ACCENT,
            color: '#fff',
            fontWeight: '500',
            fontSize: '15px',
            padding: '13px 32px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.2px',
            boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px ${GLOW}`,
            transition: 'background 0.15s, transform 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Start searching →
        </button>
      </div>
    </div>
  )
}
