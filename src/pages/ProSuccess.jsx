import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAVY = '#1a3a6b'
const AMBER = '#f59e0b'

export default function ProSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    // The Supabase user was already created at account-creation time.
    // Confirm session exists (user may need to sign in if session wasn't persisted).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Session not found — user can still see the success page; they'll log in separately.
        console.log('[ProSuccess] No active session found. User can log in at /login.')
      }
    })
  }, [])

  return (
    <div style={{
      backgroundColor: NAVY,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 36px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '20px' }}>✈️</div>
        <h1 style={{ color: NAVY, fontSize: '22px', fontWeight: '800', lineHeight: 1.3, letterSpacing: '-0.3px', marginBottom: '12px' }}>
          You're a PointPilot Pro member.
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.65, marginBottom: '32px' }}>
          Unlimited searches are now unlocked. Go find your next redemption.
        </p>
        <button
          onClick={() => navigate('/search')}
          style={{
            background: AMBER,
            color: '#1c1917',
            fontWeight: '800',
            fontSize: '16px',
            padding: '16px 32px',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
          }}
        >
          Start Searching
        </button>
      </div>
    </div>
  )
}
