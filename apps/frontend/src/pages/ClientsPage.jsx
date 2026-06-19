import { useState, useEffect } from 'react'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const AVATAR_PALETTE = [
  { bg: '#EEF2FF', fg: '#4338CA' }, { bg: '#F0FDF4', fg: '#15803D' },
  { bg: '#FFF7ED', fg: '#C2410C' }, { bg: '#FDF4FF', fg: '#9333EA' },
  { bg: '#ECFDF5', fg: '#0F766E' }, { bg: '#FEF2F2', fg: '#DC2626' },
]
const avatarColor = (name = '') => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
const initials = (name = '') => name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

const CSS = `
@import url('${FONT_URL}');
.cp *,.cp *::before,.cp *::after{box-sizing:border-box;margin:0;padding:0}
.cp{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes cpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes cpSlideIn{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
@keyframes cpModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes cpToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes cpSpin{to{transform:rotate(360deg)}}
.cp-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;padding:22px 22px 18px;cursor:pointer;transition:border-color .18s,box-shadow .18s,transform .18s;animation:cpFadeUp .3s ease both}
.cp-card:hover{border-color:#A5B4FC;box-shadow:0 6px 28px rgba(99,102,241,.1);transform:translateY(-2px)}
.cp-card:hover .cp-actions{opacity:1}
.cp-actions{opacity:0;transition:opacity .15s;display:flex;gap:5px}
.cp-icon-btn{width:30px;height:30px;border-radius:8px;border:1px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s,border-color .13s}
.cp-icon-btn:hover{background:#EDEDF0;border-color:#D1D5DB}
.cp-icon-btn.del{border-color:#FEE2E2;background:#FFF5F5;color:#DC2626}
.cp-icon-btn.del:hover{background:#FEE2E2}
.cp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s,background .15s}
.cp-input:focus{border-color:#818CF8;background:#fff}
.cp-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.cp-field{margin-bottom:16px}
.cp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.cp-primary-btn:hover{background:#27272A}
.cp-primary-btn:active{transform:scale(.98)}
.cp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.cp-ghost-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s}
.cp-ghost-btn:hover{background:#F3F4F6}
`

const Ico = {
  mail: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  phone: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.59 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  edit: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  arrow: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  close: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  game: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>,
  spin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'cpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background: ok ? '#052E16' : '#450A0A',
      color:'#fff',padding:'13px 20px 13px 16px',borderRadius:12,
      fontSize:13.5,fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok ? '#22C55E' : '#EF4444'}`,
      animation:'cpToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:380,
    }}>
      {ok ? '✓' : '✕'} {msg}
    </div>
  )
}

function Avatar({ name, logo, size = 46 }) {
  const c = avatarColor(name)
  if (logo) return <img src={logo} alt="" style={{width:size,height:size,borderRadius:10,objectFit:'cover',flexShrink:0}} />
  return (
    <div style={{width:size,height:size,borderRadius:10,flexShrink:0,background:c.bg,color:c.fg,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*.32,fontWeight:700,letterSpacing:'0.03em',fontFamily:"'DM Sans',sans-serif"}}>
      {initials(name)}
    </div>
  )
}

function ClientCard({ client, onClick, onEdit, onDelete, delay }) {
  return (
    <div className="cp-card" style={{animationDelay:`${delay}ms`}} onClick={() => onClick(client)}>
      <div style={{display:'flex',alignItems:'flex-start',gap:13,marginBottom:14}}>
        <Avatar name={client.company_name} logo={client.logo_url} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:15,color:'#0D0D1A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',letterSpacing:'-0.015em'}}>
            {client.company_name}
          </div>
          {client.contact_name && <div style={{fontSize:12.5,color:'#6B7280',marginTop:3}}>{client.contact_name}</div>}
        </div>
        <div className="cp-actions" onClick={e => e.stopPropagation()}>
          <button className="cp-icon-btn" title="Edit" onClick={() => onEdit(client)}><Ico.edit/></button>
          <button className="cp-icon-btn del" title="Delete" onClick={() => onDelete(client.id)}><Ico.trash/></button>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:16}}>
        {client.email && <div style={{display:'flex',alignItems:'center',gap:7,color:'#6B7280',fontSize:12.5}}><span style={{color:'#9CA3AF'}}><Ico.mail/></span><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{client.email}</span></div>}
        {client.phone && <div style={{display:'flex',alignItems:'center',gap:7,color:'#6B7280',fontSize:12.5}}><span style={{color:'#9CA3AF'}}><Ico.phone/></span>{client.phone}</div>}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:14,borderTop:'1px solid #F3F4F6'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:5,background:'#EEF2FF',color:'#4338CA',fontSize:11.5,fontWeight:600,padding:'4px 10px',borderRadius:100}}>
          <Ico.game/> {client.game_count||0} {client.game_count===1?'game':'games'}
        </span>
        <span style={{fontSize:12,color:'#9CA3AF',display:'flex',alignItems:'center',gap:4}}>View <Ico.arrow/></span>
      </div>
    </div>
  )
}

function DetailPanel({ client, onClose, onEdit }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(8,8,18,.38)',backdropFilter:'blur(3px)'}} />
      <div style={{
        position:'relative',width:400,height:'100%',background:'#fff',
        boxShadow:'-16px 0 56px rgba(0,0,0,.14)',padding:'36px 30px',
        overflow:'auto',zIndex:1,animation:'cpSlideIn .24s cubic-bezier(.22,1,.36,1)',
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <button className="cp-icon-btn" style={{position:'absolute',top:20,right:20}} onClick={onClose}><Ico.close/></button>
        <Avatar name={client.company_name} logo={client.logo_url} size={56} />
        <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:24,color:'#0D0D1A',margin:'16px 0 4px',letterSpacing:'-0.025em',lineHeight:1.2}}>
          {client.company_name}
        </h2>
        {client.contact_name && <p style={{color:'#6B7280',fontSize:13.5,marginTop:4}}>{client.contact_name}</p>}
        <div style={{margin:'24px 0',background:'#F5F3FF',borderRadius:12,padding:'16px 20px'}}>
          <div style={{fontSize:28,fontWeight:700,color:'#4F46E5',letterSpacing:'-0.04em'}}>{client.game_count||0}</div>
          <div style={{fontSize:11,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.08em',marginTop:3}}>Total Games</div>
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          {[{icon:<Ico.mail/>,label:'Email',val:client.email},{icon:<Ico.phone/>,label:'Phone',val:client.phone},{icon:null,label:'Address',val:client.address},{icon:null,label:'Notes',val:client.notes}]
            .filter(r=>r.val).map((row,i) => (
            <div key={i} style={{padding:'14px 0',borderBottom:'1px solid #F3F4F6',display:'flex',gap:14,alignItems:'flex-start'}}>
              <span style={{color:'#9CA3AF',marginTop:1,flexShrink:0}}>{row.icon}</span>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{row.label}</div>
                <div style={{fontSize:13.5,color:'#1F2937'}}>{row.val}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="cp-primary-btn" onClick={() => onEdit(client)} style={{width:'100%',justifyContent:'center',marginTop:28,padding:'13px 0',borderRadius:12,fontSize:14}}>
          <Ico.edit/> Edit Client
        </button>
      </div>
    </div>
  )
}

function FormModal({ editClient, onClose, onSaved, onError }) {
  const blank = {company_name:'',contact_name:'',email:'',phone:'',address:'',notes:''}
  const [form, setForm] = useState(editClient ? {
    company_name:editClient.company_name,contact_name:editClient.contact_name||'',
    email:editClient.email||'',phone:editClient.phone||'',
    address:editClient.address||'',notes:editClient.notes||''
  } : blank)
  const [submitting, setSubmitting] = useState(false)
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true)
    try {
      if (editClient) { await api.put(`/clients/${editClient.id}`,form); onSaved('Client updated') }
      else { await api.post('/clients',form); onSaved('Client added') }
      onClose()
    } catch(err) { onError(err.response?.data?.message||'Something went wrong') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:520,maxHeight:'92vh',overflow:'auto',padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'cpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:22,color:'#0D0D1A',letterSpacing:'-0.02em'}}>
              {editClient ? 'Edit Client' : 'New Client'}
            </h2>
            <p style={{color:'#9CA3AF',fontSize:13,marginTop:5}}>{editClient ? 'Update the client record below.' : 'Fill in the details to add a new client.'}</p>
          </div>
          <button className="cp-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
            <div className="cp-field">
              <label className="cp-label">Company Name <span style={{color:'#EF4444'}}>*</span></label>
              <input className="cp-input" value={form.company_name} onChange={set('company_name')} required />
            </div>
            <div className="cp-field">
              <label className="cp-label">Contact Name</label>
              <input className="cp-input" value={form.contact_name} onChange={set('contact_name')} />
            </div>
            <div className="cp-field">
              <label className="cp-label">Email</label>
              <input className="cp-input" type="email" value={form.email} onChange={set('email')} />
            </div>
            <div className="cp-field">
              <label className="cp-label">Phone</label>
              <input className="cp-input" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="cp-field">
            <label className="cp-label">Address</label>
            <textarea className="cp-input" rows={2} value={form.address} onChange={set('address')} style={{resize:'vertical'}} />
          </div>
          <div className="cp-field" style={{marginBottom:26}}>
            <label className="cp-label">Notes</label>
            <textarea className="cp-input" rows={2} value={form.notes} onChange={set('notes')} style={{resize:'vertical'}} />
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="button" className="cp-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center'}}>Cancel</button>
            <button type="submit" className="cp-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Saving…</> : (editClient ? 'Save Changes' : 'Add Client')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const load = () => api.get('/clients').then(r => setClients(r.data.clients||[])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditClient(null); setShowForm(true) }
  const openEdit = c => { setEditClient(c); setSelected(null); setShowForm(true) }
  const handleDelete = async id => {
    if (!confirm('Delete this client and all their games?')) return
    try { await api.delete(`/clients/${id}`); setToast({msg:'Client deleted',type:'success'}); setSelected(null); load() }
    catch { setToast({msg:'Delete failed',type:'error'}) }
  }

  const filtered = clients.filter(c => !search || [c.company_name,c.contact_name,c.email].some(v=>v?.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="cp">
      <style>{CSS}</style>
      <div style={{padding:'36px 40px',maxWidth:1120,margin:'0 auto'}}>

        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Management</p>
            <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:'#0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
              Clients
            </h1>
            <p style={{fontSize:13.5,color:'#9CA3AF',marginTop:8}}>
              {clients.length} client{clients.length!==1?'s':''} in your workspace
            </p>
          </div>
          <button className="cp-primary-btn" onClick={openAdd}><Ico.plus/> Add Client</button>
        </div>

        {clients.length > 0 && (
          <div style={{position:'relative',maxWidth:360,marginBottom:28}}>
            <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF'}}><Ico.search/></span>
            <input className="cp-input" style={{paddingLeft:40}} placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        )}

        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:'#9CA3AF',fontSize:14}}>
            <Ico.spin/> Loading clients…
          </div>
        ) : clients.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="30" height="30" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No clients yet</h3>
            <p style={{color:'#9CA3AF',fontSize:14,marginBottom:24}}>Add your first client to get started.</p>
            <button className="cp-primary-btn" onClick={openAdd}><Ico.plus/> Add Client</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#9CA3AF',fontSize:14}}>
            No results for "<strong style={{color:'#374151'}}>{search}</strong>"
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16}}>
            {filtered.map((c,i) => <ClientCard key={c.id} client={c} onClick={setSelected} onEdit={openEdit} onDelete={handleDelete} delay={i*45} />)}
          </div>
        )}
      </div>

      {selected && <DetailPanel client={selected} onClose={() => setSelected(null)} onEdit={openEdit} />}
      {showForm && <FormModal editClient={editClient} onClose={() => setShowForm(false)} onSaved={msg=>{setToast({msg,type:'success'});load()}} onError={msg=>setToast({msg,type:'error'})} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}