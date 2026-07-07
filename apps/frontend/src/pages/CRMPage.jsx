import { useState, useEffect, useRef, Children } from 'react'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const STATUS_META = {
  pending:         { label:'Pending',         color:'#D97706', bg:'#FFFBEB' },
  approved:        { label:'Approved',        color:'#059669', bg:'#F0FDF4' },
  started_working: { label:'Started Working', color:'#2563EB', bg:'#EFF6FF' },
  game_creating:   { label:'Game Creating',   color:'#7C3AED', bg:'#F5F3FF' },
  testing:         { label:'Testing',         color:'#DC2626', bg:'#FEF2F2' },
  live:            { label:'Live',            color:'#059669', bg:'#F0FDF4' },
  rejected:        { label:'Rejected',        color:'#DC2626', bg:'#FEF2F2' },
}

const AVATAR_PALETTE = [
  { bg:'#EEF2FF', fg:'#4338CA' }, { bg:'#F0FDF4', fg:'#15803D' },
  { bg:'#FFF7ED', fg:'#C2410C' }, { bg:'#FDF4FF', fg:'#9333EA' },
  { bg:'#ECFDF5', fg:'#0F766E' }, { bg:'#FEF2F2', fg:'#DC2626' },
  { bg:'#F5F3FF', fg:'#7C3AED' }, { bg:'#FFFAF0', fg:'#B45309' },
]
const avatarColor = (name = '') => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
const initials = (name = '') => name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

const CSS = `
@import url('${FONT_URL}');
.crm *,.crm *::before,.crm *::after{box-sizing:border-box;margin:0;padding:0}
.crm{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes crmFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes crmSlideIn{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
@keyframes crmModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes crmToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes crmSpin{to{transform:rotate(360deg)}}
.crm-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;padding:22px 22px 18px;cursor:pointer;transition:border-color .18s,box-shadow .18s,transform .18s;animation:crmFadeUp .3s ease both}
.crm-card:hover{border-color:#A5B4FC;box-shadow:0 6px 28px rgba(99,102,241,.1);transform:translateY(-2px)}
.crm-card:hover .crm-person-actions{opacity:1}
.crm-person-actions{opacity:0;transition:opacity .15s;display:flex;gap:5px}
.crm-icon-btn{width:30px;height:30px;border-radius:8px;border:1px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s,border-color .13s}
.crm-icon-btn:hover{background:#EDEDF0;border-color:#D1D5DB}
.crm-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s,background .15s}
.crm-input:focus{border-color:#818CF8;background:#fff}
.crm-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.crm-field{margin-bottom:16px}
.crm-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.crm-primary-btn:hover{background:#27272A}
.crm-primary-btn:active{transform:scale(.98)}
.crm-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.crm-ghost-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s}
.crm-ghost-btn:hover{background:#F3F4F6}
.crm-tabs{display:flex;gap:4px;margin-bottom:28px;background:#F3F4F6;border-radius:12px;padding:4px;width:fit-content}
.crm-tab{padding:8px 20px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.crm-tab.active{background:#fff;color:#0D0D1A;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.crm-tab:not(.active){background:transparent;color:#6B7280}
.crm-tab:not(.active):hover{color:#374151}
.crm-badge{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;display:inline-block}
.crm-table-wrap{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;overflow:hidden}
.crm-table{width:100%;border-collapse:collapse}
.crm-table thead tr{background:#F9FAFB;border-bottom:1.5px solid #EAECF0}
.crm-table thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
.crm-table tbody tr{border-bottom:1px solid #F3F4F6}
.crm-table tbody tr:last-child{border-bottom:none}
.crm-table tbody td{padding:13px 14px;font-size:13px;color:#374151;vertical-align:middle}
.crm-empty-state{text-align:center;padding:80px 0}
`

const Ico = {
  mail: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  phone: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.59 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  edit: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  close: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  spin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'crmSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
}

function Avatar({ name, size = 46 }) {
  const c = avatarColor(name)
  return (
    <div style={{width:size,height:size,borderRadius:10,flexShrink:0,background:c.bg,color:c.fg,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*.32,fontWeight:700,letterSpacing:'0.03em',fontFamily:"'DM Sans',sans-serif"}}>
      {initials(name)}
    </div>
  )
}

function PersonCard({ person, tab, onSelect }) {
  const isBd = tab === 'all-bds'
  return (
    <div className="crm-card" onClick={() => onSelect?.(person)}>
      <div style={{display:'flex',alignItems:'flex-start',gap:13,marginBottom:14}}>
        <Avatar name={person.name} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:15,color:'#0D0D1A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',letterSpacing:'-0.015em'}}>
            {person.name}
          </div>
          <div style={{fontSize:12.5,color:'#6B7280',marginTop:3}}>{person.email}</div>
        </div>
        <div className="crm-person-actions" onClick={e => e.stopPropagation()}>
          {isBd && (
            <span className="crm-badge" style={{background:person.is_active?'#F0FDF4':'#FEF2F2',color:person.is_active?'#059669':'#DC2626',fontSize:11}}>
              {person.is_active ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:7,color:'#6B7280',fontSize:12.5}}>
          <span style={{color:'#9CA3AF'}}><Ico.phone/></span>
          {person.phone}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:14,borderTop:'1px solid #F3F4F6'}}>
        <span style={{fontSize:12,color:'#9CA3AF'}}>
          {new Date(person.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
        </span>
        <span style={{fontSize:12,color:'#9CA3AF',display:'flex',alignItems:'center',gap:4}}>View →</span>
      </div>
    </div>
  )
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background:ok?'#052E16':'#450A0A',
      color:'#fff',padding:'13px 20px 13px 16px',borderRadius:12,
      fontSize:13.5,fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok?'#22C55E':'#EF4444'}`,
      animation:'crmToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:380,
    }}>
      {ok ? '✓' : '✕'} {msg}
    </div>
  )
}

function MasonryGrid({ children, gap = 16, minColWidth = 290 }) {
  const ref = useRef()
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth
      setCols(Math.max(1, Math.floor((w + gap) / (minColWidth + gap))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [gap, minColWidth])

  const items = Children.toArray(children)
  const columns = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => { columns[i % cols].push(item) })

  return (
    <div ref={ref} style={{ display:'flex', gap, alignItems:'flex-start' }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap }}>
          {col}
        </div>
      ))}
    </div>
  )
}

function FormModal({ title, subtitle, fields, onSubmit, onClose, submitting, children }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:500,maxHeight:'92vh',overflow:'auto',padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'crmModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:22,color:'#0D0D1A',letterSpacing:'-0.02em'}}>{title}</h2>
            <p style={{color:'#9CA3AF',fontSize:13,marginTop:5}}>{subtitle}</p>
          </div>
          <button className="crm-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>
        <form onSubmit={onSubmit}>
          {fields.map(f => (
            <div className="crm-field" key={f.key}>
              <label className="crm-label">{f.label} {f.required && <span style={{color:'#EF4444'}}>*</span>}</label>
              {f.type === 'select' ? (
                <select className="crm-input" value={f.value} onChange={f.onChange} required={f.required} style={{appearance:'none'}}>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input className="crm-input" type={f.type||'text'} value={f.value} onChange={f.onChange} placeholder={f.placeholder} required={f.required} />
              )}
              {f.hint && <div style={{fontSize:11,color:'#9CA3AF',marginTop:4}}>{f.hint}</div>}
            </div>
          ))}
          {children}
          <div style={{display:'flex',gap:10,marginTop:6}}>
            <button type="button" className="crm-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center'}}>Cancel</button>
            <button type="submit" className="crm-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Saving…</> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CRMPage() {
  const [tab, setTab] = useState('all-bds')
  const [bds, setBds] = useState([])
  const [requests, setRequests] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(null)
  const [formFields, setFormFields] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [moduleToggle, setModuleToggle] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/bd/list'),
      api.get('/bd/requests/all'),
      api.get('/internal-team/list'),
    ]).then(([br, rr, tr]) => {
      setBds(br.data.bds || [])
      setRequests(rr.data.requests || [])
      setTeam(tr.data.members || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const resetForm = () => setFormFields({ name:'', email:'', phone:'', can_create_client:false, can_create_game:false, can_edit_game:false })

  const handleCreateBd = async e => {
    e.preventDefault()
    if (!formFields.name || !formFields.email || !formFields.phone) return
    setSubmitting(true)
    try {
      await api.post('/bd/create', formFields)
      showToast('Business Developer created!')
      setShowForm(null)
      resetForm()
      load()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create BD', 'error') }
    finally { setSubmitting(false) }
  }

  const handleCreateTeam = async e => {
    e.preventDefault()
    if (!formFields.name || !formFields.email || !formFields.phone) return
    setSubmitting(true)
    try {
      const perms = []
      if (formFields.can_create_client) perms.push('can_create_client')
      if (formFields.can_create_game) perms.push('can_create_game')
      if (formFields.can_edit_game) perms.push('can_edit_game')
      await api.post('/internal-team/create', { ...formFields, permissions: perms })
      showToast('Team member created!')
      setShowForm(null)
      resetForm()
      load()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create member', 'error') }
    finally { setSubmitting(false) }
  }

  const handleApprove = async id => {
    try { await api.put(`/bd/requests/${id}/approve`); showToast('Request approved'); load() }
    catch { showToast('Failed to approve', 'error') }
  }

  const handleUpdateStatus = async (id, status, client_id, game_id) => {
    try { await api.put(`/bd/requests/${id}/status`,{status,client_id,game_id}); showToast('Status updated'); load() }
    catch { showToast('Failed to update', 'error') }
  }

  const handleEditMember = async e => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await api.put(`/internal-team/${editingMember.id}`, editForm)
      showToast('Member updated')
      setEditingMember(null)
      setSelectedPerson(null)
      load()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update', 'error') }
    finally { setSavingEdit(false) }
  }

  const handleDeleteMember = async id => {
    if (!confirm('Delete this team member? This action cannot be undone.')) return
    try {
      await api.delete(`/internal-team/${id}`)
      showToast('Member deleted')
      setSelectedPerson(null)
      load()
    } catch { showToast('Failed to delete', 'error') }
  }

  const handleToggleModule = async (memberId, permKey, currentPerms) => {
    const perms = Array.isArray(currentPerms) ? currentPerms : []
    const updated = perms.includes(permKey) ? perms.filter(p => p !== permKey) : [...perms, permKey]
    setModuleToggle(permKey)
    try {
      await api.put(`/internal-team/${memberId}/permissions`, { permissions: updated })
      setSelectedPerson(prev => ({ ...prev, permissions: JSON.stringify(updated) }))
      load()
    } catch { showToast('Failed to update permissions', 'error') }
    finally { setModuleToggle(null) }
  }

  const openEdit = member => {
    setEditForm({ name: member.name, email: member.email, phone: member.phone })
    setEditingMember(member)
  }

  const set = k => e => setFormFields(f => ({...f, [k]: e.target.value}))
  const setEdit = k => e => setEditForm(f => ({...f, [k]: e.target.value}))

  const filteredBds = bds.filter(p => !search || [p.name,p.email,p.phone].some(v=>v?.toLowerCase().includes(search.toLowerCase())))
  const filteredTeam = team.filter(p => !search || [p.name,p.email,p.phone].some(v=>v?.toLowerCase().includes(search.toLowerCase())))
  const filteredRequests = requests.filter(r => !search || [r.bd_name,r.bd_email,r.business_name].some(v=>v?.toLowerCase().includes(search.toLowerCase())))

  const TABS = [
    { key:'all-bds',     label:`Business Developers (${bds.length})` },
    { key:'requests',    label:`BD Requests (${requests.length})` },
    { key:'team',        label:`Team (${team.length})` },
  ]

  return (
    <div className="crm">
      <style>{CSS}</style>

      <div style={{padding:'36px 40px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Administration</p>
            <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:'#0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
              CRM
            </h1>
            <p style={{fontSize:13.5,color:'#9CA3AF',marginTop:8}}>
              {bds.length} BD{bds.length!==1?'s':''} · {team.length} team member{team.length!==1?'':''} · {requests.length} request{requests.length!==1?'s':''}
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div className="crm-tabs" style={{marginBottom:0}}>
              {TABS.map(t => (
                <button key={t.key} className={`crm-tab${tab===t.key?' active':''}`} onClick={() => { setTab(t.key); setSearch('') }}>
                  {t.label}
                </button>
              ))}
            </div>
            {tab !== 'all-bds' && tab !== 'requests' && tab !== 'team' ? null : (
              <div style={{position:'relative',minWidth:200,maxWidth:260}}>
                <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF'}}><Ico.search/></span>
                <input className="crm-input" style={{paddingLeft:40}} placeholder={`Search ${tab==='all-bds'?'BD':tab==='team'?'team':'requests'}…`} value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
            )}
            <button className="crm-primary-btn" onClick={() => setShowPicker(true)}><Ico.plus/> Add New</button>
          </div>
        </div>

        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:'#9CA3AF',fontSize:14}}>
            <Ico.spin/> Loading…
          </div>
        ) : tab === 'all-bds' && (
          bds.length === 0 ? (
            <div className="crm-empty-state">
              <div style={{width:72,height:72,borderRadius:18,background:'#EEF2FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                <svg width="30" height="30" fill="none" stroke="#4338CA" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No BDs yet</h3>
              <p style={{color:'#9CA3AF',fontSize:14,marginBottom:24}}>Add your first Business Developer.</p>
              <button className="crm-primary-btn" onClick={() => { setShowForm('bd'); resetForm() }}><Ico.plus/> Add BD</button>
            </div>
          ) : filteredBds.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'#9CA3AF',fontSize:14}}>
              No results for "<strong style={{color:'#374151'}}>{search}</strong>"
            </div>
          ) : (
            <MasonryGrid gap={16} minColWidth={290}>
              {filteredBds.map((p,i) => <div key={p.id} style={{animation:`crmFadeUp .3s ease ${i*45}ms both`}}><PersonCard person={p} tab="all-bds" onSelect={setSelectedPerson} /></div>)}
            </MasonryGrid>
          )
        )}

        {tab === 'team' && (
          team.length === 0 ? (
            <div className="crm-empty-state">
              <div style={{width:72,height:72,borderRadius:18,background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                <svg width="30" height="30" fill="none" stroke="#7C3AED" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No team members yet</h3>
              <p style={{color:'#9CA3AF',fontSize:14,marginBottom:24}}>Add your first Internal Team member.</p>
              <button className="crm-primary-btn" onClick={() => { setShowForm('team'); resetForm() }}><Ico.plus/> Add Team</button>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'#9CA3AF',fontSize:14}}>
              No results for "<strong style={{color:'#374151'}}>{search}</strong>"
            </div>
          ) : (
            <MasonryGrid gap={16} minColWidth={290}>
              {filteredTeam.map((p,i) => <div key={p.id} style={{animation:`crmFadeUp .3s ease ${i*45}ms both`}}><PersonCard person={p} tab="team" /></div>)}
            </MasonryGrid>
          )
        )}

        {tab === 'requests' && (
          requests.length === 0 ? (
            <div className="crm-empty-state">
              <div style={{width:72,height:72,borderRadius:18,background:'#FFF7ED',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                <svg width="30" height="30" fill="none" stroke="#C2410C" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No requests yet</h3>
              <p style={{color:'#9CA3AF',fontSize:14,marginBottom:24}}>Requests from BDs will appear here.</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'#9CA3AF',fontSize:14}}>
              No results for "<strong style={{color:'#374151'}}>{search}</strong>"
            </div>
          ) : (
            <div className="crm-table-wrap" style={{overflowX:'auto'}}>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>BD</th>
                    <th>Business</th>
                    <th>Module</th>
                    <th>Links</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => {
                    const sm = STATUS_META[r.status] || STATUS_META.pending
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <Avatar name={r.bd_name||'?'} size={32} />
                            <div>
                              <div style={{fontWeight:600,fontSize:13}}>{r.bd_name}</div>
                              <div style={{fontSize:11,color:'#9CA3AF'}}>{r.bd_email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{fontWeight:600}}>{r.business_name}</td>
                        <td style={{textTransform:'capitalize',fontSize:12}}>{r.game_category}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            {r.gmaps_url && <a href={r.gmaps_url} target="_blank" rel="noreferrer" className="crm-ghost-btn" style={{textDecoration:'none',padding:'4px 10px',fontSize:11}}>🗺 Maps</a>}
                            {r.social_url && <a href={r.social_url} target="_blank" rel="noreferrer" className="crm-ghost-btn" style={{textDecoration:'none',padding:'4px 10px',fontSize:11}}>🔗 Social</a>}
                          </div>
                        </td>
                        <td>
                          <span className="crm-badge" style={{background:sm.bg,color:sm.color}}>{sm.label}</span>
                          {r.game_name && <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>{r.game_name}</div>}
                        </td>
                        <td style={{fontSize:12,color:'#9CA3AF'}}>
                          {new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {r.status === 'pending' && (
                              <button className="crm-ghost-btn" style={{background:'#059669',color:'#fff',borderColor:'#059669',fontSize:11,padding:'6px 12px'}} onClick={() => handleApprove(r.id)}>✓ Approve</button>
                            )}
                            {r.status !== 'rejected' && r.status !== 'live' && (
                              <select className="crm-input" style={{width:'auto',padding:'6px 10px',fontSize:11,background:'#fff',cursor:'pointer'}} value={r.status} onChange={e => handleUpdateStatus(r.id, e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="started_working">Started Working</option>
                                <option value="game_creating">Game Creating</option>
                                <option value="testing">Testing</option>
                                <option value="live">Live</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {selectedPerson && !editingMember && (
        <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',justifyContent:'flex-end'}}>
          <div onClick={() => setSelectedPerson(null)} style={{position:'absolute',inset:0,background:'rgba(8,8,18,.38)',backdropFilter:'blur(3px)'}} />
          <div style={{
            position:'relative',width:400,height:'100%',background:'#fff',
            boxShadow:'-16px 0 56px rgba(0,0,0,.14)',padding:'36px 28px',
            overflow:'auto',zIndex:1,animation:'crmSlideIn .24s cubic-bezier(.22,1,.36,1)',
            fontFamily:"'DM Sans',sans-serif",
          }}>
            <button className="crm-icon-btn" style={{position:'absolute',top:20,right:20}} onClick={() => setSelectedPerson(null)}><Ico.close/></button>
            <Avatar name={selectedPerson.name} size={56} />
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:22,color:'#0D0D1A',margin:'16px 0 4px',letterSpacing:'-0.025em',lineHeight:1.2}}>
              {selectedPerson.name}
            </h2>
            <p style={{color:'#6B7280',fontSize:13.5,marginTop:4}}>{selectedPerson.email}</p>

            <div style={{margin:'24px 0',display:'flex',flexDirection:'column',gap:0}}>
              {[
                {label:'Phone',val:selectedPerson.phone},
                {label:'Status',val:selectedPerson.is_active !== undefined ? (selectedPerson.is_active ? 'Active' : 'Inactive') : null},
                {label:'Created',val:new Date(selectedPerson.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})},
              ].filter(r=>r.val).map((row,i) => (
                <div key={i} style={{padding:'14px 0',borderBottom:'1px solid #F3F4F6'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{row.label}</div>
                  <div style={{fontSize:13.5,color:'#1F2937'}}>{row.val}</div>
                </div>
              ))}
            </div>

            {selectedPerson.role !== 'bd' && (
              <div style={{margin:'20px 0 0'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#0D0D1A',marginBottom:16,letterSpacing:'-0.01em'}}>Capabilities</div>
                <p style={{fontSize:12,color:'#9CA3AF',marginBottom:16}}>Control what this team member can do.</p>
                <div style={{display:'flex',flexDirection:'column',gap:2}}>
                  {[
                    { key:'can_create_client', label:'Create Clients' },
                    { key:'can_create_game',   label:'Create Games' },
                    { key:'can_edit_game',     label:'Edit Games' },
                  ].map(perm => {
                    const perms = (() => { try { const p = JSON.parse(selectedPerson.permissions||'[]'); return Array.isArray(p) ? p : [] } catch { return [] } })()
                    const on = perms.includes(perm.key)
                    const toggling = moduleToggle === perm.key
                    return (
                      <div key={perm.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F3F4F6'}}>
                        <span style={{fontSize:13,color:'#374151',fontWeight:500}}>{perm.label}</span>
                        <button onClick={() => handleToggleModule(selectedPerson.id, perm.key, perms)} disabled={!!toggling} style={{width:42,height:24,borderRadius:12,border:'none',background:on?'#059669':'#D1D5DB',cursor:'pointer',position:'relative',transition:'background .15s',flexShrink:0}}>
                          <span style={{position:'absolute',top:3,left:on?21:3,width:18,height:18,borderRadius:9,background:'#fff',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{display:'flex',gap:8,marginTop:28}}>
              <button className="crm-primary-btn" onClick={() => openEdit(selectedPerson)} style={{flex:1,justifyContent:'center'}}><Ico.edit/> Edit</button>
              <button className="crm-ghost-btn" onClick={() => handleDeleteMember(selectedPerson.id)} style={{flex:1,justifyContent:'center',color:'#DC2626',borderColor:'#FECACA'}}><Ico.trash/> Delete</button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
          <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:480,padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'crmModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
              <div>
                <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:22,color:'#0D0D1A',letterSpacing:'-0.02em'}}>Edit Member</h2>
                <p style={{color:'#9CA3AF',fontSize:13,marginTop:5}}>Update team member details.</p>
              </div>
              <button className="crm-icon-btn" onClick={() => setEditingMember(null)}><Ico.close/></button>
            </div>
            <form onSubmit={handleEditMember}>
              <div className="crm-field">
                <label className="crm-label">Name <span style={{color:'#EF4444'}}>*</span></label>
                <input className="crm-input" value={editForm.name} onChange={setEdit('name')} required />
              </div>
              <div className="crm-field">
                <label className="crm-label">Email <span style={{color:'#EF4444'}}>*</span></label>
                <input className="crm-input" type="email" value={editForm.email} onChange={setEdit('email')} required />
              </div>
              <div className="crm-field" style={{marginBottom:26}}>
                <label className="crm-label">Phone <span style={{color:'#EF4444'}}>*</span></label>
                <input className="crm-input" type="tel" value={editForm.phone} onChange={setEdit('phone')} required />
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:4}}>Changing phone will reset login password.</div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button type="button" className="crm-ghost-btn" onClick={() => setEditingMember(null)} style={{flex:1,justifyContent:'center'}}>Cancel</button>
                <button type="submit" className="crm-primary-btn" disabled={savingEdit} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
                  {savingEdit ? <><Ico.spin/> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPicker && (
        <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}} onClick={() => setShowPicker(false)}>
          <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:400,padding:'32px 24px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'crmModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}} onClick={e => e.stopPropagation()}>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',textAlign:'center',marginBottom:6}}>Add New</h2>
            <p style={{color:'#9CA3AF',fontSize:13,textAlign:'center',marginBottom:24}}>What would you like to create?</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <button onClick={() => { setShowPicker(false); setShowForm('bd'); resetForm() }} style={{padding:'16px 20px',borderRadius:14,border:'1.5px solid #EAECF0',background:'#FAFAFA',cursor:'pointer',textAlign:'left',transition:'background .13s,border-color .13s',fontFamily:'DM Sans'}}
                onMouseEnter={e => {e.currentTarget.style.background='#EEF2FF';e.currentTarget.style.borderColor='#A5B4FC'}}
                onMouseLeave={e => {e.currentTarget.style.background='#FAFAFA';e.currentTarget.style.borderColor='#EAECF0'}}>
                <div style={{fontWeight:600,fontSize:15,color:'#0D0D1A'}}>Business Developer</div>
                <div style={{fontSize:12,color:'#6B7280',marginTop:3}}>Create a BD who can submit client requests.</div>
              </button>
              <button onClick={() => { setShowPicker(false); setShowForm('team'); resetForm() }} style={{padding:'16px 20px',borderRadius:14,border:'1.5px solid #EAECF0',background:'#FAFAFA',cursor:'pointer',textAlign:'left',transition:'background .13s,border-color .13s',fontFamily:'DM Sans'}}
                onMouseEnter={e => {e.currentTarget.style.background='#F5F3FF';e.currentTarget.style.borderColor='#A5B4FC'}}
                onMouseLeave={e => {e.currentTarget.style.background='#FAFAFA';e.currentTarget.style.borderColor='#EAECF0'}}>
                <div style={{fontWeight:600,fontSize:15,color:'#0D0D1A'}}>Internal Team Member</div>
                <div style={{fontSize:12,color:'#6B7280',marginTop:3}}>Add a team member who handles requests.</div>
              </button>
            </div>
            <button className="crm-ghost-btn" onClick={() => setShowPicker(false)} style={{width:'100%',justifyContent:'center',marginTop:16}}>Cancel</button>
          </div>
        </div>
      )}

      {showForm === 'bd' && (
        <FormModal
          title="Add Business Developer"
          subtitle="Create a new BD account. Phone is used as password."
          fields={[
            {key:'name',label:'Name',value:formFields.name,onChange:set('name'),placeholder:'Full name',required:true},
            {key:'email',label:'Email',type:'email',value:formFields.email,onChange:set('email'),placeholder:'bd@example.com',required:true},
            {key:'phone',label:'Phone',type:'tel',value:formFields.phone,onChange:set('phone'),placeholder:'+91 98765 43210',required:true,hint:'Phone number will be used as the login password.'},
          ]}
          onSubmit={handleCreateBd}
          onClose={() => setShowForm(null)}
          submitting={submitting}
        />
      )}

      {showForm === 'team' && (
        <FormModal
          title="Add Team Member"
          subtitle="Add an Internal Team member. Phone is used as password."
          fields={[
            {key:'name',label:'Name',value:formFields.name,onChange:set('name'),placeholder:'Full name',required:true},
            {key:'email',label:'Email',type:'email',value:formFields.email,onChange:set('email'),placeholder:'team@example.com',required:true},
            {key:'phone',label:'Phone',type:'tel',value:formFields.phone,onChange:set('phone'),placeholder:'+91 98765 43210',required:true,hint:'Phone number will be used as the login password.'},
          ]}
          onSubmit={handleCreateTeam}
          onClose={() => setShowForm(null)}
          submitting={submitting}
        >
          <div style={{margin:'20px 0 4px',paddingTop:20,borderTop:'1px solid #F3F4F6'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#0D0D1A',marginBottom:14,letterSpacing:'-0.01em'}}>Capabilities</div>
            {[
              { key:'can_create_client', label:'Create Clients' },
              { key:'can_create_game',   label:'Create Games' },
              { key:'can_edit_game',     label:'Edit Games' },
            ].map(perm => (
              <div key={perm.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F3F4F6'}}>
                <span style={{fontSize:13,color:'#374151',fontWeight:500}}>{perm.label}</span>
                <button type="button" onClick={() => setFormFields(f => ({...f, [perm.key]: !f[perm.key]}))} style={{width:42,height:24,borderRadius:12,border:'none',background:formFields[perm.key]?'#059669':'#D1D5DB',cursor:'pointer',position:'relative',transition:'background .15s',flexShrink:0}}>
                  <span style={{position:'absolute',top:3,left:formFields[perm.key]?21:3,width:18,height:18,borderRadius:9,background:'#fff',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}} />
                </button>
              </div>
            ))}
          </div>
        </FormModal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
