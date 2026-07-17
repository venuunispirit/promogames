import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../pages/ThemeContext'
import NotificationBell from './NotificationBell'

/* ─────────────────────────────────────────────
   NAV STYLES — light, clean, 3-column
───────────────────────────────────────────── */
const NAV_CSS = `
@keyframes nav-fade-down {
  from { opacity:0; transform:translateY(-8px) }
  to   { opacity:1; transform:none }
}
@keyframes nav-spin { to { transform:rotate(360deg) } }

.nav-root {
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

/* ── left: logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
}
.nav-logo img {
  height: 38px;
  width: auto;
  display: block;
}

/* ── center: links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  padding: 4px;
}
.nav-link {
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
.nav-link:hover {
  color: #1a1a2e;
  background: transparent;
  border-color: none;
}
.nav-link.active {
  color: #8f38ce;
  background: transparent;
  border-color: none;
  border-radius: 12px;
  box-shadow: 0 5px 26px rgba(88, 19, 140, 0.47);
}

/* ── right: greeting + avatar ── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}
.nav-greeting {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
}
.nav-greeting-msg {
  font-size: 11px;
  color: #59188f;
  font-weight: 500;
}
.nav-greeting-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e1e2e;
}

/* ── avatar button ── */
.nav-avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #e8eaf0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  flex-shrink: 0;
  font-family: inherit;
}
.nav-avatar-btn:hover {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
  transform: scale(1.05);
}

/* ── dropdown ── */
.nav-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 360px;
  background: #ffffff;
  border: 1.5px solid #e8eaf0;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  animation: nav-fade-down .18s ease;
  overflow: hidden;
  z-index: 300;
}

/* dropdown sections */
.nav-dd-header {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-dd-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  color: #fff; font-size: 18px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border: 2px solid rgba(255,255,255,0.4);
}
.nav-dd-name  { font-size: 15px; font-weight: 700; color: #fff; }
.nav-dd-email { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 1px; }
.nav-dd-role  { display:inline-flex; align-items:center; padding:2px 8px; background:rgba(255,255,255,0.2); border-radius:20px; font-size:10px; font-weight:700; color:#fff; margin-top:4px; letter-spacing:.04em; text-transform:uppercase; }

.nav-dd-body  { padding: 12px; }
.nav-dd-sep   { height: 1px; background: #f0f2f8; margin: 8px 0; }

.nav-dd-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: #3a3b52;
  transition: background .12s;
  border: none; background: none; width: 100%; text-align: left;
  font-family: inherit;
}
.nav-dd-item:hover { background: #f4f5fb; color: #6366f1; }
.nav-dd-item.danger:hover { background: #fee2e2; color: #dc2626; }
.nav-dd-icon { font-size: 16px; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; background:#f4f5fb; border-radius:8px; flex-shrink:0; }
.nav-dd-item.danger .nav-dd-icon { background: #fee2e2; }

/* ── calendar panel ── */
.nav-cal {
  padding: 0 12px 12px;
}
.nav-cal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 4px 8px; font-size: 13px; font-weight: 700; color: #1e1e2e;
}
.nav-cal-nav {
  background: none; border: 1px solid #e8eaf0; border-radius: 6px;
  width: 26px; height: 26px; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; transition: all .12s;
}
.nav-cal-nav:hover { background: #f4f5fb; color: #6366f1; border-color: #c7d2fe; }
.nav-cal-grid {
  display: grid; grid-template-columns: repeat(7,1fr); gap: 2px;
}
.nav-cal-dow {
  text-align: center; font-size: 10px; font-weight: 700;
  color: #9899b8; padding: 4px 0; letter-spacing:.04em;
}
.nav-cal-day {
  text-align: center; font-size: 12px; font-weight: 500;
  padding: 5px 2px; border-radius: 6px; cursor: default;
  color: #3a3b52; line-height: 1;
}
.nav-cal-day.today {
  background: #6366f1; color: #fff; font-weight: 800;
  box-shadow: 0 2px 6px rgba(99,102,241,0.3);
}
.nav-cal-day.other-month { color: #c9cad8; }
.nav-cal-day.weekend { color: #a855f7; }
.nav-cal-day.today.weekend { color: #fff; }

/* ── password form ── */
.nav-pw-form { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.nav-pw-input {
  width: 100%; padding: 9px 12px; border: 1.5px solid #e8eaf0;
  border-radius: 8px; font-size: 13px; font-family: inherit;
  color: #1e1e2e; background: #f8f9ff; outline: none;
  transition: border-color .14s;
}
.nav-pw-input:focus { border-color: #6366f1; background: #fff; }
.nav-pw-btn {
  padding: 9px; border-radius: 8px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 700; font-family: inherit;
  background: #6366f1; color: #fff; transition: background .14s;
}
.nav-pw-btn:hover:not(:disabled) { background: #4f46e5; }
.nav-pw-btn:disabled { opacity:.5; cursor:not-allowed; }
.nav-pw-msg { font-size: 12px; font-weight: 600; padding: 6px 10px; border-radius: 7px; }
.nav-pw-msg.ok  { background: #dcfce7; color: #15803d; }
.nav-pw-msg.err { background: #fee2e2; color: #dc2626; }

/* ── quick stat chips ── */
.nav-stats { display:flex; gap:6px; padding: 0 12px 12px; }
.nav-stat { flex:1; background:#f4f5fb; border-radius:10px; padding:10px 8px; text-align:center; }
.nav-stat-val { font-size:16px; font-weight:800; color:#6366f1; }
.nav-stat-lbl { font-size:10px; color:#9899b8; font-weight:600; text-transform:uppercase; letter-spacing:.04em; margin-top:2px; }
`

/* ─────── helpers ─────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { msg: 'Good morning', emoji: '☀️' }
  if (h < 17) return { msg: 'Good afternoon', emoji: '🌤️' }
  if (h < 21) return { msg: 'Good evening', emoji: '🌆' }
  return { msg: 'Good night', emoji: '🌙' }
}

function initials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

/* ─────── Mini Calendar ─────── */
function MiniCalendar() {
  const today = new Date()
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() })

  const prev = () => setCur(c => c.m === 0 ? { y:c.y-1, m:11 } : { y:c.y, m:c.m-1 })
  const next = () => setCur(c => c.m ===11 ? { y:c.y+1, m:0  } : { y:c.y, m:c.m+1 })

  // Build calendar grid
  const firstDay  = new Date(cur.y, cur.m, 1).getDay()
  const daysInMonth = new Date(cur.y, cur.m+1, 0).getDate()
  const daysInPrev  = new Date(cur.y, cur.m,   0).getDate()

  const cells = []
  // prev month fill
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, cur: false })
  // current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, cur: true })
  // next month fill
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) cells.push({ d, cur: false })

  return (
    <div className="nav-cal">
      <div className="nav-cal-header">
        <button className="nav-cal-nav" onClick={prev}>‹</button>
        <span>{MONTHS[cur.m]} {cur.y}</span>
        <button className="nav-cal-nav" onClick={next}>›</button>
      </div>
      <div className="nav-cal-grid">
        {DAYS.map(d => <div key={d} className="nav-cal-dow">{d}</div>)}
        {cells.map((cell, i) => {
          const isToday   = cell.cur && cell.d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear()
          const dayOfWeek = i % 7
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          return (
            <div key={i} className={`nav-cal-day${isToday?' today':''}${!cell.cur?' other-month':''}${isWeekend&&!isToday?' weekend':''}`}>
              {cell.d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────── Change Password Form ─────── */
function ChangePasswordForm({ onClose }) {
  const [oldPw,  setOldPw]  = useState('')
  const [newPw,  setNewPw]  = useState('')
  const [confPw, setConfPw] = useState('')
  const [msg,    setMsg]    = useState(null)  // { text, ok }
  const [busy,   setBusy]   = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const submit = async () => {
    if (!oldPw || !newPw || !confPw) { setMsg({ text:'All fields required', ok:false }); return }
    if (newPw !== confPw)             { setMsg({ text:'New passwords do not match', ok:false }); return }
    if (newPw.length < 6)             { setMsg({ text:'Password must be at least 6 characters', ok:false }); return }
    setBusy(true); setMsg(null)
    try {
      await api.post('/auth/change-password', { oldPassword: oldPw, newPassword: newPw })
      setMsg({ text:'Password changed successfully ✅', ok:true })
      setOldPw(''); setNewPw(''); setConfPw('')
      setTimeout(onClose, 1800)
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to change password', ok:false })
    }
    setBusy(false)
  }

  return (
    <div className="nav-pw-form">
      <div style={{ position:'relative' }}>
        <input className="nav-pw-input" type={showOld?'text':'password'} placeholder="Current password"
          value={oldPw} onChange={e => setOldPw(e.target.value)} />
        <span onClick={() => setShowOld(s=>!s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', cursor:'pointer', fontSize:14, color:'#9899b8' }}>{showOld?'🙈':'👁'}</span>
      </div>
      <div style={{ position:'relative' }}>
        <input className="nav-pw-input" type={showNew?'text':'password'} placeholder="New password (min 6 chars)"
          value={newPw} onChange={e => setNewPw(e.target.value)} />
        <span onClick={() => setShowNew(s=>!s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', cursor:'pointer', fontSize:14, color:'#9899b8' }}>{showNew?'🙈':'👁'}</span>
      </div>
      <input className="nav-pw-input" type="password" placeholder="Confirm new password"
        value={confPw} onChange={e => setConfPw(e.target.value)}
        onKeyDown={e => e.key==='Enter' && submit()} />
      {msg && <div className={`nav-pw-msg ${msg.ok?'ok':'err'}`}>{msg.text}</div>}
      <div style={{ display:'flex', gap:6 }}>
        <button className="nav-pw-btn" onClick={submit} disabled={busy} style={{ flex:1 }}>
          {busy ? 'Saving…' : '🔐 Update Password'}
        </button>
        <button className="nav-pw-btn" onClick={onClose} style={{ background:'#f0f2f8', color:'#6b7280', flex:'0 0 auto', padding:'9px 14px' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─────── Avatar Dropdown ─────── */
function AvatarDropdown({ user, onLogout }) {
  const [open,    setOpen]    = useState(false)
  const [panel,   setPanel]   = useState('menu')  // 'menu' | 'calendar' | 'password'
  const [stats,   setStats]   = useState({ games:0, players:0 })
  const ref = useRef()
  const { isDark, toggleTheme } = useTheme()

  // Close on outside click
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setPanel('menu') } }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Fetch quick stats when dropdown opens
  useEffect(() => {
    if (!open) return
    api.get('/games').then(r => {
      const games = r.data.games?.length || r.data.length || 0
      setStats(s => ({ ...s, games }))
    }).catch(() => {})
    api.get('/players-admin').then(r => {
      const players = r.data.players?.length || r.data.length || 0
      setStats(s => ({ ...s, players }))
    }).catch(() => {})
  }, [open])

  const toggle = () => { setOpen(o => !o); setPanel('menu') }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button className="nav-avatar-btn" onClick={toggle} title="Account menu">
        {initials(user?.name)}
      </button>

      {open && (
        <div className="nav-dropdown">
          {/* ── Profile header ── */}
          <div className="nav-dd-header">
            <div className="nav-dd-avatar">{initials(user?.name)}</div>
            <div>
              <div className="nav-dd-name">{user?.name || 'User'}</div>
              <div className="nav-dd-email">{user?.email || ''}</div>
              {user?.role && <div className="nav-dd-role">{user.role}</div>}
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="nav-stats">
            <div className="nav-stat">
              <div className="nav-stat-val">{stats.games}</div>
              <div className="nav-stat-lbl">Games</div>
            </div>
            <div className="nav-stat">
              <div className="nav-stat-val">{stats.players}</div>
              <div className="nav-stat-lbl">Players</div>
            </div>
            <div className="nav-stat">
              <div className="nav-stat-val">{new Date().getDate()}</div>
              <div className="nav-stat-lbl">{MONTHS[new Date().getMonth()].slice(0,3)}</div>
            </div>
          </div>

          <div className="nav-dd-body" style={{ paddingTop:0 }}>

            {panel === 'menu' && (
              <>
                <button className="nav-dd-item" onClick={() => setPanel('calendar')}>
                  <span className="nav-dd-icon">📅</span>
                  <div>
                    <div>Calendar</div>
                    <div style={{ fontSize:11, color:'#9899b8', fontWeight:500 }}>{new Date().toDateString()}</div>
                  </div>
                </button>

                <button className="nav-dd-item" onClick={() => setPanel('password')}>
                  <span className="nav-dd-icon">🔐</span>
                  <div>
                    <div>Change Password</div>
                    <div style={{ fontSize:11, color:'#9899b8', fontWeight:500 }}>Update your credentials</div>
                  </div>
                </button>

                <div className="nav-dd-sep" />

                <div className="nav-dd-theme">
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>☀️</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#1f2433' }}>Theme</span>
                    <span style={{ fontSize:11, color:'#9899b8', fontWeight:500, marginLeft:'auto' }}>{isDark ? 'Dark' : 'Light'}</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    style={{
                      marginTop:8, width:'100%', height:26, borderRadius:100, padding:3,
                      border:'1px solid #e5e7eb', background:'#f1f5f9', cursor:'pointer',
                      position:'relative', transition:'background .2s',
                    }}
                  >
                    <span style={{
                      position:'absolute', top:3, left: isDark ? 'calc(100% - 22px)' : 3,
                      width:20, height:20, borderRadius:'50%', background:'#a855f7',
                      transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.25)',
                    }} />
                  </button>
                </div>

                <div className="nav-dd-sep" />

                <button className="nav-dd-item danger" onClick={onLogout}>
                  <span className="nav-dd-icon">🚪</span>
                  Logout
                </button>
              </>
            )}

            {panel === 'calendar' && (
              <>
                <button className="nav-dd-item" style={{ marginBottom:4 }} onClick={() => setPanel('menu')}>
                  <span style={{ fontSize:14 }}>←</span> Back
                </button>
                <div className="nav-dd-sep" style={{ marginTop:0 }} />
                <MiniCalendar />
              </>
            )}

            {panel === 'password' && (
              <>
                <button className="nav-dd-item" style={{ marginBottom:4 }} onClick={() => setPanel('menu')}>
                  <span style={{ fontSize:14 }}>←</span> Back
                </button>
                <div className="nav-dd-sep" style={{ marginTop:0 }} />
                <ChangePasswordForm onClose={() => setPanel('menu')} />
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   DASHBOARD LAYOUT
═══════════════════════════════════════ */
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const [greeting, setGreeting] = useState(getGreeting())

  // Update greeting every minute
  useEffect(() => {
    const t = setInterval(() => setGreeting(getGreeting()), 60_000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const navLinks = [
    { to:'/dashboard',         label:'Dashboard', icon:'🏠', exact:true },
    { to:'/dashboard/clients', label:'Clients',   icon:'🏢' },
    { to:'/dashboard/games',   label:'Games',     icon:'🎮' },
    { to:'/dashboard/crm',     label:'Team',      icon:'👥' },
    { to:'/dashboard/players', label:'Players',   icon:'🎯' },
    { to:'/dashboard/status',  label:'Status',    icon:'📊' },
    { to:'/dashboard/bo-logs', label:'BO Logs',   icon:'🧾' },
  ]

  const isActive = link => link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to)

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', transition:'var(--transition)' }}>
      <style>{NAV_CSS}</style>

      {/* ── Navbar ── */}
      <nav className="nav-root">

        {/* LEFT — Logo only */}
        <div>
          <Link to="/dashboard" className="nav-logo">
            <img src="/favicon3.png" alt="PromoGames" />
          </Link>
        </div>

        {/* CENTER — Nav links pill */}
        <div className="nav-links">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`nav-link${isActive(link) ? ' active' : ''}`}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT — Greeting + Notifications + Avatar */}
        <div className="nav-right">
          <div className="nav-greeting">
            <span className="nav-greeting-msg">{greeting.emoji} {greeting.msg}</span>
            <span className="nav-greeting-name">{user?.name?.split(' ')[0] || 'there'}!</span>
          </div>
          <AvatarDropdown user={user} onLogout={handleLogout} />
          <NotificationBell />
        </div>

      </nav>

      {/* ── Page content ── */}
      <Outlet />
    </div>
  )
}