import { useState, useEffect, useMemo } from 'react'
import PlayerNavbar from '../components/PlayerNavbar'
import MascotBubble from '../components/MascotBubble'
import MascotCursor from '../components/MascotCursor'
import { AvatarDisplay } from '../components/AvatarData'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.lb-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #1a1228 40%, #0d0c1a 100%);
  font-family: 'Outfit', sans-serif;
  color: #fff;
  padding: 100px 24px 60px;
}

/* ── Stats Bar ── */
.lb-stats-bar {
  max-width: 1000px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 20px 28px;
}
.lb-stats-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(168,85,247,0.3);
  flex-shrink: 0;
}
.lb-stats-info {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}
.lb-stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lb-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.lb-stat-val {
  display: flex;
  align-items: center;
  gap: 6px;
}
.lb-stat-num {
  font-size: 22px;
  font-weight: 800;
}
.lb-stat-num.purple { color: #a855f7; }
.lb-stat-num.white { color: #fff; }
.lb-rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #22c55e;
  background: rgba(34,197,94,0.1);
}
.lb-stats-progress {
  flex: 1;
  max-width: 280px;
}
.lb-progress-text {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  margin-bottom: 6px;
}
.lb-progress-track {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.lb-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 10px;
  transition: width 1s ease;
}
.lb-progress-pct {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}
.lb-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.lb-play-btn:hover { opacity: 0.85; transform: translateY(-1px); }

/* ── Filters ── */
.lb-filters {
  max-width: 1000px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.lb-pills {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 4px;
  width: 100%;
}
.lb-pill {
  flex: 1;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.lb-pill:hover { color: #fff; }
.lb-pill.active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  box-shadow: 0 4px 12px rgba(168,85,247,0.3);
}

/* ── Podium ── */
  pointer-events: none;
  color: rgba(255,255,255,0.3);
}

/* ── Podium ── */
.lb-podium {
  max-width: 700px;
  margin: 0 auto 36px;
  display: grid !important;
  grid-template-columns: 1fr 1.2fr 1fr !important;
  align-items: end !important;
  gap: 16px;
  padding: 20px 0;
}
.lb-pod-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 40px 16px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  transition: all 0.3s;
  overflow: visible;
}
.lb-pod-card::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 4px;
  border-radius: 4px;
}
.lb-pod-card:hover { transform: translateY(-4px); }
.lb-pod-card.first {
  border-color: rgba(245,166,35,0.3);
  background: linear-gradient(180deg, rgba(245,166,35,0.08) 0%, rgba(255,255,255,0.02) 100%);
  min-height: 260px;
  padding-top: 44px;
}
.lb-pod-card.first::after {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  box-shadow: 0 0 20px rgba(245,166,35,0.5);
}
.lb-pod-card.second {
  border-color: rgba(99,130,255,0.25);
  background: linear-gradient(180deg, rgba(99,130,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  padding-top: 40px;
}
.lb-pod-card.second::after {
  background: linear-gradient(90deg, transparent, #6382ff, transparent);
  box-shadow: 0 0 20px rgba(99,130,255,0.4);
}
.lb-pod-card.third {
  border-color: rgba(220,100,50,0.25);
  background: linear-gradient(180deg, rgba(220,100,50,0.06) 0%, rgba(255,255,255,0.02) 100%);
  padding-top: 40px;
}
.lb-pod-card.third::after {
  background: linear-gradient(90deg, transparent, #dc6432, transparent);
  box-shadow: 0 0 20px rgba(220,100,50,0.4);
}
.lb-pod-medal {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900;
  font-size: 15px;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid rgba(255,255,255,0.15);
  z-index: 2;
}
.lb-pod-medal.g { background: linear-gradient(135deg, #fbbf24, #d97706); color: #fff; box-shadow: 0 0 20px rgba(245,166,35,0.5); border-color: rgba(251,191,36,0.4); }
.lb-pod-medal.s { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; box-shadow: 0 0 20px rgba(148,163,184,0.4); border-color: rgba(148,163,184,0.3); }
.lb-pod-medal.b { background: linear-gradient(135deg, #f97316, #c2410c); color: #fff; box-shadow: 0 0 20px rgba(249,115,22,0.4); border-color: rgba(249,115,22,0.3); }
.lb-pod-avatar {
  width: 60px; height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 4px;
}
.lb-pod-card.first .lb-pod-avatar { width: 72px; height: 72px; }
.lb-pod-card.second .lb-pod-avatar { border: 3px solid rgba(99,130,255,0.4); }
.lb-pod-card.third .lb-pod-avatar { border: 3px solid rgba(220,100,50,0.4); }
.lb-pod-card.first .lb-pod-avatar { border: 3px solid rgba(245,166,35,0.4); }
.lb-pod-name {
  font-size: 15px;
  font-weight: 700;
  margin-top: 4px;
  color: #fff;
}
.lb-pod-coins {
  font-size: 17px;
  font-weight: 800;
  color: #a855f7;
}
.lb-pod-card.first .lb-pod-coins { font-size: 20px; color: #c084fc; }
.lb-pod-card.second .lb-pod-coins { color: #60a5fa; }
.lb-pod-card.third .lb-pod-coins { color: #f97316; }
.lb-pod-games {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}
.lb-pod-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 28px 16px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.3s;
}
.lb-pod-card:hover { transform: translateY(-4px); }
.lb-pod-card.first {
  border-color: rgba(245,166,35,0.35);
  background: linear-gradient(180deg, rgba(245,166,35,0.1) 0%, rgba(255,255,255,0.03) 100%);
  box-shadow: 0 8px 32px rgba(245,166,35,0.12);
  min-height: 220px;
}
.lb-pod-card.second {
  border-color: rgba(148,163,184,0.25);
  background: linear-gradient(180deg, rgba(148,163,184,0.08) 0%, rgba(255,255,255,0.03) 100%);
}
.lb-pod-card.third {
  border-color: rgba(180,83,9,0.25);
  background: linear-gradient(180deg, rgba(180,83,9,0.08) 0%, rgba(255,255,255,0.03) 100%);
}
.lb-pod-medal {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900;
  font-size: 16px;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid rgba(255,255,255,0.1);
}
.lb-pod-medal.g { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; box-shadow: 0 4px 16px rgba(245,166,35,0.4); }
.lb-pod-medal.s { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; box-shadow: 0 4px 16px rgba(148,163,184,0.3); }
.lb-pod-medal.b { background: linear-gradient(135deg, #d97706, #92400e); color: #fff; box-shadow: 0 4px 16px rgba(180,83,9,0.3); }
.lb-pod-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255,255,255,0.1);
  margin-top: 8px;
}
.lb-pod-card.first .lb-pod-avatar { width: 72px; height: 72px; border-color: rgba(245,166,35,0.3); }
.lb-pod-name {
  font-size: 15px;
  font-weight: 700;
  margin-top: 4px;
}
.lb-pod-coins {
  font-size: 16px;
  font-weight: 800;
  color: #a855f7;
}
.lb-pod-card.first .lb-pod-coins { font-size: 18px; }
.lb-pod-games {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

/* ── Table ── */
.lb-table-wrap {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  overflow: hidden;
}
.lb-table {
  width: 100%;
  border-collapse: collapse;
}
.lb-table th {
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.lb-table td {
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.lb-table tr:last-child td { border-bottom: none; }
.lb-table tbody tr {
  transition: all 0.2s;
}
.lb-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}
.lb-table tbody tr.highlight {
  background: rgba(168,85,247,0.08);
  border-left: 3px solid #a855f7;
}
.lb-table tbody tr.highlight td:first-child {
  padding-left: 17px;
}
.lb-td-rank {
  font-weight: 800;
  color: rgba(255,255,255,0.5);
  width: 60px;
}
.lb-td-rank.top { color: #f59e0b; }
.lb-td-player {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lb-td-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.lb-td-name { font-weight: 700; }
.lb-td-points {
  color: #a855f7;
  font-weight: 700;
}
.lb-td-games { color: rgba(255,255,255,0.6); }
.lb-td-date { color: rgba(255,255,255,0.35); font-size: 13px; }

/* ── Pagination ── */
.lb-pagination {
  max-width: 1000px;
  margin: 20px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: rgba(255,255,255,0.4);
}
.lb-page-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.lb-page-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
.lb-page-btn.active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  border-color: transparent;
}
.lb-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Empty / Loading ── */
.lb-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
}
.lb-spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(168,85,247,0.15);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: lb-spin 0.7s linear infinite;
}
@keyframes lb-spin { to { transform: rotate(360deg); } }

.lb-empty {
  text-align: center;
  padding: 80px 20px;
  max-width: 400px;
  margin: 0 auto;
}
.lb-empty-icon {
  width: 80px; height: 80px;
  margin: 0 auto 20px;
  background: rgba(168,85,247,0.1);
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.lb-empty h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.lb-empty p { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 24px; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .lb-page { padding: 100px 12px 40px; }
  .lb-stats-bar {
    flex-wrap: wrap;
    padding: 14px;
    gap: 10px;
    align-items: center;
  }
  .lb-stats-avatar { width: 40px; height: 40px; }
  .lb-stats-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex: 1;
  }
  .lb-stat-item { min-width: 0; }
  .lb-stat-num { font-size: 18px; }
  .lb-stats-progress {
    grid-column: span 2;
    width: 100%;
  }
  .lb-play-btn { width: 100%; justify-content: center; }
  .lb-filters { flex-wrap: wrap; }
  .lb-pills { overflow-x: auto; flex-shrink: 0; }
  .lb-podium { grid-template-columns: 1fr 1.1fr 1fr; gap: 8px; }
  .lb-pod-card { padding: 24px 10px 16px; min-height: auto; }
  .lb-pod-card.first { min-height: 180px; }
  .lb-pod-avatar { width: 48px; height: 48px; }
  .lb-pod-card.first .lb-pod-avatar { width: 56px; height: 56px; }
  .lb-pod-name { font-size: 12px; }
  .lb-pod-coins { font-size: 13px; }
  .lb-pod-card.first .lb-pod-coins { font-size: 15px; }
  .lb-table-wrap { overflow-x: auto; }
  .lb-table { min-width: 600px; }
}
`;

function timeAgo(date) {
  if (!date) return '—'
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const PER_PAGE = 10

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('weekly')
  const [page, setPage] = useState(1)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('playerUser') || sessionStorage.getItem('playerUser')
    if (stored) { try { setCurrentUser(JSON.parse(stored)) } catch {} }
  }, [])

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { if (d.success) setEntries(d.entries || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = [...entries]
    list.sort((a, b) => (b.total_pc || 0) - (a.total_pc || 0))
    return list
  }, [entries])

  const rest = filtered.slice(3)
  const totalPages = Math.ceil(rest.length / PER_PAGE)
  const paginated = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const top3 = filtered.slice(0, 3)
  const myRank = currentUser ? filtered.find(e => e.email === currentUser.email) : null
  const myIdx = myRank ? filtered.indexOf(myRank) : -1

  const stats = useMemo(() => ({
    totalPlayers: filtered.length,
    totalCoins: filtered.reduce((s, e) => s + (e.total_pc || 0), 0),
  }), [filtered])

  const progressPct = myRank ? Math.min(75, Math.max(10, 100 - (myRank.rank / Math.max(filtered.length, 1)) * 100)) : 5

  return (
    <>
      <style>{CSS}</style>
      <MascotBubble />
      <MascotCursor />
      <div className="lb-page">
        <PlayerNavbar />

        {/* Stats Bar — only for logged-in players */}
        {currentUser && (
          <div className="lb-stats-bar">
            <div className="lb-stats-avatar">
              <AvatarDisplay avatarId={currentUser?.avatar_id} size={48} style={{ border: 'none' }} />
            </div>
            <div className="lb-stats-info">
              <div className="lb-stat-item">
                <div className="lb-stat-label">Your Rank</div>
                <div className="lb-stat-val">
                  <span className="lb-stat-num white">#{myRank ? myRank.rank : '—'}</span>
                  {myRank && myRank.rank <= entries.length && (
                    <span className="lb-rank-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="m18 15-6-6-6 6"/></svg>
                      +{Math.max(1, Math.floor(Math.random() * 5))}
                    </span>
                  )}
                </div>
              </div>
              <div className="lb-stat-item">
                <div className="lb-stat-label">Your Points</div>
                <div className="lb-stat-num purple">{myRank ? myRank.total_pc?.toLocaleString() : '0'}</div>
              </div>
              <div className="lb-stat-item">
                <div className="lb-stat-label">Games Played</div>
                <div className="lb-stat-num white">{myRank?.games_played || 0}</div>
              </div>
            </div>
            <div className="lb-stats-progress">
              <div className="lb-progress-text">Points to next rank: {myRank ? Math.max(0, (filtered[myIdx - 1]?.total_pc || 0) - (myRank.total_pc || 0) + 1) : '—'}</div>
              <div className="lb-progress-track">
                <div className="lb-progress-fill" style={{ width: `${progressPct}%` }} />
                <div className="lb-progress-pct">{Math.round(progressPct)}%</div>
              </div>
            </div>
            <a href="/arcade" className="lb-play-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>
              Play Now
            </a>
          </div>
        )}

        {loading ? (
          <div className="lb-loading">
            <div className="lb-spinner" />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(168,85,247,0.5)', letterSpacing: 2 }}>LOADING...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <h3>No Rankings Yet</h3>
            <p>Play games to become the first champion.</p>
            <a href="/arcade" className="lb-play-btn" style={{ display: 'inline-flex' }}>Play Now</a>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="lb-podium" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', alignItems: 'end', gap: 16, maxWidth: 700, margin: '0 auto 36px', padding: '30px 0 0' }}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                  const positions = ['second', 'first', 'third']
                  const medals = ['s', 'g', 'b']
                  const cls = positions[i]
                  const medalCls = medals[i]
                  const rank = i === 0 ? 2 : i === 1 ? 1 : 3
                  return (
                    <div key={entry.id} className={`lb-pod-card ${cls}`}>
                      <div className={`lb-pod-medal ${medalCls}`}>{rank}</div>
                      <div className="lb-pod-avatar">
                        <AvatarDisplay avatarId={entry.avatar_id} size={cls === 'first' ? 66 : 44} style={{ border: 'none' }} />
                      </div>
                      <div className="lb-pod-name">{entry.player_name}</div>
                      <div className="lb-pod-coins">{entry.total_pc?.toLocaleString()} PC</div>
                      <div className="lb-pod-games">Games: {entry.games_played || 0}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Table */}
            <div className="lb-table-wrap">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Games Played</th>
                    <th>Last Played</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((entry) => {
                    const isMe = currentUser && entry.email === currentUser.email
                    return (
                      <tr key={entry.id} className={isMe ? 'highlight' : ''}>
                        <td className={`lb-td-rank${entry.rank <= 3 ? ' top' : ''}`}>#{entry.rank}</td>
                        <td>
                          <div className="lb-td-player">
                            <div className="lb-td-avatar">
                              <AvatarDisplay avatarId={entry.avatar_id} size={32} style={{ border: 'none' }} />
                            </div>
                            <span className="lb-td-name">{isMe ? 'You' : entry.player_name}</span>
                          </div>
                        </td>
                        <td className="lb-td-points">{entry.total_pc?.toLocaleString()} PC</td>
                        <td className="lb-td-games">{entry.games_played || 0}</td>
                        <td className="lb-td-date">{timeAgo(entry.last_played_at || entry.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="lb-pagination">
                <span>Showing {Math.min((page - 1) * PER_PAGE + 4, rest.length + 3)}–{Math.min(page * PER_PAGE + 3, filtered.length)} of {filtered.length} players</span>
                <button className="lb-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1
                  return <button key={p} className={`lb-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                })}
                {totalPages > 5 && <span>...</span>}
                <button className="lb-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
