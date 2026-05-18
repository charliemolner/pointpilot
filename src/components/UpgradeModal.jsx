import { useState } from 'react'

const NAVY  = '#1a3a6b'
const AMBER = '#f59e0b'

export default function UpgradeModal() {
  const [billing, setBilling] = useState('annual')

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(10, 18, 40, 0.97)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '40px 32px', maxWidth: '440px', width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>✈️</div>
        <h2 style={{ color: NAVY, fontSize: '22px', fontWeight: '800', lineHeight: 1.3, letterSpacing: '-0.4px', marginBottom: '12px' }}>
          You've used your 2 free searches today.
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
          Upgrade to PointPilot Pro for unlimited searches, specific date award availability, transfer bonus alerts, and a 12-month points earning plan.
        </p>

        {/* Pricing toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {/* Monthly */}
          <button
            onClick={() => setBilling('monthly')}
            style={{
              padding: '14px 10px', borderRadius: '12px', cursor: 'pointer',
              border: billing === 'monthly' ? `2px solid ${NAVY}` : '2px solid #e5e7eb',
              background: billing === 'monthly' ? NAVY : 'white',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ color: billing === 'monthly' ? 'white' : NAVY, fontSize: '13px', fontWeight: '700' }}>Monthly</div>
            <div style={{ color: billing === 'monthly' ? 'rgba(255,255,255,0.75)' : '#6b7280', fontSize: '12px', marginTop: '3px' }}>$10/month</div>
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
              onClick={() => setBilling('annual')}
              style={{
                width: '100%', padding: '14px 10px', borderRadius: '12px', cursor: 'pointer',
                border: billing === 'annual' ? `2px solid ${NAVY}` : '2px solid #e5e7eb',
                background: billing === 'annual' ? NAVY : 'white',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ color: billing === 'annual' ? 'white' : NAVY, fontSize: '13px', fontWeight: '700' }}>Annual</div>
              <div style={{ color: billing === 'annual' ? 'rgba(255,255,255,0.75)' : '#6b7280', fontSize: '12px', marginTop: '3px' }}>$8/month · $96/year</div>
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => { window.location.href = `/signup?plan=${billing}` }}
          style={{
            width: '100%', background: AMBER, color: '#1c1917',
            fontWeight: '800', fontSize: '16px', padding: '16px',
            borderRadius: '50px', border: 'none', cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
          }}
        >
          Get Pro Access
        </button>

        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '6px', lineHeight: 1.5 }}>
          or come back tomorrow for 2 more free searches
        </p>
        <p style={{ color: '#d1d5db', fontSize: '11px' }}>
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  )
}
