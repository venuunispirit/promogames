import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return <div className={`toast ${type}`}>{type === 'success' ? '✅' : '❌'} {msg}</div>
}

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ client_id: '', name: '', category: 'quiz', description: '', redirect_url: '' })
  const navigate = useNavigate()

  const fetchAll = () => {
    Promise.all([api.get('/games'), api.get('/clients')]).then(([gr, cr]) => {
      setGames(gr.data.games || [])
      setClients(cr.data.clients || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/games', form)
      setToast({ msg: 'Game created!', type: 'success' })
      setShowForm(false)
      setForm({ client_id: '', name: '', category: 'quiz', description: '', redirect_url: '' })
      fetchAll()
      // Open builder immediately
      navigate(`/dashboard/games/${res.data.game.id}/builder`)
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Error creating game', type: 'error' })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this game and all its questions?')) return
    try {
      await api.delete(`/games/${id}`)
      setToast({ msg: 'Game deleted', type: 'success' })
      fetchAll()
    } catch { setToast({ msg: 'Delete failed', type: 'error' }) }
  }

  const toggleActive = async (game) => {
    try {
      await api.put(`/games/${game.id}`, { ...game, is_active: game.is_active ? 0 : 1 })
      fetchAll()
    } catch { }
  }

  const copyLink = (game) => {
    const link = `${window.location.origin}/play/${game.slug}/${game.client_slug}`
    navigator.clipboard.writeText(link)
    if (!game.is_active) {
      setToast({ msg: '⚠️ Link copied — but this game is currently INACTIVE. Players will see an error until you activate it.', type: 'error' })
    } else {
      setToast({ msg: 'Link copied!', type: 'success' })
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Games</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{games.length} total games</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Game</button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="loader-spin" /><span>Loading games...</span></div>
      ) : games.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48 }}>🎮</div><h3>No games yet</h3><p>Create your first game to get started</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>+ Create Game</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {games.map(g => (
            <div key={g.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="badge badge-purple">{g.category}</span>
                <span className={`badge ${g.is_active ? 'badge-green' : 'badge-red'}`}>{g.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 4, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/dashboard/games/${g.id}/responses`)}>{g.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>🏢 {g.company_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                🔗 /play/{g.slug}/{g.client_slug}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>❓ {g.question_count || 0} questions</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>▶️ {g.play_count || 0} plays</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/dashboard/games/${g.id}/builder`)}>🔧 Builder</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/games/${g.id}/responses`)}>📊 Responses</button>
                <button className="btn btn-ghost btn-sm" onClick={() => copyLink(g)}>🔗 Copy Link</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(g)}>{g.is_active ? '⏸' : '▶️'}</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Create New Game</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} required>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Game Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Product Knowledge Quiz" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="quiz">Quiz</option>
                  <option value="survey">Survey</option>
                  <option value="poll">Poll</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Redirect URL (after game)</label>
                <input type="url" value={form.redirect_url} onChange={e => setForm({ ...form, redirect_url: e.target.value })} placeholder="https://yourwebsite.com/thankyou" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create & Open Builder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
