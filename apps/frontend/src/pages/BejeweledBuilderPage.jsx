import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

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
@keyframes scaleIn       { from { transform:scale(0.5);opacity:0 } to { transform:scale(1);opacity:1 } }
@keyframes slideUp        { from { transform:translateY(60px);opacity:0 } to { transform:translateY(0);opacity:1 } }
@keyframes slideDown      { from { transform:translateY(-60px);opacity:0 } to { transform:translateY(0);opacity:1 } }
@keyframes rotateIn       { from { transform:rotate(-360deg) scale(0.3);opacity:0 } to { transform:rotate(0) scale(1);opacity:1 } }
@keyframes flipIn         { from { transform:rotateX(-90deg);opacity:0 } to { transform:rotateX(0) scale(1);opacity:1 } }
@keyframes swirlIn        { from { transform:rotate(720deg) scale(0.1);opacity:0 } to { transform:rotate(0) scale(1);opacity:1 } }
@keyframes bounceIn       { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 85%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes elasticIn      { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.08)} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
@keyframes blurIn         { from { filter:blur(12px);opacity:0 } to { filter:blur(0);opacity:1 } }
@keyframes dropIn         { 0%{transform:translateY(-120vh) rotate(-20deg);opacity:0} 60%{transform:translateY(10px) rotate(2deg);opacity:1} 80%{transform:translateY(-5px) rotate(-1deg)} 100%{transform:translateY(0) rotate(0);opacity:1} }
@keyframes wipeIn         { from { clip-path:inset(0 100% 0 0) } to { clip-path:inset(0 0 0 0) } }
@keyframes skewIn         { from { transform:skewX(-20deg);opacity:0 } to { transform:skewX(0);opacity:1 } }
@keyframes spiralIn      { from { transform:rotate(1080deg) translateX(-200px);opacity:0 } to { transform:rotate(0) translateX(0);opacity:1 } }
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
@keyframes scaleOut      { from { transform:scale(1);opacity:1 } to { transform:scale(0.5);opacity:0 } }
@keyframes slideUpOut     { from { transform:translateY(0);opacity:1 } to { transform:translateY(-60px);opacity:0 } }
@keyframes slideDownOut   { from { transform:translateY(0);opacity:1 } to { transform:translateY(60px);opacity:0 } }
@keyframes rotateOut      { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(360deg) scale(0.3);opacity:0 } }
@keyframes flipOut        { from { transform:rotateX(0);opacity:1 } to { transform:rotateX(90deg);opacity:0 } }
@keyframes swirlOut      { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(-720deg) scale(0.1);opacity:0 } }
@keyframes bounceOut      { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.06)} 100%{transform:scale(0.1);opacity:0} }
@keyframes elasticOut     { 0%{transform:scale(1);opacity:1} 30%{transform:scale(0.92)} 60%{transform:scale(1.06)} 100%{transform:scale(0);opacity:0} }
@keyframes blurOut        { from { filter:blur(0);opacity:1 } to { filter:blur(12px);opacity:0 } }
@keyframes dropOut        { 0%{transform:translateY(0) rotate(0);opacity:1} 40%{transform:translateY(10px) rotate(2deg);opacity:1} 100%{transform:translateY(120vh) rotate(20deg);opacity:0 } }
@keyframes wipeOut        { from { clip-path:inset(0 0 0 0) } to { clip-path:inset(0 0 0 100%) } }
@keyframes skewOut        { from { transform:skewX(0);opacity:1 } to { transform:skewX(20deg);opacity:0 } }
@keyframes spiralOut      { from { transform:rotate(0) translateX(0);opacity:1 } to { transform:rotate(-1080deg) translateX(200px);opacity:0 } }
@keyframes rushOut        { from { transform:scale(1);opacity:1 } to { transform:scale(3);opacity:0 } }
@keyframes foldOut        { from { transform:perspective(500px) rotateY(0);opacity:1 } to { transform:perspective(500px) rotateY(90deg);opacity:0 } }
@keyframes hideOut        { from { clip-path:circle(100% at 50% 50%) } to { clip-path:circle(0% at 50% 50%) } }
@keyframes spinOut        { from { transform:rotate(0) scale(1);opacity:1 } to { transform:rotate(-720deg) scale(0);opacity:0 } }
@keyframes cometOut       { from { transform:translate(0,0) rotate(0) scale(1);opacity:1 } to { transform:translate(200px,200px) rotate(30deg) scale(0.3);opacity:0 } }
@keyframes floatOut        { from { transform:translateY(0);opacity:1 } to { transform:translateY(-40px);opacity:0 } }
@keyframes qFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes qBreathe { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.04);opacity:0.9} }
@keyframes qPulse { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.05);filter:brightness(1.08)} }
@keyframes qShimmer { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(1.5deg)} 75%{transform:rotate(-1.5deg)} }
@keyframes qKenBurns { 0%,100%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.08) translate(-2%,-2%)} }
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
@keyframes qFadeInOut { 0%,100%{opacity:1} 50%{transform:scale(0.95);opacity:0.3} }
@keyframes qWave { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-6px) rotate(1deg)} 50%{transform:translateY(0) rotate(0deg)} 75%{transform:translateY(4px) rotate(-1deg)} }
@keyframes qOrbit { 0%{transform:translate(0,0)} 25%{transform:translate(10px,-10px)} 50%{transform:translate(0,-16px)} 75%{transform:translate(-10px,-10px)} 100%{transform:translate(0,0)} }
@keyframes qGlitch { 0%,100%{transform:translate(0)} 20%{transform:translate(-2px,1px) skewX(-1deg)} 40%{transform:translate(2px,-1px) skewX(1deg)} 60%{transform:translate(-1px,-1px) skewX(-0.5deg)} 80%{transform:translate(1px,2px) skewX(0.5deg)} }
@keyframes qBlurBlink { 0%,100%{filter:blur(0);opacity:1} 25%{filter:blur(3px);opacity:0.6} 50%{filter:blur(0);opacity:1} 75%{filter:blur(2px);opacity:0.7} }
@keyframes qSkew { 0%,100%{transform:skewX(0deg)} 25%{transform:skewX(-4deg)} 75%{transform:skewX(4deg)} }
@keyframes qRoll { 0%{transform:translateX(0) rotate(0deg)} 50%{transform:translateX(60px) rotate(360deg)} 100%{transform:translateX(0) rotate(720deg)} }
@keyframes qBounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.12)} 70%{transform:scale(0.94)} 85%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes qJello { 0%,100%{transform:skewX(0deg) skewY(0deg)} 25%{transform:skewX(-5deg) skewY(3deg)} 50%{transform:skewX(5deg) skewY(-3deg)} 75%{transform:skewX(-3deg) skewY(2deg)} }
`

export default function BejeweledBuilderPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [game,          setGame]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [tab,           setTab]           = useState('form')
  const [toast,         setToast]         = useState(null)
  const [formFields,    setFormFields]    = useState([])
  const [emailTemplate, setEmailTemplate] = useState({})
  const [settings,      setSettings]      = useState({})
  const [game2048,      setGame2048]      = useState({
    grid_size: 4,
    target_number: 2048,
    tile_colors: JSON.stringify({
      '2':'#eee4da','4':'#ede0c8','8':'#f2b179','16':'#f59563','32':'#f67c5f','64':'#f65e3b',
      '128':'#edcf72','256':'#edcc61','512':'#edc850','1024':'#edc53f','2048':'#edc22e','4096':'#3c3a32'
    }),
    show_timer: 0,
    time_limit_seconds: 0,
    heading_1: '',
    heading_2: '',
    heading_3: '',
    heading_1_color: '#1a1a2e',
    heading_2_color: '#64657a',
    heading_3_color: '#64657a',
    description_text: '',
    sound_slide_id: '',
    sound_merge_id: '',
    sound_win_id: '',
    sound_lose_id: '',
  })
  const [slugInput,     setSlugInput]     = useState('')
  const [editingName,   setEditingName]   = useState(false)
  const [nameInput,     setNameInput]     = useState('')
  const [sounds,        setSounds]        = useState([])
  const [saving,        setSaving]        = useState(false)
  const [soundUploading,setSoundUploading]= useState(false)
  const [redirectUrl,   setRedirectUrl]   = useState('')

  const soundUploadRef = useRef()
  const bgImgRef       = useRef()
  const tyBgImgRef     = useRef()
  const gameLogoRef    = useRef()

  const showToast = (msg, type='success') => setToast({ msg, type })

  const loadGame = useCallback(() => {
    setLoading(true); setFetchError(null)
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/2048/${id}/settings`),
      api.get(`/sounds/games/${id}/sounds`)
    ]).then(([gameRes, g2048Res, soundsRes]) => {
      const g = gameRes.data.game
      setGame(g)
      setFormFields(g.formFields||[])
      setEmailTemplate(g.emailTemplate||{})
      setSettings(g.settings||{})
      setSlugInput(g.slug||'')
      setRedirectUrl(g.redirect_url||'')
      setSounds(soundsRes.data.sounds || g.sounds || [])
      if (g2048Res.data && g2048Res.data.settings) {
        setGame2048(prev => ({ ...prev, ...g2048Res.data.settings }))
      }
    }).catch(err => {
      setFetchError(err.response?.data?.message || err.message || 'Failed to load game')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadGame() }, [loadGame])

  // ... rest of the component

  return (
    <div className="gb-wrap">
      <style>{LIGHT}</style>
      {/* ... rest of JSX ... */}
    </div>
  )

}