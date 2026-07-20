import { useState, useEffect } from 'react'
import { buildThemeVars } from '../lib/themeColor'

const STORE_COLOR = 'consoleColor'
const STORE_SWATCHES = 'consoleSwatches'
const MAX_SWATCHES = 6

function applyColor(hex) {
  const vars = buildThemeVars(hex)
  let style = document.getElementById('custom-console-theme')
  if (!style) {
    style = document.createElement('style')
    style.id = 'custom-console-theme'
    document.head.appendChild(style)
  }
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  // Apply to BOTH light & dark themes so the brand color shows in either mode.
  style.textContent = `[data-theme='light'] {\n${body}\n}\n[data-theme='dark'] {\n${body}\n}`
}

function clearColor() {
  const style = document.getElementById('custom-console-theme')
  if (style) style.textContent = ''
  document.documentElement.setAttribute('data-theme',
    document.documentElement.getAttribute('data-theme') || 'light')
}

export default function ThemeColorPicker() {
  const [color, setColor] = useState(() => localStorage.getItem(STORE_COLOR) || '#a855f7')
  const [swatches, setSwatches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_SWATCHES) || '[]') } catch { return [] }
  })
  const [open, setOpen] = useState(false)

  // Apply persisted color on mount.
  useEffect(() => {
    if (localStorage.getItem(STORE_COLOR)) applyColor(localStorage.getItem(STORE_COLOR))
  }, [])

  const commit = (hex) => {
    setColor(hex)
    localStorage.setItem(STORE_COLOR, hex)
    applyColor(hex)
    setSwatches(prev => {
      const next = [hex, ...prev.filter(c => c.toLowerCase() !== hex.toLowerCase())].slice(0, MAX_SWATCHES)
      localStorage.setItem(STORE_SWATCHES, JSON.stringify(next))
      return next
    })
  }

  const reset = () => {
    localStorage.removeItem(STORE_COLOR)
    localStorage.removeItem(STORE_SWATCHES)
    clearColor()
    setColor('#a855f7')
    setSwatches([])
  }

  const vars = buildThemeVars(color)

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🎨</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Console Color</span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: 'var(--surface2)', color: 'var(--text2)',
            border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px',
          }}
        >
          {open ? 'Close' : 'Pick'}
        </button>
      </div>

      {/* current color row: swatch + hex */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{
          width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
          background: color, border: '1px solid var(--border)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.25)',
        }}>
          <input type="color" value={color} onChange={e => commit(e.target.value)}
            style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none' }} />
        </label>
        <input
          value={color}
          onChange={e => {
            const v = e.target.value
            if (/^#([0-9a-fA-F]{6})$/.test(v)) { setColor(v); commit(v) }
            else setColor(v)
          }}
          style={{
            flex: 1, fontSize: 12, padding: '6px 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', outline: 'none', fontFamily: 'monospace',
          }}
        />
      </div>

      {/* 3 lighter / 3 darker preview */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {[vars['--primary-hover'], vars['--primary-light']].map((c, i) => (
          <div key={'l' + i} style={{ flex: 1, height: 16, borderRadius: 4, background: c }} />
        ))}
        <div style={{ flex: 1, height: 16, borderRadius: 4, background: color, border: '1px solid var(--border)' }} />
        {[vars['--gb-primary-d2'], vars['--gb-primary-d3']].map((c, i) => (
          <div key={'d' + i} style={{ flex: 1, height: 16, borderRadius: 4, background: c }} />
        ))}
      </div>

      {/* swatches */}
      {swatches.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {swatches.map((s, i) => (
            <button key={i} title={s} onClick={() => commit(s)}
              style={{
                width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
                background: s, border: '1px solid var(--border)',
                boxShadow: s.toLowerCase() === color.toLowerCase() ? '0 0 0 2px var(--text2)' : 'none',
              }} />
          ))}
        </div>
      )}

      <button onClick={reset}
        style={{
          marginTop: 10, width: '100%', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          background: 'var(--surface2)', color: 'var(--text2)',
          border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px',
        }}>
        ↺ Reset to original (white)
      </button>
    </div>
  )
}
