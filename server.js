import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// ── Admin IPs — unlimited searches, never rate-limited ──
const ADMIN_IPS = [
  '72.80.68.231',
  '2600:4040:9a3f:2a00:c0ab:6232:66e2:1d23',
  '172.226.204.24',
]

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fmvkkhxwjoogqtqqcoyg.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdmtraHh3am9vZ3F0cXFjb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MTcsImV4cCI6MjA5NDU3MjcxN30.6umWF7OW3FKTqK6n6Cv-9RWEzj3b-SBlJUXfpSOxuVM'

// Anon client — used for all regular DB operations (search_logs, subscriptions, pro-status)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client — service role key, used ONLY for supabase.auth.admin.createUser()
const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const app = express()
app.use(cors())
app.set('trust proxy', true)

// ── POST /api/webhook ─────────────────────────────────────
// MUST be registered BEFORE express.json() so we get the raw body
// needed for Stripe signature verification.
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('[webhook] received event:', event.type)

  // ── checkout.session.completed ──────────────────────────
  // Payment succeeded → upsert an active subscription row.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id
    const customerId = session.customer
    const subscriptionId = session.subscription

    if (!userId) {
      console.error('[webhook] checkout.session.completed missing user_id in metadata')
      return res.json({ received: true })
    }

    // Determine plan from the Stripe subscription's price
    let plan = 'monthly'
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = sub.items.data[0].price.id
      if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) plan = 'annual'
    } catch (e) {
      console.error('[webhook] could not retrieve subscription for plan check:', e.message)
    }

    // Upsert on stripe_subscription_id so replayed events are idempotent
    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: 'active',
        },
        { onConflict: 'stripe_subscription_id' }
      )

    if (error) console.error('[webhook] subscription upsert error:', error.message)
    else console.log('[webhook] subscription activated for user:', userId, '| plan:', plan)
  }

  // ── customer.subscription.deleted ──────────────────────
  // Subscription was deleted outright → mark canceled.
  else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const subscriptionId = sub.id
    const customerId = sub.customer

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('[webhook] subscription.deleted DB update error:', error.message)
    } else {
      console.log('[webhook] subscription deleted — marked canceled | sub:', subscriptionId, '| customer:', customerId)
    }
  }

  // ── customer.subscription.updated ──────────────────────
  // Subscription status changed (e.g. active → past_due, canceled, unpaid).
  // Downgrade the user whenever the subscription is no longer active.
  else if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const subscriptionId = sub.id
    const stripeStatus = sub.status // 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing' | etc.

    // Treat only 'active' and 'trialing' as Pro-worthy
    const isActive = stripeStatus === 'active' || stripeStatus === 'trialing'
    const newStatus = isActive ? 'active' : 'canceled'

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('[webhook] subscription.updated DB update error:', error.message)
    } else {
      console.log(`[webhook] subscription updated | sub: ${subscriptionId} | stripe_status: ${stripeStatus} → db_status: ${newStatus}`)
    }
  }

  res.json({ received: true })
})

// ── Global JSON body parser (after webhook route) ─────────
app.use(express.json())

// ── GET /api/health ───────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── POST /api/search ──────────────────────────────────────
// Returns { allowed: true } or 429 { allowed: false, reason: 'limit_reached' }
app.post('/api/search', async (req, res) => {
  // Resolve real client IP
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip

  console.log('[/api/search] ── incoming request ──')
  console.log('  req.ip                  :', req.ip)
  console.log('  x-forwarded-for header  :', forwarded ?? '(not set)')
  console.log('  resolved ip             :', ip)

  // Admin bypass
  if (ADMIN_IPS.includes(ip)) {
    console.log('  → ADMIN IP — allowed (bypass)')
    return res.json({ allowed: true })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Count today's searches for this IP
  const { count, error: countError } = await supabase
    .from('search_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('date', today)

  if (countError) {
    console.error('  Supabase count error    :', countError.message)
    console.log('  → failing open (count error)')
    return res.json({ allowed: true })
  }

  console.log('  supabase count for today:', count)

  if (count >= 2) {
    console.log('  → BLOCKED (limit reached)')
    return res.status(429).json({ allowed: false, reason: 'limit_reached' })
  }

  // Log the search
  const { error: insertError } = await supabase
    .from('search_logs')
    .insert({ ip_address: ip, date: today })

  if (insertError) {
    console.error('  Supabase insert error   :', insertError.message)
    console.log('  → failing open (insert error)')
    return res.json({ allowed: true })
  }

  console.log('  → ALLOWED (row inserted)')
  return res.json({ allowed: true })
})

// ── POST /api/create-account ──────────────────────────────
app.post('/api/create-account', async (req, res) => {
  const { email, password, plan } = req.body
  console.log('[/api/create-account] email:', email, '| plan:', plan)

  // 1. Create Supabase user
  // NOTE: requires SUPABASE_SERVICE_KEY (service role) in env — anon key fallback will fail here
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (userError) {
    console.error('  Supabase user error:', userError.message)
    const isDuplicate = /already registered|already exists|email.*exist/i.test(userError.message)
    return res.status(400).json({
      error: isDuplicate
        ? 'An account with this email already exists. Please log in instead.'
        : userError.message,
      code: isDuplicate ? 'USER_EXISTS' : 'USER_CREATE_FAILED',
    })
  }
  const userId = userData.user.id
  console.log('  Supabase user created:', userId)

  // 2 & 3. Stripe — wrapped so a Stripe error returns a clean 500 instead of crashing
  try {
    // 2. Create Stripe customer
    const customer = await stripe.customers.create({ email })

    // 3. Create Stripe Checkout session
    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `http://localhost:5174/pro-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5174/`,
      metadata: { user_id: userId },
    })

    console.log('  Stripe session created:', session.id)
    return res.json({ checkoutUrl: session.url })
  } catch (stripeErr) {
    console.error('  Stripe error:', stripeErr.message)
    return res.status(500).json({ error: `Stripe error: ${stripeErr.message}` })
  }
})

// ── POST /api/create-checkout ─────────────────────────────
// For existing users who have an account but no subscription.
// Looks up their user_id by email, then creates a Stripe Checkout session.
app.post('/api/create-checkout', async (req, res) => {
  const { email, plan } = req.body
  console.log('[/api/create-checkout] email:', email, '| plan:', plan)

  // Look up existing user by email via admin API
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
  if (listError) {
    console.error('  listUsers error:', listError.message)
    return res.status(500).json({ error: 'Could not look up account.' })
  }
  const existingUser = listData.users.find(u => u.email === email)
  if (!existingUser) {
    console.error('  user not found for email:', email)
    return res.status(404).json({ error: 'No account found with that email. Please sign up.' })
  }
  const userId = existingUser.id
  console.log('  found existing user:', userId)

  try {
    const customer = await stripe.customers.create({ email })
    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `http://localhost:5174/pro-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5174/`,
      metadata: { user_id: userId },
    })

    console.log('  Stripe session created:', session.id)
    return res.json({ checkoutUrl: session.url })
  } catch (stripeErr) {
    console.error('  Stripe error:', stripeErr.message)
    return res.status(500).json({ error: `Stripe error: ${stripeErr.message}` })
  }
})

// ── GET /api/pro-status ───────────────────────────────────
app.get('/api/pro-status', async (req, res) => {
  const { user_id } = req.query
  console.log('[/api/pro-status] checking user_id:', user_id ?? '(none)')
  if (!user_id) return res.json({ isPro: false, plan: null, renewalDate: null })

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, status, stripe_subscription_id')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('  subscriptions query error:', error.message)
    return res.json({ isPro: false, plan: null, renewalDate: null })
  }
  if (!data) {
    console.log('  no active subscription found → isPro: false')
    return res.json({ isPro: false, plan: null, renewalDate: null })
  }

  // Fetch renewal date from Stripe
  let renewalDate = null
  if (data.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(data.stripe_subscription_id)
      renewalDate = new Date(sub.current_period_end * 1000).toISOString()
    } catch (e) {
      console.error('  stripe renewal date error:', e.message)
    }
  }

  console.log('  subscription found → isPro: true | plan:', data.plan, '| renewalDate:', renewalDate)
  return res.json({ isPro: true, plan: data.plan, renewalDate })
})

// ── POST /api/cancel-subscription ────────────────────────
app.post('/api/cancel-subscription', async (req, res) => {
  const { user_id } = req.body
  console.log('[/api/cancel-subscription] user_id:', user_id)
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  // Look up active subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('  lookup error:', error.message)
    return res.status(500).json({ error: 'Could not look up subscription.' })
  }
  if (!data) {
    return res.status(404).json({ error: 'No active subscription found.' })
  }

  // Cancel in Stripe
  try {
    await stripe.subscriptions.cancel(data.stripe_subscription_id)
    console.log('  Stripe subscription canceled:', data.stripe_subscription_id)
  } catch (e) {
    console.error('  Stripe cancel error:', e.message)
    return res.status(500).json({ error: `Stripe error: ${e.message}` })
  }

  // Update status in DB
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', data.id)

  if (updateError) {
    console.error('  DB update error:', updateError.message)
    // Stripe already canceled — still return success
  }

  console.log('  → subscription canceled for user:', user_id)
  return res.json({ success: true })
})

// ── DELETE /api/reset-searches ───────────────────────────
// Dev-only: wipes all rows from search_logs for easy testing.
// Requires a DELETE RLS policy on search_logs in Supabase:
//   CREATE POLICY "allow_delete" ON search_logs FOR DELETE USING (true);
if (process.env.NODE_ENV !== 'production') {
  app.delete('/api/reset-searches', async (req, res) => {
    console.log('[/api/reset-searches] wiping search_logs...')

    // .gte() gives Supabase the required filter — matches every row since
    // all UUIDs are >= the nil UUID 00000000-0000-0000-0000-000000000000
    const { data, error, count } = await supabase
      .from('search_logs')
      .delete({ count: 'exact' })
      .gte('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error('  reset FAILED:', error.message)
      console.error('  hint: make sure the DELETE RLS policy exists in Supabase:')
      console.error('    CREATE POLICY "allow_delete" ON search_logs FOR DELETE USING (true);')
      return res.status(500).json({ success: false, error: error.message })
    }

    console.log(`  → deleted ${count ?? '?'} row(s) from search_logs`)
    return res.json({ success: true, deleted: count })
  })
}

// ── Static frontend (production only) ────────────────────
// In dev, Vite serves the frontend separately via its own server.
// In production (Railway), Express serves the built /dist files.
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))

  // All non-API routes serve index.html so React Router handles them
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => console.log(`PointPilot API running on port ${PORT}`))
