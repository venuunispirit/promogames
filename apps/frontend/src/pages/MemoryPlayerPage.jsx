import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const MEMORY_STYLES = `
@keyframes flipIn { 0%{transform:rotateY(180deg)} 100%{transform:rotateY(0)} }
@keyframes flipOut { 0%{transform:rotateY(0)} 100%{transform:rotateY(180deg)} }
@keyframes matchPop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

@keyframes flyFromBottom { from{transform:translateY(110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes flyFromTop { from{transform:translateY(-110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes flyFromLeft { from{transform:translateX(-110vw) scale(0.9);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
@keyframes flyFromRight { from{transform:translateX(110vw) scale(0.9);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
@keyframes zoomIn { from{transform:scale(0.1);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes bounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 85%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }

@keyframes flyToTop { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(-110vh) scale(0.9);opacity:0} }
@keyframes flyToBottom { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(110vh) scale(0.9);opacity:0} }
@keyframes flyToLeft { from{transform:translateX(0) scale(1);opacity:1} to{transform:translateX(-110vw) scale(0.9);opacity:0} }
@keyframes flyToRight { from{transform:translateX(0) scale(1);opacity:1} to{transform:translateX(110vw) scale(0.9);opacity:0} }
@keyframes zoomOut { from{transform:scale(1);opacity:1} to{transform:scale(0.1);opacity:0} }
@keyframes fadeOut { from{opacity:1} to{opacity:0} }

@keyframes spin { to{transform:rotate(360deg)} }
@keyframes confettiFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 8px transparent} }
@keyframes nextBtnIn { from{opacity:0;transform:translateY(16px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
`

function loadFont(font) {
  if (!font || font === 'DM Sans') return
  const id = 'gf-' + font.replace(/\s/g, '-')
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id; link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`
  document.head.appendChild(link)
}

function playSound(soundMap, id) {
  if (!id || !soundMap[id]) return
  try {
    const a = new Audio(soundMap[id])
    a.volume = 0.6
    a.play().catch(() => {})
  } catch (e) {}
}

function Confetti({ count = 40 }) {
  const colors = ['#6366f1','#ec4899','#f59e0b','#22c55e','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 8,
  }))
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', top:-20, left:`${p.left}%`,
          width:p.size, height:p.size, background:p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  )
}

function CardShapeStyle(shape) {
  switch (shape) {
    case 'rounded-sm': return { borderRadius: 4 }
    case 'rounded': return { borderRadius: 8 }
    case 'rounded-lg': return { borderRadius: 16 }
    case 'circle': return { borderRadius: '50%' }
    case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }
    default: return { borderRadius: 2 }
  }
}

export default function MemoryPlayerPage({ gameData, sessionToken, onComplete }) {
  const game = gameData
  const settings = game.settings || {}
  const soundMap = game.soundMap || {}
  const tiles = game.tiles || []
  const formFields = game.formFields || []

  const [phase, setPhase] = useState(sessionToken ? 'playing' : 'intro')
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [cards, setCards] = useState([])
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedPairIds, setMatchedPairIds] = useState(new Set())
  const [moves, setMoves] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayAnimOut, setOverlayAnimOut] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)
  const mySessionToken = sessionToken
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const isCompleteRef = useRef(false)

  const cols = parseInt(settings.grid_cols) || 4
  const cellSize = Math.min(80, Math.floor(Math.min(360, window.innerWidth - 40) / Math.max(cols, 2)))

  useEffect(() => { loadFont(settings.font_family) }, [settings.font_family])

  useEffect(() => {
    if (!tiles.length) return
    const shuffled = [...tiles].sort(() => Math.random() - 0.5)
    setCards(shuffled.map(t => ({ ...t, isFlipped: false, isMatched: false })))
  }, [tiles])

  useEffect(() => {
    if (phase !== 'playing' || !settings.show_timer || !settings.time_limit_seconds) return
    setTimeLeft(settings.time_limit_seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleGameOver()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const handleCardClick = useCallback((index) => {
    if (isChecking || cards[index]?.isMatched || cards[index]?.isFlipped || gameOver) return
    if (flippedIndices.length >= 2) return

    playSound(soundMap, settings.sound_flip_id)

    const newCards = [...cards]
    newCards[index] = { ...newCards[index], isFlipped: true }
    setCards(newCards)

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      setIsChecking(true)
      const [first, second] = newFlipped
      const card1 = newCards[first]
      const card2 = newCards[second]

      if (card1.pair_id === card2.pair_id && card1.pair_id !== null) {
        setTimeout(() => {
          playSound(soundMap, settings.sound_match_id)
          const updatedCards = [...cards]
          updatedCards[first] = { ...updatedCards[first], isMatched: true }
          updatedCards[second] = { ...updatedCards[second], isMatched: true }
          setCards(updatedCards)
          const newMatched = new Set(matchedPairIds)
          newMatched.add(card1.pair_id)
          setMatchedPairIds(newMatched)
          setMatchCount(prev => prev + 1)
          setFlippedIndices([])
          setIsChecking(false)
          setShowOverlay(true)
          setOverlayAnimOut('')
        }, 400)
      } else {
        setTimeout(() => {
          playSound(soundMap, settings.sound_nomatch_id)
          const updatedCards = [...cards]
          updatedCards[first] = { ...updatedCards[first], isFlipped: false }
          updatedCards[second] = { ...updatedCards[second], isFlipped: false }
          setCards(updatedCards)
          setFlippedIndices([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [cards, flippedIndices, isChecking, gameOver, soundMap, settings, matchedPairIds])

  const handleOverlayNext = () => {
    setOverlayAnimOut(settings.overlay_animation_out || 'flyToTop')
    setTimeout(() => {
      setShowOverlay(false)
      setOverlayAnimOut('')
      const totalPairs = Math.floor(tiles.length / 2)
      if (matchCount >= totalPairs) {
        handleGameOver()
      }
    }, 400)
  }

  useEffect(() => {
    if (!showOverlay && matchCount > 0) {
      const totalPairs = Math.floor(tiles.length / 2)
      if (matchCount >= totalPairs) {
        handleGameOver()
      }
    }
  }, [showOverlay, matchCount])

  const handleGameOver = async () => {
    if (isCompleteRef.current) return
    isCompleteRef.current = true
    clearInterval(timerRef.current)
    setGameOver(true)
    if (!mySessionToken) return
    try {
      const res = await api.post('/play/session/complete', { session_token: mySessionToken })
      onComplete?.(res.data)
    } catch (err) {
      console.error('Session complete error:', err)
      onComplete?.({ redirect_url: game.redirect_url })
    }
  }

  const allMatched = cards.length > 0 && cards.every(c => c.isMatched)

  useEffect(() => {
    if (allMatched && !showOverlay && matchCount > 0 && !gameOver) {
      handleGameOver()
    }
  }, [allMatched])

  const animIn = settings.overlay_animation_in || 'flyFromBottom'
  const animOut = overlayAnimOut || 'flyToTop'

  if (alreadyPlayed) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'DM Sans,sans-serif', background: settings.bg_color || '#f8f8ff' }}>
        <style>{MEMORY_STYLES}</style>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <h2 style={{ color:'#dc2626', marginBottom:8 }}>Already Played</h2>
        <p style={{ color:'#666', textAlign:'center', maxWidth:320 }}>You have already completed this memory match game. Each game can only be played once.</p>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        background: settings.bg_color || '#f8f8ff',
        backgroundImage: settings.bg_image_url ? `url("${settings.bg_image_url}")` : 'none',
        backgroundSize:'cover', backgroundPosition:'center',
        fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
        padding: '20px 16px',
      }}>
        <style>{MEMORY_STYLES}</style>
        <div style={{ maxWidth:400, margin:'auto', width:'100%', animation:'fadeIn .4s ease' }}>
          {settings.game_logo_url && (
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <img src={settings.game_logo_url} alt="" style={{ height:48, objectFit:'contain' }} />
            </div>
          )}
          <div style={{
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)',
            borderRadius:20, padding:'24px 20px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ fontSize:22, fontWeight:800, color: settings.heading_1_color || '#1a1a2e', margin:0, textAlign:'center' }}>
              {settings.heading_1 || 'Memory Match'}
            </h1>
            {settings.heading_2 && (
              <p style={{ fontSize:14, color: settings.heading_2_color || '#666', textAlign:'center', margin:'4px 0 0' }}>
                {settings.heading_2}
              </p>
            )}
            {settings.heading_3 && (
              <p style={{ fontSize:13, color: settings.heading_3_color || '#888', textAlign:'center', margin:'4px 0 8px' }}>
                {settings.heading_3}
              </p>
            )}
            {settings.description_text && (
              <p style={{ fontSize:13, color: settings.description_color || '#888', textAlign:'center', margin:'8px 0 16px', lineHeight:1.4 }}>
                {settings.description_text}
              </p>
            )}

            {formFields.map((ff, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>
                  {ff.field_label} {Number(ff.is_required) === 1 && <span style={{ color:'#dc2626' }}>*</span>}
                </label>
                {ff.field_type === 'textarea' ? (
                  <textarea rows={3} value={formData[ff.field_label] || ''}
                    onChange={e => { setFormData({...formData, [ff.field_label]: e.target.value}); setFormErrors({...formErrors, [ff.field_label]: ''}) }}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid '+(formErrors[ff.field_label]?'#dc2626':'#ddd'), fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', background:'#fff' }} />
                ) : ff.field_type === 'select' ? (
                  <select value={formData[ff.field_label] || ''}
                    onChange={e => setFormData({...formData, [ff.field_label]: e.target.value})}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #ddd', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                    <option value="">Select...</option>
                    {(ff.field_options || []).map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={ff.field_type === 'email' ? 'email' : ff.field_type === 'phone' ? 'tel' : ff.field_type === 'number' ? 'number' : 'text'}
                    value={formData[ff.field_label] || ''}
                    onChange={e => { setFormData({...formData, [ff.field_label]: e.target.value}); setFormErrors({...formErrors, [ff.field_label]: ''}) }}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid '+(formErrors[ff.field_label]?'#dc2626':'#ddd'), fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff' }} />
                )}
                {formErrors[ff.field_label] && <p style={{ color:'#dc2626', fontSize:11, margin:'3px 0 0' }}>{formErrors[ff.field_label]}</p>}
              </div>
            ))}

            {Number(settings.terms_enabled) === 1 && (
              <label style={{ display:'flex', alignItems:'center', gap:8, margin:'12px 0', cursor:'pointer', fontSize:13 }}>
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  style={{ width:16, height:16 }} />
                <span>
                  I accept the{' '}
                  {settings.terms_url
                    ? <a href={settings.terms_url} target="_blank" style={{ color: settings.primary_color }}>{settings.terms_text || 'Terms & Conditions'}</a>
                    : <strong>{settings.terms_text || 'Terms & Conditions'}</strong>
                  }
                </span>
              </label>
            )}

            <button onClick={handleStart} disabled={submitting}
              style={{
                width:'100%', padding:'14px', borderRadius:12, border:'none',
                background: settings.primary_color || '#6366f1', color:'#fff',
                fontSize:16, fontWeight:700, cursor:'pointer',
                fontFamily:'inherit', marginTop:8,
                boxShadow: `0 4px 16px ${settings.primary_color || '#6366f1'}44`,
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? '⏳ Starting...' : (settings.start_button_text || '🎮 Start Game')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'playing' || gameOver) {
    const cardShape = CardShapeStyle(settings.card_shape || 'square')

    return (
      <div style={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        background: settings.bg_color || '#f8f8ff',
        backgroundImage: settings.bg_image_url ? `url("${settings.bg_image_url}")` : 'none',
        backgroundSize:'cover', backgroundPosition:'center',
        fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
        padding: '12px',
      }}>
        <style>{MEMORY_STYLES}</style>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', borderRadius:12, marginBottom:8 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#555' }}>
            Moves: <strong>{moves}</strong>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:'#555' }}>
            Matched: <strong>{matchCount}</strong>/{Math.floor(tiles.length / 2)}
          </div>
          {Number(settings.show_timer) === 1 && settings.time_limit_seconds > 0 && (
            <div style={{ fontSize:13, fontWeight:600, color: timeLeft <= 10 ? '#dc2626' : '#555' }}>
              ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2,'0')}
            </div>
          )}
        </div>

        {gameOver && (
          <div style={{ textAlign:'center', padding:'20px 16px', flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <Confetti />
            <div style={{
              background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)',
              borderRadius:20, padding:'28px 24px', maxWidth:340, width:'100%',
              boxShadow:'0 8px 32px rgba(0,0,0,0.1)', animation:'slideUp .4s ease',
            }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
              <h2 style={{ fontSize:20, fontWeight:800, color: settings.heading_1_color || '#1a1a2e', margin:'0 0 4px' }}>
                {game.text1 || '🎉 Congratulations!'}
              </h2>
              <p style={{ fontSize:14, color: settings.heading_2_color || '#666', margin:'0 0 8px' }}>
                {game.text2 || `You matched all cards in ${moves} moves!`}
              </p>
              {settings.outro_text && (
                <p style={{ fontSize:13, color: settings.description_color || '#888', margin:'0 0 16px', lineHeight:1.4 }}>
                  {settings.outro_text}
                </p>
              )}
              <button onClick={() => setShowGifModal(true)}
                style={{
                  width:'100%', padding:'14px', borderRadius:12, border:'none',
                  background: settings.primary_color || '#6366f1', color:'#fff',
                  fontSize:15, fontWeight:700, cursor:'pointer',
                  fontFamily:'inherit',
                  boxShadow: `0 4px 16px ${settings.primary_color || '#6366f1'}44`,
                }}>
                {settings.continue_button_text || 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {!gameOver && (
          <div style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            padding:'8px 0',
          }}>
            <div style={{
              display:'grid',
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gap: 6, justifyContent:'center',
            }}>
              {cards.map((card, i) => {
                const isFlipped = card.isFlipped || card.isMatched
                return (
                  <div key={card.id}
                    onClick={() => handleCardClick(i)}
                    style={{
                      width: cellSize, height: cellSize,
                      cursor: (isFlipped || isChecking || gameOver) ? 'default' : 'pointer',
                      position:'relative',
                      perspective: 800,
                    }}>
                    <div style={{
                      width:'100%', height:'100%',
                      transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                      animation: card.isMatched && !showOverlay ? 'matchPop .4s ease' : 'none',
                    }}>
                      <div style={{
                        position:'absolute', inset:0, borderRadius:2,
                        background: settings.card_cover_image_url ? `url("${settings.card_cover_image_url}") center / cover no-repeat` : (settings.primary_color || '#6366f1'),
                        backfaceVisibility:'hidden',
                        border:'2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        ...cardShape,
                      }} />
                      <div style={{
                        position:'absolute', inset:0, borderRadius:2,
                        background: `url("${card.image_url}") center / cover no-repeat`,
                        backfaceVisibility:'hidden',
                        transform: 'rotateY(180deg)',
                        border:'2px solid rgba(255,255,255,0.5)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        ...cardShape,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showOverlay && (
          <div style={{
            position:'fixed', inset:0, zIndex:100,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
            animation: 'fadeIn .2s ease',
          }}>
            <div style={{
              animation: `${animOut.startsWith('fly') ? animOut : 'fadeIn'} .4s ease`,
              textAlign:'center',
              animationName: overlayAnimOut ? animOut : animIn,
            }}>
              {settings.overlay_image_url ? (
                <img src={settings.overlay_image_url} alt=""
                  style={{ maxWidth:'80vw', maxHeight:'60vh', borderRadius:16, boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }} />
              ) : (
                <div style={{
                  width:200, height:200, borderRadius:20,
                  background: settings.primary_color || '#6366f1',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:64,
                  boxShadow:'0 24px 64px rgba(0,0,0,0.3)',
                }}>🎉</div>
              )}
              <button onClick={handleOverlayNext}
                style={{
                  marginTop:20, padding:'12px 36px', borderRadius:12, border:'none',
                  background: settings.primary_color || '#6366f1', color:'#fff',
                  fontSize:15, fontWeight:700, cursor:'pointer',
                  fontFamily:'inherit', animation:'nextBtnIn .3s ease .2s both',
                  boxShadow: `0 4px 16px ${settings.primary_color || '#6366f1'}44`,
                }}>
                Next →
              </button>
            </div>
          </div>
        )}

        
      </div>
    )
  }

  return null
}
