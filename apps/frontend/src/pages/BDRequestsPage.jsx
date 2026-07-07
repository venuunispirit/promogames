import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import api from '../api'

const STATUS_META = {
  pending:         { label:'Pending',         color:'#D97706', bg:'#FFFBEB' },
  approved:        { label:'Approved',        color:'#059669', bg:'#F0FDF4' },
  started_working: { label:'Started Working', color:'#2563EB', bg:'#EFF6FF' },
  game_creating:   { label:'Game is Creating',color:'#7C3AED', bg:'#F5F3FF' },
  testing:         { label:'Testing',         color:'#DC2626', bg:'#FEF2F2' },
  live:            { label:'Live',            color:'#059669', bg:'#F0FDF4' },
  rejected:        { label:'Rejected',        color:'#DC2626', bg:'#FEF2F2' },
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');
.bd-page *,.bd-page *::before,.bd-page *::after{box-sizing:border-box;margin:0;padding:0}
.bd-page{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:calc(100vh - 62px);padding:36px 40px;max-width:1200px;margin:0 auto}
.bd-title{font-family:'Fraunces',serif;font-weight:600;font-size:32px;color:#0D0D1A;margin-bottom:8px}
.bd-sub{color:#6B7280;font-size:14px;margin-bottom:28px}
.bd-table-wrap{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;overflow:hidden}
.bd-table{width:100%;border-collapse:collapse}
.bd-table thead tr{background:#F9FAFB;border-bottom:1.5px solid #EAECF0}
.bd-table thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
.bd-table tbody tr{border-bottom:1px solid #F3F4F6}
.bd-table tbody tr:last-child{border-bottom:none}
.bd-table tbody td{padding:13px 14px;font-size:13px;color:#374151;vertical-align:middle}
.bd-status{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;display:inline-block}
`

export default function BDRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrModal, setQrModal] = useState(null)

  useEffect(() => {
    api.get('/bd/requests').then(r => {
      setRequests(r.data.requests || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bd-page">
      <style>{CSS}</style>
      <h1 className="bd-title">My Requests</h1>
      <p className="bd-sub">Track the status of your submitted requests.</p>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
          <p style={{ fontSize:16, marginBottom:8 }}>No requests yet</p>
          <p style={{ fontSize:13 }}>Submit a new request from your dashboard.</p>
        </div>
      ) : (
        <div className="bd-table-wrap" style={{ overflowX:'auto' }}>
          <table className="bd-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Game Module</th>
                <th>Links</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>QR</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const sm = STATUS_META[r.status] || STATUS_META.pending
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight:600 }}>{r.business_name}</td>
                    <td style={{ textTransform:'capitalize' }}>{r.game_category}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {r.gmaps_url && <a href={r.gmaps_url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#4F46E5' }}>Maps</a>}
                        {r.social_url && <a href={r.social_url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#4F46E5' }}>Social</a>}
                      </div>
                    </td>
                    <td>
                      <span className="bd-status" style={{ background:sm.bg, color:sm.color }}>{sm.label}</span>
                    </td>
                    <td style={{ color:'#9CA3AF', fontSize:12 }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td>
                      {r.game_status === 'live' && r.game_id && (
                        <button
                          onClick={() => setQrModal(r)}
                          style={{ padding:'6px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'DM Sans' }}
                        >
                          🖼 QR
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {qrModal && <QRCodeModal request={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  )
}

function QRCodeModal({ request, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const host = typeof window !== 'undefined' ? window.location.origin : ''
  const link = request.game_slug && request.client_slug
    ? `${host}/play/${request.game_slug}/${request.client_slug}`
    : `${host}/play/${request.game_id}`

  useEffect(() => {
    QRCode.toDataURL(link, { width:260, margin:2, color:{ dark:'#0D0D1A', light:'#FFFFFF' } })
      .then(setQrDataUrl).catch(() => {})
  }, [])

  const handleCopyLink = () => navigator.clipboard.writeText(link)
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = (request.business_name || 'game').replace(/ /g,'-') + '-qr.png'
    a.click()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'rgba(8,8,18,.48)', backdropFilter:'blur(5px)' }}>
      <div style={{ position:'relative', background:'#fff', borderRadius:24, width:'100%', maxWidth:400, padding:'34px 28px 28px', boxShadow:'0 24px 64px rgba(0,0,0,.22)', fontFamily:"'DM Sans',sans-serif", textAlign:'center' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:7, border:'1.5px solid #E5E7EB', background:'#F9FAFB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>✕</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#0D0D1A', marginBottom:4 }}>{request.business_name}</div>
        <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:20 }}>Scan to play the game</div>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR" style={{ width:200, height:200, borderRadius:16, margin:'0 auto 20px', display:'block', padding:12, background:'#FAFAFA', border:'1px solid #EAECF0' }} />
        ) : (
          <div style={{ width:200, height:200, borderRadius:16, margin:'0 auto 20px', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF' }}>Loading...</div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={handleCopyLink} style={{ padding:'10px 0', borderRadius:10, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'DM Sans', color:'#374151' }}>📋 Copy Link</button>
          <button onClick={handleDownload} disabled={!qrDataUrl} style={{ padding:'10px 0', borderRadius:10, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'DM Sans', color:'#374151' }}>⬇ Download QR</button>
        </div>
      </div>
    </div>
  )
}
