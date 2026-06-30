import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap'

const LIGHT = `
@import url('${FONT_URL}');
.pw-wrap *,.pw-wrap *::before,.pw-wrap *::after{box-sizing:border-box}
.pw-wrap{font-family:'DM Sans',sans-serif;color:#111827;background:#f4f6fb;min-height:100vh}
@keyframes pwFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pwToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes pwSpin{to{transform:rotate(360deg)}}
.pw-input,.pw-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#fafafa;outline:none;transition:border-color .15s,background .15s}
.pw-input:focus,.pw-select:focus{border-color:#818CF8;background:#fff}
.pw-select{appearance:none;cursor:pointer}
.pw-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.pw-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:background .14s,transform .1s}
.pw-btn:hover{background:#27272A}
.pw-btn:active{transform:scale(.98)}
.pw-btn:disabled{opacity:.55;cursor:not-allowed}
.pw-btn-sm{padding:7px 14px;font-size:12px}
.pw-btn-secondary{background:#fff;color:#374151;border:1.5px solid #E5E7EB}
.pw-btn-secondary:hover{background:#F3F4F6;border-color:#D1D5DB}
.pw-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s;flex-shrink:0}
.pw-icon-btn:hover{background:#F0F0F0}
.pw-card{background:#fff;border:1.5px solid #EAECF0;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);animation:pwFadeUp .25s ease both}
.pw-card-title{font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
.pw-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pw-fg{display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px}
.pw-swatch{width:28px;height:28px;border-radius:6px;border:2px solid #E5E7EB;cursor:pointer;flex-shrink:0}
.pw-cpop{position:absolute;top:calc(100%+6px);left:0;z-index:300;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:220px}
.pw-thumb{height:44px;width:auto;border-radius:6px;border:1px solid #E5E7EB;object-fit:contain}
.pw-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px 24px;background:#fff;border-bottom:1.5px solid #EAECF0;position:sticky;top:0;z-index:50;min-height:56px}
.pw-tabs{display:flex;gap:4px}
.pw-tab{padding:8px 16px;border-radius:8px;border:none;background:transparent;color:#6B7280;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .14s;white-space:nowrap}
.pw-tab:hover{background:#F3F4F6;color:#374151}
.pw-tab.active{background:#EEF2FF;color:#4338CA;font-weight:600}
.pw-body{display:grid;grid-template-columns:1fr 320px;gap:24px;padding:24px;max-width:1200px;margin:0 auto}
.pw-phone{width:280px;height:560px;border-radius:36px;border:3px solid #D1D5DB;background:#F9FAFB;overflow:hidden;position:sticky;top:80px;box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 0 0 1px rgba(0,0,0,.05)}
.pw-phone-notch{width:120px;height:18px;background:#111;border-radius:0 0 14px 14px;margin:0 auto;position:relative;z-index:2}
.pw-phone-screen{height:calc(100% - 18px);overflow-y:auto;position:relative}
`

const COLOR_PRESETS = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']
const FONT_CATEGORIES = [
  { name:'Handwriting', icon:'✍️', fonts:['Dancing Script','Pacifico','Caveat','Shadows Into Light','Satisfy','Kalam','Patrick Hand','Permanent Marker','Indie Flower','Gloria Hallelujah','Bad Script','Reenie Beanie'] },
  { name:'Professional', icon:'💼', fonts:['DM Sans','Inter','Poppins','Raleway','Nunito','Lato','Montserrat','Source Sans 3','Work Sans','Rubik','Roboto','Open Sans'] },
  { name:'Luxury', icon:'👑', fonts:['Playfair Display','Cormorant Garamond','Cinzel','Bodoni Moda','Prata','Taviraj','Libre Baskerville','Old Standard TT','Abril Fatface','Forum','Goudy Bookletter 1911','Marcellus'] },
  { name:'Playful', icon:'🎮', fonts:['Quicksand','Josefin Sans','Exo 2','Cabin','Ubuntu','Comfortaa','Bubblegum Sans','Fredoka One','Baloo 2','Righteous','Fugaz One','Lilita One'] },
]
const WATER_COLORS = ['#4da6ff','#22c55e','#ef4444','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#000000']

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return <div style={{ position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 18px',borderRadius:10,color:'#fff',fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:'0 8px 24px rgba(0,0,0,.15)',maxWidth:320,background: type==='success'?'#16a34a':'#dc2626',animation:'pwToastIn .28s cubic-bezier(.34,1.56,.64,1)' }}>{type==='success'?'✅':'❌'} {msg}</div>
}

function ColorPicker({ value, onChange, label }) {
  const [show, setShow] = useState(false)
  const ref = useRef()
  useEffect(() => { const fn = e => { if(ref.current&&!ref.current.contains(e.target)) setShow(false) }; document.addEventListener('mousedown',fn); return () => document.removeEventListener('mousedown',fn) }, [])
  return (
    <div ref={ref} style={{ position:'relative',display:'inline-flex',flexDirection:'column',gap:4 }}>
      {label && <span className="pw-label">{label}</span>}
      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
        <div className="pw-swatch" style={{ background:value||'#6366f1' }} onClick={()=>setShow(s=>!s)} />
        <input className="pw-input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="#000000" style={{ width:90,fontSize:12,padding:'5px 8px',background:'transparent' }} />
      </div>
      {show && <div className="pw-cpop">
        {COLOR_PRESETS.map(c=><div key={c} onClick={()=>{onChange(c);setShow(false)}} style={{ width:22,height:22,background:c,borderRadius:4,cursor:'pointer',border:value===c?'2px solid #6366f1':'1px solid #E5E7EB' }} />)}
        <input type="color" value={value||'#000000'} onChange={e=>onChange(e.target.value)} style={{ gridColumn:'span 7',width:'100%',height:28,padding:0,border:'none',background:'none',cursor:'pointer' }} />
        <button type="button" className="pw-btn pw-btn-secondary pw-btn-sm" style={{ gridColumn:'span 7',justifyContent:'center' }} onClick={()=>setShow(false)}>Close</button>
      </div>}
    </div>
  )
}

function ImageUpload({ label, url, onFile, onClear, accept }) {
  const ref = useRef()
  return <div>{label&&<span className="pw-label">{label}</span>}<input type="file" ref={ref} accept={accept||'image/png,image/jpeg,image/jpg,image/gif,image/webp'} style={{ display:'none' }} onChange={e=>{const f=e.target.files[0];if(f)onFile(f)}} /><div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginTop:4 }}><button type="button" className="pw-btn pw-btn-secondary pw-btn-sm" onClick={()=>ref.current.click()}>📷 Upload</button>{url&&<img src={url} className="pw-thumb" alt="" />}{url&&<button type="button" className="pw-icon-btn" style={{ border:'1.5px solid #FEE2E2',background:'#FFF5F5',color:'#DC2626' }} onClick={onClear}>✕</button>}</div></div>
}

function SoundSelect({ label, value, onChange, sounds }) {
  return <div className="pw-fg"><span className="pw-label">{label}</span><select className="pw-select" value={value||''} onChange={e=>onChange(e.target.value)}><option value="">— None —</option>{sounds.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
}

function RangeSlider({ label, value, onChange, min, max, step, unit }) {
  return (
    <div className="pw-fg">
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline' }}><span className="pw-label">{label}</span><span style={{ fontSize:12,fontWeight:700,color:'#6366f1' }}>{value}{unit||''}</span></div>
      <input type="range" min={min} max={max} step={step||1} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{ width:'100%',accentColor:'#6366f1' }} />
    </div>
  )
}

function PhonePreview({ settings, heading1Color, heading2Color }) {
  const waterColor = settings.water_color || '#4da6ff'
  const targetMl = settings.target_ml || 50
  const maxMl = settings.max_ml || 200
  const fillPct = Math.min((targetMl / maxMl) * 100, 100)
  return (
    <div className="pw-phone">
      <div className="pw-phone-notch" />
      <div className="pw-phone-screen" style={{ background:settings.bg_color||'#f0f4ff',padding:12,display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
        {settings.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ width:'100%',maxHeight:40,objectFit:'contain',borderRadius:6 }} />}
        <h2 style={{ fontSize:14,fontWeight:800,color:heading1Color,textAlign:'center',fontFamily:settings.font_family||'DM Sans' }}>{settings.heading_1||'Pouring Water'}</h2>
        {settings.heading_2 && <p style={{ fontSize:11,color:heading2Color,textAlign:'center' }}>{settings.heading_2}</p>}
        <div style={{ fontSize:12,fontWeight:700,color:settings.primary_color||'#6366f1',background:'rgba(255,255,255,0.8)',borderRadius:8,padding:'8px 16px',border:`2px solid ${settings.primary_color||'#6366f1'}30` }}>
          Target: {targetMl}ml ±{settings.tolerance_ml||5}ml
        </div>
        <div style={{ display:'flex',gap:20,alignItems:'flex-end',justifyContent:'center',margin:'12px 0' }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
            <div style={{ width:50,height:100,borderRadius:'4px 4px 8px 8px',border:`3px solid ${waterColor}50`,overflow:'hidden',position:'relative',background:'rgba(255,255,255,0.5)' }}>
              <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'100%',background:waterColor,opacity:0.3 }} />
            </div>
            <span style={{ fontSize:9,color:'#999' }}>Bottle</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
            <div style={{ width:70,height:100,borderRadius:'4px 4px 10px 10px',border:'3px solid #d1d5db',overflow:'hidden',position:'relative',background:'rgba(255,255,255,0.5)' }}>
              <div style={{ position:'absolute',bottom:0,left:0,right:0,height:`${fillPct}%`,background:waterColor,transition:'height 0.3s',opacity:0.7 }} />
              <div style={{ position:'absolute',top:'50%',left:2,right:2,borderTop:'1px dashed #999',opacity:0.5 }} />
              <span style={{ position:'absolute',top:'48%',right:2,fontSize:8,color:'#666',fontWeight:700 }}>{targetMl}ml</span>
            </div>
            <span style={{ fontSize:9,color:'#999' }}>Tumbler</span>
          </div>
        </div>
        <button style={{ background:`linear-gradient(135deg,${settings.primary_color||'#6366f1'},${settings.primary_color||'#6366f1'}cc)`,color:'#fff',border:'none',borderRadius:8,padding:'8px 20px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:settings.font_family||'DM Sans' }}>
          {settings.start_button_text||'Start Pouring →'}
        </button>
      </div>
    </div>
  )
}

export default function PouringBuilderPage() {
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
      api.get(`/games/${id}`), api.get(`/pouring/${id}/settings`), api.get(`/sounds/games/${id}/sounds`),
    ]).then(([gRes, sRes, soundRes]) => {
      const g = gRes.data.game
      setGame(g); setSettings(sRes.data.settings || {}); setSounds(soundRes.data.sounds || [])
      setFormFields(g.formFields || []); setEmailTemplate(g.emailTemplate || {}); setRedirectUrl(g.redirect_url || '')
      setText1(g.name || '')
      const s = sRes.data.settings || {}
      setHeading1Color(s.heading_1_color||'#1a1a2e'); setHeading2Color(s.heading_2_color||'#666666')
      setHeading3Color(s.heading_3_color||'#777777'); setDescColor(s.description_color||'#888888')
    }).catch(err => { setFetchError(err.response?.data?.message || err.message) }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['target_ml','tolerance_ml','max_ml','pour_speed','viscosity','water_color',
        'show_timer','time_limit_seconds','allow_retries','max_retries',
        'heading_1','heading_2','heading_3','description_text',
        'heading_1_color','heading_2_color','heading_3_color','description_color',
        'bg_color','primary_color','font_family','meta_description',
        'sound_correct_id','sound_wrong_id','sound_pour_id',
        'intro_text','outro_text','submit_button_text','continue_button_text','start_button_text',
        'terms_enabled','terms_text','terms_url']
      for (const f of fields) fd.append(f, settings[f]??'')
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile); else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._tyBgImageFile) fd.append('thankyou_bg_image', settings._tyBgImageFile); else if (settings.thankyou_bg_image_url) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile); else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url||'')
      if (settings._submitGifFile) fd.append('submit_confirm_gif', settings._submitGifFile); else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url||'')
      await api.put(`/pouring/${id}/settings`, fd)
      showToast('Settings saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSaving(false)
  }

  const saveDisplaySettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const sFields = ['heading_1','heading_2','heading_3','description_text','intro_text','meta_description','font_family',
        'bg_color','primary_color','show_timer','time_limit_seconds','allow_retries','max_retries',
        'target_ml','tolerance_ml','max_ml','pour_speed','viscosity','water_color',
        'sound_correct_id','sound_wrong_id','sound_pour_id']
      for (const f of sFields) fd.append(f, settings[f]??'')
      fd.append('heading_1_color', heading1Color); fd.append('heading_2_color', heading2Color)
      fd.append('heading_3_color', heading3Color); fd.append('description_color', descColor)
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile); else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile); else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url||'')
      await api.put(`/pouring/${id}/settings`, fd)
      await api.put(`/games/${id}`, { name: text1 || game?.name })
      showToast('Display settings saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSaving(false)
  }

  const saveFormFields = async () => { setSaving(true); try { await api.put(`/games/${id}/form-fields`, { fields: formFields }); showToast('Form fields saved') } catch { showToast('Error', 'error') }; setSaving(false) }
  const saveEmailTemplate = async () => { setSaving(true); try { await api.put(`/games/${id}/email-template`, emailTemplate); showToast('Email saved') } catch { showToast('Error', 'error') }; setSaving(false) }
  const addFormField = () => setFormFields([...formFields, { field_label:'New Field', field_type:'text', is_required:0, field_options:[] }])
  const removeFormField = i => { const f=[...formFields]; f.splice(i,1); setFormFields(f) }
  const updateFormField = (i,key,val) => { const f=[...formFields]; f[i]={...f[i],[key]:val}; setFormFields(f) }
  const uploadSound = async e => { const file=e.target.files[0]; if(!file)return; const fd=new FormData(); fd.append('file',file); fd.append('name',file.name.replace(/\.[^.]+$/,'')); fd.append('sound_type','custom'); setSoundUploading(true); try{const res=await api.post(`/sounds/games/${id}/sounds`,fd);setSounds(prev=>[res.data.sound,...prev]);showToast('Uploaded ✅')}catch(err){showToast('Error','error')}; setSoundUploading(false);e.target.value='' }
  const deleteSound = async s => { try{await api.delete(`/sounds/sounds/${s.id}`);setSounds(prev=>prev.filter(x=>x.id!==s.id));showToast('Deleted')}catch{showToast('Error','error')} }

  const gameLink = game ? `${window.location.origin}/play/${game.slug}/${game.client_slug}` : ''
  const TABS = [
    { id:'display', label:'🎨 Display' }, { id:'gameplay', label:'🎮 Gameplay' }, { id:'sounds', label:'🔊 Sounds' },
    { id:'form', label:'📋 Form' }, { id:'thankyou', label:'🙏 Thank You' }, { id:'email', label:'📧 Email' }, { id:'settings', label:'⚙️ Settings' },
  ]

  if (loading) return <div className="pw-wrap" style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><style>{LIGHT}</style><div style={{ textAlign:'center',color:'#9CA3AF' }}><div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #E5E7EB',borderTopColor:'#6366f1',animation:'pwSpin .8s linear infinite',margin:'0 auto 16px' }} />Loading…</div></div>
  if (fetchError) return <div className="pw-wrap" style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><style>{LIGHT}</style><div style={{ textAlign:'center' }}><h2 style={{ color:'#DC2626' }}>Error</h2><p style={{ color:'#9CA3AF' }}>{fetchError}</p><button className="pw-btn" onClick={loadData}>Retry</button></div></div>

  return (
    <div className="pw-wrap">
      <style>{LIGHT}</style>
      <div className="pw-header">
        <div style={{ display:'flex',alignItems:'center',gap:8 }}><button className="pw-btn pw-btn-secondary pw-btn-sm" onClick={()=>navigate('/dashboard/games')}>←</button><span style={{ fontWeight:700,fontSize:14 }}>{game?.name}</span></div>
        <div className="pw-tabs">{TABS.map(t=><button key={t.id} className={`pw-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
        <div style={{ display:'flex',gap:6,justifyContent:'flex-end' }}><button className="pw-btn pw-btn-secondary pw-btn-sm" onClick={()=>{navigator.clipboard.writeText(gameLink);showToast('Copied!')}}>🔗</button><a href={gameLink} target="_blank" rel="noreferrer" className="pw-btn pw-btn-secondary pw-btn-sm">👁</a></div>
      </div>
      <div className="pw-body">
        <div style={{ minWidth:0 }}>
          {tab==='display' && <div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🎮 Game Name</div><input className="pw-input" value={text1||''} onChange={e=>setText1(e.target.value)} placeholder="Pouring Water" /></div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🖼️ Images</div><div className="pw-2col">
              <ImageUpload label="Background" url={settings.bg_image_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,bg_image_url:e.target.result,_bgImageFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,bg_image_url:'',_bgImageFile:null})} />
              <ImageUpload label="Logo" url={settings.game_logo_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,game_logo_url:e.target.result,_gameLogoFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,game_logo_url:'',_gameLogoFile:null})} />
            </div></div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">📝 Headings</div>
              {[['Heading 1','heading_1',heading1Color,setHeading1Color],['Heading 2','heading_2',heading2Color,setHeading2Color],['Heading 3','heading_3',heading3Color,setHeading3Color]].map(([l,k,c,s])=><div className="pw-fg" key={k} style={{ marginBottom:10 }}><span className="pw-label">{l}</span><div style={{ display:'flex',gap:8,alignItems:'flex-end' }}><input className="pw-input" value={settings[k]||''} onChange={e=>setSettings({...settings,[key]:e.target.value})} style={{ flex:1 }} /><ColorPicker value={c} onChange={s} label="Color" /></div></div>)}
              <div className="pw-fg"><span className="pw-label">Description</span><div style={{ display:'flex',gap:8,alignItems:'flex-end' }}><textarea className="pw-input" rows={2} value={settings.description_text||''} onChange={e=>setSettings({...settings,description_text:e.target.value})} style={{ flex:1,resize:'vertical' }} /><ColorPicker value={descColor} onChange={setDescColor} label="Color" /></div></div>
            </div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🎨 Colors & Fonts</div><div className="pw-2col" style={{ marginBottom:12 }}>
              <ColorPicker value={settings.bg_color||'#f0f4ff'} onChange={v=>setSettings({...settings,bg_color:v})} label="BG Color" />
              <ColorPicker value={settings.primary_color||'#6366f1'} onChange={v=>setSettings({...settings,primary_color:v})} label="Primary Color" />
            </div>
            <div className="pw-fg"><span className="pw-label">Font</span><select className="pw-select" value={settings.font_family||'DM Sans'} onChange={e=>setSettings({...settings,font_family:e.target.value})}>{FONT_CATEGORIES.map(cat=><optgroup key={cat.name} label={`${cat.icon} ${cat.name}`}>{cat.fonts.map(f=><option key={f} value={f}>{f}</option>)}</optgroup>)}</select></div></div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🎯 Button</div><div className="pw-fg" style={{ maxWidth:280 }}><span className="pw-label">Start Button Text</span><input className="pw-input" value={settings.start_button_text||''} onChange={e=>setSettings({...settings,start_button_text:e.target.value})} placeholder="Start Pouring →" /></div></div>
            <div style={{ display:'flex',justifyContent:'flex-end',marginTop:20 }}><button className="pw-btn" onClick={saveDisplaySettings} disabled={saving} style={{ padding:'10px 28px' }}>{saving?'⏳…':'💾 Save'}</button></div>
          </div>}

          {tab==='gameplay' && <div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🎯 Target & Difficulty</div>
              <div className="pw-2col" style={{ marginBottom:14 }}>
                <RangeSlider label="Target Amount" value={settings.target_ml||50} onChange={v=>setSettings({...settings,target_ml:v})} min={5} max={settings.max_ml||200} step={5} unit="ml" />
                <RangeSlider label="Tolerance" value={settings.tolerance_ml||5} onChange={v=>setSettings({...settings,tolerance_ml:v})} min={1} max={50} step={1} unit="ml" />
              </div>
              <RangeSlider label="Max Tumbler Capacity" value={settings.max_ml||200} onChange={v=>setSettings({...settings,max_ml:v})} min={50} max={500} step={10} unit="ml" />
              <p style={{ fontSize:11,color:'#999',margin:'4px 0 14px' }}>Win condition: pour between {Math.max(0,(settings.target_ml||50)-(settings.tolerance_ml||5))}ml and {(settings.target_ml||50)+(settings.tolerance_ml||5)}ml</p>
            </div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">💧 Water Physics</div>
              <div className="pw-2col" style={{ marginBottom:14 }}>
                <RangeSlider label="Pour Speed" value={settings.pour_speed||1} onChange={v=>setSettings({...settings,pour_speed:v})} min={0.3} max={3} step={0.1} unit="x" />
                <RangeSlider label="Viscosity" value={settings.viscosity||1} onChange={v=>setSettings({...settings,viscosity:v})} min={0.3} max={3} step={0.1} unit="x" />
              </div>
              <p style={{ fontSize:11,color:'#999',marginBottom:12 }}>Higher viscosity = slower pour, more control needed. Lower = faster, harder to stop precisely.</p>
              <div>
                <span className="pw-label">Water Color</span>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginTop:4 }}>
                  {WATER_COLORS.map(c=><div key={c} onClick={()=>setSettings({...settings,water_color:c})} style={{ width:32,height:32,borderRadius:8,background:c,cursor:'pointer',border:settings.water_color===c?'3px solid #333':'3px solid transparent',boxShadow:'0 2px 4px rgba(0,0,0,0.1)' }} />)}
                  <input type="color" value={settings.water_color||'#4da6ff'} onChange={e=>setSettings({...settings,water_color:e.target.value})} style={{ width:32,height:32,borderRadius:8,border:'none',cursor:'pointer',padding:0 }} />
                </div>
              </div>
            </div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🔄 Retries & Timer</div>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}><input type="checkbox" id="showTimer" checked={Number(settings.show_timer)===1} onChange={e=>setSettings({...settings,show_timer:e.target.checked?1:0})} style={{ width:16,height:16 }} /><label htmlFor="showTimer" style={{ fontWeight:600,cursor:'pointer' }}>Show Timer</label></div>
              {Number(settings.show_timer)===1 && <div className="pw-fg" style={{ maxWidth:200,marginBottom:10 }}><span className="pw-label">Time Limit (0=unlimited)</span><input className="pw-input" type="number" min="0" value={settings.time_limit_seconds||0} onChange={e=>setSettings({...settings,time_limit_seconds:parseInt(e.target.value)||0})} /></div>}
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}><input type="checkbox" id="allowRetries" checked={Number(settings.allow_retries)===1} onChange={e=>setSettings({...settings,allow_retries:e.target.checked?1:0})} style={{ width:16,height:16 }} /><label htmlFor="allowRetries" style={{ fontWeight:600,cursor:'pointer' }}>Allow Retries</label></div>
              {Number(settings.allow_retries)===1 && <div className="pw-fg" style={{ maxWidth:200 }}><span className="pw-label">Max Retries</span><input className="pw-input" type="number" min="1" max="10" value={settings.max_retries||3} onChange={e=>setSettings({...settings,max_retries:parseInt(e.target.value)||3})} /></div>}
            </div>
            <div style={{ display:'flex',justifyContent:'flex-end',marginTop:20 }}><button className="pw-btn" onClick={saveDisplaySettings} disabled={saving}>{saving?'⏳…':'💾 Save Gameplay'}</button></div>
          </div>}

          {tab==='sounds' && <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}><h3 style={{ fontWeight:700,fontSize:16 }}>Sounds</h3><div><input type="file" accept="audio/*" onChange={uploadSound} style={{ display:'none' }} id="pwSound" /><button className="pw-btn" onClick={()=>document.getElementById('pwSound').click()} disabled={soundUploading}>{soundUploading?'⏳':'+ Upload'}</button></div></div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">🔊 Assign Sounds</div><div className="pw-2col">
              <SoundSelect label="Correct Sound" value={settings.sound_correct_id} onChange={v=>setSettings({...settings,sound_correct_id:v})} sounds={sounds} />
              <SoundSelect label="Wrong Sound" value={settings.sound_wrong_id} onChange={v=>setSettings({...settings,sound_wrong_id:v})} sounds={sounds} />
            </div><div className="pw-fg" style={{ marginTop:10, maxWidth:200 }}><SoundSelect label="Pour Sound" value={settings.sound_pour_id} onChange={v=>setSettings({...settings,sound_pour_id:v})} sounds={sounds} /></div>
            <div style={{ display:'flex',justifyContent:'flex-end',marginTop:12 }}><button className="pw-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳':'💾 Save'}</button></div></div>
          </div>}

          {tab==='form' && <div>
            <div className="pw-card" style={{ marginBottom:14 }}><div className="pw-card-title">📋 Fields</div>
              {formFields.map((f,i)=><div key={i} style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end',marginBottom:8,padding:'10px 12px',background:'#F9FAFB',borderRadius:8 }}>
                <div className="pw-fg" style={{ flex:2,minWidth:130 }}><span className="pw-label">Label</span><input className="pw-input" value={f.field_label} onChange={e=>updateFormField(i,'field_label',e.target.value)} /></div>
                <div className="pw-fg" style={{ flex:1,minWidth:110 }}><span className="pw-label">Type</span><select className="pw-select" value={f.field_type} onChange={e=>updateFormField(i,'field_type',e.target.value)}><option value="text">Text</option><option value="email">Email</option><option value="phone">Phone</option><option value="number">Number</option><option value="textarea">Textarea</option></select></div>
                <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,paddingBottom:2 }}><input type="checkbox" checked={Number(f.is_required)===1} onChange={e=>updateFormField(i,'is_required',e.target.checked?1:0)} style={{ width:16,height:16 }} />Required</label>
                <button className="pw-icon-btn" style={{ border:'1.5px solid #FEE2E2',background:'#FFF5F5',color:'#DC2626' }} onClick={()=>removeFormField(i)}>✕</button>
              </div>)}
              <div style={{ textAlign:'center',marginTop:10 }}><button className="pw-btn pw-btn-secondary" onClick={addFormField}>+ Add Field</button></div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:14 }}><button className="pw-btn" onClick={saveFormFields} disabled={saving}>{saving?'⏳':'💾 Save'}</button></div>
            </div>
          </div>}

          {tab==='thankyou' && <div className="pw-card">
            <div className="pw-card-title">🙏 Thank You</div>
            <div className="pw-2col" style={{ marginBottom:14 }}>
              <ImageUpload label="Thank You BG" url={settings.thankyou_bg_image_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,thankyou_bg_image_url:e.target.result,_tyBgImageFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,thankyou_bg_image_url:'',_tyBgImageFile:null})} />
              <ImageUpload label="Confirm GIF" url={settings.submit_confirm_gif_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,submit_confirm_gif_url:e.target.result,_submitGifFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,submit_confirm_gif_url:'',_submitGifFile:null})} />
            </div>
            <div className="pw-fg" style={{ marginBottom:10 }}><span className="pw-label">Outro</span><textarea className="pw-input" rows={2} value={settings.outro_text||''} onChange={e=>setSettings({...settings,outro_text:e.target.value})} style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex',justifyContent:'flex-end' }}><button className="pw-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳':'💾 Save'}</button></div>
          </div>}

          {tab==='email' && <div className="pw-card">
            <div className="pw-card-title">📧 Email</div>
            <div className="pw-2col" style={{ marginBottom:12 }}><div className="pw-fg"><span className="pw-label">Sender Name</span><input className="pw-input" value={emailTemplate.sender_name||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_name:e.target.value})} /></div><div className="pw-fg"><span className="pw-label">Sender Email</span><input className="pw-input" type="email" value={emailTemplate.sender_email||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_email:e.target.value})} /></div></div>
            <div className="pw-fg" style={{ marginBottom:12 }}><span className="pw-label">Subject</span><input className="pw-input" value={emailTemplate.subject||''} onChange={e=>setEmailTemplate({...emailTemplate,subject:e.target.value})} /></div>
            <div className="pw-fg" style={{ marginBottom:12 }}><span className="pw-label">Body HTML</span><textarea className="pw-input" rows={6} value={emailTemplate.body_html||''} onChange={e=>setEmailTemplate({...emailTemplate,body_html:e.target.value})} style={{ resize:'vertical',fontFamily:'monospace',fontSize:12 }} /></div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}><input type="checkbox" checked={!!emailTemplate.is_enabled} onChange={e=>setEmailTemplate({...emailTemplate,is_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} /><span style={{ fontWeight:600 }}>Enable</span></div>
            <div style={{ display:'flex',justifyContent:'flex-end' }}><button className="pw-btn" onClick={saveEmailTemplate} disabled={saving}>{saving?'⏳':'💾 Save'}</button></div>
          </div>}

          {tab==='settings' && <div className="pw-card">
            <div className="pw-card-title">⚙️ Settings</div>
            <div className="pw-fg" style={{ marginBottom:12 }}><span className="pw-label">Redirect URL</span><input className="pw-input" type="url" value={redirectUrl} onChange={e=>setRedirectUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="pw-fg" style={{ marginBottom:12 }}><span className="pw-label">Meta Description</span><textarea className="pw-input" rows={2} value={settings.meta_description||''} onChange={e=>setSettings({...settings,meta_description:e.target.value})} style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex',justifyContent:'flex-end' }}><button className="pw-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳':'💾 Save'}</button></div>
          </div>}
        </div>
        <PhonePreview settings={settings} heading1Color={heading1Color} heading2Color={heading2Color} />
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}
