import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../pages/ThemeContext'

export default function DashboardLayout() {
  const { logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      transition: 'var(--transition)',
    }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ 
            fontSize: 20, 
            fontWeight: 900, 
            color: 'var(--primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            🎮 QuizPlatform
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/dashboard/games', label: 'Games' },
              { to: '/dashboard/clients', label: 'Clients' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text2)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface2)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text2)'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - Theme Toggle & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              position: 'relative',
              width: 56,
              height: 28,
              borderRadius: 99,
              background: isDark ? 'var(--primary)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            }}
            aria-label="Toggle theme"
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: isDark ? 30 : 2,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--error-bg)'
              e.currentTarget.style.color = 'var(--error)'
              e.currentTarget.style.borderColor = 'var(--error)'
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

      {/* Main Content */}
      <Outlet />
    </div>
  )
}