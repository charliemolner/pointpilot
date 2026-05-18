import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

const NAVY = '#1a3a6b'
const AMBER = '#f59e0b'

const INPUT_STYLE = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '15px',
  color: NAVY,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const FEATURES = [
  {
    emoji: '🔍',
    title: 'Unlimited searches',
    desc: 'no daily limits, ever',
  },
  {
    emoji: '💳',
    title: 'Compare multiple cards',
    desc: 'see which gets you there fastest',
  },
  {
    emoji: '🔔',
    title: 'Transfer bonus alerts',
    desc: 'know when your points are worth more',
  },
  {
    emoji: '📅',
    title: 'Live date availability',
    desc: 'coming soon',
  },
]

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'annual'

  // "existing account" mode — arrived from Login with a pre-filled email
  const prefillEmail   = searchParams.get('email') || ''
  const bannerMessage  = searchParams.get('message') || ''
  const existingMode   = Boolean(prefillEmail)

  const [billing, setBilling] = useState(initialPlan)
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div style={{ backgroundColor: NAVY, minHeight: '100vh', color: 'white' }}>
      {/* Navbar */}
      <nav style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <span
          onClick={() => navigate('/')}
          style={{ color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', cursor: 'pointer', userSelect: 'none' }}
        >
          PointPilot™
        </span>
      </nav>

      {/* Card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 80px' }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}>
          {/* Banner for existing-account mode */}
          {bannerMessage && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fcd34d',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              color: '#92400e', fontSize: '13px', lineHeight: 1.5, textAlign: 'center',
            }}>
              {bannerMessage}
            </div>
          )}

          {/* Headline */}
          <h1 style={{ color: NAVY, fontSize: '26px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: '8px', textAlign: 'center' }}>
            Get PointPilot Pro
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', textAlign: 'center', marginBottom: '28px' }}>
            Unlock unlimited searches and more.
          </p>

          {/* Feature list */}
          <div style={{ marginBottom: '28px' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px', lineHeight: 1.3 }}>{f.emoji}</span>
                <div>
                  <span style={{ color: NAVY, fontWeight: '700', fontSize: '14px' }}>{f.title}</span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}> — {f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            {/* Monthly */}
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              style={{
                padding: '14px 10px', borderRadius: '12px', cursor: 'pointer',
                border: billing === 'monthly' ? `2px solid ${NAVY}` : '2px solid #e5e7eb',
                background: billing === 'monthly' ? NAVY : 'white',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ color: billing === 'monthly' ? 'white' : NAVY, fontSize: '13px', fontWeight: '700' }}>Monthly</div>
              <div style={{ color: billing === 'monthly' ? 'rgba(255,255,255,0.75)' : '#6b7280', fontSize: '12px', marginTop: '3px' }}>$10/mo</div>
            </button>

            {/* Annual */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                background: AMBER, color: '#1c1917', fontSize: '9px', fontWeight: '800',
                padding: '2px 9px', borderRadius: '50px', whiteSpace: 'nowrap',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Best Value</div>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                style={{
                  width: '100%', padding: '14px 10px', borderRadius: '12px', cursor: 'pointer',
                  border: billing === 'annual' ? `2px solid ${NAVY}` : '2px solid #e5e7eb',
                  background: billing === 'annual' ? NAVY : 'white',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ color: billing === 'annual' ? 'white' : NAVY, fontSize: '13px', fontWeight: '700' }}>Annual</div>
                <div style={{ color: billing === 'annual' ? 'rgba(255,255,255,0.75)' : '#6b7280', fontSize: '12px', marginTop: '3px' }}>$8/mo · $96/yr</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => !existingMode && setEmail(e.target.value)}
                required
                readOnly={existingMode}
                style={{ ...INPUT_STYLE, background: existingMode ? '#f9fafb' : 'white', color: existingMode ? '#6b7280' : NAVY }}
              />
            </div>

            {/* Password fields — hidden in existing-account mode */}
            {!existingMode && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={INPUT_STYLE}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={INPUT_STYLE}
                  />
                </div>
              </>
            )}

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#d1d5db' : AMBER,
                color: '#1c1917',
                fontWeight: '800',
                fontSize: '16px',
                padding: '16px',
                borderRadius: '50px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(245,158,11,0.35)',
                transition: 'all 0.15s',
              }}
            >
              {loading
                ? (existingMode ? 'Redirecting to payment…' : 'Creating account…')
                : (existingMode ? 'Complete Signup & Pay' : 'Create Account & Pay')
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: NAVY, fontWeight: '700', textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
