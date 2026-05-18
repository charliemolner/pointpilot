import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const NAVY = '#1a3a6b'
const AMBER = '#f59e0b'

const card = {
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  padding: '28px 32px',
  marginBottom: '20px',
}

const sectionTitle = {
  color: NAVY,
  fontSize: '13px',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '16px',
}

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '4px',
}

const value = {
  color: NAVY,
  fontSize: '15px',
  fontWeight: '700',
}

const btn = (variant = 'default') => ({
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  ...(variant === 'primary' && {
    background: NAVY,
    color: 'white',
  }),
  ...(variant === 'danger' && {
    background: '#fee2e2',
    color: '#b91c1c',
  }),
  ...(variant === 'default' && {
    background: '#f3f4f6',
    color: NAVY,
  }),
  ...(variant === 'amber' && {
    background: AMBER,
    color: 'white',
  }),
})

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function AccountSettings() {
  const { user, isPro, plan, logout, checkProStatus } = useAuth()
  const navigate = useNavigate()

  const [renewalDate, setRenewalDate] = useState(null)
  const [canceling, setCanceling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const [pwLoading, setPwLoading] = useState(false)
  const [pwSent, setPwSent] = useState(false)
  const [pwError, setPwError] = useState('')

  // Fetch renewal date on mount (only relevant for Pro users)
  useEffect(() => {
    if (!user) return
    fetch(`/api/pro-status?user_id=${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.renewalDate) setRenewalDate(d.renewalDate) })
      .catch(() => {})
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) navigate('/login')
  }, [user, navigate])

  async function handleCancelSubscription() {
    setCanceling(true)
    setCancelError('')
    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cancellation failed.')
      setCancelDone(true)
      setConfirmCancel(false)
      // Refresh pro status in context
      await checkProStatus(user.id)
    } catch (e) {
      setCancelError(e.message)
    } finally {
      setCanceling(false)
    }
  }

  async function handleChangePassword() {
    setPwLoading(true)
    setPwError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/account`,
      })
      if (error) throw error
      setPwSent(true)
    } catch (e) {
      setPwError(e.message)
    } finally {
      setPwLoading(false)
    }
  }

  async function handleSignOut() {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fefefe 100%)',
      padding: '40px 20px',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '16px' }}
          >
            ← Back
          </button>
          <h1 style={{ color: NAVY, fontSize: '28px', fontWeight: '900', margin: 0 }}>Account Settings</h1>
        </div>

        {/* User Info */}
        <div style={card}>
          <p style={sectionTitle}>Profile</p>
          <p style={label}>Email address</p>
          <p style={value}>{user.email}</p>
        </div>

        {/* Subscription */}
        <div style={card}>
          <p style={sectionTitle}>Subscription</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isPro ? '20px' : '0' }}>
            <div>
              <p style={label}>Current plan</p>
              {isPro ? (
                <span style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${NAVY}, #2d5299)`,
                  color: 'white',
                  borderRadius: '50px',
                  padding: '3px 12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                }}>
                  ✦ Pro — {plan === 'annual' ? 'Annual' : 'Monthly'}
                </span>
              ) : (
                <span style={{
                  display: 'inline-block',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '50px',
                  padding: '3px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}>
                  Free
                </span>
              )}
            </div>
          </div>

          {isPro && renewalDate && (
            <div style={{ marginBottom: '20px' }}>
              <p style={label}>Next billing date</p>
              <p style={value}>{formatDate(renewalDate)}</p>
            </div>
          )}

          {!isPro && (
            <div style={{ marginTop: '16px' }}>
              <button
                style={btn('amber')}
                onClick={() => navigate('/signup')}
              >
                Upgrade to Pro →
              </button>
            </div>
          )}

          {isPro && !cancelDone && (
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              {!confirmCancel ? (
                <button
                  style={btn('danger')}
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel subscription
                </button>
              ) : (
                <div style={{ background: '#fff5f5', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#b91c1c', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                    Are you sure?
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                    Your Pro access will end immediately. This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={btn('danger')}
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                    >
                      {canceling ? 'Canceling…' : 'Yes, cancel'}
                    </button>
                    <button
                      style={btn('default')}
                      onClick={() => setConfirmCancel(false)}
                      disabled={canceling}
                    >
                      Keep Pro
                    </button>
                  </div>
                  {cancelError && (
                    <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '10px' }}>{cancelError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {cancelDone && (
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Your subscription has been canceled. You've been moved to the free plan.
              </p>
            </div>
          )}
        </div>

        {/* Security */}
        <div style={card}>
          <p style={sectionTitle}>Security</p>
          {!pwSent ? (
            <>
              <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                We'll send a password reset link to <strong>{user.email}</strong>.
              </p>
              <button
                style={btn('primary')}
                onClick={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading ? 'Sending…' : 'Send password reset email'}
              </button>
              {pwError && (
                <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '10px' }}>{pwError}</p>
              )}
            </>
          ) : (
            <p style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>
              ✓ Reset email sent! Check your inbox.
            </p>
          )}
        </div>

        {/* Sign Out */}
        <div style={card}>
          <p style={sectionTitle}>Session</p>
          <button
            style={btn('default')}
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

      </div>
    </div>
  )
}
