import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const GAME_W = 480
const GAME_H = 400
const PADDLE_W = 80
const PADDLE_H = 12
const BALL_R = 6
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_GAP = 4
const BRICK_W = (GAME_W - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS
const BRICK_H = 28

export default function BreakoutGame() {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loadedImages, setLoadedImages] = useState([])
  const [gameState, setGameState] = useState('idle') // idle, playing, won, lost
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const gameRef = useRef(null)
  const animRef = useRef(null)

  // Fetch brick images
  useEffect(() => {
    api.get('/brick-images?active=true').then(res => {
      setImages(res.data.images || [])
    }).catch(() => {})
  }, [])

  // Load images into Image objects
  useEffect(() => {
    if (images.length === 0) return
    const loaded = []
    let pending = images.length
    images.forEach((img, i) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => { loaded[i] = image; if (--pending === 0) setLoadedImages([...loaded]) }
      image.onerror = () => { loaded[i] = null; if (--pending === 0) setLoadedImages([...loaded]) }
      image.src = img.image_url
    })
  }, [images])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const paddleX = (GAME_W - PADDLE_W) / 2
    const bricks = []
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
          y: BRICK_GAP + 40 + r * (BRICK_H + BRICK_GAP),
          w: BRICK_W,
          h: BRICK_H,
          alive: true,
          imageIndex: (r * BRICK_COLS + c) % Math.max(loadedImages.length, 1),
        })
      }
    }

    gameRef.current = {
      paddleX,
      ballX: GAME_W / 2,
      ballY: GAME_H - 60,
      ballDX: 3 * (Math.random() > 0.5 ? 1 : -1),
      ballDY: -3,
      bricks,
      totalBricks: bricks.length,
      score: 0,
      lives: 3,
      mouseX: GAME_W / 2,
      running: true,
    }

    setScore(0)
    setGameState('playing')
    setShowHint(false)
  }, [loadedImages])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    const g = gameRef.current
    if (!canvas || !g) return
    const ctx = canvas.getContext('2d')

    // Clear
    ctx.clearRect(0, 0, GAME_W, GAME_H)

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e293b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    for (let i = 0; i < 30; i++) {
      const sx = (i * 67 + Date.now() * 0.001 * (i % 3 + 1)) % GAME_W
      const sy = (i * 41) % GAME_H
      ctx.beginPath()
      ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Bricks
    g.bricks.forEach(brick => {
      if (!brick.alive) return
      const img = loadedImages[brick.imageIndex]
      if (img) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4)
        ctx.clip()
        ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h)
        ctx.restore()
      } else {
        // Fallback colors
        const colors = ['#8B5CF6','#6366F1','#3B82F6','#22C55E','#F59E0B']
        ctx.fillStyle = colors[brick.imageIndex % colors.length]
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4)
        ctx.fill()
      }
      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Paddle
    const paddleGrad = ctx.createLinearGradient(g.paddleX, GAME_H - 30, g.paddleX + PADDLE_W, GAME_H - 30)
    paddleGrad.addColorStop(0, '#8B5CF6')
    paddleGrad.addColorStop(1, '#6366F1')
    ctx.fillStyle = paddleGrad
    ctx.beginPath()
    ctx.roundRect(g.paddleX, GAME_H - 30, PADDLE_W, PADDLE_H, 6)
    ctx.fill()
    // Paddle glow
    ctx.shadowColor = '#8B5CF6'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    // Ball
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(g.ballX, g.ballY, BALL_R, 0, Math.PI * 2)
    ctx.fill()
    // Ball glow
    ctx.shadowColor = '#fff'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0

    // Lives
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '12px DM Sans, sans-serif'
    ctx.textAlign = 'left'
    for (let i = 0; i < g.lives; i++) {
      ctx.fillText('❤️', 10 + i * 20, 20)
    }

    // Score
    ctx.textAlign = 'right'
    ctx.fillText(`Score: ${g.score}`, GAME_W - 10, 20)
  }, [loadedImages])

  const gameLoop = useCallback(() => {
    const g = gameRef.current
    if (!g || !g.running) return

    // Move paddle
    const targetX = g.mouseX - PADDLE_W / 2
    g.paddleX += (targetX - g.paddleX) * 0.15
    g.paddleX = Math.max(0, Math.min(GAME_W - PADDLE_W, g.paddleX))

    // Move ball
    g.ballX += g.ballDX
    g.ballY += g.ballDY

    // Wall collisions
    if (g.ballX - BALL_R < 0 || g.ballX + BALL_R > GAME_W) {
      g.ballDX *= -1
      g.ballX = Math.max(BALL_R, Math.min(GAME_W - BALL_R, g.ballX))
    }
    if (g.ballY - BALL_R < 0) {
      g.ballDY *= -1
      g.ballY = BALL_R
    }

    // Bottom - lose life
    if (g.ballY + BALL_R > GAME_H) {
      g.lives--
      if (g.lives <= 0) {
        g.running = false
        setGameState('lost')
        setScore(g.score)
        if (g.score > highScore) setHighScore(g.score)
        return
      }
      g.ballX = g.paddleX + PADDLE_W / 2
      g.ballY = GAME_H - 60
      g.ballDY = -3
    }

    // Paddle collision
    if (
      g.ballY + BALL_R >= GAME_H - 30 &&
      g.ballY + BALL_R <= GAME_H - 30 + PADDLE_H + 4 &&
      g.ballX >= g.paddleX &&
      g.ballX <= g.paddleX + PADDLE_W
    ) {
      const hitPos = (g.ballX - g.paddleX) / PADDLE_W
      const angle = (hitPos - 0.5) * Math.PI * 0.6
      const speed = Math.sqrt(g.ballDX * g.ballDX + g.ballDY * g.ballDY)
      g.ballDX = speed * Math.sin(angle)
      g.ballDY = -Math.abs(speed * Math.cos(angle))
      g.ballY = GAME_H - 30 - BALL_R
    }

    // Brick collision
    g.bricks.forEach(brick => {
      if (!brick.alive) return
      if (
        g.ballX + BALL_R > brick.x &&
        g.ballX - BALL_R < brick.x + brick.w &&
        g.ballY + BALL_R > brick.y &&
        g.ballY - BALL_R < brick.y + brick.h
      ) {
        brick.alive = false
        g.ballDY *= -1
        g.score += 10
        setScore(g.score)
      }
    })

    // Win check
    if (g.bricks.every(b => !b.alive)) {
      g.running = false
      setGameState('won')
      setScore(g.score)
      if (g.score > highScore) setHighScore(g.score)
      return
    }

    drawGame()
    animRef.current = requestAnimationFrame(gameLoop)
  }, [drawGame, highScore])

  // Mouse/touch handlers
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = GAME_W / rect.width
    gameRef.current.mouseX = (e.clientX - rect.left) * scaleX
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = GAME_W / rect.width
    gameRef.current.mouseX = (e.touches[0].clientX - rect.left) * scaleX
  }, [])

  const handleStart = () => {
    initGame()
    animRef.current = requestAnimationFrame(gameLoop)
  }

  const handleRestart = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    handleStart()
  }

  // Cleanup
  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  // Draw initial state
  useEffect(() => {
    if (gameState === 'idle') {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const grad = ctx.createLinearGradient(0, 0, 0, GAME_H)
      grad.addColorStop(0, '#0f172a')
      grad.addColorStop(1, '#1e293b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, GAME_W, GAME_H)

      // Draw some demo bricks
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          const colors = ['#8B5CF6','#6366F1','#3B82F6','#22C55E','#F59E0B']
          ctx.fillStyle = colors[r % colors.length]
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.roundRect(
            BRICK_GAP + c * (BRICK_W + BRICK_GAP),
            BRICK_GAP + 40 + r * (BRICK_H + BRICK_GAP),
            BRICK_W, BRICK_H, 4
          )
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // Paddle
      ctx.fillStyle = '#6366F1'
      ctx.beginPath()
      ctx.roundRect((GAME_W - PADDLE_W) / 2, GAME_H - 30, PADDLE_W, PADDLE_H, 6)
      ctx.fill()
    }
  }, [gameState])

  return (
    <div style={{
      width:'100%',maxWidth:520,margin:'0 auto',
      background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius:20,overflow:'hidden',
      boxShadow:'0 16px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      position:'relative',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 20px 8px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div>
          <h3 style={{ fontSize:16,fontWeight:800,color:'#fff',margin:0,fontFamily:"'DM Sans',sans-serif" }}>
            🧱 Break the Bricks!
          </h3>
          <p style={{ fontSize:11,color:'rgba(255,255,255,0.5)',margin:'2px 0 0' }}>Move paddle to bounce ball</p>
        </div>
        {highScore > 0 && (
          <div style={{ background:'rgba(139,92,246,0.2)',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,color:'#A78BFA' }}>
            Best: {highScore}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ padding:'0 12px 12px',position:'relative' }}>
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={gameState === 'idle' ? handleStart : gameState === 'lost' || gameState === 'won' ? handleRestart : undefined}
          style={{
            width:'100%',height:'auto',borderRadius:12,cursor:gameState === 'playing' ? 'none' : 'pointer',
            display:'block',touchAction:'none',
          }}
        />

        {/* Overlay: Start */}
        {gameState === 'idle' && (
          <div style={{
            position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            background:'rgba(0,0,0,0.5)',borderRadius:12,pointerEvents:'none',
          }}>
            <div style={{ fontSize:40,marginBottom:8,animation:'biFloat 2s ease-in-out infinite' }}>🎮</div>
            <div style={{ fontSize:18,fontWeight:800,color:'#fff',marginBottom:4,fontFamily:"'DM Sans',sans-serif" }}>Ready to Play?</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.6)' }}>Click or tap to start</div>
            <style>{`@keyframes biFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
          </div>
        )}

        {/* Overlay: Won */}
        {gameState === 'won' && (
          <div style={{
            position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            background:'rgba(0,0,0,0.7)',borderRadius:12,backdropFilter:'blur(4px)',
          }}>
            <div style={{ fontSize:48,marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:20,fontWeight:800,color:'#22C55E',marginBottom:4,fontFamily:"'DM Sans',sans-serif" }}>You Win!</div>
            <div style={{ fontSize:14,color:'#fff',marginBottom:16 }}>Score: {score}</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',pointerEvents:'auto' }} onClick={handleRestart}>
              Click to play again
            </div>
          </div>
        )}

        {/* Overlay: Lost */}
        {gameState === 'lost' && (
          <div style={{
            position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            background:'rgba(0,0,0,0.7)',borderRadius:12,backdropFilter:'blur(4px)',
          }}>
            <div style={{ fontSize:48,marginBottom:8 }}>💪</div>
            <div style={{ fontSize:20,fontWeight:800,color:'#F59E0B',marginBottom:4,fontFamily:"'DM Sans',sans-serif" }}>Nice Try!</div>
            <div style={{ fontSize:14,color:'#fff',marginBottom:16 }}>Score: {score}</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.6)',cursor:'pointer',pointerEvents:'auto' }} onClick={handleRestart}>
              Click to try again
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
