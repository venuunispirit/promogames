import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../pages/ThemeContext'

export default function DashboardLayout() {
  const { logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard',         label: '🏠 Dashboard', exact: true },
    { to: '/dashboard/games',   label: '🎮 Games'    },
    { to: '/dashboard/clients', label: '🏢 Clients'  },
    { to: '/dashboard/players', label: '👥 Players'  },
  ]

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      transition: 'var(--transition)',
    }}>

      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 60,
        boxShadow: 'var(--shadow-sm)',
      }}>

        {/* Left — Logo + Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/dashboard" style={{
            fontSize: 18,
            fontWeight: 900,
            color: 'var(--primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginRight: 24,
            whiteSpace: 'nowrap',
          }}>
            🎮 PromoGames
          </Link>

          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: isActive(link) ? 'var(--primary)' : 'var(--text2)',
                textDecoration: 'none',
                background: isActive(link) ? 'rgba(124,111,247,0.12)' : 'transparent',
                border: isActive(link) ? '1px solid rgba(124,111,247,0.25)' : '1px solid transparent',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive(link)) {
                  e.currentTarget.style.background = 'var(--surface2)'
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive(link)) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text2)'
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — Theme Toggle + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              position: 'relative',
              width: 52,
              height: 26,
              borderRadius: 99,
              background: isDark ? 'var(--primary)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
              flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute',
              top: 2,
              left: isDark ? 28 : 2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <Outlet />
    </div>
  )
}