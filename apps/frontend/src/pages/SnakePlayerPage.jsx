import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

export default function SnakePlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])

  const primaryColor = settings?.primary_color || '#22c55e'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const bgColor = settings?.bg_color || '#0f172a'
  const boardW = settings?.board_width || 20
  const boardH = settings?.board_height || 20
  const baseSpeed = settings?.speed || 5
  const snakeColor = settings?.snake_color || '#22c55e'
  const foodColor = settings?.food_color || '#ef4444'
  const wallMode = settings?.wall_mode || 'wall'

  const [showIntro, setShowIntro] = useState(true)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const dirRef = useRef({ x: 1, y: 0 })
  const snakeRef = useRef([{ x: 10, y: 10 }])
  const foodRef = useRef({ x: 5, y: 5 })
  const scoreRef = useRef(0)
  const gameLoopRef = useRef(null)
  const completedRef = useRef(false)

  const spawnFood = useCallback((currentSnake) => {
    let pos
    do {
      pos = { x: Math.floor(Math.random() * boardW), y: Math.floor(Math.random() * boardH) }
    } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y))
    foodRef.current = pos
    setFood(pos)
  }, [boardW, boardH])

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

  const handleStart = () => {
    setShowIntro(false); setGameActive(true); setGameOver(false); completedRef.current = false
    const initialSnake = [{ x: Math.floor(boardW / 2), y: Math.floor(boardH / 2) }]
    snakeRef.current = initialSnake; setSnake(initialSnake)
    dirRef.current = { x: 1, y: 0 }; setDirection({ x: 1, y: 0 })
    scoreRef.current = 0; setScore(0)
    spawnFood(initialSnake)
  }

  useEffect(() => {
    if (!gameActive || gameOver) return
    const tick = Math.max(50, 300 - baseSpeed * 25)
    gameLoopRef.current = setInterval(() => {
      const dir = dirRef.current
      const curr = snakeRef.current
      const head = curr[0]
      let nx = head.x + dir.x, ny = head.y + dir.y

      if (wallMode === 'wrap') {
        nx = (nx + boardW) % boardW; ny = (ny + boardH) % boardH
      } else {
        if (nx < 0 || nx >= boardW || ny < 0 || ny >= boardH) {
          setGameOver(true); playSound(resolveSound(settings?.sound_gameover_id)); return
        }
      }

      const newHead = { x: nx, y: ny }
      if (curr.some(s => s.x === nx && s.y === ny)) {
        setGameOver(true); playSound(resolveSound(settings?.sound_gameover_id)); return
      }

      const newSnake = [newHead, ...curr]
      if (nx === foodRef.current.x && ny === foodRef.current.y) {
        scoreRef.current += 10; setScore(scoreRef.current)
        playSound(resolveSound(settings?.sound_eat_id))
        spawnFood(newSnake)
      } else {
        newSnake.pop()
      }

      snakeRef.current = newSnake; setSnake(newSnake)
    }, tick)

    return () => clearInterval(gameLoopRef.current)
  }, [gameActive, gameOver, baseSpeed, boardW, boardH, wallMode, spawnFood, settings, resolveSound])

  useEffect(() => {
    if (score > highScore) setHighScore(score)
  }, [score])

  useEffect(() => {
    if (gameOver && !completedRef.current) {
      setTimeout(() => handleComplete(), 1500)
    }
  }, [gameOver])

  const handleKey = useCallback((e) => {
    const dir = dirRef.current
    const map = { ArrowUp: { x:0, y:-1 }, ArrowDown: { x:0, y:1 }, ArrowLeft: { x:-1, y:0 }, ArrowRight: { x:1, y:0 },
      w: { x:0, y:-1 }, s: { x:0, y:1 }, a: { x:-1, y:0 }, d: { x:1, y:0 } }
    const nd = map[e.key]
    if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) {
      dirRef.current = nd; setDirection(nd)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const handleSwipe = useCallback((startX, startY, endX, endY) => {
    const dx = endX - startX, dy = endY - startY
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
    const dir = dirRef.current
    let nd
    if (Math.abs(dx) > Math.abs(dy)) {
      nd = dx > 0 ? { x:1, y:0 } : { x:-1, y:0 }
    } else {
      nd = dy > 0 ? { x:0, y:1 } : { x:0, y:-1 }
    }
    if (!(nd.x === -dir.x && nd.y === -dir.y)) {
      dirRef.current = nd; setDirection(nd)
    }
  }, [])

  const touchStart = useRef(null)
  const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return
    handleSwipe(touchStart.current.x, touchStart.current.y, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    touchStart.current = null
  }

  const cellSize = Math.min(28, Math.floor((Math.min(window.innerWidth - 40, 560)) / Math.max(boardW, boardH)))

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bgColor }

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
        <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Snake'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize:13,color:settings?.heading_3_color||'#888',marginBottom:16 }}>{settings.heading_3}</p>}
          <div style={{ background:'#f0fdf4',borderRadius:12,padding:16,marginBottom:20 }}>
            <p style={{ fontSize:13,color:'#166534',lineHeight:1.6 }}>🐍 Use arrow keys or WASD to move. Eat food to grow. Don't hit walls or yourself!</p>
          </div>
          <button onClick={handleStart} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 6px 20px ${primaryColor}44`,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Playing →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} tabIndex={0}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Snake'}</h2>
      <div style={{ display:'flex',gap:16,marginBottom:12 }}>
        <span style={{ color:'#fff',fontSize:14,fontWeight:700 }}>Score: {score}</span>
        <span style={{ color:'#fff',fontSize:14,fontWeight:700,opacity:.6 }}>Best: {highScore}</span>
      </div>
      <div style={{ display:'inline-grid',gridTemplateColumns:`repeat(${boardW},${cellSize}px)`,gap:1,background:'rgba(255,255,255,0.1)',borderRadius:8,padding:2 }}>
        {Array.from({ length: boardH }, (_, y) =>
          Array.from({ length: boardW }, (_, x) => {
            const isSnake = snake.some(s => s.x === x && s.y === y)
            const isHead = snake[0]?.x === x && snake[0]?.y === y
            const isFood = food.x === x && food.y === y
            return (
              <div key={`${x}-${y}`} style={{ width:cellSize,height:cellSize,borderRadius:3,
                background: isHead ? snakeColor : isSnake ? `${snakeColor}cc` : isFood ? foodColor : 'rgba(255,255,255,0.03)',
                border: isFood ? '2px solid #fff' : 'none',
                boxShadow: isFood ? '0 0 8px rgba(239,68,68,0.5)' : isHead ? `0 0 6px ${snakeColor}66` : 'none',
                transition: 'background .05s',
              }} />
            )
          })
        )}
      </div>
      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>💀</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>Game Over!</h2>
            <p style={{ color:'#666',fontSize:16,marginBottom:8 }}>Score: <strong>{score}</strong></p>
            <p style={{ color:'#999',fontSize:13,marginBottom:20 }}>Best: {highScore}</p>
            <button onClick={handleComplete} style={{ background:primaryColor,color:'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>
              {settings?.continue_button_text||'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
