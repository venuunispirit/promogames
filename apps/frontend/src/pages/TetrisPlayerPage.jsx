import React, { useEffect, useRef, useState } from 'react';

const COLS = 10, ROWS = 20, CELL = 24;

const BGM_URL = '/music/viacheslavstarostin-retro-arcade-game-music-408074.mp3';

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

// Wordmark letters — mostly cool white/lavender with two neon accent
// letters (I, S), echoing the tetromino-color pop in the reference art.
const LOGO_LETTERS = [
  { ch: 'T' }, { ch: 'E' }, { ch: 'T' }, { ch: 'R' },
  { ch: 'I', accent: 'cyan' }, { ch: 'S', accent: 'pink' }
];

export default function TetrisGame() {
  const boardCanvasRef = useRef(null);
  const touchStartRef = useRef(null);

  const gameAreaRef = useRef(null);
  const boardWrapRef = useRef(null);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('start'); // start | running | paused | over
  const [soundOn, setSoundOnState] = useState(true);

  const apiRef = useRef({});

  useEffect(() => {
    const boardCanvas = boardCanvasRef.current;
    const ctx = boardCanvas.getContext('2d');

    boardCanvas.width = COLS * CELL;
    boardCanvas.height = ROWS * CELL;

    // ---- Sound + haptics (synthesized SFX + looping background music) ----
    let soundOn = true;
    let actx = null;
    let bgm = null;
    let duckTimer = null;

    function ensureAudio() {
      if (!soundOn) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!actx) actx = new AudioCtx();
      if (actx.state === 'suspended') actx.resume();
      return actx;
    }

    function ensureMusic() {
      if (!bgm) {
bgm = new Audio(BGM_URL);
        bgm.loop = true;
        bgm.volume = 0.08;
      }
      return bgm;
    }

    function startMusic() {
      if (!soundOn) return;
      const m = ensureMusic();
m.volume = 0.15;
      m.currentTime = 0;
      m.play().catch(() => {});
    }

    function pauseMusic() {
      if (bgm) bgm.pause();
    }

    function stopMusic() {
      if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
      }
    }

    function duckMusic(ms) {
      if (!soundOn || !bgm) return;
      bgm.volume = 0.04;
      if (duckTimer) clearTimeout(duckTimer);
      duckTimer = setTimeout(() => { bgm.volume = 0.08; }, ms);
    }

    function beep(freq, duration, type, gainVal, when) {
      if (!soundOn) return;
      duckMusic((duration + (when || 0)) * 1000 + 110);
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
      duckMusic(duration * 1000 + 110);
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
      duckMusic(duration * 1000 + 110);
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

    function whoosh(duration, gainVal, when) {
      if (!soundOn) return;
      duckMusic(duration * 1000 + 110);
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
      filter.type = 'bandpass';
      filter.Q.value = 0.85;
      filter.frequency.setValueAtTime(1800, t0);
      filter.frequency.exponentialRampToValueAtTime(220, t0 + duration);
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(gainVal, t0 + duration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      src.connect(filter).connect(gain).connect(ac.destination);
      src.start(t0);
      src.stop(t0 + duration + 0.02);
    }

    function vibrate(pattern) {
      if (typeof navigator.vibrate !== 'function') return;
      try { navigator.vibrate(pattern); } catch (e) {}
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
      duckMusic((duration + (when || 0)) * 1000 + 110);
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
      duckMusic((duration + (when || 0)) * 1000 + 110);
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
      move: () => { pulseNote(1046, 0.028, 0.125, 0.05); vibrate(8); },
      rotate: () => { pulseArpeggio([740, 988], 0.032, 0.065, 0.25); vibrate(12); },
      rotateFail: () => { slide(220, 110, 0.09, 0.045); vibrate(35); },
      softDrop: () => { pulseNote(392, 0.022, 0.5, 0.04); vibrate(6); },
      hardDrop: () => { whoosh(0.3, 0.32); bassNote(98, 0.09, 0.11, 0.14); noiseBurst(0.05, 0.12, 0.14, 450); pulseNote(587, 0.05, 0.25, 0.06, 0.18); vibrate([18, 60, 30]); },
      lock: () => { pulseNote(330, 0.05, 0.25, 0.06); vibrate(20); },
      hold: () => { pulseArpeggio([392, 587], 0.05, 0.075, 0.4); vibrate([10, 35]); },
      lineClear: (n) => {
        const runs = {
          1: [659, 880],
          2: [659, 880, 1046],
          3: [659, 880, 1046, 1318],
          4: [659, 880, 1046, 1318, 1760]
        };
        pulseArpeggio(runs[Math.min(n, 4)] || runs[4], 0.075, 0.13, 0.25);
        if (n >= 4) { noiseBurst(0.16, 0.1, 0.3, 3200); bassNote(65, 0.2, 0.09, 0.28); vibrate([30, 30, 30, 30, 60]); }
        else vibrate(n === 1 ? 12 : n === 2 ? [15, 25, 15] : [15, 25, 20, 25, 20]);
      },
      levelUp: () => {
        pulseArpeggio([523, 659, 784, 1046], 0.09, 0.14, 0.5);
        vibrate([20, 30, 20, 30, 40]);
      },
      gameOver: () => {
        pulseArpeggio([494, 440, 392, 330, 262], 0.14, 0.12, 0.25);
        noiseBurst(0.32, 0.1, 0.66, 350);
        vibrate([70, 40, 70, 40, 140]);
      }
    };

function toggleSound() {
      soundOn = !soundOn;
      setSoundLabel(soundOn ? '\uD83D\uDD0A Sound' : '\uD83D\uDD07 Muted');
      if (soundOn) {
        ensureAudio();
        if (running && !over) startMusic();
      } else {
        pauseMusic();
      }
    }

    // ---- Game state ----
    let board, queue, current, hold, canHold, gScore, gLines, gLevel, dropInterval, dropTimer, lastTime;
    let running, paused, over, animFrame;
    let clearingRows = [], clearParticles = [], clearStartTime = 0;
    let clearShakeMag = 0, clearIsTetris = false;
    let dropAnim = null;
    let impactActive = false;
    let impactStart = 0;
    let impactParticles = [];
    const IMPACT_DURATION = 420;
    let popText = null, popStartTime = 0;
    const CLEAR_DURATION = 460;
    const POP_DURATION = 620;

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
      const labels = { 1: null, 2: 'DOUBLE', 3: 'TRIPLE', 4: 'TETRIS!' };
      popText = labels[cleared] || null;
      popStartTime = performance.now();
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
      clearShakeMag = 2 + rows.length * 2.4;
      clearIsTetris = rows.length >= 4;
      rows.forEach(y => {
        for (let x = 0; x < COLS; x++) {
          const color = COLORS[board[y][x]] || '#ffffff';
          const count = clearIsTetris ? 10 : 7;
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * (clearIsTetris ? 300 : 220);
            clearParticles.push({
              x: x * CELL + CELL / 2,
              y: y * CELL + CELL / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 80,
              color,
              size: 2.5 + Math.random() * 4.5,
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
      if (dropAnim) return;
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
      if (dropAnim) return true;
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
      if (dropAnim) return;
      let ty = current.y;
      while (!collide(current.shape, current.x, ty + 1)) ty++;
      dropAnim = {
        shape: current.shape, type: current.type, x: current.x,
        fromY: current.y, toY: ty,
        start: performance.now(),
        dur: Math.min(190, Math.max(90, (ty - current.y) * 5))
      };
      sfx.hardDrop();
    }

    function spawnLandImpact(a) {
      impactParticles = [];
      const color = COLORS[a.type];
      a.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            const px = (a.x + x) * CELL + CELL / 2;
            const py = (a.toY + y) * CELL + CELL;
            for (let i = 0; i < 4; i++) {
              impactParticles.push({
                x: px, y: py,
                vx: (Math.random() - 0.5) * 170,
                vy: -(45 + Math.random() * 115),
                color, size: 2 + Math.random() * 3.2,
                rot: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 10
              });
            }
          }
        });
      });
    }

    function finishDrop() {
      const a = dropAnim;
      dropAnim = null;
      if (!a) return;
      current.y = a.toY;
      gScore += (a.toY - a.fromY) * 2;
      setScore(gScore);
      impactActive = true;
      impactStart = performance.now();
      spawnLandImpact(a);
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

    function move(dx) {
      if (clearingRows.length > 0) return;
      if (dropAnim) return;
      if (!collide(current.shape, current.x + dx, current.y)) {
        current.x += dx;
        sfx.move();
      }
    }

    function doHold() {
      if (clearingRows.length > 0) return;
      if (dropAnim) return;
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
      c.lineWidth = Math.max(1, size * 0.06);
      c.strokeStyle = shadeColor(color, -60);
      c.stroke();
      c.lineWidth = Math.max(1, size * 0.03);
      c.strokeStyle = 'rgba(255,255,255,0.55)';
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
      const sprite = getCellSprite(COLORS[current.type], CELL);
      ctx.save();
      ctx.globalAlpha = 0.14;
      current.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            const px = (current.x + x) * CELL, py = (gy + y) * CELL;
            ctx.drawImage(sprite, px, py);
          }
        });
      });
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = COLORS[current.type];
      ctx.lineWidth = 1.2;
      current.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            const px = (current.x + x) * CELL, py = (gy + y) * CELL;
            ctx.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3);
          }
        });
      });
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

      const shaking = clearingRows.length > 0 || impactActive;
      let shakeX = 0, shakeY = 0;
      if (shaking) {
        const t = Math.min(1, (performance.now() - clearStartTime) / CLEAR_DURATION);
        const decay = 1 - t;
        shakeX = (Math.random() * 2 - 1) * clearShakeMag * decay;
        shakeY = (Math.random() * 2 - 1) * clearShakeMag * decay;
        if (impactActive) {
          const lt = Math.min(1, (performance.now() - impactStart) / IMPACT_DURATION);
          const ldecay = 1 - lt;
          shakeX += (Math.random() * 2 - 1) * 3.2 * ldecay;
          shakeY += (Math.random() * 2 - 1) * 3.2 * ldecay;
        }
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(120,170,220,0.16)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke();
      }
      ctx.restore();
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (board[y][x]) drawCell(ctx, x, y, COLORS[board[y][x]], CELL);
        }
      }
      if (current && clearingRows.length === 0) {
        if (dropAnim) {
          const a = dropAnim;
          const t = Math.min(1, (performance.now() - a.start) / a.dur);
          const eased = t * t;
          const fallY = a.fromY + (a.toY - a.fromY) * eased;
          a.shape.forEach((row, y) => {
            row.forEach((v, x) => {
              if (v) {
                const py = (fallY + y) * CELL;
                if (py >= 0) drawCellPx(ctx, (a.x + x) * CELL, py, CELL, COLORS[a.type]);
              }
            });
          });
        } else {
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
      }
      drawClearEffect();
      if (impactActive) drawImpact();
      drawScorePop();

      if (shaking) ctx.restore();
    }

    function drawImpact() {
      const elapsed = performance.now() - impactStart;
      if (elapsed > IMPACT_DURATION) { impactActive = false; impactParticles = []; return; }
      const tSec = elapsed / 1000;
      const t = elapsed / IMPACT_DURATION;
      const life = 1 - t;
      impactParticles.forEach(p => {
        const px = p.x + p.vx * tSec;
        const py = p.y + p.vy * tSec + 0.5 * 720 * tSec * tSec;
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

    function drawScorePop() {
      if (!popText) return;
      const elapsed = performance.now() - popStartTime;
      if (elapsed > POP_DURATION) { popText = null; return; }
      const t = elapsed / POP_DURATION;
      const rise = t * 26;
      const alpha = 1 - Math.pow(t, 2);
      const scale = 0.85 + Math.min(1, t * 4) * 0.25;
      ctx.save();
      ctx.translate(COLS * CELL / 2, ROWS * CELL * 0.4 - rise);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = "800 22px 'Space Grotesk', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillText(popText, 2, 2);
      ctx.fillStyle = '#ffd23f';
      ctx.fillText(popText, 0, 0);
      ctx.restore();
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
        ctx.strokeStyle = `rgba(190,240,255,${(1 - ringT) * 0.7})`;
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
      } else if (dropAnim) {
        dropTimer = 0;
      } else {
        dropTimer += delta;
        if (dropTimer > dropInterval) {
          softDrop();
          dropTimer = 0;
        }
      }
      if (dropAnim && performance.now() - dropAnim.start >= dropAnim.dur) {
        finishDrop();
      }
      draw();
      animFrame = requestAnimationFrame(gameLoop);
    }

function endGame() {
      over = true;
      running = false;
      cancelAnimationFrame(animFrame);
      stopMusic();
      sfx.gameOver();
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
      dropAnim = null; impactActive = false; impactParticles = [];
      popText = null;
      setScore(0);
      setLines(0);
      setLevel(1);
      stopMusic();
      setPhase('start');
      draw();
    }

    function startGame() {
      ensureAudio();
      startMusic();
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

    function goHome() {
      cancelAnimationFrame(animFrame);
      resetGame();
    }

    function onKeyDown(e) {
      if (!running || over) {
        if (e.key === ' ') { e.preventDefault(); }
        return;
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { togglePause(); return; }
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

    // ---- Responsive board sizing: measure available space and fit the
    // 10x20 board to it exactly, so the board never overflows the viewport
    // and never needs page scrolling at any of the target breakpoints. ----
    function fitBoard() {
      const row = gameAreaRef.current;
      const wrap = boardWrapRef.current;
      const canvasEl = boardCanvasRef.current;
      if (!row || !wrap || !canvasEl) return;
      const rowStyle = getComputedStyle(row);
      const rowPadX = parseFloat(rowStyle.paddingLeft || '0') + parseFloat(rowStyle.paddingRight || '0');
      const availW = row.clientWidth - rowPadX;
      const availH = row.clientHeight;
      const wrapStyle = getComputedStyle(wrap);
      const padX = parseFloat(wrapStyle.paddingLeft) + parseFloat(wrapStyle.paddingRight) + parseFloat(wrapStyle.borderLeftWidth) + parseFloat(wrapStyle.borderRightWidth);
      const padY = parseFloat(wrapStyle.paddingTop) + parseFloat(wrapStyle.paddingBottom) + parseFloat(wrapStyle.borderTopWidth) + parseFloat(wrapStyle.borderBottomWidth);
      const availCanvasW = Math.max(40, availW - padX);
      const availCanvasH = Math.max(80, availH - padY);
      let h = Math.min(availCanvasH, availCanvasW * 2);
      let w = h / 2;
      if (w > availCanvasW) { w = availCanvasW; h = w * 2; }
      canvasEl.style.width = Math.floor(w) + 'px';
      canvasEl.style.height = Math.floor(h) + 'px';
    }

    let resizeRaf = null;
    function onResize() {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(fitBoard);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const initialFit = requestAnimationFrame(() => requestAnimationFrame(fitBoard));

    apiRef.current = {
      startGame,
      restart: () => { resetGame(); startGame(); },
      goHome,
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
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(initialFit);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(animFrame);
      if (duckTimer) clearTimeout(duckTimer);
      if (bgm) {
        bgm.pause();
        bgm.src = '';
      }
    };
  }, []);

  // ---- Touch gestures: the board is the only control surface. ----
  // Tap = rotate. Swipe left/right = move one cell. Swipe down = soft
  // drop (a fast/long swipe = hard drop). Swipe up = nothing.
  const MOVE_CANCEL_DIST = 14;
  const FAST_SWIPE_VELOCITY = 1.1; // px/ms
  const LONG_SWIPE_FRACTION = 0.55; // fraction of board height

  function handleBoardTouchStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: performance.now() };
  }

  function handleBoardTouchMove(e) {
    // Prevent the page from scrolling while dragging on the board.
    if (touchStartRef.current) e.preventDefault();
  }

  function handleBoardTouchEnd(e) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || !e.changedTouches[0]) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dist = Math.hypot(dx, dy);
    const duration = Math.max(1, performance.now() - start.time);
    const canvas = boardCanvasRef.current;
    const cellPxH = canvas ? canvas.offsetHeight / ROWS : 24;
    const boardH = canvas ? canvas.offsetHeight : 480;

    if (dist < MOVE_CANCEL_DIST) {
      apiRef.current.tryRotate();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      apiRef.current.move(Math.sign(dx));
      return;
    }
    const velocity = dy / duration;
    if (velocity > FAST_SWIPE_VELOCITY || dy > boardH * LONG_SWIPE_FRACTION) {
      apiRef.current.hardDrop();
    } else {
      const cells = Math.max(1, Math.round(dy / cellPxH));
      for (let i = 0; i < cells; i++) apiRef.current.softDrop();
    }
  }

  return (
    <div className="tetris-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root{ color-scheme: dark; }
        .tetris-root, .tetris-root *{ box-sizing:border-box; }
        .tetris-root{
          position: fixed; inset: 0;
          width: 100%; height: 100dvh; height: 100vh;
          overflow: hidden;
          display: flex; flex-direction: column;
          background:
            radial-gradient(ellipse 90% 40% at 50% 0%, rgba(120,80,220,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 70% 35% at 15% 90%, rgba(95,211,232,0.10) 0%, transparent 65%),
            linear-gradient(180deg, #0a0a16 0%, #0e0a1e 55%, #0a0714 100%);
          font-family: 'Space Grotesk', sans-serif;
          color: #eef1fb;
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
        }

        @keyframes tetrisPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

        /* ---------------- Header ---------------- */
        .tetris-header{
          flex: 0 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px 2px;
        }
        .tetris-icon-btn{
          width: 38px; height: 38px; border-radius: 10px; flex: none;
          background: linear-gradient(160deg, #2a2050 0%, #17122c 100%);
          border: 1.5px solid #4a3a78;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          color: #cfd6f5; cursor: pointer;
        }
        .tetris-icon-btn:active{ transform: translateY(1px); filter: brightness(0.9); }
        .tetris-wordmark{ text-align: center; line-height: 1; }
        .tetris-wordmark-title{
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(26px, 8vw, 34px);
          letter-spacing: 0.03em;
          display: flex; justify-content: center; gap: 1px;
        }
        .tetris-letter{
          color: #f2f4fc;
          text-shadow: 0 0 14px rgba(200,210,255,0.35);
        }
        .tetris-letter.accent-cyan{ color: #6fe3f2; text-shadow: 0 0 16px rgba(111,227,242,0.85); }
        .tetris-letter.accent-pink{ color: #ff5f96; text-shadow: 0 0 16px rgba(255,95,150,0.85); }
        .tetris-wordmark-sub{
          margin-top: 2px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.42em;
          color: #8c8fc2; padding-left: 0.42em;
        }

        /* ---------------- Score tab ---------------- */
        .tetris-scorewrap{
          flex: 0 0 auto;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 10px 18px 0;
          margin-bottom: -14px;
          position: relative; z-index: 3;
        }
        .tetris-ear{
          width: 30px; height: 26px; flex: none; margin-bottom: 12px;
          background: linear-gradient(160deg, #4a3a78 0%, #241c44 100%);
          border: 1.5px solid #5b4890;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .tetris-ear-left{ border-radius: 8px 3px 3px 16px; transform: rotate(-6deg); }
        .tetris-ear-right{ border-radius: 3px 8px 16px 3px; transform: rotate(6deg); }
        .tetris-score-tab{
          min-width: 150px;
          background: linear-gradient(180deg, #17122c 0%, #0c0918 100%);
          border: 2px solid #5b4890;
          border-radius: 12px 12px 6px 6px;
          padding: 6px 22px 8px;
          text-align: center;
          box-shadow: 0 0 0 1px rgba(160,120,255,0.15), 0 0 18px rgba(120,80,220,0.35), inset 0 0 14px rgba(0,0,0,0.5);
        }
        .tetris-score-label{
          display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.25em;
          color: #9ea3d6;
        }
        .tetris-score-value{
          display: block; font-family: 'JetBrains Mono', monospace; font-weight: 700;
          font-size: clamp(20px, 6vw, 26px); color: #fff;
          text-shadow: 0 0 14px rgba(140,170,255,0.7);
          margin-top: 1px;
        }

        /* ---------------- Game area: board ---------------- */
        .tetris-gamearea{
          flex: 1 1 auto; min-height: 0;
          display: flex; align-items: stretch; justify-content: center;
          gap: 8px; padding: 0 10px 6px;
        }

        /* ---------------- Board frame ---------------- */
        .tetris-board-wrap{
          position: relative; flex: 0 1 auto;
          display: flex; align-items: center; justify-content: center;
          padding: 14px 8px 10px;
          border-radius: 18px;
          background: linear-gradient(180deg, #241c44 0%, #150f2a 100%);
          border: 2px solid #5b4890;
          box-shadow: 0 0 0 1px rgba(90,60,160,0.25), 0 18px 40px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.06);
        }
        .tetris-corner{
          position: absolute; width: 16px; height: 16px; border-color: #7fe3f0;
          border-style: solid; border-width: 0; pointer-events: none; z-index: 2;
          filter: drop-shadow(0 0 4px rgba(111,227,242,0.7));
        }
        .tetris-corner-tl{ top: 6px; left: 6px; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 5px; }
        .tetris-corner-tr{ top: 6px; right: 6px; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 5px; }
        .tetris-corner-bl{ bottom: 6px; left: 6px; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 5px; }
        .tetris-corner-br{ bottom: 6px; right: 6px; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 5px; }

        .tetris-board-canvas{
          display: block; border-radius: 6px; touch-action: none;
          background: linear-gradient(180deg, #0b0a1a 0%, #06050f 100%);
          box-shadow: inset 0 0 24px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(111,227,242,0.15);
        }

        /* ---------------- Overlays ---------------- */
        .tetris-overlay{
          position: absolute; inset: 6px; border-radius: 12px;
          background: linear-gradient(180deg, rgba(14,10,28,0.95) 0%, rgba(8,6,18,0.97) 100%);
          border: 1px solid rgba(111,227,242,0.3);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; text-align: center; padding: 18px;
          animation: tetrisFadeIn 0.22s ease both;
        }
        @keyframes tetrisFadeIn{ from{ opacity:0; transform: scale(0.97); } to{ opacity:1; transform: scale(1); } }
        .tetris-overlay-title{
          margin: 0; font-family: 'Archivo Black', sans-serif; font-size: 26px; color: #fff;
          text-shadow: 0 0 20px rgba(111,227,242,0.5); letter-spacing: 0.02em;
        }
        .tetris-overlay-stats{ display: flex; gap: 22px; margin: 2px 0; }
        .tetris-overlay-stat-label{ display: block; font-size: 10px; letter-spacing: 0.18em; color: #9ea3d6; font-weight: 700; }
        .tetris-overlay-stat-value{ display: block; font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: #fff; margin-top: 2px; }
        .tetris-gestures{ display: flex; flex-direction: column; gap: 9px; align-items: flex-start; }
        .tetris-gesture-row{ display: flex; align-items: center; gap: 10px; font-size: 13px; color: #d8dcf5; }
        .tetris-gesture-glyph{
          width: 26px; height: 26px; flex: none; border-radius: 6px; border: 1.5px solid #7fe3f0;
          background: rgba(111,227,242,0.08); color: #7fe3f0; display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
        }

        .tetris-btn{
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px;
          letter-spacing: 0.02em; border-radius: 8px; padding: 10px 24px; cursor: pointer;
          transition: transform .08s ease, filter .12s ease;
        }
        .tetris-btn:active{ transform: translateY(2px); filter: brightness(0.92); }
        .tetris-btn-primary{
          border: 1.5px solid #7fe3f0; color: #06131a;
          background: linear-gradient(180deg, #b6f3fa, #6fe3f2 55%, #33a8bb);
          box-shadow: 0 0 18px rgba(111,227,242,0.5), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .tetris-btn-ghost{
          border: 1.5px solid #4a3a78; color: #dfe2f7;
          background: linear-gradient(180deg, #241c44, #17122c);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .tetris-overlay-row{ display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

        /* ---------------- Footer tagline ---------------- */
        .tetris-footer{
          flex: 0 0 auto; text-align: center; padding: 6px 10px calc(6px + env(safe-area-inset-bottom));
          font-size: 10px; letter-spacing: 0.18em; color: #6a6ea0; font-weight: 600;
        }
        @media (max-height: 700px){ .tetris-footer{ display: none; } }

        @media (max-width: 360px){
          .tetris-score-tab{ min-width: 120px; padding: 5px 14px 6px; }
        }
      `}</style>

      <header className="tetris-header">
        <button className="tetris-icon-btn" onClick={() => apiRef.current.togglePause()} aria-label="Pause">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="3.4" height="12" rx="1" fill="currentColor" /><rect x="8.6" y="1" width="3.4" height="12" rx="1" fill="currentColor" /></svg>
        </button>
        <div className="tetris-wordmark">
          <div className="tetris-wordmark-title">
            {LOGO_LETTERS.map((l, i) => (
              <span key={i} className={`tetris-letter${l.accent ? ' accent-' + l.accent : ''}`}>{l.ch}</span>
            ))}
          </div>
          <div className="tetris-wordmark-sub">CLASSIC</div>
        </div>
        <button className="tetris-icon-btn" onClick={() => apiRef.current.toggleSound()} aria-label="Sound">
          {soundOn ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" /><path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M19 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" /></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </button>
      </header>

      <div className="tetris-scorewrap">
        <span className="tetris-ear tetris-ear-left" />
        <div className="tetris-score-tab">
          <span className="tetris-score-label">SCORE</span>
          <span className="tetris-score-value">{score.toLocaleString()}</span>
        </div>
        <span className="tetris-ear tetris-ear-right" />
      </div>

      <div className="tetris-gamearea" ref={gameAreaRef}>
        <div
          className="tetris-board-wrap"
          ref={boardWrapRef}
          onTouchStart={handleBoardTouchStart}
          onTouchMove={handleBoardTouchMove}
          onTouchEnd={handleBoardTouchEnd}
        >
          <span className="tetris-corner tetris-corner-tl" />
          <span className="tetris-corner tetris-corner-tr" />
          <span className="tetris-corner tetris-corner-bl" />
          <span className="tetris-corner tetris-corner-br" />
          <canvas ref={boardCanvasRef} className="tetris-board-canvas" width="240" height="480" />

          {phase === 'start' && (
            <div className="tetris-overlay">
              <div className="tetris-gestures">
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">↔</span>Swipe to move</div>
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">↓</span>Swipe down to drop</div>
                <div className="tetris-gesture-row"><span className="tetris-gesture-glyph">●</span>Tap to rotate</div>
              </div>
              <button className="tetris-btn tetris-btn-primary" onClick={() => apiRef.current.startGame()}>Start</button>
            </div>
          )}

          {phase === 'over' && (
            <div className="tetris-overlay">
              <h2 className="tetris-overlay-title">Game Over</h2>
              <div className="tetris-overlay-stats">
                <div>
                  <span className="tetris-overlay-stat-label">Score</span>
                  <span className="tetris-overlay-stat-value">{score.toLocaleString()}</span>
                </div>
                <div>
                  <span className="tetris-overlay-stat-label">Best</span>
                  <span className="tetris-overlay-stat-value">{best.toLocaleString()}</span>
                </div>
              </div>
              <div className="tetris-overlay-row">
                <button className="tetris-btn tetris-btn-primary" onClick={() => apiRef.current.restart()}>Play Again</button>
                <button className="tetris-btn tetris-btn-ghost" onClick={() => apiRef.current.goHome()}>Home</button>
              </div>
            </div>
          )}

          {phase === 'paused' && (
            <div className="tetris-overlay">
              <h2 className="tetris-overlay-title">Paused</h2>
              <div className="tetris-overlay-row">
                <button className="tetris-btn tetris-btn-primary" onClick={() => apiRef.current.togglePause()}>Resume</button>
              </div>
              <div className="tetris-overlay-row">
                <button className="tetris-btn tetris-btn-ghost" onClick={() => apiRef.current.restart()}>Restart</button>
                <button className="tetris-btn tetris-btn-ghost" onClick={() => apiRef.current.goHome()}>Home</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tetris-footer">CLEAR LINES &nbsp;•&nbsp; BEAT YOUR BEST &nbsp;•&nbsp; ENDLESS FUN</div>
    </div>
  );
}