// Only renders on localhost - never visible in production
export default function DevResetButton() {
  if (typeof window === 'undefined') return null
  if (window.location.hostname !== 'localhost') return null

  const handleReset = async () => {
    try {
      await fetch('/api/reset-searches', { method: 'DELETE' })
    } catch {
      // server may be down - still clear client storage
    }
    localStorage.removeItem('pp_search_count')
    localStorage.removeItem('pp_search_date')
    sessionStorage.removeItem('pp_fresh_search')
    alert('Searches reset')
  }

  return (
    <button
      onClick={handleReset}
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '16px',
        background: 'none',
        border: 'none',
        color: '#9ca3af',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '4px 6px',
        zIndex: 9999,
        fontFamily: 'inherit',
        textDecoration: 'underline',
        opacity: 0.6,
      }}
    >
      Reset searches
    </button>
  )
}
