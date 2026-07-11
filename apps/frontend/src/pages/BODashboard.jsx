import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const BO_CSS = `
@keyframes slideInRight { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
@keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(100%)} }
@keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)} 50%{box-shadow:0 0 0 12px rgba(139,92,246,0)} }
.bo-toast {
  position:fixed; top:80px; right:24px; z-index:9999;
  background:rgba(20,10,40,0.95);
  border:1px solid rgba(139,92,246,0.2);
  border-radius:16px; padding:20px; max-width:360px; width:100%;
  box-shadow:0 0 40px rgba(139,92,246,0.15),0 8px 32px rgba(0,0,0,0.3);
  animation:slideInRight .3s ease;
  backdrop-filter:blur(12px);
}
.bo-toast.exit{animation:slideOutRight .3s ease forwards}
.bo-input{width:100%;padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:18px;font-weight:700;letter-spacing:6px;text-align:center;color:#f8fafc;background:rgba(255,255,255,0.04);border:1.5px solid rgba(139,92,246,0.2);border-radius:12px;outline:none;transition:all 0.2s}
.bo-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 4px rgba(139,92,246,0.08)}
.bo-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:8px;border:none;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
.bo-btn.accept{background:rgba(34,197,94,0.15);color:#4ade80}
.bo-btn.accept:hover{background:rgba(34,197,94,0.25)}
.bo-btn.reject{background:rgba(239,68,68,0.15);color:#f87171}
.bo-btn.reject:hover{background:rgba(239,68,68,0.25)}
`

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.setValueAtTime(1108, ctx.currentTime + 0.1)
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.3)
  } catch {}
}

export default function BODashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, rejected: 0 })
  const [notifications, setNotifications] = useState([])
  const [activeToast, setActiveToast] = useState(null)
  const [exiting, setExiting] = useState(false)
  const [passkey, setPasskey] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [verifyMsg, setVerifyMsg] = useState('')
  const [verifyStatus, setVerifyStatus] = useState('')
  const [lastNotifCount, setLastNotifCount] = useState(0)
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/business/notifications')
      const list = data.notifications || []
      setNotifications(list)

      if (list.length > lastNotifCount && lastNotifCount > 0) {
        const newOnes = list.slice(0, list.length - lastNotifCount)
        if (newOnes.length > 0) {
          const latest = newOnes[0]
          playNotificationSound()
          setActiveToast(latest)
          setExiting(false)
          clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            setExiting(true)
            setTimeout(() => setActiveToast(null), 300)
          }, 5000)
        }
      }
      setLastNotifCount(list.length)

      const pendingList = list.filter(n => n.status === 'pending' || n.status === 'code_revealed' || n.status === 'code_entered')
      const completedList = list.filter(n => n.status === 'completed' || n.status === 'player_confirmed')
      const rejectedList = list.filter(n => n.status === 'rejected')
      setStats({ total: list.length, pending: pendingList.length, completed: completedList.length, rejected: rejectedList.length })
    } catch {}
  }, [lastNotifCount])

  useEffect(() => {
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 15000)
    return () => { clearInterval(pollRef.current); clearTimeout(timerRef.current) }
  }, [])

  const handleVerify = async () => {
    if (passkey.length !== 6) return
    setVerifyMsg('')
    setVerifyStatus('')
    try {
      const { data } = await api.post('/business/verify-code', { code: passkey })
      if (data.success) {
        setVerifyStatus('success')
        setVerifyMsg(`Found: ${data.redemption.player_name} — accept or reject below`)
        setSearchResult(data.redemption)
        setPasskey('')
        fetchNotifications()
      }
    } catch (err) {
      setVerifyStatus('error')
      setVerifyMsg(err.response?.data?.message || 'Invalid code')
    }
  }

  const handleAccept = async (redemptionId) => {
    try {
      await api.post('/business/accept-redemption', { redemption_id: redemptionId })
      setSearchResult(null)
      setVerifyMsg('')
      fetchNotifications()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept')
    }
  }

  const handleReject = async (redemptionId) => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      await api.post('/business/reject-redemption', { redemption_id: redemptionId, reason: reason || null })
      setSearchResult(null)
      setVerifyMsg('')
      fetchNotifications()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject')
    }
  }

  const displayName = (n) => {
    if (n.table_number) return `${n.player_name} · Table ${n.table_number}`
    return n.player_name
  }

  const displayContact = (n) => {
    if (n.table_number) return null
    return n.player_phone || null
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
      case 'pending': return 'Waiting'
      case 'code_revealed': return 'Code Ready'
      case 'code_entered': return 'Entered'
      case 'player_confirmed': return 'Confirmed'
      case 'completed': return 'Done'
      case 'rejected': return 'Rejected'
      default: return s
    }
  }

  const canAct = (s) => s === 'code_revealed' || s === 'code_entered'

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', color:'#f8fafc' }}>
      <style>{BO_CSS}</style>

      {/* Toast Notification */}
      {activeToast && (
        <div className={`bo-toast${exiting?' exit':''}`}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <span style={{ fontSize:28 }}>🎮</span>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'#c084fc' }}>{displayName(activeToast)}</div>
              <div style={{ fontSize:13, color:'rgba(167,139,250,0.6)', marginTop:2 }}>
                {activeToast.game_name}{displayContact(activeToast) ? ` · ${displayContact(activeToast)}` : ''}
              </div>
            </div>
          </div>
          <div style={{ fontSize:12, color:'rgba(167,139,250,0.4)' }}>
            {activeToast.code
              ? <>Code: <strong style={{ color:'#c084fc', letterSpacing:3 }}>{activeToast.code}</strong></>
              : 'Waiting for player to reveal code'}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, margin:0, background:'linear-gradient(135deg,#c084fc,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Business Dashboard
        </h1>
        <p style={{ color:'rgba(167,139,250,0.5)', fontSize:14, margin:'4px 0 0' }}>Monitor plays and manage redemptions</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Total Plays', value:stats.total, color:'#8b5cf6' },
          { label:'Pending Action', value:stats.pending, color:'#f59e0b' },
          { label:'Completed', value:stats.completed, color:'#22c55e' },
          { label:'Rejected', value:stats.rejected, color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
            borderRadius:16, padding:'20px', textAlign:'center',
            boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize:32, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:'rgba(167,139,250,0.5)', marginTop:4, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Code Search */}
      <div style={{
        background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
        borderRadius:16, padding:'24px', marginBottom:28,
        boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontSize:16, fontWeight:700, margin:'0 0 4px', color:'#c084fc' }}>Find by Code</h2>
        <p style={{ fontSize:13, color:'rgba(167,139,250,0.4)', margin:'0 0 16px' }}>Enter a player's 6-digit code to find and manage their redemption</p>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <input className="bo-input" type="text" maxLength={6} value={passkey}
            onChange={e => { setPasskey(e.target.value.replace(/\D/g,'')); setVerifyMsg(''); setSearchResult(null) }}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="000000" autoComplete="off" />
          <button onClick={handleVerify} disabled={passkey.length !== 6}
            style={{
              padding:'12px 28px', borderRadius:12, border:'none', cursor:'pointer',
              background: passkey.length === 6 ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'rgba(255,255,255,0.05)',
              color:'#fff', fontWeight:700, fontSize:14, fontFamily:'inherit',
              boxShadow: passkey.length === 6 ? '0 4px 20px rgba(139,92,246,0.3)' : 'none',
              transition:'all 0.2s', opacity: passkey.length === 6 ? 1 : 0.3,
            }}>
            Search
          </button>
        </div>
        {verifyMsg && !searchResult && (
          <div style={{
            marginTop:12, padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600,
            background: verifyStatus === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: '1px solid ' + (verifyStatus === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'),
            color: verifyStatus === 'success' ? '#4ade80' : '#f87171',
          }}>
            {verifyMsg}
          </div>
        )}
        {searchResult && (
          <div style={{
            marginTop:16, padding:'16px', borderRadius:12,
            background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.15)',
          }}>
            <div style={{ fontWeight:700, fontSize:15, color:'#f8fafc' }}>{displayName(searchResult)}</div>
            <div style={{ fontSize:12, color:'rgba(167,139,250,0.5)', marginTop:4 }}>
              {searchResult.game_name}{displayContact(searchResult) ? ` · ${displayContact(searchResult)}` : ''}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button className="bo-btn accept" onClick={() => handleAccept(searchResult.id)}>Accept</button>
              <button className="bo-btn reject" onClick={() => handleReject(searchResult.id)}>Reject</button>
            </div>
          </div>
        )}
      </div>

      {/* Redemption History */}
      <div style={{
        background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
        borderRadius:16, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(139,92,246,0.1)' }}>
          <h2 style={{ fontSize:15, fontWeight:700, margin:0, color:'#c084fc' }}>Recent Plays</h2>
        </div>
        {notifications.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(167,139,250,0.3)', fontSize:14 }}>
            No plays yet. Wait for someone to scan your QR code and play!
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{
              display:'flex', alignItems:'center', gap:14,
              padding:'12px 20px', borderBottom:'1px solid rgba(139,92,246,0.05)',
            }}>
              <div style={{
                width:10, height:10, borderRadius:'50%', flexShrink:0,
                background: statusColor(n.status),
                boxShadow: n.status === 'pending' ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
              }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:'#f8fafc' }}>{displayName(n)}</div>
                <div style={{ fontSize:12, color:'rgba(167,139,250,0.4)', marginTop:2 }}>
                  {n.game_name}{n.location_name ? ` · ${n.location_name}` : ''}{displayContact(n) ? ` · ${displayContact(n)}` : ''}
                </div>
              </div>
              <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:8 }}>
                {canAct(n.status) && (
                  <>
                    <button className="bo-btn accept" onClick={() => handleAccept(n.id)}>Accept</button>
                    <button className="bo-btn reject" onClick={() => handleReject(n.id)}>Reject</button>
                  </>
                )}
                <div>
                  <div style={{
                    fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
                    background: statusColor(n.status) + '22',
                    color: statusColor(n.status),
                  }}>
                    {statusLabel(n.status)}
                  </div>
                  {n.code && (
                    <div style={{ fontSize:10, color:'rgba(167,139,250,0.3)', marginTop:3 }}>
                      Code: {n.code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
