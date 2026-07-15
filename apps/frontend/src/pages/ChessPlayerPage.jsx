import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

/* ══════════════════════════════════════════════════════════════════
   CHESS.JS — Pure JS chess engine (move generation, validation, check/mate detection)
   ══════════════════════════════════════════════════════════════════ */

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

const PST_PAWN = [
  0,0,0,0,0,0,0,0,
  50,50,50,50,50,50,50,50,
  10,10,20,30,30,20,10,10,
  5,5,10,25,25,10,5,5,
  0,0,0,20,20,0,0,0,
  5,-5,-10,0,0,-10,-5,5,
  5,10,10,-20,-20,10,10,5,
  0,0,0,0,0,0,0,0
]

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,0,0,0,0,-20,-40,
  -30,0,10,15,15,10,0,-30,
  -30,5,15,20,20,15,5,-30,
  -30,0,15,20,20,15,0,-30,
  -30,5,10,15,15,10,5,-30,
  -40,-20,0,5,5,0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
]

const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,0,0,0,0,0,0,-10,
  -10,0,10,10,10,10,0,-10,
  -10,5,5,10,10,5,5,-10,
  -10,0,10,10,10,10,0,-10,
  -10,10,10,10,10,10,10,-10,
  -10,5,0,0,0,0,5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
]

const PST_ROOK = [
  0,0,0,0,0,0,0,0,
  5,10,10,10,10,10,10,5,
  -5,0,0,0,0,0,0,-5,
  -5,0,0,0,0,0,0,-5,
  -5,0,0,0,0,0,0,-5,
  -5,0,0,0,0,0,0,-5,
  -5,0,0,0,0,0,0,-5,
  0,0,0,5,5,0,0,0
]

const PST_QUEEN = [
  -20,-10,-10,-5,-5,-10,-10,-20,
  -10,0,0,0,0,0,0,-10,
  -10,0,5,5,5,5,0,-10,
  -5,0,5,5,5,5,0,-5,
  0,0,5,5,5,5,0,-5,
  -10,5,5,5,5,5,0,-10,
  -10,0,5,0,0,0,0,-10,
  -20,-10,-10,-5,-5,-10,-10,-20
]

const PST_KING_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20,20,0,0,0,0,20,20,
  20,30,10,0,0,10,30,20
]

const PST = { p: PST_PAWN, n: PST_KNIGHT, b: PST_BISHOP, r: PST_ROOK, q: PST_QUEEN, k: PST_KING_MID }

class ChessEngine {
  constructor(fen) {
    this.load(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  }

  load(fen) {
    this.fen = fen
    const parts = fen.split(' ')
    const rows = parts[0].split('/')
    this.board = []
    for (let r = 0; r < 8; r++) {
      this.board[r] = []
      let c = 0
      for (const ch of rows[r]) {
        if (ch >= '1' && ch <= '8') {
          for (let i = 0; i < parseInt(ch); i++) this.board[r][c++] = null
        } else {
          this.board[r][c++] = ch
        }
      }
    }
    this.turn = parts[1] || 'w'
    this.castling = parts[2] || '-'
    this.enPassant = parts[3] || '-'
    this.halfmove = parseInt(parts[4]) || 0
    this.fullmove = parseInt(parts[5]) || 1
    this.moveHistory = []
  }

  toFen() {
    let fen = ''
    for (let r = 0; r < 8; r++) {
      let empty = 0
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c]) {
          if (empty > 0) { fen += empty; empty = 0 }
          fen += this.board[r][c]
        } else {
          empty++
        }
      }
      if (empty > 0) fen += empty
      if (r < 7) fen += '/'
    }
    return `${fen} ${this.turn} ${this.castling || '-'} ${this.enPassant || '-'} ${this.halfmove} ${this.fullmove}`
  }

  pieceAt(r, c) { return (r >= 0 && r < 8 && c >= 0 && c < 8) ? this.board[r][c] : undefined }
  isWhite(p) { return p && p === p.toUpperCase() }
  isBlack(p) { return p && p === p.toLowerCase() }
  colorOf(p) { return p ? (this.isWhite(p) ? 'w' : 'b') : null }

  findKing(color) {
    const k = color === 'w' ? 'K' : 'k'
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board[r][c] === k) return [r, c]
    return null
  }

  isAttackedBy(r, c, attackerColor) {
    // Check pawn attacks
    const pawnDir = attackerColor === 'w' ? 1 : -1
    const pawn = attackerColor === 'w' ? 'P' : 'p'
    for (const dc of [-1, 1]) {
      const pr = r + pawnDir, pc = c + dc
      if (this.pieceAt(pr, pc) === pawn) return true
    }
    // Check knight attacks
    const knight = attackerColor === 'w' ? 'N' : 'n'
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      if (this.pieceAt(r+dr, c+dc) === knight) return true
    }
    // Check king attacks
    const king = attackerColor === 'w' ? 'K' : 'k'
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        if (this.pieceAt(r+dr, c+dc) === king) return true
      }
    // Check sliding pieces (bishop, rook, queen)
    const bishop = attackerColor === 'w' ? 'B' : 'b'
    const rook = attackerColor === 'w' ? 'R' : 'r'
    const queen = attackerColor === 'w' ? 'Q' : 'q'
    const bishopDirs = [[-1,-1],[-1,1],[1,-1],[1,1]]
    const rookDirs = [[-1,0],[1,0],[0,-1],[0,1]]
    for (const [dr, dc] of bishopDirs) {
      for (let i = 1; i < 8; i++) {
        const p = this.pieceAt(r+dr*i, c+dc*i)
        if (p === undefined) break
        if (p) { if (p === bishop || p === queen) return true; break }
      }
    }
    for (const [dr, dc] of rookDirs) {
      for (let i = 1; i < 8; i++) {
        const p = this.pieceAt(r+dr*i, c+dc*i)
        if (p === undefined) break
        if (p) { if (p === rook || p === queen) return true; break }
      }
    }
    return false
  }

  isInCheck(color) {
    const kingPos = this.findKing(color)
    if (!kingPos) return false
    return this.isAttackedBy(kingPos[0], kingPos[1], color === 'w' ? 'b' : 'w')
  }

  generatePseudoLegalMoves(color) {
    const moves = []
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c]
        if (!p || this.colorOf(p) !== color) continue
        const type = p.toLowerCase()

        if (type === 'p') {
          const dir = color === 'w' ? -1 : 1
          const startRow = color === 'w' ? 6 : 1
          const promoRow = color === 'w' ? 0 : 7
          // Forward
          if (!this.pieceAt(r+dir, c)) {
            if (r+dir === promoRow) {
              for (const promo of ['q','r','b','n']) moves.push({ from:[r,c], to:[r+dir,c], promotion: promo })
            } else {
              moves.push({ from:[r,c], to:[r+dir,c] })
              // Double push
              if (r === startRow && !this.pieceAt(r+2*dir, c)) {
                moves.push({ from:[r,c], to:[r+2*dir,c], doublePush: true })
              }
            }
          }
          // Captures
          for (const dc of [-1, 1]) {
            const tr = r+dir, tc = c+dc
            const target = this.pieceAt(tr, tc)
            if (target && this.colorOf(target) !== color) {
              if (tr === promoRow) {
                for (const promo of ['q','r','b','n']) moves.push({ from:[r,c], to:[tr,tc], capture: true, promotion: promo })
              } else {
                moves.push({ from:[r,c], to:[tr,tc], capture: true })
              }
            }
            // En passant
            if (this.enPassant !== '-') {
              const epC = 'abcdefgh'.indexOf(this.enPassant[0])
              const epR = 8 - parseInt(this.enPassant[1])
              if (tr === epR && tc === epC) {
                moves.push({ from:[r,c], to:[tr,tc], enPassant: true, capture: true })
              }
            }
          }
        } else if (type === 'n') {
          for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
            const tr=r+dr, tc=c+dc
            if (tr<0||tr>7||tc<0||tc>7) continue
            const target = this.pieceAt(tr,tc)
            if (!target || this.colorOf(target) !== color) moves.push({ from:[r,c], to:[tr,tc], capture: !!target })
          }
        } else if (type === 'k') {
          for (let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
            if (dr===0&&dc===0) continue
            const tr=r+dr, tc=c+dc
            if (tr<0||tr>7||tc<0||tc>7) continue
            const target = this.pieceAt(tr,tc)
            if (!target || this.colorOf(target) !== color) moves.push({ from:[r,c], to:[tr,tc], capture: !!target })
          }
          // Castling
          const row = color === 'w' ? 7 : 0
          if (r === row && c === 4) {
            // Kingside
            if (this.castling.includes(color === 'w' ? 'K' : 'k')) {
              if (!this.pieceAt(row,5) && !this.pieceAt(row,6) &&
                  !this.isAttackedBy(row,4,'b') && !this.isAttackedBy(row,5,'b') && !this.isAttackedBy(row,6,'b')) {
                moves.push({ from:[r,c], to:[row,6], castle: 'k' })
              }
            }
            // Queenside
            if (this.castling.includes(color === 'w' ? 'Q' : 'q')) {
              if (!this.pieceAt(row,3) && !this.pieceAt(row,2) && !this.pieceAt(row,1) &&
                  !this.isAttackedBy(row,4,'b') && !this.isAttackedBy(row,3,'b') && !this.isAttackedBy(row,2,'b')) {
                moves.push({ from:[r,c], to:[row,2], castle: 'q' })
              }
            }
          }
        } else {
          // Sliding: bishop, rook, queen
          let dirs = []
          if (type === 'b' || type === 'q') dirs.push(...[[-1,-1],[-1,1],[1,-1],[1,1]])
          if (type === 'r' || type === 'q') dirs.push(...[[-1,0],[1,0],[0,-1],[0,1]])
          for (const [dr,dc] of dirs) {
            for (let i=1;i<8;i++) {
              const tr=r+dr*i, tc=c+dc*i
              if (tr<0||tr>7||tc<0||tc>7) break
              const target = this.pieceAt(tr,tc)
              if (!target) { moves.push({ from:[r,c], to:[tr,tc] }) }
              else {
                if (this.colorOf(target) !== color) moves.push({ from:[r,c], to:[tr,tc], capture: true })
                break
              }
            }
          }
        }
      }
    }
    return moves
  }

  makeMove(move) {
    const saved = {
      board: this.board.map(r => [...r]),
      fen: this.fen, turn: this.turn, castling: this.castling,
      enPassant: this.enPassant, halfmove: this.halfmove, fullmove: this.fullmove
    }
    const [fr,fc] = move.from
    const [tr,tc] = move.to
    const piece = this.board[fr][fc]
    const captured = this.board[tr][tc]

    // En passant capture
    if (move.enPassant) {
      const epRow = this.turn === 'w' ? tr + 1 : tr - 1
      this.board[epRow][tc] = null
    }

    this.board[tr][tc] = move.promotion ? (this.turn === 'w' ? move.promotion.toUpperCase() : move.promotion.toLowerCase()) : piece
    this.board[fr][fc] = null

    // Castling move rook
    if (move.castle) {
      const row = this.turn === 'w' ? 7 : 0
      if (move.castle === 'k') { this.board[row][5] = this.board[row][7]; this.board[row][7] = null }
      else { this.board[row][3] = this.board[row][0]; this.board[row][0] = null }
    }

    // Update en passant
    if (move.doublePush) {
      const epRow = (fr + tr) / 2
      this.enPassant = `${'abcdefgh'[tc]}${8-epRow}`
    } else {
      this.enPassant = '-'
    }

    // Update castling
    if (piece.toLowerCase() === 'k') {
      if (this.turn === 'w') this.castling = this.castling.replace(/[KQ]/g, '')
      else this.castling = this.castling.replace(/[kq]/g, '')
    }
    if (piece.toLowerCase() === 'r') {
      if (fr === 7 && fc === 0) this.castling = this.castling.replace('Q', '')
      if (fr === 7 && fc === 7) this.castling = this.castling.replace('K', '')
      if (fr === 0 && fc === 0) this.castling = this.castling.replace('q', '')
      if (fr === 0 && fc === 7) this.castling = this.castling.replace('k', '')
    }
    // Rook captured
    if (tr === 0 && tc === 0) this.castling = this.castling.replace('q', '')
    if (tr === 0 && tc === 7) this.castling = this.castling.replace('k', '')
    if (tr === 7 && tc === 0) this.castling = this.castling.replace('Q', '')
    if (tr === 7 && tc === 7) this.castling = this.castling.replace('K', '')
    if (!this.castling) this.castling = '-'

    this.halfmove = (piece.toLowerCase() === 'p' || captured) ? 0 : this.halfmove + 1
    if (this.turn === 'b') this.fullmove++
    this.turn = this.turn === 'w' ? 'b' : 'w'
    this.moveHistory.push({ ...move, san: this.getSan(move, piece, captured) })
    return saved
  }

  undoMove(saved) {
    this.board = saved.board
    this.fen = saved.fen
    this.turn = saved.turn
    this.castling = saved.castling
    this.enPassant = saved.enPassant
    this.halfmove = saved.halfmove
    this.fullmove = saved.fullmove
    this.moveHistory.pop()
  }

  getSan(move, piece, captured) {
    if (move.castle === 'k') return 'O-O'
    if (move.castle === 'q') return 'O-O-O'
    const files = 'abcdefgh'
    const toAlg = files[move.to[1]] + (8 - move.to[0])
    let san = ''
    if (piece.toLowerCase() !== 'p') {
      san += piece.toUpperCase()
    } else if (captured || move.enPassant) {
      san += files[move.from[1]]
    }
    if (captured || move.enPassant) san += 'x'
    san += toAlg
    if (move.promotion) san += '=' + move.promotion.toUpperCase()
    // Check/checkmate
    const savedState = this.makeMove(move)
    if (this.isInCheck(this.turn)) {
      const hasLegal = this.generateLegalMoves(this.turn).length > 0
      san += hasLegal ? '+' : '#'
    }
    this.undoMove(savedState)
    return san
  }

  generateLegalMoves(color) {
    const pseudo = this.generatePseudoLegalMoves(color || this.turn)
    return pseudo.filter(m => {
      const saved = this.makeMove(m)
      const inCheck = this.isInCheck(this.turn)
      this.undoMove(saved)
      return !inCheck
    })
  }

  getLegalMovesFrom(r, c) {
    return this.generateLegalMoves().filter(m => m.from[0] === r && m.from[1] === c)
  }

  isCheckmate(color) {
    return this.isInCheck(color || this.turn) && this.generateLegalMoves(color || this.turn).length === 0
  }

  isStalemate(color) {
    return !this.isInCheck(color || this.turn) && this.generateLegalMoves(color || this.turn).length === 0
  }

  isDraw() {
    if (this.halfmove >= 100) return true // 50-move rule
    if (this.isStalemate()) return true
    // Insufficient material
    const pieces = { w: [], b: [] }
    for (let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p = this.board[r][c]
      if (p) pieces[this.colorOf(p)].push(p.toLowerCase())
    }
    const w = pieces.w.filter(p=>p!=='k')
    const b = pieces.b.filter(p=>p!=='k')
    if (w.length===0 && b.length===0) return true // K vs K
    if (w.length===0 && b.length===1 && (b[0]==='b'||b[0]==='n')) return true
    if (b.length===0 && w.length===1 && (w[0]==='b'||w[0]==='n')) return true
    return false
  }

  // Material evaluation (for AI)
  evaluate() {
    let score = 0
    for (let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p = this.board[r][c]
      if (!p) continue
      const type = p.toLowerCase()
      const val = PIECE_VALUES[type] + (PST[type] ? PST[type][this.isWhite(p) ? r*8+c : (7-r)*8+c] : 0)
      score += this.isWhite(p) ? val : -val
    }
    return score
  }
}

/* ══════════════════════════════════════════════════════════════════
   AI ENGINE — Minimax with Alpha-Beta Pruning
   ══════════════════════════════════════════════════════════════════ */

function orderMoves(engine, moves) {
  return moves.sort((a, b) => {
    let scoreA = 0, scoreB = 0
    if (a.capture) scoreA += PIECE_VALUES[engine.pieceAt(a.to[0], a.to[1])?.toLowerCase() || 'p'] || 0
    if (b.capture) scoreB += PIECE_VALUES[engine.pieceAt(b.to[0], b.to[1])?.toLowerCase() || 'p'] || 0
    if (a.promotion) scoreA += PIECE_VALUES[a.promotion] || 0
    if (b.promotion) scoreB += PIECE_VALUES[b.promotion] || 0
    return scoreB - scoreA
  })
}

function minimax(engine, depth, alpha, beta, isMaximizing, maxDepth) {
  if (depth === 0) return engine.evaluate()

  const color = isMaximizing ? 'w' : 'b'
  const moves = orderMoves(engine, engine.generateLegalMoves(color))

  if (moves.length === 0) {
    if (engine.isInCheck(color)) return isMaximizing ? -99999 + depth : 99999 - depth
    return 0 // stalemate
  }

  if (isMaximizing) {
    let best = -Infinity
    for (const move of moves) {
      const saved = engine.makeMove(move)
      const score = minimax(engine, depth - 1, alpha, beta, false, maxDepth)
      engine.undoMove(saved)
      best = Math.max(best, score)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const saved = engine.makeMove(move)
      const score = minimax(engine, depth - 1, alpha, beta, true, maxDepth)
      engine.undoMove(saved)
      best = Math.min(best, score)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return best
  }
}

function getBestMove(engine, difficulty) {
  const color = engine.turn
  const moves = engine.generateLegalMoves(color)
  if (moves.length === 0) return null

  if (difficulty === 'easy') {
    // Random with slight preference for captures
    const captures = moves.filter(m => m.capture)
    if (captures.length > 0 && Math.random() < 0.3) return captures[Math.floor(Math.random() * captures.length)]
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = difficulty === 'hard' ? 4 : difficulty === 'master' ? 5 : 3
  let bestScore = color === 'w' ? -Infinity : Infinity
  let bestMoves = []

  for (const move of moves) {
    const saved = engine.makeMove(move)
    const score = minimax(engine, depth - 1, -Infinity, Infinity, color !== 'w', depth)
    engine.undoMove(saved)

    if (color === 'w') {
      if (score > bestScore) { bestScore = score; bestMoves = [move] }
      else if (score === bestScore) bestMoves.push(move)
    } else {
      if (score < bestScore) { bestScore = score; bestMoves = [move] }
      else if (score === bestScore) bestMoves.push(move)
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

/* ══════════════════════════════════════════════════════════════════
   PIECE UNICODE MAP
   ══════════════════════════════════════════════════════════════════ */

const PIECE_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
}

const PIECE_NAMES = {
  K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn',
  k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn'
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function ChessPlayerPage() {
  const { gameName, companyName } = useParams()
  const navigate = useNavigate()

  // Game state
  const [gameData, setGameData] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mode selection
  const [mode, setMode] = useState(null) // 'ai' | 'multiplayer' | null
  const [difficulty, setDifficulty] = useState('medium')
  const [playerColor, setPlayerColor] = useState('w')
  const [playerName, setPlayerName] = useState('')

  // Multiplayer state
  const [roomCode, setRoomCode] = useState('')
  const [roomStatus, setRoomStatus] = useState(null)
  const [joining, setJoining] = useState(false)
  const [creating, setCreating] = useState(false)

  // Board state
  const [engine] = useState(() => new ChessEngine())
  const [boardState, setBoardState] = useState([])
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [turn, setTurn] = useState('w')
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [inCheck, setInCheck] = useState(false)

  // Move history
  const [moveHistory, setMoveHistory] = useState([])
  const [movePairs, setMovePairs] = useState([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)

  // Captured pieces
  const [capturedWhite, setCapturedWhite] = useState([])
  const [capturedBlack, setCapturedBlack] = useState([])

  // Timer
  const [whiteTime, setWhiteTime] = useState(0)
  const [blackTime, setBlackTime] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const whiteTimerRef = useRef(null)
  const blackTimerRef = useRef(null)

  // AI thinking
  const [aiThinking, setAiThinking] = useState(false)

  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioCtxRef = useRef(null)

  // Multiplayer polling
  const pollRef = useRef(null)
  const [opponentConnected, setOpponentConnected] = useState(false)

  // Promotion dialog
  const [promotionPending, setPromotionPending] = useState(null)

  // CSS Theme
  const theme = useMemo(() => ({
    primary: settings?.primary_color || '#7B3EFF',
    bg: settings?.bg_color || '#0f0f23',
    boardLight: '#EBECD0',
    boardDark: '#779556',
    boardLightSelected: '#F7F769',
    boardDarkSelected: '#BBC245',
    lastMoveLight: '#F7F769',
    lastMoveDark: '#BBC245',
    checkColor: 'rgba(255, 0, 0, 0.4)',
  }), [settings])

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/play/game-by-slug/${gameName}/${companyName}`)
        if (res.data.success) {
          setGameData(res.data.game)
          const settingsRes = await api.get(`/chess/settings/${res.data.game.id}`)
          if (settingsRes.data.settings) {
            setSettings(settingsRes.data.settings)
            setDifficulty(settingsRes.data.settings.difficulty || 'medium')
          }
        }
      } catch (err) {
        setError('Failed to load game')
      } finally {
        setLoading(false)
      }
    }
    loadGame()
  }, [gameName, companyName])

  // Init board
  useEffect(() => {
    setBoardState(engine.board.map(r => [...r]))
  }, [])

  // Timer effects
  useEffect(() => {
    if (!timerActive || gameOver) return
    if (turn === 'w') {
      whiteTimerRef.current = setInterval(() => setWhiteTime(t => Math.max(0, t - 1)), 1000)
    } else {
      blackTimerRef.current = setInterval(() => setBlackTime(t => Math.max(0, t - 1)), 1000)
    }
    return () => { clearInterval(whiteTimerRef.current); clearInterval(blackTimerRef.current) }
  }, [turn, timerActive, gameOver])

  // Sound effects
  const playSound = useCallback((type) => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.value = 0.1
      const freqs = { move: 600, capture: 400, check: 800, castle: 500, promote: 700, gameOver: 300 }
      osc.frequency.value = freqs[type] || 500
      osc.type = 'sine'
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {}
  }, [soundEnabled])

  // Update board from engine
  const updateBoard = useCallback(() => {
    setBoardState(engine.board.map(r => [...r]))
    setTurn(engine.turn)

    // Update captured pieces
    const wCaptures = [], bCaptures = []
    for (let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p = engine.board[r][c]
      // We track captures via move history
    }
    setMoveHistory([...engine.moveHistory])

    // Build move pairs
    const pairs = []
    for (let i = 0; i < engine.moveHistory.length; i += 2) {
      pairs.push({
        number: Math.floor(i/2) + 1,
        white: engine.moveHistory[i],
        black: engine.moveHistory[i+1] || null
      })
    }
    setMovePairs(pairs)
    setCurrentMoveIndex(engine.moveHistory.length - 1)

    // Check state
    setInCheck(engine.isInCheck(engine.turn))

    // Game over detection
    if (engine.isCheckmate()) {
      const winner = engine.turn === 'w' ? 'Black' : 'White'
      setGameOver(true)
      setGameResult(`Checkmate! ${winner} wins!`)
      setTimerActive(false)
      playSound('gameOver')
    } else if (engine.isDraw()) {
      setGameOver(true)
      setGameResult('Draw!')
      setTimerActive(false)
      playSound('gameOver')
    } else if (engine.isInCheck(engine.turn)) {
      playSound('check')
    }

    // Check time
    if (settings?.time_control > 0) {
      if (whiteTime <= 0 && turn === 'w' && timerActive) {
        setGameOver(true); setGameResult('Black wins on time!')
      }
      if (blackTime <= 0 && turn === 'b' && timerActive) {
        setGameOver(true); setGameResult('White wins on time!')
      }
    }
  }, [engine, playSound, settings, whiteTime, blackTime, timerActive, turn])

  // Handle square click
  const handleSquareClick = useCallback((r, c) => {
    if (gameOver || aiThinking) return
    if (mode === 'multiplayer' && turn !== playerColor) return

    const piece = engine.pieceAt(r, c)
    const pieceColor = engine.colorOf(piece)

    // If a piece is selected and clicking a legal move target
    if (selectedSquare) {
      const [sr, sc] = selectedSquare
      const move = legalMoves.find(m => m.to[0] === r && m.to[1] === c)
      if (move) {
        // Check for promotion
        if (move.promotion) {
          setPromotionPending({ from: [sr,sc], to: [r,c] })
          return
        }
        executeMove(move)
        return
      }
      // Deselect if clicking same square
      if (sr === r && sc === c) { setSelectedSquare(null); setLegalMoves([]); return }
    }

    // Select a piece
    if (piece && engine.colorOf(piece) === engine.turn) {
      if (mode === 'multiplayer' && engine.colorOf(piece) !== playerColor) return
      setSelectedSquare([r, c])
      setLegalMoves(engine.getLegalMovesFrom(r, c))
    } else {
      setSelectedSquare(null)
      setLegalMoves([])
    }
  }, [gameOver, aiThinking, mode, turn, playerColor, selectedSquare, legalMoves, engine])

  // Execute a move
  const executeMove = useCallback(async (move) => {
    const saved = engine.makeMove(move)
    const fen = engine.toFen()
    const san = engine.moveHistory[engine.moveHistory.length - 1].san

    // Track captures
    if (move.capture) {
      const capturedPiece = saved.board[move.to[0]][move.to[1]]
      if (engine.isWhite(capturedPiece)) setCapturedBlack(prev => [...prev, capturedPiece])
      else setCapturedWhite(prev => [...prev, capturedPiece])
    }

    setLastMove(move)
    setSelectedSquare(null)
    setLegalMoves([])
    playSound(move.capture ? 'capture' : move.castle ? 'castle' : 'move')

    updateBoard()

    // Multiplayer: send move to server
    if (mode === 'multiplayer' && roomCode) {
      try {
        await api.post(`/chess/room/${roomCode}/move`, {
          notation: san, fen_after: fen, player_color: playerColor, time_spent: 0
        })
      } catch (e) { console.error('Failed to send move:', e) }
    }

    // AI response
    if (mode === 'ai' && !engine.isCheckmate() && !engine.isDraw() && !engine.isStalemate()) {
      setAiThinking(true)
      setTimeout(() => {
        const aiMove = getBestMove(engine, difficulty)
        if (aiMove) {
          const aiSaved = engine.makeMove(aiMove)
          const aiFen = engine.toFen()
          const aiSan = engine.moveHistory[engine.moveHistory.length - 1].san

          if (aiMove.capture) {
            const cap = aiSaved.board[aiMove.to[0]][aiMove.to[1]]
            if (engine.isWhite(cap)) setCapturedBlack(prev => [...prev, cap])
            else setCapturedWhite(prev => [...prev, cap])
          }

          setLastMove(aiMove)
          playSound(aiMove.capture ? 'capture' : 'move')
          updateBoard()
        }
        setAiThinking(false)
      }, 300 + Math.random() * 500)
    }
  }, [engine, mode, difficulty, roomCode, playerColor, playSound, updateBoard])

  // Handle promotion choice
  const handlePromotion = useCallback((piece) => {
    if (!promotionPending) return
    const move = legalMoves.find(m =>
      m.to[0] === promotionPending.to[0] && m.to[1] === promotionPending.to[1] && m.promotion === piece
    )
    if (move) executeMove(move)
    setPromotionPending(null)
  }, [promotionPending, legalMoves, executeMove])

  // Multiplayer polling
  useEffect(() => {
    if (mode !== 'multiplayer' || !roomCode || roomStatus?.status !== 'active') return
    let lastMoveNum = 0

    const poll = async () => {
      try {
        const res = await api.get(`/chess/room/${roomCode}/moves?after=${lastMoveNum}`)
        if (res.data.success && res.data.moves.length > 0) {
          for (const m of res.data.moves) {
            if (m.player_color !== playerColor) {
              const move = engine.generateLegalMoves().find(lm => {
                const testSaved = engine.makeMove(lm)
                const fen = engine.toFen()
                engine.undoMove(testSaved)
                return fen === m.fen_after
              })
              if (move) {
                engine.makeMove(move)
                setLastMove(move)
                playSound(move.capture ? 'capture' : 'move')
                updateBoard()
              }
            }
            lastMoveNum = m.move_number
          }
        }
        // Check room status
        const roomRes = await api.get(`/chess/room/${roomCode}`)
        if (roomRes.data.room) {
          setRoomStatus(roomRes.data.room)
          setOpponentConnected(roomRes.data.room.player2_name && roomRes.data.room.status === 'active')
          if (roomRes.data.room.status === 'finished') {
            setGameOver(true)
            setGameResult(roomRes.data.room.result === 'draw' ? 'Draw!' :
              `${roomRes.data.room.result === 'white' ? 'White' : 'Black'} wins!`)
          }
        }
      } catch (e) {}
    }

    pollRef.current = setInterval(poll, 2000)
    return () => clearInterval(pollRef.current)
  }, [mode, roomCode, roomStatus, playerColor, engine, playSound, updateBoard])

  // Create room
  const handleCreateRoom = async () => {
    setCreating(true)
    try {
      const res = await api.post('/chess/room', {
        game_id: gameData?.id, player_name: playerName || 'Player 1',
        time_control: settings?.time_control || 0
      })
      if (res.data.success) {
        setRoomCode(res.data.room.room_code)
        setRoomStatus(res.data.room)
        setPlayerColor('w')
        setMode('multiplayer')
        if (settings?.time_control > 0) {
          setWhiteTime(settings.time_control)
          setBlackTime(settings.time_control)
        }
      }
    } catch (e) { setError('Failed to create room') }
    setCreating(false)
  }

  // Join room
  const handleJoinRoom = async () => {
    if (!roomCode) return
    setJoining(true)
    try {
      const res = await api.post(`/chess/room/${roomCode}/join`, { player_name: playerName || 'Player 2' })
      if (res.data.success) {
        setRoomStatus(res.data.room)
        setPlayerColor('b')
        setMode('multiplayer')
        setIsFlipped(true)
        if (res.data.room.time_control > 0) {
          setWhiteTime(res.data.room.time_control)
          setBlackTime(res.data.room.time_control)
          setTimerActive(true)
        }
      }
    } catch (e) { setError(e.response?.data?.error || 'Failed to join room') }
    setJoining(false)
  }

  // Start AI game
  const handleStartAI = () => {
    setMode('ai')
    if (settings?.time_control > 0) {
      setWhiteTime(settings.time_control)
      setBlackTime(settings.time_control)
      setTimerActive(true)
    }
    // If player is black, AI moves first
    if (playerColor === 'b') {
      setAiThinking(true)
      setTimeout(() => {
        const aiMove = getBestMove(engine, difficulty)
        if (aiMove) {
          engine.makeMove(aiMove)
          setLastMove(aiMove)
          playSound('move')
          updateBoard()
        }
        setAiThinking(false)
      }, 500)
    }
  }

  // Flip board
  const flipBoard = () => setIsFlipped(f => !f)

  // New game
  const handleNewGame = () => {
    engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    setBoardState(engine.board.map(r => [...r]))
    setSelectedSquare(null)
    setLegalMoves([])
    setLastMove(null)
    setTurn('w')
    setGameOver(false)
    setGameResult(null)
    setInCheck(false)
    setMoveHistory([])
    setMovePairs([])
    setCurrentMoveIndex(-1)
    setCapturedWhite([])
    setCapturedBlack([])
    setWhiteTime(settings?.time_control || 0)
    setBlackTime(settings?.time_control || 0)
    setTimerActive(false)
    setAiThinking(false)
    setMode(null)
    setRoomCode('')
    setRoomStatus(null)
  }

  // Undo move (AI mode only)
  const handleUndo = () => {
    if (mode !== 'ai' || engine.moveHistory.length < 2 || aiThinking) return
    // Undo AI move + player move
    engine.undoMove(engine.makeMove({}))
    engine.undoMove(engine.makeMove({}))
    // Actually we need proper undo - let's reload from fen history
    // Simple approach: reload and replay
    const moves = engine.moveHistory.slice(0, -2)
    engine.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    for (const m of moves) {
      const legalMove = engine.generateLegalMoves().find(lm => {
        const testSaved = engine.makeMove(lm)
        const fen = engine.toFen()
        engine.undoMove(testSaved)
        return fen === m.fen_after
      })
      if (legalMove) engine.makeMove(legalMove)
    }
    updateBoard()
  }

  // ── Render ──

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 18, fontFamily: 'DM Sans' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #333', borderTopColor: '#7B3EFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        Loading Chess...
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ef4444', fontSize: 16, fontFamily: 'DM Sans', textAlign: 'center' }}>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '8px 20px', background: '#7B3EFF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  )

  // ── Mode Selection Screen ──
  if (!mode) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.05) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
      `}</style>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: 40, animation: 'fadeIn 0.6s ease' }}>
        {/* Animated chess pieces */}
        <div style={{ fontSize: 80, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>♚</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Syne, DM Sans' }}>Chess</h1>
        <p style={{ color: '#9CA3AF', fontSize: 15, margin: '0 0 40px' }}>Choose how you want to play</p>

        {/* Player name input */}
        <div style={{ marginBottom: 24 }}>
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Your name (optional)"
            style={{ width: '100%', maxWidth: 300, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', textAlign: 'center', fontFamily: 'DM Sans' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* AI Button */}
          <div onClick={handleStartAI} style={{
            background: 'linear-gradient(135deg, #7B3EFF 0%, #5B21B6 100%)',
            borderRadius: 20, padding: '32px 28px', cursor: 'pointer', width: 200,
            border: '2px solid rgba(123,62,255,0.3)', transition: 'all 0.3s',
            animation: 'fadeIn 0.6s ease 0.1s both'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(123,62,255,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>vs Computer</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>AI opponent</div>
          </div>

          {/* Multiplayer Button */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: 20, padding: '32px 28px', cursor: 'pointer', width: 200,
            border: '2px solid rgba(5,150,105,0.3)', transition: 'all 0.3s',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(5,150,105,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>vs Player</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Multiplayer</div>
          </div>
        </div>

        {/* Difficulty selector (shown when AI is about to start) */}
        <div style={{ marginTop: 32 }}>
          <label style={{ color: '#9CA3AF', fontSize: 12, display: 'block', marginBottom: 8 }}>AI Difficulty</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['easy','medium','hard','master'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                padding: '8px 16px', borderRadius: 10, border: difficulty === d ? `2px solid ${theme.primary}` : '2px solid rgba(255,255,255,0.1)',
                background: difficulty === d ? 'rgba(123,62,255,0.2)' : 'rgba(255,255,255,0.03)',
                color: difficulty === d ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', fontFamily: 'DM Sans', transition: 'all 0.2s'
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Color selector */}
        <div style={{ marginTop: 20 }}>
          <label style={{ color: '#9CA3AF', fontSize: 12, display: 'block', marginBottom: 8 }}>Play as</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => setPlayerColor('w')} style={{
              padding: '8px 16px', borderRadius: 10, border: playerColor === 'w' ? '2px solid #fff' : '2px solid rgba(255,255,255,0.1)',
              background: playerColor === 'w' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', fontSize: 20, cursor: 'pointer', transition: 'all 0.2s'
            }}>♔</button>
            <button onClick={() => setPlayerColor('b')} style={{
              padding: '8px 16px', borderRadius: 10, border: playerColor === 'b' ? '2px solid #fff' : '2px solid rgba(255,255,255,0.1)',
              background: playerColor === 'b' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', fontSize: 20, cursor: 'pointer', transition: 'all 0.2s'
            }}>♚</button>
          </div>
        </div>

        {/* Multiplayer room section */}
        <div style={{ marginTop: 32, padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 16px' }}>Or join a friend's game</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <input
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={6}
              style={{ width: 160, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 16, letterSpacing: 4, textAlign: 'center', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none' }}
            />
            <button onClick={handleJoinRoom} disabled={!roomCode || joining} style={{
              padding: '10px 20px', background: roomCode ? '#059669' : '#333', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: roomCode ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans'
            }}>{joining ? 'Joining...' : 'Join'}</button>
          </div>
          <button onClick={handleCreateRoom} disabled={creating} style={{
            marginTop: 12, padding: '10px 24px', background: 'transparent', color: '#7B3EFF', border: '1.5px solid #7B3EFF', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans'
          }}>{creating ? 'Creating...' : 'Create Room & Get Code'}</button>
          {roomCode && roomStatus && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(123,62,255,0.1)', borderRadius: 12 }}>
              <p style={{ color: '#7B3EFF', fontSize: 13, margin: 0 }}>Room Code: <span style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 800, letterSpacing: 6 }}>{roomCode}</span></p>
              <p style={{ color: '#9CA3AF', fontSize: 12, margin: '8px 0 0' }}>Share this code with your friend!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Game Screen ──
  const FILES = ['a','b','c','d','e','f','g','h']
  const displayBoard = isFlipped ? [...boardState].reverse().map(r => [...r].reverse()) : boardState
  const displayTurn = turn

  // Material advantage
  const materialWhite = capturedWhite.reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] || 0), 0)
  const materialBlack = capturedBlack.reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] || 0), 0)
  const materialDiff = materialWhite - materialBlack

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f0f23 0%, #16162a 100%)', fontFamily: 'DM Sans', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(123,62,255,0.4) } 50% { box-shadow:0 0 0 10px rgba(123,62,255,0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes checkFlash { 0%,100% { background:rgba(255,0,0,0.3) } 50% { background:rgba(255,0,0,0.6) } }
        .chess-square { transition: background 0.15s ease; }
        .chess-square:hover { filter: brightness(1.1); }
        .chess-piece { user-select: none; cursor: pointer; transition: transform 0.1s ease; }
        .chess-piece:hover { transform: scale(1.08); }
        .chess-piece.dragging { opacity: 0.5; }
        .legal-move-dot { position:absolute; width:28%; height:28%; border-radius:50%; background:rgba(0,0,0,0.2); pointer-events:none; }
        .legal-capture-ring { position:absolute; width:90%; height:90%; border-radius:50%; border:4px solid rgba(0,0,0,0.2); pointer-events:none; }
        .move-entry:hover { background:rgba(255,255,255,0.05); }
        .move-entry.active { background:rgba(123,62,255,0.15); border-left:2px solid #7B3EFF; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleNewGame} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← {mode === 'ai' ? 'vs Computer' : 'Multiplayer'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={flipBoard} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans' }}>⟳ Flip</button>
          <button onClick={() => setSoundEnabled(s => !s)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans' }}>{soundEnabled ? '🔊' : '🔇'}</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '16px', gap: 24, maxWidth: 1200, margin: '0 auto', width: '100%', flexWrap: 'wrap' }}>
        {/* Left panel - Captured pieces + info */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12, order: -1 }}>
          {/* Opponent info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {playerColor === 'w' ? '🤖' : '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{mode === 'ai' ? `AI (${difficulty})` : (playerColor === 'w' ? (roomStatus?.player2_name || 'Player 2') : (roomStatus?.player1_name || 'Player 1'))}</div>
              <div style={{ color: '#9CA3AF', fontSize: 11 }}>{playerColor === 'w' ? 'Black' : 'White'}</div>
            </div>
            {(settings?.time_control > 0 || mode === 'multiplayer') && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: (playerColor === 'w' ? blackTime : whiteTime) < 60 ? '#ef4444' : '#fff' }}>
                {formatTime(playerColor === 'w' ? blackTime : whiteTime)}
              </div>
            )}
          </div>

          {/* Captured pieces */}
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, minHeight: 36, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {capturedBlack.length > 0 && <span style={{ color: '#9CA3AF', fontSize: 11, marginRight: 4 }}>+{materialDiff > 0 ? materialDiff : ''}</span>}
            {capturedBlack.map((p, i) => <span key={i} style={{ fontSize: 18 }}>{PIECE_UNICODE[p]}</span>)}
          </div>

          {/* Move history */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9CA3AF', fontSize: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Moves</span>
              <span>{moveHistory.length}</span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
              {movePairs.map((pair, i) => (
                <div key={i} className="move-entry" style={{ display: 'flex', padding: '3px 14px', fontSize: 13, borderRadius: 4, margin: '0 4px', transition: 'background 0.15s' }}>
                  <span style={{ color: '#666', width: 28, flexShrink: 0 }}>{pair.number}.</span>
                  <span style={{ color: '#fff', fontWeight: 600, width: 64, flexShrink: 0 }}>{pair.white?.san || ''}</span>
                  <span style={{ color: '#ccc' }}>{pair.black?.san || ''}</span>
                </div>
              ))}
              {movePairs.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 13 }}>No moves yet</div>
              )}
            </div>
          </div>

          {/* Game controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            {mode === 'ai' && (
              <button onClick={handleUndo} disabled={aiThinking || moveHistory.length < 2} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans', opacity: aiThinking || moveHistory.length < 2 ? 0.4 : 1 }}>
              ↩ Undo
            </button>
          )}
            <button onClick={handleNewGame} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans' }}>
              ⟳ New Game
            </button>
          </div>
        </div>

        {/* Center - Chess Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Turn indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: displayTurn === 'w' ? '#fff' : '#333',
              border: displayTurn === 'w' ? '2px solid #ccc' : '2px solid #555',
              animation: !gameOver && !aiThinking ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
              {aiThinking ? 'AI thinking...' : gameOver ? (gameResult || 'Game Over') : `${displayTurn === 'w' ? 'White' : 'Black'} to move`}
            </span>
            {inCheck && !gameOver && <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>CHECK!</span>}
          </div>

          {/* Board */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)',
              width: 'min(560px, 90vw)', height: 'min(560px, 90vw)',
              borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              border: inCheck && !gameOver ? '3px solid #ef4444' : '3px solid rgba(255,255,255,0.08)'
            }}>
              {displayBoard.map((row, ri) =>
                row.map((piece, ci) => {
                  const actualR = isFlipped ? 7 - ri : ri
                  const actualC = isFlipped ? 7 - ci : ci
                  const isLight = (ri + ci) % 2 === 0
                  const isSelected = selectedSquare && selectedSquare[0] === actualR && selectedSquare[1] === actualC
                  const isLastMove = lastMove && (
                    (lastMove.from[0] === actualR && lastMove.from[1] === actualC) ||
                    (lastMove.to[0] === actualR && lastMove.to[1] === actualC)
                  )
                  const isLegalTarget = legalMoves.some(m => m.to[0] === actualR && m.to[1] === actualC)
                  const isCaptureTarget = isLegalTarget && piece
                  const isKingInCheck = inCheck && piece && piece.toLowerCase() === 'k' && engine.colorOf(piece) === turn

                  let bg = isLight ? theme.boardLight : theme.boardDark
                  if (isSelected) bg = isLight ? theme.boardLightSelected : theme.boardDarkSelected
                  else if (isLastMove) bg = isLight ? theme.lastMoveLight : theme.lastMoveDark

                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className="chess-square"
                      onClick={() => handleSquareClick(actualR, actualC)}
                      style={{
                        background: isKingInCheck ? 'rgba(255,0,0,0.35)' : bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', cursor: piece || isLegalTarget ? 'pointer' : 'default',
                        animation: isKingInCheck ? 'checkFlash 0.8s ease infinite' : 'none'
                      }}
                    >
                      {/* Coordinate labels */}
                      {ci === 0 && (
                        <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, fontWeight: 700, color: isLight ? theme.boardDark : theme.boardLight, opacity: 0.6, pointerEvents: 'none' }}>
                          {isFlipped ? ri + 1 : 8 - ri}
                        </span>
                      )}
                      {ri === 7 && (
                        <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 10, fontWeight: 700, color: isLight ? theme.boardDark : theme.boardLight, opacity: 0.6, pointerEvents: 'none' }}>
                          {FILES[isFlipped ? 7 - ci : ci]}
                        </span>
                      )}

                      {/* Legal move indicator */}
                      {isLegalTarget && !isCaptureTarget && (
                        <div className="legal-move-dot" />
                      )}
                      {isCaptureTarget && (
                        <div className="legal-capture-ring" />
                      )}

                      {/* Piece */}
                      {piece && (
                        <span className="chess-piece" style={{
                          fontSize: 'min(52px, 9vw)',
                          lineHeight: 1,
                          filter: engine.colorOf(piece) === 'w' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                          transition: 'transform 0.15s ease'
                        }}>
                          {PIECE_UNICODE[piece]}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Captured pieces (player) */}
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, minHeight: 36, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
            {capturedWhite.length > 0 && <span style={{ color: '#9CA3AF', fontSize: 11, marginRight: 4 }}>+{materialDiff < 0 ? Math.abs(materialDiff) : ''}</span>}
            {capturedWhite.map((p, i) => <span key={i} style={{ fontSize: 18 }}>{PIECE_UNICODE[p]}</span>)}
          </div>
        </div>

        {/* Right panel - Player info + controls */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Player info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7B3EFF, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{playerName || 'You'}</div>
              <div style={{ color: '#9CA3AF', fontSize: 11 }}>{playerColor === 'w' ? 'White' : 'Black'}</div>
            </div>
            {(settings?.time_control > 0 || mode === 'multiplayer') && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: (playerColor === 'w' ? whiteTime : blackTime) < 60 ? '#ef4444' : '#fff' }}>
                {formatTime(playerColor === 'w' ? whiteTime : blackTime)}
              </div>
            )}
          </div>

          {/* Multiplayer room info */}
          {mode === 'multiplayer' && roomCode && (
            <div style={{ padding: '16px', background: 'rgba(123,62,255,0.08)', borderRadius: 12, border: '1px solid rgba(123,62,255,0.15)', textAlign: 'center' }}>
              <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}>ROOM CODE</div>
              <div style={{ color: '#7B3EFF', fontSize: 28, fontFamily: 'monospace', fontWeight: 800, letterSpacing: 6 }}>{roomCode}</div>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href.split('?')[0] + '?room=' + roomCode) }}
                style={{ marginTop: 8, padding: '6px 14px', background: 'rgba(123,62,255,0.15)', border: '1px solid rgba(123,62,255,0.3)', borderRadius: 8, color: '#7B3EFF', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                📋 Copy Link
              </button>
              <div style={{ marginTop: 8, color: opponentConnected ? '#22c55e' : '#f59e0b', fontSize: 12, fontWeight: 600 }}>
                {opponentConnected ? '✓ Opponent connected' : '⏳ Waiting for opponent...'}
              </div>
            </div>
          )}

          {/* Game result overlay */}
          {gameOver && (
            <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{gameResult}</div>
              <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16 }}>
                {engine.moveHistory.length} moves played
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleNewGame} style={{ flex: 1, padding: '10px', background: '#7B3EFF', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                  Play Again
                </button>
                <button onClick={() => { const pgn = movePairs.map(p => `${p.number}. ${p.white?.san || ''} ${p.black?.san || ''}`).join(' '); navigator.clipboard.writeText(pgn) }}
                  style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                  📋 Copy PGN
                </button>
              </div>
            </div>
          )}

          {/* Quick actions */}
          {!gameOver && mode === 'multiplayer' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={async () => { await api.post(`/chess/room/${roomCode}/resign`, { player_color: playerColor }); setGameOver(true); setGameResult('You resigned') }}
                style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                Resign
              </button>
              <button onClick={async () => { await api.post(`/chess/room/${roomCode}/draw`, { action: 'offer', player_color: playerColor }) }}
                style={{ flex: 1, padding: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#f59e0b', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                Offer Draw
              </button>
            </div>
          )}

          {/* AI difficulty display */}
          {mode === 'ai' && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 6 }}>AI DIFFICULTY</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{difficulty}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {['easy','medium','hard','master'].map(d => (
                  <button key={d} onClick={() => { if (!aiThinking && moveHistory.length === 0) setDifficulty(d) }}
                    disabled={aiThinking || moveHistory.length > 0}
                    style={{ flex: 1, padding: '4px', borderRadius: 6, border: difficulty === d ? `1px solid ${theme.primary}` : '1px solid rgba(255,255,255,0.06)', background: difficulty === d ? 'rgba(123,62,255,0.15)' : 'transparent', color: difficulty === d ? '#fff' : '#666', fontSize: 10, cursor: moveHistory.length > 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Promotion Dialog */}
      {promotionPending && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setPromotionPending(null)}>
          <div style={{ background: '#1e1e2e', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>Promote Pawn</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{type:'q', label:'Queen', icon:'♕'}, {type:'r', label:'Rook', icon:'♖'}, {type:'b', label:'Bishop', icon:'♗'}, {type:'n', label:'Knight', icon:'♘'}].map(p => (
                <button key={p.type} onClick={() => handlePromotion(p.type)}
                  style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7B3EFF'; e.currentTarget.style.background = 'rgba(123,62,255,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 32 }}>{p.icon}</span>
                  <span style={{ color: '#9CA3AF', fontSize: 10 }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
