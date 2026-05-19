import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'

// ── Affiliate links ───────────────────────────────────────────────────
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
    bonus: '75,000 point welcome bonus after $5,000 spend in 3 months, worth up to $1,500 in travel',
  },
  'Capital One Venture X': {
    tagline: '15+ transfer partners · $395/yr · $300 travel credit',
    bonus: '75,000 mile welcome bonus after $4,000 spend in 3 months, worth up to $1,400 in travel',
  },
  'Citi Strata Premier': {
    tagline: '15+ transfer partners · $95/yr · Singapore & Turkish access',
    bonus: '60,000 point welcome bonus after $4,000 spend in 3 months, worth up to $1,100 in travel',
  },
  'Amex Gold': {
    tagline: '20+ partners · $325/yr · 4x dining & groceries',
    bonus: '60,000–100,000 point welcome bonus after $8,000 spend in 6 months, worth up to $2,000 in travel',
  },
  'Wells Fargo Autograph Journey': {
    tagline: 'Flying Blue & Aeroplan · $95/yr · 60k bonus offer',
    bonus: '60,000 point welcome bonus after $3,000 spend in 3 months, worth up to $1,000 in travel',
  },
}

// ── Points label - avoid "ThankYou Points points" etc. ──────────────
function pointsLabel(program) {
  if (/miles|points|mileage|plan/i.test(program)) return program
  return program + ' points'
}

// ── Affiliate card promo grid ────────────────────────────────────────
const PROMO_CARDS = [
  { name: 'Chase Sapphire Preferred',  issuer: 'Chase' },
  { name: 'Capital One Venture X',     issuer: 'Capital One' },
  { name: 'Citi Strata Premier',       issuer: 'Citi' },
  { name: 'Amex Gold',                 issuer: 'American Express' },
]

// ── localStorage search counter ──────────────────────────────────────
function getSearchData() {
  const today = new Date().toISOString().slice(0, 10)
  const storedDate  = localStorage.getItem('pp_search_date')
  const storedCount = parseInt(localStorage.getItem('pp_search_count') || '0', 10)
  if (storedDate !== today) return { count: 0, date: today }
  return { count: storedCount, date: today }
}

function incrementSearchCount() {
  const isFresh = sessionStorage.getItem('pp_fresh_search') === 'true'
  if (!isFresh) return getSearchData().count
  sessionStorage.removeItem('pp_fresh_search')
  const today = new Date().toISOString().slice(0, 10)
  const { count } = getSearchData()
  const next = count + 1
  localStorage.setItem('pp_search_date',  today)
  localStorage.setItem('pp_search_count', String(next))
  return next
}

// ─────────────────────────────────────────────────────────────────────
// ROUTE-AWARE RECOMMENDATION ENGINE (unchanged)
// ─────────────────────────────────────────────────────────────────────

const PROGRAM_PARTNERS = {
  'Ultimate Rewards':    ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'United MileagePlus', 'Japan Airlines Mileage Bank'],
  'Membership Rewards':  ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'ANA Mileage Club', 'Delta SkyMiles'],
  'Capital One Miles':   ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Air Canada Aeroplan', 'Turkish Airlines Miles&Smiles', 'Avianca LifeMiles'],
  'ThankYou Points':     ['Virgin Atlantic Flying Club', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Turkish Airlines Miles&Smiles', 'Avianca LifeMiles'],
  'Bilt Points':         ['Virgin Atlantic Flying Club', 'British Airways Avios', 'Air France Flying Blue', 'Singapore KrisFlyer', 'Iberia Avios', 'Air Canada Aeroplan', 'United MileagePlus', 'Turkish Airlines Miles&Smiles'],
  'Wells Fargo Rewards': ['Air France Flying Blue', 'Air Canada Aeroplan', 'Avianca LifeMiles'],
}

const METRO_MAP = {
  JFK: 'NYC', LGA: 'NYC', EWR: 'NYC',
  LHR: 'LON', LGW: 'LON', STN: 'LON',
  CDG: 'PAR', ORY: 'PAR',
  NRT: 'TYO', HND: 'TYO',
  LAX: 'WC',  SFO: 'WC', SEA: 'WC',
  BCN: 'SPAIN', MAD: 'SPAIN',
}
function getMetro(code) { return METRO_MAP[code] || code }

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
          'Transfers to Virgin Atlantic Flying Club are instant. Points appear in your account within minutes.',
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
        note: 'British Airways Avios can be excellent value for transatlantic economy, but BA charges significant fuel surcharges on its own flights. Factor in $150–$350 in fees on top of your Avios.',
        warning: 'British Airways charges fuel surcharges on its own flights. Expect $150–$350 in fees on top of the Avios cost.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select British Airways Executive Club as your transfer partner (1:1)',
          'Avios typically arrive within minutes',
          'Search for economy "Reward" availability at britishairways.com',
          'Look for Avios-labeled economy seats on the JFK/EWR/LGA → LHR/LGW route',
          'Book. Note the $150–$350 fuel surcharge BA adds on its own flights.',
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
        note: "Virgin Atlantic Flying Club's 47,500-mile rate for ANA's The Room business class is one of the single best sweet spots in all of points and miles. ANA is consistently rated the world's #1 airline, with fully flat suites and direct aisle access.",
        warning: 'ANA partner awards via Virgin Atlantic must be booked by phone. Call Virgin Atlantic Flying Club at 1-800-365-9500 after transferring points.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant. Points appear in your account within minutes.',
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
        note: "Turkish Miles&Smiles offers some of the lowest published mileage rates for Star Alliance partners including ANA, often 20–30% fewer miles than booking through other programs.",
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
        note: "Air Canada Aeroplan is one of the few programs that lets you book ITA Airways (Italy's flag carrier) business class. ITA Business features lie-flat seats and exceptional Italian hospitality on a route most cards can't access well.",
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
        note: "Iberia Avios on Iberia's own metal to Madrid is one of the all-time best sweet spots in points and miles. At 34,000 Avios for business class from NYC to Spain, on a fully lie-flat product with no fuel surcharges, this is a redemption experienced travelers save specifically for this route.",
        warning: null,
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Iberia Plus as your transfer partner (1:1)',
          'Allow 1–3 business days for the transfer to complete',
          'Search for Iberia business class awards at iberia.com/avios',
          'Look for direct JFK-MAD service or connecting via Madrid for BCN',
          'Book. No fuel surcharges on Iberia-operated flights.',
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
          'Look for direct JFK-MAD service, typically 17,000 Avios one-way',
          'Book. Iberia does not add fuel surcharges on its own flights.',
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
        note: "Air Canada Aeroplan lets you book Emirates Business Class at fixed Saver rates, one of the best ways to experience the Emirates Business Suite without needing Emirates Skywards miles.",
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
          'Look for the "Saver" mileage tier. This is where the value is.',
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
        warning: 'ANA partner awards via Virgin Atlantic must be booked by phone. Call Virgin Atlantic Flying Club at 1-800-365-9500 after transferring points.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select Virgin Atlantic Flying Club as your transfer partner (1:1)',
          'Transfers to Virgin Atlantic Flying Club are instant. Points appear in your account within minutes.',
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
          'Look for the "Saver" labeled awards, best availability 3–4 weeks out',
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
        note: "Turkish Miles&Smiles has some of the lowest mileage rates for Star Alliance economy, including ANA and United on the West Coast to Tokyo route. Often 20–30% fewer miles than competing programs.",
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
          'Transfers to Virgin Atlantic Flying Club are instant. Points appear in your account within minutes.',
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
        note: 'British Airways Avios for West Coast to London includes direct service on BA metal from LAX and SFO. Note that BA charges significant fuel surcharges on its own flights. Factor in $150–$350 in fees.',
        warning: 'British Airways charges fuel surcharges on its own flights. Expect $150–$350 in fees on top of the Avios cost.',
        steps: [
          'Log into your card account and navigate to "Transfer Points"',
          'Select British Airways Executive Club as your transfer partner (1:1)',
          'Avios typically arrive within minutes',
          'Search for economy "Reward" availability at britishairways.com',
          'Look for Avios-labeled economy seats from LAX or SFO to LHR',
          'Book and note the $150–$350 in BA fuel surcharges added at checkout',
        ],
        programs: ['Ultimate Rewards', 'Membership Rewards', 'Capital One Miles', 'Bilt Points'],
      },
    ],
  },
}

// ── Default fallback for programs/routes not in the database ──────────
const DEFAULT_FALLBACKS = {
  'Ultimate Rewards': {
    luxury: {
      airline: 'Business Class via United MileagePlus',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 60000, cashValue: 2800, cpp: 4.7,
      note: 'United MileagePlus gives you access to 40+ Star Alliance partner airlines for business class worldwide. Availability and pricing varies by route. Search united.com for Saver business availability on your specific dates.',
      warning: null,
      steps: ['Log into Chase and go to "Transfer to Travel Partners"', 'Select United MileagePlus (1:1, instant transfer)', 'Search for Saver business class availability on united.com', 'Filter for partner airlines on your specific route', 'Look for the "Saver" label, the lowest mileage tier', 'Book and pay only taxes and carrier fees at checkout'],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan covers Star Alliance carriers worldwide with no fuel surcharges on most partners. For destinations not in our route database, search aeroplan.com for the best available economy rates.',
      warning: null,
      steps: ['Log into Chase and go to "Transfer to Travel Partners"', 'Select Air Canada Aeroplan (1:1, instant transfer)', 'Search aeroplan.com for economy Saver availability on your route', 'Look for Star Alliance carriers serving your destination', 'No fuel surcharges on most Aeroplan partners', 'Book and pay only carrier fees at checkout'],
    },
  },
  'Membership Rewards': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue gives you access to Air France, KLM, and 30+ partner airlines worldwide. Check flyingblue.com on the 1st of each month for Promo Rewards discounts.',
      warning: null,
      steps: ['Log into your Amex account and go to "Transfer Points"', 'Select Air France/KLM Flying Blue (1:1, typically instant)', 'Check flyingblue.com for monthly Promo Rewards before transferring', 'Search for business class award availability on airfrance.com', 'Book and pay ~$100–$200 in taxes and fees', 'Flying Blue covers worldwide destinations via Air France, KLM, and partners'],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan covers Star Alliance worldwide with no fuel surcharges on most partners. Amex transfers to Aeroplan at 1:1 instantly, one of the most versatile economy options.',
      warning: null,
      steps: ['Log into your Amex account and go to "Transfer Points"', 'Select Air Canada Aeroplan (1:1, instant transfer)', 'Search aeroplan.com for economy Saver availability on your route', 'Look for Star Alliance carriers serving your destination', 'No fuel surcharges on most Aeroplan partners', 'Book and pay only carrier fees at checkout'],
    },
  },
  'Capital One Miles': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Capital One transfer partner at 1:1. Monthly Promo Rewards can cut costs by 25–50%. Check on the 1st of each month.',
      warning: null,
      steps: ['Log into your Capital One account and go to "Transfer Miles"', 'Select Air France/KLM Flying Blue (1:1)', 'Check flyingblue.com for monthly Promo Rewards before transferring', 'Search for business class award availability on airfrance.com', 'Book and pay ~$100–$200 in taxes and fees', 'Flying Blue covers worldwide destinations via Air France, KLM, and partners'],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Aeroplan is a Capital One partner. No fuel surcharges on most Star Alliance partners makes this one of the cleanest economy options for international routes.',
      warning: null,
      steps: ['Log into Capital One and go to "Transfer Miles"', 'Select Air Canada Aeroplan (1:1)', 'Search aeroplan.com for economy Saver availability on your route', 'Look for Star Alliance carriers serving your destination', 'No fuel surcharges on most Aeroplan partners', 'Book and pay only carrier fees at checkout'],
    },
  },
  'ThankYou Points': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Citi ThankYou partner at 1:1. Monthly Promo Rewards can significantly reduce the points cost. Check on the 1st of each month.',
      warning: null,
      steps: ['Log into your Citi account and go to "Transfer Points"', 'Select Air France/KLM Flying Blue (1:1)', 'Check flyingblue.com on the 1st of each month for Promo Rewards', 'Search for business class award availability on airfrance.com', 'Book and pay ~$100–$200 in taxes and fees', 'Flying Blue covers Air France, KLM, and 30+ global partners'],
    },
    budget: {
      airline: 'Economy via Avianca LifeMiles',
      partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: "LifeMiles consistently offers some of the lowest economy rates for Star Alliance partners worldwide. An underrated gem in the Citi ThankYou partner lineup.",
      warning: null,
      steps: ['Log into your Citi account and go to "Transfer Points"', 'Select Avianca LifeMiles (1:1)', 'Search lifemiles.com for Star Alliance economy awards on your route', 'Look for United, Air Canada, Lufthansa, or other Star Alliance carriers', 'LifeMiles typically charges fewer miles than other Star Alliance programs', 'Book and pay only carrier fees at checkout'],
    },
  },
  'Bilt Points': {
    luxury: {
      airline: 'Business Class via United MileagePlus',
      partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 60000, cashValue: 2800, cpp: 4.7,
      note: 'Bilt transfers to United instantly at 1:1. United Polaris business class and 40+ Star Alliance partner airlines are accessible. Search united.com for Saver business availability.',
      warning: null,
      steps: ['Log into your Bilt account and go to "Transfer Points"', 'Select United MileagePlus (1:1, instant)', 'Search for Saver business class availability on united.com', 'Filter for partner airlines on your specific route', 'Look for the "Saver" label, the lowest mileage tier', 'Book and pay only taxes and carrier fees at checkout'],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 30000, cashValue: 700, cpp: 2.3,
      note: 'Bilt transfers to Aeroplan instantly at 1:1. No fuel surcharges on most Star Alliance partners makes this one of the cleanest economy options for international travel.',
      warning: null,
      steps: ['Log into Bilt and go to "Transfer Points"', 'Select Air Canada Aeroplan (1:1, instant)', 'Search aeroplan.com for economy Saver availability on your route', 'Look for Star Alliance carriers serving your destination', 'No fuel surcharges on most Aeroplan partners', 'Book and pay only carrier fees at checkout'],
    },
  },
  'Wells Fargo Rewards': {
    luxury: {
      airline: 'Business Class via Air France Flying Blue',
      partner: 'Transfer to Air France Flying Blue · 1:1 ratio',
      points: 55000, cashValue: 2800, cpp: 5.1,
      note: 'Air France Flying Blue is a Wells Fargo Autograph Journey partner at 1:1. Monthly Promo Rewards can reduce costs by 25–50%.',
      warning: null,
      steps: ['Log into your Wells Fargo account and go to "Transfer Points"', 'Select Air France/KLM Flying Blue (1:1)', 'Check flyingblue.com on the 1st of each month for Promo Rewards', 'Search for business class award availability on airfrance.com', 'Book and pay ~$100–$200 in taxes and fees', 'Flying Blue covers Air France, KLM, and global SkyTeam partners'],
    },
    budget: {
      airline: 'Economy via Air Canada Aeroplan',
      partner: 'Transfer to Air Canada Aeroplan · 1:1 ratio',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: 'Aeroplan is a Wells Fargo Autograph Journey partner. No fuel surcharges on most Star Alliance partners for international economy routes.',
      warning: null,
      steps: ['Log into Wells Fargo and go to "Transfer Points"', 'Select Air Canada Aeroplan (1:1)', 'Search aeroplan.com for economy Saver availability on your route', 'Look for Star Alliance carriers serving your destination', 'No fuel surcharges on most Aeroplan partners', 'Book and pay only carrier fees at checkout'],
    },
  },
}

// ── Airline co-branded card programs ─────────────────────────────────
const AIRLINE_DIRECT = {
  'United MileagePlus': {
    luxury: {
      airline: 'United Polaris Business Class', partner: 'Book directly - no transfer needed',
      points: 57500, cashValue: 3000, cpp: 5.2,
      note: 'United Polaris features lie-flat beds, amenity kits, and premium dining. Search united.com for Saver business availability on your specific route.',
      warning: null,
      steps: ['Log into your United MileagePlus account at united.com', 'Search Award Travel and select Business class', 'Filter by "Saver" to find the lowest mileage tier', 'Look for Polaris cabin availability on your route', 'Book directly with your MileagePlus miles', 'Pay only taxes and carrier fees at checkout'],
    },
    budget: {
      airline: 'United Economy Saver', partner: 'Book directly - no transfer needed',
      points: 20000, cashValue: 450, cpp: 2.3,
      note: "United Saver economy awards offer wide availability on United's own metal and 40+ Star Alliance partners.",
      warning: null,
      steps: ['Log into your United MileagePlus account at united.com', 'Search Award Travel and select Economy class', 'Filter by "Saver" to find the lowest mileage tier', 'Look for United or partner carrier availability', 'Book directly with your MileagePlus miles', 'Pay only carrier fees (~$5–$50) at checkout'],
    },
  },
  'Delta SkyMiles': {
    luxury: {
      airline: 'Delta One Business Class', partner: 'Book directly - no transfer needed',
      points: 80000, cashValue: 3000, cpp: 3.8,
      note: "Delta uses dynamic pricing. Award costs vary by date and demand. Use the award calendar on delta.com to find the lowest price across flexible dates.",
      warning: null,
      steps: ['Log into your SkyMiles account at delta.com', 'Search Award Travel and select Business class', 'Use the calendar view to compare prices across dates', 'Look for Delta One cabin availability on your route', 'Book directly with your SkyMiles miles', 'Pay only taxes at checkout'],
    },
    budget: {
      airline: 'Delta Economy', partner: 'Book directly - no transfer needed',
      points: 20000, cashValue: 400, cpp: 2.0,
      note: "Delta's dynamic pricing means award costs fluctuate. The calendar view is your best tool. Mid-week departures and off-peak dates typically show the lowest SkyMiles prices.",
      warning: null,
      steps: ['Log into delta.com and search Award Travel', 'Use the award calendar to compare prices across dates', 'Mid-week departures are often 20–30% cheaper in miles', 'Book directly with your SkyMiles balance', 'Cancel free within 24 hours if plans change', 'Pay only carrier fees at checkout'],
    },
  },
  'AAdvantage Miles': {
    luxury: {
      airline: 'American Airlines Business Class', partner: 'Book directly - no transfer needed',
      points: 57500, cashValue: 2800, cpp: 4.9,
      note: "American's MilesAAver awards are available at fixed rates on AA's own metal and oneworld partners.",
      warning: null,
      steps: ['Log into your AAdvantage account at aa.com', 'Search for Award Flights and select Business class', "Look for 'MilesAAver' labeled awards, the lowest mileage tier", 'Check availability on American-operated or oneworld partner flights', 'Book directly with your AAdvantage miles', 'Pay only carrier fees at checkout'],
    },
    budget: {
      airline: 'American Airlines Economy Saver', partner: 'Book directly - no transfer needed',
      points: 15000, cashValue: 350, cpp: 2.3,
      note: "AAdvantage MilesAAver economy awards start at fixed rates. No change fees on AAdvantage award tickets.",
      warning: null,
      steps: ['Log into aa.com and search for Award Flights', "Look for 'MilesAAver' labeled economy awards", 'Check availability on American and oneworld partner carriers', 'Book directly with your AAdvantage miles', 'No change fees if you need to reschedule', 'Pay only carrier fees at checkout'],
    },
  },
  'Rapid Rewards': {
    luxury: {
      airline: 'Southwest Business Select', partner: 'Book directly - no transfer needed',
      points: 25000, cashValue: 750, cpp: 3.0,
      note: "Southwest Business Select is the premium fare tier with priority A1–A15 boarding, premium snacks, and a fully refundable fare.",
      warning: null,
      steps: ['Log into southwest.com and search for your route', "Select 'Business Select' fare tier", 'Southwest is revenue-based. All seats available at all times.', 'Apply your Rapid Rewards points at checkout', 'A1–A15 boarding gives you first pick of seats', 'Fully refundable. Cancel to reusable travel funds anytime.'],
    },
    budget: {
      airline: 'Southwest Wanna Get Away', partner: 'Book directly - no transfer needed',
      points: 10000, cashValue: 300, cpp: 3.0,
      note: "Southwest Wanna Get Away is the best-value tier with no blackout dates, no change fees, and 2 free checked bags.",
      warning: null,
      steps: ['Log into southwest.com and search for your route', "Select 'Wanna Get Away' fare tier for lowest points cost", 'All seats available, no blackout dates ever', 'Apply your Rapid Rewards points at checkout', '2 free checked bags included', 'Cancel to reusable travel funds with no fees'],
    },
  },
  'Alaska Mileage Plan': {
    luxury: {
      airline: 'Alaska Airlines First Class', partner: 'Book directly - no transfer needed',
      points: 25000, cashValue: 650, cpp: 2.6,
      note: "Alaska first class with Saver awards is one of the most consistent values in US aviation.",
      warning: null,
      steps: ['Log into your Mileage Plan account at alaskaair.com', 'Search Award Travel and select First Class', "Look for 'Saver' labeled first class awards", 'Book directly with your Mileage Plan miles', 'Pay only carrier fees (~$5–$25) at checkout', 'Priority boarding included for first class passengers'],
    },
    budget: {
      airline: 'Alaska Airlines Economy Saver', partner: 'Book directly - no transfer needed',
      points: 10000, cashValue: 250, cpp: 2.5,
      note: "Alaska Mileage Plan has a clean award chart with consistent Saver rates. Alaska miles never expire with account activity.",
      warning: null,
      steps: ['Log into alaskaair.com and search Award Travel', "Look for 'Saver' labeled economy awards", 'Book directly with your Mileage Plan miles', 'Pay only carrier fees (~$5–$15) at checkout', "Alaska miles never expire with any account activity", 'Alaska has the fewest lost bags of any major US carrier'],
    },
  },
  'TrueBlue Points': {
    luxury: {
      airline: 'JetBlue Mint Business Class', partner: 'Book directly - no transfer needed',
      points: 30000, cashValue: 900, cpp: 3.0,
      note: "JetBlue Mint is the most accessible lie-flat business class in the US. Revenue-based pricing means all Mint seats are always available.",
      warning: null,
      steps: ['Log into jetblue.com and search for Mint cabin availability', "Mint available on JFK/BOS to LHR, LAX, SFO, and select international routes", 'All Mint seats available as TrueBlue awards at all times', 'Apply your TrueBlue points at checkout', 'Mint includes private suites, lie-flat beds, and full meal service', 'Pay remaining fare balance if any'],
    },
    budget: {
      airline: 'JetBlue Economy', partner: 'Book directly - no transfer needed',
      points: 8000, cashValue: 130, cpp: 1.6,
      note: "JetBlue is revenue-based with no blackout dates. Economy includes the most legroom of any US carrier.",
      warning: null,
      steps: ['Search any route on jetblue.com', 'All fares available as TrueBlue awards, no blackout dates', "Choose the lowest fare tier for fewest points", 'Apply TrueBlue points at checkout', 'Free carry-on and complimentary snacks included', 'Points never expire with account activity'],
    },
  },
}

const AIRLINE_PROGRAM_KEYS = new Set(Object.keys(AIRLINE_DIRECT))

// ── Domestic fallbacks ────────────────────────────────────────────────
const DOMESTIC_FALLBACKS = {
  'Ultimate Rewards': {
    luxury: {
      airline: 'United First Class', partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "United MileagePlus is the best use of Chase Ultimate Rewards on domestic routes. Saver first class awards include premium seating, full meal service on longer routes, and priority boarding.",
      warning: null,
      steps: ['Log into Chase and go to "Transfer to Travel Partners"', 'Select United MileagePlus (1:1, instant transfer)', 'Go to united.com and search Award Travel, selecting First Class', 'Use the award calendar to compare prices across dates', 'Look for "Saver" labeled first class awards, the lowest mileage tier', 'Pay only ~$5–$15 in carrier fees at checkout'],
    },
    budget: {
      airline: 'United Economy Saver', partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "United Saver economy awards are the most consistent domestic value in the Chase UR ecosystem. Starting at 12,500 miles, wide availability across United's domestic network.",
      warning: null,
      steps: ['Log into Chase and go to "Transfer to Travel Partners"', 'Select United MileagePlus (1:1, instant transfer)', 'Go to united.com and search Award Travel in Economy class', 'Look for "Saver" labeled economy awards, the lowest mileage tier', 'Best availability on weekdays and off-peak dates', 'Pay only ~$5–$15 in carrier fees at checkout'],
    },
  },
  'Membership Rewards': {
    luxury: {
      airline: 'Delta First Class', partner: 'Transfer to Delta SkyMiles · 1:1 ratio',
      points: 50000, cashValue: 500, cpp: 1.0,
      note: "Delta SkyMiles is the best domestic transfer partner for Amex Membership Rewards. Use the award calendar on delta.com to find the lowest price before transferring.",
      warning: 'Delta uses dynamic pricing. Award costs vary by date and demand. Always check the award calendar across multiple dates on delta.com before transferring points.',
      steps: ['Log into your Amex account and go to "Transfer Points"', 'Select Delta SkyMiles as your transfer partner (1:1, typically instant)', 'Before transferring, go to delta.com and use the award calendar to find lowest pricing', 'Look for First Class availability. Mid-week and off-peak dates are cheapest.', 'Transfer only after confirming the award is bookable', 'Pay only taxes (~$5–$15) at checkout'],
    },
    budget: {
      airline: 'Delta Economy', partner: 'Transfer to Delta SkyMiles · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Delta SkyMiles domestic economy is the top domestic play for Amex Gold cardholders. Use the award calendar to compare costs across multiple dates before transferring.",
      warning: null,
      steps: ['Log into your Amex account and go to "Transfer Points"', 'Select Delta SkyMiles as your transfer partner (1:1, typically instant)', 'Before transferring, go to delta.com and use the award calendar view', 'Compare prices across multiple dates. Weekdays typically show fewer miles.', 'Transfer after confirming your award seat is available', 'Pay only taxes (~$5–$15) at checkout'],
    },
  },
  'ThankYou Points': {
    luxury: {
      airline: 'American Airlines First Class', partner: 'Transfer to American AAdvantage · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "Citi ThankYou transfers directly to American AAdvantage at 1:1, making it the cleanest domestic play in the ThankYou lineup.",
      warning: null,
      steps: ['Log into your Citi account and go to "Transfer Points"', 'Select American AAdvantage as your transfer partner (1:1)', 'Allow up to 24–48 hours for the transfer to complete', 'Go to aa.com and search for Award Flights, selecting First class', "Look for 'MilesAAver' labeled first class awards, the lowest mileage tier", 'Pay only carrier fees (~$5–$20) at checkout'],
    },
    budget: {
      airline: 'American Airlines Economy', partner: 'Transfer to American AAdvantage · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Citi ThankYou transfers directly to American AAdvantage at 1:1. MilesAAver economy awards start at 12,500 miles on domestic routes.",
      warning: null,
      steps: ['Log into your Citi account and go to "Transfer Points"', 'Select American AAdvantage as your transfer partner (1:1)', 'Allow up to 24–48 hours for the transfer to complete', 'Go to aa.com and search for Award Flights in Economy class', "Look for 'MilesAAver' labeled economy awards, the lowest mileage tier", 'Pay only carrier fees (~$5–$20) at checkout'],
    },
  },
  'Capital One Miles': {
    luxury: {
      airline: 'United First Class via Avianca LifeMiles', partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 400, cpp: 1.6,
      note: "Avianca LifeMiles is the strongest domestic option for Capital One miles. Domestic United first class runs ~20,000–25,000 LifeMiles, significantly cheaper than booking through United directly.",
      warning: null,
      steps: ['Log into Capital One and go to "Transfer Miles"', 'Select Avianca LifeMiles (1:1)', 'Allow 1–2 business days for the transfer to complete', 'Go to lifemiles.com and search for United (UA) First Class on your route', 'Look for Star Alliance first class availability', 'Pay only carrier fees (~$5–$20) at checkout'],
    },
    budget: {
      airline: 'United Economy via Avianca LifeMiles', partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 7500, cashValue: 150, cpp: 2.0,
      note: "Avianca LifeMiles has some of the lowest rates for Star Alliance domestic economy, as low as 7,500 miles for shorter routes on United.",
      warning: null,
      steps: ['Log into Capital One and go to "Transfer Miles"', 'Select Avianca LifeMiles (1:1)', 'Allow 1–2 business days for the transfer to complete', 'Go to lifemiles.com and search for United (UA) economy on your domestic route', 'Look for the lowest-tier Star Alliance economy availability', 'Pay only carrier fees (~$5–$15) at checkout'],
    },
  },
  'Bilt Points': {
    luxury: {
      airline: 'United First Class', partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 30000, cashValue: 450, cpp: 1.5,
      note: "Bilt transfers to United MileagePlus instantly at 1:1, making it one of the fastest domestic upgrade plays.",
      warning: null,
      steps: ['Log into Bilt and go to "Transfer Points"', 'Select United MileagePlus (1:1, instant)', 'Go to united.com and search Award Travel in First Class', 'Use the award calendar to find the lowest price across dates', 'Look for "Saver" labeled first class awards', 'Pay only ~$5–$15 in carrier fees at checkout'],
    },
    budget: {
      airline: 'United Economy Saver', partner: 'Transfer to United MileagePlus · 1:1 ratio',
      points: 12500, cashValue: 200, cpp: 1.6,
      note: "Bilt transfers to United MileagePlus instantly. Saver economy on domestic routes starts at 12,500 miles, no fuel surcharges.",
      warning: null,
      steps: ['Log into Bilt and go to "Transfer Points"', 'Select United MileagePlus (1:1, instant)', 'Go to united.com and search Award Travel in Economy class', 'Look for "Saver" labeled economy awards, the lowest mileage tier', 'Best availability on weekdays and off-peak dates', 'Pay only ~$5–$15 in carrier fees at checkout'],
    },
  },
  'Wells Fargo Rewards': {
    luxury: {
      airline: 'United First Class via Avianca LifeMiles', partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 25000, cashValue: 400, cpp: 1.6,
      note: "Avianca LifeMiles is the strongest domestic play in the Wells Fargo Autograph Journey partner lineup.",
      warning: null,
      steps: ['Log into Wells Fargo and go to "Transfer Points"', 'Select Avianca LifeMiles (1:1)', 'Allow 1–2 business days for the transfer to complete', 'Go to lifemiles.com and search for United (UA) First Class on your domestic route', 'Look for Star Alliance first class availability', 'Pay only carrier fees (~$5–$20) at checkout'],
    },
    budget: {
      airline: 'United Economy via Avianca LifeMiles', partner: 'Transfer to Avianca LifeMiles · 1:1 ratio',
      points: 7500, cashValue: 150, cpp: 2.0,
      note: "Avianca LifeMiles has the lowest domestic economy rates of any Wells Fargo Autograph Journey transfer partner.",
      warning: null,
      steps: ['Log into Wells Fargo and go to "Transfer Points"', 'Select Avianca LifeMiles (1:1)', 'Allow 1–2 business days for the transfer to complete', 'Go to lifemiles.com and search for United (UA) economy on your domestic route', 'Look for the lowest-tier Star Alliance economy availability', 'Pay only carrier fees (~$5–$15) at checkout'],
    },
  },
}

function getResults(program, fromAirport, toAirport) {
  const fromCode = fromAirport?.code || ''
  const toCode   = toAirport?.code  || ''
  if (AIRLINE_PROGRAM_KEYS.has(program)) {
    return { isDefault: false, isDomestic: false, ...AIRLINE_DIRECT[program] }
  }
  if (isDomesticUS(fromCode, toCode)) {
    const domestic = DOMESTIC_FALLBACKS[program] || DOMESTIC_FALLBACKS['Ultimate Rewards']
    return { isDefault: false, isDomestic: true, luxury: domestic.luxury, budget: domestic.budget }
  }
  const fromMetro = getMetro(fromCode)
  const toMetro   = getMetro(toCode)
  const route = ROUTE_DB[`${fromMetro}-${toMetro}`] || ROUTE_DB[`${toMetro}-${fromMetro}`]
  if (!route) {
    const fallback = DEFAULT_FALLBACKS[program] || DEFAULT_FALLBACKS['Ultimate Rewards']
    return { isDefault: true, isDomestic: false, ...fallback }
  }
  const luxury = route.luxury.find(opt => opt.programs.includes(program))
  const budget = route.budget.find(opt => opt.programs.includes(program))
  if (!luxury || !budget) {
    const fallback = DEFAULT_FALLBACKS[program] || DEFAULT_FALLBACKS['Ultimate Rewards']
    return { isDefault: true, isDomestic: false, ...fallback }
  }
  return { isDefault: false, isDomestic: false, luxury, budget }
}

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

const LONG_HAUL_CODES  = new Set(['NRT','HND','KIX','ICN','PEK','PVG','HKG','SIN','BKK','KUL','SYD','MEL','AKL','MNL','CGK','LHR','LGW','STN','CDG','ORY','AMS','FRA','MUC','FCO','MXP','BCN','MAD','ZRH','VIE','CPH','ARN','HEL','DUB','LIS','ATH','DXB','AUH','DOH','TLV','CAI','JNB','CPT','GRU','EZE','BOG','LIM','SCL'])
const MEDIUM_HAUL_CODES = new Set(['LAX','SFO','SEA','DFW','ATL','DEN','LAS','PHX','IAD','DCA','BWI','MCO','HNL','ORD','MDW','MIA','BOS','YYZ','YVR','YUL','CUN','MEX'])
function detectHaul(from, to) {
  const f = from?.code || '', t = to?.code || ''
  if (LONG_HAUL_CODES.has(f) || LONG_HAUL_CODES.has(t))   return 'long'
  if (MEDIUM_HAUL_CODES.has(f) || MEDIUM_HAUL_CODES.has(t)) return 'medium'
  return 'short'
}

// ── Partner metadata helper ───────────────────────────────────────────
function getPartnerInfo(partner) {
  if (!partner || /direct|no transfer/i.test(partner)) return { ratio: '—', speed: 'No transfer' }
  if (/Flying Blue/i.test(partner))       return { ratio: '1:1', speed: 'Instant — most days' }
  if (/Virgin Atlantic/i.test(partner))   return { ratio: '1:1', speed: 'Instant' }
  if (/Aeroplan/i.test(partner))          return { ratio: '1:1', speed: 'Instant' }
  if (/MileagePlus/i.test(partner))       return { ratio: '1:1', speed: 'Instant' }
  if (/KrisFlyer/i.test(partner))         return { ratio: '1:1', speed: '1–3 business days' }
  if (/British Airways/i.test(partner))   return { ratio: '1:1', speed: 'Instant' }
  if (/Iberia/i.test(partner))            return { ratio: '1:1', speed: '1–3 business days' }
  if (/ANA/i.test(partner))               return { ratio: '1:1', speed: '1–3 business days' }
  if (/Turkish/i.test(partner))           return { ratio: '1:1', speed: '1–2 business days' }
  if (/LifeMiles/i.test(partner))         return { ratio: '1:1', speed: '1–2 business days' }
  if (/SkyMiles/i.test(partner))          return { ratio: '1:1', speed: 'Instant' }
  if (/AAdvantage/i.test(partner))        return { ratio: '1:1', speed: '24–48 hours' }
  return { ratio: '1:1', speed: 'Instant' }
}

// ─────────────────────────────────────────────────────────────────────
// VISUAL DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────
const INK    = '#f4f3ee'
const INK_2  = '#c9c8c0'
const INK_3  = '#8b8d9c'
const R1     = 'rgba(244,243,238,0.08)'
const R2     = 'rgba(244,243,238,0.16)'
const V5     = '#6366f1'
const V4     = '#818cf8'
const GOLD_C = '#d4a55a'
const GRN    = '#6ec28a'
const SR     = "'Instrument Serif', 'Times New Roman', serif"
const MN     = "'JetBrains Mono', ui-monospace, monospace"
const SN     = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"

const PAGE_BG = `
  radial-gradient(1200px 600px at 80% -100px, rgba(99,102,241,0.10), transparent 60%),
  radial-gradient(900px 500px at 10% 10%, rgba(99,102,241,0.05), transparent 60%),
  #0a0f1e
`

// ─────────────────────────────────────────────────────────────────────
// MAIN RESULTS PAGE
// ─────────────────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { isPro } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [luxOpen, setLuxOpen]     = useState(false)
  const [budOpen, setBudOpen]     = useState(false)

  const card   = state?.card   || null
  const points = state?.points || ''
  const from   = state?.from   || null
  const to     = state?.to     || null

  useEffect(() => {
    if (!isPro) incrementSearchCount()
  }, [isPro])

  const handleNewSearch = () => {
    if (isPro) { navigate('/search'); return }
    const { count } = getSearchData()
    if (count >= 2) { setShowModal(true) } else { navigate('/search') }
  }

  // ── No-card fallback ──
  if (!card) {
    return (
      <div style={{ background: '#0a0f1e', minHeight: '100vh', color: INK, fontFamily: SN, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontFamily: SR, fontSize: 72, lineHeight: 0.9, marginBottom: 32, color: INK }}>✈</div>
          <h1 style={{ fontFamily: SR, fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 16, color: INK }}>No search found.</h1>
          <p style={{ color: INK_3, fontSize: 16, lineHeight: 1.6, marginBottom: 32, fontFamily: SR, fontStyle: 'italic' }}>Start a search to see your personalized redemption options.</p>
          <button
            onClick={() => navigate('/search')}
            style={{ background: V5, color: '#fff', fontFamily: SN, fontSize: 14, padding: '12px 28px', borderRadius: 999, border: 'none', cursor: 'pointer', letterSpacing: '-0.1px' }}
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
  const haulLabel = isDomestic ? 'Domestic route' : haul === 'long' ? 'Long-haul' : haul === 'medium' ? 'Medium-haul' : 'Short-haul'
  const userPts   = parseInt((points || '0').replace(/\D/g, ''), 10) || 0
  const hasEnough = userPts >= luxury.points
  const shortfall = luxury.points - userPts
  const surplus   = userPts - luxury.points
  // Balance bar: what % of userPts does the required cost represent (capped at 96%)
  const needPct   = userPts > 0 ? Math.min(96, Math.round(luxury.points / userPts * 100)) : 60
  const bestCabin = /business|upper class|first/i.test(luxury.airline) ? 'Business' : 'Economy'
  const luxMeta   = getPartnerInfo(luxury.partner)
  const budMeta   = getPartnerInfo(budget.partner)
  const isDirect  = /direct|no transfer/i.test(luxury.partner)
  const visibleCards = PROMO_CARDS.filter(r => r.name !== card?.name).slice(0, 3)

  // Shared styles
  const CONT = { maxWidth: 1180, margin: '0 auto', padding: '0 40px' }
  const kicker = { fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3 }
  const rule = { height: 1, background: R1, width: '100%' }

  return (
    <div style={{ background: PAGE_BG, minHeight: '100vh', color: INK, fontFamily: SN, fontSize: 16, WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Sticky nav ── */}
      <nav style={{
        borderBottom: `1px solid ${R1}`,
        background: 'rgba(10,15,30,0.7)',
        backdropFilter: 'saturate(140%) blur(12px)',
        WebkitBackdropFilter: 'saturate(140%) blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ ...CONT, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Wordmark */}
          <span
            onClick={() => navigate('/')}
            style={{ fontFamily: SR, fontSize: 24, letterSpacing: '-0.01em', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 99, background: V5, display: 'inline-block', transform: 'translateY(-2px)' }} />
            Point<em style={{ fontStyle: 'italic' }}>Pilot</em>
          </span>
          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleNewSearch}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: `1px solid ${R2}`, borderRadius: 999, fontFamily: SN, fontSize: 13, color: INK_2, background: 'none', cursor: 'pointer', transition: 'color .2s, border-color .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = INK_3 }}
              onMouseLeave={e => { e.currentTarget.style.color = INK_2; e.currentTarget.style.borderColor = R2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12l6-6M5 12l6 6"/></svg>
              New search
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 16px', border: `1px solid ${R2}`, borderRadius: 999, fontFamily: SN, fontSize: 13, color: INK_2, background: 'none', cursor: 'pointer', transition: 'color .2s, border-color .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = INK_3 }}
              onMouseLeave={e => { e.currentTarget.style.color = INK_2; e.currentTarget.style.borderColor = R2 }}
            >
              Home
            </button>
            {isPro && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: `1px solid rgba(212,165,90,0.32)`, borderRadius: 999, fontFamily: SN, fontSize: 13, color: GOLD_C, background: 'rgba(212,165,90,0.06)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.8L21 11l-6.6 2.2L12 20l-2.4-6.8L3 11l6.6-2.2z"/></svg>
                Pro
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '100px 0 56px' }}>
        <div style={CONT}>
          {/* Kicker row */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 28 }}>
            <span style={kicker}>{card.name}</span>
            <span style={{ width: 18, height: 1, background: R2 }} />
            <span style={kicker}>{program}</span>
            <span style={{ width: 18, height: 1, background: R2 }} />
            <span style={kicker}>{haulLabel} · Result 01</span>
          </div>
          {/* Big route */}
          <h1 style={{
            fontFamily: SR, fontWeight: 400,
            fontSize: 'clamp(72px, 12vw, 168px)',
            lineHeight: 0.92, letterSpacing: '-0.035em',
            margin: '0 0 26px', textAlign: 'center', color: INK,
          }}>
            {from?.code ?? '???'}
            <span style={{ fontFamily: SN, fontWeight: 300, fontSize: '0.55em', verticalAlign: '0.18em', color: V4, margin: '0 0.16em', letterSpacing: 0 }}>→</span>
            {to?.code ?? '???'}
          </h1>
          {/* Subtitle */}
          <p style={{ textAlign: 'center', color: INK_2, fontSize: 19, fontFamily: SR, fontStyle: 'italic', margin: '0 0 14px' }}>
            {from?.city} → {to?.city}
          </p>
          <p style={{ textAlign: 'center', color: INK_3, fontSize: 13, fontFamily: MN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            {pointsLabel(program)} · Avg. award pricing
          </p>
        </div>
      </section>

      {/* ── Boarding pass ── */}
      <div style={{ padding: '0 0 80px' }}>
        <div style={CONT}>
          {/* Route notices */}
          {isDomestic && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${R2}`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🇺🇸</span>
              <p style={{ color: INK_2, fontSize: 13, lineHeight: 1.6, margin: 0, fontFamily: SR, fontStyle: 'italic' }}>
                Domestic route detected. We've prioritized the best domestic airline partners for your card.
              </p>
            </div>
          )}
          {!isDomestic && isDefault && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${R2}`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🗺️</span>
              <p style={{ color: INK_2, fontSize: 13, lineHeight: 1.6, margin: 0, fontFamily: SR, fontStyle: 'italic' }}>
                We're building out more routes every week. Here's the best general redemption strategy for your card.
              </p>
            </div>
          )}

          {/* Pass card */}
          <div style={{
            background: 'linear-gradient(180deg, #0f1530 0%, #0c1226 100%)',
            border: `1px solid ${R2}`,
            borderRadius: 18, position: 'relative', overflow: 'hidden',
          }}>
            {/* Punch-out circles */}
            <div style={{ position: 'absolute', width: 28, height: 28, background: '#0a0f1e', borderRadius: '50%', top: '50%', left: -14, transform: 'translateY(-50%)', border: `1px solid ${R2}` }} />
            <div style={{ position: 'absolute', width: 28, height: 28, background: '#0a0f1e', borderRadius: '50%', top: '50%', right: -14, transform: 'translateY(-50%)', border: `1px solid ${R2}` }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1px 1fr' }}>
              {/* Left */}
              <div style={{ padding: '38px 44px' }}>
                {/* Pass header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <span style={{ fontFamily: SR, fontSize: 18, color: INK_2 }}>
                    Boarding Pass <em style={{ color: INK_3 }}>— Best Redemption</em>
                  </span>
                  <span style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.16em', color: INK_3 }}>PP · 2026</span>
                </div>
                {/* Route */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 18, marginBottom: 32 }}>
                  <div>
                    <div style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, marginBottom: 8 }}>{from?.city}</div>
                    <div style={{ fontFamily: SR, fontSize: 76, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{from?.code ?? '???'}</div>
                  </div>
                  {/* Plane line */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 18 }}>
                    <svg viewBox="0 0 140 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: '100%', maxWidth: 140, height: 'auto', color: INK_3 }}>
                      <line x1="0" y1="12" x2="58" y2="12" strokeDasharray="3 3"/>
                      <line x1="84" y1="12" x2="140" y2="12" strokeDasharray="3 3"/>
                      <g transform="translate(70 12)" fill="currentColor" stroke="none">
                        <path d="M-12 0 L8 -6 L12 -4 L4 0 L12 4 L8 6 Z" />
                      </g>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, marginBottom: 8, textAlign: 'right' }}>{to?.city}</div>
                    <div style={{ fontFamily: SR, fontSize: 76, lineHeight: 0.9, letterSpacing: '-0.03em', textAlign: 'right' }}>{to?.code ?? '???'}</div>
                  </div>
                </div>
                {/* Meta strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 28, borderTop: `1px solid ${R1}` }}>
                  {[
                    { label: 'Haul',     value: haulLabel.replace(' route','').replace('-haul','') + '-haul' },
                    { label: 'Best cabin', value: bestCabin },
                    { label: isDirect ? 'Booking' : 'Transfer', value: isDirect ? 'Direct' : luxMeta.ratio },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, marginBottom: 8 }}>{m.label}</div>
                      <div style={{ fontFamily: SR, fontSize: 22, color: INK }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashed divider */}
              <div style={{ background: `repeating-linear-gradient(180deg, ${R2} 0 6px, transparent 6px 14px)`, margin: '32px 0' }} />

              {/* Right */}
              <div style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28 }}>
                {/* Best redemption */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3 }}>Best redemption</div>
                  <div style={{ fontFamily: SR, fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
                    {luxury.points.toLocaleString()}
                    <small style={{ fontFamily: SR, fontStyle: 'italic', fontSize: 22, color: INK_3, marginLeft: 8 }}>pts</small>
                  </div>
                  <div style={{ color: INK_2, fontSize: 14, marginTop: 6 }}>{luxury.airline}</div>
                  <div style={{ color: INK_3, fontSize: 13, fontFamily: MN, letterSpacing: '0.06em' }}>{luxury.partner.split('·')[0].trim()}</div>
                </div>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div style={{ border: `1px solid ${R1}`, borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, marginBottom: 8 }}>Value / point</div>
                    <div style={{ fontFamily: SR, fontSize: 28, color: V4 }}>{luxury.cpp}¢</div>
                    <div style={{ color: GRN, fontFamily: MN, fontSize: 11, letterSpacing: '0.04em', marginTop: 6 }}>
                      ↑ {(luxury.cpp / 1.0).toFixed(1)}× vs cash back
                    </div>
                  </div>
                  <div style={{ border: `1px solid ${R1}`, borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, marginBottom: 8 }}>Est. cash value</div>
                    <div style={{ fontFamily: SR, fontSize: 28, color: INK }}>${luxury.cashValue.toLocaleString()}</div>
                    <div style={{ color: INK_3, fontFamily: MN, fontSize: 11, letterSpacing: '0.04em', marginTop: 6 }}>
                      {/business|upper|first/i.test(luxury.airline) ? 'Biz class, round-trip' : 'Economy, round-trip'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 01: Balance ── */}
      {userPts > 0 && (
        <section style={{ padding: '72px 0', borderTop: `1px solid ${R1}` }}>
          <div style={CONT}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 60, alignItems: 'start', marginBottom: 44 }}>
              <div style={kicker}>01 / Balance</div>
              <div>
                <h2 style={{ fontFamily: SR, fontWeight: 400, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 700 }}>
                  You have{' '}
                  <em style={{ fontStyle: 'normal', color: V4 }}>{userPts.toLocaleString()}</em>{' '}
                  points. The best seat costs{' '}
                  <em style={{ fontStyle: 'normal' }}>{luxury.points.toLocaleString()}</em>.
                </h2>
                <p style={{ fontFamily: SR, fontStyle: 'italic', color: INK_2, fontSize: 19, lineHeight: 1.5, margin: 0 }}>
                  {hasEnough
                    ? `More than enough — with a surplus of ${surplus.toLocaleString()} points left over.`
                    : `You're ${shortfall.toLocaleString()} points short of the luxury option, but easily covered by the budget pick.`
                  }
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 60, alignItems: 'start' }}>
              <div style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, paddingTop: 20 }}>{program}</div>
              <div>
                {/* Balance bar */}
                <div style={{ width: '100%', height: 64, background: 'rgba(244,243,238,0.04)', border: `1px solid ${R1}`, borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
                  {/* Have (full bar) */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(99,102,241,0.10), rgba(99,102,241,0.20))' }} />
                  {/* Need strip */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${needPct}%`, background: 'linear-gradient(90deg, #5b5ff0 0%, #818cf8 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}>
                    <span style={{ position: 'absolute', top: 18, left: 16, fontFamily: MN, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white' }}>
                      Need · {luxury.points.toLocaleString()}
                    </span>
                  </div>
                  <span style={{ position: 'absolute', top: 18, right: 16, fontFamily: MN, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK }}>
                    Balance · {userPts.toLocaleString()}
                  </span>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 32, marginTop: 18, fontSize: 13, color: INK_2 }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, background: 'linear-gradient(90deg,#5b5ff0,#818cf8)', borderRadius: 2, marginRight: 8, verticalAlign: '1px' }} />
                    Required for best seat
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 2, marginRight: 8, verticalAlign: '1px' }} />
                    Your available balance
                  </span>
                </div>
                {/* Surplus / shortfall */}
                <div style={{ marginTop: 14, fontFamily: SR, fontStyle: 'italic', fontSize: 19, color: INK }}>
                  {hasEnough
                    ? <>Surplus of <em style={{ fontStyle: 'normal', color: GRN, fontFamily: MN, fontSize: 14, letterSpacing: '0.04em' }}>{surplus.toLocaleString()} pts</em> remaining after booking.</>
                    : <>Short by <em style={{ fontStyle: 'normal', color: '#f87171', fontFamily: MN, fontSize: 14, letterSpacing: '0.04em' }}>{shortfall.toLocaleString()} pts</em> — consider the budget option instead.</>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 02: Compare ── */}
      <section style={{ padding: '72px 0', borderTop: `1px solid ${R1}` }}>
        <div style={CONT}>
          {/* Section head */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 60, alignItems: 'start', marginBottom: 44 }}>
            <div style={kicker}>02 / Compare</div>
            <div>
              <h2 style={{ fontFamily: SR, fontWeight: 400, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 700 }}>
                Two routes through your points.
              </h2>
              <p style={{ fontFamily: SR, fontStyle: 'italic', color: INK_2, fontSize: 19, lineHeight: 1.5, margin: 0, maxWidth: 620 }}>
                One sets you in the premium cabin. The other gets you there for almost nothing. Both are bookable today.
              </p>
            </div>
          </div>

          {/* Compare table */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', borderTop: `1px solid ${R2}` }}>

            {/* Column headers */}
            <div style={{ padding: '28px 24px', borderBottom: `1px solid ${R1}` }}>
              <div style={kicker}>Side by side</div>
              <div style={{ marginTop: 18, fontFamily: SR, fontStyle: 'italic', color: INK_2, fontSize: 18, maxWidth: 180, lineHeight: 1.4 }}>
                Cabin, partner, and the math.
              </div>
            </div>
            {/* Luxury header */}
            <div style={{ padding: '28px 24px', borderBottom: `1px solid ${R1}` }}>
              <span style={{ display: 'inline-block', fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, marginBottom: 14, color: GOLD_C, background: 'rgba(212,165,90,0.08)', border: `1px solid rgba(212,165,90,0.28)` }}>
                Luxury · Best value
              </span>
              <h3 style={{ fontFamily: SR, fontWeight: 400, fontSize: 30, lineHeight: 1.05, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                {/business|upper/i.test(luxury.airline) ? 'Business Class' : /first/i.test(luxury.airline) ? 'First Class' : luxury.airline.split(' ').slice(-2).join(' ')}
              </h3>
              <div style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3 }}>
                {luxury.partner.replace('Transfer to ', '').replace(' · 1:1 ratio', '').replace('Book directly - no transfer needed', 'Direct booking')}
              </div>
              <div style={{ fontFamily: SR, fontSize: 56, lineHeight: 1, marginTop: 18, letterSpacing: '-0.02em' }}>
                {luxury.points.toLocaleString()}
                <span style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, display: 'block', marginTop: 8 }}>Points required</span>
              </div>
            </div>
            {/* Budget header */}
            <div style={{ padding: '28px 24px', borderBottom: `1px solid ${R1}` }}>
              <span style={{ display: 'inline-block', fontFamily: MN, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, marginBottom: 14, color: V4, background: 'rgba(99,102,241,0.12)', border: `1px solid rgba(99,102,241,0.28)` }}>
                Budget · Fewest points
              </span>
              <h3 style={{ fontFamily: SR, fontWeight: 400, fontSize: 30, lineHeight: 1.05, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                {/economy/i.test(budget.airline) ? 'Economy' : budget.airline.split(' ').slice(-2).join(' ')}
              </h3>
              <div style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3 }}>
                {budget.partner.replace('Transfer to ', '').replace(' · 1:1 ratio', '').replace('Book directly - no transfer needed', 'Direct booking')}
              </div>
              <div style={{ fontFamily: SR, fontSize: 56, lineHeight: 1, marginTop: 18, letterSpacing: '-0.02em' }}>
                {budget.points.toLocaleString()}
                <span style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, display: 'block', marginTop: 8 }}>Points required</span>
              </div>
            </div>

            {/* Rows */}
            {[
              {
                label: 'Cash value',
                lux: <><span style={{ fontFamily: SR, fontSize: 28, color: INK }}>${luxury.cashValue.toLocaleString()}</span></>,
                bud: <><span style={{ fontFamily: SR, fontSize: 28, color: INK }}>${budget.cashValue.toLocaleString()}</span></>,
              },
              {
                label: 'Value / point',
                lux: (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: SR, fontSize: 28, color: GRN }}>{luxury.cpp}¢</span>
                    <span style={{ fontFamily: MN, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD_C, border: `1px solid rgba(212,165,90,0.4)`, borderRadius: 999, padding: '3px 8px' }}>Best</span>
                  </div>
                ),
                bud: <span style={{ fontFamily: SR, fontSize: 28, color: INK }}>{budget.cpp}¢</span>,
              },
              {
                label: 'Transfer',
                lux: <span style={{ fontFamily: SN, fontSize: 15, color: INK_2 }}>{luxury.partner.replace('Book directly - no transfer needed', 'Direct — no transfer').replace(' · 1:1 ratio', ' (1:1)')}</span>,
                bud: <span style={{ fontFamily: SN, fontSize: 15, color: INK_2 }}>{budget.partner.replace('Book directly - no transfer needed', 'Direct — no transfer').replace(' · 1:1 ratio', ' (1:1)')}</span>,
              },
              {
                label: 'Transfer speed',
                lux: <span style={{ fontFamily: SN, fontSize: 15, color: INK_2 }}>{luxMeta.speed}</span>,
                bud: <span style={{ fontFamily: SN, fontSize: 15, color: INK_2 }}>{budMeta.speed}</span>,
              },
              {
                label: 'Fuel surcharges',
                lux: luxury.warning
                  ? <span style={{ fontFamily: SN, fontSize: 14, color: '#fcd34d' }}>{luxury.warning.slice(0, 60)}…</span>
                  : <span style={{ fontFamily: SN, fontSize: 15, color: GRN }}>None on most partners</span>,
                bud: budget.warning
                  ? <span style={{ fontFamily: SN, fontSize: 14, color: '#fcd34d' }}>{budget.warning.slice(0, 60)}…</span>
                  : <span style={{ fontFamily: SN, fontSize: 15, color: GRN }}>None on most partners</span>,
              },
              {
                label: 'Best for',
                lux: <span style={{ fontFamily: SR, fontStyle: 'italic', fontSize: 18, color: INK }}>{luxury.note.split('.')[0]}.</span>,
                bud: <span style={{ fontFamily: SR, fontStyle: 'italic', fontSize: 18, color: INK }}>{budget.note.split('.')[0]}.</span>,
              },
            ].map(row => (
              <React.Fragment key={row.label}>
                <div style={{ padding: '22px 24px', borderBottom: `1px solid ${R1}`, display: 'flex', alignItems: 'center', fontFamily: MN, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3 }}>
                  {row.label}
                </div>
                <div style={{ padding: '22px 24px', borderBottom: `1px solid ${R1}` }}>{row.lux}</div>
                <div style={{ padding: '22px 24px', borderBottom: `1px solid ${R1}` }}>{row.bud}</div>
              </React.Fragment>
            ))}
          </div>

          {/* How to book */}
          <div style={{ borderTop: `1px solid ${R1}`, marginTop: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', borderBottom: `1px solid ${R1}` }}>
              <div style={{ padding: '22px 24px', fontFamily: MN, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_3, display: 'flex', alignItems: 'center' }}>
                How to book
              </div>
              {/* Luxury expand */}
              <div>
                <button
                  onClick={() => setLuxOpen(o => !o)}
                  style={{ width: '100%', textAlign: 'left', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, fontFamily: SR, fontSize: 18, color: INK_2, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = INK}
                  onMouseLeave={e => e.currentTarget.style.color = INK_2}
                >
                  <span>{luxOpen ? 'Close' : 'Open'} the Luxury playbook</span>
                  <span style={{ width: 28, height: 28, border: `1px solid ${luxOpen ? V5 : R2}`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .2s, transform .25s', transform: luxOpen ? 'rotate(180deg)' : 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </span>
                </button>
                <div style={{ overflow: 'hidden', maxHeight: luxOpen ? 800 : 0, transition: 'max-height 0.4s ease' }}>
                  <div style={{ padding: '6px 24px 28px' }}>
                    {luxury.warning && (
                      <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
                        <span style={{ color: '#fbbf24', flexShrink: 0 }}>⚠</span>
                        <p style={{ color: '#fcd34d', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{luxury.warning}</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {luxury.steps.map((step, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 14, fontSize: 14, color: INK_2, lineHeight: 1.55 }}>
                          <span style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.1em', color: V4, width: 24, height: 24, border: `1px solid rgba(99,102,241,0.4)`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                          <div>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Budget expand */}
              <div>
                <button
                  onClick={() => setBudOpen(o => !o)}
                  style={{ width: '100%', textAlign: 'left', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, fontFamily: SR, fontSize: 18, color: INK_2, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = INK}
                  onMouseLeave={e => e.currentTarget.style.color = INK_2}
                >
                  <span>{budOpen ? 'Close' : 'Open'} the Budget playbook</span>
                  <span style={{ width: 28, height: 28, border: `1px solid ${budOpen ? V5 : R2}`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .2s, transform .25s', transform: budOpen ? 'rotate(180deg)' : 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </span>
                </button>
                <div style={{ overflow: 'hidden', maxHeight: budOpen ? 800 : 0, transition: 'max-height 0.4s ease' }}>
                  <div style={{ padding: '6px 24px 28px' }}>
                    {budget.warning && (
                      <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
                        <span style={{ color: '#fbbf24', flexShrink: 0 }}>⚠</span>
                        <p style={{ color: '#fcd34d', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{budget.warning}</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {budget.steps.map((step, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 14, fontSize: 14, color: INK_2, lineHeight: 1.55 }}>
                          <span style={{ fontFamily: MN, fontSize: 11, letterSpacing: '0.1em', color: V4, width: 24, height: 24, border: `1px solid rgba(99,102,241,0.4)`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                          <div>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', borderBottom: `1px solid ${R1}` }}>
              <div />
              <div style={{ padding: 24 }}>
                <a
                  href={AFFILIATE_LINKS[card?.name] || '#'}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 999, fontSize: 14, background: V5, color: 'white', textDecoration: 'none', transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.background = V5}
                >
                  Book luxury option
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
              <div style={{ padding: 24 }}>
                <a
                  href={AFFILIATE_LINKS[card?.name] || '#'}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 999, fontSize: 14, border: `1px solid ${R2}`, color: INK, textDecoration: 'none', transition: 'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = INK_3}
                  onMouseLeave={e => e.currentTarget.style.borderColor = R2}
                >
                  Book budget option
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ marginTop: 24, fontFamily: SR, fontStyle: 'italic', color: INK_3, fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
            PointPilot shows average award pricing across the next 90 days. Always verify live availability on the airline's site before transferring points — transfers are irreversible.
          </p>
        </div>
      </section>

      {/* ── Section 03: Earn ── */}
      <section style={{ padding: '72px 0', borderTop: `1px solid ${R1}` }}>
        <div style={CONT}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 60, alignItems: 'start', marginBottom: 44 }}>
            <div style={kicker}>03 / Earn</div>
            <div>
              <h2 style={{ fontFamily: SR, fontWeight: 400, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 700 }}>
                {hasEnough
                  ? 'Or earn the whole trip in one welcome bonus.'
                  : `${shortfall.toLocaleString()} points short. These bonuses cover the gap.`
                }
              </h2>
              <p style={{ fontFamily: SR, fontStyle: 'italic', color: INK_2, fontSize: 19, lineHeight: 1.5, margin: 0, maxWidth: 620 }}>
                Each of these cards earns transferable points and currently runs a bonus large enough to cover this route — sometimes twice over.
              </p>
            </div>
          </div>

          {/* Affiliate cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleCards.length}, 1fr)`, borderTop: `1px solid ${R2}` }}>
            {visibleCards.map((rec, idx) => {
              const det = CARD_DETAILS[rec.name] || {}
              return (
                <div
                  key={rec.name}
                  style={{
                    padding: '36px 32px',
                    borderRight: idx < visibleCards.length - 1 ? `1px solid ${R1}` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 18,
                    minHeight: 360,
                  }}
                >
                  <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK_3 }}>{rec.issuer}</div>
                  <h4 style={{ fontFamily: SR, fontWeight: 400, fontSize: 30, margin: 0, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{rec.name}</h4>
                  <div style={{ color: INK_2, fontSize: 14, lineHeight: 1.5 }}>{det.tagline}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid ${R1}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {det.bonus && (
                      <>
                        <div style={{ fontFamily: SR, fontSize: 32, lineHeight: 1, letterSpacing: '-0.01em' }}>
                          {det.bonus.match(/[\d,]+(?:,\d{3})?(?:–[\d,]+)? (?:point|mile)/i)?.[0]?.split(' ')[0] || '75,000'}
                          <span style={{ fontFamily: SR, fontStyle: 'italic', fontSize: 18, color: INK_3, marginLeft: 8 }}>
                            {/mile/i.test(det.bonus) ? 'miles' : 'pts'}
                          </span>
                        </div>
                        <div style={{ color: INK_3, fontSize: 13, lineHeight: 1.5 }}>{det.bonus}</div>
                      </>
                    )}
                    <a
                      href={AFFILIATE_LINKS[rec.name] || '#'}
                      target="_blank" rel="noopener noreferrer"
                      style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MN, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: V4, textDecoration: 'none', transition: 'color .2s, gap .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.gap = '14px' }}
                      onMouseLeave={e => { e.currentTarget.style.color = V4; e.currentTarget.style.gap = '8px' }}
                    >
                      Apply now <span>→</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Upgrade CTA (free users only) ── */}
      {!isPro && (
        <section style={{ padding: '72px 0', borderTop: `1px solid ${R1}` }}>
          <div style={{ ...CONT, textAlign: 'center' }}>
            <div style={kicker}>Unlock Pro</div>
            <h2 style={{ fontFamily: SR, fontWeight: 400, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.02em', margin: '24px 0 16px' }}>
              Unlimited searches. Live award availability.
            </h2>
            <p style={{ fontFamily: SR, fontStyle: 'italic', color: INK_2, fontSize: 19, lineHeight: 1.5, margin: '0 auto 32px', maxWidth: 480 }}>
              Transfer bonus alerts, priority results, and full access for $10/month.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: V5, color: '#fff', fontFamily: SN, fontSize: 15, padding: '14px 36px', borderRadius: 999, border: 'none', cursor: 'pointer', letterSpacing: '-0.1px', boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(99,102,241,0.35)', transition: 'background .15s, transform .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = V5; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get Unlimited Access
            </button>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${R1}`, padding: '56px 0 72px', color: INK_3, fontSize: 13 }}>
        <div style={{ ...CONT, display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'end' }}>
          <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.6, fontFamily: SR, fontStyle: 'italic', fontSize: 16, color: INK_2 }}>
            PointPilot is independent. We earn a commission on cards opened through links above — it never changes which result is "best." Average award pricing across 90-day forward availability.
          </p>
          <div style={{ display: 'flex', gap: 24, fontFamily: MN, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_3 }}>
            <span>{from?.code} → {to?.code}</span>
            <span>© PointPilot</span>
          </div>
        </div>
      </footer>

      {showModal && !isPro && <UpgradeModal />}
    </div>
  )
}
