import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import api from '../api'

const STYLES = `
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes scorePop { 0%{transform:scale(1)} 50%{transform:scale(1.25)} 100%{transform:scale(1)} }
@keyframes confettiFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes flyFromBottom { from{transform:translateY(110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes flyToTop { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(-110vh) scale(0.9);opacity:0} }
`

function loadFont(font) {
  if (!font || font === 'DM Sans') return
  const id = 'gf-' + font.replace(/\s/g, '-')
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id; link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`
  document.head.appendChild(link)
}

function playSound(url) {
  if (!url) return
  try { const a = new Audio(url); a.play().catch(() => {}) } catch {}
}

function getLuminance(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const DEFAULT_COLORS = {
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
  32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024: '#edc53f', 2048: '#edc22e', 4096: '#3c3a32',
}

function getTileColor(value, customColors) {
  if (customColors && customColors[value]) return customColors[value]
  return DEFAULT_COLORS[value] || '#3c3a32'
}

function getTextColor(bg) {
  return getLuminance(bg) > 0.5 ? '#333' : '#fff'
}

let tileIdCounter = 0
function nextTileId() {
  return ++tileIdCounter
}

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

function addRandomTile(grid) {
  const empty = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (!grid[r][c]) empty.push([r, c])
    }
  }
  if (empty.length === 0) return false
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  grid[r][c] = { value: Math.random() < 0.9 ? 2 : 4, id: nextTileId() }
  return true
}

function slideRow(row) {
  const cells = row.filter(c => c !== null)
  let score = 0
  for (let i = 0; i < cells.length - 1; i++) {
    if (cells[i].value === cells[i + 1].value) {
      const newVal = cells[i].value * 2
      cells[i] = { value: newVal, id: nextTileId() }
      score += newVal
      cells.splice(i + 1, 1)
    }
  }
  while (cells.length < row.length) cells.push(null)
  return { row: cells, score }
}

function moveLeft(grid) {
  let totalScore = 0
  const newGrid = grid.map(row => {
    const { row: newRow, score } = slideRow([...row])
    totalScore += score
    return newRow
  })
  return { grid: newGrid, score: totalScore }
}

function moveRight(grid) {
  const reversed = grid.map(row => [...row].reverse())
  const { grid: rg, score } = moveLeft(reversed)
  return { grid: rg.map(row => [...row].reverse()), score }
}

function moveUp(grid) {
  const size = grid.length
  const t = Array.from({ length: size }, (_, c) => grid.map(r => r[c]))
  const { grid: tg, score } = moveLeft(t)
  return { grid: Array.from({ length: size }, (_, r) => tg.map(c => c[r])), score }
}

function moveDown(grid) {
  const size = grid.length
  const t = Array.from({ length: size }, (_, c) => grid.map(r => r[c]))
  const { grid: tg, score: sc } = moveRight(t)
  return { grid: Array.from({ length: size }, (_, r) => tg.map(c => c[r])), score: sc }
}

function gridToString(grid) {
  return grid.map(r => r.map(c => c ? c.value : 0).join(',')).join('|')
}

function isGameOver(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (!grid[r][c]) return false
      const v = grid[r][c].value
      if (c + 1 < grid[0].length && grid[r][c + 1] && grid[r][c + 1].value === v) return false
      if (r + 1 < grid.length && grid[r + 1][c] && grid[r + 1][c].value === v) return false
    }
  }
  return true
}

function hasWon(grid, target) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] && grid[r][c].value >= target) return true
    }
  }
  return false
}

function Confetti({ count = 40 }) {
  const colors = ['#6366f1','#ec4899','#f59e0b','#22c55e','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          position:'absolute', top:-20, left:`${Math.random() * 100}%`,
          width: 6 + Math.random() * 8, height: 6 + Math.random() * 8,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

export default function Game2048PlayerPage({ gameData, sessionToken, onComplete }) {
  const game = gameData
  const settings = game.settings || {}
  const soundMap = game.soundMap || {}
  const formFields = game.formFields || []

  const gridSize = parseInt(settings.grid_size) || 4
  const targetNumber = parseInt(settings.target_number) || 2048
  const showTimer = Number(settings.show_timer) === 1
  const timeLimit = parseInt(settings.time_limit_seconds) || 0
  const primaryColor = settings.primary_color || '#8f7a66'

  const [phase, setPhase] = useState('intro')
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [grid, setGrid] = useState(null)
  const [tiles, setTiles] = useState([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [wonState, setWonState] = useState(false)
  const [lostState, setLostState] = useState(false)
  const [scoreAnim, setScoreAnim] = useState(false)
  const isCompleteRef = useRef(false)
  const soundMapRef = useRef(soundMap || {})
  const timerRef = useRef(null)
  const gridRef = useRef(null)
  const scoreRef = useRef(0)

  const tileColors = useMemo(() => {
    const raw = settings.tile_colors
    if (!raw) return null
    if (typeof raw === 'object') return raw
    try { return JSON.parse(raw) } catch { return null }
  }, [settings.tile_colors])

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 400
  const maxContainer = Math.min(windowWidth - 32, 500)
  const cellSize = Math.max(36, Math.min(80, Math.floor((maxContainer - (gridSize + 1) * 8) / gridSize)))
  const gap = 8
  const containerSize = gridSize * cellSize + (gridSize + 1) * gap

  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])

  useEffect(() => { loadFont(settings.font_family) }, [settings.font_family])

  const initGame = useCallback(() => {
    tileIdCounter = 0
    const g = createEmptyGrid(gridSize)
    addRandomTile(g)
    addRandomTile(g)
    const flatTiles = []
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[0].length; c++) {
        if (g[r][c]) flatTiles.push({ ...g[r][c], row: r, col: c })
      }
    }
    setGrid(g)
    setTiles(flatTiles)
    gridRef.current = g
    setScore(0)
    scoreRef.current = 0
    setWonState(false)
    setLostState(false)
  }, [gridSize])

  const handleMove = useCallback((direction) => {
    const g = gridRef.current
    if (!g) return
    if (wonState || lostState) return

    const before = gridToString(g)
    let result
    switch (direction) {
      case 'left': result = moveLeft(g); break
      case 'right': result = moveRight(g); break
      case 'up': result = moveUp(g); break
      case 'down': result = moveDown(g); break
      default: return
    }

    const after = gridToString(result.grid)
    if (before === after) return

    playSound(resolveSound(settings.sound_slide_id))

    if (result.score > 0) {
      playSound(resolveSound(settings.sound_merge_id))
    }

    const newScore = scoreRef.current + result.score
    scoreRef.current = newScore
    setScore(newScore)
    setScoreAnim(true)
    setTimeout(() => setScoreAnim(false), 200)

    if (newScore > bestScore) {
      setBestScore(newScore)
      try { localStorage.setItem('g2048_best_' + game.id, String(newScore)) } catch {}
    }

    addRandomTile(result.grid)
    gridRef.current = result.grid

    const flatTiles = []
    for (let r = 0; r < result.grid.length; r++) {
      for (let c = 0; c < result.grid[0].length; c++) {
        if (result.grid[r][c]) flatTiles.push({ ...result.grid[r][c], row: r, col: c })
      }
    }
    setGrid(result.grid)
    setTiles(flatTiles)

    if (hasWon(result.grid, targetNumber) && !wonState) {
      setWonState(true)
      playSound(resolveSound(settings.sound_win_id))
      return
    }

    if (isGameOver(result.grid)) {
      setLostState(true)
      playSound(resolveSound(settings.sound_lose_id))
      clearInterval(timerRef.current)
    }
  }, [wonState, lostState, bestScore, targetNumber, settings, resolveSound, game.id])

  useEffect(() => {
    if (phase !== 'playing') return
    initGame()
    setBestScore(prev => {
      try {
        const saved = localStorage.getItem('g2048_best_' + game.id)
        return saved ? Math.max(prev, parseInt(saved)) : prev
      } catch { return prev }
    })
  }, [phase, initGame, game.id])

  useEffect(() => {
    if (phase !== 'playing' || !showTimer || timeLimit <= 0) return
    setTimeLeft(timeLimit)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setLostState(true)
          playSound(resolveSound(settings.sound_lose_id))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, showTimer, timeLimit, settings, resolveSound])

  useEffect(() => {
    if (phase !== 'playing') return
    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); handleMove('up'); break
        case 'ArrowDown': e.preventDefault(); handleMove('down'); break
        case 'ArrowLeft': e.preventDefault(); handleMove('left'); break
        case 'ArrowRight': e.preventDefault(); handleMove('right'); break
      }
    }
    window.addEventListener('keydown', handleKey)

    let touchStart = null
    const handleTouchStart = (e) => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const handleTouchEnd = (e) => {
      if (!touchStart) return
      const dx = e.changedTouches[0].clientX - touchStart.x
      const dy = e.changedTouches[0].clientY - touchStart.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx > absDy && absDx > 20) {
        handleMove(dx > 0 ? 'right' : 'left')
      } else if (absDy > absDx && absDy > 20) {
        handleMove(dy > 0 ? 'down' : 'up')
      }
      touchStart = null
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [phase, handleMove])

  const handleStart = () => {
    if (formFields.length > 0) {
      const errors = {}
      formFields.forEach(ff => {
        if (Number(ff.is_required) === 1 && !formData[ff.field_label]?.trim()) {
          errors[ff.field_label] = 'This field is required'
        }
      })
      if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setPhase('playing')
    }, 300)
  }

  const handleKeepGoing = () => {
    setWonState(false)
  }

  const handleClaimPrize = async () => {
    if (isCompleteRef.current) return
    isCompleteRef.current = true
    clearInterval(timerRef.current)
    if (!sessionToken) { onComplete?.({ redirect_url: game.redirect_url }); return }
    try {
      const res = await api.post('/play/session/complete', {
        session_token: sessionToken,
        score: scoreRef.current,
        player_data: { game_type: '2048', grid_size: gridSize, target_number: targetNumber, won: true },
      })
      onComplete?.(res.data)
    } catch (err) {
      onComplete?.({ redirect_url: game.redirect_url })
    }
  }

  const handleGameOver = async () => {
    if (isCompleteRef.current) return
    isCompleteRef.current = true
    clearInterval(timerRef.current)
    if (!sessionToken) { onComplete?.({ redirect_url: game.redirect_url }); return }
    try {
      const res = await api.post('/play/session/complete', {
        session_token: sessionToken,
        score: scoreRef.current,
        player_data: { game_type: '2048', grid_size: gridSize, target_number: targetNumber, won: false },
      })
      onComplete?.(res.data)
    } catch (err) {
      onComplete?.({ redirect_url: game.redirect_url })
    }
  }

  const handleNewGame = () => {
    initGame()
    setWonState(false)
    setLostState(false)
    if (showTimer && timeLimit > 0) {
      setTimeLeft(timeLimit)
    }
  }

  const animIn = settings.overlay_animation_in || 'flyFromBottom'

  const bgStyle = {
    background: settings.bg_image_url
      ? `url("${settings.bg_image_url}") center / cover no-repeat`
      : (settings.bg_color || '#faf8ef'),
  }

  if (phase === 'intro') {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        ...bgStyle,
        fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
        padding:'20px 16px',
      }}>
        <style>{STYLES}</style>
        <div style={{ maxWidth:400, margin:'auto', width:'100%', animation:'fadeIn .4s ease' }}>
          {settings.game_logo_url && (
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <img src={settings.game_logo_url} alt="" style={{ height:48, objectFit:'contain' }} />
            </div>
          )}
          <div style={{
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)',
            borderRadius:20, padding:'24px 20px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ fontSize:22, fontWeight:800, color: settings.heading_1_color || '#1a1a2e', margin:0, textAlign:'center' }}>
              {settings.heading_1 || '2048'}
            </h1>
            {settings.heading_2 && (
              <p style={{ fontSize:14, color: settings.heading_2_color || '#666', textAlign:'center', margin:'4px 0 0' }}>
                {settings.heading_2}
              </p>
            )}
            {settings.description_text && (
              <p style={{ fontSize:13, color: settings.description_color || '#888', textAlign:'center', margin:'8px 0 16px', lineHeight:1.4 }}>
                {settings.description_text}
              </p>
            )}
            <div style={{
              display:'flex', justifyContent:'center', gap:16,
              padding:'12px 0', margin:'8px 0 12px',
              borderTop:'1px solid #eee', borderBottom:'1px solid #eee',
            }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color: primaryColor }}>{gridSize}×{gridSize}</div>
                <div style={{ fontSize:11, color:'#999', marginTop:2 }}>Grid</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color: primaryColor }}>{targetNumber}</div>
                <div style={{ fontSize:11, color:'#999', marginTop:2 }}>Target</div>
              </div>
            </div>
            {formFields.map((ff, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>
                  {ff.field_label} {Number(ff.is_required) === 1 && <span style={{ color:'#dc2626' }}>*</span>}
                </label>
                {ff.field_type === 'textarea' ? (
                  <textarea rows={3} value={formData[ff.field_label] || ''}
                    onChange={e => { setFormData({...formData, [ff.field_label]: e.target.value}); setFormErrors({...formErrors, [ff.field_label]: ''}) }}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid '+(formErrors[ff.field_label]?'#dc2626':'#ddd'), fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', background:'#fff' }} />
                ) : ff.field_type === 'select' ? (
                  <select value={formData[ff.field_label] || ''}
                    onChange={e => setFormData({...formData, [ff.field_label]: e.target.value})}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #ddd', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                    <option value="">Select...</option>
                    {(ff.field_options || []).map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={ff.field_type === 'email' ? 'email' : ff.field_type === 'phone' ? 'tel' : ff.field_type === 'number' ? 'number' : 'text'}
                    value={formData[ff.field_label] || ''}
                    onChange={e => { setFormData({...formData, [ff.field_label]: e.target.value}); setFormErrors({...formErrors, [ff.field_label]: ''}) }}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid '+(formErrors[ff.field_label]?'#dc2626':'#ddd'), fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff' }} />
                )}
                {formErrors[ff.field_label] && <p style={{ color:'#dc2626', fontSize:11, margin:'3px 0 0' }}>{formErrors[ff.field_label]}</p>}
              </div>
            ))}
            {Number(settings.terms_enabled) === 1 && (
              <label style={{ display:'flex', alignItems:'center', gap:8, margin:'12px 0', cursor:'pointer', fontSize:13 }}>
                <input type="checkbox" checked={formData.__terms || false}
                  onChange={e => setFormData({...formData, __terms: e.target.checked})}
                  style={{ width:16, height:16 }} />
                <span>
                  I accept the{' '}
                  {settings.terms_url
                    ? <a href={settings.terms_url} target="_blank" style={{ color: primaryColor }}>{settings.terms_text || 'Terms & Conditions'}</a>
                    : <strong>{settings.terms_text || 'Terms & Conditions'}</strong>
                  }
                </span>
              </label>
            )}
            <button onClick={handleStart} disabled={submitting}
              style={{
                width:'100%', padding:'14px', borderRadius:12, border:'none',
                background: primaryColor, color:'#fff',
                fontSize:16, fontWeight:700, cursor:'pointer',
                fontFamily:'inherit', marginTop:8,
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? '⏳ Starting...' : (settings.start_button_text || '▶ Start Game')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase !== 'playing') return null

  const timeColor = timeLeft <= 10 ? '#ef4444' : '#776e65'

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      ...bgStyle,
      fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
      padding:'12px',
    }}>
      <style>{STYLES}</style>

      {/* Header: score / best / timer */}
      <div style={{ width:'100%', maxWidth:containerSize + 16, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontSize:20, fontWeight:800, color: primaryColor, letterSpacing:-1 }}>2048</div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{
            background:'#bbada0', borderRadius:6, padding:'4px 10px', textAlign:'center', minWidth:60,
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#eee4da', textTransform:'uppercase', letterSpacing:0.5 }}>Score</div>
            <div style={{
              fontSize:18, fontWeight:800, color:'#fff',
              animation: scoreAnim ? 'scorePop .2s ease' : 'none',
            }}>
              {score}
            </div>
          </div>
          <div style={{
            background:'#bbada0', borderRadius:6, padding:'4px 10px', textAlign:'center', minWidth:60,
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#eee4da', textTransform:'uppercase', letterSpacing:0.5 }}>Best</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{bestScore}</div>
          </div>
          {showTimer && timeLimit > 0 && (
            <div style={{
              background: timeLeft <= 10 ? '#ef4444' : '#bbada0', borderRadius:6, padding:'4px 10px', textAlign:'center', minWidth:50,
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#eee4da', textTransform:'uppercase', letterSpacing:0.5 }}>Time</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        position:'relative', width: containerSize, height: containerSize,
        background:'#bbada0', borderRadius:8, padding: gap, boxSizing:'border-box',
      }}>
        {/* Background cells */}
        <div style={{
          display:'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}>
          {Array.from({ length: gridSize * gridSize }).map((_, i) => (
            <div key={i} style={{
              width: cellSize, height: cellSize,
              background:'rgba(238,228,218,0.35)',
              borderRadius: 4,
            }} />
          ))}
        </div>

        {/* Tiles */}
        {tiles.map(tile => {
          const bg = getTileColor(tile.value, tileColors)
          const tc = getTextColor(bg)
          const fontSize = tile.value >= 1000 ? (tile.value >= 10000 ? cellSize * 0.25 : cellSize * 0.32) : cellSize * 0.42
          return (
            <div key={tile.id} style={{
              position:'absolute',
              width: cellSize, height: cellSize,
              borderRadius: 4,
              background: bg,
              color: tc,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight: 700,
              fontSize,
              transition: 'transform 120ms ease-in-out',
              transform: `translate(${tile.col * (cellSize + gap) + gap}px, ${tile.row * (cellSize + gap) + gap}px)`,
              zIndex: 10,
              animation: tile.id > tileIdCounter - 3 ? 'popIn .2s ease' : 'none',
              lineHeight: 1,
            }}>
              {tile.value}
            </div>
          )
        })}
      </div>

      {/* D-Pad controls */}
      <div style={{ display:'flex', justifyContent:'center', marginTop:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,48px)', gap:4 }}>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();handleMove('up')}} onClick={()=>handleMove('up')}
            style={{width:48,height:48,borderRadius:10,border:'1px solid rgba(0,0,0,0.1)',background:'rgba(187,173,160,0.25)',color:'#776e65',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>▲</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();handleMove('left')}} onClick={()=>handleMove('left')}
            style={{width:48,height:48,borderRadius:10,border:'1px solid rgba(0,0,0,0.1)',background:'rgba(187,173,160,0.25)',color:'#776e65',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>◀</button>
          <div style={{width:48,height:48,borderRadius:10,background:primaryColor+'22',border:'1px solid '+primaryColor+'44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:primaryColor,fontWeight:700}}>◆</div>
          <button onTouchStart={(e)=>{e.preventDefault();handleMove('right')}} onClick={()=>handleMove('right')}
            style={{width:48,height:48,borderRadius:10,border:'1px solid rgba(0,0,0,0.1)',background:'rgba(187,173,160,0.25)',color:'#776e65',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>▶</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();handleMove('down')}} onClick={()=>handleMove('down')}
            style={{width:48,height:48,borderRadius:10,border:'1px solid rgba(0,0,0,0.1)',background:'rgba(187,173,160,0.25)',color:'#776e65',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>▼</button>
        </div>
      </div>

      {/* New Game */}
      <div style={{ marginTop:8 }}>
        <button onClick={handleNewGame}
          style={{
            padding:'8px 20px', borderRadius:8, border:'none',
            background: primaryColor, color:'#fff',
            fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>
          {settings.new_game_button_text || '↻ New Game'}
        </button>
      </div>

      {/* Won overlay */}
      {wonState && !lostState && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
          animation:'fadeIn .3s ease',
        }}>
          <Confetti />
          <div style={{
            textAlign:'center', animation:`${animIn} .4s ease`,
          }}>
            <div style={{
              background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'28px 24px', maxWidth:320,
            }}>
              <div style={{ fontSize:56, marginBottom:8 }}>🎉</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:'#16a34a', margin:0 }}>You Win!</h2>
              <p style={{ fontSize:14, color:'#666', margin:'8px 0' }}>
                Target {targetNumber} reached!
              </p>
              <p style={{ fontSize:13, color:'#888', margin:'0 0 16px' }}>
                Score: <strong>{score}</strong>
              </p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button onClick={handleKeepGoing}
                  style={{
                    padding:'12px 24px', borderRadius:12, border:'2px solid '+primaryColor,
                    background:'transparent', color:primaryColor,
                    fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  }}>
                  {settings.keep_going_button_text || 'Keep Going'}
                </button>
                <button onClick={handleClaimPrize}
                  style={{
                    padding:'12px 24px', borderRadius:12, border:'none',
                    background: primaryColor, color:'#fff',
                    fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    boxShadow: `0 4px 16px ${primaryColor}44`,
                  }}>
                  {settings.claim_prize_button_text || 'Claim Prize →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lost overlay */}
      {lostState && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
          animation:'fadeIn .3s ease',
        }}>
          <div style={{
            textAlign:'center', animation:`${animIn} .4s ease`,
          }}>
            <div style={{
              background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'28px 24px', maxWidth:320,
            }}>
              <div style={{ fontSize:56, marginBottom:8 }}>😞</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:'#dc2626', margin:0 }}>Game Over</h2>
              <p style={{ fontSize:14, color:'#666', margin:'8px 0' }}>
                No moves left!
              </p>
              <p style={{ fontSize:13, color:'#888', margin:'0 0 16px' }}>
                Final Score: <strong>{score}</strong>
              </p>
              <button onClick={handleGameOver}
                style={{
                  padding:'12px 36px', borderRadius:12, border:'none',
                  background: primaryColor, color:'#fff',
                  fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  boxShadow: `0 4px 16px ${primaryColor}44`,
                }}>
                {settings.continue_button_text || 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
