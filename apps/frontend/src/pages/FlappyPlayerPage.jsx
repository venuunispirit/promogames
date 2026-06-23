import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

export default function FlappyPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])

  const primaryColor = settings?.primary_color || '#f59e0b'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const gravity = settings?.gravity ?? 0.5
  const flapStrength = settings?.flap_strength ?? -8
  const pipeSpeed = settings?.pipe_speed ?? 3
  const pipeGap = settings?.pipe_gap ?? 150
  const pipeWidth = settings?.pipe_width ?? 60
  const birdColor = settings?.bird_color || '#f59e0b'
  const pipeColor = settings?.pipe_color || '#22c55e'
  const groundColor = settings?.ground_color || '#8B4513'
  const skyColor = settings?.sky_color || '#87CEEB'

  const [showIntro, setShowIntro] = useState(true)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef(null)
  const birdRef = useRef({ x: 80, y: 250, velocity: 0, rotation: 0 })
  const pipesRef = useRef([])
  const scoreRef = useRef(0)
  const groundOffset = useRef(0)
  const animFrameRef = useRef(null)
  const completedRef = useRef(false)
  const gameStarted = useRef(false)
  const lastTime = useRef(0)

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
    gameStarted.current = false
    scoreRef.current = 0; setScore(0)
    birdRef.current = { x: 80, y: 250, velocity: 0, rotation: 0 }
    pipesRef.current = []
    lastTime.current = 0
  }

  const flap = useCallback(() => {
    if (!gameActive || gameOver) return
    if (!gameStarted.current) {
      gameStarted.current = true
      lastTime.current = performance.now()
    }
    birdRef.current.velocity = flapStrength
    playSound(resolveSound(settings?.sound_flap_id))
  }, [gameActive, gameOver, flapStrength, settings, resolveSound])

  const handleKey = useCallback((e) => {
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault()
      flap()
    }
  }, [flap])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  useEffect(() => {
    if (!gameActive || gameOver) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const W = canvas.width
    const H = canvas.height
    const groundH = 40
    const birdSize = 24
    const playH = H - groundH

    const spawnPipe = () => {
      const minTop = 60
      const maxTop = playH - pipeGap - 60
      const topH = minTop + Math.random() * (maxTop - minTop)
      pipesRef.current.push({ x: W + 10, topH, scored: false })
    }

    let pipeTimer = 0
    const pipeInterval = 1800

    const drawBird = (b) => {
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(b.rotation)
      ctx.fillStyle = birdColor
      ctx.beginPath()
      ctx.ellipse(0, 0, birdSize / 2, birdSize / 2.3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(5, -3, 5, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(7, -3, 2.5, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(birdSize / 2, -2)
      ctx.lineTo(birdSize / 2 + 8, 0)
      ctx.lineTo(birdSize / 2, 3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawPipe = (p) => {
      const gradient = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0)
      gradient.addColorStop(0, pipeColor)
      gradient.addColorStop(0.3, pipeColor + 'cc')
      gradient.addColorStop(0.7, pipeColor)
      gradient.addColorStop(1, pipeColor + 'aa')
      ctx.fillStyle = gradient
      ctx.fillRect(p.x, 0, pipeWidth, p.topH)
      ctx.fillRect(p.x, p.topH + pipeGap, pipeWidth, playH - p.topH - pipeGap)
      ctx.fillStyle = pipeColor
      ctx.fillRect(p.x - 4, p.topH - 20, pipeWidth + 8, 20)
      ctx.fillRect(p.x - 4, p.topH + pipeGap, pipeWidth + 8, 20)
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 1
      ctx.strokeRect(p.x, 0, pipeWidth, p.topH)
      ctx.strokeRect(p.x, p.topH + pipeGap, pipeWidth, playH - p.topH - pipeGap)
    }

    const drawGround = () => {
      ctx.fillStyle = groundColor
      ctx.fillRect(0, playH, W, groundH)
      ctx.fillStyle = groundColor + 'cc'
      for (let x = -groundOffset.current % 24; x < W; x += 24) {
        ctx.fillRect(x, playH, 12, 6)
      }
    }

    const drawClouds = () => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      const t = performance.now() / 3000
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 200 + t * 20 * (i + 1)) % (W + 100)) - 50
        const cy = 30 + i * 40
        ctx.beginPath()
        ctx.arc(cx, cy, 20, 0, Math.PI * 2)
        ctx.arc(cx + 18, cy - 5, 16, 0, Math.PI * 2)
        ctx.arc(cx + 32, cy, 18, 0, Math.PI * 2)
        ctx.arc(cx + 14, cy + 4, 14, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (timestamp) => {
      if (!gameStarted.current) {
        const bird = birdRef.current
        bird.y = 250 + Math.sin(timestamp / 300) * 15
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = skyColor
        ctx.fillRect(0, 0, W, H)
        drawClouds()
        drawGround()
        drawBird(bird)
        animFrameRef.current = requestAnimationFrame(loop)
        return
      }

      const delta = timestamp - (lastTime.current || timestamp)
      lastTime.current = timestamp
      const dt = Math.min(delta / 16, 3)

      const bird = birdRef.current
      bird.velocity += gravity * dt
      bird.y += bird.velocity * dt
      bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90) * Math.PI / 180

      pipeTimer += delta
      if (pipeTimer > pipeInterval) {
        spawnPipe()
        pipeTimer = 0
      }

      pipesRef.current.forEach(p => { p.x -= pipeSpeed * dt })
      pipesRef.current = pipesRef.current.filter(p => p.x + pipeWidth > -10)

      groundOffset.current += pipeSpeed * dt

      pipesRef.current.forEach(p => {
        if (!p.scored && p.x + pipeWidth < bird.x) {
          p.scored = true
          scoreRef.current++
          setScore(scoreRef.current)
          playSound(resolveSound(settings?.sound_score_id))
        }
      })

      const hitGround = bird.y + birdSize / 2 > playH
      const hitCeiling = bird.y - birdSize / 2 < 0
      const hitPipe = pipesRef.current.some(p => {
        const birdRight = bird.x + birdSize / 2 - 4
        const birdLeft = bird.x - birdSize / 2 + 4
        const birdTop = bird.y - birdSize / 2 + 4
        const birdBottom = bird.y + birdSize / 2 - 4
        if (birdRight > p.x && birdLeft < p.x + pipeWidth) {
          if (birdTop < p.topH || birdBottom > p.topH + pipeGap) return true
        }
        return false
      })

      if (hitGround || hitCeiling || hitPipe) {
        playSound(resolveSound(settings?.sound_gameover_id))
        setGameOver(true)
        return
      }

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = skyColor
      ctx.fillRect(0, 0, W, H)
      drawClouds()
      pipesRef.current.forEach(drawPipe)
      drawGround()
      drawBird(bird)

      ctx.fillStyle = '#fff'
      ctx.font = `bold 36px ${ff}`
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 4
      ctx.fillText(scoreRef.current, W / 2, 50)
      ctx.shadowBlur = 0

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [gameActive, gameOver, skyColor, pipeColor, birdColor, groundColor, gravity, pipeSpeed, pipeGap, pipeWidth, ff, settings, resolveSound])

  useEffect(() => {
    if (score > highScore) setHighScore(score)
  }, [score])

  useEffect(() => {
    if (gameOver && !completedRef.current) {
      setTimeout(() => handleComplete(), 1500)
    }
  }, [gameOver])

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || skyColor }

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
        <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Flappy Bird'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize:13,color:settings?.heading_3_color||'#888',marginBottom:16 }}>{settings.heading_3}</p>}
          <div style={{ background:'#FFFBEB',borderRadius:12,padding:16,marginBottom:20 }}>
            <p style={{ fontSize:13,color:'#92400E',lineHeight:1.6 }}>🐦 Tap or press Space to fly! Avoid the pipes and score as many points as you can.</p>
          </div>
          <button onClick={handleStart} style={{ background: settings?.start_button_bg_color || `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color: settings?.start_button_text_color || '#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 6px 20px ${primaryColor}44`,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Playing →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px',touchAction:'manipulation' }}
      onClick={flap} onTouchStart={(e) => { e.preventDefault(); flap() }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center',textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>{settings?.heading_1||'Flappy Bird'}</h2>
      <div style={{ display:'flex',gap:16,marginBottom:12 }}>
        <span style={{ background:'rgba(255,255,255,0.2)',backdropFilter:'blur(8px)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>Score: {score}</span>
        {highScore > 0 && <span style={{ background:'rgba(255,255,255,0.2)',backdropFilter:'blur(8px)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#f59e0b' }}>Best: {highScore}</span>}
      </div>
      <canvas ref={canvasRef} width={400} height={500} style={{ borderRadius:16,maxWidth:'100%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',cursor:'pointer',touchAction:'manipulation' }} />
      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>💀</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>Game Over!</h2>
            <p style={{ color:'#666',fontSize:16,marginBottom:8 }}>Score: <strong>{score}</strong></p>
            <p style={{ color:'#999',fontSize:13,marginBottom:20 }}>Best: {highScore}</p>
            <button onClick={handleComplete} style={{ background: settings?.continue_button_bg_color || primaryColor,color: settings?.continue_button_text_color || '#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>
              {settings?.continue_button_text||'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
