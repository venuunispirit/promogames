import { useState, useEffect, useRef, useCallback } from 'react'
function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

function generateBoard(rows, cols, mines) {
  const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 })))
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols)
    if (!board[r][c].mine) { board[r][c].mine = true; placed++ }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++
      }
      board[r][c].adjacent = count
    }
  }
  return board
}

export default function MinesweeperPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])
  const ff = `'${settings?.font_family || 'DM Sans'}', sans-serif`
  const primaryColor = settings?.primary_color || '#22c55e'
  const rows = settings?.grid_rows || 9, cols = settings?.grid_cols || 9, totalMines = settings?.mines || 10

  const [showIntro, setShowIntro] = useState(true)
  const [board, setBoard] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [flagCount, setFlagCount] = useState(0)
  const [timer, setTimer] = useState(0)
  const [firstClick, setFirstClick] = useState(true)
  const timerRef = useRef(null)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async (score) => {
    if (completedRef.current) return; completedRef.current = true
    try {
      if (sessionToken) await fetch('/api/play/session/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, score, player_data: { time: timer, mines: totalMines } })
      })
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, timer, totalMines])

  const startGame = () => {
    setBoard(generateBoard(rows, cols, totalMines))
    setShowIntro(false); setGameOver(false); setGameWon(false); setFlagCount(0); setTimer(0); setFirstClick(true)
    completedRef.current = false
    clearInterval(timerRef.current)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const reveal = (r, c) => {
    if (gameOver || gameWon) return
    const newBoard = board.map(row => row.map(cell => ({ ...cell })))

    if (firstClick) {
      if (newBoard[r][c].mine) {
        newBoard[r][c].mine = false
        let placed = 0
        while (placed < 1) {
          const nr = Math.floor(Math.random() * rows), nc = Math.floor(Math.random() * cols)
          if (!newBoard[nr][nc].mine && !(nr === r && nc === c)) { newBoard[nr][nc].mine = true; placed++ }
        }
      }
      setFirstClick(false)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }

    if (newBoard[r][c].flagged || newBoard[r][c].revealed) return

    if (newBoard[r][c].mine) {
      newBoard.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true }))
      setBoard(newBoard); setGameOver(true); clearInterval(timerRef.current)
      playSound(resolveSound(settings?.sound_explode_id))
      return
    }

    const flood = (rr, cc) => {
      if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) return
      if (newBoard[rr][cc].revealed || newBoard[rr][cc].mine) return
      newBoard[rr][cc].revealed = true
      if (newBoard[rr][cc].adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(rr + dr, cc + dc)
      }
    }
    flood(r, c)
    playSound(resolveSound(settings?.sound_click_id))

    const unrevealed = newBoard.flat().filter(c => !c.revealed && !c.mine).length
    if (unrevealed === 0) {
      setBoard(newBoard); setGameWon(true); clearInterval(timerRef.current)
      playSound(resolveSound(settings?.sound_win_id))
      const score = Math.max(100, 1000 - timer * 5)
      setTimeout(() => handleComplete(score), 1500)
      return
    }
    setBoard(newBoard)
  }

  const toggleFlag = (e, r, c) => {
    e.preventDefault()
    if (gameOver || gameWon || board[r][c].revealed) return
    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    setBoard(newBoard)
    setFlagCount(newBoard.flat().filter(c => c.flagged).length)
  }

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#0f172a' }

  const colors = ['','#3b82f6','#22c55e','#ef4444','#8b5cf6','#f59e0b','#06b6d4','#1a1a2e','#6b7280']

  if (showIntro) return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
      <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
        <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Minesweeper'}</h1>
        {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
        <div style={{ background:'#F0FDF4',borderRadius:12,padding:16,marginBottom:20 }}>
          <p style={{ fontSize:13,color:'#166534',lineHeight:1.6 }}>💣 Reveal all safe cells without hitting a mine. Right-click to flag suspected mines.</p>
        </div>
        <button onClick={startGame} style={{ background:settings?.start_button_bg_color||`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:settings?.start_button_text_color||'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Game →'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Minesweeper'}</h2>
      <div style={{ display:'flex',gap:12,marginBottom:12 }}>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>💣 {totalMines - flagCount}</span>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>⏱ {timer}s</span>
      </div>

      <div style={{ display:'inline-grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:2,background:'rgba(255,255,255,0.15)',borderRadius:8,padding:3,marginBottom:12 }}>
        {board.map((row, r) => row.map((cell, c) => (
          <div key={`${r}-${c}`} onClick={() => reveal(r, c)} onContextMenu={e => toggleFlag(e, r, c)} style={{
            width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:3,
            background:cell.revealed ? (cell.mine ? '#ef4444' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.08)',
            cursor:'pointer',fontSize:cell.revealed && cell.adjacent > 0 ? 14 : 12,fontWeight:700,
            color:cell.revealed && !cell.mine ? colors[cell.adjacent] : '#fff',
            transition:'background 0.15s',
          }}>
            {cell.flagged && !cell.revealed ? '🚩' : cell.revealed ? (cell.mine ? '💣' : (cell.adjacent > 0 ? cell.adjacent : '')) : ''}
          </div>
        )))}
      </div>

      {(gameOver || gameWon) && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>{gameWon ? '🎉' : '💥'}</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>{gameWon ? 'You Win!' : 'Game Over!'}</h2>
            <p style={{ color:'#666',fontSize:14,marginBottom:20 }}>Time: {timer}s</p>
            <button onClick={() => handleComplete(gameWon ? Math.max(100, 1000 - timer * 5) : 0)} style={{ background:settings?.continue_button_bg_color||primaryColor,color:settings?.continue_button_text_color||'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
