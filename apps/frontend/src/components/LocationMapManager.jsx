import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api'

// ── Purple pin icon ──
const purpleIcon = L.divIcon({
  className: 'loc-pin',
  html: `<div style="background:#7c3aed;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
})

const KARNATAKA_CENTER = [12.9716, 77.5946]

// Helper to fly map to a coordinate when a card is clicked
function FlyTo({ pos }) {
  const map = useMap()
  useEffect(() => { if (pos) map.flyTo(pos, 13, { duration: 0.8 }) }, [pos, map])
  return null
}

export default function LocationMapManager({ gameId, clientId }) {
  const [branches, setBranches] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selBranch, setSelBranch] = useState('')
  const [reward, setReward] = useState('')
  const [saving, setSaving] = useState(false)
  const [flyTo, setFlyTo] = useState(null)
  const [toast, setToast] = useState(null)

  const flash = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500) }

  const loadBranches = async () => {
    try { const { data } = await api.get(`/clients/${clientId}/branches`); setBranches(data.branches || []) } catch {}
  }
  const loadLocations = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/business/games/${gameId}/locations`)
      setLocations(data.locations || [])
    } catch {}
    setLoading(false)
  }
  useEffect(() => { if (gameId) loadLocations() }, [gameId])
  useEffect(() => { if (clientId) loadBranches() }, [clientId])

  // Only branches not yet assigned a location game
  const assignedNames = useMemo(
    () => new Set(locations.map(l => (l.branch_name || l.location_name || '').trim()).filter(Boolean)),
    [locations]
  )
  const availableBranches = branches.filter(b => !assignedNames.has((b.business_name || '').trim()))

  // Pins with valid coords
  const pins = locations.filter(l => l.latitude != null && l.longitude != null)
    .map(l => ({ ...l, pos: [parseFloat(l.latitude), parseFloat(l.longitude)] }))

  const handleCreate = async () => {
    if (!selBranch) return
    const branch = branches.find(b => String(b.id) === String(selBranch))
    if (!branch) return
    setSaving(true)
    try {
      const { data } = await api.post(`/games/${gameId}/duplicate`, {
        location_name: branch.business_name,
        business_owner_id: branch.id,
      })
      if (data.game?.id) {
        try {
          await api.post('/business/games/link', {
            business_owner_id: branch.id,
            game_id: data.game.id,
            location_name: branch.business_name,
            reward_text: reward.trim(),
          })
        } catch {}
      }
      setSelBranch(''); setReward(''); setShowAdd(false)
      flash('Location game created 📍')
      loadLocations()
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to create location', 'err')
    }
    setSaving(false)
  }

  const handleDelete = async (loc) => {
    const childId = loc.game_id || loc.id
    if (!confirm('Delete this location game? This cannot be undone.')) return
    try {
      // loc may be a business_owner_games row (id) — try both identifiers
      await api.delete(`/games/${gameId}/locations/${childId}`).catch(() => {})
      flash('Location deleted')
      loadLocations()
    } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* z-index 0: the ENTIRE page is the map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer center={KARNATAKA_CENTER} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo pos={flyTo} />
        {pins.map((l) => (
          <Marker key={l.id} position={l.pos} icon={purpleIcon}>
            <Popup>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{l.branch_name || l.location_name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>📍 {l.pincode || '—'}</div>
              {l.reward_text ? <div style={{ fontSize: 12, marginTop: 2 }}>🎁 {l.reward_text}</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>{/* /z-index 0 map layer */}

      {/* ── Floating Location Manager card (z-index 2) ── */}
      <div style={{ position: 'absolute', top: 16, right: 16, width: 290, maxHeight: 'calc(100% - 32px)', overflow: 'auto', zIndex: 2,
        background: '#fff', borderRadius: 14, border: '1px solid #e2e6f0', boxShadow: '0 6px 24px rgba(0,0,0,0.12)', padding: 14, fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1e1e2e' }}>📍 Location Manager</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: 6 }}>{locations.length}</span>
        </div>
        <p style={{ fontSize: 11, color: '#9899ae', margin: '0 0 10px', lineHeight: 1.5 }}>
          Each location is a purple pin. Click a pin or a card to focus it.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 16, color: '#9899ae', fontSize: 12 }}>Loading…</div>
        ) : locations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: '#64657a', fontSize: 12 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🗺️</div>No locations yet. Add one below.
          </div>
        ) : (
          locations.map((l) => (
            <div key={l.id} onMouseEnter={() => l.latitude != null && setFlyTo([parseFloat(l.latitude), parseFloat(l.longitude)])}
              style={{ border: '1.5px solid #eef0f6', borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer', transition: 'border-color .15s' }}
              onClick={() => l.latitude != null && setFlyTo([parseFloat(l.latitude), parseFloat(l.longitude)])}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#1e1e2e' }}>{l.branch_name || l.location_name}</div>
                  <div style={{ fontSize: 11, color: '#9899ae', marginTop: 1 }}>📍 {l.pincode || '—'}</div>
                  {l.reward_text ? <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 1 }}>🎁 {l.reward_text}</div> : null}
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    {(() => {
                      // active status from child game row if present
                      const active = l.is_active !== undefined ? l.is_active : true
                      return active ? <span style={{ background:'#f0fdf4', color:'#059669', padding:'1px 6px', borderRadius:5, fontSize:10, fontWeight:700 }}>Active</span>
                                     : <span style={{ background:'#fef2f2', color:'#dc2626', padding:'1px 6px', borderRadius:5, fontSize:10, fontWeight:700 }}>Inactive</span>
                    })()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={(e) => { e.stopPropagation(); if (l.game_id) window.open(`/dashboard/games/${l.game_id}/builder`, '_blank') }}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e6f0', background: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#7c3aed', fontFamily: 'inherit' }}>Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(l) }}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#dc2626', fontFamily: 'inherit' }}>✕</button>
                </div>
              </div>
              {l.slug && <div style={{ fontSize: 10, color: '#9899ae', marginTop: 4, wordBreak: 'break-all' }}>/play/{l.slug}</div>}
            </div>
          ))
        )}
      </div>

      {/* ── Floating Add Location card (z-index 2) ── */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, width: 290, background: '#fff', borderRadius: 14, zIndex: 2,
        border: '1px solid #e2e6f0', boxShadow: '0 6px 24px rgba(0,0,0,0.12)', padding: 14, fontFamily: 'inherit' }}>
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)}
            style={{ width: '100%', padding: '11px', borderRadius: 10, border: '2px dashed #c4b5fd', background: '#faf5ff', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: '#7c3aed', fontFamily: 'inherit' }}>
            + Add Location Game
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#1e1e2e', marginBottom: 8 }}>New Location</div>
            <select value={selBranch} onChange={(e) => setSelBranch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: '1.5px solid #e2e6f0', borderRadius: 6, marginBottom: 8, fontFamily: 'inherit', outline: 'none' }}>
              <option value="">— Choose a branch —</option>
              {availableBranches.map((b) => (
                <option key={b.id} value={b.id}>{(b.business_name || '') + (b.pincode ? ` (${b.pincode})` : '')}</option>
              ))}
            </select>
            {branches.length === 0 && <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>No branches. Create branches in CRM first.</div>}
            {availableBranches.length === 0 && branches.length > 0 && <div style={{ fontSize: 11, color: '#9899ae', marginBottom: 8 }}>All branches already added.</div>}
            <input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Reward text (e.g. Free Coffee)"
              style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: '1.5px solid #e2e6f0', borderRadius: 6, marginBottom: 8, fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleCreate} disabled={saving || !selBranch}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 12, cursor: saving || !selBranch ? 'not-allowed' : 'pointer', opacity: saving || !selBranch ? 0.5 : 1, fontFamily: 'inherit' }}>
                {saving ? 'Creating…' : 'Create & Drop Pin'}
              </button>
              <button onClick={() => { setShowAdd(false); setSelBranch(''); setReward('') }}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #e2e6f0', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* legend (z-index 2) */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#444', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'inherit' }}>
        <span style={{ display: 'inline-block', width: 12, height: 12, background: '#7c3aed', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', marginRight: 6, verticalAlign: 'middle' }} />
        Assigned location
      </div>

      {toast && (
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 3, background: toast.type === 'err' ? '#fef2f2' : '#f0fdf4', color: toast.type === 'err' ? '#dc2626' : '#059669', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontFamily: 'inherit' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
