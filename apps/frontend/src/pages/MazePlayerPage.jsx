import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const STYLES = `
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
@keyframes confettiFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes flyFromBottom { from{transform:translateY(110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes flyToTop { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(-110vh) scale(0.9);opacity:0} }
`

function playSound(soundMap, id) {
  if (!id || !soundMap[id]) return
  try { const a = new Audio(soundMap[id]); a.volume = 0.6; a.play().catch(() => {}) } catch (e) {}
}

export default function MazePlayerPage({ gameData, sessionToken, onComplete }) {
  const game = gameData
  const settings = game.settings || {}
  const soundMap = game.soundMap || {}

  const [phase, setPhase] = useState('loading')
  const [maze, setMaze] = useState(null)
  const [size, setSize] = useState(5)
  const [player, setPlayer] = useState({ r: 0, c: 0 })
  const [exit, setExit] = useState({ r: 0, c: 0 })
  const [collectibles, setCollectibles] = useState([])
  const [collected, setCollected] = useState(new Set())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalCollectibles, setTotalCollectibles] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayAnimOut, setOverlayAnimOut] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [moves, setMoves] = useState(0)
  const [cellSize, setCellSize] = useState(40)
  const timerRef = useRef(null)
  const isCompleteRef = useRef(false)
  const mazeRef = useRef(null)
  const [showIntro, setShowIntro] = useState(true)

  const totalLevels = parseInt(settings.total_levels) || 50

  useEffect(() => {
    const calc = Math.min(Math.floor((window.innerWidth - 40) / Math.max(size, 5)), 60)
    setCellSize(Math.max(calc, 18))
  }, [size])

  useEffect(() => {
    if (!sessionToken) { setShowIntro(true); return }
    api.get(`/maze/${game.id}/progress`, { params: { session_token: sessionToken } })
      .then(res => {
        const p = res.data.progress
        if (p) {
          const lvl = p.current_level || 1
          setCurrentLevel(lvl)
          setTotalCollectibles(p.total_collectibles || 0)
          setShowIntro(false)
          loadMaze(lvl)
        } else {
          setShowIntro(true)
        }
      })
      .catch(() => setShowIntro(true))
  }, [sessionToken, game.id])

  const loadMaze = async (level) => {
    setPhase('loading')
    try {
      const res = await api.get(`/maze/${game.id}/generate`, {
        params: { level, session_token: sessionToken || '' }
      })
      const data = res.data
      setMaze(data.maze)
      setSize(data.size)
      setPlayer({ r: 0, c: 0 })
      setExit({ r: data.size - 1, c: data.size - 1 })
      setCollectibles(data.collectibles)
      setCollected(new Set())
      setMoves(0)
      if (settings.show_timer && settings.time_limit_seconds > 0) {
        setTimeLeft(settings.time_limit_seconds)
      }
      setPhase('playing')
    } catch (err) {
      setPhase('playing')
    }
  }

  useEffect(() => {
    if (phase !== 'playing' || !settings.show_timer || !settings.time_limit_seconds) return
    setTimeLeft(settings.time_limit_seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, currentLevel])

  const handleTimeout = () => {
    setPhase('level_complete')
    setShowOverlay(true)
  }

  const canMove = (r, c) => {
    if (!maze) return false
    if (r < 0 || r >= size || c < 0 || c >= size) return false
    const cell = maze[player.r][player.c]
    if (r > player.r && cell.s) return false
    if (r < player.r && cell.n) return false
    if (c > player.c && cell.e) return false
    if (c < player.c && cell.w) return false
    return true
  }

  const movePlayer = useCallback((dr, dc) => {
    if (phase !== 'playing' || showOverlay) return
    const nr = player.r + dr
    const nc = player.c + dc
    if (!canMove(nr, nc)) return
    setPlayer({ r: nr, c: nc })
    setMoves(prev => prev + 1)

    // Check collectible
    const collKey = `${nr},${nc}`
    if (collectibles.some(c => `${c.r},${c.c}` === collKey) && !collected.has(collKey)) {
      setCollected(prev => new Set([...prev, collKey]))
      setTotalCollectibles(prev => prev + 1)
      playSound(soundMap, settings.sound_collect_id)
    }

    // Check exit
    if (nr === exit.r && nc === exit.c) {
      clearInterval(timerRef.current)
      playSound(soundMap, settings.sound_complete_id)
      setPhase('level_complete')
      setShowOverlay(true)
      if (sessionToken) {
        const timeSpent = settings.time_limit_seconds ? settings.time_limit_seconds - timeLeft : 0
        api.post(`/maze/${game.id}/progress`, {
          session_token: sessionToken,
          level: currentLevel,
          completed: true,
          time_spent: Math.round(timeSpent),
          collectibles_found: collected.has(`${nr},${nc}`) ? collectibles.length : collected.size,
        }).catch(() => {})
      }
    }
  }, [player, maze, size, phase, showOverlay, collectibles, collected, exit, soundMap, settings, sessionToken, currentLevel, timeLeft])

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) { case 'ArrowUp': e.preventDefault(); movePlayer(-1, 0); break; case 'ArrowDown': e.preventDefault(); movePlayer(1, 0); break; case 'ArrowLeft': e.preventDefault(); movePlayer(0, -1); break; case 'ArrowRight': e.preventDefault(); movePlayer(0, 1); break }
    }
    window.addEventListener('keydown', handleKey)

    let touchStart = null
    const handleTouchStart = (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const handleTouchEnd = (e) => {
      if (!touchStart) return
      const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y
      if (Math.abs(dx) > Math.abs(dy)) { movePlayer(0, dx > 0 ? 1 : -1) } else { movePlayer(dy > 0 ? 1 : -1, 0) }
      touchStart = null
    }
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd) }
  }, [movePlayer])

  const handleOverlayNext = () => {
    setOverlayAnimOut(settings.overlay_animation_out || 'flyToTop')
    setTimeout(() => {
      setShowOverlay(false)
      setOverlayAnimOut('')
      const nextLevel = currentLevel + 1
      if (nextLevel > totalLevels) {
        handleGameOver()
      } else {
        setCurrentLevel(nextLevel)
        loadMaze(nextLevel)
      }
    }, 400)
  }

  const handleGameOver = async () => {
    if (isCompleteRef.current) return
    isCompleteRef.current = true
    clearInterval(timerRef.current)
    setGameOver(true)
    if (!sessionToken) return
    try {
      const res = await api.post('/play/session/complete', { session_token: sessionToken })
      onComplete?.(res.data)
    } catch (err) {
      onComplete?.({ redirect_url: game.redirect_url })
    }
  }

  const animIn = settings.overlay_animation_in || 'flyFromBottom'
  const animOut = overlayAnimOut || 'flyToTop'
  const wallColor = settings.wall_color || '#1e293b'
  const pathColor = settings.path_color || '#ffffff'

  if (phase === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: settings.bg_color || '#0f172a' }}>
      <style>{STYLES}</style>
      <div style={{ textAlign:'center', color: pathColor }}><div style={{ width:36,height:36,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.2)',borderTopColor:settings.primary_color||'#6366f1',animation:'fadeIn .8s linear infinite',margin:'0 auto 12px' }} /><div>Loading maze…</div></div>
    </div>
  )

  if (showIntro && !gameOver) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background: settings.bg_color || '#0f172a', fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif` }}>
      <style>{STYLES}</style>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🧩</div>
          <h2 style={{ fontSize:20, fontWeight:700, color: settings.heading_1_color || '#fff', marginBottom:8 }}>
            {settings.heading_1 || `Maze Level ${currentLevel}`}
          </h2>
          {settings.description_text && (
            <p style={{ fontSize:14, color: settings.description_color || '#94a3b8', marginBottom:16, whiteSpace:'pre-line' }}>
              {settings.description_text}
            </p>
          )}
          {settings.terms_enabled && (
            <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#94a3b8', marginBottom:16, textAlign:'left', justifyContent:'center' }}>
              <input type="checkbox" style={{ marginTop:3, accentColor: settings.primary_color || '#6366f1' }} />
              <span>
                {settings.terms_text || 'I agree to the terms'}
                {settings.terms_url && <a href={settings.terms_url} target="_blank" rel="noopener noreferrer" style={{ color: settings.primary_color || '#6366f1', textDecoration:'underline', marginLeft:4 }}>Terms</a>}
              </span>
            </label>
          )}
          <button onClick={() => { setShowIntro(false); loadMaze(currentLevel) }}
            style={{ padding:'14px 36px', borderRadius:12, border:'none', background: settings.primary_color || '#6366f1', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {settings.start_button_text || 'Start Maze →'}
          </button>
        </div>
      </div>
    </div>
  )

  const timeColor = timeLeft <= 10 ? '#ef4444' : '#94a3b8'

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background: settings.bg_color || '#0f172a', fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`, userSelect:'none' }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8' }}>Level <strong style={{ color: settings.primary_color || '#6366f1' }}>{currentLevel}</strong>/{totalLevels}</div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ fontSize:12, color:'#94a3b8' }}>⭐ {collected.size}/{collectibles.length}</div>
          <div style={{ fontSize:12, color:'#94a3b8' }}>👣 {moves}</div>
          {settings.show_timer && settings.time_limit_seconds > 0 && (<div style={{ fontSize:13, fontWeight:700, color: timeColor }}>⏱ {timeLeft}s</div>)}
        </div>
      </div>

      {gameOver ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ textAlign:'center', animation:'slideUp .4s ease' }}>
            <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
            <h2 style={{ fontSize:20, fontWeight:800, color: settings.outro_text_color || '#fff', margin:'0 0 6px' }}>{settings.outro_text || 'All Mazes Complete!'}</h2>
            <p style={{ fontSize:14, color:'#94a3b8', margin:'0 0 16px' }}>You conquered {totalLevels} mazes!</p>
            <button onClick={handleGameOver} style={{ padding:'14px 36px', borderRadius:12, border:'none', background: settings.primary_color || '#6366f1', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {settings.continue_button_text || 'Continue →'}
            </button>
          </div>
        </div>
      ) : maze ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', position:'relative' }}>
          <div style={{ display:'flex', flexDirection:'column', gap: 1 }}>
            {Array.from({ length: size }).map((_, r) => (
              <div key={r} style={{ display:'flex', gap: 1 }}>
                {Array.from({ length: size }).map((_, c) => {
                  const cell = maze[r][c]
                  const isPlayer = player.r === r && player.c === c
                  const isExit = exit.r === r && exit.c === c
                  const hasCollect = collectibles.some(cl => cl.r === r && cl.c === c)
                  const isCollected = collected.has(`${r},${c}`)
                  const wallStyle = (side) => cell[side] ? `2px solid ${wallColor}` : '2px solid transparent'

                  return (
                    <div key={c} style={{
                      width: cellSize, height: cellSize,
                      background: isExit ? (isPlayer ? 'transparent' : '#059669') : isPlayer ? (settings.primary_color || '#6366f1') : 'transparent',
                      borderRadius: 4,
                      borderTop: wallStyle('n'), borderBottom: wallStyle('s'),
                      borderLeft: wallStyle('w'), borderRight: wallStyle('e'),
                      position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .12s',
                    }}>
                      {isPlayer && <div style={{ width:'60%', height:'60%', borderRadius:'50%', background:'#fff', boxShadow:'0 0 8px rgba(255,255,255,0.4)' }} />}
                      {hasCollect && !isCollected && !isPlayer && (
                        <div style={{ fontSize: cellSize * 0.4, lineHeight:1, animation:'popIn .3s ease' }}>{settings.collectible_label || '★'}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Controls overlay */}
      <div style={{ display:'flex', justifyContent:'center', gap:4, padding:'8px 16px 16px', background:'rgba(255,255,255,0.03)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,44px)', gap:3 }}>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(-1,0)}} onClick={()=>movePlayer(-1,0)} style={{width:44,height:44,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▲</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(0,-1)}} onClick={()=>movePlayer(0,-1)} style={{width:44,height:44,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>◀</button>
          <div style={{width:44,height:44,borderRadius:10,background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:settings.primary_color||'#6366f1'}}>●</div>
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(0,1)}} onClick={()=>movePlayer(0,1)} style={{width:44,height:44,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▶</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(1,0)}} onClick={()=>movePlayer(1,0)} style={{width:44,height:44,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▼</button>
        </div>
      </div>

      {/* Level complete overlay */}
      {showOverlay && (
        <div style={{ position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)' }}>
          <div style={{ textAlign:'center', animation:`${overlayAnimOut ? animOut : animIn} .4s ease`, animationName: overlayAnimOut ? animOut : animIn }}>
            <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'28px 24px', maxWidth:300 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#16a34a', margin:0 }}>Level {currentLevel} Complete!</h2>
              <p style={{ fontSize:13, color:'#666', margin:'8px 0' }}>⭐ {collected.size}/{collectibles.length} collected · 👣 {moves} moves</p>
              {currentLevel < totalLevels && <p style={{ fontSize:12, color:'#999', marginBottom:12 }}>Level {currentLevel + 1} unlocked →</p>}
              <button onClick={handleOverlayNext}
                style={{ padding:'12px 36px', borderRadius:12, border:'none', background: settings.primary_color || '#6366f1', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {currentLevel >= totalLevels ? '🏆 Finish' : 'Next Level →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
