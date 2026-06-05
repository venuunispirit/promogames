import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

/* ─── helpers ─────────────────────────────────────────────────────────── */
function ImageField({ label, currentUrl, onFileChange, onClear }) {
  const ref = useRef()
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input type="file" ref={ref} accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {currentUrl && <img src={currentUrl} alt="" style={{ height: 44, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border)', background: '#fff' }} />}
        {currentUrl && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

function SoundSelect({ label, value, onChange, sounds }) {
  return (
    <div style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>{label}</div>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="form-input">
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
      {/* center circle */}
      <circle cx={cx} cy={cy} r={size * 0.1} fill={settings?.center_color || '#1F2937'} stroke="#fff" strokeWidth="3" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff"
        fontSize={size * 0.06} fontWeight="800" style={{ fontFamily: 'DM Sans,sans-serif' }}>
        {settings?.center_label || 'SPIN'}
      </text>
      {/* pointer */}
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
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
      marginBottom: 8,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: seg.bg_color || '#7C6FF7', flexShrink: 0, border: '2px solid var(--border)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{seg.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          {seg.segment_type === 'prize' ? '🎁 Prize' : seg.segment_type === 'try_again' ? '🔄 Try Again' : '😔 No Prize'}
          {' · '}Weight: {seg.weight}
          {seg.coupon_code && ` · Code: ${seg.coupon_code}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onMoveUp(index)} disabled={isFirst} style={{ padding: '3px 7px' }}>↑</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onMoveDown(index)} disabled={isLast} style={{ padding: '3px 7px' }}>↓</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(seg)} style={{ padding: '3px 8px' }}>✏️</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(seg.id)} style={{ padding: '3px 8px', color: 'var(--danger)' }}>🗑️</button>
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{seg ? 'Edit Segment' : 'Add Segment'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Label *</label>
            <input className="form-input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. 10% OFF" maxLength={50} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Segment Color</label>
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
              <label className="form-label">Text Color</label>
              <input type="color" value={form.text_color || '#FFFFFF'} onChange={e => set('text_color', e.target.value)}
                style={{ width: 40, height: 30, border: 'none', cursor: 'pointer', borderRadius: 4, display: 'block', marginTop: 4 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Type</label>
              <select className="form-input" value={form.segment_type} onChange={e => set('segment_type', e.target.value)}>
                <option value="prize">🎁 Prize</option>
                <option value="try_again">🔄 Try Again</option>
                <option value="no_prize">😔 No Prize</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Weight (probability)</label>
              <input className="form-input" type="number" min="1" max="9999" value={form.weight}
                onChange={e => set('weight', e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Higher = more likely to land</div>
            </div>
          </div>

          {form.segment_type === 'prize' && <>
            <div>
              <label className="form-label">Prize Description</label>
              <textarea className="form-input" rows={2} value={form.prize_description || ''} onChange={e => set('prize_description', e.target.value)} placeholder="e.g. Get 10% off your next purchase" />
            </div>
            <div>
              <label className="form-label">Coupon Code</label>
              <input className="form-input" value={form.coupon_code || ''} onChange={e => set('coupon_code', e.target.value)} placeholder="e.g. SPIN10OFF" />
            </div>
            <div>
              <label className="form-label">Coupon Image <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span></label>
              <input type="file" accept="image/*" onChange={e => setCouponFile(e.target.files[0])} className="form-input" style={{ padding: '6px 8px' }} />
              {seg?.coupon_image_url && !couponFile && <img src={seg.coupon_image_url} alt="" style={{ height: 40, marginTop: 6, borderRadius: 6, border: '1px solid var(--border)' }} />}
            </div>
          </>}

          <div>
            <label className="form-label">Overlay Image <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(shown fullscreen on result)</span></label>
            <input type="file" accept="image/*" onChange={e => setOverlayFile(e.target.files[0])} className="form-input" style={{ padding: '6px 8px' }} />
            {seg?.overlay_image_url && !overlayFile && <img src={seg.overlay_image_url} alt="" style={{ height: 40, marginTop: 6, borderRadius: 6, border: '1px solid var(--border)' }} />}
          </div>

          <SoundSelect label="Sound on Land" value={form.sound_id} onChange={v => set('sound_id', v)} sounds={sounds} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : seg ? 'Update Segment' : 'Add Segment'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Builder ─────────────────────────────────────────────────────── */
export default function SpinBuilderTab() {
  const { id: gameId } = useParams()
  const [tab,      setTab]      = useState('segments')
  const [settings, setSettings] = useState(null)
  const [segments, setSegments] = useState([])
  const [sounds,   setSounds]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [modal,    setModal]    = useState(null) // null | 'add' | segmentObj

  // settings form state
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
      api.get(`/sounds/${gameId}`),
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
      alert('✅ Settings saved!')
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

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div className="loader-spin" style={{ margin: '0 auto 12px' }} />
      Loading spin builder…
    </div>
  )

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: tab === t ? 'var(--primary)' : 'transparent',
    color: tab === t ? '#fff' : 'var(--text-secondary)',
    transition: 'all .15s',
  })

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>🎡 Spin Wheel Builder</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 3 }}>Configure your wheel segments and settings</div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          <button style={tabStyle('segments')} onClick={() => setTab('segments')}>🎨 Segments</button>
          <button style={tabStyle('settings')}  onClick={() => setTab('settings')}>⚙️ Settings</button>
        </div>
      </div>

      {/* ── SEGMENTS TAB ─────────────────────────────────────────── */}
      {tab === 'segments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Wheel Segments ({segments.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>+ Add Segment</button>
            </div>

            {segments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px', background: 'var(--surface)',
                border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎡</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No segments yet</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Add at least 2 segments to build your wheel</div>
                <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add First Segment</button>
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
              <div style={{ marginTop: 12, padding: 14, background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                💡 <strong>Weight controls probability.</strong> A segment with weight 200 is twice as likely to win as one with weight 100. Use lower weights for rare/valuable prizes.
              </div>
            )}
          </div>

          {/* Live preview */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            padding: 20, position: 'sticky', top: 24
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, textAlign: 'center' }}>Live Preview</div>
            <WheelPreview segments={segments} settings={{ ...sForm, center_color: sForm.center_color, pointer_color: sForm.pointer_color, center_label: sForm.center_label }} size={220} />
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
              {segments.length} segment{segments.length !== 1 ? 's' : ''} · Updates live as you edit
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ─────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Text & Mode */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 15 }}>🎯 Game Text & Mode</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="form-label">Heading 1</label>
                  <input className="form-input" value={sForm.heading_1} onChange={e => setS('heading_1', e.target.value)} placeholder="Spin & Win!" />
                </div>
                <div>
                  <label className="form-label">Heading 2</label>
                  <input className="form-input" value={sForm.heading_2} onChange={e => setS('heading_2', e.target.value)} placeholder="Try your luck" />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={sForm.description_text} onChange={e => setS('description_text', e.target.value)} placeholder="Spin the wheel and win exciting prizes…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                <div>
                  <label className="form-label">Win Message</label>
                  <textarea className="form-input" rows={2} value={sForm.win_message} onChange={e => setS('win_message', e.target.value)} placeholder="🎉 Congratulations! You won…" />
                </div>
                <div>
                  <label className="form-label">Lose / Try Again Message</label>
                  <textarea className="form-input" rows={2} value={sForm.lose_message} onChange={e => setS('lose_message', e.target.value)} placeholder="Better luck next time!" />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="form-label">Spin Mode</label>
                <select className="form-input" value={sForm.spin_mode} onChange={e => setS('spin_mode', e.target.value)}>
                  <option value="once">One spin per player (per game)</option>
                  <option value="unlimited">Unlimited spins</option>
                </select>
              </div>
            </div>

            {/* Wheel Colors */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 15 }}>🎨 Wheel Colors</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  ['Wheel Background', 'wheel_bg_color'],
                  ['Pointer Color', 'pointer_color'],
                  ['Center Button Color', 'center_color'],
                  ['Page Background', 'bg_color'],
                  ['Primary Accent', 'primary_color'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={sForm[key] || '#7C6FF7'} onChange={e => setS(key, e.target.value)}
                        style={{ width: 36, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                      <input className="form-input" value={sForm[key] || ''} onChange={e => setS(key, e.target.value)}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="form-label">Center Button Label</label>
                  <input className="form-input" value={sForm.center_label} onChange={e => setS('center_label', e.target.value)} maxLength={8} />
                </div>
              </div>
            </div>

            {/* Fonts & Images */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 15 }}>🖼️ Images & Font</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <ImageField label="Game Logo" currentUrl={logoFile ? URL.createObjectURL(logoFile) : sUrls.logo}
                  onFileChange={e => setLogoFile(e.target.files[0])} onClear={() => { setLogoFile(null); setSUrls(u => ({ ...u, logo: null })) }} />
                <ImageField label="Background Image" currentUrl={bgFile ? URL.createObjectURL(bgFile) : sUrls.bg}
                  onFileChange={e => setBgFile(e.target.files[0])} onClear={() => { setBgFile(null); setSUrls(u => ({ ...u, bg: null })) }} />
                <ImageField label="Thank You BG" currentUrl={tyFile ? URL.createObjectURL(tyFile) : sUrls.ty}
                  onFileChange={e => setTyFile(e.target.files[0])} onClear={() => { setTyFile(null); setSUrls(u => ({ ...u, ty: null })) }} />
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Font Family</label>
                <select className="form-input" value={sForm.font_family} onChange={e => setS('font_family', e.target.value)}>
                  {['DM Sans','Inter','Poppins','Montserrat','Nunito','Raleway','Roboto','Lato','Open Sans','Playfair Display'].map(f =>
                    <option key={f} value={f}>{f}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Sounds */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 15 }}>🔊 Sounds</h4>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <SoundSelect label="Spin Sound" value={sForm.sound_spin_id} onChange={v => setS('sound_spin_id', v)} sounds={sounds} />
                <SoundSelect label="Win Sound" value={sForm.sound_win_id} onChange={v => setS('sound_win_id', v)} sounds={sounds} />
                <SoundSelect label="Lose/Try Again Sound" value={sForm.sound_lose_id} onChange={v => setS('sound_lose_id', v)} sounds={sounds} />
              </div>
              {sounds.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>No sounds uploaded yet. Add sounds from the Sounds tab in the main game editor.</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ minWidth: 140 }}>
                {saving ? 'Saving…' : '💾 Save Settings'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            padding: 20, position: 'sticky', top: 24
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, textAlign: 'center' }}>Wheel Preview</div>
            <WheelPreview segments={segments} settings={sForm} size={220} />
          </div>
        </div>
      )}

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
