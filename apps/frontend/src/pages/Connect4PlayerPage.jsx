import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const ROWS = 6
const COLS = 7
const WIN = 4

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function checkWin(board, row, col, player) {
  const directions = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr, dc] of directions) {
    let count = 1
    for (let i = 1; i < WIN; i++) {
      const r = row + dr * i, c = col + dc * i
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++
      else break
    }
    for (let i = 1; i < WIN; i++) {
      const r = row - dr * i, c = col - dc * i
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++
      else break
    }
    if (count >= WIN) return true
  }
  return false
}

function isBoardFull(board) {
  return board[0].every(cell => cell !== 0)
}

function getValidRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r
  }
  return -1
}

function aiMove(board, difficulty) {
  const validCols = []
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) validCols.push(c)
  }
  if (validCols.length === 0) return -1

  if (difficulty === 'easy') {
    return validCols[Math.floor(Math.random() * validCols.length)]
  }

  // Check if AI can win
  for (const c of validCols) {
    const r = getValidRow(board, c)
    board[r][c] = 2
    if (checkWin(board, r, c, 2)) { board[r][c] = 0; return c }
    board[r][c] = 0
  }

  // Check if player can win (block)
  for (const c of validCols) {
    const r = getValidRow(board, c)
    board[r][c] = 1
    if (checkWin(board, r, c, 1)) { board[r][c] = 0; return c }
    board[r][c] = 0
  }

  // Center preference
  if (validCols.includes(3)) return 3

  // Random from remaining
  return validCols[Math.floor(Math.random() * validCols.length)]
}

export default function Connect4PlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])

  const primaryColor = settings?.primary_color || '#3b82f6'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const playerColor = settings?.player_color || '#ef4444'
  const aiColor = settings?.ai_color || '#fbbf24'
  const boardColor = settings?.board_color || '#3b82f6'
  const difficulty = settings?.difficulty || 'medium'

  const [showIntro, setShowIntro] = useState(true)
  const [board, setBoard] = useState(createBoard())
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [winCells, setWinCells] = useState([])
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const [lastMove, setLastMove] = useState(null)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async (result) => {
    if (completedRef.current) return
    completedRef.current = true
    const score = result === 'win' ? 100 : result === 'draw' ? 50 : 0
    try {
      if (sessionToken) {
        await fetch('/api/play/session/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score, player_data: { result, wins: scores.player, losses: scores.ai } })
        })
      }
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, scores])

  const handleStart = () => {
    setShowIntro(false)
    setBoard(createBoard())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(null)
    setWinCells([])
    setLastMove(null)
    completedRef.current = false
  }

  const dropPiece = useCallback((col) => {
    if (gameOver || currentPlayer !== 1) return
    const row = getValidRow(board, col)
    if (row === -1) return

    const newBoard = board.map(r => [...r])
    newBoard[row][col] = 1
    setBoard(newBoard)
    setLastMove({ row, col, player: 1 })
    playSound(resolveSound(settings?.sound_drop_id))

    if (checkWin(newBoard, row, col, 1)) {
      playSound(resolveSound(settings?.sound_win_id))
      setWinner(1)
      setGameOver(true)
      setScores(s => ({ ...s, player: s.player + 1 }))
      setTimeout(() => handleComplete('win'), 1500)
      return
    }

    if (isBoardFull(newBoard)) {
      playSound(resolveSound(settings?.sound_draw_id))
      setWinner(0)
      setGameOver(true)
      setTimeout(() => handleComplete('draw'), 1500)
      return
    }

    setCurrentPlayer(2)
  }, [board, currentPlayer, gameOver, settings, resolveSound, handleComplete])

  useEffect(() => {
    if (currentPlayer !== 2 || gameOver) return
    const timer = setTimeout(() => {
      const col = aiMove(board.map(r => [...r]), difficulty)
      if (col === -1) return

      const newBoard = board.map(r => [...r])
      const row = getValidRow(newBoard, col)
      newBoard[row][col] = 2
      setBoard(newBoard)
      setLastMove({ row, col, player: 2 })
      playSound(resolveSound(settings?.sound_drop_id))

      if (checkWin(newBoard, row, col, 2)) {
        playSound(resolveSound(settings?.sound_win_id))
        setWinner(2)
        setGameOver(true)
        setScores(s => ({ ...s, ai: s.ai + 1 }))
        setTimeout(() => handleComplete('lose'), 1500)
        return
      }

      if (isBoardFull(newBoard)) {
        playSound(resolveSound(settings?.sound_draw_id))
        setWinner(0)
        setGameOver(true)
        setTimeout(() => handleComplete('draw'), 1500)
        return
      }

      setCurrentPlayer(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentPlayer, gameOver, board, difficulty, settings, resolveSound, handleComplete])

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#0f172a' }

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
        <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Connect 4'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
          <div style={{ background:'#EEF2FF',borderRadius:12,padding:16,marginBottom:20 }}>
            <p style={{ fontSize:13,color:'#4338CA',lineHeight:1.6 }}>🔴 Drop discs to connect 4 in a row! Beat the AI to win.</p>
          </div>
          <div style={{ display:'flex',gap:12,justifyContent:'center',marginBottom:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600 }}>
              <div style={{ width:20,height:20,borderRadius:'50%',background:playerColor }} />
              <span>You</span>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600 }}>
              <div style={{ width:20,height:20,borderRadius:'50%',background:aiColor }} />
              <span>AI</span>
            </div>
          </div>
          <button onClick={handleStart} style={{ background: settings?.start_button_bg_color || `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color: settings?.start_button_text_color || '#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 6px 20px ${primaryColor}44`,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Game →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center',textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>{settings?.heading_1||'Connect 4'}</h2>

      <div style={{ display:'flex',gap:16,marginBottom:12,alignItems:'center' }}>
        <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px' }}>
          <div style={{ width:14,height:14,borderRadius:'50%',background:playerColor }} />
          <span style={{ fontSize:13,fontWeight:700,color:'#fff' }}>You: {scores.player}</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px' }}>
          <div style={{ width:14,height:14,borderRadius:'50%',background:aiColor }} />
          <span style={{ fontSize:13,fontWeight:700,color:'#fff' }}>AI: {scores.ai}</span>
        </div>
      </div>

      {!gameOver && (
        <div style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',marginBottom:8 }}>
          <span style={{ fontSize:13,fontWeight:600,color:'#fff' }}>
            {currentPlayer === 1 ? '🔴 Your turn' : '🟡 AI thinking...'}
          </span>
        </div>
      )}

      <div style={{ display:'inline-grid',gridTemplateColumns:`repeat(${COLS},1fr)`,gap:6,padding:12,background:boardColor,borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const cell = board[r][c]
            const isLast = lastMove?.row === r && lastMove?.col === c
            const isWinCell = winCells.some(([wr, wc]) => wr === r && wc === c)
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => dropPiece(c)}
                style={{
                  width:48,height:48,borderRadius:'50%',
                  background: cell === 1 ? playerColor : cell === 2 ? aiColor : 'rgba(0,0,0,0.3)',
                  cursor: cell === 0 && currentPlayer === 1 && !gameOver ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  boxShadow: isWinCell ? `0 0 12px ${cell === 1 ? playerColor : aiColor}` : isLast ? '0 0 8px rgba(255,255,255,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  transform: isWinCell ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            )
          })
        )}
      </div>

      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>
              {winner === 1 ? '🎉' : winner === 2 ? '😔' : '🤝'}
            </div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>
              {winner === 1 ? 'You Win!' : winner === 2 ? 'AI Wins!' : 'Draw!'}
            </h2>
            <p style={{ color:'#666',fontSize:14,marginBottom:20 }}>
              {winner === 1 ? 'Great job beating the AI!' : winner === 2 ? 'Better luck next time!' : 'Nobody wins this round.'}
            </p>
            <button onClick={() => handleComplete(winner === 1 ? 'win' : winner === 2 ? 'lose' : 'draw')} style={{ background: settings?.continue_button_bg_color || primaryColor,color: settings?.continue_button_text_color || '#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>
              {settings?.continue_button_text||'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
