import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'

// ── Design tokens ────────────────────────────────────────────
const NAV    = '#0a0f1e'
const LINE   = 'rgba(255,255,255,0.08)'
const LINE_S = 'rgba(255,255,255,0.14)'
const V500   = '#6366f1'
const V400   = '#818cf8'
const V300   = '#a5b4fc'
const FG     = '#f4f4fb'
const FG_S   = 'rgba(244,244,251,0.72)'
const FG_M   = 'rgba(244,244,251,0.46)'
const FG_F   = 'rgba(244,244,251,0.28)'
const ELEVATED = '#141d35'
const SURFACE  = '#0f1629'
const BORDER   = 'rgba(255,255,255,0.07)'
const BORDER_M = 'rgba(255,255,255,0.11)'
const AMBER    = '#f59e0b'

// ── Typography helpers ───────────────────────────────────────
const SERIF = { fontFamily: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif", fontWeight: 400 }
const MONO  = { fontFamily: "'JetBrains Mono', ui-monospace, monospace", letterSpacing: 0 }

// ── Foil card art definitions ────────────────────────────────
const CARD_ART = {
  gold: {
    background: 'linear-gradient(135deg, #4a3a1f 0%, #c9a253 40%, #f3d98a 55%, #a47829 75%, #2a1d0a 100%)',
    overlay:    'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)',
  },
  platinum: {
    background: 'linear-gradient(135deg, #2a2e36 0%, #8a92a0 35%, #d8dde5 50%, #6b7280 70%, #1a1d22 100%)',
    overlay:    'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)',
  },
  'sapphire-preferred': {
    background: 'linear-gradient(140deg, #0a1a3f 0%, #1b3a8a 45%, #4f6bd8 60%, #0c1530 100%)',
    overlay:    'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.18), transparent 55%)',
  },
  'sapphire-reserve': {
    background: 'linear-gradient(135deg, #050a1a 0%, #0e1c3d 40%, #2a3a6a 55%, #07112a 100%)',
    overlay:    'linear-gradient(120deg, transparent 30%, rgba(180,200,255,0.22) 50%, transparent 65%)',
  },
  venture: {
    background: 'linear-gradient(135deg, #0a1f1a 0%, #1f4a3a 45%, #3e7a5e 60%, #0c1d18 100%)',
    overlay:    'repeating-radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)',
  },
  strata: {
    background: 'linear-gradient(140deg, #08122a 0%, #1a2960 45%, #3a4ea0 60%, #0a1432 100%)',
    overlay:    'radial-gradient(circle at 90% 110%, rgba(180,150,255,0.28), transparent 50%)',
  },
  bilt: {
    background: 'linear-gradient(135deg, #1a1008 0%, #3d2510 45%, #6b3d18 60%, #1a0e04 100%)',
    overlay:    'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
  },
}

// ── Card display metadata ────────────────────────────────────
const CARD_META = {
  'amex-gold':     { tier: 'gold',              cpp: 2.0,  top: '4× Dining'  },
  'amex-platinum': { tier: 'platinum',           cpp: 2.0,  top: '5× Flights' },
  'csp':           { tier: 'sapphire-preferred', cpp: 2.05, top: '3× Dining'  },
  'csr':           { tier: 'sapphire-reserve',   cpp: 2.05, top: '3× Travel'  },
  'c1vx':          { tier: 'venture',            cpp: 1.7,  top: '2× All'     },
  'citi-strata':   { tier: 'strata',             cpp: 1.75, top: '3× Travel'  },
  'bilt':          { tier: 'bilt',               cpp: 2.05, top: '2× Travel'  },
}

// ── Foil card art component ──────────────────────────────────
function CardArt({ tier }) {
  const art = CARD_ART[tier] || CARD_ART.platinum
  return (
    <div style={{
      position: 'relative', width: 44, height: 28, borderRadius: 4,
      background: art.background, overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 4px 10px rgba(0,0,0,0.5)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: art.overlay, mixBlendMode: 'screen', opacity: 0.9 }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
        opacity: 0.6,
      }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CARD DATABASE  (logic unchanged)
// ─────────────────────────────────────────────────────────────

const ALL_CARDS = [
  { id: 'amex-gold',            name: 'Amex Gold',                            type: 1, issuer: 'American Express', program: 'Membership Rewards'  },
  { id: 'amex-platinum',        name: 'Amex Platinum',                         type: 1, issuer: 'American Express', program: 'Membership Rewards'  },
  { id: 'amex-green',           name: 'Amex Green',                            type: 1, issuer: 'American Express', program: 'Membership Rewards'  },
  { id: 'csp',                  name: 'Chase Sapphire Preferred',               type: 1, issuer: 'Chase',            program: 'Ultimate Rewards'    },
  { id: 'csr',                  name: 'Chase Sapphire Reserve',                type: 1, issuer: 'Chase',            program: 'Ultimate Rewards'    },
  { id: 'c1vx',                 name: 'Capital One Venture X',                 type: 1, issuer: 'Capital One',      program: 'Capital One Miles'   },
  { id: 'c1v',                  name: 'Capital One Venture',                   type: 1, issuer: 'Capital One',      program: 'Capital One Miles'   },
  { id: 'citi-strata',          name: 'Citi Strata Premier',                   type: 1, issuer: 'Citi',             program: 'ThankYou Points'     },
  { id: 'bilt',                 name: 'Bilt Mastercard',                       type: 1, issuer: 'Bilt Rewards',     program: 'Bilt Points'         },
  { id: 'wf-autograph-journey', name: 'Wells Fargo Autograph Journey',          type: 1, issuer: 'Wells Fargo',     program: 'Wells Fargo Rewards' },
  { id: 'cfu',              name: 'Chase Freedom Unlimited',    type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: "Unlock 14+ airline and hotel transfer partners and multiply the value of every point you've already earned."     },
  { id: 'cff',              name: 'Chase Freedom Flex',         type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: 'Pool your Freedom Flex points and access United, Hyatt, and 12+ other partners for outsized redemption value.'    },
  { id: 'cf',               name: 'Chase Freedom',              type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: 'Combine balances and transfer to 14+ airline and hotel loyalty programs instantly.'                               },
  { id: 'c1-savor',         name: 'Capital One Savor',          type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: 'Transfer to 15+ airlines including Air Canada, Turkish, and Avianca for exceptional redemption value.'             },
  { id: 'c1-savorone',      name: 'Capital One SavorOne',       type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: "Unlock global airline transfers and premium redemption rates on every point you've already earned."               },
  { id: 'c1-quicksilver',   name: 'Capital One Quicksilver',    type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: "Access 15+ transfer partners and dramatically increase your points' value with the Venture X."                   },
  { id: 'c1-qso',           name: 'Capital One QuicksilverOne', type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: 'Combine with Venture X for full transfer partner access across 15+ airlines and hotels.'                          },
  { id: 'citi-dc',          name: 'Citi Double Cash',           type: 2, issuer: 'Citi',             companion: 'Citi Strata Premier',            companionBenefit: 'Unlock ThankYou transfer partners like Air France, Turkish, and Singapore Airlines for premium flight value.'     },
  { id: 'citi-cc',          name: 'Citi Custom Cash',           type: 2, issuer: 'Citi',             companion: 'Citi Strata Premier',            companionBenefit: 'Pool points with Strata Premier and access 15+ airline transfer partners for premium redemptions.'                },
  { id: 'citi-rewards-plus',name: 'Citi Rewards+',              type: 2, issuer: 'Citi',             companion: 'Citi Strata Premier',            companionBenefit: 'Combine with Strata Premier to unlock ThankYou airline partners and maximize every point.'                       },
  { id: 'amex-bce',         name: 'Amex Blue Cash Everyday',   type: 2, issuer: 'American Express', companion: 'Amex Gold',                     companionBenefit: 'Pair with Amex Gold to access 20+ partners including Delta, Air France, and ANA for flight redemptions.'          },
  { id: 'amex-bcp',         name: 'Amex Blue Cash Preferred',  type: 2, issuer: 'American Express', companion: 'Amex Gold',                     companionBenefit: 'Unlock 20+ Membership Rewards transfer partners and dramatically increase your flight redemption value.'          },
  { id: 'amex-cash-magnet', name: 'Amex Cash Magnet',          type: 2, issuer: 'American Express', companion: 'Amex Gold',                     companionBenefit: 'Convert your earnings into transferable Membership Rewards across 20+ airline and hotel partners.'               },
  { id: 'wf-active-cash',   name: 'Wells Fargo Active Cash',   type: 2, issuer: 'Wells Fargo',      companion: 'Wells Fargo Autograph Journey',  companionBenefit: 'Pair with Autograph Journey to access airline transfer partners and unlock full flight redemption value.'         },
  { id: 'wf-autograph',     name: 'Wells Fargo Autograph',     type: 2, issuer: 'Wells Fargo',      companion: 'Wells Fargo Autograph Journey',  companionBenefit: 'Combine for full airline transfer access and premium redemption options across multiple partners.'               },
  { id: 'discover-cb',      name: 'Discover it Cash Back',                  type: 3, issuer: 'Discover'              },
  { id: 'discover-chrome',  name: 'Discover it Chrome',                     type: 3, issuer: 'Discover'              },
  { id: 'discover-secured', name: 'Discover it Secured',                    type: 3, issuer: 'Discover'              },
  { id: 'boa-cash',         name: 'Bank of America Cash Rewards',           type: 3, issuer: 'Bank of America'       },
  { id: 'boa-unlimited',    name: 'Bank of America Unlimited Cash Rewards', type: 3, issuer: 'Bank of America'       },
  { id: 'apple-card',       name: 'Apple Card',                             type: 3, issuer: 'Apple / Goldman Sachs' },
  { id: 'paypal-cashback',  name: 'PayPal Cashback Mastercard',             type: 3, issuer: 'PayPal / Synchrony'   },
  { id: 'usbank-cash',      name: 'US Bank Cash+',                          type: 3, issuer: 'US Bank'              },
  { id: 'usbank-altitude',  name: 'US Bank Altitude Go',                    type: 3, issuer: 'US Bank'              },
  { id: 'united-explorer', name: 'United Explorer Card',            type: 4, issuer: 'Chase / United',        airline: 'United Airlines',    miles: 'United MileagePlus'  },
  { id: 'united-quest',    name: 'United Quest Card',               type: 4, issuer: 'Chase / United',        airline: 'United Airlines',    miles: 'United MileagePlus'  },
  { id: 'united-club',     name: 'United Club Infinite Card',       type: 4, issuer: 'Chase / United',        airline: 'United Airlines',    miles: 'United MileagePlus'  },
  { id: 'united-gateway',  name: 'United Gateway Card',             type: 4, issuer: 'Chase / United',        airline: 'United Airlines',    miles: 'United MileagePlus'  },
  { id: 'delta-gold',      name: 'Delta SkyMiles Gold Amex',        type: 4, issuer: 'Amex / Delta',          airline: 'Delta Air Lines',    miles: 'Delta SkyMiles'      },
  { id: 'delta-platinum',  name: 'Delta SkyMiles Platinum Amex',    type: 4, issuer: 'Amex / Delta',          airline: 'Delta Air Lines',    miles: 'Delta SkyMiles'      },
  { id: 'delta-reserve',   name: 'Delta SkyMiles Reserve Amex',     type: 4, issuer: 'Amex / Delta',          airline: 'Delta Air Lines',    miles: 'Delta SkyMiles'      },
  { id: 'delta-blue',      name: 'Delta SkyMiles Blue Amex',        type: 4, issuer: 'Amex / Delta',          airline: 'Delta Air Lines',    miles: 'Delta SkyMiles'      },
  { id: 'citi-aa-plat',    name: 'Citi AAdvantage Platinum Select', type: 4, issuer: 'Citi / AA',             airline: 'American Airlines',  miles: 'AAdvantage Miles'    },
  { id: 'citi-aa-mileup',  name: 'Citi AAdvantage MileUp',          type: 4, issuer: 'Citi / AA',             airline: 'American Airlines',  miles: 'AAdvantage Miles'    },
  { id: 'barclays-aa',     name: 'Barclays AAdvantage Aviator Red', type: 4, issuer: 'Barclays / AA',         airline: 'American Airlines',  miles: 'AAdvantage Miles'    },
  { id: 'sw-plus',         name: 'Southwest Rapid Rewards Plus',    type: 4, issuer: 'Chase / Southwest',     airline: 'Southwest Airlines', miles: 'Rapid Rewards'       },
  { id: 'sw-premier',      name: 'Southwest Rapid Rewards Premier', type: 4, issuer: 'Chase / Southwest',     airline: 'Southwest Airlines', miles: 'Rapid Rewards'       },
  { id: 'sw-priority',     name: 'Southwest Rapid Rewards Priority',type: 4, issuer: 'Chase / Southwest',     airline: 'Southwest Airlines', miles: 'Rapid Rewards'       },
  { id: 'alaska-visa',     name: 'Alaska Airlines Visa Signature',  type: 4, issuer: 'BofA / Alaska',         airline: 'Alaska Airlines',    miles: 'Alaska Mileage Plan' },
  { id: 'jetblue-plus',    name: 'JetBlue Plus Card',               type: 4, issuer: 'Barclays / JetBlue',    airline: 'JetBlue',            miles: 'TrueBlue Points'     },
  { id: 'jetblue',         name: 'JetBlue Card',                    type: 4, issuer: 'Barclays / JetBlue',    airline: 'JetBlue',            miles: 'TrueBlue Points'     },
  { id: 'marriott-boundless', name: 'Marriott Bonvoy Boundless',           type: 5, issuer: 'Chase / Marriott',     hotel: 'Marriott Bonvoy'   },
  { id: 'marriott-bold',      name: 'Marriott Bonvoy Bold',                type: 5, issuer: 'Chase / Marriott',     hotel: 'Marriott Bonvoy'   },
  { id: 'marriott-brilliant', name: 'Marriott Bonvoy Brilliant Amex',      type: 5, issuer: 'Amex / Marriott',      hotel: 'Marriott Bonvoy'   },
  { id: 'hilton-honors',      name: 'Hilton Honors Amex',                  type: 5, issuer: 'Amex / Hilton',        hotel: 'Hilton Honors'     },
  { id: 'hilton-surpass',     name: 'Hilton Honors Amex Surpass',          type: 5, issuer: 'Amex / Hilton',        hotel: 'Hilton Honors'     },
  { id: 'hilton-aspire',      name: 'Hilton Honors Amex Aspire',           type: 5, issuer: 'Amex / Hilton',        hotel: 'Hilton Honors'     },
  { id: 'hyatt',              name: 'World of Hyatt Credit Card',          type: 5, issuer: 'Chase / Hyatt',        hotel: 'World of Hyatt'    },
  { id: 'ihg-premier',        name: 'IHG One Rewards Premier',             type: 5, issuer: 'Chase / IHG',          hotel: 'IHG One Rewards'   },
  { id: 'wyndham',            name: 'Wyndham Rewards Earner',              type: 5, issuer: 'Barclays / Wyndham',   hotel: 'Wyndham Rewards'   },
  { id: 'choice',             name: 'Choice Privileges Select Mastercard', type: 5, issuer: 'Wells Fargo / Choice', hotel: 'Choice Privileges' },
]

const GRID_CARDS = ALL_CARDS.filter(c =>
  ['amex-gold','csp','csr','c1vx','citi-strata','amex-platinum','bilt'].includes(c.id)
)

// ─────────────────────────────────────────────────────────────
// HELPERS  (logic unchanged)
// ─────────────────────────────────────────────────────────────

function fuzzySearch(query) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const words = q.split(/\s+/).filter(w => w.length >= 2)
  return ALL_CARDS.filter(card => {
    const hay = `${card.name} ${card.issuer || ''}`.toLowerCase()
    if (hay.includes(q)) return true
    if (words.length > 1 && words.every(w => hay.includes(w))) return true
    return words.some(w => w.length >= 3 && hay.includes(w))
  }).slice(0, 8)
}

function getRecommendation(card, score) {
  const highCredit = score === 'excellent' || score === 'good'
  const builderPrefix = "We'd recommend building toward 700 before applying for a premium travel card. A hard inquiry now risks denial without guaranteed approval.\n\nIn the meantime, here's a card that rewards you while you build:"
  if (card.type === 2) {
    if (highCredit) return { kind: 'companion', name: card.companion, benefit: card.companionBenefit }
    if (score === 'fair') return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                       { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  if (card.type === 3) {
    if (highCredit) return { kind: 'companion', name: 'Chase Sapphire Preferred', benefit: 'Transfer to 14+ airline and hotel partners, the most versatile travel card for maximizing flight value.' }
    if (score === 'fair') return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                       { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  if (card.type === 5) {
    if (highCredit) return { kind: 'companion', name: 'Chase Sapphire Preferred', benefit: 'Access 14+ airline transfer partners for flights, the right tool to get full value out of your travel spend.' }
    if (score === 'fair') return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                       { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  return null
}

const AFFILIATE_LINKS = {
  'Chase Sapphire Preferred':      'AFFILIATE_LINK_CHASE_SAPPHIRE_PREFERRED',
  'Capital One Venture X':         'AFFILIATE_LINK_CAPITAL_ONE_VENTURE_X',
  'Citi Strata Premier':           'AFFILIATE_LINK_CITI_STRATA_PREMIER',
  'Amex Gold':                     'AFFILIATE_LINK_AMEX_GOLD',
  'Wells Fargo Autograph Journey': 'AFFILIATE_LINK_WELLS_FARGO_AUTOGRAPH_JOURNEY',
  'Capital One QuicksilverOne':    'AFFILIATE_LINK_CAPITAL_ONE_QUICKSILVERONE',
  'Discover it Secured':           'AFFILIATE_LINK_DISCOVER_IT_SECURED',
}

function formatWithCommas(raw) {
  const digits = raw.replace(/\D/g, '')
  return digits ? parseInt(digits, 10).toLocaleString() : ''
}

// ─────────────────────────────────────────────────────────────
// AIRPORT DATABASE  (unchanged)
// ─────────────────────────────────────────────────────────────

const AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
  { code: 'MDW', name: 'Midway International', city: 'Chicago', country: 'USA' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
  { code: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'USA' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
  { code: 'ATL', name: 'Hartsfield-Jackson International', city: 'Atlanta', country: 'USA' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', country: 'USA' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington', country: 'USA' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'USA' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'USA' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'UK' },
  { code: 'STN', name: 'Stansted Airport', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'FCO', name: 'Leonardo da Vinci International', city: 'Rome', country: 'Italy' },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'BCN', name: 'El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
  { code: 'JNB', name: 'OR Tambo International', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montreal-Trudeau International', city: 'Montreal', country: 'Canada' },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico' },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
  { code: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brazil' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile' },
]

const METRO_ALIASES = {
  nyc: ['JFK', 'LGA', 'EWR'],
  lon: ['LHR', 'LGW', 'STN'],
  tyo: ['NRT', 'HND'],
  par: ['CDG', 'ORY'],
  chi: ['ORD', 'MDW'],
  wdc: ['IAD', 'DCA', 'BWI'],
  bwi: ['IAD', 'DCA', 'BWI'],
}

function searchAirports(query) {
  if (!query.trim() || query.length < 1) return []
  const q = query.toLowerCase().trim()
  const alias = METRO_ALIASES[q]
  if (alias) return AIRPORTS.filter(a => alias.includes(a.code))
  return AIRPORTS.filter(a => {
    const hay = `${a.code} ${a.name} ${a.city} ${a.country}`.toLowerCase()
    return hay.includes(q)
  }).slice(0, 5)
}

// ─────────────────────────────────────────────────────────────
// TYPE BADGE STYLES  (for search dropdown)
// ─────────────────────────────────────────────────────────────

const TYPE_BADGE = {
  1: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  2: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  3: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  4: { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa' },
  5: { bg: 'rgba(192,132,252,0.12)', color: '#c084fc' },
}
const TYPE_LABEL = { 1: 'Transferable', 2: 'Ecosystem', 3: 'Cash Back', 4: 'Airline', 5: 'Hotel' }

// ─────────────────────────────────────────────────────────────
// SHARED EDITORIAL PRIMITIVES
// ─────────────────────────────────────────────────────────────

// Italic word highlighting in card names
function CardNameDisplay({ name }) {
  const italicWords = ['Gold', 'Platinum', 'Sapphire', 'Venture', 'Strata', 'Bilt']
  for (const word of italicWords) {
    if (name.includes(word)) {
      const parts = name.split(word)
      return (
        <>
          {parts[0]}
          <em style={{ fontStyle: 'italic', color: V300, fontWeight: 400 }}>{word}</em>
          {parts[1]}
        </>
      )
    }
  }
  return <>{name}</>
}

function Kicker({ step, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 24, height: 1, background: V400 }} />
      <span style={{
        ...MONO, fontSize: 10, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: V400,
      }}>
        Step {step} · {label}
      </span>
    </div>
  )
}

function StepHeadline({ children }) {
  return (
    <h2 style={{
      ...SERIF,
      fontSize: 'clamp(32px, 5vw, 44px)',
      lineHeight: 0.97,
      margin: '0 0 22px',
      letterSpacing: '-0.025em',
      color: FG,
    }}>
      {children}
    </h2>
  )
}

// Shared dropdown shell
const dropdownShell = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0, right: 0,
  background: SURFACE,
  borderRadius: 12,
  border: `1px solid ${BORDER_M}`,
  boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
  zIndex: 200,
  overflow: 'hidden',
}

// Primary action button
function PilotButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 28px', borderRadius: 999, fontSize: 15,
        fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none', fontFamily: 'inherit',
        background: disabled
          ? 'rgba(99,102,241,0.15)'
          : 'linear-gradient(180deg, #7c7fff, #5558e6)',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
        boxShadow: disabled ? 'none' : '0 8px 28px -4px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 14px 34px -4px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.3)' } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.25)' } }}
    >
      {children}
    </button>
  )
}

function AmberButton({ children, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        background: AMBER, color: '#1c1917',
        fontWeight: 700, fontSize: 14,
        padding: '12px 28px', borderRadius: 999,
        textDecoration: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// AIRPORT INPUT
// ─────────────────────────────────────────────────────────────

function AirportInput({ placeholder, onSelect, resetKey }) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => { setQuery(''); setResults([]); setShowDrop(false) }, [resetKey])

  useEffect(() => {
    const handler = e => { if (containerRef.current && !containerRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = e => {
    const val = e.target.value
    setQuery(val); onSelect(null)
    const r = searchAirports(val)
    setResults(r); setShowDrop(r.length > 0 && val.trim().length > 0)
  }

  const handleSelect = airport => {
    setQuery(`${airport.code} - ${airport.city}`)
    onSelect(airport); setShowDrop(false); setResults([])
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        style={{
          width: '100%', background: ELEVATED, color: FG,
          fontSize: 15, padding: '13px 16px', borderRadius: 10,
          border: `1px solid ${BORDER_M}`, outline: 'none',
          fontFamily: 'inherit', transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; if (results.length > 0) setShowDrop(true) }}
        onBlur={e => { e.target.style.borderColor = BORDER_M }}
      />
      {showDrop && (
        <div style={dropdownShell}>
          {results.map((a, i) => (
            <button
              key={a.code}
              onMouseDown={e => { e.preventDefault(); handleSelect(a) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', background: 'none', border: 'none',
                borderBottom: i < results.length - 1 ? `1px solid ${BORDER}` : 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: V400, fontWeight: 700, fontSize: 13 }}>{a.code}</span>
              <span style={{ color: FG_M, fontSize: 13 }}> · {a.name}, {a.city}, {a.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DETECTION PANEL
// ─────────────────────────────────────────────────────────────

function DetectionPanel({ card, onContinueAnyway, panelRef, onStep2Open }) {
  const [creditScore, setCreditScore] = useState(null)

  const handleScore = score => { setCreditScore(score); setTimeout(() => onStep2Open(), 120) }
  const rec = creditScore ? getRecommendation(card, creditScore) : null

  const scoreButtons = [
    { key: 'excellent', label: 'Excellent', sub: '750+' },
    { key: 'good',      label: 'Good',      sub: '700-749' },
    { key: 'fair',      label: 'Fair',      sub: '650-699' },
    { key: 'building',  label: 'Building',  sub: '<650' },
  ]

  return (
    <div
      ref={panelRef}
      className="step-reveal"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))',
        border: `1px solid ${LINE}`,
        borderRadius: 16, padding: '24px 28px', marginTop: 40,
      }}
    >
      <p style={{
        ...MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: card.type === 4 ? V300 : AMBER, marginBottom: 14,
      }}>
        {card.type === 4 ? 'Great news' : 'Heads up'}
      </p>

      {card.type === 2 && (
        <>
          <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, marginBottom: 14 }}>
            The <strong>{card.name}</strong> earns cash back that can't be transferred to airline partners on its own.
          </p>
          <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, marginBottom: 8, fontWeight: 600 }}>
            But here's something most people don't know:
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>
            Pair it with a <strong style={{ color: FG }}>{card.companion}</strong> and every point you've already earned instantly combines, fully transferable to airline partners.
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>
            Your points don't disappear. They level up.
          </p>
        </>
      )}
      {card.type === 3 && (
        <>
          <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, marginBottom: 14 }}>
            The <strong>{card.name}</strong> earns pure cash back with no airline transfer partners.
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
            The good news: adding a travel rewards card lets you start earning transferable points immediately, and you keep using your <strong style={{ color: FG }}>{card.name}</strong> for cash back on top of it.
          </p>
        </>
      )}
      {card.type === 4 && (
        <>
          <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>
            Your <strong>{card.name}</strong> earns <strong>{card.airline}</strong> miles directly. No transfer needed.
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65 }}>
            We'll show you the best ways to redeem your miles for maximum value.
          </p>
        </>
      )}
      {card.type === 5 && (
        <>
          <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, marginBottom: 14 }}>
            Your <strong>{card.name}</strong> earns <strong>{card.hotel}</strong> points, primarily designed for hotel stays rather than flights.
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>
            While some hotel points can transfer to airlines, the conversion rates are usually poor.
          </p>
          <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
            For flights, a dedicated travel card will get you much further.
          </p>
        </>
      )}

      {(card.type === 2 || card.type === 3 || card.type === 5) && !creditScore && (
        <>
          <p style={{ ...MONO, fontSize: 10, color: FG_M, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Roughly where is your credit score?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 4 }}>
            {scoreButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => handleScore(btn.key)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${LINE}`,
                  borderRadius: 10, padding: '11px 14px', cursor: 'pointer',
                  color: FG, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = LINE }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{btn.label}</div>
                <div style={{ color: FG_M, fontSize: 12, marginTop: 2 }}>{btn.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {rec && (
        <div className="step-reveal" style={{ marginTop: 4, paddingTop: 18, borderTop: `1px solid ${LINE}` }}>
          {rec.kind === 'companion' && (
            <>
              <p style={{ color: FG, fontSize: 15, lineHeight: 1.65, fontWeight: 600, marginBottom: 8 }}>
                Great news! You likely qualify for the <span style={{ color: V300 }}>{rec.name}</span>. Here's why it's the right move:
              </p>
              <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 18 }}>{rec.benefit}</p>
              <p style={{ color: FG, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Want to unlock your points?</p>
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
          {rec.kind === 'starter' && (
            <>
              <p style={{ color: FG_S, fontSize: 15, lineHeight: 1.65, marginBottom: 18, whiteSpace: 'pre-line' }}>{rec.prefix}</p>
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
        <button
          onClick={onContinueAnyway}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: FG_M, fontSize: 13, fontFamily: 'inherit',
            padding: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = FG_S }}
          onMouseLeave={e => { e.currentTarget.style.color = FG_M }}
        >
          Continue anyway →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function Search() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  const [selectedCard,    setSelectedCard]    = useState(null)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [searchResults,   setSearchResults]   = useState([])
  const [showDropdown,    setShowDropdown]    = useState(false)
  const [showDetection,   setShowDetection]   = useState(false)
  const [showStep2,       setShowStep2]       = useState(false)
  const [points,          setPoints]          = useState('')
  const [showStep3,       setShowStep3]       = useState(false)
  const [fromAirport,     setFromAirport]     = useState(null)
  const [toAirport,       setToAirport]       = useState(null)
  const [airportResetKey, setAirportResetKey] = useState(0)
  const [showUpgradeModal,setShowUpgradeModal]= useState(false)

  const detectionRef = useRef(null)
  const step2Ref     = useRef(null)
  const step3Ref     = useRef(null)

  const scrollTo = ref => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)

  const selectCard = card => {
    setSelectedCard(card)
    setSearchQuery(card.type !== 1 || !GRID_CARDS.find(c => c.id === card.id) ? card.name : searchQuery)
    setShowDropdown(false)
    setShowDetection(false); setShowStep2(false); setShowStep3(false)
    setPoints(''); setFromAirport(null); setToAirport(null)
    setAirportResetKey(k => k + 1)
    if (card.type === 1) { setShowStep2(true); scrollTo(step2Ref) }
    else { setShowDetection(true); if (card.type === 4) setShowStep2(true); scrollTo(detectionRef) }
  }

  const openStep2 = () => { setShowStep2(true); scrollTo(step2Ref) }

  const handleSearch = value => {
    setSearchQuery(value)
    const results = fuzzySearch(value)
    setSearchResults(results)
    setShowDropdown(results.length > 0 && value.trim().length > 0)
  }

  const handleContinue = () => {
    if (!points.replace(/\D/g, '')) return
    setShowStep3(true); scrollTo(step3Ref)
  }

  const canContinue = points.replace(/\D/g, '').length > 0
  const canSearch   = fromAirport !== null && toAirport !== null

  return (
    <div style={{
      background: `
        radial-gradient(900px 600px at 80% -10%, rgba(99,102,241,0.18), transparent 55%),
        radial-gradient(600px 400px at -10% 40%, rgba(130,100,255,0.10), transparent 60%),
        #0a0f1e
      `,
      minHeight: '100vh', color: FG,
      fontFamily: "'Inter', system-ui, sans-serif",
      letterSpacing: '-0.01em',
    }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 52,
        background: 'rgba(10,15,30,0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${LINE}`,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 760, margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span
            onClick={() => navigate('/')}
            style={{
              ...SERIF, fontSize: 20, color: FG,
              cursor: 'pointer', userSelect: 'none',
            }}
          >
            Point<em style={{ fontStyle: 'italic', color: V300 }}>Pilot</em>
          </span>

          {isPro ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px 4px 8px',
              border: '1px solid rgba(165,180,252,0.35)',
              borderRadius: 999,
              ...MONO, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: V300, background: 'rgba(99,102,241,0.08)',
            }}>
              <span style={{ color: V400, fontSize: 10 }}>✦</span> Pro
            </span>
          ) : (
            <button
              onClick={() => navigate('/signup')}
              style={{
                ...MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: V400, background: 'none', border: `1px solid rgba(129,140,248,0.3)`,
                borderRadius: 999, padding: '5px 12px', cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.6)'; e.currentTarget.style.color = V300 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; e.currentTarget.style.color = V400 }}
            >
              Get Pro ✦
            </button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ── STEP 1 ── */}
        <section>
          {/* Masthead metadata */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingBottom: 20, marginBottom: 32,
            borderBottom: `1px solid ${LINE}`,
            ...MONO, fontSize: 9.5, letterSpacing: '0.18em',
            color: FG_M, textTransform: 'uppercase',
          }}>
            <span>May · 2026</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Card Search</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>PointPilot</span>
          </div>

          <Kicker step="01" label="Choose a card" />
          <StepHeadline>
            What card<br />
            <em style={{ fontStyle: 'italic', color: V300 }}>are you using</em><br />
            today?
          </StepHeadline>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: FG_M, maxWidth: 420, marginBottom: 28 }}>
            Select your card below, or search all cards to find yours.
          </p>

          {/* Search field */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)' }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = LINE }}
            >
              <span style={{ fontSize: 18, color: FG_M, lineHeight: 1 }}>⌕</span>
              <input
                type="text"
                placeholder="Search all cards…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 0, outline: 0,
                  color: FG, fontFamily: 'inherit', fontSize: 14,
                }}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              />
              <span style={{
                ...MONO, fontSize: 10, letterSpacing: '0.1em',
                color: FG_F, padding: '3px 7px',
                border: `1px solid ${LINE}`, borderRadius: 4,
              }}>
                ⌘ K
              </span>
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div style={dropdownShell}>
                {searchResults.map((card, i) => {
                  const badge = TYPE_BADGE[card.type] || TYPE_BADGE[1]
                  return (
                    <div
                      key={card.id}
                      onMouseDown={() => selectCard(card)}
                      style={{
                        padding: '11px 16px', cursor: 'pointer',
                        borderBottom: i < searchResults.length - 1 ? `1px solid ${BORDER}` : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                    >
                      <div>
                        <div style={{ color: FG, fontSize: 13, fontWeight: 600 }}>{card.name}</div>
                        <div style={{ color: FG_M, fontSize: 12, marginTop: 1 }}>
                          {card.program || card.miles || card.hotel || card.issuer}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 9px',
                        borderRadius: 999, background: badge.bg, color: badge.color,
                        whiteSpace: 'nowrap', marginLeft: 10, ...MONO, letterSpacing: '0.06em',
                      }}>
                        {TYPE_LABEL[card.type]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Numbered card list header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 10, borderBottom: `1px solid ${LINE}`, marginBottom: 0,
          }}>
            <span style={{ ...SERIF, fontStyle: 'italic', fontSize: 18, color: FG }}>The Index</span>
            <span style={{ ...MONO, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: FG_M }}>
              {GRID_CARDS.length} cards
            </span>
          </div>

          {/* Numbered card rows */}
          {GRID_CARDS.map((card, i) => {
            const meta    = CARD_META[card.id] || {}
            const isSel   = selectedCard?.id === card.id
            const isDimmed = selectedCard && !isSel
            const num     = String(i + 1).padStart(2, '0')
            return (
              <button
                key={card.id}
                onClick={() => selectCard(card)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '14px 0',
                  background: isSel
                    ? 'linear-gradient(90deg, rgba(99,102,241,0.1), transparent 70%)'
                    : 'transparent',
                  border: 0, borderBottom: `1px solid ${LINE}`,
                  color: FG, textAlign: 'left', cursor: 'pointer',
                  opacity: isDimmed ? 0.32 : 1,
                  paddingLeft: isSel ? 8 : 0,
                  paddingRight: isSel ? 8 : 0,
                  marginLeft: isSel ? -8 : 0,
                  marginRight: isSel ? -8 : 0,
                  borderRadius: isSel ? 6 : 0,
                  transition: 'opacity 0.15s, background 0.18s',
                }}
                onMouseEnter={e => { if (!isSel && !isDimmed) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Number */}
                <span style={{
                  ...SERIF, fontStyle: 'italic', fontSize: 26,
                  color: 'rgba(165,180,252,0.6)', width: 32, textAlign: 'left', flexShrink: 0,
                }}>
                  {num}
                </span>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...SERIF, fontSize: 19, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.005em', color: FG }}>
                    <CardNameDisplay name={card.name} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ ...MONO, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: FG_M }}>
                      {card.program}
                    </span>
                    {meta.top && (
                      <>
                        <span style={{ color: FG_F, ...MONO, fontSize: 9 }}>·</span>
                        <span style={{ ...MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(165,180,252,0.8)' }}>
                          {meta.top}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Foil art + cpp */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                  {meta.tier && <CardArt tier={meta.tier} />}
                  {meta.cpp && (
                    <span style={{ ...SERIF, fontStyle: 'italic', fontSize: 13, color: FG }}>
                      {meta.cpp.toFixed(2)}
                      <span style={{ ...MONO, fontStyle: 'normal', fontSize: 8, color: FG_M, marginLeft: 2 }}>¢/pt</span>
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </section>

        {/* ── DETECTION PANEL ── */}
        {showDetection && selectedCard && (
          <DetectionPanel
            key={selectedCard.id}
            card={selectedCard}
            panelRef={detectionRef}
            onContinueAnyway={openStep2}
            onStep2Open={openStep2}
          />
        )}

        {/* ── STEP 2 - Points ── */}
        {showStep2 && (
          <section ref={step2Ref} className="step-reveal" style={{ marginTop: 48 }}>
            <div style={{ paddingTop: 32, borderTop: `1px solid ${LINE}` }}>
              <Kicker step="02" label="Enter your balance" />
              <StepHeadline>
                How many<br />
                <em style={{ fontStyle: 'italic', color: V300 }}>points</em> do you have?
              </StepHeadline>

              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 75,000"
                value={points}
                onChange={e => setPoints(formatWithCommas(e.target.value))}
                style={{
                  width: '100%', background: ELEVATED, color: FG,
                  fontSize: 28, fontFamily: "'Instrument Serif', Georgia, serif",
                  fontWeight: 400, letterSpacing: '-0.02em',
                  padding: '16px 20px', borderRadius: 12,
                  border: `1px solid ${BORDER_M}`, outline: 'none',
                  marginBottom: 10, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)' }}
                onBlur={e => { e.target.style.borderColor = BORDER_M }}
              />
              <p style={{ ...MONO, fontSize: 10, color: FG_M, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>
                Check your card app or statement for your current balance
              </p>
              <PilotButton onClick={handleContinue} disabled={!canContinue}>
                Continue →
              </PilotButton>
            </div>
          </section>
        )}

        {/* ── STEP 3 - Route ── */}
        {showStep3 && (
          <section ref={step3Ref} className="step-reveal" style={{ marginTop: 48 }}>
            <div style={{ paddingTop: 32, borderTop: `1px solid ${LINE}` }}>
              <Kicker step="03" label="Plan your route" />
              <StepHeadline>
                Where are<br />
                <em style={{ fontStyle: 'italic', color: V300 }}>you flying</em>?
              </StepHeadline>

              <p style={{ ...MONO, fontSize: 10, color: FG_M, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                City, airport name, or IATA code (e.g. "London", "JFK", "NYC")
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                <div>
                  <label style={{ ...MONO, display: 'block', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: FG_M, marginBottom: 8 }}>
                    From
                  </label>
                  <AirportInput placeholder="City or airport code" onSelect={setFromAirport} resetKey={airportResetKey} />
                </div>
                <div>
                  <label style={{ ...MONO, display: 'block', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: FG_M, marginBottom: 8 }}>
                    To
                  </label>
                  <AirportInput placeholder="City or airport code" onSelect={setToAirport} resetKey={airportResetKey} />
                </div>
              </div>

              <PilotButton
                disabled={!canSearch}
                onClick={async () => {
                  if (!canSearch) return
                  if (!isPro) {
                    try {
                      const res = await fetch('/api/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ card: selectedCard?.name, points, from: fromAirport, to: toAirport }),
                      })
                      const data = await res.json()
                      console.log('[Search] /api/search response - status:', res.status, '| body:', data)
                      if (res.status === 429) { setShowUpgradeModal(true); return }
                    } catch (err) {
                      console.warn('[Search] /api/search fetch error (failing open):', err)
                    }
                  }
                  sessionStorage.setItem('pp_fresh_search', 'true')
                  navigate('/results', { state: { card: selectedCard, points, from: fromAirport, to: toAirport } })
                }}
              >
                Pilot My Points →
              </PilotButton>
            </div>
          </section>
        )}

      </main>

      {showUpgradeModal && !isPro && <UpgradeModal />}
    </div>
  )
}
