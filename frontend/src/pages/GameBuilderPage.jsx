import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

/* ─────────────────────────────────────────────
   LIGHT THEME TOKENS  (scoped to .gb-wrap)
───────────────────────────────────────────── */
const LIGHT = `
.gb-wrap {
  --gb-bg:        #f4f6fb;
  --gb-surface:   #ffffff;
  --gb-surface2:  #f0f2f8;
  --gb-border:    #e2e6f0;
  --gb-border2:   #cdd3e0;
  --gb-primary:   #6366f1;
  --gb-primary-d: #4f46e5;
  --gb-primary-g: rgba(99,102,241,0.15);
  --gb-success:   #16a34a;
  --gb-danger:    #dc2626;
  --gb-text:      #1e1e2e;
  --gb-text2:     #64657a;
  --gb-text3:     #9899ae;
  --gb-shadow:    0 2px 12px rgba(0,0,0,0.08);
  --gb-shadow-md: 0 4px 24px rgba(0,0,0,0.10);
  --gb-radius:    12px;
  --gb-radius-sm: 8px;
  font-family: 'DM Sans', sans-serif;
  background: var(--gb-bg);
  color: var(--gb-text);
  min-height: 100vh;
}
.gb-wrap *,
.gb-wrap *::before,
.gb-wrap *::after { box-sizing: border-box; }

/* inputs / selects / textareas */
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]),
.gb-wrap select,
.gb-wrap textarea {
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius-sm);
  color: var(--gb-text);
  padding: 9px 12px;
  outline: none;
  transition: border-color .18s, box-shadow .18s;
}
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]):focus,
.gb-wrap select:focus,
.gb-wrap textarea:focus {
  border-color: var(--gb-primary);
  box-shadow: 0 0 0 3px var(--gb-primary-g);
}
.gb-wrap select option { background: #fff; color: #1e1e2e; }

/* buttons */
.gb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  border-radius: var(--gb-radius-sm); border: none; cursor: pointer;
  transition: all .15s; white-space: nowrap; font-family: inherit;
}
.gb-btn:disabled { opacity: .5; cursor: not-allowed; }
.gb-btn-primary { background: var(--gb-primary); color: #fff; }
.gb-btn-primary:not(:disabled):hover { background: var(--gb-primary-d); transform: translateY(-1px); box-shadow: 0 4px 12px var(--gb-primary-g); }
.gb-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.gb-btn-ghost:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.gb-btn-danger { background: #fee2e2; color: var(--gb-danger); border: 1.5px solid #fecaca; }
.gb-btn-danger:not(:disabled):hover { background: #fecaca; }
.gb-btn-success { background: #dcfce7; color: var(--gb-success); border: 1.5px solid #bbf7d0; }
.gb-btn-success:not(:disabled):hover { background: #bbf7d0; }
.gb-btn-sm { padding: 5px 10px; font-size: 12px; }
.gb-btn-icon { padding: 6px; border-radius: 6px; }

/* card */
.gb-card {
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius);
  box-shadow: var(--gb-shadow);
}

/* label */
.gb-label {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--gb-text2); margin-bottom: 4px;
  display: block;
}

/* section block */
.gb-section {
  background: var(--gb-surface2);
  border: 1px solid var(--gb-border);
  border-radius: var(--gb-radius);
  padding: 16px;
  margin-bottom: 14px;
}
.gb-section-title {
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; color: var(--gb-primary);
  margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
}

/* tabs */
.gb-tabs {
  display: flex; border-bottom: 2px solid var(--gb-border);
  margin-bottom: 24px; gap: 0; overflow-x: auto;
}
.gb-tab {
  padding: 10px 18px; font-size: 13px; font-weight: 600;
  border: none; background: none; cursor: pointer;
  color: var(--gb-text2); border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: color .15s; white-space: nowrap;
  font-family: inherit;
}
.gb-tab.active { color: var(--gb-primary); border-bottom-color: var(--gb-primary); }
.gb-tab:hover:not(.active) { color: var(--gb-text); }

/* toast */
@keyframes gb-slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
.gb-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 12px 18px; border-radius: 10px; color: #fff; font-weight: 600;
  font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,.15);
  animation: gb-slide-in .22s ease; font-family: 'DM Sans',sans-serif;
  max-width: 320px;
}

/* drag handle */
.gb-drag-handle { cursor: grab; color: var(--gb-text3); padding: 4px; display: flex; align-items: center; }
.gb-drag-handle:active { cursor: grabbing; }

/* question row */
.gb-q-row {
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius);
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow .15s;
}
.gb-q-row:hover { box-shadow: var(--gb-shadow-md); }
.gb-q-row.dragging { opacity: .5; box-shadow: 0 8px 32px rgba(99,102,241,.2); }

.gb-q-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; cursor: pointer; user-select: none;
  background: var(--gb-surface);
}
.gb-q-header:hover { background: var(--gb-surface2); }
.gb-q-body { padding: 16px; border-top: 1.5px solid var(--gb-border); }

/* color swatch */
.gb-swatch {
  width: 28px; height: 28px; border-radius: 6px;
  border: 2px solid var(--gb-border); cursor: pointer; flex-shrink: 0;
}

/* image preview thumb */
.gb-thumb {
  height: 44px; width: auto; border-radius: 6px;
  border: 1px solid var(--gb-border); object-fit: contain; background: #f9f9f9;
}

/* empty state */
.gb-empty { text-align: center; padding: 56px 20px; color: var(--gb-text2); }
.gb-empty-icon { font-size: 44px; margin-bottom: 12px; }

/* grid helpers */
.gb-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
.gb-col { flex: 1; min-width: 140px; }

/* sticky add button bar */
.gb-sticky-bar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(244,246,251,.92); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--gb-border);
  padding: 10px 0; margin-bottom: 16px;
  display: flex; align-items: center; justify-content: space-between;
}

/* phone mockup */
.gb-phone {
  width: 220px; min-height: 380px; border-radius: 28px;
  border: 3px solid #d1d5db; background: #f9f9fb;
  overflow: hidden; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,.12);
}

/* color picker popup */
.gb-cpop {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 300;
  background: var(--gb-surface); border: 1.5px solid var(--gb-border);
  border-radius: 10px; padding: 12px; box-shadow: var(--gb-shadow-md);
  display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; width: 220px;
}

/* badge */
.gb-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700;
}
.gb-badge-purple { background: rgba(99,102,241,.12); color: var(--gb-primary); }
.gb-badge-green  { background: rgba(22,163,74,.12);  color: var(--gb-success); }
.gb-badge-gray   { background: #f0f2f8; color: var(--gb-text2); }

/* form group inline */
.gb-fg { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px; }

/* scroll util */
.gb-scroll-y { overflow-y: auto; }

/* option row */
.gb-opt-row {
  background: var(--gb-surface2); border: 1px solid var(--gb-border);
  border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;
}
`

/* ─────────── helpers ─────────── */
const ANIM_IN  = [
  { value:'flyFromBottom', label:'⬆️ Fly from Bottom' },
  { value:'flyFromTop',    label:'⬇️ Fly from Top' },
  { value:'flyFromLeft',   label:'➡️ Fly from Left' },
  { value:'flyFromRight',  label:'⬅️ Fly from Right' },
  { value:'zoomIn',        label:'🔍 Zoom In' },
  { value:'fadeIn',        label:'✨ Fade In' },
]
const ANIM_OUT = [
  { value:'flyToTop',     label:'⬆️ Fly to Top' },
  { value:'flyToBottom',  label:'⬇️ Fly to Bottom' },
  { value:'flyToLeft',    label:'⬅️ Fly to Left' },
  { value:'flyToRight',   label:'➡️ Fly to Right' },
  { value:'zoomOut',      label:'🔍 Zoom Out' },
  { value:'fadeOut',      label:'✨ Fade Out' },
]
const FONTS = ['DM Sans','Syne','Inter','Poppins','Raleway','Nunito','Lato','Montserrat',
  'Oswald','Playfair Display','Merriweather','Source Sans 3','Quicksand','Josefin Sans',
  'Rubik','Work Sans','Exo 2','Cabin','Ubuntu','Comfortaa']
const COLOR_PRESETS = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6',
  '#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']

/* ─────────── Toast ─────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return (
    <div className="gb-toast" style={{ background: type === 'success' ? '#16a34a' : '#dc2626' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  )
}

/* ─────────── ColorPicker ─────────── */
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
      {label && <span className="gb-label">{label}</span>}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div className="gb-swatch" style={{ background: value || '#6366f1' }} onClick={() => setShow(s => !s)} />
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000"
          style={{ width:90, fontSize:12, padding:'5px 8px' }} />
      </div>
      {show && (
        <div className="gb-cpop">
          {COLOR_PRESETS.map(c => (
            <div key={c} onClick={() => { onChange(c); setShow(false) }}
              style={{ width:22, height:22, background:c, borderRadius:4, cursor:'pointer',
                border: value===c ? '2px solid #6366f1' : '1px solid #e2e6f0' }} />
          ))}
          <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)}
            style={{ gridColumn:'span 7', width:'100%', height:28, padding:0, border:'none', background:'none', cursor:'pointer' }} />
          <button className="gb-btn gb-btn-ghost gb-btn-sm" style={{ gridColumn:'span 7', width:'100%' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

/* ─────────── ImageUpload ─────────── */
function ImageUpload({ label, url, onFile, onClear, accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" }) {
  const ref = useRef()
  return (
    <div>
      {label && <span className="gb-label">{label}</span>}
      <input type="file" ref={ref} accept={accept} style={{ display:'none' }}
        onChange={e => { const f=e.target.files[0]; if(f) onFile(f) }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:4 }}>
        <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {url && <img src={url} className="gb-thumb" alt="" />}
        {url && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button" onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

/* ─────────── SoundSelector ─────────── */
function SoundSelector({ label, value, onChange, sounds }) {
  return (
    <div className="gb-fg">
      <span className="gb-label">{label}</span>
      <select value={value||''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

/* ─────────── OptionRow ─────────── */
function OptionRow({ opt, index, onUpdate, onRemove, onSetCorrect, showCorrect }) {
  const imgRef     = useRef()
  const overlayRef = useRef()
  const [imgPrev,     setImgPrev]     = useState(opt.option_image_url || null)
  const [overlayPrev, setOverlayPrev] = useState(opt.option_overlay_image_url || null)

  const handleImgFile = e => {
    const f = e.target.files[0]
    if (f) {
      const r = new FileReader()
      r.onload = ev => setImgPrev(ev.target.result)
      r.readAsDataURL(f)
      onUpdate('_optImageFile', f)
    }
  }
  const handleOverlayFile = e => {
    const f = e.target.files[0]
    if (f) {
      const r = new FileReader()
      r.onload = ev => setOverlayPrev(ev.target.result)
      r.readAsDataURL(f)
      onUpdate('_overlayFile', f)
    }
  }

  return (
    <div className="gb-opt-row">
      {/* row 1: text + colors + correct + remove */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:8 }}>
        <span style={{ color:'var(--gb-text3)', fontSize:12, minWidth:18, fontWeight:700 }}>{index+1}.</span>
        <input value={opt.option_text||''} onChange={e => onUpdate('option_text', e.target.value)}
          placeholder={`Option ${index+1}`} style={{ flex:1, minWidth:100 }} />
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <ColorPicker value={opt.option_color} onChange={v => onUpdate('option_color', v)} />
          <span style={{ fontSize:10, color:'var(--gb-text3)' }}>BG</span>
          <ColorPicker value={opt.option_text_color||'#ffffff'} onChange={v => onUpdate('option_text_color', v)} />
          <span style={{ fontSize:10, color:'var(--gb-text3)' }}>Txt</span>
        </div>
        {showCorrect && (
          <button
            className={`gb-btn gb-btn-sm ${Number(opt.is_correct)===1 ? 'gb-btn-success' : 'gb-btn-ghost'}`}
            onClick={onSetCorrect}>
            {Number(opt.is_correct)===1 ? '✅ Correct' : '○ Mark Correct'}
          </button>
        )}
        <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" onClick={onRemove}>✕</button>
      </div>
      {/* row 2: images */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        <div>
          <span className="gb-label" style={{ marginBottom:3 }}>Option Image</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="file" ref={imgRef} accept="image/png,image/jpeg,image/jpg" onChange={handleImgFile} style={{ display:'none' }} />
            <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => imgRef.current.click()}>📷</button>
            {imgPrev && <img src={imgPrev} className="gb-thumb" alt="" style={{ height:36 }} />}
            {imgPrev && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button"
              onClick={() => { setImgPrev(null); onUpdate('option_image_url','') }}>✕</button>}
          </div>
        </div>
        <div>
          <span className="gb-label" style={{ marginBottom:3 }}>Overlay (after select)</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="file" ref={overlayRef} accept="image/png,image/jpeg,image/jpg" onChange={handleOverlayFile} style={{ display:'none' }} />
            <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => overlayRef.current.click()}>🖼️</button>
            {overlayPrev && <img src={overlayPrev} className="gb-thumb" alt="" style={{ height:36 }} />}
            {overlayPrev && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button"
              onClick={() => { setOverlayPrev(null); onUpdate('option_overlay_image_url','') }}>✕</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────── QuestionCard ─────────── */
function QuestionCard({ question, index, total, onSave, onDelete, onMoveUp, onMoveDown }) {
  const [q, setQ] = useState(question)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imgPreview, setImgPreview] = useState(question.question_image_url||null)
  const [bgPreview,  setBgPreview]  = useState(question.question_bg_image_url||null)

  // Keep in sync if parent re-orders or refreshes
  useEffect(() => {
    setQ(question)
    setImgPreview(question.question_image_url||null)
    setBgPreview(question.question_bg_image_url||null)
  }, [question])

  const updateOption = (i, field, val) => {
    const opts = [...(q.options||[])]; opts[i] = { ...opts[i], [field]:val }; setQ({ ...q, options:opts })
  }
  const addOption = () => setQ({ ...q, options:[...(q.options||[]),
    { option_text:'', option_color:'#6366f1', option_text_color:'#ffffff', is_correct:0, option_order:(q.options||[]).length }] })
  const removeOption = i => { const opts=[...(q.options||[])]; opts.splice(i,1); setQ({ ...q, options:opts }) }
  const setCorrect = sel => setQ(prev => ({ ...prev,
    options: prev.options.map((o,idx) => ({ ...o, is_correct: idx===sel ? 1 : 0 })) }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(q) } finally { setSaving(false) }
  }

  const typeLabel = q.question_type === 'opinion' ? 'Opinion' : 'Right/Wrong'
  const correctCount = (q.options||[]).filter(o => Number(o.is_correct)===1).length

  return (
    <div className="gb-q-row">
      {/* ── header (always visible) ── */}
      <div className="gb-q-header" onClick={() => setOpen(o => !o)}>
        {/* drag/reorder arrows */}
        <div style={{ display:'flex', flexDirection:'column', gap:1 }} onClick={e => e.stopPropagation()}>
          <button className="gb-btn gb-btn-ghost gb-btn-icon gb-btn-sm" disabled={index===0}
            onClick={() => onMoveUp(index)} title="Move up" style={{ padding:'2px 4px', lineHeight:1 }}>▲</button>
          <button className="gb-btn gb-btn-ghost gb-btn-icon gb-btn-sm" disabled={index===total-1}
            onClick={() => onMoveDown(index)} title="Move down" style={{ padding:'2px 4px', lineHeight:1 }}>▼</button>
        </div>
        <span style={{ fontSize:12, fontWeight:800, color:'var(--gb-primary)', minWidth:28 }}>#{index+1}</span>
        {/* question color dot */}
        <div style={{ width:10, height:10, borderRadius:'50%', background: q.question_color||'#6366f1', flexShrink:0, border:'1px solid var(--gb-border)' }} />
        {/* question text preview */}
        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--gb-text)',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {q.question_text || <span style={{ color:'var(--gb-text3)' }}>Untitled question…</span>}
        </span>
        {/* badges */}
        <div style={{ display:'flex', gap:6, alignItems:'center' }} onClick={e => e.stopPropagation()}>
          <span className={`gb-badge ${q.question_type==='opinion' ? 'gb-badge-gray' : 'gb-badge-purple'}`}>{typeLabel}</span>
          <span className="gb-badge gb-badge-gray">{(q.options||[]).length} opts</span>
          {q.question_type==='right_wrong' && correctCount>0 && <span className="gb-badge gb-badge-green">✓ set</span>}
          {imgPreview && <span title="Has image">🖼️</span>}
          <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" onClick={e => { e.stopPropagation(); onDelete(question) }}>🗑</button>
        </div>
        <span style={{ color:'var(--gb-text3)', marginLeft:4, fontSize:14 }}>{open ? '▾' : '▸'}</span>
      </div>

      {/* ── body (collapsible) ── */}
      {open && (
        <div className="gb-q-body">
          {/* top: type + question text + color */}
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div className="gb-fg" style={{ minWidth:160, maxWidth:200 }}>
              <span className="gb-label">Question Type</span>
              <select value={q.question_type} onChange={e => setQ({ ...q, question_type: e.target.value })}>
                <option value="right_wrong">Right / Wrong</option>
                <option value="opinion">Opinion Based</option>
              </select>
            </div>
            <div className="gb-fg" style={{ flex:3 }}>
              <span className="gb-label">Question Text</span>
              <textarea rows={2} value={q.question_text||''} onChange={e => setQ({ ...q, question_text: e.target.value })}
                style={{ resize:'vertical' }} />
            </div>
            <div>
              <ColorPicker value={q.question_color||'#1a1a2e'} onChange={v => setQ({ ...q, question_color:v })} label="Text Color" />
            </div>
          </div>

          {/* images */}
          <div className="gb-section">
            <div className="gb-section-title">🖼️ Images</div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              <div className="gb-fg">
                <ImageUpload label="Question Image (optional)" url={imgPreview}
                  onFile={f => { const r=new FileReader(); r.onload=ev=>setImgPreview(ev.target.result); r.readAsDataURL(f); setQ({ ...q, _imageFile:f }) }}
                  onClear={() => { setImgPreview(null); setQ({ ...q, _imageFile:null, question_image_url:'' }) }} />
              </div>
              <div className="gb-fg">
                <ImageUpload label="BG Image (overrides game BG)" url={bgPreview}
                  onFile={f => { const r=new FileReader(); r.onload=ev=>setBgPreview(ev.target.result); r.readAsDataURL(f); setQ({ ...q, _bgImageFile:f }) }}
                  onClear={() => { setBgPreview(null); setQ({ ...q, _bgImageFile:null, question_bg_image_url:'' }) }} />
              </div>
            </div>
          </div>

          {/* Question image idle animation */}
          {imgPreview && (
            <div className="gb-section">
              <div className="gb-section-title">🌊 Question Image — Idle Motion</div>
              <div className="gb-fg">
                <span className="gb-label">Animation while player reads</span>
                <select value={q.question_image_animation||'float'} onChange={e => setQ({ ...q, question_image_animation:e.target.value })}>
                  <option value="float">🌊 Float (up & down)</option>
                  <option value="breathe">💨 Breathe (gentle scale)</option>
                  <option value="pulse">💓 Pulse (brightness + scale)</option>
                  <option value="shimmer">✨ Shimmer (subtle tilt)</option>
                  <option value="kenburns">🎥 Ken Burns (slow zoom-pan)</option>
                  <option value="none">⛔ No animation</option>
                </select>
              </div>
              <p style={{ fontSize:11, color:'var(--gb-text3)', marginTop:8 }}>
                Entrance anim plays first, then loops this idle. Use "No animation" for GIFs.
              </p>
            </div>
          )}

          {/* overlay animation */}
          <div className="gb-section">
            <div className="gb-section-title">🎬 Overlay Image Animation (Keynote-style)</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
              <div className="gb-fg">
                <span className="gb-label">Fly-In</span>
                <select value={q.overlay_animation_in||'flyFromBottom'} onChange={e => setQ({ ...q, overlay_animation_in:e.target.value })}>
                  {ANIM_IN.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="gb-fg">
                <span className="gb-label">Fly-Out</span>
                <select value={q.overlay_animation_out||'flyToTop'} onChange={e => setQ({ ...q, overlay_animation_out:e.target.value })}>
                  {ANIM_OUT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="gb-fg">
                <span className="gb-label">Idle Time (sec)</span>
                <input type="number" min={0} max={60} value={q.overlay_idle_time??3}
                  onChange={e => setQ({ ...q, overlay_idle_time:parseInt(e.target.value)||0 })} />
              </div>
            </div>
            <p style={{ fontSize:11, color:'var(--gb-text3)', marginTop:8 }}>
              After selecting an option (1s delay), overlay flies in → idle → "Next" appears → fly-out → next question.
            </p>
          </div>

          {/* Options */}
          <div className="gb-section">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div className="gb-section-title" style={{ marginBottom:0 }}>🔘 Answer Options</div>
              <button className="gb-btn gb-btn-primary gb-btn-sm" onClick={addOption}>+ Add Option</button>
            </div>
            {(q.options||[]).length === 0
              ? <p style={{ fontSize:13, color:'var(--gb-text3)', textAlign:'center', padding:'16px 0' }}>No options yet — add some above</p>
              : (q.options||[]).map((opt,i) => (
                <OptionRow key={`opt-${opt.id || 'new'}-${i}`} opt={opt} index={i}
                  onUpdate={(field,val) => updateOption(i,field,val)}
                  onRemove={() => removeOption(i)}
                  onSetCorrect={() => setCorrect(i)}
                  showCorrect={q.question_type==='right_wrong'} />
              ))
            }
          </div>

          {/* Live Preview */}
          {(q.options||[]).length > 0 && (
            <div className="gb-section">
              <div className="gb-section-title">📱 Live Preview</div>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
                {/* phone mockup */}
                <div className="gb-phone" style={{
                  background: bgPreview ? `url(${bgPreview}) center/cover` : (q.bg_color||'#f0f0fa') }}>
                  <div style={{ padding:'20px 14px', height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
                    {imgPreview && (
                      <div style={{ textAlign:'center' }}>
                        <img src={imgPreview} alt="" style={{ maxWidth:'100%', maxHeight:100, borderRadius:8, objectFit:'contain' }} />
                      </div>
                    )}
                    <p style={{ color: q.question_color||'#1a1a2e', fontWeight:700, fontSize:13, textAlign:'center', margin:0 }}>
                      {q.question_text||'Your question here…'}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {(q.options||[]).map((opt,i) => (
                        <div key={i} style={{ background:opt.option_color||'#6366f1', borderRadius:9, padding:'9px 12px',
                          color:opt.option_text_color||'#fff', fontSize:12, fontWeight:600,
                          display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                          {opt.option_image_url && <img src={opt.option_image_url} alt="" style={{ height:28, width:'auto', borderRadius:4 }} />}
                          {opt.option_text||`Option ${i+1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* info */}
                <div style={{ fontSize:12, color:'var(--gb-text2)', lineHeight:1.8 }}>
                  <div>📐 <b>Options:</b> {(q.options||[]).length}</div>
                  <div>🎯 <b>Type:</b> {typeLabel}</div>
                  {q.question_type==='right_wrong' && <div>✅ <b>Correct:</b> {correctCount > 0 ? 'Set' : <span style={{ color:'var(--gb-danger)' }}>Not set</span>}</div>}
                  <div>🎨 <b>Has BG:</b> {bgPreview ? 'Yes' : 'No'}</div>
                  <div>🖼️ <b>Has Image:</b> {imgPreview ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* save bar */}
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:4 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : '💾 Save Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function GameBuilderPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [game,          setGame]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [tab,           setTab]           = useState('questions')
  const [toast,         setToast]         = useState(null)
  const [questions,     setQuestions]     = useState([])
  const [formFields,    setFormFields]    = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [settings,      setSettings]      = useState({})
  const [sounds,        setSounds]        = useState([])
  const [saving,        setSaving]        = useState(false)
  const [soundUploading,setSoundUploading]= useState(false)
  const [addingQ,       setAddingQ]       = useState(false)
  const [redirectUrl,   setRedirectUrl]   = useState('')
  const [savingRedirect,setSavingRedirect]= useState(false)

  const soundUploadRef = useRef()
  const bgImgRef       = useRef()
  const tyBgImgRef     = useRef()
  const gameLogoRef    = useRef()

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadGame = useCallback(() => {
    setLoading(true); setFetchError(null)
    api.get(`/games/${id}`).then(res => {
      const g = res.data.game
      setGame(g)
      setQuestions(g.questions||[])
      setFormFields(g.formFields||[])
      setEmailTemplate(g.emailTemplate||{})
      setSettings(g.settings||{})
      setSounds(g.sounds||[])
      setRedirectUrl(g.redirect_url||'')
    }).catch(err => {
      setFetchError(err.response?.data?.message || err.message || 'Failed to load game')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadGame() }, [loadGame])

  /* ─── Add Question ─── */
  const addQuestion = async () => {
    setAddingQ(true)
    try {
      const fd = new FormData()
      fd.append('question_text', 'New Question')
      fd.append('question_type', 'right_wrong')
      fd.append('question_color', '#1a1a2e')
      fd.append('question_order', questions.length)
      fd.append('num_options', 0)
      const res = await api.post(`/quiz/games/${id}/questions`, fd)
      // New question comes back with no options — safe to add directly
      setQuestions(prev => [...prev, { ...res.data.question, options: [] }])
      showToast('Question added ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message||err.message), 'error') }
    setAddingQ(false)
  }

  /* ─── Save Question ───
     BUG FIX: after saving, update local state with real option IDs returned
     from the backend so subsequent saves don't re-POST existing options.
  ─── */
  const saveQuestion = async (q) => {
    const fd = new FormData()
    fd.append('question_text', q.question_text||'')
    fd.append('question_type', q.question_type||'right_wrong')
    fd.append('question_color', q.question_color||'#1a1a2e')
    fd.append('question_order', q.question_order??0)
    fd.append('num_options', q.num_options??0)
    fd.append('sound_correct',   q.sound_correct||'')
    fd.append('sound_wrong',     q.sound_wrong||'')
    fd.append('sound_neutral',   q.sound_neutral||'')
    fd.append('sound_correct_id',q.sound_correct_id||'')
    fd.append('sound_wrong_id',  q.sound_wrong_id||'')
    fd.append('sound_neutral_id',q.sound_neutral_id||'')
    fd.append('overlay_duration',     q.overlay_duration??3)
    fd.append('overlay_idle_time',    q.overlay_idle_time??3)
    fd.append('overlay_animation_in', q.overlay_animation_in||'flyFromBottom')
    fd.append('overlay_animation_out',q.overlay_animation_out||'flyToTop')
    fd.append('question_image_animation', q.question_image_animation||'float')
    if (q._imageFile)   fd.append('question_image',    q._imageFile)
    if (q._bgImageFile) fd.append('question_bg_image', q._bgImageFile)
    await api.put(`/quiz/questions/${q.id}`, fd)

    // Save options — collect updated options with real IDs
    const savedOptions = []
    for (const opt of (q.options||[])) {
      const ofd = new FormData()
      ofd.append('option_text',       opt.option_text||'')
      ofd.append('option_color',      opt.option_color||'#6366f1')
      ofd.append('option_text_color', opt.option_text_color||'#ffffff')
      ofd.append('is_correct',        opt.is_correct ? 1 : 0)
      ofd.append('option_order',      (q.options||[]).indexOf(opt))
      if (opt._optImageFile) ofd.append('option_image',         opt._optImageFile)
      if (opt._overlayFile)  ofd.append('option_overlay_image', opt._overlayFile)

      let savedOpt
      if (opt.id) {
        // Existing option → PUT
        const res = await api.put(`/quiz/options/${opt.id}`, ofd)
        savedOpt = res.data.option
      } else {
        // New option → POST, capture returned ID
        const res = await api.post(`/quiz/questions/${q.id}/options`, ofd)
        savedOpt = res.data.option
      }
      savedOptions.push(savedOpt)
    }

    // Update questions state so options now carry their DB IDs — prevents duplication
    setQuestions(prev => prev.map(pq =>
      pq.id === q.id
        ? { ...pq, ...q, options: savedOptions, _imageFile: null, _bgImageFile: null }
        : pq
    ))
    showToast('Question saved ✅')
  }

  /* ─── Delete Question ─── */
  const deleteQuestion = async (q) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/quiz/questions/${q.id}`)
      setQuestions(prev => prev.filter(x => x.id !== q.id))
      showToast('Question deleted')
    } catch { showToast('Error deleting question', 'error') }
  }

  /* ─── Reorder helpers ─── */
  const moveQuestion = async (from, to) => {
    const arr = [...questions]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    const reordered = arr.map((q, i) => ({ ...q, question_order: i }))
    setQuestions(reordered)
    try {
      await api.post(`/quiz/games/${id}/questions/reorder`, {
        order: reordered.map(q => ({ id: q.id, question_order: q.question_order }))
      })
    } catch { showToast('Reorder failed', 'error') }
  }

  /* ─── Form Fields ─── */
  const addFormField    = ()          => setFormFields([...formFields, { field_label:'New Field', field_type:'text', is_required:0, field_options:[] }])
  const removeFormField = i           => { const f=[...formFields]; f.splice(i,1); setFormFields(f) }
  const updateFormField = (i,key,val) => { const f=[...formFields]; f[i]={ ...f[i],[key]:val }; setFormFields(f) }
  const saveFormFields  = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/form-fields`, { fields: formFields }); showToast('Form fields saved') }
    catch { showToast('Error saving form fields', 'error') }
    setSaving(false)
  }

  /* ─── Email ─── */
  const saveEmailTemplate = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/email-template`, emailTemplate); showToast('Email template saved') }
    catch { showToast('Error saving email template', 'error') }
    setSaving(false)
  }

  /* ─── Settings ─── */
  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['bg_color','primary_color','show_progress','allow_back','time_per_question',
        'intro_text','outro_text','win_sound_id','lose_sound_id',
        'terms_enabled','terms_text','terms_url','send_email','font_family',
        'start_button_text','next_button_text','submit_button_text','continue_button_text',
        'meta_description']
      for (const f of fields) fd.append(f, settings[f]??'')
      if (settings._bgImageFile)    fd.append('bg_image',           settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url',     settings.bg_image_url)
      if (settings._tyBgImageFile)  fd.append('thankyou_bg_image',  settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._submitGifFile)  fd.append('submit_confirm_gif', settings._submitGifFile)
      else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url||'')
      if (settings._gameLogoFile)   fd.append('game_logo',          settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url||'')
      await api.put(`/games/${id}/settings`, fd)
      showToast('Settings saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSaving(false)
  }

  /* ─── Redirect URL ─── */
  const saveRedirectUrl = async () => {
    setSavingRedirect(true)
    try {
      await api.put(`/games/${id}`, { redirect_url: redirectUrl })
      setGame(prev => ({ ...prev, redirect_url: redirectUrl }))
      showToast('Redirect URL saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSavingRedirect(false)
  }

  /* ─── Sounds ─── */
  const uploadSound = async e => {
    const file = e.target.files[0]; if (!file) return
    const allowed = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/x-wav','audio/wave']
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      showToast('Only MP3, WAV, OGG allowed', 'error'); e.target.value=''; return
    }
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
    { id:'questions', label:'❓ Questions' },
    { id:'form',      label:'📋 Player Form' },
    { id:'email',     label:'📧 Email' },
    { id:'settings',  label:'⚙️ Settings' },
    { id:'sounds',    label:'🔊 Sounds' },
  ]

  if (loading) return (
    <div className="gb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', color:'var(--gb-text2)' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #e2e6f0',borderTopColor:'#6366f1',animation:'spin .8s linear infinite',margin:'0 auto 16px' }} />
        Loading builder…
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (fetchError) return (
    <div className="gb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h2 style={{ color:'var(--gb-danger)', marginBottom:8 }}>Builder Failed to Load</h2>
        <p style={{ color:'var(--gb-text2)', marginBottom:20 }}>{fetchError}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <button className="gb-btn gb-btn-primary" onClick={loadGame}>🔄 Retry</button>
          <button className="gb-btn gb-btn-ghost" onClick={() => navigate('/dashboard/games')}>← Back to Games</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="gb-wrap">
      <style>{LIGHT}</style>

      {/* ─── Header ─── */}
      <div style={{ background:'var(--gb-surface)', borderBottom:'1.5px solid var(--gb-border)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="gb-btn gb-btn-ghost gb-btn-sm" onClick={() => navigate('/dashboard/games')}>← Back</button>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'var(--gb-text)' }}>{game?.name}</div>
            <div style={{ fontSize:12, color:'var(--gb-text2)' }}>🏢 {game?.company_name}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'var(--gb-text3)', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{gameLink}</span>
          <button className="gb-btn gb-btn-ghost gb-btn-sm" onClick={() => { navigator.clipboard.writeText(gameLink); showToast('Link copied!') }}>🔗 Copy</button>
          <a href={gameLink} target="_blank" rel="noreferrer" className="gb-btn gb-btn-ghost gb-btn-sm">👁 Preview</a>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'24px 20px' }}>
        {/* Tabs */}
        <div className="gb-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`gb-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════ QUESTIONS TAB ════ */}
        {tab === 'questions' && (
          <div>
            {/* sticky add bar */}
            <div className="gb-sticky-bar">
              <span style={{ fontSize:13, color:'var(--gb-text2)', fontWeight:600 }}>
                {questions.length} question{questions.length!==1?'s':''}
              </span>
              <button className="gb-btn gb-btn-primary" onClick={addQuestion} disabled={addingQ}>
                {addingQ ? '⏳ Adding…' : '+ Add Question'}
              </button>
            </div>

            {questions.length === 0
              ? (
                <div className="gb-empty">
                  <div className="gb-empty-icon">❓</div>
                  <h3 style={{ color:'var(--gb-text)', marginBottom:8 }}>No questions yet</h3>
                  <p>Add your first question to get started</p>
                  <button className="gb-btn gb-btn-primary" style={{ marginTop:16 }} onClick={addQuestion}>+ Add First Question</button>
                </div>
              )
              : questions.map((q,i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  total={questions.length}
                  onSave={saveQuestion}
                  onDelete={deleteQuestion}
                  onMoveUp={idx  => moveQuestion(idx, idx-1)}
                  onMoveDown={idx => moveQuestion(idx, idx+1)}
                />
              ))
            }

            {questions.length > 0 && (
              <div style={{ textAlign:'center', paddingTop:8 }}>
                <button className="gb-btn gb-btn-primary" onClick={addQuestion} disabled={addingQ}>
                  {addingQ ? '⏳ Adding…' : '+ Add Another Question'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════ FORM TAB ════ */}
        {tab === 'form' && (
          <div>
            {/* Visual preview: how the form looks in-game */}
            <div className="gb-card" style={{ marginBottom:24, padding:0, overflow:'hidden' }}>
              <div style={{ background: settings.bg_image_url
                ? `url(${settings.bg_image_url}) center/cover`
                : (settings.bg_color||'#6366f1'),
                minHeight:160, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                <div style={{ background:'rgba(255,255,255,.92)', borderRadius:16, padding:'20px 24px', maxWidth:320, width:'100%', boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>
                  {settings.game_logo_url && (
                    <div style={{ textAlign:'center', marginBottom:12 }}>
                      <img src={settings.game_logo_url} alt="" style={{ maxHeight:56, maxWidth:'80%', objectFit:'contain' }} />
                    </div>
                  )}
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e1e2e', textAlign:'center', marginBottom:12 }}>
                    {settings.intro_text || 'Fill in your details to start!'}
                  </p>
                  {formFields.slice(0,3).map((f,i) => (
                    <div key={i} style={{ marginBottom:8 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'#64657a', marginBottom:3 }}>
                        {f.field_label}{f.is_required ? ' *' : ''}
                      </div>
                      <div style={{ height:32, background:'#f4f6fb', borderRadius:6, border:'1px solid #e2e6f0' }} />
                    </div>
                  ))}
                  {formFields.length > 3 && (
                    <p style={{ fontSize:11, color:'#9899ae', textAlign:'center' }}>+{formFields.length-3} more fields…</p>
                  )}
                  <div style={{ marginTop:12, textAlign:'center' }}>
                    <div style={{ display:'inline-block', background: settings.primary_color||'#6366f1', color:'#fff', borderRadius:8, padding:'8px 24px', fontSize:13, fontWeight:700 }}>
                      {settings.start_button_text || 'Start Quiz →'}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding:'10px 16px', background:'#f8f9ff', borderTop:'1px solid var(--gb-border)', fontSize:12, color:'var(--gb-text2)' }}>
                📱 This is how the player registration screen looks. Edit fields below.
              </div>
            </div>

            <p style={{ color:'var(--gb-text2)', marginBottom:16, fontSize:13 }}>These fields appear on the player registration screen before the quiz starts.</p>
            {formFields.map((f,i) => (
              <div key={i} className="gb-card" style={{ marginBottom:10, padding:'12px 16px' }}>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
                  <div className="gb-fg" style={{ flex:2, minWidth:130 }}>
                    <span className="gb-label">Label</span>
                    <input value={f.field_label} onChange={e => updateFormField(i,'field_label',e.target.value)} />
                  </div>
                  <div className="gb-fg" style={{ flex:1, minWidth:110 }}>
                    <span className="gb-label">Type</span>
                    <select value={f.field_type} onChange={e => updateFormField(i,'field_type',e.target.value)}>
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Dropdown</option>
                    </select>
                  </div>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer', paddingBottom:2, whiteSpace:'nowrap' }}>
                    <input type="checkbox" checked={!!f.is_required} onChange={e => updateFormField(i,'is_required',e.target.checked?1:0)}
                      style={{ width:16,height:16 }} />
                    Required
                  </label>
                  <button className="gb-btn gb-btn-danger gb-btn-sm" onClick={() => removeFormField(i)}>✕</button>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="gb-btn gb-btn-ghost" onClick={addFormField}>+ Add Field</button>
              <button className="gb-btn gb-btn-primary" onClick={saveFormFields} disabled={saving}>{saving ? 'Saving…' : '💾 Save Form'}</button>
            </div>
          </div>
        )}

        {/* ════ EMAIL TAB ════ */}
        {tab === 'email' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ color:'var(--gb-text2)', fontSize:13 }}>Configure the congratulations email sent to players.</p>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={!!emailTemplate.is_enabled}
                  onChange={e => setEmailTemplate({ ...emailTemplate, is_enabled:e.target.checked?1:0 })}
                  style={{ width:16,height:16 }} />
                Enable email
              </label>
            </div>
            <div className="gb-section" style={{ marginBottom:16, background:'#fffbeb', borderColor:'#fde68a' }}>
              💡 SMTP credentials are configured in the server <code>.env</code> file. Use <code>{'{{name}}'}</code>, <code>{'{{score}}'}</code>, <code>{'{{total}}'}</code>, <code>{'{{game_name}}'}</code> as placeholders.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div className="gb-fg"><span className="gb-label">Sender Name</span><input value={emailTemplate.sender_name||''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_name:e.target.value })} placeholder="Quiz Platform" /></div>
              <div className="gb-fg"><span className="gb-label">Sender Email</span><input value={emailTemplate.sender_email||''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_email:e.target.value })} placeholder="noreply@yourdomain.com" /></div>
            </div>
            <div className="gb-fg" style={{ marginBottom:14 }}><span className="gb-label">Subject</span><input value={emailTemplate.subject||''} onChange={e => setEmailTemplate({ ...emailTemplate, subject:e.target.value })} placeholder="Congratulations {{name}}! 🎉" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'flex-end', marginBottom:14 }}>
              <div className="gb-fg"><span className="gb-label">Header Text</span><input value={emailTemplate.header_text||''} onChange={e => setEmailTemplate({ ...emailTemplate, header_text:e.target.value })} placeholder="🎉 Congratulations!" /></div>
              <ColorPicker value={emailTemplate.header_color||'#6366f1'} onChange={v => setEmailTemplate({ ...emailTemplate, header_color:v })} label="Header Color" />
            </div>
            <div className="gb-fg" style={{ marginBottom:14 }}><span className="gb-label">Email Body (HTML)</span><textarea rows={5} value={emailTemplate.body_html||''} onChange={e => setEmailTemplate({ ...emailTemplate, body_html:e.target.value })} placeholder="<p>Thank you, {{name}}!</p>" style={{ resize:'vertical', fontFamily:'monospace', fontSize:13 }} /></div>
            <div className="gb-fg" style={{ marginBottom:20 }}><span className="gb-label">Footer Text</span><input value={emailTemplate.footer_text||''} onChange={e => setEmailTemplate({ ...emailTemplate, footer_text:e.target.value })} placeholder="© 2024 Your Company" /></div>
            <button className="gb-btn gb-btn-primary" onClick={saveEmailTemplate} disabled={saving}>{saving ? 'Saving…' : '💾 Save Email Template'}</button>
          </div>
        )}

        {/* ════ SETTINGS TAB ════ */}
        {tab === 'settings' && (
          <div>
            {/* Game Logo */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🖼️ Game Logo</div>
              <input type="file" ref={gameLogoRef} accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,game_logo_url:ev.target.result,_gameLogoFile:f}); r.readAsDataURL(f)} }}
                style={{ display:'none' }} />
              <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => gameLogoRef.current.click()}>📷 Upload Logo</button>
                {settings.game_logo_url && <>
                  <img src={settings.game_logo_url} alt="" style={{ maxWidth:120, maxHeight:56, width:'auto', height:'auto', borderRadius:6, border:'1px solid var(--gb-border)', background:'#fff', objectFit:'contain' }} />
                  <button className="gb-btn gb-btn-danger gb-btn-sm" type="button" onClick={() => setSettings({...settings,game_logo_url:'',_gameLogoFile:null})}>✕ Remove</button>
                </>}
              </div>
              <p style={{ fontSize:12, color:'var(--gb-text3)', marginTop:6 }}>Supports portrait and landscape images — displayed full (not cropped).</p>
            </div>

            {/* Font */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🔤 Font Family</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:8, maxHeight:260, overflowY:'auto', border:'1px solid var(--gb-border)', borderRadius:8, padding:10, background:'var(--gb-surface2)' }}>
                {FONTS.map(font => (
                  <div key={font} onClick={() => setSettings({...settings,font_family:font})}
                    style={{ padding:'8px 10px', borderRadius:7, cursor:'pointer',
                      border:`2px solid ${settings.font_family===font||(!settings.font_family&&font==='DM Sans') ? 'var(--gb-primary)' : 'transparent'}`,
                      background: settings.font_family===font||(!settings.font_family&&font==='DM Sans') ? '#eef0ff' : '#fff',
                      transition:'all .12s' }}>
                    <div style={{ fontSize:13, fontFamily:`'${font}',sans-serif`, color:'#1e1e2e', fontWeight:700 }}>{font}</div>
                    <div style={{ fontSize:11, fontFamily:`'${font}',sans-serif`, color:'#64657a' }}>The quick brown fox</div>
                    <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700&display=swap');`}</style>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🎨 Colors</div>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                <ColorPicker value={settings.bg_color||'#ffffff'} onChange={v => setSettings({...settings,bg_color:v})} label="Background Color" />
                <ColorPicker value={settings.primary_color||'#6366f1'} onChange={v => setSettings({...settings,primary_color:v})} label="Primary / Accent Color" />
              </div>
            </div>

            {/* Background Images */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🌅 Background Images</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <span className="gb-label" style={{ marginBottom:6, display:'block' }}>Game Background Image</span>
                  <input type="file" ref={bgImgRef} accept="image/png,image/jpeg,image/jpg"
                    onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,bg_image_url:ev.target.result,_bgImageFile:f}); r.readAsDataURL(f)} }}
                    style={{ display:'none' }} />
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => bgImgRef.current.click()}>📷 Upload</button>
                    {settings.bg_image_url && <img src={settings.bg_image_url} className="gb-thumb" alt="" />}
                    {settings.bg_image_url && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button" onClick={() => setSettings({...settings,bg_image_url:'',_bgImageFile:null})}>✕</button>}
                  </div>
                </div>
                <div>
                  <span className="gb-label" style={{ marginBottom:6, display:'block' }}>Thank You Page BG</span>
                  <input type="file" ref={tyBgImgRef} accept="image/png,image/jpeg,image/jpg"
                    onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,thankyou_bg_image_url:ev.target.result,_tyBgImageFile:f}); r.readAsDataURL(f)} }}
                    style={{ display:'none' }} />
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => tyBgImgRef.current.click()}>📷 Upload</button>
                    {settings.thankyou_bg_image_url && <img src={settings.thankyou_bg_image_url} className="gb-thumb" alt="" />}
                    {settings.thankyou_bg_image_url && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button" onClick={() => setSettings({...settings,thankyou_bg_image_url:'',_tyBgImageFile:null})}>✕</button>}
                  </div>
                </div>
              </div>
            </div>

            {/* Texts */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">📝 Game Texts</div>
              <div className="gb-fg" style={{ marginBottom:12 }}>
                <span className="gb-label">Intro Text (shown before quiz)</span>
                <textarea rows={2} value={settings.intro_text||''} onChange={e => setSettings({...settings,intro_text:e.target.value})} style={{ resize:'vertical' }} />
              </div>
              <div className="gb-fg">
                <span className="gb-label">Outro / Thank You Text</span>
                <textarea rows={2} value={settings.outro_text||''} onChange={e => setSettings({...settings,outro_text:e.target.value})} style={{ resize:'vertical' }} />
              </div>
            </div>

            {/* Redirect URL */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🔗 Post-Game Redirect URL</div>
              <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:12 }}>
                Where should players be sent after completing the quiz? Leave blank to show the default thank-you screen.
              </p>
              <div style={{ display:'flex', gap:10, alignItems:'flex-end', flexWrap:'wrap' }}>
                <div className="gb-fg" style={{ flex:1, minWidth:240 }}>
                  <span className="gb-label">Redirect URL</span>
                  <input
                    value={redirectUrl}
                    onChange={e => setRedirectUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/thankyou"
                    type="url"
                  />
                </div>
                <button
                  className="gb-btn gb-btn-primary"
                  onClick={saveRedirectUrl}
                  disabled={savingRedirect}
                  style={{ flexShrink:0 }}
                >
                  {savingRedirect ? '⏳ Saving…' : '💾 Save URL'}
                </button>
              </div>
              {redirectUrl && (
                <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'8px 12px' }}>
                  <span style={{ fontSize:13 }}>🚀</span>
                  <span style={{ fontSize:12, color:'#15803d' }}>Players will be redirected to: </span>
                  <a href={redirectUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize:12, color:'#15803d', fontWeight:700, wordBreak:'break-all' }}>{redirectUrl}</a>
                </div>
              )}
            </div>

            {/* Button Labels */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🏷️ Button Labels</div>
              <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:12 }}>Leave blank to use defaults.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:12 }}>
                <div className="gb-fg"><span className="gb-label">Start Button</span><input value={settings.start_button_text||''} onChange={e => setSettings({...settings,start_button_text:e.target.value})} placeholder="Start Quiz →" /></div>
                <div className="gb-fg"><span className="gb-label">Next Button</span><input value={settings.next_button_text||''} onChange={e => setSettings({...settings,next_button_text:e.target.value})} placeholder="Next →" /></div>
                <div className="gb-fg"><span className="gb-label">Submit Button</span><input value={settings.submit_button_text||''} onChange={e => setSettings({...settings,submit_button_text:e.target.value})} placeholder="Submit & Explore" /></div>
                <div className="gb-fg"><span className="gb-label">Continue Button</span><input value={settings.continue_button_text||''} onChange={e => setSettings({...settings,continue_button_text:e.target.value})} placeholder="Continue Now →" /></div>
              </div>
            </div>

            {/* Submit GIF */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">🎊 Submit Confirmation GIF</div>
              <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:12 }}>Shown in the popup modal when the player presses "Submit & Explore".</p>
              <input type="file" id="submitGifInput" accept="image/gif,image/png,image/jpeg,image/webp"
                onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,submit_confirm_gif_url:ev.target.result,_submitGifFile:f}); r.readAsDataURL(f)} }}
                style={{ display:'none' }} />
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => document.getElementById('submitGifInput').click()}>🎬 Upload GIF / Image</button>
                {settings.submit_confirm_gif_url && <img src={settings.submit_confirm_gif_url} className="gb-thumb" alt="" style={{ height:56 }} />}
                {settings.submit_confirm_gif_url && <button className="gb-btn gb-btn-danger gb-btn-sm" type="button" onClick={() => setSettings({...settings,submit_confirm_gif_url:'',_submitGifFile:null})}>✕ Remove</button>}
              </div>
            </div>

            {/* Social Share */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">📲 Social Share Text</div>
              <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:10 }}>Text shown when the game link is shared on WhatsApp, Facebook etc.</p>
              <div className="gb-fg">
                <span className="gb-label">Share Description</span>
                <input value={settings.meta_description||''} onChange={e => setSettings({...settings,meta_description:e.target.value})} placeholder="Play this game and win exciting rewards!" maxLength={200} />
                <span style={{ fontSize:11, color:'var(--gb-text3)', marginTop:2 }}>{(settings.meta_description||'').length}/200</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
              <div className="gb-section-title">⚙️ Options</div>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:14 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                  <input type="checkbox" checked={!!settings.show_progress} onChange={e => setSettings({...settings,show_progress:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  Show progress bar
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                  <input type="checkbox" checked={settings.send_email!==0&&settings.send_email!=='0'} onChange={e => setSettings({...settings,send_email:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                  Send completion email
                </label>
              </div>
              <div className="gb-fg" style={{ maxWidth:220 }}>
                <span className="gb-label">Time Per Question (sec, 0 = no limit)</span>
                <input type="number" min={0} value={settings.time_per_question||0} onChange={e => setSettings({...settings,time_per_question:e.target.value})} />
              </div>
            </div>

            {/* Terms */}
            <div className="gb-card" style={{ marginBottom:20, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <input type="checkbox" id="termsEnabled" checked={!!settings.terms_enabled}
                  onChange={e => setSettings({...settings,terms_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                <label htmlFor="termsEnabled" style={{ fontWeight:700, cursor:'pointer', fontSize:14 }}>Enable Terms & Conditions Checkbox</label>
              </div>
              {settings.terms_enabled
                ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div className="gb-fg"><span className="gb-label">Terms Label</span><input value={settings.terms_text||''} onChange={e => setSettings({...settings,terms_text:e.target.value})} placeholder="Terms & Conditions" /></div>
                    <div className="gb-fg"><span className="gb-label">Terms URL (optional)</span><input value={settings.terms_url||''} onChange={e => setSettings({...settings,terms_url:e.target.value})} placeholder="https://yoursite.com/terms" /></div>
                  </div>
                )
                : <p style={{ color:'var(--gb-text3)', fontSize:13 }}>Enable to require players to accept T&C before starting.</p>
              }
            </div>

            <button className="gb-btn gb-btn-primary" onClick={saveSettings} disabled={saving} style={{ padding:'10px 28px' }}>
              {saving ? '⏳ Saving…' : '💾 Save All Settings'}
            </button>
          </div>
        )}

        {/* ════ SOUNDS TAB ════ */}
        {tab === 'sounds' && (
          <div>
            {/* Upload */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h3 style={{ color:'var(--gb-text)', fontFamily:'inherit', marginBottom:4 }}>Sound Library</h3>
                <p style={{ color:'var(--gb-text2)', fontSize:13 }}>Upload MP3, WAV or OGG files, then assign them below.</p>
              </div>
              <div>
                <input type="file" ref={soundUploadRef} accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-wav,audio/wave" onChange={uploadSound} style={{ display:'none' }} />
                <button className="gb-btn gb-btn-primary" onClick={() => soundUploadRef.current.click()} disabled={soundUploading}>
                  {soundUploading ? '⏳ Uploading…' : '+ Upload Sound'}
                </button>
              </div>
            </div>

            {/* Assign sounds — moved here FROM settings tab */}
            <div className="gb-card" style={{ marginBottom:20, padding:16 }}>
              <div className="gb-section-title">🎮 Assign Sounds to Quiz</div>
              <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:14 }}>
                These play globally across the entire quiz. Upload sounds above first, then select them here.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:16 }}>
                <SoundSelector label="✅ Correct Answer" value={settings.sound_correct_id} onChange={v => setSettings({...settings,sound_correct_id:v})} sounds={sounds} />
                <SoundSelector label="❌ Wrong Answer" value={settings.sound_wrong_id} onChange={v => setSettings({...settings,sound_wrong_id:v})} sounds={sounds} />
                <SoundSelector label="🏆 Win / Completion" value={settings.win_sound_id} onChange={v => setSettings({...settings,win_sound_id:v})} sounds={sounds} />
                <SoundSelector label="💀 Lose Sound" value={settings.lose_sound_id} onChange={v => setSettings({...settings,lose_sound_id:v})} sounds={sounds} />
              </div>
              <button className="gb-btn gb-btn-primary gb-btn-sm" onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Sound Assignments'}
              </button>
            </div>

            {/* Sound list */}
            {sounds.length === 0
              ? (
                <div className="gb-empty">
                  <div className="gb-empty-icon">🔊</div>
                  <h3 style={{ color:'var(--gb-text)', marginBottom:8 }}>No sounds yet</h3>
                  <p>Upload MP3, WAV, or OGG files</p>
                  <button className="gb-btn gb-btn-primary" style={{ marginTop:16 }} onClick={() => soundUploadRef.current.click()}>+ Upload Sound</button>
                </div>
              )
              : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {sounds.map(s => (
                    <div key={s.id} className="gb-card" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px' }}>
                      <span style={{ fontSize:20 }}>🎵</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'var(--gb-text)' }}>{s.name}</div>
                        <div style={{ color:'var(--gb-text3)', fontSize:11, marginTop:2 }}>ID: {s.id} · {s.sound_type}</div>
                      </div>
                      <audio controls src={s.url} style={{ height:32 }} />
                      <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" onClick={() => deleteSound(s)}>🗑</button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}