import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = '/api'

function playSound(url) {
  if (!url) return
  try { const a = new Audio(url); a.play().catch(() => {}) } catch {}
}

function useTimer(active, limitSeconds) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  const remaining = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : null
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return { elapsed, remaining, display: remaining !== null ? fmt(remaining) : fmt(elapsed) }
}

export default function JigsawPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, formFields, form_data, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])
  const primaryColor = settings?.primary_color || '#6366f1'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const rows = settings?.grid_rows || 4
  const cols = settings?.grid_cols || 4
  const totalPieces = rows * cols

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [pieces, setPieces] = useState([])
  const [solvedCount, setSolvedCount] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [timerStarted, setTimerStarted] = useState(false)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const completedRef = useRef(false)

  const { display: timerDisplay, remaining } = useTimer(timerStarted && !gameOver, settings?.time_limit_seconds || 0)

  useEffect(() => {
    if (remaining === 0 && !gameOver && timerStarted) {
      setGameOver(true)
      handleComplete()
    }
  }, [remaining, gameOver, timerStarted])

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        await fetch(`${API_BASE}/play/session/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken })
        })
      }
      playSound(resolveSound(settings?.sound_correct_id))
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, settings])

  useEffect(() => {
    if (!settings?.puzzle_image_url) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      setImageLoaded(true)
    }
    img.src = settings.puzzle_image_url
  }, [settings?.puzzle_image_url])

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      const pieceW = Math.floor(img.naturalWidth / cols)
      const pieceH = Math.floor(img.naturalHeight / rows)
      const newPieces = []
      let idx = 0

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = pieceW
          tempCanvas.height = pieceH
          const tempCtx = tempCanvas.getContext('2d')
          tempCtx.drawImage(canvas, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH)
          newPieces.push({
            id: idx,
            row: r,
            col: c,
            correctRow: r,
            correctCol: c,
            dataUrl: tempCanvas.toDataURL(),
            placed: false,
            currentRow: -1,
            currentCol: -1,
          })
          idx++
        }
      }

      for (let i = newPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]]
      }

      let curRow = 0
      for (const p of newPieces) {
        if (!p.placed) {
          p.currentRow = curRow
          p.currentCol = 0
          curRow++
        }
      }

      setPieces(newPieces)
    }
    img.src = settings.puzzle_image_url
  }, [imageLoaded, rows, cols, settings?.puzzle_image_url])

  const handleStart = () => {
    setShowIntro(false)
    setTimerStarted(true)
  }

  const handleDragStart = (e, piece) => {
    if (piece.placed || gameOver) return
    setDraggedPiece(piece)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', piece.id.toString())
  }

  const handleDragOver = (e, targetRow, targetCol) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault()
    if (!draggedPiece || gameOver) return

    const pieceIdx = pieces.findIndex(p => p.id === draggedPiece.id)
    if (pieceIdx === -1) return

    const isCorrect = draggedPiece.correctRow === targetRow && draggedPiece.correctCol === targetCol

    if (isCorrect) {
      const newPieces = [...pieces]
      newPieces[pieceIdx] = { ...newPieces[pieceIdx], placed: true, currentRow: targetRow, currentCol: targetCol }
      setPieces(newPieces)
      setSolvedCount(prev => {
        const next = prev + 1
        if (next >= totalPieces) {
          setGameOver(true)
          handleComplete()
        }
        return next
      })
    } else {
      const newPieces = [...pieces]
      newPieces[pieceIdx] = { ...newPieces[pieceIdx], currentRow: targetRow, currentCol: targetCol }
      setPieces(newPieces)
    }
    setDraggedPiece(null)
  }

  const handleTouchStart = (e, piece) => {
    if (piece.placed || gameOver) return
    setDraggedPiece(piece)
  }

  const handleTouchEnd = (e, targetRow, targetCol) => {
    if (!draggedPiece || gameOver) return

    const touch = e.changedTouches[0]
    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!elem) { setDraggedPiece(null); return }

    const dropRow = parseInt(elem.dataset.row)
    const dropCol = parseInt(elem.dataset.col)
    if (isNaN(dropRow) || isNaN(dropCol)) { setDraggedPiece(null); return }

    const pieceIdx = pieces.findIndex(p => p.id === draggedPiece.id)
    if (pieceIdx === -1) { setDraggedPiece(null); return }

    const isCorrect = draggedPiece.correctRow === dropRow && draggedPiece.correctCol === dropCol

    if (isCorrect) {
      const newPieces = [...pieces]
      newPieces[pieceIdx] = { ...newPieces[pieceIdx], placed: true, currentRow: dropRow, currentCol: dropCol }
      setPieces(newPieces)
      setSolvedCount(prev => {
        const next = prev + 1
        if (next >= totalPieces) {
          setGameOver(true)
          handleComplete()
        }
        return next
      })
    } else {
      const newPieces = [...pieces]
      newPieces[pieceIdx] = { ...newPieces[pieceIdx], currentRow: dropRow, currentCol: dropCol }
      setPieces(newPieces)
    }
    setDraggedPiece(null)
  }

  const progress = totalPieces > 0 ? Math.round((solvedCount / totalPieces) * 100) : 0

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : { background: settings?.bg_color || '#f4f4ff' }

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh', ...bgStyle, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 16px', fontFamily:ff }}>
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div style={{
          width:'100%', maxWidth:440,
          padding:'clamp(24px,6vw,36px) clamp(18px,5vw,28px)',
          borderRadius:28,
          background: settings?.bg_image_url ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.93)',
          backdropFilter:'blur(28px)',
          boxShadow: settings?.bg_image_url ? '0 8px 40px rgba(0,0,0,0.28)' : '0 8px 40px rgba(0,0,0,0.12)',
          border: settings?.bg_image_url ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.85)',
          textAlign:'center'
        }}>
          {settings?.game_logo_url && (
            <img src={settings.game_logo_url} alt="Logo" style={{ maxWidth:'100%', maxHeight:60, marginBottom:16, objectFit:'contain' }} />
          )}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)', fontWeight:800, color: settings?.heading_1_color || '#1a1a2e', marginBottom:8, fontFamily:ff }}>
            {settings?.heading_1 || 'Jigsaw Puzzle'}
          </h1>
          {settings?.heading_2 && (
            <p style={{ fontSize:15, fontWeight:600, color: settings?.heading_2_color || '#666', marginBottom:8 }}>{settings.heading_2}</p>
          )}
          {settings?.heading_3 && (
            <p style={{ fontSize:13, color: settings?.heading_3_color || '#888', marginBottom:16 }}>{settings.heading_3}</p>
          )}
          {settings?.puzzle_image_url && (
            <div style={{ width:'100%', maxWidth:200, margin:'0 auto 20px', borderRadius:12, overflow:'hidden', border:`2px solid ${primaryColor}30` }}>
              <img src={settings.puzzle_image_url} alt="Preview" style={{ width:'100%', display:'block' }} />
            </div>
          )}
          <p style={{ fontSize:13, color:'#888', marginBottom:8 }}>
            {rows}×{cols} grid — {totalPieces} pieces to solve
          </p>
          {settings?.show_timer === 1 && settings?.time_limit_seconds > 0 && (
            <p style={{ fontSize:12, color:'#999', marginBottom:16 }}>⏱ Time limit: {Math.floor(settings.time_limit_seconds/60)}m {settings.time_limit_seconds%60}s</p>
          )}
          <button onClick={handleStart} style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
            color:'#fff', border:'none', borderRadius:12, padding:'15px 36px',
            fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:ff,
            boxShadow: `0 6px 20px ${primaryColor}44`, width:'100%', maxWidth:280,
            touchAction:'manipulation'
          }}>
            {settings?.start_button_text || 'Start Puzzle →'}
          </button>
        </div>
      </div>
    )
  }

  const pieceSize = Math.min(
    Math.floor((Math.min(window.innerWidth - 40, 600)) / cols),
    Math.floor((window.innerHeight - 280) / rows),
    120
  )

  return (
    <div style={{ minHeight:'100dvh', ...bgStyle, display:'flex', flexDirection:'column', alignItems:'center', fontFamily:ff, padding:'12px 16px' }}>
      <canvas ref={canvasRef} style={{ display:'none' }} />

      {settings?.game_logo_url && (
        <img src={settings.game_logo_url} alt="Logo" style={{ height:40, marginBottom:8, objectFit:'contain' }} />
      )}

      <h2 style={{ fontSize:18, fontWeight:800, color: settings?.heading_1_color || '#1a1a2e', marginBottom:4, fontFamily:ff, textAlign:'center' }}>
        {settings?.heading_1 || 'Jigsaw Puzzle'}
      </h2>

      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12, flexWrap:'wrap', justifyContent:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderRadius:12, padding:'8px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ position:'relative', width:32, height:32 }}>
            <svg width="32" height="32" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
              <circle cx="16" cy="16" r="12" fill="none" stroke={primaryColor} strokeWidth="3"
                strokeDasharray={`${2*Math.PI*12} ${2*Math.PI*12*(1-progress/100)}`}
                strokeLinecap="round" style={{ transition:'stroke-dasharray 0.8s ease' }} />
            </svg>
            <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:primaryColor }}>
              {progress}%
            </span>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{solvedCount}/{totalPieces} pieces</div>
            {settings?.show_timer === 1 && (
              <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>⏱ {timerDisplay}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:`repeat(${cols}, ${pieceSize}px)`,
        gridTemplateRows:`repeat(${rows}, ${pieceSize}px)`,
        gap:2,
        background:'rgba(255,255,255,0.15)',
        borderRadius:12,
        padding:4,
        boxShadow:'0 8px 32px rgba(0,0,0,0.1)',
        marginBottom:16
      }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const placedPiece = pieces.find(p => p.placed && p.currentRow === r && p.currentCol === c)
            const targetPiece = pieces.find(p => !p.placed && draggedPiece && p.id === draggedPiece.id)

            return (
              <div
                key={`${r}-${c}`}
                data-row={r}
                data-col={c}
                onDragOver={(e) => handleDragOver(e, r, c)}
                onDrop={(e) => handleDrop(e, r, c)}
                onTouchEnd={(e) => handleTouchEnd(e, r, c)}
                style={{
                  width: pieceSize,
                  height: pieceSize,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: placedPiece ? 'transparent' : 'rgba(255,255,255,0.3)',
                  border: placedPiece ? 'none' : `2px dashed ${primaryColor}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {placedPiece ? (
                  <img
                    src={placedPiece.dataUrl}
                    alt=""
                    style={{ width:'100%', height:'100%', objectFit:'fill', display:'block' }}
                  />
                ) : (
                  <span style={{ fontSize:11, color:'#aaa', fontWeight:600 }}>{r*cols+c+1}</span>
                )}
              </div>
            )
          })
        )}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', maxWidth: pieceSize * Math.min(cols, 8) + 40, marginBottom:20 }}>
        {pieces.filter(p => !p.placed).map(piece => (
          <div
            key={piece.id}
            draggable
            onDragStart={(e) => handleDragStart(e, piece)}
            onTouchStart={(e) => handleTouchStart(e, piece)}
            style={{
              width: pieceSize * 0.6,
              height: pieceSize * 0.6,
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'grab',
              border: `2px solid ${primaryColor}50`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              opacity: draggedPiece?.id === piece.id ? 0.5 : 1,
            }}
          >
            <img
              src={piece.dataUrl}
              alt=""
              style={{ width:'100%', height:'100%', objectFit:'fill', display:'block' }}
            />
          </div>
        ))}
      </div>

      {gameOver && (
        <div style={{
          position:'fixed', inset:0, zIndex:2000,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
        }}>
          <div style={{
            background:'#fff', borderRadius:28, padding:'clamp(28px,7vw,44px) clamp(20px,6vw,36px)',
            maxWidth:400, width:'100%', textAlign:'center',
            boxShadow:'0 24px 80px rgba(0,0,0,0.35)',
          }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:8 }}>
              {solvedCount >= totalPieces ? 'Puzzle Complete!' : 'Time\'s Up!'}
            </h2>
            <p style={{ color:'#666', fontSize:14, marginBottom:12 }}>
              You placed {solvedCount} of {totalPieces} pieces correctly
            </p>
            <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>
              Completed in {timerDisplay}
            </p>
            <button onClick={handleComplete} style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
              color:'#fff', border:'none', borderRadius:50, padding:'14px 36px',
              fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:ff,
              boxShadow: `0 8px 28px ${primaryColor}55`, width:'100%'
            }}>
              {settings?.continue_button_text || 'Continue Now →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
