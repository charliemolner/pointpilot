import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        // Account exists but no subscription — send to signup to complete payment
        const msg = encodeURIComponent("Your account exists but you don't have an active subscription. Complete your signup below.")
        navigate(`/signup?email=${encodeURIComponent(email)}&message=${msg}&plan=annual`)
      }
    } catch {
      // If pro-status check fails, just go to search
      navigate('/search')
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
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}>
          <h1 style={{ color: NAVY, fontSize: '28px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: '28px', textAlign: 'center' }}>
            Welcome back
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={INPUT_STYLE}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={INPUT_STYLE}
              />
            </div>

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
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: NAVY, fontWeight: '700', textDecoration: 'none' }}>
              Get Pro →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
