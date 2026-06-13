import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

/* ── SPIN THEME TOKENS (mirrors crossword builder's LIGHT) ──────────── */
const SPIN_LIGHT = `
.cb-wrap {
  --gb-bg:        #f4f6fb;
  --gb-surface:   #ffffff;
  --gb-surface2:  #f0f2f8;
  --gb-border:    #e2e6f0;
  --gb-border2:   #cdd3e0;
  --gb-primary:   #7c6ff7;
  --gb-primary-d: #6b5de6;
  --gb-primary-g: rgba(124,111,247,0.15);
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
.cb-wrap *,
.cb-wrap *::before,
.cb-wrap *::after { box-sizing: border-box; }
.cb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]),
.cb-wrap select,
.cb-wrap textarea {
  width: 100%; font-family: inherit; font-size: 14px; background: transparent;
  border: none; border-bottom: 1.5px solid var(--gb-border);
  border-radius: 6px 6px 4px 4px; color: var(--gb-text);
  padding: 8px 10px 6px; outline: none; transition: border-color .18s;
}
.cb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]):focus,
.cb-wrap select:focus,
.cb-wrap textarea:focus { border-bottom-color: #22c55e; box-shadow: none; }
.cb-wrap select option { background: #fff; color: #1e1e2e; }
.cb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  border-radius: var(--gb-radius-sm); border: none; cursor: pointer;
  transition: all .15s; white-space: nowrap; font-family: inherit;
}
.cb-btn:disabled { opacity: .5; cursor: not-allowed; }
.cb-btn-primary { background: var(--gb-primary); color: #fff; }
.cb-btn-primary:not(:disabled):hover { background: var(--gb-primary-d); transform: translateY(-1px); box-shadow: 0 4px 12px var(--gb-primary-g); }
.cb-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.cb-btn-ghost:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.cb-btn-bg { color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.cb-btn-bg:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.cb-btn-sm { padding: 5px 10px; font-size: 12px; }
.gb-section {
  background: var(--gb-surface2);
  border: 1px solid var(--gb-border);
  border-radius: var(--gb-radius);
  padding: 14px;
  margin-bottom: 10px;
}
.gb-section-title {
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; color: var(--gb-primary);
  margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.gb-phone {
  width: 220px; min-height: 380px; border-radius: 28px;
  border: 3px solid #d1d5db; background: #f9f9fb;
  overflow: hidden; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,.12);
}
.gb-empty { text-align: center; padding: 56px 20px; color: var(--gb-text2); }
.gb-empty-icon { font-size: 44px; margin-bottom: 12px; }
.gb-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
.gb-col { flex: 1; min-width: 140px; }
.gb-label {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--gb-text2); margin-bottom: 4px;
  display: block;
}
`

/* ─── helpers ─────────────────────────────────────────────────────────── */
function ImageField({ label, currentUrl, onFileChange, onClear }) {
  const ref = useRef()
  return (
    <div>
      <div className="gb-label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input type="file" ref={ref} accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        <button className="cb-btn cb-btn-ghost cb-btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {currentUrl && <img src={currentUrl} alt="" style={{ height: 44, borderRadius: 6, objectFit: 'contain', border: '1.5px solid var(--gb-border)', background: '#fff' }} />}
        {currentUrl && <button className="cb-btn cb-btn-ghost cb-btn-sm" type="button" style={{ color: 'var(--gb-danger)' }} onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

function SoundSelect({ label, value, onChange, sounds }) {
  return (
    <div style={{ flex: 1, minWidth: 150 }}>
      <div className="gb-label">{label}</div>
      <select value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

/* ─── Live Wheel Preview ────────────────────────────────────────────────── */
function WheelPreview({ segments, settings, size = 220 }) {
  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - 8
  const total = segments.reduce((s, seg) => s + (parseInt(seg.weight) || 1), 0)

  let startAngle = -Math.PI / 2
  const slices = segments.map(seg => {
    const w = parseInt(seg.weight) || 1
    const sweep = (w / total) * 2 * Math.PI
    const endAngle = startAngle + sweep
    const mid = startAngle + sweep / 2

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = sweep > Math.PI ? 1 : 0

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    const tx = cx + (r * 0.65) * Math.cos(mid)
    const ty = cy + (r * 0.65) * Math.sin(mid)
    const angle = (mid * 180) / Math.PI

    const slice = { d, tx, ty, angle, color: seg.bg_color || '#7C6FF7', textColor: seg.text_color || '#fff', label: seg.label }
    startAngle = endAngle
    return slice
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {segments.length === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="#E5E7EB" />
      ) : slices.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={s.color} stroke="#fff" strokeWidth="2" />
          <text
            x={s.tx} y={s.ty}
            textAnchor="middle" dominantBaseline="middle"
            fill={s.textColor}
            fontSize={Math.max(7, Math.min(11, size / 22))}
            fontWeight="700"
            transform={`rotate(${s.angle + 90}, ${s.tx}, ${s.ty})`}
            style={{ pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif' }}
          >
            {s.label.length > 10 ? s.label.slice(0, 9) + '…' : s.label}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={size * 0.1} fill={settings?.center_color || '#1F2937'} stroke="#fff" strokeWidth="3" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff"
        fontSize={size * 0.06} fontWeight="800" style={{ fontFamily: 'DM Sans,sans-serif' }}>
        {settings?.center_label || 'SPIN'}
      </text>
      <polygon
        points={`${cx},${8} ${cx - 10},${28} ${cx + 10},${28}`}
        fill={settings?.pointer_color || '#EF4444'}
        stroke="#fff" strokeWidth="2"
      />
    </svg>
  )
}

/* ─── Segment Card ─────────────────────────────────────────────────────── */
const SEGMENT_COLORS = [
  '#7C6FF7','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444',
  '#8B5CF6','#14B8A6','#F97316','#6366F1','#84CC16','#06B6D4',
]

function SegmentCard({ seg, index, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      background: 'var(--gb-surface)', border: '1.5px solid var(--gb-border)', borderRadius: 10,
      marginBottom: 8, transition: 'box-shadow .15s',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: seg.bg_color || '#7C6FF7', flexShrink: 0, border: '2px solid var(--gb-border)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gb-text)' }}>{seg.label}</div>
        <div style={{ fontSize: 12, color: 'var(--gb-text2)', marginTop: 2 }}>
          {seg.segment_type === 'prize' ? '🎁 Prize' : seg.segment_type === 'try_again' ? '🔄 Try Again' : '😔 No Prize'}
          {' · '}Weight: {seg.weight}
          {seg.coupon_code && ` · Code: ${seg.coupon_code}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={() => onMoveUp(index)} disabled={isFirst} style={{ padding: '3px 7px' }}>↑</button>
        <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={() => onMoveDown(index)} disabled={isLast} style={{ padding: '3px 7px' }}>↓</button>
        <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={() => onEdit(seg)} style={{ padding: '3px 8px' }}>✏️</button>
        <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={() => onDelete(seg.id)} style={{ padding: '3px 8px', color: 'var(--gb-danger)' }}>🗑️</button>
      </div>
    </div>
  )
}

/* ─── Segment Modal ────────────────────────────────────────────────────── */
function SegmentModal({ seg, sounds, onSave, onClose }) {
  const [form, setForm] = useState(seg || {
    label: '', bg_color: SEGMENT_COLORS[0], text_color: '#FFFFFF',
    weight: 100, segment_type: 'prize',
    prize_description: '', coupon_code: '', sound_id: '',
  })
  const [couponFile, setCouponFile]   = useState(null)
  const [overlayFile, setOverlayFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.label.trim()) return alert('Label is required')
    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
    if (couponFile)  fd.append('coupon_image',  couponFile)
    if (overlayFile) fd.append('overlay_image', overlayFile)
    await onSave(fd, seg?.id)
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{seg ? 'Edit Segment' : 'Add Segment'}</h3>
          <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="gb-label">Label *</div>
            <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. 10% OFF" maxLength={50} />
          </div>

          <div className="gb-row">
            <div style={{ flex: 1 }}>
              <div className="gb-label">Segment Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                {SEGMENT_COLORS.map(c => (
                  <div key={c} onClick={() => set('bg_color', c)} style={{
                    width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer',
                    border: `3px solid ${form.bg_color === c ? '#1F2937' : 'transparent'}`,
                    transition: 'border-color .15s'
                  }} />
                ))}
              </div>
              <input type="color" value={form.bg_color || '#7C6FF7'} onChange={e => set('bg_color', e.target.value)}
                style={{ width: 40, height: 30, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="gb-label">Text Color</div>
              <input type="color" value={form.text_color || '#FFFFFF'} onChange={e => set('text_color', e.target.value)}
                style={{ width: 40, height: 30, border: 'none', cursor: 'pointer', borderRadius: 4, display: 'block', marginTop: 4 }} />
            </div>
          </div>

          <div className="gb-row">
            <div style={{ flex: 1 }}>
              <div className="gb-label">Type</div>
              <select value={form.segment_type} onChange={e => set('segment_type', e.target.value)}>
                <option value="prize">🎁 Prize</option>
                <option value="try_again">🔄 Try Again</option>
                <option value="no_prize">😔 No Prize</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div className="gb-label">Weight (probability)</div>
              <input type="number" min="1" max="9999" value={form.weight}
                onChange={e => set('weight', e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--gb-text2)', marginTop: 2 }}>Higher = more likely to land</div>
            </div>
          </div>

          {form.segment_type === 'prize' && <>
            <div>
              <div className="gb-label">Prize Description</div>
              <textarea rows={2} value={form.prize_description || ''} onChange={e => set('prize_description', e.target.value)} placeholder="e.g. Get 10% off your next purchase" />
            </div>
            <div>
              <div className="gb-label">Coupon Code</div>
              <input value={form.coupon_code || ''} onChange={e => set('coupon_code', e.target.value)} placeholder="e.g. SPIN10OFF" />
            </div>
            <div>
              <div className="gb-label">Coupon Image <span style={{ color: 'var(--gb-text2)', fontWeight: 400 }}>(optional)</span></div>
              <input type="file" accept="image/*" onChange={e => setCouponFile(e.target.files[0])} />
              {seg?.coupon_image_url && !couponFile && <img src={seg.coupon_image_url} alt="" style={{ height: 40, marginTop: 6, borderRadius: 6, border: '1px solid var(--gb-border)' }} />}
            </div>
          </>}

          <div>
            <div className="gb-label">Overlay Image <span style={{ color: 'var(--gb-text2)', fontWeight: 400 }}>(shown fullscreen on result)</span></div>
            <input type="file" accept="image/*" onChange={e => setOverlayFile(e.target.files[0])} />
            {seg?.overlay_image_url && !overlayFile && <img src={seg.overlay_image_url} alt="" style={{ height: 40, marginTop: 6, borderRadius: 6, border: '1px solid var(--gb-border)' }} />}
          </div>

          <SoundSelect label="Sound on Land" value={form.sound_id} onChange={v => set('sound_id', v)} sounds={sounds} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button className="cb-btn cb-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="cb-btn cb-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : seg ? 'Update Segment' : 'Add Segment'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
const TABS = [
  { id:'display',   label:'🎨 Display' },
  { id:'segments',  label:'🎡 Segments' },
  { id:'sounds',    label:'🔊 Sounds' },
  { id:'thankyou',  label:'🙏 Thank You' },
  { id:'email',     label:'📧 Email' },
  { id:'settings',  label:'⚙️ Settings' },
]

/* ═══════════════════════════════════════════════
   MAIN BUILDER COMPONENT
   ═══════════════════════════════════════════════ */
export default function SpinBuilderTab() {
  const { id: gameId } = useParams()
  const navigate = useNavigate()
  const [tab,      setTab]      = useState('display')
  const [settings, setSettings] = useState(null)
  const [segments, setSegments] = useState([])
  const [sounds,   setSounds]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [modal,    setModal]    = useState(null)
  const [gameName, setGameName] = useState('')

  const [sForm, setSForm] = useState({
    heading_1: '', heading_2: '', description_text: '', spin_mode: 'once',
    win_message: '', lose_message: '',
    wheel_bg_color: '#FFFFFF', pointer_color: '#EF4444', center_color: '#1F2937', center_label: 'SPIN',
    bg_color: '#F8F8FF', primary_color: '#7C6FF7', font_family: 'DM Sans',
    sound_spin_id: '', sound_win_id: '', sound_lose_id: '',
  })
  const [bgFile,   setBgFile]   = useState(null)
  const [tyFile,   setTyFile]   = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [sUrls,    setSUrls]    = useState({ bg: null, ty: null, logo: null })

  useEffect(() => {
    Promise.all([
      api.get(`/spin/${gameId}/settings`),
      api.get(`/spin/games/${gameId}/segments`),
      api.get(`/sounds/games/${gameId}/sounds`),
    ]).then(([sRes, segRes, sndRes]) => {
      const s = sRes.data.settings
      if (s) {
        setSForm({
          heading_1: s.heading_1 || '', heading_2: s.heading_2 || '',
          description_text: s.description_text || '', spin_mode: s.spin_mode || 'once',
          win_message: s.win_message || '', lose_message: s.lose_message || '',
          wheel_bg_color: s.wheel_bg_color || '#FFFFFF', pointer_color: s.pointer_color || '#EF4444',
          center_color: s.center_color || '#1F2937', center_label: s.center_label || 'SPIN',
          bg_color: s.bg_color || '#F8F8FF', primary_color: s.primary_color || '#7C6FF7',
          font_family: s.font_family || 'DM Sans',
          sound_spin_id: s.sound_spin_id || '', sound_win_id: s.sound_win_id || '',
          sound_lose_id: s.sound_lose_id || '',
        })
        setSUrls({ bg: s.bg_image_url, ty: s.thankyou_bg_image_url, logo: s.game_logo_url })
        setSettings(s)
      }
      setSegments(segRes.data.segments || [])
      setSounds(sndRes.data.sounds || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [gameId])

  const setS = (k, v) => setSForm(f => ({ ...f, [k]: v }))

  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(sForm).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
      if (!bgFile)   fd.append('bg_image_url',          sUrls.bg   || '')
      if (!tyFile)   fd.append('thankyou_bg_image_url', sUrls.ty   || '')
      if (!logoFile) fd.append('game_logo_url',         sUrls.logo || '')
      if (bgFile)    fd.append('bg_image',          bgFile)
      if (tyFile)    fd.append('thankyou_bg_image', tyFile)
      if (logoFile)  fd.append('game_logo',         logoFile)

      const res = await api.put(`/spin/${gameId}/settings`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSettings(res.data.settings)
      const s = res.data.settings
      setSUrls({ bg: s.bg_image_url, ty: s.thankyou_bg_image_url, logo: s.game_logo_url })
      setBgFile(null); setTyFile(null); setLogoFile(null)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const handleSegmentSave = async (fd, segId) => {
    try {
      if (segId) {
        const res = await api.put(`/spin/segments/${segId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSegments(prev => prev.map(s => s.id === segId ? res.data.segment : s))
      } else {
        fd.append('segment_order', segments.length)
        const res = await api.post(`/spin/games/${gameId}/segments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSegments(prev => [...prev, res.data.segment])
      }
      setModal(null)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message))
    }
  }

  const deleteSegment = async (id) => {
    if (!confirm('Delete this segment?')) return
    await api.delete(`/spin/segments/${id}`)
    setSegments(prev => prev.filter(s => s.id !== id))
  }

  const moveSegment = async (idx, dir) => {
    const arr = [...segments]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    const order = arr.map((s, i) => ({ id: s.id, segment_order: i }))
    await api.post(`/spin/games/${gameId}/segments/reorder`, { order })
    setSegments(arr.map((s, i) => ({ ...s, segment_order: i })))
  }

  const openPreview = () => {
    if (gameId) {
      const slug = settings?.slug || gameId
      window.open(`/play/spin/${slug}`, '_blank')
    }
  }

  if (loading) return (
    <div className="cb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{SPIN_LIGHT}</style>
      <div style={{ textAlign:'center', color:'var(--gb-text2)' }}>
        <div className="gb-empty-icon" style={{ fontSize:48, marginBottom:12 }}>🎡</div>
        Loading spin builder…
      </div>
    </div>
  )

  return (
    <div className="cb-wrap">
      <style>{SPIN_LIGHT}</style>

      {/* ── Sticky Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--gb-surface)', borderBottom: '1.5px solid var(--gb-border)',
        padding: '10px 24px', display: 'grid',
        gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        {/* LEFT: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={() => navigate(-1)} style={{ fontSize: 16, padding: '4px 8px' }}>←</button>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gb-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            🎡 Spin Wheel
          </div>
        </div>

        {/* CENTER: tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '6px 14px', fontSize: 12.5, fontWeight: 600,
                border: 'none', background: 'none', cursor: 'pointer',
                color: tab === t.id ? 'var(--gb-primary)' : 'var(--gb-text2)',
                borderBottom: tab === t.id ? '2px solid var(--gb-primary)' : '2px solid transparent',
                marginBottom: -2, transition: 'color .15s',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* RIGHT: preview */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="cb-btn cb-btn-ghost cb-btn-sm" onClick={openPreview}>👁 Preview</button>
        </div>
      </div>

      {/* ── Two-column content ── */}
      <div style={{ display: 'flex', gap: 20, padding: '16px 20px', minHeight: 'calc(100vh - 56px)' }}>
        {/* ── LEFT COLUMN: tab content ── */}
        <div style={{ flex: '3 1 0%', minWidth: 0, maxWidth: '60%' }}>

          {/* ═══ DISPLAY TAB ═══ */}
          {tab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Game Text */}
              <div className="gb-section">
                <div className="gb-section-title">🎯 Game Text</div>
                <div className="gb-row">
                  <div className="gb-col">
                    <div className="gb-label">Heading 1</div>
                    <input value={sForm.heading_1} onChange={e => setS('heading_1', e.target.value)} placeholder="Spin & Win!" />
                  </div>
                  <div className="gb-col">
                    <div className="gb-label">Heading 2</div>
                    <input value={sForm.heading_2} onChange={e => setS('heading_2', e.target.value)} placeholder="Try your luck" />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="gb-label">Description</div>
                  <textarea rows={2} value={sForm.description_text} onChange={e => setS('description_text', e.target.value)} placeholder="Spin the wheel and win exciting prizes…" />
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="gb-label">Spin Mode</div>
                  <select value={sForm.spin_mode} onChange={e => setS('spin_mode', e.target.value)}>
                    <option value="once">One spin per player</option>
                    <option value="unlimited">Unlimited spins</option>
                  </select>
                </div>
              </div>

              {/* Wheel Colors */}
              <div className="gb-section">
                <div className="gb-section-title">🎨 Wheel Colors</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    ['Wheel Background', 'wheel_bg_color'],
                    ['Pointer Color', 'pointer_color'],
                    ['Center Button', 'center_color'],
                    ['Page Background', 'bg_color'],
                    ['Primary Accent', 'primary_color'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <div className="gb-label">{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="color" value={sForm[key] || '#7C6FF7'} onChange={e => setS(key, e.target.value)}
                          style={{ width: 36, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6, flexShrink: 0 }} />
                        <input value={sForm[key] || ''} onChange={e => setS(key, e.target.value)}
                          style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, borderBottom: '1.5px solid var(--gb-border)', padding: '4px 6px' }} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <div className="gb-label">Center Label</div>
                    <input value={sForm.center_label} onChange={e => setS('center_label', e.target.value)} maxLength={8} />
                  </div>
                </div>
              </div>

              {/* Images & Font */}
              <div className="gb-section">
                <div className="gb-section-title">🖼️ Images & Font</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <ImageField label="Game Logo" currentUrl={logoFile ? URL.createObjectURL(logoFile) : sUrls.logo}
                    onFileChange={e => setLogoFile(e.target.files[0])} onClear={() => { setLogoFile(null); setSUrls(u => ({ ...u, logo: null })) }} />
                  <ImageField label="Background Image" currentUrl={bgFile ? URL.createObjectURL(bgFile) : sUrls.bg}
                    onFileChange={e => setBgFile(e.target.files[0])} onClear={() => { setBgFile(null); setSUrls(u => ({ ...u, bg: null })) }} />
                  <ImageField label="Thank You BG" currentUrl={tyFile ? URL.createObjectURL(tyFile) : sUrls.ty}
                    onFileChange={e => setTyFile(e.target.files[0])} onClear={() => { setTyFile(null); setSUrls(u => ({ ...u, ty: null })) }} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="gb-label">Font Family</div>
                  <select value={sForm.font_family} onChange={e => setS('font_family', e.target.value)}>
                    {['DM Sans','Inter','Poppins','Montserrat','Nunito','Raleway','Roboto','Lato','Open Sans','Playfair Display'].map(f =>
                      <option key={f} value={f}>{f}</option>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cb-btn cb-btn-primary" onClick={saveSettings} disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving…' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ SEGMENTS TAB ═══ */}
          {tab === 'segments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>Wheel Segments ({segments.length})</h3>
                <button className="cb-btn cb-btn-primary cb-btn-sm" onClick={() => setModal('add')}>+ Add Segment</button>
              </div>

              {segments.length === 0 ? (
                <div className="gb-empty" style={{ border: '2px dashed var(--gb-border)', borderRadius: 12, background: 'var(--gb-surface)' }}>
                  <div className="gb-empty-icon">🎡</div>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--gb-text)' }}>No segments yet</div>
                  <div style={{ fontSize: 13, marginBottom: 16 }}>Add at least 2 segments to build your wheel</div>
                  <button className="cb-btn cb-btn-primary" onClick={() => setModal('add')}>+ Add First Segment</button>
                </div>
              ) : (
                segments.map((seg, i) => (
                  <SegmentCard
                    key={seg.id} seg={seg} index={i}
                    onEdit={setModal}
                    onDelete={deleteSegment}
                    onMoveUp={(idx) => moveSegment(idx, 'up')}
                    onMoveDown={(idx) => moveSegment(idx, 'down')}
                    isFirst={i === 0} isLast={i === segments.length - 1}
                  />
                ))
              )}

              {segments.length > 0 && (
                <div style={{
                  marginTop: 12, padding: 12, background: 'var(--gb-surface)',
                  borderRadius: 10, border: '1px solid var(--gb-border)',
                  fontSize: 13, color: 'var(--gb-text2)'
                }}>
                  💡 <strong>Weight controls probability.</strong> A segment with weight 200 is twice as likely
                  as one with weight 100. Use lower weights for rare prizes.
                </div>
              )}
            </div>
          )}

          {/* ═══ SOUNDS TAB ═══ */}
          {tab === 'sounds' && (
            <div>
              <div className="gb-section">
                <div className="gb-section-title">🔊 Game Sounds</div>
                <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                  {sounds.length === 0 ? (
                    <div style={{ color: 'var(--gb-text2)', textAlign: 'center', padding: 24 }}>
                      No sounds uploaded for this game yet.
                    </div>
                  ) : (
                    sounds.map(s => (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: 'var(--gb-surface)',
                        border: '1.5px solid var(--gb-border)', borderRadius: 8,
                      }}>
                        <span style={{ fontSize: 22 }}>🔊</span>
                        <span style={{ flex: 1, fontWeight: 600 }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--gb-text2)' }}>{s.file_name}</span>
                      </div>
                    ))
                  )}
                  <div style={{ color: 'var(--gb-text2)', fontSize: 13, background: 'var(--gb-surface2)', padding: 12, borderRadius: 8, marginTop: 8 }}>
                    💡 Upload sounds through the main game editor's Audio section. Then assign them below.
                  </div>
                </div>
              </div>

              <div className="gb-section">
                <div className="gb-section-title">🔊 Sound Assignments</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <SoundSelect label="Spin Sound" value={sForm.sound_spin_id} onChange={v => setS('sound_spin_id', v)} sounds={sounds} />
                  <SoundSelect label="Win Sound" value={sForm.sound_win_id} onChange={v => setS('sound_win_id', v)} sounds={sounds} />
                  <SoundSelect label="Lose/Try Again Sound" value={sForm.sound_lose_id} onChange={v => setS('sound_lose_id', v)} sounds={sounds} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cb-btn cb-btn-primary" onClick={saveSettings} disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving…' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ THANK YOU TAB ═══ */}
          {tab === 'thankyou' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="gb-section">
                <div className="gb-section-title">🙏 Thank You Messages</div>
                <div className="gb-row">
                  <div className="gb-col">
                    <div className="gb-label">Win Message</div>
                    <textarea rows={3} value={sForm.win_message} onChange={e => setS('win_message', e.target.value)}
                      placeholder="🎉 Congratulations! You won…" />
                    <div style={{ fontSize: 11, color: 'var(--gb-text2)', marginTop: 4 }}>
                      Shown when a player wins a prize
                    </div>
                  </div>
                  <div className="gb-col">
                    <div className="gb-label">Lose / Try Again Message</div>
                    <textarea rows={3} value={sForm.lose_message} onChange={e => setS('lose_message', e.target.value)}
                      placeholder="Better luck next time!" />
                    <div style={{ fontSize: 11, color: 'var(--gb-text2)', marginTop: 4 }}>
                      Shown when a segment is "no prize" or "try again"
                    </div>
                  </div>
                </div>
              </div>

              <div className="gb-section">
                <div className="gb-section-title">🖼️ Thank You Page</div>
                <ImageField label="Background Image" currentUrl={tyFile ? URL.createObjectURL(tyFile) : sUrls.ty}
                  onFileChange={e => setTyFile(e.target.files[0])} onClear={() => { setTyFile(null); setSUrls(u => ({ ...u, ty: null })) }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cb-btn cb-btn-primary" onClick={saveSettings} disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving…' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ EMAIL TAB ═══ */}
          {tab === 'email' && (
            <div>
              <div className="gb-section">
                <div className="gb-section-title">📧 Email Settings</div>
                <div style={{ color: 'var(--gb-text2)', fontSize: 14, marginBottom: 12 }}>
                  Email templates are managed in the main game editor. Configure sender details and email body there.
                </div>
                <div style={{
                  background: 'var(--gb-surface)', border: '1.5px solid var(--gb-border)',
                  borderRadius: 10, padding: 32, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Email Templates</div>
                  <div style={{ fontSize: 13, color: 'var(--gb-text2)' }}>
                    Go to <strong>Games → Edit → Settings → Email</strong> to configure
                    sender name, subject, and HTML body for spin result emails.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {tab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="gb-section">
                <div className="gb-section-title">⚙️ Game Settings</div>
                <div className="gb-row">
                  <div className="gb-col">
                    <div className="gb-label">Game URL Slug</div>
                    <input value={gameId} disabled style={{ color: 'var(--gb-text2)' }} />
                    <div style={{ fontSize: 11, color: 'var(--gb-text2)', marginTop: 4 }}>
                      Game ID is used in the player URL
                    </div>
                  </div>
                  <div className="gb-col">
                    <div className="gb-label">Spin Mode</div>
                    <select value={sForm.spin_mode} onChange={e => setS('spin_mode', e.target.value)}>
                      <option value="once">One spin per player</option>
                      <option value="unlimited">Unlimited spins</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="gb-section">
                <div className="gb-section-title">🎨 Theme Colors</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    ['Page Background', 'bg_color'],
                    ['Primary Accent', 'primary_color'],
                    ['Wheel Background', 'wheel_bg_color'],
                    ['Pointer Color', 'pointer_color'],
                    ['Center Button', 'center_color'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <div className="gb-label">{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="color" value={sForm[key] || '#7C6FF7'} onChange={e => setS(key, e.target.value)}
                          style={{ width: 36, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6, flexShrink: 0 }} />
                        <input value={sForm[key] || ''} onChange={e => setS(key, e.target.value)}
                          style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, borderBottom: '1.5px solid var(--gb-border)', padding: '4px 6px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cb-btn cb-btn-primary" onClick={saveSettings} disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving…' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: Phone Mockup ── */}
        <div style={{
          flex: '2 1 0%', minWidth: 0, maxWidth: '40%',
          position: 'sticky', top: 68, alignSelf: 'flex-start',
          height: 'calc(100vh - 140px)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            width: '100%', maxWidth: 320, flex: 1, margin: '0 auto',
            border: '3px solid var(--gb-border)', borderRadius: 32,
            boxShadow: '0 8px 32px rgba(0,0,0,.12), inset 0 0 0 1px rgba(255,255,255,.6)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative',
            background: sForm.bg_color || '#F8F8FF',
            backgroundImage: bgFile ? `url(${URL.createObjectURL(bgFile)})` : sUrls.bg ? `url(${sUrls.bg})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            {/* Top accent bar */}
            <div style={{ height: 6, background: sForm.primary_color || '#7C6FF7', flexShrink: 0 }} />

            {/* Notch */}
            <div style={{
              width: 90, height: 22, background: '#1a1a2e', borderRadius: '0 0 14px 14px',
              margin: '0 auto', flexShrink: 0, position: 'relative', zIndex: 2,
            }} />

            {/* Scrollable content */}
            <div style={{
              flex: 1, padding: '12px 14px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, position: 'relative', zIndex: 1,
              background: (bgFile || sUrls.bg) ? 'rgba(255,255,255,0.18)' : 'transparent',
              backdropFilter: (bgFile || sUrls.bg) ? 'blur(28px)' : 'none',
              borderRadius: (bgFile || sUrls.bg) ? '22px 22px 0 0' : 0,
              margin: (bgFile || sUrls.bg) ? '0 6px' : 0,
              border: (bgFile || sUrls.bg) ? '1px solid rgba(255,255,255,0.35)' : 'none',
              boxShadow: (bgFile || sUrls.bg) ? '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
            }}>
              {/* Logo */}
              {(logoFile || sUrls.logo) && (
                <img src={logoFile ? URL.createObjectURL(logoFile) : sUrls.logo} alt=""
                  style={{ height: 34, objectFit: 'contain' }} />
              )}

              {/* Wheel */}
              <WheelPreview segments={segments} settings={sForm} size={170} />

              {/* Heading 1 */}
              <div style={{
                fontSize: 15, fontWeight: 800, color: sForm.primary_color || '#7c6ff7',
                textAlign: 'center', lineHeight: 1.3
              }}>
                {sForm.heading_1 || 'Spin & Win!'}
              </div>

              {/* Heading 2 */}
              {sForm.heading_2 && (
                <div style={{ fontSize: 12, color: 'var(--gb-text2)', textAlign: 'center', marginTop: -4 }}>
                  {sForm.heading_2}
                </div>
              )}

              {/* Description text */}
              {tab === 'display' && sForm.description_text && (
                <div style={{ fontSize: 11, color: 'var(--gb-text3)', textAlign: 'center', marginTop: 4 }}>
                  {sForm.description_text}
                </div>
              )}

              {/* Segments preview */}
              {tab === 'segments' && segments.length > 0 && (
                <div style={{ width: '100%', marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gb-text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                    Segments ({segments.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {segments.slice(0, 6).map((seg, i) => (
                      <div key={i} style={{
                        fontSize: 9, padding: '2px 8px', borderRadius: 10,
                        background: seg.bg_color || '#7C6FF7', color: '#fff',
                        fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80,
                      }}>
                        {seg.label}
                      </div>
                    ))}
                    {segments.length > 6 && <span style={{ fontSize: 9, color: 'var(--gb-text2)', padding: '2px 4px' }}>+{segments.length - 6}</span>}
                  </div>
                </div>
              )}

              {/* Thank you preview */}
              {tab === 'thankyou' && (
                <div style={{
                  width: '100%', marginTop: 8, padding: 14,
                  background: 'rgba(255,255,255,0.6)', borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.4)', textAlign: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    {sForm.win_message || '🎉 Congratulations!'}
                  </div>
                  {sForm.lose_message && (
                    <div style={{ fontSize: 11, color: 'var(--gb-text2)', marginTop: 8, padding: '6px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: 8 }}>
                      🙁 {sForm.lose_message}
                    </div>
                  )}
                </div>
              )}

              {/* Sounds preview */}
              {tab === 'sounds' && (
                <div style={{
                  width: '100%', marginTop: 8, padding: 12,
                  background: 'rgba(255,255,255,0.6)', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.4)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gb-text2)', marginBottom: 6 }}>🔊 Sound Effects</div>
                  <div style={{ fontSize: 11, color: 'var(--gb-text2)' }}>
                    {sForm.sound_spin_id ? '✅ Spin sound' : '⬜ Spin sound'} · {sForm.sound_win_id ? '✅ Win sound' : '⬜ Win sound'} · {sForm.sound_lose_id ? '✅ Lose sound' : '⬜ Lose sound'}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar (simulates button area) */}
            <div style={{
              padding: '8px 16px 14px', flexShrink: 0,
              display: 'flex', justifyContent: 'center',
              background: (bgFile || sUrls.bg) ? 'rgba(255,255,255,0.18)' : 'transparent',
              backdropFilter: (bgFile || sUrls.bg) ? 'blur(28px)' : 'none',
              margin: (bgFile || sUrls.bg) ? '0 6px 6px' : 0,
              borderRadius: (bgFile || sUrls.bg) ? '16px' : 0,
              border: (bgFile || sUrls.bg) ? '1px solid rgba(255,255,255,0.35)' : 'none',
              borderTop: 'none',
            }}>
              <div style={{
                width: '80%', padding: '10px 0', borderRadius: 24,
                background: sForm.primary_color || '#7C6FF7', color: '#fff',
                fontSize: 13, fontWeight: 700, textAlign: 'center',
                boxShadow: `0 4px 14px ${sForm.primary_color || '#7C6FF7'}44`,
              }}>
                {sForm.spin_mode === 'once' ? '🎡 SPIN ONCE' : '🎡 SPIN!'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gb-text3)', textAlign: 'center' }}>
            Live preview — {segments.length} segment{segments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Segment modal */}
      {modal && (
        <SegmentModal
          seg={modal === 'add' ? null : modal}
          sounds={sounds}
          onSave={handleSegmentSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
