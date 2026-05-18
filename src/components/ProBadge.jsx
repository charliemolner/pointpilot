import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAVY = '#1a3a6b'
const AMBER = '#f59e0b'

export default function ProBadge() {
  const { user, isPro, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  return (
    <div ref={ref} style={{ position: 'fixed', top: '14px', right: '16px', zIndex: 500 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: isPro ? 'rgba(26,58,107,0.85)' : 'rgba(255,255,255,0.9)',
          border: isPro ? `1px solid ${AMBER}` : `1px solid rgba(26,58,107,0.3)`,
          borderRadius: '50px',
          padding: '5px 12px',
          color: isPro ? AMBER : NAVY,
          fontSize: '12px',
          fontWeight: '800',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isPro ? '✦ Pro' : '⊙ Account'}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '12px 16px', minWidth: '200px',
        }}>
          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px', lineHeight: 1.4 }}>
            Logged in as<br />
            <span style={{ color: NAVY, fontWeight: '700', wordBreak: 'break-all' }}>{user.email}</span>
          </p>
          <button
            onClick={() => { setOpen(false); navigate('/account') }}
            style={{
              width: '100%', background: '#f3f4f6', border: 'none',
              borderRadius: '8px', padding: '8px', color: NAVY,
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              marginBottom: '6px',
            }}
          >
            Account settings
          </button>
          <button
            onClick={async () => { await logout(); setOpen(false); navigate('/') }}
            style={{
              width: '100%', background: '#f3f4f6', border: 'none',
              borderRadius: '8px', padding: '8px', color: '#6b7280',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
