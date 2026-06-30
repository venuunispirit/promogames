import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap'

const LIGHT = `
@import url('${FONT_URL}');
.mb-wrap *,.mb-wrap *::before,.mb-wrap *::after{box-sizing:border-box}
.mb-wrap{font-family:'DM Sans',sans-serif;color:#111827;background:#f4f6fb;min-height:100vh}
@keyframes mbFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mbToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes mbSpin{to{transform:rotate(360deg)}}
.mb-input,.mb-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#fafafa;outline:none;transition:border-color .15s,background .15s}
.mb-input:focus,.mb-select:focus{border-color:#818CF8;background:#fff}
.mb-select{appearance:none;cursor:pointer}
.mb-label{display:block;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.mb-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.mb-btn:hover{background:#27272A}
.mb-btn:active{transform:scale(.98)}
.mb-btn:disabled{opacity:.55;cursor:not-allowed}
.mb-btn-sm{padding:7px 14px;font-size:12px}
.mb-btn-secondary{background:#fff;color:#374151;border:1.5px solid #E5E7EB}
.mb-btn-secondary:hover{background:#F3F4F6;border-color:#D1D5DB}
.mb-btn-danger{background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA}
.mb-btn-danger:hover{background:#FEE2E2}
.mb-card{background:#fff;border:1.5px solid #EAECF0;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);animation:mbFadeUp .25s ease both}
.mb-card-title{font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
.mb-section{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:14px;margin-bottom:12px}
.mb-section-title{font-size:10.5px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.mb-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.mb-row{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
.mb-col{flex:1;min-width:140px}
.mb-fg{display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px}
.mb-swatch{width:28px;height:28px;border-radius:6px;border:2px solid #E5E7EB;cursor:pointer;flex-shrink:0}
.mb-cpop{position:absolute;top:calc(100%+6px);left:0;z-index:300;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:220px}
.mb-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px 24px;background:#fff;border-bottom:1.5px solid #EAECF0;position:sticky;top:0;z-index:50;min-height:56px}
.mb-tabs{display:flex;gap:4px}
.mb-tab{padding:8px 16px;border-radius:8px;border:none;background:transparent;color:#6B7280;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .14s;white-space:nowrap}
.mb-tab:hover{background:#F3F4F6;color:#374151}
.mb-tab.active{background:#EEF2FF;color:#4338CA;font-weight:600}
.mb-body{display:grid;grid-template-columns:1fr 320px;gap:24px;padding:24px;max-width:1200px;margin:0 auto}
.mb-phone{width:280px;height:560px;border-radius:36px;border:3px solid #D1D5DB;background:#F9FAFB;overflow:hidden;position:sticky;top:80px;box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 0 0 1px rgba(0,0,0,.05)}
.mb-phone-notch{width:120px;height:18px;background:#111;border-radius:0 0 14px 14px;margin:0 auto;position:relative;z-index:2}
.mb-phone-screen{height:calc(100% - 18px);overflow-y:auto;position:relative}
`

const COLOR_PRESETS = ['#0f172a','#1e293b','#6366f1','#ffffff','#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316']

const FONT_CATEGORIES = [
  { name:'Professional', icon:'💼', fonts:['DM Sans','Inter','Poppins','Raleway','Nunito','Lato','Montserrat','Source Sans 3','Work Sans','Rubik','Roboto','Open Sans'] },
  { name:'Playful', icon:'🎮', fonts:['Quicksand','Josefin Sans','Exo 2','Cabin','Ubuntu','Comfortaa','Fredoka One','Baloo 2','Righteous'] },
]

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 18px',borderRadius:10,
      color:'#fff',fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif",
      boxShadow:'0 8px 24px rgba(0,0,0,.15)',maxWidth:320,
      background: type === 'success' ? '#16a34a' : '#dc2626',
      animation:'mbToastIn .28s cubic-bezier(.34,1.56,.64,1)',
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
      {label && <span className="mb-label">{label}</span>}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div className="mb-swatch" style={{ background: value||'#6366f1' }} onClick={() => setShow(s => !s)} />
        <input className="mb-input" value={value||''} onChange={e => onChange(e.target.value)} style={{ width:90, fontSize:12, padding:'5px 8px', background:'transparent' }} />
      </div>
      {show && (
        <div className="mb-cpop">
          {COLOR_PRESETS.map(c => (
            <div key={c} onClick={() => { onChange(c); setShow(false) }}
              style={{ width:22, height:22, background:c, borderRadius:4, cursor:'pointer', border: value===c ? '2px solid #6366f1' : '1px solid #E5E7EB' }} />
          ))}
          <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)}
            style={{ gridColumn:'span 7', width:'100%', height:28, padding:0, border:'none', background:'none', cursor:'pointer' }} />
          <button type="button" className="mb-btn mb-btn-secondary mb-btn-sm" style={{ gridColumn:'span 7', justifyContent:'center' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

function SoundSelect({ label, value, onChange, sounds }) {
  return (
    <div className="mb-fg">
      <span className="mb-label">{label}</span>
      <select className="mb-select" value={value||''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

export default function MazeBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [tab, setTab] = useState('gameplay')
  const [toast, setToast] = useState(null)
  const [settings, setSettings] = useState({})
  const [sounds, setSounds] = useState([])
  const [saving, setSaving] = useState(false)
  const [soundUploading, setSoundUploading] = useState(false)
  const [formFields, setFormFields] = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [redirectUrl, setRedirectUrl] = useState('')
  const [gameSlug, setGameSlug] = useState('')
  const [heading1Color, setHeading1Color] = useState('#1a1a2e')
  const [heading2Color, setHeading2Color] = useState('#666666')
  const [descColor, setDescColor] = useState('#888888')

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadData = useCallback(() => {
    setLoading(true); setFetchError(null)
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/maze/${id}/settings`),
      api.get(`/sounds/games/${id}/sounds`),
    ]).then(([gRes, sRes, soundRes]) => {
      const g = gRes.data.game
      setGame(g)
      const s = sRes.data.settings || {}
      setSettings(s)
      setSounds(soundRes.data.sounds || [])
      setFormFields(g.formFields || [])
      setEmailTemplate(g.emailTemplate || {})
      setRedirectUrl(g.redirect_url || '')
      setGameSlug(g.slug || '')
      setHeading1Color(s.heading_1_color || '#1a1a2e')
      setHeading2Color(s.heading_2_color || '#666666')
      setDescColor(s.description_color || '#888888')
    }).catch(err => {
      setFetchError(err.response?.data?.message || err.message || 'Failed to load')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const body = {
        total_levels: settings.total_levels,
        grid_size_min: settings.grid_size_min,
        grid_size_max: settings.grid_size_max,
        show_timer: settings.show_timer,
        time_limit_seconds: settings.time_limit_seconds,
        collectible_count: settings.collectible_count,
        collectible_label: settings.collectible_label,
        heading_1: settings.heading_1, heading_2: settings.heading_2, heading_3: settings.heading_3,
        description_text: settings.description_text, font_family: settings.font_family,
        sound_collect_id: settings.sound_collect_id, sound_complete_id: settings.sound_complete_id,
        overlay_animation_in: settings.overlay_animation_in, overlay_animation_out: settings.overlay_animation_out,
        intro_text: settings.intro_text, outro_text: settings.outro_text,
        submit_button_text: settings.submit_button_text, continue_button_text: settings.continue_button_text,
        start_button_text: settings.start_button_text,
        terms_enabled: settings.terms_enabled, terms_text: settings.terms_text, terms_url: settings.terms_url,
        meta_description: settings.meta_description,
        bg_color: settings.bg_color, primary_color: settings.primary_color,
        wall_color: settings.wall_color, path_color: settings.path_color,
        heading_1_color: heading1Color, heading_2_color: heading2Color, description_color: descColor,
      }
      await api.put(`/maze/${id}/settings`, body)
      showToast('Settings saved')
    } catch (err) {
      showToast('Error saving: ' + (err.response?.data?.message || err.message), 'error')
    }
    setSaving(false)
  }

  const handleBack = () => navigate('/dashboard/games')
  const saveFormFields = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/form-fields`, { fields: formFields }); showToast('Form fields saved') }
    catch (err) { showToast('Error saving form fields', 'error') }
    setSaving(false)
  }
  const saveEmailTemplate = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/email-template`, emailTemplate); showToast('Email template saved') }
    catch (err) { showToast('Error saving email template', 'error') }
    setSaving(false)
  }
  const addFormField = () => setFormFields([...formFields, { field_label:'New Field', field_type:'text', is_required:0, field_options:[] }])
  const removeFormField = i => { const f=[...formFields]; f.splice(i,1); setFormFields(f) }
  const updateFormField = (i, key, val) => { const f=[...formFields]; f[i]={ ...f[i],[key]:val }; setFormFields(f) }

  const loadFont = (font) => {
    if (!font || font === 'DM Sans') return
    const id = 'gf-' + font.replace(/\s/g, '-')
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`
    document.head.appendChild(link)
  }
  useEffect(() => { if (settings.font_family) loadFont(settings.font_family) }, [settings.font_family])

  const TABS = [
    { id:'gameplay', label:'Maze' },
    { id:'form',     label:'Player Form' },
    { id:'thankyou', label:'Thankyou' },
    { id:'email',    label:'Email' },
    { id:'sounds',   label:'Audio' },
    { id:'settings', label:'Settings' },
  ]

  if (loading) return (<div className="mb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div style={{ textAlign:'center' }}><div style={{ width:36,height:36,borderRadius:'50%',border:'3px solid #E5E7EB',borderTopColor:'#6366f1',animation:'mbSpin .8s linear infinite',margin:'0 auto 12px' }} /><div style={{ color:'#9CA3AF',fontSize:14 }}>Loading maze builder…</div></div></div>)
  if (fetchError) return (<div className="mb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:20 }}><div className="mb-card" style={{ maxWidth:400, textAlign:'center', padding:32 }}><div style={{ fontSize:40, marginBottom:12 }}>⚠️</div><h2 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Failed to load</h2><p style={{ color:'#6B7280', fontSize:14, marginBottom:20 }}>{fetchError}</p><button className="mb-btn" onClick={loadData}>Retry</button></div></div>)

  const primary = settings.primary_color || '#6366f1'
  const ff = settings.font_family || 'DM Sans'

  return (
    <div className="mb-wrap">
      <style>{LIGHT}</style>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="mb-header">
        <div><button className="mb-icon-btn" onClick={handleBack} style={{ fontSize:16, lineHeight:1 }}>←</button></div>
        <div className="mb-tabs">{TABS.map(t => (<button key={t.id} className={`mb-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>))}</div>
        <div style={{ textAlign:'right' }}><button className="mb-btn mb-btn-sm" onClick={saveSettings} disabled={saving}>{saving?'⏳ Saving…':'💾 Save'}</button></div>
      </div>
      <div className="mb-body">
        <div className="mb-left">
          {tab === 'gameplay' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Maze Levels</div>
                <div className="mb-2col">
                  <div className="mb-fg"><span className="mb-label">Total Levels</span><input className="mb-input" type="number" min={1} max={200} value={settings.total_levels??50} onChange={e => setSettings({...settings,total_levels:parseInt(e.target.value)||50})} /></div>
                  <div className="mb-fg"><span className="mb-label">Collectibles per Maze</span><input className="mb-input" type="number" min={0} max={20} value={settings.collectible_count??3} onChange={e => setSettings({...settings,collectible_count:parseInt(e.target.value)||3})} /></div>
                </div>
                <div className="mb-2col" style={{ marginTop:12 }}>
                  <div className="mb-fg"><span className="mb-label">Collectible Label</span><input className="mb-input" value={settings.collectible_label||'★'} onChange={e => setSettings({...settings,collectible_label:e.target.value})} placeholder="★" /></div>
                </div>
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Grid Size</div>
                <p style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>Maze size grows with level — Level 1 = min, Level {settings.total_levels||50} = max</p>
                <div className="mb-2col">
                  <div className="mb-fg"><span className="mb-label">Min Grid (rows/cols)</span><input className="mb-input" type="number" min={3} max={10} value={settings.grid_size_min??5} onChange={e => setSettings({...settings,grid_size_min:parseInt(e.target.value)||5})} /></div>
                  <div className="mb-fg"><span className="mb-label">Max Grid (rows/cols)</span><input className="mb-input" type="number" min={5} max={40} value={settings.grid_size_max??20} onChange={e => setSettings({...settings,grid_size_max:parseInt(e.target.value)||20})} /></div>
                </div>
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Timer</div>
                <div className="mb-2col">
                  <div className="mb-fg"><label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}><input type="checkbox" checked={!!settings.show_timer} onChange={e => setSettings({...settings,show_timer:e.target.checked?1:0})} /> Show Timer</label></div>
                  {!!settings.show_timer && (<div className="mb-fg"><span className="mb-label">Time Limit (seconds)</span><input className="mb-input" type="number" min={0} value={settings.time_limit_seconds??0} onChange={e => setSettings({...settings,time_limit_seconds:parseInt(e.target.value)||0})} /></div>)}
                </div>
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Colors</div>
                <div className="mb-row">
                  <ColorPicker label="Background" value={settings.bg_color||'#0f172a'} onChange={v => setSettings({...settings,bg_color:v})} />
                  <ColorPicker label="Walls" value={settings.wall_color||'#1e293b'} onChange={v => setSettings({...settings,wall_color:v})} />
                  <ColorPicker label="Path" value={settings.path_color||'#ffffff'} onChange={v => setSettings({...settings,path_color:v})} />
                  <ColorPicker label="Primary" value={settings.primary_color||'#6366f1'} onChange={v => setSettings({...settings,primary_color:v})} />
                </div>
              </div>
              <button className="mb-btn" onClick={saveSettings} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>{saving?'⏳ Saving…':'💾 Save'}</button>
            </div>
          )}
          {tab === 'form' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-2col">
                  <div className="mb-fg"><span className="mb-label">Heading 1</span><input className="mb-input" value={settings.heading_1||''} onChange={e => setSettings({...settings,heading_1:e.target.value})} placeholder="Maze Runner" /></div>
                  <ColorPicker label="Color" value={heading1Color} onChange={setHeading1Color} />
                </div>
                <div className="mb-2col" style={{ marginTop:12 }}>
                  <div className="mb-fg"><span className="mb-label">Heading 2</span><input className="mb-input" value={settings.heading_2||''} onChange={e => setSettings({...settings,heading_2:e.target.value})} placeholder="Navigate the maze!" /></div>
                  <ColorPicker label="Color" value={heading2Color} onChange={setHeading2Color} />
                </div>
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Intro Text</span><textarea className="mb-input" rows={3} value={settings.intro_text||''} onChange={e => setSettings({...settings,intro_text:e.target.value})} placeholder="Find your way through the maze…" /></div>
                <ColorPicker label="Intro Color" value={descColor} onChange={setDescColor} />
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Form Fields</div>
                {formFields.map((ff, i) => (
                  <div key={i} className="mb-section">
                    <div className="mb-2col">
                      <div className="mb-fg"><span className="mb-label">Label</span><input className="mb-input" value={ff.field_label} onChange={e => updateFormField(i,'field_label',e.target.value)} /></div>
                      <div className="mb-fg"><span className="mb-label">Type</span><select className="mb-select" value={ff.field_type} onChange={e => updateFormField(i,'field_type',e.target.value)}>
                        <option value="text">Text</option><option value="email">Email</option><option value="phone">Phone</option><option value="number">Number</option>
                      </select></div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}><input type="checkbox" checked={!!ff.is_required} onChange={e => updateFormField(i,'is_required',e.target.checked?1:0)} /> Required</label>
                      <button type="button" className="mb-btn mb-btn-danger mb-btn-sm" onClick={() => removeFormField(i)} style={{ marginLeft:'auto' }}>Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="mb-btn mb-btn-secondary mb-btn-sm" onClick={addFormField} style={{ marginTop:4 }}>+ Add Field</button>
                <button type="button" className="mb-btn mb-btn-sm" onClick={saveFormFields} style={{ marginLeft:8 }}>Save Form</button>
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-row">
                  <div className="mb-col">
                    <div className="mb-section-title">Terms</div>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}><input type="checkbox" checked={!!settings.terms_enabled} onChange={e => setSettings({...settings,terms_enabled:e.target.checked?1:0})} /> Enable</label>
                    {!!settings.terms_enabled && (<><div className="mb-fg" style={{ marginTop:8 }}><span className="mb-label">Label</span><input className="mb-input" value={settings.terms_text||''} onChange={e => setSettings({...settings,terms_text:e.target.value})} /></div>
                    <div className="mb-fg" style={{ marginTop:8 }}><span className="mb-label">URL</span><input className="mb-input" value={settings.terms_url||''} onChange={e => setSettings({...settings,terms_url:e.target.value})} /></div></>)}
                  </div>
                  <div className="mb-col">
                    <div className="mb-section-title">Start Button</div>
                    <div className="mb-fg"><span className="mb-label">Text</span><input className="mb-input" value={settings.start_button_text||''} onChange={e => setSettings({...settings,start_button_text:e.target.value})} placeholder="Start" /></div>
                  </div>
                </div>
              </div>
              <button className="mb-btn" onClick={saveSettings} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>{saving?'⏳ Saving…':'💾 Save'}</button>
            </div>
          )}
          {tab === 'thankyou' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Level Complete / Finish</div>
                <div className="mb-fg"><span className="mb-label">Outro Text</span><textarea className="mb-input" rows={3} value={settings.outro_text||''} onChange={e => setSettings({...settings,outro_text:e.target.value})} placeholder="🎉 Maze complete!" /></div>
                <ColorPicker label="Text Color" value={settings.outro_text_color||'#1a1a2e'} onChange={v => setSettings({...settings,outro_text_color:v})} />
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Submit Button Text</span><input className="mb-input" value={settings.submit_button_text||''} onChange={e => setSettings({...settings,submit_button_text:e.target.value})} placeholder="Continue →" /></div>
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Continue Button Text</span><input className="mb-input" value={settings.continue_button_text||''} onChange={e => setSettings({...settings,continue_button_text:e.target.value})} placeholder="Continue →" /></div>
              </div>
              <button className="mb-btn" onClick={saveSettings} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>{saving?'⏳ Saving…':'💾 Save'}</button>
            </div>
          )}
          {tab === 'email' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', marginBottom:14 }}>
                  <input type="checkbox" checked={!!emailTemplate.is_enabled} onChange={e => setEmailTemplate({...emailTemplate,is_enabled:e.target.checked?1:0})} /> Enable
                </label>
                <div style={{ padding:'10px 14px', background:'#FFFBEB', borderRadius:8, border:'1px solid #FDE68A', fontSize:12, color:'#92400E', marginBottom:14 }}>
                  Placeholders: <code>{'{{name}}'}</code> <code>{'{{score}}'}</code> <code>{'{{level}}'}</code>
                </div>
                <div className="mb-2col">
                  <div className="mb-fg"><span className="mb-label">Sender Name</span><input className="mb-input" value={emailTemplate.sender_name||''} onChange={e => setEmailTemplate({...emailTemplate,sender_name:e.target.value})} /></div>
                  <div className="mb-fg"><span className="mb-label">Sender Email</span><input className="mb-input" type="email" value={emailTemplate.sender_email||''} onChange={e => setEmailTemplate({...emailTemplate,sender_email:e.target.value})} /></div>
                </div>
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Subject</span><input className="mb-input" value={emailTemplate.subject||''} onChange={e => setEmailTemplate({...emailTemplate,subject:e.target.value})} /></div>
                <div className="mb-2col" style={{ marginTop:12 }}>
                  <div className="mb-fg"><span className="mb-label">Header</span><input className="mb-input" value={emailTemplate.header_text||''} onChange={e => setEmailTemplate({...emailTemplate,header_text:e.target.value})} /></div>
                  <ColorPicker label="Color" value={emailTemplate.header_color||'#6366f1'} onChange={v => setEmailTemplate({...emailTemplate,header_color:v})} />
                </div>
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Body HTML</span><textarea className="mb-input" rows={5} value={emailTemplate.body_html||''} onChange={e => setEmailTemplate({...emailTemplate,body_html:e.target.value})} style={{ fontFamily:'monospace', fontSize:13 }} /></div>
                <div className="mb-fg" style={{ marginTop:12 }}><span className="mb-label">Footer</span><input className="mb-input" value={emailTemplate.footer_text||''} onChange={e => setEmailTemplate({...emailTemplate,footer_text:e.target.value})} /></div>
              </div>
              <button className="mb-btn" onClick={saveEmailTemplate} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>{saving?'⏳ Saving…':'💾 Save'}</button>
            </div>
          )}
          {tab === 'sounds' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Sound Library</div>
                <input type="file" accept="audio/mpeg,audio/wav,audio/ogg" style={{ display:'none' }} id="su"
                  onChange={async e => { const f=e.target.files[0]; if(!f)return; setSoundUploading(true); const fd=new FormData(); fd.append('file',f); fd.append('name',f.name.replace(/\.[^.]+$/,'')); try{const r=await api.post(`/sounds/games/${id}/sounds`,fd); setSounds(prev=>[r.data.sound,...prev]); showToast('Uploaded')}catch(err){showToast('Error','error')} setSoundUploading(false); e.target.value='' }} />
                <button className="mb-btn mb-btn-secondary mb-btn-sm" onClick={()=>document.getElementById('su').click()} disabled={soundUploading}>{soundUploading?'⏳…':'🎵 Upload Sound'}</button>
                <div className="mb-card-title" style={{ marginTop:16 }}>Assign</div>
                <div className="mb-2col">
                  <SoundSelect label="⭐ Collect" value={settings.sound_collect_id} onChange={v=>setSettings({...settings,sound_collect_id:v})} sounds={sounds} />
                  <SoundSelect label="🏁 Complete" value={settings.sound_complete_id} onChange={v=>setSettings({...settings,sound_complete_id:v})} sounds={sounds} />
                </div>
                <button className="mb-btn mb-btn-sm" onClick={saveSettings} disabled={saving} style={{ marginTop:8 }}>{saving?'⏳…':'💾 Save'}</button>
              </div>
              {sounds.length>0?(
                <div className="mb-card"><div className="mb-card-title">All Sounds ({sounds.length})</div>
                {sounds.map(s=>(<div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #F3F4F6'}}>
                  <span>🎵</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{s.name}</div></div>
                  <audio controls src={s.url} style={{height:32,maxWidth:160}} />
                  <button className="mb-icon-btn del" onClick={async()=>{try{await api.delete(`/sounds/${s.id}`);setSounds(prev=>prev.filter(x=>x.id!==s.id));showToast('Deleted')}catch{showToast('Error','error')}}}>✕</button>
                </div>))}</div>
              ):(<div className="mb-empty"><div className="mb-empty-icon">🎵</div><p>No sounds</p></div>)}
            </div>
          )}
          {tab === 'settings' && (
            <div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Slug & Colors</div>
                <div className="mb-fg" style={{ marginBottom:12 }}><span className="mb-label">Slug</span><input className="mb-input" value={gameSlug} onChange={e=>setGameSlug(e.target.value)} placeholder="my-maze" />
                {game&&<div style={{marginTop:4,fontSize:12,color:'#9CA3AF'}}>/play/{gameSlug||'slug'}/{game?.client_slug||'client'}</div>}</div>
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Font</div>
                {FONT_CATEGORIES.map(cat=>(<div key={cat.name} style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6}}>{cat.icon} {cat.name}</div>
                <div className="mb-2col">{cat.fonts.map(f=>(<div key={f} onClick={()=>setSettings({...settings,font_family:f})}
                  style={{padding:'8px 6px',borderRadius:8,border:(settings.font_family||'DM Sans')===f?'2px solid #6366f1':'1.5px solid #E5E7EB',cursor:'pointer',textAlign:'center',fontSize:12,
                    background:(settings.font_family||'DM Sans')===f?'#EEF2FF':'#FAFAFA',fontFamily:`"${f}",sans-serif`,transition:'all .1s'}}>
                  <div style={{fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{f}</div>
                  <div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>a b c</div></div>))}</div></div>))}
              </div>
              <div className="mb-card" style={{ marginBottom:16 }}>
                <div className="mb-card-title">Meta</div>
                <div className="mb-fg"><span className="mb-label">Description</span><textarea className="mb-input" rows={2} maxLength={200} value={settings.meta_description||''} onChange={e=>setSettings({...settings,meta_description:e.target.value})} /><div style={{fontSize:11,color:'#9CA3AF',textAlign:'right',marginTop:2}}>{(settings.meta_description||'').length}/200</div></div>
              </div>
              <button className="mb-btn" onClick={saveSettings} disabled={saving} style={{width:'100%',justifyContent:'center'}}>{saving?'⏳…':'💾 Save'}</button>
            </div>
          )}
        </div>

        {/* Phone mockup */}
        <div className="mb-phone">
          <div className="mb-phone-notch" />
          <div className="mb-phone-screen" style={{ fontFamily:`"${ff}",sans-serif`, background:settings.bg_color||'#0f172a' }}>
            {game && (<>
              {(tab==='gameplay'||tab==='form'||tab==='sounds'||tab==='settings')&&(
                <div style={{display:'flex',flexDirection:'column',height:'100%',padding:'16px'}}>
                  <div style={{flex:1,borderRadius:16,padding:'20px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:10,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {tab==='gameplay'&&(<>
                      <div style={{fontSize:40}}>🗺️</div>
                      <h1 style={{fontSize:16,fontWeight:800,color:'#fff',margin:0}}>{settings.heading_1||'Maze Runner'}</h1>
                      <p style={{fontSize:11,color:'#94a3b8',textAlign:'center'}}>{settings.total_levels||50} levels · size grows to {settings.grid_size_max||20}×{settings.grid_size_max||20}</p>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginTop:8}}>
                        {Array.from({length:9}).map((_,i)=>(<div key={i} style={{aspectRatio:1,borderRadius:2,background:i%2===0?'#1e293b':'#fff',opacity:0.6}} />))}
                      </div>
                      <button style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:primary,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:8}}>
                        {settings.start_button_text||'🗺️ Start Maze'}
                      </button>
                    </>)}
                    {(tab==='form'||tab==='sounds'||tab==='settings')&&(<>
                      <div style={{fontSize:40}}>🗺️</div>
                      <h1 style={{fontSize:16,fontWeight:800,color:'#fff',margin:0}}>{settings.heading_1||'Maze Runner'}</h1>
                      <p style={{fontSize:11,color:'#94a3b8'}}>{tab==='settings'?'Settings':'Form/Sounds'}</p>
                    </>)}
                  </div>
                </div>
              )}
              {tab==='thankyou'&&(
                <div style={{display:'flex',flexDirection:'column',height:'100%',padding:'16px',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:48,marginBottom:8}}>🏆</div>
                  <h2 style={{fontSize:16,fontWeight:800,color:'#fff',margin:0}}>{settings.outro_text||'Maze Complete!'}</h2>
                  <button style={{marginTop:'auto',width:'100%',padding:'10px',borderRadius:10,border:'none',background:primary,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                    {settings.submit_button_text||'Continue →'}
                  </button>
                </div>
              )}
              {tab==='email'&&(<iframe title="Email" srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;font-family:sans-serif;background:#f4f4f4}.eh{background:${emailTemplate.header_color||'#6366f1'};color:#fff;padding:20px;text-align:center;font-size:18px;font-weight:700}.eb{padding:20px;background:#fff;margin:12px;border-radius:8px;font-size:13px}.ef{padding:12px;text-align:center;font-size:11px;color:#999}</style></head><body><div class="eh">${emailTemplate.header_text||'Well Done!'}</div><div class="eb">${emailTemplate.body_html||'<p>You escaped the maze!</p>'}</div><div class="ef">${emailTemplate.footer_text||''}</div></body></html>`} style={{width:'100%',height:'100%',border:'none',background:'#fff'}} />)}
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}
