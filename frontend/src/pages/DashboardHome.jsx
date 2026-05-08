import { useState, useEffect } from 'react'
import api from '../api'

export default function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/games')
    ]).then(([clientsRes, gamesRes]) => {
      const games = gamesRes.data.games || []
      const totalPlays = games.reduce((sum, g) => sum + (g.play_count || 0), 0)
      setStats({
        clients: clientsRes.data.clients?.length || 0,
        games: games.length,
        plays: totalPlays,
        active: games.filter(g => g.is_active).length,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-loader">
      <div className="loader-spin" />
      <span>Loading dashboard...</span>
    </div>
  )

  const statCards = [
    { label: 'Total Clients', value: stats?.clients || 0, icon: '🏢', color: 'var(--primary)' },
    { label: 'Total Games', value: stats?.games || 0, icon: '🎮', color: '#22c55e' },
    { label: 'Active Games', value: stats?.active || 0, icon: '✅', color: '#f0a500' },
    { label: 'Total Plays', value: stats?.plays || 0, icon: '▶️', color: '#ef4444' },
  ]

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text2)' }}>Overview of your quiz platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        {statCards.map(card => (
          <div key={card.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, background: `${card.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{card.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/dashboard/clients" className="btn btn-primary">+ Add Client</a>
          <a href="/dashboard/games" className="btn btn-ghost">+ Create Game</a>
        </div>
      </div>
    </div>
  )
}
