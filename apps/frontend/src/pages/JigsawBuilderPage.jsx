import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap'

const LIGHT = `
@import url('${FONT_URL}');
.jb-wrap *,.jb-wrap *::before,.jb-wrap *::after{box-sizing:border-box}
.jb-wrap{font-family:'DM Sans',sans-serif;color:#111827;background:#f4f6fb;min-height:100vh}
@keyframes jbFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes jbToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes jbSpin{to{transform:rotate(360deg)}}
.jb-input,.jb-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#fafafa;outline:none;transition:border-color .15s,background .15s}
.jb-input:focus,.jb-select:focus{border-color:#818CF8;background:#fff}
.jb-select{appearance:none;cursor:pointer}
.jb-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.jb-field{margin-bottom:16px}
.jb-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.jb-btn:hover{background:#27272A}
.jb-btn:active{transform:scale(.98)}
.jb-btn:disabled{opacity:.55;cursor:not-allowed}
.jb-btn-sm{padding:7px 14px;font-size:12px}
.jb-btn-secondary{background:#fff;color:#374151;border:1.5px solid #E5E7EB}
.jb-btn-secondary:hover{background:#F3F4F6;border-color:#D1D5DB}
.jb-btn-danger{background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA}
.jb-btn-danger:hover{background:#FEE2E2}
.jb-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s;flex-shrink:0}
.jb-icon-btn:hover{background:#F0F0F0}
.jb-icon-btn.del{border-color:#FEE2E2;background:#FFF5F5;color:#DC2626}
.jb-icon-btn.del:hover{background:#FEE2E2}
.jb-card{background:#fff;border:1.5px solid #EAECF0;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);animation:jbFadeUp .25s ease both}
.jb-card-title{font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
.jb-section{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:14px;margin-bottom:12px}
.jb-section-title{font-size:10.5px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.jb-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.jb-fg{display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px}
.jb-swatch{width:28px;height:28px;border-radius:6px;border:2px solid #E5E7EB;cursor:pointer;flex-shrink:0}
.jb-cpop{position:absolute;top:calc(100%+6px);left:0;z-index:300;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:220px}
.jb-thumb{height:44px;width:auto;border-radius:6px;border:1px solid #E5E7EB;object-fit:contain}
.jb-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px 24px;background:#fff;border-bottom:1.5px solid #EAECF0;position:sticky;top:0;z-index:50;min-height:56px}
.jb-tabs{display:flex;gap:4px}
.jb-tab{padding:8px 16px;border-radius:8px;border:none;background:transparent;color:#6B7280;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .14s;white-space:nowrap}
.jb-tab:hover{background:#F3F4F6;color:#374151}
.jb-tab.active{background:#EEF2FF;color:#4338CA;font-weight:600}
.jb-body{display:grid;grid-template-columns:1fr 320px;gap:24px;padding:24px;max-width:1200px;margin:0 auto}
.jb-phone{width:280px;height:560px;border-radius:36px;border:3px solid #D1D5DB;background:#F9FAFB;overflow:hidden;position:sticky;top:80px;box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 0 0 1px rgba(0,0,0,.05)}
.jb-phone-notch{width:120px;height:18px;background:#111;border-radius:0 0 14px 14px;margin:0 auto;position:relative;z-index:2}
.jb-phone-screen{height:calc(100% - 18px);overflow-y:auto;position:relative}
.jb-grid-overlay{position:absolute;inset:0;display:grid;pointer-events:none}
.jb-grid-line{border:1px dashed rgba(99,102,241,.35)}
`

const FONT_CATEGORIES = [
  { name:'Handwriting', icon:'✍️', fonts:['Dancing Script','Pacifico','Caveat','Shadows Into Light','Satisfy','Kalam','Patrick Hand','Permanent Marker','Indie Flower','Gloria Hallelujah','Bad Script','Reenie Beanie'] },
  { name:'Professional', icon:'💼', fonts:['DM Sans','Inter','Poppins','Raleway','Nunito','Lato','Montserrat','Source Sans 3','Work Sans','Rubik','Roboto','Open Sans'] },
  { name:'Luxury', icon:'👑', fonts:['Playfair Display','Cormorant Garamond','Cinzel','Bodoni Moda','Prata','Taviraj','Libre Baskerville','Old Standard TT','Abril Fatface','Forum','Goudy Bookletter 1911','Marcellus'] },
  { name:'Playful', icon:'🎮', fonts:['Quicksand','Josefin Sans','Exo 2','Cabin','Ubuntu','Comfortaa','Bubblegum Sans','Fredoka One','Baloo 2','Righteous','Fugaz One','Lilita One'] },
]

const COLOR_PRESETS = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 18px',borderRadius:10,
      color:'#fff',fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif",
      boxShadow:'0 8px 24px rgba(0,0,0,.15)',maxWidth:320,
      background: type === 'success' ? '#16a34a' : '#dc2626',
      animation:'jbToastIn .28s cubic-bezier(.34,1.56,.64,1)',
    }}>{type === 'success' ? '✅' : '❌'} {msg}</div>
  )
}

function ColorPicker({ value, onChange, label }) {
  const [show, setShow] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-flex', flexDirection:'column', gap:4 }}>
      {label && <span className="jb-label">{label}</span>}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div className="jb-swatch" style={{ background: value||'#6366f1', border:'2px solid #E5E7EB' }} onClick={() => setShow(s => !s)} />
        <input className="jb-input" value={value||''} onChange={e => onChange(e.target.value)} placeholder="#000000"
          style={{ width:90, fontSize:12, padding:'5px 8px', background:'transparent' }} />
      </div>
      {show && (
        <div className="jb-cpop">
          {COLOR_PRESETS.map(c => (
            <div key={c} onClick={() => { onChange(c); setShow(false) }}
              style={{ width:22, height:22, background:c, borderRadius:4, cursor:'pointer', border: value===c ? '2px solid #6366f1' : '1px solid #E5E7EB' }} />
          ))}
          <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)}
            style={{ gridColumn:'span 7', width:'100%', height:28, padding:0, border:'none', background:'none', cursor:'pointer' }} />
          <button type="button" className="jb-btn jb-btn-secondary jb-btn-sm" style={{ gridColumn:'span 7', justifyContent:'center' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

function ImageUpload({ label, url, onFile, onClear, accept }) {
  const ref = useRef()
  return (
    <div>
      {label && <span className="jb-label">{label}</span>}
      <input type="file" ref={ref} accept={accept||'image/png,image/jpeg,image/jpg,image/gif,image/webp'} style={{ display:'none' }}
        onChange={e => { const f=e.target.files[0]; if(f) onFile(f) }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:4 }}>
        <button type="button" className="jb-btn jb-btn-secondary jb-btn-sm" onClick={() => ref.current.click()}>📷 Upload</button>
        {url && <img src={url} className="jb-thumb" alt="" />}
        {url && <button type="button" className="jb-icon-btn del" onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

function SoundSelect({ label, value, onChange, sounds }) {
  return (
    <div className="jb-fg">
      <span className="jb-label">{label}</span>
      <select className="jb-select" value={value||''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

export default function JigsawBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [tab, setTab] = useState('display')
  const [toast, setToast] = useState(null)
  const [settings, setSettings] = useState({})
  const [sounds, setSounds] = useState([])
  const [saving, setSaving] = useState(false)
  const [soundUploading, setSoundUploading] = useState(false)
  const [formFields, setFormFields] = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [redirectUrl, setRedirectUrl] = useState('')
  const [heading1Color, setHeading1Color] = useState('#1a1a2e')
  const [heading2Color, setHeading2Color] = useState('#666666')
  const [heading3Color, setHeading3Color] = useState('#777777')
  const [descColor, setDescColor] = useState('#888888')
  const [text1, setText1] = useState('')

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadData = useCallback(() => {
    setLoading(true); setFetchError(null)
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/jigsaw/${id}/settings`),
      api.get('/sounds/games/' + id + '/sounds'),
    ]).then(([gRes, sRes, soundRes]) => {
      const g = gRes.data.game
      setGame(g)
      setSettings(sRes.data.settings || {})
      setSounds(soundRes.data.sounds || [])
      setFormFields(g.formFields || [])
      setEmailTemplate(g.emailTemplate || {})
      setRedirectUrl(g.redirect_url || '')
      setText1(g.name || '')
      const s = sRes.data.settings || {}
      setHeading1Color(s.heading_1_color || '#1a1a2e')
      setHeading2Color(s.heading_2_color || '#666666')
      setHeading3Color(s.heading_3_color || '#777777')
      setDescColor(s.description_color || '#888888')
    }).catch(err => {
      setFetchError(err.response?.data?.message || err.message || 'Failed to load jigsaw data')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['grid_rows','grid_cols','show_timer','time_limit_seconds',
        'heading_1','heading_2','heading_3','description_text',
        'heading_1_color','heading_2_color','heading_3_color','description_color',
        'bg_color','primary_color','font_family','meta_description',
        'sound_correct_id','sound_wrong_id',
        'intro_text','outro_text','submit_button_text','continue_button_text','start_button_text',
        'terms_enabled','terms_text','terms_url']
      for (const f of fields) fd.append(f, settings[f] ?? '')
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._tyBgImageFile) fd.append('thankyou_bg_image', settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url || '')
      if (settings._puzzleImageFile) fd.append('puzzle_image', settings._puzzleImageFile)
      else if (settings.puzzle_image_url !== undefined) fd.append('puzzle_image_url', settings.puzzle_image_url || '')
      if (settings._submitGifFile) fd.append('submit_confirm_gif', settings._submitGifFile)
      else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url || '')
      await api.put(`/jigsaw/${id}/settings`, fd)
      showToast('Settings saved ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message || err.message), 'error') }
    setSaving(false)
  }

  const saveDisplaySettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const sFields = ['heading_1','heading_2','heading_3','description_text','intro_text','meta_description','font_family',
        'bg_color','primary_color','show_timer','time_limit_seconds',
        'sound_correct_id','sound_wrong_id','grid_rows','grid_cols']
      for (const f of sFields) fd.append(f, settings[f] ?? '')
      fd.append('heading_1_color', heading1Color)
      fd.append('heading_2_color', heading2Color)
      fd.append('heading_3_color', heading3Color)
      fd.append('description_color', descColor)
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url || '')
      if (settings._puzzleImageFile) fd.append('puzzle_image', settings._puzzleImageFile)
      else if (settings.puzzle_image_url !== undefined) fd.append('puzzle_image_url', settings.puzzle_image_url || '')
      await api.put(`/jigsaw/${id}/settings`, fd)
      await api.put(`/games/${id}`, { name: text1 || game?.name })
      setGame(prev => ({ ...prev, name: text1 || prev?.name }))
      showToast('Display settings saved ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message || err.message), 'error') }
    setSaving(false)
  }

  const saveFormFields = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/form-fields`, { fields: formFields }); showToast('Form fields saved') }
    catch { showToast('Error saving form fields', 'error') }
    setSaving(false)
  }

  const saveEmailTemplate = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/email-template`, emailTemplate); showToast('Email template saved') }
    catch { showToast('Error saving email template', 'error') }
    setSaving(false)
  }

  const addFormField = () => setFormFields([...formFields, { field_label:'New Field', field_type:'text', is_required:0, field_options:[] }])
  const removeFormField = i => { const f=[...formFields]; f.splice(i,1); setFormFields(f) }
  const updateFormField = (i,key,val) => { const f=[...formFields]; f[i]={ ...f[i],[key]:val }; setFormFields(f) }

  const uploadSound = async e => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/,''))
    fd.append('sound_type', 'custom')
    setSoundUploading(true)
    try {
      const res = await api.post(`/sounds/games/${id}/sounds`, fd)
      setSounds(prev => [res.data.sound, ...prev])
      showToast('Sound uploaded ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSoundUploading(false); e.target.value=''
  }

  const deleteSound = async s => {
    try { await api.delete(`/sounds/sounds/${s.id}`); setSounds(prev => prev.filter(x => x.id!==s.id)); showToast('Sound deleted') }
    catch { showToast('Error', 'error') }
  }

  const gameLink = game ? `${window.location.origin}/play/${game.slug}/${game.client_slug}` : ''

  const TABS = [
    { id:'display',   label:'🎨 Display' },
    { id:'sounds',    label:'🔊 Sounds' },
    { id:'form',      label:'📋 Form' },
    { id:'thankyou',  label:'🙏 Thank You' },
    { id:'email',     label:'📧 Email' },
    { id:'settings',  label:'⚙️ Settings' },
  ]

  if (loading) return (
    <div className="jb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', color:'#9CA3AF' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #E5E7EB',borderTopColor:'#6366f1',animation:'jbSpin .8s linear infinite',margin:'0 auto 16px' }} />
        Loading jigsaw builder…
      </div>
    </div>
  )

  if (fetchError) return (
    <div className="jb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h2 style={{ color:'#DC2626', marginBottom:8 }}>Failed to Load</h2>
        <p style={{ color:'#9CA3AF', marginBottom:20 }}>{fetchError}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <button className="jb-btn" onClick={loadData}>🔄 Retry</button>
          <button className="jb-btn jb-btn-secondary" onClick={() => navigate('/dashboard/games')}>← Back</button>
        </div>
      </div>
    </div>
  )

  const previewRows = settings.grid_rows || 4
  const previewCols = settings.grid_cols || 4

  return (
    <div className="jb-wrap">
      <style>{LIGHT}</style>

      <div className="jb-header">
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><button className="jb-icon-btn" onClick={() => navigate('/dashboard/games')} style={{ fontSize:16, lineHeight:1, marginTop:1 }}>←</button><div><div style={{ fontWeight:700, fontSize:14, color:'#1e1e2e', lineHeight:1.3 }}>{game?.name || 'Untitled'}</div><div style={{ fontSize:9.5, fontWeight:600, color:'#9899b8', letterSpacing:'.04em', textTransform:'uppercase', marginTop:1 }}>Jigsaw Puzzle Builder</div></div></div>
        <div className="jb-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`jb-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
          <button className="jb-btn jb-btn-secondary jb-btn-sm" onClick={() => { navigator.clipboard.writeText(gameLink); showToast('Link copied!') }}>🔗</button>
          <a href={gameLink} target="_blank" rel="noreferrer" className="jb-btn jb-btn-secondary jb-btn-sm">👁</a>
        </div>
      </div>

      <div className="jb-body">
        <div style={{ minWidth:0 }}>
          {tab === 'display' && (
            <div>
              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🎮 Game Name</div>
                <input className="jb-input" value={text1||''} onChange={e=>setText1(e.target.value)} placeholder="Jigsaw Puzzle" />
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🧩 Puzzle Setup</div>
                <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:12 }}>Upload the image that will be split into puzzle pieces.</p>
                <div style={{ marginBottom:14 }}>
                  <ImageUpload label="Puzzle Image" url={settings.puzzle_image_url} accept="image/png,image/jpeg,image/jpg,image/webp"
                    onFile={f => { const r=new FileReader(); r.onload=e=>setSettings({...settings,puzzle_image_url:e.target.result,_puzzleImageFile:f}); r.readAsDataURL(f) }}
                    onClear={() => setSettings({...settings,puzzle_image_url:'',_puzzleImageFile:null})} />
                </div>
                <div className="jb-2col">
                  <div className="jb-fg">
                    <span className="jb-label">Grid Rows (Difficulty)</span>
                    <select className="jb-select" value={settings.grid_rows||4} onChange={e=>setSettings({...settings,grid_rows:parseInt(e.target.value)})}>
                      {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} rows ({n*n} pieces)</option>)}
                    </select>
                  </div>
                  <div className="jb-fg">
                    <span className="jb-label">Grid Columns</span>
                    <select className="jb-select" value={settings.grid_cols||4} onChange={e=>setSettings({...settings,grid_cols:parseInt(e.target.value)})}>
                      {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} columns</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🖼️ Images</div>
                <div className="jb-2col">
                  <ImageUpload label="Background Image" url={settings.bg_image_url}
                    onFile={f => { const r=new FileReader(); r.onload=e=>setSettings({...settings,bg_image_url:e.target.result,_bgImageFile:f}); r.readAsDataURL(f) }}
                    onClear={() => setSettings({...settings,bg_image_url:'',_bgImageFile:null})} />
                  <ImageUpload label="Game Logo" url={settings.game_logo_url}
                    onFile={f => { const r=new FileReader(); r.onload=e=>setSettings({...settings,game_logo_url:e.target.result,_gameLogoFile:f}); r.readAsDataURL(f) }}
                    onClear={() => setSettings({...settings,game_logo_url:'',_gameLogoFile:null})} />
                </div>
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">📝 Headings & Description</div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Heading 1</span>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <input className="jb-input" value={settings.heading_1||''} onChange={e=>setSettings({...settings,heading_1:e.target.value})} placeholder="Jigsaw Puzzle" style={{ flex:1 }} />
                    <ColorPicker value={heading1Color} onChange={setHeading1Color} label="Color" />
                  </div>
                </div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Heading 2</span>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <input className="jb-input" value={settings.heading_2||''} onChange={e=>setSettings({...settings,heading_2:e.target.value})} placeholder="Solve the puzzle!" style={{ flex:1 }} />
                    <ColorPicker value={heading2Color} onChange={setHeading2Color} label="Color" />
                  </div>
                </div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Heading 3 / Instructions</span>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <input className="jb-input" value={settings.heading_3||''} onChange={e=>setSettings({...settings,heading_3:e.target.value})} placeholder="Drag pieces to their correct position" style={{ flex:1 }} />
                    <ColorPicker value={heading3Color} onChange={setHeading3Color} label="Color" />
                  </div>
                </div>
                <div className="jb-fg">
                  <span className="jb-label">Description</span>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <textarea className="jb-input" rows={2} value={settings.description_text||''} onChange={e=>setSettings({...settings,description_text:e.target.value})} placeholder="Optional description" style={{ flex:1, resize:'vertical' }} />
                    <ColorPicker value={descColor} onChange={setDescColor} label="Color" />
                  </div>
                </div>
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🎨 Colors & Fonts</div>
                <div className="jb-2col" style={{ marginBottom:12 }}>
                  <ColorPicker value={settings.bg_color||'#f8f8ff'} onChange={v=>setSettings({...settings,bg_color:v})} label="Background Color" />
                  <ColorPicker value={settings.primary_color||'#6366f1'} onChange={v=>setSettings({...settings,primary_color:v})} label="Primary Color" />
                </div>
                <div className="jb-fg">
                  <span className="jb-label">Font Family</span>
                  <select className="jb-select" value={settings.font_family||'DM Sans'} onChange={e=>setSettings({...settings,font_family:e.target.value})}>
                    {FONT_CATEGORIES.map(cat => (
                      <optgroup key={cat.name} label={`${cat.icon} ${cat.name}`}>
                        {cat.fonts.map(f => <option key={f} value={f}>{f}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">⏱ Timer</div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <input type="checkbox" id="showTimer" checked={Number(settings.show_timer)===1}
                    onChange={e=>setSettings({...settings,show_timer:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  <label htmlFor="showTimer" style={{ fontWeight:600, cursor:'pointer', fontSize:14 }}>Show Timer</label>
                </div>
                {Number(settings.show_timer)===1 && (
                  <div className="jb-fg" style={{ maxWidth:200 }}>
                    <span className="jb-label">Time Limit (seconds, 0=unlimited)</span>
                    <input className="jb-input" type="number" min="0" value={settings.time_limit_seconds||0} onChange={e=>setSettings({...settings,time_limit_seconds:parseInt(e.target.value)||0})} />
                  </div>
                )}
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🎯 Start Button</div>
                <div className="jb-fg" style={{ maxWidth:280 }}>
                  <span className="jb-label">Button Text</span>
                  <input className="jb-input" value={settings.start_button_text||''} onChange={e=>setSettings({...settings,start_button_text:e.target.value})} placeholder="Start Puzzle →" />
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
                <button className="jb-btn" onClick={saveDisplaySettings} disabled={saving} style={{ padding:'10px 28px' }}>
                  {saving ? '⏳ Saving…' : '💾 Save Display Settings'}
                </button>
              </div>
            </div>
          )}

          {tab === 'sounds' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <h3 style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Sound Library</h3>
                  <p style={{ color:'#9CA3AF', fontSize:13 }}>Upload MP3, WAV or OGG files.</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onChange={uploadSound} style={{ display:'none' }} id="soundUpload" />
                  <button className="jb-btn" onClick={()=>document.getElementById('soundUpload').click()} disabled={soundUploading}>
                    {soundUploading ? '⏳ Uploading…' : '+ Upload Sound'}
                  </button>
                </div>
              </div>

              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🎮 Assign Sounds</div>
                <div className="jb-2col">
                  <SoundSelect label="Correct Sound" value={settings.sound_correct_id} onChange={v=>setSettings({...settings,sound_correct_id:v})} sounds={sounds} />
                  <SoundSelect label="Wrong Sound" value={settings.sound_wrong_id} onChange={v=>setSettings({...settings,sound_wrong_id:v})} sounds={sounds} />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
                  <button className="jb-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳ Saving…':'💾 Save Sounds'}</button>
                </div>
              </div>

              {sounds.length > 0 && (
                <div className="jb-card">
                  <div className="jb-card-title">📁 Uploaded Sounds ({sounds.length})</div>
                  {sounds.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{ flex:1, fontSize:13 }}>{s.name}</span>
                      <audio controls src={s.url||s.file_url} style={{ height:32, flexShrink:0 }} />
                      <button className="jb-icon-btn del" onClick={()=>deleteSound(s)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'form' && (
            <div>
              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">📋 Registration Fields</div>
                <p style={{ color:'#9CA3AF', fontSize:12, marginBottom:12 }}>Fields shown before the puzzle starts.</p>
                {formFields.map((f,i) => (
                  <div key={i} style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginBottom:8, padding:'10px 12px', background:'#F9FAFB', borderRadius:8 }}>
                    <div className="jb-fg" style={{ flex:2, minWidth:130 }}>
                      <span className="jb-label">Label</span>
                      <input className="jb-input" value={f.field_label} onChange={e=>updateFormField(i,'field_label',e.target.value)} />
                    </div>
                    <div className="jb-fg" style={{ flex:1, minWidth:110 }}>
                      <span className="jb-label">Type</span>
                      <select className="jb-select" value={f.field_type} onChange={e=>updateFormField(i,'field_type',e.target.value)}>
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer', paddingBottom:2 }}>
                      <input type="checkbox" checked={Number(f.is_required)===1} onChange={e=>updateFormField(i,'is_required',e.target.checked?1:0)} style={{ width:16,height:16 }} />
                      Required
                    </label>
                    <button className="jb-icon-btn del" onClick={()=>removeFormField(i)}>✕</button>
                  </div>
                ))}
                <div style={{ textAlign:'center', marginTop:10 }}>
                  <button className="jb-btn jb-btn-secondary" onClick={addFormField}>+ Add Field</button>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:14 }}>
                  <button className="jb-btn" onClick={saveFormFields} disabled={saving}>{saving?'⏳ Saving…':'💾 Save Fields'}</button>
                </div>
              </div>

              <div className="jb-card">
                <div className="jb-card-title">☑️ Terms & Conditions</div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <input type="checkbox" id="termsEnabled" checked={Number(settings.terms_enabled)===1}
                    onChange={e=>setSettings({...settings,terms_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  <label htmlFor="termsEnabled" style={{ fontWeight:600, cursor:'pointer', fontSize:14 }}>Require Terms & Conditions</label>
                </div>
                {Number(settings.terms_enabled)===1 && (
                  <div className="jb-2col">
                    <div className="jb-fg"><span className="jb-label">Terms Label</span><input className="jb-input" value={settings.terms_text||''} onChange={e=>setSettings({...settings,terms_text:e.target.value})} placeholder="Terms & Conditions" /></div>
                    <div className="jb-fg"><span className="jb-label">Terms URL</span><input className="jb-input" value={settings.terms_url||''} onChange={e=>setSettings({...settings,terms_url:e.target.value})} placeholder="https://..." /></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'thankyou' && (
            <div>
              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">🙏 Thank You Page</div>
                <div className="jb-2col" style={{ marginBottom:14 }}>
                  <ImageUpload label="Thank You Background" url={settings.thankyou_bg_image_url}
                    onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,thankyou_bg_image_url:e.target.result,_tyBgImageFile:f});r.readAsDataURL(f)}}
                    onClear={()=>setSettings({...settings,thankyou_bg_image_url:'',_tyBgImageFile:null})} />
                  <ImageUpload label="Submit Confirm GIF" url={settings.submit_confirm_gif_url}
                    onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,submit_confirm_gif_url:e.target.result,_submitGifFile:f});r.readAsDataURL(f)}}
                    onClear={()=>setSettings({...settings,submit_confirm_gif_url:'',_submitGifFile:null})} />
                </div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Outro Text</span>
                  <textarea className="jb-input" rows={2} value={settings.outro_text||''} onChange={e=>setSettings({...settings,outro_text:e.target.value})} placeholder="Congratulations!" style={{ resize:'vertical' }} />
                </div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Submit Button Text</span>
                  <input className="jb-input" value={settings.submit_button_text||''} onChange={e=>setSettings({...settings,submit_button_text:e.target.value})} placeholder="Submit & Explore" />
                </div>
                <div className="jb-fg" style={{ marginBottom:10 }}>
                  <span className="jb-label">Continue Button Text</span>
                  <input className="jb-input" value={settings.continue_button_text||''} onChange={e=>setSettings({...settings,continue_button_text:e.target.value})} placeholder="Continue Now →" />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button className="jb-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳ Saving…':'💾 Save'}</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'email' && (
            <div className="jb-card">
              <div className="jb-card-title">📧 Email Template</div>
              <div className="jb-2col" style={{ marginBottom:12 }}>
                <div className="jb-fg"><span className="jb-label">Sender Name</span><input className="jb-input" value={emailTemplate.sender_name||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_name:e.target.value})} /></div>
                <div className="jb-fg"><span className="jb-label">Sender Email</span><input className="jb-input" type="email" value={emailTemplate.sender_email||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_email:e.target.value})} /></div>
              </div>
              <div className="jb-fg" style={{ marginBottom:12 }}>
                <span className="jb-label">Subject</span>
                <input className="jb-input" value={emailTemplate.subject||''} onChange={e=>setEmailTemplate({...emailTemplate,subject:e.target.value})} placeholder="You completed the puzzle!" />
              </div>
              <div className="jb-fg" style={{ marginBottom:12 }}>
                <span className="jb-label">Body HTML</span>
                <textarea className="jb-input" rows={6} value={emailTemplate.body_html||''} onChange={e=>setEmailTemplate({...emailTemplate,body_html:e.target.value})} style={{ resize:'vertical', fontFamily:'monospace', fontSize:12 }} />
              </div>
              <div className="jb-fg" style={{ marginBottom:12 }}>
                <span className="jb-label">Footer Text</span>
                <input className="jb-input" value={emailTemplate.footer_text||''} onChange={e=>setEmailTemplate({...emailTemplate,footer_text:e.target.value})} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <input type="checkbox" id="emailEnabled" checked={!!emailTemplate.is_enabled}
                  onChange={e=>setEmailTemplate({...emailTemplate,is_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                <label htmlFor="emailEnabled" style={{ fontWeight:600, cursor:'pointer', fontSize:14 }}>Enable Email</label>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="jb-btn" onClick={saveEmailTemplate} disabled={saving}>{saving?'⏳ Saving…':'💾 Save Email'}</button>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div>
              <div className="jb-card" style={{ marginBottom:14 }}>
                <div className="jb-card-title">⚙️ Game Settings</div>
                <div className="jb-fg" style={{ marginBottom:12 }}>
                  <span className="jb-label">Redirect URL (after completion)</span>
                  <input className="jb-input" type="url" value={redirectUrl} onChange={e=>setRedirectUrl(e.target.value)} placeholder="https://yoursite.com/thankyou" />
                </div>
                <div className="jb-fg" style={{ marginBottom:12 }}>
                  <span className="jb-label">Meta Description</span>
                  <textarea className="jb-input" rows={2} value={settings.meta_description||''} onChange={e=>setSettings({...settings,meta_description:e.target.value})} style={{ resize:'vertical' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button className="jb-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳ Saving…':'💾 Save Settings'}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="jb-phone">
          <div className="jb-phone-notch" />
          <div className="jb-phone-screen" style={{ background: settings.bg_color || '#f8f8ff', padding:12 }}>
            {settings.game_logo_url && (
              <img src={settings.game_logo_url} alt="Logo" style={{ width:'100%', maxHeight:40, objectFit:'contain', borderRadius:6, marginBottom:8 }} />
            )}
            <h2 style={{ fontSize:14, fontWeight:800, color: heading1Color, textAlign:'center', marginBottom:4, fontFamily: settings.font_family || 'DM Sans' }}>
              {settings.heading_1 || 'Jigsaw Puzzle'}
            </h2>
            {settings.heading_2 && (
              <p style={{ fontSize:11, color: heading2Color, textAlign:'center', marginBottom:6 }}>{settings.heading_2}</p>
            )}
            {settings.puzzle_image_url ? (
              <div style={{ position:'relative', width:'100%', aspectRatio:'1', borderRadius:8, overflow:'hidden', marginBottom:8 }}>
                <img src={settings.puzzle_image_url} alt="Puzzle" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                <div className="jb-grid-overlay" style={{ gridTemplateColumns:`repeat(${previewCols},1fr)`, gridTemplateRows:`repeat(${previewRows},1fr)` }}>
                  {Array.from({length:previewRows*previewCols}).map((_,i)=>(
                    <div key={i} className="jb-grid-line" />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ width:'100%', aspectRatio:'1', borderRadius:8, border:'2px dashed #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:12, marginBottom:8 }}>
                Upload puzzle image
              </div>
            )}
            <div style={{ fontSize:10, color:'#9CA3AF', textAlign:'center' }}>
              {previewRows}×{previewCols} grid ({previewRows*previewCols} pieces)
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}
