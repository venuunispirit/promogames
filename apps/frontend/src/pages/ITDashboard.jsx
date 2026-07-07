import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function ITDashboard() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/internal-team/requests').then(r => {
      setRequests(r.data.requests || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pending = requests.filter(r => r.status === 'approved' || r.status === 'pending')
  const inProgress = requests.filter(r => !['pending','approved','live','rejected'].includes(r.status))
  const live = requests.filter(r => r.status === 'live')

  return (
    <div>
      <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:32,color:'#0D0D1A',marginBottom:8}}>Dashboard</h1>
      <p style={{color:'#6B7280',fontSize:14,marginBottom:28}}>Overview of your assigned requests.</p>

      {loading ? (
        <div style={{padding:'60px 0',textAlign:'center',color:'#9CA3AF'}}>Loading...</div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
            <div style={{background:'#FFFBEB',borderRadius:16,padding:'20px 24px',border:'1.5px solid #FDE68A'}}>
              <div style={{fontSize:28,fontWeight:700,color:'#D97706'}}>{pending.length}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#92400E'}}>Pending / New</div>
            </div>
            <div style={{background:'#EFF6FF',borderRadius:16,padding:'20px 24px',border:'1.5px solid #93C5FD'}}>
              <div style={{fontSize:28,fontWeight:700,color:'#2563EB'}}>{inProgress.length}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#1E40AF'}}>In Progress</div>
            </div>
            <div style={{background:'#F0FDF4',borderRadius:16,padding:'20px 24px',border:'1.5px solid #86EFAC'}}>
              <div style={{fontSize:28,fontWeight:700,color:'#059669'}}>{live.length}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#065F46'}}>Live</div>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',padding:24}}>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:18,color:'#0D0D1A',marginBottom:16}}>Assigned Requests</h3>
            {requests.length === 0 ? (
              <p style={{color:'#9CA3AF',fontSize:13}}>No requests assigned to you yet.</p>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1.5px solid #EAECF0'}}>
                    <th style={{textAlign:'left',padding:'10px 12px',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>Business</th>
                    <th style={{textAlign:'left',padding:'10px 12px',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>BD</th>
                    <th style={{textAlign:'left',padding:'10px 12px',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>Status</th>
                    <th style={{textAlign:'left',padding:'10px 12px',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const statusColors = {
                      pending:'#D97706', approved:'#059669', started_working:'#2563EB',
                      game_creating:'#7C3AED', testing:'#DC2626', live:'#059669', rejected:'#DC2626'
                    }
                    const statusLabels = {
                      pending:'Pending', approved:'Approved', started_working:'Started Working',
                      game_creating:'Creating', testing:'Testing', live:'Live', rejected:'Rejected'
                    }
                    return (
                      <tr key={r.id} style={{borderBottom:'1px solid #F3F4F6'}}>
                        <td style={{padding:'12px',fontSize:13,fontWeight:600,color:'#374151'}}>{r.business_name}</td>
                        <td style={{padding:'12px',fontSize:13,color:'#6B7280'}}>{r.bd_name || '—'}</td>
                        <td style={{padding:'12px'}}>
                          <span style={{padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700,background:(statusColors[r.status]||'#6B7280')+'18',color:statusColors[r.status]||'#6B7280'}}>
                            {statusLabels[r.status]||r.status}
                          </span>
                        </td>
                        <td style={{padding:'12px'}}>
                          <button onClick={() => navigate('/internal-team/requests')} style={{padding:'6px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#4338CA',fontFamily:'DM Sans'}}>
                            View →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
