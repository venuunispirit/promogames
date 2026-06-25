import { useState, useEffect, useRef, useCallback } from 'react'
function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

function generateSudoku(difficulty) {
  const clues = difficulty === 'easy' ? 45 : difficulty === 'hard' ? 30 : 38
  const solution = [
    [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
  ]
  const board = solution.map(r => [...r])
  let removed = 0
  while (removed < 81 - clues) {
    const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9)
    if (board[r][c] !== 0) { board[r][c] = 0; removed++ }
  }
  return { board, solution }
}

export default function SudokuPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])
  const ff = `'${settings?.font_family || 'DM Sans'}', sans-serif`
  const primaryColor = settings?.primary_color || '#3b82f6'
  const difficulty = settings?.difficulty || 'medium'

  const [showIntro, setShowIntro] = useState(true)
  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [timer, setTimer] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(3)
  const timerRef = useRef(null)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async (score) => {
    if (completedRef.current) return; completedRef.current = true
    try {
      if (sessionToken) await fetch('/api/play/session/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, score, player_data: { time: timer, mistakes, hints } })
      })
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, timer, mistakes, hints])

  const startGame = () => {
    const { board: b, solution: s } = generateSudoku(difficulty)
    setBoard(b.map(r => [...r])); setSolution(s)
    setShowIntro(false); setGameComplete(false); setTimer(0); setMistakes(0); setHints(3)
    completedRef.current = false
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const placeNumber = (num) => {
    if (!selectedCell || gameComplete) return
    const [r, c] = selectedCell
    if (board[r][c] !== 0) return
    const newBoard = board.map(row => [...row])
    if (num === solution[r][c]) {
      newBoard[r][c] = num; setBoard(newBoard)
      playSound(resolveSound(settings?.sound_correct_id))
      if (newBoard.every(row => row.every(cell => cell !== 0))) {
        clearInterval(timerRef.current); setGameComplete(true)
        const score = Math.max(100, 1000 - timer * 2 - mistakes * 50)
        setTimeout(() => handleComplete(score), 1500)
      }
    } else {
      setMistakes(m => m + 1)
      playSound(resolveSound(settings?.sound_wrong_id))
    }
  }

  const useHint = () => {
    if (hints <= 0 || !selectedCell || gameComplete) return
    const [r, c] = selectedCell
    if (board[r][c] !== 0) return
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = solution[r][c]; setBoard(newBoard); setHints(h => h - 1)
    if (newBoard.every(row => row.every(cell => cell !== 0))) {
      clearInterval(timerRef.current); setGameComplete(true)
      const score = Math.max(100, 800 - timer * 2)
      setTimeout(() => handleComplete(score), 1500)
    }
  }

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#0f172a' }

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  if (showIntro) return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
      <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
        <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Sudoku'}</h1>
        {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
        <div style={{ background:'#EFF6FF',borderRadius:12,padding:16,marginBottom:20 }}>
          <p style={{ fontSize:13,color:'#1E40AF',lineHeight:1.6 }}>🔢 Fill the grid so every row, column, and 3×3 box has digits 1-9. Use hints wisely!</p>
        </div>
        <button onClick={startGame} style={{ background:settings?.start_button_bg_color||`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:settings?.start_button_text_color||'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Game →'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Sudoku'}</h2>
      <div style={{ display:'flex',gap:12,marginBottom:12 }}>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>⏱ {formatTime(timer)}</span>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#ef4444' }}>❌ {mistakes}</span>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#22c55e' }}>💡 {hints}</span>
      </div>

      {/* Grid */}
      <div style={{ display:'inline-grid',gridTemplateColumns:'repeat(9,1fr)',gap:1,background:'rgba(255,255,255,0.2)',borderRadius:8,padding:2,marginBottom:12 }}>
        {board.map((row, r) => row.map((cell, c) => {
          const isOriginal = cell !== 0 && board[r][c] === solution[r][c] && cell !== 0
          const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
          const isSameRow = selectedCell?.[0] === r
          const isSameCol = selectedCell?.[1] === c
          const isSameBox = selectedCell && Math.floor(r/3) === Math.floor(selectedCell[0]/3) && Math.floor(c/3) === Math.floor(selectedCell[1]/3)
          const boxBorder = c % 3 === 0 && c > 0 ? '2px solid rgba(255,255,255,0.4)' : c === 0 && r % 3 === 0 && r > 0 ? '2px solid rgba(255,255,255,0.4)' : 'none'
          return (
            <div key={`${r}-${c}`} onClick={() => setSelectedCell([r, c])} style={{
              width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',
              background:isSelected?'rgba(245,158,11,0.4)':(isSameRow||isSameCol||isSameBox)?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)',
              borderRadius:2,cursor:'pointer',border:boxBorder,
              fontSize:cell!==0?16:0,fontWeight:isOriginal?700:400,
              color:isOriginal?'#fff':'#f59e0b',
            }}>{cell || ''}</div>
          )
        }))}
      </div>

      {/* Number pad */}
      <div style={{ display:'flex',gap:6,marginBottom:12 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => placeNumber(n)} style={{
            width:36,height:36,borderRadius:8,border:'none',
            background:primaryColor,color:'#fff',fontSize:16,fontWeight:700,cursor:'pointer',
          }}>{n}</button>
        ))}
        <button onClick={useHint} disabled={hints<=0} style={{
          width:36,height:36,borderRadius:8,border:'none',
          background:hints>0?'#22c55e':'#666',color:'#fff',fontSize:14,cursor:hints>0?'pointer':'not-allowed',
        }}>💡</button>
      </div>

      {gameComplete && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>Puzzle Solved!</h2>
            <p style={{ color:'#666',fontSize:14,marginBottom:20 }}>Time: {formatTime(timer)} | Mistakes: {mistakes}</p>
            <button onClick={() => handleComplete(Math.max(100, 1000 - timer * 2 - mistakes * 50))} style={{ background:settings?.continue_button_bg_color||primaryColor,color:settings?.continue_button_text_color||'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
