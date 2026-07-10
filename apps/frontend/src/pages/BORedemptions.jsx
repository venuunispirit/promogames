import { useState, useEffect, useMemo } from 'react'
import api from '../api'

const parsePlayerData = (raw) => {
  try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}) }
  catch { return {} }
}

const knownFields = new Set(['name','fullname','full name','email','emailaddress','e-mail','phone','mobile','contact','table number','table no','table num','table_number'])

export default function BORedemptions() {
  const [redemptions, setRedemptions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Immediate accept
  const [acceptingId, setAcceptingId] = useState(null)
  // Optional code verification
  const [verifyingId, setVerifyingId] = useState(null)
  const [acceptCode, setAcceptCode] = useState('')
  const [acceptError, setAcceptError] = useState('')
  const [acceptSubmitting, setAcceptSubmitting] = useState(false)

  // Reject flow
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => { fetchRedemptions() }, [])

  useEffect(() => {
    const q = search.toLowerCase().trim()
    if (!q) { setFiltered(redemptions); return }
    setFiltered(redemptions.filter(r =>
      r.player_name?.toLowerCase().includes(q) ||
      r.player_email?.toLowerCase().includes(q)
    ))
  }, [search, redemptions])

  const fetchRedemptions = () => {
    api.get('/business/notifications').then(r => {
      setRedemptions(r.data.notifications || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleAccept = async (redemption) => {
    setAcceptingId(redemption.id)
    try {
      await api.post('/business/accept-with-code', { redemption_id: redemption.id })
      fetchRedemptions()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept')
    } finally {
      setAcceptingId(null)
    }
  }

  const startVerify = (redemption) => {
    setVerifyingId(redemption.id)
    setAcceptCode('')
    setAcceptError('')
  }

  const cancelVerify = () => {
    setVerifyingId(null)
    setAcceptCode('')
    setAcceptError('')
  }

  const submitVerify = async (redemption) => {
    if (acceptCode.length !== 6) return
    setAcceptSubmitting(true)
    setAcceptError('')
    try {
      const { data } = await api.post('/business/accept-with-code', {
        redemption_id: redemption.id,
        code: acceptCode,
      })
      if (data.success) {
        cancelVerify()
        fetchRedemptions()
      }
    } catch (err) {
      setAcceptError(err.response?.data?.message || 'Invalid code')
    } finally {
      setAcceptSubmitting(false)
    }
  }

  const handleReject = async (redemption) => {
    if (!window.confirm(`Reject redemption for ${redemption.player_name}?`)) return
    setRejectingId(redemption.id)
    try {
      const { data } = await api.post('/business/reject-redemption', {
        redemption_id: redemption.id,
      })
      if (data.success) {
        setRejectingId(null)
        fetchRedemptions()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject')
      setRejectingId(null)
    }
  }

  const statusColor = (s) => {
    switch(s) {
      case 'pending': return '#f59e0b'
      case 'code_revealed': return '#3b82f6'
      case 'code_entered': return '#8b5cf6'
      case 'player_confirmed': return '#22c55e'
      case 'completed': return '#22c55e'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const statusLabel = (s) => {
    switch(s) {
      case 'pending': return 'Pending'
      case 'code_revealed': return 'Code Ready'
      case 'code_entered': return 'Verified'
      case 'player_confirmed': return 'Confirmed'
      case 'completed': return 'Completed'
      case 'rejected': return 'Rejected'
      default: return s
    }
  }

  const canAct = (s) => ['pending', 'code_revealed', 'code_entered'].includes(s)

  if (loading) return <div style={{ color:'rgba(167,139,250,0.5)', textAlign:'center', padding:40, fontFamily:'DM Sans, sans-serif' }}>Loading...</div>

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', color:'#f8fafc' }}>
      <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 4px', background:'linear-gradient(135deg,#c084fc,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        Redemptions
      </h1>
      <p style={{ color:'rgba(167,139,250,0.4)', fontSize:13, marginBottom:20 }}>All participant plays and redemption status</p>

      {/* Search by name or email */}
      <div style={{
        background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
        borderRadius:16, padding:'16px 20px', marginBottom:24,
      }}>
        <input
          style={{
            width:'100%', padding:'12px 16px', fontSize:14, fontWeight:500,
            background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(139,92,246,0.2)',
            borderRadius:12, color:'#f8fafc', outline:'none', fontFamily:'inherit',
            boxSizing:'border-box',
          }}
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by participant name or email..."
          autoComplete="off" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'rgba(167,139,250,0.3)', fontSize:14 }}>
          {search ? 'No participants match your search.' : 'No participants yet.'}
        </div>
      ) : (
        <div style={{
          background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
          borderRadius:16, overflow:'hidden',
        }}>
          {filtered.map(n => (
            <div key={n.id}>
              {/* Main row */}
              <div style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 20px', borderBottom:'1px solid rgba(139,92,246,0.05)',
                background: acceptingId === n.id ? 'rgba(139,92,246,0.05)' : 'transparent',
              }}>
                <div style={{
                  width:10, height:10, borderRadius:'50%', flexShrink:0,
                  background: statusColor(n.status),
                  boxShadow: n.status === 'pending' ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
                }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'#f8fafc' }}>{n.player_name}</div>
                  <div style={{ fontSize:12, color:'rgba(167,139,250,0.4)', marginTop:2 }}>
                    {n.player_phone}{n.player_phone ? ' · ' : ''}{n.game_name}{n.location_name ? ` · ${n.location_name}` : ''}{n.table_number ? ` · Table ${n.table_number}` : ''}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
                    background: statusColor(n.status) + '22', color: statusColor(n.status),
                  }}>
                    {statusLabel(n.status)}
                  </span>
                </div>
              </div>

              {/* Accept/Reject for actionable rows */}
              {canAct(n.status) && verifyingId !== n.id && (
                <div style={{
                  padding:'8px 20px 14px 44px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap',
                  background:'rgba(139,92,246,0.02)', borderBottom:'1px solid rgba(139,92,246,0.05)',
                }}>
                  <button onClick={() => handleAccept(n)}
                    disabled={acceptingId === n.id}
                    style={{
                      padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:600, fontSize:13,
                      opacity: acceptingId === n.id ? 0.5 : 1,
                    }}>
                    {acceptingId === n.id ? '...' : '✅ Accept'}
                  </button>
                  <button onClick={() => handleReject(n)}
                    disabled={rejectingId === n.id}
                    style={{
                      padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                      background: 'rgba(239,68,68,0.15)', color:'#f87171', fontWeight:600, fontSize:13,
                      opacity: rejectingId === n.id ? 0.5 : 1,
                    }}>
                    {rejectingId === n.id ? '...' : '❌ Reject'}
                  </button>
                  <button onClick={() => startVerify(n)}
                    style={{
                      padding:'4px 12px', borderRadius:6, border:'1px solid rgba(139,92,246,0.2)',
                      cursor:'pointer', fontFamily:'inherit',
                      background:'transparent', color:'rgba(167,139,250,0.5)', fontWeight:500, fontSize:11,
                    }}>
                    Verify Code
                  </button>
                </div>
              )}

              {/* Optional code verification */}
              {verifyingId === n.id && (
                <div style={{
                  padding:'12px 20px 16px 44px',
                  background:'rgba(34,197,94,0.04)', borderBottom:'1px solid rgba(139,92,246,0.05)',
                }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'rgba(167,139,250,0.6)', marginBottom:8 }}>
                    Enter the 6-digit code shown by the participant (optional)
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input
                      style={{
                        flex:1, padding:'10px 14px', fontSize:18, fontWeight:700, letterSpacing:6, textAlign:'center',
                        background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(34,197,94,0.3)',
                        borderRadius:10, color:'#f8fafc', outline:'none', fontFamily:'inherit', maxWidth:180,
                      }}
                      type="text" maxLength={6} value={acceptCode}
                      onChange={e => setAcceptCode(e.target.value.replace(/\D/g,''))}
                      onKeyDown={e => e.key === 'Enter' && submitVerify(n)}
                      placeholder="000000" autoComplete="off"
                      autoFocus />
                    <button onClick={() => submitVerify(n)}
                      disabled={acceptCode.length !== 6 || acceptSubmitting}
                      style={{
                        padding:'10px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                        background: acceptCode.length === 6 ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.05)',
                        color:'#fff', fontWeight:600, fontSize:13,
                        opacity: acceptCode.length === 6 && !acceptSubmitting ? 1 : 0.3,
                      }}>
                      {acceptSubmitting ? 'Verifying...' : 'Verify & Accept'}
                    </button>
                    <button onClick={cancelVerify}
                      style={{
                        padding:'10px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)',
                        cursor:'pointer', fontFamily:'inherit',
                        background:'transparent', color:'rgba(255,255,255,0.5)', fontWeight:600, fontSize:13,
                      }}>
                      Cancel
                    </button>
                  </div>
                  {acceptError && (
                    <div style={{ marginTop:8, fontSize:12, color:'#f87171' }}>{acceptError}</div>
                  )}
                </div>
              )}

              {/* Extra player_data fields */}
              {(() => {
                const pd = parsePlayerData(n.player_data)
                const extraKeys = Object.keys(pd).filter(k => !knownFields.has(k.toLowerCase()))
                if (extraKeys.length === 0) return null
                return (
                  <div style={{
                    padding:'8px 20px 8px 44px', fontSize:12,
                    background:'rgba(139,92,246,0.02)', borderBottom:'1px solid rgba(139,92,246,0.05)',
                    display:'flex', flexWrap:'wrap', gap:'4px 16px',
                  }}>
                    {extraKeys.map(k => (
                      <span key={k} style={{ color:'rgba(167,139,250,0.6)' }}>
                        <span style={{ fontWeight:600, color:'rgba(167,139,250,0.4)' }}>{k}:</span>{' '}
                        <span style={{ color:'#f8fafc' }}>{pd[k] ?? <span style={{color:'#D1D5DB'}}>—</span>}</span>
                      </span>
                    ))}
                  </div>
                )
              })()}

              {/* Rejected state */}
              {n.status === 'rejected' && (
                <div style={{
                  padding:'10px 20px 14px 44px', fontSize:12, color:'rgba(239,68,68,0.5)',
                  background:'rgba(239,68,68,0.03)', borderBottom:'1px solid rgba(139,92,246,0.05)',
                }}>
                  Rejected
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}