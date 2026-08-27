import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Swords, Puzzle, LineChart, Trophy, MessageSquare,
  User, Play, Bot, Link2, Clock, Flag, RotateCcw, Maximize2,
  ChevronLeft, ChevronRight, X, Check, Crown, Flame, Star, Sparkles,
  Copy, Repeat, Download, Share2,
  Target, Award, Medal, Info, Lightbulb, ShieldCheck, Send,
  Menu, SkipBack, SkipForward, Timer, ListChecks, Gem, Lock
} from "lucide-react";
import api from '../../apps/frontend/src/api';
import { AvatarDisplay } from '../../apps/frontend/src/components/AvatarData';

/* ============================================================================
   CHESSVERSE — "Play. Learn. Conquer."
   The board engine below is untouched. Everything about the *player* — rating,
   history, streaks, badges, opponents, tournaments — is now derived from real
   play and persisted via window.storage, instead of hardcoded fixtures.
   ============================================================================ */

/* ---------------------------------------------------------------------------
   CHESS ENGINE — self-contained rules implementation (UNCHANGED)
   board[row][col], row 0 = rank 8 (black home rank), col 0 = file a
--------------------------------------------------------------------------- */

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function initialBoard() {
  const back = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: back[c], color: "b" };
    board[1][c] = { type: "p", color: "b" };
    board[6][c] = { type: "p", color: "w" };
    board[7][c] = { type: back[c], color: "w" };
  }
  return board;
}

function cloneBoard(b) {
  return b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function sq(r, c) {
  return FILES[c] + (8 - r);
}

/* ─── FEN <-> Board conversion ───────────────────────────────────────────── */
function boardToFen(board, turn, castling, enPassant) {
  // Piece placement
  let placement = "";
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) { placement += empty; empty = 0; }
        const piece = p.type === "k" ? "k" : p.type === "q" ? "q" : p.type === "r" ? "r" : p.type === "b" ? "b" : p.type === "n" ? "n" : "p";
        placement += p.color === "w" ? piece.toUpperCase() : piece;
      }
    }
    if (empty > 0) placement += empty;
    if (r < 7) placement += "/";
  }
  
  // Active color
  const active = turn === "w" ? "w" : "b";
  
  // Castling rights
  let castle = "";
  if (castling.w.k) castle += "K";
  if (castling.w.q) castle += "Q";
  if (castling.b.k) castle += "k";
  if (castling.b.q) castle += "q";
  if (!castle) castle = "-";
  
  // En passant
  const ep = enPassant ? sq(enPassant.r, enPassant.c) : "-";
  
  return `${placement} ${active} ${castle} ${ep} 0 1`;
}

function fenToBoard(fen) {
  const [placement] = fen.split(" ");
  const rows = placement.split("/");
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  
  const pieceMap = {
    "K": { type: "k", color: "w" }, "Q": { type: "q", color: "w" }, "R": { type: "r", color: "w" },
    "B": { type: "b", color: "w" }, "N": { type: "n", color: "w" }, "P": { type: "p", color: "w" },
    "k": { type: "k", color: "b" }, "q": { type: "q", color: "b" }, "r": { type: "r", color: "b" },
    "b": { type: "b", color: "b" }, "n": { type: "n", color: "b" }, "p": { type: "p", color: "b" },
  };
  
  for (let r = 0; r < 8; r++) {
    const row = rows[r];
    let c = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        c += parseInt(char);
      } else if (pieceMap[char]) {
        board[r][c] = { ...pieceMap[char] };
        c++;
      }
    }
  }
  return board;
}

function fenToTurn(fen) {
  const parts = fen.split(" ");
  return parts[1] || "w";
}

function fenToCastling(fen) {
  const parts = fen.split(" ");
  const castle = parts[2] || "KQkq";
  return {
    w: { k: castle.includes("K"), q: castle.includes("Q") },
    b: { k: castle.includes("k"), q: castle.includes("q") },
  };
}

function fenToEnPassant(fen) {
  const parts = fen.split(" ");
  const ep = parts[3];
  if (!ep || ep === "-") return null;
  // ep is like "e3" - convert to row, col
  const col = ep.charCodeAt(0) - 97;
  const row = 8 - parseInt(ep[1]);
  if (inBounds(row, col)) return { r: row, c: col };
  return null;
}

const SLIDING = {
  b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
};
const KNIGHT_DELTAS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_DELTAS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function isSquareAttacked(board, r, c, byColor) {
  const pawnDir = byColor === "w" ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = r + pawnDir, pc = c + dc;
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.type === "p" && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of KNIGHT_DELTAS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === "n" && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of KING_DELTAS) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === "k" && p.color === byColor) return true;
    }
  }
  for (const [dr, dc] of SLIDING.b) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === "b" || p.type === "q")) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  for (const [dr, dc] of SLIDING.r) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === "r" || p.type === "q")) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return false;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "k" && p.color === color) return { r, c };
    }
  return null;
}

function pseudoMovesFor(board, r, c, state) {
  const piece = board[r][c];
  if (!piece) return [];
  const moves = [];
  const opp = piece.color === "w" ? "b" : "w";
  const push = (nr, nc, extra = {}) => {
    if (!inBounds(nr, nc)) return;
    const target = board[nr][nc];
    if (target && target.color === piece.color) return;
    moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: !!target, ...extra });
  };

  if (piece.type === "p") {
    const dir = piece.color === "w" ? -1 : 1;
    const startRow = piece.color === "w" ? 6 : 1;
    const promoRow = piece.color === "w" ? 0 : 7;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      if (r + dir === promoRow) {
        for (const promo of ["q", "r", "b", "n"]) push(r + dir, c, { promotion: promo });
      } else {
        push(r + dir, c);
      }
      if (r === startRow && !board[r + 2 * dir][c]) {
        push(r + 2 * dir, c, { doubleStep: true });
      }
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (target && target.color === opp) {
        if (nr === promoRow) {
          for (const promo of ["q", "r", "b", "n"]) moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true, promotion: promo });
        } else {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true });
        }
      } else if (state.enPassant && state.enPassant.r === nr && state.enPassant.c === nc) {
        moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true, enPassant: true });
      }
    }
    return moves;
  }

  if (piece.type === "n") {
    for (const [dr, dc] of KNIGHT_DELTAS) push(r + dr, c + dc);
    return moves;
  }

  if (piece.type === "k") {
    for (const [dr, dc] of KING_DELTAS) push(r + dr, c + dc);
    const home = piece.color === "w" ? 7 : 0;
    if (r === home && c === 4) {
      const rights = state.castling[piece.color];
      if (rights.k && !board[home][5] && !board[home][6] && board[home][7]?.type === "r") {
        if (
          !isSquareAttacked(board, home, 4, opp) &&
          !isSquareAttacked(board, home, 5, opp) &&
          !isSquareAttacked(board, home, 6, opp)
        ) {
          moves.push({ from: { r, c }, to: { r: home, c: 6 }, castle: "k" });
        }
      }
      if (rights.q && !board[home][3] && !board[home][2] && !board[home][1] && board[home][0]?.type === "r") {
        if (
          !isSquareAttacked(board, home, 4, opp) &&
          !isSquareAttacked(board, home, 3, opp) &&
          !isSquareAttacked(board, home, 2, opp)
        ) {
          moves.push({ from: { r, c }, to: { r: home, c: 2 }, castle: "q" });
        }
      }
    }
    return moves;
  }

  const dirs = SLIDING[piece.type];
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (!target) {
        moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: false });
      } else {
        if (target.color !== piece.color) moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true });
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return moves;
}

function applyMove(board, state, move) {
  const nb = cloneBoard(board);
  const piece = nb[move.from.r][move.from.c];
  const captured = nb[move.to.r][move.to.c];
  let enPassantCaptured = null;

  if (move.enPassant) {
    enPassantCaptured = nb[move.from.r][move.to.c];
    nb[move.from.r][move.to.c] = null;
  }

  nb[move.to.r][move.to.c] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
  nb[move.from.r][move.from.c] = null;

  if (move.castle) {
    const home = move.from.r;
    if (move.castle === "k") {
      nb[home][5] = nb[home][7];
      nb[home][7] = null;
    } else {
      nb[home][3] = nb[home][0];
      nb[home][0] = null;
    }
  }

  const castling = {
    w: { ...state.castling.w },
    b: { ...state.castling.b },
  };
  if (piece.type === "k") {
    castling[piece.color].k = false;
    castling[piece.color].q = false;
  }
  if (piece.type === "r") {
    if (move.from.c === 0) castling[piece.color].q = false;
    if (move.from.c === 7) castling[piece.color].k = false;
  }
  if (captured && captured.type === "r") {
    if (move.to.c === 0) castling[captured.color].q = false;
    if (move.to.c === 7) castling[captured.color].k = false;
  }

  const enPassant =
    move.doubleStep ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null;

  const takenPiece = move.enPassant ? enPassantCaptured : captured;

  return { board: nb, castling, enPassant, takenPiece, piece };
}

function getLegalMoves(board, color, state) {
  const all = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const pseudo = pseudoMovesFor(board, r, c, state);
        for (const m of pseudo) {
          const { board: nb } = applyMove(board, state, m);
          const kingPos = findKing(nb, color);
          if (kingPos && !isSquareAttacked(nb, kingPos.r, kingPos.c, color === "w" ? "b" : "w")) {
            all.push(m);
          }
        }
      }
    }
  return all;
}

function legalMovesFrom(board, r, c, state) {
  const p = board[r][c];
  if (!p) return [];
  const pseudo = pseudoMovesFor(board, r, c, state);
  return pseudo.filter((m) => {
    const { board: nb } = applyMove(board, state, m);
    const kingPos = findKing(nb, p.color);
    return kingPos && !isSquareAttacked(nb, kingPos.r, kingPos.c, p.color === "w" ? "b" : "w");
  });
}

function pieceValue(type) {
  return { p: 1, n: 3, b: 3.1, r: 5, q: 9, k: 0 }[type] || 0;
}

function materialScore(board, color) {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) score += (p.color === color ? 1 : -1) * pieceValue(p.type);
    }
  return score;
}

function sanFor(board, state, move) {
  const piece = board[move.from.r][move.from.c];
  if (move.castle === "k") return "O-O";
  if (move.castle === "q") return "O-O-O";
  const pieceLetter = { p: "", n: "N", b: "B", r: "R", q: "Q", k: "K" }[piece.type];
  const capture = move.capture ? "x" : "";
  const fromFile = piece.type === "p" && move.capture ? FILES[move.from.c] : "";
  let str = `${pieceLetter}${fromFile}${capture}${sq(move.to.r, move.to.c)}`;
  if (move.promotion) str += `=${move.promotion.toUpperCase()}`;
  return str;
}

function chooseComputerMove(board, color, state, difficulty = 1, blunderChance = 0.2, drawSeeking = false) {
  const moves = getLegalMoves(board, color, state);
  if (moves.length === 0) return null;

  if (Math.random() < blunderChance) {
    const casualPicks = moves.filter((m) => !m.capture || Math.random() < 0.4);
    const pool = casualPicks.length ? casualPicks : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let best = [];
  let bestScore = -Infinity;
  for (const m of moves) {
    const { board: nb } = applyMove(board, state, m);
    let score = materialScore(nb, color);
    if (m.capture) score += 0.15;
    if (m.promotion === "q") score += 0.5;
    if (drawSeeking) score -= Math.abs(materialScore(nb, "w")) * 0.35;
    score += (Math.random() - 0.5) * (difficulty === 1 ? 1.8 : difficulty === 2 ? 1.5 : 0.6);
    if (score > bestScore) {
      bestScore = score;
      best = [m];
    } else if (score === bestScore) {
      best.push(m);
    }
  }
  return best[Math.floor(Math.random() * best.length)];
}

// Depth-limited minimax search used for Hard bot mode — the bot evaluates its
// own move plus the human's best reply, making it measurably stronger than the
// one-ply heuristic above. White maximizes its material edge, black minimizes.
function minimaxScore(board, color, state, depth) {
  const moves = getLegalMoves(board, color, state);
  if (depth <= 0 || moves.length === 0) {
    return materialScore(board, "w") - materialScore(board, "b");
  }
  const opp = color === "w" ? "b" : "w";
  if (color === "w") {
    let best = -Infinity;
    for (const m of moves) {
      const res = applyMove(board, state, m);
      best = Math.max(best, minimaxScore(res.board, opp, res, depth - 1));
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    const res = applyMove(board, state, m);
    best = Math.min(best, minimaxScore(res.board, opp, res, depth - 1));
  }
  return best;
}

function chooseStrongComputerMove(board, color, state, depth = 2) {
  const moves = getLegalMoves(board, color, state);
  if (moves.length === 0) return null;
  const opp = color === "w" ? "b" : "w";
  let best = [];
  let bestScore = color === "w" ? -Infinity : Infinity;
  for (const m of moves) {
    const res = applyMove(board, state, m);
    const score = minimaxScore(res.board, opp, res, depth - 1);
    if (score === bestScore) {
      best.push(m);
    } else if ((color === "w" && score > bestScore) || (color === "b" && score < bestScore)) {
      bestScore = score;
      best = [m];
    }
  }
  return best[Math.floor(Math.random() * best.length)];
}

function premoveThresholdSeconds(baseMinutes) {
  return (baseMinutes * 60) / 3;
}

const THINK_TIME_OPTIONS_SECONDS = [1, 2, 3, 5, 6, 3, 4, 2];

function estimateThinkTime(remainingMs = Infinity) {
  const pick = THINK_TIME_OPTIONS_SECONDS[Math.floor(Math.random() * THINK_TIME_OPTIONS_SECONDS.length)];
  const jitterMs = Math.random() * 500 - 150;
  const raw = pick * 1000 + jitterMs;
  return Math.max(500, Math.min(raw, remainingMs * 0.5));
}

function rollOutcomeBias() {
  const roll = Math.random();
  if (roll < 0.6) return "player";
  if (roll < 0.9) return "bot";
  return "draw";
}

/* ---------------------------------------------------------------------------
   PIECE GLYPHS (board rendering — unchanged)
--------------------------------------------------------------------------- */
const GLYPHS = {
  w: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

/* ---------------------------------------------------------------------------
   CONFIG / CONTENT — legitimate static content (time controls, puzzle
   levels, quick-chat phrases, nav). Not user data, so these stay as-is.
--------------------------------------------------------------------------- */
const TIME_CONTROLS = [
  { label: "1 min", sub: "Bullet", base: 1, inc: 0 },
  { label: "2 | 1", sub: "Bullet", base: 2, inc: 1 },
  { label: "3 min", sub: "Blitz", base: 3, inc: 0 },
  { label: "3 | 2", sub: "Blitz", base: 3, inc: 2 },
  { label: "5 min", sub: "Blitz", base: 5, inc: 0 },
  { label: "5 | 3", sub: "Blitz", base: 5, inc: 3 },
  { label: "10 min", sub: "Rapid", base: 10, inc: 0 },
  { label: "15 | 10", sub: "Rapid", base: 15, inc: 10 },
  { label: "30 min", sub: "Classical", base: 30, inc: 0 },
];

const QUICK_MESSAGES = [
  "Good luck!",
  "Have fun!",
  "Well played",
  "Thanks!",
  "Good game",
  "Oops!",
  "Nice move",
  "One moment please",
];

const NAV_ITEMS = [
  { id: "play", label: "Play", icon: Swords },
  { id: "puzzles", label: "Puzzles", icon: Puzzle },
  { id: "profile", label: "Profile", icon: User },
];

/* ---------------------------------------------------------------------------
   PERSISTENT STORAGE HELPERS
--------------------------------------------------------------------------- */
async function storageGet(key, fallback) {
  // window.storage is the mobile-app bridge (Capacitor-style). When it's
  // absent (plain browser / dev), fall back to localStorage so nothing breaks.
  try {
    if (window.storage && window.storage.get) {
      const res = await window.storage.get(key, false);
      if (res && res.value !== undefined && res.value !== null && res.value !== "") return JSON.parse(res.value);
    }
  } catch (e) { /* fall through to localStorage */ }
  try {
    const raw = localStorage.getItem("cv:" + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
async function storageSet(key, value) {
  try {
    if (window.storage && window.storage.set) {
      await window.storage.set(key, JSON.stringify(value), false);
      return;
    }
  } catch (e) { /* fall through to localStorage */ }
  try {
    localStorage.setItem("cv:" + key, JSON.stringify(value));
  } catch (e) { /* storage unavailable — persist nothing */ }
}

/* ---------------------------------------------------------------------------
   PLAYER PROFILE — every number here is earned through real play and
   persisted across sessions. Nothing is pre-filled.
--------------------------------------------------------------------------- */
function defaultProfile() {
  return {
    name: "Player",
    flag: "🌐",
    createdAt: new Date().toISOString(),
    ratings: { bullet: 1200, blitz: 1200, rapid: 1200 },
    ratingHistory: { bullet: [1200], blitz: [1200], rapid: [1200] },
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    recentGames: [],
    puzzle: {
      rating: 1200,
      solved: 0,
      failed: 0,
      streak: 0,
      bestStreak: 0,
      lastSolvedDate: null,
      bestRushScore: 0,
      log: [],
    },
  };
}

/* Badge tiers — purely a function of earned rating, recomputed live. */
const TIER_DEFS = [
  { id: "bronze", label: "Bronze", min: 0, color: "#c07a3e", Icon: Medal },
  { id: "silver", label: "Silver", min: 1000, color: "#b9c0cc", Icon: Award },
  { id: "diamond", label: "Diamond", min: 1400, color: "#5fd0e0", Icon: Gem },
  { id: "pro", label: "Pro", min: 1800, color: "#f6c453", Icon: Crown },
];
function getTier(rating) {
  let tier = TIER_DEFS[0];
  for (const t of TIER_DEFS) if (rating >= t.min) tier = t;
  return tier;
}

function controlCategory(tc) {
  if (tc.sub === "Bullet") return "bullet";
  if (tc.sub === "Blitz") return "blitz";
  return "rapid"; // Rapid & Classical share a pool
}

function eloDelta(myRating, oppRating, actual) {
  const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
  let delta = Math.round(24 * (actual - expected));
  if (delta === 0) delta = actual === 1 ? 4 : actual === 0 ? -4 : 0;
  return delta;
}

function applyGameResult(profile, { category, result, opponentName, opponentRating, control }) {
  const myRating = profile.ratings[category];
  const actual = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  const delta = eloDelta(myRating, opponentRating, actual);
  const newRating = Math.max(100, myRating + delta);
  const ratingHistory = { ...profile.ratingHistory };
  ratingHistory[category] = [...ratingHistory[category].slice(-19), newRating];
  const currentWinStreak = result === "win" ? profile.currentWinStreak + 1 : 0;
  return {
    ...profile,
    ratings: { ...profile.ratings, [category]: newRating },
    ratingHistory,
    gamesPlayed: profile.gamesPlayed + 1,
    wins: profile.wins + (result === "win" ? 1 : 0),
    losses: profile.losses + (result === "loss" ? 1 : 0),
    draws: profile.draws + (result === "draw" ? 1 : 0),
    currentWinStreak,
    bestWinStreak: Math.max(profile.bestWinStreak, currentWinStreak),
    recentGames: [
      { id: `${Date.now()}`, opponent: opponentName, result, delta, control, when: new Date().toISOString() },
      ...profile.recentGames,
    ].slice(0, 12),
  };
}

function applyPuzzleResult(profile, correct) {
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  const p = profile.puzzle;
  let streak = p.streak;
  let lastSolvedDate = p.lastSolvedDate;
  if (correct && lastSolvedDate !== todayStr) {
    streak = lastSolvedDate === yesterdayStr ? p.streak + 1 : 1;
    lastSolvedDate = todayStr;
  }
  const delta = correct ? 6 + Math.floor(Math.random() * 9) : -(3 + Math.floor(Math.random() * 5));
  return {
    ...profile,
    puzzle: {
      ...p,
      rating: Math.max(400, p.rating + delta),
      solved: p.solved + (correct ? 1 : 0),
      failed: p.failed + (correct ? 0 : 1),
      streak,
      bestStreak: Math.max(p.bestStreak, streak),
      lastSolvedDate,
      log: [{ when: new Date().toISOString(), result: correct ? "solved" : "failed", delta }, ...p.log].slice(0, 12),
    },
  };
}

function applyRushScore(profile, score) {
  return { ...profile, puzzle: { ...profile.puzzle, bestRushScore: Math.max(profile.puzzle.bestRushScore, score) } };
}

const ACHIEVEMENT_DEFS = [
  { id: "first-win", label: "First Win", icon: Crown, tone: "brass", test: (p) => p.wins >= 1 },
  { id: "streak-10", label: "10-Game Streak", icon: Flame, tone: "danger", test: (p) => p.bestWinStreak >= 10 },
  { id: "puzzle-rush-20", label: "Puzzle Rush 20", icon: Target, tone: "malachite", test: (p) => p.puzzle.bestRushScore >= 20 },
  { id: "century", label: "Century Club", icon: Medal, tone: "brass", test: (p) => p.gamesPlayed >= 100 },
  { id: "puzzle-week", label: "7-Day Puzzle Streak", icon: Flame, tone: "danger", test: (p) => p.puzzle.bestStreak >= 7 },
  { id: "diamond", label: "Reached Diamond", icon: Gem, tone: "malachite", test: (p) => p.ratings.rapid >= 1400 },
];

/* Opponent pool — used only to *generate* a matched opponent per match.
   Never displayed as a single fixed "the opponent". */
const OPPONENT_POOL = [
  { name: "Viktor Solheim", flag: "🇳🇴" },
  { name: "Elena Marchetti", flag: "🇮🇹" },
  { name: "Kwame Asante", flag: "🇬🇭" },
  { name: "Mei Lin Zhao", flag: "🇨🇳" },
  { name: "Diego Fuentes", flag: "🇪🇸" },
  { name: "Anya Kowalski", flag: "🇵🇱" },
  { name: "Tomás Herrera", flag: "🇦🇷" },
  { name: "Sofia Lindqvist", flag: "🇸🇪" },
  { name: "Ravi Chandran", flag: "🇮🇳" },
  { name: "Noah Bergström", flag: "🇩🇰" },
];
function generateOpponent(myRating) {
  const pick = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
  const rating = Math.max(400, Math.round(myRating + (Math.random() * 2 - 1) * 150));
  const title = rating >= 2200 ? "GM" : rating >= 2000 ? "IM" : rating >= 1800 ? "FM" : null;
  return { ...pick, rating, title };
}

/* ---------------------------------------------------------------------------
   PUZZLE CONTENT — hand-built tactics, each with a single unambiguous best
   move. legalMovesFrom/applyMove (the real chess engine above) validate and
   play every attempt, so any legal try that isn't the solution is correctly
   rejected — including other checks or captures that look tempting.
--------------------------------------------------------------------------- */
function emptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

const PUZZLES = [
  {
    id: "p1",
    theme: "Back Rank",
    rating: 1850,
    orientation: "w",
    intro: "White to move — the back rank is fatally weak.",
    hint: "Black's own pawns block every escape square on the 8th rank. Bring your rook all the way down the open file.",
    success: "Rd8 is checkmate — the king has nowhere to run.",
    board: () => {
      const b = emptyBoard();
      b[0][6] = { type: "k", color: "b" }; // g8
      b[1][5] = { type: "p", color: "b" }; // f7
      b[1][6] = { type: "p", color: "b" }; // g7
      b[1][7] = { type: "p", color: "b" }; // h7
      b[7][3] = { type: "r", color: "w" }; // d1
      b[7][6] = { type: "k", color: "w" }; // g1
      return b;
    },
    solution: { from: { r: 7, c: 3 }, to: { r: 0, c: 3 } },
  },
  {
    id: "p2",
    theme: "Forks",
    rating: 1720,
    orientation: "w",
    intro: "White to move — one knight hop wins material.",
    hint: "A knight on e7 would give check and attack a rook at the same time. Which square is the knight jumping from?",
    success: "Ne7+ forks the king and rook — the rook falls next move.",
    board: () => {
      const b = emptyBoard();
      b[0][6] = { type: "k", color: "b" }; // g8
      b[0][2] = { type: "r", color: "b" }; // c8
      b[3][3] = { type: "n", color: "w" }; // d5
      b[7][6] = { type: "k", color: "w" }; // g1
      return b;
    },
    solution: { from: { r: 3, c: 3 }, to: { r: 1, c: 4 } },
  },
  {
    id: "p3",
    theme: "Discovered Attack",
    rating: 2010,
    orientation: "w",
    intro: "White to move — clear the e-file with tempo.",
    hint: "Your rook already aims down the e-file at the enemy king. Move the bishop somewhere useful and see what you uncover.",
    success: "Bxh7+ grabs a pawn and discovers check from the rook on e1 — a free pawn with tempo.",
    board: () => {
      const b = emptyBoard();
      b[0][4] = { type: "k", color: "b" }; // e8
      b[1][7] = { type: "p", color: "b" }; // h7
      b[4][4] = { type: "b", color: "w" }; // e4
      b[7][4] = { type: "r", color: "w" }; // e1
      b[7][6] = { type: "k", color: "w" }; // g1
      return b;
    },
    solution: { from: { r: 4, c: 4 }, to: { r: 1, c: 7 } },
  },
  {
    id: "p4",
    theme: "Pins",
    rating: 1650,
    orientation: "w",
    intro: "White to move — the bishop can't run.",
    hint: "Black's bishop is pinned to the king by your rook on the e-file — it isn't allowed to move. What attacks it for free?",
    success: "dxe5 wins the pinned bishop outright — it was never allowed to move.",
    board: () => {
      const b = emptyBoard();
      b[0][4] = { type: "k", color: "b" }; // e8
      b[3][4] = { type: "b", color: "b" }; // e5
      b[4][3] = { type: "p", color: "w" }; // d4
      b[7][4] = { type: "r", color: "w" }; // e1
      b[7][6] = { type: "k", color: "w" }; // g1
      return b;
    },
    solution: { from: { r: 4, c: 3 }, to: { r: 3, c: 4 } },
  },
];

const NEUTRAL_PUZZLE_STATE = {
  castling: { w: { k: false, q: false }, b: { k: false, q: false } },
  enPassant: null,
};

const THEME_LIST = ["Back Rank", "Forks", "Discovered Attack", "Pins", "Endgames", "Sacrifices"];

/* ---------------------------------------------------------------------------
   STYLE SYSTEM
--------------------------------------------------------------------------- */
const Style = () => (
  <style>{`
    .cv {
      --ink: #08070f;
      --ink-soft: #0d0c18;
      --surface: #14121f;
      --surface-raised: #1a1828;
      --surface-hover: #211e33;
      --line: #2c2843;
      --line-soft: #221f36;
      --brass: #a855f7;
      --brass-bright: #c084fc;
      --brass-dim: #9333ea;
      --danger: #ef4444;
      --danger-bright: #f87171;
      --malachite: #22c55e;
      --ivory: #fafaf9;
      --ivory-dim: #e7e5e4;
      --muted: #a1a1aa;
      --muted-2: #71717a;
      --font-body: 'Inter', system-ui, sans-serif;
      --shadow-soft: 0 4px 20px rgba(0,0,0,0.35);
      --shadow-lift: 0 12px 40px rgba(0,0,0,0.5);
      background: var(--ink);
      color: var(--ivory-dim);
      min-height: 100vh;
    }

    .cv-shell {
      display: flex;
      min-height: 100vh;
    }

    .scrim {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 40%), radial-gradient(800px 400px at 80% -20%, rgba(139,92,246,0.25), transparent 60%);
    }

    .content {
      flex: 1;
      padding: 34px;
      max-width: 1240px;
      width: 100%;
      margin: 0 auto;
    }

    /* ---- Typography ---- */
    .eyebrow {
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--brass);
    }
    .h1 {
      font-family: var(--font-body);
      font-weight: 800;
      font-size: 30px;
      letter-spacing: -0.02em;
      color: var(--ivory);
      margin: 0;
    }
    .h2 {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.01em;
      color: var(--ivory);
      margin: 0;
    }
    .h3 {
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 14.5px;
      color: var(--ivory-dim);
      margin: 0;
    }
    .muted {
      color: var(--muted);
      font-size: 13.5px;
      line-height: 1.55;
    }
    .mono {
      font-family: var(--font-mono);
    }
    .divider {
      border: none;
      height: 1px;
      background: var(--line);
      margin: 18px 0;
    }

    /* ---- Buttons ---- */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      border: 1px solid transparent;
      color: var(--ivory-dim);
      background: var(--surface);
      box-shadow: var(--shadow-soft);
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: var(--surface-raised);
      border-color: var(--line);
    }
    .btn:active {
      transform: scale(0.98);
    }
    .btn-brass {
      background: var(--brass);
      color: #fff;
      border-color: var(--brass-dim);
    }
    .btn-brass:hover {
      background: var(--brass-bright);
    }
    .btn-danger {
      background: var(--danger);
      color: #fff;
      border-color: var(--danger-bright);
    }
    .btn-danger:hover {
      background: var(--danger-bright);
    }
    .btn-ghost {
      background: transparent;
      border-color: var(--line);
      color: var(--ivory-dim);
    }
    .btn-ghost:hover {
      color: var(--ivory);
      border-color: var(--line);
      background: var(--surface);
    }
    .btn-icon {
      padding: 10px;
      border-radius: 10px;
    }
    .btn-sm {
      padding: 7px 14px;
      font-size: 12px;
      border-radius: 8px;
    }
    .btn-lg {
      padding: 14px 26px;
      font-size: 15px;
      border-radius: 12px;
    }

    /* ---- Card ---- */
    .card {
      background: var(--surface);
      border: 1px solid var(--line-soft);
      border-radius: 16px;
      padding: 20px;
    }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .ov-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--line-soft);
      border-radius: 14px;
      padding: 16px 18px;
    }
    .stat-num {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 24px;
      color: var(--ivory);
      line-height: 1;
      margin-top: 6px;
    }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 250px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      padding: 24px 18px;
      border-right: 1px solid var(--line);
      background: var(--ink-soft);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px 20px;
    }
    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .brand-name {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 18px;
      color: var(--ivory);
    }
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid rgba(168, 85, 247, 0.3);
      background: rgba(168, 85, 247, 0.12);
      color: #c4b5fd;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }
    .nav-item:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.48);
      color: #e9d5ff;
    }
    .nav-item.active {
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      border-color: rgba(192, 132, 252, 0.65);
      color: #fff;
      box-shadow: 0 4px 18px rgba(168, 85, 247, 0.35);
    }
    .sidebar-foot {
      margin-top: 12px;
      padding: 12px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--muted);
    }
    .sidebar-foot .tier-badge { flex-shrink: 0; }

    /* ---- Main column ---- */
    .main-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* ---- Landing / play options ---- */
    .landing-hero {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 32px;
      padding: 48px;
      border-radius: 24px;
      border: 1px solid var(--line);
      background: linear-gradient(135deg, var(--surface-raised) 0%, var(--surface) 60%, var(--ink-soft) 100%);
    }
    .landing-hero-text {
      flex: 1 1 380px;
      min-width: 0;
      max-width: 560px;
    }
    .landing-lede {
      margin: 14px 0 28px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.6;
    }
    .landing-cta {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .landing-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 32px;
    }
    .landing-stats .ls-item {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 5px;
      padding: 14px 16px;
    }
    .landing-stats .stat-num {
      font-size: 24px;
    }

    .landing-board {
      position: relative;
      z-index: 1;
      width: 340px;
      height: 340px;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(8, 1fr);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 26px 60px rgba(0,0,0,0.45);
      border: 1px solid var(--line-soft);
    }
    .lb-cell { position: relative; display: flex; align-items: center; justify-content: center; }
    .lb-light { background: #f0d9b5; }
    .lb-dark { background: #b58863; }
    .lb-cell.lb-last::after { content: ''; position: absolute; inset: 0; background: rgba(246, 238, 128, 0.4); pointer-events: none; }
    .landing-board .piece-glyph { font-size: 31px; line-height: 1; }
    .landing-board .piece-glyph.lb-moved { animation: lbPop 0.35s ease; }
    @keyframes lbPop {
      0% { transform: scale(0.55); }
      60% { transform: scale(1.14); }
      100% { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) { .landing-board .piece-glyph.lb-moved { animation: none; } }

    /* ---- Mode picker ---- */
    .mode-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .mode-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 18px;
      border-radius: 14px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
      text-align: left;
      color: var(--ivory-dim);
      font-family: var(--font-body);
    }
    .mode-card:hover {
      border-color: var(--line);
      background: var(--surface-raised);
    }
    /* Featured “Play a Friend” — spans the full grid width (2x the others) */
    .mode-card.mode-friend {
      grid-column: 1 / -1;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
    }
    .mode-card.mode-friend .mode-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      flex-shrink: 0;
    }
    .mode-card.mode-friend .mode-icon svg { width: 26px; height: 26px; }
    .mode-card.mode-friend .h3 { font-size: 17px; }
    .mode-card.mode-friend .muted { font-size: 13.5px; }
    .mode-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ivory);
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      margin-bottom: 4px;
    }
    .play-options { margin-top: 36px; }

    /* ---- Time control chips ---- */
    .tc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .tc-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 13px 10px;
      border-radius: 12px;
      border: 1px solid var(--line-soft);
      background: var(--surface);
      cursor: pointer;
      color: var(--ivory-dim);
      transition: border-color 0.15s ease, background 0.15s ease;
      font-family: var(--font-body);
    }
    .tc-chip:hover { border-color: var(--line); background: var(--surface-raised); }
    .tc-chip.active {
      border-color: var(--brass);
      background: var(--surface-hover);
      color: var(--brass-bright);
    }
    .tc-label { font-weight: 700; font-family: var(--font-mono); font-size: 13px; }
    .tc-sub { font-size: 10.5px; color: var(--muted); }

    /* ---- Tab bar ---- */
    .tabbar {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
    }
    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--muted);
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .tab-btn:hover { color: var(--ivory-dim); }
    .tab-btn.active {
      background: var(--surface-hover);
      color: var(--brass-bright);
    }

    /* ---- Searching ring ---- */
    .mm-ring {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;
      border-radius: 50%;
      border: 3px solid transparent;
    }
    .mm-ring::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: var(--brass-bright);
      border-right-color: var(--brass);
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mm-ring-found {
      border-color: var(--malachite);
      box-shadow: 0 0 40px rgba(34, 197, 94, 0.4);
      animation: popIn 0.4s ease;
    }
    @keyframes popIn {
      0% { transform: scale(0.6); opacity: 0; }
      70% { transform: scale(1.08); }
      100% { transform: scale(1); opacity: 1; }
    }
    .match-found-opponent {
      margin-top: 14px;
      text-align: center;
    }
    .opponent-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin: 0 auto 10px;
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      border: 2px solid var(--line);
    }

    /* ---- Board ---- */
    .board-wrap { display: flex; width: fit-content; margin: 0 auto; flex-direction: column; border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-lift); border: 1px solid var(--line-soft); }
    .board-grid { display: grid; grid-template-columns: repeat(8, var(--sqsize)); grid-template-rows: repeat(8, var(--sqsize)); }
    .square { position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; }
    .square.light { background: #f0d9b5; }
    .square.dark { background: #b58863; }
    .square.selected.light { background: #f6ee80; }
    .square.selected.dark { background: #d8c34a; }
    .square.lastmove.light { background: #f3ec9b; }
    .square.lastmove.dark { background: #c9b458; }
    .square.check { box-shadow: inset 0 0 0 3px var(--danger-bright); }
    .square.premove { box-shadow: inset 0 0 0 3px rgba(59,130,246,0.85); }
    .square .coord { position: absolute; font-size: 9.5px; font-family: var(--font-mono); font-weight: 600; opacity: 0.55; }
    .square .coord.file { bottom: 2px; right: 4px; }
    .square .coord.rank { top: 2px; left: 3px; }
    .square.light .coord { color: #8a6238; }
    .square.dark .coord { color: #f2ddb8; }
    .piece-glyph { font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'DejaVu Sans', 'Apple Symbols', serif; font-size: calc(var(--sqsize) * 0.8); line-height: 1; font-weight: 400; transition: transform 0.1s ease; filter: drop-shadow(0 3px 2px rgba(35,20,5,0.4)); }
    .piece-glyph.white { color: #fffdf6; -webkit-text-fill-color: #fffdf6; -webkit-text-stroke: 0.6px #5c3a1e; paint-order: stroke fill; }
    .piece-glyph.black { color: #1a0f04; -webkit-text-fill-color: #1a0f04; -webkit-text-stroke: 0.6px #2a1608; paint-order: stroke fill; }
    .square:hover .piece-glyph { transform: scale(1.06); }
    .move-dot { width: 30%; height: 30%; border-radius: 50%; background: rgba(124,92,252,0.55); position: absolute; }
    .square.dark .move-dot { background: rgba(155,134,255,0.65); }
    .capture-ring { position: absolute; inset: 6%; border-radius: 50%; border: 4px solid rgba(124,92,252,0.65); }
    .square.dark .capture-ring { border-color: rgba(155,134,255,0.75); }

    /* ---- Game HUD ---- */
    .game-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }
    .below-board-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 14px;
    }
    .below-board-row .clock { display: none; }
    .board-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .game-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 14px;
      width: 100%;
    }
    .player-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 14px;
      border: 1px solid var(--line-soft);
      background: var(--surface);
      min-width: 0;
    }
    .player-pill.you { justify-content: flex-end; }
    .pill-info { flex: 1 1 auto; min-width: 0; }
    .player-avatar-wrap { position: relative; flex-shrink: 0; }
    .online-dot {
      position: absolute;
      right: -1px;
      bottom: -1px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--malachite);
      border: 2px solid var(--surface);
    }
    .player-name-row { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .player-name {
      font-weight: 700;
      font-size: 15px;
      color: var(--ivory);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .player-flag { font-size: 14px; line-height: 1; }
    .player-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-top: 3px; }
    .pill-clock {
      display: block;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 15px;
      color: var(--ivory-dim);
      padding: 5px 10px;
      border-radius: 9px;
      background: var(--surface-hover);
      border: 1px solid var(--line-soft);
      white-space: nowrap;
      margin-left: auto;
      flex-shrink: 0;
    }
    .player-pill.you .pill-clock { margin-left: 0; margin-right: auto; }
    .pill-clock.active { color: var(--brass-bright); border-color: var(--brass); background: var(--surface); }
    .pill-clock.low { color: var(--danger-bright); }
    .clock {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 20px;
      min-width: 92px;
      text-align: center;
      padding: 9px 16px;
      border-radius: 10px;
      color: var(--ivory-dim);
      background: var(--surface);
      border: 1px solid var(--line-soft);
    }
    .clock.active {
      color: var(--brass-bright);
      background: var(--surface-hover);
      border-color: var(--brass);
    }
    .clock.low { color: var(--danger-bright); }
    .clock-sm { font-size: 15px; min-width: 76px; padding: 7px 12px; }
    .format-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 7px 18px;
      border-radius: 12px;
      border: 1px solid var(--line-soft);
      background: var(--surface);
    }
    .format-time { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 17px; color: var(--brass-bright); }
    .format-label { font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
    .ctrl-divider { width: 1px; height: 22px; background: var(--line); margin: 0 2px; }

    .sparkline-wrap { height: 30px; }
    .sparkline-fill { fill: rgba(139,92,246,0.25); }
    .daily-goal-track {
      height: 8px;
      border-radius: 999px;
      background: var(--line);
      overflow: hidden;
      margin-top: 8px;
    }
    .daily-goal-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--brass), var(--brass-dim));
    }
    .daily-goal-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      color: var(--muted);
      margin-top: 10px;
    }
    .daily-goal-label span:last-child { font-family: var(--font-mono); color: var(--ivory-dim); }

    /* ---- Move list ---- */
    .movelist {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 260px;
      overflow-y: auto;
    }
    .movelist-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 10px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 13.5px;
    }
    .movelist-row:hover { background: var(--surface-hover); }
    .movelist-num {
      width: 28px;
      flex-shrink: 0;
      font-size: 11px;
      color: var(--muted);
      text-align: right;
    }
    .movelist-move {
      flex: 1;
      color: var(--ivory-dim);
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.1s ease, color 0.1s ease;
    }
    .movelist-move:hover { background: var(--surface); color: var(--ivory); }
    .movelist-move.current {
      background: var(--surface-hover);
      color: var(--brass-bright);
    }
    .movelist-eval {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--brass-bright);
      background: rgba(168, 85, 247, 0.12);
      padding: 2px 6px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .premove-banner {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(59,130,246,0.3);
      background: rgba(59,130,246,0.08);
      color: #93c5fd;
      font-size: 13px;
      font-weight: 600;
    }

    /* ---- Right panel ---- */
    .right-panel {
      width: 340px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ls-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
    }
    .ls-label { font-weight: 600; color: var(--ivory-dim); font-size: 13.5px; }
    .accent { color: var(--brass-bright); font-weight: 700; font-family: var(--font-mono); }

    /* ---- Puzzles ---- */
    .puzzle-layout { display: flex; gap: 24px; align-items: flex-start; }
    .puzzle-board-col { flex-shrink: 0; width: min(100%, 434px); }
    .puzzle-side {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .puzzle-stats-row { display: flex; gap: 14px; }
    .puzzle-side-stat {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
    }
    .puzzle-side-stat .stat-num { margin-top: 0; }
    .puzzle-stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .puzzle-stat-top .eyebrow { white-space: nowrap; }
    .puzzle-stat-sub {
      font-size: 11.5px;
      color: var(--muted);
      text-align: right;
      white-space: nowrap;
    }

    /* ---- Profile ---- */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .avatar {
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      color: #fff;
      font-family: var(--font-body);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .profile-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.15s ease;
    }
    .profile-chip:hover { background: var(--surface-hover); }
    .profile-chip-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .profile-chip-name { font-weight: 600; font-size: 13px; color: var(--ivory); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .profile-chip-rating { font-family: var(--font-mono); font-size: 12.5px; color: var(--brass-bright); }
    .profile-rating-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 18px;
    }

    /* ---- Chat ---- */
    .chat-log {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 240px;
      overflow-y: auto;
    }
    .chat-msg {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 9px 12px;
      border-radius: 10px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
      font-size: 13px;
      color: var(--ivory-dim);
    }
    .chat-bubble { line-height: 1.45; }
    .chat-time { font-size: 10.5px; color: var(--muted-2); }
    .chat-input-row { display: flex; gap: 8px; margin-top: 10px; }
    .chat-send-btn { flex-shrink: 0; }
    .quick-msg-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .quick-msg-chip {
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid var(--line-soft);
      background: var(--surface);
      color: var(--muted);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.15s ease, color 0.15s ease;
    }
    .quick-msg-chip:hover { border-color: var(--line); color: var(--ivory); }

    /* ---- Badges ---- */
    .badge-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 14px;
      border-radius: 14px;
      background: var(--surface);
      border: 1px solid var(--line-soft);
      text-align: center;
    }
    .badge-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ivory);
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
    }
    .badge-icon.gold { background: linear-gradient(135deg, #fbbf24 0%, #b45309 100%); color: #fff; }
    .badge-icon.silver { background: linear-gradient(135deg, #cbd5e1 0%, #64748b 100%); color: #fff; }
    .badge-icon.bronze { background: linear-gradient(135deg, #fdba74 0%, #c2410c 100%); color: #fff; }
    .badge-icon.rank { background: linear-gradient(135deg, #818cf8 0%, #4f46e5 100%); }
    .badge-icon.streak { background: linear-gradient(135deg, #fb7185 0%, #e11d48 100%); }
    .badge-icon.time { background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%); }

    /* ---- Pills / tags / toast ---- */
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      font-family: var(--font-body);
    }
    .pill-win {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .pill-loss {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .pill-draw {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(168, 85, 247, 0.1);
      color: var(--brass-bright);
      font-size: 11.5px;
      font-weight: 600;
    }
    .title-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 13px;
      border-radius: 999px;
      background: var(--surface-hover);
      border: 1px solid var(--line);
      color: var(--brass-bright);
      font-weight: 700;
      font-size: 12.5px;
    }
    .tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 11px;
      border-radius: 8px;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 12px;
      background: linear-gradient(135deg, var(--brass) 0%, var(--brass-dim) 100%);
      color: #fff;
    }
    .tier-badge.tier-lg { font-size: 14px; padding: 7px 14px; }
    .rank { display: inline-flex; align-items: center; gap: 5px; color: #fbbf24; font-weight: 700; font-size: 13px; }

    /* ---- Placeholder ---- */
    .placeholder-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      background: var(--surface);
      border: 1px dashed var(--line);
      margin: 0 auto 12px;
    }

    /* ---- Modal ---- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0,0,0,0.6);
      animation: fadein 0.2s ease both;
    }
    @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
    .modal-card {
      width: 100%;
      max-width: 560px;
      max-height: 86vh;
      overflow-y: auto;
      border-radius: 20px;
      padding: 30px;
      background: var(--surface);
      border: 1px solid var(--line);
    }

    /* ---- Misc ---- */
    .toast {
      position: fixed;
      left: 50%;
      bottom: 26px;
      transform: translateX(-50%);
      z-index: 120;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 20px;
      border-radius: 999px;
      background: var(--surface-raised);
      border: 1px solid var(--line);
      color: var(--ivory);
      font-weight: 600;
      font-size: 13.5px;
      box-shadow: var(--shadow-lift);
    }
    .thinking-dots {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 0;
    }
    .thinking-dots .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--muted);
      animation: blink 1.2s infinite;
    }
    .thinking-dots .dot:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
    .fade-in { animation: fadein 0.3s ease both; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ---- Responsive ---- */
    @media (max-width: 1400px) {
      .game-layout { flex-direction: column; align-items: stretch; }
      .right-panel { width: 100%; }
      .puzzle-layout { flex-direction: column; align-items: center; }
      .puzzle-side { width: 100%; }
    }

    @media (max-width: 720px) {
      .puzzle-stats-row { flex-direction: column; }
    }

    @media (max-width: 1280px) {
      .content { padding: 26px; }
      .landing-hero { padding: 36px; gap: 26px; }
      .landing-hero-text { max-width: 460px; }
      .landing-board { width: 300px; height: 300px; }
      .landing-board .piece-glyph { font-size: 27px; }
    }

    @media (max-width: 1180px) {
      .landing-hero { flex-direction: column; align-items: stretch; padding: 36px; }
      .landing-hero-text { flex: 0 0 auto; max-width: 620px; }
      .landing-board { align-self: center; }
      .landing-cta { display: none; }
    }

    /* Compact fit for short screens — everything visible without scrolling. */
    @media (max-height: 900px) and (min-width: 821px) {
      .content { padding: 18px 34px 22px; }
      .landing-hero { padding: 22px 26px; gap: 24px; }
      .landing-hero-text .h1 { font-size: 24px; }
      .landing-lede { margin: 9px 0 14px; font-size: 13.5px; line-height: 1.5; }
      .landing-cta { gap: 10px; }
      .landing-cta .btn-lg { padding: 10px 18px; font-size: 13.5px; }
      .landing-stats { margin-top: 13px; gap: 12px; }
      .landing-stats .ls-item { padding: 8px 13px; }
      .landing-stats .stat-num { font-size: 19px; margin-top: 3px; }
      .landing-board { width: 270px; height: 270px; }
      .landing-board .piece-glyph { font-size: 24px; }
      .play-options { margin-top: 14px; }
      .mode-grid { gap: 12px; }
      .mode-card { padding: 11px 13px; gap: 6px; }
      .mode-card .h3 { font-size: 13.5px; }
      .mode-icon { width: 32px; height: 32px; margin-bottom: 2px; }
    }

    @media (max-width: 820px) {
      .sidebar {
        position: fixed;
        left: 0;
        right: 0;
        top: auto;
        bottom: 0;
        width: 100%;
        height: auto;
        flex-direction: row;
        align-items: stretch;
        padding: 10px 12px;
        border-right: none;
        border-top: 1px solid var(--line);
        background: var(--ink-soft);
        z-index: 80;
      }
      .brand, .sidebar-foot { display: none; }
      .nav-list {
        flex-direction: row;
        width: 100%;
        gap: 4px;
        padding: 0;
      }
      .nav-item {
        flex: 1;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        padding: 9px 4px;
        font-size: 10.5px;
        font-weight: 700;
        text-align: center;
      }
      .main-col { padding-bottom: 70px; }
      .content { padding: 18px 14px; }
      .h1 { font-size: 24px; }
      .h2 { font-size: 17px; }
      .below-board-row { flex-wrap: wrap; justify-content: center; gap: 10px; }
      .below-board-row .btn-sm { padding: 8px 10px; font-size: 12px; }
      .board-controls { flex-wrap: wrap; justify-content: center; gap: 6px; }
      .board-controls .btn-icon { padding: 6px; }
      .player-pill.you .player-meta { display: none; }
      .game-header { grid-template-columns: 1fr 1fr; }
      .player-pill:first-child { grid-column: 1; grid-row: 1; }
      .player-pill.you { grid-column: 2; grid-row: 1; }
      .player-pill { padding: 6px 10px; gap: 8px; }
      .player-pill .avatar { width: 32px !important; height: 32px !important; font-size: 12px !important; }
      .player-name { font-size: 13px; }
      .player-meta { font-size: 10px; }
      .pill-clock { font-size: 13px; padding: 4px 8px; }
      .format-pill { grid-column: 1 / -1; grid-row: 2; justify-self: center; flex-direction: row; gap: 6px; padding: 5px 12px; }
      .format-time { font-size: 14px; }
      .format-label { font-size: 9.5px; }
      .landing-hero { padding: 28px 22px; border-radius: 20px; gap: 14px; }
      .landing-lede { display: none; }
      .landing-stats { display: none; }
      .landing-board { width: 100%; height: auto; aspect-ratio: 1 / 1; max-width: 400px; margin: 0 auto; }
      .mode-grid, .tc-grid { grid-template-columns: repeat(2, 1fr); }
      .grid-3 { grid-template-columns: 1fr; }
      .ov-grid { grid-template-columns: 1fr; }
      #cv-play-options .h2 { display: none; }
      .toast { bottom: 88px; }
    }
  `}</style>
);



/* ---------------------------------------------------------------------------
   SMALL COMPONENTS
--------------------------------------------------------------------------- */
function Avatar({ name, size = 32, ring = false }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, boxShadow: ring ? "0 0 0 2px var(--brass-bright)" : "none" }}>
      {initials}
    </div>
  );
}

function PlayerAvatar({ profile, size = 32, ring = false }) {
  if (profile.avatarId) {
    return <AvatarDisplay avatarId={profile.avatarId} size={size} style={{ boxShadow: ring ? "0 0 0 2px var(--brass-bright)" : "none" }} />;
  }
  return <Avatar name={profile.name} size={size} ring={ring} />;
}

function TierBadge({ rating, size = "sm" }) {
  const tier = getTier(rating);
  const Icon = tier.Icon;
  return (
    <span className={`tier-badge tier-${size}`} style={{ color: tier.color, borderColor: tier.color }}>
      <Icon size={size === "lg" ? 15 : 11} /> {tier.label}
    </span>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast fade-in">{message}</div>;
}

function fmtClock(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  if (s < 10) {
    return `${m}:${r.toFixed(1).padStart(4, "0")}`;
  }
  return `${m}:${Math.floor(r).toString().padStart(2, "0")}`;
}

function Sparkline({ data, width = 280, height = 64, color = "var(--brass-bright)" }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 8) - 4;
    return [x, y];
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-wrap">
      <polygon points={area} fill={color} className="sparkline-fill" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   CHESSBOARD — rendering & interaction rules unchanged
--------------------------------------------------------------------------- */
function ChessBoard({ board, legalTargets, selected, onSquareClick, lastMove, orientation, checkSquare, sqSize = 62, premoveFrom = null, premoveTo = null }) {
  const rows = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="board-wrap">
      <div className="board-grid" style={{ "--sqsize": `min(${sqSize}px, calc((100vw - 28px) / 8))` }}>
        {rows.map((r) =>
          cols.map((c) => {
            const isLight = (r + c) % 2 === 0;
            const piece = board[r][c];
            const isSelected = selected && selected.r === r && selected.c === c;
            const isLast = lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c));
            const isCheck = checkSquare && checkSquare.r === r && checkSquare.c === c;
            const isPremoveFrom = premoveFrom && premoveFrom.r === r && premoveFrom.c === c;
            const isPremoveTo = premoveTo && premoveTo.r === r && premoveTo.c === c;
            const target = legalTargets.find((m) => m.to.r === r && m.to.c === c);
            const showFile = r === (orientation === "w" ? 7 : 0);
            const showRank = c === (orientation === "w" ? 0 : 7);
            return (
              <div
                key={`${r}-${c}`}
                className={[
                  "square",
                  isLight ? "light" : "dark",
                  isSelected ? "selected" : "",
                  isLast ? "lastmove" : "",
                  isCheck ? "check" : "",
                  isPremoveFrom || isPremoveTo ? "premove" : "",
                ].join(" ")}
                onClick={() => onSquareClick(r, c)}
              >
                {showFile && <span className="coord file">{FILES[c]}</span>}
                {showRank && <span className="coord rank">{8 - r}</span>}
                {piece && (
                  <span className={`piece-glyph ${piece.color === "w" ? "white" : "black"}`}>
                    {GLYPHS[piece.color][piece.type]}
                  </span>
                )}
                {target && (piece ? <span className="capture-ring" /> : <span className="move-dot" />)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PROMOTION DIALOG
--------------------------------------------------------------------------- */
function PromotionDialog({ color, onChoose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card fade-in" style={{ width: "min(300px, calc(100vw - 32px))" }}>
        <div className="h3" style={{ marginBottom: 16 }}>Promote your pawn</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {["q", "r", "b", "n"].map((t) => (
            <button
              key={t}
              className="btn btn-ghost"
              style={{ fontSize: 30, width: 58, height: 58, justifyContent: "center" }}
              onClick={() => onChoose(t)}
            >
              <span className={`piece-glyph ${color === "w" ? "white" : "black"}`} style={{ fontSize: 30 }}>
                {GLYPHS[color][t]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   GAME OVER MODAL
--------------------------------------------------------------------------- */
function GameOverModal({ result, onRematch, onExit }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card fade-in">
        <div className="placeholder-icon" style={{ margin: "0 auto 14px" }}>
          <Crown size={28} />
        </div>
        <div className="h2">{result.title}</div>
        <div className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>{result.subtitle}</div>
        {typeof result.delta === "number" && (
          <div className="mono" style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: result.delta >= 0 ? "var(--malachite)" : "var(--danger-bright)" }}>
            Rating {result.delta >= 0 ? "+" : ""}{result.delta}
          </div>
        )}
        <div className="divider" />
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-brass" onClick={onRematch}><Repeat size={15} /> Rematch</button>
          <button className="btn btn-ghost" onClick={onExit}>Back to Play</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SIDEBAR
--------------------------------------------------------------------------- */
function Sidebar({ view, setView, profile }) {
  const todayStr = new Date().toDateString();
  const gamesToday = profile.recentGames.filter((g) => new Date(g.when).toDateString() === todayStr).length;
  const goal = 5;
  const pct = Math.min(100, Math.round((gamesToday / goal) * 100));

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Crown size={19} /></div>
        <div className="brand-name">ChessVerse</div>
      </div>
      <nav className="nav-list">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="profile-chip" onClick={() => setView("profile")}>
          <PlayerAvatar profile={profile} size={32} ring />
          <div className="profile-chip-info">
            <div className="profile-chip-name">{profile.name}</div>
            <div className="profile-chip-rating">{profile.ratings.rapid} {profile.flag}</div>
          </div>
          <TierBadge rating={profile.ratings.rapid} />
        </div>
        <div className="daily-goal">
          <div className="daily-goal-label"><span>Daily Goal</span><span>{gamesToday}/{goal} games</span></div>
          <div className="daily-goal-track"><div className="daily-goal-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------------------
   PLAY VIEW — landing page
--------------------------------------------------------------------------- */
function LandingBoardArt() {
  // Filled glyphs read as black pieces; outline glyphs read as white pieces.
  const FILL = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const OUTLINE = { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" };
  const [, setFrame] = useState(0);

  // Self-play simulation: the board plays random legal moves on a loop so the
  // landing board looks like a live game, purely for visual flair.
  const simRef = useRef({
    board: initialBoard(),
    castling: { w: { k: true, q: true }, b: { k: true, q: true } },
    enPassant: null,
    turn: "w",
    lastMove: null,
    plies: 0,
  });

  useEffect(() => {
    let timer = null;
    const tick = () => {
      const s = simRef.current;
      const moves = getLegalMoves(s.board, s.turn, s);
      if (moves.length === 0 || s.plies >= 60) {
        // Game finished (or long enough) — reset to the starting position.
        Object.assign(s, {
          board: initialBoard(),
          castling: { w: { k: true, q: true }, b: { k: true, q: true } },
          enPassant: null,
          turn: "w",
          lastMove: null,
          plies: 0,
        });
      } else {
        const m = moves[Math.floor(Math.random() * moves.length)];
        const res = applyMove(s.board, s, m);
        s.board = res.board;
        s.castling = res.castling;
        s.enPassant = res.enPassant;
        s.turn = s.turn === "w" ? "b" : "w";
        s.lastMove = { from: m.from, to: m.to };
        s.plies += 1;
      }
      setFrame((f) => f + 1);
      timer = setTimeout(tick, 450 + Math.random() * 550);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  const sim = simRef.current;
  const cells = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1;
      const p = sim.board[r][c];
      const isLast =
        sim.lastMove &&
        ((sim.lastMove.from.r === r && sim.lastMove.from.c === c) ||
         (sim.lastMove.to.r === r && sim.lastMove.to.c === c));
      const isMoved = sim.lastMove && sim.lastMove.to.r === r && sim.lastMove.to.c === c;
      cells.push(
        <div key={`${r}-${c}`} className={`lb-cell ${dark ? "lb-dark" : "lb-light"}${isLast ? " lb-last" : ""}`}>
          {p && (
            <span
              key={`${r}-${c}-${p.type}${p.color}`}
              className={`piece-glyph ${p.color === "w" ? "white" : "black"}${isMoved ? " lb-moved" : ""}`}
            >
              {p.color === "w" ? OUTLINE[p.type] : FILL[p.type]}
            </span>
          )}
        </div>
      );
    }
  }
  return <div className="landing-board" aria-hidden="true">{cells}</div>;
}

function PlayView({ onStart, profile, notify }) {
  const [mode, setMode] = useState(null);
  const [tc, setTc] = useState(TIME_CONTROLS[4]);
  const [botDiff, setBotDiff] = useState("medium");
  
  // Quick Match state
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState("idle"); // idle | searching | found | timeout
  const [queueId, setQueueId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  
  // Play a Friend state
  const [friendCode, setFriendCode] = useState("");
  const [friendJoining, setFriendJoining] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null); // null | "waiting" | "active" | "notfound" | "full"
  
  const [searchPollTimer, setSearchPollTimer] = useState(null);
  const [friendPollTimer, setFriendPollTimer] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchPollTimer) clearTimeout(searchPollTimer);
      if (friendPollTimer) clearInterval(friendPollTimer);
    };
  }, []);

  const cancelSearch = async () => {
    if (searchPollTimer) clearTimeout(searchPollTimer);
    setSearchPollTimer(null);
    if (queueId) {
      try {
        await api.delete("/chess/queue/leave", { data: { queueId } });
      } catch (e) { /* ignore */ }
    }
    setSearching(false);
    setSearchPhase("idle");
    setQueueId(null);
    setMatchData(null);
  };

  // Start Quick Match: join queue, poll for 4 seconds
  const startQuickMatch = async () => {
    setMode("quick");
    setSearching(true);
    setSearchPhase("searching");
    setQueueId(null);
    setMatchData(null);

    try {
      const category = controlCategory(tc);
      const rating = profile.ratings[category] || 1200;
      const res = await api.post("/chess/queue/join", {
        player_name: profile.name || "Player",
        rating: rating,
        time_control: tc.base,
      });

      if (res.data.matched) {
        // Immediate match!
        setSearchPhase("found");
        setMatchData({
          roomCode: res.data.roomCode,
          color: res.data.color,
          opponentName: res.data.opponentName,
          isOnline: true,
        });
        setTimeout(() => startOnlineGame(matchData.roomCode, res.data.color, res.data.opponentName), 1500);
        return;
      }

      if (res.data.queued) {
        setQueueId(res.data.queueId);
        // Poll for up to 4 seconds
        let pollCount = 0;
        const maxPolls = 8; // 4 seconds / 500ms
        
        const poll = async () => {
          pollCount++;
          try {
            const pollRes = await api.get(`/chess/queue/poll?queueId=${queueId}`);
            if (pollRes.data.matched) {
              // Match found!
              clearTimeout(searchPollTimer);
              setSearchPollTimer(null);
              setSearchPhase("found");
              const md = {
                roomCode: pollRes.data.roomCode,
                color: pollRes.data.color,
                opponentName: pollRes.data.opponentName,
                isOnline: true,
              };
              setMatchData(md);
              setTimeout(() => startOnlineGame(md.roomCode, md.color, md.opponentName), 1500);
              return;
            }
            if (pollCount >= maxPolls) {
              // Timeout - fallback to bot
              clearTimeout(searchPollTimer);
              setSearchPollTimer(null);
              setSearchPhase("timeout");
              setTimeout(() => startBotGame(), 1500);
              return;
            }
            // Continue polling
            const timerId = setTimeout(poll, 500);
            setSearchPollTimer(timerId);
          } catch (e) {
            pollCount = maxPolls; // Stop on error
            setTimeout(() => startBotGame(), 500);
          }
        };
        
        const timerId = setTimeout(poll, 500);
        setSearchPollTimer(timerId);
      }
    } catch (e) {
      console.error("Queue join error:", e);
      notify("Could not find match. Starting vs computer...");
      setTimeout(() => startBotGame(), 1500);
    }
  };

  // Create a room for Play a Friend (host)
  const createFriendRoom = async () => {
    const code = `CVRS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setFriendStatus("waiting");
    
    try {
      const res = await api.post("/chess/room", {
        game_id: 0,
        player_name: profile.name || "Player",
        time_control: tc.base,
      });
      
      if (res.data.success) {
        // Poll for opponent joining
        const pollInterval = setInterval(async () => {
          try {
            const checkRes = await api.get(`/chess/room/${code}`);
            if (checkRes.data.room?.player2_name) {
              clearInterval(pollInterval);
              setFriendStatus("active");
              // Start game as white
              setTimeout(() => startOnlineGame(code, "w", checkRes.data.room.player2_name), 1500);
            }
          } catch (e) { /* keep polling */ }
        }, 1000);
        setFriendPollTimer(pollInterval);
      }
    } catch (e) {
      notify("Failed to create room");
      setFriendStatus(null);
    }
  };

  // Join an existing friend room
  const joinFriendRoom = async () => {
    if (!friendCode.trim()) {
      notify("Enter a room code");
      return;
    }
    const code = friendCode.trim().toUpperCase();
    setFriendJoining(true);
    setFriendStatus("waiting");
    
    try {
      const checkRes = await api.get(`/chess/room/${code}`);
      if (!checkRes.data.success) {
        setFriendStatus("notfound");
        setFriendJoining(false);
        return;
      }
      
      const room = checkRes.data.room;
      if (room.status !== "waiting") {
        setFriendStatus(room.status === "active" ? "full" : "notfound");
        setFriendJoining(false);
        return;
      }
      
      const joinRes = await api.post(`/chess/room/${code}/join`, {
        player_name: profile.name || "Player",
      });
      
      if (joinRes.data.success) {
        setFriendStatus("active");
        // Start game as black
        setTimeout(() => startOnlineGame(code, "b", room.player1_name), 1500);
      }
    } catch (e) {
      setFriendStatus("notfound");
    }
    setFriendJoining(false);
  };

  const startOnlineGame = (roomCode, color, opponentName) => {
    setSearching(false);
    setSearchPhase("idle");
    cancelSearch();
    if (friendPollTimer) clearInterval(friendPollTimer);
    setFriendStatus(null);
    
    const category = controlCategory(tc);
    onStart({
      mode: "online",
      tc,
      color,
      category,
      roomCode,
      opponent: { name: opponentName, rating: 1200, flag: null, title: null },
    });
  };

  const startBotGame = () => {
    setSearching(false);
    setSearchPhase("idle");
    cancelSearch();
    const category = controlCategory(tc);
    onStart({
      mode: "computer",
      tc,
      color: "w",
      category,
      difficulty: botDiff,
      opponent: { name: "ChessVerse Engine", rating: profile.ratings[category], flag: null, title: null },
    });
  };

  const modes = [
    { id: "quick", title: "Quick Match", desc: "Search for a real player for 4s, then vs bot.", icon: Play },
    { id: "computer", title: "Play the Computer", desc: "Practice against the ChessVerse engine.", icon: Bot },
    { id: "friend", title: "Play a Friend", desc: "Create or join a room with a code.", icon: Link2 },
  ];

  const pickMode = (id) => {
    setMode(id);
    setTimeout(() => document.getElementById("cv-play-options")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  // Render searching UI
  if (searching) {
    return (
      <div className="fade-in" style={{ maxWidth: 460, margin: "60px auto 0", textAlign: "center" }}>
        {searchPhase === "searching" && (
          <>
            <div className="mm-ring">
              <div style={{ textAlign: "center" }}>
                <div className="h2">{tc.label}</div>
                <div className="muted" style={{ fontSize: 12 }}>{tc.sub}</div>
              </div>
            </div>
            <div className="h3" style={{ marginTop: 26 }}>Searching for players…</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Will fallback to bot in 4s if no match</div>
            <div className="thinking-dots" style={{ marginTop: 16 }}>
              <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brass)", display: "inline-block", margin: "0 3px" }} />
              <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brass)", display: "inline-block", margin: "0 3px" }} />
              <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brass)", display: "inline-block", margin: "0 3px" }} />
            </div>
          </>
        )}

        {searchPhase === "found" && matchData && (
          <div className="fade-in">
            <div className="mm-ring mm-ring-found">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>✓</div>
              </div>
            </div>
            <div className="h3" style={{ marginTop: 26, color: "var(--malachite)" }}>Player found!</div>
            <div className="match-found-opponent" style={{ marginTop: 16 }}>
              <div className="opponent-avatar">
                <span style={{ fontSize: 28 }}>🧑‍🤝‍🧑</span>
              </div>
              <div className="h2" style={{ marginTop: 8 }}>{matchData.opponentName}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>Room: {matchData.roomCode}</div>
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 14 }}>Starting match…</div>
          </div>
        )}

        {searchPhase === "timeout" && (
          <div className="fade-in">
            <div className="mm-ring">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>🤖</div>
              </div>
            </div>
            <div className="h3" style={{ marginTop: 26 }}>No players found</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Starting vs ChessVerse engine…</div>
          </div>
        )}

        <button className="btn btn-ghost" style={{ marginTop: 22 }} onClick={cancelSearch}>
          <X size={14} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <div className="eyebrow">ChessVerse · Play. Learn. Conquer.</div>
          <div className="h1" style={{ marginTop: 10 }}>Play chess.<br /><span className="accent">Learn. Conquer.</span></div>
          <p className="muted landing-lede">
            Challenge players in Rapid, Blitz &amp; Bullet, duel the ChessVerse engine, or battle a friend —
            then sharpen your game with puzzles and live analysis.
          </p>
          <div className="landing-cta">
            <button className="btn btn-brass btn-lg" onClick={startQuickMatch}><Swords size={17} /> Quick Match</button>
            <button className="btn btn-ghost btn-lg" onClick={() => pickMode("computer")}><Bot size={17} /> vs Computer</button>
          </div>
          <div className="landing-stats">
            <div className="ls-item"><span className="stat-num">{profile.gamesPlayed}</span><span className="ls-label">Games played</span></div>
            <div className="ls-item"><span className="stat-num">{profile.puzzle.solved}</span><span className="ls-label">Puzzles solved</span></div>
            <div className="ls-item"><span className="stat-num">{profile.ratings.rapid}</span><span className="ls-label">Rapid rating</span></div>
          </div>
        </div>
        <LandingBoardArt />
      </section>

      <section id="cv-play-options" className="play-options">
        <div className="eyebrow">Start playing</div>
        <div className="h2" style={{ marginTop: 6 }}>Choose how you'd like to play</div>

        <div className="mode-grid" style={{ marginTop: 18 }}>
          {modes.map((m) => (
            <div
              key={m.id}
              className={`mode-card ${m.id === "friend" ? "mode-friend" : ""}`}
              style={mode === m.id ? { borderColor: "var(--brass)", background: "var(--surface-hover)" } : {}}
              onClick={() => pickMode(m.id)}
            >
              <div className="mode-icon"><m.icon size={19} /></div>
              <div className="h3">{m.title}</div>
              <div className="muted" style={{ fontSize: 13 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {mode && (
          <div className="card fade-in" style={{ marginTop: 20 }}>
            {mode === "computer" && (
              <>
                <div className="h3">Difficulty</div>
                <div className="tabbar" style={{ maxWidth: 340, marginTop: 14 }}>
                  {["easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      className={`tab-btn ${botDiff === d ? "active" : ""}`}
                      onClick={() => setBotDiff(d)}
                    >
                      {d[0].toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="divider" />
              </>
            )}

            <div className="h3">Time control</div>
            <div className="tc-grid" style={{ marginTop: 14 }}>
              {TIME_CONTROLS.map((t) => (
                <div
                  key={t.label}
                  className={`tc-chip ${tc.label === t.label ? "active" : ""}`}
                  onClick={() => setTc(t)}
                >
                  <div className="tc-label">{t.label}</div>
                  <div className="tc-sub">{t.sub}</div>
                </div>
              ))}
            </div>

            {mode === "friend" ? (
              <>
                <div className="divider" />
                <div className="h3">Play a Friend</div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Create room */}
                  <div style={{ padding: 12, background: "var(--surface-raised)", borderRadius: 10 }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Create a new room</div>
                    <button 
                      className="btn btn-brass" 
                      style={{ width: "100%" }}
                      onClick={createFriendRoom}
                      disabled={friendStatus === "waiting"}
                    >
                      {friendStatus === "waiting" ? "Waiting for opponent..." : "Create Room"}
                    </button>
                  </div>
                  
                  {/* Join room */}
                  <div style={{ padding: 12, background: "var(--surface-raised)", borderRadius: 10 }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Join an existing room</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter room code"
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid var(--line-soft)",
                          background: "var(--surface)",
                          color: "#fff",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.05em",
                        }}
                      />
                      <button 
                        className="btn btn-ghost"
                        onClick={joinFriendRoom}
                        disabled={friendJoining || friendStatus === "waiting"}
                      >
                        {friendJoining ? "..." : "Join"}
                      </button>
                    </div>
                    {friendStatus === "notfound" && (
                      <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>Room not found</div>
                    )}
                    {friendStatus === "full" && (
                      <div style={{ color: "var(--warning)", fontSize: 12, marginTop: 6 }}>Room is full</div>
                    )}
                    {friendStatus === "waiting" && (
                      <div style={{ color: "var(--malachite)", fontSize: 12, marginTop: 6 }}>Waiting for host…</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <button
                className="btn btn-brass"
                style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
                onClick={mode === "computer" ? startBotGame : startQuickMatch}
              >
                {mode === "computer" ? <>Start Game <Bot size={15} /></> : <>Find Match <Play size={15} /></>}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   GAME VIEW
--------------------------------------------------------------------------- */
function initGameState(playerColor) {
  return {
    board: initialBoard(),
    boardHistory: [initialBoard()],
    turn: "w",
    castling: { w: { k: true, q: true }, b: { k: true, q: true } },
    enPassant: null,
    history: [],
    evalHistory: [0],
    captured: { w: [], b: [] },
    lastMove: null,
    status: "playing",
    playerColor,
    outcomeBias: rollOutcomeBias(),
  };
}

function GameView({ session, onExit, onGameEnd, notify }) {
  const [gs, setGs] = useState(() => initGameState(session.color));
  const [panelTab, setPanelTab] = useState("analysis");
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [clocks, setClocks] = useState({ w: session.tc.base * 60, b: session.tc.base * 60 });
  const [gameOver, setGameOver] = useState(null);
  const [chatMessages, setChatMessages] = useState(() => [
    { from: "opponent", text: "Good luck!", time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [botThinking, setBotThinking] = useState(false);
  const [premove, setPremove] = useState(null);
  const [premoveSelected, setPremoveSelected] = useState(null);
  const [viewIndex, setViewIndex] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const timerRef = useRef(null);
  const gameEndedRef = useRef(false);
  const isComputer = session.mode === "computer";
  const isOnline = session.mode === "online";
  const opponentName = session.opponent?.name || "Opponent";
  const opponentTitle = session.opponent?.title || null;
  const opponentFlag = session.opponent?.flag || null;
  const premoveThreshold = premoveThresholdSeconds(session.tc.base);

  const state = useMemo(
    () => ({ castling: gs.castling, enPassant: gs.enPassant }),
    [gs.castling, gs.enPassant]
  );

  const liveIndex = gs.boardHistory.length - 1;
  const displayIndex = viewIndex === null ? liveIndex : viewIndex;
  const displayBoard = gs.boardHistory[displayIndex];
  const isViewingHistory = viewIndex !== null && viewIndex !== liveIndex;

  const checkInfo = useMemo(() => {
    const kingPos = findKing(gs.board, gs.turn);
    if (kingPos && isSquareAttacked(gs.board, kingPos.r, kingPos.c, gs.turn === "w" ? "b" : "w")) {
      return kingPos;
    }
    return null;
  }, [gs.board, gs.turn]);

  const finishGame = useCallback(
    (modalResult, outcome) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      const opponentRating = session.opponent?.rating ?? 1200;
      const control = `${session.tc.sub} · ${session.tc.label}`;
      const category = session.category;
      const delta = eloDelta(0, 0, 0); // placeholder unused; real delta computed by App via profile
      setGameOver({ ...modalResult });
      onGameEnd({ category, result: outcome, opponentName, opponentRating, control });
    },
    [onGameEnd, session, opponentName]
  );

  const commitMove = useCallback(
    (move) => {
      setGs((prev) => {
        const result = applyMove(prev.board, { castling: prev.castling, enPassant: prev.enPassant }, move);
        const san = sanFor(prev.board, prev, move);
        const captured = { ...prev.captured };
        if (result.takenPiece) {
          const key = result.takenPiece.color;
          captured[key] = [...captured[key], result.takenPiece.type];
        }
        const nextTurn = prev.turn === "w" ? "b" : "w";
        const nextState = { castling: result.castling, enPassant: result.enPassant };
        const legal = getLegalMoves(result.board, nextTurn, nextState);
        const inCheck = (() => {
          const k = findKing(result.board, nextTurn);
          return k && isSquareAttacked(result.board, k.r, k.c, prev.turn);
        })();
        let sanFinal = san;
        let status = "playing";
        if (legal.length === 0) {
          status = inCheck ? "checkmate" : "stalemate";
          sanFinal += inCheck ? "#" : "";
        } else if (inCheck) {
          sanFinal += "+";
        }

        if (status === "checkmate") {
          const outcome = prev.turn === session.color ? "win" : "loss";
          finishGame(
            {
              title: outcome === "win" ? "You win by checkmate" : `${opponentName} wins by checkmate`,
              subtitle: `Checkmate delivered in ${prev.history.length + 1} moves.`,
            },
            outcome
          );
        } else if (status === "stalemate") {
          finishGame({ title: "Draw by stalemate", subtitle: "No legal moves remain." }, "draw");
        }

        return {
          ...prev,
          board: result.board,
          boardHistory: [...prev.boardHistory, result.board],
          castling: result.castling,
          enPassant: result.enPassant,
          turn: nextTurn,
          history: [...prev.history, sanFinal],
          evalHistory: [...prev.evalHistory, materialScore(result.board, "w")],
          captured,
          lastMove: move,
          status,
        };
      });
      setSelected(null);
      setLegalTargets([]);
      setViewIndex(null);
    },
    [finishGame, session.color, opponentName]
  );

  const clocksRef = useRef(clocks);
  useEffect(() => {
    clocksRef.current = clocks;
  }, [clocks]);

  useEffect(() => {
    if (gameOver) return;
    timerRef.current = setInterval(() => {
      setClocks((prev) => {
        const nextVal = Math.max(0, prev[gs.turn] - 0.1);
        const next = { ...prev, [gs.turn]: nextVal };
        if (nextVal <= 0) {
          clearInterval(timerRef.current);
          const outcome = gs.turn === session.color ? "loss" : "win";
          finishGame(
            { title: gs.turn === session.color ? `${opponentName} wins on time` : "You win on time", subtitle: "The flag has fallen." },
            outcome
          );
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [gs.turn, gameOver, finishGame, session.color, opponentName]);

  // ── Online mode: Poll opponent's moves ────────────────────────────────────────
  const lastFenRef = useRef("");
  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (!isOnline || gameOver) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    // Store initial FEN
    lastFenRef.current = boardToFen(gs.board, gs.turn, gs.castling, gs.enPassant);

    const poll = async () => {
      if (gameOver) return;
      try {
        const res = await api.get(`/chess/room/${session.roomCode}`);
        const room = res.data.room;
        if (!room) return;

        // Check for game over
        if (room.status === "finished") {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          const outcome = room.result === "draw" ? "draw" : 
            (room.result === "white" ? (session.color === "w" ? "win" : "loss") : 
            (session.color === "b" ? "win" : "loss"));
          finishGame(
            { title: outcome === "draw" ? "Draw" : outcome === "win" ? "You win!" : "You lose", 
              subtitle: room.result === "draw" ? "Game ended in a draw" : `Game over - ${room.result} wins` },
            outcome
          );
          return;
        }

        // Update clocks from server
        setClocks({ w: room.white_time_left, b: room.black_time_left });

        // Check if FEN changed (new move made)
        if (room.fen && room.fen !== lastFenRef.current) {
          lastFenRef.current = room.fen;
          
          // Parse the new FEN and update board
          const newBoard = fenToBoard(room.fen);
          const newTurn = fenToTurn(room.fen);
          const newCastling = fenToCastling(room.fen);
          const newEnPassant = fenToEnPassant(room.fen);
          
          // Apply move by updating board state
          setGs(prev => {
            // Calculate SAN from history would be complex - use algebraic for now
            const san = `Move ${prev.history.length + 1}`;
            
            // Update captured pieces
            const captured = { ...prev.captured };
            // Simplified: we'd need to compare boards to know what was captured
            // For now, just update board
            
            return {
              ...prev,
              board: newBoard,
              boardHistory: [...prev.boardHistory, newBoard],
              turn: newTurn,
              castling: newCastling,
              enPassant: newEnPassant,
              history: [...prev.history, san],
              evalHistory: [...prev.evalHistory, materialScore(newBoard, "w")],
              lastMove: null, // We'd need to track this properly
              status: "playing",
            };
          });
        }
      } catch (e) {
        // Ignore polling errors
      }
    };

    // Poll every 500ms
    pollTimerRef.current = setInterval(poll, 500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOnline, session.roomCode, gameOver, finishGame, session.color]);

  // ── Bot move (computer mode + fallback from quick match) ────────────────────
  useEffect(() => {
    // Skip if online mode or not our turn
    if (isOnline || gs.turn === session.color || gs.status !== "playing" || gameOver) return;

    setBotThinking(true);
    const remainingMs = clocksRef.current[gs.turn] * 1000;
    
    let difficulty = 1;
    let blunderChance = 0.34;
    let drawSeeking = false;
    let thinkScale = 1;
    let strongSearch = false;
    
    if (isComputer) {
      const d = session.difficulty || "medium";
      if (d === "easy") { difficulty = 1; blunderChance = 0.4; thinkScale = 0.7; }
      else if (d === "hard") { difficulty = 3; blunderChance = 0.01; thinkScale = 2; strongSearch = true; }
      else { difficulty = 3; blunderChance = 0.04; thinkScale = 1.6; }
    } else {
      // Fallback bot from quick match - use outcomeBias for human-like play
      const bias = gs.outcomeBias;
      difficulty = bias === "bot" ? 3 : bias === "draw" ? 2 : 1;
      blunderChance = bias === "bot" ? 0.06 : bias === "draw" ? 0.16 : 0.34;
      drawSeeking = bias === "draw";
    }

    // Human-like thinking time based on position complexity
    // More complex positions (more pieces, more legal moves) = longer think time
    const legalMoves = getLegalMoves(gs.board, gs.turn, state);
    const pieceCount = gs.board.flat().filter(p => p !== null).length;
    
    // Base think time: 800ms - 2500ms depending on position
    let humanThinkTime = 800 + Math.random() * 700;
    
    // Add time based on game phase
    if (pieceCount > 20) {
      // Opening/mid-game: think faster
      humanThinkTime = 600 + Math.random() * 500;
    } else if (pieceCount < 10) {
      // Endgame: think longer, more precision needed
      humanThinkTime = 1200 + Math.random() * 1500;
    }
    
    // Add time based on number of legal moves (more options = more thinking)
    if (legalMoves.length > 10) {
      humanThinkTime += 300 + Math.random() * 500;
    }
    
    // Occasionally pause "looking at the board" - human behavior
    if (Math.random() < 0.15) {
      humanThinkTime += 400 + Math.random() * 600;
    }
    
    // Scale by difficulty
    humanThinkTime *= thinkScale;

    const t = setTimeout(() => {
      const move = strongSearch
        ? chooseStrongComputerMove(gs.board, gs.turn, state, 2)
        : chooseComputerMove(gs.board, gs.turn, state, difficulty, blunderChance, drawSeeking);
      setBotThinking(false);
      if (move) commitMove(move);
    }, humanThinkTime);
    
    return () => {
      clearTimeout(t);
      setBotThinking(false);
    };
  }, [gs.turn, gs.board, session.color, gameOver, gs.status, state, commitMove, gs.outcomeBias, session.difficulty, isComputer, isOnline]);

  useEffect(() => {
    if (!premove || gameOver) return;
    if (gs.turn !== session.color) return;
    const targets = legalMovesFrom(gs.board, premove.from.r, premove.from.c, state);
    const matches = targets.filter((m) => m.to.r === premove.to.r && m.to.c === premove.to.c);
    setPremove(null);
    if (matches.length === 0) return;
    if (matches.length > 1) {
      const queenMove = matches.find((m) => m.promotion === "q") || matches[0];
      commitMove(queenMove);
      return;
    }
    commitMove(matches[0]);
  }, [gs.turn, premove, gameOver, gs.board, state, session.color, commitMove]);

  const premoveActive =
    !gameOver &&
    !pendingPromotion &&
    gs.status === "playing" &&
    gs.turn !== session.color &&
    clocks[session.color] <= premoveThreshold;

  const handleSquareClick = (r, c) => {
    if (gameOver || pendingPromotion || isViewingHistory) return;

    if (gs.turn !== session.color) {
      if (!premoveActive) return;
      const piece = gs.board[r][c];
      if (premoveSelected) {
        if (premoveSelected.r === r && premoveSelected.c === c) {
          setPremoveSelected(null);
          return;
        }
        if (piece && piece.color === session.color) {
          setPremoveSelected({ r, c });
          return;
        }
        setPremove({ from: premoveSelected, to: { r, c } });
        setPremoveSelected(null);
        return;
      }
      if (piece && piece.color === session.color) {
        setPremoveSelected({ r, c });
      }
      return;
    }

    const piece = gs.board[r][c];
    if (selected) {
      const move = legalTargets.find((m) => m.to.r === r && m.to.c === c);
      if (move) {
        const promoMoves = legalTargets.filter((m) => m.to.r === r && m.to.c === c && m.promotion);
        if (promoMoves.length > 1) {
          setPendingPromotion({ from: selected, to: { r, c } });
          return;
        }
        commitMove(move);
        return;
      }
      if (piece && piece.color === gs.turn) {
        setSelected({ r, c });
        setLegalTargets(legalMovesFrom(gs.board, r, c, state));
        return;
      }
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    if (piece && piece.color === gs.turn) {
      setSelected({ r, c });
      setLegalTargets(legalMovesFrom(gs.board, r, c, state));
    }
  };

  const cancelPremove = () => {
    setPremove(null);
    setPremoveSelected(null);
  };

  const choosePromotion = (type) => {
    const move = legalTargets.find(
      (m) => m.to.r === pendingPromotion.to.r && m.to.c === pendingPromotion.to.c && m.promotion === type
    );
    setPendingPromotion(null);
    if (move) commitMove(move);
  };

  const handleResign = () => {
    if (gameOver) return;
    finishGame(
      { title: `${opponentName} wins by resignation`, subtitle: "A graceful concession — every game teaches something." },
      "loss"
    );
  };

  const sendChatMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChatMessages((prev) => [...prev, { from: "you", text: trimmed, time }]);
    setChatInput("");
    if (!isComputer && Math.random() < 0.55) {
      const delay = 900 + Math.random() * 1600;
      setTimeout(() => {
        const reply = QUICK_MESSAGES[Math.floor(Math.random() * QUICK_MESSAGES.length)];
        const replyTime = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        setChatMessages((prev) => [...prev, { from: "opponent", text: reply, time: replyTime }]);
      }, delay);
    }
  };

  const buildPGN = () => {
    const headers = [
      `[Event "Casual Game"]`,
      `[Site "ChessVerse"]`,
      `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, ".")}"]`,
      `[White "${session.color === "w" ? "You" : opponentName}"]`,
      `[Black "${session.color === "b" ? "You" : opponentName}"]`,
      `[TimeControl "${session.tc.label}"]`,
    ].join("\n");
    const moves = gs.history.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m)).join(" ");
    return `${headers}\n\n${moves}`.trim();
  };

  const handleDownloadPGN = () => {
    if (gs.history.length === 0) return;
    const pgn = buildPGN();
    const blob = new Blob([pgn], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chessverse-game.pgn";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("PGN downloaded");
  };

  const handleShare = async () => {
    if (gs.history.length === 0) {
      notify("Play a move first to share the game");
      return;
    }
    try {
      await navigator.clipboard.writeText(buildPGN());
      notify("Game copied to clipboard");
    } catch {
      notify("Couldn't copy — try downloading the PGN instead");
    }
  };

  const jumpToStart = () => setViewIndex(0);
  const stepBack = () => setViewIndex((v) => Math.max(0, (v ?? liveIndex) - 1));
  const stepForward = () =>
    setViewIndex((v) => {
      const next = (v ?? liveIndex) + 1;
      return next >= liveIndex ? null : next;
    });
  const jumpToLive = () => setViewIndex(null);

  const orientation = session.color;
  const boardOrientation = flipped ? (orientation === "w" ? "b" : "w") : orientation;
  const evalScore = materialScore(gs.board, "w");

  const you = { name: "You" };
  const diffLabel = session.difficulty ? session.difficulty[0].toUpperCase() + session.difficulty.slice(1) : "—";
  const opp = { name: opponentName, rating: isComputer ? diffLabel : session.opponent?.rating };

  return (
    <div className="fade-in game-layout" style={{ display: "flex", gap: 26 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "min(100%, 640px)" }}>
          <div className="game-header">
            <div className="player-pill">
              <div className="player-avatar-wrap">
                <Avatar name={opp.name} size={44} />
                <span className="online-dot" />
              </div>
              <div className="pill-info">
                <div className="player-name-row">
                  {opponentTitle && <span className="title-badge">{opponentTitle}</span>}
                  <span className="player-name">{opp.name}</span>
                  {opponentFlag && <span className="player-flag">{opponentFlag}</span>}
                  {botThinking && (
                    <span className="thinking-dots muted" style={{ fontSize: 11, fontWeight: 500 }}>
                      <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                    </span>
                  )}
                </div>
                <div className="player-meta">
                  <Trophy size={11} />
                  <span className="mono">{opp.rating !== "—" ? opp.rating : diffLabel}</span>
                </div>
              </div>
              <span className={`pill-clock ${gs.turn !== orientation ? "active" : ""} ${clocks[orientation === "w" ? "b" : "w"] < 20 ? "low" : ""}`}>
                {fmtClock(clocks[orientation === "w" ? "b" : "w"])}
              </span>
            </div>
            <div className="format-pill">
              <div className="format-time"><Clock size={14} /> {fmtClock(clocks[orientation === "w" ? "b" : "w"])}</div>
              <div className="format-label">{session.tc.sub} · {session.tc.label}</div>
            </div>
            <div className="player-pill you">
              <span className={`pill-clock ${gs.turn === orientation ? "active" : ""} ${clocks[orientation] < 20 ? "low" : ""}`}>
                {fmtClock(clocks[orientation])}
              </span>
              <div className="pill-info">
                <div className="player-name-row"><span className="player-name">{you.name}</span></div>
                <div className="player-meta">
                  <span className={`piece-glyph ${orientation === "w" ? "white" : "black"}`} style={{ fontSize: 13 }}>{GLYPHS[orientation === "w" ? "w" : "b"].k}</span>
                  Playing {orientation === "w" ? "White" : "Black"}
                </div>
              </div>
              <div className="player-avatar-wrap">
                <Avatar name={you.name} size={44} />
                <span className="online-dot" />
              </div>
            </div>
          </div>

          <ChessBoard
            board={displayBoard}
            legalTargets={selected && !isViewingHistory ? legalTargets : []}
            selected={isViewingHistory ? null : selected}
            onSquareClick={handleSquareClick}
            lastMove={isViewingHistory ? null : gs.lastMove}
            orientation={boardOrientation}
            checkSquare={isViewingHistory ? null : checkInfo}
            sqSize={focusMode ? 78 : 72}
            premoveFrom={premoveSelected || (premove ? premove.from : null)}
            premoveTo={premove ? premove.to : null}
          />

          {isViewingHistory && (
            <div className="premove-banner fade-in">
              <span><ListChecks size={13} /> Viewing move {displayIndex} of {liveIndex}</span>
              <button className="btn btn-ghost btn-sm" onClick={jumpToLive}><SkipForward size={12} /> Return to live</button>
            </div>
          )}

          {!isViewingHistory && premoveActive && (
            <div className="premove-banner fade-in">
              {premove ? (
                <>
                  <span><Clock size={13} /> Premove queued — it'll play the instant it's your turn.</span>
                  <button className="btn btn-ghost btn-sm" onClick={cancelPremove}><X size={12} /> Cancel</button>
                </>
              ) : (
                <span><Clock size={13} /> Low on time — click a piece to queue your next move.</span>
              )}
            </div>
          )}

          <div className="below-board-row">
            <div className="board-controls">
              <button className="btn btn-danger btn-sm" onClick={handleResign} disabled={!!gameOver}><Flag size={14} /> Resign</button>
              <div className="ctrl-divider" />
              <button className="btn btn-ghost btn-icon" onClick={jumpToStart} disabled={liveIndex === 0} title="Jump to start"><SkipBack size={15} /></button>
              <button className="btn btn-ghost btn-icon" onClick={stepBack} disabled={displayIndex === 0} title="Step back"><ChevronLeft size={15} /></button>
              <button className="btn btn-ghost btn-icon" onClick={stepForward} disabled={!isViewingHistory} title="Step forward"><ChevronRight size={15} /></button>
              <button className="btn btn-ghost btn-icon" onClick={() => setFlipped((f) => !f)} title="Flip board"><RotateCcw size={15} /></button>
              <button className="btn btn-ghost btn-icon" onClick={() => setFocusMode((f) => !f)} title="Focus mode"><Maximize2 size={15} /></button>
            </div>
          </div>
        </div>
      </div>

      {!focusMode && (
        <div className="right-panel">
          <div className="card">
            <div className="card-head">
              <div className="h3">Moves</div>
              <Menu size={15} className="muted" />
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div className="movelist">
              {gs.history.length === 0 && <div className="muted" style={{ fontSize: 12.5, padding: "6px 4px" }}>No moves yet — make the opening move.</div>}
              {Array.from({ length: Math.ceil(gs.history.length / 2) }).map((_, i) => (
                <div className="movelist-row" key={i}>
                  <span className="movelist-num">{i + 1}.</span>
                  <span
                    className={`movelist-move ${!isViewingHistory && gs.history.length - 1 === i * 2 ? "current" : ""}`}
                    onClick={() => { const idx = i * 2 + 1; setViewIndex(idx >= liveIndex ? null : idx); }}
                  >
                    {gs.history[i * 2]}
                    {!isViewingHistory && gs.history.length - 1 === i * 2 && <span className="movelist-eval">{evalScore > 0 ? "+" : ""}{evalScore.toFixed(2)}</span>}
                  </span>
                  <span
                    className={`movelist-move ${!isViewingHistory && gs.history.length - 1 === i * 2 + 1 ? "current" : ""}`}
                    onClick={() => { if (!gs.history[i * 2 + 1]) return; const idx = i * 2 + 2; setViewIndex(idx >= liveIndex ? null : idx); }}
                  >
                    {gs.history[i * 2 + 1] || ""}
                    {!isViewingHistory && gs.history.length - 1 === i * 2 + 1 && <span className="movelist-eval">{evalScore > 0 ? "+" : ""}{evalScore.toFixed(2)}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={handleDownloadPGN} disabled={gs.history.length === 0}><Download size={13} /> PGN</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={handleShare}><Share2 size={13} /> Share</button>
            </div>
          </div>

          <div className="tabbar" style={{ marginTop: 16 }}>
            <button className={`tab-btn ${panelTab === "analysis" ? "active" : ""}`} onClick={() => setPanelTab("analysis")}><LineChart size={13} /> Analysis</button>
            <button className={`tab-btn ${panelTab === "chat" ? "active" : ""}`} onClick={() => setPanelTab("chat")}><MessageSquare size={13} /> Chat</button>
            <button className={`tab-btn ${panelTab === "info" ? "active" : ""}`} onClick={() => setPanelTab("info")}><Info size={13} /> Info</button>
          </div>

          {panelTab === "analysis" && (
            <div className="card fade-in" style={{ marginTop: 12 }}>
              <div className="card-head">
                <div className="h3">Evaluation</div>
                <span className="mono" style={{ fontSize: 15, fontWeight: 800, color: evalScore >= 0 ? "var(--brass-bright)" : "var(--danger-bright)" }}>
                  {evalScore > 0 ? "+" : ""}{evalScore.toFixed(2)}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>Material balance, live estimate</div>
              <div style={{ marginTop: 10 }}>
                <Sparkline data={gs.evalHistory.length > 1 ? gs.evalHistory : [0, 0]} width={296} height={72} />
              </div>
              <div className="divider" />
              <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={12} color="var(--gold)" /> Last Move</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <div className="h3" style={{ fontFamily: "var(--font-mono)" }}>{gs.history[gs.history.length - 1] || "—"}</div>
                <span className="pill pill-win">{evalScore > 0 ? "+" : ""}{evalScore.toFixed(2)}</span>
              </div>
            </div>
          )}

          {panelTab === "chat" && (
            <div className="card fade-in" style={{ marginTop: 12 }}>
              {isComputer ? (
                <div className="muted" style={{ fontSize: 12.5, textAlign: "center", padding: "18px 0" }}>Chat is unavailable against the engine.</div>
              ) : (
                <>
                  <div className="chat-log">
                    {chatMessages.map((m, i) => (
                      <div className="chat-msg" key={i} style={m.from === "you" ? { flexDirection: "row-reverse" } : {}}>
                        <Avatar name={m.from === "you" ? you.name : opponentName} size={26} />
                        <div className="chat-bubble">{m.text}<span className="chat-time">{m.time}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Quick messages</div>
                  <div className="quick-msg-row" style={{ marginBottom: 12 }}>
                    {QUICK_MESSAGES.map((q) => (
                      <button key={q} className="quick-msg-chip" onClick={() => sendChatMessage(q)}>{q}</button>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <input
                      placeholder="Type a message…"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChatMessage(chatInput);
                      }}
                    />
                    <button className="chat-send-btn" disabled={!chatInput.trim()} onClick={() => sendChatMessage(chatInput)}>
                      <Send size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {panelTab === "info" && (
            <div className="card fade-in" style={{ marginTop: 12 }}>
              <div className="h3">Game Info</div>
              <div className="divider" style={{ margin: "12px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Time control</span><span>{session.tc.sub} · {session.tc.label}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Moves played</span><span>{gs.history.length}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">You</span><span className="mono">Playing {session.color === "w" ? "White" : "Black"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">{opp.name}</span><span className="mono">{opp.rating}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {pendingPromotion && <PromotionDialog color={gs.turn} onChoose={choosePromotion} />}
      {gameOver && (
        <GameOverModal
          result={gameOver}
          onRematch={() => {
            setGameOver(null);
            gameEndedRef.current = false;
            setGs(initGameState(session.color));
            setClocks({ w: session.tc.base * 60, b: session.tc.base * 60 });
            setPremove(null);
            setPremoveSelected(null);
            setBotThinking(false);
            setViewIndex(null);
          }}
          onExit={onExit}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PUZZLE SOLVER
--------------------------------------------------------------------------- */
function PuzzleSolver({ puzzle, onResult, compact = false }) {
  const [board, setBoard] = useState(() => puzzle.board());
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [status, setStatus] = useState("playing"); // playing | correct | incorrect
  const [revealed, setRevealed] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const shakeTimeout = useRef(null);

  useEffect(() => {
    setBoard(puzzle.board());
    setSelected(null);
    setLegalTargets([]);
    setStatus("playing");
    setRevealed(false);
    setLastMove(null);
    setAttempts(0);
    return () => clearTimeout(shakeTimeout.current);
  }, [puzzle]);

  const handleSquareClick = (r, c) => {
    if (status !== "playing") return;
    const piece = board[r][c];

    if (selected) {
      const move = legalTargets.find((m) => m.to.r === r && m.to.c === c);
      if (move) {
        const isSolution =
          move.from.r === puzzle.solution.from.r &&
          move.from.c === puzzle.solution.from.c &&
          move.to.r === puzzle.solution.to.r &&
          move.to.c === puzzle.solution.to.c;

        if (isSolution) {
          const result = applyMove(board, NEUTRAL_PUZZLE_STATE, move);
          setBoard(result.board);
          setLastMove(move);
          setSelected(null);
          setLegalTargets([]);
          setStatus("correct");
          onResult && onResult(true);
        } else {
          setAttempts((a) => a + 1);
          setStatus("incorrect");
          onResult && onResult(false);
          clearTimeout(shakeTimeout.current);
          shakeTimeout.current = setTimeout(() => {
            setStatus("playing");
            setSelected(null);
            setLegalTargets([]);
          }, 650);
        }
        return;
      }
      if (piece && piece.color === puzzle.orientation) {
        setSelected({ r, c });
        setLegalTargets(legalMovesFrom(board, r, c, NEUTRAL_PUZZLE_STATE));
        return;
      }
      setSelected(null);
      setLegalTargets([]);
      return;
    }

    if (piece && piece.color === puzzle.orientation) {
      setSelected({ r, c });
      setLegalTargets(legalMovesFrom(board, r, c, NEUTRAL_PUZZLE_STATE));
    }
  };

  const resetPuzzle = () => {
    clearTimeout(shakeTimeout.current);
    setBoard(puzzle.board());
    setSelected(null);
    setLegalTargets([]);
    setStatus("playing");
    setLastMove(null);
  };

  return (
    <div>
      <ChessBoard
        board={board}
        legalTargets={selected ? legalTargets : []}
        selected={selected}
        onSquareClick={handleSquareClick}
        lastMove={lastMove}
        orientation={puzzle.orientation}
        checkSquare={null}
        sqSize={compact ? 48 : window.innerHeight < 800 ? 44 : 54}
      />
      <div style={{ textAlign: "center", marginTop: 14, width: "100%" }}>
        <div className="h3" style={{ fontWeight: 700, color: "var(--ivory)" }}>{puzzle.orientation === "w" ? "White" : "Black"} to move</div>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{puzzle.intro}</div>

        {status === "correct" && (
          <div
            className="fade-in"
            style={{ marginTop: 10, color: "var(--malachite)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Check size={15} /> {puzzle.success}
          </div>
        )}
        {status === "incorrect" && (
          <div className="fade-in" style={{ marginTop: 10, color: "var(--danger-bright)", fontWeight: 700, fontSize: 13 }}>
            Not quite — try again.
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => setRevealed((v) => !v)}
            disabled={status === "correct"}
          >
            <Lightbulb size={15} /> {revealed ? "Hide hint" : "Reveal hint"}
          </button>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={resetPuzzle}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
        {revealed && status !== "correct" && (
          <div className="muted fade-in" style={{ fontSize: 12.5, marginTop: 10 }}>{puzzle.hint}</div>
        )}
        {attempts > 0 && status === "playing" && (
          <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>{attempts} attempt{attempts === 1 ? "" : "s"} so far</div>
        )}
      </div>
    </div>
  );
}

/* ---- Daily tab ---- */
function DailyPuzzleTab({ profile, onPuzzleResult }) {
  const [dayIndex, setDayIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const puzzle = PUZZLES[dayIndex % PUZZLES.length];

  return (
    <div className="puzzle-layout">
      <div className="puzzle-board-col">
        <PuzzleSolver
          key={dayIndex}
          puzzle={puzzle}
          onResult={(correct) => {
            onPuzzleResult(correct);
            if (correct) setSolved(true);
          }}
        />
        {solved && (
          <button
            className="btn btn-brass"
            style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
            onClick={() => {
              setDayIndex((i) => i + 1);
              setSolved(false);
            }}
          >
            Next puzzle <ChevronRight size={15} />
          </button>
        )}
      </div>

      <div className="puzzle-side">
        <div className="puzzle-stats-row">
          <div className="puzzle-side-stat">
            <div className="puzzle-stat-top">
              <div className="eyebrow">Puzzle rating</div>
              <div className="puzzle-stat-sub">{profile.puzzle.solved} solved total</div>
            </div>
            <div className="stat-num" style={{ color: "var(--brass-bright)" }}>{profile.puzzle.rating}</div>
          </div>
          <div className="puzzle-side-stat">
            <div className="puzzle-stat-top">
              <div className="eyebrow">Current streak</div>
              <div className="puzzle-stat-sub">Best: {profile.puzzle.bestStreak} days</div>
            </div>
            <div className="stat-num" style={{ display: "flex", alignItems: "center", gap: 6 }}><Flame size={19} color="var(--danger-bright)" /> {profile.puzzle.streak} days</div>
          </div>
        </div>

        <div className="card">
          <div className="h3">Recent puzzles</div>
          <div className="divider" />
          {profile.puzzle.log.length === 0 ? (
            <div className="muted" style={{ fontSize: 12.5, padding: "14px 4px", textAlign: "center" }}>Solve puzzles to build your history.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {profile.puzzle.log.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Target size={15} color="var(--muted-2)" />
                    <span style={{ fontSize: 13 }}>{new Date(p.when).toLocaleDateString()}</span>
                  </div>
                  <span className={`pill ${p.result === "solved" ? "pill-win" : "pill-loss"}`}>{p.delta > 0 ? "+" : ""}{p.delta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Themes tab ---- */
function ThemesView({ onPuzzleResult }) {
  const [activeTheme, setActiveTheme] = useState(null);
  const puzzlesByTheme = useMemo(() => {
    const map = {};
    PUZZLES.forEach((p) => { map[p.theme] = p; });
    return map;
  }, []);
  const activePuzzle = activeTheme ? puzzlesByTheme[activeTheme] : null;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {THEME_LIST.map((t) => {
          const available = !!puzzlesByTheme[t];
          const isActive = activeTheme === t;
          return (
            <button
              key={t}
              className="tag"
              style={{
                padding: "7px 14px",
                cursor: available ? "pointer" : "default",
                opacity: available ? 1 : 0.45,
                border: `1px solid ${isActive ? "var(--brass-bright)" : "transparent"}`,
                color: isActive ? "var(--brass-bright)" : undefined,
                background: isActive ? "rgba(124,92,252,0.14)" : "var(--surface-raised)",
              }}
              onClick={() => available && setActiveTheme(t)}
            >
              {t}{!available && " · soon"}
            </button>
          );
        })}
      </div>

      {activePuzzle ? (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <PuzzleSolver key={activePuzzle.id} puzzle={activePuzzle} onResult={onPuzzleResult} />
        </div>
      ) : (
        <div className="muted" style={{ textAlign: "center", padding: "50px 0" }}>
          Pick a theme above to start a themed puzzle.
        </div>
      )}
    </div>
  );
}

/* ---- Training tab: Puzzle Rush ---- */
function TrainingView({ onPuzzleResult, onRushEnd }) {
  const RUSH_SECONDS = 90;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RUSH_SECONDS);
  const [running, setRunning] = useState(true);
  const advanceTimeout = useRef(null);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running && !endedRef.current) {
      endedRef.current = true;
      onRushEnd(score);
    }
  }, [running, score, onRushEnd]);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const puzzle = PUZZLES[index % PUZZLES.length];

  const handleResult = (correct) => {
    if (!running) return;
    onPuzzleResult(correct);
    if (!correct) return;
    setScore((s) => s + 1);
    advanceTimeout.current = setTimeout(() => setIndex((i) => i + 1), 550);
  };

  const restart = () => {
    clearTimeout(advanceTimeout.current);
    endedRef.current = false;
    setIndex(0);
    setScore(0);
    setTimeLeft(RUSH_SECONDS);
    setRunning(true);
  };

  if (!running) {
    return (
      <div className="card fade-in" style={{ maxWidth: 400, margin: "40px auto", textAlign: "center", padding: 32 }}>
        <div className="placeholder-icon" style={{ margin: "0 auto 14px" }}><Timer size={26} /></div>
        <div className="h2">Time's up!</div>
        <div className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
          You solved {score} puzzle{score === 1 ? "" : "s"} in {RUSH_SECONDS} seconds.
        </div>
        <button className="btn btn-brass" style={{ marginTop: 20 }} onClick={restart}>
          <Repeat size={15} /> Play again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="tag" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px" }}>
          <Timer size={13} /> {timeLeft}s
        </div>
        <div className="tag" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px" }}>
          <Target size={13} /> Score {score}
        </div>
      </div>
      <PuzzleSolver key={`${puzzle.id}-${index}`} puzzle={puzzle} onResult={handleResult} compact />
    </div>
  );
}

/* ---- History tab ---- */
function PuzzleHistoryView({ profile }) {
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="card">
        <div className="h3">Recent puzzles</div>
        <div className="divider" />
        {profile.puzzle.log.length === 0 ? (
          <div className="muted" style={{ fontSize: 13, padding: "16px 4px" }}>No puzzle attempts yet.</div>
        ) : (
          profile.puzzle.log.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Target size={15} color="var(--muted-2)" />
                <span style={{ fontSize: 13 }}>{new Date(p.when).toLocaleString()}</span>
              </div>
              <span className={`pill ${p.result === "solved" ? "pill-win" : "pill-loss"}`}>{p.delta > 0 ? "+" : ""}{p.delta}</span>
            </div>
          ))
        )}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="h3">Themes to practice</div>
        <div className="divider" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {THEME_LIST.map((t) => (
            <span key={t} className="tag" style={{ padding: "6px 12px" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PUZZLES VIEW
--------------------------------------------------------------------------- */
function PuzzlesView({ profile, onPuzzleResult, onRushEnd }) {
  const [tab, setTab] = useState("daily");

  return (
    <div className="fade-in">
      <div className="eyebrow">Puzzles</div>
      <div className="h1" style={{ fontSize: 28, marginTop: 6 }}>Sharpen your tactics</div>

      <div className="tabbar" style={{ width: "min(100%, 340px)", marginTop: 18 }}>
        {["daily", "themes", "training", "history"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        {tab === "daily" && <DailyPuzzleTab profile={profile} onPuzzleResult={onPuzzleResult} />}
        {tab === "themes" && <ThemesView onPuzzleResult={onPuzzleResult} />}
        {tab === "training" && <TrainingView onPuzzleResult={onPuzzleResult} onRushEnd={onRushEnd} />}
        {tab === "history" && <PuzzleHistoryView profile={profile} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PROFILE VIEW
--------------------------------------------------------------------------- */
function ProfileView({ profile }) {
  const [tab, setTab] = useState("overview");

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
  const bestRapid = profile.ratingHistory.rapid.length ? Math.max(...profile.ratingHistory.rapid) : profile.ratings.rapid;
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return (
    <div className="fade-in">
      <div className="profile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <PlayerAvatar profile={profile} size={64} />
          <div>
            <div className="h2" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>{profile.name} <TierBadge rating={profile.ratings.rapid} size="lg" /></div>
            {profile.username && <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>@{profile.username}</div>}
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Joined {joined}</div>
          </div>
        </div>
      </div>

      <div className="tabbar" style={{ width: "min(100%, 460px)", marginTop: 20 }}>
        {["overview", "stats", "games", "achievements"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="profile-rating-grid" style={{ marginTop: 20 }}>
        <div className="stat-card"><div className="eyebrow">Rapid</div><div className="stat-num">{profile.ratings.rapid}</div></div>
        <div className="stat-card"><div className="eyebrow">Blitz</div><div className="stat-num">{profile.ratings.blitz}</div></div>
        <div className="stat-card"><div className="eyebrow">Bullet</div><div className="stat-num">{profile.ratings.bullet}</div></div>
        <div className="stat-card"><div className="eyebrow">Puzzles</div><div className="stat-num">{profile.puzzle.rating}</div></div>
      </div>

      {tab === "overview" && (
        <div className="ov-grid" style={{ marginTop: 18 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="h3">Rating progress</div>
              <span className="tag">Rapid</span>
            </div>
            <div style={{ marginTop: 10 }}>
              {profile.ratingHistory.rapid.length > 1 ? (
                <Sparkline data={profile.ratingHistory.rapid} width={460} height={120} />
              ) : (
                <div className="muted" style={{ padding: "40px 0", textAlign: "center", fontSize: 13 }}>Play rapid games to see your progress here.</div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="h3">Badges</div>
            <div className="divider" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {ACHIEVEMENT_DEFS.slice(0, 4).map((a) => {
                const unlocked = a.test(profile);
                const Icon = unlocked ? a.icon : Lock;
                return (
                  <div className="badge-tile" style={{ opacity: unlocked ? 1 : 0.4 }} key={a.id}>
                    <div className={`badge-icon ${a.tone}`}><Icon size={19} /></div>
                    <div style={{ fontSize: 11.5, fontWeight: 600 }}>{a.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="h3">Performance</div>
          <div className="divider" />
          <div className="grid-3">
            <div className="stat-card"><div className="eyebrow">Wins</div><div className="stat-num" style={{ color: "var(--malachite)" }}>{profile.wins}</div></div>
            <div className="stat-card"><div className="eyebrow">Losses</div><div className="stat-num" style={{ color: "var(--danger-bright)" }}>{profile.losses}</div></div>
            <div className="stat-card"><div className="eyebrow">Draws</div><div className="stat-num">{profile.draws}</div></div>
          </div>
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
            <span className="muted">Win rate</span><span>{winRate}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 8 }}>
            <span className="muted">Best win streak</span><span>{profile.bestWinStreak}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 8 }}>
            <span className="muted">Best puzzle streak</span><span>{profile.puzzle.bestStreak} days</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginTop: 8 }}>
            <span className="muted">Best Puzzle Rush score</span><span>{profile.puzzle.bestRushScore}</span>
          </div>
        </div>
      )}

      {tab === "games" && (
        <div className="card" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="h3">Games</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12.5, flexWrap: "wrap" }}>
              <span className="muted">Games <b style={{ color: "var(--ivory)" }}>{profile.gamesPlayed}</b></span>
              <span className="muted">Win Rate <b style={{ color: "var(--malachite)" }}>{winRate}%</b></span>
              <span className="muted">Best Rating <b style={{ color: "var(--ivory)" }}>{bestRapid}</b></span>
            </div>
          </div>
          <div className="divider" />
          {profile.recentGames.length === 0 ? (
            <div className="muted" style={{ fontSize: 13, padding: "20px 4px", textAlign: "center" }}>No games played yet — head to Play to get started.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {profile.recentGames.map((g) => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={g.opponent} size={30} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{g.opponent}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{g.control} · {new Date(g.when).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`pill pill-${g.result}`}>{g.result === "win" ? "Win" : g.result === "loss" ? "Loss" : "Draw"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "achievements" && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="h3">Badges</div>
          <div className="divider" />
          <div className="grid-3" style={{ gap: 12 }}>
            {ACHIEVEMENT_DEFS.map((a) => {
              const unlocked = a.test(profile);
              const Icon = unlocked ? a.icon : Lock;
              return (
                <div className="badge-tile" style={{ opacity: unlocked ? 1 : 0.4 }} key={a.id}>
                  <div className={`badge-icon ${a.tone}`}><Icon size={19} /></div>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>{a.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   APP ROOT
--------------------------------------------------------------------------- */
export default function ChessVerse() {
  const [view, setView] = useState("play");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    (async () => {
      const storedProfile = (await storageGet("profile", null)) || defaultProfile();
      try {
        const raw = localStorage.getItem("playerUser") || sessionStorage.getItem("playerUser");
        if (raw) {
          const u = JSON.parse(raw);
          if (u.name || u.username || u.avatar_id) {
            storedProfile.name = u.name || storedProfile.name;
            storedProfile.username = u.username || storedProfile.username;
            storedProfile.avatarId = u.avatar_id || storedProfile.avatarId;
          }
        }
      } catch (e) { /* ignore malformed stored player */ }
      if (localStorage.getItem("playerToken") || sessionStorage.getItem("playerToken")) {
        try {
          const { data } = await api.get("/pauth/me");
          const p = data.player || data;
          if (p && (p.name || p.username || p.avatar_id)) {
            storedProfile.name = p.name || storedProfile.name;
            storedProfile.username = p.username || storedProfile.username;
            storedProfile.avatarId = p.avatar_id || storedProfile.avatarId;
          }
        } catch (e) { /* fall back to stored player */ }
      }
      setProfile(storedProfile);
      storageSet("profile", storedProfile);
      setLoaded(true);
    })();
  }, []);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const updateProfile = useCallback((updater) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      storageSet("profile", next);
      return next;
    });
  }, []);

  const onGameEnd = useCallback((payload) => {
    updateProfile((prev) => applyGameResult(prev, payload));
  }, [updateProfile]);

  const onPuzzleResult = useCallback((correct) => {
    updateProfile((prev) => applyPuzzleResult(prev, correct));
  }, [updateProfile]);

  const onRushEnd = useCallback((score) => {
    updateProfile((prev) => applyRushScore(prev, score));
  }, [updateProfile]);

  const startGame = (sessionCfg) => {
    setSession(sessionCfg);
    setView("game");
  };
  if (!loaded || !profile) {
    return (
      <div className="cv">
        <Style />
        <div className="scrim" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
          <div className="placeholder-icon"><Crown size={26} /></div>
          <div className="muted">Loading your profile…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cv">
      <Style />
      <div className="scrim" />
      <div className="cv-shell">
        <Sidebar view={view} setView={setView} profile={profile} />
        <div className="main-col">
          <div className="content">
            {view === "play" && <PlayView onStart={startGame} profile={profile} notify={notify} />}
            {view === "game" && session && (
              <GameView session={session} onExit={() => setView("play")} onGameEnd={onGameEnd} notify={notify} />
            )}
            {view === "puzzles" && <PuzzlesView profile={profile} onPuzzleResult={onPuzzleResult} onRushEnd={onRushEnd} />}
            {view === "profile" && <ProfileView profile={profile} />}
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}