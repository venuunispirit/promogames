import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

const BD_NAV_CSS = `
@keyframes bdFadeDown {
  from { opacity:0; transform:translateY(-8px) }
  to   { opacity:1; transform:none }
}
.bd-nav {
  background: #ffffff;
  border-bottom: 1.5px solid #e8eaf0;
  height: 62px;
  padding: 0 28px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 1px 12px rgba(0,0,0,0.06);
  font-family: 'DM Sans', 'Inter', sans-serif;
}
.bd-nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  padding: 4px;
}
.bd-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 0px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
  border: none;
}
.bd-nav-link:hover { color: #1a1a2e; }
.bd-nav-link.active { color: #8f38ce; }
.bd-nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}
.bd-avatar-btn {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2px solid #e8eaf0;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #fff; font-size: 14px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0; font-family: inherit;
}
.bd-avatar-btn:hover { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.18); transform: scale(1.05); }
.bd-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 220px; background: #ffffff;
  border: 1.5px solid #e8eaf0; border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  animation: bdFadeDown .18s ease; overflow: hidden; z-index: 300;
  padding: 12px;
}
.bd-dd-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: #3a3b52;
  transition: background .12s;
  border: none; background: none; width: 100%; text-align: left;
  font-family: inherit;
}
.bd-dd-item:hover { background: #f4f5fb; color: #059669; }
.bd-dd-item.danger:hover { background: #fee2e2; color: #dc2626; }
`

function initials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

export default function BDLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [bd, setBd] = useState(null)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const stored = localStorage.getItem('bdUser')
    const token = localStorage.getItem('bdToken')
    if (stored && token) {
      setBd(JSON.parse(stored))
    } else {
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('bdToken')
    localStorage.removeItem('bdUser')
    navigate('/login')
  }

  const navLinks = [
    { to:'/crm/dashboard', label:'Dashboard', icon:'📊' },
    { to:'/crm/requests',  label:'Requests',  icon:'📋' },
  ]
  const isActive = link => location.pathname.startsWith(link.to)

  return (
    <div style={{ minHeight:'100vh', background:'#F8F9FB' }}>
      <style>{BD_NAV_CSS}</style>
      <nav className="bd-nav">
        <div>
          <Link to="/crm/dashboard" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
            <img src="/favicon3.png" alt="" style={{ height:32 }} />
          </Link>
        </div>
        <div className="bd-nav-links">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`bd-nav-link${isActive(link) ? ' active' : ''}`}>
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>
        <div className="bd-nav-right" ref={ref} style={{ position:'relative' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{bd?.name || 'BD'}</span>
          <button className="bd-avatar-btn" onClick={() => setOpen(o => !o)}>
            {initials(bd?.name)}
          </button>
          {open && (
            <div className="bd-dropdown">
              <div style={{ padding:'8px 12px', borderBottom:'1px solid #f0f2f8', marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1e1e2e' }}>{bd?.name}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{bd?.email}</div>
              </div>
              <button className="bd-dd-item danger" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
