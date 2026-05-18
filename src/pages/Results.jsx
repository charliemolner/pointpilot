import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'

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

// TODO: Replace with real affiliate links from FlexOffers
const AFFILIATE_LINKS = {
  'Chase Sapphire Preferred':      'AFFILIATE_LINK_CHASE_SAPPHIRE_PREFERRED',
  'Capital One Venture X':         'AFFILIATE_LINK_CAPITAL_ONE_VENTURE_X',
  'Citi Strata Premier':           'AFFILIATE_LINK_CITI_STRATA_PREMIER',
  'Amex Gold':                     'AFFILIATE_LINK_AMEX_GOLD',
  'Wells Fargo Autograph Journey': 'AFFILIATE_LINK_WELLS_FARGO_AUTOGRAPH_JOURNEY',
}

const CARD_DETAILS = {
  'Chase Sapphire Preferred': {
    tagline: '14+ transfer partners · $95/yr · 60k bonus offer',
    highlight: 'Best all-around travel card for beginners and experts alike',
    bonus: '75,000 point welcome bonus after $5,000 spend in 3 months — worth up to $1,500 in travel',
  },
  'Capital One Venture X': {
    tagline: '15+ transfer partners · $395/yr · $300 travel credit',
    highlight: 'Premium travel card that effectively pays for itself every year',
    bonus: '75,000 mile welcome bonus after $4,000 spend in 3 months — worth up to $1,400 in travel',
  },
  'Citi Strata Premier': {
    tagline: '15+ transfer partners · $95/yr · Singapore & Turkish access',
    highlight: "Hidden gem with access to some of the world's best programs",
    bonus: '60,000 point welcome bonus after $4,000 spend in 3 months — worth up to $1,100 in travel',
  },
  'Amex Gold': {
    tagline: '20+ partners · $325/yr · 4x dining & groceries',
    highlight: 'Strongest earner for everyday spend with world-class transfer partners',
    bonus: '60,000–100,000 point welcome bonus after $8,000 spend in 6 months — worth up to $2,000 in travel',
  },
  'Wells Fargo Autograph Journey': {
    tagline: 'Flying Blue & Aeroplan · $95/yr · 60k bonus offer',
    highlight: 'Underrated card with powerful airline partners at a low annual fee',
    bonus: '60,000 point welcome bonus after $3,000 spend in 3 months — worth up to $1,000 in travel',
  },
}

// ── Points label — avoid "ThankYou Points points" etc. ──
function pointsLabel(program) {
  if (/miles|points|mileage|plan/i.test(program)) return program
  return program + ' points'
}

// ── Affiliate card promo grid (always show all 4) ──
const PROMO_CARDS = [
  { name: 'Chase Sapphire Preferred',  issuer: 'Chase' },
  { name: 'Capital One Venture X',     issuer: 'Capital One' },
  { name: 'Citi Strata Premier',       issuer: 'Citi' },
  { name: 'Amex Gold',                 issuer: 'American Express' },
]

// ── localStorage search counter ──
function getSearchData() {
  const today = new Date().toISOString().slice(0, 10)
  const storedDate  = localStorage.getItem('pp_search_date')
  const storedCount = parseInt(localStorage.getItem('pp_search_count') || '0', 10)
  if (storedDate !== today) return { count: 0, date: today }
  return { count: storedCount, date: today }
}

function incrementSearchCount() {
  // Only count if the user arrived from a real search submission
  const isFresh = sessionStorage.getItem('pp_fresh_search') === 'true'
  if (!isFresh) return getSearchData().count  // refresh / back / new tab — don't count
  sessionStorage.removeItem('pp_fresh_search')  // clear the flag immediately
  const today = new Date().toISOString().slice(0, 10)
  const { count } = getSearchData()
  const next = count + 1
  localStorage.setItem('pp_search_date',  today)
  localStorage.setItem('pp_search_count', String(next))
  return next
}

// ─────────────────────────────────────────────────────────
// ROUTE-AWARE RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────

// Which transfer partners each card program can access
const PROGRAM_PARTNERS = {
  'Ultimate Rewards':    ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'United MileagePlus', 'Japan Airlines Mileage Bank'],
  'Membership Rewards':  ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'ANA Mileage Club', 'Delta SkyMiles'],
  'Capital One Miles':   ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Air Canada Aeroplan', 'Turkish Airlines Miles&Smiles', 'Avianca LifeMiles'],
  'ThankYou Points':     ['Virgin Atlantic Flying Club', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Turkish Airlines Miles&Smiles', 'Avianca LifeMiles'],
  'Bilt Points':         ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'United MileagePlus', 'Turkish Airlines Miles&Smiles'],
  'Wells Fargo Rewards': ['Air France Flying Blue', 'Air Canada Aeroplan', 'Avianca LifeMiles'],
}

// Normalize airport codes to metro groups for route matching
const METRO_MAP = {
  JFK: 'NYC', LGA: 'NYC', EWR: 'NYC',
  LHR: 'LON', LGW: 'LON', STN: 'LON',
  CDG: 'PAR', ORY: 'PAR',
  NRT: 'TYO', HND: 'TYO',
  LAX: 'WC',  SFO: 'WC', SEA: 'WC',
  BCN: 'SPAIN', MAD: 'SPAIN',
}
function getMetro(code) { return METRO_MAP[code] || code }

// ── Route database ──
// Each option: airline, partner, points, cashValue, cpp, note, warning?, steps[], programs[]
// programs[] = card programs that can access this partner — pick the first match for the user's card
const ROUTE_DB = {
  'NYC-LON': {
    luxury: [
      {
        airline: 'Virgin Atlantic Upper Class',
        partner: 'Transfer to Virgin Atlantic Flying Club · 1:1 ratio',
        points: 44000, cashValue: 3800, cpp: 8.6,
        note: 'Virgin Atlantic Upper Class features fully lie-flat suites and a dedicated bar on every flight. Booking through Flying Club is one of the single best-value transatlantic business class redemptions available.',
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant — points appear in your account within minutes',
          'Search for Upper Class award availability at virginatlantic.com',
          'Look for "Reward" Upper Class flights between New York and London',
          'Pay only ~$200–$400 in taxes and carrier fees at checkout',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'British Airways Economy',
        partner: 'Transfer to British Airways Executive Club · 1:1 ratio',
        points: 26000, cashValue: 650, cpp: 2.5,
        note: 'British Airways Avios can be excellent value for transatlantic economy — but BA charges significant fuel surcharges on its own flights. Factor in $150–$350 in fees on top of your Avios.',
        warning: 'British Airways charges fuel surcharges on its own flights. Expect $150–$350 in fees on top of the Avios cost.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select British Airways Executive Club as your transfer partner (1:1)',
          'Avios typically arrive within minutes',
          'Search for economy "Reward" availability at britishairways.com',
          'Look for Avios-labeled economy seats on the JFK/EWR/LGA → LHR/LGW route',
          'Book — note the $150–$350 fuel surcharge BA adds on its own flights',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
  },

  'NYC-PAR': {
    luxury: [
      {
        airline: 'Air France Business Class',
        partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
        points: 50000, cashValue: 3200, cpp: 6.4,
        note: 'Air France Business Class features lie-flat beds on wide-body aircraft and is one of the most consistently available transatlantic business redemptions. Check flyingblue.com monthly for Promo Rewards discounts of up to 50%.',
        warning: null,
        steps: [
          'Log into your card account and go to "Transfer Points"',
          'Select Air France/KLM Flying Blue (1:1 transfer, typically instant)',
          'Check flyingblue.com on the 1st of each month for Promo Rewards before transferring',
          'Search for business class "Reward" availability on airfrance.com',
          'Look for "Reward" labeled business class seats on the NYC → CDG route',
          'Book and pay ~$100–$200 in taxes and carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points', 'Wells Fargo Rewards'],
      },
    ],
    budget: [
      {
        airline: 'Air France Economy',
        partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
        points: 30000, cashValue: 700, cpp: 2.3,
        note: 'Flying Blue economy to Paris is one of the most accessible transatlantic economy redemptions. Promo Rewards released every 1st of the month can cut costs by 25–50%.',
        warning: null,
        steps: [
          'Log into your card account and go to "Transfer Points"',
          'Select Air France/KLM Flying Blue (1:1 transfer, typically instant)',
          'Check flyingblue.com on the 1st of each month for Promo Rewards discounts',
          'Search for economy "Reward" availability on airfrance.com',
          'Look for "Reward" labeled economy seats to CDG',
          'Book and pay ~$50–$100 in carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points', 'Wells Fargo Rewards'],
      },
    ],
  },

  'NYC-TYO': {
    luxury: [
      {
        airline: 'ANA Business Class via Virgin Atlantic',
        partner: 'Transfer to Virgin Atlantic Flying Club · 1:1 ratio',
        points: 47500, cashValue: 4200, cpp: 8.8,
        note: "Virgin Atlantic Flying Club's 47,500-mile rate for ANA's The Room business class is one of the single best sweet spots in all of points and miles. ANA is consistently rated the world's #1 airline — fully flat suites with direct aisle access.",
        warning: 'ANA partner awards via Virgin Atlantic must be booked by phone — call Virgin Atlantic Flying Club at 1-800-365-9500 after transferring points.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant — points appear in your account within minutes',
          'Call Virgin Atlantic Flying Club at 1-800-365-9500 to book the ANA award',
          'Confirm ANA business class availability on your JFK/EWR → NRT/HND dates',
          'Pay ~$100–$200 in taxes and carrier fees at time of booking',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'ANA or United Economy',
        partner: 'Transfer to United MileagePlus · 1:1 ratio',
        points: 26000, cashValue: 850, cpp: 3.2,
        note: 'United MileagePlus lets you book ANA economy at Saver rates via the Star Alliance partnership. ANA economy includes a full meal service and exceptional onboard service even in economy class.',
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select United MileagePlus as your transfer partner (1:1, instant)',
          'Search for economy Saver availability on united.com',
          'Filter for ANA (NH) operated flights for the best in-flight experience',
          'Look for the "Saver" labeled economy awards',
          'Book and pay ~$50–$100 in carrier fees at checkout',
        ],
        programs: ['Ultimate Rewards', 'Bilt Points'],
      },
      {
        airline: 'ANA Economy',
        partner: 'Transfer to ANA Mileage Club · 1:1 ratio',
        points: 35000, cashValue: 850, cpp: 2.4,
        note: 'Amex transfers to ANA Mileage Club at 1:1. Booking directly through ANA often reveals award space not visible through partner programs, especially on the JFK-NRT route.',
        warning: null,
        steps: [
          'Log into your Amex account and navigate to "Transfer Points"',
          'Select ANA Mileage Club as your transfer partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for economy award availability at ana.com',
          'Look for "Saver" labeled economy space on the NYC → Tokyo route',
          'Book and pay ~$50–$100 in carrier fees at checkout',
        ],
        programs: ['Membership Rewards'],
      },
      {
        airline: 'Economy via Turkish Miles&Smiles',
        partner: 'Transfer to Turkish Airlines Miles&Smiles · 1:1 ratio',
        points: 25000, cashValue: 850, cpp: 3.4,
        note: "Turkish Miles&Smiles offers some of the lowest published mileage rates for Star Alliance partners including ANA — often 20–30% fewer miles than booking through other programs.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Turkish Airlines Miles&Smiles (1:1 transfer)',
          'Allow 1–2 business days for the transfer to complete',
          'Search for ANA (NH) partner award availability on turkishairlines.com',
          'Look for Star Alliance economy rates on the NYC → Tokyo route',
          'Book and pay ~$50–$100 in carrier fees',
        ],
        programs: ['Capital One Miles', 'ThankYou Points'],
      },
    ],
  },

  'NYC-FCO': {
    luxury: [
      {
        airline: 'ITA Airways Business Class via Aeroplan',
        partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
        points: 55000, cashValue: 2800, cpp: 5.1,
        note: 'Air Canada Aeroplan is one of the few programs that lets you book ITA Airways (Italy\'s flag carrier) business class. ITA Business features lie-flat seats and exceptional Italian hospitality on a route most cards can\'t access well.',
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Air Canada Aeroplan as your transfer partner (1:1, typically instant)',
          'Search for ITA Airways (AZ) business class awards on aeroplan.com',
          'Look for partner award space on ITA metal to Rome FCO',
          'Confirm seat availability before transferring points',
          'Book and pay ~$100–$200 in taxes and fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'Economy to Rome via Air France/KLM',
        partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
        points: 30000, cashValue: 650, cpp: 2.2,
        note: 'Flying Blue economy to Rome via Paris or Amsterdam is one of the most available transatlantic economy options. Air France and KLM both operate this connection with solid award availability.',
        warning: null,
        steps: [
          'Log into your card account and go to "Transfer Points"',
          'Select Air France/KLM Flying Blue (1:1, typically instant)',
          'Check flyingblue.com on the 1st of each month for Promo Rewards',
          'Search for economy award availability on airfrance.com with connection via CDG or AMS',
          'Look for "Reward" labeled economy seats routed through Paris',
          'Book and pay ~$50–$100 in carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points', 'Wells Fargo Rewards'],
      },
    ],
  },

  'NYC-SPAIN': {
    luxury: [
      {
        airline: 'Iberia Business Class',
        partner: 'Transfer to Iberia Plus · 1:1 ratio',
        points: 34000, cashValue: 2500, cpp: 7.3,
        note: "Iberia Avios on Iberia's own metal to Madrid is one of the all-time best sweet spots in points and miles. At 34,000 Avios for business class from NYC to Spain — on a fully lie-flat product with no fuel surcharges — this is a redemption experienced travelers save specifically for this route.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Iberia Plus as your transfer partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for Iberia business class awards at iberia.com/avios',
          'Look for direct JFK-MAD service or connecting via Madrid for BCN',
          'Book — no fuel surcharges on Iberia-operated flights',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'Iberia Economy',
        partner: 'Transfer to Iberia Plus · 1:1 ratio',
        points: 17000, cashValue: 600, cpp: 3.5,
        note: "Iberia economy Avios to Spain is one of the best transatlantic economy values in points and miles. Direct JFK-MAD service with no fuel surcharges and significantly fewer miles than most competing programs.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Iberia Plus as your transfer partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for Iberia economy awards at iberia.com/avios',
          'Look for direct JFK-MAD service — typically 17,000 Avios one-way',
          'Book — Iberia does not add fuel surcharges on its own flights',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
  },

  'NYC-DXB': {
    luxury: [
      {
        airline: 'Emirates Business Class via Aeroplan',
        partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
        points: 75000, cashValue: 5500, cpp: 7.3,
        note: "Air Canada Aeroplan lets you book Emirates Business Class at fixed Saver rates — one of the best ways to experience the Emirates Business Suite without needing Emirates Skywards miles. Emirates connects to Dubai via major international hubs.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Air Canada Aeroplan as your transfer partner (1:1, typically instant)',
          'Search for Emirates (EK) business class awards on aeroplan.com',
          'Look for EK-operated flights connecting via Emirates hubs to DXB',
          'Confirm availability before transferring points',
          'Book and pay ~$150–$300 in taxes and carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'Economy to Dubai via Aeroplan',
        partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
        points: 35000, cashValue: 900, cpp: 2.6,
        note: 'Aeroplan economy to Dubai via a connecting hub is one of the most accessible ways to use transferable points on this route. No fuel surcharges on most partner-operated segments.',
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Air Canada Aeroplan as your transfer partner (1:1, typically instant)',
          'Search for economy awards to DXB on aeroplan.com',
          'Look for flights connecting via Air Canada, United, or Lufthansa hubs',
          'No fuel surcharges on most non-Emirates partner metal',
          'Book and pay ~$80–$150 in carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
  },

  'NYC-SIN': {
    luxury: [
      {
        airline: 'Singapore Airlines Business Class',
        partner: 'Transfer to Singapore KrisFlyer · 1:1 ratio',
        points: 88000, cashValue: 7200, cpp: 8.1,
        note: "Singapore Airlines is consistently rated the world's best airline. The Business Class Suites with direct aisle access and full lie-flat beds set the global benchmark for premium long-haul travel.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Singapore Airlines KrisFlyer as your partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for Saver business class availability at singaporeair.com',
          'Look for the "Saver" mileage tier — this is where the value is',
          'Book and pay ~$80–$200 in taxes and carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'Economy via United MileagePlus',
        partner: 'Transfer to United MileagePlus · 1:1 ratio',
        points: 40000, cashValue: 900, cpp: 2.3,
        note: "United MileagePlus lets you book Singapore Airlines economy at Saver rates via the Star Alliance partnership. Singapore Airlines economy is widely praised for its service quality even in economy class.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select United MileagePlus as your partner (1:1, instant)',
          'Search for economy Saver awards on united.com',
          'Filter for Singapore Airlines (SQ) operated flights for best service',
          'Look for the "Saver" labeled economy awards',
          'Pay ~$80–$150 in carrier fees at checkout',
        ],
        programs: ['Ultimate Rewards', 'Bilt Points'],
      },
      {
        airline: 'Singapore Airlines Economy',
        partner: 'Transfer to Singapore KrisFlyer · 1:1 ratio',
        points: 40000, cashValue: 900, cpp: 2.3,
        note: "Booking Singapore Airlines economy directly through KrisFlyer often reveals award space not visible through partner programs. Singapore Airlines economy is one of the most consistently praised in the industry.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Singapore Airlines KrisFlyer (1:1 transfer)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for Saver economy availability at singaporeair.com',
          'Book the award using your KrisFlyer miles',
          'Pay ~$80–$150 in carrier fees at checkout',
        ],
        programs: ['Membership Rewards', 'Capital One Miles', 'ThankYou Points'],
      },
    ],
  },

  'WC-TYO': {
    luxury: [
      {
        airline: 'ANA Business Class via Virgin Atlantic',
        partner: 'Transfer to Virgin Atlantic Flying Club · 1:1 ratio',
        points: 47500, cashValue: 4000, cpp: 8.4,
        note: "Virgin Atlantic Flying Club's 47,500-mile rate for ANA business class from the West Coast is one of the best sweet spots in aviation. ANA flies direct from LAX and SFO to NRT/HND and is rated the world's #1 airline.",
        warning: 'ANA partner awards via Virgin Atlantic must be booked by phone — call Virgin Atlantic Flying Club at 1-800-365-9500 after transferring points.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant — points appear in your account within minutes',
          'Call Virgin Atlantic Flying Club at 1-800-365-9500 to book the ANA award',
          'Confirm ANA business class availability on your LAX/SFO → NRT/HND dates',
          'Pay ~$100–$200 in taxes and carrier fees at time of booking',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'ANA or United Economy',
        partner: 'Transfer to United MileagePlus · 1:1 ratio',
        points: 22000, cashValue: 650, cpp: 3.0,
        note: "West Coast to Tokyo has some of the best economy Saver award availability in the MileagePlus program. United flies direct LAX-NRT and SFO-NRT, and ANA partner space is frequently available.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select United MileagePlus as your transfer partner (1:1, instant)',
          'Search for Saver economy on united.com for your West Coast → Tokyo route',
          'Filter for United (UA) direct flights or ANA (NH) partner awards',
          'Look for the "Saver" labeled awards — best availability 3–4 weeks out',
          'Book and pay ~$50–$100 in carrier fees at checkout',
        ],
        programs: ['Ultimate Rewards', 'Bilt Points'],
      },
      {
        airline: 'ANA Economy',
        partner: 'Transfer to ANA Mileage Club · 1:1 ratio',
        points: 35000, cashValue: 650, cpp: 1.9,
        note: 'Amex transfers to ANA Mileage Club at 1:1. Booking directly through ANA often reveals economy award space not visible through partner programs on the LAX/SFO-NRT route.',
        warning: null,
        steps: [
          'Log into your Amex account and navigate to "Transfer Points"',
          'Select ANA Mileage Club as your transfer partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for economy award availability at ana.com',
          'Look for "Saver" labeled economy space on your West Coast → Tokyo dates',
          'Book and pay ~$50–$100 in carrier fees',
        ],
        programs: ['Membership Rewards'],
      },
      {
        airline: 'Economy via Turkish Miles&Smiles',
        partner: 'Transfer to Turkish Airlines Miles&Smiles · 1:1 ratio',
        points: 25000, cashValue: 650, cpp: 2.6,
        note: "Turkish Miles&Smiles has some of the lowest mileage rates for Star Alliance economy — including ANA and United on the West Coast to Tokyo route. Often 20–30% fewer miles than competing programs.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Turkish Airlines Miles&Smiles (1:1 transfer)',
          'Allow 1–2 business days for the transfer to complete',
          'Search for ANA or United economy partner award space on turkishairlines.com',
          'Look for Star Alliance economy rates on the WC → Tokyo route',
          'Book and pay ~$50–$100 in carrier fees',
        ],
        programs: ['Capital One Miles', 'ThankYou Points'],
      },
    ],
  },

  'WC-LON': {
    luxury: [
      {
        airline: 'Virgin Atlantic Upper Class',
        partner: 'Transfer to Virgin Atlantic Flying Club · 1:1 ratio',
        points: 50000, cashValue: 4200, cpp: 8.4,
        note: 'Virgin Atlantic Upper Class from the West Coast to London features fully lie-flat suites and is available at excellent Flying Club rates. Direct service operates from both LAX and SFO to LHR.',
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant — points appear in your account within minutes',
          'Search for Upper Class award availability at virginatlantic.com',
          'Look for "Reward" Upper Class flights from LAX or SFO to LHR',
          'Book and pay ~$200–$400 in taxes and carrier fees',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'ThankYou Points', 'Bilt Points'],
      },
    ],
    budget: [
      {
        airline: 'British Airways Economy',
        partner: 'Transfer to British Airways Executive Club · 1:1 ratio',
        points: 30000, cashValue: 700, cpp: 2.3,
        note: 'British Airways Avios for West Coast to London includes direct service on BA metal from LAX and SFO. Note that BA charges significant fuel surcharges on its own flights — factor in $150–$350 in fees.',
        warning: 'British Airways charges fuel surcharges on its own flights. Expect $150–$350 in fees on top of the Avios cost.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select British Airways Executive Club as your transfer partner (1:1)',
          'Avios typically arrive within minutes',
          'Search for economy "Reward" availability at britishairways.com',
          'Look for Avios-labeled economy seats from LAX or SFO to LHR',
          'Book — factor in the $150–$350 in BA fuel surcharges added at checkout',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
  },
}

// ── Default fallback for programs/routes not in the database ──
const DEFAULT_FALLBACKS = {
  'Ultimate Rewards': {
    luxury: {
      airline: 'Business Class via United MileagePlus',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 60000, cashValue: 2800, cpp: 4.7,
      note: 'United MileagePlus gives you access to 40+ Star Alliance partner airlines for business class worldwide. Availability and pricing varies by route — search united.com for Saver business availability on your specific dates.',
      warning: null,
      steps: [
        'Log into Chase and go to "Transfer to Travel Partners"',
        'Select United MileagePlus (1:1, instant transfer)',
        'Search for Saver business class availability on united.com',
        'Filter for partner airlines on your specific route',
        'Look for the "Saver" label — the lowest mileage tier',
        'Book and pay only taxes and carrier fees at checkout',
      ],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan covers Star Alliance carriers worldwide with no fuel surcharges on most partners. For destinations not in our route database, search aeroplan.com for the best available economy rates.',
      warning: null,
      steps: [
        'Log into Chase and go to "Transfer to Travel Partners"',
        'Select Air Canada Aeroplan (1:1, instant transfer)',
        'Search aeroplan.com for economy Saver availability on your route',
        'Look for Star Alliance carriers serving your destination',
        'No fuel surcharges on most Aeroplan partners',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
  'Membership Rewards': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue gives you access to Air France, KLM, and 30+ partner airlines worldwide. Check flyingblue.com on the 1st of each month for Promo Rewards discounts.',
      warning: null,
      steps: [
        'Log into your Amex account and go to "Transfer Points"',
        'Select Air France/KLM Flying Blue (1:1, typically instant)',
        'Check flyingblue.com for monthly Promo Rewards before transferring',
        'Search for business class award availability on airfrance.com',
        'Book and pay ~$100–$200 in taxes and fees',
        'Flying Blue covers worldwide destinations via Air France, KLM, and partners',
      ],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan covers Star Alliance worldwide with no fuel surcharges on most partners. Amex transfers to Aeroplan at 1:1 instantly — one of the most versatile economy options.',
      warning: null,
      steps: [
        'Log into your Amex account and go to "Transfer Points"',
        'Select Air Canada Aeroplan (1:1, instant transfer)',
        'Search aeroplan.com for economy Saver availability on your route',
        'Look for Star Alliance carriers serving your destination',
        'No fuel surcharges on most Aeroplan partners',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
  'Capital One Miles': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Capital One transfer partner at 1:1. Monthly Promo Rewards can cut costs by 25–50% — check on the 1st of each month.',
      warning: null,
      steps: [
        'Log into your Capital One account and go to "Transfer Miles"',
        'Select Air France/KLM Flying Blue (1:1)',
        'Check flyingblue.com for monthly Promo Rewards before transferring',
        'Search for business class award availability on airfrance.com',
        'Book and pay ~$100–$200 in taxes and fees',
        'Flying Blue covers worldwide destinations via Air France, KLM, and partners',
      ],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan is a Capital One partner. No fuel surcharges on most Star Alliance partners makes this one of the cleanest economy options for international routes.',
      warning: null,
      steps: [
        'Log into Capital One and go to "Transfer Miles"',
        'Select Air Canada Aeroplan (1:1)',
        'Search aeroplan.com for economy Saver availability on your route',
        'Look for Star Alliance carriers serving your destination',
        'No fuel surcharges on most Aeroplan partners',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
  'ThankYou Points': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Citi ThankYou partner at 1:1. Monthly Promo Rewards can significantly reduce the points cost — check the 1st of each month.',
      warning: null,
      steps: [
        'Log into your Citi account and go to "Transfer Points"',
        'Select Air France/KLM Flying Blue (1:1)',
        'Check flyingblue.com on the 1st of each month for Promo Rewards',
        'Search for business class award availability on airfrance.com',
        'Book and pay ~$100–$200 in taxes and fees',
        'Flying Blue covers Air France, KLM, and 30+ global partners',
      ],
    },
    budget: {
      airline: 'Economy via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: "LifeMiles consistently offers some of the lowest economy rates for Star Alliance partners worldwide. An underrated gem in the Citi ThankYou partner lineup.",
      warning: null,
      steps: [
        'Log into your Citi account and go to "Transfer Points"',
        'Select Avianca LifeMiles (1:1)',
        'Search lifemiles.com for Star Alliance economy awards on your route',
        'Look for United, Air Canada, Lufthansa, or other Star Alliance carriers',
        'LifeMiles typically charges fewer miles than other Star Alliance programs',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
  'Bilt Points': {
    luxury: {
      airline: 'Business Class via United MileagePlus',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 60000, cashValue: 2800, cpp: 4.7,
      note: 'Bilt transfers to United instantly at 1:1. United Polaris business class and 40+ Star Alliance partner airlines are accessible — search united.com for Saver business availability.',
      warning: null,
      steps: [
        'Log into your Bilt account and go to "Transfer Points"',
        'Select United MileagePlus (1:1, instant)',
        'Search for Saver business class availability on united.com',
        'Filter for partner airlines on your specific route',
        'Look for the "Saver" label — the lowest mileage tier',
        'Book and pay only taxes and carrier fees at checkout',
      ],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Bilt transfers to Aeroplan instantly at 1:1. No fuel surcharges on most Star Alliance partners makes this one of the cleanest economy options for international travel.',
      warning: null,
      steps: [
        'Log into Bilt and go to "Transfer Points"',
        'Select Air Canada Aeroplan (1:1, instant)',
        'Search aeroplan.com for economy Saver availability on your route',
        'Look for Star Alliance carriers serving your destination',
        'No fuel surcharges on most Aeroplan partners',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
  'Wells Fargo Rewards': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Wells Fargo Autograph Journey partner at 1:1. Monthly Promo Rewards can reduce costs by 25–50%.',
      warning: null,
      steps: [
        'Log into your Wells Fargo account and go to "Transfer Points"',
        'Select Air France/KLM Flying Blue (1:1)',
        'Check flyingblue.com on the 1st of each month for Promo Rewards',
        'Search for business class award availability on airfrance.com',
        'Book and pay ~$100–$200 in taxes and fees',
        'Flying Blue covers Air France, KLM, and global SkyTeam partners',
      ],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: 'Aeroplan is a Wells Fargo Autograph Journey partner. No fuel surcharges on most Star Alliance partners for international economy routes.',
      warning: null,
      steps: [
        'Log into Wells Fargo and go to "Transfer Points"',
        'Select Air Canada Aeroplan (1:1)',
        'Search aeroplan.com for economy Saver availability on your route',
        'Look for Star Alliance carriers serving your destination',
        'No fuel surcharges on most Aeroplan partners',
        'Book and pay only carrier fees at checkout',
      ],
    },
  },
}

// Airline card programs — these earn miles directly, no transfer needed
const AIRLINE_DIRECT = {
  'United MileagePlus': {
    luxury: {
      airline: 'United Polaris Business Class',
      partner: 'Book directly — no transfer needed',
      points: 57500, cashValue: 3000, cpp: 5.2,
      note: 'United Polaris features lie-flat beds, amenity kits, and premium dining. Search united.com for Saver business availability on your specific route — availability varies significantly by dates and routing.',
      warning: null,
      steps: ['Log into your United MileagePlus account at united.com', 'Search Award Travel and select Business class', 'Filter by "Saver" to find the lowest mileage tier', 'Look for Polaris cabin availability on your route', 'Book directly with your MileagePlus miles', 'Pay only taxes and carrier fees at checkout'],
    },
    budget: {
      airline: 'United Economy Saver',
      partner: 'Book directly — no transfer needed',
      points: 20000, cashValue: 450, cpp: 2.3,
      note: 'United Saver economy awards offer wide availability on United\'s own metal and 40+ Star Alliance partners. Search by "Saver" tier on united.com for the lowest mileage rates.',
      warning: null,
      steps: ['Log into your United MileagePlus account at united.com', 'Search Award Travel and select Economy class', 'Filter by "Saver" to find the lowest mileage tier', 'Look for United or partner carrier availability', 'Book directly with your MileagePlus miles', 'Pay only carrier fees (~$5–$50) at checkout'],
    },
  },
  'Delta SkyMiles': {
    luxury: {
      airline: 'Delta One Business Class',
      partner: 'Book directly — no transfer needed',
      points: 80000, cashValue: 3000, cpp: 3.8,
      note: "Delta uses dynamic pricing — award costs vary by date and demand. Use the award calendar on delta.com to find the lowest price across flexible dates. Delta One features lie-flat suites on wide-body international routes.",
      warning: null,
      steps: ['Log into your SkyMiles account at delta.com', 'Search Award Travel and select Business class', 'Use the calendar view to compare prices across dates', 'Look for Delta One cabin availability on your route', 'Book directly with your SkyMiles miles', 'Pay only taxes at checkout'],
    },
    budget: {
      airline: 'Delta Economy',
      partner: 'Book directly — no transfer needed',
      points: 20000, cashValue: 400, cpp: 2.0,
      note: "Delta's dynamic pricing means award costs fluctuate — the calendar view is your best tool. Mid-week departures and off-peak dates typically show the lowest SkyMiles prices.",
      warning: null,
      steps: ['Log into delta.com and search Award Travel', 'Use the award calendar to compare prices across dates', 'Mid-week departures are often 20–30% cheaper in miles', 'Book directly with your SkyMiles balance', 'Cancel free within 24 hours if plans change', 'Pay only carrier fees at checkout'],
    },
  },
  'AAdvantage Miles': {
    luxury: {
      airline: 'American Airlines Business Class',
      partner: 'Book directly — no transfer needed',
      points: 57500, cashValue: 2800, cpp: 4.9,
      note: "American's MilesAAver awards are available at fixed rates on AA's own metal and oneworld partners. Search aa.com for MilesAAver business class availability on your specific route.",
      warning: null,
      steps: ['Log into your AAdvantage account at aa.com', 'Search for Award Flights and select Business class', "Look for 'MilesAAver' labeled awards — the lowest mileage tier", 'Check availability on American-operated or oneworld partner flights', 'Book directly with your AAdvantage miles', 'Pay only carrier fees at checkout'],
    },
    budget: {
      airline: 'American Airlines Economy Saver',
      partner: 'Book directly — no transfer needed',
      points: 15000, cashValue: 350, cpp: 2.3,
      note: "AAdvantage MilesAAver economy awards start at fixed rates. No change fees on AAdvantage award tickets — you can re-book if better availability opens up.",
      warning: null,
      steps: ['Log into aa.com and search for Award Flights', "Look for 'MilesAAver' labeled economy awards", 'Check availability on American and oneworld partner carriers', 'Book directly with your AAdvantage miles', 'No change fees if you need to reschedule', 'Pay only carrier fees at checkout'],
    },
  },
  'Rapid Rewards': {
    luxury: {
      airline: 'Southwest Business Select',
      partner: 'Book directly — no transfer needed',
      points: 25000, cashValue: 750, cpp: 3.0,
      note: "Southwest Business Select is the premium fare tier — priority A1–A15 boarding, premium snacks, and a fully refundable fare. Southwest flies primarily domestic US, Mexico, Caribbean, and Central America.",
      warning: null,
      steps: ['Log into southwest.com and search for your route', "Select 'Business Select' fare tier", 'Southwest is revenue-based — all seats available at all times', 'Apply your Rapid Rewards points at checkout', 'A1–A15 boarding gives you first pick of seats', 'Fully refundable — cancel to reusable travel funds anytime'],
    },
    budget: {
      airline: 'Southwest Wanna Get Away',
      partner: 'Book directly — no transfer needed',
      points: 10000, cashValue: 300, cpp: 3.0,
      note: "Southwest Wanna Get Away is the best-value tier — revenue-based redemptions with no blackout dates, no change fees, and 2 free checked bags. Points never expire.",
      warning: null,
      steps: ['Log into southwest.com and search for your route', "Select 'Wanna Get Away' fare tier for lowest points cost", 'All seats available — no blackout dates ever', 'Apply your Rapid Rewards points at checkout', '2 free checked bags included', 'Cancel to reusable travel funds with no fees'],
    },
  },
  'Alaska Mileage Plan': {
    luxury: {
      airline: 'Alaska Airlines First Class',
      partner: 'Book directly — no transfer needed',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: "Alaska first class with Saver awards is one of the most consistent values in US aviation — wide seats, complimentary meal service, and exceptional on-time performance.",
      warning: null,
      steps: ['Log into your Mileage Plan account at alaskaair.com', 'Search Award Travel and select First Class', "Look for 'Saver' labeled first class awards", 'Book directly with your Mileage Plan miles', 'Pay only carrier fees (~$5–$25) at checkout', 'Priority boarding included for first class passengers'],
    },
    budget: {
      airline: 'Alaska Airlines Economy Saver',
      partner: 'Book directly — no transfer needed',
      points: 10000, cashValue: 250, cpp: 2.5,
      note: "Alaska Mileage Plan has a clean award chart with consistent Saver rates. Alaska miles never expire with account activity, and the carrier has the best on-time performance of any major US airline.",
      warning: null,
      steps: ['Log into alaskaair.com and search Award Travel', "Look for 'Saver' labeled economy awards", 'Book directly with your Mileage Plan miles', 'Pay only carrier fees (~$5–$15) at checkout', "Alaska miles never expire with any account activity", 'Alaska has the fewest lost bags of any major US carrier'],
    },
  },
  'TrueBlue Points': {
    luxury: {
      airline: 'JetBlue Mint Business Class',
      partner: 'Book directly — no transfer needed',
      points: 30000, cashValue: 900, cpp: 3.0,
      note: "JetBlue Mint is the most accessible lie-flat business class in the US. Revenue-based pricing means all Mint seats are always available — no blackout dates, no award charts to navigate.",
      warning: null,
      steps: ['Log into jetblue.com and search for Mint cabin availability', "Mint available on JFK/BOS to LHR, LAX, SFO, and select international routes", 'All Mint seats available as TrueBlue awards at all times', 'Apply your TrueBlue points at checkout', 'Mint includes private suites, lie-flat beds, and full meal service', 'Pay remaining fare balance if any'],
    },
    budget: {
      airline: 'JetBlue Economy',
      partner: 'Book directly — no transfer needed',
      points: 8000, cashValue: 130, cpp: 1.6,
      note: "JetBlue is revenue-based with no blackout dates — all seats available at all times. Economy includes the most legroom of any US carrier and complimentary snacks on every flight.",
      warning: null,
      steps: ['Search any route on jetblue.com', 'All fares available as TrueBlue awards — no blackout dates', "Choose the lowest fare tier for fewest points", 'Apply TrueBlue points at checkout', 'Free carry-on and complimentary snacks included', 'Points never expire with account activity'],
    },
  },
}

const AIRLINE_PROGRAM_KEYS = new Set(Object.keys(AIRLINE_DIRECT))

function getResults(program, fromAirport, toAirport) {
  const fromCode = fromAirport?.code || ''
  const toCode   = toAirport?.code  || ''

  // Airline co-branded cards book directly — use airline-specific recommendations
  if (AIRLINE_PROGRAM_KEYS.has(program)) {
    return { isDefault: false, isDomestic: false, ...AIRLINE_DIRECT[program] }
  }

  // Domestic US routes — skip international partners entirely and use domestic-optimized picks
  if (isDomesticUS(fromCode, toCode)) {
    const domestic = DOMESTIC_FALLBACKS[program] || DOMESTIC_FALLBACKS['Ultimate Rewards']
    return { isDefault: false, isDomestic: true, luxury: domestic.luxury, budget: domestic.budget }
  }

  // Build both orderings of the route key
  const fromMetro = getMetro(fromCode)
  const toMetro   = getMetro(toCode)
  const route = ROUTE_DB[`${fromMetro}-${toMetro}`] || ROUTE_DB[`${toMetro}-${fromMetro}`]

  // Route not in database — show default fallback
  if (!route) {
    const fallback = DEFAULT_FALLBACKS[program] || DEFAULT_FALLBACKS['Ultimate Rewards']
    return { isDefault: true, isDomestic: false, ...fallback }
  }

  // Find first luxury and budget option compatible with user's card program
  const luxury = route.luxury.find(opt => opt.programs.includes(program))
  const budget = route.budget.find(opt => opt.programs.includes(program))

  // Program not compatible with any option on this route — use fallback
  if (!luxury || !budget) {
    const fallback = DEFAULT_FALLBACKS[program] || DEFAULT_FALLBACKS['Ultimate Rewards']
    return { isDefault: true, isDomestic: false, ...fallback }
  }

  return { isDefault: false, isDomestic: false, luxury, budget }
}

// ── US airport codes for domestic route detection ──────────
const US_AIRPORTS = new Set([
  'JFK', 'LGA', 'EWR', 'LAX', 'SFO', 'ORD', 'ATL', 'DFW', 'DEN', 'SEA',
  'MIA', 'BOS', 'LAS', 'PHX', 'IAH', 'IAD', 'DCA', 'BWI', 'SAN', 'MSP',
  'DTW', 'PHL', 'CLT', 'SLC', 'PDX', 'HNL', 'ANC',
  'MCO', 'TPA', 'FLL', 'RSW', 'PBI', 'JAX', 'SAV', 'CHS', 'RDU', 'ORF',
  'RIC', 'PIT', 'BUF', 'ROC', 'SYR', 'ALB', 'BDL', 'PVD', 'MHT', 'PWM',
  'BTV', 'CLE', 'CMH', 'IND', 'CVG', 'MDW', 'MKE', 'MSN', 'DSM', 'OMA',
  'MCI', 'STL', 'BNA', 'MEM', 'MSY', 'BHM', 'HSV', 'MOB', 'JAN', 'LIT',
  'TUL', 'OKC', 'AUS', 'SAT', 'HOU', 'DAL', 'ELP', 'TUS', 'ABQ', 'OAK',
  'SJC', 'SMF', 'BUR', 'LGB', 'ONT', 'SNA', 'FAT', 'RNO', 'BOI', 'GEG',
  'GSP', 'GSO',
])

function isDomesticUS(fromCode, toCode) {
  return US_AIRPORTS.has(fromCode) && US_AIRPORTS.has(toCode)
}

// ── Domestic US redemption recommendations by card program ──
const DOMESTIC_FALLBACKS = {
  'Ultimate Rewards': {
    luxury: {
      airline: 'United First Class',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "United MileagePlus is the best use of Chase Ultimate Rewards on domestic routes. Saver first class awards include premium seating, full meal service on longer routes, and priority boarding — for a fraction of what a cash first class ticket costs. Instant transfers mean you can jump on award availability the moment it opens.",
      warning: null,
      steps: [
        'Log into Chase and go to "Transfer to Travel Partners"',
        'Select United MileagePlus (1:1, instant transfer)',
        'Go to united.com and search Award Travel, selecting First Class',
        'Use the award calendar to compare prices across dates',
        'Look for "Saver" labeled first class awards — the lowest mileage tier',
        'Pay only ~$5–$15 in carrier fees at checkout',
      ],
    },
    budget: {
      airline: 'United Economy Saver',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "United Saver economy awards are the most consistent domestic value in the Chase UR ecosystem. Starting at 12,500 miles, wide availability across United's domestic network, no fuel surcharges, and instant transfers so you can book as soon as you spot availability.",
      warning: null,
      steps: [
        'Log into Chase and go to "Transfer to Travel Partners"',
        'Select United MileagePlus (1:1, instant transfer)',
        'Go to united.com and search Award Travel in Economy class',
        'Look for "Saver" labeled economy awards — lowest mileage tier',
        'Best availability on weekdays and off-peak dates',
        'Pay only ~$5–$15 in carrier fees at checkout',
      ],
    },
  },
  'Membership Rewards': {
    luxury: {
      airline: 'Delta First Class',
      partner: 'Transfer to Delta SkyMiles · 1:1 ratio',
      points: 50000, cashValue: 500, cpp: 1.0,
      note: "Delta SkyMiles is the best domestic transfer partner for Amex Membership Rewards. Delta uses dynamic pricing — first class awards typically run 30,000–60,000 SkyMiles depending on the route and date. Use the award calendar on delta.com to find the lowest price before transferring.",
      warning: 'Delta uses dynamic pricing — award costs vary by date and demand. Always check the award calendar across multiple dates on delta.com before transferring points.',
      steps: [
        'Log into your Amex account and go to "Transfer Points"',
        'Select Delta SkyMiles as your transfer partner (1:1, typically instant)',
        'Before transferring, go to delta.com and use the award calendar to find lowest pricing',
        'Look for First Class availability — mid-week and off-peak dates are cheapest',
        'Transfer only after confirming the award is bookable',
        'Pay only taxes (~$5–$15) at checkout',
      ],
    },
    budget: {
      airline: 'Delta Economy',
      partner: 'Transfer to Delta SkyMiles · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Delta SkyMiles domestic economy is the top domestic play for Amex Gold cardholders. Dynamic pricing can yield excellent value — especially on off-peak dates and shorter routes. Use the award calendar to compare costs across multiple dates before transferring.",
      warning: null,
      steps: [
        'Log into your Amex account and go to "Transfer Points"',
        'Select Delta SkyMiles as your transfer partner (1:1, typically instant)',
        'Before transferring, go to delta.com and use the award calendar view',
        'Compare prices across multiple dates — weekdays typically show fewer miles',
        'Transfer after confirming your award seat is available',
        'Pay only taxes (~$5–$15) at checkout',
      ],
    },
  },
  'ThankYou Points': {
    luxury: {
      airline: 'American Airlines First Class',
      partner: 'Transfer to American AAdvantage · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "Citi ThankYou transfers directly to American AAdvantage at 1:1 — making it the cleanest domestic play in the ThankYou lineup. American First Class on domestic routes features wider seats, premium dining on longer routes, and priority boarding. No change fees on AAdvantage award tickets.",
      warning: null,
      steps: [
        'Log into your Citi account and go to "Transfer Points"',
        'Select American AAdvantage as your transfer partner (1:1)',
        'Allow up to 24–48 hours for the transfer to complete',
        'Go to aa.com and search for Award Flights, selecting First class',
        "Look for 'MilesAAver' labeled first class awards — the lowest mileage tier",
        'Pay only carrier fees (~$5–$20) at checkout',
      ],
    },
    budget: {
      airline: 'American Airlines Economy',
      partner: 'Transfer to American AAdvantage · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Citi ThankYou transfers directly to American AAdvantage at 1:1. MilesAAver economy awards start at 12,500 miles on domestic routes with wide availability across American's network. No change fees — you can re-book if better award space opens up.",
      warning: null,
      steps: [
        'Log into your Citi account and go to "Transfer Points"',
        'Select American AAdvantage as your transfer partner (1:1)',
        'Allow up to 24–48 hours for the transfer to complete',
        'Go to aa.com and search for Award Flights in Economy class',
        "Look for 'MilesAAver' labeled economy awards — lowest mileage tier",
        'Pay only carrier fees (~$5–$20) at checkout',
      ],
    },
  },
  'Capital One Miles': {
    luxury: {
      airline: 'United First Class via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 400, cpp: 1.6,
      note: "Avianca LifeMiles is the strongest domestic option for Capital One miles — it books Star Alliance partners including United at some of the lowest published rates. Domestic United first class runs ~20,000–25,000 LifeMiles, significantly cheaper than booking through United directly.",
      warning: null,
      steps: [
        'Log into Capital One and go to "Transfer Miles"',
        'Select Avianca LifeMiles (1:1)',
        'Allow 1–2 business days for the transfer to complete',
        'Go to lifemiles.com and search for United (UA) First Class on your route',
        'Look for Star Alliance first class availability',
        'Pay only carrier fees (~$5–$20) at checkout',
      ],
    },
    budget: {
      airline: 'United Economy via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 7500, cashValue: 150, cpp: 2.0,
      note: "Avianca LifeMiles has some of the lowest rates for Star Alliance domestic economy — as low as 7,500 miles for shorter routes on United. One of the best-value domestic redemptions available in the Capital One transfer partner lineup.",
      warning: null,
      steps: [
        'Log into Capital One and go to "Transfer Miles"',
        'Select Avianca LifeMiles (1:1)',
        'Allow 1–2 business days for the transfer to complete',
        'Go to lifemiles.com and search for United (UA) economy on your domestic route',
        'Look for the lowest-tier Star Alliance economy availability',
        'Pay only carrier fees (~$5–$15) at checkout',
      ],
    },
  },
  'Bilt Points': {
    luxury: {
      airline: 'United First Class',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "Bilt transfers to United MileagePlus instantly at 1:1 — making it one of the fastest domestic upgrade plays. United Saver first class awards start around 30,000 miles and include full meal service, premium seating, and priority boarding on domestic routes.",
      warning: null,
      steps: [
        'Log into Bilt and go to "Transfer Points"',
        'Select United MileagePlus (1:1, instant)',
        'Go to united.com and search Award Travel in First Class',
        'Use the award calendar to find the lowest price across dates',
        'Look for "Saver" labeled first class awards',
        'Pay only ~$5–$15 in carrier fees at checkout',
      ],
    },
    budget: {
      airline: 'United Economy Saver',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Bilt transfers to United MileagePlus instantly — the fastest way to book a domestic award. Saver economy on domestic routes starts at 12,500 miles, no fuel surcharges, and the instant transfer means you can lock in award space before it disappears.",
      warning: null,
      steps: [
        'Log into Bilt and go to "Transfer Points"',
        'Select United MileagePlus (1:1, instant)',
        'Go to united.com and search Award Travel in Economy class',
        'Look for "Saver" labeled economy awards — lowest mileage tier',
        'Best availability on weekdays and off-peak dates',
        'Pay only ~$5–$15 in carrier fees at checkout',
      ],
    },
  },
  'Wells Fargo Rewards': {
    luxury: {
      airline: 'United First Class via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 400, cpp: 1.6,
      note: "Avianca LifeMiles is the strongest domestic play in the Wells Fargo Autograph Journey partner lineup — it books Star Alliance partners including United at low fixed rates. Domestic first class on United runs ~20,000–25,000 LifeMiles.",
      warning: null,
      steps: [
        'Log into Wells Fargo and go to "Transfer Points"',
        'Select Avianca LifeMiles (1:1)',
        'Allow 1–2 business days for the transfer to complete',
        'Go to lifemiles.com and search for United (UA) First Class on your domestic route',
        'Look for Star Alliance first class availability',
        'Pay only carrier fees (~$5–$20) at checkout',
      ],
    },
    budget: {
      airline: 'United Economy via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 7500, cashValue: 150, cpp: 2.0,
      note: "Avianca LifeMiles has the lowest domestic economy rates of any Wells Fargo Autograph Journey transfer partner — as low as 7,500 miles for short United hops. Most travelers overlook this; it's one of the best domestic redemption values in the lineup.",
      warning: null,
      steps: [
        'Log into Wells Fargo and go to "Transfer Points"',
        'Select Avianca LifeMiles (1:1)',
        'Allow 1–2 business days for the transfer to complete',
        'Go to lifemiles.com and search for United (UA) economy on your domestic route',
        'Look for the lowest-tier Star Alliance economy availability',
        'Pay only carrier fees (~$5–$15) at checkout',
      ],
    },
  },
}

// ── Haul detection (display label only) ──
const LONG_HAUL_CODES  = new Set(['NRT','HND','KIX','ICN','PEK','PVG','HKG','SIN','BKK','KUL','SYD','MEL','AKL','MNL','CGK','LHR','LGW','STN','CDG','ORY','AMS','FRA','MUC','FCO','MXP','BCN','MAD','ZRH','VIE','CPH','ARN','HEL','DUB','LIS','ATH','DXB','AUH','DOH','TLV','CAI','JNB','CPT','GRU','EZE','BOG','LIM','SCL'])
const MEDIUM_HAUL_CODES = new Set(['LAX','SFO','SEA','DFW','ATL','DEN','LAS','PHX','IAD','DCA','BWI','MCO','HNL','ORD','MDW','MIA','BOS','YYZ','YVR','YUL','CUN','MEX'])
function detectHaul(from, to) {
  const f = from?.code || '', t = to?.code || ''
  if (LONG_HAUL_CODES.has(f) || LONG_HAUL_CODES.has(t))   return 'long'
  if (MEDIUM_HAUL_CODES.has(f) || MEDIUM_HAUL_CODES.has(t)) return 'medium'
  return 'short'
}

// ─────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────

function ApplyButton({ children, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        background: ACCENT,
        color: '#fff',
        fontWeight: '500',
        fontSize: '13px',
        padding: '9px 20px',
        borderRadius: '999px',
        textDecoration: 'none',
        letterSpacing: '-0.1px',
        boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 4px 16px ${GLOW}`,
        transition: 'background 0.15s, box-shadow 0.15s, transform 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#4f46e5'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ACCENT
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </a>
  )
}

function ResultCard({ badge, isLuxury, result, userPoints }) {
  const userPts    = parseInt((userPoints || '0').replace(/\D/g, ''), 10) || 0
  const hasEnough  = userPts >= result.points
  const shortfall  = result.points - userPts

  return (
    <div style={{
      background: SURFACE,
      borderRadius: '16px',
      border: isLuxury
        ? `1px solid rgba(99,102,241,0.3)`
        : `1px solid ${BORDER_MID}`,
      overflow: 'hidden',
      boxShadow: isLuxury ? `0 0 0 1px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.3)` : 'none',
    }}>
      {/* Card header strip */}
      <div style={{
        padding: '13px 18px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: isLuxury ? 'rgba(99,102,241,0.06)' : ELEVATED,
      }}>
        <span style={{
          fontSize: '11px', fontWeight: '600',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: isLuxury ? ACCENT_LT : MUTED,
          border: `1px solid ${isLuxury ? 'rgba(129,140,248,0.25)' : BORDER_MID}`,
          borderRadius: '999px',
          padding: '3px 10px',
          background: isLuxury ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
        }}>
          {badge}
        </span>
        {hasEnough
          ? <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '500' }}>✓ You have enough</span>
          : <span style={{ color: '#f87171', fontSize: '12px', fontWeight: '500' }}>{shortfall.toLocaleString()} pts short</span>
        }
      </div>

      {/* Card body */}
      <div style={{ padding: '18px 20px' }}>
        {/* Transfer partner */}
        <p style={{
          fontSize: '11px', fontWeight: '500',
          color: SUBTLE, letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: '6px',
        }}>
          {result.partner}
        </p>

        {/* Airline */}
        <h3 style={{
          color: TEXT, fontSize: '20px',
          fontWeight: '700', letterSpacing: '-0.4px',
          lineHeight: 1.15, marginBottom: '14px',
        }}>
          {result.airline}
        </h3>

        {/* Metrics row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px', marginBottom: '14px',
        }}>
          {[
            { label: 'Points required', value: result.points.toLocaleString() },
            { label: 'Est. cash value',  value: `$${result.cashValue.toLocaleString()}` },
            { label: 'Value per point',  value: `${result.cpp}¢` },
          ].map(m => (
            <div key={m.label} style={{
              background: ELEVATED,
              border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '9px 10px',
            }}>
              <div style={{
                color: SUBTLE, fontSize: '10px',
                fontWeight: '600', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '3px',
              }}>{m.label}</div>
              <div style={{
                color: isLuxury ? ACCENT_LT : TEXT,
                fontSize: '14px', fontWeight: '700',
                letterSpacing: '-0.3px',
              }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Warning box */}
        {result.warning && (
          <div style={{
            background: 'rgba(251,191,36,0.07)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '10px', padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <span style={{ color: '#fbbf24', fontSize: '13px', flexShrink: 0 }}>⚠</span>
            <p style={{ color: '#fcd34d', fontSize: '13px', lineHeight: 1.55, margin: 0, fontWeight: '400' }}>
              {result.warning}
            </p>
          </div>
        )}

        {/* Note */}
        <p style={{
          color: MUTED, fontSize: '13px',
          lineHeight: 1.6, marginBottom: '16px',
          fontStyle: 'italic',
        }}>
          {result.note}
        </p>

        {/* How to book */}
        <div style={{
          borderTop: `1px solid ${BORDER}`,
          paddingTop: '14px', marginBottom: '14px',
        }}>
          <p style={{
            color: SUBTLE, fontSize: '11px',
            fontWeight: '600', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '10px',
          }}>
            How to book this
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {result.steps.map((step, i) => (
              <li key={i} style={{
                display: 'flex', gap: '10px',
                marginBottom: '7px', alignItems: 'flex-start',
              }}>
                <span style={{
                  flexShrink: 0,
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  background: isLuxury ? 'rgba(99,102,241,0.15)' : ELEVATED,
                  border: `1px solid ${isLuxury ? 'rgba(99,102,241,0.3)' : BORDER_MID}`,
                  color: isLuxury ? ACCENT_LT : MUTED,
                  fontSize: '10px', fontWeight: '700',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginTop: '2px',
                }}>
                  {i + 1}
                </span>
                <span style={{ color: MUTED, fontSize: '13px', lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Transfer irreversibility notice */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: `1px solid rgba(99,102,241,0.15)`,
          borderRadius: '10px', padding: '12px 16px',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <span style={{ color: ACCENT_LT, fontSize: '13px', flexShrink: 0 }}>ℹ</span>
          <p style={{
            color: MUTED, fontSize: '12px',
            lineHeight: 1.55, margin: 0, fontWeight: '400',
          }}>
            Always verify award availability before transferring points — transfers are typically irreversible.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { isPro } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const card   = state?.card   || null
  const points = state?.points || ''
  const from   = state?.from   || null
  const to     = state?.to     || null

  // Increment search counter — skip entirely for Pro users
  useEffect(() => {
    if (!isPro) incrementSearchCount()
  }, [isPro])

  const handleNewSearch = () => {
    if (isPro) {
      navigate('/search')
      return
    }
    const { count } = getSearchData()
    if (count >= 2) {
      setShowModal(true)
    } else {
      navigate('/search')
    }
  }

  if (!card) {
    return (
      <div style={{ background: BG, minHeight: '100vh', color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          background: SURFACE,
          border: `1px solid ${BORDER_MID}`,
          borderRadius: '16px', padding: '48px 40px',
          maxWidth: '400px', width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>✈</div>
          <h1 style={{ color: TEXT, fontSize: '18px', fontWeight: '700', marginBottom: '10px', letterSpacing: '-0.3px' }}>
            No search found
          </h1>
          <p style={{ color: MUTED, fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
            Start a search to see your personalized redemption options.
          </p>
          <button
            onClick={() => navigate('/search')}
            style={{
              background: ACCENT, color: '#fff',
              fontWeight: '500', padding: '11px 24px',
              borderRadius: '999px', border: 'none',
              cursor: 'pointer', fontSize: '14px',
              boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 4px 16px ${GLOW}`,
            }}
          >
            ← Start a search
          </button>
        </div>
      </div>
    )
  }

  const program  = card.program || card.miles || 'Ultimate Rewards'
  const { isDefault, isDomestic, luxury, budget } = getResults(program, from, to)
  const haul     = detectHaul(from, to)
  const haulLabel = isDomestic
    ? 'Domestic route'
    : haul === 'long' ? 'Long-haul route' : haul === 'medium' ? 'Medium-haul route' : 'Short-haul route'
  const userPts = parseInt((points || '0').replace(/\D/g, ''), 10) || 0
  const luxuryShortfall = luxury.points - userPts
  const hasEnoughForLuxury = userPts >= luxury.points

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>

      {/* ── Navbar ── */}
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
          maxWidth: '740px', margin: '0 auto', padding: '0 24px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleNewSearch}
              style={{
                background: ACCENT, color: '#fff',
                fontWeight: '500', fontSize: '13px',
                padding: '7px 16px', borderRadius: '999px',
                border: 'none', cursor: 'pointer',
                letterSpacing: '-0.1px',
                boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 2px 10px ${GLOW}`,
                transition: 'background 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              ← New search
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none', color: MUTED,
                fontWeight: '400', fontSize: '13px',
                padding: '7px 14px', borderRadius: '999px',
                border: `1px solid ${BORDER_MID}`,
                cursor: 'pointer', letterSpacing: '-0.1px',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER_MID }}
            >
              Home
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '740px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Route header ── */}
        <div style={{
          textAlign: 'center',
          paddingTop: '32px', paddingBottom: '24px',
          position: 'relative',
        }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%)',
          }} />

          <p style={{
            fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: SUBTLE, marginBottom: '10px',
          }}>
            {card.name} · {program} · {haulLabel}
          </p>

          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontWeight: '700',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            marginBottom: '10px',
            background: `linear-gradient(180deg, ${TEXT} 30%, ${MUTED} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {from?.code ?? from} → {to?.code ?? to}
          </h1>

          <p style={{ color: SUBTLE, fontSize: '14px', marginBottom: '8px', letterSpacing: '-0.1px' }}>
            {from?.city} to {to?.city}
          </p>

          <p style={{ color: SUBTLE, fontSize: '12px', lineHeight: 1.6, marginBottom: '16px', maxWidth: '480px', margin: '0 auto 16px' }}>
            Results assume availability from a major hub. If your departure airport has limited international service, consider departing from a nearby gateway airport.
          </p>

          <p style={{ color: MUTED, fontSize: '15px', lineHeight: 1.6 }}>
            Best redemption with{' '}
            <span style={{ color: TEXT, fontWeight: '600' }}>{points} {pointsLabel(program)}</span>
          </p>
        </div>

        {/* Free tier note */}
        <p style={{
          textAlign: 'center', color: SUBTLE,
          fontSize: '12px', lineHeight: 1.6,
          marginBottom: '20px',
        }}>
          Results show average award pricing across dates. Sign up for full access to search specific dates and see live availability.
        </p>

        {/* Route notice banners */}
        {isDomestic && (
          <div style={{
            background: ELEVATED,
            border: `1px solid ${BORDER_MID}`,
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '15px', flexShrink: 0 }}>🇺🇸</span>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Domestic route detected. We've prioritized the best domestic airline partners for your card — international programs like Air France Flying Blue or Aeroplan are excluded since they offer poor value on US domestic awards.
            </p>
          </div>
        )}
        {!isDomestic && isDefault && (
          <div style={{
            background: ELEVATED,
            border: `1px solid ${BORDER_MID}`,
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '15px', flexShrink: 0 }}>🗺️</span>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              We're building out more routes every week. Here's the best general redemption strategy for your card — availability varies by route and dates.
            </p>
          </div>
        )}

        {/* ── Result cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          <ResultCard badge="Luxury Option" isLuxury={true}  result={luxury} userPoints={points} />
          <ResultCard badge="Budget Option" isLuxury={false} result={budget} userPoints={points} />
        </div>

        {/* ── Affiliate card grid ── */}
        {(() => {
          const visibleCards = PROMO_CARDS.filter(rec => rec.name !== card?.name)
          return (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{
                  color: TEXT, fontSize: '20px',
                  fontWeight: '700', letterSpacing: '-0.35px',
                  marginBottom: '8px', lineHeight: 1.3,
                }}>
                  {hasEnoughForLuxury
                    ? 'Earn more points for your next trip'
                    : `${luxuryShortfall.toLocaleString()} points short of the luxury option`
                  }
                </h2>
                <p style={{ color: MUTED, fontSize: '14px', lineHeight: 1.6 }}>
                  Each card comes with a welcome bonus that could cover this entire trip.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {visibleCards.map(rec => (
                  <div key={rec.name} style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER_MID}`,
                    borderRadius: '14px', padding: '18px',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: SUBTLE, fontSize: '10px',
                        fontWeight: '600', textTransform: 'uppercase',
                        letterSpacing: '0.1em', marginBottom: '4px',
                      }}>
                        {rec.issuer}
                      </p>
                      <h3 style={{
                        color: TEXT, fontSize: '14px',
                        fontWeight: '600', marginBottom: '5px',
                        lineHeight: 1.3, letterSpacing: '-0.2px',
                      }}>
                        {rec.name}
                      </h3>
                      <p style={{ color: SUBTLE, fontSize: '11px', lineHeight: 1.5, marginBottom: '10px' }}>
                        {CARD_DETAILS[rec.name]?.tagline}
                      </p>
                      {CARD_DETAILS[rec.name]?.bonus && (
                        <div style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${BORDER_MID}`,
                          borderRadius: '8px', padding: '9px 12px',
                          marginBottom: '4px',
                        }}>
                          <p style={{
                            color: MUTED, fontSize: '11px',
                            fontWeight: '400', lineHeight: 1.5, margin: 0,
                          }}>
                            {CARD_DETAILS[rec.name].bonus}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* TODO: Replace with real affiliate link from FlexOffers */}
                    <ApplyButton href={AFFILIATE_LINKS[rec.name]}>Apply now →</ApplyButton>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Upgrade CTA — hidden for Pro users ── */}
        {!isPro && (
          <div style={{
            textAlign: 'center', marginBottom: '28px',
            padding: '28px 24px',
            background: SURFACE,
            border: `1px solid ${BORDER_MID}`,
            borderRadius: '16px',
          }}>
            <p style={{
              color: TEXT, fontSize: '17px',
              fontWeight: '600', lineHeight: 1.45,
              marginBottom: '20px', letterSpacing: '-0.3px',
              maxWidth: '400px', margin: '0 auto 20px',
            }}>
              Unlock unlimited searches, live award availability, and transfer bonus alerts.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: ACCENT, color: '#fff',
                fontWeight: '500', fontSize: '15px',
                padding: '13px 32px', borderRadius: '999px',
                border: 'none', cursor: 'pointer',
                letterSpacing: '-0.2px',
                boxShadow: `0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px ${GLOW}`,
                transition: 'background 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get Unlimited Access
            </button>
          </div>
        )}

      </main>

      {showModal && !isPro && <UpgradeModal />}
    </div>
  )
}
