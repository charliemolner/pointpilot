import { useNavigate } from 'react-router-dom'

// Design tokens
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

const LAST_UPDATED = 'May 18, 2026'

function Section({ number, title, children }) {
  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${BORDER_MID}`,
      borderRadius: '14px',
      padding: '24px 28px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
        <span style={{
          fontSize: '11px', fontWeight: '600',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: ACCENT_LT, flexShrink: 0,
        }}>
          {String(number).padStart(2, '0')}
        </span>
        <h2 style={{
          fontSize: '16px', fontWeight: '600',
          letterSpacing: '-0.3px', color: TEXT,
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      <div style={{
        color: MUTED, fontSize: '14px',
        lineHeight: 1.75, letterSpacing: '-0.1px',
      }}>
        {children}
      </div>
    </div>
  )
}

function P({ children }) {
  return <p style={{ margin: '0 0 10px 0' }}>{children}</p>
}

function Ul({ children }) {
  return (
    <ul style={{
      margin: '0 0 10px 0',
      paddingLeft: '20px',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      {children}
    </ul>
  )
}

function Li({ children }) {
  return <li style={{ color: MUTED }}>{children}</li>
}

export default function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>

      {/* Navbar */}
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
          maxWidth: '760px', margin: '0 auto', padding: '0 24px',
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
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none',
              color: MUTED, fontSize: '13px',
              fontWeight: '400', cursor: 'pointer',
              letterSpacing: '-0.1px', padding: '4px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            Back
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 38px)',
            fontWeight: '700',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            background: 'linear-gradient(180deg, #f1f5f9 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
          }}>
            Terms of Service
          </h1>
          <p style={{ color: SUBTLE, fontSize: '13px', letterSpacing: '-0.1px' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Intro callout */}
        <div style={{
          background: ELEVATED,
          border: `1px solid ${BORDER_MID}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: MUTED, fontSize: '14px', lineHeight: 1.7,
        }}>
          Please read these Terms of Service carefully before using PointPilot. By accessing or using our service, you agree to be bound by these terms.
        </div>

        {/* Sections */}
        <Section number={1} title="Acceptance of Terms">
          <P>
            By accessing or using PointPilot ("Service", "we", "us", or "our") at pointpilot.dev, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Service.
          </P>
          <P>
            These Terms apply to all visitors, users, and others who access or use the Service. Your continued use of the Service following the posting of any changes constitutes your acceptance of those changes.
          </P>
        </Section>

        <Section number={2} title="Description of Service">
          <P>
            PointPilot is a travel rewards optimization tool that helps users evaluate how to best redeem credit card points and airline miles. The Service provides:
          </P>
          <Ul>
            <Li>Estimated point valuations based on publicly available award chart data</Li>
            <Li>Route-based redemption suggestions across loyalty programs</Li>
            <Li>Comparisons between credit card transfer partners and booking options</Li>
            <Li>General guidance on maximizing the value of travel rewards</Li>
          </Ul>
          <P>
            The Service is intended for personal, non-commercial use. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without notice.
          </P>
        </Section>

        <Section number={3} title="User Accounts">
          <P>
            To access certain features of the Service, you must create an account. You agree to:
          </P>
          <Ul>
            <Li>Provide accurate, current, and complete information during registration</Li>
            <Li>Maintain the security of your password and accept responsibility for all activity under your account</Li>
            <Li>Notify us immediately of any unauthorized use of your account</Li>
            <Li>Not share your account credentials with any third party</Li>
          </Ul>
          <P>
            We reserve the right to terminate accounts that violate these Terms or that have been inactive for an extended period. You may delete your account at any time by contacting us.
          </P>
        </Section>

        <Section number={4} title="Subscription and Payments">
          <P>
            PointPilot Pro is a paid subscription that unlocks unlimited searches and additional features. Subscriptions are available on a monthly or annual basis.
          </P>
          <Ul>
            <Li>All payments are processed securely through Stripe. PointPilot does not store your payment information.</Li>
            <Li>Subscriptions automatically renew at the end of each billing period unless canceled.</Li>
            <Li>You may cancel your subscription at any time from your account settings. Cancellation takes effect immediately.</Li>
            <Li>We do not offer refunds for partial billing periods.</Li>
            <Li>We reserve the right to change subscription pricing with 30 days notice to existing subscribers.</Li>
          </Ul>
          <P>
            Free tier users are subject to usage limits that may change at our discretion.
          </P>
        </Section>

        <Section number={5} title="Disclaimer of Warranties">
          <P>
            Results provided by PointPilot are <strong style={{ color: TEXT }}>estimates only and do not constitute financial, investment, or travel advice</strong>. Specifically:
          </P>
          <Ul>
            <Li>Award availability, redemption rates, and program terms change frequently. Information may be outdated.</Li>
            <Li>Point valuations are subjective estimates and your actual experience may differ significantly.</Li>
            <Li>PointPilot is not affiliated with any airline, hotel, or credit card issuer. We have no ability to guarantee award availability.</Li>
            <Li>Always verify current award availability, transfer ratios, and program terms directly with the relevant loyalty program before transferring points. Point transfers are generally irreversible.</Li>
          </Ul>
          <P>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </P>
        </Section>

        <Section number={6} title="Limitation of Liability">
          <P>
            TO THE FULLEST EXTENT PERMITTED BY LAW, POINTPILOT AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICE.
          </P>
          <P>
            This includes but is not limited to damages resulting from:
          </P>
          <Ul>
            <Li>Reliance on point valuations or redemption estimates provided by the Service</Li>
            <Li>Loss of points or miles resulting from transfers made based on Service recommendations</Li>
            <Li>Errors or inaccuracies in award chart data, transfer partner ratios, or redemption options</Li>
            <Li>Interruptions, bugs, or errors in the Service</Li>
          </Ul>
          <P>
            In no event shall our total liability to you exceed the amount you paid us in the 12 months preceding the claim, or $50, whichever is greater.
          </P>
        </Section>

        <Section number={7} title="Affiliate Disclosure">
          <P>
            PointPilot participates in affiliate marketing programs. This means we may earn a commission if you apply for or are approved for a credit card or financial product linked from our Service.
          </P>
          <Ul>
            <Li>Affiliate compensation does not influence our redemption recommendations, which are generated algorithmically based on publicly available award data.</Li>
            <Li>Cards shown in our affiliate section are presented as general options and may not be optimal for your specific situation.</Li>
            <Li>We are not responsible for the terms, conditions, or decisions of any third-party card issuer.</Li>
          </Ul>
          <P>
            We are committed to transparency. If you have questions about our affiliate relationships, please contact us.
          </P>
        </Section>

        <Section number={8} title="Privacy">
          <P>
            Your use of the Service is also governed by our Privacy Policy. By using PointPilot, you consent to the collection and use of information as described therein. Key points:
          </P>
          <Ul>
            <Li>We collect account information (email, password hash) and usage data to provide and improve the Service.</Li>
            <Li>We do not sell your personal data to third parties.</Li>
            <Li>Point balances and card information you enter are used only to generate your search results and are not stored permanently.</Li>
            <Li>We use Supabase for authentication and Stripe for payment processing. Each has their own privacy policy.</Li>
          </Ul>
        </Section>

        <Section number={9} title="Changes to Terms">
          <P>
            We reserve the right to modify these Terms at any time. When we make changes, we will update the "Last updated" date at the top of this page.
          </P>
          <P>
            For material changes, we will make reasonable efforts to notify active subscribers via email. Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
          </P>
          <P>
            If you disagree with any changes, you may cancel your subscription and discontinue use of the Service.
          </P>
        </Section>

        <Section number={10} title="Contact">
          <P>
            If you have questions, concerns, or feedback about these Terms of Service, please reach out:
          </P>
          <Ul>
            <Li>Email: <a href="mailto:charliemolner@gmail.com" style={{ color: ACCENT_LT, textDecoration: 'none' }}>charliemolner@gmail.com</a></Li>
            <Li>Website: <a href="https://pointpilot.dev" style={{ color: ACCENT_LT, textDecoration: 'none' }}>pointpilot.dev</a></Li>
          </Ul>
          <P>
            We aim to respond to all inquiries within 3 business days.
          </P>
        </Section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: SUBTLE, letterSpacing: '-0.1px' }}>
          Copyright &copy; 2026 PointPilot. Results are estimates. Always verify award availability before transferring points.
        </p>
      </footer>

    </div>
  )
}
