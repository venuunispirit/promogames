import { useState, useEffect, useRef, useCallback } from 'react'

/* ============================================================
   This is the original MazePlayerPage component, unmodified in
   its logic, wired up to a small in-memory mock of `../api` and
   `gameData` so it can actually run standalone in this preview.
   In the real app, `../api` talks to a server that generates
   mazes and stores session progress; here that's simulated with
   a client-side maze generator and an in-memory store.
   ============================================================ */

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

/* ---------------- mock backend ---------------- */

// simple recursive-backtracker maze generator; returns a size x size
// grid of cells with wall flags n/s/e/w (true = wall present on that side)
function generateMazeGrid(size, extraPathRatio = 0.12) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ n: true, s: true, e: true, w: true, visited: false }))
  )
  const stack = [[0, 0]]
  grid[0][0].visited = true
  const dirs = [
    [-1, 0, 'n', 's'],
    [1, 0, 's', 'n'],
    [0, -1, 'w', 'e'],
    [0, 1, 'e', 'w'],
  ]
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const neighbors = []
    for (const [dr, dc, side, opp] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].visited) {
        neighbors.push([nr, nc, side, opp])
      }
    }
    if (!neighbors.length) { stack.pop(); continue }
    const [nr, nc, side, opp] = neighbors[Math.floor(Math.random() * neighbors.length)]
    grid[r][c][side] = false
    grid[nr][nc][opp] = false
    grid[nr][nc].visited = true
    stack.push([nr, nc])
  }

  // A recursive-backtracker maze is "perfect": exactly one route between
  // any two cells, and no loops. Knock down a handful of extra walls so
  // there are more paths to choose from and dead ends open back up.
  const extraCount = Math.round(size * size * extraPathRatio)
  for (let i = 0; i < extraCount; i++) {
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    const options = []
    if (r > 0) options.push(['n', -1, 0])
    if (r < size - 1) options.push(['s', 1, 0])
    if (c > 0) options.push(['w', 0, -1])
    if (c < size - 1) options.push(['e', 0, 1])
    const opposite = { n: 's', s: 'n', e: 'w', w: 'e' }
    const [side, dr, dc] = options[Math.floor(Math.random() * options.length)]
    grid[r][c][side] = false
    grid[r + dr][c + dc][opposite[side]] = false
  }

  return grid.map(row => row.map(({ n, s, e, w }) => ({ n, s, e, w })))
}

function generateCollectibles(size, count, exit) {
  const items = []
  const used = new Set(['0,0', `${exit.r},${exit.c}`])
  while (items.length < count && items.length < size * size - 2) {
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    const key = `${r},${c}`
    if (used.has(key)) continue
    used.add(key)
    items.push({ r, c })
  }
  return items
}

const mockStore = { progress: null }

const mockApi = {
  get(url, config) {
    const params = (config && config.params) || {}
    return new Promise(resolve => {
      setTimeout(() => {
        if (url.endsWith('/progress')) {
          resolve({ data: { progress: mockStore.progress } })
        } else if (url.includes('/generate')) {
          const level = parseInt(params.level) || 1
          // grid grows every level instead of every couple levels, and the
          // maze gets "tighter" (fewer extra shortcut walls knocked down)
          // the further you get, so later levels are meaningfully harder.
          const size = Math.min(16 + level, 28)
          const extraPathRatio = Math.max(0.03, 0.08 - level * 0.003)
          const maze = generateMazeGrid(size, extraPathRatio)
          const exit = { r: size - 1, c: size - 1 }
          const collectibles = generateCollectibles(size, 2 + Math.floor(level / 2), exit)
          resolve({ data: { maze, size, collectibles } })
        } else {
          resolve({ data: {} })
        }
      }, 250)
    })
  },
  post(url, body) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (url.includes('/progress')) {
          mockStore.progress = {
            current_level: body.completed ? body.level + 1 : body.level,
            total_collectibles: (mockStore.progress?.total_collectibles || 0) + (body.collectibles_found || 0),
          }
          resolve({ data: { ok: true } })
        } else if (url.includes('/session/complete')) {
          resolve({ data: { redirect_url: null, message: 'Demo session complete!' } })
        } else {
          resolve({ data: {} })
        }
      }, 200)
    })
  },
}

const mockGameData = {
  id: 'demo-maze',
  settings: {
    total_levels: 5,
    show_timer: true,
    time_limit_seconds: 45,
    bg_color: '#0f172a',
    primary_color: '#818cf8',
    wall_color: '#334155',
    path_color: '#ffffff',
    font_family: 'DM Sans',
    collectible_label: '★',
    overlay_animation_in: 'flyFromBottom',
    overlay_animation_out: 'flyToTop',
    outro_text: 'All Mazes Complete!',
    continue_button_text: 'Continue →',
  },
  soundMap: {},
  redirect_url: null,
}

/* ---------------- original component ---------------- */

function MazePlayerPage({ gameData, sessionToken, onComplete }) {
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

  const totalLevels = parseInt(settings.total_levels) || 50

  useEffect(() => {
    const calc = Math.min(
      Math.floor((window.innerWidth - 40) / Math.max(size, 5)),
      Math.floor((window.innerHeight - 220) / Math.max(size, 5)),
      44
    )
    setCellSize(Math.max(calc, 14))
  }, [size])

  useEffect(() => {
    if (!sessionToken) { loadMaze(1); return }
    mockApi.get(`/maze/${game.id}/progress`, { params: { session_token: sessionToken } })
      .then(res => {
        const p = res.data.progress
        if (p) {
          const lvl = p.current_level || 1
          setCurrentLevel(lvl)
          setTotalCollectibles(p.total_collectibles || 0)
          loadMaze(lvl)
        } else {
          loadMaze(1)
        }
      })
      .catch(() => loadMaze(1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, game.id])

  const loadMaze = async (level) => {
    setPhase('loading')
    try {
      const res = await mockApi.get(`/maze/${game.id}/generate`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const collKey = `${nr},${nc}`
    if (collectibles.some(c => `${c.r},${c.c}` === collKey) && !collected.has(collKey)) {
      setCollected(prev => new Set([...prev, collKey]))
      setTotalCollectibles(prev => prev + 1)
      playSound(soundMap, settings.sound_collect_id)
    }

    if (nr === exit.r && nc === exit.c) {
      clearInterval(timerRef.current)
      playSound(soundMap, settings.sound_complete_id)
      setPhase('level_complete')
      setShowOverlay(true)
      if (sessionToken) {
        const timeSpent = settings.time_limit_seconds ? settings.time_limit_seconds - timeLeft : 0
        mockApi.post(`/maze/${game.id}/progress`, {
          session_token: sessionToken,
          level: currentLevel,
          completed: true,
          time_spent: Math.round(timeSpent),
          collectibles_found: collected.has(`${nr},${nc}`) ? collectibles.length : collected.size,
        }).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const res = await mockApi.post('/play/session/complete', { session_token: sessionToken })
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
      <div style={{ textAlign:'center', color: pathColor }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:16, letterSpacing:0.3 }}>Classic Maze</div>
        <div style={{ width:36,height:36,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.2)',borderTopColor:settings.primary_color||'#6366f1',animation:'fadeIn .8s linear infinite',margin:'0 auto 12px' }} />
        <div>Loading maze…</div>
      </div>
    </div>
  )

  const timeColor = timeLeft <= 10 ? '#ef4444' : '#94a3b8'

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background: settings.bg_color || '#0f172a', fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`, userSelect:'none' }}>
      <style>{STYLES}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff', letterSpacing:0.3 }}>Classic Maze</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8' }}>Level <strong style={{ color: settings.primary_color || '#6366f1' }}>{currentLevel}</strong>/{totalLevels}</div>
        </div>
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
            <h2 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:'0 0 6px' }}>{settings.outro_text || 'All Mazes Complete!'}</h2>
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
                  const wallStyle = (side) => cell[side] ? `1.5px solid ${wallColor}` : '1.5px solid transparent'

                  return (
                    <div key={c} style={{
                      width: cellSize, height: cellSize,
                      background: isExit ? 'transparent' : isPlayer ? (settings.primary_color || '#22c55e') : 'transparent',
                      borderRadius: 4,
                      borderTop: wallStyle('n'), borderBottom: wallStyle('s'),
                      borderLeft: wallStyle('w'), borderRight: wallStyle('e'),
                      position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .12s',
                    }}>
                      {isPlayer && <div style={{ width:'60%', height:'60%', borderRadius:'50%', background:'#fff', boxShadow:'0 0 8px rgba(255,255,255,0.4)' }} />}
                      {isExit && settings.exit_image_url && (
                        <img src={settings.exit_image_url} alt="" style={{ width:'90%', height:'90%', objectFit:'contain', borderRadius:4, position:'absolute', top:'5%', left:'5%' }} />
                      )}
                      {isExit && !settings.exit_image_url && (
                        <div style={{ width:'80%', height:'80%', background:'#059669', borderRadius:4 }} />
                      )}
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

      <div style={{ display:'flex', justifyContent:'center', gap:4, padding:'8px 16px 16px', background:'rgba(255,255,255,0.03)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,56px)', gap:5 }}>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(-1,0)}} onClick={()=>movePlayer(-1,0)} style={{width:56,height:56,borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▲</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(0,-1)}} onClick={()=>movePlayer(0,-1)} style={{width:56,height:56,borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>◀</button>
          <div style={{width:56,height:56,borderRadius:12,background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:settings.primary_color||'#6366f1'}}>●</div>
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(0,1)}} onClick={()=>movePlayer(0,1)} style={{width:56,height:56,borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▶</button>
          <div />
          <button onTouchStart={(e)=>{e.preventDefault();movePlayer(1,0)}} onClick={()=>movePlayer(1,0)} style={{width:56,height:56,borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>▼</button>
        </div>
      </div>

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

export default function Demo() {
  return (
    <MazePlayerPage
      gameData={mockGameData}
      sessionToken="demo-session"
      onComplete={(data) => console.log('Game complete:', data)}
    />
  )
}