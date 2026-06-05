import { useState, useEffect, useCallback } from 'react'
import api from '../api'

/* ─────────────────────────────────────────────
   LIGHT THEME TOKENS — scoped to .pp-wrap
───────────────────────────────────────────── */
const CSS = `
@keyframes pp-fade-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes pp-slide-in { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:none} }
@keyframes pp-spin     { to{transform:rotate(360deg)} }

.pp-wrap {
  --p:    #6366f1;
  --pd:   #4f46e5;
  --pg:   rgba(99,102,241,0.10);
  --ok:   #16a34a;
  --err:  #dc2626;
  --warn: #d97706;
  --bg:   #f3f4f8;
  --surf: #ffffff;
  --surf2:#f0f2f8;
  --brd:  #e2e6f0;
  --tx:   #1e1e2e;
  --tx2:  #5a5b72;
  --tx3:  #9899b8;
  --sh:   0 2px 10px rgba(0,0,0,0.06);
  --shmd: 0 4px 24px rgba(0,0,0,0.10);
  --r:    12px;
  --rs:   8px;
  font-family: 'DM Sans','Inter',sans-serif;
  background: var(--bg);
  color: var(--tx);
  min-height: 100vh;
  padding: 32px 36px;
}
.pp-wrap *, .pp-wrap *::before, .pp-wrap *::after { box-sizing:border-box; }

/* cards */
.pp-card {
  background: var(--surf);
  border: 1.5px solid var(--brd);
  border-radius: var(--r);
  box-shadow: var(--sh);
}

/* stat card */
.pp-stat {
  background: var(--surf);
  border: 1.5px solid var(--brd);
  border-radius: var(--r);
  box-shadow: var(--sh);
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow .15s, transform .15s;
}
.pp-stat:hover { box-shadow: var(--shmd); transform: translateY(-2px); }
.pp-stat-icon {
  width: 50px; height: 50px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.pp-stat-val { font-size: 26px; font-weight: 900; line-height: 1; }
.pp-stat-lbl { font-size: 12px; color: var(--tx2); margin-top: 4px; font-weight: 600; }

/* buttons */
.pp-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; font-size: 13px; font-weight: 700;
  border-radius: var(--rs); border: none; cursor: pointer;
  transition: all .14s; font-family: inherit; white-space: nowrap;
}
.pp-btn:disabled { opacity:.5; cursor:not-allowed; }
.pp-btn-primary { background: var(--p); color: #fff; }
.pp-btn-primary:not(:disabled):hover { background: var(--pd); transform: translateY(-1px); box-shadow: 0 4px 12px var(--pg); }
.pp-btn-ghost { background: var(--surf); color: var(--tx2); border: 1.5px solid var(--brd); }
.pp-btn-ghost:not(:disabled):hover { border-color: var(--p); color: var(--p); }
.pp-btn-sm { padding: 6px 12px; font-size: 12px; }

/* search bar */
.pp-search {
  background: var(--surf);
  border: 1.5px solid var(--brd);
  border-radius: var(--r);
  padding: 12px 18px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: var(--sh);
  transition: border-color .14s;
}
.pp-search:focus-within { border-color: var(--p); }
.pp-search input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 14px; color: var(--tx); font-family: inherit;
}
.pp-search input::placeholder { color: var(--tx3); }

/* table */
.pp-table { width: 100%; border-collapse: collapse; }
.pp-th {
  padding: 13px 18px; text-align: left; font-size: 11px;
  font-weight: 700; color: var(--tx2); text-transform: uppercase;
  letter-spacing: .06em; cursor: pointer; user-select: none;
  white-space: nowrap; background: var(--surf2);
  border-bottom: 1.5px solid var(--brd);
}
.pp-th:hover { color: var(--p); }
.pp-td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid var(--brd); vertical-align: middle; }
.pp-tr { transition: background .12s; }
.pp-tr:hover .pp-td { background: #f7f8ff; }
.pp-tr:last-child .pp-td { border-bottom: none; }

/* avatar circle */
.pp-av {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; flex-shrink: 0;
}

/* badge */
.pp-badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
}

/* pp pill */
.pp-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  background: rgba(99,102,241,0.09); border: 1px solid rgba(99,102,241,0.2);
}
.pp-pill-val { font-size: 15px; font-weight: 900; color: var(--p); }
.pp-pill-lbl { font-size: 10px; font-weight: 700; color: var(--tx3); text-transform: uppercase; letter-spacing: .04em; }
.pp-pill.zero { background: #f0f2f8; border-color: var(--brd); }
.pp-pill.zero .pp-pill-val { color: var(--tx3); }

/* pagination */
.pp-page-btn {
  padding: 7px 14px; border-radius: var(--rs); border: 1.5px solid var(--brd);
  background: var(--surf); color: var(--tx2); cursor: pointer; font-size: 13px;
  font-weight: 600; font-family: inherit; transition: all .12s;
}
.pp-page-btn:not(:disabled):hover { border-color: var(--p); color: var(--p); }
.pp-page-btn:disabled { opacity: .4; cursor: not-allowed; }
.pp-page-btn.active { background: var(--p); color: #fff; border-color: var(--p); }

/* ── drawer ── */
.pp-backdrop {
  position: fixed; inset: 0; background: rgba(30,30,46,0.35);
  z-index: 400; backdrop-filter: blur(3px);
}
.pp-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: 500px;
  background: #ffffff; border-left: 1.5px solid var(--brd);
  z-index: 401; display: flex; flex-direction: column;
  box-shadow: -8px 0 48px rgba(0,0,0,0.14);
  animation: pp-slide-in .22s ease;
  font-family: 'DM Sans','Inter',sans-serif;
}
.pp-drawer-hdr {
  padding: 0 24px;
  background: linear-gradient(135deg,#6366f1,#a855f7);
  flex-shrink: 0;
}
.pp-drawer-body { flex: 1; overflow-y: auto; padding: 24px; background: #f8f9ff; }

/* txn row */
.pp-txn {
  background: #fff; border: 1.5px solid #e8eaf0; border-radius: 10px;
  padding: 12px 16px; display: flex; align-items: center; gap: 12;
  margin-bottom: 8px; transition: box-shadow .12s;
}
.pp-txn:hover { box-shadow: 0 2px 10px rgba(0,0,0,.07); }
.pp-txn-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}

/* info box */
.pp-info { background:#eff6ff; border:1px solid #bfdbfe; border-radius:9px; padding:10px 14px; font-size:12px; color:#1d4ed8; }
.pp-warn { background:#fffbeb; border:1px solid #fde68a; border-radius:9px; padding:10px 14px; font-size:12px; color:#92400e; }

/* section title */
.pp-sec-title {
  font-size: 11px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: var(--tx2); margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}

/* empty */
.pp-empty { text-align: center; padding: 60px 20px; color: var(--tx2); }
`

/* ─── helpers ─── */
const fmt         = n => Number(n||0).toLocaleString()
const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

function daysUntilReset() {
  const now   = new Date()
  const next  = new Date(now.getFullYear(), now.getMonth()+1, 1)
  return Math.ceil((next - now) / (1000*60*60*24))
}

function avatarColor(name='') {
  const colors = [
    ['#eef0ff','#6366f1'],['#fce7f3','#db2777'],['#dcfce7','#16a34a'],
    ['#fff7ed','#ea580c'],['#f0fdf4','#15803d'],['#fef3c7','#d97706'],
  ]
  const i = (name.charCodeAt(0)||0) % colors.length
  return colors[i]
}

/* ─── Badge ─── */
function Badge({ type }) {
  const map = {
    earn:  { label:'+ Earned',  bg:'#dcfce7', color:'#16a34a' },
    spend: { label:'− Spent',   bg:'#fee2e2', color:'#dc2626' },
    bonus: { label:'🎁 Bonus',  bg:'#eef0ff', color:'#6366f1' },
    reset: { label:'↺ Reset',   bg:'#fef3c7', color:'#d97706' },
  }
  const b = map[type] || { label:type, bg:'#f0f2f8', color:'#5a5b72' }
  return <span className="pp-badge" style={{ background:b.bg, color:b.color }}>{b.label}</span>
}

/* ─── Txn icon ─── */
function TxnIcon({ type }) {
  const map = { earn:['#dcfce7','➕'], spend:['#fee2e2','➖'], bonus:['#eef0ff','🎁'], reset:['#fef3c7','↺'] }
  const [bg, icon] = map[type] || ['#f0f2f8','•']
  return <div className="pp-txn-icon" style={{ background:bg }}>{icon}</div>
}

/* ─── Player Drawer ─── */
function PlayerDrawer({ player, onClose }) {
  const [txns,    setTxns]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('profile') // 'profile' | 'history'

  useEffect(() => {
    if (!player) return
    setLoading(true); setTab('profile')
    api.get(`/players-admin/${player.id}/transactions`)
      .then(r => setTxns(r.data.transactions||[]))
      .catch(() => setTxns([]))
      .finally(() => setLoading(false))
  }, [player])

  if (!player) return null

  const [bgC, txC] = avatarColor(player.name)
  const totalEarned = txns.filter(t => t.type==='earn'||t.type==='bonus').reduce((s,t)=>s+Number(t.points),0)
  const totalSpent  = txns.filter(t => t.type==='spend').reduce((s,t)=>s+Number(t.points),0)
  const resets      = txns.filter(t => t.type==='reset').length

  return (
    <>
      <div className="pp-backdrop" onClick={onClose} />
      <div className="pp-drawer">

        {/* ── Gradient header ── */}
        <div className="pp-drawer-hdr">
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'22px 0 18px' }}>
            <div style={{ width:54,height:54,borderRadius:'50%',background:'rgba(255,255,255,0.22)',border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff',flexShrink:0 }}>
              {player.name?.[0]?.toUpperCase()||'?'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:17, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{player.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:2 }}>{player.email}</div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,width:34,height:34,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',flexShrink:0 }}>×</button>
          </div>

          {/* PP balance banner inside header */}
          <div style={{ display:'flex', gap:10, paddingBottom:18 }}>
            <div style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{fmt(player.pp_balance)}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:3, fontWeight:600 }}>CURRENT BALANCE</div>
            </div>
            <div style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{fmt(totalEarned)}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:3, fontWeight:600 }}>ALL-TIME EARNED</div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:0, borderTop:'1px solid rgba(255,255,255,0.15)' }}>
            {[['profile','👤 Profile'],['history','📋 History']].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'11px 0', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, color: tab===id ? '#fff' : 'rgba(255,255,255,0.55)', borderBottom: tab===id ? '2px solid #fff' : '2px solid transparent', transition:'all .14s', fontFamily:'inherit' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pp-drawer-body">

          {tab === 'profile' && (
            <div style={{ animation:'pp-fade-in .18s ease' }}>
              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
                {[
                  { val:fmt(totalEarned), lbl:'Earned', color:'#16a34a', bg:'#dcfce7' },
                  { val:fmt(totalSpent),  lbl:'Spent',  color:'#dc2626', bg:'#fee2e2' },
                  { val:resets,           lbl:'Resets',  color:'#d97706', bg:'#fef3c7' },
                ].map(s => (
                  <div key={s.lbl} style={{ background:s.bg, borderRadius:10, padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:11, color:s.color, fontWeight:700, marginTop:2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Monthly reset notice */}
              <div className="pp-warn" style={{ marginBottom:16 }}>
                ⏰ This player's balance resets to <b>0 PP</b> on the 1st of next month — <b>{daysUntilReset()} days</b> remaining.
              </div>

              {/* Profile details */}
              <div className="pp-sec-title">📋 Profile Details</div>
              <div style={{ background:'#fff', borderRadius:10, border:'1.5px solid #e8eaf0', overflow:'hidden', marginBottom:20 }}>
                {[
                  ['📱 WhatsApp',   player.whatsapp || '—'],
                  ['🏙️ City',       player.city     || '—'],
                  ['📮 Pincode',    player.pincode  || '—'],
                  ['🎂 Date of Birth', fmtDate(player.dob)],
                  ['🗓️ Joined',     fmtDate(player.created_at)],
                  ['🎮 Games Played', fmt(player.games_played || txns.filter(t=>t.type==='earn').length)],
                ].map(([k,v], i, arr) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', borderBottom: i<arr.length-1 ? '1px solid #f0f2f8' : 'none' }}>
                    <span style={{ fontSize:13, color:'#5a5b72', fontWeight:600 }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#1e1e2e' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div style={{ animation:'pp-fade-in .18s ease' }}>
              <div className="pp-sec-title">📋 Transaction History</div>
              {loading ? (
                <div style={{ textAlign:'center', padding:40 }}>
                  <div style={{ width:32,height:32,borderRadius:'50%',border:'3px solid #e8eaf0',borderTopColor:'#6366f1',animation:'pp-spin .8s linear infinite',margin:'0 auto' }} />
                </div>
              ) : txns.length === 0 ? (
                <div className="pp-empty">
                  <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                  <p>No transactions yet</p>
                </div>
              ) : (
                txns.map(t => (
                  <div key={t.id} className="pp-txn">
                    <TxnIcon type={t.type} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1e1e2e', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {t.note || 'PromoPoints transaction'}
                      </div>
                      <div style={{ fontSize:11, color:'#9899b8' }}>{fmtDateTime(t.created_at)}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                      <Badge type={t.type} />
                      <span style={{ fontSize:14, fontWeight:900, color: t.type==='earn'||t.type==='bonus' ? '#16a34a' : t.type==='spend' ? '#dc2626' : '#d97706' }}>
                        {t.type==='spend' ? '−' : '+'}{fmt(t.points)} PP
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function PlayersPage() {
  const [players,  setPlayers]  = useState([])
  const [stats,    setStats]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [sortBy,   setSortBy]   = useState('created_at')
  const [sortDir,  setSortDir]  = useState('desc')
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(1)
  const PER_PAGE = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/players-admin')
      setPlayers(data.players||[])
      setStats(data.stats||{})
    } catch { setPlayers([]) }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  /* filter + sort */
  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
          || p.city?.toLowerCase().includes(q)  || p.whatsapp?.includes(q)
    })
    .sort((a,b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy==='pp_balance') { av=Number(av); bv=Number(bv) }
      if (av<bv) return sortDir==='asc'?-1:1
      if (av>bv) return sortDir==='asc'?1:-1
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length/PER_PAGE))
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const toggleSort = col => {
    if (sortBy===col) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  /* csv export */
  const exportCSV = () => {
    const headers = ['ID','Name','Email','WhatsApp','City','Pincode','PP Balance','Joined']
    const rows = filtered.map(p => [p.id,p.name,p.email,p.whatsapp||'',p.city||'',p.pincode||'',p.pp_balance,fmtDate(p.created_at)])
    const csv  = [headers,...rows].map(r => r.map(c=>`"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href=url; a.download=`players_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }) => (
    sortBy===col
      ? <span style={{ color:'#6366f1', marginLeft:4 }}>{sortDir==='asc'?'↑':'↓'}</span>
      : <span style={{ color:'#c9cad8', marginLeft:4 }}>↕</span>
  )

  const days = daysUntilReset()

  return (
    <div className="pp-wrap">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#1e1e2e', marginBottom:4 }}>👥 Players</h1>
          <p style={{ color:'#5a5b72', fontSize:14 }}>All registered PromoGames players and their PP activity</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="pp-btn pp-btn-ghost" onClick={load}>🔄 Refresh</button>
          <button className="pp-btn pp-btn-primary" onClick={exportCSV}>⬇️ Export CSV</button>
        </div>
      </div>

      {/* ── Monthly reset notice banner ── */}
      <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef9ec)', border:'1.5px solid #fde68a', borderRadius:12, padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:28 }}>🔄</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#92400e' }}>Monthly PP Balance Reset</div>
          <div style={{ fontSize:13, color:'#a16207', marginTop:2 }}>
            All player balances reset to <b>0 PP</b> on the 1st of every month. Points history is preserved forever.
            <b style={{ marginLeft:6 }}>{days} day{days!==1?'s':''} until next reset.</b>
          </div>
        </div>
        <div style={{ textAlign:'center', background:'#fff', borderRadius:10, padding:'10px 18px', border:'1px solid #fde68a' }}>
          <div style={{ fontSize:22, fontWeight:900, color:'#d97706' }}>{days}</div>
          <div style={{ fontSize:10, fontWeight:700, color:'#a16207', textTransform:'uppercase', letterSpacing:'.04em' }}>Days Left</div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { icon:'👥', label:'Total Players',   value:fmt(stats.total),     color:'#6366f1', bg:'#eef0ff' },
          { icon:'🆕', label:'New This Month',  value:fmt(stats.new_month), color:'#16a34a', bg:'#dcfce7' },
          { icon:'💰', label:'Total PP Issued', value:fmt(stats.total_pp),  color:'#d97706', bg:'#fef3c7' },
          { icon:'📊', label:'Avg PP / Player', value:fmt(stats.avg_pp),    color:'#0891b2', bg:'#e0f7fa' },
        ].map(s => (
          <div key={s.label} className="pp-stat">
            <div className="pp-stat-icon" style={{ background:s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div className="pp-stat-val" style={{ color:s.color }}>{s.value}</div>
              <div className="pp-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="pp-search" style={{ marginBottom:16 }}>
        <span style={{ fontSize:18, color:'#9899b8' }}>🔍</span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name, email, city or WhatsApp…"
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#9899b8', fontSize:18, lineHeight:1 }}>×</button>
        )}
        <span style={{ fontSize:12, color:'#9899b8', whiteSpace:'nowrap', fontWeight:600 }}>
          {filtered.length} result{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="pp-card" style={{ marginBottom:20, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:64, textAlign:'center' }}>
            <div style={{ width:36,height:36,borderRadius:'50%',border:'3px solid #e8eaf0',borderTopColor:'#6366f1',animation:'pp-spin .8s linear infinite',margin:'0 auto 12px' }} />
            <div style={{ color:'#9899b8', fontSize:14 }}>Loading players…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pp-empty">
            <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>{search ? 'No players match your search' : 'No players yet'}</div>
            {search && <button className="pp-btn pp-btn-ghost pp-btn-sm" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="pp-table">
              <thead>
                <tr>
                  {[
                    { label:'Player',     col:'name'       },
                    { label:'City',       col:'city'       },
                    { label:'WhatsApp',   col:'whatsapp'   },
                    { label:'PP Balance', col:'pp_balance' },
                    { label:'Joined',     col:'created_at' },
                  ].map(h => (
                    <th key={h.col} className="pp-th" onClick={() => toggleSort(h.col)}>
                      {h.label}<SortIcon col={h.col} />
                    </th>
                  ))}
                  <th className="pp-th" style={{ textAlign:'right', cursor:'default' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => {
                  const [bgC, txC] = avatarColor(p.name)
                  const hasBalance = Number(p.pp_balance) > 0
                  return (
                    <tr key={p.id} className="pp-tr">
                      {/* Player */}
                      <td className="pp-td">
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="pp-av" style={{ background:bgC, color:txC }}>
                            {p.name?.[0]?.toUpperCase()||'?'}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:'#1e1e2e' }}>{p.name}</div>
                            <div style={{ fontSize:12, color:'#9899b8', marginTop:1 }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* City */}
                      <td className="pp-td" style={{ color:'#5a5b72' }}>{p.city||'—'}</td>
                      {/* WhatsApp */}
                      <td className="pp-td" style={{ color:'#5a5b72' }}>{p.whatsapp||'—'}</td>
                      {/* PP Balance */}
                      <td className="pp-td">
                        <div className={`pp-pill${hasBalance?'':' zero'}`}>
                          <span className="pp-pill-val">{fmt(p.pp_balance)}</span>
                          <span className="pp-pill-lbl">PP</span>
                        </div>
                      </td>
                      {/* Joined */}
                      <td className="pp-td" style={{ color:'#9899b8', fontSize:13 }}>{fmtDate(p.created_at)}</td>
                      {/* Action */}
                      <td className="pp-td" style={{ textAlign:'right' }}>
                        <button
                          className="pp-btn pp-btn-ghost pp-btn-sm"
                          onClick={() => setSelected(p)}
                        >
                          View Profile →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6 }}>
          <button className="pp-page-btn" disabled={page===1} onClick={() => setPage(p=>Math.max(1,p-1))}>← Prev</button>
          {Array.from({length:Math.min(totalPages,7)},(_,i) => {
            let p
            if (totalPages<=7) p=i+1
            else if (page<=4) p=i+1
            else if (page>=totalPages-3) p=totalPages-6+i
            else p=page-3+i
            return (
              <button key={p} className={`pp-page-btn${page===p?' active':''}`} onClick={() => setPage(p)}>{p}</button>
            )
          })}
          <button className="pp-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>Math.min(totalPages,p+1))}>Next →</button>
        </div>
      )}

      {/* ── Player drawer ── */}
      <PlayerDrawer player={selected} onClose={() => setSelected(null)} />
    </div>
  )
}