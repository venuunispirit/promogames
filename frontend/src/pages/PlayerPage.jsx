import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'

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

/* ── All animation CSS ── */
const OVERLAY_STYLES = `
  @keyframes flyFromBottom  { from { transform: translateY(110vh) scale(0.9); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
  @keyframes flyFromTop     { from { transform: translateY(-110vh) scale(0.9); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
  @keyframes flyFromLeft    { from { transform: translateX(-110vw) scale(0.9); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
  @keyframes flyFromRight   { from { transform: translateX(110vw) scale(0.9); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
  @keyframes zoomIn         { from { transform: scale(0.1); opacity:0 } to { transform: scale(1); opacity:1 } }
  @keyframes fadeIn         { from { opacity:0 } to { opacity:1 } }

  @keyframes flyToTop       { from { transform: translateY(0) scale(1); opacity:1 } to { transform: translateY(-110vh) scale(0.9); opacity:0 } }
  @keyframes flyToBottom    { from { transform: translateY(0) scale(1); opacity:1 } to { transform: translateY(110vh) scale(0.9); opacity:0 } }
  @keyframes flyToLeft      { from { transform: translateX(0) scale(1); opacity:1 } to { transform: translateX(-110vw) scale(0.9); opacity:0 } }
  @keyframes flyToRight     { from { transform: translateX(0) scale(1); opacity:1 } to { transform: translateX(110vw) scale(0.9); opacity:0 } }
  @keyframes zoomOut        { from { transform: scale(1); opacity:1 } to { transform: scale(0.1); opacity:0 } }
  @keyframes fadeOut        { from { opacity:1 } to { opacity:0 } }

  @keyframes spin           { to { transform: rotate(360deg) } }
  @keyframes slideUp        { from { opacity:0; transform: translateY(28px) } to { opacity:1; transform: translateY(0) } }
  @keyframes questionEnter  { from { opacity:0; transform: translateY(18px) scale(0.98) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes scaleIn        { from { opacity:0; transform: scale(0.85) } to { opacity:1; transform: scale(1) } }
  @keyframes bounce         { 0%,100% { transform:scale(1) } 50% { transform:scale(1.2) } }
  @keyframes cffall         { to { transform: translateY(110vh) rotate(720deg); opacity:0 } }
  @keyframes nextBtnIn      { from { opacity:0; transform: translateY(16px) scale(0.9) } to { opacity:1; transform: translateY(0) scale(1) } }
  @keyframes pulse          { 0%,100% { box-shadow: 0 0 0 0 currentColor } 50% { box-shadow: 0 0 0 8px transparent } }

  /* Question image idle animations */
  @keyframes qImgFloat      { 0%,100% { transform: translateY(0px) scale(1) } 50% { transform: translateY(-10px) scale(1.02) } }
  @keyframes qImgBreathe    { 0%,100% { transform: scale(1); opacity:1 } 50% { transform: scale(1.04); opacity:0.9 } }
  @keyframes qImgPulse      { 0%,100% { transform: scale(1); filter: brightness(1) } 50% { transform: scale(1.05); filter: brightness(1.08) } }
  @keyframes qImgShimmer    { 0%,100% { transform: rotate(-1deg) scale(1) } 50% { transform: rotate(1deg) scale(1.03) } }
  @keyframes qImgKenBurns   { 0% { transform: scale(1) translate(0,0) } 100% { transform: scale(1.08) translate(-2%,-2%) } }
  @keyframes qImgEntrance   { from { opacity:0; transform: scale(0.88) translateY(16px) } to { opacity:1; transform: scale(1) translateY(0) } }

  /* Modal */
  @keyframes modalIn        { from { opacity:0; transform: scale(0.82) translateY(32px) } to { opacity:1; transform: scale(1) translateY(0) } }
  @keyframes backdropIn     { from { opacity:0 } to { opacity:1 } }
`

/* Question image idle animation keys (used in builder dropdown + PlayerPage) */
const Q_IMG_ANIM_KEYS = ['float', 'breathe', 'pulse', 'shimmer', 'kenburns', 'none']

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

/* ── Submission Confirmation Modal ── */
function SubmitModal({ primaryColor, ff, confirmGifUrl, onConfirm }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', boxSizing: 'border-box',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      animation: 'backdropIn 0.3s ease'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 28,
        padding: 'clamp(28px,7vw,44px) clamp(20px,6vw,36px)',
        maxWidth: 400, width: '100%',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        animation: 'modalIn 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: ff,
        boxSizing: 'border-box'
      }}>
        {/* Confirmation GIF or fallback emoji */}
        {confirmGifUrl ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img
              src={confirmGifUrl}
              alt="Quiz submitted!"
              style={{ maxWidth: '100%', maxHeight: 380, width: 'auto', height: 'auto', borderRadius: 16, objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{ fontSize: 68, marginBottom: 16, animation: 'bounce 0.6s ease both' }}>🎉</div>
        )}

        <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 800, color: '#1a1a2e', marginBottom: 10, lineHeight: 1.25 }}>
          Quiz Submitted!
        </h2>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Your responses have been recorded.<br />Redirecting you now…
        </p>

        {/* Animated progress bar */}
        <div style={{ height: 5, background: `${primaryColor}22`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}bb)`,
            borderRadius: 10,
            animation: 'redirectBar 3s linear forwards'
          }} />
        </div>

        <button
          onClick={onConfirm}
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
            color: '#fff', border: 'none', borderRadius: 50,
            padding: '14px 36px', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: ff,
            boxShadow: `0 8px 28px ${primaryColor}55`,
            touchAction: 'manipulation'
          }}>
          Continue Now →
        </button>

        <style>{`
          @keyframes redirectBar { from { width: 0% } to { width: 100% } }
        `}</style>
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

/* ── Overlay State Machine ──
   idle → (option selected, 1s delay) → flyingIn → visible (Next btn visible) → flyingOut → done
*/

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

  // Overlay state machine
  const [overlayState, setOverlayState] = useState('hidden') // hidden | preparing | flyingIn | visible | flyingOut
  const [overlayData, setOverlayData] = useState(null) // { src, animIn, animOut, idleTime, isLast, token }
  const [showNextBtn, setShowNextBtn] = useState(false)

  // Submit modal state (for thank-you page)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const activeSoundsRef = useRef([])
  const completingRef = useRef(false)
  const overlayTimerRef = useRef(null)
  const advanceRef = useRef(null)

  useEffect(() => {
    api.get(`/play/${gameName}/${companyName}`)
      .then(res => {
        const g = res.data.game
        setGame(g)
        if (g.settings?.font_family) loadFont(g.settings.font_family)
        const init = {}
        for (const f of (g.formFields || [])) init[f.field_label] = ''
        setFormData(init)
        setPhase('form')
      })
      .catch(err => {
        setErrorMsg(err.response?.data?.message || 'Game not found')
        setPhase('error')
      })
  }, [gameName, companyName])

  const resolveSound = useCallback((idOrUrl, soundMap) => {
    if (!idOrUrl) return null
    if (typeof idOrUrl === 'number' || (typeof idOrUrl === 'string' && /^\d+$/.test(idOrUrl))) {
      return soundMap?.[parseInt(idOrUrl)] || null
    }
    return idOrUrl || null
  }, [])

  // Stop all currently playing sounds (so correct/wrong don't overlap)
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
      const res = await api.post('/play/session/start', { game_id: game.id, player_data: formData, source_type: searchParams.get('source') === 'direct' ? 'direct' : 'link' })
      setSessionToken(res.data.session_token)
      setPhase('playing')
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
        // FIX: Play win or lose sound on completion — was never triggered before
        const soundMap = game?.soundMap || {}
        const settingsObj = game?.settings || {}
        const totalQ = game?.questions?.length || 0
        const finalScore = sess.score || 0
        const finalTotal = sess.total_scoreable || 0
        // Play win sound if scored > 50%, lose sound otherwise (only if sounds are set)
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
          // Survey (no scoring) — just play win sound
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
      }, 1000)
    } else {
      setTimeout(() => doAdvance(isLastQ, token), 1200)
    }
  }

  const s = game?.settings || {}
  const primaryColor = s.primary_color || '#7c6ff7'
  const fontFamily = s.font_family || 'DM Sans'
  const gameLogo = s.game_logo_url || game?.client_logo
  const ff = `'${fontFamily}', sans-serif`

  const getPageBg = (qBgImg, gameBgImg, solidColor) => {
    if (qBgImg) return { backgroundImage: `url(${qBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    if (gameBgImg) return { backgroundImage: `url(${gameBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    return { background: solidColor || '#f4f4ff' }
  }

  useEffect(() => () => { if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current) }, [])

  if (phase === 'loading') return <PageLoader primaryColor={primaryColor} />

  if (phase === 'already_played') {
    const bgStyle = getPageBg(null, s.bg_image_url, s.bg_color)
    const hasBgImg = !!s.bg_image_url
    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: ff }}>
        <div style={{ background: hasBgImg ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 'clamp(32px,8vw,48px) clamp(24px,6vw,40px)', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.7)' }}>
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
          <h1 style={{ color: hasBgImg ? '#fff' : '#1a1a2e', fontFamily: ff, fontSize: 'clamp(22px,6vw,30px)', textAlign: 'center', marginBottom: 6, lineHeight: 1, textShadow: hasBgImg ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', fontWeight: 800 }}>{game.name}</h1>
          {game.description && <p style={{ color: hasBgImg ? 'rgba(255,255,255,0.85)' : '#666', textAlign: 'center', marginBottom: 20, fontSize: 12, lineHeight: 1.6 }}>{game.description}</p>}
          {s.intro_text && (
            <div style={{ background: hasBgImg ? 'rgba(255,255,255,0.15)' : `${primaryColor}12`, border: `1.5px solid ${hasBgImg ? 'rgba(255,255,255,0.3)' : primaryColor + '30'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: hasBgImg ? '#fff' : '#444', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
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
                  </label>
                  {f.field_type === 'textarea' ? (
                    <textarea id={fieldId} name={fieldId} rows={3} value={val}
                      onChange={e => handleFieldChange(f.field_label, e.target.value, f.field_type, f.is_required)}
                      onBlur={e => handleFieldBlur(f.field_label, e.target.value, f.field_type, f.is_required)}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => { e.target.style.borderColor = hasErr ? '#ef4444' : primaryColor; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}22` }} />
                  ) : (
                    <input id={fieldId} name={fieldId}
                      type={f.field_type === 'phone' ? 'tel' : f.field_type === 'email' ? 'email' : f.field_type === 'number' ? 'number' : 'text'}
                      value={val}
                      onChange={e => handleFieldChange(f.field_label, e.target.value, f.field_type, f.is_required)}
                      onBlur={e => handleFieldBlur(f.field_label, e.target.value, f.field_type, f.is_required)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = hasErr ? '#ef4444' : primaryColor; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}22` }} />
                  )}
                  <div style={{ height: 20, marginTop: 3 }}>
                    {hasErr && <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠ {err}</span>}
                  </div>
                </div>
              )
            })}

            {s.terms_enabled && (s.terms_text || s.terms_url) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, marginTop: 4 }}>
                <div onClick={() => setTermsAgreed(!termsAgreed)} style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2, border: `2px solid ${termsAgreed ? primaryColor : '#ccc'}`, borderRadius: 5, background: termsAgreed ? primaryColor : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {termsAgreed && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: hasBgImg ? 'rgba(255,255,255,0.85)' : '#555', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  {s.terms_url ? <a href={s.terms_url} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, fontWeight: 600, textDecoration: 'underline' }}>{s.terms_text || 'Terms & Conditions'}</a> : <span style={{ color: primaryColor, fontWeight: 600 }}>{s.terms_text || 'Terms & Conditions'}</span>}
                </span>
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: '100%', background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 8, opacity: submitting ? 0.6 : 1, fontFamily: ff, boxShadow: `0 6px 20px ${primaryColor}44`, transition: 'all 0.2s' }}>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Starting…
                </span>
              ) : `Start ${game.category === 'quiz' ? 'Quiz' : 'Survey'} →`}
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

    // Question image idle animation key
    const qImgAnimKey = question.question_image_animation || 'float'

    const getOverlayImgStyle = () => {
      if (!overlayData) return {}
      if (overlayState === 'flyingIn') {
        return { animation: `${overlayData.animIn} 0.6s cubic-bezier(0.34,1.3,0.64,1) forwards` }
      }
      if (overlayState === 'visible') {
        return { transform: 'translateY(0) translateX(0) scale(1)', opacity: 1 }
      }
      if (overlayState === 'flyingOut') {
        return { animation: `${overlayData.animOut} 0.5s cubic-bezier(0.55,0,0.85,0.36) forwards` }
      }
      return { opacity: 0 }
    }

    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: ff, position: 'relative', overflowX: 'hidden' }}>

        {/* Overlay — full-screen keynote-style */}
        {isOverlayActive && overlayData && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            padding: '20px 16px'
          }}>
            {/* Overlay image — supports GIF */}
            <img
              src={overlayData.src}
              alt=""
              style={{
                maxWidth: 'min(88vw, 520px)',
                maxHeight: '72vh',
                width: 'auto', height: 'auto',
                borderRadius: 18,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                display: 'block',
                ...getOverlayImgStyle()
              }}
            />
            {/* Next button — appears after idle time */}
            {showNextBtn && (
              <button
                onClick={() => flyOutRef.current?.()}
                style={{
                  position: 'absolute',
                  bottom: '8vh',
                  zIndex: 1001,
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '14px 40px',
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: ff,
                  boxShadow: `0 12px 40px ${primaryColor}77`,
                  animation: 'nextBtnIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  letterSpacing: '0.02em',
                  minWidth: 160,
                  touchAction: 'manipulation'
                }}>
                Next →
              </button>
            )}
            {/* ✅ REMOVED: "Please wait…" spinner text during idle time */}
          </div>
        )}

        {/* Top area: progress + logo */}
        <div style={{ width: '100%', maxWidth: 520, padding: 'clamp(16px,4vw,24px) clamp(14px,4vw,20px) 0', boxSizing: 'border-box' }}>
          {gameLogo && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, animation: 'questionEnter 0.4s ease' }}>
              <img src={gameLogo} alt="Logo" style={{ maxWidth: 120, maxHeight: 48, width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 8 }} />
            </div>
          )}
          {s.show_progress !== 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: hasBgImage ? 'rgba(255,255,255,0.9)' : '#888', fontWeight: 600 }}>
                <span>Question {currentQ + 1} of {game.questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 5, background: hasBgImage ? 'rgba(255,255,255,0.25)' : '#e8e8f5', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}bb)`, borderRadius: 10, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Question card */}
        <div style={{
          width: 'calc(100% - clamp(24px,6vw,40px))',
          maxWidth: 520,
          margin: 'clamp(8px,2vw,14px) auto clamp(20px,5vw,40px)',
          background: hasBgImage ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 22,
          overflow: 'hidden',
          border: hasBgImage ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
          animation: 'questionEnter 0.4s cubic-bezier(0.34,1.3,0.64,1)',
          boxSizing: 'border-box'
        }} key={questionKey}>

          {/* Question image with entrance + idle animation — supports GIF natively */}
          {question.question_image_url && (() => {
            // Build combined animation: entrance first (0.55s), then seamlessly into idle loop
            const idleAnimDef = qImgAnimKey !== 'none'
              ? (() => {
                  const map = {
                    float:    'qImgFloat 3.2s ease-in-out 0.55s infinite',
                    breathe:  'qImgBreathe 2.8s ease-in-out 0.55s infinite',
                    pulse:    'qImgPulse 2.4s ease-in-out 0.55s infinite',
                    shimmer:  'qImgShimmer 3s ease-in-out 0.55s infinite',
                    kenburns: 'qImgKenBurns 8s ease-in-out 0.55s infinite alternate',
                  }
                  return map[qImgAnimKey] || map.float
                })()
              : null

            const combinedAnim = idleAnimDef
              ? `qImgEntrance 0.5s 0.05s both cubic-bezier(0.34,1.3,0.64,1), ${idleAnimDef}`
              : `qImgEntrance 0.5s 0.05s both cubic-bezier(0.34,1.3,0.64,1)`

            return (
              <div style={{
                width: '100%', overflow: 'hidden',
                background: hasBgImage ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.04)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: 'clamp(12px,3vw,20px) clamp(12px,3vw,20px) 0',
                boxSizing: 'border-box',
              }}>
                <img
                  src={question.question_image_url}
                  alt=""
                  style={{
                    width: 'auto', maxWidth: '100%', height: 'auto',
                    maxHeight: 'clamp(180px,40vw,280px)',
                    objectFit: 'contain', display: 'block',
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    animation: combinedAnim,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            )
          })()}

          <div style={{ padding: 'clamp(18px,5vw,26px) clamp(14px,4vw,22px) clamp(16px,4vw,22px)', boxSizing: 'border-box' }}>

            {/* Question text */}
            <h2 style={{
              color: hasBgImage ? '#fff' : (question.question_color || '#1a1a2e'),
              fontSize: 'clamp(16px,4.5vw,21px)',
              lineHeight: 1.48,
              textAlign: 'center',
              fontFamily: ff,
              marginBottom: 'clamp(16px,4vw,24px)',
              textShadow: hasBgImage ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
              fontWeight: 700,
              animation: 'questionEnter 0.45s 0.1s both ease',
              paddingTop: question.question_image_url ? 0 : 'clamp(4px,1vw,8px)'
            }}>
              {question.question_text}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,2vw,12px)' }}>
              {(question.options || []).map((opt, optIdx) => {
                let bgColor = opt.option_color || '#1a1a2e'
                let textColor = opt.option_text_color || '#ffffff'
                let border = `2px solid transparent`
                let shadow = '0 2px 8px rgba(0,0,0,0.1)'
                let scale = 'scale(1)'
                let opacity = 1

                if (answered && selectedOpt?.id === opt.id) {
                  if (question.question_type === 'right_wrong') {
                    if (opt.is_correct) { bgColor = '#22c55e'; textColor = '#fff'; border = '2px solid #22c55e'; shadow = '0 4px 16px rgba(34,197,94,0.4)'; scale = 'scale(0.97)' }
                    else { bgColor = '#ef4444'; textColor = '#fff'; border = '2px solid #ef4444'; shadow = '0 4px 16px rgba(239,68,68,0.4)'; scale = 'scale(0.97)' }
                  } else {
                    bgColor = primaryColor; textColor = '#fff'; border = `2px solid ${primaryColor}`; shadow = `0 4px 16px ${primaryColor}55`
                  }
                } else if (answered) {
                  opacity = 0.6
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt, sessionToken)}
                    disabled={answered}
                    style={{
                      background: bgColor, border, borderRadius: 14,
                      padding: 'clamp(12px,3vw,16px) clamp(14px,3.5vw,18px)',
                      color: textColor,
                      fontSize: 'clamp(14px,3.8vw,16px)',
                      fontWeight: 600,
                      cursor: answered ? 'default' : 'pointer',
                      textAlign: 'center', lineHeight: 1.35,
                      fontFamily: ff,
                      transition: 'all 0.22s ease',
                      boxShadow: shadow,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transform: scale,
                      width: '100%',
                      opacity,
                      touchAction: 'manipulation',
                      animation: `questionEnter 0.4s ${0.15 + optIdx * 0.06}s both ease`,
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseEnter={e => { if (!answered) e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)' }}
                    onMouseLeave={e => { if (!answered) e.currentTarget.style.transform = 'none' }}>
                    {opt.option_image_url && <img src={opt.option_image_url} alt="" style={{ width: 'auto', height: 44, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />}
                    <span style={{ flex: 1, textAlign: 'center' }}>{opt.option_text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {completing && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '10px 18px', fontSize: 13, color: '#555' }}>
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
      // Auto redirect after 3.2s (matches the progress bar animation)
      setTimeout(() => {
        if (redirectUrl) window.location.href = redirectUrl
      }, 3200)
    }

    const handleModalConfirm = () => {
      setShowSubmitModal(false)
      if (redirectUrl) window.location.href = redirectUrl
    }

    return (
      <div style={{ minHeight: '100dvh', ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', fontFamily: ff, padding: '20px 16px', boxSizing: 'border-box' }}>
        <Confetti />

        {/* Submission confirmation modal */}
        {showSubmitModal && (
          <SubmitModal
            primaryColor={primaryColor}
            ff={ff}
            confirmGifUrl={confirmGifUrl}
            onConfirm={handleModalConfirm}
          />
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
          <h1 style={{ fontFamily: ff, fontSize: 'clamp(20px,6vw,30px)', color: hasBgImage ? '#fff' : '#1a1a2e', marginBottom: 20, lineHeight: 1.25, textShadow: hasBgImage ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', fontWeight: 800 }}>
            {s.outro_text || 'Yay! You completed the game!'}
          </h1>
          {hasScore && (
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <ScoreRing score={score} total={totalScoreable} primaryColor={primaryColor} />
            </div>
          )}
          {!hasScore && (
            <div style={{ background: hasBgImage ? 'rgba(255,255,255,0.15)' : `${primaryColor}12`, border: `1.5px solid ${hasBgImage ? 'rgba(255,255,255,0.3)' : primaryColor + '30'}`, borderRadius: 14, padding: '14px 20px', marginBottom: 24, color: hasBgImage ? '#fff' : '#444', fontSize: 14 }}>
              ✅ Thank you for completing!
            </div>
          )}

          {/* ✅ NEW: Submit & Explore button (replaces plain "Continue →" link) */}
          <button
            onClick={handleSubmitExplore}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%',
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
              color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: 14,
              fontSize: 17, fontWeight: 700,
              cursor: 'pointer', fontFamily: ff,
              boxShadow: `0 6px 24px ${primaryColor}55`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              touchAction: 'manipulation',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${primaryColor}66` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 6px 24px ${primaryColor}55` }}>
            <span>🚀</span>
            <span>Submit &amp; Explore</span>
          </button>
        </div>
        <style>{OVERLAY_STYLES}</style>
      </div>
    )
  }

  return null
}