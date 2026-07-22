import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";

/* ============================================================
   BLOCK BLASTER — React port of the original vanilla HTML/JS game.
   Drag pieces from the tray onto the 8x8 board; fill full rows or
   columns to clear them and score points. Game ends when none of
   the pieces left in the tray can be placed anywhere on the board.
   ============================================================ */

const GRID = 8;

const SHAPES = [
  { m: [[0, 0]], c: "#ff6b6b" },
  { m: [[0, 0], [0, 1]], c: "#3aa3ff" },
  { m: [[0, 0], [1, 0]], c: "#3aa3ff" },
  { m: [[0, 0], [0, 1], [0, 2]], c: "#4ddb7a" },
  { m: [[0, 0], [1, 0], [2, 0]], c: "#4ddb7a" },
  { m: [[0, 0], [1, 0], [1, 1]], c: "#ff9d4d" },
  { m: [[0, 0], [0, 1], [1, 0]], c: "#ff9d4d" },
  { m: [[0, 1], [1, 0], [1, 1]], c: "#ff9d4d" },
  { m: [[0, 0], [0, 1], [1, 1]], c: "#ff9d4d" },
  { m: [[0, 0], [0, 1], [1, 0], [1, 1]], c: "#ffd23f" },
  { m: [[0, 0], [0, 1], [0, 2], [0, 3]], c: "#3fd1ff" },
  { m: [[0, 0], [1, 0], [2, 0], [3, 0]], c: "#3fd1ff" },
  { m: [[0, 0], [1, 0], [2, 0], [2, 1]], c: "#b06bff" },
  { m: [[0, 0], [0, 1], [0, 2], [1, 0]], c: "#b06bff" },
  { m: [[0, 0], [0, 1], [1, 1], [2, 1]], c: "#b06bff" },
  { m: [[1, 0], [1, 1], [1, 2], [0, 2]], c: "#b06bff" },
  { m: [[0, 0], [0, 1], [0, 2], [1, 1]], c: "#ff6bd0" },
  { m: [[0, 1], [1, 0], [1, 1], [2, 1]], c: "#ff6bd0" },
  { m: [[1, 0], [1, 1], [1, 2], [0, 1]], c: "#ff6bd0" },
  { m: [[0, 0], [1, 0], [2, 0], [1, 1]], c: "#ff6bd0" },
  { m: [[0, 1], [0, 2], [1, 0], [1, 1]], c: "#2fe0c0" },
  { m: [[0, 0], [0, 1], [1, 1], [1, 2]], c: "#2fe0c0" },
  { m: [[0, 0], [1, 0], [1, 1], [2, 1]], c: "#2fe0c0" },
  { m: [[0, 1], [1, 0], [1, 1], [2, 0]], c: "#2fe0c0" },
  { m: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], c: "#ffcf3f" },
  { m: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], c: "#ff5fa2" },
];

function randomPiece() {
  const def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape: def.m.map((p) => p.slice()), color: def.c, id: Math.random().toString(36).slice(2) };
}
function shapeDims(shape) {
  let maxR = 0, maxC = 0;
  for (const [r, c] of shape) { if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
  return { rows: maxR + 1, cols: maxC + 1 };
}
function emptyBoard() {
  return Array.from({ length: GRID }, () => Array(GRID).fill(null));
}
function fits(board, shape, anchorR, anchorC) {
  for (const [dr, dc] of shape) {
    const r = anchorR + dr, c = anchorC + dc;
    if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
    if (board[r][c]) return false;
  }
  return true;
}
function anyValidPositionForShape(board, shape) {
  const { rows, cols } = shapeDims(shape);
  for (let r = 0; r <= GRID - rows; r++) for (let c = 0; c <= GRID - cols; c++) if (fits(board, shape, r, c)) return true;
  return false;
}
function checkGameOverState(board, tray) {
  const remaining = tray.filter(Boolean);
  if (remaining.length === 0) return false;
  for (const p of remaining) if (anyValidPositionForShape(board, p.shape)) return false;
  return true;
}

/* ---------------- audio (tiny synthesized sfx) ---------------- */
function createSnd() {
  let ctx = null, muted = false, musicGain = null, musicTimer = null, musicStep = 0, musicStarted = false;
  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.16;
      musicGain.connect(ctx.destination);
    }
  }
  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    ensure();
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.4, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function sweep(f1, f2, dur, type, vol) {
    if (muted) return;
    ensure();
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol || 0.35, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function musicNote(freq, dur, t0) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(1, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(musicGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  const PATTERN = [261, 329, 392, 329, 293, 349, 440, 349, 261, 329, 392, 523, 440, 392, 329, 293];
  function playMusic() {
    if (musicStarted) return;
    ensure(); musicStarted = true;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(() => {
      if (!muted) musicNote(PATTERN[musicStep % PATTERN.length], 0.5, ctx.currentTime);
      musicStep++;
    }, 340);
  }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; musicStarted = false; }
  return {
    ensure, playMusic, stopMusic,
    setMuted: (m) => { muted = m; if (musicGain) musicGain.gain.value = m ? 0 : 0.16; },
    isMuted: () => muted,
    pickup: () => sweep(260, 420, 0.09, "triangle", 0.22),
    place: () => tone(320, 0.09, "square", 0.25),
    bad: () => tone(140, 0.15, "sawtooth", 0.2),
    clear: (n) => { for (let i = 0; i < Math.min(n, 4); i++) tone(520 + i * 160, 0.14, "triangle", 0.3, i * 0.06); },
    combo: (n) => { for (let i = 0; i < n; i++) tone(700 + i * 120, 0.12, "square", 0.28, i * 0.07); },
    click: () => tone(600, 0.06, "square", 0.22),
    over: () => { [400, 320, 240, 160].forEach((f, i) => tone(f, 0.2, "sawtooth", 0.22, i * 0.09)); },
  };
}

function createHaptics(snd) {
  const supported = typeof navigator !== "undefined" && !!navigator.vibrate;
  function vibrate(pattern) {
    if (!supported || snd.isMuted()) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }
  return {
    pickup: () => vibrate(8),
    place: () => vibrate(15),
    bad: () => vibrate([0, 25, 40, 25]),
    clear: (n) => vibrate(n > 1 ? [0, 30, 30, 30, 30, 30] : [0, 35]),
    over: () => vibrate([0, 50, 60, 50, 60, 80]),
    click: () => vibrate(6),
  };
}

const CSS = `
.bb-app { position:relative; width:100%; max-width:480px; margin:0 auto; display:flex; flex-direction:column;
  align-items:center; background:radial-gradient(ellipse at top, #2a2350 0%, #161327 65%); color:#fff;
  font-family:'Baloo 2','Trebuchet MS',sans-serif; border-radius:22px; padding:14px 0 22px; overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,0.35); }
.bb-app * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none; touch-action:none; }
.bb-topbar { width:100%; max-width:480px; display:flex; justify-content:space-between; align-items:center; padding:0 18px 4px; }
.bb-title { font-size:22px; font-weight:800; color:#ffd23f; text-shadow:2px 2px 0 rgba(0,0,0,0.35); letter-spacing:0.5px; }
.bb-scores { display:flex; gap:10px; }
.scoreBox { background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.15); border-radius:10px;
  padding:5px 12px; text-align:center; min-width:56px; }
.scoreBox .lbl { font-size:9px; color:#a9a3d6; letter-spacing:1px; }
.scoreBox .val { font-size:16px; font-weight:800; color:#fff; }
.soundBtn { cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
.boardWrap { position:relative; margin-top:10px; }
.bb-board { display:grid; gap:4px; background:rgba(0,0,0,0.28); border-radius:14px; padding:8px;
  box-shadow:inset 0 2px 10px rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.35); }
.cell { border-radius:6px; background:rgba(255,255,255,0.05); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04);
  position:relative; transition:background-color .12s, box-shadow .12s; }
.cell.filled { box-shadow:inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.28); }
.cell.preview-ok { background:rgba(120,255,170,0.35) !important; box-shadow:inset 0 0 0 2px rgba(120,255,170,0.7) !important; }
.cell.preview-bad { background:rgba(255,110,110,0.28) !important; box-shadow:inset 0 0 0 2px rgba(255,110,110,0.6) !important; }
.cell.clearing { animation:bb-clearFlash .32s ease forwards; }
@keyframes bb-clearFlash { 0%{transform:scale(1);opacity:1} 60%{transform:scale(1.15);opacity:0.9} 100%{transform:scale(0.2);opacity:0} }
.bb-tray { width:100%; max-width:480px; display:flex; justify-content:space-around; align-items:center; padding:18px 12px; gap:8px; }
.slot { min-height:70px; min-width:70px; display:flex; align-items:center; justify-content:center; position:relative; cursor:grab; }
.slotGrid { display:grid; gap:2px; }
.pieceCell { border-radius:4px; box-shadow:inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.25); }
.slot.dragging-source .pieceCell { opacity:0.15; }
.msgFloat { position:absolute; top:56px; left:50%; transform:translateX(-50%); color:#ffe27a; font-size:15px; font-weight:700;
  text-shadow:2px 2px 0 rgba(0,0,0,0.4); transition:opacity .3s; pointer-events:none; z-index:6; }
.bb-ghost { position:fixed; pointer-events:none; z-index:9999; display:grid; gap:4px; opacity:0.95; }
.ghostCell { border-radius:6px; box-shadow:inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.35); }
.bb-panel { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:rgba(10,8,20,0.86); gap:14px; z-index:20; text-align:center; padding:20px; border-radius:22px; }
.bb-panel h1 { font-size:30px; color:#ff6b6b; text-shadow:3px 3px 0 rgba(0,0,0,0.4); margin:0; }
.bb-panel .sub { font-size:14px; color:#c9c3f0; }
.bb-panel .finalScore { font-size:38px; font-weight:800; color:#ffd23f; margin:6px 0; }
.bb-btn { font-family:'Baloo 2','Trebuchet MS',sans-serif; font-weight:800; font-size:15px; color:#fff;
  background:linear-gradient(#7c5cff,#4d33c9); border:none; border-radius:12px; padding:13px 30px; cursor:pointer;
  box-shadow:0 5px 0 #32218f, 0 8px 16px rgba(0,0,0,0.35); transition:transform .06s; }
.bb-btn:active { transform:translateY(4px); box-shadow:0 1px 0 #32218f; }
`;

export default function BlockBlaster() {
  const gameRef = useRef({ board: emptyBoard(), tray: [randomPiece(), randomPiece(), randomPiece()], score: 0, best: 0, over: false });
  const dragRef = useRef(null);
  const wrapRef = useRef(null);
  const boardGridRef = useRef(null);
  const msgTimerRef = useRef(null);

  const snd = useMemo(() => createSnd(), []);
  const haptics = useMemo(() => createHaptics(snd), [snd]);

  const [board, setBoard] = useState(gameRef.current.board);
  const [tray, setTray] = useState(gameRef.current.tray);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cellSize, setCellSize] = useState(36);
  const [previewMap, setPreviewMap] = useState({});
  const [clearingSet, setClearingSet] = useState(new Set());
  const [draggingSlot, setDraggingSlot] = useState(null);
  const [ghost, setGhost] = useState({ visible: false, left: 0, top: 0, rows: 0, cols: 0, color: "", cellsSet: new Set() });
  const [msg, setMsg] = useState({ text: "", visible: false });

  function sync() {
    const g = gameRef.current;
    setBoard(g.board.map((row) => row.slice()));
    setTray(g.tray.slice());
    setScore(g.score);
    setOver(g.over);
  }

  // ---------- persistence ----------
  useEffect(() => {
    (async () => {
      try {
        if (window.storage && window.storage.get) {
          const r = await window.storage.get("blockblaster_best");
          if (r && r.value) {
            const b = parseInt(r.value) || 0;
            gameRef.current.best = b;
            setBest(b);
          }
        }
      } catch (e) {}
    })();
  }, []);

  async function saveBest(b) {
    try {
      if (window.storage && window.storage.set) await window.storage.set("blockblaster_best", String(b), false);
    } catch (e) {}
  }

  function bumpScore(delta) {
    gameRef.current.score += delta;
    setScore(gameRef.current.score);
    if (gameRef.current.score > gameRef.current.best) {
      gameRef.current.best = gameRef.current.score;
      setBest(gameRef.current.best);
      saveBest(gameRef.current.best);
    }
  }

  function showMsg(text) {
    setMsg({ text, visible: true });
    clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMsg((m) => ({ ...m, visible: false })), 900);
  }

  // ---------- sizing ----------
  useEffect(() => {
    function computeCellSize() {
      const containerWidth = wrapRef.current ? wrapRef.current.clientWidth : 360;
      const usable = Math.min(containerWidth, 480) - 40;
      const gapTotal = (GRID - 1) * 4 + 16;
      const size = Math.floor((usable - gapTotal) / GRID);
      setCellSize(Math.max(24, Math.min(44, size)));
    }
    computeCellSize();
    window.addEventListener("resize", computeCellSize);
    return () => window.removeEventListener("resize", computeCellSize);
  }, []);

  // ---------- clearing lines ----------
  function clearFullLines() {
    const b = gameRef.current.board;
    const fullRows = [], fullCols = [];
    for (let r = 0; r < GRID; r++) if (b[r].every((v) => v)) fullRows.push(r);
    for (let c = 0; c < GRID; c++) { let full = true; for (let r = 0; r < GRID; r++) if (!b[r][c]) { full = false; break; } if (full) fullCols.push(c); }
    const total = fullRows.length + fullCols.length;
    if (total === 0) return;

    const keys = new Set();
    fullRows.forEach((r) => { for (let c = 0; c < GRID; c++) keys.add(`${r}_${c}`); });
    fullCols.forEach((c) => { for (let r = 0; r < GRID; r++) keys.add(`${r}_${c}`); });
    setClearingSet(keys);

    snd.clear(total);
    if (total > 1) snd.combo(total);
    haptics.clear(total);
    bumpScore(total * total * 10);
    showMsg(total > 1 ? `${total}x CLEAR!` : "CLEAR!");

    setTimeout(() => {
      fullRows.forEach((r) => { for (let c = 0; c < GRID; c++) gameRef.current.board[r][c] = null; });
      fullCols.forEach((c) => { for (let r = 0; r < GRID; r++) gameRef.current.board[r][c] = null; });
      setClearingSet(new Set());
      sync();
    }, 260);
  }

  function triggerGameOver() {
    gameRef.current.over = true;
    snd.over();
    haptics.over();
    sync();
  }

  function commitPlacement(slotIndex, shape, color, anchorR, anchorC) {
    const g = gameRef.current;
    for (const [dr, dc] of shape) g.board[anchorR + dr][anchorC + dc] = color;
    bumpScore(shape.length);
    snd.place();
    haptics.place();
    g.tray[slotIndex] = null;
    if (g.tray.every((p) => !p)) g.tray = [randomPiece(), randomPiece(), randomPiece()];
    sync();
    clearFullLines();
    if (checkGameOverState(g.board, g.tray)) setTimeout(triggerGameOver, 320);
  }

  // ---------- drag & drop ----------
  function moveDrag(clientX, clientY) {
    const drag = dragRef.current;
    if (!drag) return;
    const pieceW = drag.cols * cellSize + (drag.cols - 1) * 4;
    const pieceH = drag.rows * cellSize + (drag.rows - 1) * 4;
    const left = clientX - pieceW / 2;
    const top = clientY - pieceH - 26;
    setGhost((gh) => ({ ...gh, left, top }));

    const br = boardGridRef.current.getBoundingClientRect();
    let anchorC = Math.round((left - br.left) / (cellSize + 4));
    let anchorR = Math.round((top - br.top) / (cellSize + 4));
    anchorR = Math.max(0, Math.min(GRID - drag.rows, anchorR));
    anchorC = Math.max(0, Math.min(GRID - drag.cols, anchorC));

    const ok = fits(gameRef.current.board, drag.shape, anchorR, anchorC);
    const pm = {};
    for (const [dr, dc] of drag.shape) {
      const r = anchorR + dr, c = anchorC + dc;
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) pm[`${r}_${c}`] = ok ? "ok" : "bad";
    }
    setPreviewMap(pm);
    drag.anchorR = anchorR;
    drag.anchorC = anchorC;
    drag.ok = ok;
  }

  const onDragMove = useCallback((ev) => moveDrag(ev.clientX, ev.clientY), [cellSize]);

  const onDragEnd = useCallback((ev) => {
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
    window.removeEventListener("pointercancel", onDragEnd);
    const drag = dragRef.current;
    if (!drag) return;
    setDraggingSlot(null);
    setGhost((gh) => ({ ...gh, visible: false }));
    setPreviewMap({});
    if (drag.ok) {
      commitPlacement(drag.slotIndex, drag.shape, drag.color, drag.anchorR, drag.anchorC);
    } else {
      snd.bad();
      haptics.bad();
    }
    dragRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDragMove]);

  function startDrag(slotIndex, ev) {
    if (gameRef.current.over) return;
    const p = gameRef.current.tray[slotIndex];
    if (!p) return;
    ev.preventDefault();
    snd.ensure();
    snd.pickup();
    haptics.pickup();
    const { rows, cols } = shapeDims(p.shape);
    dragRef.current = { slotIndex, shape: p.shape, color: p.color, rows, cols, anchorR: 0, anchorC: 0, ok: false };
    setDraggingSlot(slotIndex);
    setGhost({
      visible: true,
      left: 0,
      top: 0,
      rows,
      cols,
      color: p.color,
      cellsSet: new Set(p.shape.map(([r, c]) => `${r}_${c}`)),
    });
    moveDrag(ev.clientX, ev.clientY);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
    window.addEventListener("pointercancel", onDragEnd);
  }

  // ---------- reset ----------
  function resetGame() {
    gameRef.current.board = emptyBoard();
    gameRef.current.tray = [randomPiece(), randomPiece(), randomPiece()];
    gameRef.current.score = 0;
    gameRef.current.over = false;
    setPreviewMap({});
    setClearingSet(new Set());
    setGhost((gh) => ({ ...gh, visible: false }));
    sync();
  }

  function toggleMute() {
    snd.ensure();
    const m = !snd.isMuted();
    snd.setMuted(m);
    setMuted(m);
    if (!m) { snd.click(); haptics.click(); }
  }

  return (
    <div className="bb-app" ref={wrapRef}>
      <style>{CSS}</style>

      <div className="bb-topbar">
        <div className="bb-title">Block Blaster</div>
        <div className="bb-scores">
          <div className="scoreBox"><div className="lbl">SCORE</div><div className="val">{score}</div></div>
          <div className="scoreBox"><div className="lbl">BEST</div><div className="val">{best}</div></div>
          <div className="scoreBox soundBtn" onClick={toggleMute}>{muted ? "🔇" : "🔊"}</div>
        </div>
      </div>

      <div className="msgFloat" style={{ opacity: msg.visible ? 1 : 0 }}>{msg.text}</div>

      <div className="boardWrap">
        <div
          className="bb-board"
          ref={boardGridRef}
          style={{ gridTemplateColumns: `repeat(${GRID}, ${cellSize}px)`, gridTemplateRows: `repeat(${GRID}, ${cellSize}px)` }}
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const key = `${r}_${c}`;
              const preview = previewMap[key];
              const clearing = clearingSet.has(key);
              let cls = "cell";
              if (val) cls += " filled";
              if (preview === "ok") cls += " preview-ok";
              if (preview === "bad") cls += " preview-bad";
              if (clearing) cls += " clearing";
              return (
                <div
                  key={key}
                  className={cls}
                  style={{ background: val && !clearing ? val : undefined, width: cellSize, height: cellSize }}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="bb-tray">
        {[0, 1, 2].map((i) => {
          const p = tray[i];
          const dims = p ? shapeDims(p.shape) : { rows: 1, cols: 1 };
          const s = p ? Math.min(20, Math.floor(64 / Math.max(dims.rows, dims.cols))) : 0;
          const set = p ? new Set(p.shape.map(([r, c]) => `${r}_${c}`)) : new Set();
          const cells = [];
          if (p) {
            for (let r = 0; r < dims.rows; r++)
              for (let c = 0; c < dims.cols; c++) {
                const k = `${r}_${c}`;
                cells.push(
                  <div
                    key={k}
                    className={set.has(k) ? "pieceCell" : ""}
                    style={{ width: s, height: s, background: set.has(k) ? p.color : undefined }}
                  />
                );
              }
          }
          return (
            <div
              key={i}
              className={`slot ${draggingSlot === i ? "dragging-source" : ""}`}
              onPointerDown={(e) => startDrag(i, e)}
            >
              {p && (
                <div className="slotGrid" style={{ gridTemplateColumns: `repeat(${dims.cols}, ${s}px)`, gridTemplateRows: `repeat(${dims.rows}, ${s}px)` }}>
                  {cells}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="bb-btn" onClick={resetGame}>⟲ NEW GAME</button>

      {ghost.visible && (
        <div
          className="bb-ghost"
          style={{
            left: ghost.left,
            top: ghost.top,
            gridTemplateColumns: `repeat(${ghost.cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${ghost.rows}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: ghost.rows * ghost.cols }).map((_, idx) => {
            const r = Math.floor(idx / ghost.cols), c = idx % ghost.cols;
            const k = `${r}_${c}`;
            const active = ghost.cellsSet.has(k);
            return <div key={k} className={active ? "ghostCell" : ""} style={{ width: cellSize, height: cellSize, background: active ? ghost.color : undefined }} />;
          })}
        </div>
      )}

      {over && (
        <div className="bb-panel">
          <h1>GAME OVER</h1>
          <div className="sub">No more moves for the remaining pieces.</div>
          <div className="finalScore">{score}</div>
          <button className="bb-btn" onClick={resetGame}>⟲ PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
}
