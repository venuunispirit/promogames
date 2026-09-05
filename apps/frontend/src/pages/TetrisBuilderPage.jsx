import React, { useEffect, useRef, useState } from 'react';

const COLS = 10, ROWS = 20, CELL = 24;

const COLORS = {
  I: '#4dd8e6', O: '#e8c93e', T: '#a55bf0', S: '#4bcf6f',
  Z: '#ef5350', J: '#4d7de6', L: '#f0964d'
};

const SHAPES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
};

// "TETRIS" spelled out in real tetromino colors — one piece color per letter,
// the same way the original game's own logotype works.
const TITLE_LETTERS = [
  { ch: 'T', color: COLORS.T },
  { ch: 'E', color: COLORS.I },
  { ch: 'T', color: COLORS.O },
  { ch: 'R', color: COLORS.S },
  { ch: 'I', color: COLORS.L },
  { ch: 'S', color: COLORS.J }
];

const PANEL_ACCENTS = {
  hold: COLORS.L,
  score: COLORS.I,
  lines: COLORS.S,
  level: COLORS.T,
  next: COLORS.J
};

export default function TetrisGame() {
  const boardCanvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const holdCanvasRef = useRef(null);
  const touchStartRef = useRef(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('start'); // start | running | paused | over
  const [finalStats, setFinalStats] = useState('');
  const [soundLabel, setSoundLabel] = useState('\uD83D\uDD0A Sound');

  const apiRef = useRef({});

  useEffect(() => {
    const boardCanvas = boardCanvasRef.current;
    const ctx = boardCanvas.getContext('2d');
    const nextCanvas = nextCanvasRef.current;
    const nextCtx = nextCanvas.getContext('2d');
    const holdCanvas = holdCanvasRef.current;
    const holdCtx = holdCanvas.getContext('2d');

    boardCanvas.width = COLS * CELL;
    boardCanvas.height = ROWS * CELL;

    // ---- Sound + haptics (synthesized, no audio files needed) ----
    let soundOn = true;
    let actx = null;

    function ensureAudio() {
      if (!soundOn) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!actx) actx = new AudioCtx();
      if (actx.state === 'suspended') actx.resume();
      return actx;
    }

    function beep(freq, duration, type, gainVal, when) {
      if (!soundOn) return;
      const ac = ensureAudio();
      if (!ac) return;
      when = when || 0;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      const t0 = ac.currentTime + when;
      gain.gain.setValueAtTime(gainVal, t0);
      gain.gain.setValueAtTime(gainVal, t0 + duration * 0.6);
      gain.gain.setValueAtTime(0.0001, t0 + duration);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
      return osc;
    }

    function slide(freqStart, freqEnd, duration, gainVal, when) {
      if (!soundOn) return;
      const ac = ensureAudio();
      if (!ac) return;
      when = when || 0;
      const t0 = ac.currentTime + when;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freqStart, t0);
      osc.frequency.linearRampToValueAtTime(freqEnd, t0 + duration);
      gain.gain.setValueAtTime(gainVal, t0);
      gain.gain.setValueAtTime(0.0001, t0 + duration);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    }

    function noiseBurst(duration, gainVal, when, cutoff) {
      if (!soundOn) return;
      const ac = ensureAudio();
      if (!ac) return;
      when = when || 0;
      const t0 = ac.currentTime + when;
      const bufferSize = Math.max(1, Math.floor(ac.sampleRate * duration));
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff || 1200;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(gainVal, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      src.connect(filter).connect(gain).connect(ac.destination);
      src.start(t0);
      src.stop(t0 + duration + 0.02);
    }

    function arpeggio(freqs, stepDur, gainVal, type) {
      freqs.forEach((f, i) => beep(f, stepDur * 0.9, type || 'square', gainVal, i * stepDur));
    }

    function vibrate(pattern) {
      if (!soundOn) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
    }

    const pulseWaveCache = {};
    function getPulseWave(ac, duty) {
      const key = duty.toFixed(3);
      if (pulseWaveCache[key] && pulseWaveCache[key]._ctx === ac) return pulseWaveCache[key];
      const n = 24;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let k = 1; k < n; k++) {
        real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      }
      const wave = ac.createPeriodicWave(real, imag, { disableNormalization: false });
      wave._ctx = ac;
      pulseWaveCache[key] = wave;
      return wave;
    }

    function pulseNote(freq, duration, duty, gainVal, when) {
      if (!soundOn) return;
      const ac = ensureAudio();
      if (!ac) return;
      when = when || 0;
      const t0 = ac.currentTime + when;
      const osc = ac.createOscillator();
      try { osc.setPeriodicWave(getPulseWave(ac, duty)); } catch (e) { osc.type = 'square'; }
      osc.frequency.value = freq;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(gainVal, t0);
      gain.gain.setValueAtTime(gainVal, t0 + duration * 0.55);
      gain.gain.setValueAtTime(0.0001, t0 + duration);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    }

    function bassNote(freq, duration, gainVal, when) {
      if (!soundOn) return;
      const ac = ensureAudio();
      if (!ac) return;
      when = when || 0;
      const t0 = ac.currentTime + when;
      [{ f: freq, type: 'triangle', g: gainVal }, { f: freq / 2, type: 'sine', g: gainVal * 0.55 }].forEach(v => {
        const osc = ac.createOscillator();
        osc.type = v.type;
        osc.frequency.value = v.f;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(v.g, t0);
        gain.gain.setValueAtTime(v.g, t0 + duration * 0.7);
        gain.gain.setValueAtTime(0.0001, t0 + duration);
        osc.connect(gain).connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
      });
    }

    function pulseArpeggio(freqs, stepDur, gainVal, duty) {
      freqs.forEach((f, i) => pulseNote(f, stepDur * 0.9, duty || 0.25, gainVal, i * stepDur));
    }

    const sfx = {
      move: () => { pulseNote(1046, 0.028, 0.125, 0.05); vibrate(6); },
      rotate: () => { pulseArpeggio([740, 988], 0.032, 0.065, 0.25); vibrate(8); },
      rotateFail: () => { slide(220, 110, 0.09, 0.045); },
      softDrop: () => { pulseNote(392, 0.022, 0.5, 0.04); vibrate(4); },
      hardDrop: () => { bassNote(98, 0.09, 0.11); noiseBurst(0.07, 0.16, 0, 450); pulseNote(587, 0.05, 0.25, 0.06, 0.05); vibrate(18); },
      lock: () => { pulseNote(330, 0.05, 0.25, 0.06); },
      hold: () => { pulseArpeggio([392, 587], 0.05, 0.075, 0.4); vibrate(10); },
      lineClear: (n) => {
        const runs = {
          1: [659, 880],
          2: [659, 880, 1046],
          3: [659, 880, 1046, 1318],
          4: [659, 880, 1046, 1318, 1760]
        };
        pulseArpeggio(runs[Math.min(n, 4)] || runs[4], 0.075, 0.13, 0.25);
        if (n >= 4) { noiseBurst(0.16, 0.1, 0.3, 3200); bassNote(65, 0.2, 0.09, 0.28); vibrate([30, 30, 30, 30, 60]); }
        else vibrate(n === 1 ? 15 : n === 2 ? [15, 20, 15] : [15, 20, 15, 20, 15]);
      },
      levelUp: () => {
        pulseArpeggio([523, 659, 784, 1046], 0.09, 0.14, 0.5);
        vibrate([20, 30, 20, 30, 40]);
      },
      gameOver: () => {
        pulseArpeggio([494, 440, 392, 330, 262], 0.14, 0.12, 0.25);
        noiseBurst(0.32, 0.1, 0.66, 350);
        vibrate([80, 40, 80, 40, 160]);
      }
    };

    function toggleSound() {
      soundOn = !soundOn;
      setSoundLabel(soundOn ? '\uD83D\uDD0A Sound' : '\uD83D\uDD07 Muted');
      if (soundOn) ensureAudio();
    }

    // ---- Game state ----
    let board, queue, current, hold, canHold, gScore, gLines, gLevel, dropInterval, dropTimer, lastTime;
    let running, paused, over, animFrame;
    let clearingRows = [], clearParticles = [], clearStartTime = 0;
    let clearShakeMag = 0, clearIsTetris = false;
    const CLEAR_DURATION = 480;

    function rotateMatrix(m) {
      const N = m.length;
      const out = [];
      for (let y = 0; y < N; y++) {
        out.push([]);
        for (let x = 0; x < N; x++) {
          out[y][x] = m[N - 1 - x][y];
        }
      }
      return out;
    }

    function makeEmptyBoard() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function bag7() {
      const types = Object.keys(SHAPES);
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      return types;
    }

    function refillQueue() {
      if (queue.length < 7) queue.push(...bag7());
    }

    function spawnPiece(type) {
      const shape = SHAPES[type].map(r => r.slice());
      const width = shape[0].length;
      return {
        type, shape,
        x: Math.floor((COLS - width) / 2),
        y: -1
      };
    }

    function newPieceFromQueue() {
      refillQueue();
      const type = queue.shift();
      refillQueue();
      return spawnPiece(type);
    }

    function collide(pieceShape, px, py) {
      for (let y = 0; y < pieceShape.length; y++) {
        for (let x = 0; x < pieceShape[y].length; x++) {
          if (!pieceShape[y][x]) continue;
          const bx = px + x, by = py + y;
          if (bx < 0 || bx >= COLS || by >= ROWS) return true;
          if (by >= 0 && board[by][bx]) return true;
        }
      }
      return false;
    }

    function merge() {
      current.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            const by = current.y + y, bx = current.x + x;
            if (by >= 0) board[by][bx] = current.type;
          }
        });
      });
    }

    function findFullRows() {
      const rows = [];
      for (let y = 0; y < ROWS; y++) {
        let full = true;
        for (let x = 0; x < COLS; x++) {
          if (!board[y][x]) { full = false; break; }
        }
        if (full) rows.push(y);
      }
      return rows;
    }

    function applyLineClearScore(cleared) {
      const table = [0, 100, 300, 500, 800];
      gScore += (table[cleared] || 800) * gLevel;
      gLines += cleared;
      const newLevel = Math.floor(gLines / 10) + 1;
      if (newLevel !== gLevel) {
        gLevel = newLevel;
        dropInterval = Math.max(100, 1000 - (gLevel - 1) * 75);
        sfx.levelUp();
      }
      setScore(gScore);
      setLines(gLines);
      setLevel(gLevel);
    }

    function startClearAnimation(rows) {
      clearingRows = rows;
      clearStartTime = performance.now();
      clearParticles = [];
      clearShakeMag = 3 + rows.length * 3;
      clearIsTetris = rows.length >= 4;
      rows.forEach(y => {
        for (let x = 0; x < COLS; x++) {
          const color = COLORS[board[y][x]] || '#ffffff';
          const count = clearIsTetris ? 11 : 8;
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 110 + Math.random() * (clearIsTetris ? 340 : 260);
            clearParticles.push({
              x: x * CELL + CELL / 2,
              y: y * CELL + CELL / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 90,
              color,
              size: 2.5 + Math.random() * 5,
              rot: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 14
            });
          }
        }
      });
      sfx.lineClear(rows.length);
      applyLineClearScore(rows.length);
    }

    function finishClearAnimation() {
      const rows = [...clearingRows].sort((a, b) => a - b);
      rows.forEach(y => {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
      });
      clearingRows = [];
      clearParticles = [];
      clearIsTetris = false;
      current = newPieceFromQueue();
      if (collide(current.shape, current.x, current.y)) {
        endGame();
      }
    }

    function tryRotate() {
      if (clearingRows.length > 0) return;
      const rotated = rotateMatrix(current.shape);
      const kicks = [0, -1, 1, -2, 2];
      for (const k of kicks) {
        if (!collide(rotated, current.x + k, current.y)) {
          current.shape = rotated;
          current.x += k;
          sfx.rotate();
          return;
        }
      }
      sfx.rotateFail();
    }

    function lockPiece() {
      merge();
      sfx.lock();
      canHold = true;
      const fullRows = findFullRows();
      if (fullRows.length > 0) {
        startClearAnimation(fullRows);
      } else {
        current = newPieceFromQueue();
        if (collide(current.shape, current.x, current.y)) {
          endGame();
        }
      }
    }

    function softDrop(manual) {
      if (clearingRows.length > 0) return true;
      if (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
        if (manual) sfx.softDrop();
        return true;
      } else {
        lockPiece();
        return false;
      }
    }

    function hardDrop() {
      if (clearingRows.length > 0) return;
      while (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
        gScore += 2;
      }
      sfx.hardDrop();
      lockPiece();
      setScore(gScore);
      draw();
    }

    function move(dx) {
      if (clearingRows.length > 0) return;
      if (!collide(current.shape, current.x + dx, current.y)) {
        current.x += dx;
        sfx.move();
      }
    }

    function doHold() {
      if (clearingRows.length > 0) return;
      if (!canHold) return;
      sfx.hold();
      canHold = false;
      if (hold === null) {
        hold = current.type;
        current = newPieceFromQueue();
      } else {
        const t = hold;
        hold = current.type;
        current = spawnPiece(t);
      }
    }

    function shadeColor(hex, amt) {
      const num = parseInt(hex.slice(1), 16);
      let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function roundRectPath(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    const cellSpriteCache = {};
    function getCellSprite(color, size) {
      const key = color + '@' + size;
      let sprite = cellSpriteCache[key];
      if (sprite) return sprite;

      sprite = document.createElement('canvas');
      sprite.width = size;
      sprite.height = size;
      const c = sprite.getContext('2d');

      const pad = Math.max(1, size * 0.04);
      const w = size - pad * 2, h = size - pad * 2;
      const r = Math.max(2, size * 0.18);
      const x = pad, y = pad;

      const grad = c.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, shadeColor(color, 65));
      grad.addColorStop(0.45, color);
      grad.addColorStop(1, shadeColor(color, -50));

      c.save();
      roundRectPath(c, x, y, w, h, r);
      c.fillStyle = grad;
      c.fill();
      c.lineWidth = Math.max(1, size * 0.05);
      c.strokeStyle = shadeColor(color, -75);
      c.stroke();

      c.clip();
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath();
      c.moveTo(x, y + h * 0.12);
      c.lineTo(x + w * 0.92, y);
      c.lineTo(x + w, y + h * 0.06);
      c.lineTo(x + w * 0.16, y + h * 0.36);
      c.closePath();
      c.fill();

      const shine = c.createRadialGradient(x + w * 0.32, y + h * 0.28, 0, x + w * 0.32, y + h * 0.28, w * 0.42);
      shine.addColorStop(0, 'rgba(255,255,255,0.5)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = shine;
      c.fillRect(x, y, w, h * 0.62);

      c.fillStyle = 'rgba(0,0,0,0.24)';
      c.beginPath();
      c.moveTo(x + w, y + h * 0.62);
      c.lineTo(x + w, y + h);
      c.lineTo(x + w * 0.14, y + h);
      c.lineTo(x + w * 0.86, y + h * 0.66);
      c.closePath();
      c.fill();
      c.restore();

      cellSpriteCache[key] = sprite;
      return sprite;
    }

    function drawCellPx(c, px, py, size, color) {
      c.drawImage(getCellSprite(color, size), px, py);
    }

    function drawCell(c, x, y, color, size) {
      drawCellPx(c, x * size, y * size, size, color);
    }

    function drawGhost() {
      let gy = current.y;
      while (!collide(current.shape, current.x, gy + 1)) gy++;
      ctx.globalAlpha = 0.22;
      current.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) drawCell(ctx, current.x + x, gy + y, COLORS[current.type], CELL);
        });
      });
      ctx.globalAlpha = 1;
    }

    function draw() {
      ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

      const shaking = clearingRows.length > 0;
      let shakeX = 0, shakeY = 0;
      if (shaking) {
        const t = Math.min(1, (performance.now() - clearStartTime) / CLEAR_DURATION);
        const decay = 1 - t;
        shakeX = (Math.random() * 2 - 1) * clearShakeMag * decay;
        shakeY = (Math.random() * 2 - 1) * clearShakeMag * decay;
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke();
      }
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (board[y][x]) drawCell(ctx, x, y, COLORS[board[y][x]], CELL);
        }
      }
      if (current && clearingRows.length === 0) {
        drawGhost();
        current.shape.forEach((row, y) => {
          row.forEach((v, x) => {
            if (v) {
              const by = current.y + y;
              if (by >= 0) drawCell(ctx, current.x + x, by, COLORS[current.type], CELL);
            }
          });
        });
      }
      drawClearEffect();

      if (shaking) ctx.restore();

      drawPreview(nextCtx, nextCanvas, queue[0]);
      drawPreview(holdCtx, holdCanvas, hold);
    }

    function drawClearEffect() {
      if (clearingRows.length === 0) return;
      const elapsedMs = performance.now() - clearStartTime;
      const t = Math.min(1, elapsedMs / CLEAR_DURATION);
      const tSec = elapsedMs / 1000;

      const flashAlpha = Math.pow(1 - t, 2.2);
      clearingRows.forEach(y => {
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha * 0.95})`;
        ctx.fillRect(0, y * CELL, COLS * CELL, CELL);
      });

      const ringT = Math.min(1, t * 1.4);
      clearingRows.forEach(y => {
        const cy = y * CELL + CELL / 2;
        const ringW = ringT * COLS * CELL * 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${(1 - ringT) * 0.7})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(COLS * CELL / 2 - ringW, cy);
        ctx.lineTo(COLS * CELL / 2 + ringW, cy);
        ctx.stroke();
      });

      const life = 1 - t;
      if (life > 0) {
        clearParticles.forEach(p => {
          const px = p.x + p.vx * tSec;
          const py = p.y + p.vy * tSec + 0.5 * 520 * tSec * tSec;
          const angle = p.rot + p.spin * tSec;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          ctx.globalAlpha = life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      if (clearIsTetris) {
        const pop = t < 0.25 ? t / 0.25 : 1 - Math.min(1, (t - 0.25) / 0.55);
        const scale = 0.6 + pop * 0.7;
        const cy = clearingRows.reduce((a, b) => a + b, 0) / clearingRows.length * CELL + CELL / 2;
        ctx.save();
        ctx.translate(COLS * CELL / 2, cy);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.min(1, pop * 1.6);
        ctx.font = "800 26px 'Space Grotesk', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText('TETRIS!', 2, 2);
        ctx.fillStyle = '#ffd23f';
        ctx.fillText('TETRIS!', 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    function drawPreview(c, canvas, type) {
      c.clearRect(0, 0, canvas.width, canvas.height);
      if (!type) return;
      const shape = SHAPES[type];
      const size = 18;
      const w = shape[0].length * size, h = shape.length * size;
      const offX = (canvas.width - w) / 2, offY = (canvas.height - h) / 2;
      shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            drawCellPx(c, offX + x * size, offY + y * size, size, COLORS[type]);
          }
        });
      });
    }

    function gameLoop(time) {
      if (!running || paused || over) { return; }
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (clearingRows.length > 0) {
        if (performance.now() - clearStartTime >= CLEAR_DURATION) {
          finishClearAnimation();
        }
      } else {
        dropTimer += delta;
        if (dropTimer > dropInterval) {
          softDrop();
          dropTimer = 0;
        }
      }
      draw();
      animFrame = requestAnimationFrame(gameLoop);
    }

    function endGame() {
      over = true;
      running = false;
      cancelAnimationFrame(animFrame);
      sfx.gameOver();
      setFinalStats(`Score ${gScore} \u00B7 Lines ${gLines} \u00B7 Level ${gLevel}`);
      setPhase('over');
    }

    function resetGame() {
      board = makeEmptyBoard();
      queue = [];
      refillQueue();
      current = newPieceFromQueue();
      hold = null;
      canHold = true;
      gScore = 0; gLines = 0; gLevel = 1;
      dropInterval = 1000;
      dropTimer = 0; lastTime = 0;
      running = false; paused = false; over = false;
      clearingRows = []; clearParticles = []; clearShakeMag = 0; clearIsTetris = false;
      setScore(0);
      setLines(0);
      setLevel(1);
      setPhase('start');
      draw();
    }

    function startGame() {
      ensureAudio();
      running = true; paused = false; over = false;
      lastTime = 0;
      setPhase('running');
      animFrame = requestAnimationFrame(gameLoop);
    }

    function togglePause() {
      if (!running || over) return;
      paused = !paused;
      if (paused) {
        setPhase('paused');
        cancelAnimationFrame(animFrame);
      } else {
        setPhase('running');
        lastTime = 0;
        animFrame = requestAnimationFrame(gameLoop);
      }
    }

    function onKeyDown(e) {
      if (!running || over) {
        if (e.key === ' ') { e.preventDefault(); }
        return;
      }
      if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
      if (paused) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move(-1); draw(); break;
        case 'ArrowRight': e.preventDefault(); move(1); draw(); break;
        case 'ArrowDown': e.preventDefault(); softDrop(true); dropTimer = 0; draw(); break;
        case 'ArrowUp': e.preventDefault(); tryRotate(); draw(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'c': case 'C': doHold(); draw(); break;
      }
    }

    window.addEventListener('keydown', onKeyDown);

    apiRef.current = {
      startGame,
      restart: () => { resetGame(); startGame(); },
      togglePause,
      toggleSound,
      move: (dx) => { if (running && !paused && !over) { move(dx); draw(); } },
      softDrop: () => { if (running && !paused && !over) { softDrop(true); dropTimer = 0; draw(); } },
      tryRotate: () => { if (running && !paused && !over) { tryRotate(); draw(); } },
      hardDrop: () => { if (running && !paused && !over) hardDrop(); },
      doHold: () => { if (running && !paused && !over) { doHold(); draw(); } }
    };

    resetGame();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // ---- Touch controls (no on-screen game-action buttons — everything is a gesture) ----
  const LONG_PRESS_MS = 500;
  const MOVE_CANCEL_DIST = 16;

  function handleBoardTouchStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    const startObj = { x: t.clientX, y: t.clientY, longPress: false, timer: null };
    startObj.timer = setTimeout(() => {
      startObj.longPress = true;
      if (navigator.vibrate) navigator.vibrate(15);
      apiRef.current.togglePause();
    }, LONG_PRESS_MS);
    touchStartRef.current = startObj;
  }

  function handleBoardTouchMove(e) {
    const start = touchStartRef.current;
    if (!start || !start.timer || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dist = Math.hypot(t.clientX - start.x, t.clientY - start.y);
    if (dist > MOVE_CANCEL_DIST) {
      clearTimeout(start.timer);
      start.timer = null;
    }
  }

  function handleBoardTouchEnd(e) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    if (start.timer) clearTimeout(start.timer);
    if (start.longPress) return; // long-press already toggled pause
    if (!e.changedTouches[0]) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dist = Math.hypot(dx, dy);

    if (dist < MOVE_CANCEL_DIST) {
      // tap -> rotate
      apiRef.current.tryRotate();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      // horizontal swipe -> move left/right (bounded)
      const cells = Math.max(1, Math.min(4, Math.round(Math.abs(dx) / 22)));
      apiRef.current.move(Math.sign(dx) * cells);
    } else if (dy > 0) {
      // downward swipe -> soft drop (bounded)
      const cells = Math.max(1, Math.min(3, Math.round(dy / 22)));
      for (let i = 0; i < cells; i++) apiRef.current.softDrop();
    }
    // upward swipe -> no-op (rotate via tap)
  }

  return (
    <div className="tetris-root" style={styles.body}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .tetris-btn { transition: transform .08s ease, background .12s ease, color .12s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none; }
        .tetris-btn:active { transform: translateY(1px); }
        .tetris-root { width:100%; max-width:100vw; box-sizing:border-box; overflow-x:hidden; position:relative; }
        .tetris-root::before{
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(${colors.line}55 1px, transparent 1px),
            linear-gradient(90deg, ${colors.line}55 1px, transparent 1px);
          background-size: 34px 34px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, #000 40%, transparent 90%);
        }
        .tetris-root > * { position:relative; z-index:1; }
        .tetris-layout{ max-width:100%; box-sizing:border-box; }

        /* ---- Hero: TETRIS spelled as literal tetromino blocks ---- */
        .tetris-hero{ display:flex; justify-content:center; gap:6px; flex-wrap:wrap; }
        .tetris-hero-letter{
          font-family:'Archivo Black', sans-serif;
          font-size: clamp(22px, 6vw, 38px);
          width: clamp(34px, 8.5vw, 54px);
          height: clamp(34px, 8.5vw, 54px);
          display:flex; align-items:center; justify-content:center;
          color: rgba(10,14,20,0.82);
          border-radius: 7px;
          border: 2px solid rgba(0,0,0,0.45);
          box-shadow: inset 3px 3px 0 rgba(255,255,255,0.5), inset -3px -3px 0 rgba(0,0,0,0.28), 0 3px 0 rgba(0,0,0,0.35);
          transform: rotate(var(--tilt, 0deg));
        }
        .tetris-hero-letter:nth-child(2n){ --tilt: 2.5deg; }
        .tetris-hero-letter:nth-child(2n+1){ --tilt: -2.5deg; }

        .tetris-tagline{
          font-family:'Space Grotesk', sans-serif;
          font-size: 13px;
          color: ${colors.stone};
          text-align:center;
          margin: 10px 0 0;
        }

        /* ---- Panels: schematic tags, not identical SaaS cards ---- */
        .tetris-panel{
          position:relative;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .tetris-panel::before{
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background: var(--panel-accent, ${colors.accent});
        }
        .tetris-panel-title{
          color: var(--panel-accent, ${colors.stone});
        }

        /* ---- Board: schematic viewport with corner registration marks ---- */
        .tetris-board-wrap{ position:relative; }
        .tetris-board-wrap::before, .tetris-board-wrap::after,
        .tetris-corner-tl, .tetris-corner-br{ box-sizing:border-box; }
        .tetris-corner{
          position:absolute; width:16px; height:16px; border-color:${colors.accent};
          border-style:solid; border-width:0; pointer-events:none;
        }
        .tetris-corner-tl{ top:2px; left:2px; border-top-width:3px; border-left-width:3px; }
        .tetris-corner-tr{ top:2px; right:2px; border-top-width:3px; border-right-width:3px; }
        .tetris-corner-bl{ bottom:2px; left:2px; border-bottom-width:3px; border-left-width:3px; }
        .tetris-corner-br{ bottom:2px; right:2px; border-bottom-width:3px; border-right-width:3px; }

        .tetris-board-canvas{ width:min(92vw,calc((100vh - 320px) / 2)); height:auto; touch-action:none; }

        /* ---- Gesture legend (replaces the generic middot-joined instruction line) ---- */
        .tetris-gestures{ display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
        .tetris-gesture-row{ display:flex; align-items:center; gap:10px; font-family:'Space Grotesk', sans-serif; font-size:13px; color:${colors.ink}; }
        .tetris-gesture-glyph{
          width:26px; height:26px; flex:none; border-radius:5px; border:1.5px solid ${colors.accent};
          color:${colors.accent}; display:flex; align-items:center; justify-content:center;
          font-family:'JetBrains Mono', monospace; font-size:13px;
        }

        /* Tablet / narrow: stack side panels around the board */
        @media (max-width:720px){
          .tetris-layout{ flex-direction:column; align-items:center; gap:12px; }
          .tetris-side{ flex-direction:row; width:100%; max-width:420px; flex-wrap:wrap; justify-content:center; gap:8px; }
        }

        /* Phones: no persistent control buttons — the board only responds to touch gestures.
           Pause/Restart/Sound are reached via long-press-to-pause + the pause overlay. */
        @media (max-width:600px){
          .tetris-root{ padding:12px 8px 16px; }
          .tetris-controls-row{ display:none; }
          .tetris-side{ gap:6px; max-width:100%; }
          .tetris-panel{ padding:8px 10px; flex:1 1 70px; min-width:64px; }
          .tetris-panel-title{ font-size:9px; margin-bottom:4px; }
          .tetris-stat-val{ font-size:16px; }
          .tetris-board-wrap{ padding:6px; }
          .tetris-board-canvas{ width:min(94vw, calc((100dvh - 260px) / 2)); }
          .tetris-pause-row .tetris-btn{ padding:8px 14px; font-size:12px; }
        }

        @media (max-height:700px){
          .tetris-board-canvas{ width:min(92vw,calc((100vh - 280px) / 2)); }
        }
        @media (max-width:600px) and (max-height:700px){
          .tetris-board-canvas{ width:min(94vw,calc((100dvh - 230px) / 2)); }
        }
      `}</style>

      <header style={{ textAlign: 'center', marginBottom: 18 }}>
        <div className="tetris-hero">
          {TITLE_LETTERS.map((l, i) => (
            <span key={i} className="tetris-hero-letter" style={{ background: l.color }}>{l.ch}</span>
          ))}
        </div>
        <p className="tetris-tagline">Stack the pieces. Clear the lines.</p>
      </header>

      <div className="tetris-layout" style={styles.layout}>
        <div className="tetris-side tetris-side-left" style={styles.side}>
          <div className="tetris-panel" style={{ ...styles.panel, '--panel-accent': PANEL_ACCENTS.hold }}>
            <h3 className="tetris-panel-title" style={styles.panelH3}>Hold</h3>
            <canvas ref={holdCanvasRef} width="88" height="88" style={styles.smallCanvas} />
          </div>
          <div className="tetris-panel" style={{ ...styles.panel, '--panel-accent': PANEL_ACCENTS.score }}>
            <h3 className="tetris-panel-title" style={styles.panelH3}>Score</h3>
            <div className="tetris-stat-val" style={styles.statVal}>{score}</div>
          </div>
          <div className="tetris-panel" style={{ ...styles.panel, '--panel-accent': PANEL_ACCENTS.lines }}>
            <h3 className="tetris-panel-title" style={styles.panelH3}>Lines</h3>
            <div className="tetris-stat-val" style={styles.statVal}>{lines}</div>
          </div>
          <div className="tetris-panel" style={{ ...styles.panel, '--panel-accent': PANEL_ACCENTS.level }}>
            <h3 className="tetris-panel-title" style={styles.panelH3}>Level</h3>
            <div className="tetris-stat-val" style={styles.statVal}>{level}</div>
          </div>
        </div>

        <div
          className="tetris-board-wrap"
          style={{ ...styles.boardWrap, touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
          onTouchStart={handleBoardTouchStart}
          onTouchMove={handleBoardTouchMove}
          onTouchEnd={handleBoardTouchEnd}
        >
          <span className="tetris-corner tetris-corner-tl" />
          <span className="tetris-corner tetris-corner-tr" />
          <span className="tetris-corner tetris-corner-bl" />
          <span className="tetris-corner tetris-corner-br" />
          <canvas ref={boardCanvasRef} className="tetris-board-canvas" width="240" height="480" style={styles.boardCanvas} />

          {phase === 'start' && (
            <div style={styles.overlay}>
              <div className="tetris-gestures">
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">↔</span>Swipe to move</div>
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">↓</span>Swipe down to drop</div>
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">●</span>Tap to rotate</div>
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">⏸</span>Hold to pause</div>
              </div>
              <button className="tetris-btn" style={styles.btnPrimary} onClick={() => apiRef.current.startGame()}>Start</button>
            </div>
          )}

          {phase === 'over' && (
            <div style={styles.overlay}>
              <h2 style={styles.overlayH2}>Game Over</h2>
              <p style={styles.overlayP}>{finalStats}</p>
              <button className="tetris-btn" style={styles.btnPrimary} onClick={() => apiRef.current.restart()}>Play Again</button>
            </div>
          )}

          {phase === 'paused' && (
            <div style={styles.overlay}>
              <h2 style={styles.overlayH2}>Paused</h2>
              <button className="tetris-btn" style={styles.btnPrimary} onClick={() => apiRef.current.togglePause()}>Resume</button>
              <div className="tetris-pause-row" style={{ display: 'flex', gap: 8 }}>
                <button className="tetris-btn" style={styles.btn} onClick={() => apiRef.current.restart()}>Restart</button>
                <button className="tetris-btn" style={styles.btn} onClick={() => apiRef.current.toggleSound()}>{soundLabel}</button>
              </div>
            </div>
          )}
        </div>

        <div className="tetris-side tetris-side-right" style={styles.side}>
          <div className="tetris-panel" style={{ ...styles.panel, '--panel-accent': PANEL_ACCENTS.next }}>
            <h3 className="tetris-panel-title" style={styles.panelH3}>Next</h3>
            <canvas ref={nextCanvasRef} width="88" height="88" style={styles.smallCanvas} />
          </div>
        </div>
      </div>

      <div className="tetris-controls-row" style={styles.controlsRow}>
        <button className="tetris-btn" style={styles.btn} onClick={() => apiRef.current.togglePause()}>Pause</button>
        <button className="tetris-btn" style={styles.btn} onClick={() => apiRef.current.restart()}>Restart</button>
        <button className="tetris-btn" style={styles.btn} onClick={() => apiRef.current.toggleSound()}>{soundLabel}</button>
      </div>
    </div>
  );
}

// Blueprint palette — deep schematic navy instead of the generic dark-purple/near-black
// gradients, so the accents can be the actual tetromino colors rather than one arbitrary hue.
const colors = {
  bg: '#0e1b2e',
  panel: '#12263d',
  line: '#2c4a68',
  ink: '#e9f2fb',
  stone: '#7fa0bd',
  accent: '#5fd3e8'
};

const styles = {
  body: {
    minHeight: '100vh',
    background: colors.bg,
    fontFamily: "'Space Grotesk', sans-serif",
    color: colors.ink,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '26px 14px 46px'
  },
  layout: {
    display: 'flex',
    gap: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  side: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 120
  },
  panel: {
    background: colors.panel,
    border: `1px solid ${colors.line}`,
    padding: '12px 12px 10px'
  },
  panelH3: {
    margin: '0 0 8px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '0.02em',
    textTransform: 'none',
    color: colors.stone
  },
  statVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 20,
    fontWeight: 700,
    color: colors.ink
  },
  smallCanvas: {
    display: 'block',
    margin: '0 auto',
    background: `linear-gradient(180deg, ${colors.bg} 0%, #081221 100%)`,
    border: `1px dashed ${colors.line}`
  },
  boardWrap: {
    position: 'relative',
    background: colors.panel,
    border: `1px solid ${colors.line}`,
    padding: 10
  },
  boardCanvas: {
    display: 'block',
    background: `linear-gradient(180deg, #0b1930 0%, #081120 100%)`
  },
  overlay: {
    position: 'absolute',
    inset: 10,
    background: 'rgba(10,17,28,0.92)',
    border: `1px solid ${colors.line}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    textAlign: 'center',
    padding: 16
  },
  overlayH2: { margin: 0, fontSize: 24, fontFamily: "'Archivo Black', sans-serif", color: colors.ink },
  overlayP: {
    margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: colors.stone
  },
  btn: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 3,
    border: `1.5px solid ${colors.line}`,
    background: 'transparent',
    color: colors.ink,
    padding: '9px 18px',
    cursor: 'pointer'
  },
  btnPrimary: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 3,
    border: `1.5px solid ${colors.accent}`,
    background: colors.accent,
    color: '#08131f',
    padding: '9px 20px',
    cursor: 'pointer'
  },
  controlsRow: {
    display: 'flex',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
};