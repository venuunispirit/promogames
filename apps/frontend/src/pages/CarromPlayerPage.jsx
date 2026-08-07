import React, { useRef, useEffect, useState } from "react";
import Peer from "peerjs";

// ---------- BOARD GEOMETRY & CONSTANTS ----------
const SIZE = 680;
const FRAME = 46;
const PMIN = FRAME;
const PMAX = SIZE - FRAME;
const CENTER = SIZE / 2;

const COIN_R = 14.5;
const QUEEN_R = 14.5;
const STRIKER_R = 18.5;
const COIN_MASS = 1;
const STRIKER_MASS = 1.4;
const POCKET_R = 27;
const POCKET_CATCH = 23;
const POCKET_MAGNET_R = POCKET_R + 10;

// PHYSICS & FRICTION
const FRICTION = 0.988;
const MIN_SPEED = 0.05;
const MAX_PULL = 120;
const POWER_SCALE = 0.18;
const ARROW_LENGTH_MULT = 2.6;
const WALL_REST = 0.82;
const COLL_REST = 0.98;

const BASE_OFFSET = 44;
const EDGE_MARGIN = 72;

const POCKETS = [
  { x: PMIN + 8, y: PMIN + 8 },
  { x: PMAX - 8, y: PMIN + 8 },
  { x: PMIN + 8, y: PMAX - 8 },
  { x: PMAX - 8, y: PMAX - 8 },
];

function triggerHaptic(pattern) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

function makeInitialCoins() {
  const coins = [];
  let id = 0;
  coins.push({ id: id++, x: CENTER, y: CENTER, r: QUEEN_R, color: "queen", active: true, vx: 0, vy: 0, mass: COIN_MASS });
  const ring1 = 31;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    coins.push({
      id: id++,
      x: CENTER + Math.cos(a) * ring1,
      y: CENTER + Math.sin(a) * ring1,
      r: COIN_R,
      color: i % 2 === 0 ? "white" : "black",
      active: true, vx: 0, vy: 0, mass: COIN_MASS,
    });
  }
  const ring2 = 58;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    coins.push({
      id: id++,
      x: CENTER + Math.cos(a) * ring2,
      y: CENTER + Math.sin(a) * ring2,
      r: COIN_R,
      color: i % 2 === 0 ? "black" : "white",
      active: true, vx: 0, vy: 0, mass: COIN_MASS,
    });
  }
  return coins;
}

// Canonical baseline assignment used for BOTH offline and online modes:
// Player 1 is always "bottom" and Player 2 is always "top" in game-space.
// For online play, Player 2's device rotates the canvas 180deg when rendering
// (see draw()), so that their canonical "top" baseline visually lands at the
// BOTTOM of their own phone screen too -- both players see their own striker
// at the bottom of their own device.
function sideForPlayer(player, numPlayers) {
  switch (player) {
    case 1: return "bottom";
    case 2: return "top";
    case 3: return "left";
    case 4: return "right";
    default: return "bottom";
  }
}

function makeStriker(player, numPlayers) {
  const side = sideForPlayer(player, numPlayers);
  const base = { r: STRIKER_R, vx: 0, vy: 0, active: true, side, mass: STRIKER_MASS };

  if (side === "bottom") return { ...base, x: CENTER, y: PMAX - BASE_OFFSET };
  if (side === "top") return { ...base, x: CENTER, y: PMIN + BASE_OFFSET };
  if (side === "left") return { ...base, x: PMIN + BASE_OFFSET, y: CENTER };
  return { ...base, x: PMAX - BASE_OFFSET, y: CENTER };
}

function colorForPlayer(player) {
  return player % 2 === 1 ? "white" : "black";
}

function initialScores(numPlayers) {
  const s = {};
  for (let p = 1; p <= numPlayers; p++) {
    s[p] = 9;
  }
  return s;
}

const CSS = `
  .cr-wrap {
    position: relative; width: 100vw; min-height: 100vh; min-height: 100dvh; overflow: hidden;
    background: linear-gradient(135deg, #150822, #2e1065, #3b0764); display: flex; align-items: center;
    justify-content: center; padding: 8px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .cr-wrap * { box-sizing: border-box; }
  .cr-glow { pointer-events: none; position: absolute; border-radius: 9999px; filter: blur(60px); }
  .cr-glow-1 { top: -48px; left: -48px; width: 160px; height: 160px; background: rgba(217,70,239,0.3); }
  .cr-glow-2 { bottom: -64px; right: -32px; width: 192px; height: 192px; background: rgba(147,51,234,0.3); }
  .cr-glow-3 { top: 33%; right: 25%; width: 112px; height: 112px; background: rgba(139,92,246,0.2); }

  .cr-card {
    position: relative; z-index: 1; width: 100%; height: 100%; max-width: 620px; margin: 0 auto;
    background: rgba(2,6,23,0.8); backdrop-filter: blur(6px); border: 1px solid rgba(107,33,168,0.5);
    border-radius: 24px; padding: 16px; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px; -webkit-user-select: none; user-select: none; color: #fff;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
  }

  .cr-screen { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 24px 0; }
  .cr-title { font-size: 24px; font-weight: 900; letter-spacing: 0.05em; color: #d8b4fe; text-align: center; margin: 0; }
  .cr-heading { font-size: 20px; font-weight: 900; color: #d8b4fe; margin: 0; }
  .cr-heading-indigo { color: #818cf8; font-size: 24px; }
  .cr-subtitle { color: rgba(216,180,254,0.7); font-size: 14px; font-weight: 500; margin: 0; }

  .cr-btn-col { width: 100%; display: flex; flex-direction: column; gap: 16px; max-width: 320px; margin-top: 8px; }
  .cr-btn {
    width: 100%; padding: 14px 0; border: none; border-radius: 16px; color: #fff; font-weight: 900;
    font-size: 16px; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); transition: transform 0.1s, opacity 0.15s;
  }
  .cr-btn:active { transform: scale(0.95); }
  .cr-btn-offline { background: linear-gradient(90deg, #d946ef, #9333ea); }
  .cr-btn-offline:hover { opacity: 0.9; }
  .cr-btn-online { background: linear-gradient(90deg, #7e22ce, #7c3aed); }
  .cr-btn-online:hover { opacity: 0.9; }
  .cr-btn-outline {
    background: rgba(59,7,100,0.6); border: 2px solid rgba(168,85,247,0.5); display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cr-btn-outline:hover { background: rgba(88,28,135,0.7); border-color: #c084fc; }
  .cr-btn-indigo { background: #4f46e5; }
  .cr-btn-indigo:hover { background: #6366f1; }
  .cr-btn-outline-indigo { background: #1e293b; border: 2px solid rgba(99,102,241,0.5); }
  .cr-btn-outline-indigo:hover { background: #334155; }

  .cr-btn-hint { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: -8px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
  .cr-swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.3); }
  .cr-swatch-white { background: #f3ea8a; }
  .cr-swatch-black { background: #222222; }

  .cr-back-link { width: 100%; background: none; border: none; padding: 10px 0; margin-top: 8px; font-size: 12px; font-weight: 700; color: rgba(216,180,254,0.7); cursor: pointer; }
  .cr-back-link:hover { color: #fff; }
  .cr-cancel-link { background: none; border: none; font-size: 12px; color: #94a3b8; cursor: pointer; }
  .cr-cancel-link:hover { color: #fff; }

  .cr-panel { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; max-width: 320px; background: #1e293b; padding: 20px; border-radius: 16px; border: 1px solid rgba(99,102,241,0.3); }
  .cr-panel-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
  .cr-panel-text { font-size: 12px; color: #cbd5e1; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; }
  .cr-room-code { font-size: 30px; font-weight: 900; letter-spacing: 0.15em; color: #fbbf24; background: #020617; padding: 8px 24px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.4); }
  .cr-input { width: 100%; text-align: center; font-size: 20px; font-weight: 900; letter-spacing: 0.15em; background: #020617; color: #fbbf24; border: 1px solid rgba(99,102,241,0.4); border-radius: 12px; padding: 8px 0; outline: none; }
  .cr-input:focus { border-color: #818cf8; }

  .cr-play { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; min-height: 0; }
  .cr-play-header { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 4px 4px 0; gap: 8px; }
  .cr-header-btn { padding: 4px 10px; background: rgba(59,7,100,0.6); border: 1px solid rgba(107,33,168,0.7); color: #fff; font-size: 11px; font-weight: 700; border-radius: 8px; cursor: pointer; flex-shrink: 0; }
  .cr-header-btn:hover { background: rgba(88,28,135,0.7); }
  .cr-reset-btn { background: #a21caf; border: none; }
  .cr-reset-btn:hover { background: #c026d3; }
  .cr-play-title { font-size: 14px; font-weight: 900; letter-spacing: 0.03em; color: #d8b4fe; text-align: center; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .cr-score-grid { width: 100%; display: grid; gap: 8px; padding: 0 4px; }
  .cr-score-card { padding: 8px; border-radius: 12px; border: 1px solid rgba(107,33,168,0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 3px; background: rgba(59,7,100,0.5); color: #d8b4fe; transition: all 0.15s; }
  .cr-score-active { background: #c084fc; color: #020617; border-color: #d8b4fe; font-weight: 800; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); transform: scale(1.05); }
  .cr-score-label { font-size: 9px; letter-spacing: 0.05em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
  .cr-score-value { font-size: 14px; font-weight: 900; }

  .cr-board-wrap { position: relative; width: 100%; flex: 1 1 auto; min-height: 0; max-height: 100%; aspect-ratio: 1 / 1; border-radius: 16px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); border: 2px solid #451a03; margin: 0 auto; }
  .cr-canvas { width: 100%; height: 100%; touch-action: none; display: block; }

  .cr-message { width: 100%; text-align: center; font-size: 11px; font-weight: 500; color: #fde68a; background: rgba(30,41,59,0.9); padding: 8px 10px; border-radius: 12px; border: 1px solid #334155; }

  @media (min-width: 640px) {
    .cr-wrap { padding: 24px; }
    .cr-card { max-width: 720px; padding: 24px; }
    .cr-title { font-size: 30px; }
    .cr-heading { font-size: 24px; }
    .cr-btn { padding: 16px 0; font-size: 18px; }
    .cr-play-title { font-size: 18px; }
    .cr-header-btn { padding: 4px 12px; font-size: 12px; }
    .cr-score-label { font-size: 10px; }
    .cr-score-value { font-size: 16px; }
    .cr-message { font-size: 12px; padding: 10px 12px; }
  }
`;

export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const [localPlayer, setLocalPlayer] = useState(1);

  const [screen, setScreen] = useState("menu");
  const [numPlayers, setNumPlayers] = useState(2);
  const [gameMode, setGameMode] = useState("offline");
  const [roomCode, setRoomCode] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [onlineStep, setOnlineStep] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      } catch (e) { return null; }
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }

  function playTone(freq, duration, type, volume) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  const stateRef = useRef({
    numPlayers: 2,
    coins: makeInitialCoins(),
    striker: makeStriker(1, 2),
    phase: "position",
    dragStart: null,
    dragCurrent: null,
    currentPlayer: 1,
    scores: initialScores(2),
    queenPending: false,
    queenPendingPlayer: null,
  });

  const [ui, setUi] = useState({
    currentPlayer: 1,
    scores: initialScores(2),
    message: "Player 1 — Move striker on baseline, then shoot!",
    phase: "position",
    winner: null,
  });

  // TRANSFORMS COORD BASED ON PLAYER PERSPECTIVE (FLIPS EVERYTHING 180° FOR PLAYER 2)
  function toGlobalCoord(x, y) {
    if (gameMode === "online" && localPlayer === 2) {
      return { x: SIZE - x, y: SIZE - y };
    }
    return { x, y };
  }

  function handlePeerData(data) {
    const st = stateRef.current;
    if (data.type === "MOVE_STRIKER") {
      st.striker.x = data.x;
      st.striker.y = data.y;
    } else if (data.type === "SHOOT") {
      st.striker.x = data.x;
      st.striker.y = data.y;
      st.striker.vx = data.vx;
      st.striker.vy = data.vy;
      st.phase = "shooting";
      playTone(160, 0.16, "triangle", 0.25);
      triggerHaptic(35);
      setUi((u) => ({ ...u, phase: "shooting", message: "Opponent took a shot..." }));
    } else if (data.type === "SYNC_STATE") {
      st.coins = data.coins;
      st.scores = data.scores;
      st.currentPlayer = data.currentPlayer;
      st.phase = data.phase;
      st.queenPending = data.queenPending || false;
      st.queenPendingPlayer = data.queenPendingPlayer || null;
      st.striker = makeStriker(data.currentPlayer, 2);
      setUi({
        currentPlayer: data.currentPlayer,
        scores: data.scores,
        message: data.message,
        phase: data.phase,
        winner: data.winner,
      });
    }
  }

  function sendNetworkData(data) {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data);
    }
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function distPointToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = x1 + t * dx, cy = y1 + t * dy;
    return Math.hypot(px - cx, py - cy);
  }

  function stepPhysics() {
    const st = stateRef.current;
    const objs = [st.striker, ...st.coins].filter((o) => o.active);
    let anyMoving = false;

    for (const o of objs) {
      for (const p of POCKETS) {
        const dx = p.x - o.x, dy = p.y - o.y;
        const dd = Math.hypot(dx, dy);
        if (dd > 0.01 && dd < POCKET_MAGNET_R) {
          const strength = 0.045 * (1 - dd / POCKET_MAGNET_R) + 0.02;
          o.vx += (dx / dd) * strength * 6;
          o.vy += (dy / dd) * strength * 6;
        }
      }
    }

    for (const o of objs) {
      o.px = o.x;
      o.py = o.y;
      o.x += o.vx;
      o.y += o.vy;
      o.vx *= FRICTION;
      o.vy *= FRICTION;
      const sp = Math.hypot(o.vx, o.vy);
      if (sp < MIN_SPEED) {
        o.vx = 0;
        o.vy = 0;
      } else {
        anyMoving = true;
      }
    }

    for (const o of objs) {
      if (!o.active) continue;
      for (const p of POCKETS) {
        const d = distPointToSegment(p.x, p.y, o.px ?? o.x, o.py ?? o.y, o.x, o.y);
        if (d < POCKET_CATCH) {
          o.active = false;
          o.pocketedThisTurn = true;
          o.vx = 0;
          o.vy = 0;
          playTone(480, 0.25, "sine", 0.3);
          triggerHaptic([20, 40, 30]);
        }
      }
    }

    for (const o of objs) {
      if (!o.active) continue;
      let bounced = false;

      if (o.x - o.r < PMIN) {
        o.x = PMIN + o.r;
        if (o.vx < 0) o.vx = -o.vx * WALL_REST;
        bounced = true;
      }
      if (o.x + o.r > PMAX) {
        o.x = PMAX - o.r;
        if (o.vx > 0) o.vx = -o.vx * WALL_REST;
        bounced = true;
      }
      if (o.y - o.r < PMIN) {
        o.y = PMIN + o.r;
        if (o.vy < 0) o.vy = -o.vy * WALL_REST;
        bounced = true;
      }
      if (o.y + o.r > PMAX) {
        o.y = PMAX - o.r;
        if (o.vy > 0) o.vy = -o.vy * WALL_REST;
        bounced = true;
      }

      if (bounced) {
        playTone(180, 0.05, "triangle", 0.1);
        triggerHaptic(12);
      }
    }

    for (let i = 0; i < objs.length; i++) {
      for (let j = i + 1; j < objs.length; j++) {
        const a = objs[i], b = objs[j];
        if (!a.active || !b.active) continue;
        const d = dist(a, b);
        const minD = a.r + b.r;
        if (d > 0 && d < minD) {
          const nx = (b.x - a.x) / d;
          const ny = (b.y - a.y) / d;
          const overlap = minD - d;
          a.x -= (nx * overlap) / 2;
          a.y -= (ny * overlap) / 2;
          b.x += (nx * overlap) / 2;
          b.y += (ny * overlap) / 2;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel > 0) {
            const m1 = a.mass || COIN_MASS;
            const m2 = b.mass || COIN_MASS;
            const impulse = ((1 + COLL_REST) * rel) / (m1 + m2);
            a.vx -= impulse * m2 * nx;
            a.vy -= impulse * m2 * ny;
            b.vx += impulse * m1 * nx;
            b.vy += impulse * m1 * ny;

            if (rel > 0.5) {
              playTone(Math.min(600, 250 + rel * 30), 0.06, "sine", Math.min(0.3, rel * 0.05));
              triggerHaptic(15);
            }
          }
          anyMoving = true;
        }
      }
    }

    return anyMoving;
  }

  // ---------- QUEEN COVER RULE ----------
  // Pocketing the Queen alone doesn't finish the job. If you don't ALSO pocket one
  // of your own coins in that same stroke, you get one extra shot (this turn keeps
  // going) purely to try to cover her:
  //   - Pot one of your own coins on that follow-up shot -> Queen stays covered,
  //     you keep both the Queen and that coin.
  //   - Miss, foul, or pot nothing of your own on that follow-up shot -> the
  //     Queen respots to the center and the turn passes normally.
  function resolveTurn() {
    const st = stateRef.current;
    const player = st.currentPlayer;
    const totalP = st.numPlayers;
    const opponent = player === 1 ? 2 : 1;

    const pocketedWhite = st.coins.filter((c) => c.color === "white" && c.pocketedThisTurn).length;
    const pocketedBlack = st.coins.filter((c) => c.color === "black" && c.pocketedThisTurn).length;
    const queen = st.coins.find((c) => c.color === "queen");
    const queenPocketedNow = queen.pocketedThisTurn;
    const strikerFoul = !st.striker.active;

    const myColor = colorForPlayer(player);
    const opponentColor = colorForPlayer(opponent);

    const mine = myColor === "white" ? pocketedWhite : pocketedBlack;
    const theirs = myColor === "white" ? pocketedBlack : pocketedWhite;

    let goesAgain = mine > 0 && !strikerFoul;
    let msgParts = [];

    const scores = { ...(st.scores || {}) };

    if (mine > 0) {
      scores[player] = Math.max(0, (scores[player] || 0) - mine);
      msgParts.push(`Pocketed ${mine} ${myColor} coin${mine > 1 ? "s" : ""}`);
    }

    if (theirs > 0) {
      scores[opponent] = Math.max(0, (scores[opponent] || 0) - theirs);
      msgParts.push(`Pocketed ${theirs} ${opponentColor} coin(s) for opponent`);
    }

    const coveredThisShot = mine > 0 && !strikerFoul;
    const wasPending = st.queenPending && st.queenPendingPlayer === player;

    if (queenPocketedNow) {
      if (coveredThisShot) {
        msgParts.push("Queen covered!");
        st.queenPending = false;
        st.queenPendingPlayer = null;
      } else if (!strikerFoul) {
        // One extra shot to try to cover it — the turn keeps going.
        st.queenPending = true;
        st.queenPendingPlayer = player;
        goesAgain = true;
        msgParts.push("Queen pocketed — pot one of your own coins next to cover it!");
      } else {
        queen.active = true;
        queen.x = CENTER;
        queen.y = CENTER;
        st.queenPending = false;
        st.queenPendingPlayer = null;
        msgParts.push("Fouled while pocketing the Queen — returned to center");
      }
    } else if (wasPending) {
      if (coveredThisShot) {
        msgParts.push("Queen covered!");
      } else {
        queen.active = true;
        queen.x = CENTER;
        queen.y = CENTER;
        msgParts.push("Queen not covered — returned to center");
      }
      st.queenPending = false;
      st.queenPendingPlayer = null;
    }

    if (strikerFoul) {
      goesAgain = false;
      scores[player] = (scores[player] || 0) + 1;
      msgParts.push("Foul: Striker in pot! (+1 fine coin penalty)");
      st.striker.active = true;
      triggerHaptic([50, 30, 50]);
    }

    st.scores = scores;
    st.coins.forEach((c) => { c.pocketedThisTurn = false; });

    let winner = null;
    if (scores[1] === 0) {
      winner = `Player 1 (WHITE)`;
    } else if (scores[2] === 0) {
      winner = `Player 2 (BLACK)`;
    }

    const nextPlayer = goesAgain && !winner ? player : (player % totalP) + 1;
    st.currentPlayer = nextPlayer;
    st.striker = makeStriker(nextPlayer, totalP);
    st.phase = winner ? "gameover" : "position";
    st.dragStart = null;
    st.dragCurrent = null;

    const baseMsg = msgParts.length ? msgParts.join(", ") + "." : "No coin pocketed.";
    const message = winner
      ? `🎉 Game Over — ${winner} Wins!`
      : `${baseMsg} ${goesAgain ? `Player ${player} goes again!` : `Player ${nextPlayer}'s turn`}.`;

    setUi({
      currentPlayer: nextPlayer,
      scores,
      message,
      phase: st.phase,
      winner,
    });

    if (gameMode === "online" && localPlayer === 1) {
      sendNetworkData({
        type: "SYNC_STATE",
        coins: st.coins,
        scores,
        currentPlayer: nextPlayer,
        phase: st.phase,
        message,
        winner,
        queenPending: st.queenPending,
        queenPendingPlayer: st.queenPendingPlayer,
      });
    }
  }

  useEffect(() => {
    if (screen !== "playing") return;
    function loop() {
      const st = stateRef.current;
      if (st.phase === "shooting") {
        const moving = stepPhysics();
        if (!moving) {
          resolveTurn();
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen]);

  function drawBaseline(ctx, side) {
    const LINE_COLOR = "#572b14";
    const RED_CIRCLE = "#c82618";
    const END_CIRCLE_R = 12;
    const END_M = EDGE_MARGIN + END_CIRCLE_R;
    const gap = 12;

    ctx.save();
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;

    let p1, p2, dir;
    const offset = BASE_OFFSET;

    if (side === "bottom") {
      p1 = { x: PMIN + END_M, y: PMAX - offset };
      p2 = { x: PMAX - END_M, y: PMAX - offset };
      dir = { nx: 0, ny: -1 };
    } else if (side === "top") {
      p1 = { x: PMIN + END_M, y: PMIN + offset };
      p2 = { x: PMAX - END_M, y: PMIN + offset };
      dir = { nx: 0, ny: 1 };
    } else if (side === "left") {
      p1 = { x: PMIN + offset, y: PMIN + END_M };
      p2 = { x: PMIN + offset, y: PMAX - END_M };
      dir = { nx: 1, ny: 0 };
    } else {
      p1 = { x: PMAX - offset, y: PMIN + END_M };
      p2 = { x: PMAX - offset, y: PMAX - END_M };
      dir = { nx: -1, ny: 0 };
    }

    ctx.beginPath();
    if (side === "bottom" || side === "top") {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.moveTo(p1.x, p1.y + dir.ny * gap);
      ctx.lineTo(p2.x, p2.y + dir.ny * gap);
    } else {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.moveTo(p1.x + dir.nx * gap, p1.y);
      ctx.lineTo(p2.x + dir.nx * gap, p2.y);
    }
    ctx.stroke();

    [p1, p2].forEach((pt) => {
      const cy = (side === "bottom" || side === "top") ? pt.y + (dir.ny * gap) / 2 : pt.y;
      const cx = (side === "left" || side === "right") ? pt.x + (dir.nx * gap) / 2 : pt.x;

      ctx.beginPath();
      ctx.arc(cx, cy, END_CIRCLE_R, 0, Math.PI * 2);
      ctx.fillStyle = RED_CIRCLE;
      ctx.fill();
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawCenterRosette(ctx) {
    ctx.save();
    ctx.strokeStyle = "#572b14";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 76, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, QUEEN_R, 0, Math.PI * 2);
    ctx.fillStyle = "#c82618";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawCoin(ctx, c) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(c.x + 1.5, c.y + 2.5, c.r * 0.95, c.r * 0.88, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();

    const g = ctx.createRadialGradient(c.x - c.r * 0.35, c.y - c.r * 0.35, c.r * 0.1, c.x, c.y, c.r);
    if (c.color === "white") {
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.65, "#f3ea8a");
      g.addColorStop(1, "#c2b467");
    } else if (c.color === "black") {
      g.addColorStop(0, "#555555");
      g.addColorStop(0.7, "#222222");
      g.addColorStop(1, "#0d0d0d");
    } else {
      g.addColorStop(0, "#ff6b6b");
      g.addColorStop(0.65, "#d62020");
      g.addColorStop(1, "#730000");
    }

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = c.color === "black" ? "rgba(255,255,255,0.22)" : "rgba(80,50,20,0.25)";
    ctx.lineWidth = 1;
    [0.72, 0.48, 0.28].forEach((scale) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = c.color === "black" ? "#000000" : c.color === "white" ? "#a39243" : "#590000";
    ctx.stroke();
    ctx.restore();
  }

  function drawStriker(ctx, s) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,215,0,0.35)";
    ctx.fill();

    const g = ctx.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.1, s.x, s.y, s.r);
    g.addColorStop(0, "#fff5b8");
    g.addColorStop(0.5, "#f3ba2f");
    g.addColorStop(1, "#9e6c00");

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#5e4000";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "#163c8a";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = "#f3ba2f";
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const st = stateRef.current;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();

    // ROTATE CANVAS 180 DEG FOR PLAYER 2 IN ONLINE MODE
    if (gameMode === "online" && localPlayer === 2) {
      ctx.translate(SIZE, SIZE);
      ctx.rotate(Math.PI);
    }

    const frameGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    frameGrad.addColorStop(0, "#2c140a");
    frameGrad.addColorStop(0.5, "#472313");
    frameGrad.addColorStop(1, "#1d0b04");
    ctx.fillStyle = frameGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(FRAME - 6, FRAME - 6, SIZE - (FRAME - 6) * 2, SIZE - (FRAME - 6) * 2);

    const boardGrad = ctx.createRadialGradient(CENTER, CENTER, 60, CENTER, CENTER, SIZE * 0.55);
    boardGrad.addColorStop(0, "#f4e4c1");
    boardGrad.addColorStop(0.85, "#ebd3a2");
    boardGrad.addColorStop(1, "#ddc08a");
    ctx.fillStyle = boardGrad;
    ctx.fillRect(PMIN, PMIN, PMAX - PMIN, PMAX - PMIN);

    ctx.strokeStyle = "#572b14";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(PMIN, PMIN, PMAX - PMIN, PMAX - PMIN);

    POCKETS.forEach((p) => {
      const dx = p.x < CENTER ? 1 : -1;
      const dy = p.y < CENTER ? 1 : -1;
      const startX = p.x + dx * 28;
      const startY = p.y + dy * 28;
      const endX = p.x + dx * 135;
      const endY = p.y + dy * 135;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#572b14";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(endX, endY, 15, 0, Math.PI * 2);
      ctx.strokeStyle = "#572b14";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });

    ["bottom", "left", "top", "right"].forEach((side) => drawBaseline(ctx, side));
    drawCenterRosette(ctx);

    POCKETS.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R + 3, 0, Math.PI * 2);
      ctx.fillStyle = "#8a7d71";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();

      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    });

    st.coins.forEach((c) => {
      if (!c.active) return;
      drawCoin(ctx, c);
    });

    if (st.striker.active) {
      drawStriker(ctx, st.striker);
    }

    if (st.phase === "aiming" && st.dragStart && st.dragCurrent) {
      const dx = st.dragCurrent.x - st.dragStart.x;
      const dy = st.dragCurrent.y - st.dragStart.y;
      const len = Math.min(Math.hypot(dx, dy), MAX_PULL);
      const ang = Math.atan2(dy, dx);

      const shotX = st.striker.x - Math.cos(ang) * len * ARROW_LENGTH_MULT;
      const shotY = st.striker.y - Math.sin(ang) * len * ARROW_LENGTH_MULT;
      const pullX = st.striker.x + Math.cos(ang) * len;
      const pullY = st.striker.y + Math.sin(ang) * len;

      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "#d62020";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(st.striker.x, st.striker.y);
      ctx.lineTo(shotX, shotY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(st.striker.x, st.striker.y);
      ctx.lineTo(pullX, pullY);
      ctx.stroke();
    }

    ctx.restore();
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rawX = (clientX - rect.left) * scaleX;
    const rawY = (clientY - rect.top) * scaleY;

    return toGlobalCoord(rawX, rawY);
  }

  function handleDown(e) {
    const st = stateRef.current;
    if (st.phase === "gameover") return;
    if (gameMode === "online" && st.currentPlayer !== localPlayer) return;

    const pos = getPos(e);
    if (st.phase === "position") {
      st.dragStart = pos;
      triggerHaptic(10);
    } else if (st.phase === "aiming") {
      st.dragStart = { x: st.striker.x, y: st.striker.y };
      st.dragCurrent = pos;
      triggerHaptic(10);
    }
  }

  function handleMove(e) {
    const st = stateRef.current;
    if (!st.dragStart) return;
    if (gameMode === "online" && st.currentPlayer !== localPlayer) return;

    const pos = getPos(e);

    if (st.phase === "position") {
      const minC = PMIN + EDGE_MARGIN;
      const maxC = PMAX - EDGE_MARGIN;
      const side = st.striker.side;

      let targetX = st.striker.x;
      let targetY = st.striker.y;

      if (side === "bottom" || side === "top") {
        targetX = Math.max(minC, Math.min(maxC, pos.x));
      } else {
        targetY = Math.max(minC, Math.min(maxC, pos.y));
      }

      if (Math.abs(st.striker.x - targetX) > 2 || Math.abs(st.striker.y - targetY) > 2) {
        triggerHaptic(5);
      }

      st.striker.x = targetX;
      st.striker.y = targetY;

      if (gameMode === "online") {
        sendNetworkData({ type: "MOVE_STRIKER", x: targetX, y: targetY });
      }
    } else if (st.phase === "aiming") {
      st.dragCurrent = pos;
    }
  }

  function handleUp() {
    const st = stateRef.current;
    if (gameMode === "online" && st.currentPlayer !== localPlayer) return;

    if (st.phase === "position") {
      st.dragStart = null;
      st.phase = "aiming";
      triggerHaptic(15);
      setUi((u) => ({ ...u, phase: "aiming", message: "Pull back to aim, then release to shoot." }));
    } else if (st.phase === "aiming" && st.dragStart && st.dragCurrent) {
      const dx = st.dragCurrent.x - st.striker.x;
      const dy = st.dragCurrent.y - st.striker.y;
      const len = Math.min(Math.hypot(dx, dy), MAX_PULL);
      if (len > 6) {
        const ang = Math.atan2(dy, dx);
        const vx = -Math.cos(ang) * len * POWER_SCALE;
        const vy = -Math.sin(ang) * len * POWER_SCALE;

        st.striker.vx = vx;
        st.striker.vy = vy;
        st.phase = "shooting";
        playTone(160, 0.16, "triangle", 0.25);
        triggerHaptic(35);
        setUi((u) => ({ ...u, phase: "shooting", message: "Shot in progress…" }));

        if (gameMode === "online") {
          sendNetworkData({ type: "SHOOT", x: st.striker.x, y: st.striker.y, vx, vy });
        }
      }
      st.dragStart = null;
      st.dragCurrent = null;
    }
  }

  function startGame(pCount, isOnlineMode = false) {
    setNumPlayers(pCount);
    stateRef.current = {
      numPlayers: pCount,
      coins: makeInitialCoins(),
      striker: makeStriker(1, pCount),
      phase: "position",
      dragStart: null,
      dragCurrent: null,
      currentPlayer: 1,
      scores: initialScores(pCount),
      queenPending: false,
      queenPendingPlayer: null,
    };
    setUi({
      currentPlayer: 1,
      scores: initialScores(pCount),
      message: `Player 1 — Move striker on baseline, then shoot!`,
      phase: "position",
      winner: null,
    });
    setScreen("playing");
  }

  function handleCreateRoom() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    setOnlineStep("create");
    setLocalPlayer(1);
    setStatusMessage("Initializing peer connection...");

    if (peerRef.current) peerRef.current.destroy();

    const peer = new Peer(code);
    peerRef.current = peer;

    peer.on("open", () => {
      setStatusMessage("Waiting for player to join...");
    });

    peer.on("connection", (conn) => {
      connRef.current = conn;
      conn.on("open", () => {
        setStatusMessage("Player connected! Starting game...");
        setTimeout(() => startGame(2, true), 600);
      });
      conn.on("data", handlePeerData);
    });

    peer.on("error", (err) => {
      setStatusMessage("Connection error: " + err.type);
    });
  }

  function handleJoinRoom() {
    if (!inputRoomCode.trim()) return;
    setRoomCode(inputRoomCode);
    setLocalPlayer(2);
    setStatusMessage("Connecting to room...");

    if (peerRef.current) peerRef.current.destroy();

    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", () => {
      const conn = peer.connect(inputRoomCode.trim());
      connRef.current = conn;

      conn.on("open", () => {
        setStatusMessage("Connected! Starting game...");
        setTimeout(() => startGame(2, true), 600);
      });

      conn.on("data", handlePeerData);
    });

    peer.on("error", () => {
      setStatusMessage("Could not connect to room. Check code.");
    });
  }

  return (
    <div className="cr-wrap">
      <style>{CSS}</style>

      <div className="cr-glow cr-glow-1" />
      <div className="cr-glow cr-glow-2" />
      <div className="cr-glow cr-glow-3" />

      <div className="cr-card">
        {screen === "menu" && (
          <div className="cr-screen">
            <h1 className="cr-title">TOURNAMENT CARROM</h1>
            <p className="cr-subtitle">Select Game Mode to Start</p>

            <div className="cr-btn-col">
              <button
                onClick={() => {
                  setGameMode("offline");
                  setScreen("offline_select");
                }}
                className="cr-btn cr-btn-offline"
              >
                🎮 OFFLINE PLAY
              </button>

              <button
                onClick={() => {
                  setGameMode("online");
                  setOnlineStep(null);
                  setScreen("online_select");
                }}
                className="cr-btn cr-btn-online"
              >
                🌐 ONLINE PLAY
              </button>
            </div>
          </div>
        )}

        {screen === "offline_select" && (
          <div className="cr-screen">
            <h2 className="cr-heading">OFFLINE MODE</h2>
            <p className="cr-subtitle">Select Number of Players</p>

            <div className="cr-btn-col">
              <button onClick={() => startGame(2, false)} className="cr-btn cr-btn-outline">
                👥 2 PLAYERS
              </button>
              <span className="cr-btn-hint">
                <span className="cr-swatch cr-swatch-white" /> Player 1: White
                <span>·</span>
                <span className="cr-swatch cr-swatch-black" /> Player 2: Black
              </span>

              <button onClick={() => setScreen("menu")} className="cr-back-link">
                ← Back to Main Menu
              </button>
            </div>
          </div>
        )}

        {screen === "online_select" && (
          <div className="cr-screen">
            <h2 className="cr-heading cr-heading-indigo">ONLINE MULTIPLAYER</h2>

            {!onlineStep && (
              <div className="cr-btn-col">
                <button onClick={handleCreateRoom} className="cr-btn cr-btn-indigo">
                  🏠 CREATE ROOM
                </button>

                <button onClick={() => setOnlineStep("join")} className="cr-btn cr-btn-outline-indigo">
                  🔑 JOIN ROOM
                </button>

                <button onClick={() => setScreen("menu")} className="cr-back-link">
                  ← Back to Main Menu
                </button>
              </div>
            )}

            {onlineStep === "create" && (
              <div className="cr-panel">
                <span className="cr-panel-label">Room Code</span>
                <span className="cr-room-code">{roomCode}</span>
                <p className="cr-panel-text">Share this code with your friend to play together!</p>
                <p className="cr-panel-text" style={{ color: "#fbbf24", fontWeight: "bold" }}>
                  {statusMessage}
                </p>

                <button onClick={() => setOnlineStep(null)} className="cr-cancel-link">
                  Cancel
                </button>
              </div>
            )}

            {onlineStep === "join" && (
              <div className="cr-panel">
                <span className="cr-panel-label">Enter Room Code</span>
                <input
                  type="text"
                  maxLength={6}
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  placeholder="E.g. 482910"
                  className="cr-input"
                />
                <p className="cr-panel-text" style={{ color: "#fbbf24", fontWeight: "bold" }}>
                  {statusMessage}
                </p>

                <button onClick={handleJoinRoom} className="cr-btn cr-btn-indigo">
                  JOIN & PLAY
                </button>

                <button onClick={() => setOnlineStep(null)} className="cr-cancel-link">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "playing" && (
          <div className="cr-play">
            <div className="cr-play-header">
              <button onClick={() => setScreen("menu")} className="cr-header-btn">
                ← MENU
              </button>
              <h2 className="cr-play-title">TOURNAMENT CARROM</h2>
              <button onClick={() => startGame(numPlayers, gameMode === "online")} className="cr-header-btn cr-reset-btn">
                RESET
              </button>
            </div>

            <div
              className="cr-score-grid"
              style={{ gridTemplateColumns: `repeat(${numPlayers === 2 ? 2 : 4}, 1fr)` }}
            >
              {Array.from({ length: numPlayers }, (_, i) => i + 1).map((p) => {
                const isActive = ui.currentPlayer === p;
                const isWhite = colorForPlayer(p) === "white";
                const colorName = isWhite ? "White" : "Black";
                const isYou = gameMode === "online" && localPlayer === p;
                return (
                  <div key={p} className={`cr-score-card ${isActive ? "cr-score-active" : ""}`}>
                    <span className="cr-score-label">
                      <span className={`cr-swatch ${isWhite ? "cr-swatch-white" : "cr-swatch-black"}`} />
                      P{p} ({colorName}) {isYou ? "• YOU" : ""}
                    </span>
                    <span className="cr-score-value">{ui.scores[p] ?? 9} LEFT</span>
                  </div>
                );
              })}
            </div>

            <div className="cr-board-wrap">
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                className="cr-canvas"
                onMouseDown={handleDown}
                onMouseMove={handleMove}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
                onTouchStart={handleDown}
                onTouchMove={handleMove}
                onTouchEnd={handleUp}
              />
            </div>

            <div className="cr-message">{ui.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
