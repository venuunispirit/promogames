import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const CATEGORY_META = {
  quiz:   { label:'Quiz',   bg:' #EEF2FF', fg:' #4338CA', dot:' #818CF8' },
  survey: { label:'Survey', bg:' #F0FDF4', fg:' #15803D', dot:' #4ADE80' },
  poll:   { label:'Poll',   bg:' #FFF7ED', fg:' #C2410C', dot:' #FB923C' },
  crossword: {
    label:'Crossword',
    bg:' #FDF2F8',
    fg:' #BE185D',
    dot:' #EC4899'
  },
  spin: {
    label:'Spin Wheel',
    bg:' #FFFBEB',
    fg:' #B45309',
    dot:' #F59E0B'
  },
}
const catMeta = (cat) => CATEGORY_META[cat] || { label: cat, bg:' #F3F4F6', fg:' #374151', dot:' #9CA3AF' }

const CSS = `
@import url('${FONT_URL}');
.gp *,.gp *::before,.gp *::after{box-sizing:border-box;margin:0;padding:0}
.gp{font-family:'DM Sans',sans-serif;color: #111827;background: #F8F9FB;min-height:100vh}
@keyframes gpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gpModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes gpToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes gpSpin{to{transform:rotate(360deg)}}
@keyframes gpPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes gpRowIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* Inputs & selects */
.gp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid  #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color: #111;background: #FAFAFA;outline:none;transition:border-color .15s,background .15s}
.gp-input:focus{border-color: #818CF8;background: #fff}
.gp-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid  #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color: #111;background: #FAFAFA;outline:none;appearance:none;cursor:pointer;transition:border-color .15s}
.gp-select:focus{border-color: #818CF8}
.gp-label{display:block;font-size:10.5px;font-weight:700;color: #9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.gp-field{margin-bottom:16px}

/* Buttons */
.gp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background: #18181B;color: #fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.gp-primary-btn:hover{background: #27272A}
.gp-primary-btn:active{transform:scale(.98)}
.gp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.gp-ghost-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1.5px solid  #E5E7EB;background: #fff;color: #374151;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.gp-ghost-btn:hover{background: #F3F4F6;border-color: #D1D5DB}
.gp-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid  #E5E7EB;background: #F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color: #374151;transition:background .13s;flex-shrink:0}
.gp-icon-btn:hover{background: #F0F0F0}
.gp-icon-btn.del{border-color: #FEE2E2;background: #FFF5F5;color: #DC2626}
.gp-icon-btn.del:hover{background: #FEE2E2}

/* Toggle */
.gp-toggle{width:34px;height:20px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;padding:0}
.gp-toggle::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background: #fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.gp-toggle.on{background: #4F46E5}
.gp-toggle.on::after{transform:translateX(14px)}
.gp-toggle.off{background: #D1D5DB}

/* Table */
.gp-table-wrap{background: #fff;border-radius:16px;border:1.5px solid  #EAECF0;overflow:hidden;animation:gpFadeUp .3s ease both}
.gp-table{width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif}
.gp-table thead tr{background: #F9FAFB;border-bottom:1.5px solid  #EAECF0}
.gp-table thead th{padding:11px 14px;text-align:center;font-size:11px;font-weight:700;color: #6B7280;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;user-select:none}
.gp-table tbody tr{border-bottom:1px solid  #F3F4F6;transition:background .13s;animation:gpRowIn .25s ease both}
.gp-table tbody tr:last-child{border-bottom:none}
.gp-table tbody tr:hover{background: #FAFBFF}
.gp-table tbody tr.inactive-row{opacity:.7}
.gp-table tbody td{padding:13px 14px;font-size:13px;color: #374151;vertical-align:middle;text-align:center}

/* Sort caret */
.gp-th-btn{background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color: #6B7280;text-transform:uppercase;letter-spacing:.08em;padding:0;font-family:'DM Sans',sans-serif}
.gp-th-btn:hover{color: #374151}

/* Tooltip toggle label */
.gp-toggle-wrap{display:flex;flex-direction:column;align-items:center;gap:3px}
.gp-toggle-label{font-size:10px;color: #9CA3AF;font-weight:500;white-space:nowrap}
`

const Ico = {
  plus:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  close:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  search:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  wrench:   () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  chart:    () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  link:     () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  trash:    () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  question: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  play:     () => <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  spin:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'gpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  globe:    () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  star:     () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  caretUp:  () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>,
  caretDn:  () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>,
  copy:     () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  qr:       () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="4" height="4"/><line x1="3" y1="18" x2="3" y2="21"/><line x1="7" y1="21" x2="7" y2="21"/><line x1="18" y1="14" x2="21" y2="14"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="18" y2="21"/><line x1="14" y1="21" x2="14" y2="21"/></svg>,
  download: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background: ok ? ' #052E16' : ' #450A0A', color:' #fff',
      padding:'13px 20px 13px 16px',borderRadius:12,fontSize:13.5,
      fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok?' #22C55E':' #EF4444'}`,
      animation:'gpToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:420,
    }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

// Inline toggle that calls API immediately
function FieldToggle({ gameId, field, value, label, onUpdated, onError }) {
  const [loading, setLoading] = useState(false)
  const toggle = async e => {
    e.stopPropagation()
    setLoading(true)
    try {
      await api.put(`/games/${gameId}`, { [field]: value ? 0 : 1 })
      onUpdated()
    } catch { onError('Failed to update') }
    finally { setLoading(false) }
  }
  return (
    <div className="gp-toggle-wrap">
      <button
        className={`gp-toggle ${value ? 'on' : 'off'}`}
        onClick={toggle}
        disabled={loading}
        title={`${value ? 'Disable' : 'Enable'} ${label}`}
        style={loading ? { opacity: 0.5 } : {}}
      />
      <span className="gp-toggle-label">{value ? 'On' : 'Off'}</span>
    </div>
  )
}

function QRCodeModal({ game, onClose, onError }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const host = typeof window !== 'undefined' ? window.location.origin : ''
  const link = `${host}/play/${game.slug}/${game.client_slug}`

  useEffect(() => {
    QRCode.toDataURL(link, {
      width: 260,
      margin: 2,
      color: { dark:'#0D0D1A', light:'#FFFFFF' }
    }).then(setQrDataUrl).catch(() => onError('Failed to generate QR'))
  }, [])

  const handleCopyQr = async () => {
    try {
      const res = await fetch(qrDataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch { onError('Failed to copy QR image') }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = game.name.replace(/ /g, '-') + '-qr.png'
    a.click()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{position:'relative',background:' #fff',borderRadius:24,width:'100%',maxWidth:400,padding:'34px 28px 28px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif",textAlign:'center'}}>
        <button className="gp-icon-btn" onClick={onClose} style={{position:'absolute',top:14,right:14}}><Ico.close/></button>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:22}}>
          <img src="/favicon3.png" alt="" style={{width:30,height:30,borderRadius:8,objectFit:'cover'}} onError={e=>{e.target.style.display='none'}} />
          <span style={{fontSize:15,fontWeight:700,color:' #0D0D1A',letterSpacing:'-0.01em'}}>{game.company_name}</span>
        </div>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code" style={{width:200,height:200,borderRadius:16,margin:'0 auto 20px',display:'block',padding:12,background:' #FAFAFA',border:'1px solid  #EAECF0'}} />
        ) : (
          <div style={{width:200,height:200,borderRadius:16,margin:'0 auto 20px',background:' #F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',color:' #9CA3AF'}}><Ico.spin/></div>
        )}
        <p style={{fontSize:13.5,fontWeight:600,color:' #0D0D1A',marginBottom:4}}>{game.name}</p>
        <p style={{fontSize:12,color:' #9CA3AF',marginBottom:24,wordBreak:'break-all'}}>{link}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button className="gp-primary-btn" onClick={handleCopyQr} disabled={!qrDataUrl} style={{justifyContent:'center',padding:'11px 0',borderRadius:10,fontSize:13.5}}><Ico.copy/> Copy QR Image</button>
          <button className="gp-ghost-btn" onClick={handleCopyLink} style={{justifyContent:'center',padding:'10px 0',borderRadius:10,fontSize:13}}><Ico.link/> Copy Game Link</button>
          <button className="gp-ghost-btn" onClick={handleDownload} disabled={!qrDataUrl} style={{justifyContent:'center',padding:'10px 0',borderRadius:10,fontSize:13}}><Ico.download/> Download QR</button>
        </div>
      </div>
    </div>
  )
}

function QuickAddClientModal({ onClose, onCreated, onError }) {
  const [form, setForm] = useState({company_name:'',contact_name:'',email:'',phone:''})
  const [submitting, setSubmitting] = useState(false)
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.company_name) return
    setSubmitting(true)
    try {
      const res = await api.post('/clients', form)
      onCreated(res.data.client)
      onClose()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to create client')
      setSubmitting(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:700,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:' #fff',borderRadius:20,width:'100%',maxWidth:480,padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:' #0D0D1A',letterSpacing:'-0.02em'}}>Add Client</h2>
            <p style={{color:' #9CA3AF',fontSize:13,marginTop:4}}>Create a client to associate this game with.</p>
          </div>
          <button className="gp-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="gp-field">
            <label className="gp-label">Company Name <span style={{color:' #EF4444'}}>*</span></label>
            <input className="gp-input" value={form.company_name} onChange={set('company_name')} placeholder="e.g. Acme Corp" required />
          </div>
          <div className="gp-field">
            <label className="gp-label">Contact Name</label>
            <input className="gp-input" value={form.contact_name} onChange={set('contact_name')} placeholder="Full name" />
          </div>
          <div className="gp-field">
            <label className="gp-label">Email</label>
            <input className="gp-input" type="email" value={form.email} onChange={set('email')} placeholder="contact@acme.com" />
          </div>
          <div className="gp-field" style={{marginBottom:26}}>
            <label className="gp-label">Phone</label>
            <input className="gp-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="button" className="gp-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center',padding:'11px 0'}}>Cancel</button>
            <button type="submit" className="gp-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Adding…</> : 'Add Client & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateModal({ clients, onClose, onCreated, onError, onAddClient }) {
  const [form, setForm] = useState({client_id:'',name:'',category:'quiz',description:'',redirect_url:''})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

const handleSubmit = async e => {
  e.preventDefault()
  setSubmitting(true)

  try {
    const res = await api.post('/games', form)

    const game = res.data.game

    onCreated()
    onClose()

    if (game.category === 'crossword') {
      navigate(`/dashboard/games/${game.id}/crossword-builder`)
    } else if (game.category === 'spin') {
      navigate(`/dashboard/games/${game.id}/spin-builder`)
    } else {
      navigate(`/dashboard/games/${game.id}/builder`)
    }

  } catch (err) {
    onError(err.response?.data?.message || 'Error creating game')
    setSubmitting(false)
  }
}

  return (
    <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:' #fff',borderRadius:20,width:'100%',maxWidth:640,maxHeight:'95vh',overflow:'visible',padding:'36px 34px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:24,color:' #0D0D1A',letterSpacing:'-0.02em'}}>New Game</h2>
            <p style={{color:' #9CA3AF',fontSize:14,marginTop:5}}>Configure the game — you'll build questions next.</p>
          </div>
          <button className="gp-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="gp-field">
            <label className="gp-label">Client <span style={{color:' #EF4444'}}>*</span></label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{position:'relative',flex:1}}>
                <select className="gp-select" value={form.client_id} onChange={set('client_id')} required style={{padding:'10px 36px 10px 14px',fontSize:14,background:' #fff'}}>
                  <option value="">Select a client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
                <svg style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:' #9CA3AF'}} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <button type="button" className="gp-ghost-btn" onClick={onAddClient} style={{padding:'10px 14px',whiteSpace:'nowrap',fontSize:13}}>
                + Add Client
              </button>
            </div>
          </div>

          <div className="gp-field">
            <label className="gp-label">Game Name <span style={{color:' #EF4444'}}>*</span></label>
            <input className="gp-input" value={form.name} onChange={set('name')} placeholder="e.g. Product Knowledge Quiz" required style={{fontSize:14}} />
          </div>

          <div className="gp-field">
            <label className="gp-label">Category</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {Object.entries(CATEGORY_META).map(([k,v]) => (
                <button key={k} type="button"
                  onClick={() => setForm(f=>({...f,category:k}))}
                  style={{
                    padding:'14px 10px',borderRadius:12,border:`2px solid ${form.category===k ? v.dot : ' #E5E7EB'}`,
                    background: form.category===k ? v.bg : ' #FAFAFA',
                    cursor:'pointer',transition:'all .14s',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                  }}>
                  <span style={{width:10,height:10,borderRadius:'50%',background:v.dot}} />
                  <span style={{fontSize:14,fontWeight:600,color:form.category===k?v.fg:' #374151',fontFamily:"'DM Sans',sans-serif"}}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="gp-field">
            <label className="gp-label">Description</label>
            <textarea className="gp-input" rows={3} value={form.description} onChange={set('description')} style={{resize:'vertical',fontSize:14}} />
          </div>

          <div className="gp-field" style={{marginBottom:26}}>
            <label className="gp-label">Redirect URL <span style={{color:' #9CA3AF',fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:11}}>(after game ends)</span></label>
            <input className="gp-input" type="url" value={form.redirect_url} onChange={set('redirect_url')} placeholder="https://yoursite.com/thankyou" style={{fontSize:14}} />
          </div>

          <div style={{display:'flex',gap:10}}>
            <button type="button" className="gp-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center',padding:'11px 0',fontSize:14}}>Cancel</button>
            <button type="submit" className="gp-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Creating…</> : 'Create & Open Builder →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Column definitions — order here = order in table
const COLUMNS = [
  { key:'name',         label:'Game',          sortable:true  },
  { key:'category',     label:'Category',      sortable:false },
  { key:'qty_plays',    label:'Qty / Plays',   sortable:false, center:true },
  { key:'is_active',    label:'Active',        sortable:false, center:true },
  { key:'show_in_play_page', label:'Play Page', sortable:false, center:true },
  { key:'show_in_hero_page', label:'Hero',     sortable:false, center:true },
  { key:'game_type',    label:'Game Type',     sortable:false, center:true },
  { key:'created_edited', label:'Created / Edited', sortable:false },
  { key:'actions',      label:'Actions',       sortable:false, center:true },
  { key:'qr',           label:'QR',            sortable:false, center:true },
]

function SortTh({ col, sortKey, sortDir, onSort }) {
  const active = sortKey === col.key
  return (
    <th className={col.center ? 'center' : ''}>
      {col.sortable ? (
        <button className="gp-th-btn" onClick={() => onSort(col.key)}
          style={active ? {color:' #4338CA'} : {}}>
          {col.label}
          <span style={{color: active ? ' #4338CA' : ' #D1D5DB', marginLeft:2}}>
            {active && sortDir === 'asc' ? <Ico.caretUp/> : <Ico.caretDn/>}
          </span>
        </button>
      ) : (
        <span style={{fontSize:11,fontWeight:700,color:' #6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>
          {col.label}
        </span>
      )}
    </th>
  )
}

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [qrModalGame, setQrModalGame] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const navigate = useNavigate()

  const load = () =>
    Promise.all([api.get('/games'), api.get('/clients')])
      .then(([gr,cr]) => { setGames(gr.data.games||[]); setClients(cr.data.clients||[]) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const showToast = (msg, type='success') => setToast({msg, type})

  const handleDelete = async id => {
    if (!confirm('Delete this game and all its questions, images and sounds?')) return
    try { await api.delete(`/games/${id}`); showToast('Game deleted'); load() }
    catch { showToast('Delete failed','error') }
  }

  const toggleField = async (game, field) => {
    try {
      await api.put(`/games/${game.id}`, { [field]: game[field] ? 0 : 1 })
      load()
    } catch { showToast('Failed to update','error') }
  }

  const handleDuplicate = async id => {
    try {
      await api.post(`/games/${id}/duplicate`)
      showToast('Game duplicated')
      load()
    } catch { showToast('Duplicate failed','error') }
  }

  const handleGameTypeToggle = async (game, e) => {
    e.stopPropagation()
    const newType = game.game_type === 'branded' ? 'promogames' : 'branded'
    try {
      await api.put(`/games/${game.id}`, { game_type: newType })
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update game type','error')
    }
  }

  const copyLink = (game, e) => {
    e.stopPropagation()
    const link = `${window.location.origin}/play/${game.slug}/${game.client_slug}`
    navigator.clipboard.writeText(link)
    if (!game.is_active) showToast('Link copied — game is currently inactive.','error')
    else showToast('Game link copied!')
  }

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // Filter
  const filtered = games.filter(g => {
    const matchSearch = !search || [g.name, g.company_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat === 'all' || g.category === filterCat
    return matchSearch && matchCat
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'created_at') { av = new Date(av); bv = new Date(bv) }
    else if (typeof av === 'string') { av = av?.toLowerCase() || ''; bv = bv?.toLowerCase() || '' }
    else { av = av ?? 0; bv = bv ?? 0 }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const stats = {
    total: games.length,
    active: games.filter(g => g.is_active).length,
    plays: games.reduce((a,g) => a + (g.play_count||0), 0),
    onPlayPage: games.filter(g => g.show_in_play_page).length,
    onHero: games.filter(g => g.show_in_hero_page).length,
    branded: games.filter(g => g.game_type === 'branded').length,
    promogames: games.filter(g => g.game_type === 'promogames').length,
  }

  const fmtDate = dt => {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})
  }

  return (
    <div className="gp">
      <style>{CSS}</style>
      <div style={{padding:'36px 40px',maxWidth:1400,margin:'0 auto'}}>

        {/* Header — 3-col: Title | Search | Add Game */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr 1fr',alignItems:'center',marginBottom:28,gap:16}}>
          <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:' #0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
            Games
          </h1>
          {games.length > 0 && (
            <div style={{position:'relative'}}>
              <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:' #9CA3AF'}}><Ico.search/></span>
              <input className="gp-input" style={{paddingLeft:40,height:38,padding:'0 14px 0 40px',width:'100%'}} placeholder="Search games or client…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          )}
          <div style={{justifySelf:'end'}}>
            <button className="gp-primary-btn" onClick={() => setShowForm(true)}><Ico.plus/> Create Game</button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:' #9CA3AF',fontSize:14}}>
            <Ico.spin/> Loading games…
          </div>
        ) : games.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:' #F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="30" height="30" fill="none" stroke=" #6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:' #0D0D1A',marginBottom:8}}>No games yet</h3>
            <p style={{color:' #9CA3AF',fontSize:14,marginBottom:24}}>Create your first game to get started.</p>
            <button className="gp-primary-btn" onClick={()=>setShowForm(true)}><Ico.plus/> Create Game</button>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:' #9CA3AF',fontSize:14}}>
            No games match your filters.
          </div>
        ) : (
          <>
          <div className="gp-table-wrap" style={{overflowX:'auto'}}>
            <table className="gp-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <SortTh key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((game, i) => {
                  const cat = catMeta(game.category)
                  return (
                    <tr
                      key={game.id}
                      className={game.is_active ? '' : 'inactive-row'}
                      style={{animationDelay:`${i*30}ms`, cursor:'pointer'}}
                      onClick={() => navigate(`/dashboard/games/${game.id}/responses`)}
                    >
                      {/* Game + Client */}
                      <td style={{minWidth:160}}>
                        <div style={{fontWeight:600,color:' #0D0D1A',fontSize:13.5,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>
                          {game.name}
                        </div>
                        <div style={{fontSize:11.5,color:' #6B7280',fontWeight:500}}>
                          {game.company_name || '—'}
                        </div>
                      </td>
                      {/* Category */}
                      <td style={{minWidth:90}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,background:cat.bg,color:cat.fg,fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:100,letterSpacing:'.01em'}}>
                          <span style={{width:5,height:5,borderRadius:'50%',background:cat.dot,flexShrink:0}} />
                          {cat.label}
                        </span>
                      </td>

                      {/* Qty / Plays */}
                      <td className="center" style={{minWidth:90}}>
                        <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,fontSize:12,color:' #374151'}}>
                          <span style={{display:'flex',alignItems:'center',gap:4,fontWeight:600}}><Ico.question/> {game.question_count||0}</span>
                          <span style={{display:'flex',alignItems:'center',gap:4,color:' #6B7280'}}><Ico.play/> {(game.play_count||0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Active toggle */}
                      <td className="center" style={{minWidth:72}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.is_active ? 'on' : 'off'}`}
                            title={game.is_active ? 'Deactivate game' : 'Activate game'}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'is_active') }}
                          />
                          <span className="gp-toggle-label">{game.is_active ? 'On' : 'Off'}</span>
                        </div>
                      </td>

                      {/* Show in Play Page */}
                      <td className="center" style={{minWidth:80}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.show_in_play_page ? 'on' : 'off'}`}
                            title={game.show_in_play_page ? 'Remove from play page' : 'Show on play page'}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'show_in_play_page') }}
                          />
                          <span className="gp-toggle-label">{game.show_in_play_page ? 'On' : 'Off'}</span>
                        </div>
                      </td>

                      {/* Show in Hero Page */}
                      <td className="center" style={{minWidth:80}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.show_in_hero_page ? 'on' : 'off'}`}
                            title={game.show_in_hero_page ? 'Remove from hero' : 'Feature on homepage hero'}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'show_in_hero_page') }}
                          />
                          <span className="gp-toggle-label">{game.show_in_hero_page ? 'On' : 'Off'}</span>
                        </div>
                      </td>

                      {/* Game Type */}
                      <td className="center" style={{minWidth:90}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.game_type === 'branded' ? 'on' : 'off'}`}
                            onClick={e => handleGameTypeToggle(game, e)}
                          />
                          <span className="gp-toggle-label">
                            {game.game_type === 'branded' ? 'Branded' : 'PromoGames'}
                          </span>
                        </div>
                      </td>

                      {/* Created / Edited */}
                      <td style={{minWidth:130,fontSize:11.5,color:' #9CA3AF',whiteSpace:'nowrap'}}>
                        <div>Created {fmtDate(game.created_at)}</div>
                        {game.updated_at && new Date(game.updated_at).getTime() !== new Date(game.created_at).getTime() && (
                          <div style={{color:' #6B7280',marginTop:2}}>
                            Edited {fmtDate(game.updated_at)}
                            {game.updated_by_name && <span> by {game.updated_by_name}</span>}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="center" style={{minWidth:100}} onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); handleDuplicate(game.id) }} title="Duplicate">
                              <Ico.copy/>
                            </button>
                            <button className="gp-ghost-btn" style={{background:' #18181B',color:' #fff',borderColor:' #18181B',padding:'4px 10px',justifyContent:'center',fontSize:10.5,gap:3}}
                              onClick={() => {
                                if (game.category === 'crossword') navigate(`/dashboard/games/${game.id}/crossword-builder`)
                                else if (game.category === 'spin') navigate(`/dashboard/games/${game.id}/spin-builder`)
                                else navigate(`/dashboard/games/${game.id}/builder`)
                              }} title="Builder">
                              <Ico.wrench/> Builder
                            </button>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <button className="gp-icon-btn" onClick={() => navigate(`/dashboard/games/${game.id}/responses`)} title="Responses">
                              <Ico.chart/>
                            </button>
                            <button className="gp-icon-btn" onClick={e => copyLink(game, e)} title="Copy link">
                              <Ico.link/>
                            </button>
                            <button className="gp-icon-btn del" onClick={e => { e.stopPropagation(); handleDelete(game.id) }} title="Delete">
                              <Ico.trash/>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* QR */}
                      <td className="center" style={{minWidth:50}} onClick={e => e.stopPropagation()}>
                        <button className="gp-icon-btn" onClick={() => setQrModalGame(game)} title="Show QR Code">
                          <Ico.qr/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Table footer */}
            <div style={{padding:'12px 16px',borderTop:'1px solid  #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between',background:' #FAFAFA'}}>
              <span style={{fontSize:12,color:' #9CA3AF'}}>
                Showing {sorted.length} of {games.length} game{games.length!==1?'s':''}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:16,marginTop:20}}>
            {[
              { label:'Active Games', value: stats.active, color:' #4F46E5' },
              { label:'On Play Page', value: stats.onPlayPage, color:' #059669' },
              { label:'On Hero', value: stats.onHero, color:' #D97706' },
              { label:'Total Plays', value: stats.plays.toLocaleString(), color:' #0D0D1A' },
              { label:'Branded', value: stats.branded, color:' #15803D' },
              { label:'PromoGames', value: stats.promogames, color:' #B45309' },
            ].map(s => (
              <div key={s.label} style={{background:' #fff',borderRadius:12,border:'1.5px solid  #EAECF0',padding:'16px 20px'}}>
                <div style={{fontSize:11,fontWeight:700,color:' #9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"'Fraunces',serif"}}>{s.value}</div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {showForm && !showClientForm && (
        <CreateModal
          clients={clients}
          onClose={() => setShowForm(false)}
          onCreated={load}
          onError={msg => showToast(msg,'error')}
          onAddClient={() => setShowClientForm(true)}
        />
      )}
      {showClientForm && (
        <QuickAddClientModal
          onClose={() => setShowClientForm(false)}
          onCreated={client => {
            setShowClientForm(false)
            setClients(prev => [client, ...prev])
          }}
          onError={msg => showToast(msg,'error')}
        />
      )}
      {qrModalGame && (
        <QRCodeModal game={qrModalGame} onClose={() => setQrModalGame(null)} onError={msg => showToast(msg,'error')} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}