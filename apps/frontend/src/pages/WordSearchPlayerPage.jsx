import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) {
  if (!url) return
  try { const a = new Audio(url); a.play().catch(() => {}) } catch {}
}

function useTimer(active, limitSeconds) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => { if (!active) return; const id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id) }, [active])
  const remaining = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : null
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return { elapsed, remaining, display: remaining !== null ? fmt(remaining) : fmt(elapsed) }
}

const DIRECTIONS = [
  [0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]
]

function buildGrid(rows, cols, wordsList) {
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''))
  const placements = []

  const sorted = [...wordsList].sort((a, b) => b.word_text.length - a.word_text.length)

  for (const wordObj of sorted) {
    const word = wordObj.word_text.toUpperCase().replace(/[^A-Z]/g, '')
    if (word.length === 0) continue
    let placed = false

    const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5)

    for (const [dr, dc] of dirs) {
      const startPositions = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let fits = true
          for (let i = 0; i < word.length; i++) {
            const nr = r + dr * i
            const nc = c + dc * i
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { fits = false; break }
            if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { fits = false; break }
          }
          if (fits) startPositions.push([r, c])
        }
      }
      if (startPositions.length > 0) {
        const [sr, sc] = startPositions[Math.floor(Math.random() * startPositions.length)]
        const cells = []
        for (let i = 0; i < word.length; i++) {
          const nr = sr + dr * i
          const nc = sc + dc * i
          grid[nr][nc] = word[i]
          cells.push([nr, nc])
        }
        placements.push({ word: wordObj, cells, start: [sr, sc], dir: [dr, dc] })
        placed = true
        break
      }
    }

    if (!placed) {
      for (let r = 0; r < rows && !placed; r++) {
        for (let c = 0; c < cols && !placed; c++) {
          for (const [dr2, dc2] of DIRECTIONS) {
            let fits = true
            for (let i = 0; i < word.length; i++) {
              const nr = r + dr2 * i, nc = c + dc2 * i
              if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { fits = false; break }
              if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { fits = false; break }
            }
            if (fits) {
              const cells = []
              for (let i = 0; i < word.length; i++) {
                const nr = r + dr2 * i, nc = c + dc2 * i
                grid[nr][nc] = word[i]
                cells.push([nr, nc])
              }
              placements.push({ word: wordObj, cells, start: [r, c], dir: [dr2, dc2] })
              placed = true
              break
            }
          }
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      }
    }
  }

  return { grid, placements }
}

export default function WordSearchPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, words, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])

  const primaryColor = settings?.primary_color || '#6366f1'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const rows = settings?.grid_rows || 12
  const cols = settings?.grid_cols || 12

  const [gridData, setGridData] = useState(null)
  const [placements, setPlacements] = useState([])
  const [foundWords, setFoundWords] = useState(new Set())
  const [selectedCells, setSelectedCells] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [startCell, setStartCell] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [timerStarted, setTimerStarted] = useState(false)
  const [highlightedWord, setHighlightedWord] = useState(null)
  const completedRef = useRef(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  useEffect(() => { const h = () => setWindowWidth(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])

  const { display: timerDisplay, remaining } = useTimer(timerStarted && !gameOver, settings?.time_limit_seconds || 0)

  useEffect(() => {
    if (remaining === 0 && !gameOver && timerStarted) { setGameOver(true); handleComplete() }
  }, [remaining, gameOver, timerStarted])

  useEffect(() => {
    if (words && words.length > 0) {
      const { grid, placements: p } = buildGrid(rows, cols, words)
      setGridData(grid)
      setPlacements(p)
    }
  }, [words, rows, cols])

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        const score = foundWords.size
        const totalScoreable = words.length
        await fetch('/api/play/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score, player_data: {} })
        })
      }
      playSound(resolveSound(settings?.sound_correct_id))
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, foundWords, words, settings, resolveSound])

  const handleStart = () => { setShowIntro(false); setTimerStarted(true) }

  const getCellFromEvent = (e) => {
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e
    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!elem) return null
    const r = parseInt(elem.dataset.row)
    const c = parseInt(elem.dataset.col)
    if (isNaN(r) || isNaN(c)) return null
    return [r, c]
  }

  const handlePointerDown = (e, r, c) => {
    if (gameOver) return
    e.preventDefault()
    setIsSelecting(true)
    setStartCell([r, c])
    setSelectedCells([[r, c]])
  }

  const handlePointerMove = (e) => {
    if (!isSelecting || !startCell || gameOver) return
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return
    const [sr, sc] = startCell
    const [er, ec] = cell

    const dr = Math.sign(er - sr) || 0
    const dc = Math.sign(ec - sc) || 0

    if (dr === 0 && dc === 0) { setSelectedCells([[sr, sc]]); return }

    const lineDr = dr === 0 ? 0 : (Math.abs(er - sr) >= Math.abs(ec - sc) ? Math.sign(er - sr) : 0)
    const lineDc = dc === 0 ? 0 : (Math.abs(ec - sc) >= Math.abs(er - sr) ? Math.sign(ec - sc) : 0)

    const maxDist = Math.max(Math.abs(er - sr), Math.abs(ec - sc))
    const cells = []
    for (let i = 0; i <= maxDist; i++) {
      const nr = sr + lineDr * i
      const nc = sc + lineDc * i
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) cells.push([nr, nc])
    }
    setSelectedCells(cells)
  }

  const handlePointerUp = () => {
    if (!isSelecting || gameOver) { setIsSelecting(false); return }
    setIsSelecting(false)

    for (const placement of placements) {
      if (foundWords.has(placement.word.id)) continue
      const { cells } = placement
      if (cells.length !== selectedCells.length) continue
      const match = cells.every(([cr, cc], i) => cr === selectedCells[i]?.[0] && cc === selectedCells[i]?.[1])
      if (match) {
        const newFound = new Set(foundWords)
        newFound.add(placement.word.id)
        setFoundWords(newFound)
        playSound(resolveSound(settings?.sound_correct_id))
        setSelectedCells([])

        if (newFound.size === placements.length) {
          setGameOver(true)
          setTimeout(() => handleComplete(), 500)
        }
        return
      }

      const reverseMatch = [...cells].reverse().every(([cr, cc], i) => cr === selectedCells[i]?.[0] && cc === selectedCells[i]?.[1])
      if (reverseMatch) {
        const newFound = new Set(foundWords)
        newFound.add(placement.word.id)
        setFoundWords(newFound)
        playSound(resolveSound(settings?.sound_correct_id))
        setSelectedCells([])
        if (newFound.size === placements.length) { setGameOver(true); setTimeout(() => handleComplete(), 500) }
        return
      }
    }

    playSound(resolveSound(settings?.sound_wrong_id))
    setSelectedCells([])
  }

  const handleHint = () => {
    if (!settings?.allow_hints) return
    const unfound = placements.find(p => !foundWords.has(p.word.id))
    if (unfound) {
      setHighlightedWord(unfound.word.id)
      setTimeout(() => setHighlightedWord(null), 3000)
    }
  }

  const isCellSelected = (r, c) => selectedCells.some(([sr, sc]) => sr === r && sc === c)
  const isCellFound = (r, c) => placements.some(p => foundWords.has(p.word.id) && p.cells.some(([cr, cc]) => cr === r && cc === c))
  const isCellHinted = (r, c) => highlightedWord && placements.some(p => p.word.id === highlightedWord && p.cells.some(([cr, cc]) => cr === r && cc === c))

  const cellSize = Math.min(
    Math.floor((Math.min(windowWidth - 40, 560)) / cols),
    Math.floor((window.innerHeight - 320) / rows),
    40
  )

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#f4f4ff' }

  const progress = placements.length > 0 ? Math.round((foundWords.size / placements.length) * 100) : 0

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh', ...bgStyle, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 16px', fontFamily:ff }}>
        <div style={{ width:'100%', maxWidth:440, padding:'clamp(24px,6vw,36px) clamp(18px,5vw,28px)', borderRadius:28, background: settings?.bg_image_url ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.93)', backdropFilter:'blur(28px)', boxShadow:'0 8px 40px rgba(0,0,0,0.12)', textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%', maxHeight:60, marginBottom:16, objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)', fontWeight:800, color: settings?.heading_1_color || '#1a1a2e', marginBottom:8, fontFamily:ff }}>{settings?.heading_1 || 'Word Search'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15, fontWeight:600, color: settings?.heading_2_color || '#666', marginBottom:8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize:13, color: settings?.heading_3_color || '#888', marginBottom:16 }}>{settings.heading_3}</p>}
          {settings?.description_text && (
            <p style={{ fontSize:13, color: settings?.description_color || '#888', textAlign:'center', margin:'0 0 8px', lineHeight:1.4 }}>
              {settings.description_text}
            </p>
          )}
          <p style={{ fontSize:13, color:'#888', marginBottom:8 }}>{words?.length || 0} words hidden in a {rows}×{cols} grid</p>
          {settings?.show_timer === 1 && settings?.time_limit_seconds > 0 && <p style={{ fontSize:12, color:'#999', marginBottom:16 }}>⏱ {Math.floor(settings.time_limit_seconds/60)}m {settings.time_limit_seconds%60}s limit</p>}
          {Number(settings?.terms_enabled) === 1 && (
            <label style={{ display:'flex', alignItems:'center', gap:8, margin:'0 0 16px', cursor:'pointer', fontSize:13, textAlign:'left', justifyContent:'center' }}>
              <input type="checkbox" style={{ width:16, height:16 }} />
              <span>
                I accept the{' '}
                {settings?.terms_url
                  ? <a href={settings.terms_url} target="_blank" style={{ color: primaryColor }}>{settings.terms_text || 'Terms & Conditions'}</a>
                  : <strong>{settings.terms_text || 'Terms & Conditions'}</strong>
                }
              </span>
            </label>
          )}
          <button onClick={handleStart} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, color:'#fff', border:'none', borderRadius:12, padding:'15px 36px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:ff, boxShadow:`0 6px 20px ${primaryColor}44`, width:'100%', maxWidth:280 }}>{settings?.start_button_text || 'Start →'}</button>
        </div>
      </div>
    )
  }

  if (!gridData) return null

  return (
    <div style={{ minHeight:'100dvh', ...bgStyle, display:'flex', flexDirection:'column', alignItems:'center', fontFamily:ff, padding:'12px 16px', touchAction:'none' }}>
      {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ height:40, marginBottom:4, objectFit:'contain' }} />}
      <h2 style={{ fontSize:18, fontWeight:800, color: settings?.heading_1_color || '#1a1a2e', marginBottom:4, textAlign:'center' }}>{settings?.heading_1 || 'Word Search'}</h2>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap', justifyContent:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderRadius:12, padding:'8px 16px' }}>
          <span style={{ fontSize:14, fontWeight:700, color:primaryColor }}>{foundWords.size}/{placements.length}</span>
          <span style={{ fontSize:12, color:'#888' }}>words found</span>
          {settings?.show_timer === 1 && <span style={{ fontSize:12, color:'#888', marginLeft:8 }}>⏱ {timerDisplay}</span>}
        </div>
        <div style={{ width:100, height:6, background:'rgba(0,0,0,0.06)', borderRadius:6, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${primaryColor},${primaryColor}bb)`, borderRadius:6, transition:'width 0.5s ease' }} />
        </div>
        {settings?.allow_hints === 1 && <button onClick={handleHint} style={{ background:'rgba(255,255,255,0.85)', border:'1.5px solid #E5E7EB', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer', color:'#666' }}>💡 Hint</button>}
      </div>

      <div
        style={{ display:'inline-grid', gridTemplateColumns:`repeat(${cols},${cellSize}px)`, gap:2, padding:6, background:'rgba(255,255,255,0.15)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const selected = isCellSelected(r, c)
            const found = isCellFound(r, c)
            const hinted = isCellHinted(r, c)
            return (
              <div
                key={`${r}-${c}`}
                data-row={r}
                data-col={c}
                onMouseDown={(e) => handlePointerDown(e, r, c)}
                onTouchStart={(e) => handlePointerDown(e, r, c)}
                style={{
                  width: cellSize, height: cellSize,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: cellSize * 0.45, fontWeight: 700,
                  borderRadius: 4, cursor: 'pointer',
                  background: found ? `${primaryColor}22` : hinted ? '#FEF3C7' : selected ? `${primaryColor}44` : 'rgba(255,255,255,0.8)',
                  color: found ? primaryColor : '#1a1a2e',
                  border: found ? `2px solid ${primaryColor}` : hinted ? '2px solid #F59E0B' : selected ? `2px solid ${primaryColor}` : '1px solid rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {gridData[r][c]}
              </div>
            )
          })
        )}
      </div>

      <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center', maxWidth: 580 }}>
        {placements.map(p => (
          <div key={p.word.id} style={{
            padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600, letterSpacing:0.5,
            background: foundWords.has(p.word.id) ? `${primaryColor}18` : 'rgba(255,255,255,0.7)',
            border: `1px solid ${foundWords.has(p.word.id) ? primaryColor : '#E5E7EB'}`,
            color: foundWords.has(p.word.id) ? primaryColor : '#888',
            textDecoration: foundWords.has(p.word.id) ? 'line-through' : 'none',
          }}>
            {p.word.word_text}
            {p.word.clue_text && <span style={{ marginLeft:4, opacity:0.6, fontSize:10 }}>({p.word.clue_text})</span>}
          </div>
        ))}
      </div>

      {gameOver && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff', borderRadius:28, padding:'clamp(28px,7vw,44px) clamp(20px,6vw,36px)', maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{foundWords.size >= placements.length ? '🏆' : '⏰'}</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:8 }}>{foundWords.size >= placements.length ? 'All Words Found!' : 'Time\'s Up!'}</h2>
            <p style={{ color:'#666', fontSize:14, marginBottom:24 }}>{foundWords.size} of {placements.length} words found in {timerDisplay}</p>
            {settings?.outro_text && (
              <p style={{ fontSize:13, color: settings?.description_color || '#888', margin:'0 0 16px', lineHeight:1.4 }}>
                {settings.outro_text}
              </p>
            )}
            <button onClick={handleComplete} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, color:'#fff', border:'none', borderRadius:50, padding:'14px 36px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:ff, boxShadow:`0 8px 28px ${primaryColor}55`, width:'100%' }}>{settings?.continue_button_text || 'Continue →'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
