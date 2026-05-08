import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 18px', borderRadius: 12,
      background: type === 'success' ? '#22c55e' : '#ef4444',
      color: '#fff', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  )
}

export default function GameResponsesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [sessions, setSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('completed_at')
  const [sortDir, setSortDir] = useState('desc')

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  useEffect(() => {
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/games/${id}/responses`)
    ]).then(([gameRes, respRes]) => {
      setGame(gameRes.data.game)
      setQuestions(gameRes.data.game.questions || [])
      setSessions(respRes.data.sessions || [])
    }).catch(err => {
      showToast(err.response?.data?.message || 'Failed to load', 'error')
    }).finally(() => setLoading(false))
  }, [id])

  const parsePlayerData = (raw) => {
    try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}) }
    catch { return {} }
  }

  const getAnswerMap = (answers) => {
    // answers: [{question_id, option_id, is_correct, question_type, option_text, question_text}]
    const map = {}
    if (!answers) return map
    for (const a of answers) map[a.question_id] = a
    return map
  }

  // Build flat rows for display
  const buildRows = () => {
    return sessions.map(s => {
      const pd = parsePlayerData(s.player_data)
      const ansMap = getAnswerMap(s.answers)
      return { session: s, playerData: pd, ansMap }
    })
  }

  const rows = buildRows()

  // All player data keys (form fields)
  const formKeys = rows.length > 0
    ? Object.keys(rows[0].playerData)
    : []

  // Filter
  const filtered = rows.filter(r => {
    if (!search) return true
    const combined = Object.values(r.playerData).join(' ').toLowerCase()
    return combined.includes(search.toLowerCase())
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av, bv
    if (sortField === 'completed_at') {
      av = new Date(a.session.completed_at || 0).getTime()
      bv = new Date(b.session.completed_at || 0).getTime()
    } else if (sortField === 'score') {
      av = a.session.score || 0
      bv = b.session.score || 0
    } else {
      av = (a.playerData[sortField] || '').toLowerCase()
      bv = (b.playerData[sortField] || '').toLowerCase()
    }
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#aaa', fontSize: 10 }}>↕</span>
    return <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  // ─── Excel Download ───────────────────────────────────────────
  const downloadExcel = () => {
    // Build CSV with UTF-8 BOM so Excel handles special chars
    const headers = [
      '#',
      ...formKeys,
      'Score',
      'Total Questions',
      ...questions.map((q, i) => `Q${i + 1}: ${(q.question_text || '').substring(0, 40)}`),
      ...questions.map((q, i) => `Q${i + 1} Correct?`),
      'Completed At',
      'Email Sent'
    ]

    const csvRows = sorted.map((r, idx) => {
      const pd = r.playerData
      const ansMap = r.ansMap
      const qAnswers = questions.map(q => {
        const a = ansMap[q.id]
        return a ? (a.option_text || `Option #${a.option_id}`) : ''
      })
      const qCorrect = questions.map(q => {
        const a = ansMap[q.id]
        if (!a) return ''
        if (a.question_type === 'opinion') return 'N/A'
        return a.is_correct ? 'Yes' : 'No'
      })
      return [
        idx + 1,
        ...formKeys.map(k => `"${(pd[k] || '').toString().replace(/"/g, '""')}"`),
        r.session.score || 0,
        r.session.total_scoreable || 0,
        ...qAnswers.map(v => `"${v.replace(/"/g, '""')}"`),
        ...qCorrect,
        r.session.completed_at ? new Date(r.session.completed_at).toLocaleString() : '',
        r.session.email_sent ? 'Yes' : 'No'
      ]
    })

    const csvContent = [
      headers.map(h => `"${h.toString().replace(/"/g, '""')}"`).join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${game?.name || 'game'}_responses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded as CSV (open with Excel)')
  }

  const thStyle = (field) => ({
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid var(--border)',
    background: 'var(--surface2)',
    cursor: field ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  })

  const tdStyle = {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <div className="loader-spin" />
        <span>Loading responses...</span>
      </div>
    )
  }

  const completedCount = sessions.filter(s => s.completed).length
  const avgScore = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length).toFixed(1)
    : 0

  return (
    <div style={{ padding: 32, fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/games')}>← Back</button>
            <h1 style={{ fontSize: 22, margin: 0 }}>
              📊 Responses — <span style={{ color: 'var(--primary)' }}>{game?.name}</span>
            </h1>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            🏢 {game?.company_name} &nbsp;·&nbsp; {completedCount} completed responses
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={downloadExcel}
          disabled={sorted.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ⬇️ Download Excel
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Responses', value: sessions.length, icon: '👥' },
          { label: 'Completed', value: completedCount, icon: '✅' },
          { label: 'Avg Score', value: avgScore, icon: '🎯' },
          { label: 'Questions', value: questions.length, icon: '❓' },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: '1 1 140px', padding: '16px 20px', minWidth: 130 }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name, email, phone..."
          style={{ maxWidth: 380, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, width: '100%' }}
        />
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📭</div>
          <h3>No responses yet</h3>
          <p>Players who complete the game will appear here.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={thStyle(null)}>#</th>
                {formKeys.map(k => (
                  <th key={k} style={thStyle(k)} onClick={() => handleSort(k)}>
                    {k} <SortIcon field={k} />
                  </th>
                ))}
                <th style={thStyle('score')} onClick={() => handleSort('score')}>
                  Score <SortIcon field="score" />
                </th>
                {questions.map((q, i) => (
                  <th key={q.id} style={thStyle(null)} title={q.question_text}>
                    Q{i + 1}
                  </th>
                ))}
                <th style={thStyle('completed_at')} onClick={() => handleSort('completed_at')}>
                  Completed At <SortIcon field="completed_at" />
                </th>
                <th style={thStyle(null)}>Email Sent</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => {
                const pd = r.playerData
                const ansMap = r.ansMap
                return (
                  <tr key={r.session.id} style={{ background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface2)' }}>
                    <td style={{ ...tdStyle, color: 'var(--text2)', fontWeight: 600 }}>{idx + 1}</td>
                    {formKeys.map(k => (
                      <td key={k} style={tdStyle} title={pd[k] || ''}>
                        {pd[k] || <span style={{ color: '#aaa' }}>—</span>}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--primary)', textAlign: 'center' }}>
                      {r.session.score || 0}
                      {r.session.total_scoreable > 0 && (
                        <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: 11 }}>
                          /{r.session.total_scoreable}
                        </span>
                      )}
                    </td>
                    {questions.map(q => {
                      const a = ansMap[q.id]
                      if (!a) return (
                        <td key={q.id} style={{ ...tdStyle, color: '#aaa', textAlign: 'center' }}>—</td>
                      )
                      const isOpinion = a.question_type === 'opinion'
                      const correct = a.is_correct === 1
                      return (
                        <td key={q.id} style={{ ...tdStyle, textAlign: 'center' }} title={a.option_text || ''}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            {!isOpinion && (
                              <span style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: correct ? '#22c55e' : '#ef4444',
                                display: 'inline-block', flexShrink: 0
                              }} title={correct ? 'Correct' : 'Wrong'} />
                            )}
                            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                              {a.option_text || `#${a.option_id}`}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: 12 }}>
                      {r.session.completed_at
                        ? new Date(r.session.completed_at).toLocaleString()
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {r.session.email_sent
                        ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', textAlign: 'right' }}>
          Showing {sorted.length} of {sessions.length} responses
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
