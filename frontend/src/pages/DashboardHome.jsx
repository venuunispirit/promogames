import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeContext'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&display=swap`

const CSS = `
@import url('${FONT_URL}');
.dh *,.dh *::before,.dh *::after{box-sizing:border-box;margin:0;padding:0}
.dh{font-family:'DM Sans',sans-serif;display:flex;min-height:100vh;background:#F8F9FB}

/* Sidebar */
.dh-sidebar{
  width:248px;flex-shrink:0;background:#0D0D1A;
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;height:100vh;
  z-index:50;
}
.dh-main{margin-left:248px;flex:1;min-height:100vh;background:#F8F9FB}

/* Nav links */
.dh-nav-item{
  display:flex;align-items:center;gap:11px;
  padding:10px 16px;border-radius:10px;
  font-size:13.5px;font-weight:500;color:rgba(255,255,255,.5);
  cursor:pointer;transition:all .15s;text-decoration:none;
  margin:1px 12px;
  border:none;background:none;font-family:'DM Sans',sans-serif;
  width:calc(100% - 24px);text-align:left;
}
.dh-nav-item:hover{color:rgba(255,255,255,.85);background:rgba(255,255,255,.06)}
.dh-nav-item.active{color:#fff;background:rgba(255,255,255,.1);font-weight:600}
.dh-nav-item.active .dh-nav-dot{opacity:1}
.dh-nav-dot{width:5px;height:5px;border-radius:50%;background:#818CF8;opacity:0;flex-shrink:0;margin-left:auto;transition:opacity .15s}

/* Cards */
.dh-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;transition:border-color .18s,box-shadow .18s,transform .18s}
.dh-card:hover{border-color:#C7D2FE;box-shadow:0 6px 28px rgba(99,102,241,.09);transform:translateY(-2px)}
.dh-stat-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;padding:22px 24px;position:relative;overflow:hidden;transition:border-color .18s,box-shadow .18s,transform .18s;animation:dhFadeUp .35s ease both}
.dh-stat-card:hover{border-color:#C7D2FE;box-shadow:0 6px 28px rgba(99,102,241,.1);transform:translateY(-3px)}

/* Table */
.dh-table-row{border-bottom:1px solid #F3F4F6;transition:background .13s;cursor:default}
.dh-table-row:hover{background:#FAFAFA}

/* Status badge */
.dh-badge-live{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0}
.dh-badge-off{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}

/* Skeleton */
.dh-skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%);background-size:200% 100%;animation:dhShimmer 1.4s infinite;border-radius:8px}

/* Toggle */
.dh-theme-toggle{width:42px;height:24px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;background:#2D2D3F}
.dh-theme-toggle::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.dh-theme-toggle.dark::after{transform:translateX(18px)}

@keyframes dhFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes dhShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes dhSpin{to{transform:rotate(360deg)}}
@keyframes dhPulse{0%,100%{opacity:1}50%{opacity:.4}}
`

// Icons
const Ico = {
  home:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  clients: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>,
  games:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>,
  chart:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  settings:() => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  sun:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  moon:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  arrow:   () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  plus:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  logout:  () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  spin:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'dhSpin .8s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  dot:     (c) => <span style={{width:6,height:6,borderRadius:'50%',background:c,display:'inline-block',flexShrink:0}}/>,
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ activePath }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme ? useTheme() : { isDark: false, toggleTheme: () => {} }

  const nav = [
    { label: 'Overview',  path: '/dashboard',         icon: <Ico.home/> },
    { label: 'Clients',   path: '/dashboard/clients',  icon: <Ico.clients/> },
    { label: 'Games',     path: '/dashboard/games',    icon: <Ico.games/> },
    { label: 'Analytics', path: '/dashboard/analytics',icon: <Ico.chart/> },
    { label: 'Settings',  path: '/dashboard/settings', icon: <Ico.settings/> },
  ]

  return (
    <aside className="dh-sidebar">
      {/* Logo */}
      <div style={{padding:'28px 24px 24px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:'#4F46E5',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
          </div>
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:16,color:'#fff',letterSpacing:'-0.02em',lineHeight:1}}>QuizCraft</div>
            <div style={{fontSize:10.5,color:'rgba(255,255,255,.35)',fontWeight:500,marginTop:2,letterSpacing:'.03em'}}>Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,paddingTop:12,paddingBottom:12}}>
        <div style={{padding:'8px 24px 6px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.12em'}}>Main</div>
        {nav.slice(0,3).map(item => {
          const active = activePath === item.path || (item.path !== '/dashboard' && activePath?.startsWith(item.path))
          return (
            <button key={item.path} className={`dh-nav-item ${active?'active':''}`} onClick={() => navigate(item.path)}>
              <span style={{opacity: active ? 1 : 0.6}}>{item.icon}</span>
              {item.label}
              <span className="dh-nav-dot"/>
            </button>
          )
        })}

        <div style={{padding:'20px 24px 6px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.12em'}}>System</div>
        {nav.slice(3).map(item => {
          const active = activePath === item.path
          return (
            <button key={item.path} className={`dh-nav-item ${active?'active':''}`} onClick={() => navigate(item.path)}>
              <span style={{opacity: active ? 1 : 0.6}}>{item.icon}</span>
              {item.label}
              <span className="dh-nav-dot"/>
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{padding:'16px 12px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        {/* Theme toggle */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',marginBottom:4}}>
          <div style={{display:'flex',alignItems:'center',gap:8,color:'rgba(255,255,255,.4)',fontSize:12.5,fontWeight:500}}>
            {isDark ? <Ico.moon/> : <Ico.sun/>}
            {isDark ? 'Dark mode' : 'Light mode'}
          </div>
          <button className={`dh-theme-toggle ${isDark?'dark':''}`} onClick={toggleTheme}
            style={{background: isDark ? '#4F46E5' : '#2D2D3F'}} />
        </div>
        {/* User row */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,.04)'}}>
          <div style={{width:32,height:32,borderRadius:8,background:'#1E1E2E',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#818CF8',flexShrink:0}}>A</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Admin</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>Platform Owner</div>
          </div>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.3)',padding:4,borderRadius:6,display:'flex',transition:'color .14s'}}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}
          ><Ico.logout/></button>
        </div>
      </div>
    </aside>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accentColor, loading, delay, sub }) {
  return (
    <div className="dh-stat-card" style={{animationDelay:`${delay}ms`}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:accentColor,borderRadius:'14px 14px 0 0'}} />
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
        <span style={{fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.09em'}}>{label}</span>
        <div style={{width:40,height:40,borderRadius:10,background:`${accentColor}15`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="dh-skeleton" style={{height:42,width:'55%'}} />
      ) : (
        <div style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:38,color:'#0D0D1A',letterSpacing:'-0.04em',lineHeight:1}}>
          {Number(value).toLocaleString()}
        </div>
      )}
      {sub && !loading && (
        <div style={{fontSize:12,color:'#9CA3AF',marginTop:6,fontWeight:500}}>{sub}</div>
      )}
    </div>
  )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniChart({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const days = ['M','T','W','T','F','S','S']
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-end',gap:5,height:64}}>
        {data.map((val, i) => {
          const h = Math.max(((val - min) / range) * 100, 8)
          const isLast = i === data.length - 1
          return (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end'}}>
              <div style={{width:'100%',height:`${h}%`,background: isLast ? color : `${color}55`,borderRadius:'4px 4px 0 0',transition:'height .4s ease'}} />
            </div>
          )
        })}
      </div>
      <div style={{display:'flex',gap:5,marginTop:8}}>
        {days.map((d,i) => <div key={i} style={{flex:1,textAlign:'center',fontSize:10,color:'#9CA3AF',fontWeight:600}}>{d}</div>)}
      </div>
    </div>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ pct, color }) {
  const r = 46, c = 2 * Math.PI * r
  const off = c - (pct / 100) * c
  return (
    <div style={{position:'relative',width:120,height:120}}>
      <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 1s ease'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:24,color:'#0D0D1A',letterSpacing:'-0.03em'}}>{pct}%</div>
        <div style={{fontSize:10,color:'#9CA3AF',fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em',marginTop:1}}>Active</div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function LiveBadge({ active }) {
  return active ? (
    <span className="dh-badge-live"><span style={{width:5,height:5,borderRadius:'50%',background:'#22C55E',display:'inline-block',animation:'dhPulse 2s ease infinite'}}/> Live</span>
  ) : (
    <span className="dh-badge-off"><span style={{width:5,height:5,borderRadius:'50%',background:'#EF4444',display:'inline-block'}}/> Off</span>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData] = useState([38, 52, 44, 61, 55, 70, 75])
  const navigate = useNavigate()
  const location = useLocation()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/games')])
      .then(([cr, gr]) => {
        const games = gr.data.games || []
        const plays = games.reduce((s, g) => s + (g.play_count || 0), 0)
        setStats({ clients: cr.data.clients?.length || 0, games: games.length, plays, active: games.filter(g => g.is_active).length })
        setRecentGames(games.slice(0, 6))
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const activeRate = stats?.games ? Math.round((stats.active / stats.games) * 100) : 0

  const cards = [
    { label: 'Total Clients', value: stats?.clients || 0, accentColor: '#6366F1', delay: 0,
      icon: <svg width="18" height="18" fill="none" stroke="#6366F1" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>,
      sub: 'organisations onboarded' },
    { label: 'Total Games', value: stats?.games || 0, accentColor: '#8B5CF6', delay: 80,
      icon: <svg width="18" height="18" fill="none" stroke="#8B5CF6" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>,
      sub: 'across all clients' },
    { label: 'Active Games', value: stats?.active || 0, accentColor: '#F59E0B', delay: 160,
      icon: <svg width="18" height="18" fill="none" stroke="#F59E0B" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      sub: `${activeRate}% activation rate` },
    { label: 'Total Plays', value: stats?.plays || 0, accentColor: '#10B981', delay: 240,
      icon: <svg width="18" height="18" fill="none" stroke="#10B981" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="#10B981" stroke="none"/></svg>,
      sub: '+12% from last month' },
  ]

  return (
    <div className="dh">
      <style>{CSS}</style>
      <Sidebar activePath={location.pathname} />

      <main className="dh-main">
        <div style={{padding:'38px 40px',maxWidth:1140,margin:'0 auto'}}>

          {/* Page Header */}
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,flexWrap:'wrap',gap:16}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Dashboard Overview</p>
              <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:'#0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
                {greeting}
              </h1>
              <p style={{fontSize:14,color:'#9CA3AF',marginTop:8,fontWeight:400}}>
                Here's what's happening across your quiz platform today.
              </p>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <button onClick={() => navigate('/dashboard/clients')} style={{
                display:'inline-flex',alignItems:'center',gap:7,padding:'10px 18px',
                borderRadius:10,border:'1.5px solid #E5E7EB',background:'#fff',
                color:'#374151',fontSize:13.5,fontFamily:"'DM Sans',sans-serif",
                fontWeight:600,cursor:'pointer',transition:'background .14s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                New Client
              </button>
              <button onClick={() => navigate('/dashboard/games')} style={{
                display:'inline-flex',alignItems:'center',gap:7,padding:'10px 18px',
                borderRadius:10,border:'none',background:'#18181B',
                color:'#fff',fontSize:13.5,fontFamily:"'DM Sans',sans-serif",
                fontWeight:600,cursor:'pointer',transition:'background .14s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='#27272A'}
                onMouseLeave={e=>e.currentTarget.style.background='#18181B'}
              >
                <Ico.plus/> Create Game
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16,marginBottom:28}}>
            {cards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
          </div>

          {/* Content Row */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20}}>

            {/* Recent Games Table */}
            <div style={{background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',overflow:'hidden'}}>
              <div style={{padding:'18px 24px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:18,color:'#0D0D1A',letterSpacing:'-0.02em'}}>Recent Games</h2>
                  <p style={{fontSize:12.5,color:'#9CA3AF',marginTop:3}}>{recentGames.length} most recent</p>
                </div>
                <button onClick={() => navigate('/dashboard/games')} style={{
                  display:'inline-flex',alignItems:'center',gap:5,padding:'7px 14px',
                  borderRadius:9,border:'1.5px solid #E5E7EB',background:'#fff',
                  fontSize:12.5,fontWeight:600,color:'#374151',cursor:'pointer',
                  fontFamily:"'DM Sans',sans-serif",transition:'background .13s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F3F4F6'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                >
                  View all <Ico.arrow/>
                </button>
              </div>

              {loading ? (
                <div style={{padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
                  {[100,80,90,75,85].map((w,i) => <div key={i} className="dh-skeleton" style={{height:18,width:`${w}%`}} />)}
                </div>
              ) : recentGames.length === 0 ? (
                <div style={{padding:'60px 24px',textAlign:'center'}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                    <svg width="26" height="26" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
                  </div>
                  <p style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:17,color:'#0D0D1A',marginBottom:6}}>No games yet</p>
                  <p style={{fontSize:13.5,color:'#9CA3AF'}}>Create your first game to see it here.</p>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
                    <thead>
                      <tr style={{borderBottom:'1px solid #F3F4F6',background:'#FAFAFA'}}>
                        {['Game','Client','Questions','Plays','Status',''].map(h => (
                          <th key={h} style={{padding:'11px 20px',textAlign:'left',fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map(g => (
                        <tr key={g.id} className="dh-table-row">
                          <td style={{padding:'14px 20px'}}>
                            <div style={{fontWeight:600,fontSize:13.5,color:'#0D0D1A'}}>{g.name}</div>
                            <div style={{fontSize:11.5,color:'#9CA3AF',marginTop:2,textTransform:'capitalize'}}>{g.category||'quiz'}</div>
                          </td>
                          <td style={{padding:'14px 20px',fontSize:13,color:'#6B7280',fontWeight:500}}>{g.company_name||'—'}</td>
                          <td style={{padding:'14px 20px',fontSize:14,fontWeight:700,color:'#0D0D1A'}}>{g.question_count||0}</td>
                          <td style={{padding:'14px 20px',fontSize:14,fontWeight:700,color:'#0D0D1A'}}>{(g.play_count||0).toLocaleString()}</td>
                          <td style={{padding:'14px 20px'}}><LiveBadge active={g.is_active}/></td>
                          <td style={{padding:'14px 20px'}}>
                            <button onClick={() => navigate(`/dashboard/games/${g.id}/builder`)} style={{
                              background:'none',border:'none',cursor:'pointer',
                              fontSize:12.5,fontWeight:600,color:'#6366F1',
                              fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:4,
                              padding:0,
                            }}>Edit <Ico.arrow/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>

              {/* 7-day chart */}
              <div style={{background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',padding:'22px 22px 18px'}}>
                <p style={{fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.09em',marginBottom:6}}>7-Day Plays</p>
                <div style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:26,color:'#0D0D1A',letterSpacing:'-0.03em',marginBottom:20}}>
                  {chartData[chartData.length-1]} plays
                </div>
                <MiniChart data={chartData} color="#6366F1" />
              </div>

              {/* Donut + health */}
              <div style={{background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',padding:'22px'}}>
                <p style={{fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.09em',marginBottom:20}}>Platform Health</p>
                <div style={{display:'flex',justifyContent:'center',marginBottom:22}}>
                  <DonutChart pct={activeRate} color="#6366F1" />
                </div>
                {[{label:'Uptime',val:99.9,color:'#10B981'},{label:'Avg Response',val:85,color:'#6366F1'}].map((item,i) => (
                  <div key={item.label} style={{marginBottom: i===0 ? 16 : 0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <span style={{fontSize:12.5,fontWeight:600,color:'#6B7280'}}>{item.label}</span>
                      <span style={{fontSize:12.5,fontWeight:700,color:'#0D0D1A'}}>{item.val}%</span>
                    </div>
                    <div style={{height:5,borderRadius:100,background:'#F3F4F6',overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:100,background:item.color,width:`${item.val}%`,transition:'width 1.2s ease'}} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',padding:'22px'}}>
                <p style={{fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.09em',marginBottom:16}}>Summary</p>
                {[
                  { label:'Avg plays / game', val: stats?.games ? Math.round(stats.plays/stats.games) : 0 },
                  { label:'Games per client',  val: stats?.clients ? (stats.games/stats.clients).toFixed(1) : '—' },
                  { label:'Total questions',   val: recentGames.reduce((s,g)=>s+(g.question_count||0),0)+'+' },
                ].map((row,i,arr) => (
                  <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom: i<arr.length-1?'1px solid #F3F4F6':'none'}}>
                    <span style={{fontSize:13,color:'#6B7280',fontWeight:500}}>{row.label}</span>
                    <span style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',letterSpacing:'-0.02em'}}>{row.val}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}