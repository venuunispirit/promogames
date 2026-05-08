import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 12, background: type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'slideInRight 0.25s ease', fontFamily: 'DM Sans, sans-serif' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

function ColorPicker({ value, onChange, label }) {
  const [show, setShow] = useState(false)
  const presets = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']
  return (
    <div style={{ position: 'relative' }}>
      {label && <div className="form-label" style={{ marginBottom: 4 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div onClick={() => setShow(!show)} style={{ width: 36, height: 36, background: value || '#1a1a2e', borderRadius: 6, border: '2px solid var(--border)', cursor: 'pointer', flexShrink: 0 }} />
        <input value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: 100 }} placeholder="#000000" />
      </div>
      {show && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginTop: 4, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, width: 220 }}>
          {presets.map(c => <div key={c} onClick={() => { onChange(c); setShow(false) }} style={{ width: 24, height: 24, background: c, borderRadius: 4, cursor: 'pointer', border: value === c ? '2px solid white' : '1px solid transparent' }} />)}
          <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} style={{ gridColumn: 'span 7', width: '100%', height: 30, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
          <button className="btn btn-ghost btn-sm" style={{ gridColumn: 'span 7' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

function ImageUploadField({ label, currentUrl, onChange, onFileChange, accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp" }) {
  const ref = useRef()
  return (
    <div>
      <div className="form-label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input type="file" ref={ref} accept={accept} onChange={onFileChange} style={{ display: 'none' }} />
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {currentUrl && <img src={currentUrl} alt="" style={{ width: 'auto', height: 48, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border)', background: '#fff' }} />}
        {currentUrl && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={() => onChange('')}>✕</button>}
      </div>
    </div>
  )
}

function SoundSelector({ label, value, onChange, sounds }) {
  return (
    <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
      <label className="form-label">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

const ANIM_IN = [
  { value: 'flyFromBottom', label: '⬆️ Fly from Bottom' },
  { value: 'flyFromTop', label: '⬇️ Fly from Top' },
  { value: 'flyFromLeft', label: '➡️ Fly from Left' },
  { value: 'flyFromRight', label: '⬅️ Fly from Right' },
  { value: 'zoomIn', label: '🔍 Zoom In' },
  { value: 'fadeIn', label: '✨ Fade In' },
]

const ANIM_OUT = [
  { value: 'flyToTop', label: '⬆️ Fly to Top' },
  { value: 'flyToBottom', label: '⬇️ Fly to Bottom' },
  { value: 'flyToLeft', label: '⬅️ Fly to Left' },
  { value: 'flyToRight', label: '➡️ Fly to Right' },
  { value: 'zoomOut', label: '🔍 Zoom Out' },
  { value: 'fadeOut', label: '✨ Fade Out' },
]

function QuestionCard({ question, index, onSave, onDelete }) {
  const [q, setQ] = useState(question)
  const [saving, setSaving] = useState(false)
  const [imgPreview, setImgPreview] = useState(question.question_image_url || null)
  const [bgPreview, setBgPreview] = useState(question.question_bg_image_url || null)
  const imgRef = useRef(); const bgRef = useRef()

  const updateOption = (i, field, val) => {
    const opts = [...(q.options || [])]; opts[i] = { ...opts[i], [field]: val }; setQ({ ...q, options: opts })
  }
  const addOption = () => setQ({ ...q, options: [...(q.options || []), { option_text: '', option_color: '#1a1a2e', is_correct: 0, option_order: (q.options || []).length }] })
  const removeOption = (i) => { const opts = [...(q.options || [])]; opts.splice(i, 1); setQ({ ...q, options: opts }) }
  const setCorrect = (selectedIndex) => {
  setQ(prev => ({
    ...prev,
    options: prev.options.map((o, idx) => ({
      ...o,
      is_correct: idx === selectedIndex ? 1 : 0
    }))
  }))
}

  const handleSave = async () => { setSaving(true); try { await onSave(q) } finally { setSaving(false) } }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Question {index + 1}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={q.question_type} onChange={e => setQ({ ...q, question_type: e.target.value })} style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
            <option value="right_wrong">Right / Wrong</option>
            <option value="opinion">Opinion Based</option>
          </select>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(question)}>🗑</button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Question Text</label>
        <textarea rows={2} value={q.question_text} onChange={e => setQ({ ...q, question_text: e.target.value })} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <ColorPicker value={q.question_color} onChange={v => setQ({ ...q, question_color: v })} label="Question Color" />
        <ImageUploadField label="Question Image (optional)" currentUrl={imgPreview}
          onChange={v => { setImgPreview(v); setQ({ ...q, _imageFile: null, question_image_url: v }) }}
          onFileChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setImgPreview(ev.target.result); r.readAsDataURL(f); setQ({ ...q, _imageFile: f }) } }} />
        <ImageUploadField label="Question BG Image (overrides game BG)" currentUrl={bgPreview}
          onChange={v => { setBgPreview(v); setQ({ ...q, _bgImageFile: null, question_bg_image_url: v }) }}
          onFileChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setBgPreview(ev.target.result); r.readAsDataURL(f); setQ({ ...q, _bgImageFile: f }) } }} />
      </div>

      {/* Question Image Animation (idle motion while player reads) */}
      {imgPreview && (
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', marginBottom: 8 }}>🖼️ Question Image — Idle Motion</div>
          <div className="form-group" style={{ marginBottom: 4 }}>
            <label className="form-label">Animation while player is reading</label>
            <select value={q.question_image_animation || 'float'} onChange={e => setQ({ ...q, question_image_animation: e.target.value })}>
              <option value="float">🌊 Float (up & down)</option>
              <option value="breathe">💨 Breathe (gentle scale)</option>
              <option value="pulse">💓 Pulse (brightness + scale)</option>
              <option value="shimmer">✨ Shimmer (subtle tilt)</option>
              <option value="kenburns">🎥 Ken Burns (slow zoom-pan)</option>
              <option value="none">⛔ No animation</option>
            </select>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
            The question image plays an entrance animation then loops this idle motion the entire time the player is on the question. GIFs are supported and will animate on their own — choose "No animation" for GIFs.
          </p>
        </div>
      )}

      {/* Overlay Image Animation — Keynote-style settings */}
      <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', marginBottom: 12 }}>🎬 Overlay Image Animation (Keynote-style)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Image Fly-In</label>
            <select value={q.overlay_animation_in || 'flyFromBottom'} onChange={e => setQ({ ...q, overlay_animation_in: e.target.value })}>
              {ANIM_IN.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Image Fly-Out</label>
            <select value={q.overlay_animation_out || 'flyToTop'} onChange={e => setQ({ ...q, overlay_animation_out: e.target.value })}>
              {ANIM_OUT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Overlay Idle Time (sec)</label>
            <input type="number" min={0} max={60} value={q.overlay_idle_time ?? 3}
              onChange={e => setQ({ ...q, overlay_idle_time: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
          After selecting an option (1s delay), the overlay image flies in. After idle time the "Next" button appears. Tapping Next triggers the fly-out animation, then loads the next question.
        </p>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="form-label">Options</span>
          <button className="btn btn-ghost btn-sm" onClick={addOption}>+ Add Option</button>
        </div>
        {(q.options || []).map((opt, i) => (
          <OptionRow key={i} opt={opt} index={i}
            onUpdate={(field, val) => updateOption(i, field, val)}
            onRemove={() => removeOption(i)}
            onSetCorrect={() => setCorrect(i)}
            showCorrect={q.question_type === 'right_wrong'} />
        ))}
      </div>

      {/* Preview */}
      {(q.options || []).length > 0 && (
        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview (Mobile)</div>
          <div style={{ color: q.question_color || '#e8e8f0', fontWeight: 600, marginBottom: 10, fontSize: 14, textAlign: 'center' }}>{q.question_text || 'Your question here'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360, margin: '0 auto' }}>
            {(q.options || []).map((opt, i) => (
              <div key={i} style={{ background: opt.option_color || '#1a1a2e', borderRadius: 10, padding: '10px 14px', color: opt.option_text_color || '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'center', justifyContent: 'center' }}>
                {opt.option_image_url && <img src={opt.option_image_url} alt="" style={{ width: 'auto', height: 36, borderRadius: 5, objectFit: 'contain' }} />}
                {opt.option_text || `Option ${i + 1}`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save Question'}</button>
      </div>
    </div>
  )
}

function OptionRow({ opt, index, onUpdate, onRemove, onSetCorrect, showCorrect }) {
  const imgRef = useRef()
  const overlayRef = useRef()
  const [imgPrev, setImgPrev] = useState(opt.option_image_url || null)
  const [overlayPrev, setOverlayPrev] = useState(opt.option_overlay_image_url || null)

  const handleImgFile = (e) => {
    const f = e.target.files[0]
    if (f) { const r = new FileReader(); r.onload = ev => setImgPrev(ev.target.result); r.readAsDataURL(f); onUpdate('_optImageFile', f) }
  }
  const handleOverlayFile = (e) => {
    const f = e.target.files[0]
    if (f) { const r = new FileReader(); r.onload = ev => setOverlayPrev(ev.target.result); r.readAsDataURL(f); onUpdate('_overlayFile', f) }
  }

  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ color: 'var(--text2)', fontSize: 12, minWidth: 20 }}>{index + 1}.</span>
        <input value={opt.option_text || ''} onChange={e => onUpdate('option_text', e.target.value)} placeholder={`Option ${index + 1}`} style={{ flex: 1, minWidth: 100 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <ColorPicker value={opt.option_color} onChange={v => onUpdate('option_color', v)} />
          <span style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1 }}>BG</span>
          <ColorPicker value={opt.option_text_color || '#ffffff'} onChange={v => onUpdate('option_text_color', v)} />
          <span style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1 }}>Text</span>
        </div>
        {showCorrect && (
          <button className={`btn btn-sm ${
  Number(opt.is_correct) === 1
    ? 'btn-success'
    : 'btn-ghost'
}`} onClick={onSetCorrect} title="Mark as correct">
            {Number(opt.is_correct) === 1 ? '✅ Correct' : '○ Mark Correct'}
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onRemove} style={{ color: 'var(--danger)' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3, fontWeight: 600 }}>Option Image</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="file" ref={imgRef} accept="image/png,image/jpeg,image/jpg" onChange={handleImgFile} style={{ display: 'none' }} />
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => imgRef.current.click()}>📷</button>
            {imgPrev && <img src={imgPrev} alt="" style={{ width: 'auto', height: 36, borderRadius: 5, objectFit: 'contain', border: '1px solid var(--border)', background: '#fff' }} />}
            {imgPrev && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)', padding: '2px 6px' }} onClick={() => { setImgPrev(null); onUpdate('option_image_url', '') }}>✕</button>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3, fontWeight: 600 }}>Overlay Image (shown after select)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="file" ref={overlayRef} accept="image/png,image/jpeg,image/jpg" onChange={handleOverlayFile} style={{ display: 'none' }} />
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => overlayRef.current.click()}>🖼️</button>
            {overlayPrev && <img src={overlayPrev} alt="" style={{ width: 'auto', height: 36, borderRadius: 5, objectFit: 'contain', border: '1px solid var(--border)', background: '#fff' }} />}
            {overlayPrev && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)', padding: '2px 6px' }} onClick={() => { setOverlayPrev(null); onUpdate('option_overlay_image_url', '') }}>✕</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GameBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [tab, setTab] = useState('questions')
  const [toast, setToast] = useState(null)
  const [questions, setQuestions] = useState([])
  const [formFields, setFormFields] = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [settings, setSettings] = useState({})
  const [sounds, setSounds] = useState([])
  const [saving, setSaving] = useState(false)
  const [soundUploading, setSoundUploading] = useState(false)
  const soundUploadRef = useRef()
  const bgImgRef = useRef()
  const tyBgImgRef = useRef()
  const gameLogoRef = useRef()

  const FONTS = [
    'DM Sans','Syne','Inter','Poppins','Raleway','Nunito','Lato',
    'Montserrat','Oswald','Playfair Display','Merriweather','Source Sans 3',
    'Quicksand','Josefin Sans','Rubik','Work Sans','Exo 2','Cabin','Ubuntu','Comfortaa'
  ]

  useEffect(() => {
    api.get(`/games/${id}`).then(res => {
      const g = res.data.game
      setGame(g); setQuestions(g.questions || []); setFormFields(g.formFields || [])
      setEmailTemplate(g.emailTemplate || {}); setSettings(g.settings || {})
      setSounds(g.sounds || [])
      setFetchError(null)
    }).catch(err => {
      const msg = err.response?.data?.message || err.message || 'Failed to load game'
      setFetchError(msg)
    }).finally(() => setLoading(false))
  }, [id])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const addQuestion = async () => {
    try {
      const fd = new FormData()
      fd.append('question_text', 'New Question')
      fd.append('question_type', 'right_wrong')
      fd.append('question_color', '#e8e8f0')
      fd.append('question_order', questions.length)
      fd.append('num_options', 4)
      const res = await api.post(`/quiz/games/${id}/questions`, fd)
      setQuestions([...questions, { ...res.data.question, options: [] }])
      showToast('Question added')
    } catch (err) { showToast('Error adding question: ' + (err.response?.data?.message || err.message), 'error') }
  }

  const saveQuestion = async (q) => {
    try {
      const formData = new FormData()
      formData.append('question_text', q.question_text)
      formData.append('question_type', q.question_type)
      formData.append('question_color', q.question_color || '#e8e8f0')
      formData.append('sound_neutral_id', q.sound_neutral_id || '')
      formData.append('overlay_idle_time', q.overlay_idle_time ?? 3)
      formData.append('overlay_animation_in', q.overlay_animation_in || 'flyFromBottom')
      formData.append('overlay_animation_out', q.overlay_animation_out || 'flyToTop')
      formData.append('question_image_animation', q.question_image_animation || 'float')
      if (q._imageFile) formData.append('question_image', q._imageFile)
      if (q._bgImageFile) formData.append('question_bg_image', q._bgImageFile)
      await api.put(`/quiz/questions/${q.id}`, formData)

      for (const opt of (q.options || [])) {
        const fd = new FormData()
        fd.append('option_text', opt.option_text || '')
        fd.append('option_color', opt.option_color || '#1a1a2e')
        fd.append('option_text_color', opt.option_text_color || '#ffffff')
        fd.append('is_correct', opt.is_correct ? 1 : 0)
        fd.append('option_order', q.options.indexOf(opt))
        if (opt._optImageFile) fd.append('option_image', opt._optImageFile)
        if (opt._overlayFile) fd.append('option_overlay_image', opt._overlayFile)
        if (opt.id) {
          await api.put(`/quiz/options/${opt.id}`, fd)
        } else {
          await api.post(`/quiz/questions/${q.id}/options`, fd)
        }
      }
      showToast('Question saved ✅')
    } catch { showToast('Error saving question', 'error') }
  }

  const deleteQuestion = async (q) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/quiz/questions/${q.id}`)
      setQuestions(questions.filter(x => x.id !== q.id))
      showToast('Question deleted')
    } catch { showToast('Error deleting question', 'error') }
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

  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['bg_color','primary_color','show_progress','allow_back','time_per_question',
        'intro_text','outro_text','win_sound_id','lose_sound_id','sound_correct_id','sound_wrong_id',
        'terms_enabled','terms_text','terms_url','send_email','font_family']
      for (const f of fields) fd.append(f, settings[f] ?? '')
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._tyBgImageFile) fd.append('thankyou_bg_image', settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._submitGifFile) fd.append('submit_confirm_gif', settings._submitGifFile)
      else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url || '')
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url || '')
      await api.put(`/games/${id}/settings`, fd)
      showToast('Settings saved')
    } catch (err) { showToast('Error saving settings: ' + (err.response?.data?.message || err.message), 'error') }
    setSaving(false)
  }

  const uploadSound = async (e) => {
    const file = e.target.files[0]; if (!file) return
    // Validate audio type
    const allowed = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/x-wav','audio/wave']
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      showToast('Only MP3, WAV, OGG files are allowed', 'error')
      e.target.value = ''; return
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('sound_type', 'custom')
    setSoundUploading(true)
    try {
      const res = await api.post(`/sounds/games/${id}/sounds`, fd)
      setSounds(prev => [res.data.sound, ...prev])
      showToast('Sound uploaded ✅')
    } catch (err) { showToast('Error uploading sound: ' + (err.response?.data?.message || err.message), 'error') }
    setSoundUploading(false)
    e.target.value = ''
  }

  const deleteSound = async (s) => {
    try { await api.delete(`/sounds/sounds/${s.id}`); setSounds(prev => prev.filter(x => x.id !== s.id)); showToast('Sound deleted') }
    catch { showToast('Error', 'error') }
  }

  const addFormField = () => setFormFields([...formFields, { field_label: 'New Field', field_type: 'text', is_required: 0, field_options: [] }])
  const removeFormField = (i) => { const f = [...formFields]; f.splice(i, 1); setFormFields(f) }
  const updateFormField = (i, key, val) => { const f = [...formFields]; f[i] = { ...f[i], [key]: val }; setFormFields(f) }

  const gameLink = game ? `${window.location.origin}/play/${game.slug}/${game.client_slug}` : ''
  const tabs = [
    { id: 'questions', label: '❓ Questions' },
    { id: 'form', label: '📋 Player Form' },
    { id: 'email', label: '📧 Email' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'sounds', label: '🔊 Sounds' },
  ]

  if (loading) return <div className="page-loader"><div className="loader-spin" /><span>Loading builder…</span></div>
  if (fetchError) return (
    <div className="page-loader" style={{ flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ color: 'var(--danger)', fontFamily: 'Syne, sans-serif', fontSize: 20, margin: 0 }}>Builder Failed to Load</h2>
      <p style={{ color: 'var(--text2)', textAlign: 'center', maxWidth: 400, margin: 0 }}>{fetchError}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setLoading(true); setFetchError(null); api.get(`/games/${id}`).then(res => { const g = res.data.game; setGame(g); setQuestions(g.questions || []); setFormFields(g.formFields || []); setEmailTemplate(g.emailTemplate || {}); setSettings(g.settings || {}); setSounds(g.sounds || []); }).catch(err => setFetchError(err.response?.data?.message || err.message)).finally(() => setLoading(false)) }}>🔄 Retry</button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/games')}>← Back to Games</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/games')} style={{ marginBottom: 8 }}>← Back</button>
          <h1 style={{ fontSize: 22 }}>{game?.name}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>🏢 {game?.company_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(gameLink); showToast('Link copied!') }}>🔗 Copy Link</button>
          <a href={gameLink} target="_blank" className="btn btn-ghost btn-sm">👁 Preview</a>
        </div>
      </div>

      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', marginBottom: 24, fontSize: 12, color: 'var(--text2)', wordBreak: 'break-all' }}>🔗 {gameLink}</div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? 'var(--primary)' : 'var(--text2)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
            <button className="btn btn-primary" onClick={addQuestion}>+ Add Question</button>
          </div>
          {questions.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 48 }}>❓</div><h3>No questions yet</h3><p>Add your first question</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={addQuestion}>+ Add Question</button></div>
          ) : (
            questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} onSave={saveQuestion} onDelete={deleteQuestion} />)
          )}
        </div>
      )}

      {tab === 'form' && (
        <div>
          <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 14 }}>These fields appear on the player registration screen before the quiz starts.</p>
          {formFields.map((f, i) => (
            <div key={i} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 2, minWidth: 140, marginBottom: 0 }}>
                  <label className="form-label">Label</label>
                  <input value={f.field_label} onChange={e => updateFormField(i, 'field_label', e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 110, marginBottom: 0 }}>
                  <label className="form-label">Type</label>
                  <select value={f.field_type} onChange={e => updateFormField(i, 'field_type', e.target.value)}>
                    <option value="text">Text</option><option value="email">Email</option>
                    <option value="phone">Phone</option><option value="number">Number</option>
                    <option value="textarea">Textarea</option><option value="select">Dropdown</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 2 }}>
                  <input type="checkbox" id={`req-${i}`} checked={!!f.is_required} onChange={e => updateFormField(i, 'is_required', e.target.checked ? 1 : 0)} style={{ width: 16, height: 16 }} />
                  <label htmlFor={`req-${i}`} style={{ fontSize: 13, color: 'var(--text2)' }}>Required</label>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeFormField(i)}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={addFormField}>+ Add Field</button>
            <button className="btn btn-primary" onClick={saveFormFields} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
          </div>
        </div>
      )}

      {tab === 'email' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Configure the congratulations email sent to players.</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!emailTemplate.is_enabled} onChange={e => setEmailTemplate({ ...emailTemplate, is_enabled: e.target.checked ? 1 : 0 })} style={{ width: 16, height: 16 }} />
              Enable email
            </label>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: 'var(--text2)' }}>
            💡 SMTP credentials are configured in the server <code>.env</code> file. Use <code>{'{{name}}'}</code>, <code>{'{{score}}'}</code>, <code>{'{{total}}'}</code>, <code>{'{{game_name}}'}</code> as placeholders.
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sender Name</label><input value={emailTemplate.sender_name || ''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_name: e.target.value })} placeholder="Quiz Platform" /></div>
            <div className="form-group"><label className="form-label">Sender Email</label><input value={emailTemplate.sender_email || ''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_email: e.target.value })} placeholder="noreply@yourdomain.com" /></div>
          </div>
          <div className="form-group"><label className="form-label">Subject</label><input value={emailTemplate.subject || ''} onChange={e => setEmailTemplate({ ...emailTemplate, subject: e.target.value })} placeholder="Congratulations {{name}}! 🎉" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Header Text</label><input value={emailTemplate.header_text || ''} onChange={e => setEmailTemplate({ ...emailTemplate, header_text: e.target.value })} placeholder="🎉 Congratulations!" /></div>
            <div style={{ paddingBottom: 16 }}><ColorPicker value={emailTemplate.header_color || '#6366f1'} onChange={v => setEmailTemplate({ ...emailTemplate, header_color: v })} label="Header Color" /></div>
          </div>
          <div className="form-group"><label className="form-label">Email Body (HTML)</label><textarea rows={5} value={emailTemplate.body_html || ''} onChange={e => setEmailTemplate({ ...emailTemplate, body_html: e.target.value })} placeholder="<p>Thank you for completing our quiz, {{name}}!</p>" style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} /></div>
          <div className="form-group"><label className="form-label">Footer Text</label><input value={emailTemplate.footer_text || ''} onChange={e => setEmailTemplate({ ...emailTemplate, footer_text: e.target.value })} placeholder="© 2024 Your Company" /></div>
          <button className="btn btn-primary" onClick={saveEmailTemplate} disabled={saving}>{saving ? 'Saving…' : '💾 Save Email Template'}</button>
        </div>
      )}

      {tab === 'settings' && (
        <div>
          {/* Game Logo */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label" style={{ marginBottom: 6 }}>🖼️ Game Logo (shown on player screen)</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" ref={gameLogoRef} accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setSettings({ ...settings, game_logo_url: ev.target.result, _gameLogoFile: f }); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => gameLogoRef.current.click()}>📷 Upload Logo</button>
              {settings.game_logo_url && (<>
                <img src={settings.game_logo_url} alt="" style={{ maxWidth: 120, maxHeight: 60, width: 'auto', height: 'auto', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', objectFit: 'contain' }} />
                <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={() => setSettings({ ...settings, game_logo_url: '', _gameLogoFile: null })}>✕ Remove</button>
              </>)}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>Supports portrait and landscape images. The full image will be displayed (not cropped).</p>
          </div>

          {/* Font Selector */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>🔤 Font Family (player-facing text)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--bg3)' }}>
              {FONTS.map(font => (
                <div key={font} onClick={() => setSettings({ ...settings, font_family: font })}
                  style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${settings.font_family === font || (!settings.font_family && font === 'DM Sans') ? 'var(--primary)' : 'transparent'}`, background: settings.font_family === font || (!settings.font_family && font === 'DM Sans') ? 'var(--primary)15' : 'var(--surface)', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontFamily: `'${font}', sans-serif`, color: 'var(--text)', marginBottom: 2, fontWeight: 600 }}>{font}</div>
                  <div style={{ fontSize: 11, fontFamily: `'${font}', sans-serif`, color: 'var(--text2)' }}>The quick brown fox</div>
                  <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700&display=swap');`}</style>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><ColorPicker value={settings.bg_color || '#ffffff'} onChange={v => setSettings({ ...settings, bg_color: v })} label="Background Color (Player)" /></div>
            <div><ColorPicker value={settings.primary_color || '#6366f1'} onChange={v => setSettings({ ...settings, primary_color: v })} label="Primary / Accent Color" /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Game Background Image</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" ref={bgImgRef} accept="image/png,image/jpeg,image/jpg" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setSettings({ ...settings, bg_image_url: ev.target.result, _bgImageFile: f }); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => bgImgRef.current.click()}>📷 Upload</button>
                {settings.bg_image_url && <img src={settings.bg_image_url} alt="" style={{ width: 'auto', height: 40, borderRadius: 6, border: '1px solid var(--border)' }} />}
                {settings.bg_image_url && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={() => setSettings({ ...settings, bg_image_url: '', _bgImageFile: null })}>✕</button>}
              </div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Thank You Page BG Image</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" ref={tyBgImgRef} accept="image/png,image/jpeg,image/jpg" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setSettings({ ...settings, thankyou_bg_image_url: ev.target.result, _tyBgImageFile: f }); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => tyBgImgRef.current.click()}>📷 Upload</button>
                {settings.thankyou_bg_image_url && <img src={settings.thankyou_bg_image_url} alt="" style={{ width: 'auto', height: 40, borderRadius: 6, border: '1px solid var(--border)' }} />}
                {settings.thankyou_bg_image_url && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={() => setSettings({ ...settings, thankyou_bg_image_url: '', _tyBgImageFile: null })}>✕</button>}
              </div>
            </div>
          </div>

          <div className="form-group"><label className="form-label">Intro Text (shown before quiz)</label><textarea rows={2} value={settings.intro_text || ''} onChange={e => setSettings({ ...settings, intro_text: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div className="form-group"><label className="form-label">Outro / Thank You Text</label><textarea rows={2} value={settings.outro_text || ''} onChange={e => setSettings({ ...settings, outro_text: e.target.value })} style={{ resize: 'vertical' }} /></div>

          {/* Submit Confirmation GIF */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--primary)' }}>🎊 Submit Confirmation GIF</div>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 12 }}>Shown in the popup modal when the player presses "Submit & Explore". Use a celebratory GIF for a great experience.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="file" id="submitGifInput" accept="image/gif,image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setSettings({ ...settings, submit_confirm_gif_url: ev.target.result, _submitGifFile: f }); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => document.getElementById('submitGifInput').click()}>🎬 Upload GIF / Image</button>
              {settings.submit_confirm_gif_url && <img src={settings.submit_confirm_gif_url} alt="" style={{ width: 'auto', height: 56, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain' }} />}
              {settings.submit_confirm_gif_url && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={() => setSettings({ ...settings, submit_confirm_gif_url: '', _submitGifFile: null })}>✕ Remove</button>}
            </div>
          </div>

          {/* Quiz-level Sounds */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--primary)' }}>🔊 Quiz Sounds (1 per quiz)</div>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 12 }}>One correct and one wrong sound for the entire quiz — plays whenever any right/wrong answer is selected.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <SoundSelector label="✅ Correct Answer Sound" value={settings.sound_correct_id} onChange={v => setSettings({ ...settings, sound_correct_id: v })} sounds={sounds} />
              <SoundSelector label="❌ Wrong Answer Sound" value={settings.sound_wrong_id} onChange={v => setSettings({ ...settings, sound_wrong_id: v })} sounds={sounds} />
              <SoundSelector label="🏆 Win / Completion Sound" value={settings.win_sound_id} onChange={v => setSettings({ ...settings, win_sound_id: v })} sounds={sounds} />
              <SoundSelector label="💀 Lose Sound (optional)" value={settings.lose_sound_id} onChange={v => setSettings({ ...settings, lose_sound_id: v })} sounds={sounds} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!settings.show_progress} onChange={e => setSettings({ ...settings, show_progress: e.target.checked ? 1 : 0 })} style={{ width: 16, height: 16 }} />
              Show progress bar
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.send_email !== 0 && settings.send_email !== '0'} onChange={e => setSettings({ ...settings, send_email: e.target.checked ? 1 : 0 })} style={{ width: 16, height: 16 }} />
              Send completion email
            </label>
          </div>

          <div className="card" style={{ marginBottom: 16, background: 'var(--bg3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input type="checkbox" id="termsEnabled" checked={!!settings.terms_enabled} onChange={e => setSettings({ ...settings, terms_enabled: e.target.checked ? 1 : 0 })} style={{ width: 16, height: 16 }} />
              <label htmlFor="termsEnabled" style={{ fontWeight: 600, cursor: 'pointer' }}>Enable Terms & Conditions Checkbox</label>
            </div>
            {settings.terms_enabled ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Terms Label / Name</label>
                  <input value={settings.terms_text || ''} onChange={e => setSettings({ ...settings, terms_text: e.target.value })} placeholder="Terms & Conditions" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Terms URL (optional)</label>
                  <input value={settings.terms_url || ''} onChange={e => setSettings({ ...settings, terms_url: e.target.value })} placeholder="https://yoursite.com/terms" />
                </div>
              </div>
            ) : <p style={{ color: 'var(--text2)', fontSize: 13 }}>Enable to require players to accept T&C before starting the game.</p>}
          </div>

          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label">Time Per Question (sec, 0 = no limit)</label>
            <input type="number" min={0} value={settings.time_per_question || 0} onChange={e => setSettings({ ...settings, time_per_question: e.target.value })} />
          </div>

          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>{saving ? 'Saving…' : '💾 Save Settings'}</button>
        </div>
      )}

      {tab === 'sounds' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Sound Library</h3>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>Upload sounds here, then assign them in Settings tab. Accepts MP3, WAV, OGG.</p>
            </div>
            <div>
              <input type="file" ref={soundUploadRef} accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-wav,audio/wave" onChange={uploadSound} style={{ display: 'none' }} />
              <button className="btn btn-primary" onClick={() => soundUploadRef.current.click()} disabled={soundUploading}>
                {soundUploading ? '⏳ Uploading…' : '+ Upload Sound'}
              </button>
            </div>
          </div>

          {sounds.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🔊</div>
              <h3>No sounds yet</h3>
              <p>Upload MP3, WAV, or OGG files to use as correct/wrong/win sounds</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => soundUploadRef.current.click()}>+ Upload Sound</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sounds.map(s => (
                <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <span style={{ fontSize: 20 }}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ color: 'var(--text2)', fontSize: 11, marginTop: 2 }}>ID: {s.id} · {s.sound_type}</div>
                  </div>
                  <audio controls src={s.url} style={{ height: 32 }} />
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteSound(s)}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}