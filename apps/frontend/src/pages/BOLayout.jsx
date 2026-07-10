import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'

const BO_NAV_CSS = `
@keyframes boFadeDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }
.bo-nav {
  background: #0f0a1e;
  border-bottom: 1px solid rgba(139,92,246,0.15);
  height: 62px;
  padding: 0 28px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: sticky; top: 0; z-index: 200;
  font-family: 'DM Sans', 'Inter', sans-serif;
}
.bo-nav-links { display: flex; align-items: center; gap: 4px; }
.bo-nav-link {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  color: rgba(167,139,250,0.6); text-decoration: none;
  transition: all .15s; white-space: nowrap;
}
.bo-nav-link:hover { color: #c084fc; background: rgba(139,92,246,0.08); }
.bo-nav-link.active { color: #c084fc; background: rgba(139,92,246,0.12); }
.bo-nav-right { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
.bo-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2px solid rgba(139,92,246,0.3);
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: #fff; font-size: 14px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0; font-family: inherit;
}
.bo-avatar:hover { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.18); }
.bo-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: #1a0f2e; border: 1px solid rgba(139,92,246,0.15);
  border-radius: 12px; padding: 6px; min-width: 180px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 300;
  animation: boFadeDown .15s ease;
}
.bo-dd-item {
  display: block; width: 100%; padding: 10px 14px;
  border: none; background: none; color: rgba(167,139,250,0.7);
  font-size: 13px; font-weight: 600; text-align: left; cursor: pointer;
  border-radius: 8px; font-family: inherit; text-decoration: none;
  transition: all .12s;
}
.bo-dd-item:hover { background: rgba(139,92,246,0.1); color: #c084fc; }
`

export default function BOLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [bo, setBo] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const ddRef = useRef()

  useEffect(() => {
    const stored = localStorage.getItem('businessUser')
    const token = localStorage.getItem('businessToken')
    if (!token || !stored) {
      navigate('/login')
      return
    }
    setBo(JSON.parse(stored))
  }, [])

  useEffect(() => {
    const fn = e => { if (ddRef.current && !ddRef.current.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('businessToken')
    localStorage.removeItem('businessUser')
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : ''

  return (
    <div style={{ minHeight:'100vh', background:'#0f0a1e' }}>
      <style>{BO_NAV_CSS}</style>
      <nav className="bo-nav">
        <div className="bo-nav-links">
          <Link to="/bo/dashboard" className={`bo-nav-link ${isActive('/bo/dashboard')}`}>
            📊 Dashboard
          </Link>
          <Link to="/bo/games" className={`bo-nav-link ${isActive('/bo/games')}`}>
            🎮 My Games
          </Link>
          <Link to="/bo/redemptions" className={`bo-nav-link ${isActive('/bo/redemptions')}`}>
            🏆 Redemptions
          </Link>
        </div>
        <div style={{ fontSize:18, fontWeight:800, background:'linear-gradient(135deg,#c084fc,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          {bo?.business_name || 'Business'}
        </div>
        <div className="bo-nav-right" style={{ position:'relative' }} ref={ddRef}>
          <div className="bo-avatar" onClick={() => setShowDropdown(s => !s)}>
            {bo?.business_name?.charAt(0).toUpperCase() || 'B'}
          </div>
          {showDropdown && (
            <div className="bo-dropdown">
              <div style={{ padding:'10px 14px', color:'rgba(167,139,250,0.4)', fontSize:12, borderBottom:'1px solid rgba(139,92,246,0.1)', marginBottom:4 }}>
                {bo?.email}
              </div>
              <button className="bo-dd-item" onClick={handleLogout}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </nav>
      <div style={{ padding:'24px 28px', maxWidth:1200, margin:'0 auto' }}>
        <Outlet />
      </div>
    </div>
  )
}
