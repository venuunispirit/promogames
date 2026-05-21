import React, { useState, useEffect, useCallback } from 'react'
import api from '../api'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) { return Number(n || 0).toLocaleString() }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ type }) {
  const map = {
    earn:  { label: '+ Earned',   bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    spend: { label: '− Spent',    bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    bonus: { label: '🎁 Bonus',   bg: 'rgba(124,111,247,0.12)', color: 'var(--primary)' },
    reset: { label: '↺ Reset',    bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
  }
  const b = map[type] || { label: type, bg: 'var(--surface2)', color: 'var(--text2)' }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: b.bg, color: b.color,
    }}>{b.label}</span>
  )
}

// ── Profile Drawer ─────────────────────────────────────────────────────────────
function PlayerDrawer({ player, onClose }) {
  const [txns, setTxns]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!player) return
    setLoading(true)
    api.get(`/players-admin/${player.id}/transactions`)
      .then(r => setTxns(r.data.transactions || []))
      .catch(() => setTxns([]))
      .finally(() => setLoading(false))
  }, [player])

  if (!player) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 480,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(124,111,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            {player.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {player.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{player.email}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface2)', border: 'none', borderRadius: 8,
              width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--text2)', flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* PP Balance highlight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,111,247,0.15), rgba(124,111,247,0.05))',
            border: '1px solid rgba(124,111,247,0.25)',
            borderRadius: 12,
            padding: '20px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--primary)' }}>
              {fmt(player.pp_balance)}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>PromoPoints Balance</div>
          </div>

          {/* Profile details */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Profile Details
            </div>
            {[
              ['📱 WhatsApp',   player.whatsapp  || '—'],
              ['🏙️ City',       player.city      || '—'],
              ['📮 Pincode',    player.pincode   || '—'],
              ['🎂 Date of Birth', fmtDate(player.dob)],
              ['🗓️ Joined',     fmtDate(player.created_at)],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 14,
              }}>
                <span style={{ color: 'var(--text2)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Transaction history */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Transaction History
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>Loading...</div>
            ) : txns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)', fontSize: 14 }}>
                No transactions yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {txns.map(t => (
                  <div key={t.id} style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        {t.note || 'PromoPoints transaction'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        {fmtDateTime(t.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <Badge type={t.type} />
                      <span style={{
                        fontSize: 15, fontWeight: 800,
                        color: t.type === 'earn' || t.type === 'bonus' ? '#22c55e' : t.type === 'spend' ? '#ef4444' : 'var(--text)',
                      }}>
                        {t.type === 'spend' ? '-' : '+'}{fmt(t.points)} PP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main PlayersPage ──────────────────────────────────────────────────────────
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
      setPlayers(data.players || [])
      setStats(data.stats    || {})
    } catch {
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)  ||
        p.whatsapp?.includes(q)
      )
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === 'pp_balance') { av = Number(av); bv = Number(bv) }
      if (av < bv) return sortDir === 'asc' ? -1 :  1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  // ── CSV Export ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['ID','Name','Email','WhatsApp','City','Pincode','PP Balance','Joined']
    const rows = filtered.map(p => [
      p.id, p.name, p.email, p.whatsapp || '',
      p.city || '', p.pincode || '',
      p.pp_balance, fmtDate(p.created_at),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `promoplayers_${Date.now()}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ color: 'var(--border)', marginLeft: 4 }}>↕</span>
    return <span style={{ color: 'var(--primary)', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>👥 Players</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            All registered PromoGames players and their activity
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'var(--primary)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Players"      value={fmt(stats.total)}      color="var(--primary)" />
        <StatCard icon="🆕" label="New This Month"     value={fmt(stats.new_month)}  color="#22c55e" />
        <StatCard icon="💰" label="Total PP Issued"    value={fmt(stats.total_pp)}   color="#f59e0b" />
        <StatCard icon="🏆" label="Avg PP / Player"    value={fmt(stats.avg_pp)}     color="#06b6d4" />
      </div>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18 }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name, email, city or WhatsApp..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 15, color: 'var(--text)',
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 18 }}
          >×</button>
        )}
        <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text2)' }}>
            Loading players...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text2)' }}>
            {search ? 'No players match your search.' : 'No players yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {[
                    { label: 'Player',      col: 'name'       },
                    { label: 'City',        col: 'city'       },
                    { label: 'WhatsApp',    col: 'whatsapp'   },
                    { label: 'PP Balance',  col: 'pp_balance' },
                    { label: 'Joined',      col: 'created_at' },
                  ].map(h => (
                    <th
                      key={h.col}
                      onClick={() => toggleSort(h.col)}
                      style={{
                        padding: '14px 20px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--text2)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.label}<SortIcon col={h.col} />
                    </th>
                  ))}
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Player name + email */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'rgba(124,111,247,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                        }}>
                          {p.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* City */}
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)' }}>
                      {p.city || '—'}
                    </td>

                    {/* WhatsApp */}
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)' }}>
                      {p.whatsapp || '—'}
                    </td>

                    {/* PP Balance */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontWeight: 800, fontSize: 16,
                        color: Number(p.pp_balance) > 0 ? 'var(--primary)' : 'var(--text2)',
                      }}>
                        {fmt(p.pp_balance)}
                        <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 4, color: 'var(--text2)' }}>PP</span>
                      </span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
                      {fmtDate(p.created_at)}
                    </td>

                    {/* View profile */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelected(p)}
                        style={{
                          padding: '7px 16px', borderRadius: 8,
                          background: 'rgba(124,111,247,0.1)',
                          border: '1px solid rgba(124,111,247,0.25)',
                          color: 'var(--primary)',
                          cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)',
              cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1,
              fontWeight: 600, fontSize: 13,
            }}
          >← Prev</button>

          <span style={{ fontSize: 14, color: 'var(--text2)', padding: '0 8px' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)',
              cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
              fontWeight: 600, fontSize: 13,
            }}
          >Next →</button>
        </div>
      )}

      {/* ── Player profile drawer ─────────────────────────────────────────── */}
      <PlayerDrawer player={selected} onClose={() => setSelected(null)} />
    </div>
  )
}