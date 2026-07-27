import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('pg_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      padding: '16px 16px',
      background: 'rgba(7,4,15,0.98)',
      borderTop: '1px solid rgba(146,16,246,0.25)',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <p style={{
          flex: '1 1 300px',
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
        }}>
          We use cookies to improve your experience. By continuing, you agree to our use of cookies.{' '}
          <a href="/privacy" style={{ color: '#c084ff', textDecoration: 'underline' }}>Privacy Policy</a>
        </p>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => { localStorage.setItem('pg_cookie_consent', 'declined'); setVisible(false) }}
            style={{
              padding: '10px 20px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >Decline</button>
          <button
            onClick={() => { localStorage.setItem('pg_cookie_consent', 'accepted'); setVisible(false) }}
            style={{
              padding: '10px 20px',
              borderRadius: 100,
              border: 'none',
              background: 'linear-gradient(90deg,#610497,#9210f6)',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >Accept All</button>
        </div>
      </div>
    </div>
  )
}
