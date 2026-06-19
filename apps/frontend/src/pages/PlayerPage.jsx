import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import CrosswordPlayerPage from './CrosswordPlayerPage'
import SpinPlayerPage      from './SpinPlayerPage'

const api = axios.create({ baseURL: '/api' })

function loadFont(font) {
  if (!font || font === 'DM Sans') return
  const id = 'gf-' + font.replace(/\s/g, '-')
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id; link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`
  document.head.appendChild(link)
}

const OVERLAY_STYLES = `
  @keyframes flyFromBottom  { from { transform: translateY(110vh) scale(0.9); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
  @keyframes flyFromTop     { from { transform: translateY(-110vh) scale(0.9); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
  @keyframes flyFromLeft    { from { transform: translateX(-110vw) scale(0.9); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
  @keyframes flyFromRight   { from { transform: translateX(110vw) scale(0.9); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
  @keyframes zoomIn         { from { transform: scale(0.1); opacity:0 } to { transform: scale(1); opacity:1 } }
  @keyframes fadeIn         { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn        { from { transform: scale(0.5); opacity:0 } to { transform: scale(1); opacity:1 } }
  @keyframes slideUp        { from { transform: translateY(60px); opacity:0 } to { transform: translateY(0); opacity:1 } }
  @keyframes slideDown      { from { transform: translateY(-60px); opacity:0 } to { transform: translateY(0); opacity:1 } }
  @keyframes rotateIn       { from { transform: rotate(-360deg) scale(0.3); opacity:0 } to { transform: rotate(0) scale(1); opacity:1 } }
  @keyframes flipIn         { from { transform: rotateX(-90deg); opacity:0 } to { transform: rotateX(0); opacity:1 } }
  @keyframes swirlIn        { from { transform: rotate(720deg) scale(0.1); opacity:0 } to { transform: rotate(0) scale(1); opacity:1 } }
  @keyframes bounceIn       { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 85%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes elasticIn      { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.08)} 80%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
  @keyframes blurIn         { from { filter:blur(12px); opacity:0 } to { filter:blur(0); opacity:1 } }
  @keyframes dropIn         { 0%{transform:translateY(-120vh) rotate(-20deg);opacity:0} 60%{transform:translateY(10px) rotate(2deg);opacity:1} 80%{transform:translateY(-5px) rotate(-1deg)} 100%{transform:translateY(0) rotate(0);opacity:1} }
  @keyframes wipeIn         { from { clip-path:inset(0 100% 0 0) } to { clip-path:inset(0 0 0 0) } }
  @keyframes skewIn         { from { transform:skewX(-20deg); opacity:0 } to { transform:skewX(0); opacity:1 } }
  @keyframes spiralIn       { from { transform:rotate(1080deg) translateX(-200px); opacity:0 } to { transform:rotate(0) translateX(0); opacity:1 } }
  @keyframes rushIn         { from { transform:scale(3); opacity:0 } to { transform:scale(1); opacity:1 } }
  @keyframes foldIn         { from { transform:perspective(500px) rotateY(90deg); opacity:0 } to { transform:perspective(500px) rotateY(0); opacity:1 } }
  @keyframes revealIn       { from { clip-path:circle(0% at 50% 50%) } to { clip-path:circle(100% at 50% 50%) } }
  @keyframes spinIn         { from { transform:rotate(720deg) scale(0); opacity:0 } to { transform:rotate(0) scale(1); opacity:1 } }
  @keyframes cometIn        { from { transform:translate(-200px,-200px) rotate(-30deg) scale(0.3); opacity:0 } to { transform:translate(0,0) rotate(0) scale(1); opacity:1 } }
  @keyframes floatIn        { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }

  @keyframes flyToTop       { from { transform: translateY(0) scale(1); opacity:1 } to { transform: translateY(-110vh) scale(0.9); opacity:0 } }
  @keyframes flyToBottom    { from { transform: translateY(0) scale(1); opacity:1 } to { transform: translateY(110vh) scale(0.9); opacity:0 } }
  @keyframes flyToLeft      { from { transform: translateX(0) scale(1); opacity:1 } to { transform: translateX(-110vw) scale(0.9); opacity:0 } }
  @keyframes flyToRight     { from { transform: translateX(0) scale(1); opacity:1 } to { transform: translateX(110vw) scale(0.9); opacity:0 } }
  @keyframes zoomOut        { from { transform: scale(1); opacity:1 } to { transform: scale(0.1); opacity:0 } }
  @keyframes fadeOut        { from { opacity:1 } to { opacity:0 } }
  @keyframes scaleOut       { from { transform: scale(1); opacity:1 } to { transform: scale(0.5); opacity:0 } }
  @keyframes slideUpOut     { from { transform: translateY(0); opacity:1 } to { transform: translateY(-60px); opacity:0 } }
  @keyframes slideDownOut   { from { transform: translateY(0); opacity:1 } to { transform: translateY(60px); opacity:0 } }
  @keyframes rotateOut      { from { transform: rotate(0) scale(1); opacity:1 } to { transform: rotate(360deg) scale(0.3); opacity:0 } }
  @keyframes flipOut        { from { transform: rotateX(0); opacity:1 } to { transform: rotateX(90deg); opacity:0 } }
  @keyframes swirlOut       { from { transform: rotate(0) scale(1); opacity:1 } to { transform: rotate(-720deg) scale(0.1); opacity:0 } }
  @keyframes bounceOut      { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.06)} 100%{transform:scale(0.1);opacity:0} }
  @keyframes elasticOut     { 0%{transform:scale(1);opacity:1} 30%{transform:scale(0.92)} 60%{transform:scale(1.06)} 100%{transform:scale(0);opacity:0} }
  @keyframes blurOut        { from { filter:blur(0); opacity:1 } to { filter:blur(12px); opacity:0 } }
  @keyframes dropOut        { 0%{transform:translateY(0) rotate(0);opacity:1} 40%{transform:translateY(10px) rotate(2deg);opacity:1} 100%{transform:translateY(120vh) rotate(20deg);opacity:0} }
  @keyframes wipeOut        { from { clip-path:inset(0 0 0 0) } to { clip-path:inset(0 0 0 100%) } }
  @keyframes skewOut        { from { transform:skewX(0); opacity:1 } to { transform:skewX(20deg); opacity:0 } }
  @keyframes spiralOut      { from { transform:rotate(0) translateX(0); opacity:1 } to { transform:rotate(-1080deg) translateX(200px); opacity:0 } }
  @keyframes rushOut        { from { transform:scale(1); opacity:1 } to { transform:scale(3); opacity:0 } }
  @keyframes foldOut        { from { transform:perspective(500px) rotateY(0); opacity:1 } to { transform:perspective(500px) rotateY(90deg); opacity:0 } }
  @keyframes hideOut        { from { clip-path:circle(100% at 50% 50%) } to { clip-path:circle(0% at 50% 50%) } }
  @keyframes spinOut        { from { transform:rotate(0) scale(1); opacity:1 } to { transform:rotate(-720deg) scale(0); opacity:0 } }
  @keyframes cometOut       { from { transform:translate(0,0) rotate(0) scale(1); opacity:1 } to { transform:translate(200px,200px) rotate(30deg) scale(0.3); opacity:0 } }
  @keyframes floatOut       { from { transform:translateY(0); opacity:1 } to { transform:translateY(-40px); opacity:0 } }

  @keyframes spin           { to { transform: rotate(360deg) } }
  @keyframes questionEnter  { from { opacity:0; transform: translateY(18px) scale(0.98) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes scaleIn        { from { opacity:0; transform: scale(0.85) } to { opacity:1; transform: scale(1) } }
  @keyframes bounce         { 0%,100% { transform:scale(1) } 50% { transform:scale(1.2) } }
  @keyframes cffall         { to { transform: translateY(110vh) rotate(720deg); opacity:0 } }
  @keyframes nextBtnIn      { from { opacity:0; transform: translateY(16px) scale(0.9) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes pulse          { 0%,100% { box-shadow: 0 0 0 0 currentColor } 50% { box-shadow: 0 0 0 8px transparent } }

  @keyframes qImgFloat      { 0%,100% { transform: translateY(0px) scale(1) } 50% { transform: translateY(-10px) scale(1.02) } }
  @keyframes qImgBreathe    { 0%,100% { transform: scale(1); opacity:1 } 50% { transform: scale(1.04); opacity:0.9 } }
  @keyframes qImgPulse      { 0%,100% { transform: scale(1); filter: brightness(1) } 50% { transform: scale(1.05); filter: brightness(1.08) } }
  @keyframes qImgShimmer    { 0%,100% { transform: rotate(-1deg) scale(1) } 50% { transform: rotate(1deg) scale(1.03) } }
  @keyframes qImgKenBurns   { 0% { transform: scale(1) translate(0,0) } 100% { transform: scale(1.08) translate(-2%,-2%) } }
  @keyframes qImgBounce     { 0%,100% { transform: translateY(0) } 20% { transform: translateY(-14px) } 40% { transform: translateY(-7px) } 60% { transform: translateY(-3px) } 80% { transform: translateY(-1px) } }
  @keyframes qImgSway      { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
  @keyframes qImgWobble    { 0%,100% { transform: translateX(0) } 15% { transform: translateX(-6px) rotate(-3deg) } 30% { transform: translateX(4px) rotate(2deg) } 45% { transform: translateX(-3px) rotate(-1deg) } 60% { transform: translateX(2px) rotate(1deg) } }
  @keyframes qImgSwing     { 0%,100% { transform: rotate(0deg) } 20% { transform: rotate(6deg) } 40% { transform: rotate(-5deg) } 60% { transform: rotate(3deg) } 80% { transform: rotate(-2deg) } }
  @keyframes qImgTada      { 0%,100% { transform: scale(1) rotate(0deg) } 10% { transform: scale(0.94) rotate(-2deg) } 20% { transform: scale(1.06) rotate(2deg) } 30% { transform: scale(1) rotate(-2deg) } 40% { transform: scale(1.02) rotate(0deg) } }
  @keyframes qImgHeartBeat { 0%,100% { transform: scale(1) } 15% { transform: scale(1.12) } 30% { transform: scale(1) } 45% { transform: scale(1.08) } 60% { transform: scale(1) } }
  @keyframes qImgRotate    { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
  @keyframes qImgFlash     { 0%,100% { opacity:1 } 25% { opacity:0.3 } 50% { opacity:1 } 75% { opacity:0.3 } }
  @keyframes qImgRubberBand { 0%,100% { transform: scaleX(1) scaleY(1) } 15% { transform: scaleX(1.2) scaleY(0.85) } 30% { transform: scaleX(0.9) scaleY(1.1) } 45% { transform: scaleX(1.08) scaleY(0.95) } 60% { transform: scaleX(0.97) scaleY(1.03) } }
  @keyframes qImgSlideUpDown { 0%,100% { transform: translateY(0) } 25% { transform: translateY(-20px) } 50% { transform: translateY(0) } 75% { transform: translateY(12px) } }
  @keyframes qImgZoomInOut  { 0%,100% { transform: scale(1) } 50% { transform: scale(1.12) } }
  @keyframes qImgFadeInOut  { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
  @keyframes qImgWave       { 0%,100% { transform: translateY(0) rotate(0deg) } 25% { transform: translateY(-6px) rotate(1deg) } 50% { transform: translateY(0) rotate(0deg) } 75% { transform: translateY(4px) rotate(-1deg) } }
  @keyframes qImgOrbit      { 0% { transform: translate(0,0) } 25% { transform: translate(10px,-10px) } 50% { transform: translate(0,-16px) } 75% { transform: translate(-10px,-10px) } 100% { transform: translate(0,0) } }
  @keyframes qImgGlitch     { 0%,100% { transform: translate(0) } 20% { transform: translate(-2px,1px) skewX(-1deg) } 40% { transform: translate(2px,-1px) skewX(1deg) } 60% { transform: translate(-1px,-1px) skewX(-0.5deg) } 80% { transform: translate(1px,2px) skewX(0.5deg) } }
  @keyframes qImgBlurBlink  { 0%,100% { filter:blur(0);opacity:1 } 25% { filter:blur(3px);opacity:0.6 } 50% { filter:blur(0);opacity:1 } 75% { filter:blur(2px);opacity:0.7 } }
  @keyframes qImgSkew       { 0%,100% { transform: skewX(0deg) } 25% { transform: skewX(-4deg) } 50% { transform: skewX(0deg) } 75% { transform: skewX(4deg) } }
  @keyframes qImgRoll       { 0% { transform: translateX(0) rotate(0deg) } 50% { transform: translateX(60px) rotate(360deg) } 100% { transform: translateX(0) rotate(720deg) } }
  @keyframes qImgBounceIn   { 0% { transform: scale(0);opacity:0 } 50% { transform: scale(1.12) } 70% { transform: scale(0.94) } 85% { transform: scale(1.04) } 100% { transform: scale(1);opacity:1 } }
  @keyframes qImgJello      { 0%,100% { transform: skewX(0deg) skewY(0deg) } 25% { transform: skewX(-5deg) skewY(3deg) } 50% { transform: skewX(5deg) skewY(-3deg) } 75% { transform: skewX(-3deg) skewY(2deg) } }
  @keyframes qImgEntrance   { from { opacity:0; transform: scale(0.88) translateY(16px) } to { opacity:1; transform: scale(1) translateY(0) } }

  @keyframes modalIn        { from { opacity:0; transform: scale(0.82) translateY(32px) } to { opacity:1; transform: scale(1) translateY(0) } }
  @keyframes backdropIn     { from { opacity:0 } to { opacity:1 } }

  @keyframes optionReveal   { from { transform: scale(1) } 50% { transform: scale(0.96) } to { transform: scale(1) } }

  * { -webkit-tap-highlight-color: transparent; }

  html, body {
    margin: 0; padding: 0;
    overscroll-behavior: none;
    -webkit-text-size-adjust: 100%;
    height: 100%;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
  }
`

function PageLoader({ primaryColor = '#7c6ff7', bg }) {
  return (
    <div style={{ minHeight: '100dvh', background: bg || '#f8f8ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `4px solid ${primaryColor}22`, borderTopColor: primaryColor, animation: 'spin 0.8s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `3px solid ${primaryColor}33`, borderBottomColor: primaryColor, animation: 'spin 1.2s linear infinite reverse' }} />
      </div>
      <p style={{ color: '#888', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Loading your experience…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i, left: Math.random() * 100,
    color: ['#7c6ff7','#f0a500','#22c55e','#ef4444','#3b82f6','#ec4899','#14b8a6'][i % 7],
    delay: Math.random() * 2.5, dur: 2.5 + Math.random() * 2, size: 6 + Math.random() * 8
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position: 'absolute', top: -20, left: `${p.left}%`, width: p.size, height: p.size, background: p.color, borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? 2 : '30%', animation: `cffall ${p.dur}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  )
}

function ScoreRing({ score, total, primaryColor }) {
  const pct = total > 0 ? (score / total) * 100 : 0
  const r = 52, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke={`${primaryColor}22`} strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={primaryColor} strokeWidth={10} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 6px ${primaryColor}88)` }} />
      </svg>
      <div style={{ marginTop: -100, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: primaryColor, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 14, color: '#999', marginTop: 2 }}>/ {total}</span>
      </div>
    </div>
  )
}

function SubmitModal({ primaryColor, ff, confirmGifUrl, onConfirm, gameCategory, continueButtonText }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', boxSizing: 'border-box',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      animation: 'backdropIn 0.3s ease'
    }}>
      <div style={{
        background: '#fff', borderRadius: 28,
        padding: 'clamp(28px,7vw,44px) clamp(20px,6vw,36px)',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        animation: 'modalIn 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: ff, boxSizing: 'border-box'
      }}>
        {confirmGifUrl ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img src={confirmGifUrl} alt="Quiz submitted!" style={{ maxWidth: '100%', maxHeight: 380, width: 'auto', height: 'auto', borderRadius: 16, objectFit: 'contain' }} />
          </div>
        ) : (
          <div style={{ fontSize: 68, marginBottom: 16, animation: 'bounce 0.6s ease both' }}>🎉</div>
        )}
        <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 800, color: '#1a1a2e', marginBottom: 10, lineHeight: 1.25 }}>{gameCategory === 'quiz' ? 'Quiz' : gameCategory === 'registration' ? 'Registration' : 'Survey'} Submitted!</h2>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Your responses have been recorded.<br />Redirecting you now…</p>
        <div style={{ height: 5, background: `${primaryColor}22`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}bb)`, borderRadius: 10, animation: 'redirectBar 3s linear forwards' }} />
        </div>
        <button onClick={onConfirm} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: ff, boxShadow: `0 8px 28px ${primaryColor}55`, touchAction: 'manipulation' }}>
          {continueButtonText || 'Continue Now →'}</button>
        <style>{`@keyframes redirectBar { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    </div>
  )
}

function validateField(value, fieldType, isRequired) {
  if (isRequired && !value.trim()) return 'This field is required'
  if (!value.trim()) return ''
  if (fieldType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
  if (fieldType === 'phone' && !/^[\d\s+\-()\u0900-\u097F]{7,20}$/.test(value)) return 'Enter a valid phone number'
  return ''
}

export default function PlayerPage() {
  const { gameName, companyName } = useParams()
  const [searchParams] = useSearchParams()
  const [phase, setPhase] = useState('loading')
  const [game, setGame] = useState(null)
  const [errorMsg, setErrorMsg] = useState('Game not found')
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [formTouched, setFormTouched] = useState({})
  const [sessionToken, setSessionToken] = useState(null)
  const [sessionId,    setSessionId]    = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [totalScoreable, setTotalScoreable] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [questionKey, setQuestionKey] = useState(0)
  const [playerProfile, setPlayerProfile] = useState(null)
  const [showContinueBtn, setShowContinueBtn] = useState(false)
  const continueTimerRef = useRef(null)

  // Timer per question
  const [timeLeft, setTimeLeft] = useState(null)
  const questionTimerRef = useRef(null)
  const autoAdvanceRef = useRef({ doAdvance: null, sessionToken: null })

  // Reset timer when question changes
  useEffect(() => {
    const t = game?.settings?.time_per_question
    if (t && t > 0 && phase === 'playing' && !answered) {
      setTimeLeft(t)
      clearInterval(questionTimerRef.current)
      questionTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (answered || phase !== 'playing') {
      clearInterval(questionTimerRef.current)
    }
    return () => clearInterval(questionTimerRef.current)
  }, [currentQ, phase, answered, game?.settings?.time_per_question])

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !answered && autoAdvanceRef.current.doAdvance) {
      const qs = game?.questions?.length || 0
      autoAdvanceRef.current.doAdvance(currentQ + 1 >= qs, autoAdvanceRef.current.sessionToken)
    }
  }, [timeLeft, answered, currentQ, game?.questions?.length])

  // Overlay state machine
  const [overlayState, setOverlayState] = useState('hidden')
  const [overlayData, setOverlayData] = useState(null)
  const [showNextBtn, setShowNextBtn] = useState(false)

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const activeSoundsRef = useRef([])
  const completingRef = useRef(false)
  const overlayTimerRef = useRef(null)
  const advanceRef = useRef(null)

  // ── Known field mapping from player profile ──────────────────────────────
  const KNOWN_FIELD_MAP = {
    name: ['name','full name','fullname','player name','your name','yourname'],
    email: ['email','email address','emailaddress','e-mail','e mail'],
    whatsapp: ['whatsapp','whatsapp number','phone','phone number','mobile','mobile number','contact','contact number'],
    city: ['city','town','city/town','location'],
    pincode: ['pincode','pin code','zip','zip code','postal code','postalcode'],
  }

  const getPlayerField = (profile, fieldLabel) => {
    const norm = fieldLabel.toLowerCase().replace(/\s+/g, '')
    for (const [key, aliases] of Object.entries(KNOWN_FIELD_MAP)) {
      if (aliases.some(a => a.replace(/\s+/g, '') === norm || a === fieldLabel.toLowerCase())) {
        return profile?.[key] || null
      }
    }
    return null
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken')
    const userData = localStorage.getItem('playerUser') || sessionStorage.getItem('playerUser')

    ;(async () => {
      let profile = null
      if (storedToken && userData) {
        try {
          const r = await fetch('/api/pauth/me', { headers: { Authorization: `Bearer ${storedToken}` } })
          const d = await r.json()
          profile = d.success ? d.player : null
        } catch {}
      }
      setPlayerProfile(profile)

      try {
        const res = await api.get(`/play/${gameName}/${companyName}`)
        let g = res.data.game
        setGame(g)
        if (g.settings?.font_family) loadFont(g.settings.font_family)

        const canSkipForm = () => {
          if (!profile) return false
          const fields = g.formFields || []
          if (fields.length === 0) return true
          return fields.every(f => {
            const val = getPlayerField(profile, f.field_label)
            if (f.is_required) return !!val
            return true
          })
        }

        const startSession = async (initData) => {
          const payload = {
            game_id: g.id,
            player_data: initData,
            source_type: searchParams.get('source') === 'direct' ? 'direct' : (profile ? 'player' : 'link'),
          }
          if (profile) payload.promo_player_id = profile.id
          const sessRes = await api.post('/play/session/start', payload)
          setSessionToken(sessRes.data.session_token)
        }

        if (g.category === 'crossword') {
          const init = {}
          for (const ff of (g.formFields || [])) init[ff.field_label] = getPlayerField(profile, ff.field_label) || ''
          setFormData(init)
          if (canSkipForm()) {
            try {
              await startSession(init)
            } catch (sessErr) {
              const data = sessErr.response?.data
              if (data?.already_played) { setPhase('already_played'); return }
              console.error('Session start error:', sessErr)
            }
            setPhase('crossword')
          } else {
            setPhase('form')
          }
          return
        }

        if (g.category === 'spin') {
          const hasForm = g.formFields && g.formFields.length > 0
          if (!hasForm || canSkipForm()) {
            setPhase('spin')
            return
          }
          const init = {}
          for (const ff of (g.formFields || [])) init[ff.field_label] = getPlayerField(profile, ff.field_label) || ''
          setFormData(init)
          setPhase('form')
          return
        }

        // Shuffle questions if randomize_questions is enabled
        if (g.settings?.randomize_questions && g.questions?.length) {
          const arr = [...g.questions]
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          g.questions = arr
        }
        const init = {}
        for (const f of (g.formFields || [])) init[f.field_label] = getPlayerField(profile, f.field_label) || ''
        setFormData(init)
        if (canSkipForm()) {
          try {
            await startSession(init)
          } catch (sessErr) {
            const data = sessErr.response?.data
            if (data?.already_played) { setPhase('already_played'); return }
            console.error('Session start error:', sessErr)
          }
          setPhase('playing')
        } else {
          setPhase('form')
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Game not found')
        setPhase('error')
      }
    })()
  }, [gameName, companyName])

  const resolveSound = useCallback((idOrUrl, soundMap) => {
    if (!idOrUrl) return null
    if (typeof idOrUrl === 'number' || (typeof idOrUrl === 'string' && /^\d+$/.test(idOrUrl))) {
      return soundMap?.[parseInt(idOrUrl)] || null
    }
    return idOrUrl || null
  }, [])

  const stopAllSounds = useCallback(() => {
    for (const a of activeSoundsRef.current) {
      try { a.pause(); a.currentTime = 0 } catch {}
    }
    activeSoundsRef.current = []
  }, [])

  const playSound = useCallback((url) => {
    if (!url) return null
    stopAllSounds()
    try {
      const audio = new Audio(url)
      audio.play().catch(() => {})
      activeSoundsRef.current.push(audio)
      return audio
    } catch { return null }
  }, [])

  const handleFieldChange = (label, value, fieldType, isRequired) => {
    setFormData(prev => ({ ...prev, [label]: value }))
    if (formTouched[label]) {
      setFormErrors(prev => ({ ...prev, [label]: validateField(value, fieldType, isRequired) }))
    }
  }

  const handleFieldBlur = (label, value, fieldType, isRequired) => {
    setFormTouched(prev => ({ ...prev, [label]: true }))
    setFormErrors(prev => ({ ...prev, [label]: validateField(value, fieldType, isRequired) }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const errors = {}; let hasErrors = false
    for (const f of (game.formFields || [])) {
      const err = validateField(formData[f.field_label] || '', f.field_type, f.is_required)
      errors[f.field_label] = err
      if (err) hasErrors = true
    }
    setFormErrors(errors)
    setFormTouched(Object.fromEntries((game.formFields || []).map(f => [f.field_label, true])))
    if (hasErrors) return
    setSubmitting(true)
    try {
      const payload = {
        game_id: game.id,
        player_data: formData,
        source_type: searchParams.get('source') === 'direct' ? 'direct' : (playerProfile ? 'player' : 'link'),
      }
      if (playerProfile) payload.promo_player_id = playerProfile.id
      const res = await api.post('/play/session/start', payload)
      setSessionToken(res.data.session_token)
      if (game.category === 'crossword') {
        setPhase('crossword')
      } else {
        setPhase('playing')
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.already_played) { setPhase('already_played') }
      else { alert(data?.message || 'Error starting. Please try again.') }
    }
    setSubmitting(false)
  }

  const completeSession = useCallback(async (token) => {
    if (completingRef.current) return
    completingRef.current = true
    setCompleting(true)
    try {
      const res = await api.post('/play/session/complete', { session_token: token })
      setRedirectUrl(res.data.redirect_url)
      const sess = res.data.session
      if (sess) {
        setScore(sess.score || 0)
        setTotalScoreable(sess.total_scoreable || 0)
        const soundMap = game?.soundMap || {}
        const settingsObj = game?.settings || {}
        const finalScore = sess.score || 0
        const finalTotal = sess.total_scoreable || 0
        if (finalTotal > 0) {
          const isWin = finalScore / finalTotal >= 0.5
          const soundId = isWin ? settingsObj.win_sound_id : settingsObj.lose_sound_id
          if (soundId) {
            const url = soundMap[parseInt(soundId)]
            if (url) {
              stopAllSounds()
              try { const a = new Audio(url); a.play().catch(() => {}); activeSoundsRef.current.push(a) } catch {}
            }
          }
        } else if (settingsObj.win_sound_id) {
          const url = soundMap[parseInt(settingsObj.win_sound_id)]
          if (url) {
            stopAllSounds()
            try { const a = new Audio(url); a.play().catch(() => {}); activeSoundsRef.current.push(a) } catch {}
          }
        }
      }
      setPhase('thankyou')
    } catch { setPhase('thankyou') }
    setCompleting(false)
  }, [game, stopAllSounds])

  const doAdvance = useCallback((isLast, token) => {
    if (isLast) { completeSession(token) }
    else {
      setCurrentQ(q => q + 1)
      setSelectedOpt(null)
      setAnswered(false)
      setQuestionKey(k => k + 1)
    }
  }, [completeSession])

  useEffect(() => { advanceRef.current = doAdvance }, [doAdvance])
  useEffect(() => { autoAdvanceRef.current.doAdvance = doAdvance }, [doAdvance])
  useEffect(() => { autoAdvanceRef.current.sessionToken = sessionToken }, [sessionToken])
  const handleContinueClick = useCallback(() => {
  if (continueTimerRef.current) clearTimeout(continueTimerRef.current)
  setShowContinueBtn(false)
  
  const isLastQ = currentQ + 1 >= game.questions.length
  const token = sessionToken
  doAdvance(isLastQ, token)
}, [currentQ, game, sessionToken, doAdvance])

  const startOverlayFlyOut = useCallback(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    setShowNextBtn(false)
    setOverlayState('flyingOut')
    overlayTimerRef.current = setTimeout(() => {
      setOverlayState('hidden')
      setOverlayData(null)
      const d = overlayData
      if (d) advanceRef.current?.(d.isLast, d.token)
    }, 520)
  }, [overlayData])

  const flyOutRef = useRef(null)
  useEffect(() => { flyOutRef.current = startOverlayFlyOut }, [startOverlayFlyOut])

  const handleOptionSelect = async (opt, token) => {
  if (answered) return
  setSelectedOpt(opt)
  setAnswered(true)

  const question = game.questions[currentQ]
  const isCorrect = question.question_type === 'right_wrong' ? !!opt.is_correct : null
  const isLastQ = currentQ + 1 >= game.questions.length
  const soundMap = game.soundMap || {}
  const settingsObj = game.settings || {}

  if (question.question_type === 'right_wrong') {
    if (isCorrect) {
      playSound(resolveSound(settingsObj.sound_correct_id, soundMap))
      setScore(s => s + 1)
    } else {
      playSound(resolveSound(settingsObj.sound_wrong_id, soundMap))
    }
  } else {
    playSound(resolveSound(question.sound_neutral_id, soundMap))
  }

  try {
    await api.post('/play/session/answer', {
      session_token: token, question_id: question.id,
      option_id: opt.id, is_correct: isCorrect, question_type: question.question_type
    })
  } catch {}

  // ── Overlay or advance ──
  if (opt.option_overlay_image_url) {
    const animIn = question.overlay_animation_in || 'flyFromBottom'
    const animOut = question.overlay_animation_out || 'flyToTop'
    const idleTime = (question.overlay_idle_time ?? 3) * 1000

    setOverlayState('preparing')
    overlayTimerRef.current = setTimeout(() => {
      setOverlayData({ src: opt.option_overlay_image_url, animIn, animOut, idleTime, isLast: isLastQ, token })
      setOverlayState('flyingIn')
      setShowNextBtn(false)

      overlayTimerRef.current = setTimeout(() => {
        setOverlayState('visible')
        if (idleTime > 0) {
          overlayTimerRef.current = setTimeout(() => {
            setShowNextBtn(true)
          }, idleTime)
        } else {
          setShowNextBtn(true)
        }
      }, 620)
    }, 1200)
  } else {
    // ── NEW: Check if registration game and show Continue button ──
    const isRegistrationGame = game.category === 'registration'
    const idleTime = (question.overlay_idle_time ?? 3) * 1000
    
    if (isRegistrationGame) {
      // Show Continue button after idle time
      if (continueTimerRef.current) clearTimeout(continueTimerRef.current)
      setShowContinueBtn(false)
      
      continueTimerRef.current = setTimeout(() => {
        setShowContinueBtn(true)
      }, idleTime)
    } else {
      // Non-registration games: advance immediately as before
      setTimeout(() => doAdvance(isLastQ, token), 1200)
    }
  }
}

  const s = game?.settings || {}
  const primaryColor = s.primary_color || '#7c6ff7'
  const fontFamily = s.font_family || 'DM Sans'
  const gameLogo = s.game_logo_url || game?.client_logo
  const ff = `'${fontFamily}', sans-serif`

  const getPageBg = (qBgImg, gameBgImg, solidColor) => {
    if (qBgImg) return { backgroundImage: `url(${qBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }
    if (gameBgImg) return { backgroundImage: `url(${gameBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }
    return { background: solidColor || '#f4f4ff' }
  }

  // ── CHANGE: getOptionStyle now accepts selectedOpt as param for wrong-answer correct reveal ──
  const getOptionStyle = (opt, question, currentSelectedOpt) => {
    if (!answered) return { bg: opt.option_color || '#1a1a2e', text: opt.option_text_color || '#ffffff', border: '2px solid transparent', shadow: '0 2px 8px rgba(0,0,0,0.1)', opacity: 1, scale: 'scale(1)' }

    const isRightWrong = question.question_type === 'right_wrong'
    const isSelected = currentSelectedOpt?.id === opt.id

    if (isRightWrong) {
      if (opt.is_correct) {
        // Always show correct option green — even when wrong answer selected
        return { bg: '#22c55e', text: '#fff', border: '2px solid #16a34a', shadow: '0 4px 20px rgba(34,197,94,0.45)', opacity: 1, scale: 'scale(1)' }
      } else if (isSelected) {
        // The wrong option the user picked — show red
        return { bg: '#ef4444', text: '#fff', border: '2px solid #dc2626', shadow: '0 4px 20px rgba(239,68,68,0.45)', opacity: 1, scale: 'scale(0.97)' }
      } else {
        // Other wrong options — dimmed red
        return { bg: '#ef4444', text: '#fff', border: '2px solid #dc2626', shadow: 'none', opacity: 0.45, scale: 'scale(0.97)' }
      }
    } else {
      if (isSelected) {
        return { bg: primaryColor, text: '#fff', border: `2px solid ${primaryColor}`, shadow: `0 4px 16px ${primaryColor}55`, opacity: 1, scale: 'scale(0.97)' }
      }
      return { bg: opt.option_color || '#1a1a2e', text: opt.option_text_color || '#ffffff', border: '2px solid transparent', shadow: '0 2px 8px rgba(0,0,0,0.1)', opacity: 0.5, scale: 'scale(1)' }
    }
  }

  useEffect(() => () => { 
  if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
  if (continueTimerRef.current) clearTimeout(continueTimerRef.current)
}, [])

  if (phase === 'loading') return <PageLoader primaryColor={primaryColor} />

  if (phase === 'already_played') {
    const bgStyle = getPageBg(null, s.bg_image_url, s.bg_color)
    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: ff }}>
        <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 'clamp(32px,8vw,48px) clamp(24px,6vw,40px)', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.7)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontSize: 'clamp(20px,5vw,24px)', fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>Already Played!</h2>
          <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>Our records show you have already completed this game.<br />Each participant can only play <strong>once</strong>.</p>
          <div style={{ background: primaryColor + '15', border: `1px solid ${primaryColor}40`, borderRadius: 12, padding: '16px 20px', color: primaryColor, fontWeight: 600, fontSize: 14 }}>Thank you for your participation! 🎉</div>
        </div>
        <style>{OVERLAY_STYLES}</style>
      </div>
    )
  }

  if (phase === 'error') return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 32, fontFamily: ff }}>
      <div style={{ fontSize: 56 }}>{errorMsg.toLowerCase().includes('inactive') ? '⏸️' : '😕'}</div>
      <h2 style={{ color: '#1a1a2e', fontSize: 24 }}>{errorMsg}</h2>
      <p style={{ color: '#888', fontSize: 15 }}>{errorMsg.toLowerCase().includes('inactive') ? 'This game has been paused.' : 'This link may be invalid.'}</p>
      <style>{OVERLAY_STYLES}</style>
    </div>
  )

  /* ── FORM ── */
  if (phase === 'form') {
    const bgStyle = getPageBg(null, s.bg_image_url, s.bg_color || '#f4f4ff')
    const hasBgImg = !!s.bg_image_url
    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,4vw,24px) 16px', fontFamily: ff }}>
        <div style={{
          width: '100%', maxWidth: 440,
          padding: 'clamp(24px,6vw,36px) clamp(18px,5vw,28px)',
          borderRadius: 28,
          background: hasBgImg ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.93)',
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          boxShadow: hasBgImg ? '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)' : '0 8px 40px rgba(0,0,0,0.12)',
          border: hasBgImg ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.85)',
        }}>
          {gameLogo && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <img src={gameLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: 300, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
            </div>
          )}
          <h1 style={{ color: s.heading_1_color||'#1a1a2e', fontFamily: ff, fontSize: 'clamp(22px,6vw,30px)', textAlign: 'center', marginBottom: 2, lineHeight: 1, textShadow: hasBgImg ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', fontWeight: 800 }}>{s.heading_1 || 'Untitled'}</h1>
          {s.heading_2 && <div style={{ fontSize: 15, fontWeight: 600, textAlign: 'center', marginBottom: 6, color: s.heading_2_color||'#1a1a2e', lineHeight: 1.3, fontFamily: ff }}>{s.heading_2}</div>}
          {game.description && <p style={{ color: hasBgImg ? 'rgba(255,255,255,0.85)' : '#666', textAlign: 'center', marginBottom: 20, fontSize: 12, lineHeight: 1.6, fontFamily: ff }}>{game.description}</p>}
          {s.intro_text && (
            <div style={{ background: hasBgImg ? 'rgba(255,255,255,0.15)' : `${primaryColor}12`, border: `1.5px solid ${hasBgImg ? 'rgba(255,255,255,0.3)' : primaryColor + '30'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: s.intro_text_color||'#444', fontSize: 13, textAlign: 'center', lineHeight: 1.6, fontFamily: ff }}>
              {s.intro_text}
            </div>
          )}
          <form onSubmit={handleFormSubmit} noValidate>
            {(game.formFields || []).map((f, i) => {
              const val = formData[f.field_label] || ''
              const err = formErrors[f.field_label] || ''
              const touched = formTouched[f.field_label]
              const hasErr = touched && !!err
              const fieldId = `field-${i}-${f.field_label.toLowerCase().replace(/\s+/g, '-')}`
              const fromProfile = playerProfile && !!getPlayerField(playerProfile, f.field_label)
              const inputStyle = {
                background: hasErr ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.88)',
                border: `1.5px solid ${hasErr ? '#ef4444' : (hasBgImg ? 'rgba(255,255,255,0.45)' : '#e0e0f0')}`,
                borderRadius: 10, color: '#1a1a2e', padding: '11px 14px', fontSize: 15,
                width: '100%', outline: 'none', fontFamily: ff,
                transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
              }
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <label htmlFor={fieldId} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: hasBgImg ? 'rgba(255,255,255,0.9)' : '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {f.field_label} {f.is_required ? <span style={{ color: '#ef4444' }}>*</span> : ''}
                    {fromProfile && <span style={{ marginLeft: 6, fontSize: 10, color: '#22c55e', fontWeight: 600 }}>✓ from profile</span>}
                  </label>
                  {f.field_type === 'textarea' ? (
                    <textarea id={fieldId} name={fieldId} rows={3} value={val}
                      onChange={e => handleFieldChange(f.field_label, e.target.value, f.field_type, f.is_required)}
                      onBlur={e => handleFieldBlur(f.field_label, e.target.value, f.field_type, f.is_required)}
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  ) : (
                    <input id={fieldId} name={fieldId}
                      type={f.field_type === 'phone' ? 'tel' : f.field_type === 'email' ? 'email' : f.field_type === 'number' ? 'number' : 'text'}
                      value={val}
                      disabled={fromProfile}
                      onChange={e => handleFieldChange(f.field_label, e.target.value, f.field_type, f.is_required)}
                      onBlur={e => handleFieldBlur(f.field_label, e.target.value, f.field_type, f.is_required)}
                      style={{ ...inputStyle, opacity: fromProfile ? 0.7 : 1 }} />
                  )}
                  <div style={{ height: 20, marginTop: 3 }}>
                    {hasErr && <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠ {err}</span>}
                  </div>
                </div>
              )
            })}

            {!!s.terms_enabled && (s.terms_text || s.terms_url) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, marginTop: 4 }}>
                <div onClick={() => setTermsAgreed(!termsAgreed)} style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, border: `2px solid ${termsAgreed ? primaryColor : '#ccc'}`, borderRadius: 5, background: termsAgreed ? primaryColor : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {termsAgreed && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: hasBgImg ? 'rgba(255,255,255,0.85)' : '#555', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  {s.terms_url ? <a href={s.terms_url} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, fontWeight: 600, textDecoration: 'underline' }}>{s.terms_text || 'Terms & Conditions'}</a> : <span style={{ color: primaryColor, fontWeight: 600 }}>{s.terms_text || 'Terms & Conditions'}</span>}
                </span>
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: '100%', background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 8, opacity: submitting ? 0.6 : 1, fontFamily: ff, boxShadow: `0 6px 20px ${primaryColor}44`, transition: 'all 0.2s', touchAction: 'manipulation' }}>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Starting…
                </span>
                ) : s.start_button_text || `Start ${game.category === 'quiz' ? 'Quiz' : game.category === 'registration' ? 'Registration' : 'Survey'} →`}
            </button>
          </form>
        </div>
        <style>{OVERLAY_STYLES}</style>
      </div>
    )
  }

  /* ── PLAYING ── */
  if (phase === 'playing') {
    const question = game.questions[currentQ]
    const progress = (currentQ / game.questions.length) * 100
    const qBg = question.question_bg_image_url
    const gameBg = s.bg_image_url
    const bgStyle = getPageBg(qBg, gameBg, s.bg_color || '#f4f4ff')
    const hasBgImage = !!(qBg || gameBg)
    const isOverlayActive = overlayState !== 'hidden'

    const qImgAnimKey = question.question_image_animation || 'float'

    const getOverlayImgStyle = () => {
      if (!overlayData) return {}
      if (overlayState === 'flyingIn') return { animation: `${overlayData.animIn} 0.6s cubic-bezier(0.34,1.3,0.64,1) forwards` }
      if (overlayState === 'visible') return { transform: 'translateY(0) translateX(0) scale(1)', opacity: 1 }
      if (overlayState === 'flyingOut') return { animation: `${overlayData.animOut} 0.5s cubic-bezier(0.55,0,0.85,0.36) forwards` }
      return { opacity: 0 }
    }

    return (
      /*
        OUTER SHELL — locks to full device screen height on every phone/tablet/desktop.
        Nothing can push outside this box.
      */
      <div style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        ...bgStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: ff,
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        boxSizing: 'border-box',
      }}>

        {/* ── OVERLAY — covers entire screen, image shown fully without cropping ── */}
        {isOverlayActive && overlayData && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}>
            {/*
              Image: width+height both 100% of viewport, object-fit:contain
              ensures full image is always visible regardless of its aspect ratio or screen size
            */}
            <img
              src={overlayData.src}
              alt=""
              style={{
                width: '100vw',
                height: '100dvh',
                objectFit: 'contain',
                display: 'block',
                ...getOverlayImgStyle()
              }}
            />
            {showNextBtn && (
              <button
                onClick={() => flyOutRef.current?.()}
                style={{
                  position: 'absolute',
                  bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
                  zIndex: 1001,
                  background: s.next_button_bg_color || `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                  color: s.next_button_text_color || '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '16px 44px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: ff,
                  boxShadow: s.next_button_bg_color ? '0 12px 40px rgba(0,0,0,0.2)' : `0 12px 40px ${primaryColor}88`,
                  animation: 'nextBtnIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  letterSpacing: '0.02em',
                  minWidth: 160,
                  minHeight: 54,
                  touchAction: 'manipulation',
                }}>
                {s.next_button_text || 'Next →'}
              </button>
            )}
          </div>
        )}

        {/*
          CONTENT COLUMN — fills all available height between safe-area paddings.
          maxWidth caps it on tablets/desktops while phones use full width.
        */}
        <div style={{
          width: '100%',
          maxWidth: 520,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '0 14px',
        }}>

          {/* ── Progress bar — fixed height, never shrinks ── */}
          {s.show_progress !== 0 && (
            <div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: hasBgImage ? 'rgba(255,255,255,0.9)' : '#888', fontWeight: 600 }}>
                <span>Question {currentQ + 1} of {game.questions.length}</span>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  {timeLeft !== null && !answered && (
                    <span style={{ color: timeLeft <= 5 ? '#ef4444' : (hasBgImage ? 'rgba(255,255,255,0.9)' : '#888'), fontWeight:700 }}>
                      ⏱ {timeLeft}s
                    </span>
                  )}
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
              <div style={{ height: 5, background: hasBgImage ? 'rgba(255,255,255,0.25)' : '#e8e8f5', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}bb)`, borderRadius: 10, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}

          {/*
            CARD — flex:1 + minHeight:0 makes it fill exactly the remaining vertical space.
            display:flex + flexDirection:column lets its children share that space.
            NO fixed heights, NO overflow:auto on the card itself — the card IS the screen.
          */}
          <div
            key={questionKey}
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              background: hasBgImage ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 22,
              border: hasBgImage ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: hasBgImage ? '0 8px 40px rgba(0,0,0,0.28)' : '0 8px 40px rgba(0,0,0,0.12)',
              animation: 'questionEnter 0.4s cubic-bezier(0.34,1.3,0.64,1)',
              marginBottom: 12,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}>

            {/*
              IMAGE SECTION — flex:1 with minHeight:0 so it takes up free space above the options.
              The image itself uses maxHeight:100% + objectFit:contain so it's always fully visible
              no matter its aspect ratio or the phone's screen height.
            */}
            {question.question_image_url && (() => {
              const idleAnimDef = qImgAnimKey !== 'none'
                ? (() => {
                    const map = {
                      float:     'qImgFloat 3s ease-in-out infinite',
                      breathe:   'qImgBreathe 2.8s ease-in-out infinite',
                      pulse:     'qImgPulse 2.4s ease-in-out infinite',
                      shimmer:   'qImgShimmer 3s ease-in-out infinite',
                      kenburns:  'qImgKenBurns 8s ease-in-out infinite alternate',
                      bounce:    'qImgBounce 1.8s ease-in-out infinite',
                      sway:      'qImgSway 2.5s ease-in-out infinite',
                      wobble:    'qImgWobble 2.2s ease-in-out infinite',
                      swing:     'qImgSwing 2.4s ease-in-out infinite',
                      tada:      'qImgTada 2.6s ease-in-out infinite',
                      heartBeat: 'qImgHeartBeat 1.6s ease-in-out infinite',
                      rotate:    'qImgRotate 6s linear infinite',
                      flash:     'qImgFlash 1.8s ease-in-out infinite',
                      rubberBand:'qImgRubberBand 2s ease-in-out infinite',
                      slideUpDown:'qImgSlideUpDown 3s ease-in-out infinite',
                      zoomInOut: 'qImgZoomInOut 2.4s ease-in-out infinite',
                      fadeInOut: 'qImgFadeInOut 2.6s ease-in-out infinite',
                      wave:      'qImgWave 2.8s ease-in-out infinite',
                      orbit:     'qImgOrbit 4s ease-in-out infinite',
                      glitch:    'qImgGlitch 1.5s ease-in-out infinite',
                      blurBlink: 'qImgBlurBlink 2.2s ease-in-out infinite',
                      skew:      'qImgSkew 2.5s ease-in-out infinite',
                      roll:      'qImgRoll 3s ease-in-out infinite',
                      bounceIn:  'qImgBounceIn 2.2s ease-in-out infinite',
                      jello:     'qImgJello 2.4s ease-in-out infinite',
                    }
                    return map[qImgAnimKey] || map.float
                  })()
                : null
              const combinedAnim = idleAnimDef
                ? `qImgEntrance 0.5s 0.05s both cubic-bezier(0.34,1.3,0.64,1), ${idleAnimDef}`
                : `qImgEntrance 0.5s 0.05s both cubic-bezier(0.34,1.3,0.64,1)`
              return (
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 14px 0',
                  background: hasBgImage ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}>
                  <img
                    src={question.question_image_url}
                    alt=""
                    style={{
                      /*
                        width:100% fills horizontally, height:100% fills vertically (within the flex container),
                        object-fit:contain ensures the full image is always visible — no cropping ever.
                        This works on any screen size automatically.
                      */
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: 10,
                      animation: combinedAnim,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              )
            })()}

            {/*
              BOTTOM SECTION — question text + options. flexShrink:0 so it never gets squished.
              Options use flex:1 with justifyContent:space-evenly to spread across available height.
            */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px 14px',
              gap: 10,
              boxSizing: 'border-box',
            }}>

              {/* CHANGE: game logo in questions page — kept hidden, uncomment to show */}
              {/*
              {gameLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <img src={gameLogo} alt="Logo" style={{ maxWidth: 120, maxHeight: 44, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 8 }} />
                </div>
              )}
              */}

              {/* Question text */}
              <h2 style={{
                color: hasBgImage ? '#fff' : (question.question_color || '#1a1a2e'),
                fontSize: 'clamp(13px,3.8vw,18px)',
                lineHeight: 1.4,
                textAlign: 'center',
                fontFamily: ff,
                margin: 0,
                textShadow: hasBgImage ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                fontWeight: 700,
                animation: 'questionEnter 0.45s 0.1s both ease',
              }}>
                {question.question_text}
              </h2>

              {/* Options — evenly distributed, flex:1 on each so they fill remaining space */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {(question.options || []).map((opt, optIdx) => {
                  const os = getOptionStyle(opt, question, selectedOpt)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt, sessionToken)}
                      disabled={answered}
                      style={{
                        background: os.bg,
                        border: os.border,
                        borderRadius: 14,
                        /*
                          flex:1 makes every option take equal vertical space,
                          so 4 options on a tall phone look the same as on a short one.
                        */
                        flex: 1,
                        minHeight: 48,
                        color: os.text,
                        fontSize: 'clamp(13px,3.5vw,15px)',
                        fontWeight: 600,
                        cursor: answered ? 'default' : 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        fontFamily: ff,
                        transition: 'all 0.25s ease',
                        boxShadow: os.shadow,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        transform: os.scale,
                        width: '100%',
                        opacity: os.opacity,
                        touchAction: 'manipulation',
                        animation: `questionEnter 0.4s ${0.15 + optIdx * 0.06}s both ease`,
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        padding: '0 14px',
                        boxSizing: 'border-box',
                      }}>
                      {opt.option_image_url && <img src={opt.option_image_url} alt="" style={{ width: 'auto', height: 32, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />}
                      <span style={{ flex: 1, textAlign: 'center' }}>{opt.option_text}</span>
                    </button>
                  )
                })}
              </div>

              {/* ── NEW: Continue button for registration games (no overlay) ── */}
              {showContinueBtn && (
                <button
                  onClick={handleContinueClick}
                  style={{
                    marginTop: 12,
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 50,
                    padding: '16px 44px',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: ff,
                    boxShadow: `0 12px 40px ${primaryColor}88`,
                    animation: 'nextBtnIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    letterSpacing: '0.02em',
                    minWidth: 160,
                    minHeight: 54,
                    touchAction: 'manipulation',
                    width: '100%',
                    maxWidth: 160,
                    alignSelf: 'center',
                  }}>
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
        

        {completing && (
          <div style={{ marginBottom: 12, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '10px 18px', fontSize: 13, color: '#555' }}>
            <span style={{ width: 16, height: 16, border: `2px solid ${primaryColor}44`, borderTopColor: primaryColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            Saving results…
          </div>
        )}

        <style>{OVERLAY_STYLES}</style>
      </div>
    )
  }

  /* ── THANK YOU ── */
  if (phase === 'thankyou') {
    const tyBg = s.thankyou_bg_image_url
    const gameBg = s.bg_image_url
    const bgStyle = getPageBg(tyBg, gameBg, s.bg_color || '#f4f4ff')
    const hasScore = totalScoreable > 0
    const hasBgImage = !!(tyBg || gameBg)
    const confirmGifUrl = s.submit_confirm_gif_url || null

const handleSubmitExplore = () => {
  setShowSubmitModal(true)
  // Removed auto-redirect - now only redirects on button click
}

const handleModalConfirm = () => {
  setShowSubmitModal(false)
  if (redirectUrl) {
    window.location.href = redirectUrl
  } else if (playerProfile) {
    window.location.href = '/player/dashboard'
  } else {
    window.location.href = `/play/${gameName}/${companyName}`
  }
}

    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', fontFamily: ff, padding: '20px 16px', boxSizing: 'border-box' }}>
        <Confetti />

        {showSubmitModal && (
          <SubmitModal primaryColor={primaryColor} ff={ff} confirmGifUrl={confirmGifUrl} onConfirm={handleModalConfirm} gameCategory={game.category} continueButtonText={s.continue_button_text} />
        )}

        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 400, margin: '0 auto',
          background: hasBgImage ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: hasBgImage ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 28, padding: 'clamp(28px,7vw,40px) clamp(20px,6vw,32px)',
          boxShadow: hasBgImage ? '0 16px 60px rgba(0,0,0,0.28)' : '0 16px 60px rgba(0,0,0,0.12)',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          boxSizing: 'border-box'
        }}>
          {gameLogo && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <img src={gameLogo} alt="Logo" style={{ maxWidth: '80%', maxHeight: 280, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 10 }} />
            </div>
          )}
          <div style={{ fontSize: 60, marginBottom: 12, animation: 'bounce 0.6s 0.3s ease both' }}>🎉</div>
          <h1 style={{ fontFamily: ff, fontSize: 'clamp(20px,6vw,30px)', color: s.outro_text_color||'#1a1a2e', marginBottom: 20, lineHeight: 1.25, textShadow: hasBgImage ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', fontWeight: 800 }}>
            {s.outro_text || 'Yay! You completed the game!'}
          </h1>
          {hasScore && (
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <ScoreRing score={score} total={totalScoreable} primaryColor={primaryColor} />
            </div>
          )}
          {!hasScore && (
            <div style={{ background: hasBgImage ? 'rgba(255,255,255,0.15)' : `${primaryColor}12`, border: `1.5px solid ${hasBgImage ? 'rgba(255,255,255,0.3)' : primaryColor + '30'}`, borderRadius: 14, padding: '14px 20px', marginBottom: 24, color: s.thankyou_subtitle_color||'#444', fontSize: 14 }}>
              {s.thankyou_subtitle || '✅ Thank you for completing!'}
            </div>
          )}

          <button
            onClick={handleSubmitExplore}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%',
              background: s.submit_button_bg_color || `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
              color: s.submit_button_text_color||'#fff', border: 'none',
              padding: '14px 20px', borderRadius: 14,
              fontSize: 17, fontWeight: 700,
              cursor: 'pointer', fontFamily: ff,
              boxShadow: s.submit_button_bg_color ? '0 6px 24px rgba(0,0,0,0.15)' : `0 6px 24px ${primaryColor}55`,
              touchAction: 'manipulation',
              letterSpacing: '0.02em',
              minHeight: 52,
            }}>
            <span>🚀</span>
            <span>{s.submit_button_text || 'Submit & Explore'}</span>
          </button>
        </div>
        <style>{OVERLAY_STYLES}</style>
      </div>
    )
  }

  if (phase === 'spin') {
    return (
      <SpinPlayerPage
        gameData={game}
        sessionToken={sessionToken}
        sessionId={sessionId}
        onSessionStart={(token, id) => { setSessionToken(token); setSessionId(id) }}
        onComplete={(data) => {
          if (data?.session) {
            setScore(data.session.score || 0)
          }
          setRedirectUrl(data?.redirect_url || null)
          setPhase('thankyou')
        }}
      />
    )
  }

  if (phase === 'crossword') {
    return (
      <CrosswordPlayerPage
        gameData={game}
        sessionToken={sessionToken}
        sessionId={null}
        onComplete={(data) => {
          if (data?.session) {
            setScore(data.session.score || 0)
            setTotalScoreable(data.session.total_scoreable || 0)
          }
          setRedirectUrl(data?.redirect_url || null)
          setPhase('thankyou')
        }}
      />
    )
  }

  return null
}