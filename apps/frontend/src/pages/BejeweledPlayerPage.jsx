import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const DEFAULT_TILE_COLORS = {
  '2': '#ff6b6b',
  '4': '#4ecdc4',
  '8': '#45b7d1',
  '16': '#f9ca24',
  '32': '#f0932b',
  '64': '#eb4d4b',
  '128': '#574b90',
  '256': '#2c3e50',
  '512': '#34495e',
  '1024': '#2c3e50',
  '2048': '#1a1a2e',
  '4096': '#0f3d3f'
}

export default function BejeweledPlayerPage({ gameData, sessionToken, onComplete }) {
  const params = useParams()
  const navigate = useNavigate()
  const id = gameData?.id || params.id

  const [gameConfig, setGameConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameBoard, setGameBoard] = useState([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [selectedTile, setSelectedTile] = useState(null)
  const [matchEffect, setMatchEffect] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  const gameContainerRef = useRef(null)

  // Load game configuration and start game
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true)

        // Use gameData.id when embedded via PlayerPage, or params.id for standalone
        const gameId = gameData?.id || id

        // Load game config from bejeweled API
        const configResponse = await api.get(`/bejeweled/${gameId}/settings`)
        const config = configResponse.data.settings || configResponse.data

        if (!config || !config.is_active) {
          setError('Game not available')
          return
        }

        setGameConfig(config)

        // Create or get session
        const sessionResponse = await api.post(`/bejeweled/${gameId}/session`, {
          player_id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
        const sessionId = sessionResponse.data.session_id
        setSessionId(sessionId)

        // Initialize game board
        initializeGameBoard(config)

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load game')
        console.error('Game load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, gameData?.id])

  // Initialize game board with logo segments
  const initializeGameBoard = (config) => {
    const size = config.grid_size || 8
    const tileColors = parseTileColors(config.theme_colors)

    // Create board with random tiles from logo colors
    let board = []
    for (let row = 0; row < size; row++) {
      let rowData = []
      for (let col = 0; col < size; col++) {
        // Get random tile value (powers of 2)
        const tileValue = getRandomTileValue()
        rowData.push({
          value: tileValue,
          color: tileColors[tileValue] || tileColors[2],
          matched: false,
          animating: false
        })
      }
      board.push(rowData)
    }

    setGameBoard(board)
    setScore(0)
    setMoves(0)
    setGameOver(false)
  }

  // Parse tile colors from JSON string
  const parseTileColors = (colorsStr) => {
    if (!colorsStr) return { ...DEFAULT_TILE_COLORS }
    if (typeof colorsStr === 'string') {
      try {
        return { ...DEFAULT_TILE_COLORS, ...JSON.parse(colorsStr) }
      } catch {
        return { ...DEFAULT_TILE_COLORS }
      }
    }
    if (typeof colorsStr === 'object') return { ...DEFAULT_TILE_COLORS, ...colorsStr }
    return { ...DEFAULT_TILE_COLORS }
  }

  // Get random tile value (powers of 2)
  const getRandomTileValue = () => {
    const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
    return values[Math.floor(Math.random() * values.length)]
  }

  // Handle tile click
  const handleTileClick = (row, col) => {
    if (gameOver) return

    const tile = gameBoard[row][col]

    // If no tile selected, select this one
    if (!selectedTile) {
      setSelectedTile({ row, col, value: tile.value })
      return
    }

    // If same tile clicked, deselect
    if (selectedTile.row === row && selectedTile.col === col) {
      setSelectedTile(null)
      return
    }

    // Check if tiles are adjacent
    const isAdjacent = (
      Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col ||
      Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row
    )

    if (!isAdjacent) {
      setSelectedTile(null)
      return
    }

    // Swap tiles
    swapTiles(selectedTile.row, selectedTile.col, row, col)
    setSelectedTile(null)
  }

  // Swap two tiles
  const swapTiles = async (row1, col1, row2, col2) => {
    const newBoard = [...gameBoard]

    // Swap in the board
    const temp = newBoard[row1][col1]
    newBoard[row1][col1] = newBoard[row2][col2]
    newBoard[row2][col2] = temp

    setGameBoard(newBoard)

    // Check for matches
    await detectMatches()

    // Update move count
    setMoves(prev => prev + 1)
  }

  // Detect matches and handle chain reactions
  const detectMatches = async () => {
    const newBoard = [...gameBoard]
    const toRemove = []
    let matchCount = 0

    // Check horizontal matches
    for (let row = 0; row < gameBoard.length; row++) {
      for (let col = 0; col < gameBoard[row].length - 2; col++) {
        if (gameBoard[row][col].value === gameBoard[row][col + 1].value &&
            gameBoard[row][col].value === gameBoard[row][col + 2].value) {
          toRemove.push(
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 }
          )
          matchCount += 3
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < gameBoard[0].length; col++) {
      for (let row = 0; row < gameBoard.length - 2; row++) {
        if (gameBoard[row][col].value === gameBoard[row + 1][col].value &&
            gameBoard[row][col].value === gameBoard[row + 2][col].value) {
          toRemove.push(
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col }
          )
          matchCount += 3
        }
      }
    }

    // Remove matched tiles and apply gravity
    if (toRemove.length > 0) {
      // Mark tiles for removal
      toRemove.forEach(pos => {
        newBoard[pos.row][pos.col].matched = true
      })

      // Apply gravity
      for (let col = 0; col < gameBoard[0].length; col++) {
        let emptySpaces = 0
        for (let row = gameBoard.length - 1; row >= 0; row--) {
          if (newBoard[row][col].matched) {
            emptySpaces++
          } else if (emptySpaces > 0) {
            newBoard[row + emptySpaces][col] = newBoard[row][col]
            newBoard[row][col] = { value: 0, color: '#ddd', matched: false, animating: false }
          }
        }

        // Fill top with new tiles
        for (let row = 0; row < emptySpaces; row++) {
          newBoard[row][col] = {
            value: getRandomTileValue(),
            color: gameConfig.theme_colors ? JSON.parse(gameConfig.theme_colors)[newBoard[row][col].value] || DEFAULT_TILE_COLORS[2] : DEFAULT_TILE_COLORS[2],
            matched: false,
            animating: true
          }
        }
      }

      setGameBoard(newBoard)

      // Calculate score
      const baseScore = matchCount * (gameConfig.match_score || 10)
      const chainMultiplier = matchEffect ? (gameConfig.chain_score_multiplier || 2) : 1
      const finalScore = baseScore * chainMultiplier

      setScore(prev => prev + finalScore)

      // Trigger chain reaction if more matches exist
      if (matchEffect) {
        setTimeout(() => {
          detectMatches()
        }, 300)
      } else {
        setMatchEffect(true)
        setTimeout(() => setMatchEffect(false), 300)
      }
    }

    // Check for game over
    const hasMoves = gameBoard.some(row =>
      row.some(tile => tile.value !== 0)
    )
    if (!hasMoves) {
      setGameOver(true)
      saveGameResult()
    }
  }

  // Save game result
  const saveGameResult = async () => {
    if (!sessionId) return

    try {
      await api.put(`/bejeweled/${id}/session/${sessionId}`, {
        score,
        moves,
        status: 'completed'
      })

      // Save move history
      await api.post(`/bejeweled/${id}/move`, {
        session_id: sessionId,
        move_type: 'game_completed',
        position_x: -1,
        position_y: -1
      })

      if (onComplete) onComplete({ score, moves })
    } catch (err) {
      console.error('Failed to save game result:', err)
    }
  }

  // Get tile value display
  const getTileValue = (value) => {
    if (value >= 1000) {
      return Math.floor(value / 1000) + 'k'
    }
    return value
  }

  if (loading) {
    return (
      <div className="gb-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{LIGHT}</style>
        <div style={{ textAlign: 'center', color: 'var(--gb-text2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e6f0', borderTopColor: '#6366f1', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
          Loading Bejeweled Game...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gb-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{LIGHT}</style>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: 'var(--gb-danger)', marginBottom: 8 }}>Game Failed to Load</h2>
          <p style={{ color: 'var(--gb-text2)', marginBottom: 20 }}>{error}</p>
          <button className="gb-btn gb-btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="gb-wrap" style={{ padding: '20px' }}>
      <style>{LIGHT}</style>

      {/* Game Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Logo Bejeweled</h1>
          <div style={{ fontSize: 14, color: 'var(--gb-text2)' }}>
            Match logo segments • Score: {score} • Moves: {moves}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="gb-btn gb-btn-ghost"
            onClick={() => navigate('/arcade')}
            style={{ fontSize: 12 }}
          >
            ← Back to Games
          </button>
          <button
            className="gb-btn gb-btn-danger"
            onClick={() => {
              setGameOver(true)
              saveGameResult()
            }}
            style={{ fontSize: 12 }}
          >
            Give Up
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={gameContainerRef}
        className="gb-phone"
        style={{ margin: '0 auto', position: 'relative' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gameConfig?.grid_size || 8}, 1fr)`,
          gap: '2px',
          padding: '10px',
          background: '#ddd',
          borderRadius: '20px'
        }}>
          {gameBoard.map((row, rowIndex) => (
            row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: tile.color,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tile.value >= 1000 ? '10px' : '14px',
                  fontWeight: 'bold',
                  color: tile.value <= 4 ? '#776e65' : '#f9f6f2',
                  border: tile.matched ? '2px solid #ff4444' : '1px solid rgba(0,0,0,0.1)',
                  cursor: gameOver ? 'default' : 'pointer',
                  transform: tile.animating ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  animation: tile.matched ? 'matchFlash 0.3s ease' : 'none'
                }}
                onClick={() => handleTileClick(rowIndex, colIndex)}
              >
                {tile.value > 0 ? getTileValue(tile.value) : ''}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          borderRadius: '28px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '300px'
          }}>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Game Over!</h2>
            <div style={{ fontSize: 16, marginBottom: 20 }}>
              <div>Score: {score}</div>
              <div>Moves: {moves}</div>
              <div>Best Score: {bestScore}</div>
            </div>
            <button
              className="gb-btn gb-btn-primary"
              onClick={() => {
                initializeGameBoard(gameConfig)
                setGameOver(false)
              }}
              style={{ marginRight: '10px' }}
            >
              Play Again
            </button>
            <button
              className="gb-btn gb-btn-ghost"
              onClick={() => navigate('/arcade')}
            >
              Back to Games
            </button>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes matchFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gravity {
          from { transform: translateY(0); }
          to { transform: translateY(20px); }
        }
      `}</style>
    </div>
  )
}

const LIGHT = `
.gb-wrap {
  --gb-bg:        #f4f6fb;
  --gb-surface:   #ffffff;
  --gb-surface2:  #f0f2f8;
  --gb-border:    #e2e6f0;
  --gb-border2:   #cdd3e0;
  --gb-primary:   #6366f1;
  --gb-primary-d: #4f46e5;
  --gb-primary-g: rgba(99,102,241,0.15);
  --gb-success:   #16a34a;
  --gb-danger:    #dc2626;
  --gb-text:      #1e1e2e;
  --gb-text2:     #64657a;
  --gb-text3:     #9899ae;
  --gb-shadow:    0 2px 12px rgba(0,0,0,0.08);
  --gb-shadow-md: 0 4px 24px rgba(0,0,0,0.10);
  --gb-radius:    12px;
  --gb-radius-sm: 8px;
  font-family: 'DM Sans', sans-serif;
  background: var(--gb-bg);
  color: var(--gb-text);
  min-height: 100vh;
}
`;