import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const BUBBLE_COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316']

function getNeighbors(row, col, maxRow, maxCol) {
  const dirs = row % 2 === 0
    ? [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]]
    : [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]
  const result = []
  for (const [dr, dc] of dirs) {
    const nr = row + dr
    const nc = col + dc
    if (nr >= 0 && nr < maxRow && nc >= 0 && nc < maxCol) result.push([nr, nc])
  }
  return result
}

function hexPos(row, col, radius, gap, padding, cols) {
  const cellW = radius * 2 + gap
  const cellH = (radius * 2 + gap) * 0.866
  const x = padding + col * cellW + (row % 2) * (cellW / 2)
  const y = padding + row * cellH
  return { x, y }
}

function snapToGrid(cx, cy, radius, gap, padding, rows, cols) {
  const cellW = radius * 2 + gap
  const cellH = (radius * 2 + gap) * 0.866
  let bestR = -1, bestC = -1, bestDist = Infinity
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const { x, y } = hexPos(r, c, radius, gap, padding, cols)
      const dist = Math.hypot(cx - x, cy - y)
      if (dist < bestDist) { bestDist = dist; bestR = r; bestC = c }
    }
  }
  return { row: bestR, col: bestC }
}

function findConnected(grid, row, col, color) {
  const visited = new Set()
  const stack = [[row, col]]
  const result = []
  while (stack.length) {
    const [r, c] = stack.pop()
    const key = r + ',' + c
    if (visited.has(key)) continue
    visited.add(key)
    if (grid[r] && grid[r][c] === color) {
      result.push([r, c])
      for (const [nr, nc] of getNeighbors(r, c, grid.length, grid[0].length)) {
        if (!visited.has(nr + ',' + nc)) stack.push([nr, nc])
      }
    }
  }
  return result
}

function findFloating(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const connected = new Set()
  const stack = []
  for (let c = 0; c < cols; c++) {
    if (grid[0][c] !== null) { stack.push([0, c]); connected.add('0,' + c) }
  }
  while (stack.length) {
    const [r, c] = stack.pop()
    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      const key = nr + ',' + nc
      if (!connected.has(key) && grid[nr][nc] !== null) {
        connected.add(key)
        stack.push([nr, nc])
      }
    }
  }
  const floating = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null && !connected.has(r + ',' + c)) floating.push([r, c])
    }
  }
  return floating
}

export default function BubbleShooterPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData || {}
  const soundMapRef = useRef(soundMap || {})
  useEffect(() => { soundMapRef.current = soundMap || {} }, [soundMap])

  const resolveSound = useCallback((id) => {
    if (!id) return null
    return soundMapRef.current[id] || null
  }, [])

  const gridRows = Number(settings?.grid_rows) || 8
  const gridCols = Number(settings?.grid_cols) || 8
  const numColors = Math.min(Math.max(Number(settings?.num_colors) || 5, 3), 8)
  const difficulty = settings?.difficulty || 'medium'

  const CANVAS_W = 320
  const CANVAS_H = 480
  const BUBBLE_RADIUS = 12
  const GAP = 2
  const CELL_W = BUBBLE_RADIUS * 2 + GAP
  const CELL_H = (BUBBLE_RADIUS * 2 + GAP) * 0.866
  const PADDING_X = (CANVAS_W - (gridCols * CELL_W + CELL_W / 2)) / 2
  const PADDING_Y = 20
  const SHOOT_Y = CANVAS_H - 40
  const SHOOT_SPEED = 8

  const initialRows = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4

  const [phase, setPhase] = useState('intro')
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const canvasRef = useRef(null)
  const bgImageRef = useRef(null)
  const animationRef = useRef(null)
  const completedRef = useRef(false)
  const scoreRef = useRef(0)
  const gridRef = useRef([])
  const currentColorRef = useRef(0)
  const nextColorRef = useRef(0)
  const flyingRef = useRef(null)
  const aimAngleRef = useRef(-Math.PI / 2)
  const mouseRef = useRef({ x: CANVAS_W / 2, y: SHOOT_Y - 100 })
  const gameOverRef = useRef(false)
  const awaitingShootRef = useRef(true)

  const initGrid = useCallback(() => {
    const g = []
    for (let r = 0; r < gridRows; r++) {
      const row = []
      for (let c = 0; c < gridCols; c++) {
        row.push(r < initialRows ? Math.floor(Math.random() * numColors) : null)
      }
      g.push(row)
    }
    gridRef.current = g
    currentColorRef.current = Math.floor(Math.random() * numColors)
    nextColorRef.current = Math.floor(Math.random() * numColors)
    flyingRef.current = null
    gameOverRef.current = false
    awaitingShootRef.current = true
    scoreRef.current = 0
    aimAngleRef.current = -Math.PI / 2
    mouseRef.current = { x: CANVAS_W / 2, y: SHOOT_Y - 100 }
  }, [gridRows, gridCols, numColors, initialRows])

  const drawGrid = useCallback((ctx) => {
    const grid = gridRef.current
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === null) continue
        const { x, y } = hexPos(r, c, BUBBLE_RADIUS, GAP, PADDING_X, gridCols)
        const colorIdx = grid[r][c]
        ctx.beginPath()
        ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length]
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fill()
      }
    }
  }, [gridCols])

  const drawAimLine = useCallback((ctx) => {
    const angle = aimAngleRef.current
    const sx = CANVAS_W / 2
    const sy = SHOOT_Y
    const len = 300
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.arc(sx + Math.cos(angle) * 20, sy + Math.sin(angle) * 20, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()
  }, [])

  const drawCurrentBubble = useCallback((ctx) => {
    if (flyingRef.current) {
      const fb = flyingRef.current
      ctx.beginPath()
      ctx.arc(fb.x, fb.y, BUBBLE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = BUBBLE_COLORS[currentColorRef.current % BUBBLE_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(fb.x - 3, fb.y - 3, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fill()
    } else if (awaitingShootRef.current) {
      const sx = CANVAS_W / 2
      const sy = SHOOT_Y
      ctx.beginPath()
      ctx.arc(sx, sy, BUBBLE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = BUBBLE_COLORS[currentColorRef.current % BUBBLE_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(sx - 3, sy - 3, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fill()
    }
  }, [])

  const drawNextBubble = useCallback((ctx) => {
    const x = CANVAS_W - 30
    const y = SHOOT_Y
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = BUBBLE_COLORS[nextColorRef.current % BUBBLE_COLORS.length]
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('next', x, y + 18)
  }, [])

  const drawGame = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    ctx.fillStyle = settings?.bg_color || '#0f172a'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    if (settings?.bg_image_url) {
      if (!bgImageRef.current || bgImageRef.current.src !== settings.bg_image_url) {
        const img = new Image()
        img.onload = () => {
          if (canvasRef.current) {
            const cx = canvasRef.current.getContext('2d')
            cx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
          }
        }
        img.src = settings.bg_image_url
        bgImageRef.current = img
      } else if (bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, CANVAS_W, CANVAS_H)
      }
    }

    drawGrid(ctx)
    drawAimLine(ctx)
    drawCurrentBubble(ctx)
    drawNextBubble(ctx)

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Score: ' + scoreRef.current, 10, 20)
  }, [drawGrid, drawAimLine, drawCurrentBubble, drawNextBubble, settings])

  const checkAndPop = useCallback((row, col) => {
    const grid = gridRef.current
    const color = grid[row][col]
    if (color === null) return 0

    const connected = findConnected(grid, row, col, color)
    if (connected.length >= 3) {
      for (const [r, c] of connected) grid[r][c] = null
      let popped = connected.length

      const floating = findFloating(grid)
      for (const [r, c] of floating) { grid[r][c] = null; popped++ }

      const sndPop = resolveSound(settings?.sound_pop_id)
      if (sndPop) playSound(sndPop)

      return popped
    }
    return 0
  }, [resolveSound, settings])

  const shootBubble = useCallback((angle) => {
    if (!awaitingShootRef.current || flyingRef.current || gameOverRef.current) return

    const sx = CANVAS_W / 2
    const sy = SHOOT_Y
    const vx = Math.cos(angle) * SHOOT_SPEED
    const vy = Math.sin(angle) * SHOOT_SPEED
    flyingRef.current = { x: sx, y: sy, vx, vy }

    const snd = resolveSound(settings?.sound_shoot_id)
    if (snd) playSound(snd)
  }, [resolveSound, settings])

  const updateFlying = useCallback(() => {
    const fb = flyingRef.current
    if (!fb) return

    fb.x += fb.vx
    fb.y += fb.vy

    if (fb.x - BUBBLE_RADIUS < 0) { fb.x = BUBBLE_RADIUS; fb.vx = -fb.vx }
    if (fb.x + BUBBLE_RADIUS > CANVAS_W) { fb.x = CANVAS_W - BUBBLE_RADIUS; fb.vx = -fb.vx }
    if (fb.y - BUBBLE_RADIUS < PADDING_Y) {
      fb.y = PADDING_Y + BUBBLE_RADIUS
      placeBubble(fb.x, fb.y)
      return
    }

    const grid = gridRef.current
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === null) continue
        const { x, y } = hexPos(r, c, BUBBLE_RADIUS, GAP, PADDING_X, gridCols)
        if (Math.hypot(fb.x - x, fb.y - y) < BUBBLE_RADIUS * 2) {
          placeBubble(fb.x, fb.y)
          return
        }
      }
    }

    if (fb.y + BUBBLE_RADIUS > CANVAS_H) {
      gameOverRef.current = true
      flyingRef.current = null
      setGameOver(true)
    }
  }, [gridCols])

  const placeBubble = useCallback((cx, cy) => {
    const fb = flyingRef.current
    if (!fb) return
    flyingRef.current = null

    const { row, col } = snapToGrid(cx, cy, BUBBLE_RADIUS, GAP, PADDING_X, gridRows, gridCols)
    if (row < 0 || col < 0) return

    const grid = gridRef.current
    if (grid[row][col] !== null) return

    grid[row][col] = currentColorRef.current

    const popped = checkAndPop(row, col)
    scoreRef.current += popped
    setScore(scoreRef.current)

    if (popped > 0) {
      const lowest = findLowestFilledRow(grid)
      if (lowest >= gridRows - 1) {
        gameOverRef.current = true
        setGameOver(true)
        return
      }
    }

    currentColorRef.current = nextColorRef.current
    nextColorRef.current = Math.floor(Math.random() * numColors)
    awaitingShootRef.current = true
  }, [gridRows, gridCols, numColors, checkAndPop])

  const findLowestFilledRow = (grid) => {
    for (let r = grid.length - 1; r >= 0; r--) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] !== null) return r
      }
    }
    return -1
  }

  const startGame = () => {
    initGrid()
    scoreRef.current = 0
    completedRef.current = false
    setScore(0)
    setGameOver(false)
    setPhase('playing')

    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    let lastTime = 0
    const loop = (time) => {
      if (!lastTime) lastTime = time
      lastTime = time
      if (!gameOverRef.current && !flyingRef.current && awaitingShootRef.current) {
        const angle = aimAngleRef.current
        const clamped = Math.max(-Math.PI + 0.1, Math.min(-0.1, angle))
        aimAngleRef.current = clamped
      }
      if (flyingRef.current) updateFlying()
      drawGame()
      animationRef.current = requestAnimationFrame(loop)
    }
    animationRef.current = requestAnimationFrame(loop)
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
      const handleMouse = (e) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const sx = CANVAS_W / 2
        const sy = SHOOT_Y
        const angle = Math.atan2(my - sy, mx - sx)
        const clamped = Math.max(-Math.PI + 0.1, Math.min(-0.1, angle))
        aimAngleRef.current = clamped
        mouseRef.current = { x: mx, y: my }
      }

      const handleClick = (e) => {
        if (gameOverRef.current) return
        shootBubble(aimAngleRef.current)
        awaitingShootRef.current = false
      }

      const handleTouch = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const mx = touch.clientX - rect.left
        const my = touch.clientY - rect.top
        const sx = CANVAS_W / 2
        const sy = SHOOT_Y
        const angle = Math.atan2(my - sy, mx - sx)
        const clamped = Math.max(-Math.PI + 0.1, Math.min(-0.1, angle))
        aimAngleRef.current = clamped
        mouseRef.current = { x: mx, y: my }
      }

      const handleTouchEnd = (e) => {
        e.preventDefault()
        if (gameOverRef.current) return
        shootBubble(aimAngleRef.current)
        awaitingShootRef.current = false
      }

      window.addEventListener('mousemove', handleMouse)
      window.addEventListener('click', handleClick)
      window.addEventListener('touchmove', handleTouch, { passive: false })
      window.addEventListener('touchend', handleTouchEnd, { passive: false })
      return () => {
        window.removeEventListener('mousemove', handleMouse)
        window.removeEventListener('click', handleClick)
        window.removeEventListener('touchmove', handleTouch)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [phase, shootBubble])

  useEffect(() => {
    if (gameOver) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      const snd = resolveSound(settings?.sound_gameover_id)
      if (snd) playSound(snd)
      handleComplete()
    }
  }, [gameOver, handleComplete, settings, resolveSound])

  useEffect(() => {
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [])

  useEffect(() => { drawGame() }, [drawGame])

  if (phase === 'intro') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16, background:settings?.bg_color || '#0f172a', color:'#fff', padding:20 }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth: 160, maxHeight: 80 }} />}
        {settings?.heading_1 && <h1 style={{ fontSize: 28, fontWeight: 800, color: settings.heading_1_color || '#fff', margin:0 }}>{settings.heading_1}</h1>}
        {settings?.heading_2 && <p style={{ fontSize: 16, color: settings.heading_2_color || '#aaa', margin:0 }}>{settings.heading_2}</p>}
        {settings?.heading_3 && <p style={{ fontSize: 14, color: settings.heading_3_color || '#888', margin:0 }}>{settings.heading_3}</p>}
        {settings?.description_text && <p style={{ fontSize: 13, color: settings.description_color || '#aaa', maxWidth: 400, textAlign:'center' }}>{settings.description_text}</p>}
        {settings?.intro_text && <p style={{ fontSize: 14, color: settings.intro_text_color || '#fff' }}>{settings.intro_text}</p>}
        <button
          onClick={startGame}
          style={{ padding:'10px 32px', fontSize:16, fontWeight:700, border:'none', borderRadius:8, cursor:'pointer', background:settings?.primary_color || '#6366f1', color:'#fff' }}
        >{settings?.start_button_text || 'Start Game'}</button>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:settings?.bg_color || '#0f172a', minHeight:'60vh', padding:'20px', position:'relative' }}>
      <div style={{ color:'#fff', fontSize:14, fontWeight:700 }}>Score: {score}</div>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ border:'2px solid #333', borderRadius:8 }} />
      <div style={{ color:'#666', fontSize:11 }}>Move mouse to aim • Click to shoot</div>

      {gameOver && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
          <div style={{ background:'#fff', padding:'24px 32px', borderRadius:12, textAlign:'center' }}>
            <h2 style={{ margin:'0 0 8px', fontSize:22, color:'#1a1a2e' }}>Game Over</h2>
            <p style={{ color:'#666', margin:'0 0 16px' }}>Bubbles Popped: {score}</p>
            <button onClick={() => { setGameOver(false); startGame() }} style={{ padding:'8px 24px', fontSize:14, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer', background:settings?.primary_color || '#6366f1', color:'#fff', marginRight:8 }}>Play Again</button>
            <button onClick={() => setPhase('intro')} style={{ padding:'8px 24px', fontSize:14, fontWeight:600, border:'1px solid #ddd', borderRadius:6, cursor:'pointer', background:'#fff', color:'#666' }}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
