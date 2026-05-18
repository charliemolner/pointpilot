import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'

const NAVY = '#1a3a6b'
const AMBER = '#f59e0b'

// ─────────────────────────────────────────────────────────
// CARD DATABASE
// ─────────────────────────────────────────────────────────

const ALL_CARDS = [
  // TYPE 1 — Transferable points (no detection)
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

  // TYPE 2 — Cash back with transfer ecosystem (needs companion)
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

  // TYPE 3 — True cash back only (no ecosystem)
  { id: 'discover-cb',      name: 'Discover it Cash Back',                  type: 3, issuer: 'Discover'              },
  { id: 'discover-chrome',  name: 'Discover it Chrome',                     type: 3, issuer: 'Discover'              },
  { id: 'discover-secured', name: 'Discover it Secured',                    type: 3, issuer: 'Discover'              },
  { id: 'boa-cash',         name: 'Bank of America Cash Rewards',           type: 3, issuer: 'Bank of America'       },
  { id: 'boa-unlimited',    name: 'Bank of America Unlimited Cash Rewards', type: 3, issuer: 'Bank of America'       },
  { id: 'apple-card',       name: 'Apple Card',                             type: 3, issuer: 'Apple / Goldman Sachs' },
  { id: 'paypal-cashback',  name: 'PayPal Cashback Mastercard',             type: 3, issuer: 'PayPal / Synchrony'   },
  { id: 'usbank-cash',      name: 'US Bank Cash+',                          type: 3, issuer: 'US Bank'              },
  { id: 'usbank-altitude',  name: 'US Bank Altitude Go',                    type: 3, issuer: 'US Bank'              },

  // TYPE 4 — Airline co-branded (proceed normally)
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

  // TYPE 5 — Hotel co-branded (not ideal for flights)
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
// HELPERS
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
  const builderPrefix = "We'd recommend building toward 700 before applying for a premium travel card — a hard inquiry now risks denial without guaranteed approval.\n\nIn the meantime, here's a card that rewards you while you build:"

  if (card.type === 2) {
    if (highCredit) return { kind: 'companion', name: card.companion, benefit: card.companionBenefit }
    if (score === 'fair')     return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                           { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  if (card.type === 3) {
    if (highCredit) return { kind: 'companion', name: 'Chase Sapphire Preferred', benefit: 'Transfer to 14+ airline and hotel partners — the most versatile travel card for maximizing flight value.' }
    if (score === 'fair')     return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                           { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  if (card.type === 5) {
    if (highCredit) return { kind: 'companion', name: 'Chase Sapphire Preferred', benefit: 'Access 14+ airline transfer partners for flights — the right tool to get full value out of your travel spend.' }
    if (score === 'fair')     return { kind: 'starter', name: 'Capital One QuicksilverOne', prefix: builderPrefix }
    return                           { kind: 'starter', name: 'Discover it Secured',        prefix: builderPrefix }
  }
  return null
}

// TODO: Replace with real affiliate link from FlexOffers
const AFFILIATE_LINKS = {
  'Chase Sapphire Preferred':      'AFFILIATE_LINK_CHASE_SAPPHIRE_PREFERRED',
  // TODO: Replace with real affiliate link from FlexOffers
  'Capital One Venture X':         'AFFILIATE_LINK_CAPITAL_ONE_VENTURE_X',
  // TODO: Replace with real affiliate link from FlexOffers
  'Citi Strata Premier':           'AFFILIATE_LINK_CITI_STRATA_PREMIER',
  // TODO: Replace with real affiliate link from FlexOffers
  'Amex Gold':                     'AFFILIATE_LINK_AMEX_GOLD',
  // TODO: Replace with real affiliate link from FlexOffers
  'Wells Fargo Autograph Journey': 'AFFILIATE_LINK_WELLS_FARGO_AUTOGRAPH_JOURNEY',
  // TODO: Replace with real affiliate link from FlexOffers
  'Capital One QuicksilverOne':    'AFFILIATE_LINK_CAPITAL_ONE_QUICKSILVERONE',
  // TODO: Replace with real affiliate link from FlexOffers
  'Discover it Secured':           'AFFILIATE_LINK_DISCOVER_IT_SECURED',
}

function formatWithCommas(raw) {
  const digits = raw.replace(/\D/g, '')
  return digits ? parseInt(digits, 10).toLocaleString() : ''
}

// ─────────────────────────────────────────────────────────
// AIRPORT DATABASE
// ─────────────────────────────────────────────────────────

const AIRPORTS = [
  // US
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
  // Europe
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
  // Asia Pacific
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
  // Middle East & Africa
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
  { code: 'JNB', name: 'OR Tambo International', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
  // Americas
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

// Metro aliases (typed alias → array of IATA codes)
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
  background: 'white',
  color: NAVY,
  fontSize: '16px',
  fontWeight: '500',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '2px solid transparent',
  outline: 'none',
  fontFamily: 'inherit',
}

function PilotButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(255,255,255,0.25)' : 'white',
        color: disabled ? 'rgba(255,255,255,0.4)' : NAVY,
        fontWeight: '700',
        fontSize: '17px',
        padding: '16px 40px',
        borderRadius: '50px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 6px 28px rgba(0,0,0,0.20)',
        transition: 'all 0.2s ease',
      }}
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
        fontSize: '15px',
        padding: '14px 32px',
        borderRadius: '50px',
        textDecoration: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </a>
  )
}

function StepHeadline({ text }) {
  return (
    <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', marginBottom: '24px' }}>
      {text}
    </h2>
  )
}

function AirportInput({ placeholder, onSelect, resetKey }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const containerRef = useRef(null)

  // Reset when parent signals a card change
  useEffect(() => {
    setQuery('')
    setResults([])
    setShowDrop(false)
  }, [resetKey])

  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onSelect(null)
    const r = searchAirports(val)
    setResults(r)
    setShowDrop(r.length > 0 && val.trim().length > 0)
  }

  const handleSelect = (airport) => {
    setQuery(`${airport.code} — ${airport.city}`)
    onSelect(airport)
    setShowDrop(false)
    setResults([])
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => { if (results.length > 0) setShowDrop(true) }}
        style={inputBase}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.55)'
          if (results.length > 0) setShowDrop(true)
        }}
        onBlur={e => { e.target.style.borderColor = 'transparent' }}
      />
      {showDrop && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {results.map((a, i) => (
            <button
              key={a.code}
              onMouseDown={e => { e.preventDefault(); handleSelect(a) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '11px 16px', background: 'none', border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: NAVY, fontWeight: '800', fontSize: '13px' }}>{a.code}</span>
              <span style={{ color: '#6b7280', fontSize: '13px' }}> — {a.name}, {a.city}, {a.country}</span>
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

  const panelStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '28px 32px',
    marginTop: '52px',
  }

  const labelStyle = { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }

  const scoreButtons = [
    { key: 'excellent', label: 'Excellent', sub: '750+' },
    { key: 'good',      label: 'Good',      sub: '700–749' },
    { key: 'fair',      label: 'Fair',      sub: '650–699' },
    { key: 'building',  label: 'Building',  sub: '<650' },
  ]

  return (
    <div ref={panelRef} className="step-reveal" style={panelStyle}>

      {/* TYPE 2 message */}
      {card.type === 2 && (
        <>
          <p style={labelStyle}>Heads up</p>
          <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
            The <strong>{card.name}</strong> earns cash back that can't be transferred to airline partners on its own.
          </p>
          <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7, marginBottom: '8px', fontWeight: '600' }}>
            But here's something most people don't know:
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.7, marginBottom: '8px' }}>
            Pair it with a <strong style={{ color: 'white' }}>{card.companion}</strong> and every point you've already earned instantly combines into one balance — fully transferable to airline partners.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px', fontStyle: 'italic' }}>
            Your points don't disappear. They level up.
          </p>
        </>
      )}

      {/* TYPE 3 message */}
      {card.type === 3 && (
        <>
          <p style={labelStyle}>Heads up</p>
          <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
            The <strong>{card.name}</strong> earns pure cash back with no airline transfer partners.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>
            The good news: adding a travel rewards card to your wallet lets you start earning transferable points immediately — and you can keep using your <strong style={{ color: 'white' }}>{card.name}</strong> for cash back on top of it.
          </p>
        </>
      )}

      {/* TYPE 4 message */}
      {card.type === 4 && (
        <>
          <p style={labelStyle}>Great news</p>
          <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7, marginBottom: '8px' }}>
            Your <strong>{card.name}</strong> earns <strong>{card.airline}</strong> miles directly. No transfer needed.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7 }}>
            We'll show you the best ways to redeem your miles for maximum value.
          </p>
        </>
      )}

      {/* TYPE 5 message */}
      {card.type === 5 && (
        <>
          <p style={labelStyle}>Heads up</p>
          <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
            Your <strong>{card.name}</strong> earns <strong>{card.hotel}</strong> points, which are primarily designed for hotel stays rather than flights.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.7, marginBottom: '8px' }}>
            While some hotel points can transfer to airlines, the conversion rates are usually poor — you'd be leaving significant value on the table.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
            For flights, a dedicated travel card will get you much further.
          </p>
        </>
      )}

      {/* Credit score prompt — Types 2, 3, 5 */}
      {(card.type === 2 || card.type === 3 || card.type === 5) && !creditScore && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', marginBottom: '14px' }}>
            To make sure we point you in the right direction — roughly where is your credit score?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '8px' }}>
            {scoreButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => handleScore(btn.key)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: 'white',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              >
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{btn.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>{btn.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Credit score result */}
      {rec && (
        <div className="step-reveal" style={{ marginTop: '4px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {rec.kind === 'companion' && (
            <>
              <p style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                Great news — you likely qualify for the <span style={{ color: AMBER }}>{rec.name}</span>. Here's why it's the right move:
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.65, marginBottom: '20px' }}>
                {rec.benefit}
              </p>
              <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>
                Want to unlock your points?
              </p>
              {/* TODO: Replace with real affiliate link from FlexOffers */}
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
          {rec.kind === 'starter' && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px', whiteSpace: 'pre-line' }}>
                {rec.prefix}
              </p>
              {/* TODO: Replace with real affiliate link from FlexOffers */}
              <AmberButton href={AFFILIATE_LINKS[rec.name]}>Apply for {rec.name}</AmberButton>
            </>
          )}
        </div>
      )}

      {/* Continue anyway — always visible */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onContinueAnyway}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
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

  const [selectedCard, setSelectedCard] = useState(null)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [searchResults,setSearchResults]= useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDetection,setShowDetection]= useState(false)
  const [showStep2,    setShowStep2]    = useState(false)
  const [points,       setPoints]       = useState('')
  const [showStep3,    setShowStep3]    = useState(false)
  const [fromAirport,  setFromAirport]  = useState(null)
  const [toAirport,    setToAirport]    = useState(null)
  const [airportResetKey, setAirportResetKey] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const detectionRef = useRef(null)
  const step2Ref     = useRef(null)
  const step3Ref     = useRef(null)

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)

  const selectCard = (card) => {
    setSelectedCard(card)
    setSearchQuery(card.type !== 1 || !GRID_CARDS.find(c => c.id === card.id) ? card.name : searchQuery)
    setShowDropdown(false)
    // Reset downstream state
    setShowDetection(false)
    setShowStep2(false)
    setShowStep3(false)
    setPoints('')
    setFromAirport(null)
    setToAirport(null)
    setAirportResetKey(k => k + 1)

    if (card.type === 1) {
      setShowStep2(true)
      scrollTo(step2Ref)
    } else {
      setShowDetection(true)
      if (card.type === 4) {
        setShowStep2(true)
      }
      scrollTo(detectionRef)
    }
  }

  const openStep2 = () => {
    setShowStep2(true)
    scrollTo(step2Ref)
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
    const results = fuzzySearch(value)
    setSearchResults(results)
    setShowDropdown(results.length > 0 && value.trim().length > 0)
  }

  const handleContinue = () => {
    if (!points.replace(/\D/g, '')) return
    setShowStep3(true)
    scrollTo(step3Ref)
  }

  const canContinue = points.replace(/\D/g, '').length > 0
  const canSearch   = fromAirport !== null && toAirport !== null

  const focusStyle = {
    onFocus: e => { e.target.style.borderColor = 'rgba(255,255,255,0.55)' },
    onBlur:  e => { e.target.style.borderColor = 'transparent' },
  }

  return (
    <div style={{ backgroundColor: NAVY, minHeight: '100vh', color: 'white' }} className="dot-bg">

      {/* Navbar */}
      <nav style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 40px', flexShrink: 0 }}>
        <span
          onClick={() => navigate('/')}
          style={{ color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', cursor: 'pointer', userSelect: 'none' }}
        >
          PointPilot™
        </span>
      </nav>

      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 40px 120px' }}>

        {/* ── STEP 1 ── */}
        <section>
          <StepHeadline text="What card are you using today?" />

          {/* Card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {GRID_CARDS.map(card => {
              const isSelected = selectedCard?.id === card.id
              const isDimmed   = selectedCard && !isSelected
              return (
                <div
                  key={card.id}
                  onClick={() => selectCard(card)}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid white' : '2px solid transparent',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(255,255,255,0.3), 0 8px 24px rgba(0,0,0,0.25)'
                      : '0 2px 10px rgba(0,0,0,0.18)',
                    opacity: isDimmed ? 0.4 : 1,
                    transition: 'all 0.18s ease',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ color: NAVY, fontSize: '14px', fontWeight: '700', lineHeight: 1.3, marginBottom: '3px' }}>
                    {card.name}
                  </div>
                  <div style={{ color: 'rgba(26,58,107,0.5)', fontSize: '12px', fontWeight: '500' }}>
                    {card.program}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search input with dropdown */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for your card..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={e => {
                e.target.style.background = 'white'
                e.target.style.color = NAVY
                e.target.style.borderColor = 'rgba(255,255,255,0.55)'
                if (searchResults.length > 0) setShowDropdown(true)
              }}
              onBlur={e => {
                setTimeout(() => setShowDropdown(false), 180)
                if (!searchQuery) {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.color = 'rgba(255,255,255,0.7)'
                  e.target.style.borderColor = 'transparent'
                }
              }}
              style={{
                ...inputBase,
                background: searchQuery ? 'white' : 'rgba(255,255,255,0.1)',
                color: searchQuery ? NAVY : 'rgba(255,255,255,0.7)',
                borderColor: 'transparent',
              }}
            />

            {showDropdown && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                zIndex: 50,
              }}>
                {searchResults.map((card, i) => (
                  <div
                    key={card.id}
                    onMouseDown={() => selectCard(card)}
                    style={{
                      padding: '12px 18px',
                      cursor: 'pointer',
                      borderBottom: i < searchResults.length - 1 ? '1px solid rgba(26,58,107,0.07)' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f4ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                  >
                    <div>
                      <div style={{ color: NAVY, fontSize: '14px', fontWeight: '700' }}>{card.name}</div>
                      <div style={{ color: 'rgba(26,58,107,0.5)', fontSize: '12px', marginTop: '1px' }}>
                        {card.program || card.miles || card.hotel || card.issuer}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      background: card.type === 1 ? '#dcfce7' : card.type === 2 ? '#fef9c3' : card.type === 3 ? '#fee2e2' : card.type === 4 ? '#dbeafe' : '#f3e8ff',
                      color: card.type === 1 ? '#166534' : card.type === 2 ? '#854d0e' : card.type === 3 ? '#991b1b' : card.type === 4 ? '#1e40af' : '#6b21a8',
                    }}>
                      {card.type === 1 ? 'Transferable' : card.type === 2 ? 'Ecosystem' : card.type === 3 ? 'Cash Back' : card.type === 4 ? 'Airline' : 'Hotel'}
                    </div>
                  </div>
                ))}
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

        {/* ── STEP 2 — Points ── */}
        {showStep2 && (
          <section ref={step2Ref} className="step-reveal" style={{ marginTop: '52px' }}>
            <StepHeadline text="How many points do you have?" />

            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 75,000"
              value={points}
              onChange={e => setPoints(formatWithCommas(e.target.value))}
              style={{ ...inputBase, fontSize: '20px', padding: '16px 20px', marginBottom: '10px' }}
              {...focusStyle}
            />

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '28px' }}>
              Check your card app or statement for your current balance
            </p>

            <PilotButton onClick={handleContinue} disabled={!canContinue}>
              Continue
            </PilotButton>
          </section>
        )}

        {/* ── STEP 3 — Route ── */}
        {showStep3 && (
          <section ref={step3Ref} className="step-reveal" style={{ marginTop: '52px' }}>
            <StepHeadline text="Where are you flying?" />

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '16px' }}>
              Type a city, airport name, or IATA code (e.g. "London", "JFK", "NYC")
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  From
                </label>
                <AirportInput
                  placeholder="City or airport code"
                  onSelect={setFromAirport}
                  resetKey={airportResetKey}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  To
                </label>
                <AirportInput
                  placeholder="City or airport code"
                  onSelect={setToAirport}
                  resetKey={airportResetKey}
                />
              </div>
            </div>

            <PilotButton
              onClick={async () => {
                if (!canSearch) return
                if (!isPro) {  // only rate-limit non-pro users
                  try {
                    const res = await fetch('/api/search', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ card: selectedCard?.name, points, from: fromAirport, to: toAirport }),
                    })
                    const data = await res.json()
                    console.log('[Search] /api/search response — status:', res.status, '| body:', data)
                    if (res.status === 429) {
                      setShowUpgradeModal(true)
                      return
                    }
                    // allowed (or any non-429 response) — proceed
                  } catch (err) {
                    // Network error or server down — fail open
                    console.warn('[Search] /api/search fetch error (failing open):', err)
                  }
                }
                sessionStorage.setItem('pp_fresh_search', 'true')
                navigate('/results', { state: { card: selectedCard, points, from: fromAirport, to: toAirport } })
              }}
              disabled={!canSearch}
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
