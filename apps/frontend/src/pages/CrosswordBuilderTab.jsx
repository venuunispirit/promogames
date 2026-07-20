import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useUploadErrors, uploadErrorMessage } from '../lib/builderUpload'

/* ─── tiny helpers ─────────────────────────────────────── */
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

function ImageUploadField({ label, currentUrl, onFileChange, onClear, error }) {
  const ref = useRef()
  return (
    <div className={error ? 'gb-img-error' : ''}>
      <div className="form-label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input type="file" ref={ref} accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {currentUrl && <img src={currentUrl} alt="" style={{ height: 44, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border)', background: '#fff' }} />}
        {currentUrl && <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--danger)' }} onClick={onClear}>✕</button>}
      </div>
      {error && <div className="gb-img-error-msg">⚠️ {error}</div>}
    </div>
  )
}

/* ─── grid preview ──────────────────────────────────────── */
function GridPreview({ words, rows, cols }) {
  const cellSize = Math.min(32, Math.floor(520 / Math.max(cols, 1)))

  // build grid map
  const grid = {}
  const numberMap = {}
  let num = 1
  const sorted = [...words].sort((a, b) => a.word_order - b.word_order)
  for (const w of sorted) {
    if (!w.word_text) continue
    numberMap[`${w.start_row},${w.start_col}`] = numberMap[`${w.start_row},${w.start_col}`] || num++
    for (let i = 0; i < w.word_text.length; i++) {
      const r = w.direction === 'down'   ? w.start_row + i : w.start_row
      const c = w.direction === 'across' ? w.start_col + i : w.start_col
      grid[`${r},${c}`] = w.word_text[i]
    }
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 4 }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const key = `${r},${c}`
            const letter = grid[key]
            const num = numberMap[key]
            return (
              <div key={key} style={{
                width: cellSize, height: cellSize, background: letter ? 'var(--surface)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: cellSize * 0.4, fontWeight: 700, color: 'var(--text)', position: 'relative'
              }}>
                {num && <span style={{ position: 'absolute', top: 1, left: 2, fontSize: cellSize * 0.25, color: 'var(--text2)', lineHeight: 1 }}>{num}</span>}
                {letter}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ─── word card ─────────────────────────────────────────── */
function WordCard({ word, index, sounds, onUpdate, onDelete, onSave, saving }) {
  const [open, setOpen] = useState(false)
  const [localWord, setLocalWord] = useState(word)
  const set = (k, v) => setLocalWord(w => ({ ...w, [k]: v }))

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface2)', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontWeight: 700, fontSize: 13, minWidth: 24, color: 'var(--primary)' }}>#{index + 1}</span>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1, flex: 1 }}>{localWord.word_text || '—'}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)', borderRadius: 4, padding: '2px 8px' }}>{localWord.direction}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>R{localWord.start_row} C{localWord.start_col}</span>
        <span style={{ fontSize: 16 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 140 }}>
              <label className="form-label">Word *</label>
              <input value={localWord.word_text || ''} onChange={e => set('word_text', e.target.value.toUpperCase())}
                placeholder="EXAMPLE" style={{ fontFamily: 'monospace', letterSpacing: 2 }} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
              <label className="form-label">Direction</label>
              <select value={localWord.direction || 'across'} onChange={e => set('direction', e.target.value)}>
                <option value="across">→ Across</option>
                <option value="down">↓ Down</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 80 }}>
              <label className="form-label">Start Row</label>
              <input type="number" min="0" value={localWord.start_row ?? 0} onChange={e => set('start_row', +e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 80 }}>
              <label className="form-label">Start Col</label>
              <input type="number" min="0" value={localWord.start_col ?? 0} onChange={e => set('start_col', +e.target.value)} />
            </div>
          </div>

          {/* Clue */}
          <div className="form-group">
            <label className="form-label">Clue</label>
            <input value={localWord.clue_text || ''} onChange={e => set('clue_text', e.target.value)} placeholder="Clue shown to the player" />
          </div>

          {/* Sounds */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <SoundSelector label="✅ Correct Sound" value={localWord.sound_correct_id} onChange={v => set('sound_correct_id', v)} sounds={sounds} />
            <SoundSelector label="❌ Wrong Sound"   value={localWord.sound_wrong_id}   onChange={v => set('sound_wrong_id',   v)} sounds={sounds} />
          </div>

          {/* Overlay image */}
          <ImageUploadField
            label="Overlay Image (shown on correct answer)"
            currentUrl={localWord._overlayPreview || localWord.overlay_image_url}
            onFileChange={e => {
              const f = e.target.files[0]; if (!f) return
              set('_overlayFile', f)
              set('_overlayPreview', URL.createObjectURL(f))
            }}
            onClear={() => { set('overlay_image_url', ''); set('_overlayFile', null); set('_overlayPreview', null) }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDelete(word)}>🗑 Delete</button>
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => { onUpdate(localWord); onSave(localWord) }}>
              {saving ? 'Saving…' : '💾 Save Word'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── settings panel ────────────────────────────────────── */
function CrosswordSettingsPanel({ gameId, settings, setSettings, sounds, showToast, upload }) {
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = [
        'heading_1','heading_2','heading_3','description_text','bg_color','primary_color','font_family',
        'sound_correct_id','sound_wrong_id']
      for (const f of fields) fd.append(f, settings[f] ?? '')
      if (settings._bgImageFile) fd.append('bg_image', settings._bgImageFile)
      else if (settings.bg_image_url !== undefined) fd.append('bg_image_url', settings.bg_image_url)
      if (settings._tyBgImageFile) fd.append('thankyou_bg_image', settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url !== undefined) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._gameLogoFile) fd.append('game_logo', settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url || '')
      await api.put(`/crossword/${gameId}/settings`, fd)
      showToast('Settings saved ✅')
    } catch (err) {
      const msg = uploadErrorMessage(err)
      if (settings._bgImageFile) upload.setFieldError('bg_image_url', msg)
      if (settings._gameLogoFile) upload.setFieldError('game_logo_url', msg)
      if (settings._tyBgImageFile) upload.setFieldError('thankyou_bg_image_url', msg)
      if (!settings._bgImageFile && !settings._gameLogoFile && !settings._tyBgImageFile) upload.setFieldError('bg_image_url', msg)
      showToast(msg, 'error')
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h3 style={{ margin: 0, fontSize: 15 }}>⚙️ Crossword Settings</h3>

      <div className="form-group">
        <label className="form-label">Heading 1</label>
        <input value={settings.heading_1 || ''} onChange={e => set('heading_1', e.target.value)} placeholder="Main heading on the game page" />
      </div>
      <div className="form-group">
        <label className="form-label">Heading 2</label>
        <input value={settings.heading_2 || ''} onChange={e => set('heading_2', e.target.value)} placeholder="Sub-heading" />
      </div>
      <div className="form-group">
        <label className="form-label">Heading 3 / Instructions</label>
        <input value={settings.heading_3 || ''} onChange={e => set('heading_3', e.target.value)} placeholder="Short instruction text" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea rows={3} value={settings.description_text || ''} onChange={e => set('description_text', e.target.value)} placeholder="Optional description shown above the grid" />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">Background Color</label>
          <input type="color" value={settings.bg_color || '#f8f8ff'} onChange={e => set('bg_color', e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">Primary Color</label>
          <input type="color" value={settings.primary_color || '#7c6ff7'} onChange={e => set('primary_color', e.target.value)} />
        </div>
      </div>

      <ImageUploadField
        label="Background Image"
        error={upload.errors.bg_image_url}
        currentUrl={settings._bgPreview || settings.bg_image_url}
        onFileChange={e => { upload.clearFieldError('bg_image_url'); const f = e.target.files[0]; if (!f) return; set('_bgImageFile', f); set('_bgPreview', URL.createObjectURL(f)) }}
        onClear={() => { set('bg_image_url', ''); set('_bgImageFile', null); set('_bgPreview', null) }}
      />
      <ImageUploadField
        label="Thank You Background Image"
        error={upload.errors.thankyou_bg_image_url}
        currentUrl={settings._tyPreview || settings.thankyou_bg_image_url}
        onFileChange={e => { upload.clearFieldError('thankyou_bg_image_url'); const f = e.target.files[0]; if (!f) return; set('_tyBgImageFile', f); set('_tyPreview', URL.createObjectURL(f)) }}
        onClear={() => { set('thankyou_bg_image_url', ''); set('_tyBgImageFile', null); set('_tyPreview', null) }}
      />
      <ImageUploadField
        label="Game Logo"
        error={upload.errors.game_logo_url}
        currentUrl={settings._logoPreview || settings.game_logo_url}
        onFileChange={e => { upload.clearFieldError('game_logo_url'); const f = e.target.files[0]; if (!f) return; set('_gameLogoFile', f); set('_logoPreview', URL.createObjectURL(f)) }}
        onClear={() => { set('game_logo_url', ''); set('_gameLogoFile', null); set('_logoPreview', null) }}
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <SoundSelector label="✅ Global Correct Sound" value={settings.sound_correct_id} onChange={v => set('sound_correct_id', v)} sounds={sounds} />
        <SoundSelector label="❌ Global Wrong Sound"   value={settings.sound_wrong_id}   onChange={v => set('sound_wrong_id',   v)} sounds={sounds} />
      </div>

      <button className="btn btn-primary" disabled={saving} onClick={save} style={{ alignSelf: 'flex-start' }}>
        {saving ? 'Saving…' : '💾 Save Settings'}
      </button>
    </div>
  )
}

/* ─── main exported tab ─────────────────────────────────── */
export default function CrosswordBuilderTab() {
  // Get gameId from route params
  const { id: gameId } = useParams()
  
  const [words, setWords] = useState([])
  const [settings, setSettings] = useState({})
  const [sounds, setSounds] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(null) // word id being saved
  const [innerTab, setInnerTab] = useState('words') // 'words' | 'settings' | 'preview'
  const [showGridSettings, setShowGridSettings] = useState(false)

  const upload = useUploadErrors()

  // Toast notification helper
  const showToast = (msg, type = 'success') => {
    // Simple alert for now - you can replace with a proper toast component
    alert(msg)
  }

  // Lazy-load when tab is first opened
  const load = async () => {
    if (loaded || !gameId) return
    setLoading(true)
    try {
      const [wRes, sRes, soundRes] = await Promise.all([
        api.get(`/crossword/games/${gameId}/words`),
        api.get(`/crossword/${gameId}/settings`),
        api.get('/sounds')
      ])
      setWords(wRes.data.words || [])
      setSettings(sRes.data.settings || {})
      setSounds(soundRes.data.sounds || [])
      setLoaded(true)
    } catch (err) {
      showToast('Failed to load crossword data: ' + (err.response?.data?.message || err.message), 'error')
    }
    setLoading(false)
  }

  // Load crossword data on mount
  useEffect(() => {
    load()
  }, [])

  const addWord = async () => {
    try {
      const fd = new FormData()
      fd.append('word_text', 'WORD')
      fd.append('clue_text', 'Enter a clue')
      fd.append('direction', 'across')
      fd.append('start_row', words.length > 0 ? Math.max(...words.map(w => w.start_row)) + 2 : 0)
      fd.append('start_col', 0)
      fd.append('word_order', words.length)
      const res = await api.post(`/crossword/games/${gameId}/words`, fd)
      setWords(prev => [...prev, res.data.word])
      showToast('Word added')
    } catch (err) {
      showToast('Error adding word: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  const saveWord = async (w) => {
    setSaving(w.id)
    try {
      const fd = new FormData()
      fd.append('word_text', w.word_text || '')
      fd.append('clue_text', w.clue_text || '')
      fd.append('start_row', w.start_row ?? 0)
      fd.append('start_col', w.start_col ?? 0)
      fd.append('direction', w.direction || 'across')
      fd.append('word_order', w.word_order ?? 0)
      fd.append('sound_correct_id', w.sound_correct_id || '')
      fd.append('sound_wrong_id', w.sound_wrong_id || '')
      fd.append('word_color', w.word_color || '#7c6ff7')
      if (w._overlayFile) fd.append('overlay_image', w._overlayFile)
      else fd.append('overlay_image_url', w.overlay_image_url || '')
      await api.put(`/crossword/words/${w.id}`, fd)
      showToast('Word saved ✅')
    } catch (err) {
      showToast('Error saving word: ' + (err.response?.data?.message || err.message), 'error')
    }
    setSaving(null)
  }

  const deleteWord = async (w) => {
    if (!confirm(`Delete "${w.word_text}"?`)) return
    try {
      await api.delete(`/crossword/words/${w.id}`)
      setWords(prev => prev.filter(x => x.id !== w.id))
      showToast('Word deleted')
    } catch {
      showToast('Error deleting word', 'error')
    }
  }

  const autoGenerateGrid = async () => {
    try {
      const res = await api.post(`/crossword/games/${gameId}/generate-grid`)
      setSettings(s => ({ ...s, grid_rows: res.data.grid_rows, grid_cols: res.data.grid_cols }))
      showToast(`Grid auto-sized to ${res.data.grid_rows}×${res.data.grid_cols}`)
    } catch (err) {
      showToast('Error: ' + (err.response?.data?.message || err.message), 'error')
    }
  }

  const innerTabs = [
    { id: 'words', label: '🔤 Words' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'preview', label: '👁 Grid Preview' },
  ]
  const TAB_FIELDS = {
    settings: ['bg_image_url', 'game_logo_url', 'thankyou_bg_image_url'],
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading crossword data…</div>

  return (
    <div>
      {/* inner tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {innerTabs.map(t => {
          const hasErr = upload.tabHasError(t.id, TAB_FIELDS[t.id] || [])
          return (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              style={{ padding: '8px 14px', fontSize: 13, fontWeight: innerTab === t.id ? 700 : 400,
                color: innerTab === t.id ? 'var(--primary)' : 'var(--text2)', background: 'none', border: 'none',
                borderBottom: `2px solid ${innerTab === t.id ? 'var(--primary)' : 'transparent'}`,
                marginBottom: -1, cursor: 'pointer' }}>
              {t.label}{hasErr && <span className="gb-tab-err-dot" />}
            </button>
          )
        })}
      </div>

      {/* WORDS */}
      {innerTab === 'words' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{words.length} word{words.length !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={autoGenerateGrid}>🔲 Auto-size Grid</button>
              <button className="btn btn-primary" onClick={addWord}>+ Add Word</button>
            </div>
          </div>

          {/* Collapsible Grid Settings */}
          <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              onClick={() => setShowGridSettings(s => !s)}
              style={{ padding: '10px 14px', background: 'var(--surface2)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700 }}
            >
              <span>📐 Grid Settings</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Rows: {settings.grid_rows || 10} · Cols: {settings.grid_cols || 10} · Cell: {settings.cell_size || 40}px</span>
              <span>{showGridSettings ? '▲' : '▼'}</span>
            </div>
            {showGridSettings && (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: 80 }}>
                    <label className="form-label">Grid Rows</label>
                    <input type="number" min="3" max="30" value={settings.grid_rows || 10} onChange={e => setSettings(s => ({ ...s, grid_rows: +e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 80 }}>
                    <label className="form-label">Grid Cols</label>
                    <input type="number" min="3" max="30" value={settings.grid_cols || 10} onChange={e => setSettings(s => ({ ...s, grid_cols: +e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 80 }}>
                    <label className="form-label">Cell Size (px)</label>
                    <input type="number" min="20" max="80" value={settings.cell_size || 40} onChange={e => setSettings(s => ({ ...s, cell_size: +e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                    <label className="form-label">Time Limit (s, 0=none)</label>
                    <input type="number" min="0" value={settings.time_limit_seconds || 0} onChange={e => setSettings(s => ({ ...s, time_limit_seconds: +e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={!!settings.show_timer} onChange={e => setSettings(s => ({ ...s, show_timer: e.target.checked ? 1 : 0 }))} />
                    Show Timer
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={!!settings.allow_hints} onChange={e => setSettings(s => ({ ...s, allow_hints: e.target.checked ? 1 : 0 }))} />
                    Allow Hints
                  </label>
                </div>
              </div>
            )}
          </div>

          {words.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text2)', border: '2px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔤</div>
              <p>No words yet. Click <strong>+ Add Word</strong> to start.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Each word needs a position (row, col) and direction.</p>
            </div>
          ) : (
            words.map((w, i) => (
              <WordCard
                key={w.id} word={w} index={i} sounds={sounds}
                saving={saving === w.id}
                onUpdate={updated => setWords(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x))}
                onSave={saveWord}
                onDelete={deleteWord}
              />
            ))
          )}
        </div>
      )}

      {/* SETTINGS */}
      {innerTab === 'settings' && (
        <CrosswordSettingsPanel
          gameId={gameId}
          settings={settings}
          setSettings={setSettings}
          sounds={sounds}
          showToast={showToast}
          upload={upload}
        />
      )}

      {/* GRID PREVIEW */}
      {innerTab === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Grid: {settings.grid_rows || 10} rows × {settings.grid_cols || 10} cols
            </span>
            <button className="btn btn-ghost btn-sm" onClick={autoGenerateGrid}>🔲 Auto-size from Words</button>
          </div>
          <GridPreview
            words={words}
            rows={settings.grid_rows || 10}
            cols={settings.grid_cols || 10}
          />
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
            This is a letter preview only. The real game renders with input cells, clue highlighting, and animations.
          </p>
        </div>
      )}
    </div>
  )
}