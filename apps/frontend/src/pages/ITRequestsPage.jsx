import { useState, useEffect } from 'react'
import api from '../api'

const STATUS_META = {
  pending:         { label:'Pending',         color:'#D97706', bg:'#FFFBEB' },
  approved:        { label:'Approved',        color:'#059669', bg:'#F0FDF4' },
  started_working: { label:'Started Working', color:'#2563EB', bg:'#EFF6FF' },
  game_creating:   { label:'Game Creating',   color:'#7C3AED', bg:'#F5F3FF' },
  testing:         { label:'Testing',         color:'#DC2626', bg:'#FEF2F2' },
  live:            { label:'Live',            color:'#059669', bg:'#F0FDF4' },
  rejected:        { label:'Rejected',        color:'#DC2626', bg:'#FEF2F2' },
}

const CSS = `
.it-req *,.it-req *::before,.it-req *::after{box-sizing:border-box;margin:0;padding:0}
.it-req{font-family:'DM Sans',sans-serif}
.it-req h1{font-family:'Fraunces',serif;font-weight:600;font-size:32px;color:#0D0D1A;margin-bottom:8px}
.it-sub{color:#6B7280;font-size:14px;margin-bottom:28px}
.it-table-wrap{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;overflow:hidden}
.it-table{width:100%;border-collapse:collapse}
.it-table thead tr{background:#F9FAFB;border-bottom:1.5px solid #EAECF0}
.it-table thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
.it-table tbody tr{border-bottom:1px solid #F3F4F6}
.it-table tbody tr:last-child{border-bottom:none}
.it-table tbody td{padding:13px 14px;font-size:13px;color:#374151;vertical-align:middle}
.it-badge{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;display:inline-block}
.it-btn{padding:6px 12px;border-radius:8px;border:1.5px solid #E5E7EB;background:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:background .13s}
.it-btn:hover{background:#F3F4F6}
.it-btn-primary{background:#4338CA;color:#fff;border-color:#4338CA}
.it-btn-primary:hover{background:#3730A3}
`

export default function ITRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [clients, setClients] = useState([])

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/internal-team/requests'),
      api.get('/clients')
    ]).then(([rr, cr]) => {
      setRequests(rr.data.requests || [])
      setClients(cr.data.clients || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateClient = async (reqId, company_name) => {
    try {
      const res = await api.post('/clients', { company_name })
      await api.put(`/internal-team/requests/${reqId}/status`, {
        status: 'started_working',
        client_id: res.data.client.id
      })
      showToast(`Client "${company_name}" created!`)
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create client', 'error')
    }
  }

  const handleCreateGame = async (reqId, clientId, name, category) => {
    try {
      const res = await api.post('/games', { client_id: clientId, name, category })
      await api.put(`/internal-team/requests/${reqId}/status`, {
        status: 'game_creating',
        game_id: res.data.game.id
      })
      showToast('Game created!')
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create game', 'error')
    }
  }

  const handleAdvanceStatus = async (reqId, nextStatus) => {
    try {
      await api.put(`/internal-team/requests/${reqId}/status`, { status: nextStatus })
      showToast(`Status changed to ${nextStatus}`)
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error')
    }
  }

  return (
    <div className="it-req">
      <style>{CSS}</style>
      <h1>Requests</h1>
      <p className="it-sub">Manage your assigned requests — create clients, build games, and progress them live.</p>

      {loading ? (
        <div style={{padding:'60px 0',textAlign:'center',color:'#9CA3AF'}}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={{padding:'60px 0',textAlign:'center',color:'#9CA3AF'}}>
          <p style={{fontSize:16,marginBottom:8}}>No requests assigned to you yet.</p>
          <p style={{fontSize:13}}>Wait for an admin to approve and assign requests to you.</p>
        </div>
      ) : (
        <div className="it-table-wrap" style={{overflowX:'auto'}}>
          <table className="it-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>BD</th>
                <th>Module</th>
                <th>Client</th>
                <th>Game</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const sm = STATUS_META[r.status] || STATUS_META.pending
                return (
                  <tr key={r.id}>
                    <td style={{fontWeight:600}}>{r.business_name}</td>
                    <td style={{color:'#6B7280',fontSize:12}}>{r.bd_name || '—'}</td>
                    <td style={{textTransform:'capitalize'}}>{r.game_category}</td>
                    <td>{r.client_name || '—'}</td>
                    <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {r.game_name || '—'}
                      {r.game_status && (
                        <span style={{display:'inline-block',marginLeft:6,padding:'2px 6px',borderRadius:4,fontSize:10,fontWeight:700,background:r.game_status==='live'?'#F0FDF4':'#FEF3C7',color:r.game_status==='live'?'#059669':'#D97706'}}>
                          {r.game_status}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="it-badge" style={{background:sm.bg,color:sm.color}}>{sm.label}</span>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',maxWidth:240}}>
                        {r.status === 'approved' && !r.client_id && (
                          <button className="it-btn it-btn-primary" onClick={() => handleCreateClient(r.id, r.business_name)}>
                            + Create Client
                          </button>
                        )}
                        {r.status === 'started_working' && r.client_id && !r.game_id && (
                          <button className="it-btn it-btn-primary" onClick={() => handleCreateGame(r.id, r.client_id, r.business_name, r.game_category)}>
                            + Create Game
                          </button>
                        )}
                        {r.status === 'game_creating' && (
                          <button className="it-btn it-btn-primary" onClick={() => handleAdvanceStatus(r.id, 'testing')}>
                            → Move to Testing
                          </button>
                        )}
                        {r.status === 'testing' && (
                          <button className="it-btn it-btn-primary" onClick={() => handleAdvanceStatus(r.id, 'live')}>
                            → Publish Live
                          </button>
                        )}
                        {r.status === 'live' && r.game_slug && r.client_slug && (
                          <span style={{fontSize:11,color:'#059669',fontWeight:600}}>✅ Live</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div style={{
          position:'fixed',bottom:28,right:28,zIndex:9999,
          background:toast.type==='success'?'#052E16':'#450A0A',color:'#fff',
          padding:'13px 20px',borderRadius:12,fontSize:13.5,fontWeight:500,
          fontFamily:'DM Sans',boxShadow:'0 8px 32px rgba(0,0,0,.24)',
          borderLeft:`3px solid ${toast.type==='success'?'#22C55E':'#EF4444'}`
        }}>
          {toast.type==='success'?'✓':'✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
