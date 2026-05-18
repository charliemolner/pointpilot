import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Design tokens ──────────────────────────────────────────
const BG        = '#0a0f1e'
const SURFACE   = '#0f1629'
const ELEVATED  = '#141d35'
const TEXT      = '#f1f5f9'
const MUTED     = '#94a3b8'
const SUBTLE    = '#475569'
const ACCENT    = '#6366f1'
const ACCENT_LT = '#818cf8'
const BORDER    = 'rgba(255,255,255,0.07)'
const BORDER_MID = 'rgba(255,255,255,0.10)'
const GLOW      = 'rgba(99,102,241,0.35)'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const inputStyle = (field, withToggle = false) => ({
    background: ELEVATED,
    border: `1px solid ${focusedField === field ? 'rgba(99,102,241,0.6)' : BORDER_MID}`,
    borderRadius: '10px',
    padding: withToggle ? '11px 42px 11px 14px' : '11px 14px',
    fontSize: '15px',
    color: TEXT,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    boxShadow: focusedField === field ? `0 0 0 3px rgba(99,102,241,0.12)` : 'none',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message || 'Login failed. Please check your credentials.')
      setLoading(false)
      return
    }

    // Check if user has an active Pro subscription
    const userId = authData.user?.id
    try {
      const res = await fetch(`/api/pro-status?user_id=${userId}`)
      const { isPro } = await res.json()
      if (isPro) {
        navigate('/search')
      } else {
        // Account exists but no subscription - send to signup to complete payment
        const msg = encodeURIComponent("Your account exists but you don't have an active subscription. Complete your signup below.")
        navigate(`/signup?email=${encodeURIComponent(email)}&message=${msg}&plan=annual`)
      }
    } catch {
      // If pro-status check fails, just go to search
      navigate('/search')
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>

      {/* Navbar */}
      <nav style={{
        height: '52px',
        background: 'rgba(10,15,30,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
      }}>
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
      </nav>

      {/* Centered layout */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 52px)',
        padding: '32px 24px',
      }}>

        {/* Wordmark above card */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <span style={{
            fontSize: '28px', fontWeight: '700',
            letterSpacing: '-0.5px',
            background: `linear-gradient(180deg, ${TEXT} 30%, ${MUTED} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            PointPilot
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: SURFACE,
          border: `1px solid ${BORDER_MID}`,
          borderRadius: '16px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <h1 style={{
            fontSize: '22px', fontWeight: '700',
            letterSpacing: '-0.4px', lineHeight: 1.2,
            color: TEXT, marginBottom: '6px',
            textAlign: 'center',
          }}>
            Welcome back
          </h1>
          <p style={{
            color: MUTED, fontSize: '14px',
            textAlign: 'center', marginBottom: '28px',
            letterSpacing: '-0.1px',
          }}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                style={inputStyle('email')}
              />
            </div>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                style={inputStyle('password', true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  padding: '2px', cursor: 'pointer',
                  color: SUBTLE, display: 'flex', alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = MUTED}
                onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
              >
                {showPassword ? (
                  // Eye-off
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p style={{
                color: '#f87171', fontSize: '13px',
                marginBottom: '14px', textAlign: 'center',
                lineHeight: 1.5,
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? ELEVATED : ACCENT,
                color: loading ? MUTED : '#fff',
                fontWeight: '500',
                fontSize: '15px',
                padding: '13px',
                borderRadius: '999px',
                border: `1px solid ${loading ? BORDER_MID : 'transparent'}`,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                letterSpacing: '-0.2px',
                boxShadow: loading ? 'none' : `0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px ${GLOW}`,
                transition: 'background 0.15s, box-shadow 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' }}}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: SUBTLE }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: ACCENT_LT, fontWeight: '500', textDecoration: 'none' }}>
              Get Pro →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
