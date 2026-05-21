import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function playerApi() {
  const token = localStorage.getItem('playerToken')
  return {
    get: (url) => api.get(url,  { headers: { Authorization: `Bearer ${token}` } }),
    post:(url, data) => api.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Stat box ──────────────────────────────────────────────────────────────────
function StatBox({ icon, label, value, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48,
        background: `${color}18`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</div>
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────
function TxRow({ tx }) {
  const isEarn  = tx.type === 'earn'
  const isReset = tx.type === 'reset'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: isEarn ? 'rgba(34,197,94,0.12)' : isReset ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          {isEarn ? '⬆️' : isReset ? '🔄' : '⬇️'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.note || (tx.game_name ? `Played: ${tx.game_name}` : 'PromoPoints')}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{timeAgo(tx.created_at)}</div>
        </div>
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: 15,
        color: isEarn ? 'var(--success)' : isReset ? 'var(--warning)' : 'var(--danger)',
      }}>
        {isEarn ? '+' : isReset ? '±' : '-'}{tx.points} PP
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PlayerDashboard() {
  const navigate  = useNavigate()
  const [player,   setPlayer]   = useState(null)
  const [txs,      setTxs]      = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeTab, setTab]     = useState('overview') // overview | history | arcade

  useEffect(() => {
    const stored = localStorage.getItem('playerUser')
    if (!stored) { navigate('/login'); return }
    setPlayer(JSON.parse(stored))
    loadData()
  }, [])

  const loadData = async () => {
    const pApi = playerApi()
    try {
      const [meRes, txRes] = await Promise.all([
        pApi.get('/pauth/me'),
        pApi.get('/pauth/transactions'),
      ])
      setPlayer(meRes.data.player)
      localStorage.setItem('playerUser', JSON.stringify(meRes.data.player))
      setTxs(txRes.data.transactions || [])
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('playerToken')
    localStorage.removeItem('playerUser')
    navigate('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-spin" />
    </div>
  )

  if (!player) return null

  const tabs = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'history',  label: '📋 History'  },
    { id: 'arcade',   label: '🕹️ Play Games' },
  ]

  // ── PP circle ring ──────────────────────────────────────────────────────────
  const ppMax   = 2000
  const ppPct   = Math.min((player.pp_balance / ppMax) * 100, 100)
  const radius  = 54
  const circ    = 2 * Math.PI * radius
  const dash    = (ppPct / 100) * circ

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Top bar ── */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1.5px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
          <span>🎮</span> PromoGames
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Hi, <strong style={{ color: 'var(--text)' }}>{player.name.split(' ')[0]}</strong>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>

        {/* ── PP Hero card ── */}
        <div style={{
          background: 'linear-gradient(135deg, #2a2060 0%, var(--surface) 100%)',
          border: '1.5px solid rgba(124,111,247,0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          {/* SVG ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--border)" strokeWidth={10} />
              <circle
                cx={65} cy={65} r={radius}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                {player.pp_balance.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>PP</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="badge badge-purple" style={{ marginBottom: 12 }}>PromoPoints Balance</div>
            <h2 style={{ fontSize: 22, marginBottom: 6 }}>{player.name}</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>
              {player.city ? `📍 ${player.city}` : ''}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              Points reset monthly. Use them to redeem rewards at partner brands!
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/arcade')}
              style={{ marginTop: 16 }}
            >
              🕹️ Play & Earn More
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 4,
          marginBottom: 24,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: 'calc(var(--radius) - 4px)',
                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'var(--text2)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW tab ── */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatBox icon="⭐" label="Total PP Balance"   value={player.pp_balance.toLocaleString()} />
              <StatBox icon="🎮" label="Games Played"       value={txs.filter(t => t.type === 'earn' && t.game_id).length} color="var(--accent)" />
              <StatBox icon="🎁" label="Rewards Redeemed"   value={txs.filter(t => t.type === 'spend').length}            color="var(--success)" />
            </div>

            {/* Recent transactions preview */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16 }}>Recent Activity</h3>
                <button
                  onClick={() => setTab('history')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  View all →
                </button>
              </div>
              {txs.length === 0
                ? (
                  <div className="empty-state" style={{ padding: '32px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🎮</div>
                    <p>No activity yet. Play a game to earn your first PromoPoints!</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/arcade')} style={{ marginTop: 12 }}>
                      Browse Games →
                    </button>
                  </div>
                )
                : txs.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} />)
              }
            </div>

            {/* How it works */}
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>How PromoPoints Work</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                  { icon: '🕹️', title: 'Play Games',      desc: 'Earn 10 PP per PromoGame, 50 PP per brand game' },
                  { icon: '💰', title: 'Earn Points',      desc: 'Points accumulate in your wallet all month long'  },
                  { icon: '🎁', title: 'Redeem Rewards',   desc: 'Spend PP at partner brands for free goodies'       },
                  { icon: '🔄', title: 'Monthly Reset',    desc: 'PP resets to zero every month — keep playing!'     },
                ].map(s => (
                  <div key={s.title} style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── HISTORY tab ── */}
        {activeTab === 'history' && (
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>PP Transaction History</h3>
            {txs.length === 0
              ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                  <p>No transactions yet. Play a game to see your history!</p>
                </div>
              )
              : txs.map(tx => <TxRow key={tx.id} tx={tx} />)
            }
          </div>
        )}

        {/* ── ARCADE tab ── */}
        {activeTab === 'arcade' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🕹️</div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>Ready to Play?</h3>
            <p style={{ color: 'var(--text2)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Browse all available games. Every game you complete earns you PromoPoints!
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/arcade')}>
              Go to Arcade →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}