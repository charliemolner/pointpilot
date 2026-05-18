import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'

// ── Design tokens (matches Landing dark theme) ─────────────
const BG        = '#0a0f1e'
const SURFACE   = '#0f1629'
const ELEVATED  = '#141d35'
const TEXT      = '#f1f5f9'
const MUTED     = '#94a3b8'
const SUBTLE    = '#475569'
const ACCENT    = '#6366f1'
const ACCENT_LT = '#818cf8'
const BORDER    = 'rgba(255,255,255,0.07)'
const BORDER_MID= 'rgba(255,255,255,0.11)'
const AMBER     = '#f59e0b'   // kept for affiliate CTA buttons only

// ─────────────────────────────────────────────────────────
// CARD DATABASE  (logic unchanged)
// ─────────────────────────────────────────────────────────

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
  { id: 'cfu',              name: 'Chase Freedom Unlimited',    type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: 'Unlock 14+ airline and hotel transfer partners and multiply the value of every point you\'ve already earned.'     },
  { id: 'cff',              name: 'Chase Freedom Flex',         type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: 'Pool your Freedom Flex points and access United, Hyatt, and 12+ other partners for outsized redemption value.'    },
  { id: 'cf',               name: 'Chase Freedom',              type: 2, issuer: 'Chase',            companion: 'Chase Sapphire Preferred',      companionBenefit: 'Combine balances and transfer to 14+ airline and hotel loyalty programs instantly.'                               },
  { id: 'c1-savor',         name: 'Capital One Savor',          type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: 'Transfer to 15+ airlines including Air Canada, Turkish, and Avianca for exceptional redemption value.'             },
  { id: 'c1-savorone',      name: 'Capital One SavorOne',       type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: 'Unlock global airline transfers and premium redemption rates on every point you\'ve already earned.'               },
  { id: 'c1-quicksilver',   name: 'Capital One Quicksilver',    type: 2, issuer: 'Capital One',      companion: 'Capital One Venture X',         companionBenefit: 'Access 15+ transfer partners and dramatically increase your points\' value with the Venture X.'                   },
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

// ─────────────────────────────────────────────────────────
// HELPERS  (logic unchanged)
// ─────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────
// AIRPORT DATABASE  (unchanged)
// ─────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────
// SHARED STYLE ATOMS
// ─────────────────────────────────────────────────────────

const inputBase = {
  width: '100%',
  background: ELEVATED,
  color: TEXT,
  fontSize: '15px',
  fontWeight: '400',
  padding: '13px 16px',
  borderRadius: '10px',
  border: `1px solid ${BORDER_MID}`,
  outline: 'none',
  fontFamily: 'inherit',
  letterSpacing: '-0.1px',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  color: SUBTLE,
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '8px',
}

// ── Dropdown shell shared by both airport and card dropdowns
const dropdownShell = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0, right: 0,
  background: SURFACE,
  borderRadius: '12px',
  border: `1px solid ${BORDER_MID}`,
  boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
  zIndex: 200,
  overflow: 'hidden',
}

// Type badge colors - dark-mode palette
const TYPE_BADGE = {
  1: { bg: 'rgba(99,102,241,0.15)',  color: ACCENT_LT },
  2: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24'  },
  3: { bg: 'rgba(248,113,113,0.12)', color: '#f87171'  },
  4: { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa'  },
  5: { bg: 'rgba(192,132,252,0.12)', color: '#c084fc'  },
}
const TYPE_LABEL = { 1: 'Transferable', 2: 'Ecosystem', 3: 'Cash Back', 4: 'Airline', 5: 'Hotel' }

function PilotButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(99,102,241,0.2)' : ACCENT,
        color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
        fontWeight: '500',
        fontSize: '15px',
        padding: '13px 32px',
        borderRadius: '999px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.2px',
        boxShadow: disabled ? 'none' : `0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.3)`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' } }}
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
        background: AMBER,
        color: '#1c1917',
        fontWeight: '700',
        fontSize: '14px',
        padding: '12px 28px',
        borderRadius: '999px',
        textDecoration: 'none',
        cursor: 'pointer',
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

function StepHeadline({ text }) {
  return (
    <h2 style={{
      color: TEXT,
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '-0.4px',
      marginBottom: '20px',
      lineHeight: '1.2',
    }}>
      {text}
    </h2>
  )
}

function AirportInput({ placeholder, onSelect, resetKey }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setQuery(''); setResults([]); setShowDrop(false)
  }, [resetKey])

  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val); onSelect(null)
    const r = searchAirports(val)
    setResults(r); setShowDrop(r.length > 0 && val.trim().length > 0)
  }

  const handleSelect = (airport) => {
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
        style={inputBase}
        onFocus={e => { e.target.style.borderColor = `rgba(99,102,241,0.55)`; if (results.length > 0) setShowDrop(true) }}
        onBlur={e => { e.target.style.borderColor = BORDER_MID }}
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
              <span style={{ color: ACCENT_LT, fontWeight: '700', fontSize: '13px' }}>{a.code}</span>
              <span style={{ color: MUTED, fontSize: '13px' }}> · {a.name}, {a.city}, {a.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// DETECTION PANEL
// ─────────────────────────────────────────────────────────

function DetectionPanel({ card, onContinueAnyway, panelRef, onStep2Open }) {
  const [creditScore, setCreditScore] = useState(null)

  const handleScore = (score) => {
    setCreditScore(score)
    setTimeout(() => onStep2Open(), 120)
  }

  const rec = creditScore ? getRecommendation(card, creditScore) : null

  const scoreButtons = [
    { key: 'excellent', label: 'Excellent', sub: '750+' },
    { key: 'good',      label: 'Good',      sub: '700–749' },
    { key: 'fair',      label: 'Fair',      sub: '650–699' },
    { key: 'building',  label: 'Building',  sub: '<650' },
  ]

  const body  = { color: MUTED,  fontSize: '15px', lineHeight: 1.7 }
  const bodyW = { color: TEXT,   fontSize: '15px', lineHeight: 1.7 }

  return (
    <div
      ref={panelRef}
      className="step-reveal"
      style={{
        background: ELEVATED,
        border: `1px solid ${BORDER_MID}`,
        borderRadius: '16px',
        padding: '24px 28px',
        marginTop: '40px',
      }}
    >
      {/* TYPE label */}
      <p style={{
        fontSize: '11px', fontWeight: '600',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: card.type === 4 ? ACCENT_LT : AMBER,
        marginBottom: '12px',
      }}>
        {card.type === 4 ? 'Great news' : 'Heads up'}
      </p>

      {card.type === 2 && (
        <>
          <p style={{ ...bodyW, marginBottom: '16px' }}>
            The <strong>{card.name}</strong> earns cash back that can't be transferred to airline partners on its own.
          </p>
          <p style={{ ...bodyW, marginBottom: '8px', fontWeight: '600' }}>But here's something most people don't know:</p>
          <p style={{ ...body, marginBottom: '8px' }}>
            Pair it with a <strong style={{ color: TEXT }}>{card.companion}</strong> and every point you've already earned instantly combines, fully transferable to airline partners.
          </p>
          <p style={{ ...body, marginBottom: '20px', fontStyle: 'italic' }}>Your points don't disappear. They level up.</p>
        </>
      )}
      {card.type === 3 && (
        <>
          <p style={{ ...bodyW, marginBottom: '16px' }}>The <strong>{card.name}</strong> earns pure cash back with no airline transfer partners.</p>
          <p style={{ ...body, marginBottom: '20px' }}>
            The good news: adding a travel rewards card lets you start earning transferable points immediately, and you keep using your <strong style={{ color: TEXT }}>{card.name}</strong> for cash back on top of it.
          </p>
        </>
      )}
      {card.type === 4 && (
        <>
          <p style={{ ...bodyW, marginBottom: '8px' }}>Your <strong>{card.name}</strong> earns <strong>{card.airline}</strong> miles directly. No transfer needed.</p>
          <p style={{ ...body }}>We'll show you the best ways to redeem your miles for maximum value.</p>
        </>
      )}
      {card.type === 5 && (
        <>
          <p style={{ ...bodyW, marginBottom: '16px' }}>Your <strong>{card.name}</strong> earns <strong>{card.hotel}</strong> points, primarily designed for hotel stays rather than flights.</p>
          <p style={{ ...body, marginBottom: '8px' }}>While some hotel points can transfer to airlines, the conversion rates are usually poor.</p>
          <p style={{ ...body, marginBottom: '20px' }}>For flights, a dedicated travel card will get you much further.</p>
        </>
      )}

      {/* Credit score prompt */}
      {(card.type === 2 || card.type === 3 || card.type === 5) && !creditScore && (
        <>
          <p style={{ color: SUBTLE, fontSize: '13px', marginBottom: '12px' }}>
            To point you in the right direction: roughly where is your credit score?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '4px' }}>
            {scoreButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => handleScore(btn.key)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${BORDER_MID}`,
                  borderRadius: '10px',
                  padding: '11px 14px',
                  cursor: 'pointer',
                  color: TEXT,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = BORDER_MID }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{btn.label}</div>
                <div style={{ color: SUBTLE, fontSize: '12px', marginTop: '2px' }}>{btn.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Credit score result */}
      {rec && (
        <div className="step-reveal" style={{ marginTop: '4px', paddingTop: '18px', borderTop: `1px solid ${BORDER}` }}>
          {rec.kind === 'companion' && (
            <>
              <p style={{ ...bodyW, fontWeight: '600', marginBottom: '8px' }}>
                Great news! You likely qualify for the <span style={{ color: ACCENT_LT }}>{rec.name}</span>. Here's why it's the right move:
              </p>
              <p style={{ ...body, marginBottom: '18px' }}>{rec.benefit}</p>
              <p style={{ ...bodyW, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Want to unlock your points?</p>
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
          {rec.kind === 'starter' && (
            <>
              <p style={{ ...body, marginBottom: '18px', whiteSpace: 'pre-line' }}>{rec.prefix}</p>
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
        </div>
      )}

      {/* Continue anyway */}
      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: `1px solid ${BORDER}` }}>
        <button
          onClick={onContinueAnyway}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: SUBTLE, fontSize: '13px',
            fontFamily: 'inherit', padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = MUTED }}
          onMouseLeave={e => { e.currentTarget.style.color = SUBTLE }}
        >
          Continue anyway →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────

export default function Search() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  const [selectedCard,   setSelectedCard]   = useState(null)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [showDetection,  setShowDetection]  = useState(false)
  const [showStep2,      setShowStep2]      = useState(false)
  const [points,         setPoints]         = useState('')
  const [showStep3,      setShowStep3]      = useState(false)
  const [fromAirport,    setFromAirport]    = useState(null)
  const [toAirport,      setToAirport]      = useState(null)
  const [airportResetKey,setAirportResetKey]= useState(0)
  const [showUpgradeModal,setShowUpgradeModal]= useState(false)

  const detectionRef = useRef(null)
  const step2Ref     = useRef(null)
  const step3Ref     = useRef(null)

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)

  const selectCard = (card) => {
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

  const handleSearch = (value) => {
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
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '52px',
        background: 'rgba(10,15,30,0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: '0 24px',
          width: '100%', display: 'flex', alignItems: 'center',
        }}>
          <span
            onClick={() => navigate('/')}
            style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '-0.3px', color: TEXT, cursor: 'pointer', userSelect: 'none' }}
          >
            PointPilot
          </span>
        </div>
      </nav>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ── STEP 1 ── */}
        <section>
          <StepHeadline text="What card are you using today?" />

          {/* Card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {GRID_CARDS.map(card => {
              const isSelected = selectedCard?.id === card.id
              const isDimmed   = selectedCard && !isSelected
              return (
                <div
                  key={card.id}
                  onClick={() => selectCard(card)}
                  style={{
                    background: isSelected ? 'rgba(99,102,241,0.1)' : ELEVATED,
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    border: isSelected
                      ? '1px solid rgba(99,102,241,0.5)'
                      : `1px solid ${BORDER_MID}`,
                    boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = BORDER_MID }}
                >
                  <div style={{ color: TEXT, fontSize: '13px', fontWeight: '600', lineHeight: 1.3, marginBottom: '3px', letterSpacing: '-0.1px' }}>
                    {card.name}
                  </div>
                  <div style={{ color: SUBTLE, fontSize: '11px', fontWeight: '500' }}>
                    {card.program}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search with dropdown */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search all cards..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)'; if (searchResults.length > 0) setShowDropdown(true) }}
              onBlur={e => { setTimeout(() => setShowDropdown(false), 180); e.target.style.borderColor = BORDER_MID }}
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={dropdownShell}>
                {searchResults.map((card, i) => {
                  const badge = TYPE_BADGE[card.type] || TYPE_BADGE[1]
                  return (
                    <div
                      key={card.id}
                      onMouseDown={() => selectCard(card)}
                      style={{
                        padding: '11px 16px',
                        cursor: 'pointer',
                        borderBottom: i < searchResults.length - 1 ? `1px solid ${BORDER}` : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                    >
                      <div>
                        <div style={{ color: TEXT, fontSize: '13px', fontWeight: '600', letterSpacing: '-0.1px' }}>{card.name}</div>
                        <div style={{ color: SUBTLE, fontSize: '12px', marginTop: '1px' }}>
                          {card.program || card.miles || card.hotel || card.issuer}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        padding: '3px 9px', borderRadius: '999px',
                        background: badge.bg, color: badge.color,
                        whiteSpace: 'nowrap', marginLeft: '10px',
                      }}>
                        {TYPE_LABEL[card.type]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
          <section ref={step2Ref} className="step-reveal" style={{ marginTop: '40px' }}>
            <StepHeadline text="How many points do you have?" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 75,000"
              value={points}
              onChange={e => setPoints(formatWithCommas(e.target.value))}
              style={{ ...inputBase, fontSize: '22px', padding: '15px 18px', marginBottom: '8px' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.55)' }}
              onBlur={e => { e.target.style.borderColor = BORDER_MID }}
            />
            <p style={{ color: SUBTLE, fontSize: '12px', marginBottom: '24px', letterSpacing: '-0.1px' }}>
              Check your card app or statement for your current balance
            </p>
            <PilotButton onClick={handleContinue} disabled={!canContinue}>
              Continue
            </PilotButton>
          </section>
        )}

        {/* ── STEP 3 - Route ── */}
        {showStep3 && (
          <section ref={step3Ref} className="step-reveal" style={{ marginTop: '40px' }}>
            <StepHeadline text="Where are you flying?" />
            <p style={{ color: SUBTLE, fontSize: '12px', marginBottom: '14px', letterSpacing: '-0.1px' }}>
              Type a city, airport name, or IATA code (e.g. "London", "JFK", "NYC")
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>From</label>
                <AirportInput placeholder="City or airport code" onSelect={setFromAirport} resetKey={airportResetKey} />
              </div>
              <div>
                <label style={labelStyle}>To</label>
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
              Pilot My Points
            </PilotButton>
          </section>
        )}

      </main>

      {showUpgradeModal && !isPro && <UpgradeModal />}
    </div>
  )
}
