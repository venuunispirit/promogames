import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'

const CSS = `
.it-layout *,.it-layout *::before,.it-layout *::after{box-sizing:border-box;margin:0;padding:0}
.it-layout{font-family:'DM Sans',sans-serif;min-height:100vh;display:flex;background:#F8F9FB}
.it-sidebar{width:220px;background:#fff;border-right:1.5px solid #EAECF0;padding:24px 16px;display:flex;flex-direction:column;flex-shrink:0}
.it-logo{font-family:'Fraunces',serif;font-weight:600;font-size:18px;color:#0D0D1A;margin-bottom:28px;padding:0 8px}
.it-nav{display:flex;flex-direction:column;gap:4px;flex:1}
.it-nav a{padding:10px 12px;border-radius:10px;font-size:13.5px;font-weight:600;color:#6B7280;text-decoration:none;transition:all .13s;display:flex;align-items:center;gap:8px}
.it-nav a:hover{background:#F3F4F6;color:#374151}
.it-nav a.active{background:#EEF2FF;color:#4338CA}
.it-main{flex:1;min-width:0}
.it-header{height:62px;border-bottom:1.5px solid #EAECF0;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 32px}
.it-user{font-size:13px;font-weight:600;color:#374151;display:flex;align-items:center;gap:8px}
.it-content{padding:32px}
`

export default function ITLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [member, setMember] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('itUser')
    const token = localStorage.getItem('itToken')
    if (stored && token) {
      setMember(JSON.parse(stored))
    } else {
      navigate('/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('itToken')
    localStorage.removeItem('itUser')
    navigate('/login')
  }

  if (!member) return null

  const links = [
    { to: '/internal-team/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/internal-team/requests', label: 'Requests', icon: '📋' },
  ]

  return (
    <div className="it-layout">
      <style>{CSS}</style>
      <aside className="it-sidebar">
        <div className="it-logo">PromoGames</div>
        <nav className="it-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'12px 8px',borderTop:'1px solid #EAECF0',marginTop:'auto'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:4}}>{member.name}</div>
          <div style={{fontSize:11,color:'#9CA3AF',marginBottom:8}}>{member.email}</div>
          <button onClick={handleLogout} style={{padding:'6px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#DC2626',fontFamily:'DM Sans',width:'100%'}}>Logout</button>
        </div>
      </aside>
      <div className="it-main">
        <div className="it-header">
          <span style={{fontSize:13,color:'#6B7280'}}>Internal Team Portal</span>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="it-user">🛠️ {member.name}</div>
            <NotificationBell apiBase="/internal-team/notifications" />
          </div>
        </div>
        <div className="it-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
