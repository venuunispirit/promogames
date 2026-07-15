import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const BRICK_ROWS = 4
const BRICK_COLS = 12
const BRICK_H = 32
const BRICK_GAP = 6
const PADDLE_H = 14
const BALL_R = 8
const GAME_H = 500

export default function BreakoutGame() {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [images, setImages] = useState([])
  const [loadedImages, setLoadedImages] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const gameRef = useRef(null)
  const animRef = useRef(null)
  const bricksRef = useRef([])
  const ballRef = useRef({ x: 0, y: 0, dx: 0, dy: 0 })
  const paddleRef = useRef({ x: 0 })
  const mouseRef = useRef({ x: 0 })
  const livesRef = useRef(3)
  const scoreRef = useRef(0)

  const BRICK_W = (containerWidth - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS
  const PADDLE_W = Math.min(120, containerWidth * 0.1)
  const PADDLE_Y = GAME_H - 60

  useEffect(() => {
    api.get('/brick-images?active=true').then(res => setImages(res.data.images || [])).catch(() => {})
  }, [])

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

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const initBricks = useCallback(() => {
    const bricks = []
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
          y: 20 + r * (BRICK_H + BRICK_GAP),
          w: BRICK_W,
          h: BRICK_H,
          alive: true,
          imageIndex: (r * BRICK_COLS + c) % Math.max(loadedImages.length, 1),
        })
      }
    }
    bricksRef.current = bricks
  }, [BRICK_W, loadedImages])

  const startGame = useCallback(() => {
    initBricks()
    ballRef.current = { x: containerWidth / 2, y: PADDLE_Y - 20, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: -4 }
    paddleRef.current = { x: (containerWidth - PADDLE_W) / 2 }
    livesRef.current = 3
    scoreRef.current = 0
    setScore(0)
    setGameState('playing')
  }, [containerWidth, PADDLE_W, initBricks])

  const gameLoop = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const ball = ballRef.current
    const paddle = paddleRef.current
    const bricks = bricksRef.current

    const targetX = mouseRef.current.x - PADDLE_W / 2
    paddle.x += (targetX - paddle.x) * 0.12
    paddle.x = Math.max(0, Math.min(containerWidth - PADDLE_W, paddle.x))

    ball.x += ball.dx
    ball.y += ball.dy

    if (ball.x - BALL_R < 0 || ball.x + BALL_R > containerWidth) {
      ball.dx *= -1
      ball.x = Math.max(BALL_R, Math.min(containerWidth - BALL_R, ball.x))
    }
    if (ball.y - BALL_R < 0) { ball.dy *= -1; ball.y = BALL_R }

    if (ball.y + BALL_R > GAME_H) {
      livesRef.current--
      if (livesRef.current <= 0) { setGameState('lost'); return }
      ball.x = paddle.x + PADDLE_W / 2; ball.y = PADDLE_Y - 20; ball.dy = -4
    }

    if (ball.dy > 0 && ball.y + BALL_R >= PADDLE_Y && ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 6 &&
        ball.x >= paddle.x && ball.x <= paddle.x + PADDLE_W) {
      const hitPos = (ball.x - paddle.x) / PADDLE_W
      const angle = (hitPos - 0.5) * Math.PI * 0.5
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
      ball.dx = speed * Math.sin(angle)
      ball.dy = -Math.abs(speed * Math.cos(angle))
      ball.y = PADDLE_Y - BALL_R
    }

    for (const brick of bricks) {
      if (!brick.alive) continue
      if (ball.x + BALL_R > brick.x && ball.x - BALL_R < brick.x + brick.w &&
          ball.y + BALL_R > brick.y && ball.y - BALL_R < brick.y + brick.h) {
        brick.alive = false; ball.dy *= -1; scoreRef.current += 10; setScore(scoreRef.current); break
      }
    }

    if (bricks.every(b => !b.alive)) { setGameState('won'); return }

    ctx.clearRect(0, 0, containerWidth, GAME_H)

    bricks.forEach(brick => {
      if (!brick.alive) return
      const img = loadedImages[brick.imageIndex]
      if (img) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4); ctx.clip()
        ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h); ctx.restore()
      } else {
        const colors = ['#8B5CF6','#6366F1','#3B82F6','#22C55E','#F59E0B']
        ctx.fillStyle = colors[brick.imageIndex % colors.length]
        ctx.beginPath(); ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4); ctx.fill()
      }
    })

    const paddleGrad = ctx.createLinearGradient(paddle.x, PADDLE_Y, paddle.x + PADDLE_W, PADDLE_Y)
    paddleGrad.addColorStop(0, '#8B5CF6'); paddleGrad.addColorStop(1, '#6366F1')
    ctx.fillStyle = paddleGrad; ctx.beginPath(); ctx.roundRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H, 7); ctx.fill()

    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '12px DM Sans, sans-serif'; ctx.textAlign = 'left'
    for (let i = 0; i < livesRef.current; i++) ctx.fillText('❤️', 10 + i * 20, 16)
    ctx.textAlign = 'right'; ctx.fillText(`Score: ${scoreRef.current}`, containerWidth - 10, 16)

    animRef.current = requestAnimationFrame(gameLoop)
  }, [containerWidth, PADDLE_W, loadedImages])

  useEffect(() => {
    if (gameState === 'playing') animRef.current = requestAnimationFrame(gameLoop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [gameState, gameLoop])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) mouseRef.current.x = e.clientX - rect.left
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) mouseRef.current.x = e.touches[0].clientX - rect.left
  }, [])

  useEffect(() => {
    if (gameState !== 'idle') return
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, containerWidth, GAME_H)
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const colors = ['#8B5CF6','#6366F1','#3B82F6','#22C55E','#F59E0B']
        ctx.fillStyle = colors[r % colors.length]; ctx.globalAlpha = 0.4
        ctx.beginPath(); ctx.roundRect(BRICK_GAP + c * (BRICK_W + BRICK_GAP), 20 + r * (BRICK_H + BRICK_GAP), BRICK_W, BRICK_H, 4); ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = '#6366F1'; ctx.beginPath(); ctx.roundRect((containerWidth - PADDLE_W) / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 7); ctx.fill()
  }, [gameState, containerWidth, BRICK_W, PADDLE_W])

  return (
    <div
      ref={containerRef}
      onMouseMove={gameState === 'playing' ? handleMouseMove : undefined}
      onTouchMove={gameState === 'playing' ? handleTouchMove : undefined}
      onClick={gameState === 'idle' ? startGame : undefined}
      style={{ width:'100%',height:GAME_H,position:'relative',cursor:gameState === 'playing' ? 'none' : 'pointer' }}
    >
      <canvas
        width={containerWidth}
        height={GAME_H}
        style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }}
      />

      {(gameState === 'won' || gameState === 'lost') && (
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',zIndex:5 }}>
          <div style={{ fontSize:40,marginBottom:6 }}>{gameState === 'won' ? '🎉' : '💪'}</div>
          <div style={{ fontSize:18,fontWeight:800,color:'#fff',marginBottom:4 }}>{gameState === 'won' ? 'You Win!' : 'Nice Try!'}</div>
          <div style={{ fontSize:13,color:'rgba(255,255,255,0.7)',marginBottom:12 }}>Score: {score}</div>
          <button onClick={(e) => { e.stopPropagation(); startGame() }} style={{ background:'linear-gradient(135deg,#8B5CF6,#6366F1)',color:'#fff',border:'none',borderRadius:50,padding:'10px 28px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>Play Again</button>
        </div>
      )}
    </div>
  )
}
