import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api'

const CSS = `
.dh2 *, .dh2 *::before, .dh2 *::after { box-sizing: border-box; margin: 0; padding: 0; }
.dh2 { font-family: 'DM Sans', sans-serif; background: #F4F5F7; min-height: 100vh; }

.dh2-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E8EAF0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.18s, transform 0.18s;
}
.dh2-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.dh2-stat-val {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 42px;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #0D0D1A;
}

.dh2-table-row { transition: background 0.12s; cursor: default; }
.dh2-table-row:hover { background: #F8F9FB; }

.dh2-badge-live {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 700;
  background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0;
}
.dh2-badge-off {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 700;
  background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;
}

.dh2-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px;
  border: 1.5px solid #E5E7EB; background: #fff;
  color: #374151; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: background 0.13s, border-color 0.13s;
}
.dh2-btn-ghost:hover { background: #F3F4F6; border-color: #D1D5DB; }

.dh2-btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 8px;
  border: none; background: #18181B;
  color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: background 0.13s;
}
.dh2-btn-primary:hover { background: #27272A; }

.dh2-skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E9EAED 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: dh2Shimmer 1.4s infinite;
  border-radius: 8px;
}

.dh2-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.dh2-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 320px;
  gap: 16px;
  margin-bottom: 20px;
}

.dh2-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1200px) {
  .dh2-content-grid { grid-template-columns: 1fr 320px; }
  .dh2-bottom-grid  { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 900px) {
  .dh2-kpi-row      { grid-template-columns: repeat(2, 1fr); }
  .dh2-content-grid { grid-template-columns: 1fr; }
  .dh2-bottom-grid  { grid-template-columns: 1fr; }
}

@keyframes dh2Shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes dh2FadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes dh2Pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes dh2Spin    { to{transform:rotate(360deg)} }
`

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const Arrow = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const Plus = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, loading, delay = 0 }) {
  return (
    <div className="dh2-card" style={{
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      animation: `dh2FadeUp 0.35s ease ${delay}ms both`,
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '12px 12px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {loading
        ? <div className="dh2-skeleton" style={{ height: 44, width: '60%' }} />
        : <div className="dh2-stat-val">{Number(value).toLocaleString()}</div>
      }
      {sub && !loading && (
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  )
}

// ── Sparkline bar chart ───────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366F1', height = 80 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((v, i) => {
          const h = Math.max(((v - min) / range) * 100, 6)
          const isLast = i === data.length - 1
          return (
            <div key={i} title={`${v} plays`} style={{
              flex: 1, height: `${h}%`,
              background: isLast ? color : `${color}40`,
              borderRadius: '4px 4px 0 0',
              transition: 'height .5s ease',
              cursor: 'default',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Donut ─────────────────────────────────────────────────────────────────────
function Donut({ pct, color, size = 110 }) {
  const r = (size / 2) - 10
  const c = 2 * Math.PI * r
  const off = c - (pct / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="9" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: '#0D0D1A', letterSpacing: '-0.03em' }}>{pct}%</div>
        <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 1 }}>Active</div>
      </div>
    </div>
  )
}

// ── Progress row ──────────────────────────────────────────────────────────────
function ProgressRow({ label, value, max = 100, color, unit = '%' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280' }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0D1A' }}>{value}{unit}</span>
      </div>
      <div style={{ height: 5, borderRadius: 100, background: '#F3F4F6', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 100, background: color, width: `${pct}%`, transition: 'width 1.2s ease' }} />
      </div>
    </div>
  )
}

// ── Live badge ────────────────────────────────────────────────────────────────
function LiveBadge({ active }) {
  return active ? (
    <span className="dh2-badge-live">
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'dh2Pulse 2s ease infinite' }} />
      Live
    </span>
  ) : (
    <span className="dh2-badge-off">
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
      Off
    </span>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F1F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 16, color: '#0D0D1A', letterSpacing: '-0.02em' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
      </div>
      {action && (
        <button className="dh2-btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={onAction}>
          {action} <Arrow />
        </button>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [stats,       setStats]       = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [chartData]                   = useState([38, 52, 44, 61, 55, 70, 75])
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/games')])
      .then(([cr, gr]) => {
        const games = gr.data.games || []
        const plays = games.reduce((s, g) => s + (g.play_count || 0), 0)
        setStats({
          clients: cr.data.clients?.length || 0,
          games:   games.length,
          plays,
          active:  games.filter(g => g.is_active).length,
        })
        setRecentGames(games.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeRate = stats?.games ? Math.round((stats.active / stats.games) * 100) : 0
  const avgPlays   = stats?.games ? Math.round(stats.plays / stats.games) : 0

  const kpis = [
    {
      label: 'Total Clients', value: stats?.clients || 0, accent: '#6366F1',
      sub: 'organisations onboarded',
      icon: <svg width="17" height="17" fill="none" stroke="#6366F1" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>,
    },
    {
      label: 'Total Games', value: stats?.games || 0, accent: '#8B5CF6',
      sub: 'across all clients',
      icon: <svg width="17" height="17" fill="none" stroke="#8B5CF6" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>,
    },
    {
      label: 'Active Games', value: stats?.active || 0, accent: '#F59E0B',
      sub: `${activeRate}% activation rate`,
      icon: <svg width="17" height="17" fill="none" stroke="#F59E0B" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    },
    {
      label: 'Total Plays', value: stats?.plays || 0, accent: '#10B981',
      sub: '+12% from last month',
      icon: <svg width="17" height="17" fill="none" stroke="#10B981" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="#10B981" stroke="none"/></svg>,
    },
  ]

  return (
    <div className="dh2">
      <style>{CSS}</style>

      <div style={{ padding: '28px 36px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Dashboard Overview
            </p>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 32, color: '#0D0D1A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {greeting} 👋
            </h1>
            <p style={{ fontSize: 13.5, color: '#9CA3AF', marginTop: 7, fontWeight: 400 }}>
              Here's what's happening across your platform today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="dh2-btn-ghost" onClick={() => navigate('/dashboard/clients')}>
              <Plus /> New Client
            </button>
            <button className="dh2-btn-primary" onClick={() => navigate('/dashboard/games')}>
              <Plus /> Create Game
            </button>
          </div>
        </div>

        {/* ── KPI row ───────────────────────────────────────────────────── */}
        <div className="dh2-kpi-row">
          {kpis.map((k, i) => (
            <KpiCard key={k.label} {...k} loading={loading} delay={i * 70} />
          ))}
        </div>

        {/* ── Main content grid (table + chart + right panel) ───────────── */}
        <div className="dh2-content-grid">

          {/* Recent Games table — spans first column */}
          <div className="dh2-card" style={{ gridColumn: 'span 2', overflow: 'hidden' }}>
            <SectionHeader
              title="Recent Games"
              sub={`${recentGames.length} most recent`}
              action="View all"
              onAction={() => navigate('/dashboard/games')}
            />

            {loading ? (
              <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[90, 75, 85, 70, 80].map((w, i) => (
                  <div key={i} className="dh2-skeleton" style={{ height: 16, width: `${w}%` }} />
                ))}
              </div>
            ) : recentGames.length === 0 ? (
              <div style={{ padding: '56px 20px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="24" height="24" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
                </div>
                <p style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 16, color: '#0D0D1A', marginBottom: 5 }}>No games yet</p>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Create your first game to see it here.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F0F1F5', background: '#FAFBFC' }}>
                      {['Game', 'Client', 'Questions', 'Plays', 'Status', ''].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 10, fontWeight: 700, color: '#9CA3AF',
                          textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((g, i) => (
                      <tr key={g.id} className="dh2-table-row" style={{ borderBottom: i < recentGames.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0D0D1A' }}>{g.name}</div>
                          <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' }}>{g.category || 'quiz'}</div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{g.company_name || '—'}</td>
                        <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: '#0D0D1A' }}>{g.question_count || 0}</td>
                        <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: '#0D0D1A' }}>{(g.play_count || 0).toLocaleString()}</td>
                        <td style={{ padding: '13px 16px' }}><LiveBadge active={g.is_active} /></td>
                        <td style={{ padding: '13px 16px' }}>
                          <button
                            onClick={() => navigate(`/dashboard/games/${g.id}/builder`)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 12.5, fontWeight: 600, color: '#6366F1',
                              fontFamily: "'DM Sans',sans-serif",
                              display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                            }}
                          >
                            Edit <Arrow />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 7-day sparkline */}
            <div className="dh2-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 4 }}>7-Day Plays</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 28, color: '#0D0D1A', letterSpacing: '-0.03em', marginBottom: 18 }}>
                {chartData[chartData.length - 1]} plays
              </div>
              <Sparkline data={chartData} color="#6366F1" height={72} />
            </div>

            {/* Platform health */}
            <div className="dh2-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 18 }}>Platform Health</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <Donut pct={activeRate} color="#6366F1" size={110} />
              </div>
              <ProgressRow label="Uptime"       value={99.9} color="#10B981" />
              <ProgressRow label="Avg Response" value={85}   color="#6366F1" />
            </div>
          </div>
        </div>

        {/* ── Bottom row ────────────────────────────────────────────────── */}
        <div className="dh2-bottom-grid">

          {/* Summary metrics */}
          <div className="dh2-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 16 }}>Summary</div>
            {[
              { label: 'Avg plays / game', val: avgPlays },
              { label: 'Games per client',  val: stats?.clients ? (stats.games / stats.clients).toFixed(1) : '—' },
              { label: 'Total questions',   val: recentGames.reduce((s, g) => s + (g.question_count || 0), 0) + '+' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: '#0D0D1A', letterSpacing: '-0.02em' }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Game type breakdown */}
          <div className="dh2-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 16 }}>Game Types</div>
            {(() => {
              const types = recentGames.reduce((acc, g) => {
                const t = g.category || 'quiz'
                acc[t] = (acc[t] || 0) + 1
                return acc
              }, {})
              const total = Object.values(types).reduce((s, v) => s + v, 0) || 1
              const colors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
              return Object.entries(types).map(([type, count], i) => (
                <div key={type} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280', textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0D1A' }}>{count}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 100, background: '#F3F4F6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: colors[i % colors.length], width: `${(count / total) * 100}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))
            })()}
            {recentGames.length === 0 && (
              <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No data yet</div>
            )}
          </div>

          {/* Quick actions */}
          <div className="dh2-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Create a new game',   sub: 'Set up questions & rules',    icon: '🎮', to: '/dashboard/games',   accent: '#6366F1' },
                { label: 'Add a client',        sub: 'Onboard a new organisation',  icon: '🏢', to: '/dashboard/clients', accent: '#8B5CF6' },
                { label: 'View all players',    sub: 'PromoPoints & profiles',       icon: '👥', to: '/dashboard/players', accent: '#10B981' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    background: '#F8F9FB', border: '1px solid #EAECF0',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: "'DM Sans',sans-serif",
                    transition: 'background 0.13s, border-color 0.13s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0F1FA'; e.currentTarget.style.borderColor = '#C7D2FE' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FB'; e.currentTarget.style.borderColor = '#EAECF0' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${action.accent}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{action.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0D0D1A', marginBottom: 2 }}>{action.label}</div>
                    <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{action.sub}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#9CA3AF' }}><Arrow /></div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}