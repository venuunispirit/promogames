import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) {
  if (!url) return
  try {
    const a = new Audio(url)
    a.play().catch(() => {})
  } catch {}
}

const DIFFICULTY_TAPS = { easy: 1, medium: 2, hard: 3 }

function generateBoard(rows, cols, blockColors, screwsPerBlock, difficulty, emptyHoles) {
  const colors = (blockColors || '#8B4513,#A0522D,#CD853F,#D2691E,#B8860B').split(',').map(s => s.trim()).filter(Boolean)
  const tapsNeeded = DIFFICULTY_TAPS[difficulty] || 1

  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r, col: c, blockId: null, hasScrew: false, isEmpty: true }))
  )
  const blocks = []
  const occupied = new Set()
  let blockId = 0

  const totalCells = rows * cols
  const targetCovered = totalCells - (emptyHoles || 0)
  let covered = 0
  let attempts = 0
  const maxAttempts = 500

  while (covered < targetCovered && attempts < maxAttempts) {
    attempts++
    const w = Math.random() > 0.4 ? 2 : 1
    const h = w === 1 && Math.random() > 0.5 ? 2 : 1

    const sr = Math.floor(Math.random() * (rows - h + 1))
    const sc = Math.floor(Math.random() * (cols - w + 1))

    let fits = true
    for (let dr = 0; dr < h && fits; dr++)
      for (let dc = 0; dc < w && fits; dc++)
        if (occupied.has(`${sr + dr},${sc + dc}`)) fits = false

    if (!fits) continue

    const cells = []
    for (let dr = 0; dr < h; dr++)
      for (let dc = 0; dc < w; dc++) {
        const key = `${sr + dr},${sc + dc}`
        occupied.add(key)
        cells.push({ row: sr + dr, col: sc + dc })
        grid[sr + dr][sc + dc].blockId = blockId
        grid[sr + dr][sc + dc].isEmpty = false
      }

    const numScrews = Math.min(screwsPerBlock, cells.length)
    const shuffled = [...cells].sort(() => Math.random() - 0.5)
    const screws = []
    for (let s = 0; s < numScrews; s++) {
      screws.push({ row: shuffled[s].row, col: shuffled[s].col, tapsRemaining: tapsNeeded })
      grid[shuffled[s].row][shuffled[s].col].hasScrew = true
    }

    blocks.push({
      id: blockId,
      row: sr, col: sc,
      width: w, height: h,
      color: colors[blockId % colors.length],
      cells, screws,
      screwCount: numScrews,
      falling: false, fallen: false,
    })
    blockId++
    covered += cells.length
  }

  return { grid, blocks }
}

export default function ScrewPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const completedRef = useRef(false)

  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])

  const primaryColor = settings?.primary_color || '#8B4513'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const boardRows = parseInt(settings?.board_rows) || 6
  const boardCols = parseInt(settings?.board_cols) || 6
  const screwsPerBlock = parseInt(settings?.screws_per_block) || 2
  const emptyHolesCount = parseInt(settings?.empty_holes) || 3
  const difficulty = settings?.difficulty || 'medium'
  const revealImageUrl = settings?.reveal_image_url
  const revealText = settings?.reveal_text || '🎉 Revealed!'
  const showTimer = settings?.show_timer
  const timeLimit = parseInt(settings?.time_limit_seconds) || 120
  const blockColorsRaw = settings?.block_colors || '#8B4513,#A0522D,#CD853F,#D2691E,#B8860B'

  const [gameState, setGameState] = useState('intro')
  const [board, setBoard] = useState(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [screwsRemoved, setScrewsRemoved] = useState(0)
  const [blocksCleared, setBlocksCleared] = useState(0)
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [tappingScrew, setTappingScrew] = useState(null)
  const [showReveal, setShowReveal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#f0e6d3' }

  const cellSize = Math.min(52, Math.floor((Math.min(window.innerWidth - 40, 420)) / Math.max(boardCols, 1)))

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        await fetch('/api/play/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score: blocksCleared, player_data: {} }),
        })
      }
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, blocksCleared])

  const handleStart = () => {
    const b = generateBoard(boardRows, boardCols, blockColorsRaw, screwsPerBlock, difficulty, emptyHolesCount)
    setBoard(b)
    setTotalBlocks(b.blocks.length)
    setBlocksCleared(0)
    setScrewsRemoved(0)
    setTimeLeft(timeLimit)
    setTappingScrew(null)
    setShowReveal(false)
    completedRef.current = false
    setGameState('playing')
  }

  const handleScrewTap = (row, col) => {
    if (gameState !== 'playing' || !board) return

    const cell = board.grid[row][col]
    if (!cell.hasScrew || cell.blockId === null) return

    const block = board.blocks.find(b => b.id === cell.blockId)
    if (!block || block.falling || block.fallen) return

    const screw = block.screws.find(s => s.row === row && s.col === col)
    if (!screw) return

    setTappingScrew({ row, col })
    setTimeout(() => setTappingScrew(null), 400)
    playSound(resolveSound(settings?.sound_screw_id))

    const newBoard = JSON.parse(JSON.stringify(board))
    const newBlock = newBoard.blocks.find(b => b.id === block.id)
    const newScrew = newBlock.screws.find(s => s.row === row && s.col === col)

    newScrew.tapsRemaining--

    if (newScrew.tapsRemaining <= 0) {
      newBlock.screws = newBlock.screws.filter(s => !(s.row === row && s.col === col))
      newBlock.screwCount--
      newBoard.grid[row][col].hasScrew = false
      setScrewsRemoved(prev => prev + 1)

      if (newBlock.screwCount <= 0) {
        newBlock.falling = true
        playSound(resolveSound(settings?.sound_fall_id))

        setTimeout(() => {
          setBoard(prev => {
            const nb = JSON.parse(JSON.stringify(prev))
            const bl = nb.blocks.find(b => b.id === block.id)
            if (bl) {
              bl.falling = false
              bl.fallen = true
              for (const c of bl.cells) {
                nb.grid[c.row][c.col].blockId = null
                nb.grid[c.row][c.col].isEmpty = true
                nb.grid[c.row][c.col].hasScrew = false
              }
              bl.screws = []
            }
            return nb
          })
          setBlocksCleared(prev => prev + 1)
        }, 600)
      }
    }

    setBoard(newBoard)
  }

  useEffect(() => {
    if (gameState !== 'playing') return
    if (!showTimer || timeLimit <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState('timeup')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState, showTimer, timeLimit])

  useEffect(() => {
    if (gameState !== 'playing' || !board) return
    const allFallen = board.blocks.length > 0 && board.blocks.every(b => b.fallen)
    if (allFallen) {
      setGameState('won')
    }
  }, [board, gameState])

  useEffect(() => {
    if (gameState === 'won' && !showReveal) {
      playSound(resolveSound(settings?.sound_reveal_id))
      setShowReveal(true)
      const timer = setTimeout(() => handleComplete(), 3000)
      return () => clearTimeout(timer)
    }
  }, [gameState, showReveal, settings, resolveSound, handleComplete])

  if (gameState === 'intro') {
    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: ff }}>
        <div style={{ width: '100%', maxWidth: 440, padding: 'clamp(24px,6vw,36px)', borderRadius: 28, background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(28px)', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', textAlign: 'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth: '100%', maxHeight: 60, marginBottom: 16, objectFit: 'contain' }} />}
          <h1 style={{ fontSize: 'clamp(22px,6vw,30px)', fontWeight: 800, color: settings?.heading_1_color || '#1a1a2e', marginBottom: 8, fontFamily: ff }}>{settings?.heading_1 || 'Screw & Reveal'}</h1>
          {settings?.heading_2 && <p style={{ fontSize: 15, fontWeight: 600, color: settings?.heading_2_color || '#666', marginBottom: 8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize: 13, color: settings?.heading_3_color || '#888', marginBottom: 16 }}>{settings.heading_3}</p>}
          <div style={{ background: '#f5f0eb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: settings?.description_color || '#5D4037', marginBottom: 6 }}>{settings?.description_text || 'How to Play'}</p>
            <p style={{ fontSize: 12, color: settings?.intro_text_color || '#8D6E63', lineHeight: 1.6 }}>{settings?.intro_text || 'Tap each screw to unscrew it. Keep tapping until it comes out! When all screws on a block are removed, the block falls away. Clear every block to reveal the hidden image.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            <div style={{ background: 'rgba(139,69,19,0.08)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#8D6E63' }}>BOARD</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5D4037' }}>{boardRows}x{boardCols}</div>
            </div>
            <div style={{ background: 'rgba(139,69,19,0.08)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#8D6E63' }}>SCREWS</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5D4037' }}>{screwsPerBlock}/blk</div>
            </div>
            <div style={{ background: 'rgba(139,69,19,0.08)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#8D6E63' }}>DIFFICULTY</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5D4037' }}>{difficulty}</div>
            </div>
          </div>
          {showTimer && timeLimit > 0 && (
            <div style={{ background: 'rgba(139,69,19,0.08)', borderRadius: 10, padding: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#8D6E63' }}>TIME LIMIT</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5D4037' }}>{timeLimit}s</div>
            </div>
          )}
          {settings?.terms_enabled ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16, textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, accentColor: primaryColor }}
              />
              <span style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                {settings?.terms_text || 'I agree to the Terms & Conditions'}
                {settings?.terms_url && (
                  <a href={settings.terms_url} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'underline', marginLeft: 4 }}>
                    View Terms
                  </a>
                )}
              </span>
            </div>
          ) : null}
          <button onClick={handleStart} disabled={settings?.terms_enabled && !termsAccepted} style={{ background: settings?.start_button_bg_color ? `linear-gradient(135deg,${settings.start_button_bg_color},${settings.start_button_bg_color}cc)` : `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, color: settings?.start_button_text_color || '#fff', border: 'none', borderRadius: 12, padding: '15px 36px', fontSize: 16, fontWeight: 700, cursor: settings?.terms_enabled && !termsAccepted ? 'not-allowed' : 'pointer', fontFamily: ff, boxShadow: `0 6px 20px ${primaryColor}44`, width: '100%', maxWidth: 280, opacity: settings?.terms_enabled && !termsAccepted ? 0.5 : 1 }}>
            {settings?.start_button_text || 'Start Revealing'}
          </button>
        </div>
      </div>
    )
  }

  if (!board) return null

  const remainingBlocks = board.blocks.filter(b => !b.fallen).length
  const progress = totalBlocks > 0 ? Math.round(((totalBlocks - remainingBlocks) / totalBlocks) * 100) : 0

  return (
    <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: ff, padding: '12px 16px', userSelect: 'none' }}>
      {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ height: 40, marginBottom: 4, objectFit: 'contain' }} />}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: settings?.heading_1_color || '#1a1a2e', marginBottom: 4, textAlign: 'center' }}>{settings?.heading_1 || 'Screw & Reveal'}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: primaryColor }}>🔩 {screwsRemoved}</span>
          <span style={{ fontSize: 12, color: '#888' }}>removed</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: '8px 16px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>📦 {blocksCleared}/{totalBlocks} blocks</span>
        </div>
        {showTimer && timeLimit > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: '8px 16px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: timeLeft <= 15 ? '#ef4444' : '#888' }}>
              ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 400, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${primaryColor},#d4a574)`, borderRadius: 6, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${boardCols},${cellSize}px)`, gap: 2, padding: 6, background: '#8B7355', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)' }}>
        {Array.from({ length: boardRows }, (_, r) =>
          Array.from({ length: boardCols }, (_, c) => {
            const cell = board.grid[r][c]
            const block = cell.blockId !== null ? board.blocks.find(b => b.id === cell.blockId) : null
            const isEmpty = cell.isEmpty
            const isScrew = cell.hasScrew
            const isTapping = tappingScrew?.row === r && tappingScrew?.col === c

            if (block && block.fallen) {
              return <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize, borderRadius: 4, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }} />
            }

            if (block && block.falling) {
              return (
                <div key={`${r}-${c}`} style={{
                  width: cellSize, height: cellSize, borderRadius: 4,
                  background: block.color,
                  opacity: 0.5, transform: 'translateY(20px)',
                  transition: 'all 0.6s ease',
                  border: '2px solid rgba(255,255,255,0.3)',
                }} />
              )
            }

            const screwInBlock = block ? block.screws.find(s => s.row === r && s.col === c) : null
            const tapsLeft = screwInBlock ? screwInBlock.tapsRemaining : 0
            const isTopLeft = block && r === block.row && c === block.col

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleScrewTap(r, c)}
                style={{
                  width: cellSize, height: cellSize, borderRadius: 4,
                  cursor: isScrew && block && !block.falling ? 'pointer' : 'default',
                  position: 'relative', overflow: 'hidden',
                  background: isTopLeft ? block.color : isEmpty ? 'rgba(139,115,85,0.3)' : block ? `${block.color}40` : 'rgba(139,115,85,0.15)',
                  border: isTapping ? '2px solid #F59E0B' : isScrew ? '1.5px solid rgba(139,69,19,0.4)' : '1px solid rgba(139,69,19,0.15)',
                  boxShadow: isTapping ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isTopLeft && (
                  <div style={{
                    position: 'absolute', inset: 0, background: block.color,
                    borderRadius: 3, opacity: 0.9,
                  }} />
                )}

                {isScrew && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: `translate(-50%,-50%) ${isTapping ? 'rotate(30deg) scale(1.15)' : 'rotate(0deg)'}`,
                    width: cellSize * 0.45, height: cellSize * 0.45,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#A0522D,#6B3A1F)',
                    border: `2px solid ${isTapping ? '#F59E0B' : '#4A2810'}`,
                    boxShadow: `0 1px 3px rgba(0,0,0,0.3)${isTapping ? ', 0 0 8px rgba(245,158,11,0.4)' : ''}`,
                    zIndex: 3,
                    transition: 'transform 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      position: 'absolute',
                      width: '60%', height: 2,
                      background: '#3D1E0C',
                      borderRadius: 1,
                      transform: 'rotate(0deg)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      width: 2, height: '60%',
                      background: '#3D1E0C',
                      borderRadius: 1,
                      transform: 'rotate(0deg)',
                    }} />
                    <div style={{
                      width: cellSize * 0.1, height: cellSize * 0.1,
                      borderRadius: '50%', background: '#4A2810',
                      zIndex: 1,
                    }} />
                    {tapsLeft > 1 && (
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2,
                        background: '#F59E0B', color: '#fff',
                        fontSize: 7, fontWeight: 700,
                        width: 12, height: 12,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 4, lineHeight: 1,
                      }}>
                        {tapsLeft}
                      </div>
                    )}
                  </div>
                )}

                {isEmpty && !isScrew && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: cellSize * 0.3, height: cellSize * 0.3,
                    borderRadius: '50%',
                    background: 'rgba(93,58,26,0.15)',
                    border: '1px dashed rgba(93,58,26,0.2)',
                  }} />
                )}
              </div>
            )
          })
        )}
      </div>

      <p style={{ fontSize: 11, color: '#8D6E63', marginTop: 12, textAlign: 'center' }}>
        Tap screws to unscrew them. Remove all screws from a block to make it fall!
      </p>

      {gameState === 'won' && showReveal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', animation: 'revealFade 0.5s ease' }}>
          <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 420, width: '100%' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'revealBounce 0.8s ease' }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, animation: 'revealSlide 0.6s ease 0.3s both' }}>{revealText}</h2>
            {revealImageUrl && (
              <div style={{ animation: 'revealZoom 0.8s ease 0.5s both', marginBottom: 20 }}>
                <img src={revealImageUrl} alt="Revealed" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} />
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 }}>
              {blocksCleared} blocks cleared | {screwsRemoved} screws removed
            </p>
            <button onClick={handleComplete} style={{ background: settings?.continue_button_bg_color ? `linear-gradient(135deg,${settings.continue_button_bg_color},${settings.continue_button_bg_color}cc)` : `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, color: settings?.continue_button_text_color || '#fff', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: ff, boxShadow: `0 8px 28px ${primaryColor}55`, width: '100%', maxWidth: 280 }}>
              {settings?.continue_button_text || 'Continue'}
            </button>
          </div>
        </div>
      )}

      {gameState === 'timeup' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 28, padding: 'clamp(28px,7vw,44px)', maxWidth: 400, width: '100%', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Time's Up!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 }}>
              Cleared {blocksCleared} of {totalBlocks} blocks · {screwsRemoved} screws removed
            </p>
            <button onClick={handleComplete} style={{ background: settings?.continue_button_bg_color ? `linear-gradient(135deg,${settings.continue_button_bg_color},${settings.continue_button_bg_color}cc)` : `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, color: settings?.continue_button_text_color || '#fff', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: ff, boxShadow: `0 8px 28px ${primaryColor}55`, width: '100%' }}>
              {settings?.continue_button_text || 'Continue'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes revealFade { from{opacity:0} to{opacity:1} }
        @keyframes revealBounce { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes revealSlide { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealZoom { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}
