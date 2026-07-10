import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import api from '../api'

const STYLES = `
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{transform:scale(0);opacity:0}50%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
@keyframes scorePop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes confettiFall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes flyFromBottom{from{transform:translateY(110vh) scale(.9);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(4deg)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
@keyframes floatUp{0%{transform:translateY(0) translateX(0);opacity:.5}50%{opacity:1}100%{transform:translateY(-100vh) translateX(20px);opacity:0}}
@keyframes crystalFloat{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}33%{transform:translateY(-18px) rotate(5deg) scale(1.02)}66%{transform:translateY(-8px) rotate(-3deg) scale(.98)}}
@keyframes orbPulse{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.25;transform:scale(1.08)}}
@keyframes starTwinkle{0%,100%{opacity:.2;transform:scale(.8) rotate(0deg)}50%{opacity:1;transform:scale(1.1) rotate(180deg)}}
@keyframes neonPulse{0%,100%{box-shadow:0 0 15px rgba(123,46,255,.3),0 0 30px rgba(123,46,255,.15)}50%{box-shadow:0 0 25px rgba(123,46,255,.5),0 0 50px rgba(123,46,255,.25)}}
@keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes particleDrift{0%{transform:translate(0,0) scale(1);opacity:.6}50%{opacity:1}100%{transform:translate(var(--dx,30px),var(--dy,-60px)) scale(0);opacity:0}}
@keyframes bloomPulse{0%,100%{opacity:.08}50%{opacity:.18}}
@keyframes crownBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-3px)}}
@keyframes tilePop{0%{opacity:0}100%{opacity:1}}
@keyframes borderGlow{0%{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 0 rgba(157,92,255,0)}35%{box-shadow:0 0 0 4px rgba(255,255,255,1),0 0 30px rgba(180,130,255,.7),0 0 60px rgba(157,92,255,.4),0 0 90px rgba(120,60,220,.2)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 0 rgba(157,92,255,0)}}
@keyframes legendaryGlow{0%,100%{box-shadow:0 0 20px var(--glow),0 0 40px var(--glow),0 4px 12px rgba(0,0,0,.35)}50%{box-shadow:0 0 35px var(--glow),0 0 70px var(--glow),0 4px 16px rgba(0,0,0,.4)}}
@keyframes legendaryShine{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes sparkleFloat{0%,100%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(180deg)}}
@keyframes popupIn{0%{opacity:0;transform:scale(.8) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}

.p2048-bg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:linear-gradient(160deg,#2A004F 0%,#350068 20%,#4B0082 45%,#5E10A0 65%,#7B2EFF 100%);
}
.p2048-vignette{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 40%,rgba(20,0,40,.55) 100%);
}
.p2048-bloom{
  position:fixed;z-index:0;pointer-events:none;border-radius:50%;
  background:radial-gradient(circle,rgba(193,107,255,.18) 0%,transparent 70%);
  animation:orbPulse 6s ease-in-out infinite;
}
.p2048-wave{
  position:fixed;bottom:0;left:0;width:200%;height:180px;z-index:0;pointer-events:none;opacity:.06;
  background:repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(193,107,255,.3) 40px,rgba(193,107,255,.3) 42px);
  animation:waveMove 20s linear infinite;
}
.p2048-crystal{
  position:fixed;z-index:0;pointer-events:none;
  animation:crystalFloat 10s ease-in-out infinite;
}
.p2048-star{
  position:fixed;z-index:0;pointer-events:none;
  animation:starTwinkle 4s ease-in-out infinite;
}
.p2048-orb{
  position:fixed;z-index:0;pointer-events:none;border-radius:50%;
  background:radial-gradient(circle,rgba(193,107,255,.35),transparent 70%);
  animation:orbPulse 5s ease-in-out infinite;
}
.p2048-neon-line{
  position:fixed;z-index:0;pointer-events:none;
  height:2px;border-radius:1px;opacity:.12;
  background:linear-gradient(90deg,transparent,rgba(193,107,255,.6),rgba(224,64,251,.6),transparent);
}
.p2048-particle{
  position:fixed;z-index:0;pointer-events:none;border-radius:50%;
  background:rgba(199,125,255,.5);
  animation:particleDrift var(--dur,8s) linear infinite;
}
`

function loadFont(font) {
  if (!font || font === 'DM Sans') return
  const id = 'gf-' + font.replace(/\s/g, '-')
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id; link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800;900&display=swap`
  document.head.appendChild(link)
}

function playSound(url) {
  if (!url) return
  try { new Audio(url).play().catch(() => {}) } catch {}
}

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    const chordFreqs = [261.6, 329.6, 392, 523.3, 659.3]
    chordFreqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.06, t + 0.08)
      gain.gain.setValueAtTime(0.06, t + 0.6)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 1.4)
    })
    const arp = [523, 659, 784, 1047, 1319, 1568]
    arp.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, t + i * 0.09)
      gain.gain.setValueAtTime(0, t + i * 0.09)
      gain.gain.linearRampToValueAtTime(0.08, t + i * 0.09 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t + i * 0.09)
      osc.stop(t + i * 0.09 + 0.3)
    })
    const shimmer = ctx.createOscillator()
    const shimGain = ctx.createGain()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(2093, t + 0.6)
    shimmer.frequency.exponentialRampToValueAtTime(3136, t + 1.0)
    shimGain.gain.setValueAtTime(0, t + 0.6)
    shimGain.gain.linearRampToValueAtTime(0.03, t + 0.65)
    shimGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
    shimmer.connect(shimGain).connect(ctx.destination)
    shimmer.start(t + 0.6)
    shimmer.stop(t + 1.1)
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(65, t)
    subGain.gain.setValueAtTime(0.08, t)
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
    sub.connect(subGain).connect(ctx.destination)
    sub.start(t)
    sub.stop(t + 1.2)
    setTimeout(() => ctx.close(), 1500)
  } catch {}
}

function playLoseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    const chord = [392, 466.2, 554.4]
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.05)
      gain.gain.setValueAtTime(0, t + i * 0.05)
      gain.gain.linearRampToValueAtTime(0.06, t + i * 0.05 + 0.02)
      gain.gain.setValueAtTime(0.06, t + 0.8)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t + i * 0.05)
      osc.stop(t + 1.2)
    })
    const fall = [523, 440, 370, 294]
    fall.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, t + 0.3 + i * 0.15)
      gain.gain.setValueAtTime(0, t + 0.3 + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.07, t + 0.3 + i * 0.15 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + i * 0.15 + 0.25)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t + 0.3 + i * 0.15)
      osc.stop(t + 0.3 + i * 0.15 + 0.25)
    })
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(55, t)
    subGain.gain.setValueAtTime(0.06, t)
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0)
    sub.connect(subGain).connect(ctx.destination)
    sub.start(t)
    sub.stop(t + 1.0)
    setTimeout(() => ctx.close(), 1300)
  } catch {}
}

function playSlideSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    // Soft whoosh
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
    // Air texture
    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4) * 0.3
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.04, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    noise.connect(noiseGain).connect(ctx.destination)
    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.08)
    setTimeout(() => ctx.close(), 150)
  } catch {}
}

function playMergeCrash() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    // Soft warm pop
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(420, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12)
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc1.connect(gain1).connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.15)
    // Gentle chime
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08)
    gain2.gain.setValueAtTime(0.08, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc2.connect(gain2).connect(ctx.destination)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.1)
    // Soft click texture
    const bufferSize = ctx.sampleRate * 0.04
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6)
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    noise.connect(noiseGain).connect(ctx.destination)
    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.05)
    setTimeout(() => ctx.close(), 200)
  } catch {}
}

function vibrate(pattern) {
  try {
    const nav = window.navigator || navigator
    if (nav && nav.vibrate) {
      nav.vibrate(pattern || 10)
    }
  } catch (e) {}
}

// Ensure vibrate works on user gesture
function triggerVibrate(pattern) {
  vibrate(pattern)
}

function vibrateLight() { vibrate(6) }
function vibrateMedium() { vibrate(12) }
function vibrateHeavy() { vibrate(20) }
function vibrateMerge() { vibrate([8, 40, 8]) }
function vibrateWin() { vibrate([30, 80, 30, 80, 30, 80, 30]) }
function vibrateLose() { vibrate([80, 40, 80, 40, 80]) }
function vibrateButton() { vibrate(10) }

function getLuminance(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const TILE_COLORS = {
  2:    { bg: '#FFFFFF', tc: '#7B2EFF', glow: 'rgba(123,46,255,.00)', border: '#E8DEFF' },
  4:    { bg: '#F3EAFF', tc: '#7B2EFF', glow: 'rgba(123,46,255,.12)', border: '#DFD0FF' },
  8:    { bg: '#E6D4FF', tc: '#6B2BFF', glow: 'rgba(107,43,255,.18)', border: '#D0BBFF' },
  16:   { bg: '#D5B8FF', tc: '#5A1FD6', glow: 'rgba(90,31,214,.25)',  border: '#BFA0FF' },
  32:   { bg: '#C299FF', tc: '#4B1FB3', glow: 'rgba(100,31,214,.30)', border: '#A87FFF' },
  64:   { bg: '#AB75FF', tc: '#FFFFFF', glow: 'rgba(171,117,255,.35)', border: '#9255FF' },
  128:  { bg: '#9452FF', tc: '#FFFFFF', glow: 'rgba(148,82,255,.42)',  border: '#7C38FF' },
  256:  { bg: '#7C38FF', tc: '#FFFFFF', glow: 'rgba(124,56,255,.50)',  border: '#6420FF' },
  512:  { bg: '#6420FF', tc: '#FFFFFF', glow: 'rgba(100,32,255,.58)',  border: '#5010E6' },
  1024: { bg: '#5010D4', tc: '#FFFFFF', glow: 'rgba(80,16,212,.65)',   border: '#3C05B8' },
  2048: { bg: '#3A00A8', tc: '#FFFFFF', glow: 'rgba(58,0,168,.80)',    border: '#5A20E0', legendary: true },
  4096: { bg: '#280080', tc: '#FFFFFF', glow: 'rgba(40,0,128,.85)',    border: '#4810C0', legendary: true },
}

function getTileStyle(value) {
  if (TILE_COLORS[value]) return TILE_COLORS[value]
  if (value > 2048) return { bg: '#280080', tc: '#FFFFFF', glow: 'rgba(40,0,128,.90)', border: '#4810C0', legendary: true }
  return { bg: '#3A00A8', tc: '#FFFFFF', glow: 'rgba(58,0,168,.80)', border: '#5A20E0', legendary: true }
}

let tileIdCounter = 0
function nextTileId() { return ++tileIdCounter }

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

function addRandomTile(grid) {
  const empty = []
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (!grid[r][c]) empty.push([r, c])
  if (!empty.length) return false
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  grid[r][c] = { value: Math.random() < 0.9 ? 2 : 4, id: nextTileId() }
  return true
}

function slideRow(row) {
  const cells = row.filter(c => c !== null)
  let score = 0
  for (let i = 0; i < cells.length - 1; i++) {
    if (cells[i].value === cells[i + 1].value) {
      const v = cells[i].value * 2
      cells[i] = { value: v, id: nextTileId() }
      score += v
      cells.splice(i + 1, 1)
    }
  }
  while (cells.length < row.length) cells.push(null)
  return { row: cells, score }
}

function moveLeft(grid) {
  let ts = 0
  const g = grid.map(r => { const { row, score } = slideRow([...r]); ts += score; return row })
  return { grid: g, score: ts }
}
function moveRight(grid) {
  const rev = grid.map(r => [...r].reverse())
  const { grid: rg, score } = moveLeft(rev)
  return { grid: rg.map(r => [...r].reverse()), score }
}
function moveUp(grid) {
  const s = grid.length
  const t = Array.from({ length: s }, (_, c) => grid.map(r => r[c]))
  const { grid: tg, score } = moveLeft(t)
  return { grid: Array.from({ length: s }, (_, r) => tg.map(c => c[r])), score }
}
function moveDown(grid) {
  const s = grid.length
  const t = Array.from({ length: s }, (_, c) => grid.map(r => r[c]))
  const { grid: tg, score } = moveRight(t)
  return { grid: Array.from({ length: s }, (_, r) => tg.map(c => c[r])), score }
}

function gridToString(grid) {
  return grid.map(r => r.map(c => c ? c.value : 0).join(',')).join('|')
}

function isGameOver(grid) {
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++) {
      if (!grid[r][c]) return false
      const v = grid[r][c].value
      if (c + 1 < grid[0].length && grid[r][c + 1]?.value === v) return false
      if (r + 1 < grid.length && grid[r + 1]?.[c]?.value === v) return false
    }
  return true
}

function hasWon(grid, target) {
  return grid.some(r => r.some(c => c && c.value >= target))
}

/* ── Crystal SVG decoration ──────────────────────────────────────── */
function CrystalSVG({ size = 30, opacity = 0.08 }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 30 42" fill="none" style={{ opacity }}>
      <path d="M15 0L28 12L22 42H8L2 12Z" fill="url(#cryG)" />
      <path d="M15 0L8 12L15 42L22 12Z" fill="rgba(193,107,255,.3)" />
      <defs>
        <linearGradient id="cryG" x1="2" y1="0" x2="28" y2="42">
          <stop offset="0%" stopColor="#C66BFF" stopOpacity=".4" />
          <stop offset="100%" stopColor="#7B2EFF" stopOpacity=".1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Star SVG decoration ─────────────────────────────────────────── */
function StarSVG({ size = 12, opacity = 0.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ opacity }}>
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#D6B8FF" />
    </svg>
  )
}

/* ── Background layer ────────────────────────────────────────────── */
function BackgroundLayer() {
  return (
    <>
      <div className="p2048-bg" />
      <div className="p2048-vignette" />
      {/* Bloom orbs */}
      <div className="p2048-bloom" style={{ width: 400, height: 400, top: '5%', left: '-8%' }} />
      <div className="p2048-bloom" style={{ width: 300, height: 300, bottom: '10%', right: '-5%', animationDelay: '2s' }} />
      <div className="p2048-bloom" style={{ width: 250, height: 250, top: '45%', left: '50%', transform: 'translateX(-50%)', animationDelay: '4s' }} />
      {/* Wave pattern */}
      <div className="p2048-wave" />
      {/* Floating crystals */}
      {[
        { left: '8%', top: '12%', size: 28, delay: '0s', dur: '9s' },
        { left: '88%', top: '25%', size: 22, delay: '2s', dur: '11s' },
        { left: '15%', top: '70%', size: 18, delay: '4s', dur: '13s' },
        { left: '82%', top: '65%', size: 24, delay: '1s', dur: '10s' },
        { left: '50%', top: '8%', size: 16, delay: '3s', dur: '12s' },
      ].map((c, i) => (
        <div key={`cry-${i}`} className="p2048-crystal" style={{ left: c.left, top: c.top, animationDelay: c.delay, animationDuration: c.dur }}>
          <CrystalSVG size={c.size} />
        </div>
      ))}
      {/* Stars */}
      {[
        { left: '20%', top: '18%', size: 10, delay: '0s' },
        { left: '75%', top: '15%', size: 8, delay: '1s' },
        { left: '60%', top: '75%', size: 12, delay: '2s' },
        { left: '10%', top: '55%', size: 7, delay: '3s' },
        { left: '90%', top: '50%', size: 9, delay: '0.5s' },
        { left: '40%', top: '85%', size: 6, delay: '2.5s' },
        { left: '70%', top: '40%', size: 11, delay: '1.5s' },
      ].map((s, i) => (
        <div key={`st-${i}`} className="p2048-star" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
          <StarSVG size={s.size} />
        </div>
      ))}
      {/* Glowing orbs */}
      {[
        { left: '25%', top: '30%', size: 80, delay: '0s' },
        { left: '70%', top: '20%', size: 60, delay: '3s' },
        { left: '15%', top: '80%', size: 70, delay: '1.5s' },
        { left: '80%', top: '75%', size: 50, delay: '2s' },
      ].map((o, i) => (
        <div key={`ob-${i}`} className="p2048-orb" style={{ left: o.left, top: o.top, width: o.size, height: o.size, animationDelay: o.delay }} />
      ))}
      {/* Neon lines */}
      <div className="p2048-neon-line" style={{ left: '5%', top: '35%', width: 120, transform: 'rotate(25deg)' }} />
      <div className="p2048-neon-line" style={{ left: '80%', top: '55%', width: 90, transform: 'rotate(-20deg)' }} />
      <div className="p2048-neon-line" style={{ left: '45%', top: '15%', width: 100, transform: 'rotate(10deg)' }} />
      {/* Particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <div key={`pt-${i}`} className="p2048-particle" style={{
          left: `${8 + Math.random() * 84}%`,
          bottom: '-5px',
          width: 3 + Math.random() * 3,
          height: 3 + Math.random() * 3,
          '--dx': `${(Math.random() - 0.5) * 60}px`,
          '--dy': `${-40 - Math.random() * 80}px`,
          '--dur': `${6 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 10}s`,
        }} />
      ))}
    </>
  )
}

/* ── Confetti ────────────────────────────────────────────────────── */
function Confetti({ count = 50 }) {
  const colors = ['#C66BFF','#B14DFF','#FF5FD7','#E040FB','#FFD700','#8A2BE2','#D6B8FF','#F2E8FF']
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          position:'absolute', top:-20, left:`${Math.random()*100}%`,
          width:6+Math.random()*8, height:6+Math.random()*8,
          background:colors[i%colors.length],
          borderRadius:Math.random()>.5?'50%':'2px',
          animation:`confettiFall ${2+Math.random()*3}s ${Math.random()*2}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

export default function Game2048PlayerPage({ gameData, sessionToken, onComplete }) {
  const game = gameData
  const settings = game.settings || {}
  const soundMap = game.soundMap || {}

  const gridSize = parseInt(settings.grid_size) || 4
  const targetNumber = parseInt(settings.target_number) || 2048
  const showTimer = Number(settings.show_timer) === 1
  const timeLimit = parseInt(settings.time_limit_seconds) || 0

  const [phase, setPhase] = useState('intro')
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [grid, setGrid] = useState(null)
  const [tiles, setTiles] = useState([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [wonState, setWonState] = useState(false)
  const [lostState, setLostState] = useState(false)
  const [scoreAnim, setScoreAnim] = useState(false)
  const isCompleteRef = useRef(false)
  const soundMapRef = useRef(soundMap)
  const timerRef = useRef(null)
  const gridRef = useRef(null)
  const scoreRef = useRef(0)

  const tileColors = useMemo(() => {
    const raw = settings.tile_colors
    if (!raw) return null
    if (typeof raw === 'object') return raw
    try { return JSON.parse(raw) } catch { return null }
  }, [settings.tile_colors])

  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 400)
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isMobile = winW < 480
  const isSmall = winW < 360
  const padX = isMobile ? 16 : 20
  const maxC = Math.min(winW - padX * 2, 480)
  const cellSize = Math.max(isMobile ? 32 : 38, Math.min(isMobile ? 70 : 85, Math.floor((maxC - (gridSize + 1) * (isMobile ? 8 : 10)) / gridSize)))
  const gap = isMobile ? 8 : 10
  const boardSize = gridSize * cellSize + (gridSize + 1) * gap

  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])

  useEffect(() => { loadFont(settings.font_family) }, [settings.font_family])

  const initGame = useCallback(() => {
    tileIdCounter = 0
    const g = createEmptyGrid(gridSize)
    addRandomTile(g); addRandomTile(g)
    const flat = []
    for (let r = 0; r < g.length; r++)
      for (let c = 0; c < g[0].length; c++)
        if (g[r][c]) flat.push({ ...g[r][c], row: r, col: c })
    setGrid(g); setTiles(flat); gridRef.current = g
    setScore(0); scoreRef.current = 0
    setWonState(false); setLostState(false)
  }, [gridSize])

  const handleMove = useCallback((direction) => {
    const g = gridRef.current
    if (!g || wonState || lostState) return
    const before = gridToString(g)
    let result
    switch (direction) {
      case 'left': result = moveLeft(g); break
      case 'right': result = moveRight(g); break
      case 'up': result = moveUp(g); break
      case 'down': result = moveDown(g); break
      default: return
    }
    if (before === gridToString(result.grid)) return
    playSlideSound()
    playSound(resolveSound(settings.sound_slide_id))
    try { navigator.vibrate(6) } catch {}
    if (result.score > 0) {
      playMergeCrash()
      playSound(resolveSound(settings.sound_merge_id))
      try { navigator.vibrate([8, 40, 8]) } catch {}
    }
    const ns = scoreRef.current + result.score
    scoreRef.current = ns; setScore(ns); setScoreAnim(true)
    setTimeout(() => setScoreAnim(false), 200)
    if (ns > bestScore) {
      setBestScore(ns)
      try { localStorage.setItem('g2048_best_' + game.id, String(ns)) } catch {}
    }
    addRandomTile(result.grid); gridRef.current = result.grid
    const flat = []
    for (let r = 0; r < result.grid.length; r++)
      for (let c = 0; c < result.grid[0].length; c++)
        if (result.grid[r][c]) flat.push({ ...result.grid[r][c], row: r, col: c })
    setGrid(result.grid); setTiles(flat)
    if (hasWon(result.grid, targetNumber) && !wonState) {
      setWonState(true); playWinSound(); playSound(resolveSound(settings.sound_win_id))
      try { navigator.vibrate([30, 80, 30, 80, 30, 80, 30]) } catch {}
      return
    }
    if (isGameOver(result.grid)) {
      setLostState(true); playLoseSound(); playSound(resolveSound(settings.sound_lose_id))
      try { navigator.vibrate([80, 40, 80, 40, 80]) } catch {}
      clearInterval(timerRef.current)
    }
  }, [wonState, lostState, bestScore, targetNumber, settings, resolveSound, game.id])

  useEffect(() => {
    if (phase !== 'playing') return
    initGame()
    setBestScore(prev => { try { const s = localStorage.getItem('g2048_best_' + game.id); return s ? Math.max(prev, parseInt(s)) : prev } catch { return prev } })
  }, [phase, initGame, game.id])

  useEffect(() => {
    if (phase !== 'playing' || !showTimer || timeLimit <= 0) return
    setTimeLeft(timeLimit)
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); setLostState(true); playLoseSound(); playSound(resolveSound(settings.sound_lose_id)); return 0 } return p - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, showTimer, timeLimit, settings, resolveSound])

  useEffect(() => {
    if (phase !== 'playing') return
    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); handleMove('up'); break
        case 'ArrowDown': e.preventDefault(); handleMove('down'); break
        case 'ArrowLeft': e.preventDefault(); handleMove('left'); break
        case 'ArrowRight': e.preventDefault(); handleMove('right'); break
      }
    }
    window.addEventListener('keydown', handleKey)
    let ts = null
    const onStart = (e) => {
      // Vibrate directly in user gesture context
      try { navigator.vibrate(6) } catch {}
      ts = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onEnd = (e) => {
      if (!ts) return
      const dx = e.changedTouches[0].clientX - ts.x
      const dy = e.changedTouches[0].clientY - ts.y
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) handleMove(dx > 0 ? 'right' : 'left')
      else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) handleMove(dy > 0 ? 'down' : 'up')
      ts = null
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd) }
  }, [handleMove])

  const handleStart = () => {
    const errors = {}
    if (!formData.full_name.trim()) errors.full_name = 'Required'
    if (!formData.email.trim()) errors.email = 'Required'
    if (!formData.phone.trim()) errors.phone = 'Required'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try { navigator.vibrate(10) } catch {}
    setTimeout(() => { setSubmitting(false); setPhase('playing') }, 300)
  }

  const handleKeepGoing = () => { try { navigator.vibrate(10) } catch {}; setWonState(false) }

  const handleClaimPrize = async () => {
    try { navigator.vibrate(10) } catch {}
    if (isCompleteRef.current) return
    isCompleteRef.current = true; clearInterval(timerRef.current)
    if (!sessionToken) { onComplete?.({ redirect_url: game.redirect_url }); return }
    try { const r = await api.post('/play/session/complete', { session_token: sessionToken, score: scoreRef.current, player_data: { game_type: '2048', grid_size: gridSize, target_number: targetNumber, won: true } }); onComplete?.(r.data) }
    catch { onComplete?.({ redirect_url: game.redirect_url }) }
  }

  const handleGameOver = async () => {
    try { navigator.vibrate(10) } catch {}
    if (isCompleteRef.current) return
    isCompleteRef.current = true; clearInterval(timerRef.current)
    if (!sessionToken) { onComplete?.({ redirect_url: game.redirect_url }); return }
    try { const r = await api.post('/play/session/complete', { session_token: sessionToken, score: scoreRef.current, player_data: { game_type: '2048', grid_size: gridSize, target_number: targetNumber, won: false } }); onComplete?.(r.data) }
    catch { onComplete?.({ redirect_url: game.redirect_url }) }
  }

  const handleNewGame = () => {
    try { navigator.vibrate(12) } catch {}
    initGame(); setWonState(false); setLostState(false)
    if (showTimer && timeLimit > 0) setTimeLeft(timeLimit)
  }

  const animIn = settings.overlay_animation_in || 'flyFromBottom'

  /* ── Intro Phase ──────────────────────────────────────────────── */
  if (phase === 'intro') {
    const floatingTiles = [
      { value: 2, x: '8%', y: '18%', rot: -12, size: 64, opacity: 0.35 },
      { value: 4, x: '18%', y: '8%', rot: 8, size: 58, opacity: 0.3 },
      { value: 8, x: '6%', y: '72%', rot: -6, size: 60, opacity: 0.28 },
      { value: 16, x: '20%', y: '80%', rot: 10, size: 56, opacity: 0.25 },
      { value: 32, x: '88%', y: '20%', rot: -8, size: 62, opacity: 0.32 },
      { value: 64, x: '90%', y: '50%', rot: 5, size: 58, opacity: 0.28 },
      { value: 128, x: '82%', y: '75%', rot: -10, size: 64, opacity: 0.25 },
      { value: 256, x: '92%', y: '85%', rot: 7, size: 58, opacity: 0.22 },
    ]

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
        padding: '20px 16px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #2A004F 0%, #350068 25%, #4B0082 50%, #5E10A0 75%, #7B2EFF 100%)',
      }}>
        <style>{STYLES}</style>

        {/* Background glow effects */}
        <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,46,255,.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(90,31,214,.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

        {/* Floating 2048 tiles */}
        {floatingTiles.map((t, i) => (
          <div key={i} style={{
            position: 'fixed', left: t.x, top: t.y, zIndex: 0, pointerEvents: 'none',
            width: t.size, height: t.size, borderRadius: 14,
            background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(' + t.rot + 'deg)', opacity: t.opacity,
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,.2)',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: (i * 0.7) + 's',
          }}>
            <span style={{ fontSize: t.size * 0.4, fontWeight: 800, color: 'rgba(255,255,255,.6)' }}>{t.value}</span>
          </div>
        ))}

        {/* Sparkle stars */}
        {[
          { left: '12%', top: '25%', delay: '0s' },
          { left: '25%', top: '12%', delay: '1.2s' },
          { left: '85%', top: '30%', delay: '0.5s' },
          { left: '78%', top: '65%', delay: '1.8s' },
          { left: '15%', top: '60%', delay: '2.2s' },
          { left: '92%', top: '15%', delay: '0.8s' },
        ].map((s, i) => (
          <div key={'star-' + i} style={{
            position: 'fixed', left: s.left, top: s.top, zIndex: 0, pointerEvents: 'none',
            animation: 'sparkle 3s ease-in-out infinite',
            animationDelay: s.delay,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="rgba(255,255,255,.5)" />
            </svg>
          </div>
        ))}

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Title: 2048 */}
          <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: .7 }}>
                <path d="M11 0L13 8L22 11L13 14L11 22L9 14L0 11L9 8Z" fill="url(#sp1)" />
                <defs><linearGradient id="sp1" x1="0" y1="0" x2="22" y2="22"><stop offset="0%" stopColor="#C66BFF" /><stop offset="100%" stopColor="#7B2EFF" /></linearGradient></defs>
              </svg>
              <h1 style={{
                fontSize: isSmall ? 42 : isMobile ? 52 : 60, fontWeight: 900, margin: 0,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E0C0FF 50%, #C66BFF 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(193,107,255,.5))',
                letterSpacing: -2,
              }}>
                {settings.heading_1 || '2048'}
              </h1>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: .7 }}>
                <path d="M11 0L13 8L22 11L13 14L11 22L9 14L0 11L9 8Z" fill="url(#sp2)" />
                <defs><linearGradient id="sp2" x1="0" y1="0" x2="22" y2="22"><stop offset="0%" stopColor="#C66BFF" /><stop offset="100%" stopColor="#7B2EFF" /></linearGradient></defs>
              </svg>
            </div>
            {/* Decorative line */}
            <div style={{ width: 120, height: 2, margin: '10px auto 0', background: 'linear-gradient(90deg, transparent, rgba(193,107,255,.6), transparent)', borderRadius: 1 }} />
          </div>

          {/* Glassmorphism Card */}
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'rgba(42,0,79,.65)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            border: '1.5px solid rgba(193,107,255,.35)',
            borderRadius: 24,
            padding: isMobile ? '28px 22px 32px' : '32px 28px 36px',
            boxShadow: '0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08)',
            position: 'relative',
          }}>
            {/* Logo at top */}
            <div style={{
              position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
              width: 56, height: 56, borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid rgba(139,92,246,.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139,92,246,.25), 0 4px 12px rgba(0,0,0,.15)',
              overflow: 'hidden',
            }}>
              {/* Glossy highlight */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,.1) 60%, transparent 100%)',
                borderRadius: '50%', pointerEvents: 'none',
              }} />
              <img src="/favicon.png" alt="Logo" style={{ width: '75%', height: '75%', objectFit: 'contain', borderRadius: '50%', position: 'relative', zIndex: 1 }} />
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B2EFF, #5A1FD6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" fill="#fff" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#fff" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={e => { setFormData({...formData, full_name: e.target.value}); setFormErrors({...formErrors, full_name: ''}) }}
                  style={{
                    width: '100%', padding: '14px 14px 14px 56px', borderRadius: 12,
                    border: formErrors.full_name ? '2px solid #ef4444' : '1.5px solid rgba(193,107,255,.3)',
                    background: 'rgba(255,255,255,.08)', color: '#fff',
                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color .2s, box-shadow .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(123,46,255,.3)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#fff" strokeWidth="1.5" fill="none" /><circle cx="8" cy="8" r="2" fill="#fff" /></svg>
                </div>
              </div>
              {formErrors.full_name && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0' }}>{formErrors.full_name}</p>}
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B2EFF, #5A1FD6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" fill="#fff" /><path d="M1 5l7 4 7-4" stroke="#5A1FD6" strokeWidth="1.5" fill="none" /></svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={e => { setFormData({...formData, email: e.target.value}); setFormErrors({...formErrors, email: ''}) }}
                  style={{
                    width: '100%', padding: '14px 14px 14px 56px', borderRadius: 12,
                    border: formErrors.email ? '2px solid #ef4444' : '1.5px solid rgba(193,107,255,.3)',
                    background: 'rgba(255,255,255,.08)', color: '#fff',
                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color .2s, box-shadow .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(123,46,255,.3)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#fff" strokeWidth="1.5" fill="none" /><path d="M1 5l7 4 7-4" stroke="#fff" strokeWidth="1.5" fill="none" /></svg>
                </div>
              </div>
              {formErrors.email && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0' }}>{formErrors.email}</p>}
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B2EFF, #5A1FD6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#fff" strokeWidth="1.5" fill="none" /><circle cx="8" cy="12" r="1" fill="#fff" /></svg>
                </div>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={e => { setFormData({...formData, phone: e.target.value}); setFormErrors({...formErrors, phone: ''}) }}
                  style={{
                    width: '100%', padding: '14px 14px 14px 56px', borderRadius: 12,
                    border: formErrors.phone ? '2px solid #ef4444' : '1.5px solid rgba(193,107,255,.3)',
                    background: 'rgba(255,255,255,.08)', color: '#fff',
                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color .2s, box-shadow .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(123,46,255,.3)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="#fff" strokeWidth="1.5" fill="none" /><line x1="6" y1="13" x2="10" y2="13" stroke="#fff" strokeWidth="1" /></svg>
                </div>
              </div>
              {formErrors.phone && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0' }}>{formErrors.phone}</p>}
            </div>

            {/* Start Game Button */}
            <button onClick={handleStart} disabled={submitting} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #9D5CFF 0%, #7B2EFF 50%, #5A1FD6 100%)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: .5,
              boxShadow: '0 10px 30px rgba(90,31,214,.5), 0 4px 12px rgba(90,31,214,.3), inset 0 1px 0 rgba(255,255,255,.2)',
              opacity: submitting ? .7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all .2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 14px 40px rgba(90,31,214,.6), 0 6px 16px rgba(90,31,214,.35), inset 0 1px 0 rgba(255,255,255,.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(90,31,214,.5), 0 4px 12px rgba(90,31,214,.3), inset 0 1px 0 rgba(255,255,255,.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(90,31,214,.4), 0 2px 6px rgba(90,31,214,.2), inset 0 1px 0 rgba(255,255,255,.15)'; e.currentTarget.style.transform = 'translateY(2px)' }}
              onMouseUp={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(90,31,214,.5), 0 4px 12px rgba(90,31,214,.3), inset 0 1px 0 rgba(255,255,255,.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {submitting ? 'Starting...' : 'Start Game'}
              {!submitting && <span style={{ fontSize: 18 }}>→</span>}
            </button>
          </div>

          {/* Footer text */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textAlign: 'center', margin: '24px 0 0', letterSpacing: .3 }}>
            Join the numbers. Reach <span style={{ color: '#C66BFF', fontWeight: 700 }}>2048</span>!
          </p>

          {/* Logo / Game Logo */}
          {settings.game_logo_url && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <img src={settings.game_logo_url} alt="" style={{ height: 40, objectFit: 'contain', opacity: .8 }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Playing Phase ────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
      padding: '12px 16px 24px', position: 'relative', overflow: 'hidden', color: '#F2E8FF',
    }}>
      <style>{STYLES}</style>
      <BackgroundLayer />

      {/* Radial glow behind board */}
      <div style={{
        position: 'fixed', top: '42%', left: '50%', transform: 'translate(-50%,-50%)',
        width: boardSize * 1.6, height: boardSize * 1.6,
        background: 'radial-gradient(circle, rgba(123,46,255,.22) 0%, rgba(193,107,255,.08) 40%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: Math.max(boardSize + 20, 360), margin: '0 auto' }}>

        {/* ── Title ─────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative' }}>
          {/* Left leaf */}
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style={{ position:'absolute', left: '15%', top: '50%', transform: 'translateY(-50%) rotate(-15deg)', opacity: .18 }}>
            <path d="M14 0C14 0 28 12 28 22C28 30 22 36 14 36C6 36 0 30 0 22C0 12 14 0 14 0Z" fill="#C66BFF" />
            <path d="M14 6V32" stroke="#D6B8FF" strokeWidth="1" opacity=".4" />
          </svg>
          <div style={{ position:'relative', display:'inline-block' }}>
            <h1 style={{
              fontSize: isSmall ? 32 : isMobile ? 38 : 42, fontWeight: 900, margin: 0, letterSpacing: isSmall ? -1 : -2,
              background: 'linear-gradient(135deg, #C58EFF 0%, #8C3DFF 30%, #6F25E8 60%, #C58EFF 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 18px rgba(123,46,255,.6)) drop-shadow(0 0 36px rgba(140,61,255,.3))',
              animation: 'shimmer 4s ease-in-out infinite',
            }}>
              2048
            </h1>
            {/* Glow underline */}
            <div style={{
              width: '80%', height: 3, margin: '2px auto 0',
              background: 'linear-gradient(90deg, transparent, #C58EFF, #8C3DFF, #C58EFF, transparent)',
              borderRadius: 2, boxShadow: '0 0 12px rgba(140,61,255,.6), 0 0 24px rgba(123,46,255,.3)',
            }} />
          </div>
          {/* Right leaf */}
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style={{ position:'absolute', right: '15%', top: '50%', transform: 'translateY(-50%) rotate(15deg) scaleX(-1)', opacity: .18 }}>
            <path d="M14 0C14 0 28 12 28 22C28 30 22 36 14 36C6 36 0 30 0 22C0 12 14 0 14 0Z" fill="#C66BFF" />
            <path d="M14 6V32" stroke="#D6B8FF" strokeWidth="1" opacity=".4" />
          </svg>
          {/* Sparkles */}
          {[
            { left: '8%', top: '20%', size: 6, delay: '0s' },
            { right: '8%', top: '15%', size: 5, delay: '1s' },
            { left: '25%', top: '5%', size: 4, delay: '2s' },
            { right: '25%', top: '0%', size: 5, delay: '1.5s' },
          ].map((s, i) => (
            <div key={`msp-${i}`} className="p2048-star" style={{ position:'absolute', ...s, animationDuration: '3s' }}>
              <StarSVG size={s.size} opacity={0.6} />
            </div>
          ))}
        </div>

        {/* ── Score panels ──────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'center', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 10 : 14 }}>
          {/* Score */}
          <div style={{
            background: 'rgba(42,0,79,.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(193,107,255,.35)', borderRadius: isMobile ? 12 : 14,
            padding: isMobile ? '6px 12px' : '8px 18px', textAlign: 'center', minWidth: isMobile ? 72 : 90,
            boxShadow: '0 0 20px rgba(123,46,255,.15), inset 0 1px 0 rgba(255,255,255,.06)',
          }}>
            <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: '#C58EFF', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5L11 5.5L8.5 8L9 11.5L6 10L3 11.5L3.5 8L1 5.5L4.5 4.5Z" fill="#C58EFF" /></svg>
              Score
            </div>
            <div style={{
              fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#fff', marginTop: 2,
              textShadow: '0 0 10px rgba(140,61,255,.5)',
              animation: scoreAnim ? 'scorePop .2s ease' : 'none',
            }}>{score}</div>
          </div>
          {/* Best */}
          <div style={{
            background: 'rgba(42,0,79,.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(193,107,255,.35)', borderRadius: isMobile ? 12 : 14,
            padding: isMobile ? '6px 12px' : '8px 18px', textAlign: 'center', minWidth: isMobile ? 72 : 90,
            boxShadow: '0 0 20px rgba(123,46,255,.15), inset 0 1px 0 rgba(255,255,255,.06)',
          }}>
            <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: '#C58EFF', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 0L7.8 4L12 4.6L9 7.5L9.6 12L6 10L2.4 12L3 7.5L0 4.6L4.2 4Z" fill="#C58EFF" /></svg>
              Best
            </div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#fff', marginTop: 2, textShadow: '0 0 10px rgba(140,61,255,.5)' }}>{bestScore}</div>
          </div>
          {/* Timer */}
          {showTimer && timeLimit > 0 && (
            <div style={{
              background: timeLeft <= 10 ? 'rgba(255,60,120,.25)' : 'rgba(42,0,79,.65)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: `1.5px solid ${timeLeft <= 10 ? 'rgba(255,60,120,.5)' : 'rgba(193,107,255,.35)'}`,
              borderRadius: isMobile ? 12 : 14, padding: isMobile ? '6px 12px' : '8px 18px', textAlign: 'center', minWidth: isMobile ? 60 : 75,
              boxShadow: timeLeft <= 10 ? '0 0 24px rgba(255,60,120,.25)' : '0 0 20px rgba(123,46,255,.15)',
              animation: timeLeft <= 10 ? 'neonPulse 1s ease-in-out infinite' : 'none',
            }}>
              <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: '#C58EFF', textTransform: 'uppercase', letterSpacing: 1 }}>Time</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: timeLeft <= 10 ? '#C58EFF' : '#fff', marginTop: 2, textShadow: timeLeft <= 10 ? '0 0 12px rgba(197,142,255,.6)' : '0 0 10px rgba(140,61,255,.5)' }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* ── Game Board ────────────────────────────────────────── */}
        <div style={{
          position: 'relative', width: boardSize, height: boardSize, margin: '0 auto',
          background: 'linear-gradient(145deg, rgba(28,0,52,.94) 0%, rgba(18,0,38,.96) 100%)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '2px solid rgba(140,61,255,.3)',
          borderRadius: Math.max(14, Math.min(28, cellSize * 0.35)), padding: gap, boxSizing: 'border-box',
          boxShadow: `
            0 0 60px rgba(123,46,255,.18),
            0 0 120px rgba(123,46,255,.06),
            0 20px 60px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.05),
            inset 0 -1px 0 rgba(0,0,0,.3)
          `,
        }}>
          {/* Glossy top reflection */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,.06) 0%, transparent 100%)',
            borderRadius: isMobile ? '18px 18px 0 0' : '24px 24px 0 0', pointerEvents: 'none', zIndex: 1,
          }} />
          {/* Empty cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            gap: `${gap}px`,
          }}>
            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
              <div key={i} style={{
                width: cellSize, height: cellSize,
                background: 'rgba(30,5,65,.5)',
                borderRadius: Math.max(10, Math.min(20, cellSize * 0.22)),
                border: '1px solid rgba(80,30,160,.08)',
              }} />
            ))}
          </div>
          {/* Tiles */}
          {tiles.map(tile => {
            const ts = getTileStyle(tile.value)
            const fs = tile.value >= 10000 ? cellSize * 0.22 : tile.value >= 1000 ? cellSize * 0.28 : tile.value >= 100 ? cellSize * 0.36 : cellSize * 0.42
            const isLegendary = ts.legendary
            const isNew = tile.id === tileIdCounter
            return (
              <div key={tile.id} style={{
                position: 'absolute', top: 0, left: 0,
                width: cellSize, height: cellSize,
                borderRadius: Math.max(10, Math.min(20, cellSize * 0.22)),
                background: `linear-gradient(145deg, ${ts.bg} 0%, ${ts.bg} 35%, ${ts.bg}cc 70%, ${ts.bg}aa 100%)`,
                color: ts.tc,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: fs,
                transition: 'transform 60ms ease-out',
                transform: `translate(${tile.col * (cellSize + gap) + gap}px, ${tile.row * (cellSize + gap) + gap}px)`,
                zIndex: 10,
                animation: isNew
                  ? 'borderGlow .35s ease-out'
                  : isLegendary ? 'legendaryGlow 3s ease-in-out infinite' : 'none',
                lineHeight: 1,
                boxShadow: [
                  // Ambient shadow - large, diffused, lifts tile 8-10px
                  '0 16px 32px -4px rgba(0,0,0,.3)',
                  // Contact shadow - tight, darker, simulates board contact
                  '0 6px 12px -2px rgba(0,0,0,.22)',
                  // Purple ambient glow
                  `0 0 20px -4px ${ts.glow}`,
                  // Inner top-left highlight - volume
                  'inset 2px 2px 6px rgba(255,255,255,.45)',
                  // Inner bottom-right shadow - depth
                  'inset -2px -2px 8px rgba(0,0,0,.12)',
                  // Inner bottom shadow - stronger
                  'inset 0 -4px 8px rgba(0,0,0,.1)',
                ].join(', '),
                border: `1px solid ${ts.border || 'rgba(255,255,255,.08)'}`,
                textShadow: isLegendary
                  ? '0 2px 4px rgba(0,0,0,.5), 0 0 16px rgba(255,255,255,.5)'
                  : '0 1px 3px rgba(0,0,0,.3)',
              }}>
                {/* Gloss reflection - top 20% */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,.15) 50%, transparent 100%)',
                  borderRadius: '20px 20px 0 0', pointerEvents: 'none',
                }} />
                {/* Top edge highlight - bright from top-left light */}
                <div style={{
                  position: 'absolute', top: 0, left: 8, right: 8, height: 2,
                  background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,.7) 30%, rgba(255,255,255,.8) 50%, rgba(255,255,255,.5) 70%, transparent 95%)',
                  borderRadius: '20px 20px 0 0', pointerEvents: 'none',
                }} />
                {/* Left edge highlight - top-left light source */}
                <div style={{
                  position: 'absolute', top: 8, left: 0, bottom: 8, width: 2,
                  background: 'linear-gradient(180deg, transparent 5%, rgba(255,255,255,.5) 30%, rgba(255,255,255,.3) 70%, transparent 95%)',
                  borderRadius: '20px 0 0 20px', pointerEvents: 'none',
                }} />
                {/* Bottom-right darkening - opposite of light source */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
                  background: 'linear-gradient(0deg, rgba(0,0,0,.1) 0%, transparent 100%)',
                  borderRadius: '0 0 20px 20px', pointerEvents: 'none',
                }} />
                {/* Right edge darkening */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: '10%',
                  background: 'linear-gradient(270deg, rgba(0,0,0,.06) 0%, transparent 100%)',
                  borderRadius: '0 20px 20px 0', pointerEvents: 'none',
                }} />
                {/* Legendary sparkle effects */}
                {isLegendary && (
                  <>
                    <div style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, background: 'radial-gradient(circle, rgba(255,255,255,.95) 0%, transparent 70%)', borderRadius: '50%', animation: 'sparkleFloat 2s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: 6, left: 8, width: 5, height: 5, background: 'radial-gradient(circle, rgba(255,255,255,.8) 0%, transparent 70%)', borderRadius: '50%', animation: 'sparkleFloat 2.5s ease-in-out infinite .5s' }} />
                    <div style={{ position: 'absolute', top: '35%', left: 5, width: 4, height: 4, background: 'radial-gradient(circle, rgba(255,255,255,.7) 0%, transparent 70%)', borderRadius: '50%', animation: 'sparkleFloat 3s ease-in-out infinite 1s' }} />
                  </>
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{tile.value}</span>
              </div>
            )
          })}
        </div>

        {/* ── New Game Button ───────────────────────────────────── */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleNewGame} style={{
            padding: isMobile ? '10px 28px' : '12px 36px', borderRadius: 50,
            border: '1.5px solid rgba(193,107,255,.45)',
            background: 'linear-gradient(135deg, #8C3DFF 0%, #6F25E8 50%, #5618C9 100%)',
            color: '#fff', fontSize: isMobile ? 13 : 15, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: .5,
            boxShadow: '0 8px 24px rgba(86,24,201,.45), 0 3px 10px rgba(86,24,201,.25), inset 0 1px 0 rgba(255,255,255,.2)',
            textShadow: '0 1px 3px rgba(0,0,0,.3)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all .2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(86,24,201,.55), 0 5px 14px rgba(86,24,201,.3), inset 0 1px 0 rgba(255,255,255,.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(86,24,201,.45), 0 3px 10px rgba(86,24,201,.25), inset 0 1px 0 rgba(255,255,255,.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
            onMouseDown={e => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(86,24,201,.35), 0 1px 5px rgba(86,24,201,.2), inset 0 1px 0 rgba(255,255,255,.15)'; e.currentTarget.style.transform = 'translateY(2px)' }}
            onMouseUp={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(86,24,201,.45), 0 3px 10px rgba(86,24,201,.25), inset 0 1px 0 rgba(255,255,255,.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.3))' }}>
              <path d="M13.65 2.35A7.96 7.96 0 008 0a8 8 0 108 8h-2A6 6 0 018 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor" />
            </svg>
            {settings.new_game_button_text || 'NEW GAME'}
          </button>
        </div>
      </div>

      {/* ═══ WON OVERLAY ═══ */}
      {wonState && !lostState && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1a0033 0%, #2a0055 50%, #1a0033 100%)', animation:'fadeIn .3s ease' }}>
          {/* Floating confetti pieces */}
          {Array.from({length:20}).map((_,i) => (
            <div key={'conf-'+i} style={{
              position:'absolute', left: Math.random()*100+'%', top: -20,
              width: 8+Math.random()*8, height: 8+Math.random()*8,
              background: ['#9D5CFF','#E040FB','#FFD700','#00E5FF','#FF6D00'][i%5],
              borderRadius: i%3===0 ? '50%' : '2px',
              animation: 'confettiFall '+(2+Math.random()*3)+'s linear infinite',
              animationDelay: Math.random()*3+'s',
              opacity: .7+Math.random()*.3,
              transform: 'rotate('+Math.random()*360+'deg)',
            }} />
          ))}
          {/* Floating stars */}
          {Array.from({length:12}).map((_,i) => (
            <div key={'star-'+i} style={{
              position:'absolute', left: Math.random()*100+'%', top: Math.random()*100+'%',
              width: 4+Math.random()*4, height: 4+Math.random()*4,
              background: 'rgba(255,255,255,.6)',
              borderRadius: '50%',
              animation: 'sparkle '+(1.5+Math.random()*2)+'s ease-in-out infinite',
              animationDelay: Math.random()*2+'s',
            }} />
          ))}
          {/* Floating particles */}
          {Array.from({length:8}).map((_,i) => (
            <div key={'part-'+i} style={{
              position:'absolute', left: Math.random()*100+'%', bottom: 0,
              width: 3+Math.random()*4, height: 3+Math.random()*4,
              background: 'rgba(157,92,255,.5)',
              borderRadius: '50%',
              animation: 'floatUp '+(4+Math.random()*4)+'s linear infinite',
              animationDelay: Math.random()*4+'s',
            }} />
          ))}

          {/* Popup card */}
          <div style={{ textAlign:'center', animation:'popupIn .5s cubic-bezier(.34,1.56,.64,1)', padding:'0 24px', width:'100%', maxWidth:380 }}>
            <div style={{
              background:'rgba(30,0,60,.75)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
              border:'1.5px solid rgba(157,92,255,.4)', borderRadius:28,
              padding:'36px 28px 32px', maxWidth:360, margin:'0 auto',
              boxShadow:'0 0 80px rgba(123,46,255,.2), 0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)',
            }}>
              {/* Party popper icon */}
              <div style={{ marginBottom:20, filter:'drop-shadow(0 0 24px rgba(160,80,255,.5))' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  {/* Purple cone - tilted left */}
                  <g transform="rotate(-25, 40, 55)">
                    {/* Cone body */}
                    <path d="M25 75L35 40Q37 35 42 35Q47 35 49 40L59 75Q59 78 56 78L28 78Q25 78 25 75Z" fill="url(#ppCone)"/>
                    {/* Cone highlight */}
                    <path d="M30 72L37 45Q38 42 40 42L42 42" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    {/* Cone shadow */}
                    <path d="M48 44L55 72" stroke="rgba(0,0,0,.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </g>
                  {/* Confetti dots - yellow */}
                  <circle cx="42" cy="20" r="4" fill="#FFD700"/>its
                  <circle cx="58" cy="28" r="3.5" fill="#FFD700"/>
                  <circle cx="32" cy="14" r="3" fill="#FFD700"/>
                  <circle cx="52" cy="12" r="2.5" fill="#FFD700"/>
                  {/* Confetti dots - pink */}
                  <circle cx="48" cy="16" r="3.5" fill="#FF4081"/>
                  <circle cx="36" cy="24" r="2.5" fill="#FF4081"/>
                  {/* Confetti dots - cyan */}
                  <circle cx="60" cy="20" r="3" fill="#00E5FF"/>
                  <circle cx="38" cy="10" r="2" fill="#00E5FF"/>
                  {/* Confetti streamers - orange curved */}
                  <path d="M44 32Q50 20 56 24Q62 28 58 34" stroke="#FF9100" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  {/* Confetti streamers - blue curved */}
                  <path d="M46 30Q56 18 62 22Q68 26 64 32" stroke="#2979FF" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  {/* Confetti streamers - pink curved */}
                  <path d="M42 28Q36 16 30 20Q24 24 28 30" stroke="#E040FB" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  {/* Confetti streamers - cyan curved */}
                  <path d="M40 26Q44 14 50 16Q56 18 52 24" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>

              {/* Title */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:4 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#C58EFF" opacity=".7"/></svg>
                <h2 style={{ fontSize:26, fontWeight:900, margin:0, color:'#fff', letterSpacing:-.5 }}>Yay! You completed</h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#C58EFF" opacity=".7"/></svg>
              </div>
              <p style={{ fontSize:24, fontWeight:900, margin:'0 0 24px', background:'linear-gradient(135deg,#C58EFF,#9D5CFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>the game!</p>

              {/* Success message */}
              <div style={{
                background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(157,92,255,.3)',
                borderRadius:14, padding:'14px 20px', marginBottom:20,
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              }}>
                <div style={{
                  width:28, height:28, borderRadius:8,
                  background:'linear-gradient(135deg,#9D5CFF,#7B2EFF)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 2px 8px rgba(157,92,255,.4)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize:15, fontWeight:600, color:'#D6B8FF' }}>Thank you for completing!</span>
              </div>

              {/* Continue button */}
              <button onClick={handleClaimPrize} style={{
                width:'100%', padding:'18px', borderRadius:50, border:'none',
                background:'linear-gradient(135deg,#B97AFF 0%,#9D5CFF 40%,#7B2EFF 100%)',
                color:'#fff', fontSize:17, fontWeight:800, cursor:'pointer',
                fontFamily:'inherit', letterSpacing:.3,
                boxShadow:'0 0 30px rgba(157,92,255,.4), 0 8px 24px rgba(123,46,255,.35), inset 0 2px 0 rgba(255,255,255,.25), inset 0 -2px 6px rgba(0,0,0,.15)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transition:'all .2s ease',
                position:'relative', overflow:'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 40px rgba(157,92,255,.5), 0 12px 32px rgba(123,46,255,.45), inset 0 2px 0 rgba(255,255,255,.3), inset 0 -2px 6px rgba(0,0,0,.15)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 30px rgba(157,92,255,.4), 0 8px 24px rgba(123,46,255,.35), inset 0 2px 0 rgba(255,255,255,.25), inset 0 -2px 6px rgba(0,0,0,.15)'; e.currentTarget.style.transform='translateY(0)' }}
                onMouseDown={e => { e.currentTarget.style.boxShadow='0 0 15px rgba(157,92,255,.3), 0 3px 10px rgba(123,46,255,.25), inset 0 2px 0 rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.15)'; e.currentTarget.style.transform='translateY(2px)' }}
                onMouseUp={e => { e.currentTarget.style.boxShadow='0 0 30px rgba(157,92,255,.4), 0 8px 24px rgba(123,46,255,.35), inset 0 2px 0 rgba(255,255,255,.25), inset 0 -2px 6px rgba(0,0,0,.15)'; e.currentTarget.style.transform='translateY(0)' }}
              >
                <span style={{ fontSize:20 }}>🚀</span>
                {settings.claim_prize_button_text || 'Continue'}
                <span style={{ fontSize:18, marginLeft:4 }}>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LOST OVERLAY ═══ */}
      {lostState && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1a0033 0%, #2a0055 50%, #1a0033 100%)', animation:'fadeIn .3s ease' }}>
          {Array.from({length:8}).map((_,i) => (
            <div key={'lpart-'+i} style={{
              position:'absolute', left: Math.random()*100+'%', bottom: 0,
              width: 3+Math.random()*4, height: 3+Math.random()*4,
              background: 'rgba(157,92,255,.4)',
              borderRadius: '50%',
              animation: 'floatUp '+(4+Math.random()*4)+'s linear infinite',
              animationDelay: Math.random()*4+'s',
            }} />
          ))}
          <div style={{ textAlign:'center', animation:'popupIn .5s cubic-bezier(.34,1.56,.64,1)', padding:'0 24px', width:'100%', maxWidth:380 }}>
            <div style={{
              background:'rgba(30,0,60,.75)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
              border:'1.5px solid rgba(157,92,255,.4)', borderRadius:28,
              padding:'36px 28px 32px', maxWidth:360, margin:'0 auto',
              boxShadow:'0 0 80px rgba(123,46,255,.15), 0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)',
            }}>
              <div style={{ marginBottom:20 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="url(#sadG)" strokeWidth="2.5" fill="rgba(140,61,255,.08)" />
                  <circle cx="28" cy="34" r="4" fill="#C58EFF" />
                  <circle cx="52" cy="34" r="4" fill="#C58EFF" />
                  <path d="M28 54C28 54 33 48 40 48C47 48 52 54 52 54" stroke="#C58EFF" strokeWidth="3" strokeLinecap="round" />
                  <defs><linearGradient id="sadG" x1="4" y1="4" x2="76" y2="76"><stop offset="0%" stopColor="#C58EFF" /><stop offset="100%" stopColor="#8C3DFF" /></linearGradient></defs>
                </svg>
              </div>
              <h2 style={{ fontSize:28, fontWeight:900, margin:'0 0 8px', background:'linear-gradient(135deg,#C58EFF,#9D5CFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Game Over</h2>
              <p style={{ fontSize:16, color:'#D6B8FF', margin:'0 0 6px' }}>No moves left!</p>
              <p style={{ fontSize:15, color:'#B14DFF', margin:'0 0 28px' }}>Final Score: <strong style={{ color:'#C58EFF' }}>{score}</strong></p>
              <button onClick={handleNewGame} style={{
                width:'100%', padding:'18px', borderRadius:50, border:'none',
                background:'linear-gradient(135deg,#B97AFF 0%,#9D5CFF 40%,#7B2EFF 100%)',
                color:'#fff', fontSize:17, fontWeight:800, cursor:'pointer',
                fontFamily:'inherit', letterSpacing:.3,
                boxShadow:'0 0 30px rgba(157,92,255,.4), 0 8px 24px rgba(123,46,255,.35), inset 0 2px 0 rgba(255,255,255,.25), inset 0 -2px 6px rgba(0,0,0,.15)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                transition:'all .2s ease',
              }}>
                <span style={{ fontSize:20 }}>🔄</span>
                {'Try Again'}
                <span style={{ fontSize:18, marginLeft:4 }}>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
