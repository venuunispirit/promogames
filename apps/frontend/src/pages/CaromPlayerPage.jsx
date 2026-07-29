import React, { useRef, useEffect, useState, useCallback } from "react";

// ---------- constants ----------
const SIZE = 640;
const FRAME = 40;
const PMIN = FRAME;
const PMAX = SIZE - FRAME;
const CENTER = SIZE / 2;
const COIN_R = 14;
const QUEEN_R = 14;
const STRIKER_R = 18;
const POCKET_R = 24;
const POCKET_CATCH = 20;
const POCKET_MAGNET_R = POCKET_R + 16;
const FRICTION = 0.9865;
const MIN_SPEED = 0.06;
const MAX_PULL = 105;
const POWER_SCALE = 0.082;
const ARROW_LENGTH_MULT = 2.6;
const WALL_REST = 0.72;
const COLL_REST = 0.97;
const BASE_OFFSET = 34;
const EDGE_MARGIN = 60;

const POCKETS = [
  { x: PMIN, y: PMIN },
  { x: PMAX, y: PMIN },
  { x: PMIN, y: PMAX },
  { x: PMAX, y: PMAX },
];

function makeInitialCoins() {
  const coins = [];
  let id = 0;
  coins.push({ id: id++, x: CENTER, y: CENTER, r: QUEEN_R, color: "queen", active: true, vx: 0, vy: 0 });
  const ring1 = 30, ring2 = 56;
  const n1 = 6, n2 = 12;
  for (let i = 0; i < n1; i++) {
    const a = (i / n1) * Math.PI * 2 + Math.PI / 6;
    coins.push({
      id: id++,
      x: CENTER + Math.cos(a) * ring1,
      y: CENTER + Math.sin(a) * ring1,
      r: COIN_R,
      color: i % 2 === 0 ? "white" : "black",
      active: true, vx: 0, vy: 0,
    });
  }
  for (let i = 0; i < n2; i++) {
    const a = (i / n2) * Math.PI * 2;
    coins.push({
      id: id++,
      x: CENTER + Math.cos(a) * ring2,
      y: CENTER + Math.sin(a) * ring2,
      r: COIN_R,
      color: i % 2 === 0 ? "black" : "white",
      active: true, vx: 0, vy: 0,
    });
  }
  return coins;
}

function sideForPlayer(player, mode) {
  if (mode === "2p") return player === 1 ? "bottom" : "top";
  switch (player) {
    case 1: return "bottom";
    case 2: return "left";
    case 3: return "top";
    case 4: return "right";
    default: return "bottom";
  }
}

function sidesForMode(mode) {
  return mode === "2p" ? ["bottom", "top"] : ["bottom", "left", "top", "right"];
}

function makeStriker(player, mode) {
  const side = sideForPlayer(player, mode);
  const base = { r: STRIKER_R, vx: 0, vy: 0, active: true, side };
  if (side === "bottom") return { ...base, x: CENTER, y: PMAX - BASE_OFFSET };
  if (side === "top") return { ...base, x: CENTER, y: PMIN + BASE_OFFSET };
  if (side === "left") return { ...base, x: PMIN + BASE_OFFSET, y: CENTER };
  return { ...base, x: PMAX - BASE_OFFSET, y: CENTER };
}

function colorForPlayer(player) {
  return player % 2 === 1 ? "white" : "black";
}

function playerLabel(player, mode) {
  const color = colorForPlayer(player) === "white" ? "Ivory" : "Ebony";
  if (mode === "2p") return `Player ${player} (${color})`;
  const side = sideForPlayer(player, mode);
  return `Player ${player} (${color}, ${side})`;
}

const COIN_FILL = { white: "#F5EFE0", black: "#2A2622", queen: "#C0392B" };
const COIN_STROKE = { white: "#B9AE8F", black: "#0F0D0C", queen: "#7A2015" };

function initialScores(numPlayers) {
  const s = {};
  for (let p = 1; p <= numPlayers; p++) s[p] = 0;
  return s;
}

// ---------- online multiplayer storage helpers (artifact shared storage) ----------
function roomKey(code, suffix) { return `carom_room_${code}_${suffix}`; }
function genRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
async function storageGet(key) {
  try {
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : null;
  } catch (e) { console.log("[carrom-sync] storageGet failed for", key, e); return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); return true; }
  catch (e) { console.error("[carrom-sync] storageSet failed for", key, e); return false; }
}

export default function CaromPlayerPage({ gameData, sessionToken, onComplete }) {
  const [view, setView] = useState("menu");
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const lastCollisionSoundRef = useRef(0);
  const lastWallSoundRef = useRef(0);

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

  function playShootSound() { playTone(150, 0.18, "triangle", 0.22); }
  function playWallSound() {
    const now = performance.now();
    if (now - lastWallSoundRef.current < 60) return;
    lastWallSoundRef.current = now;
    playTone(240, 0.06, "triangle", 0.06);
  }
  function playCollisionSound(strength) {
    const now = performance.now();
    if (now - lastCollisionSoundRef.current < 35) return;
    lastCollisionSoundRef.current = now;
    const vol = Math.min(0.05 + strength * 0.03, 0.22);
    playTone(650, 0.05, "square", vol);
  }
  function playPocketSound() {
    playTone(320, 0.22, "sine", 0.2);
    setTimeout(() => playTone(210, 0.22, "sine", 0.16), 70);
  }
  function playWinSound() {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, "sine", 0.18), i * 140);
    });
  }

  const stateRef = useRef({
    mode: "2p",
    numPlayers: 2,
    coins: makeInitialCoins(),
    striker: makeStriker(1, "2p"),
    phase: "position",
    dragStart: null,
    dragCurrent: null,
    currentPlayer: 1,
  });

  const [ui, setUi] = useState({
    mode: "2p",
    numPlayers: 2,
    currentPlayer: 1,
    scores: initialScores(2),
    covered: initialScores(2),
    message: "Player 1 (Ivory) — drag the striker into position, then release to aim",
    phase: "position",
    winner: null,
    remaining: { white: 9, black: 9, queen: true },
  });

  const [topMode, setTopMode] = useState("local");
  const [onlineStage, setOnlineStage] = useState("choice");
  const [roomCode, setRoomCode] = useState(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [myPlayer, setMyPlayer] = useState(null);
  const [oppLive, setOppLive] = useState(false);
  const [syncDebug, setSyncDebug] = useState({ pushed: 0, applied: 0, lastPollAt: 0, lastPollOk: null, note: "idle" });

  const modeRef = useRef("local");
  const myPlayerRef = useRef(null);
  const roomCodeRef = useRef(null);
  const pollRef = useRef(null);
  const lobbyPollRef = useRef(null);
  const lastSeenSeqRef = useRef(0);
  const lastPushRef = useRef(0);

  const resetGame = useCallback((mode) => {
    const numPlayers = mode === "2p" ? 2 : 4;
    stateRef.current = {
      mode,
      numPlayers,
      coins: makeInitialCoins(),
      striker: makeStriker(1, mode),
      phase: "position",
      dragStart: null,
      dragCurrent: null,
      currentPlayer: 1,
    };
    setUi({
      mode,
      numPlayers,
      currentPlayer: 1,
      scores: initialScores(numPlayers),
      covered: initialScores(numPlayers),
      message: `${playerLabel(1, mode)} — drag the striker into position, then release to aim`,
      phase: "position",
      winner: null,
      remaining: { white: 9, black: 9, queen: true },
    });
  }, []);

  function changeMode(mode) {
    if (mode === stateRef.current.mode) return;
    resetGame(mode);
  }

  function isMyTurn() {
    if (modeRef.current !== "online") return true;
    return stateRef.current.currentPlayer === myPlayerRef.current;
  }

  /* ---------------- online: push/pull state ---------------- */
  function pushStateSnapshot(uiExtra) {
    if (modeRef.current !== "online" || !roomCodeRef.current) return;
    const st = stateRef.current;
    const seq = lastSeenSeqRef.current + 1;
    lastSeenSeqRef.current = seq;
    console.log("[carrom-sync] PUSH", { seq, currentPlayer: st.currentPlayer, phase: st.phase, room: roomCodeRef.current });
    setSyncDebug((d) => ({ ...d, pushed: seq }));
    storageSet(roomKey(roomCodeRef.current, "state"), {
      coins: st.coins, striker: st.striker, phase: st.phase, currentPlayer: st.currentPlayer,
      mode: st.mode, numPlayers: st.numPlayers,
      ...uiExtra,
      seq, ts: Date.now(),
    });
  }

  function applyRemote(fetched) {
    const st = stateRef.current;
    st.coins = fetched.coins;
    st.striker = fetched.striker;
    st.phase = fetched.phase;
    st.currentPlayer = fetched.currentPlayer;
    st.mode = fetched.mode;
    st.numPlayers = fetched.numPlayers;
    st.dragStart = null;
    st.dragCurrent = null;
    lastSeenSeqRef.current = fetched.seq || lastSeenSeqRef.current;
    console.log("[carrom-sync] APPLY", { seq: fetched.seq, currentPlayer: fetched.currentPlayer, phase: fetched.phase });
    setSyncDebug((d) => ({ ...d, applied: fetched.seq || d.applied }));
    if (fetched.scores) {
      setUi({
        mode: fetched.mode, numPlayers: fetched.numPlayers, currentPlayer: fetched.currentPlayer,
        scores: fetched.scores, covered: fetched.covered, message: fetched.message,
        phase: fetched.phase, winner: fetched.winner || null, remaining: fetched.remaining,
      });
    } else {
      setUi((u) => ({ ...u, currentPlayer: fetched.currentPlayer, phase: fetched.phase }));
    }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!roomCodeRef.current) return;
      const fetched = await storageGet(roomKey(roomCodeRef.current, "state"));
      if (!fetched) {
        console.log("[carrom-sync] POLL: no data returned from storage.get");
        setSyncDebug((d) => ({ ...d, lastPollAt: Date.now(), lastPollOk: false, note: "fetch returned nothing" }));
        return;
      }
      setOppLive(Date.now() - (fetched.ts || 0) < 4000);

      const st = stateRef.current;
      const iAmActivelyShooting = st.phase === "shooting" && st.currentPlayer === myPlayerRef.current;
      if (iAmActivelyShooting) {
        setSyncDebug((d) => ({ ...d, lastPollAt: Date.now(), lastPollOk: true, note: "skipped: I'm shooting" }));
        return;
      }

      const isNewer = fetched.seq && fetched.seq > lastSeenSeqRef.current;
      const disagreesWithRoom =
        fetched.currentPlayer !== st.currentPlayer || fetched.phase !== st.phase;

      if (isNewer || disagreesWithRoom) {
        applyRemote(fetched);
        setSyncDebug((d) => ({ ...d, lastPollAt: Date.now(), lastPollOk: true, note: "applied" }));
      } else {
        setSyncDebug((d) => ({ ...d, lastPollAt: Date.now(), lastPollOk: true, note: "no change (up to date)" }));
      }
    }, 300);
  }
  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  /* ---------------- online: lobby flow ---------------- */
  function beginCreateRoom() {
    const code = genRoomCode();
    setRoomCode(code);
    roomCodeRef.current = code;
    modeRef.current = "online";
    setTopMode("online");
    storageSet(roomKey(code, "lobby"), { hostPresent: true, guestPresent: false, status: "waiting" });
    setOnlineStage("hostWait");
    lobbyPollRef.current = setInterval(async () => {
      const lobby = await storageGet(roomKey(code, "lobby"));
      if (lobby && lobby.guestPresent) {
        clearInterval(lobbyPollRef.current);
        lobbyPollRef.current = null;
        myPlayerRef.current = 1;
        setMyPlayer(1);
        resetGame("2p");
        const scores = initialScores(2), covered = initialScores(2);
        const remaining = { white: 9, black: 9, queen: true };
        const message = `${playerLabel(1, "2p")} — drag the striker into position, then release to aim`;
        pushStateSnapshot({ scores, covered, remaining, message, winner: null });
        lobby.status = "playing";
        await storageSet(roomKey(code, "lobby"), lobby);
        setOnlineStage("connected");
        startPolling();
      }
    }, 900);
  }

  function beginJoinRoom() {
    const code = joinInput.trim().toUpperCase();
    setJoinErr("");
    if (code.length < 4) { setJoinErr("Enter the room code your friend shared."); return; }
    (async () => {
      const lobby = await storageGet(roomKey(code, "lobby"));
      if (!lobby) { setJoinErr("Room not found. Check the code and try again."); return; }
      setRoomCode(code);
      roomCodeRef.current = code;
      modeRef.current = "online";
      lobby.guestPresent = true;
      await storageSet(roomKey(code, "lobby"), lobby);
      setOnlineStage("guestWait");
      lobbyPollRef.current = setInterval(async () => {
        const fetched = await storageGet(roomKey(code, "state"));
        if (fetched) {
          clearInterval(lobbyPollRef.current);
          lobbyPollRef.current = null;
          myPlayerRef.current = 2;
          setMyPlayer(2);
          applyRemote(fetched);
          setOnlineStage("connected");
          startPolling();
        }
      }, 900);
    })();
  }

  function cancelLobby() {
    if (lobbyPollRef.current) { clearInterval(lobbyPollRef.current); lobbyPollRef.current = null; }
    roomCodeRef.current = null;
    setRoomCode(null);
    setOnlineStage("choice");
  }

  function launchPassAndPlay() {
    setTopMode("local");
    resetGame("2p");
    setView("game");
  }

  function launchOnline() {
    setTopMode("online");
    setOnlineStage("choice");
    setView("game");
  }

  function returnToMenu() {
    if (modeRef.current === "online") leaveOnlineGame();
    else { stopPolling(); setTopMode("local"); }
    setView("menu");
  }

  function leaveOnlineGame() {
    stopPolling();
    if (lobbyPollRef.current) { clearInterval(lobbyPollRef.current); lobbyPollRef.current = null; }
    roomCodeRef.current = null;
    myPlayerRef.current = null;
    modeRef.current = "local";
    lastSeenSeqRef.current = 0;
    setRoomCode(null);
    setMyPlayer(null);
    setOnlineStage("choice");
    setTopMode("local");
    resetGame("2p");
  }

  // ---------- physics ----------
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
          const strength = 0.03 * (1 - dd / POCKET_MAGNET_R) + 0.012;
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
          playPocketSound();
        }
      }
    }

    for (const o of objs) {
      if (!o.active) continue;
      const nearPocket = POCKETS.some((p) => Math.hypot(o.x - p.x, o.y - p.y) < POCKET_MAGNET_R);
      if (nearPocket) continue;
      const preSp = Math.hypot(o.vx, o.vy);
      let bounced = false;
      if (o.x - o.r < PMIN) { o.x = PMIN + o.r; o.vx = -o.vx * WALL_REST; bounced = true; }
      if (o.x + o.r > PMAX) { o.x = PMAX - o.r; o.vx = -o.vx * WALL_REST; bounced = true; }
      if (o.y - o.r < PMIN) { o.y = PMIN + o.r; o.vy = -o.vy * WALL_REST; bounced = true; }
      if (o.y + o.r > PMAX) { o.y = PMAX - o.r; o.vy = -o.vy * WALL_REST; bounced = true; }
      if (bounced && preSp > 0.4) playWallSound();
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
          if (rel > 0.25) playCollisionSound(rel);
          if (rel > 0) {
            a.vx -= rel * nx * COLL_REST;
            a.vy -= rel * ny * COLL_REST;
            b.vx += rel * nx * COLL_REST;
            b.vy += rel * ny * COLL_REST;
          }
          anyMoving = true;
        }
      }
    }

    return anyMoving;
  }

  function resolveTurn() {
    const st = stateRef.current;
    const player = st.currentPlayer;
    const mode = st.mode;
    const numPlayers = st.numPlayers;

    const pocketedWhite = st.coins.filter((c) => c.color === "white" && c.pocketedThisTurn).length;
    const pocketedBlack = st.coins.filter((c) => c.color === "black" && c.pocketedThisTurn).length;
    const queen = st.coins.find((c) => c.color === "queen");
    const queenPocketedNow = queen.pocketedThisTurn;
    const strikerFoul = !st.striker.active;

    const myColor = colorForPlayer(player);
    const oppColor = myColor === "white" ? "black" : "white";
    const mine = myColor === "white" ? pocketedWhite : pocketedBlack;
    const theirs = oppColor === "white" ? pocketedWhite : pocketedBlack;

    let gained = mine;
    let goesAgain = mine > 0 && !strikerFoul;
    let msgParts = [];

    if (mine > 0) msgParts.push(`pocketed ${mine} own coin${mine > 1 ? "s" : ""}`);
    if (theirs > 0) msgParts.push(`sent ${theirs} opponent coin${theirs > 1 ? "s" : ""} off`);

    const scores = { ...ui.scores };
    const covered = { ...ui.covered };

    if (queenPocketedNow) {
      if (mine > 0) {
        gained += 3;
        covered[player] += 1;
        msgParts.push("covered the queen (+3)");
      } else {
        queen.active = true;
        queen.x = CENTER;
        queen.y = CENTER;
        let tries = 0;
        while (tries < 40 && st.coins.some((c) => c.active && c.id !== queen.id && dist(c, queen) < c.r + queen.r + 2)) {
          queen.x = CENTER + (Math.random() - 0.5) * 40;
          queen.y = CENTER + (Math.random() - 0.5) * 40;
          tries++;
        }
        msgParts.push("pocketed the queen but didn't cover it — returned to center");
      }
    }

    if (strikerFoul) {
      goesAgain = false;
      msgParts.push("foul: striker pocketed");
      st.striker.active = true;
    }

    scores[player] = (scores[player] || 0) + gained;

    st.coins.forEach((c) => { c.pocketedThisTurn = false; });

    const whiteLeft = st.coins.filter((c) => c.color === "white" && c.active).length;
    const blackLeft = st.coins.filter((c) => c.color === "black" && c.active).length;
    const queenLeft = queen.active;

    let winner = null;
    if (whiteLeft === 0 && blackLeft === 0) {
      const entries = Object.entries(scores).map(([p, s]) => ({ p: Number(p), s }));
      entries.sort((a, b) => b.s - a.s);
      const top = entries[0].s;
      const tied = entries.filter((e) => e.s === top);
      winner = tied.length > 1
        ? "Draw between " + tied.map((e) => playerLabel(e.p, mode)).join(" & ")
        : playerLabel(tied[0].p, mode);
      playWinSound();
    }

    const nextPlayer = goesAgain && !winner ? player : (player % numPlayers) + 1;
    st.currentPlayer = nextPlayer;
    st.striker = makeStriker(nextPlayer, mode);
    st.phase = winner ? "gameover" : "position";
    st.dragStart = null;
    st.dragCurrent = null;

    const baseMsg = msgParts.length ? msgParts.join(", ") + "." : "no coin pocketed, turn passes.";
    const nextName = playerLabel(nextPlayer, mode);
    const message = winner
      ? `Game over — ${winner} wins!`
      : `${baseMsg} ${goesAgain ? "Same player continues" : `${nextName}'s turn`} — drag the striker, then release to aim.`;

    const remaining = { white: whiteLeft, black: blackLeft, queen: queenLeft };

    setUi({
      mode,
      numPlayers,
      currentPlayer: nextPlayer,
      scores,
      covered,
      message,
      phase: st.phase,
      winner,
      remaining,
    });

    if (modeRef.current === "online") {
      pushStateSnapshot({ scores, covered, remaining, message, winner });
    }

    // Notify parent if game completed
    if (winner && onComplete) {
      onComplete({ winner, scores, remaining });
    }
  }

  // ---------- animation loop ----------
  useEffect(() => {
    function loop() {
      const st = stateRef.current;
      if (st.phase === "shooting" && isMyTurn()) {
        const moving = stepPhysics();
        if (modeRef.current === "online" && Date.now() - lastPushRef.current > 180) {
          lastPushRef.current = Date.now();
          pushStateSnapshot({ scores: ui.scores, covered: ui.covered, remaining: ui.remaining, message: "Shot in progress…", winner: null });
        }
        if (!moving) {
          resolveTurn();
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.scores, ui.covered]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (lobbyPollRef.current) clearInterval(lobbyPollRef.current);
    };
  }, []);

  // ---------- drawing ----------
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawArrowHead(ctx, x, y, angle, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size * 0.55);
    ctx.lineTo(-size, -size * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function cornerArcAngles(p) {
    if (p.x === PMIN && p.y === PMIN) return [0, Math.PI / 2];
    if (p.x === PMAX && p.y === PMIN) return [Math.PI / 2, Math.PI];
    if (p.x === PMAX && p.y === PMAX) return [Math.PI, 1.5 * Math.PI];
    return [1.5 * Math.PI, 2 * Math.PI];
  }

  function drawBaseline(ctx, side) {
    ctx.strokeStyle = "rgba(122,60,30,0.6)";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(122,60,30,0.6)";
    if (side === "bottom" || side === "top") {
      const y = side === "bottom" ? PMAX - BASE_OFFSET : PMIN + BASE_OFFSET;
      ctx.beginPath();
      ctx.moveTo(PMIN + EDGE_MARGIN, y);
      ctx.lineTo(PMAX - EDGE_MARGIN, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(PMIN + EDGE_MARGIN, y, 4, 0, Math.PI * 2);
      ctx.arc(PMAX - EDGE_MARGIN, y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const x = side === "left" ? PMIN + BASE_OFFSET : PMAX - BASE_OFFSET;
      ctx.beginPath();
      ctx.moveTo(x, PMIN + EDGE_MARGIN);
      ctx.lineTo(x, PMAX - EDGE_MARGIN);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, PMIN + EDGE_MARGIN, 4, 0, Math.PI * 2);
      ctx.arc(x, PMAX - EDGE_MARGIN, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const COIN_RIM = { white: "#d9c9a0", black: "#1c1917", queen: "#6e160f" };
  const COIN_FACE_TOP = { white: "#fdfaf2", black: "#4a4540", queen: "#e6503f" };
  const COIN_FACE_BOTTOM = { white: "#d6c7a3", black: "#0b0908", queen: "#7f180f" };

  function drawCoin(ctx, c) {
    ctx.beginPath();
    ctx.ellipse(c.x + 1.5, c.y + 2.5, c.r * 0.96, c.r * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,12,6,0.35)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = COIN_RIM[c.color];
    ctx.fill();

    const faceR = c.r * 0.8;
    const g = ctx.createRadialGradient(c.x - c.r * 0.32, c.y - c.r * 0.35, faceR * 0.1, c.x, c.y, faceR);
    g.addColorStop(0, COIN_FACE_TOP[c.color]);
    g.addColorStop(1, COIN_FACE_BOTTOM[c.color]);
    ctx.beginPath();
    ctx.arc(c.x, c.y, faceR, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(c.x - c.r * 0.32, c.y - c.r * 0.38, c.r * 0.32, c.r * 0.18, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = c.color === "black" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.55)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = COIN_STROKE[c.color];
    ctx.stroke();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const st = stateRef.current;
    const boardX = 6, boardY = 6, boardW = SIZE - 12, boardH = SIZE - 12;

    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.save();
    roundRectPath(ctx, boardX, boardY, boardW, boardH, 30);
    ctx.clip();

    const woodGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    woodGrad.addColorStop(0, "#EFC8AE");
    woodGrad.addColorStop(0.55, "#E3B79A");
    woodGrad.addColorStop(1, "#D2A183");
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = "rgba(110,62,42,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 22; i++) {
      const yy = i * (SIZE / 22);
      ctx.beginPath();
      ctx.moveTo(0, yy + Math.sin(i * 1.3) * 3);
      ctx.lineTo(SIZE, yy + Math.cos(i * 0.7) * 3);
      ctx.stroke();
    }

    const LINE = "rgba(94,55,38,0.62)";

    roundRectPath(ctx, PMIN, PMIN, PMAX - PMIN, PMAX - PMIN, 6);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    POCKETS.forEach((p) => {
      const dx = p.x === PMIN ? 1 : -1;
      const dy = p.y === PMIN ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(p.x + dx * 62, p.y);
      ctx.lineTo(p.x, p.y + dy * 62);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 4, 0, Math.PI * 2);
    ctx.fillStyle = LINE;
    ctx.fill();

    sidesForMode(st.mode).forEach((side) => drawBaseline(ctx, side));

    ctx.restore();

    POCKETS.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80,46,32,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
      ctx.fillStyle = "#161311";
      ctx.fill();
      ctx.strokeStyle = "#0a0908";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    st.coins.forEach((c) => {
      if (!c.active) return;
      drawCoin(ctx, c);
    });

    if (st.striker.active) {
      const s = st.striker;
      const g = ctx.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.1, s.x, s.y, s.r);
      g.addColorStop(0, "#fff6e0");
      g.addColorStop(1, "#e8c793");
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#8A6416";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = "#C0392B";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "#C0392B";
      ctx.fill();
    }

    if (st.phase === "aiming" && st.dragStart && st.dragCurrent) {
      const dx = st.dragCurrent.x - st.dragStart.x;
      const dy = st.dragCurrent.y - st.dragStart.y;
      const len = Math.min(Math.hypot(dx, dy), MAX_PULL);
      const ang = Math.atan2(dy, dx);
      const pullX = st.striker.x + Math.cos(ang) * len;
      const pullY = st.striker.y + Math.sin(ang) * len;
      const shotX = st.striker.x - Math.cos(ang) * len * ARROW_LENGTH_MULT;
      const shotY = st.striker.y - Math.sin(ang) * len * ARROW_LENGTH_MULT;

      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "#B32A2A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.striker.x, st.striker.y);
      ctx.lineTo(shotX, shotY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawArrowHead(ctx, shotX, shotY, ang + Math.PI, 9, "#B32A2A");

      ctx.strokeStyle = "#333";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(st.striker.x, st.striker.y);
      ctx.lineTo(pullX, pullY);
      ctx.stroke();

      const power = Math.min(len / MAX_PULL, 1);
      ctx.fillStyle = `rgba(179,42,42,${0.3 + power * 0.5})`;
      ctx.beginPath();
      ctx.arc(pullX, pullY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- pointer handling ----------
  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function handleDown(e) {
    const st = stateRef.current;
    if (st.phase === "gameover") return;
    if (modeRef.current === "online" && !isMyTurn()) return;
    const pos = getPos(e);
    if (st.phase === "position") {
      st.dragStart = pos;
    } else if (st.phase === "aiming") {
      st.dragStart = { x: st.striker.x, y: st.striker.y };
      st.dragCurrent = pos;
    }
  }

  function handleMove(e) {
    const st = stateRef.current;
    if (!st.dragStart) return;
    if (modeRef.current === "online" && !isMyTurn()) return;
    const pos = getPos(e);
    if (st.phase === "position") {
      const minC = PMIN + EDGE_MARGIN;
      const maxC = PMAX - EDGE_MARGIN;
      if (st.striker.side === "bottom" || st.striker.side === "top") {
        st.striker.x = Math.max(minC, Math.min(maxC, pos.x));
      } else {
        st.striker.y = Math.max(minC, Math.min(maxC, pos.y));
      }
    } else if (st.phase === "aiming") {
      st.dragCurrent = pos;
    }
  }

  function handleUp() {
    const st = stateRef.current;
    if (modeRef.current === "online" && !isMyTurn()) return;
    if (st.phase === "position") {
      st.dragStart = null;
      lockAndAim();
    } else if (st.phase === "aiming" && st.dragStart && st.dragCurrent) {
      const dx = st.dragCurrent.x - st.striker.x;
      const dy = st.dragCurrent.y - st.striker.y;
      const len = Math.min(Math.hypot(dx, dy), MAX_PULL);
      if (len > 6) {
        const ang = Math.atan2(dy, dx);
        st.striker.vx = -Math.cos(ang) * len * POWER_SCALE;
        st.striker.vy = -Math.sin(ang) * len * POWER_SCALE;
        st.phase = "shooting";
        playShootSound();
        setUi((u) => ({ ...u, phase: "shooting", message: "Shot in progress…" }));
        if (modeRef.current === "online") {
          pushStateSnapshot({ scores: ui.scores, covered: ui.covered, remaining: ui.remaining, message: "Shot in progress…", winner: null });
        }
      }
      st.dragStart = null;
      st.dragCurrent = null;
    }
  }

  function lockAndAim() {
    const st = stateRef.current;
    if (st.phase !== "position") return;
    if (modeRef.current === "online" && !isMyTurn()) return;
    st.phase = "aiming";
    setUi((u) => ({ ...u, phase: "aiming", message: "Drag away from the striker, then release to shoot" }));
    if (modeRef.current === "online") {
      pushStateSnapshot({ scores: ui.scores, covered: ui.covered, remaining: ui.remaining, message: "Drag away from the striker, then release to shoot", winner: null });
    }
  }

  function backToPosition() {
    const st = stateRef.current;
    if (st.phase !== "aiming") return;
    if (modeRef.current === "online" && !isMyTurn()) return;
    st.phase = "position";
    st.dragStart = null;
    st.dragCurrent = null;
    setUi((u) => ({ ...u, phase: "position", message: "Reposition the striker, then release to aim" }));
    if (modeRef.current === "online") {
      pushStateSnapshot({ scores: ui.scores, covered: ui.covered, remaining: ui.remaining, message: "Reposition the striker, then release to aim", winner: null });
    }
  }

  const [comingSoon, setComingSoon] = useState(null);
  function flashComingSoon(label) {
    setComingSoon(label);
    setTimeout(() => setComingSoon(null), 1600);
  }

  const playersList = Array.from({ length: ui.numPlayers }, (_, i) => i + 1);
  const online = topMode === "online" && onlineStage === "connected";
  const myTurnNow = !online || ui.currentPlayer === myPlayer;

  if (view === "menu") {
    const modeCards = [
      { key: "online", label: "ONLINE\nMULTIPLAYER", players: "736", icon: "🌐🌐", onClick: launchOnline },
      { key: "trick", label: "TRICK SHOTS", players: "4082", icon: "🎯", onClick: () => flashComingSoon("Trick Shots") },
      { key: "vsbot", label: "VS\nCOMPUTER", players: "4597", icon: "🤖", onClick: () => flashComingSoon("VS Computer") },
      { key: "pass", label: "PASS AND\nPLAY", players: "5313", icon: "👥", onClick: launchPassAndPlay },
    ];
    return (
      <div className="carrom-menu w-full max-w-sm mx-auto rounded-3xl overflow-hidden relative select-none">
        <style>{`
          .carrom-menu{
            font-family: 'Segoe UI', Arial, sans-serif;
            background:
              radial-gradient(circle at 15% 6%, rgba(255,255,255,0.12) 0%, transparent 2.5%),
              radial-gradient(circle at 78% 38%, rgba(0,0,0,0.22) 0%, transparent 3%),
              radial-gradient(circle at 42% 70%, rgba(0,0,0,0.16) 0%, transparent 2.2%),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 86px),
              repeating-linear-gradient(0deg, rgba(255,214,150,0.045) 0px, rgba(255,214,150,0.045) 1px, transparent 1px, transparent 4px),
              radial-gradient(ellipse at 22% 0%, rgba(255,196,120,0.22) 0%, transparent 55%),
              radial-gradient(ellipse at 88% 100%, rgba(0,0,0,0.5) 0%, transparent 55%),
              linear-gradient(150deg, #a9773c 0%, #8a5a2e 26%, #6b3d1a 55%, #3c1e0d 100%);
            min-height: 620px;
            box-shadow: inset 0 0 90px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.5);
          }
          .cm-title{
            font-family: 'Arial Black', Arial, sans-serif;
            font-weight: 900;
            font-style: italic;
            letter-spacing: 1px;
            background: linear-gradient(180deg, #fff6c9 0%, #ffd23d 35%, #e8a012 65%, #ffdf70 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            text-shadow: 0 4px 0 rgba(0,0,0,0.35);
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));
          }
          .cm-card{
            background: linear-gradient(180deg, rgba(214,138,46,0.1) 0%, rgba(168,95,20,0.1) 45%, rgba(122,63,12,0.1) 100%);
            border: 2px solid #ffce6b;
            box-shadow: 0 6px 0 rgba(0,0,0,0.35), inset 0 2px 3px rgba(255,255,255,0.35), 0 8px 18px rgba(0,0,0,0.4);
            transition: transform .12s ease;
          }
          .cm-card:active{ transform: translateY(2px) scale(0.98); }
          .cm-icon-badge{
            background: linear-gradient(180deg,#3a2010,#1c0f06);
            border: 2px solid #ffce6b;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
          }
          .cm-navbtn{
            background: linear-gradient(180deg, #8a5222, #5c320f);
            border: 1px solid #ffce6b55;
          }
        `}</style>

        <div className="flex items-center justify-between px-3 pt-3">
          <button
            className="w-9 h-9 rounded-full cm-icon-badge flex items-center justify-center text-amber-200 text-sm"
            onClick={() => flashComingSoon("Back")}
          >
            ◀
          </button>
          <div className="flex-1 mx-2 flex items-center gap-2 bg-black/30 border border-amber-700/50 rounded-full px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center text-xs">🙂</div>
            <span className="text-amber-100 text-xs font-semibold flex-1">Guest8228</span>
            <span className="text-amber-300 text-xs">🪙</span>
            <span className="text-amber-200 text-xs font-bold pr-1">46,420</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[10px] flex items-center justify-center text-amber-950 font-bold">+</span>
          </div>
          <button className="w-9 h-9 rounded-full cm-icon-badge flex items-center justify-center text-amber-200 text-sm">⚙️</button>
        </div>

        <div className="text-center mt-5 mb-6 relative">
          <div className="cm-title text-5xl leading-none">CARROM</div>
          <div className="flex items-center justify-center gap-1 -mt-1">
            <span className="text-amber-300 text-lg">👑</span>
            <span className="cm-title text-2xl">KING</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4">
          {modeCards.map((m) => (
            <button
              key={m.key}
              onClick={m.onClick}
              className="cm-card rounded-2xl px-2 py-3 flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-xl cm-icon-badge flex items-center justify-center text-2xl">
                {m.icon}
              </div>
              <div className="text-amber-50 font-extrabold text-[13px] leading-tight text-center whitespace-pre-line drop-shadow">
                {m.label}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-lime-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block" />
                Players: {m.players}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 mt-6">
          <button onClick={() => flashComingSoon("Daily Gift")} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-amber-300 flex items-center justify-center text-lg shadow-lg">🎁</div>
          </button>
          <button onClick={() => flashComingSoon("Spin & Win")} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-amber-100 flex items-center justify-center text-lg shadow-lg">🪙</div>
          </button>
        </div>

        {comingSoon && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-24 bg-black/80 text-amber-200 text-xs font-semibold px-4 py-2 rounded-full">
            {comingSoon === "Back" ? "Nothing to go back to yet" : `${comingSoon} — coming soon!`}
          </div>
        )}

        <div className="grid grid-cols-4 mt-8 border-t border-amber-900/60">
          {[
            { icon: "🏠", label: "Home" },
            { icon: "🔗", label: "Like" },
            { icon: "⭐", label: "Rate" },
            { icon: "🎮", label: "More Games" },
          ].map((n) => (
            <button key={n.label} onClick={() => flashComingSoon(n.label)} className="cm-navbtn py-3 flex flex-col items-center gap-1 text-amber-100">
              <span className="text-base">{n.icon}</span>
              <span className="text-[9px] font-semibold">{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="carrom-game w-full max-w-sm mx-auto rounded-3xl relative select-none flex flex-col items-center gap-4 p-4">
      <style>{`
        .carrom-game{
          font-family: 'Segoe UI', Arial, sans-serif;
          background:
            radial-gradient(ellipse at 50% -10%, rgba(70,110,190,0.28) 0%, transparent 42%),
            radial-gradient(circle at 12% 8%, rgba(255,255,255,0.05) 0%, transparent 2%),
            radial-gradient(circle at 85% 20%, rgba(255,255,255,0.04) 0%, transparent 2%),
            radial-gradient(circle at 30% 85%, rgba(255,255,255,0.03) 0%, transparent 2%),
            linear-gradient(160deg, #16294a 0%, #0e1c36 35%, #0a1528 65%, #060d1c 100%);
          min-height: 620px;
          box-shadow: inset 0 0 100px rgba(0,0,0,0.55), 0 20px 50px rgba(0,0,0,0.55);
        }
        .cg-title{
          font-family: 'Arial Black', Arial, sans-serif;
          font-weight: 900; font-style: italic; letter-spacing: 1px;
          background: linear-gradient(180deg, #fff6c9 0%, #ffd23d 35%, #e8a012 65%, #ffdf70 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          text-shadow: 0 4px 0 rgba(0,0,0,0.4);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.55));
        }
        .cg-flourish{
          color: #d9a63f;
          opacity: 0.85;
        }
        .cg-icon-badge{
          background: linear-gradient(180deg,#1a2b4d,#0b1526);
          border: 2px solid #f0c14b;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.4);
        }
        .cg-scorecard{
          border-radius: 16px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 150px;
          border: 2px solid transparent;
          transition: all .2s ease;
        }
        .cg-scorecard.ivory{
          background: linear-gradient(180deg, #f6ecd2, #ecdcae);
          border-color: #d8b96e;
          box-shadow: 0 5px 0 rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.6);
        }
        .cg-scorecard.ebony{
          background: linear-gradient(180deg, #1c2c4a, #101b30);
          border-color: #3a5079;
          box-shadow: 0 5px 0 rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.06);
        }
        .cg-scorecard.active.ivory{ border-color: #f0c14b; box-shadow: 0 5px 0 rgba(0,0,0,0.3), 0 0 0 2px rgba(240,193,75,0.35); }
        .cg-scorecard.active.ebony{ border-color: #f0c14b; box-shadow: 0 5px 0 rgba(0,0,0,0.4), 0 0 0 2px rgba(240,193,75,0.3); }
        .cg-avatar{
          width: 30px; height: 30px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff;
          flex-shrink: 0;
        }
        .cg-avatar.ivory-a{ background: #c0392b; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .cg-avatar.ebony-a{ background: #14181f; border: 2px solid #445; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .cg-pname{ font-size: 10px; font-weight: 800; letter-spacing: 0.4px; line-height: 1.15; }
        .cg-scorecard.ivory .cg-pname{ color: #3a2a10; }
        .cg-scorecard.ebony .cg-pname{ color: #cfe0ff; }
        .cg-pteam{ font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
        .cg-scorecard.ivory .cg-pteam{ color: #8a6b2c; }
        .cg-scorecard.ebony .cg-pteam{ color: #7d93bd; }
        .cg-score{ font-size: 26px; font-weight: 800; margin-left: auto; }
        .cg-scorecard.ivory .cg-score{ color: #c0392b; }
        .cg-scorecard.ebony .cg-score{ color: #f2f5fb; }
        .cg-message{
          width: 100%;
          background: linear-gradient(180deg, rgba(22,40,72,0.85), rgba(10,20,40,0.85));
          border: 1.5px solid rgba(240,193,75,0.35);
          border-radius: 999px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 16px rgba(0,0,0,0.3);
        }
        .cg-message-text{
          font-size: 13px; line-height: 1.5; color: #d9e4f5; text-align: center; flex: 1;
        }
        .cg-message-text b{ color: #f0c14b; font-weight: 800; }
        .cg-target{ flex-shrink: 0; color: #f0c14b; }
        .cg-dots{ flex-shrink: 0; display: flex; flex-direction: column; gap: 3px; opacity: 0.5; }
        .cg-dots span{ width: 3px; height: 3px; border-radius: 999px; background: #f0c14b; display:block; }
        .cg-board-frame{
          background: linear-gradient(160deg, #E3B79A 0%, #D2A183 100%);
          border: 2px solid rgba(80,46,32,0.4);
          box-shadow: 0 6px 0 rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.25), 0 14px 30px rgba(0,0,0,0.5);
        }
        .cg-infobar{
          width: 100%;
          background: linear-gradient(180deg, rgba(22,40,72,0.85), rgba(10,20,40,0.85));
          border: 1.5px solid rgba(240,193,75,0.25);
          border-radius: 16px;
          padding: 10px 8px;
          display: flex;
          justify-content: space-around;
        }
        .cg-info-item{ display:flex; flex-direction:column; align-items:center; gap:4px; }
        .cg-info-label{ font-size: 9px; letter-spacing: 0.6px; color: #93a7cc; font-weight: 700; display:flex; align-items:center; gap:5px; }
        .cg-info-value{ font-size: 16px; font-weight: 800; color: #eef3fb; }
        .cg-dot{ width: 12px; height: 12px; border-radius: 999px; display:inline-block; }
        .cg-dot.w{ background: radial-gradient(circle at 35% 30%, #fffdf6, #d8c79b); border: 1px solid #b9ab82; }
        .cg-dot.b{ background: radial-gradient(circle at 35% 30%, #4b4640, #0d0c0b); border: 1px solid #000; }
        .cg-dot.q{ background: radial-gradient(circle at 35% 30%, #e6503f, #7f180f); border: 1px solid #4a0f09; }
        .cg-panel{
          background: linear-gradient(180deg, rgba(22,40,72,0.6), rgba(10,20,40,0.6));
          border: 1.5px solid rgba(240,193,75,0.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.35);
        }
        .cg-btn-primary{
          background: linear-gradient(180deg, #ffe28a, #e8a012 55%, #b96e0c);
          border: 2px solid #ffe9ad; color:#3a1e00;
          box-shadow: 0 5px 0 rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.6);
        }
        .cg-btn-outline{
          background: transparent; border: 2px solid rgba(240,193,75,0.5); color:#f0c14b;
        }
        .cg-btn-secondary{
          background: linear-gradient(180deg, #24314f, #131c30);
          border: 2px solid rgba(240,193,75,0.4); color:#f0c14b;
        }
        .cg-input{
          background: rgba(0,0,0,0.35); border: 2px solid rgba(240,193,75,0.5); color:#f0c14b;
        }
        .cg-input::placeholder{ color:#5f7196; }
        .cg-online-tag{ font-size: 11px; font-weight: 600; color: #b9c8e6; }
      `}</style>

      <div className="w-full flex items-center justify-center relative pt-1">
        <button
          onClick={returnToMenu}
          className="absolute left-0 w-9 h-9 rounded-full cg-icon-badge flex items-center justify-center text-amber-200 text-sm"
          title="Back to menu"
        >
          ◀
        </button>
        <div className="text-center">
          <div className="cg-flourish text-xs mb-0.5">✦ ─────── ✦</div>
          <h2 className="cg-title text-3xl">CARROM BOARD</h2>
          <div className="cg-flourish text-xs mt-0.5">✦ ─────── ✦</div>
        </div>
      </div>

      {topMode === "online" && onlineStage === "choice" && (
        <div className="w-full cg-panel rounded-2xl p-6 text-center">
          <p className="text-sm text-amber-100/90 mb-4">Play a 1v1 match with a friend on a different device.</p>
          <button
            onClick={beginCreateRoom}
            className="w-full px-4 py-2.5 rounded-lg cg-btn-primary font-bold mb-4"
          >
            Create Room
          </button>
          <input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            maxLength={5}
            placeholder="CODE"
            className="w-full text-center tracking-[0.4em] uppercase text-lg font-semibold cg-input rounded-lg py-2.5 mb-2 outline-none"
          />
          <div className="text-xs text-red-400 font-medium mb-3 min-h-[16px]">{joinErr}</div>
          <button
            onClick={beginJoinRoom}
            className="w-full px-4 py-2.5 rounded-lg cg-btn-outline font-medium"
          >
            Join Room
          </button>
        </div>
      )}

      {topMode === "online" && onlineStage === "hostWait" && (
        <div className="w-full cg-panel rounded-2xl p-6 text-center">
          <p className="text-sm text-amber-100/90 mb-2">Share this code with your friend</p>
          <div className="cg-title text-4xl tracking-[0.3em] py-4 my-1">{roomCode}</div>
          <div className="text-xs text-amber-200/70 font-medium mb-4">Waiting for opponent to join…</div>
          <button onClick={cancelLobby} className="w-full px-4 py-2 rounded-lg cg-btn-outline font-medium">
            Cancel
          </button>
        </div>
      )}

      {topMode === "online" && onlineStage === "guestWait" && (
        <div className="w-full cg-panel rounded-2xl p-6 text-center">
          <p className="text-sm text-amber-100/90 mb-3">Joined room <strong className="text-amber-300">{roomCode}</strong></p>
          <div className="text-xs text-amber-200/70 font-medium mb-4">Waiting for the host to start the match…</div>
          <button onClick={cancelLobby} className="w-full px-4 py-2 rounded-lg cg-btn-outline font-medium">
            Cancel
          </button>
        </div>
      )}

      {(topMode === "local" || onlineStage === "connected") && (
        <>
          {online && (
            <div className="flex flex-col items-center gap-1 cg-online-tag">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${oppLive ? "bg-green-400" : "bg-red-400"}`} />
                Room {roomCode} · You're Player {myPlayer} ({colorForPlayer(myPlayer) === "white" ? "Ivory" : "Ebony"})
                <button onClick={leaveOnlineGame} className="underline hover:text-amber-100 ml-1">Leave</button>
              </div>
              <div className="text-[10px] text-amber-300/70 font-mono">
                turn: P{ui.currentPlayer} · phase: {ui.phase} · pushed #{syncDebug.pushed} · applied #{syncDebug.applied} · last poll: {syncDebug.note}
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-center gap-3 flex-wrap">
            {playersList.map((p) => {
              const team = colorForPlayer(p) === "white" ? "ivory" : "ebony";
              const isActive = ui.currentPlayer === p;
              return (
                <div key={p} className={`cg-scorecard ${team} ${isActive ? "active" : ""}`}>
                  <div className={`cg-avatar ${team === "ivory" ? "ivory-a" : "ebony-a"}`}>P{p}</div>
                  <div>
                    <div className="cg-pname">PLAYER {p}</div>
                    <div className="cg-pteam">
                      {team === "ivory" ? "IVORY" : "EBONY"}
                      {online && p === myPlayer && <span className="ml-1 text-amber-400 font-bold">· YOU</span>}
                    </div>
                  </div>
                  <div className="cg-score">{ui.scores[p] || 0}</div>
                </div>
              );
            })}
          </div>

          <div className="cg-message">
            <span className="cg-target">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              </svg>
            </span>
            <span className="cg-message-text">
              {online && !myTurnNow && !ui.winner ? "Waiting for opponent's move…" : ui.message}
            </span>
            <span className="cg-dots">
              <span /><span /><span />
            </span>
          </div>

          <div className="relative p-1.5 rounded-xl cg-board-frame" style={{ width: "min(100%, 500px)" }}>
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="rounded-lg touch-none max-w-full block"
              style={{
                width: "100%", maxWidth: "500px", height: "auto", aspectRatio: "1 / 1",
                cursor: (ui.phase === "position" || ui.phase === "aiming") && myTurnNow ? "grab" : "default",
                opacity: online && !myTurnNow ? 0.75 : 1,
              }}
              onMouseDown={handleDown}
              onMouseMove={handleMove}
              onMouseUp={handleUp}
              onMouseLeave={handleUp}
              onTouchStart={handleDown}
              onTouchMove={handleMove}
              onTouchEnd={handleUp}
            />
          </div>

          <div className="cg-infobar">
            <div className="cg-info-item">
              <span className="cg-info-label"><span className="cg-dot w" />WHITE LEFT</span>
              <span className="cg-info-value">{ui.remaining.white}</span>
            </div>
            <div className="cg-info-item">
              <span className="cg-info-label"><span className="cg-dot b" />BLACK LEFT</span>
              <span className="cg-info-value">{ui.remaining.black}</span>
            </div>
            <div className="cg-info-item">
              <span className="cg-info-label"><span className="cg-dot q" />QUEEN</span>
              <span className="cg-info-value" style={{ fontSize: 12, color: "#f0c14b" }}>
                {ui.remaining.queen ? "ON BOARD" : "POCKETED"}
              </span>
            </div>
          </div>

          {ui.winner && (
            <div className="mt-1 px-6 py-3 rounded-2xl cg-panel font-semibold text-lg text-center text-amber-50 w-full">
              {ui.winner.startsWith("Draw") ? ui.winner + "!" : `${ui.winner} wins the game!`}
              {online && (
                <div className="mt-3">
                  <button onClick={leaveOnlineGame} className="px-4 py-2 rounded-lg cg-btn-secondary text-sm font-medium">
                    Leave Room
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
