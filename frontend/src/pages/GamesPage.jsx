import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const CATEGORY_META = {
  quiz:   { label:'Quiz',   bg:'#EEF2FF', fg:'#4338CA', dot:'#818CF8' },
  survey: { label:'Survey', bg:'#F0FDF4', fg:'#15803D', dot:'#4ADE80' },
  poll:   { label:'Poll',   bg:'#FFF7ED', fg:'#C2410C', dot:'#FB923C' },
}
const catMeta = (cat) => CATEGORY_META[cat] || { label: cat, bg:'#F3F4F6', fg:'#374151', dot:'#9CA3AF' }

const CSS = `
@import url('${FONT_URL}');
.gp *,.gp *::before,.gp *::after{box-sizing:border-box;margin:0;padding:0}
.gp{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes gpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gpModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes gpToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes gpSpin{to{transform:rotate(360deg)}}
@keyframes gpPulse{0%,100%{opacity:1}50%{opacity:.5}}
.gp-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;padding:22px 22px 18px;cursor:pointer;transition:border-color .18s,box-shadow .18s,transform .18s;animation:gpFadeUp .3s ease both}
.gp-card:hover{border-color:#A5B4FC;box-shadow:0 6px 28px rgba(99,102,241,.1);transform:translateY(-2px)}
.gp-card.inactive{border-color:#F3F4F6;opacity:.8}
.gp-card:hover .gp-hover-actions{opacity:1}
.gp-hover-actions{opacity:0;transition:opacity .15s}
.gp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s,background .15s}
.gp-input:focus{border-color:#818CF8;background:#fff}
.gp-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;appearance:none;cursor:pointer;transition:border-color .15s}
.gp-select:focus{border-color:#818CF8}
.gp-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.gp-field{margin-bottom:16px}
.gp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.gp-primary-btn:hover{background:#27272A}
.gp-primary-btn:active{transform:scale(.98)}
.gp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.gp-ghost-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.gp-ghost-btn:hover{background:#F3F4F6;border-color:#D1D5DB}
.gp-icon-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s}
.gp-icon-btn:hover{background:#F0F0F0}
.gp-icon-btn.del{border-color:#FEE2E2;background:#FFF5F5;color:#DC2626}
.gp-icon-btn.del:hover{background:#FEE2E2}
.gp-toggle{width:38px;height:22px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.gp-toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.gp-toggle.on{background:#4F46E5}
.gp-toggle.on::after{transform:translateX(16px)}
.gp-toggle.off{background:#D1D5DB}
`

const Ico = {
  plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  close: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  wrench: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  chart: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  link: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  trash: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  question: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  play: () => <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  spin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'gpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  building: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background: ok ? '#052E16' : '#450A0A', color:'#fff',
      padding:'13px 20px 13px 16px',borderRadius:12,fontSize:13.5,
      fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok?'#22C55E':'#EF4444'}`,
      animation:'gpToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:420,
    }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

function GameCard({ game, onNavigate, onCopyLink, onToggle, onDelete, delay }) {
  const cat = catMeta(game.category)
  return (
    <div className={`gp-card ${game.is_active ? '' : 'inactive'}`} style={{animationDelay:`${delay}ms`}}
      onClick={() => onNavigate(`/dashboard/games/${game.id}/responses`)}>
      {/* Top row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:6,background:cat.bg,color:cat.fg,fontSize:11.5,fontWeight:600,padding:'4px 10px',borderRadius:100,letterSpacing:'.01em'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:cat.dot,flexShrink:0}} />
          {cat.label}
        </span>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button
            className={`gp-toggle ${game.is_active ? 'on' : 'off'}`}
            title={game.is_active ? 'Deactivate' : 'Activate'}
            onClick={e => { e.stopPropagation(); onToggle(game) }}
          />
          <button className="gp-icon-btn del" title="Delete" onClick={e=>{e.stopPropagation();onDelete(game.id)}}>
            <Ico.trash/>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:17,color:'#0D0D1A',letterSpacing:'-0.02em',lineHeight:1.3,marginBottom:6,cursor:'pointer'}}>
        {game.name}
      </h3>
      <div style={{display:'flex',alignItems:'center',gap:6,color:'#9CA3AF',fontSize:12.5,marginBottom:14}}>
        <Ico.building/> {game.company_name}
      </div>

      {/* URL slug */}
      <div style={{background:'#F8F9FB',borderRadius:8,padding:'8px 12px',fontSize:11.5,color:'#6B7280',fontFamily:'monospace',letterSpacing:'0.01em',marginBottom:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
        /play/{game.slug}/{game.client_slug}
      </div>

      {/* Stats row */}
      <div style={{display:'flex',gap:16,marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12.5,color:'#6B7280'}}>
          <span style={{color:'#9CA3AF'}}><Ico.question/></span> {game.question_count||0} questions
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12.5,color:'#6B7280'}}>
          <span style={{color:'#9CA3AF'}}><Ico.play/></span> {game.play_count||0} plays
        </div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:7,paddingTop:14,borderTop:'1px solid #F3F4F6',flexWrap:'wrap'}} onClick={e=>e.stopPropagation()}>
        <button className="gp-ghost-btn" style={{background:'#18181B',color:'#fff',borderColor:'#18181B'}}
          onClick={() => onNavigate(`/dashboard/games/${game.id}/builder`)}>
          <Ico.wrench/> Builder
        </button>
        <button className="gp-ghost-btn" onClick={() => onNavigate(`/dashboard/games/${game.id}/responses`)}>
          <Ico.chart/> Responses
        </button>
        <button className="gp-ghost-btn" onClick={() => onCopyLink(game)}>
          <Ico.link/> Copy Link
        </button>
      </div>
    </div>
  )
}

function CreateModal({ clients, onClose, onCreated, onError }) {
  const [form, setForm] = useState({client_id:'',name:'',category:'quiz',description:'',redirect_url:''})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true)
    try {
      const res = await api.post('/games', form)
      onCreated()
      onClose()
      navigate(`/dashboard/games/${res.data.game.id}/builder`)
    } catch(err) { onError(err.response?.data?.message||'Error creating game'); setSubmitting(false) }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:500,maxHeight:'92vh',overflow:'auto',padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:22,color:'#0D0D1A',letterSpacing:'-0.02em'}}>New Game</h2>
            <p style={{color:'#9CA3AF',fontSize:13,marginTop:5}}>Configure the game — you'll build questions next.</p>
          </div>
          <button className="gp-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="gp-field">
            <label className="gp-label">Client <span style={{color:'#EF4444'}}>*</span></label>
            <div style={{position:'relative'}}>
              <select className="gp-select" value={form.client_id} onChange={set('client_id')} required>
                <option value="">Select a client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              <svg style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9CA3AF'}} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <div className="gp-field">
            <label className="gp-label">Game Name <span style={{color:'#EF4444'}}>*</span></label>
            <input className="gp-input" value={form.name} onChange={set('name')} placeholder="e.g. Product Knowledge Quiz" required />
          </div>

          <div className="gp-field">
            <label className="gp-label">Category</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {Object.entries(CATEGORY_META).map(([k,v]) => (
                <button key={k} type="button"
                  onClick={() => setForm(f=>({...f,category:k}))}
                  style={{
                    padding:'10px 8px',borderRadius:10,border:`2px solid ${form.category===k ? v.dot : '#E5E7EB'}`,
                    background: form.category===k ? v.bg : '#FAFAFA',
                    cursor:'pointer',transition:'all .14s',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                  }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:v.dot}} />
                  <span style={{fontSize:13,fontWeight:600,color:form.category===k?v.fg:'#374151',fontFamily:"'DM Sans',sans-serif"}}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="gp-field">
            <label className="gp-label">Description</label>
            <textarea className="gp-input" rows={2} value={form.description} onChange={set('description')} style={{resize:'vertical'}} />
          </div>

          <div className="gp-field" style={{marginBottom:26}}>
            <label className="gp-label">Redirect URL <span style={{color:'#9CA3AF',fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:11}}>(after game ends)</span></label>
            <input className="gp-input" type="url" value={form.redirect_url} onChange={set('redirect_url')} placeholder="https://yoursite.com/thankyou" />
          </div>

          <div style={{display:'flex',gap:10}}>
            <button type="button" className="gp-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center',padding:'11px 0'}}>Cancel</button>
            <button type="submit" className="gp-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Creating…</> : 'Create & Open Builder →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const navigate = useNavigate()

  const load = () =>
    Promise.all([api.get('/games'), api.get('/clients')])
      .then(([gr,cr]) => { setGames(gr.data.games||[]); setClients(cr.data.clients||[]) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleDelete = async id => {
    if (!confirm('Delete this game and all its questions?')) return
    try { await api.delete(`/games/${id}`); setToast({msg:'Game deleted',type:'success'}); load() }
    catch { setToast({msg:'Delete failed',type:'error'}) }
  }

  const toggleActive = async game => {
    try { await api.put(`/games/${game.id}`,{...game,is_active:game.is_active?0:1}); load() } catch{}
  }

  const copyLink = game => {
    const link = `${window.location.origin}/play/${game.slug}/${game.client_slug}`
    navigator.clipboard.writeText(link)
    if (!game.is_active) setToast({msg:'Link copied — game is currently inactive.',type:'error'})
    else setToast({msg:'Game link copied!',type:'success'})
  }

  const filtered = games.filter(g => {
    const matchSearch = !search || [g.name,g.company_name].some(v=>v?.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat==='all' || g.category===filterCat
    return matchSearch && matchCat
  })

  const stats = { total: games.length, active: games.filter(g=>g.is_active).length, plays: games.reduce((a,g)=>a+(g.play_count||0),0) }

  return (
    <div className="gp">
      <style>{CSS}</style>
      <div style={{padding:'36px 40px',maxWidth:1120,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Management</p>
            <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:'#0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
              Games
            </h1>
            <p style={{fontSize:13.5,color:'#9CA3AF',marginTop:8}}>
              {stats.total} game{stats.total!==1?'s':''} · {stats.active} active · {stats.plays.toLocaleString()} total plays
            </p>
          </div>
          <button className="gp-primary-btn" onClick={() => setShowForm(true)}><Ico.plus/> Create Game</button>
        </div>

        {/* Filters */}
        {games.length > 0 && (
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28,flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:'0 0 300px'}}>
              <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF'}}><Ico.search/></span>
              <input className="gp-input" style={{paddingLeft:40}} placeholder="Search games…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div style={{display:'flex',gap:6}}>
              {['all','quiz','survey','poll'].map(k => {
                const isAll = k === 'all'
                const meta = isAll ? null : catMeta(k)
                const active = filterCat === k
                return (
                  <button key={k} onClick={()=>setFilterCat(k)} style={{
                    padding:'7px 14px',borderRadius:9,border:`1.5px solid ${active?'#A5B4FC':'#E5E7EB'}`,
                    background: active ? '#EEF2FF' : '#fff',
                    color: active ? '#4338CA' : '#374151',
                    fontSize:12.5,fontWeight:600,cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'all .13s',
                  }}>
                    {isAll ? 'All' : meta.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* States */}
        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:'#9CA3AF',fontSize:14}}>
            <Ico.spin/> Loading games…
          </div>
        ) : games.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="30" height="30" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No games yet</h3>
            <p style={{color:'#9CA3AF',fontSize:14,marginBottom:24}}>Create your first game to get started.</p>
            <button className="gp-primary-btn" onClick={()=>setShowForm(true)}><Ico.plus/> Create Game</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#9CA3AF',fontSize:14}}>
            No games match your filters.
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))',gap:16}}>
            {filtered.map((g,i) => (
              <GameCard key={g.id} game={g} delay={i*40}
                onNavigate={navigate}
                onCopyLink={copyLink}
                onToggle={toggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CreateModal
          clients={clients}
          onClose={() => setShowForm(false)}
          onCreated={load}
          onError={msg => setToast({msg,type:'error'})}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}