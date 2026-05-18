import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

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

const FEATURES = [
  { icon: '∞', title: 'Unlimited searches',      desc: 'no daily limits, ever' },
  { icon: '↔', title: 'Compare multiple cards',  desc: 'see which gets you there fastest' },
  { icon: '◎', title: 'Transfer bonus alerts',   desc: 'know when your points are worth more' },
  { icon: '◷', title: 'Live date availability',  desc: 'coming soon' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'annual'

  // "existing account" mode - arrived from Login with a pre-filled email
  const prefillEmail   = searchParams.get('email') || ''
  const bannerMessage  = searchParams.get('message') || ''
  const existingMode   = Boolean(prefillEmail)

  const [billing, setBilling] = useState(initialPlan)
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const inputStyle = (field, readOnly = false) => ({
    background: readOnly ? 'rgba(255,255,255,0.03)' : ELEVATED,
    border: `1px solid ${focusedField === field ? 'rgba(99,102,241,0.6)' : BORDER_MID}`,
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '15px',
    color: readOnly ? SUBTLE : TEXT,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    boxShadow: focusedField === field ? `0 0 0 3px rgba(99,102,241,0.12)` : 'none',
    cursor: readOnly ? 'default' : 'text',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!existingMode) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }

    setLoading(true)
    try {
      const endpoint = existingMode ? '/api/create-checkout' : '/api/create-account'
      const body = existingMode
        ? { email, plan: billing }
        : { email, password, plan: billing }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
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
        alignItems: 'center',
        padding: '32px 24px 64px',
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
          maxWidth: '440px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>

          {/* Banner for existing-account mode */}
          {bannerMessage && (
            <div style={{
              background: 'rgba(251,191,36,0.07)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '10px', padding: '11px 14px',
              marginBottom: '20px',
              color: '#fcd34d', fontSize: '13px',
              lineHeight: 1.55, textAlign: 'center',
            }}>
              {bannerMessage}
            </div>
          )}

          {/* Headline */}
          <h1 style={{
            color: TEXT, fontSize: '22px',
            fontWeight: '700', letterSpacing: '-0.4px',
            lineHeight: 1.2, marginBottom: '6px',
            textAlign: 'center',
          }}>
            Get PointPilot Pro
          </h1>
          <p style={{
            color: MUTED, fontSize: '14px',
            textAlign: 'center', marginBottom: '24px',
            letterSpacing: '-0.1px',
          }}>
            Unlock unlimited searches and more.
          </p>

          {/* Feature list */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: ELEVATED,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
          }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                display: 'flex', alignItems: 'center',
                gap: '12px',
                paddingBottom: i < FEATURES.length - 1 ? '11px' : 0,
                marginBottom: i < FEATURES.length - 1 ? '11px' : 0,
                borderBottom: i < FEATURES.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}>
                <span style={{
                  width: '28px', height: '28px',
                  borderRadius: '7px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: ACCENT_LT,
                  fontSize: '14px', fontWeight: '600',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  {f.icon}
                </span>
                <div>
                  <span style={{ color: TEXT, fontWeight: '500', fontSize: '13px' }}>{f.title}</span>
                  <span style={{ color: SUBTLE, fontSize: '13px' }}>: {f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '10px', marginBottom: '20px',
          }}>
            {/* Monthly */}
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              style={{
                padding: '13px 10px', borderRadius: '10px',
                cursor: 'pointer',
                border: billing === 'monthly'
                  ? '1px solid rgba(99,102,241,0.5)'
                  : `1px solid ${BORDER_MID}`,
                background: billing === 'monthly'
                  ? 'rgba(99,102,241,0.12)'
                  : ELEVATED,
                transition: 'all 0.15s',
                boxShadow: billing === 'monthly'
                  ? '0 0 0 1px rgba(99,102,241,0.15)'
                  : 'none',
              }}
            >
              <div style={{
                color: billing === 'monthly' ? ACCENT_LT : MUTED,
                fontSize: '13px', fontWeight: '600',
                letterSpacing: '-0.1px',
              }}>Monthly</div>
              <div style={{
                color: billing === 'monthly' ? MUTED : SUBTLE,
                fontSize: '12px', marginTop: '3px',
              }}>$10/mo</div>
            </button>

            {/* Annual */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-9px', left: '50%',
                transform: 'translateX(-50%)',
                background: ACCENT, color: '#fff',
                fontSize: '9px', fontWeight: '600',
                padding: '2px 9px', borderRadius: '999px',
                whiteSpace: 'nowrap', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                Best value
              </div>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                style={{
                  width: '100%', padding: '13px 10px',
                  borderRadius: '10px', cursor: 'pointer',
                  border: billing === 'annual'
                    ? '1px solid rgba(99,102,241,0.5)'
                    : `1px solid ${BORDER_MID}`,
                  background: billing === 'annual'
                    ? 'rgba(99,102,241,0.12)'
                    : ELEVATED,
                  transition: 'all 0.15s',
                  boxShadow: billing === 'annual'
                    ? '0 0 0 1px rgba(99,102,241,0.15)'
                    : 'none',
                }}
              >
                <div style={{
                  color: billing === 'annual' ? ACCENT_LT : MUTED,
                  fontSize: '13px', fontWeight: '600',
                  letterSpacing: '-0.1px',
                }}>Annual</div>
                <div style={{
                  color: billing === 'annual' ? MUTED : SUBTLE,
                  fontSize: '12px', marginTop: '3px',
                }}>$8/mo · $96/yr</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => !existingMode && setEmail(e.target.value)}
                onFocus={() => !existingMode && setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                readOnly={existingMode}
                style={inputStyle('email', existingMode)}
              />
            </div>

            {/* Password fields - hidden in existing-account mode */}
            {!existingMode && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={inputStyle('password')}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={inputStyle('confirm')}
                  />
                </div>
              </>
            )}

            {existingMode && <div style={{ marginBottom: '20px' }} />}

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
              {loading
                ? (existingMode ? 'Redirecting to payment…' : 'Creating account…')
                : (existingMode ? 'Complete signup & pay' : 'Create account & pay')
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: SUBTLE }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: ACCENT_LT, fontWeight: '500', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
