import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap'

const LIGHT = `
@import url('${FONT_URL}');
.ws-wrap *,.ws-wrap *::before,.ws-wrap *::after{box-sizing:border-box}
.ws-wrap{font-family:'DM Sans',sans-serif;color:#111827;background:#f4f6fb;min-height:100vh}
@keyframes wsFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes wsToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes wsSpin{to{transform:rotate(360deg)}}
.ws-input,.ws-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#fafafa;outline:none;transition:border-color .15s,background .15s}
.ws-input:focus,.ws-select:focus{border-color:#818CF8;background:#fff}
.ws-select{appearance:none;cursor:pointer}
.ws-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.ws-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:background .14s,transform .1s}
.ws-btn:hover{background:#27272A}
.ws-btn:active{transform:scale(.98)}
.ws-btn:disabled{opacity:.55;cursor:not-allowed}
.ws-btn-sm{padding:7px 14px;font-size:12px}
.ws-btn-secondary{background:#fff;color:#374151;border:1.5px solid #E5E7EB}
.ws-btn-secondary:hover{background:#F3F4F6;border-color:#D1D5DB}
.ws-btn-danger{background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA}
.ws-btn-danger:hover{background:#FEE2E2}
.ws-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s;flex-shrink:0}
.ws-icon-btn:hover{background:#F0F0F0}
.ws-icon-btn.del{border-color:#FEE2E2;background:#FFF5F5;color:#DC2626}
.ws-icon-btn.del:hover{background:#FEE2E2}
.ws-card{background:#fff;border:1.5px solid #EAECF0;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);animation:wsFadeUp .25s ease both}
.ws-card-title{font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
.ws-section{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:14px;margin-bottom:12px}
.ws-section-title{font-size:10.5px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.ws-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ws-fg{display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px}
.ws-swatch{width:28px;height:28px;border-radius:6px;border:2px solid #E5E7EB;cursor:pointer;flex-shrink:0}
.ws-cpop{position:absolute;top:calc(100%+6px);left:0;z-index:300;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:220px}
.ws-thumb{height:44px;width:auto;border-radius:6px;border:1px solid #E5E7EB;object-fit:contain}
.ws-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px 24px;background:#fff;border-bottom:1.5px solid #EAECF0;position:sticky;top:0;z-index:50;min-height:56px}
.ws-tabs{display:flex;gap:4px}
.ws-tab{padding:8px 16px;border-radius:8px;border:none;background:transparent;color:#6B7280;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .14s;white-space:nowrap}
.ws-tab:hover{background:#F3F4F6;color:#374151}
.ws-tab.active{background:#EEF2FF;color:#4338CA;font-weight:600}
.ws-body{display:grid;grid-template-columns:1fr 320px;gap:24px;padding:24px;max-width:1200px;margin:0 auto}
.ws-phone{width:280px;height:560px;border-radius:36px;border:3px solid #D1D5DB;background:#F9FAFB;overflow:hidden;position:sticky;top:80px;box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 0 0 1px rgba(0,0,0,.05)}
.ws-phone-notch{width:120px;height:18px;background:#111;border-radius:0 0 14px 14px;margin:0 auto;position:relative;z-index:2}
.ws-phone-screen{height:calc(100% - 18px);overflow-y:auto;position:relative}
.ws-word-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#F0FDF4;border:1px solid #BBF7D0;font-size:12px;font-weight:600;color:#16A34A;margin:2px}
`

const COLOR_PRESETS = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']
const FONT_CATEGORIES = [
  { name:'Handwriting', icon:'✍️', fonts:['Dancing Script','Pacifico','Caveat','Shadows Into Light','Satisfy','Kalam','Patrick Hand','Permanent Marker','Indie Flower','Gloria Hallelujah','Bad Script','Reenie Beanie'] },
  { name:'Professional', icon:'💼', fonts:['DM Sans','Inter','Poppins','Raleway','Nunito','Lato','Montserrat','Source Sans 3','Work Sans','Rubik','Roboto','Open Sans'] },
  { name:'Luxury', icon:'👑', fonts:['Playfair Display','Cormorant Garamond','Cinzel','Bodoni Moda','Prata','Taviraj','Libre Baskerville','Old Standard TT','Abril Fatface','Forum','Goudy Bookletter 1911','Marcellus'] },
  { name:'Playful', icon:'🎮', fonts:['Quicksand','Josefin Sans','Exo 2','Cabin','Ubuntu','Comfortaa','Bubblegum Sans','Fredoka One','Baloo 2','Righteous','Fugaz One','Lilita One'] },
]

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 18px',borderRadius:10,color:'#fff',fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:'0 8px 24px rgba(0,0,0,.15)',maxWidth:320,background: type === 'success' ? '#16a34a' : '#dc2626',animation:'wsToastIn .28s cubic-bezier(.34,1.56,.64,1)' }}>{type === 'success' ? '✅' : '❌'} {msg}</div>
  )
}

function ColorPicker({ value, onChange, label }) {
  const [show, setShow] = useState(false)
  const ref = useRef()
  useEffect(() => { const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn) }, [])
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-flex', flexDirection:'column', gap:4 }}>
      {label && <span className="ws-label">{label}</span>}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div className="ws-swatch" style={{ background: value||'#6366f1' }} onClick={() => setShow(s => !s)} />
        <input className="ws-input" value={value||''} onChange={e => onChange(e.target.value)} placeholder="#000000" style={{ width:90, fontSize:12, padding:'5px 8px', background:'transparent' }} />
      </div>
      {show && (
        <div className="ws-cpop">
          {COLOR_PRESETS.map(c => <div key={c} onClick={() => { onChange(c); setShow(false) }} style={{ width:22, height:22, background:c, borderRadius:4, cursor:'pointer', border: value===c ? '2px solid #6366f1' : '1px solid #E5E7EB' }} />)}
          <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)} style={{ gridColumn:'span 7', width:'100%', height:28, padding:0, border:'none', background:'none', cursor:'pointer' }} />
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" style={{ gridColumn:'span 7', justifyContent:'center' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

function ImageUpload({ label, url, onFile, onClear, accept }) {
  const ref = useRef()
  return (
    <div>
      {label && <span className="ws-label">{label}</span>}
      <input type="file" ref={ref} accept={accept||'image/png,image/jpeg,image/jpg,image/gif,image/webp'} style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f) onFile(f) }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:4 }}>
        <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => ref.current.click()}>📷 Upload</button>
        {url && <img src={url} className="ws-thumb" alt="" />}
        {url && <button type="button" className="ws-icon-btn del" onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

function SoundSelect({ label, value, onChange, sounds }) {
  return (
    <div className="ws-fg">
      <span className="ws-label">{label}</span>
      <select className="ws-select" value={value||''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

function WordCard({ word, index, onUpdate, onDelete, saving }) {
  const [localWord, setLocalWord] = useState(word)
  useEffect(() => { setLocalWord(word) }, [word])
  const set = (k, v) => { const updated = { ...localWord, [k]: v }; setLocalWord(updated); onUpdate(updated) }

  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-end', marginBottom:10, padding:'10px 14px', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:10 }}>
      <div className="ws-fg" style={{ flex:2, minWidth:120 }}>
        <span className="ws-label">Word *</span>
        <input className="ws-input" value={localWord.word_text||''} onChange={e => set('word_text', e.target.value.toUpperCase())} placeholder="HELLO" style={{ fontFamily:'monospace', letterSpacing:2 }} />
      </div>
      <div className="ws-fg" style={{ flex:3, minWidth:140 }}>
        <span className="ws-label">Clue</span>
        <input className="ws-input" value={localWord.clue_text||''} onChange={e => set('clue_text', e.target.value)} placeholder="A greeting" />
      </div>
      <button className="ws-icon-btn del" onClick={() => onDelete(word)} style={{ marginBottom:2 }}>✕</button>
    </div>
  )
}

export default function WordSearchBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [tab, setTab] = useState('display')
  const [toast, setToast] = useState(null)
  const [settings, setSettings] = useState({})
  const [words, setWords] = useState([])
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
  const [newWordText, setNewWordText] = useState('')
  const [newWordClue, setNewWordClue] = useState('')
  const [showAddWord, setShowAddWord] = useState(false)
  const [openWordId, setOpenWordId] = useState(null)

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadData = useCallback(() => {
    setLoading(true); setFetchError(null)
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/wordsearch/${id}/settings`),
      api.get(`/wordsearch/games/${id}/words`),
      api.get(`/sounds/games/${id}/sounds`),
    ]).then(([gRes, sRes, wRes, soundRes]) => {
      const g = gRes.data.game
      setGame(g)
      setSettings(sRes.data.settings || {})
      setWords(wRes.data.words || [])
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
      setFetchError(err.response?.data?.message || err.message || 'Failed to load word search data')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['grid_rows','grid_cols','show_timer','time_limit_seconds','allow_hints',
        'heading_1','heading_2','heading_3','description_text',
        'heading_1_color','heading_2_color','heading_3_color','description_color',
        'bg_color','primary_color','font_family','meta_description',
        'sound_correct_id','sound_wrong_id',
        'intro_text','outro_text','submit_button_text','continue_button_text','start_button_text',
        'terms_enabled','terms_text','terms_url']
      for (const f of fields) fd.append(f, settings[f]??'')
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._tyBgImageFile) fd.append('thankyou_bg_image', settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url || '')
      if (settings._submitGifFile) fd.append('submit_confirm_gif', settings._submitGifFile)
      else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url || '')
      await api.put(`/wordsearch/${id}/settings`, fd)
      showToast('Settings saved ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message || err.message), 'error') }
    setSaving(false)
  }

  const saveDisplaySettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const sFields = ['heading_1','heading_2','heading_3','description_text','intro_text','meta_description','font_family',
        'bg_color','primary_color','show_timer','time_limit_seconds','allow_hints','grid_rows','grid_cols',
        'sound_correct_id','sound_wrong_id']
      for (const f of sFields) fd.append(f, settings[f]??'')
      fd.append('heading_1_color', heading1Color)
      fd.append('heading_2_color', heading2Color)
      fd.append('heading_3_color', heading3Color)
      fd.append('description_color', descColor)
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url||'')
      await api.put(`/wordsearch/${id}/settings`, fd)
      await api.put(`/games/${id}`, { name: text1 || game?.name })
      showToast('Display settings saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSaving(false)
  }

  const handleAddWord = async () => {
    if (!newWordText.trim()) { showToast('Word is required', 'error'); return }
    try {
      const res = await api.post(`/wordsearch/games/${id}/words`, { word_text: newWordText, clue_text: newWordClue, word_order: words.length })
      setWords(prev => [...prev, res.data.word])
      setNewWordText(''); setNewWordClue(''); setShowAddWord(false)
      showToast('Word added ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
  }

  const updateWord = async (w) => {
    try {
      await api.put(`/wordsearch/words/${w.id}`, { word_text: w.word_text, clue_text: w.clue_text, word_order: w.word_order })
    } catch {}
  }

  const handleWordToggle = async (wordId) => {
    if (wordId === openWordId) { setOpenWordId(null); return }
    if (openWordId !== null) {
      const dirtyWord = words.find(w => w.id === openWordId)
      if (dirtyWord) {
        try {
          await api.put(`/wordsearch/words/${openWordId}`, { word_text: dirtyWord.word_text, clue_text: dirtyWord.clue_text, word_order: dirtyWord.word_order })
          showToast('Word auto-saved ✅')
        } catch {}
      }
    }
    setOpenWordId(wordId)
  }

  const deleteWord = async (w) => {
    if (!confirm(`Delete "${w.word_text}"?`)) return
    try { await api.delete(`/wordsearch/words/${w.id}`); setWords(prev => prev.filter(x => x.id !== w.id)); showToast('Word deleted') }
    catch { showToast('Error', 'error') }
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
    const fd = new FormData(); fd.append('file', file); fd.append('name', file.name.replace(/\.[^.]+$/,'')); fd.append('sound_type', 'custom')
    setSoundUploading(true)
    try { const res = await api.post(`/sounds/games/${id}/sounds`, fd); setSounds(prev => [res.data.sound, ...prev]); showToast('Sound uploaded ✅') }
    catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSoundUploading(false); e.target.value=''
  }

  const deleteSound = async s => {
    try { await api.delete(`/sounds/sounds/${s.id}`); setSounds(prev => prev.filter(x => x.id!==s.id)); showToast('Sound deleted') }
    catch { showToast('Error', 'error') }
  }

  const gameLink = game ? `${window.location.origin}/play/${game.slug}/${game.client_slug}` : ''
  const TABS = [
    { id:'display',   label:'🎨 Display' },
    { id:'words',     label:'🔤 Words' },
    { id:'sounds',    label:'🔊 Sounds' },
    { id:'form',      label:'📋 Form' },
    { id:'thankyou',  label:'🙏 Thank You' },
    { id:'email',     label:'📧 Email' },
    { id:'settings',  label:'⚙️ Settings' },
  ]

  if (loading) return (
    <div className="ws-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', color:'#9CA3AF' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #E5E7EB',borderTopColor:'#6366f1',animation:'wsSpin .8s linear infinite',margin:'0 auto 16px' }} />
        Loading word search builder…
      </div>
    </div>
  )

  if (fetchError) return (
    <div className="ws-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h2 style={{ color:'#DC2626', marginBottom:8 }}>Failed to Load</h2>
        <p style={{ color:'#9CA3AF', marginBottom:20 }}>{fetchError}</p>
        <button className="ws-btn" onClick={loadData}>🔄 Retry</button>
      </div>
    </div>
  )

  return (
    <div className="ws-wrap">
      <style>{LIGHT}</style>
      <div className="ws-header">
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><button className="ws-icon-btn" onClick={() => navigate('/dashboard/games')} style={{ fontSize:16, lineHeight:1, marginTop:1 }}>←</button><div><div style={{ fontWeight:700, fontSize:14, color:'#1e1e2e', lineHeight:1.3 }}>{game?.name || 'Untitled'}</div><div style={{ fontSize:9.5, fontWeight:600, color:'#9899b8', letterSpacing:'.04em', textTransform:'uppercase', marginTop:1 }}>Word Search Builder</div></div></div>
        <div className="ws-tabs">
          {TABS.map(t => <button key={t.id} className={`ws-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
          <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => { navigator.clipboard.writeText(gameLink); showToast('Link copied!') }}>🔗</button>
          <a href={gameLink} target="_blank" rel="noreferrer" className="ws-btn ws-btn-secondary ws-btn-sm">👁</a>
        </div>
      </div>

      <div className="ws-body">
        <div style={{ minWidth:0 }}>
          {tab === 'display' && (
            <div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">🎮 Game Name</div>
                <input className="ws-input" value={text1||''} onChange={e=>setText1(e.target.value)} placeholder="Word Search" />
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">🖼️ Images</div>
                <div className="ws-2col">
                  <ImageUpload label="Background Image" url={settings.bg_image_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,bg_image_url:e.target.result,_bgImageFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,bg_image_url:'',_bgImageFile:null})} />
                  <ImageUpload label="Game Logo" url={settings.game_logo_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,game_logo_url:e.target.result,_gameLogoFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,game_logo_url:'',_gameLogoFile:null})} />
                </div>
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">📝 Headings & Description</div>
                {[['Heading 1','heading_1',heading1Color,setHeading1Color],['Heading 2','heading_2',heading2Color,setHeading2Color],['Heading 3','heading_3',heading3Color,setHeading3Color]].map(([label,key,color,set]) => (
                  <div className="ws-fg" key={key} style={{ marginBottom:10 }}>
                    <span className="ws-label">{label}</span>
                    <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                      <input className="ws-input" value={settings[key]||''} onChange={e=>setSettings({...settings,[key]:e.target.value})} style={{ flex:1 }} />
                      <ColorPicker value={color} onChange={set} label="Color" />
                    </div>
                  </div>
                ))}
                <div className="ws-fg">
                  <span className="ws-label">Description</span>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <textarea className="ws-input" rows={2} value={settings.description_text||''} onChange={e=>setSettings({...settings,description_text:e.target.value})} style={{ flex:1, resize:'vertical' }} />
                    <ColorPicker value={descColor} onChange={setDescColor} label="Color" />
                  </div>
                </div>
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">⚙️ Grid & Timer</div>
                <div className="ws-2col" style={{ marginBottom:12 }}>
                  <div className="ws-fg"><span className="ws-label">Grid Rows</span><input className="ws-input" type="number" min="8" max="20" value={settings.grid_rows||12} onChange={e=>setSettings({...settings,grid_rows:parseInt(e.target.value)||12})} /></div>
                  <div className="ws-fg"><span className="ws-label">Grid Columns</span><input className="ws-input" type="number" min="8" max="20" value={settings.grid_cols||12} onChange={e=>setSettings({...settings,grid_cols:parseInt(e.target.value)||12})} /></div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <input type="checkbox" id="showTimer" checked={Number(settings.show_timer)===1} onChange={e=>setSettings({...settings,show_timer:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  <label htmlFor="showTimer" style={{ fontWeight:600, cursor:'pointer' }}>Show Timer</label>
                </div>
                {Number(settings.show_timer)===1 && <div className="ws-fg" style={{ maxWidth:200 }}><span className="ws-label">Time Limit (seconds, 0=unlimited)</span><input className="ws-input" type="number" min="0" value={settings.time_limit_seconds||0} onChange={e=>setSettings({...settings,time_limit_seconds:parseInt(e.target.value)||0})} /></div>}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
                  <input type="checkbox" id="allowHints" checked={Number(settings.allow_hints)===1} onChange={e=>setSettings({...settings,allow_hints:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  <label htmlFor="allowHints" style={{ fontWeight:600, cursor:'pointer' }}>Allow Hints</label>
                </div>
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">🎨 Colors & Fonts</div>
                <div className="ws-2col" style={{ marginBottom:12 }}>
                  <ColorPicker value={settings.bg_color||'#f8f8ff'} onChange={v=>setSettings({...settings,bg_color:v})} label="Background Color" />
                  <ColorPicker value={settings.primary_color||'#6366f1'} onChange={v=>setSettings({...settings,primary_color:v})} label="Primary Color" />
                </div>
                <div className="ws-fg">
                  <span className="ws-label">Font Family</span>
                  <select className="ws-select" value={settings.font_family||'DM Sans'} onChange={e=>setSettings({...settings,font_family:e.target.value})}>
                    {FONT_CATEGORIES.map(cat => <optgroup key={cat.name} label={`${cat.icon} ${cat.name}`}>{cat.fonts.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>)}
                  </select>
                </div>
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">🎯 Start Button</div>
                <div className="ws-fg" style={{ maxWidth:280 }}><span className="ws-label">Button Text</span><input className="ws-input" value={settings.start_button_text||''} onChange={e=>setSettings({...settings,start_button_text:e.target.value})} placeholder="Start Word Search →" /></div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}><button className="ws-btn" onClick={saveDisplaySettings} disabled={saving} style={{ padding:'10px 28px' }}>{saving?'⏳ Saving…':'💾 Save Display Settings'}</button></div>
            </div>
          )}

          {tab === 'words' && (
            <div>
              <div className="ws-card">
                <div className="ws-card-title">🔤 Words ({words.length})</div>
                <p style={{ color:'#9CA3AF', fontSize:12, marginBottom:12 }}>Add words to hide in the word search grid. Words will be placed randomly in the grid.</p>
                {words.map((w, i) => (
                  <div key={w.id}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, marginBottom:6, cursor:'pointer' }} onClick={() => handleWordToggle(w.id)}>
                      <span style={{ fontWeight:700, fontSize:13, color:'#6366f1', minWidth:24 }}>#{i+1}</span>
                      <span style={{ fontWeight:700, fontSize:14, letterSpacing:1, flex:1 }}>{w.word_text}</span>
                      <span style={{ fontSize:12, color:'#9CA3AF' }}>{w.word_text.length} chars</span>
                      <span style={{ fontSize:16 }}>{openWordId===w.id ? '▲' : '▼'}</span>
                    </div>
                    {openWordId===w.id && (
                      <div style={{ padding:12, border:'1px solid #E5E7EB', borderTop:'none', borderRadius:'0 0 8px 8px', marginBottom:8 }}>
                        <div className="ws-2col">
                          <div className="ws-fg"><span className="ws-label">Word</span><input className="ws-input" value={w.word_text||''} onChange={e => { const updated=words.map(x=>x.id===w.id?{...x,word_text:e.target.value.toUpperCase()}:x); setWords(updated); updateWord({...w,word_text:e.target.value.toUpperCase()}) }} style={{ fontFamily:'monospace', letterSpacing:2 }} /></div>
                          <div className="ws-fg"><span className="ws-label">Clue</span><input className="ws-input" value={w.clue_text||''} onChange={e => { const updated=words.map(x=>x.id===w.id?{...x,clue_text:e.target.value}:x); setWords(updated); updateWord({...w,clue_text:e.target.value}) }} placeholder="Optional clue" /></div>
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}><button className="ws-btn ws-btn-danger ws-btn-sm" onClick={() => deleteWord(w)}>🗑 Delete</button></div>
                      </div>
                    )}
                  </div>
                ))}
                {showAddWord ? (
                  <div style={{ padding:14, background:'#F0FDF4', border:'2px dashed #BBF7D0', borderRadius:10, marginTop:10 }}>
                    <div className="ws-2col" style={{ marginBottom:10 }}>
                      <div className="ws-fg"><span className="ws-label">Word *</span><input className="ws-input" value={newWordText} onChange={e=>setNewWordText(e.target.value.toUpperCase())} placeholder="HELLO" autoFocus style={{ fontFamily:'monospace', letterSpacing:2 }} /></div>
                      <div className="ws-fg"><span className="ws-label">Clue (optional)</span><input className="ws-input" value={newWordClue} onChange={e=>setNewWordClue(e.target.value)} placeholder="A greeting" /></div>
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={()=>{setShowAddWord(false);setNewWordText('');setNewWordClue('')}}>Cancel</button>
                      <button className="ws-btn ws-btn-sm" onClick={handleAddWord}>+ Add Word</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign:'center', marginTop:12 }}><button className="ws-btn ws-btn-secondary" onClick={()=>setShowAddWord(true)}>+ Add Word</button></div>
                )}
              </div>
            </div>
          )}

          {tab === 'sounds' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ fontWeight:700, fontSize:16 }}>Sound Library</h3>
                <div><input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onChange={uploadSound} style={{ display:'none' }} id="wsSoundUpload" /><button className="ws-btn" onClick={()=>document.getElementById('wsSoundUpload').click()} disabled={soundUploading}>{soundUploading?'⏳…':'+ Upload Sound'}</button></div>
              </div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">🔊 Assign Sounds</div>
                <div className="ws-2col">
                  <SoundSelect label="Correct Sound" value={settings.sound_correct_id} onChange={v=>setSettings({...settings,sound_correct_id:v})} sounds={sounds} />
                  <SoundSelect label="Wrong Sound" value={settings.sound_wrong_id} onChange={v=>setSettings({...settings,sound_wrong_id:v})} sounds={sounds} />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}><button className="ws-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳…':'💾 Save Sounds'}</button></div>
              </div>
              {sounds.length > 0 && (
                <div className="ws-card">
                  <div className="ws-card-title">📁 Sounds ({sounds.length})</div>
                  {sounds.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{ flex:1, fontSize:13 }}>{s.name}</span>
                      <audio controls src={s.url||s.file_url} style={{ height:32, flexShrink:0 }} />
                      <button className="ws-icon-btn del" onClick={()=>deleteSound(s)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'form' && (
            <div>
              <div className="ws-card" style={{ marginBottom:14 }}>
                <div className="ws-card-title">📋 Registration Fields</div>
                {formFields.map((f,i) => (
                  <div key={i} style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end', marginBottom:8, padding:'10px 12px', background:'#F9FAFB', borderRadius:8 }}>
                    <div className="ws-fg" style={{ flex:2, minWidth:130 }}><span className="ws-label">Label</span><input className="ws-input" value={f.field_label} onChange={e=>updateFormField(i,'field_label',e.target.value)} /></div>
                    <div className="ws-fg" style={{ flex:1, minWidth:110 }}><span className="ws-label">Type</span><select className="ws-select" value={f.field_type} onChange={e=>updateFormField(i,'field_type',e.target.value)}><option value="text">Text</option><option value="email">Email</option><option value="phone">Phone</option><option value="number">Number</option><option value="textarea">Textarea</option></select></div>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, paddingBottom:2 }}><input type="checkbox" checked={Number(f.is_required)===1} onChange={e=>updateFormField(i,'is_required',e.target.checked?1:0)} style={{ width:16,height:16 }} />Required</label>
                    <button className="ws-icon-btn del" onClick={()=>removeFormField(i)}>✕</button>
                  </div>
                ))}
                <div style={{ textAlign:'center', marginTop:10 }}><button className="ws-btn ws-btn-secondary" onClick={addFormField}>+ Add Field</button></div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:14 }}><button className="ws-btn" onClick={saveFormFields} disabled={saving}>{saving?'⏳…':'💾 Save'}</button></div>
              </div>
              <div className="ws-card">
                <div className="ws-card-title">☑️ Terms</div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}><input type="checkbox" id="wsTerms" checked={Number(settings.terms_enabled)===1} onChange={e=>setSettings({...settings,terms_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} /><label htmlFor="wsTerms" style={{ fontWeight:600, cursor:'pointer' }}>Require T&C</label></div>
                {Number(settings.terms_enabled)===1 && <div className="ws-2col"><div className="ws-fg"><span className="ws-label">Label</span><input className="ws-input" value={settings.terms_text||''} onChange={e=>setSettings({...settings,terms_text:e.target.value})} /></div><div className="ws-fg"><span className="ws-label">URL</span><input className="ws-input" value={settings.terms_url||''} onChange={e=>setSettings({...settings,terms_url:e.target.value})} /></div></div>}
              </div>
            </div>
          )}

          {tab === 'thankyou' && (
            <div className="ws-card">
              <div className="ws-card-title">🙏 Thank You</div>
              <div className="ws-2col" style={{ marginBottom:14 }}>
                <ImageUpload label="Thank You BG" url={settings.thankyou_bg_image_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,thankyou_bg_image_url:e.target.result,_tyBgImageFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,thankyou_bg_image_url:'',_tyBgImageFile:null})} />
                <ImageUpload label="Confirm GIF" url={settings.submit_confirm_gif_url} onFile={f=>{const r=new FileReader();r.onload=e=>setSettings({...settings,submit_confirm_gif_url:e.target.result,_submitGifFile:f});r.readAsDataURL(f)}} onClear={()=>setSettings({...settings,submit_confirm_gif_url:'',_submitGifFile:null})} />
              </div>
              <div className="ws-fg" style={{ marginBottom:10 }}><span className="ws-label">Outro Text</span><textarea className="ws-input" rows={2} value={settings.outro_text||''} onChange={e=>setSettings({...settings,outro_text:e.target.value})} style={{ resize:'vertical' }} /></div>
              <div className="ws-fg" style={{ marginBottom:10 }}><span className="ws-label">Submit Button</span><input className="ws-input" value={settings.submit_button_text||''} onChange={e=>setSettings({...settings,submit_button_text:e.target.value})} placeholder="Submit & Explore" /></div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="ws-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳…':'💾 Save'}</button></div>
            </div>
          )}

          {tab === 'email' && (
            <div className="ws-card">
              <div className="ws-card-title">📧 Email</div>
              <div className="ws-2col" style={{ marginBottom:12 }}><div className="ws-fg"><span className="ws-label">Sender Name</span><input className="ws-input" value={emailTemplate.sender_name||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_name:e.target.value})} /></div><div className="ws-fg"><span className="ws-label">Sender Email</span><input className="ws-input" type="email" value={emailTemplate.sender_email||''} onChange={e=>setEmailTemplate({...emailTemplate,sender_email:e.target.value})} /></div></div>
              <div className="ws-fg" style={{ marginBottom:12 }}><span className="ws-label">Subject</span><input className="ws-input" value={emailTemplate.subject||''} onChange={e=>setEmailTemplate({...emailTemplate,subject:e.target.value})} /></div>
              <div className="ws-fg" style={{ marginBottom:12 }}><span className="ws-label">Body HTML</span><textarea className="ws-input" rows={6} value={emailTemplate.body_html||''} onChange={e=>setEmailTemplate({...emailTemplate,body_html:e.target.value})} style={{ resize:'vertical', fontFamily:'monospace', fontSize:12 }} /></div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}><input type="checkbox" checked={!!emailTemplate.is_enabled} onChange={e=>setEmailTemplate({...emailTemplate,is_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} /><span style={{ fontWeight:600 }}>Enable Email</span></div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="ws-btn" onClick={saveEmailTemplate} disabled={saving}>{saving?'⏳…':'💾 Save'}</button></div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="ws-card">
              <div className="ws-card-title">⚙️ Settings</div>
              <div className="ws-fg" style={{ marginBottom:12 }}><span className="ws-label">Redirect URL</span><input className="ws-input" type="url" value={redirectUrl} onChange={e=>setRedirectUrl(e.target.value)} placeholder="https://..." /></div>
              <div className="ws-fg" style={{ marginBottom:12 }}><span className="ws-label">Meta Description</span><textarea className="ws-input" rows={2} value={settings.meta_description||''} onChange={e=>setSettings({...settings,meta_description:e.target.value})} style={{ resize:'vertical' }} /></div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="ws-btn" onClick={saveSettings} disabled={saving}>{saving?'⏳…':'💾 Save'}</button></div>
            </div>
          )}
        </div>

        <div className="ws-phone">
          <div className="ws-phone-notch" />
          <div className="ws-phone-screen" style={{ background: settings.bg_color || '#f8f8ff', padding:12 }}>
            {settings.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ width:'100%', maxHeight:40, objectFit:'contain', borderRadius:6, marginBottom:8 }} />}
            <h2 style={{ fontSize:14, fontWeight:800, color: heading1Color, textAlign:'center', marginBottom:4, fontFamily: settings.font_family||'DM Sans' }}>{settings.heading_1 || 'Word Search'}</h2>
            {settings.heading_2 && <p style={{ fontSize:11, color: heading2Color, textAlign:'center', marginBottom:6 }}>{settings.heading_2}</p>}
            <div style={{ width:'100%', aspectRatio:'1', borderRadius:8, border:'2px dashed #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:11, marginBottom:8 }}>
              {settings.grid_rows||12}×{settings.grid_cols||12} grid
            </div>
            <div style={{ fontSize:10, color:'#9CA3AF', textAlign:'center', marginBottom:6 }}>{words.length} words</div>
            {words.slice(0,8).map(w => <span key={w.id} className="ws-word-chip">{w.word_text}</span>)}
            {words.length > 8 && <span style={{ fontSize:10, color:'#9CA3AF' }}>+{words.length-8} more</span>}
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}
