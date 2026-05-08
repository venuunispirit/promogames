import { useState, useEffect } from 'react'
import api from '../api'

// Inject Inter font if not already loaded
if (!document.getElementById('inter-font')) {
  const link = document.createElement('link')
  link.id = 'inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

const S = {
  page: {
    padding: '40px 44px',
    maxWidth: 1200,
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'var(--text)',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    marginBottom: 8,
    display: 'block',
  },
  heading: {
    fontSize: 30,
    fontWeight: 800,
    margin: '0 0 6px',
    letterSpacing: '-0.6px',
    lineHeight: 1.15,
    fontFamily: "'Inter', sans-serif",
  },
  sub: {
    color: 'var(--text2)',
    fontSize: 14,
    margin: 0,
    fontWeight: 400,
  },
}

function StatCard({ label, value, icon, color, bg, trend }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, fontFamily: "'Inter', sans-serif", letterSpacing: '-1px', color: 'var(--text)' }}>
          {Number(value).toLocaleString()}
        </div>
        {trend != null && (
          <div style={{ fontSize: 12, marginTop: 6, color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: active ? '#16a34a18' : '#dc262618',
      color: active ? '#16a34a' : '#dc2626',
      border: `1px solid ${active ? '#16a34a30' : '#dc262630'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
      {active ? 'Live' : 'Off'}
    </span>
  )
}

export default function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/games')])
      .then(([clientsRes, gamesRes]) => {
        const games = gamesRes.data.games || []
        const totalPlays = games.reduce((sum, g) => sum + (g.play_count || 0), 0)
        setStats({
          clients: clientsRes.data.clients?.length || 0,
          games: games.length,
          plays: totalPlays,
          active: games.filter(g => g.is_active).length,
        })
        setRecentGames(games.slice(0, 6))
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-loader">
      <div className="loader-spin" />
      <span>Loading dashboard...</span>
    </div>
  )

  const statCards = [
    { label: 'Total Clients', value: stats?.clients || 0, icon: '🏢', color: '#6366f1', bg: '#6366f115' },
    { label: 'Total Games',   value: stats?.games   || 0, icon: '🎮', color: '#0ea5e9', bg: '#0ea5e915' },
    { label: 'Active Games',  value: stats?.active  || 0, icon: '⚡', color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Total Plays',   value: stats?.plays   || 0, icon: '▶️', color: '#22c55e', bg: '#22c55e15' },
  ]

  const activeRate = stats?.games ? Math.round((stats.active / stats.games) * 100) : 0

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <span style={S.label}>Overview</span>
          <h1 style={S.heading}>{greeting} 👋</h1>
          <p style={S.sub}>Here's what's happening across your quiz platform.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/dashboard/clients" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', textDecoration: 'none',
            fontFamily: "'Inter', sans-serif",
          }}>
            🏢 New Client
          </a>
          <a href="/dashboard/games" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'var(--primary)', color: '#fff', textDecoration: 'none',
            fontFamily: "'Inter', sans-serif",
          }}>
            + Create Game
          </a>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* Recent Games Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Recent Games</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{recentGames.length} most recent</div>
            </div>
            <a href="/dashboard/games" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)' }}>
              View all →
            </a>
          </div>

          {recentGames.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text2)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>No games yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Create your first game to get started</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Game Name', 'Client', 'Questions', 'Plays', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentGames.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2, rgba(255,255,255,0.03))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{g.category || 'quiz'}</div>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{g.company_name || '—'}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{g.question_count || 0}</span>
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{(g.play_count || 0).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '13px 20px' }}><StatusBadge active={g.is_active} /></td>
                    <td style={{ padding: '13px 20px' }}>
                      <a href={`/dashboard/games/${g.id}/builder`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Edit →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Platform Health */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Platform Health</div>

            {[
              { label: 'Active Rate', value: activeRate, color: '#6366f1' },
              { label: 'Games Live', value: stats?.games ? Math.round((stats.active / stats.games) * 100) : 0, color: '#22c55e' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{item.value}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: item.color, width: `${item.value}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 10, background: activeRate === 100 ? '#16a34a12' : '#f59e0b12', border: `1px solid ${activeRate === 100 ? '#16a34a25' : '#f59e0b25'}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: activeRate === 100 ? '#16a34a' : '#d97706' }}>
                {activeRate === 100 ? '✅ All systems live' : `⚡ ${stats?.games - stats?.active} game(s) inactive`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>
                {stats?.active} of {stats?.games} games active
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Summary</div>
            {[
              { label: 'Avg plays per game', value: stats?.games ? Math.round(stats.plays / stats.games) : 0 },
              { label: 'Games per client', value: stats?.clients ? (stats.games / stats.clients).toFixed(1) : 0 },
              { label: 'Total questions', value: recentGames.reduce((s, g) => s + (g.question_count || 0), 0) + '+' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>{item.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}