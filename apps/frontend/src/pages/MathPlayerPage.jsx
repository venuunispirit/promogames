import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const STYLES = `
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 12px transparent} }
@keyframes confettiFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes flyFromBottom { from{transform:translateY(110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes flyToTop { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(-110vh) scale(0.9);opacity:0} }
@keyframes zoomIn { from{transform:scale(0.1);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes bounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 85%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
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
  const colors = ['#22c55e','#6366f1','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          position:'absolute', top:-20, left:`${Math.random() * 100}%`,
          width: 6 + Math.random() * 8, height: 6 + Math.random() * 8,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

export default function MathPlayerPage({ gameData, sessionToken, onComplete }) {
  const game = gameData
  const settings = game.settings || {}
  const soundMap = game.soundMap || {}
  const formFields = game.formFields || []

  const [phase, setPhase] = useState('loading')
  const [question, setQuestion] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [levelCorrect, setLevelCorrect] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayAnimOut, setOverlayAnimOut] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [completing, setCompleting] = useState(false)
  const timerRef = useRef(null)
  const isCompleteRef = useRef(false)
  const completedRef = useRef(false)

  const totalLevels = parseInt(settings.total_levels) || 100
  const qPerLevel = parseInt(settings.questions_per_level) || 5
  const passThreshold = parseInt(settings.pass_threshold) || 5

  useEffect(() => { loadFont(settings.font_family) }, [settings.font_family])

  useEffect(() => {
    if (!sessionToken) { setPhase('playing'); return }
    api.get(`/math/${game.id}/progress`, { params: { session_token: sessionToken } })
      .then(res => {
        const p = res.data.progress
        if (p) {
          const savedLevel = p.current_level || 1
          const savedQ = p.current_question || 0
          setCurrentLevel(savedLevel)
          setCurrentQ(savedQ)
          setTotalCorrect(p.total_correct || 0)
          if (savedQ >= qPerLevel) {
            setPhase('level_complete')
          } else {
            setPhase('playing')
          }
        } else {
          setPhase('playing')
        }
      })
      .catch(() => setPhase('playing'))
  }, [sessionToken, game.id, qPerLevel])

  const fetchQuestion = useCallback(async (level, qIndex) => {
    try {
      const res = await api.get(`/math/${game.id}/question`, {
        params: { level, q_index: qIndex, session_token: sessionToken || '' }
      })
      setQuestion(res.data.question)
      if (settings.show_timer && settings.time_per_question > 0) {
        setTimeLeft(settings.time_per_question)
      }
    } catch (err) {
      console.error('Failed to fetch question:', err)
    }
  }, [game.id, sessionToken, settings.show_timer, settings.time_per_question])

  useEffect(() => {
    if (phase === 'playing' && currentLevel <= totalLevels) {
      fetchQuestion(currentLevel, currentQ)
    }
  }, [phase, currentLevel, currentQ, totalLevels, fetchQuestion])

  useEffect(() => {
    if (!settings.show_timer || !settings.time_per_question || phase !== 'playing' || question === null || answerResult) return
    setTimeLeft(settings.time_per_question)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAnswer(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [question, phase, answerResult])

  const handleAnswer = async (selected) => {
    if (answerResult) return
    clearInterval(timerRef.current)
    setSelectedAnswer(selected)

    const isCorrect = selected !== null && question && selected === question.answer
    setAnswerResult(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      playSound(soundMap, settings.sound_correct_id)
      const newCorrect = levelCorrect + 1
      setLevelCorrect(newCorrect)
      setTotalCorrect(prev => prev + 1)
    } else {
      playSound(soundMap, settings.sound_wrong_id)
    }

    if (sessionToken) {
      try {
        await api.post(`/math/${game.id}/progress`, {
          session_token: sessionToken,
          level: currentLevel,
          question_index: currentQ,
          correct: isCorrect ? 1 : 0,
        })
      } catch (e) {}
    }
  }

  const nextQuestionOrLevel = () => {
    const nextQ = currentQ + 1
    if (nextQ >= qPerLevel) {
      setPhase('level_complete')
    } else {
      setCurrentQ(nextQ)
      setSelectedAnswer(null)
      setAnswerResult(null)
    }
  }

  const handleLevelOverlay = async () => {
    setOverlayAnimOut(settings.overlay_animation_out || 'flyToTop')
    setTimeout(() => {
      setShowOverlay(false)
      setOverlayAnimOut('')
      if (levelCorrect >= passThreshold) {
        const nextLevel = currentLevel + 1
        if (nextLevel > totalLevels) {
          handleGameOver()
        } else {
          setCurrentLevel(nextLevel)
          setCurrentQ(0)
          setLevelCorrect(0)
          setSelectedAnswer(null)
          setAnswerResult(null)
          setPhase('playing')
          if (sessionToken) {
            api.post(`/math/${game.id}/level-complete`, { session_token: sessionToken, level: currentLevel }).catch(() => {})
          }
        }
      } else {
        setCurrentQ(0)
        setLevelCorrect(0)
        setSelectedAnswer(null)
        setAnswerResult(null)
        setPhase('playing')
      }
    }, 400)
  }

  useEffect(() => {
    if (phase === 'level_complete') {
      setShowOverlay(true)
      setOverlayAnimOut('')
    }
  }, [phase])

  const handleGameOver = async () => {
    if (isCompleteRef.current) return
    isCompleteRef.current = true
    clearInterval(timerRef.current)
    setGameOver(true)
    if (!sessionToken) return
    if (completedRef.current) return
    completedRef.current = true
    try {
      const res = await api.post('/play/session/complete', { session_token: sessionToken })
      onComplete?.(res.data)
    } catch (err) {
      onComplete?.({ redirect_url: game.redirect_url })
    }
  }

  const animIn = settings.overlay_animation_in || 'flyFromBottom'
  const animOut = overlayAnimOut || 'flyToTop'

  if (phase === 'loading') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: settings.bg_color || '#f0fdf4', fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif` }}>
        <style>{STYLES}</style>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:36,height:36,borderRadius:'50%',border:'3px solid #E5E7EB',borderTopColor:'#22c55e',animation:'fadeIn .8s linear infinite',margin:'0 auto 12px' }} />
          <div style={{ color:'#9CA3AF',fontSize:14 }}>Loading your progress…</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      background: settings.bg_color || '#f0fdf4',
      fontFamily: `"${settings.font_family || 'DM Sans'}", sans-serif`,
    }}>
      <style>{STYLES}</style>

      {/* Progress Header */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'10px 16px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)',
        borderBottom:'1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#555' }}>
          Level <strong style={{ color: settings.primary_color || '#22c55e' }}>{currentLevel}</strong>/{totalLevels}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {question && !gameOver && (
            <div style={{ display:'flex', gap:4 }}>
              {Array.from({ length: qPerLevel }).map((_, i) => (
                <div key={i} style={{
                  width:12, height:12, borderRadius:'50%',
                  background: i < currentQ ? '#22c55e' : i === currentQ && !answerResult ? (settings.primary_color || '#22c55e') : '#E5E7EB',
                  border: i === currentQ && !answerResult ? `2px solid ${settings.primary_color || '#22c55e'}` : 'none',
                  transition:'all .2s',
                }} />
              ))}
            </div>
          )}
          <div style={{ fontSize:12, color:'#999' }}>
            ✅ {totalCorrect}
          </div>
          {settings.show_timer && settings.time_per_question > 0 && question && !answerResult && (
            <div style={{ fontSize:13, fontWeight:700, color: timeLeft <= 5 ? '#dc2626' : '#555', minWidth:30, textAlign:'right' }}>
              {timeLeft}s
            </div>
          )}
        </div>
      </div>

      {gameOver ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <Confetti />
          <div style={{ textAlign:'center', maxWidth:340, animation:'slideUp .4s ease' }}>
            <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
            <h2 style={{ fontSize:22, fontWeight:800, color: settings.outro_text_color || settings.heading_1_color || '#1a1a2e', margin:'0 0 6px' }}>
              {settings.outro_text || 'All Levels Complete!'}
            </h2>
            <p style={{ fontSize:14, color: settings.heading_2_color || '#666', margin:'0 0 16px' }}>
              You solved {totalCorrect} questions across {totalLevels} levels!
            </p>
            <button onClick={() => handleGameOver()}
              style={{
                padding:'14px 36px', borderRadius:12, border:'none',
                background: settings.primary_color || '#22c55e', color:'#fff',
                fontSize:15, fontWeight:700, cursor:'pointer',
                fontFamily:'inherit',
              }}>
              {settings.continue_button_text || 'Continue →'}
            </button>
          </div>
        </div>
      ) : phase === 'level_complete' && showOverlay ? (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
        }}>
          <div style={{ textAlign:'center', animation: `${overlayAnimOut ? animOut : animIn} .4s ease`, animationName: overlayAnimOut ? animOut : animIn }}>
            {levelCorrect >= passThreshold ? (
              <div style={{ background:'rgba(255,255,255,0.92)', borderRadius:20, padding:'28px 24px', maxWidth:300 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
                <h2 style={{ fontSize:18, fontWeight:800, color:'#16a34a', margin:0 }}>Level {currentLevel} Complete!</h2>
                <p style={{ fontSize:14, color:'#666', margin:'8px 0' }}>
                  You got <strong>{levelCorrect}</strong>/{qPerLevel} correct!
                </p>
                {currentLevel < totalLevels && (
                  <p style={{ fontSize:13, color:'#999', marginBottom:12 }}>Level {currentLevel + 1} unlocked →</p>
                )}
                <button onClick={handleLevelOverlay}
                  style={{
                    padding:'12px 36px', borderRadius:12, border:'none',
                    background: settings.primary_color || '#22c55e', color:'#fff',
                    fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    animation:'nextBtnIn .3s ease .2s both',
                  }}>
                  {currentLevel >= totalLevels ? '🏆 Finish' : 'Next Level →'}
                </button>
              </div>
            ) : (
              <div style={{ background:'rgba(255,255,255,0.92)', borderRadius:20, padding:'28px 24px', maxWidth:300 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>😅</div>
                <h2 style={{ fontSize:18, fontWeight:800, color:'#dc2626', margin:0 }}>Try Again!</h2>
                <p style={{ fontSize:14, color:'#666', margin:'8px 0' }}>
                  You got <strong>{levelCorrect}</strong>/{qPerLevel}. Need {passThreshold} to pass.
                </p>
                <button onClick={handleLevelOverlay}
                  style={{
                    padding:'12px 36px', borderRadius:12, border:'none',
                    background: '#dc2626', color:'#fff',
                    fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    animation:'nextBtnIn .3s ease .2s both',
                  }}>
                  🔄 Retry Level
                </button>
              </div>
            )}
          </div>
        </div>
      ) : question ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'20px 16px', maxWidth:420, margin:'0 auto', width:'100%' }}>
          <div style={{ animation:'slideUp .4s ease', flex:1, display:'flex', flexDirection:'column' }}>
            {/* Question Card */}
            <div style={{
              background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)',
              borderRadius:20, padding:'24px 20px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.1)',
              textAlign:'center',
              animation: answerResult === 'wrong' ? 'shake .5s ease' : 'none',
              flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>
                {question.label}
              </div>
              <div style={{
                fontSize:36, fontWeight:800, color: settings.heading_1_color || '#1a1a2e',
                margin:'12px 0 20px',
                fontFamily: settings.font_family || 'DM Sans',
              }}>
                {question.operand_a} {question.operator} {question.operand_b} = ?
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {question.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt
                  const isCorrectAnswer = answerResult && opt === question.answer
                  const isWrongSel = answerResult === 'wrong' && isSelected

                  let bg = '#fff'
                  let border = '2px solid #E5E7EB'
                  let color = '#374151'

                  if (answerResult) {
                    if (isCorrectAnswer) { bg = '#F0FDF4'; border = '2px solid #22c55e'; color = '#16a34a' }
                    else if (isWrongSel) { bg = '#FEF2F2'; border = '2px solid #dc2626'; color = '#dc2626' }
                  } else if (isSelected) {
                    bg = '#EEF2FF'; border = `2px solid ${settings.primary_color || '#22c55e'}`; color = settings.primary_color || '#22c55e'
                  }

                  return (
                    <button key={i} onClick={() => !answerResult && handleAnswer(opt)}
                      style={{
                        padding:'14px 10px', borderRadius:12, fontSize:18, fontWeight:700,
                        background: bg, border, color, cursor: answerResult ? 'default' : 'pointer',
                        fontFamily:'inherit', transition:'all .15s',
                        animation: answerResult && isCorrectAnswer ? 'pop .4s ease' : 'none',
                        transform: answerResult && isCorrectAnswer ? 'scale(1.05)' : 'none',
                      }}>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {answerResult && (
                <div style={{ marginTop:16, animation:'fadeIn .3s ease' }}>
                  <div style={{ fontSize:14, fontWeight:600, color: answerResult === 'correct' ? '#16a34a' : '#dc2626', marginBottom:8 }}>
                    {answerResult === 'correct' ? '✅ Correct!' : `❌ Wrong! Answer: ${question.answer}`}
                  </div>
                  <button onClick={nextQuestionOrLevel}
                    style={{
                      padding:'12px 24px', borderRadius:10, border:'none',
                      background: settings.primary_color || '#22c55e', color:'#fff',
                      fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                      animation:'nextBtnIn .3s ease',
                    }}>
                    {currentQ + 1 >= qPerLevel ? '📊 View Results' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🧮</div>
            <h2 style={{ fontSize:20, fontWeight:700, color: settings.heading_1_color || '#1a1a2e', marginBottom:8 }}>
              {settings.heading_1 || `Ready for Level ${currentLevel}!`}
            </h2>
            {settings.description_text && (
              <p style={{ fontSize:14, color: settings.description_color || '#666', marginBottom:16, whiteSpace:'pre-line' }}>
                {settings.description_text}
              </p>
            )}
            <p style={{ fontSize:14, color:'#666', marginBottom:16 }}>
              {qPerLevel} questions to unlock Level {currentLevel + 1}
            </p>
            {settings.terms_enabled && (
              <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#666', marginBottom:16, textAlign:'left' }}>
                <input type="checkbox" style={{ marginTop:3, accentColor: settings.primary_color || '#22c55e' }} />
                <span>
                  {settings.terms_text || 'I agree to the terms'}
                  {settings.terms_url && <a href={settings.terms_url} target="_blank" rel="noopener noreferrer" style={{ color: settings.primary_color || '#22c55e', textDecoration:'underline', marginLeft:4 }}>Terms</a>}
                </span>
              </label>
            )}
            <button onClick={() => fetchQuestion(currentLevel, currentQ)}
              style={{
                padding:'14px 36px', borderRadius:12, border:'none',
                background: settings.primary_color || '#22c55e', color:'#fff',
                fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>
              {settings.start_button_text || '🧮 Start Level'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
