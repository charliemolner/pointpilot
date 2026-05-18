import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plane, Sparkles, CreditCard, Route, Trophy } from 'lucide-react'

const NAVY = '#1a3a6b'

// ── Boarding-pass illustration ─────────────────────────────

function CreditCardIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="15" rx="2.5" stroke={NAVY} strokeWidth="1.2" fill="white" />
      <rect x="0" y="4" width="22" height="3.5" fill={NAVY} opacity="0.15" />
      <rect x="2.5" y="10" width="7" height="2" rx="1" fill={NAVY} opacity="0.35" />
      <rect x="11.5" y="10" width="4" height="2" rx="1" fill={NAVY} opacity="0.2" />
    </svg>
  )
}

function Barcode() {
  const bars = [3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,2,3,1,2,4,3,1,2,3,1,4,2,1,3,2,4,1,3]
  let x = 0
  const rects = bars.map((w, i) => {
    const rect = { x, w, draw: i % 2 === 0 }
    x += w + 1
    return rect
  })
  const totalW = x
  return (
    <svg width="100%" height="36" viewBox={`0 0 ${totalW} 36`} preserveAspectRatio="none" aria-hidden="true">
      {rects.filter(r => r.draw).map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={36} fill={NAVY} opacity="0.55" />
      ))}
    </svg>
  )
}

function BoardingPass() {
  return (
    <div
      className="boarding-pass-float"
      style={{
        width: '300px',
        background: 'white',
        borderRadius: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        transform: 'rotate(6deg)',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '22px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CreditCardIcon />
          <span style={{ color: NAVY, fontSize: '12px', fontWeight: '600', letterSpacing: '0.01em', opacity: 0.75 }}>
            Chase Sapphire Preferred
          </span>
        </div>
        <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '18px' }} />
        <div style={{ color: NAVY, fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '10px' }}>
          JFK → NRT
        </div>
        <div style={{ color: NAVY, fontSize: '14px', fontWeight: '600', marginBottom: '5px', opacity: 0.8 }}>
          ANA Business Class
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: NAVY, fontSize: '14px', fontWeight: '700' }}>47,500 pts</span>
          <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: '700' }}>✓</span>
        </div>
        <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
          Est. value $4,200
        </div>
      </div>
      <div style={{ position: 'relative', margin: '0 -1px' }}>
        <div style={{ position: 'absolute', left: '-13px', top: '-13px', width: '26px', height: '26px', borderRadius: '50%', background: NAVY }} />
        <div style={{ position: 'absolute', right: '-13px', top: '-13px', width: '26px', height: '26px', borderRadius: '50%', background: NAVY }} />
        <div style={{ borderTop: '2px dashed #d1d5db', margin: '0 16px' }} />
      </div>
      <div style={{ padding: '18px 24px 20px' }}>
        <Barcode />
        <div style={{ color: '#9ca3af', fontSize: '10px', textAlign: 'center', marginTop: '6px', letterSpacing: '0.15em' }}>
          PP-2026-JFK-NRT-0042
        </div>
      </div>
    </div>
  )
}

// ── How it works steps ─────────────────────────────────────

const STEPS = [
  {
    icon: CreditCard,
    step: '01',
    title: 'Enter your card & balance',
    description: 'Tell us which rewards card you have and how many points or miles you\'ve earned.',
  },
  {
    icon: Route,
    step: '02',
    title: 'Choose your route',
    description: 'Search any origin and destination — domestic or international. We handle the routing.',
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Get your best redemption',
    description: 'We surface the highest-value transfer partner for your specific card and route — both luxury and budget options.',
  },
]

// ── Social proof stats ─────────────────────────────────────

const STATS = [
  { value: '20+', label: 'Transfer partners analyzed' },
  { value: '8.8¢', label: 'Best value per point found' },
  { value: '2 min', label: 'Average time to find a deal' },
]

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NAVY }}>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-8 md:px-12"
        style={{ height: '64px', flexShrink: 0 }}
      >
        <span className="text-white font-bold text-lg tracking-tight select-none">
          PointPilot™
        </span>

        {!(user && isPro) && (
          <Button
            variant="white-outline"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Log in
          </Button>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-section dot-bg">
        {/* Left: copy */}
        <div className="hero-left">

          <Badge variant="white-subtle" className="mb-6 gap-1.5">
            <Sparkles size={11} />
            Award travel made simple
          </Badge>

          <h1 className="text-white font-extrabold leading-[1.06] tracking-[-2px] mb-6"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)' }}>
            Simplify your journey.<br />
            We'll pilot your points.
          </h1>

          <p className="mb-8 leading-relaxed"
             style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', maxWidth: '500px' }}>
            Enter your card and points balance. Find the cheapest redemptions
            or the most luxurious upgrades — we'll show you both.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="white"
              size="lg"
              onClick={() => navigate('/search')}
            >
              <Plane size={17} />
              Pilot My Points
            </Button>
            <Button
              variant="white-outline"
              size="lg"
              onClick={() => navigate('/search')}
            >
              See an example →
            </Button>
          </div>

          {/* Mini stats row */}
          <div className="flex items-center gap-6 mt-10 flex-wrap">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-white font-bold text-xl tracking-tight">{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: boarding pass */}
        <div className="hero-right">
          <div style={{ marginRight: '60px' }}>
            <BoardingPass />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="bg-background py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <Badge variant="muted" className="mb-4 text-primary font-semibold">
              How it works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-tight">
              From card to cabin in three steps
            </h2>
            <p className="text-muted-foreground mt-3 text-base max-w-md mx-auto">
              No spreadsheets. No guesswork. Just the best redemption for your exact situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, step, title, description }) => (
              <Card key={step} className="relative overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${NAVY}12` }}
                    >
                      <Icon size={18} style={{ color: NAVY }} />
                    </div>
                    <span
                      className="text-4xl font-black leading-none"
                      style={{ color: `${NAVY}10` }}
                    >
                      {step}
                    </span>
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardDescription className="px-6 pb-6">{description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value prop band ───────────────────────────────── */}
      <section className="py-10 px-6" style={{ background: '#f0f4ff' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-primary font-bold text-lg text-center md:text-left">
            Supports Chase, Amex, Citi, Capital One, Bilt, United, Delta, American & more
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/search')}
          >
            Find my redemption →
          </Button>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────── */}
      <section
        className="dot-bg py-24 px-6 text-center flex flex-col items-center"
        style={{ background: NAVY }}
      >
        <Badge variant="white-subtle" className="mb-6 gap-1.5">
          <Sparkles size={11} />
          No account required to search
        </Badge>

        <h2
          className="text-white font-extrabold tracking-tight leading-tight mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          Your next adventure is already paid for.
        </h2>
        <p className="mb-10 font-semibold text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Find out how many points it actually costs.
        </p>
        <Button
          variant="white"
          size="xl"
          onClick={() => navigate('/search')}
        >
          <Plane size={19} />
          Pilot My Points
        </Button>
      </section>

    </div>
  )
}
