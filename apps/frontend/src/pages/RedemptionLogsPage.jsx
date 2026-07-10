import { useState, useEffect } from 'react'
import api from '../api'

export default function RedemptionLogsPage() {
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', bo_id: '', game_id: '', start_date: '', end_date: '' })

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      const { data } = await api.get(`/internal-team/redemption-logs?${params}`)
      setRedemptions(data.redemptions || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statusColor = (s) => {
    switch (s) {
      case 'pending': return '#f59e0b'
      case 'code_revealed': return '#3b82f6'
      case 'code_entered': return '#8b5cf6'
      case 'player_confirmed': return '#22c55e'
      case 'completed': return '#059669'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const statusLabel = (s) => {
    switch (s) {
      case 'pending': return 'Pending'
      case 'code_revealed': return 'Code Revealed'
      case 'code_entered': return 'Code Entered'
      case 'player_confirmed': return 'Player Confirmed'
      case 'completed': return 'Completed'
      case 'rejected': return 'Rejected'
      default: return s
    }
  }

  const set = k => e => setFilters(f => ({ ...f, [k]: e.target.value }))

  const exportCSV = () => {
    const headers = ['ID','Player Name','Player Phone','Player Email','Game','Business Owner','Status','Table Number','Accepted By','Accepted At','Rejected By','Rejected At','Reject Reason','Created At']
    const rows = redemptions.map(r => [
      r.id, r.player_name, r.player_phone, r.player_email, r.game_name, r.business_name, r.status,
      r.table_number || '', r.accepted_by_name || '', r.accepted_at || '', r.rejected_by_name || '', r.rejected_at || '',
      r.reject_reason || '', r.created_at
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'redemption-logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", padding: '24px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:600, color:'#0D0D1A', margin:0 }}>Redemption Logs</h1>
          <p style={{ fontSize:13.5, color:'#9CA3AF', marginTop:4 }}>Audit all redemptions including accepted and rejected</p>
        </div>
        <button onClick={exportCSV}
          style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'inherit' }}>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'flex-end' }}>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', marginBottom:4 }}>Status</label>
          <select value={filters.status} onChange={set('status')} style={{ padding:'7px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'#fff' }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="code_revealed">Code Revealed</option>
            <option value="code_entered">Code Entered</option>
            <option value="player_confirmed">Player Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', marginBottom:4 }}>Start Date</label>
          <input type="date" value={filters.start_date} onChange={set('start_date')} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit' }} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', marginBottom:4 }}>End Date</label>
          <input type="date" value={filters.end_date} onChange={set('end_date')} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit' }} />
        </div>
        <button onClick={load} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'#4F46E5', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          Apply Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#9CA3AF' }}>Loading...</div>
      ) : redemptions.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#9CA3AF' }}>No redemptions found</div>
      ) : (
        <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid #E5E7EB' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'#F9FAFB', borderBottom:'1px solid #E5E7EB' }}>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>ID</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Player</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Game</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Business Owner</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Status</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Table #</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Accepted / Rejected By</th>
                <th style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#374151' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
                  <td style={{ padding:'10px 12px', color:'#6B7280' }}>{r.id}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ fontWeight:600, color:'#1F2937' }}>{r.player_name}</div>
                    <div style={{ fontSize:10, color:'#9CA3AF' }}>{r.player_phone}{r.table_number ? ` · Tbl ${r.table_number}` : ''}</div>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#374151' }}>{r.game_name}</td>
                  <td style={{ padding:'10px 12px', color:'#6B7280' }}>{r.business_name}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700, background: statusColor(r.status) + '22', color: statusColor(r.status) }}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#6B7280' }}>{r.table_number || '-'}</td>
                  <td style={{ padding:'10px 12px', fontSize:11 }}>
                    {r.accepted_by_name && <div style={{ color:'#059669' }}>✓ {r.accepted_by_name}</div>}
                    {r.rejected_by_name && <div style={{ color:'#DC2626' }}>✕ {r.rejected_by_name}{r.reject_reason ? `: ${r.reject_reason}` : ''}</div>}
                    {!r.accepted_by_name && !r.rejected_by_name && <span style={{ color:'#9CA3AF' }}>-</span>}
                  </td>
                  <td style={{ padding:'10px 12px', color:'#6B7280', fontSize:11 }}>
                    {r.accepted_at || r.rejected_at || r.created_at?.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
