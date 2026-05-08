import { useState, useEffect } from 'react'
import api from '../api'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return <div className={`toast ${type}`}>{type === 'success' ? '✅' : '❌'} {msg}</div>
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', address: '', notes: '' })

  const fetchClients = () => {
    api.get('/clients').then(res => setClients(res.data.clients || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const openAdd = () => { setForm({ company_name: '', contact_name: '', email: '', phone: '', address: '', notes: '' }); setEditClient(null); setShowForm(true) }
  const openEdit = (c) => { setForm({ company_name: c.company_name, contact_name: c.contact_name || '', email: c.email || '', phone: c.phone || '', address: c.address || '', notes: c.notes || '' }); setEditClient(c); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editClient) {
        await api.put(`/clients/${editClient.id}`, form)
        setToast({ msg: 'Client updated', type: 'success' })
      } else {
        await api.post('/clients', form)
        setToast({ msg: 'Client created', type: 'success' })
      }
      setShowForm(false)
      fetchClients()
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Error saving client', type: 'error' })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this client and all their games?')) return
    try {
      await api.delete(`/clients/${id}`)
      setToast({ msg: 'Client deleted', type: 'success' })
      fetchClients()
    } catch { setToast({ msg: 'Delete failed', type: 'error' }) }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Clients</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{clients.length} total clients</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Client</button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="loader-spin" /><span>Loading clients...</span></div>
      ) : clients.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48 }}>🏢</div><h3>No clients yet</h3><p>Add your first client to get started</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Client</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {clients.map(c => (
            <div key={c.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, background: 'var(--primary-dark)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🏢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.company_name}</div>
                  {c.contact_name && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.contact_name}</div>}
                </div>
              </div>
              {c.email && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>📧 {c.email}</div>}
              {c.phone && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>📞 {c.phone}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span className="badge badge-purple">🎮 {c.game_count || 0} games</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>{editClient ? 'Edit Client' : 'Add Client'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Company Name *</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Contact Name</label><input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editClient ? 'Save Changes' : 'Add Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
