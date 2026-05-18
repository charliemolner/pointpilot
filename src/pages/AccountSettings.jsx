import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

// ── Shared styles ──────────────────────────────────────────
const sectionCard = {
  background: SURFACE,
  border: `1px solid ${BORDER_MID}`,
  borderRadius: '14px',
  padding: '22px 24px',
  marginBottom: '14px',
}

const sectionLabel = {
  fontSize: '11px', fontWeight: '600',
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: SUBTLE, marginBottom: '16px',
}

const fieldLabel = {
  fontSize: '11px', fontWeight: '500',
  color: SUBTLE, letterSpacing: '0.04em',
  textTransform: 'uppercase', marginBottom: '4px',
}

const fieldValue = {
  fontSize: '15px', fontWeight: '500',
  color: TEXT, letterSpacing: '-0.1px',
}

function formatDate(isoString) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Button variants ────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? ELEVATED : ACCENT,
        color: disabled ? MUTED : '#fff',
        border: `1px solid ${disabled ? BORDER_MID : 'transparent'}`,
        borderRadius: '999px',
        padding: '9px 20px',
        fontSize: '13px', fontWeight: '500',
        letterSpacing: '-0.1px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 0 0 1px rgba(99,102,241,0.4), 0 4px 16px ${GLOW}`,
        transition: 'background 0.15s, transform 0.12s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' }}}
    >
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        color: disabled ? SUBTLE : MUTED,
        border: `1px solid ${BORDER_MID}`,
        borderRadius: '999px',
        padding: '9px 20px',
        fontSize: '13px', fontWeight: '400',
        letterSpacing: '-0.1px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER_MID }}}
    >
      {children}
    </button>
  )
}

function DangerBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'rgba(248,113,113,0.08)',
        color: disabled ? SUBTLE : '#f87171',
        border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: '999px',
        padding: '9px 20px',
        fontSize: '13px', fontWeight: '500',
        letterSpacing: '-0.1px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(248,113,113,0.14)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)' }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)' }}}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────

export default function AccountSettings() {
  const { user, isPro, plan, logout, checkProStatus } = useAuth()
  const navigate = useNavigate()

  const [renewalDate, setRenewalDate]   = useState(null)
  const [canceling, setCanceling]       = useState(false)
  const [cancelDone, setCancelDone]     = useState(false)
  const [cancelError, setCancelError]   = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const [pwLoading, setPwLoading] = useState(false)
  const [pwSent, setPwSent]       = useState(false)
  const [pwError, setPwError]     = useState('')

  // Fetch renewal date on mount
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
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '52px',
        background: 'rgba(10,15,30,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none',
              color: MUTED, fontSize: '13px',
              fontWeight: '400', cursor: 'pointer',
              letterSpacing: '-0.1px', padding: '4px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            ← Back
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '36px 24px 64px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '24px', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            color: TEXT, marginBottom: '6px',
          }}>
            Account settings
          </h1>
          <p style={{ color: SUBTLE, fontSize: '14px', letterSpacing: '-0.1px' }}>
            Manage your profile, subscription, and security.
          </p>
        </div>

        {/* ── Profile ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}>Profile</p>
          <p style={fieldLabel}>Email address</p>
          <p style={fieldValue}>{user.email}</p>
        </div>

        {/* ── Subscription ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}>Subscription</p>

          <div style={{ marginBottom: isPro ? '20px' : '0' }}>
            <p style={fieldLabel}>Current plan</p>
            {isPro ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: ACCENT_LT,
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '13px', fontWeight: '500',
                letterSpacing: '-0.1px',
              }}>
                ✦ Pro · {plan === 'annual' ? 'Annual' : 'Monthly'}
              </span>
            ) : (
              <span style={{
                display: 'inline-block',
                background: ELEVATED,
                border: `1px solid ${BORDER_MID}`,
                color: MUTED,
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '13px', fontWeight: '400',
              }}>
                Free
              </span>
            )}
          </div>

          {isPro && renewalDate && (
            <div style={{ marginBottom: '20px' }}>
              <p style={fieldLabel}>Next billing date</p>
              <p style={fieldValue}>{formatDate(renewalDate)}</p>
            </div>
          )}

          {!isPro && (
            <div style={{ marginTop: '16px' }}>
              <PrimaryBtn onClick={() => navigate('/signup')}>
                Upgrade to Pro →
              </PrimaryBtn>
            </div>
          )}

          {isPro && !cancelDone && (
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px' }}>
              {!confirmCancel ? (
                <DangerBtn onClick={() => setConfirmCancel(true)}>
                  Cancel subscription
                </DangerBtn>
              ) : (
                <div style={{
                  background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.15)',
                  borderRadius: '12px', padding: '16px',
                }}>
                  <p style={{
                    color: '#f87171', fontWeight: '600',
                    fontSize: '14px', marginBottom: '6px',
                  }}>
                    Cancel your subscription?
                  </p>
                  <p style={{
                    color: MUTED, fontSize: '13px',
                    marginBottom: '16px', lineHeight: 1.55,
                  }}>
                    Your Pro access will end immediately. This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DangerBtn onClick={handleCancelSubscription} disabled={canceling}>
                      {canceling ? 'Canceling…' : 'Yes, cancel'}
                    </DangerBtn>
                    <GhostBtn onClick={() => setConfirmCancel(false)} disabled={canceling}>
                      Keep Pro
                    </GhostBtn>
                  </div>
                  {cancelError && (
                    <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>
                      {cancelError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {cancelDone && (
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '16px' }}>
              <p style={{ color: MUTED, fontSize: '14px', lineHeight: 1.6 }}>
                Your subscription has been canceled. You've been moved to the free plan.
              </p>
            </div>
          )}
        </div>

        {/* ── Security ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}>Security</p>
          {!pwSent ? (
            <>
              <p style={{
                color: MUTED, fontSize: '13px',
                marginBottom: '16px', lineHeight: 1.55,
              }}>
                We'll send a password reset link to{' '}
                <span style={{ color: TEXT, fontWeight: '500' }}>{user.email}</span>.
              </p>
              <PrimaryBtn onClick={handleChangePassword} disabled={pwLoading}>
                {pwLoading ? 'Sending…' : 'Send password reset email'}
              </PrimaryBtn>
              {pwError && (
                <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px' }}>
                  {pwError}
                </p>
              )}
            </>
          ) : (
            <p style={{
              color: '#4ade80', fontSize: '14px',
              fontWeight: '500', letterSpacing: '-0.1px',
            }}>
              ✓ Reset email sent. Check your inbox.
            </p>
          )}
        </div>

        {/* ── Session ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}>Session</p>
          <p style={{
            color: MUTED, fontSize: '13px',
            marginBottom: '16px', lineHeight: 1.55,
          }}>
            Signed in as <span style={{ color: TEXT, fontWeight: '500' }}>{user.email}</span>.
          </p>
          <GhostBtn onClick={handleSignOut}>
            Sign out
          </GhostBtn>
        </div>

      </main>
    </div>
  )
}
