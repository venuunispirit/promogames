import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import BuilderPhoneMockup from '../components/BuilderPhoneMockup'
import PhoneFrame from '../components/PhoneFrame'

/* ─────────────────────────────────────────────
   LIGHT THEME TOKENS  (scoped to .gb-wrap)
───────────────────────────────────────────── */
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
.gb-wrap *,
.gb-wrap *::before,
.gb-wrap *::after { box-sizing: border-box; }

/* inputs / selects / textareas */
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]),
.gb-wrap select,
.gb-wrap textarea {
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  background: var(--gb-surface);
  border: none;
  border-bottom: 1.5px solid var(--gb-border);
  border-radius: 8px;
  color: var(--gb-text);
  padding: 10px 12px 8px;
  outline: none;
  transition: border-color .18s;
}
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]):focus,
.gb-wrap select:focus,
.gb-wrap textarea:focus {
  border-bottom-color: #22c55e;
  border-bottom-width: 2px;
}
.gb-wrap select option { background: #fff; color: #1e1e2e; }

/* buttons */
.gb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  border-radius: var(--gb-radius-sm); border: none; cursor: pointer;
  transition: all .15s; white-space: nowrap; font-family: inherit;
}
.gb-btn:disabled { opacity: .5; cursor: not-allowed; }
.gb-btn-primary { background: var(--gb-primary); color: #fff; }
.gb-btn-primary:not(:disabled):hover { background: var(--gb-primary-d); transform: translateY(-1px); box-shadow: 0 4px 12px var(--gb-primary-g); }
.gb-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.gb-btn-ghost:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.gb-btn-danger { background: #fee2e2; color: var(--gb-danger); border: 1.5px solid #fecaca; }
.gb-btn-danger:not(:disabled):hover { background: #fecaca; }
.gb-btn-success { background: #dcfce7; color: var(--gb-success); border: 1.5px solid #bbf7d0; }
.gb-btn-success:not(:disabled):hover { background: #bbf7d0; }
.gb-btn-sm { padding: 5px 10px; font-size: 12px; }
.gb-btn-icon { padding: 6px; border-radius: 6px; }

/* card */
.gb-card {
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius);
  box-shadow: var(--gb-shadow);
}

/* label */
.gb-label {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--gb-text2); margin-bottom: 4px;
  display: block;
}

/* section block */
.gb-section {
  background: var(--gb-surface2);
  border: 1px solid var(--gb-border);
  border-radius: var(--gb-radius);
  padding: 16px;
  margin-bottom: 14px;
}
.gb-section-title {
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; color: var(--gb-primary);
  margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
}

/* tabs */
.gb-tabs {
  display: flex; border-bottom: 2px solid var(--gb-border);
  margin-bottom: 24px; gap: 0; overflow-x: auto;
}
.gb-tab {
  padding: 10px 18px; font-size: 13px; font-weight: 600;
  border: none; background: none; cursor: pointer;
  color: var(--gb-text2); border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: color .15s; white-space: nowrap;
  font-family: inherit;
}
.gb-tab.active { color: #9210f6; border-bottom-color: #9210f6; }
.gb-tab:hover:not(.active) { color: var(--gb-text); }

/* toast */
@keyframes gb-slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
.gb-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 12px 18px; border-radius: 10px; color: #fff; font-weight: 600;
  font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,.15);
  animation: gb-slide-in .22s ease; font-family: 'DM Sans',sans-serif;
  max-width: 320px;
}

/* drag handle */
.gb-drag-handle { cursor: grab; color: var(--gb-text3); padding: 4px; display: flex; align-items: center; }
.gb-drag-handle:active { cursor: grabbing; }

/* question row */
.gb-q-row {
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius);
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow .15s;
}
.gb-q-row:hover { box-shadow: var(--gb-shadow-md); }
.gb-q-row.dragging { opacity: .5; box-shadow: 0 8px 32px rgba(99,102,241,.2); }

.gb-q-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; cursor: pointer; user-select: none;
  background: var(--gb-surface);
}
.gb-q-header:hover { background: var(--gb-surface2); }
.gb-q-body { padding: 16px; border-top: 1.5px solid var(--gb-border); }

/* color swatch */
.gb-swatch {
  width: 28px; height: 28px; border-radius: 6px;
  border: 2px solid var(--gb-border); cursor: pointer; flex-shrink: 0;
}

/* image preview thumb */
.gb-thumb {
  height: 44px; width: auto; border-radius: 6px;
  border: 1px solid var(--gb-border); object-fit: contain; background: #f9f9f9;
}

/* empty state */
.gb-empty { text-align: center; padding: 56px 20px; color: var(--gb-text2); }
.gb-empty-icon { font-size: 44px; margin-bottom: 12px; }

/* grid helpers */
.gb-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
.gb-col { flex: 1; min-width: 140px; }

/* sticky add button bar */
.gb-sticky-bar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(244,246,251,.92); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--gb-border);
  padding: 10px 0; margin-bottom: 16px;
  display: flex; align-items: center; justify-content: space-between;
}

/* phone mockup */
.gb-phone {
  width: 220px; min-height: 380px; border-radius: 28px;
  border: 3px solid #d1d5db; background: #f9f9fb;
  overflow: hidden; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,.12);
}

/* color picker popup */
.gb-cpop {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 300;
  background: var(--gb-surface); border: 1.5px solid var(--gb-border);
  border-radius: 10px; padding: 12px; box-shadow: var(--gb-shadow-md);
  display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; width: 220px;
}

/* badge */
.gb-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700;
}
.gb-badge-purple { background: rgba(99,102,241,.12); color: var(--gb-primary); }
.gb-badge-green  { background: rgba(22,163,74,.12);  color: var(--gb-success); }
.gb-badge-gray   { background: #f0f2f8; color: var(--gb-text2); }

/* form group inline */
.gb-fg { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px; }

/* scroll util */
.gb-scroll-y { overflow-y: auto; }

/* option row */
.gb-opt-row {
  background: var(--gb-surface2); border: 1px solid var(--gb-border);
  border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;
}

/* preview overlay animations */
@keyframes flyFromBottom  { from { transform:translateY(110vh) scale(0.9);opacity:0 } to { transform:translateY(0) scale(1);opacity:1 } }
@keyframes flyFromTop     { from { transform:translateY(-110vh) scale(0.9);opacity:0 } to { transform:translateY(0) scale(1);opacity:1 } }
@keyframes flyFromLeft    { from { transform:translateX(-110vw) scale(0.9);opacity:0 } to { transform:translateX(0) scale(1);opacity:1 } }
@keyframes flyFromRight   { from { transform:translateX(110vw) scale(0.9);opacity:0 } to { transform:translateX(0) scale(1);opacity:1 } }
@keyframes zoomIn         { from { transform:scale(0.1);opacity:0 } to { transform:scale(1);opacity:1 } }
@keyframes fadeIn         { from { opacity:0 } to { opacity:1 } }
@keyframes scaleIn        { from { transform:scale(0.5);opacity:0 } to { transform:scale(1);opacity:1 } }
@keyframes slideUp        { from { transform:translateY(60px);opacity:0 } to { transform:translateY(0);opacity:1 } }
@keyframes slideDown      { from { transform:translateY(-60px);opacity:0 } to { transform:translateY(0);opacity:1 } }
@keyframes rotateIn       { from { transform:rotate(-360deg) scale(0.3);opacity:0 } to { transform:rotate(0) scale(1);opacity:1 } }
@keyframes flipIn         { from { transform:rotateX(-90deg);opacity:0 } to { transform:rotateX(0);opacity:1 } }
@keyframes swirlIn        { from { transform:rotate(720deg) scale(0.1);opacity:0 } to { transform:rotate(0) scale(1);opacity:1 } }
@keyframes bounceIn       { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 85%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes elasticIn      { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.08)} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
@keyframes blurIn         { from { filter:blur(12px);opacity:0 } to { filter:blur(0);opacity:1 } }
@keyframes dropIn         { 0%{transform:translateY(-120vh) rotate(-20deg);opacity:0} 60%{transform:translateY(10px) rotate(2deg);opacity:1} 80%{transform:translateY(-5px) rotate(-1deg)} 100%{transform:translateY(0) rotate(0);opacity:1} }
@keyframes wipeIn         { from { clip-path:inset(0 100% 0 0) } to { clip-path:inset(0 0 0 0) } }
@keyframes skewIn         { from { transform:skewX(-20deg);opacity:0 } to { transform:skewX(0);opacity:1 } }
@keyframes spiralIn       { from { transform:rotate(1080deg) translateX(-200px);opacity:0 } to { transform:rotate(0) translateX(0);opacity:1 } }
@keyframes rushIn         { from { transform:scale(3);opacity:0 } to { transform:scale(1);opacity:1 } }
@keyframes foldIn         { from { transform:perspective(500px) rotateY(90deg);opacity:0 } to { transform:perspective(500px) rotateY(0);opacity:1 } }
@keyframes revealIn       { from { clip-path:circle(0% at 50% 50%) } to { clip-path:circle(100% at 50% 50%) } }
@keyframes spinIn         { from { transform:rotate(720deg) scale(0);opacity:0 } to { transform:rotate(0) scale(1);opacity:1 } }
@keyframes cometIn        { from { transform:translate(-200px,-200px) rotate(-30deg) scale(0.3);opacity:0 } to { transform:translate(0,0) rotate(0) scale(1);opacity:1 } }
@keyframes floatIn        { from { transform:translateY(40px);opacity:0 } to { transform:translateY(0);opacity:1 } }

@keyframes flyToTop       { from { transform:translateY(0) scale(1);opacity:1 } to { transform:translateY(-110vh) scale(0.9);opacity:0 } }
@keyframes flyToBottom    { from { transform:translateY(0) scale(1);opacity:1 } to { transform:translateY(110vh) scale(0.9);opacity:0 } }
@keyframes flyToLeft      { from { transform:translateX(0) scale(1);opacity:1 } to { transform:translateX(-110vw) scale(0.9);opacity:0 } }
@keyframes flyToRight     { from { transform:translateX(0) scale(1);opacity:1 } to { transform:translateX(110vw) scale(0.9);opacity:0 } }
@keyframes zoomOut        { from { transform:scale(1);opacity:1 } to { transform:scale(0.1);opacity:0 } }
@keyframes fadeOut        { from { opacity:1 } to { opacity:0 } }
@keyframes scaleOut       { from { transform:scale(1);opacity:1 } to { transform:scale(0.5);opacity:0 } }
@keyframes slideUpOut     { from { transform:translateY(0);opacity:1 } to { transform:translateY(-60px);opacity:0 } }
@keyframes slideDownOut   { from { transform:translateY(0);opacity:1 } to { transform:translateY(60px);opacity:0 } }
@keyframes rotateOut      { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(360deg) scale(0.3);opacity:0 } }
@keyframes flipOut        { from { transform:rotateX(0);opacity:1 } to { transform:rotateX(90deg);opacity:0 } }
@keyframes swirlOut       { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(-720deg) scale(0.1);opacity:0 } }
@keyframes bounceOut      { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.06)} 100%{transform:scale(0.1);opacity:0} }
@keyframes elasticOut     { 0%{transform:scale(1);opacity:1} 30%{transform:scale(0.92)} 60%{transform:scale(1.06)} 100%{transform:scale(0);opacity:0} }
@keyframes blurOut        { from { filter:blur(0);opacity:1 } to { filter:blur(12px);opacity:0 } }
@keyframes dropOut        { 0%{transform:translateY(0) rotate(0);opacity:1} 40%{transform:translateY(10px) rotate(2deg);opacity:1} 100%{transform:translateY(120vh) rotate(20deg);opacity:0} }
@keyframes wipeOut        { from { clip-path:inset(0 0 0 0) } to { clip-path:inset(0 0 0 100%) } }
@keyframes skewOut        { from { transform:skewX(0);opacity:1 } to { transform:skewX(20deg);opacity:0 } }
@keyframes spiralOut      { from { transform:rotate(0) translateX(0);opacity:1 } to { transform:rotate(-1080deg) translateX(200px);opacity:0 } }
@keyframes rushOut        { from { transform:scale(1);opacity:1 } to { transform:scale(3);opacity:0 } }
@keyframes foldOut        { from { transform:perspective(500px) rotateY(0);opacity:1 } to { transform:perspective(500px) rotateY(90deg);opacity:0 } }
@keyframes hideOut        { from { clip-path:circle(100% at 50% 50%) } to { clip-path:circle(0% at 50% 50%) } }
@keyframes spinOut        { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(-720deg) scale(0);opacity:0 } }
@keyframes cometOut       { from { transform:translate(0,0) rotate(0) scale(1);opacity:1 } to { transform:translate(200px,200px) rotate(30deg) scale(0.3);opacity:0 } }
@keyframes floatOut       { from { transform:translateY(0);opacity:1 } to { transform:translateY(-40px);opacity:0 } }
@keyframes qFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes qBreathe { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.04);opacity:0.9} }
@keyframes qPulse { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.05);filter:brightness(1.08)} }
@keyframes qShimmer { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(1.5deg)} 75%{transform:rotate(-1.5deg)} }
@keyframes qKenBurns { 0%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.08) translate(-2%,-2%)} }
@keyframes qBounce { 0%,100%{transform:translateY(0)} 20%{transform:translateY(-14px)} 40%{transform:translateY(-7px)} 60%{transform:translateY(-3px)} 80%{transform:translateY(-1px)} }
@keyframes qSway { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes qWobble { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px) rotate(-3deg)} 30%{transform:translateX(4px) rotate(2deg)} 45%{transform:translateX(-3px) rotate(-1deg)} 60%{transform:translateX(2px) rotate(1deg)} }
@keyframes qSwing { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(6deg)} 40%{transform:rotate(-5deg)} 60%{transform:rotate(3deg)} 80%{transform:rotate(-2deg)} }
@keyframes qTada { 0%,100%{transform:scale(1) rotate(0deg)} 10%{transform:scale(0.94) rotate(-2deg)} 20%{transform:scale(1.06) rotate(2deg)} 30%{transform:scale(1) rotate(-2deg)} 40%{transform:scale(1.02) rotate(0deg)} }
@keyframes qHeartBeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.12)} 30%{transform:scale(1)} 45%{transform:scale(1.08)} 60%{transform:scale(1)} }
@keyframes qRotate { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
@keyframes qFlash { 0%,100%{opacity:1} 25%{opacity:0.3} 50%{opacity:1} 75%{opacity:0.3} }
@keyframes qRubberBand { 0%,100%{transform:scaleX(1) scaleY(1)} 15%{transform:scaleX(1.2) scaleY(0.85)} 30%{transform:scaleX(0.9) scaleY(1.1)} 45%{transform:scaleX(1.08) scaleY(0.95)} 60%{transform:scaleX(0.97) scaleY(1.03)} }
@keyframes qSlideUpDown { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-20px)} 50%{transform:translateY(0)} 75%{transform:translateY(12px)} }
@keyframes qZoomInOut { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
@keyframes qFadeInOut { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes qWave { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-6px) rotate(1deg)} 50%{transform:translateY(0) rotate(0deg)} 75%{transform:translateY(4px) rotate(-1deg)} }
@keyframes qOrbit { 0%{transform:translate(0,0)} 25%{transform:translate(10px,-10px)} 50%{transform:translate(0,-16px)} 75%{transform:translate(-10px,-10px)} 100%{transform:translate(0,0)} }
@keyframes qGlitch { 0%,100%{transform:translate(0)} 20%{transform:translate(-2px,1px) skewX(-1deg)} 40%{transform:translate(2px,-1px) skewX(1deg)} 60%{transform:translate(-1px,-1px) skewX(-0.5deg)} 80%{transform:translate(1px,2px) skewX(0.5deg)} }
@keyframes qBlurBlink { 0%,100%{filter:blur(0);opacity:1} 25%{filter:blur(3px);opacity:0.6} 50%{filter:blur(0);opacity:1} 75%{filter:blur(2px);opacity:0.7} }
@keyframes qSkew { 0%,100%{transform:skewX(0deg)} 25%{transform:skewX(-4deg)} 50%{transform:skewX(0deg)} 75%{transform:skewX(4deg)} }
@keyframes qRoll { 0%{transform:translateX(0) rotate(0deg)} 50%{transform:translateX(60px) rotate(360deg)} 100%{transform:translateX(0) rotate(720deg)} }
@keyframes qBounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.12)} 70%{transform:scale(0.94)} 85%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes qJello { 0%,100%{transform:skewX(0deg) skewY(0deg)} 25%{transform:skewX(-5deg) skewY(3deg)} 50%{transform:skewX(5deg) skewY(-3deg)} 75%{transform:skewX(-3deg) skewY(2deg)} }
`

/* ─────────── helpers ─────────── */
const ANIM_IN  = [
  { value:'flyFromBottom', label:'⬆️ Fly from Bottom' },
  { value:'flyFromTop',    label:'⬇️ Fly from Top' },
  { value:'flyFromLeft',   label:'➡️ Fly from Left' },
  { value:'flyFromRight',  label:'⬅️ Fly from Right' },
  { value:'zoomIn',        label:'🔍 Zoom In' },
  { value:'fadeIn',        label:'✨ Fade In' },
  { value:'scaleIn',       label:'📐 Scale In' },
  { value:'slideUp',       label:'⬆️ Slide Up' },
  { value:'slideDown',     label:'⬇️ Slide Down' },
  { value:'rotateIn',      label:'🔄 Rotate In' },
  { value:'flipIn',        label:'🪞 Flip In' },
  { value:'swirlIn',       label:'🌀 Swirl In' },
  { value:'bounceIn',      label:'🏀 Bounce In' },
  { value:'elasticIn',     label:'🧵 Elastic In' },
  { value:'blurIn',        label:'👁️ Blur In' },
  { value:'dropIn',        label:'💧 Drop In' },
  { value:'wipeIn',        label:'🧹 Wipe In' },
  { value:'skewIn',        label:'📏 Skew In' },
  { value:'spiralIn',      label:'🐚 Spiral In' },
  { value:'rushIn',        label:'💨 Rush In' },
  { value:'foldIn',        label:'📄 Fold In' },
  { value:'revealIn',      label:'🎭 Reveal In' },
  { value:'spinIn',        label:'🪀 Spin In' },
  { value:'cometIn',       label:'☄️ Comet In' },
  { value:'floatIn',       label:'🌊 Float In' },
]
const ANIM_OUT = [
  { value:'flyToTop',     label:'⬆️ Fly to Top' },
  { value:'flyToBottom',  label:'⬇️ Fly to Bottom' },
  { value:'flyToLeft',    label:'⬅️ Fly to Left' },
  { value:'flyToRight',   label:'➡️ Fly to Right' },
  { value:'zoomOut',      label:'🔍 Zoom Out' },
  { value:'fadeOut',      label:'✨ Fade Out' },
  { value:'scaleOut',     label:'📐 Scale Out' },
  { value:'slideUpOut',   label:'⬆️ Slide Up Out' },
  { value:'slideDownOut', label:'⬇️ Slide Down Out' },
  { value:'rotateOut',    label:'🔄 Rotate Out' },
  { value:'flipOut',      label:'🪞 Flip Out' },
  { value:'swirlOut',     label:'🌀 Swirl Out' },
  { value:'bounceOut',    label:'🏀 Bounce Out' },
  { value:'elasticOut',   label:'🧵 Elastic Out' },
  { value:'blurOut',      label:'👁️ Blur Out' },
  { value:'dropOut',      label:'💧 Drop Out' },
  { value:'wipeOut',      label:'🧹 Wipe Out' },
  { value:'skewOut',      label:'📏 Skew Out' },
  { value:'spiralOut',    label:'🐚 Spiral Out' },
  { value:'rushOut',      label:'💨 Rush Out' },
  { value:'foldOut',      label:'📄 Fold Out' },
  { value:'hideOut',      label:'🎭 Hide Out' },
  { value:'spinOut',      label:'🪀 Spin Out' },
  { value:'cometOut',     label:'☄️ Comet Out' },
  { value:'floatOut',     label:'🌊 Float Out' },
]
const IMAGE_ANIMS = [
  { value:'float',     label:'🌊 Float' },
  { value:'breathe',   label:'💨 Breathe' },
  { value:'pulse',     label:'💓 Pulse' },
  { value:'shimmer',   label:'✨ Shimmer' },
  { value:'kenburns',  label:'🎥 Ken Burns' },
  { value:'bounce',    label:'🔄 Bounce' },
  { value:'sway',      label:'🌿 Sway' },
  { value:'wobble',    label:'🤪 Wobble' },
  { value:'swing',     label:'⏳ Swing' },
  { value:'tada',      label:'🎉 Tada' },
  { value:'heartBeat', label:'💖 Heart Beat' },
  { value:'rotate',    label:'🔄 Rotate' },
  { value:'flash',     label:'⚡ Flash' },
  { value:'rubberBand',label:'🌀 Rubber Band' },
  { value:'slideUpDown',label:'📐 Slide Up/Down' },
  { value:'zoomInOut', label:'🔍 Zoom In/Out' },
  { value:'fadeInOut', label:'🌅 Fade In/Out' },
  { value:'wave',      label:'🌊 Wave' },
  { value:'orbit',     label:'🪐 Orbit' },
  { value:'glitch',    label:'💥 Glitch' },
  { value:'blurBlink', label:'👁️ Blur Blink' },
  { value:'skew',      label:'📏 Skew' },
  { value:'roll',      label:'🥌 Roll' },
  { value:'bounceIn',  label:'🏀 Bounce In' },
  { value:'jello',     label:'🍮 Jello' },
  { value:'none',      label:'⛔ None' },
]
const IMAGE_ANIM_MAP = IMAGE_ANIMS.reduce((map, a) => {
  if (a.value === 'none') return map
  map[a.value] = `q${a.value.charAt(0).toUpperCase() + a.value.slice(1)} ${a.value === 'kenburns' ? '8s' : a.value === 'orbit' ? '4s' : a.value === 'roll' ? '3s' : '2.5s'} ease-in-out infinite`
  return map
}, {})
const FONT_CATEGORIES = [
  { name:'Handwriting', fonts:['Caveat','Patrick Hand','Indie Flower','Shadows Into Light','Gloria Hallelujah','Permanent Marker','Kalam','Satisfy','Reenie Beanie','Homemade Apple','Sacramento','Alex Brush'] },
  { name:'Professional', fonts:['Inter','Work Sans','Source Sans 3','Lato','Open Sans','Roboto','Nunito','DM Sans','Poppins','Rubik','Exo 2','Cabin'] },
  { name:'Luxury', fonts:['Playfair Display','Cormorant Garamond','Libre Baskerville','Cinzel','Forum','Cormorant','Bodoni Moda','Tangerine','Great Vibes','Parisienne','Bellefair','Marcellus'] },
  { name:'Modern Casual', fonts:['Montserrat','Syne','Raleway','Quicksand','Josefin Sans','Space Grotesk','Plus Jakarta Sans','Outfit','Sora','Manrope','Lexend','Figtree'] },
]
const COLOR_PRESETS = ['#1a1a2e','#ffffff','#000000','#ef4444','#22c55e','#3b82f6',
  '#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#0ea5e9']

/* ─────────── Toast ─────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  return (
    <div className="gb-toast" style={{ background: type === 'success' ? '#16a34a' : '#dc2626' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  )
}

/* ─────────── ColorPicker ─────────── */
function ColorPicker({ value, onChange, label, noPresets }) {
  const [show, setShow] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-flex', flexDirection:'column', gap:4 }}>
      {label && <span className="gb-label">{label}</span>}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div className="gb-swatch" style={{ background: value || '#6366f1' }} onClick={() => setShow(s => !s)} />
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000"
          style={{ width:90, fontSize:12, padding:'5px 8px' }} />
      </div>
      {show && (
        <div className="gb-cpop" style={noPresets ? { display:'flex', flexDirection:'column', gap:6, padding:10 } : {}}>
          {!noPresets && COLOR_PRESETS.map(c => (
            <div key={c} onClick={() => { onChange(c); setShow(false) }}
              style={{ width:22, height:22, background:c, borderRadius:4, cursor:'pointer',
                border: value===c ? '2px solid #6366f1' : '1px solid #e2e6f0' }} />
          ))}
          <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)}
            style={{ gridColumn:'span 7', width:'100%', height:28, padding:0, border:'none', background:'none', cursor:'pointer' }} />
          <button className="gb-btn gb-btn-ghost gb-btn-sm" style={{ width:'100%' }} onClick={() => setShow(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

/* ─────────── ImageUpload ─────────── */
function ImageUpload({ label, url, onFile, onClear, accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" }) {
  const ref = useRef()
  return (
    <div>
      {label && <span className="gb-label">{label}</span>}
      <input type="file" ref={ref} accept={accept} style={{ display:'none' }}
        onChange={e => { const f=e.target.files[0]; if(f) onFile(f) }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:4 }}>
        <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => ref.current.click()}>📷 Upload</button>
        {url && <img src={url} className="gb-thumb" alt="" />}
        {url && <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" type="button" onClick={onClear}>✕</button>}
      </div>
    </div>
  )
}

/* ─────────── SoundSelector ─────────── */
function SoundSelector({ label, value, onChange, sounds }) {
  return (
    <div className="gb-fg">
      <span className="gb-label">{label}</span>
      <select value={value||''} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  )
}

/* ─────────── OptionRow ─────────── */
function OptionRow({ opt, index, onUpdate, onRemove, onSetCorrect, showCorrect }) {
  const imgRef     = useRef()
  const overlayRef = useRef()
  const [imgPrev,     setImgPrev]     = useState(opt.option_image_url || null)
  const [overlayPrev, setOverlayPrev] = useState(opt.option_overlay_image_url || null)

  const handleImgFile = e => {
    const f = e.target.files[0]
    if (f) {
      const r = new FileReader()
      r.onload = ev => { setImgPrev(ev.target.result); onUpdate('option_image_url', ev.target.result) }
      r.readAsDataURL(f)
      onUpdate('_optImageFile', f)
    }
  }
  const handleOverlayFile = e => {
    const f = e.target.files[0]
    if (f) {
      const r = new FileReader()
      r.onload = ev => { setOverlayPrev(ev.target.result); onUpdate('option_overlay_image_url', ev.target.result) }
      r.readAsDataURL(f)
      onUpdate('_overlayFile', f)
    }
  }

  return (
    <div className="gb-opt-row" style={{ position:'relative', paddingRight:36 }}>
      {/* delete button — top right corner of card */}
      <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon"
        onClick={onRemove}
        style={{ position:'absolute', top:6, right:6, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}>✕</button>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16 }}>
        {/* Col 1: field + colors + correct */}
        <div>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
            <input value={opt.option_text||''} onChange={e => onUpdate('option_text', e.target.value)}
              placeholder={`Option ${index+1}`} style={{ flex:1 }} />
            {/* option image upload */}
            <input type="file" ref={imgRef} accept="image/png,image/jpeg,image/jpg" onChange={handleImgFile} style={{ display:'none' }} />
            {imgPrev ? (
              <div style={{ position:'relative', flexShrink:0 }}>
                <img src={imgPrev} alt="" style={{ height:28, width:'auto', borderRadius:4, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9', display:'block' }} />
                <button style={{ position:'absolute', top:-5, right:-5, borderRadius:'50%', width:14, height:14, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'1.5px solid #fff', cursor:'pointer' }}
                  type="button" onClick={() => { setImgPrev(null); onUpdate('option_image_url','') }}>✕</button>
              </div>
            ) : (
              <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => imgRef.current.click()}
                style={{ border:'1.5px dashed var(--gb-border)', borderRadius:6, padding:'4px 8px', cursor:'pointer', background:'transparent', fontSize:14, lineHeight:1, flexShrink:0 }} title="Option image">📷</button>
            )}
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <ColorPicker value={opt.option_text_color||'#ffffff'} onChange={v => onUpdate('option_text_color', v)} label="Text Color" />
            <ColorPicker value={opt.option_color} onChange={v => onUpdate('option_color', v)} label="BG Color" />
            {showCorrect && (
              <div style={{ paddingTop:18 }}>
                <button
                  className={`gb-btn gb-btn-sm ${Number(opt.is_correct)===1 ? 'gb-btn-success' : 'gb-btn-ghost'}`}
                  onClick={onSetCorrect}>
                  {Number(opt.is_correct)===1 ? '✅ Correct' : '○ Mark Correct'}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Col 2: overlay image */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:100 }}>
          <span className="gb-label" style={{ marginBottom:6, whiteSpace:'nowrap' }}>Overlay Image</span>
          <div style={{ position:'relative', display:'inline-block' }}>
            {overlayPrev && (
              <>
                <img src={overlayPrev} alt="" style={{ height:64, width:'auto', maxWidth:100, borderRadius:6, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9', display:'block' }} />
                <button style={{ position:'absolute', top:-6, right:-6, borderRadius:'50%', width:18, height:18, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}
                  type="button" onClick={() => { setOverlayPrev(null); onUpdate('option_overlay_image_url','') }}>✕</button>
              </>
            )}
            <input type="file" ref={overlayRef} accept="image/png,image/jpeg,image/jpg" onChange={handleOverlayFile} style={{ display:'none' }} />
            {!overlayPrev && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => overlayRef.current.click()}
                  style={{ width:64, height:64, border:'1.5px dashed var(--gb-border)', borderRadius:8, cursor:'pointer', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, padding:0 }}>
                  <span style={{ fontSize:20, lineHeight:1, opacity:0.6 }}>⊞</span>
                  <span style={{ fontSize:10, color:'var(--gb-text3)' }}>Upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────── QuestionCard ─────────── */
function QuestionCard({ question, index, total, onSave, onDelete, onMoveUp, onMoveDown, onLiveChange }) {
  const [q, setQ] = useState(question)
  const [saving, setSaving] = useState(false)
  const [imgPreview, setImgPreview] = useState(question.question_image_url||null)
  const [bgPreview,  setBgPreview]  = useState(question.question_bg_image_url||null)

    // Keep in sync if parent re-orders or refreshes
  useEffect(() => {
    setQ(question)
    setImgPreview(question.question_image_url||null)
    setBgPreview(question.question_bg_image_url||null)
  }, [question])

  // Push live edits up to parent for the preview
  useEffect(() => { onLiveChange?.(q) }, [q, onLiveChange])

  const updateOption = (i, field, val) => {
    setQ(prev => {
      const opts = [...(prev.options||[])]; opts[i] = { ...opts[i], [field]:val }; return { ...prev, options:opts }
    })
  }
  const addOption = () => setQ({ ...q, options:[...(q.options||[]),
    { option_text:'', option_color:'#6366f1', option_text_color:'#ffffff', is_correct:0, option_order:(q.options||[]).length }] })
  const removeOption = i => { const opts=[...(q.options||[])]; opts.splice(i,1); setQ({ ...q, options:opts }) }
  const setCorrect = sel => setQ(prev => ({ ...prev,
    options: prev.options.map((o,idx) => ({ ...o, is_correct: idx===sel ? 1 : 0 })) }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(q) } finally { setSaving(false) }
  }

  const typeLabel = q.question_type === 'opinion' ? 'Opinion' : 'Right/Wrong'
  const correctCount = (q.options||[]).filter(o => Number(o.is_correct)===1).length

  return (
    <div className="gb-q-row">
      {/* ── header ── */}
      <div className="gb-q-header" style={{ cursor:'default' }}>
        {/* drag/reorder arrows */}
        <div style={{ display:'flex', flexDirection:'column', gap:1 }} onClick={e => e.stopPropagation()}>
          <button className="gb-btn gb-btn-ghost gb-btn-icon gb-btn-sm" disabled={index===0}
            onClick={() => onMoveUp(index)} title="Move up" style={{ padding:'2px 4px', lineHeight:1 }}>▲</button>
          <button className="gb-btn gb-btn-ghost gb-btn-icon gb-btn-sm" disabled={index===total-1}
            onClick={() => onMoveDown(index)} title="Move down" style={{ padding:'2px 4px', lineHeight:1 }}>▼</button>
        </div>
        <span style={{ fontSize:12, fontWeight:800, color:'var(--gb-primary)', minWidth:28 }}>#{index+1}</span>
        {/* question color dot */}
        <div style={{ width:10, height:10, borderRadius:'50%', background: q.question_color||'#6366f1', flexShrink:0, border:'1px solid var(--gb-border)' }} />
        {/* question text preview */}
        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--gb-text)',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {q.question_text || <span style={{ color:'var(--gb-text3)' }}>Untitled question…</span>}
        </span>
        {/* type dropdown + delete */}
        <div style={{ display:'flex', gap:6, alignItems:'center' }} onClick={e => e.stopPropagation()}>
          <select value={q.question_type} onChange={e => setQ({ ...q, question_type: e.target.value })}
            style={{ fontSize:11, padding:'2px 6px', borderRadius:6, border:'1.5px solid var(--gb-border)', background:'var(--gb-surface)', color:'var(--gb-text)', fontWeight:600, cursor:'pointer', outline:'none' }}>
            <option value="right_wrong">Right / Wrong</option>
            <option value="opinion">Opinion</option>
          </select>
          <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" onClick={e => { e.stopPropagation(); onDelete(question) }}>🗑</button>
        </div>
      </div>

      {/* ── body (always open) ── */}
        <div className="gb-q-body">
          {/* images — 2‑col upload cards like form tab */}
          <div className="gb-section" style={{ marginBottom:14 }}>
            <div className="gb-section-title">🖼️ Images</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span className="gb-label" style={{ marginBottom:8, display:'block', textAlign:'center' }}>Question Image</span>
                <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button"
                  onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='image/png,image/jpeg,image/jpg'; inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{const url=ev.target.result;setImgPreview(url);setQ(prev=>({...prev,_imageFile:f,question_image_url:url}))};r.readAsDataURL(f)}};inp.click() }}
                  style={{ border:'none', background:'transparent', padding:'6px 12px' }}>📷 Upload</button>
                {imgPreview && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                  <img src={imgPreview} alt="" style={{ height:72, width:'auto', maxWidth:160, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9' }} />
                  <button style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                    type="button" onClick={() => { setImgPreview(null); setQ(prev=>({...prev, _imageFile:null, question_image_url:'' })) }}>✕</button>
                </div>}
                {/* Effect dropdown below preview */}
                {imgPreview && (
                  <div style={{ width:'100%', marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
                    <span className="gb-label" style={{ whiteSpace:'nowrap', marginBottom:0 }}>Use Effect</span>
                    <select value={q.question_image_animation||'float'} onChange={e => setQ({ ...q, question_image_animation:e.target.value })}
                      style={{ flex:1, fontSize:12, padding:'5px 0', border:'none', borderBottom:'1.5px solid var(--gb-border)', background:'transparent', color:'var(--gb-text)', cursor:'pointer', outline:'none', borderRadius:0 }}>
                      {IMAGE_ANIMS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span className="gb-label" style={{ marginBottom:8, display:'block', textAlign:'center' }}>BG Image (overrides game BG)</span>
                <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button"
                  onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='image/png,image/jpeg,image/jpg'; inp.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{const url=ev.target.result;setBgPreview(url);setQ(prev=>({...prev,_bgImageFile:f,question_bg_image_url:url}))};r.readAsDataURL(f)}};inp.click() }}
                  style={{ border:'none', background:'transparent', padding:'6px 12px' }}>📷 Upload</button>
                {bgPreview && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                  <img src={bgPreview} alt="" style={{ height:72, width:'auto', maxWidth:160, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9' }} />
                  <button style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                    type="button" onClick={() => { setBgPreview(null); setQ(prev=>({...prev, _bgImageFile:null, question_bg_image_url:'' })) }}>✕</button>
                </div>}
              </div>
            </div>
          </div>

          {/* question text */}
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div className="gb-fg" style={{ flex:3 }}>
              <span className="gb-label">Question Text</span>
              <textarea rows={2} value={q.question_text||''} onChange={e => setQ({ ...q, question_text: e.target.value })}
                style={{ resize:'vertical' }} />
            </div>
            <div>
              <ColorPicker value={q.question_color||'#1a1a2e'} onChange={v => setQ({ ...q, question_color:v })} label="Text Color" />
            </div>
          </div>

          {/* Options */}
          <div className="gb-section">
            <div className="gb-section-title" style={{ marginBottom:10 }}>🔘 Answer Options</div>
            {(q.options||[]).length === 0
              ? <p style={{ fontSize:13, color:'var(--gb-text3)', textAlign:'center', padding:'12px 0' }}>No options yet</p>
              : (q.options||[]).map((opt,i) => (
                <OptionRow key={`opt-${opt.id || 'new'}-${i}`} opt={opt} index={i}
                  onUpdate={(field,val) => updateOption(i,field,val)}
                  onRemove={() => removeOption(i)}
                  onSetCorrect={() => setCorrect(i)}
                  showCorrect={q.question_type==='right_wrong'} />
              ))
            }
            <div style={{ display:'flex', justifyContent:'center', marginTop:(q.options||[]).length === 0 ? 0 : 12 }}>
              <button className="gb-btn gb-btn-primary gb-btn-sm" onClick={addOption}>+ Add Option</button>
            </div>
          </div>

          {/* overlay animation */}
          <div className="gb-section">
            <div className="gb-section-title">🎬 Overlay Image Animation (Keynote-style)</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
              <div className="gb-fg">
                <span className="gb-label">Fly-In</span>
                <select value={q.overlay_animation_in||'flyFromBottom'} onChange={e => setQ({ ...q, overlay_animation_in:e.target.value })}>
                  {ANIM_IN.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="gb-fg">
                <span className="gb-label">Fly-Out</span>
                <select value={q.overlay_animation_out||'flyToTop'} onChange={e => setQ({ ...q, overlay_animation_out:e.target.value })}>
                  {ANIM_OUT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="gb-fg">
                <span className="gb-label">Idle Time (sec)</span>
                <input type="number" min={0} max={60} value={q.overlay_idle_time??3}
                  onChange={e => setQ({ ...q, overlay_idle_time:parseInt(e.target.value)||0 })} />
              </div>
            </div>
            <p style={{ fontSize:11, color:'var(--gb-text3)', marginTop:8 }}>
              After selecting an option (1s delay), overlay flies in → idle → "Next" appears → fly-out → next question.
            </p>
          </div>

          {/* save bar */}
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:4 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving…' : '💾 Save Question'}
            </button>
          </div>
        </div>
      
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function GameBuilderPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [game,          setGame]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [tab,           setTab]           = useState('form')
  const [toast,         setToast]         = useState(null)
  const [questions,     setQuestions]     = useState([])
  const [formFields,    setFormFields]    = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [boEmailSettings, setBoEmailSettings] = useState({
    guest_offer: { enabled: true, subject: 'You earned a reward! 🎁', body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.wrap{max-width:600px;margin:0 auto;background:#fff}.header{background:#6366f1;padding:24px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:20px;font-weight:700}.body{padding:24px 20px;color:#333;font-size:14px;line-height:1.6}.footer{padding:16px 20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}.btn{display:inline-block;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px}</style>
</head>
<body>
<div class="wrap">
<div class="header"><h1>You earned an offer! 🎉</h1></div>
<div class="body">
<p>Hi {{name}},</p>
<p>Congratulations on playing <strong>{{game_name}}</strong>! You've earned a special offer.</p>
<p style="text-align:center;margin:28px 0;font-size:24px;font-weight:800;letter-spacing:8px;background:#f4f4f6;padding:12px 24px;border-radius:8px;display:inline-block;font-family:monospace">{{code}}</p>
<p>Show this 6-digit code to the staff to redeem your reward.</p>
</div>
<div class="footer"><p>© PromoGames · Enjoy your reward!</p></div>
</div>
</body>
</html>` },
    bo_notification: { enabled: true, subject: 'Someone played your game! 🎮', body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.wrap{max-width:600px;margin:0 auto;background:#fff}.header{background:#f59e0b;padding:24px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:20px;font-weight:700}.body{padding:24px 20px;color:#333;font-size:14px;line-height:1.6}.footer{padding:16px 20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}</style>
</head>
<body>
<div class="wrap">
<div class="header"><h1>New Play! 🎮</h1></div>
<div class="body">
<p>Hi {{bo_name}},</p>
<p><strong>{{player_name}}</strong> just played <strong>{{game_name}}</strong> at your location.</p>
<p>Their reward code: <strong style="font-size:18px;letter-spacing:2px">{{code}}</strong></p>
<p>Log in to your dashboard to accept or reject this redemption.</p>
</div>
<div class="footer"><p>© PromoGames · Business Owner Dashboard</p></div>
</div>
</body>
</html>` },
    redemption_complete: { enabled: true, subject: 'Your reward has been redeemed! ✅', body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.wrap{max-width:600px;margin:0 auto;background:#fff}.header{background:#22c55e;padding:24px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:20px;font-weight:700}.body{padding:24px 20px;color:#333;font-size:14px;line-height:1.6}.footer{padding:16px 20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}</style>
</head>
<body>
<div class="wrap">
<div class="header"><h1>Reward Redeemed! ✅</h1></div>
<div class="body">
<p>Hi {{name}},</p>
<p>Your reward for <strong>{{game_name}}</strong> has been successfully redeemed.</p>
<p>Check your rewards history for details.</p>
</div>
<div class="footer"><p>© PromoGames · Thanks for playing!</p></div>
</div>
</body>
</html>` },
  })
  const [settings,      setSettings]      = useState({})
  const [slugInput,     setSlugInput]     = useState('')
const [draggedIdx,    setDraggedIdx]    = useState(null)
const [dragOverIdx,   setDragOverIdx]   = useState(null)
const [editingName,   setEditingName]   = useState(false)
const [nameInput,     setNameInput]     = useState('')
  const [sounds,        setSounds]        = useState([])
  const [saving,        setSaving]        = useState(false)
  const [soundUploading,setSoundUploading]= useState(false)
  const [addingQ,       setAddingQ]       = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const questionsRef = useRef(questions)
  questionsRef.current = questions
  const [liveQ, setLiveQ] = useState(null)
  const liveRafRef = useRef(null)
  const handleLiveChange = useCallback((qData) => {
    if (liveRafRef.current) return
    liveRafRef.current = requestAnimationFrame(() => {
      liveRafRef.current = null
      setLiveQ({ ...qData, options: qData.options?.map(o => ({ ...o })) })
    })
  }, [])
  const [previewOverlay, setPreviewOverlay] = useState(null)
  const [previewStage, setPreviewStage] = useState('initial')
  const previewTimerRef = useRef(null)
  useEffect(() => { clearTimeout(previewTimerRef.current); setPreviewOverlay(null); setPreviewStage('initial') }, [selectedQuestionId])
  const [redirectUrl,   setRedirectUrl]   = useState('')
  const [businessTab, setBusinessTab] = useState('preview')
  const [emailSubTab, setEmailSubTab] = useState('player')
  const [boEmailTab, setBoEmailTab] = useState('guest_offer')

  const soundUploadRef = useRef()
  const bgImgRef       = useRef()
  const tyBgImgRef     = useRef()
  const gameLogoRef    = useRef()

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadGame = useCallback(() => {
    setLoading(true); setFetchError(null)
    api.get(`/games/${id}`).then(res => {
      const g = res.data.game
      setGame(g)
      setQuestions(g.questions||[])
      if (g.questions?.length) setSelectedQuestionId(g.questions[0].id)
      setFormFields(g.formFields||[])
      setEmailTemplate(g.emailTemplate||{})
      setSettings(g.settings||{})
      setSounds(g.sounds||[])
      setSlugInput(g.slug||'')
      setRedirectUrl(g.redirect_url||'')
      api.get(`/games/${id}/email-settings`).then(res => {
        if (res.data.email_settings) setBoEmailSettings(prev => ({ ...prev, ...res.data.email_settings }))
      }).catch(() => {})
    }).catch(err => {
      setFetchError(err.response?.data?.message || err.message || 'Failed to load game')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadGame() }, [loadGame])

  /* ─── Load font for preview ─── */
  useEffect(() => {
    const font = settings.font_family
    if (!font || font === 'DM Sans') return
    const id = 'gf-' + font.replace(/\s/g, '-')
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(font) + ':wght@400;600;700;800&display=swap'
    document.head.appendChild(link)
  }, [settings.font_family])

  /* ─── Preload all 48 fonts for font selector ─── */
  useEffect(() => {
    const families = FONT_CATEGORIES.flatMap(c => c.fonts)
      .filter(f => f !== 'DM Sans')
      .map(f => encodeURIComponent(f) + ':wght@400;600;700')
      .join('&family=')
    if (!families) return
    const id = 'gf-all-fonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=' + families + '&display=swap'
    document.head.appendChild(link)
  }, [])

  /* ─── Add Question ─── */
  const addQuestion = async () => {
    setAddingQ(true)
    try {
      const fd = new FormData()
      fd.append('question_text', 'New Question')
      fd.append('question_type', 'right_wrong')
      fd.append('question_color', '#1a1a2e')
      fd.append('question_order', questions.length)
      fd.append('num_options', 0)
      const res = await api.post(`/quiz/games/${id}/questions`, fd)
      // New question comes back with no options — safe to add directly
      setQuestions(prev => [...prev, { ...res.data.question, options: [] }])
      setSelectedQuestionId(res.data.question.id)
      showToast('Question added ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message||err.message), 'error') }
    setAddingQ(false)
  }

  /* ─── Save Question ───
     BUG FIX: after saving, update local state with real option IDs returned
     from the backend so subsequent saves don't re-POST existing options.
  ─── */
  const saveQuestion = async (q) => {
    const fd = new FormData()
    fd.append('question_text', q.question_text||'')
    fd.append('question_type', q.question_type||'right_wrong')
    fd.append('question_color', q.question_color||'#1a1a2e')
    fd.append('question_order', q.question_order??0)
    fd.append('num_options', q.num_options??0)
    fd.append('sound_correct',   q.sound_correct||'')
    fd.append('sound_wrong',     q.sound_wrong||'')
    fd.append('sound_neutral',   q.sound_neutral||'')
    fd.append('sound_correct_id',q.sound_correct_id||'')
    fd.append('sound_wrong_id',  q.sound_wrong_id||'')
    fd.append('sound_neutral_id',q.sound_neutral_id||'')
    fd.append('overlay_duration',     q.overlay_duration??3)
    fd.append('overlay_idle_time',    q.overlay_idle_time??3)
    fd.append('overlay_animation_in', q.overlay_animation_in||'flyFromBottom')
    fd.append('overlay_animation_out',q.overlay_animation_out||'flyToTop')
    fd.append('question_image_animation', q.question_image_animation||'float')
    if (q._imageFile)   fd.append('question_image',    q._imageFile)
    if (q._bgImageFile) fd.append('question_bg_image', q._bgImageFile)
    await api.put(`/quiz/questions/${q.id}`, fd)

    // Save options — collect updated options with real IDs
    const savedOptions = []
    for (const opt of (q.options||[])) {
      const ofd = new FormData()
      ofd.append('option_text',       opt.option_text||'')
      ofd.append('option_color',      opt.option_color||'#6366f1')
      ofd.append('option_text_color', opt.option_text_color||'#ffffff')
      ofd.append('is_correct',        opt.is_correct ? 1 : 0)
      ofd.append('option_order',      (q.options||[]).indexOf(opt))
      if (opt._optImageFile) ofd.append('option_image',         opt._optImageFile)
      if (opt._overlayFile)  ofd.append('option_overlay_image', opt._overlayFile)

      let savedOpt
      if (opt.id) {
        // Existing option → PUT
        const res = await api.put(`/quiz/options/${opt.id}`, ofd)
        savedOpt = res.data.option
      } else {
        // New option → POST, capture returned ID
        const res = await api.post(`/quiz/questions/${q.id}/options`, ofd)
        savedOpt = res.data.option
      }
      savedOptions.push(savedOpt)
    }

    // Update questions state so options now carry their DB IDs — prevents duplication
    setQuestions(prev => prev.map(pq =>
      pq.id === q.id
        ? { ...pq, ...q, options: savedOptions, _imageFile: null, _bgImageFile: null }
        : pq
    ))
    showToast('Question saved ✅')
  }

  /* ─── Delete Question ─── */
  const deleteQuestion = async (q) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/quiz/questions/${q.id}`)
      setQuestions(prev => prev.filter(x => x.id !== q.id))
      showToast('Question deleted')
    } catch { showToast('Error deleting question', 'error') }
  }

  /* ─── Drag & Drop Reorder ─── */
  const handleDragStart = (idx) => { setDragIdx(idx) }
  const handleDragOver = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setQuestions(prev => {
      const arr = [...prev]
      const [item] = arr.splice(dragIdx, 1)
      arr.splice(idx, 0, item)
      return arr.map((q, i) => ({ ...q, question_order: i }))
    })
    setDragIdx(idx)
  }
  const handleDragEnd = async () => {
    setDragIdx(null)
    try {
      const current = questionsRef.current
      const order = current.map((q, i) => ({ id: q.id, question_order: i }))
      await api.post(`/quiz/games/${id}/questions/reorder`, { order })
    } catch { showToast('Reorder failed', 'error') }
  }

  /* ─── Duplicate Question ─── */
  const duplicateQuestion = async (q) => {
    try {
      const res = await api.post(`/quiz/questions/${q.id}/duplicate`)
      setQuestions(prev => {
        const idx = prev.findIndex(pq => pq.id === q.id)
        const dup = { ...res.data.question, options: res.data.question.options || [] }
        const copy = [...prev]
        copy.splice(idx + 1, 0, dup)
        // Renumber
        return copy.map((cq, ci) => ({ ...cq, question_order: ci }))
      })
      setSelectedQuestionId(res.data.question.id)
      showToast('Question duplicated ✅')
    } catch (err) { showToast('Error: ' + (err.response?.data?.message||err.message), 'error') }
  }

  /* ─── Reorder helpers ─── */
  const moveQuestion = async (from, to) => {
    const arr = [...questions]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    const reordered = arr.map((q, i) => ({ ...q, question_order: i }))
    setQuestions(reordered)
    try {
      await api.post(`/quiz/games/${id}/questions/reorder`, {
        order: reordered.map(q => ({ id: q.id, question_order: q.question_order }))
      })
    } catch { showToast('Reorder failed', 'error') }
  }

  /* ─── Form Fields ─── */
  const addFormField    = ()          => setFormFields([...formFields, { field_label:'New Field', field_type:'text', is_required:0, field_options:[] }])
  const removeFormField = i           => { const f=[...formFields]; f.splice(i,1); setFormFields(f) }
  const updateFormField = (i,key,val) => { const f=[...formFields]; f[i]={ ...f[i],[key]:val }; setFormFields(f) }
  const saveFormFields  = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/form-fields`, { fields: formFields }); showToast('Form fields saved') }
    catch { showToast('Error saving form fields', 'error') }
    setSaving(false)
  }

  /* ─── Email ─── */
  const saveEmailTemplate = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/email-template`, emailTemplate); showToast('Email template saved') }
    catch { showToast('Error saving email template', 'error') }
    setSaving(false)
  }

  const saveBoEmailSettings = async () => {
    setSaving(true)
    try { await api.put(`/games/${id}/email-settings`, { email_settings: boEmailSettings }); showToast('Email settings saved') }
    catch { showToast('Error saving email settings', 'error') }
    setSaving(false)
  }

  const updateBoEmail = (key, field, value) => {
    setBoEmailSettings(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  /* ─── Settings ─── */
  const saveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = ['bg_color','primary_color','show_progress','time_per_question',
        'heading_1','heading_2','intro_text','outro_text','win_sound_id','lose_sound_id',
        'sound_correct_id','sound_wrong_id',
        'terms_enabled','terms_text','terms_url','send_email','font_family',
        'start_button_text','submit_button_text','continue_button_text',
        'heading_1_color','heading_2_color','intro_text_color',
        'thankyou_subtitle','outro_text_color','thankyou_subtitle_color',
        'start_button_text_color','start_button_bg_color',
        'submit_button_text_color','submit_button_bg_color',
        'continue_button_text_color','continue_button_bg_color',
        'next_button_text','next_button_text_color','next_button_bg_color',
        'randomize_questions','questions_per_session',
        'enable_mascot','enable_speech','speech_language','speech_rate','speech_pitch']
      for (const f of fields) fd.append(f, settings[f]??'')
      if (settings._bgImageFile)    fd.append('bg_image',           settings._bgImageFile)
      else if (settings.bg_image_url !== undefined) fd.append('bg_image_url',     settings.bg_image_url)
      if (settings._tyBgImageFile)  fd.append('thankyou_bg_image',  settings._tyBgImageFile)
      else if (settings.thankyou_bg_image_url !== undefined) fd.append('thankyou_bg_image_url', settings.thankyou_bg_image_url)
      if (settings._submitGifFile)  fd.append('submit_confirm_gif', settings._submitGifFile)
      else if (settings.submit_confirm_gif_url !== undefined) fd.append('submit_confirm_gif_url', settings.submit_confirm_gif_url||'')
      if (settings._gameLogoFile)   fd.append('game_logo',          settings._gameLogoFile)
      else if (settings.game_logo_url !== undefined) fd.append('game_logo_url', settings.game_logo_url||'')
      await api.put(`/games/${id}/settings`, fd)
      await api.put(`/games/${id}`, { redirect_url: redirectUrl, slug: slugInput.trim() || undefined, meta_description: settings.meta_description || undefined })
      showToast('Settings saved ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSaving(false)
  }

  /* ─── Game Name ─── */
  const saveGameName = async () => {
    if (!nameInput.trim()) return
    try {
      await api.put(`/games/${id}`, { name: nameInput.trim() })
      setGame(prev => ({ ...prev, name: nameInput.trim() }))
      showToast('Game name saved ✅')
    } catch { showToast('Error saving name', 'error') }
    setEditingName(false)
  }

  /* ─── Sounds ─── */
  const uploadSound = async e => {
    const file = e.target.files[0]; if (!file) return
    const allowed = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/x-wav','audio/wave']
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      showToast('Only MP3, WAV, OGG allowed', 'error'); e.target.value=''; return
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/,''))
    fd.append('sound_type', 'custom')
    setSoundUploading(true)
    try {
      const res = await api.post(`/sounds/games/${id}/sounds`, fd)
      setSounds(prev => [res.data.sound, ...prev])
      showToast('Sound uploaded ✅')
    } catch (err) { showToast('Error: '+(err.response?.data?.message||err.message), 'error') }
    setSoundUploading(false); e.target.value=''
  }
  const deleteSound = async s => {
    try { await api.delete(`/sounds/sounds/${s.id}`); setSounds(prev => prev.filter(x => x.id!==s.id)); showToast('Sound deleted') }
    catch { showToast('Error', 'error') }
  }

  const gameLink = game ? `${window.location.origin}/play/${game.slug}/${game.client_slug}` : ''
  const isParentGame = !game?.parent_game_id
  const TABS = [
    { id:'form',      label:'Player Form' },
    { id:'questions', label:'Questions' },
    { id:'thankyou',  label:'Thankyou Page' },
    { id:'email',     label:'Email' },
    { id:'sounds',    label:'Audio' },
    { id:'settings',  label:'Settings' },
    ...(isParentGame ? [{ id:'locations', label:'📍 Locations' }] : []),
  ]

  if (loading) return (
    <div className="gb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', color:'var(--gb-text2)' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid #e2e6f0',borderTopColor:'#6366f1',animation:'spin .8s linear infinite',margin:'0 auto 16px' }} />
        Loading builder…
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (fetchError) return (
    <div className="gb-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <style>{LIGHT}</style>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h2 style={{ color:'var(--gb-danger)', marginBottom:8 }}>Builder Failed to Load</h2>
        <p style={{ color:'var(--gb-text2)', marginBottom:20 }}>{fetchError}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <button className="gb-btn gb-btn-primary" onClick={loadGame}>🔄 Retry</button>
          <button className="gb-btn gb-btn-ghost" onClick={() => navigate('/dashboard/games')}>← Back to Games</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="gb-wrap">
      <style>{LIGHT}</style>

      {/* ─── Header (3‑col grid) ─── */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr auto 1fr',
        background:'var(--gb-surface)', borderBottom:'1.5px solid var(--gb-border)',
        padding:'10px 28px', gap:'4px 20px', alignItems:'center',
        position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,.06)'
      }}>
        {/* Col 1: Back icon + Name + Builder badge */}
        <div style={{ display:'flex', gap:6, alignItems:'flex-start', justifySelf:'start' }}>
          <button className="gb-btn gb-btn-ghost gb-btn-sm" onClick={() => navigate('/dashboard/games')}
            style={{ padding:'6px 8px', fontSize:16, lineHeight:1, marginTop:1 }} title="Back to games">←</button>
          <div>
            {editingName ? (
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') saveGameName(); if (e.key==='Escape') setEditingName(false) }}
                  onBlur={saveGameName} autoFocus
                  style={{ width:180, fontSize:14, fontWeight:700, padding:'3px 6px' }} />
                <button className="gb-btn gb-btn-ghost gb-btn-sm" onClick={() => setEditingName(false)} style={{ padding:'2px 6px' }}>✕</button>
              </div>
            ) : (
              <div style={{ fontWeight:700, fontSize:14, color:'var(--gb-text)', cursor:'pointer', lineHeight:1.3 }}
                onClick={() => { setNameInput(game?.name||''); setEditingName(true) }} title="Click to edit">
                {game?.name} <span style={{ fontSize:10, color:'var(--gb-text3)', fontWeight:400 }}>✎</span>
              </div>
            )}
            <div style={{ fontSize:9.5, fontWeight:600, color:'var(--gb-text3)', letterSpacing:'.04em', textTransform:'uppercase', marginTop:1 }}>Builder</div>
          </div>
        </div>

        {/* Col 2: Tabs */}
        <div className="gb-tabs" style={{ marginBottom:0, borderBottom:'none', justifySelf:'center' }}>
          {TABS.map(t => (
            <button key={t.id} className={`gb-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}
              style={{ padding:'6px 14px', fontSize:12.5 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Col 3: Copy + Preview (2D icons) */}
        <div style={{ display:'flex', gap:6, alignItems:'center', justifySelf:'end' }}>
          <button className="gb-btn gb-btn-ghost gb-btn-sm" style={{ padding:'6px 8px', fontSize:16, lineHeight:1 }}
            onClick={() => { navigator.clipboard.writeText(gameLink); showToast('Link copied!') }}
            title="Copy game link">🔗</button>
          <a href={gameLink} target="_blank" rel="noreferrer" className="gb-btn gb-btn-ghost gb-btn-sm"
            style={{ padding:'6px 8px', fontSize:16, lineHeight:1, textDecoration:'none' }}
            title="Preview game">👁</a>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 0 24px 20px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>

        {/* ─── LEFT COL ─── */}
        <div>
          {/* ════ QUESTIONS TAB ════ */}
          {tab === 'questions' && (
            <div style={{ display:'grid', gridTemplateColumns:'30% 70%', gap:16, alignItems:'start' }}>
              {/* 30% Sidebar */}
              <div>

                {/* Card 1: Progress & Timing */}
                <div className="gb-card" style={{ padding:16, marginBottom:16 }}>
                  <div className="gb-section-title">⚙️ Progress & Timing</div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                      <input type="checkbox" checked={!!settings.show_progress} onChange={e => setSettings({...settings,show_progress:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                      Show progress bar
                    </label>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                      <input type="checkbox" checked={!!settings.randomize_questions} onChange={async e => {
                        const val = e.target.checked ? 1 : 0
                        setSettings({...settings, randomize_questions: val})
                        try { await api.put(`/games/${id}/settings/field`, { randomize_questions: val }) } catch {}
                      }} style={{ width:16,height:16 }} />
                      Randomise questions
                    </label>
                  </div>
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <span className="gb-label">Questions Per Session</span>
                    <input type="number" min={0} value={settings.questions_per_session||0}
                      onChange={async e => {
                        const val = parseInt(e.target.value) || 0
                        setSettings({...settings, questions_per_session: val})
                        try { await api.put(`/games/${id}/settings/field`, { questions_per_session: val }) } catch {}
                      }}
                      placeholder="0 = show all questions" />
                    <p style={{ fontSize:11, color:'var(--gb-text3)', marginTop:4 }}>
                      Number of random questions each player sees. 0 = show all.
                    </p>
                  </div>
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <span className="gb-label">Time Per Question (sec)</span>
                    <input type="number" min={0} value={settings.time_per_question||0} onChange={e => setSettings({...settings,time_per_question:e.target.value})} placeholder="0 = no limit" />
                  </div>
                </div>

                {/* Card 2: Question List */}
                <div className="gb-card" style={{ padding:16, marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div className="gb-section-title" style={{ marginBottom:0 }}>📝 Questions</div>
                    <span style={{ fontSize:12, color:'var(--gb-text2)', fontWeight:600 }}>{questions.length}</span>
                  </div>
                  {questions.length === 0 ? (
                    <p style={{ color:'var(--gb-text3)', fontSize:13 }}>No questions yet.</p>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
                      {questions.map((q, i) => {
                        const isSelected = selectedQuestionId === q.id
                        const text = q.question_text || 'New Question'
                        const displayText = text.length > 20 ? text.slice(0, 20) + '…' : text
                        const isDragging = dragIdx === i
                        return (
                          <div key={q.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedQuestionId(q.id)}
                            style={{
                              width:'100%', boxSizing:'border-box',
                              padding:'8px 10px', borderRadius:8, cursor:'grab', fontSize:13,
                              background: isDragging ? '#e8e8ff' : isSelected ? '#eef0ff' : '#fff',
                              border:`1.5px solid ${isSelected ? 'var(--gb-primary)' : 'var(--gb-border)'}`,
                              opacity: isDragging ? 0.6 : 1,
                              transition:'all .12s',
                              position:'relative', overflow:'hidden',
                            }}>
                            {/* Row 1: # + truncated text */}
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, minWidth:0 }}>
                              <span style={{ fontWeight:700, color:'var(--gb-primary)', fontSize:12, flexShrink:0 }}>#{i+1}</span>
                              <span style={{ minWidth:0, color:'var(--gb-text)', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayText}</span>
                            </div>
                            {/* Row 2: Duplicate + Delete */}
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <button onClick={e => { e.stopPropagation(); duplicateQuestion(q) }}
                                style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontSize:13, lineHeight:1, color:'var(--gb-text2)' }}
                                title="Duplicate">⧉</button>
                              <button onClick={e => { e.stopPropagation(); deleteQuestion(q); if (selectedQuestionId === q.id) { const remaining = questions.filter(rq => rq.id !== q.id); setSelectedQuestionId(remaining.length ? remaining[0].id : null) } }}
                                style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontSize:13, lineHeight:1, color:'var(--gb-danger)' }}
                                title="Delete">🗑</button>
                            </div>
                            {/* Bottom-right: options count */}
                            <span style={{
                              position:'absolute', bottom:4, right:8,
                              fontSize:10, color:'var(--gb-text3)', fontWeight:600,
                            }}>
                              {(q.options||[]).length} opt{(q.options||[]).length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button className="gb-btn gb-btn-primary gb-btn-sm" onClick={addQuestion} disabled={addingQ} style={{ width:'100%', marginTop:10, justifyContent:'center' }}>
                    {addingQ ? '⏳ Adding…' : '+ Add Question'}
                  </button>
                </div>

                {/* Card 3: Next Button */}
                <div className="gb-card" style={{ padding:16 }}>
                  <div className="gb-section-title">⏩ Next Button</div>
                  <div className="gb-fg" style={{ marginBottom:10 }}>
                    <input value={settings.next_button_text||''} onChange={e => setSettings({...settings,next_button_text:e.target.value})} placeholder="Next →" />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <ColorPicker value={settings.next_button_text_color||'#ffffff'} onChange={v => setSettings({...settings,next_button_text_color:v})} noPresets label="Text Color" />
                    <ColorPicker value={settings.next_button_bg_color||''} onChange={v => setSettings({...settings,next_button_bg_color:v})} noPresets label="Background" />
                  </div>
                </div>

              </div>

              {/* 70% Main — Selected Question Editor */}
              <div>
                {(() => {
                  const selQ = questions.find(q => q.id === selectedQuestionId)
                  if (!selQ) return (
                    <div className="gb-empty">
                      <div className="gb-empty-icon">❓</div>
                      <h3 style={{ color:'var(--gb-text)', marginBottom:8 }}>Select a question</h3>
                      <p>Click a question from the sidebar to edit it here.</p>
                    </div>
                  )
                  const idx = questions.indexOf(selQ)
                  return (
                    <QuestionCard
                      key={selQ.id}
                      question={selQ}
                      index={idx}
                      total={questions.length}
                      onSave={saveQuestion}
                      onDelete={(qObj) => { const remaining = questions.filter(q => q.id !== qObj.id); deleteQuestion(qObj); if (selectedQuestionId === qObj.id) { setSelectedQuestionId(remaining.length ? remaining[0].id : null) } }}
                      onMoveUp={i => moveQuestion(i, i-1)}
                      onMoveDown={i => moveQuestion(i, i+1)}
                      forceOpen={true}
                      onLiveChange={handleLiveChange}
                    />
                  )
                })()}
              </div>
            </div>
          )}

          {/* ════ FORM TAB ════ */}
          {tab === 'form' && (
            <div>
              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">🎨 Visuals</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <span className="gb-label" style={{ marginBottom:8, display:'block', textAlign:'center' }}>Game Background Image</span>
                    <input type="file" ref={bgImgRef} accept="image/png,image/jpeg,image/jpg"
                      onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,bg_image_url:ev.target.result,_bgImageFile:f}); r.readAsDataURL(f)} }}
                      style={{ display:'none' }} />
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => bgImgRef.current.click()} style={{ border:'none', background:'transparent', padding:'6px 12px' }}>📷 Upload</button>
                    {settings.bg_image_url && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                      <img src={settings.bg_image_url} alt="" style={{ height:72, width:'auto', maxWidth:160, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9' }} />
                      <button
                        style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                        type="button" onClick={() => setSettings({...settings,bg_image_url:'',_bgImageFile:null})}>✕</button>
                    </div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <span className="gb-label" style={{ marginBottom:8, display:'block', textAlign:'center' }}>Game Logo</span>
                    <input type="file" ref={gameLogoRef} accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                      onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,game_logo_url:ev.target.result,_gameLogoFile:f}); r.readAsDataURL(f)} }}
                      style={{ display:'none' }} />
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => gameLogoRef.current.click()} style={{ border:'none', background:'transparent', padding:'6px 12px' }}>📷 Upload</button>
                    {settings.game_logo_url && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                      <img src={settings.game_logo_url} alt="" style={{ height:72, width:'auto', maxWidth:160, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#fff' }} />
                      <button
                        style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                        type="button" onClick={() => setSettings({...settings,game_logo_url:'',_gameLogoFile:null})}>✕</button>
                    </div>}
                  </div>
                </div>
              </div>

              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">📝 Game Texts</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'8px 16px', alignItems:'end' }}>
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <span className="gb-label">Heading 1 (title — text 1)</span>
                    <input value={settings.heading_1||''} onChange={e => setSettings({...settings,heading_1:e.target.value})} placeholder="Main title" />
                  </div>
                  <ColorPicker value={settings.heading_1_color||'#1a1a2e'} onChange={v => setSettings({...settings,heading_1_color:v})} noPresets />
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <span className="gb-label">Heading 2 (subtitle — text 2)</span>
                    <input value={settings.heading_2||''} onChange={e => setSettings({...settings,heading_2:e.target.value})} placeholder="Sub-heading" />
                  </div>
                  <ColorPicker value={settings.heading_2_color||'#1a1a2e'} onChange={v => setSettings({...settings,heading_2_color:v})} noPresets />
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <span className="gb-label">Intro Text (body — text 3, shown before quiz)</span>
                    <textarea rows={2} value={settings.intro_text||''} onChange={e => setSettings({...settings,intro_text:e.target.value})} style={{ resize:'vertical' }} />
                  </div>
                  <ColorPicker value={settings.intro_text_color||'#444444'} onChange={v => setSettings({...settings,intro_text_color:v})} noPresets />
                </div>
              </div>

              <p style={{ color:'var(--gb-text2)', marginBottom:16, fontSize:13 }}>These fields appear on the player registration screen before the quiz starts.</p>
              {formFields.map((f,i) => (
                <div key={i} className="gb-card" style={{ marginBottom:10, padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div className="gb-fg" style={{ flex:2, minWidth:130 }}>
                      <span className="gb-label">Label</span>
                      <input value={f.field_label} onChange={e => updateFormField(i,'field_label',e.target.value)} />
                    </div>
                    <div className="gb-fg" style={{ flex:1, minWidth:110 }}>
                      <span className="gb-label">Type</span>
                      <select value={f.field_type} onChange={e => updateFormField(i,'field_type',e.target.value)}>
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer', paddingBottom:2, whiteSpace:'nowrap' }}>
                      <input type="checkbox" checked={!!f.is_required} onChange={e => updateFormField(i,'is_required',e.target.checked?1:0)}
                        style={{ width:16,height:16 }} />
                      Required
                    </label>
                    <button className="gb-btn gb-btn-danger gb-btn-sm" onClick={() => removeFormField(i)}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'center' }}>
                <button className="gb-btn gb-btn-ghost" onClick={addFormField}>+ Add Field</button>
                <button className="gb-btn gb-btn-primary" onClick={saveFormFields} disabled={saving}>{saving ? 'Saving…' : '💾 Save Form'}</button>
              </div>

              <div className="gb-card" style={{ marginBottom:20, padding:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div>
                    <div className="gb-section-title">📜 Terms & Conditions</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <input type="checkbox" id="termsEnabled" checked={!!settings.terms_enabled}
                        onChange={e => setSettings({...settings,terms_enabled:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                      <label htmlFor="termsEnabled" style={{ fontWeight:600, cursor:'pointer', fontSize:13 }}>Require acceptance</label>
                    </div>
                    <div className="gb-fg" style={{ marginBottom:10 }}>
                      <span className="gb-label">Label Text</span>
                      <input value={settings.terms_text||''} onChange={e => setSettings({...settings,terms_text:e.target.value})} placeholder="Terms & Conditions" />
                    </div>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">URL (optional)</span>
                      <input value={settings.terms_url||''} onChange={e => setSettings({...settings,terms_url:e.target.value})} placeholder="https://yoursite.com/terms" />
                    </div>
                    <div style={{ marginTop:16 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <input type="checkbox" id="sendEmailEnabled" checked={!!settings.send_email}
                          onChange={e => setSettings({...settings,send_email:e.target.checked?1:0})} style={{ width:16,height:16 }} />
                        <label htmlFor="sendEmailEnabled" style={{ fontWeight:600, cursor:'pointer', fontSize:13 }}>Send completion email</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="gb-section-title">🚀 Start Button</div>
                    <div className="gb-fg" style={{ marginBottom:10 }}>
                      <input value={settings.start_button_text||''} onChange={e => setSettings({...settings,start_button_text:e.target.value})} placeholder="Start Quiz →" />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <ColorPicker value={settings.start_button_text_color||'#ffffff'} onChange={v => setSettings({...settings,start_button_text_color:v})} noPresets label="Text Color" />
                      <ColorPicker value={settings.start_button_bg_color||''} onChange={v => setSettings({...settings,start_button_bg_color:v})} noPresets label="Background Color" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="gb-btn gb-btn-primary" onClick={saveSettings} disabled={saving} style={{ padding:'10px 28px', marginTop:16 }}>
                  {saving ? '⏳ Saving…' : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ════ EMAIL TAB ════ */}
          {tab === 'email' && (
            <div>
              {/* Sub-tabs: Player Email | BO Emails */}
              <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'2px solid var(--gb-border)' }}>
                {[
                  { id:'player', label:'Player Email' },
                  { id:'bo', label:'BO Emails' },
                ].map(st => (
                  <button key={st.id} onClick={() => setEmailSubTab(st.id)}
                    style={{
                      padding:'8px 18px', fontSize:12.5, fontWeight:700, border:'none',
                      background:'none', cursor:'pointer', fontFamily:'inherit',
                      color: emailSubTab===st.id ? 'var(--gb-primary)' : 'var(--gb-text2)',
                      borderBottom:`2px solid ${emailSubTab===st.id ? 'var(--gb-primary)' : 'transparent'}`,
                      marginBottom:-2,
                    }}>
                    {st.label}
                  </button>
                ))}
              </div>

              {emailSubTab === 'player' && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <p style={{ color:'var(--gb-text2)', fontSize:13 }}>Configure the congratulations email sent to players after completing the game.</p>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" checked={!!emailTemplate.is_enabled}
                        onChange={e => setEmailTemplate({ ...emailTemplate, is_enabled:e.target.checked?1:0 })}
                        style={{ width:16,height:16 }} />
                      Enable email
                    </label>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'8px 12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8 }}>
                    <input type="checkbox" checked={!!settings.send_email}
                      onChange={e => setSettings({ ...settings, send_email:e.target.checked?1:0 })}
                      style={{ width:16,height:16 }} />
                    <span style={{ fontWeight:600, color:'#166534' }}>Send email on game completion</span>
                    <span style={{ color:'#166534', fontSize:12, marginLeft:'auto' }}>Requires template below to be enabled</span>
                  </div>
                  <div className="gb-section" style={{ marginBottom:16, background:'#fffbeb', borderColor:'#fde68a' }}>
                    💡 Use <code>{'{{name}}'}</code>, <code>{'{{score}}'}</code>, <code>{'{{total}}'}</code>, <code>{'{{game_name}}'}</code> as placeholders.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <div className="gb-fg"><span className="gb-label">Sender Name</span><input value={emailTemplate.sender_name||''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_name:e.target.value })} placeholder="Quiz Platform" /></div>
                    <div className="gb-fg"><span className="gb-label">Sender Email</span><input value={emailTemplate.sender_email||''} onChange={e => setEmailTemplate({ ...emailTemplate, sender_email:e.target.value })} placeholder="noreply@yourdomain.com" /></div>
                  </div>
                  <div className="gb-fg" style={{ marginBottom:14 }}><span className="gb-label">Subject</span><input value={emailTemplate.subject||''} onChange={e => setEmailTemplate({ ...emailTemplate, subject:e.target.value })} placeholder="Congratulations {{name}}! 🎉" /></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'flex-end', marginBottom:14 }}>
                    <div className="gb-fg"><span className="gb-label">Header Text</span><input value={emailTemplate.header_text||''} onChange={e => setEmailTemplate({ ...emailTemplate, header_text:e.target.value })} placeholder="🎉 Congratulations!" /></div>
                    <ColorPicker value={emailTemplate.header_color||'#6366f1'} onChange={v => setEmailTemplate({ ...emailTemplate, header_color:v })} label="Header Color" />
                  </div>
                  <div className="gb-fg" style={{ marginBottom:14 }}><span className="gb-label">Email Body (HTML)</span><textarea rows={5} value={emailTemplate.body_html||''} onChange={e => setEmailTemplate({ ...emailTemplate, body_html:e.target.value })} placeholder="<p>Thank you, {{name}}!</p>" style={{ resize:'vertical', fontFamily:'monospace', fontSize:13 }} /></div>
                  <div className="gb-fg" style={{ marginBottom:20 }}><span className="gb-label">Footer Text</span><input value={emailTemplate.footer_text||''} onChange={e => setEmailTemplate({ ...emailTemplate, footer_text:e.target.value })} placeholder="© 2024 Your Company" /></div>
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button className="gb-btn gb-btn-primary" onClick={saveEmailTemplate} disabled={saving}>{saving ? 'Saving…' : '💾 Save Email Template'}</button>
                  </div>
                </div>
              )}

              {emailSubTab === 'bo' && (
                <div>
                  <p style={{ color:'var(--gb-text2)', fontSize:13, marginBottom:16 }}>Configure the 3 BO redemption emails.</p>

                  {/* BO sub-tabs: Guest Offer | BO Notification | Redemption Complete */}
                  <div style={{ display:'flex', gap:0, marginBottom:16, borderBottom:'2px solid var(--gb-border)' }}>
                    {[
                      { id:'guest_offer', label:'1. Guest Offer' },
                      { id:'bo_notification', label:'2. BO Notification' },
                      { id:'redemption_complete', label:'3. Redemption Complete' },
                    ].map(bt => (
                      <button key={bt.id} onClick={() => setBoEmailTab(bt.id)}
                        style={{
                          padding:'6px 14px', fontSize:11.5, fontWeight:700, border:'none',
                          background:'none', cursor:'pointer', fontFamily:'inherit',
                          color: boEmailTab===bt.id ? '#6366f1' : 'var(--gb-text3)',
                          borderBottom:`2px solid ${boEmailTab===bt.id ? '#6366f1' : 'transparent'}`,
                          marginBottom:-2,
                        }}>
                        {bt.label}
                      </button>
                    ))}
                  </div>

                  {/* Toggle + description for the active sub-tab */}
                  {boEmailTab === 'guest_offer' && (
                    <div className="gb-card" style={{ padding:16, marginBottom:16 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:6 }}>
                        <input type="checkbox" checked={boEmailSettings.guest_offer.enabled}
                          onChange={e => updateBoEmail('guest_offer', 'enabled', e.target.checked)}
                          style={{ width:16, height:16 }} />
                        Guest Offer Email
                      </label>
                      <p style={{ fontSize:12, color:'var(--gb-text3)', marginBottom:0 }}>Sent to non-registered players with an offer to register and claim reward. When disabled, only BO Accept/Reject decides the outcome.</p>
                    </div>
                  )}
                  {boEmailTab === 'bo_notification' && (
                    <div className="gb-card" style={{ padding:16, marginBottom:16 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:6 }}>
                        <input type="checkbox" checked={boEmailSettings.bo_notification.enabled}
                          onChange={e => updateBoEmail('bo_notification', 'enabled', e.target.checked)}
                          style={{ width:16, height:16 }} />
                        BO Notification Email
                      </label>
                      <p style={{ fontSize:12, color:'var(--gb-text3)', marginBottom:0 }}>Sent to the business owner when someone plays their game.</p>
                    </div>
                  )}
                  {boEmailTab === 'redemption_complete' && (
                    <div className="gb-card" style={{ padding:16, marginBottom:16 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:6 }}>
                        <input type="checkbox" checked={boEmailSettings.redemption_complete.enabled}
                          onChange={e => updateBoEmail('redemption_complete', 'enabled', e.target.checked)}
                          style={{ width:16, height:16 }} />
                        Redemption Complete Email
                      </label>
                      <p style={{ fontSize:12, color:'var(--gb-text3)', marginBottom:0 }}>Template for redemption completion. Not auto-sent — player checks rewards page for history.</p>
                    </div>
                  )}

                  {/* Fields for the active sub-tab */}
                  {[boEmailTab].map(key => (
                    <div key={key} className="gb-card" style={{ padding:16, marginBottom:16 }}>
                      <div className="gb-fg" style={{ marginBottom:14 }}><span className="gb-label">Subject</span>
                        <input value={boEmailSettings[key].subject} onChange={e => updateBoEmail(key, 'subject', e.target.value)} />
                      </div>
                      <div className="gb-fg"><span className="gb-label">Body (HTML)</span>
                        <textarea rows={8} value={boEmailSettings[key].body} onChange={e => updateBoEmail(key, 'body', e.target.value)}
                          placeholder="<p>Your custom HTML here</p>" style={{ resize:'vertical', fontFamily:'monospace', fontSize:13, minHeight:200 }} />
                      </div>
                    </div>
                  ))}

                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button className="gb-btn gb-btn-primary" onClick={saveBoEmailSettings} disabled={saving}>{saving ? 'Saving…' : '💾 Save BO Email Settings'}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ THANKYOU TAB ════ */}
          {tab === 'thankyou' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="gb-card" style={{ padding:16, margin:0 }}>
                  <div className="gb-section-title">🎊 Thankyou Page Background</div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <input type="file" ref={tyBgImgRef} accept="image/png,image/jpeg,image/jpg"
                      onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,thankyou_bg_image_url:ev.target.result,_tyBgImageFile:f}); r.readAsDataURL(f)} }}
                      style={{ display:'none' }} />
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => tyBgImgRef.current.click()} style={{ border:'none', background:'transparent', padding:'6px 12px' }}>📷 Upload</button>
                    {settings.thankyou_bg_image_url && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                      <img src={settings.thankyou_bg_image_url} alt="" style={{ height:80, width:'auto', maxWidth:200, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9' }} />
                      <button
                        style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                        type="button" onClick={() => setSettings({...settings,thankyou_bg_image_url:'',_tyBgImageFile:null})}>✕</button>
                    </div>}
                  </div>
                </div>
                <div className="gb-card" style={{ padding:16, margin:0 }}>
                  <div className="gb-section-title">📝 Thankyou Message</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'8px 12px', alignItems:'end' }}>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">Heading Text</span>
                      <textarea rows={2} value={settings.outro_text||''} onChange={e => setSettings({...settings,outro_text:e.target.value})} style={{ resize:'vertical' }} placeholder="Yay! You completed the game!" />
                    </div>
                    <ColorPicker value={settings.outro_text_color||'#1a1a2e'} onChange={v => setSettings({...settings,outro_text_color:v})} noPresets />
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">Subtitle Text</span>
                      <textarea rows={2} value={settings.thankyou_subtitle||''} onChange={e => setSettings({...settings,thankyou_subtitle:e.target.value})} style={{ resize:'vertical' }} placeholder="✅ Thank you for completing!" />
                    </div>
                    <ColorPicker value={settings.thankyou_subtitle_color||'#444444'} onChange={v => setSettings({...settings,thankyou_subtitle_color:v})} noPresets />
                  </div>
                </div>
              </div>

              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">🚀 Submit Button</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'8px 16px', alignItems:'end' }}>
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <input value={settings.submit_button_text||''} onChange={e => setSettings({...settings,submit_button_text:e.target.value})} placeholder="Submit & Explore" />
                  </div>
                  <ColorPicker value={settings.submit_button_text_color||'#ffffff'} onChange={v => setSettings({...settings,submit_button_text_color:v})} noPresets label="Text" />
                  <ColorPicker value={settings.submit_button_bg_color||''} onChange={v => setSettings({...settings,submit_button_bg_color:v})} noPresets label="Background" />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="gb-card" style={{ padding:16, margin:0 }}>
                  <div className="gb-section-title">🎊 Submit Confirmation GIF</div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <input type="file" id="submitGifInput" accept="image/gif,image/png,image/jpeg,image/webp"
                      onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onload=ev=>setSettings({...settings,submit_confirm_gif_url:ev.target.result,_submitGifFile:f}); r.readAsDataURL(f)} }}
                      style={{ display:'none' }} />
                    <button className="gb-btn gb-btn-ghost gb-btn-sm" type="button" onClick={() => document.getElementById('submitGifInput').click()} style={{ border:'none', background:'transparent', padding:'6px 12px' }}>🎬 Upload GIF / Image</button>
                    {settings.submit_confirm_gif_url && <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
                      <img src={settings.submit_confirm_gif_url} alt="" style={{ height:80, width:'auto', maxWidth:200, borderRadius:8, border:'1px solid var(--gb-border)', objectFit:'contain', background:'#f9f9f9' }} />
                      <button
                        style={{ position:'absolute', top:-8, right:-8, borderRadius:'50%', width:24, height:24, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, background:'var(--gb-danger)', color:'#fff', border:'2px solid #fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}
                        type="button" onClick={() => setSettings({...settings,submit_confirm_gif_url:'',_submitGifFile:null})}>✕</button>
                    </div>}
                  </div>
                </div>
                <div className="gb-card" style={{ padding:16, margin:0 }}>
                  <div className="gb-section-title">🔗 Post-Game Redirect URL</div>
                  <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:12 }}>
                    Where should players be sent after completing? Leave blank to show default.
                  </p>
                  <div className="gb-fg" style={{ marginBottom:0 }}>
                    <input value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="https://yourwebsite.com/thankyou" type="url" />
                  </div>
                  {redirectUrl && (
                    <div style={{ marginTop:10, marginBottom:16, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#15803d', wordBreak:'break-all' }}>
                      ✅ {redirectUrl}
                    </div>
                  )}
                  <div style={{ borderTop:'1px solid var(--gb-border)', paddingTop:16 }}>
                    <div className="gb-section-title">⏩ Continue Now Button</div>
                    <div className="gb-fg" style={{ marginBottom:10, marginTop:8 }}>
                      <input value={settings.continue_button_text||''} onChange={e => setSettings({...settings,continue_button_text:e.target.value})} placeholder="Continue Now →" />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <ColorPicker value={settings.continue_button_text_color||'#ffffff'} onChange={v => setSettings({...settings,continue_button_text_color:v})} noPresets label="Text Color" />
                      <ColorPicker value={settings.continue_button_bg_color||''} onChange={v => setSettings({...settings,continue_button_bg_color:v})} noPresets label="Background Color" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="gb-btn gb-btn-primary" onClick={saveSettings} disabled={saving} style={{ padding:'10px 28px' }}>
                  {saving ? '⏳ Saving…' : '💾 Save Thankyou Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ════ SETTINGS TAB ════ */}
          {tab === 'settings' && (
            <div>
              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div>
                    <div className="gb-section-title">🔗 Game URL Slug</div>
                    <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:8 }}>This determines the public URL: <code style={{ fontSize:11 }}>{window.location.origin}/play/{slugInput||'your-slug'}/{game?.client_slug||'...'}</code></p>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <input value={slugInput} onChange={e => setSlugInput(e.target.value)} placeholder="my-game-slug" />
                    </div>
                  </div>
                  <div>
                    <div className="gb-section-title">🎨 Colors</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <ColorPicker value={settings.bg_color||'#ffffff'} onChange={v => setSettings({...settings,bg_color:v})} label="Background Color" />
                      <ColorPicker value={settings.primary_color||'#6366f1'} onChange={v => setSettings({...settings,primary_color:v})} label="Primary / Accent Color" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">🔤 Font Family</div>
                <div style={{ display:'grid', gap:12 }}>
                  {FONT_CATEGORIES.map((cat, ci) => (
                    <div key={cat.name} style={ci < FONT_CATEGORIES.length - 1 ? {paddingBottom:12,borderBottom:'1px solid var(--gb-border)'} : {}}>
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--gb-text3)', marginBottom:6 }}>{cat.name}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                        {cat.fonts.map(font => (
                          <div key={font} onClick={() => setSettings({...settings,font_family:font})}
                            style={{ padding:'6px 8px', borderRadius:6, cursor:'pointer', fontSize:12,
                              border:`1.5px solid ${settings.font_family===font||(!settings.font_family&&font==='DM Sans') ? 'var(--gb-primary)' : 'var(--gb-border)'}`,
                              background: settings.font_family===font||(!settings.font_family&&font==='DM Sans') ? '#eef0ff' : '#fff',
                              transition:'all .12s', fontFamily: "'" + font + "', sans-serif" }}>
                            <div style={{ fontWeight:700, lineHeight:1.3 }}>{font}</div>
                            <div style={{ color:'#888', fontWeight:400, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>The quick brown fox</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">📲 Social Share Preview</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
                  <div>
                    <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:10 }}>Text shown when the game link is shared on WhatsApp, Facebook etc.</p>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">Share Description</span>
                      <input value={settings.meta_description||''} onChange={e => setSettings({...settings,meta_description:e.target.value})} placeholder="Play this game and win exciting rewards!" maxLength={200} />
                      <span style={{ fontSize:11, color:'var(--gb-text3)', marginTop:2 }}>{(settings.meta_description||'').length}/200</span>
                    </div>
                  </div>
                  <div style={{ border:'1px solid var(--gb-border)', borderRadius:10, overflow:'hidden', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ height:120, background: settings.bg_image_url ? `center/cover url(${settings.bg_image_url})` : (settings.primary_color||'#6366f1'), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:32, fontWeight:800 }}></div>
                    <div style={{ padding:'12px 14px' }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em', color:'#888', marginBottom:3 }}>{window.location.hostname || 'yourdomain.com'}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:4, lineHeight:1.3 }}>{game?.name || 'Untitled'}</div>
                      <div style={{ fontSize:12, color:'#555', lineHeight:1.4 }}>{settings.meta_description || 'Play this game and win exciting rewards!'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gb-card" style={{ marginBottom:16, padding:16 }}>
                <div className="gb-section-title">🗣️ Mascot &amp; Voice (Text-to-Speech)</div>
                <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:14 }}>
                  When enabled, a mascot appears on the player screen and the game text is read aloud to players in the chosen language (translated automatically).
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer', marginBottom:12 }}>
                      <input type="checkbox" checked={!!settings.enable_mascot} onChange={e => setSettings({...settings, enable_mascot: e.target.checked ? 1 : 0})} style={{ width:16, height:16 }} />
                      Enable Mascot (shows in question area)
                    </label>
                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                      <input type="checkbox" checked={!!settings.enable_speech} onChange={e => setSettings({...settings, enable_speech: e.target.checked ? 1 : 0})} style={{ width:16, height:16 }} />
                      Enable Speech (read questions aloud)
                    </label>
                  </div>
                  <div>
                    <div className="gb-fg" style={{ marginBottom:12 }}>
                      <span className="gb-label">Voice Language</span>
                      <select value={settings.speech_language || 'en'} onChange={e => setSettings({...settings, speech_language: e.target.value})}
                        style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid var(--gb-border)', fontSize:14 }}>
                        <option value="en">English</option>
                        <option value="ja">Japanese</option>
                        <option value="zh">Chinese</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">Speech Rate ({settings.speech_rate || 1})</span>
                      <input type="range" min="0.5" max="2" step="0.1" value={settings.speech_rate || 1} onChange={e => setSettings({...settings, speech_rate: parseFloat(e.target.value)})} />
                    </div>
                    <div className="gb-fg" style={{ marginBottom:0 }}>
                      <span className="gb-label">Speech Pitch ({settings.speech_pitch || 1})</span>
                      <input type="range" min="0" max="2" step="0.1" value={settings.speech_pitch || 1} onChange={e => setSettings({...settings, speech_pitch: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="gb-btn gb-btn-primary" onClick={saveSettings} disabled={saving} style={{ padding:'10px 28px' }}>
                  {saving ? '⏳ Saving…' : '💾 Save All Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ════ SOUNDS TAB ════ */}
          {tab === 'sounds' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div>
                  <h3 style={{ color:'var(--gb-text)', fontFamily:'inherit', marginBottom:4 }}>Sound Library</h3>
                  <p style={{ color:'var(--gb-text2)', fontSize:13 }}>Upload MP3, WAV or OGG files, then assign them below.</p>
                </div>
                <div>
                  <input type="file" ref={soundUploadRef} accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-wav,audio/wave" onChange={uploadSound} style={{ display:'none' }} />
                  <button className="gb-btn gb-btn-primary" onClick={() => soundUploadRef.current.click()} disabled={soundUploading}>
                    {soundUploading ? '⏳ Uploading…' : '+ Upload Sound'}
                  </button>
                </div>
              </div>
              <div className="gb-card" style={{ marginBottom:20, padding:16 }}>
                <div className="gb-section-title">🎮 Assign Sounds to Quiz</div>
                <p style={{ color:'var(--gb-text2)', fontSize:12, marginBottom:14 }}>
                  These play globally across the entire quiz. Upload sounds above first, then select them here.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:16 }}>
                  <SoundSelector label="✅ Correct Answer" value={settings.sound_correct_id} onChange={v => setSettings({...settings,sound_correct_id:v})} sounds={sounds} />
                  <SoundSelector label="❌ Wrong Answer" value={settings.sound_wrong_id} onChange={v => setSettings({...settings,sound_wrong_id:v})} sounds={sounds} />
                  <SoundSelector label="🏆 Win / Completion" value={settings.win_sound_id} onChange={v => setSettings({...settings,win_sound_id:v})} sounds={sounds} />
                  <SoundSelector label="💀 Lose Sound" value={settings.lose_sound_id} onChange={v => setSettings({...settings,lose_sound_id:v})} sounds={sounds} />
                </div>
                <div style={{ display:'flex', justifyContent:'center' }}>
                  <button className="gb-btn gb-btn-primary gb-btn-sm" onClick={saveSettings} disabled={saving}>
                    {saving ? 'Saving…' : '💾 Save Sound Assignments'}
                  </button>
                </div>
              </div>
              {sounds.length === 0
                ? (
                  <div className="gb-empty">
                    <div className="gb-empty-icon">🔊</div>
                    <h3 style={{ color:'var(--gb-text)', marginBottom:8 }}>No sounds yet</h3>
                    <p>Upload MP3, WAV, or OGG files</p>
                    <button className="gb-btn gb-btn-primary" style={{ marginTop:16 }} onClick={() => soundUploadRef.current.click()}>+ Upload Sound</button>
                  </div>
                )
                : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {sounds.map(s => (
                      <div key={s.id} className="gb-card" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px' }}>
                        <span style={{ fontSize:20 }}>🎵</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:'var(--gb-text)' }}>{s.name}</div>
                          <div style={{ color:'var(--gb-text3)', fontSize:11, marginTop:2 }}>ID: {s.id} · {s.sound_type}</div>
                        </div>
                        <audio controls src={s.url} style={{ height:32 }} />
                        <button className="gb-btn gb-btn-danger gb-btn-sm gb-btn-icon" onClick={() => deleteSound(s)}>🗑</button>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

        </div>{/* ─ end left col ─ */}

        {/* ─── RIGHT COL — Phone Mockup ─── */}
        {tab !== 'locations' && (
        <PhoneFrame settings={settings}>

          {/* ── Form preview ── */}
          {tab === 'form' && (() => {
            const hasBg = settings.bg_image_url
            return (
            <div style={{
              flex:1, display:'flex', flexDirection:'column',
              background: hasBg ? `url(${settings.bg_image_url}) center/cover` : (settings.bg_color||'#f4f4ff'),
              padding:'clamp(16px,4vw,20px) 12px',
              overflow:'auto',
              fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'DM Sans', sans-serif",
            }}>
              <div style={{
                width:'100%', maxWidth:280, margin:'auto',
                background: hasBg ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.93)',
                backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
                borderRadius:22, padding:'20px 16px', boxSizing:'border-box',
                boxShadow: hasBg ? '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)' : '0 8px 40px rgba(0,0,0,0.12)',
                border: hasBg ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.85)',
              }}>
                {settings.game_logo_url && (
                  <div style={{ textAlign:'center', marginBottom:14 }}>
                    <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%', maxHeight:80, objectFit:'contain', borderRadius:8 }} />
                  </div>
                )}
                <h1 style={{ fontSize:16, fontWeight:800, textAlign:'center', marginBottom:2, color: settings.heading_1_color||'#1a1a2e', lineHeight:1.2, textShadow: hasBg ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>{settings.heading_1 || 'Untitled'}</h1>
                {settings.heading_2 && <div style={{ fontSize:13, fontWeight:600, textAlign:'center', marginBottom:4, color: settings.heading_2_color||'#1a1a2e', lineHeight:1.3 }}>{settings.heading_2}</div>}
                {settings.intro_text && (
                  <div style={{
                    background: hasBg ? 'rgba(255,255,255,0.15)' : '#f0f0ff',
                    border:`1.5px solid ${hasBg ? 'rgba(255,255,255,0.3)' : '#6366f130'}`,
                    borderRadius:10, padding:'8px 12px', margin:'10px 0 14px',
                    color: settings.intro_text_color||'#444', fontSize:12, textAlign:'center', lineHeight:1.5,
                  }}>{settings.intro_text}</div>
                )}
                {formFields.map((f,i) => (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color: hasBg ? 'rgba(255,255,255,0.9)' : '#555', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {f.field_label}{f.is_required ? <span style={{color:'#ef4444'}}>*</span> : ''}
                    </div>
                    {f.field_type === 'textarea' ? (
                      <textarea rows={2} placeholder={f.field_label}
                        style={{ width:'100%', background:'rgba(255,255,255,0.88)', border:`1.5px solid ${hasBg ? 'rgba(255,255,255,0.45)' : '#e0e0f0'}`, borderRadius:8, padding:'9px 12px', fontSize:13, color:'#1a1a2e', outline:'none', boxSizing:'border-box', resize:'none', fontFamily:'inherit' }} />
                    ) : (
                      <input type={f.field_type==='email'?'email':f.field_type==='phone'?'tel':f.field_type==='number'?'number':'text'}
                        placeholder={f.field_label}
                        style={{ width:'100%', background:'rgba(255,255,255,0.88)', border:`1.5px solid ${hasBg ? 'rgba(255,255,255,0.45)' : '#e0e0f0'}`, borderRadius:8, padding:'9px 12px', fontSize:13, color:'#1a1a2e', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                    )}
                  </div>
                ))}
                {!!settings.terms_enabled && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, fontSize:11, color: hasBg ? 'rgba(255,255,255,0.85)' : '#666' }}>
                    <span style={{ width:14, height:14, border:'1.5px solid currentColor', borderRadius:3, display:'inline-block', flexShrink:0 }} />
                    {settings.terms_text || 'Terms & Conditions'}
                  </div>
                )}
                <div style={{ marginTop:!!settings.terms_enabled && (settings.terms_text || settings.terms_url) ? 0 : 8 }}>
                  <div style={{
                    width:'100%', textAlign:'center',
                    background: settings.start_button_bg_color || `linear-gradient(135deg, ${settings.primary_color||'#6366f1'}, ${(settings.primary_color||'#6366f1')}cc)`,
                    color: settings.start_button_text_color||'#fff', border:'none', borderRadius:10, padding:'12px', fontSize:14, fontWeight:700,
                    boxShadow: settings.start_button_bg_color ? '0 6px 20px rgba(0,0,0,0.15)' : `0 6px 20px ${(settings.primary_color||'#6366f1')}44`,
                    cursor:'pointer',
                  }}>
                    {settings.start_button_text || 'Start Quiz →'}
                  </div>
                </div>
              </div>
            </div>
          )})()}

          {/* ── Questions preview (live edits via throttled state) ── */}
          {tab === 'questions' && questions.length > 0 && (() => {
            const previewQ = liveQ?.id === selectedQuestionId ? liveQ : (questions.find(q => q.id === selectedQuestionId) || questions[0])
            const hasBg = previewQ.question_bg_image_url || settings.bg_image_url
            const handleOptionClick = (opt) => {
              clearTimeout(previewTimerRef.current)
              const hasOverlay = !!opt.option_overlay_image_url
              if (hasOverlay) {
                setPreviewOverlay(opt)
                setPreviewStage('flyingIn')
                const idle = (Number(previewQ.overlay_idle_time) || 3) * 1000
                previewTimerRef.current = setTimeout(() => {
                  setPreviewStage('visible')
                  previewTimerRef.current = setTimeout(() => {
                    setPreviewStage('flyingOut')
                    previewTimerRef.current = setTimeout(() => {
                      setPreviewOverlay(null)
                      setPreviewStage('next')
                    }, 550)
                  }, idle)
                }, 650)
              } else {
                setPreviewStage('next')
              }
            }
            return (
            <div style={{
              flex:1, display:'flex', flexDirection:'column',
              background: previewQ.question_bg_image_url
                ? `url(${previewQ.question_bg_image_url}) center/cover`
                : settings.bg_image_url
                  ? `url(${settings.bg_image_url}) center/cover`
                  : (settings.bg_color||'#f4f4ff'),
              fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'DM Sans', sans-serif",
              position:'relative', overflow:'hidden',
            }}>
              {/* Overlay layer */}
              {previewOverlay && previewOverlay.option_overlay_image_url && (
                <div style={{
                  position:'absolute', inset:0, zIndex:10,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  animation: previewStage === 'flyingIn'
                    ? `${previewQ.overlay_animation_in || 'flyFromBottom'} 0.6s cubic-bezier(0.34,1.3,0.64,1) forwards`
                    : previewStage === 'flyingOut'
                      ? `${previewQ.overlay_animation_out || 'flyToTop'} 0.5s cubic-bezier(0.55,0,0.85,0.36) forwards`
                      : 'none',
                  opacity: previewStage === 'visible' ? 1 : undefined,
                  transform: previewStage === 'visible' ? 'translateY(0) translateX(0) scale(1)' : undefined,
                }}>
                  <img src={previewOverlay.option_overlay_image_url} alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              )}
              {/* Progress bar */}
              {(settings.show_progress !== 0) && (
                <div style={{ padding:'10px 14px 0', flexShrink:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color: hasBg ? 'rgba(255,255,255,0.9)' : '#888', fontWeight:600, marginBottom:4 }}>
                    <span>Question {questions.indexOf(previewQ)+1} of {questions.length}</span>
                    <span>{Math.round(((questions.indexOf(previewQ)+1)/questions.length)*100)}%</span>
                  </div>
                  <div style={{ height:4, background: hasBg ? 'rgba(255,255,255,0.25)' : '#e8e8f5', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${((questions.indexOf(previewQ)+1)/questions.length)*100}%`, background:`linear-gradient(90deg, ${settings.primary_color||'#7c6ff7'}, ${(settings.primary_color||'#7c6ff7')}bb)`, borderRadius:10, transition:'width 0.5s ease' }} />
                  </div>
                </div>
              )}
              {/* Question card */}
              <div style={{
                flex:1, display:'flex', flexDirection:'column',
                padding:'8px 12px 12px', overflow:'auto',
              }}>
                <div style={{
                  flex:1, display:'flex', flexDirection:'column',
                  background: hasBg ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.97)',
                  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                  borderRadius:18,
                  border: hasBg ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: hasBg ? '0 8px 40px rgba(0,0,0,0.28)' : '0 8px 40px rgba(0,0,0,0.12)',
                  overflow:'hidden',
                }}>
                  {/* Question image — no fallback shown */}
                  {previewQ.question_image_url && (
                    <div style={{
                      flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center',
                      padding:'10px 10px 0', background: hasBg ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.03)', overflow:'hidden',
                    }}>
                      <img src={previewQ.question_image_url} alt=""
                        style={{
                          width:'100%', height:'100%', objectFit:'contain', display:'block', borderRadius:8,
                          animation: IMAGE_ANIM_MAP[previewQ.question_image_animation] || 'none',
                        }} />
                    </div>
                  )}
                  {/* Bottom: question text + options + next button */}
                  <div style={{ flexShrink:0, display:'flex', flexDirection:'column', padding:'10px 12px 12px', gap:8 }}>
                    <h2 style={{
                      color: hasBg ? '#fff' : (previewQ.question_color||'#1a1a2e'),
                      fontSize:13, textAlign:'center', fontWeight:700, margin:0, lineHeight:1.4,
                      textShadow: hasBg ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                    }}>
                      {previewQ.question_text || 'Untitled question'}
                    </h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {(previewQ.options||[]).slice(0,4).map((opt,i) => (
                        <div key={opt.id||i} onClick={() => handleOptionClick(opt)}
                          style={{
                            background: opt.option_color || '#1a1a2e',
                            color: opt.option_text_color || '#ffffff',
                            borderRadius:12, padding: opt.option_image_url ? '0' : '8px 12px', fontSize:12, fontWeight:600,
                            textAlign:'center', border:'2px solid transparent',
                            boxShadow:'0 2px 8px rgba(0,0,0,0.1)', cursor:'pointer',
                            overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', minHeight:36,
                          }}>
                          {opt.option_image_url
                            ? <img src={opt.option_image_url} alt="" style={{ maxWidth:'100%', maxHeight:72, objectFit:'contain', borderRadius:8 }} />
                            : (opt.option_text || `Option ${i+1}`)
                          }
                        </div>
                      ))}
                    </div>
                    {/* Next button — appears after overlay + idle */}
                    {previewStage === 'next' && (
                      <div style={{
                        width:'100%', textAlign:'center', marginTop:4,
                        background: settings.next_button_bg_color || `linear-gradient(135deg, ${settings.primary_color||'#6366f1'}, ${(settings.primary_color||'#6366f1')}cc)`,
                        color: settings.next_button_text_color||'#fff', borderRadius:10, padding:'10px', fontSize:13, fontWeight:700,
                        boxShadow: settings.next_button_bg_color ? '0 4px 16px rgba(0,0,0,0.12)' : `0 4px 16px ${(settings.primary_color||'#6366f1')}33`,
                        cursor:'default', opacity:0.85,
                      }}>
                        {settings.next_button_text || 'Next →'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})()}

          {/* ── Thankyou preview ── */}
          {tab === 'thankyou' && (
            <div style={{
              flex:1, display:'flex', flexDirection:'column',
              background: settings.thankyou_bg_image_url
                ? `url(${settings.thankyou_bg_image_url}) center/cover`
                : settings.bg_image_url
                  ? `url(${settings.bg_image_url}) center/cover`
                  : (settings.bg_color||'#f4f4ff'),
              padding:'clamp(16px,4vw,20px) 12px',
              overflow:'auto',
              fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'DM Sans', sans-serif",
            }}>
              <div style={{
                width:'100%', maxWidth:280, margin:'auto', textAlign:'center',
                background: (settings.thankyou_bg_image_url||settings.bg_image_url) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)',
                backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
                borderRadius:22, padding:'24px 16px', boxSizing:'border-box',
                boxShadow: (settings.thankyou_bg_image_url||settings.bg_image_url) ? '0 16px 60px rgba(0,0,0,0.28)' : '0 16px 60px rgba(0,0,0,0.12)',
                border: (settings.thankyou_bg_image_url||settings.bg_image_url) ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize:44, marginBottom:8 }}>🎉</div>
                <h2 style={{ fontSize:18, fontWeight:800, color: settings.outro_text_color||'#1a1a2e', marginBottom:14, lineHeight:1.25, textShadow: (settings.thankyou_bg_image_url||settings.bg_image_url) ? '0 2px 8px rgba(0,0,0,0.25)' : 'none' }}>
                  {settings.outro_text || 'Yay! You completed the game!'}
                </h2>
                <div style={{
                  background: (settings.thankyou_bg_image_url||settings.bg_image_url) ? 'rgba(255,255,255,0.15)' : '#f0f0ff',
                  border:`1.5px solid ${(settings.thankyou_bg_image_url||settings.bg_image_url) ? 'rgba(255,255,255,0.3)' : '#6366f130'}`,
                  borderRadius:12, padding:'10px 14px', marginBottom:16,
                  color: settings.thankyou_subtitle_color||'#444', fontSize:12,
                }}>
                  {settings.thankyou_subtitle || '✅ Thank you for completing!'}
                </div>
                <div style={{
                  width:'100%',
                  background: settings.submit_button_bg_color || `linear-gradient(135deg, ${settings.primary_color||'#6366f1'}, ${(settings.primary_color||'#6366f1')}cc)`,
                  color: settings.submit_button_text_color||'#fff', borderRadius:12, padding:'12px', fontSize:14, fontWeight:700,
                  boxShadow: settings.submit_button_bg_color ? '0 6px 24px rgba(0,0,0,0.15)' : `0 6px 24px ${(settings.primary_color||'#6366f1')}55`,
                  cursor:'pointer',
                }}>
                  🚀 {settings.submit_button_text || 'Submit & Explore'}
                </div>
              </div>
            </div>
          )}

          {/* ── Email preview (live HTML template) ── */}
          {tab === 'email' && (() => {
            const isPlayer = emailSubTab === 'player'
            const boKey = boEmailTab
            const preview = isPlayer ? {
              headerColor: emailTemplate.header_color || '#6366f1',
              headerText: emailTemplate.header_text || '🎉 Congratulations!',
              bodyHtml: emailTemplate.body_html || '<p>Thank you for completing the game!</p>',
              footerText: emailTemplate.footer_text || '',
            } : {
              headerColor: boEmailTab === 'bo_notification' ? '#f59e0b' : boEmailTab === 'redemption_complete' ? '#22c55e' : '#6366f1',
              headerText: boEmailSettings[boKey].subject || 'Email Preview',
              bodyHtml: (boEmailSettings[boKey].body || '<p>Email content here</p>')
                .replace(/\{\{code\}\}/g, '236672')
                .replace(/\{\{name\}\}/g, 'Customer')
                .replace(/\{\{player_name\}\}/g, 'Customer')
                .replace(/\{\{game_name\}\}/g, 'Game Name')
                .replace(/\{\{bo_name\}\}/g, 'Store Owner'),
              footerText: '© PromoGames',
            }
            const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin:0; padding:0; background:#f4f4f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrap { max-width:600px; margin:0 auto; background:#fff; }
    .header { background:${preview.headerColor}; padding:24px 20px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:20px; font-weight:700; }
    .body { padding:24px 20px; color:#333; font-size:14px; line-height:1.6; }
    .footer { padding:16px 20px; text-align:center; font-size:11px; color:#999; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>${preview.headerText}</h1></div>
    <div class="body">${preview.bodyHtml}</div>
    <div class="footer">${preview.footerText}</div>
  </div>
</body>
</html>`.trim()
            return (
            <iframe
              title="Email Preview"
              srcDoc={html}
              style={{ flex:1, width:'100%', border:'none', background:'#f4f4f6' }}
              sandbox="allow-same-origin"
            />
          )})()}
          {/* ── Settings / Sounds preview (form screen) ── */}
          {(tab === 'settings' || tab === 'sounds') && (() => {
            const hasBg = settings.bg_image_url
            return (
            <div style={{
              flex:1, display:'flex', flexDirection:'column',
              background: hasBg ? `url(${settings.bg_image_url}) center/cover` : (settings.bg_color||'#f4f4ff'),
              padding:'clamp(16px,4vw,20px) 12px',
              overflow:'auto',
              fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'DM Sans', sans-serif",
            }}>
              <div style={{
                width:'100%', maxWidth:280, margin:'auto',
                background: hasBg ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.93)',
                backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
                borderRadius:22, padding:'20px 16px', boxSizing:'border-box',
                boxShadow: hasBg ? '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)' : '0 8px 40px rgba(0,0,0,0.12)',
                border: hasBg ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.85)',
              }}>
                {settings.game_logo_url && (
                  <div style={{ textAlign:'center', marginBottom:14 }}>
                    <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%', maxHeight:80, objectFit:'contain', borderRadius:8 }} />
                  </div>
                )}
                <h1 style={{ fontSize:16, fontWeight:800, textAlign:'center', marginBottom:2, color: settings.heading_1_color||'#1a1a2e', lineHeight:1.2, textShadow: hasBg ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>{settings.heading_1 || 'Untitled'}</h1>
                {settings.heading_2 && <div style={{ fontSize:13, fontWeight:600, textAlign:'center', marginBottom:4, color: settings.heading_2_color||'#1a1a2e', lineHeight:1.3 }}>{settings.heading_2}</div>}
                {settings.intro_text && (
                  <div style={{
                    background: hasBg ? 'rgba(255,255,255,0.15)' : '#f0f0ff',
                    border:`1.5px solid ${hasBg ? 'rgba(255,255,255,0.3)' : '#6366f130'}`,
                    borderRadius:10, padding:'8px 12px', margin:'10px 0 14px',
                    color: settings.intro_text_color||'#444', fontSize:12, textAlign:'center', lineHeight:1.5,
                  }}>{settings.intro_text}</div>
                )}
                {!!settings.terms_enabled && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, fontSize:11, color: hasBg ? 'rgba(255,255,255,0.85)' : '#666' }}>
                    <span style={{ width:14, height:14, border:'1.5px solid currentColor', borderRadius:3, display:'inline-block', flexShrink:0 }} />
                    {settings.terms_text || 'Terms & Conditions'}
                  </div>
                )}
                <div style={{ marginTop:!!settings.terms_enabled && (settings.terms_text || settings.terms_url) ? 0 : 8 }}>
                  <div style={{
                    width:'100%', textAlign:'center',
                    background: settings.start_button_bg_color || `linear-gradient(135deg, ${settings.primary_color||'#6366f1'}, ${(settings.primary_color||'#6366f1')}cc)`,
                    color: settings.start_button_text_color||'#fff', border:'none', borderRadius:10, padding:'12px', fontSize:14, fontWeight:700,
                    boxShadow: settings.start_button_bg_color ? '0 6px 20px rgba(0,0,0,0.15)' : `0 6px 20px ${(settings.primary_color||'#6366f1')}44`,
                    cursor:'pointer',
                  }}>
                    {settings.start_button_text || 'Start Quiz →'}
                  </div>
                </div>
              </div>
            </div>
          )})()}
        </PhoneFrame>
        )}{/* ─ end right col ─ */}

        {/* ─── LOCATIONS PANEL ─── */}
        {tab === 'locations' && isParentGame && (
          <div style={{ position:'sticky', top:80, width:340, flexShrink:0, marginRight:20 }}>
            <BuilderPhoneMockup
              gameId={id}
              clientId={game?.client_id}
              settings={settings}
              businessTab={businessTab}
              onBusinessTabChange={setBusinessTab}
            >
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f4ff', padding:20 }}>
                <div style={{ textAlign:'center', color:'#64657a' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📍</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>Location Manager</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Switch to Locations tab to manage</div>
                </div>
              </div>
            </BuilderPhoneMockup>
          </div>
        )}


      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}