import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap');
.bi *,.bi *::before,.bi *::after{box-sizing:border-box;margin:0;padding:0}
.bi{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes biFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes biSpin{to{transform:rotate(360deg)}}
@keyframes biModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes biToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.bi-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s}
.bi-input:focus{border-color:#8B5CF6;background:#fff}
.bi-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:background .14s,transform .1s}
.bi-primary-btn:hover{background:#27272A}
.bi-primary-btn:active{transform:scale(.98)}
.bi-ghost-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.bi-ghost-btn:hover{background:#F3F4F6;border-color:#D1D5DB}
.bi-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:background .13s;flex-shrink:0}
.bi-icon-btn:hover{background:#F0F0F0}
.bi-icon-btn.del{border-color:#FEE2E2;background:#FFF5F5;color:#DC2626}
.bi-icon-btn.del:hover{background:#FEE2E2}
.bi-toggle{width:34px;height:20px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;padding:0}
.bi-toggle::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.bi-toggle.on{background:#4F46E5}
.bi-toggle.on::after{transform:translateX(14px)}
.bi-toggle.off{background:#D1D5DB}
`

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{ position:'fixed',bottom:28,right:28,zIndex:9999,background:ok?'#052E16':'#450A0A',color:'#fff',padding:'13px 20px 13px 16px',borderRadius:12,fontSize:13.5,fontFamily:"'DM Sans',sans-serif",fontWeight:500,display:'flex',alignItems:'center',gap:10,boxShadow:'0 8px 32px rgba(0,0,0,.24)',borderLeft:`3px solid ${ok?'#22C55E':'#EF4444'}`,animation:'biToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:420 }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

function ImageModal({ image, onClose, onSave, isNew }) {
  const [name, setName] = useState(image?.name || '')
  const [isActive, setIsActive] = useState(image?.is_active ?? 1)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(image?.image_url || '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const r = new FileReader()
    r.onload = ev => setPreview(ev.target.result)
    r.readAsDataURL(f)
  }

  const handleSave = async () => {
    if (!file && !preview) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name || 'Brick Image')
      fd.append('is_active', isActive ? '1' : '0')
      if (file) fd.append('image', file)

      if (isNew) {
        const res = await api.post('/brick-images', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        onSave(res.data.image, 'create')
      } else {
        const res = await api.put(`/brick-images/${image.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        onSave(res.data.image, 'update')
      }
      onClose()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message))
    }
    setSaving(false)
  }

  return (
    <div style={{ position:'fixed',inset:0,zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)' }}>
      <div style={{ background:'#fff',borderRadius:24,width:'100%',maxWidth:480,padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'biModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ fontWeight:700,fontSize:18,color:'#111' }}>{isNew ? 'Add Brick Image' : 'Edit Brick Image'}</h2>
          <button className="bi-icon-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6 }}>Image</label>
          <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={handleFile} />
          {preview ? (
            <div style={{ position:'relative',display:'inline-block' }}>
              <img src={preview} alt="" style={{ height:80,width:80,objectFit:'cover',borderRadius:10,border:'1.5px solid #E5E7EB' }} />
              <button onClick={() => { setPreview(''); setFile(null) }} style={{ position:'absolute',top:-6,right:-6,width:22,height:22,borderRadius:'50%',background:'#DC2626',color:'#fff',border:'2px solid #fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
            </div>
          ) : (
            <button className="bi-ghost-btn" onClick={() => fileRef.current.click()}>📁 Choose Image</button>
          )}
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6 }}>Name</label>
          <input className="bi-input" value={name} onChange={e => setName(e.target.value)} placeholder="Logo 1" />
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:24 }}>
          <button className={`bi-toggle ${isActive?'on':'off'}`} onClick={() => setIsActive(isActive?0:1)} />
          <span style={{ fontSize:13,fontWeight:600,color:'#374151' }}>{isActive ? 'Active' : 'Inactive'}</span>
        </div>

        <div style={{ display:'flex',gap:10 }}>
          <button className="bi-ghost-btn" onClick={onClose} style={{ flex:1,justifyContent:'center',padding:'11px 0' }}>Cancel</button>
          <button className="bi-primary-btn" onClick={handleSave} disabled={saving || (!file && !preview)} style={{ flex:2,justifyContent:'center',padding:'12px 0' }}>
            {saving ? '⏳ Saving…' : isNew ? '+ Add Image' : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BrickImagesPage() {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [isNew, setIsNew] = useState(false)

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadImages = () => {
    setLoading(true)
    api.get('/brick-images').then(res => {
      setImages(res.data.images || [])
    }).catch(err => {
      showToast('Failed to load images', 'error')
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadImages() }, [])

  const handleAdd = () => {
    setEditingImage(null)
    setIsNew(true)
    setShowModal(true)
  }

  const handleEdit = (img) => {
    setEditingImage(img)
    setIsNew(false)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return
    try {
      await api.delete(`/brick-images/${id}`)
      setImages(prev => prev.filter(i => i.id !== id))
      showToast('Image deleted')
    } catch { showToast('Delete failed', 'error') }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/brick-images/${id}/toggle`)
      setImages(prev => prev.map(i => i.id === id ? res.data.image : i))
      showToast('Status updated')
    } catch { showToast('Toggle failed', 'error') }
  }

  const handleSave = (image, action) => {
    if (action === 'create') {
      setImages(prev => [...prev, image])
      showToast('Image added')
    } else {
      setImages(prev => prev.map(i => i.id === image.id ? image : i))
      showToast('Image updated')
    }
  }

  const handleBulkDelete = async () => {
    const selected = images.filter(i => i._selected)
    if (selected.length === 0) return
    if (!confirm(`Delete ${selected.length} images?`)) return
    for (const img of selected) {
      try { await api.delete(`/brick-images/${img.id}`) } catch {}
    }
    setImages(prev => prev.filter(i => !i._selected))
    showToast(`${selected.length} images deleted`)
  }

  return (
    <div className="bi">
      <style>{CSS}</style>
      <div style={{ padding:'36px 40px',maxWidth:1400,margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',marginBottom:28,gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:32,color:'#0D0D1A',letterSpacing:'-0.02em',lineHeight:1 }}>
              🧱 Brick Images
            </h1>
            <p style={{ color:'#9CA3AF',fontSize:14,marginTop:4 }}>Manage images used in the Breakout game on the landing page</p>
          </div>
          <button className="bi-primary-btn" onClick={handleAdd}>+ Add Image</button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex',gap:12,marginBottom:24 }}>
          {[
            { label:'Total', value:images.length, color:'#6366F1' },
            { label:'Active', value:images.filter(i=>i.is_active).length, color:'#22C55E' },
            { label:'Inactive', value:images.filter(i=>!i.is_active).length, color:'#9CA3AF' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff',borderRadius:12,border:'1.5px solid #EAECF0',padding:'12px 20px',minWidth:120 }}>
              <div style={{ fontSize:24,fontWeight:800,color:s.color,fontFamily:"'Fraunces',serif" }}>{s.value}</div>
              <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        {images.some(i => i._selected) && (
          <div style={{ background:'#FEF3C7',borderRadius:10,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:13,fontWeight:600,color:'#92400E' }}>{images.filter(i=>i._selected).length} selected</span>
            <button className="bi-ghost-btn" style={{ borderColor:'#FCA5A5',color:'#DC2626' }} onClick={handleBulkDelete}>🗑 Delete Selected</button>
          </div>
        )}

        {/* Image Grid */}
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:'#9CA3AF',fontSize:14 }}>
            <div style={{ width:20,height:20,border:'2px solid #E5E7EB',borderTopColor:'#6366f1',borderRadius:'50%',animation:'biSpin .8s linear infinite' }} />
            Loading images…
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px 0',background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0' }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🧱</div>
            <h3 style={{ fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8 }}>No brick images yet</h3>
            <p style={{ color:'#9CA3AF',fontSize:14,marginBottom:20 }}>Add images to use as bricks in the Breakout game</p>
            <button className="bi-primary-btn" onClick={handleAdd}>+ Add First Image</button>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16 }}>
            {images.map((img, idx) => (
              <div key={img.id} style={{
                background:'#fff',borderRadius:14,border:'1.5px solid #EAECF0',overflow:'hidden',
                opacity:img.is_active?1:0.6,transition:'all .2s',animation:`biFadeUp .3s ${idx*30}ms ease both`
              }}>
                <div style={{ height:120,background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
                  <img src={img.image_url} alt={img.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <div style={{ fontSize:13,fontWeight:600,color:'#111',marginBottom:6,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{img.name}</div>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <button className={`bi-toggle ${img.is_active?'on':'off'}`} onClick={() => handleToggle(img.id)} title={img.is_active?'Deactivate':'Activate'} />
                    <div style={{ display:'flex',gap:4 }}>
                      <button className="bi-icon-btn" onClick={() => handleEdit(img)} title="Edit">✏️</button>
                      <button className="bi-icon-btn del" onClick={() => handleDelete(img.id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ImageModal
          image={editingImage}
          isNew={isNew}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
