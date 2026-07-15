import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const SHAPES = {
  I: { blocks: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f0f0' },
  O: { blocks: [[1,1],[1,1]], color: '#f0f000' },
  T: { blocks: [[0,1,0],[1,1,1],[0,0,0]], color: '#a000f0' },
  S: { blocks: [[0,1,1],[1,1,0],[0,0,0]], color: '#00f000' },
  Z: { blocks: [[1,1,0],[0,1,1],[0,0,0]], color: '#f00000' },
  J: { blocks: [[1,0,0],[1,1,1],[0,0,0]], color: '#0000f0' },
  L: { blocks: [[0,0,1],[1,1,1],[0,0,0]], color: '#f0a000' },
}
const PIECE_NAMES = ['I','O','T','S','Z','J','L']

function rotateMatrix(m) {
  const n = m.length
  const r = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) r[j][n - 1 - i] = m[i][j]
  return r
}

export default function TetrisPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData || {}
  const soundMapRef = useRef(soundMap || {})
  useEffect(() => { soundMapRef.current = soundMap || {} }, [soundMap])

  const resolveSound = useCallback((id) => {
    if (!id) return null
    return soundMapRef.current[id] || null
  }, [])

  const cols = Number(settings?.grid_width) || 10
  const rows = Number(settings?.grid_height) || 20
  const blockColors = (() => { try { return JSON.parse(settings?.block_colors || '{}') } catch { return {} } })()

  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(Number(settings?.starting_level) || 1)
  const [grid, setGrid] = useState(null)
  const [currentPiece, setCurrentPiece] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [gameOver, setGameOver] = useState(false)

  const gridRef = useRef(null)
  const pieceRef = useRef(null)
  const nextRef = useRef(null)
  const scoreRef = useRef(0)
  const linesRef = useRef(0)
  const levelRef = useRef(1)
  const dropTimerRef = useRef(null)
  const completedRef = useRef(false)
  const canvasRef = useRef(null)
  const nextCanvasRef = useRef(null)
  const animationRef = useRef(null)

  const levelSpeed = Math.max(50, 800 - (levelRef.current - 1) * (Number(settings?.level_speed_mult) || 0.85) * 100)

  const createEmptyGrid = () => Array.from({ length: rows }, () => Array(cols).fill(0))

  const randomPiece = () => {
    const name = PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)]
    const shape = SHAPES[name]
    return {
      name,
      blocks: shape.blocks.map(r => [...r]),
      color: blockColors[name] || shape.color,
      x: Math.floor((cols - shape.blocks[0].length) / 2),
      y: 0,
    }
  }

  const isValid = (piece, gridData, offsetX = 0, offsetY = 0) => {
    for (let r = 0; r < piece.blocks.length; r++) {
      for (let c = 0; c < piece.blocks[r].length; c++) {
        if (piece.blocks[r][c]) {
          const nx = piece.x + c + offsetX
          const ny = piece.y + r + offsetY
          if (nx < 0 || nx >= cols || ny >= rows) return false
          if (ny >= 0 && gridData[ny][nx]) return false
        }
      }
    }
    return true
  }

  const lockPiece = (piece, gridData) => {
    const g = gridData.map(r => [...r])
    for (let r = 0; r < piece.blocks.length; r++) {
      for (let c = 0; c < piece.blocks[r].length; c++) {
        if (piece.blocks[r][c]) {
          const ny = piece.y + r
          const nx = piece.x + c
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) g[ny][nx] = piece.color
        }
      }
    }
    return g
  }

  const clearLines = (gridData) => {
    let cleared = 0
    const g = gridData.filter(row => {
      const full = row.every(c => c !== 0)
      if (full) cleared++
      return !full
    })
    while (g.length < rows) g.unshift(Array(cols).fill(0))
    return { grid: g, cleared }
  }

  const spawnNext = () => {
    const piece = nextRef.current || randomPiece()
    const next = randomPiece()
    nextRef.current = next
    if (!isValid(piece, gridRef.current)) {
      setGameOver(true)
      return false
    }
    pieceRef.current = piece
    setCurrentPiece(piece)
    setNextPiece(next)
    return true
  }

  const dropPiece = () => {
    const piece = pieceRef.current
    if (!piece) return
    let dist = 0
    while (isValid(piece, gridRef.current, 0, dist + 1)) dist++
    piece.y += dist
    const g = lockPiece(piece, gridRef.current)
    const { grid: clearedGrid, cleared } = clearLines(g)
    gridRef.current = clearedGrid
    linesRef.current += cleared
    scoreRef.current += cleared * 100 * levelRef.current
    if (cleared > 0) {
      const snd = resolveSound(settings?.sound_clear_id)
      if (snd) playSound(snd)
    }
    const newLevel = Math.floor(linesRef.current / 10) + Number(settings?.starting_level || 1)
    levelRef.current = newLevel
    setScore(scoreRef.current)
    setLines(linesRef.current)
    setLevel(newLevel)
    setGrid([...clearedGrid.map(r => [...r])])
    spawnNext()
  }

  const moveLeft = () => {
    const piece = pieceRef.current
    if (piece && isValid(piece, gridRef.current, -1, 0)) {
      piece.x--
      setCurrentPiece({ ...piece })
    }
  }

  const moveRight = () => {
    const piece = pieceRef.current
    if (piece && isValid(piece, gridRef.current, 1, 0)) {
      piece.x++
      setCurrentPiece({ ...piece })
    }
  }

  const moveDown = () => {
    const piece = pieceRef.current
    if (!piece) return
    if (isValid(piece, gridRef.current, 0, 1)) {
      piece.y++
      setCurrentPiece({ ...piece })
    } else {
      dropPiece()
    }
  }

  const rotate = () => {
    const piece = pieceRef.current
    if (!piece || piece.name === 'O') return
    const rotated = rotateMatrix(piece.blocks)
    if (isValid({ ...piece, blocks: rotated }, gridRef.current)) {
      piece.blocks = rotated
      setCurrentPiece({ ...piece })
      const snd = resolveSound(settings?.sound_rotate_id)
      if (snd) playSound(snd)
    }
  }

  const drawCanvas = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const cellW = c.width / cols
    const cellH = c.height / rows
    ctx.clearRect(0, 0, c.width, c.height)

    const g = gridRef.current || createEmptyGrid()
    for (let r = 0; r < rows; r++) {
      for (let c2 = 0; c2 < cols; c2++) {
        if (g[r][c2]) {
          ctx.fillStyle = g[r][c2]
          ctx.fillRect(c2 * cellW, r * cellH, cellW - 1, cellH - 1)
        } else {
          ctx.fillStyle = '#1a1a2e'
          ctx.fillRect(c2 * cellW, r * cellH, cellW - 1, cellH - 1)
        }
      }
    }

    const piece = pieceRef.current
    if (piece) {
      for (let r = 0; r < piece.blocks.length; r++) {
        for (let c2 = 0; c2 < piece.blocks[r].length; c2++) {
          if (piece.blocks[r][c2]) {
            const nx = (piece.x + c2) * cellW
            const ny = (piece.y + r) * cellH
            ctx.fillStyle = piece.color
            ctx.fillRect(nx, ny, cellW - 1, cellH - 1)
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'
            ctx.strokeRect(nx, ny, cellW - 1, cellH - 1)
          }
        }
      }
    }

    const nc = nextCanvasRef.current
    if (nc && nextRef.current) {
      const nctx = nc.getContext('2d')
      nctx.clearRect(0, 0, nc.width, nc.height)
      const next = nextRef.current
      const ncw = 20
      for (let r = 0; r < next.blocks.length; r++) {
        for (let c2 = 0; c2 < next.blocks[r].length; c2++) {
          if (next.blocks[r][c2]) {
            nctx.fillStyle = blockColors[next.name] || next.color
            nctx.fillRect(c2 * ncw, r * ncw, ncw - 1, ncw - 1)
          }
        }
      }
    }
  }, [cols, rows, blockColors])

  const gameLoop = useCallback(() => {
    if (gameOver) return
    drawCanvas()
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [drawCanvas, gameOver])

  const startGame = () => {
    const g = createEmptyGrid()
    gridRef.current = g
    scoreRef.current = 0
    linesRef.current = 0
    levelRef.current = Number(settings?.starting_level) || 1
    completedRef.current = false
    setGrid(g)
    setScore(0)
    setLines(0)
    setLevel(levelRef.current)
    setGameOver(false)
    nextRef.current = randomPiece()
    if (!spawnNext()) return
    setPhase('playing')
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(gameLoop)

    clearInterval(dropTimerRef.current)
    dropTimerRef.current = setInterval(() => {
      moveDown()
    }, levelSpeed)
  }

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        await fetch('/api/play/session/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score: scoreRef.current, player_data: {} })
        })
      }
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete])

  useEffect(() => {
    if (phase === 'playing') {
      const handleKey = (e) => {
        if (gameOver) return
        if (e.key === 'ArrowLeft') moveLeft()
        else if (e.key === 'ArrowRight') moveRight()
        else if (e.key === 'ArrowDown') moveDown()
        else if (e.key === 'ArrowUp') rotate()
        else if (e.key === ' ') { e.preventDefault(); dropPiece() }
      }
      window.addEventListener('keydown', handleKey)
      return () => { window.removeEventListener('keydown', handleKey) }
    }
  }, [phase, gameOver])

  useEffect(() => {
    if (gameOver) {
      clearInterval(dropTimerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (settings) {
        const snd = resolveSound(settings.sound_gameover_id)
        if (snd) playSound(snd)
      }
      handleComplete()
    }
  }, [gameOver, handleComplete, settings, resolveSound])

  useEffect(() => {
    return () => {
      clearInterval(dropTimerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  if (phase === 'intro') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16, background:settings?.bg_color || '#1a1a2e', color:'#fff', padding:20 }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth: 160, maxHeight: 80 }} />}
        {settings?.heading_1 && <h1 style={{ fontSize: 28, fontWeight: 800, color: settings.heading_1_color || '#fff', margin:0 }}>{settings.heading_1}</h1>}
        {settings?.heading_2 && <p style={{ fontSize: 16, color: settings.heading_2_color || '#aaa', margin:0 }}>{settings.heading_2}</p>}
        {settings?.heading_3 && <p style={{ fontSize: 14, color: settings.heading_3_color || '#888', margin:0 }}>{settings.heading_3}</p>}
        {settings?.description_text && <p style={{ fontSize: 13, color: settings.description_color || '#aaa', maxWidth: 400, textAlign:'center' }}>{settings.description_text}</p>}
        {settings?.intro_text && <p style={{ fontSize: 14, color: settings.intro_text_color || '#fff' }}>{settings.intro_text}</p>}
        <button
          onClick={startGame}
          style={{ padding:'10px 32px', fontSize:16, fontWeight:700, border:'none', borderRadius:8, cursor:'pointer', background:settings?.primary_color || '#00f0f0', color: '#fff' }}
        >{settings?.start_button_text || 'Start Game'}</button>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:settings?.bg_color || '#1a1a2e', minHeight:'60vh', padding:'20px', position:'relative' }}>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        <div>
          <canvas ref={canvasRef} width={cols * 24} height={rows * 24} style={{ border:'2px solid #333', borderRadius:4, background:'#1a1a2e' }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16, color:'#fff' }}>
          <div>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Score</div>
            <div style={{ fontSize:22, fontWeight:700 }}>{score}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Lines</div>
            <div style={{ fontSize:22, fontWeight:700 }}>{lines}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Level</div>
            <div style={{ fontSize:22, fontWeight:700 }}>{level}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Next</div>
            <canvas ref={nextCanvasRef} width={80} height={80} style={{ background:'#1a1a2e', borderRadius:4 }} />
          </div>
        </div>
      </div>

      <div style={{ color:'#666', fontSize:11, textAlign:'center' }}>Arrow keys: move • Up: rotate • Space: hard drop</div>

      {gameOver && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
          <div style={{ background:'#fff', padding:'24px 32px', borderRadius:12, textAlign:'center' }}>
            <h2 style={{ margin:'0 0 8px', fontSize:22, color:'#1a1a2e' }}>Game Over</h2>
            <p style={{ color:'#666', margin:'0 0 16px' }}>Score: {score} • Lines: {lines} • Level: {level}</p>
            <button onClick={() => { setGameOver(false); startGame() }} style={{ padding:'8px 24px', fontSize:14, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer', background:settings?.primary_color || '#00f0f0', color:'#fff', marginRight:8 }}>Play Again</button>
            <button onClick={() => setPhase('intro')} style={{ padding:'8px 24px', fontSize:14, fontWeight:600, border:'1px solid #ddd', borderRadius:6, cursor:'pointer', background:'#fff', color:'#666' }}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
