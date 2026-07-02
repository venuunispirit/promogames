import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const FALLBACK_WORDS = [
  'TYPE','FAST','WORD','GAME','PLAY','WIN','SPEED','COMBO','STREAK','FLASH',
  'LIGHT','QUICK','RAPID','SPLIT','FORCE','POWER','BRAIN','SKILL','FOCUS','SMART',
  'READY','GO','NEXT','HIT','MARK','ZONE','RUSH','BURN','BOOM','ZOOM',
]

export default function TyperPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, words: dbWords, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])

  const primaryColor = settings?.primary_color || '#6366f1'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const bgColor = settings?.bg_color || '#0f172a'
  const baseFallSpeed = settings?.fall_speed || 2
  const maxSimultaneous = settings?.max_simultaneous || 3
  const difficultyMode = settings?.difficulty_mode || 'progressive'
  const timeLimit = settings?.time_limit_seconds || 60
  const maxMisses = settings?.max_misses || 5
  const targetWords = settings?.target_words || 0

  const wordPoolRef = useRef(null)
  if (!wordPoolRef.current) {
    wordPoolRef.current = (dbWords && dbWords.length > 0)
      ? dbWords.map(w => w.word_text)
      : FALLBACK_WORDS
  }
  const wordPool = wordPoolRef.current

  const [showIntro, setShowIntro] = useState(true)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [fallingWords, setFallingWords] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [missCount, setMissCount] = useState(0)
  const [totalTyped, setTotalTyped] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [wordsCleared, setWordsCleared] = useState(0)
  const [comboFlashes, setComboFlashes] = useState([])
  const [showCorrectFlash, setShowCorrectFlash] = useState(false)
  const [showWrongFlash, setShowWrongFlash] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [activeWords, setActiveWords] = useState([])

  const completedRef = useRef(false)
  const inputRef = useRef(null)
  const wordIdCounter = useRef(0)
  const gameLoopRef = useRef(null)
  const spawnTimerRef = useRef(null)
  const activeWordsRef = useRef([])
  const missCountRef = useRef(0)
  const wordsClearedRef = useRef(0)
  const gameOverRef = useRef(false)

  useEffect(() => { activeWordsRef.current = activeWords }, [activeWords])
  useEffect(() => { missCountRef.current = missCount }, [missCount])
  useEffect(() => { wordsClearedRef.current = wordsCleared }, [wordsCleared])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        await fetch('/api/play/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score: scoreRef.current, player_data: {} })
        })
      }
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete])

  const scoreRef = useRef(0)

  const settingsRef = useRef({
    sound_gameover_id: settings?.sound_gameover_id,
    sound_correct_id: settings?.sound_correct_id,
    sound_wrong_id: settings?.sound_wrong_id,
    sound_combo_id: settings?.sound_combo_id,
  })
  useEffect(() => {
    settingsRef.current = {
      sound_gameover_id: settings?.sound_gameover_id,
      sound_correct_id: settings?.sound_correct_id,
      sound_wrong_id: settings?.sound_wrong_id,
      sound_combo_id: settings?.sound_combo_id,
    }
  }, [settings?.sound_gameover_id, settings?.sound_correct_id, settings?.sound_wrong_id, settings?.sound_combo_id])

  const spawnOne = useCallback(() => {
    const word = wordPool[Math.floor(Math.random() * wordPool.length)]
    const effSpeed = difficultyMode === 'progressive'
      ? baseFallSpeed + Math.floor(wordsClearedRef.current / 10) * 0.3
      : baseFallSpeed

    const newWord = {
      id: wordIdCounter.current++,
      text: word,
      x: 10 + Math.random() * 70,
      y: -5,
      speed: effSpeed * (0.8 + Math.random() * 0.4),
      cleared: false,
      missed: false,
    }
    setActiveWords(prev => [...prev, newWord])
  }, [wordPool, baseFallSpeed, difficultyMode])

  useEffect(() => {
    if (!gameActive || gameOver) return

    // Spawn initial words immediately
    for (let i = 0; i < Math.min(maxSimultaneous, 2); i++) {
      setTimeout(() => spawnOne(), i * 400)
    }

    // Game loop: move words down every frame
    const gameLoop = setInterval(() => {
      setActiveWords(prev => {
        let newMisses = 0
        const updated = prev.map(w => {
          if (w.cleared || w.missed) return w
          const newY = w.y + w.speed * 0.4
          if (newY >= 100) {
            newMisses++
            return { ...w, y: newY, missed: true }
          }
          return { ...w, y: newY }
        })

        if (newMisses > 0) {
          missCountRef.current += newMisses
          setMissCount(missCountRef.current)

          if (missCountRef.current >= maxMisses) {
            setGameOver(true)
            playSound(resolveSound(settingsRef.current.sound_gameover_id))
          }
          setCombo(0)
        }

        return updated.filter(w => w.y < 120)
      })
    }, 50)
    gameLoopRef.current = gameLoop

    // Spawn timer
    const spawnInterval = setInterval(() => {
      if (gameOverRef.current) return
      const active = activeWordsRef.current.filter(w => !w.cleared && !w.missed).length
      if (active < maxSimultaneous) {
        spawnOne()
      }
    }, Math.max(600, 2200 / baseFallSpeed))
    spawnTimerRef.current = spawnInterval

    return () => {
      clearInterval(gameLoop)
      clearInterval(spawnInterval)
    }
  }, [gameActive, gameOver, maxSimultaneous, baseFallSpeed, maxMisses, spawnOne])

  const handleStart = () => {
    setShowIntro(false)
    setGameActive(true)
    completedRef.current = false
    missCountRef.current = 0
    wordsClearedRef.current = 0
    gameOverRef.current = false
    setActiveWords([])
    setMissCount(0)
    setWordsCleared(0)
    setScore(0)
    setCombo(0)
    setCorrectCount(0)
    setTotalTyped(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase()
    setInputValue(val)
    if (val.length === 0) return

    let matched = false
    setActiveWords(prev => {
      const matchIdx = prev.findIndex(w => !w.cleared && !w.missed && w.text === val)
      if (matchIdx === -1) return prev

      matched = true
      const m = prev[matchIdx]
      const newCombo = combo + 1
      const multiplier = Math.min(newCombo, 10)
      const points = m.text.length * 10 * multiplier

      scoreRef.current += points
      setScore(scoreRef.current)
      setCombo(newCombo)
      setMaxCombo(mc => Math.max(mc, newCombo))
      setCorrectCount(c => c + 1)
      wordsClearedRef.current += 1
      setWordsCleared(wordsClearedRef.current)
      setTotalTyped(t => t + 1)
      setShowCorrectFlash(true)
      setTimeout(() => setShowCorrectFlash(false), 150)

      if (newCombo > 1 && newCombo % 5 === 0) {
        playSound(resolveSound(settingsRef.current.sound_combo_id))
        setComboFlashes(prev => [...prev.slice(-3), { id: Date.now(), text: `${newCombo}x COMBO!` }])
        setTimeout(() => setComboFlashes(prev => prev.slice(1)), 1500)
      } else {
        playSound(resolveSound(settingsRef.current.sound_correct_id))
      }

      if (targetWords > 0 && wordsClearedRef.current >= targetWords) {
        gameOverRef.current = true
        setGameOver(true)
      }

      return prev.map((w, i) => i === matchIdx ? { ...w, cleared: true } : w)
    })

    if (matched) {
      setTimeout(() => setInputValue(''), 0)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setInputValue('')
    if (e.key === 'Enter') {
      const hasMatch = activeWords.some(w => !w.cleared && !w.missed && (w.text === inputValue || w.text.startsWith(inputValue)))
      if (!hasMatch && inputValue.length > 0) {
        playSound(resolveSound(settingsRef.current.sound_wrong_id))
        setShowWrongFlash(true)
        setTimeout(() => setShowWrongFlash(false), 150)
        setTotalTyped(t => t + 1)
      }
    }
  }

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100

  useEffect(() => {
    if (gameActive && timeLimit > 0 && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            gameOverRef.current = true
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameActive, timeLimit])

  useEffect(() => {
    if (gameOver && !completedRef.current) {
      const elapsed = timeLimit - timeLeft
      const wpmCalc = elapsed > 0 ? Math.round((correctCount / elapsed) * 60) : 0
      setWpm(wpmCalc)
      setTimeout(() => handleComplete(), 1000)
    }
  }, [gameOver])

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh',background:bgColor,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
        <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.08)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Speed Typer'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'rgba(255,255,255,0.6)',marginBottom:8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize:13,color:settings?.heading_3_color||'rgba(255,255,255,0.4)',marginBottom:16 }}>{settings.heading_3}</p>}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20 }}>
            <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:12 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:4 }}>TIME</div><div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{timeLimit}s</div></div>
            <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:12 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:4 }}>SPEED</div><div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{baseFallSpeed}x</div></div>
            <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:12 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:4 }}>MISSES</div><div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{maxMisses}</div></div>
          </div>
          {targetWords > 0 && <p style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:16 }}>🎯 Type {targetWords} words to win</p>}
          <p style={{ fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:20 }}>{wordPool.length} words in pool | {difficultyMode} difficulty</p>
          <button onClick={handleStart} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 6px 20px ${primaryColor}44`,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Typing →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height:'100dvh',maxHeight:'100dvh',overflow:'hidden',background:bgColor,display:'flex',flexDirection:'column',fontFamily:ff,position:'relative',userSelect:'none',WebkitUserSelect:'none' }} onClick={() => inputRef.current?.focus()}>

      {comboFlashes.map(f => (
        <div key={f.id} style={{ position:'fixed',top:'30%',left:'50%',transform:'translate(-50%,-50%)',zIndex:100,fontSize:32,fontWeight:900,color:'#f59e0b',textShadow:'0 0 20px rgba(245,158,11,0.5)',animation:'comboFlash 1.5s ease forwards',pointerEvents:'none' }}>{f.text}</div>
      ))}
      {showCorrectFlash && <div style={{ position:'fixed',inset:0,background:`${primaryColor}15`,zIndex:50,pointerEvents:'none',animation:'flashFade 0.15s ease' }} />}
      {showWrongFlash && <div style={{ position:'fixed',inset:0,background:'rgba(239,68,68,0.15)',zIndex:50,pointerEvents:'none',animation:'flashFade 0.15s ease' }} />}

      {/* HUD */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',background:'rgba(0,0,0,0.3)',backdropFilter:'blur(10px)',zIndex:10,flexShrink:0 }}>
        <div style={{ display:'flex',gap:16,alignItems:'center' }}>
          <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>SCORE</div><div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{score}</div></div>
          <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>WPM</div><div style={{ fontSize:18,fontWeight:800,color:primaryColor }}>{wpm}</div></div>
          <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>COMBO</div><div style={{ fontSize:18,fontWeight:800,color:combo >= 5 ? '#f59e0b' : combo >= 3 ? '#22c55e' : '#fff' }}>{combo}x</div></div>
        </div>
        <div style={{ display:'flex',gap:16,alignItems:'center' }}>
          {targetWords > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>PROGRESS</div><div style={{ fontSize:18,fontWeight:800,color:'#22c55e' }}>{wordsCleared}/{targetWords}</div></div>}
          <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>MISSES</div><div style={{ fontSize:18,fontWeight:800,color:missCount >= maxMisses - 1 ? '#ef4444' : '#fff' }}>{missCount}/{maxMisses}</div></div>
          {timeLimit > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>TIME</div><div style={{ fontSize:18,fontWeight:800,color:timeLeft <= 10 ? '#ef4444' : '#fff' }}>{formatTime(timeLeft)}</div></div>}
        </div>
      </div>

      {/* Falling Words Area */}
      <div style={{ flex:1,position:'relative',overflow:'hidden',minHeight:0 }}>
        {activeWords.filter(w => !w.cleared && !w.missed).map(w => {
          const isPartial = inputValue.length > 0 && w.text.startsWith(inputValue) && inputValue.length < w.text.length
          const isFullMatch = inputValue === w.text
          return (
            <div key={w.id} style={{
              position:'absolute',left:`${w.x}%`,top:`${w.y}%`,
              transform:'translateX(-50%)',
              padding:'8px 18px',borderRadius:10,
              background: isFullMatch ? primaryColor : isPartial ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.12)',
              border: isPartial ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.15)',
              color: '#fff',fontSize:16,fontWeight:700,letterSpacing:2,
              fontFamily:ff,whiteSpace:'nowrap',
              textShadow: isPartial ? '0 0 10px rgba(34,197,94,0.5)' : 'none',
              boxShadow: isPartial ? '0 0 20px rgba(34,197,94,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {w.text.split('').map((ch, i) => (
                <span key={i} style={{ color: isPartial && i < inputValue.length ? '#22c55e' : '#fff' }}>{ch}</span>
              ))}
            </div>
          )
        })}
        {activeWords.filter(w => w.missed).map(w => (
          <div key={w.id} style={{
            position:'absolute',left:`${w.x}%`,top:`${Math.min(w.y, 95)}%`,
            transform:'translateX(-50%)',padding:'6px 14px',borderRadius:8,
            background:'rgba(239,68,68,0.3)',border:'1px solid rgba(239,68,68,0.4)',
            color:'#ef4444',fontSize:14,fontWeight:600,opacity:0.6,letterSpacing:1,
            textDecoration:'line-through',pointerEvents:'none',
          }}>{w.text}</div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(10px)',flexShrink:0,zIndex:10 }}>
        <div style={{ maxWidth:500,margin:'0 auto' }}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Type the falling words…"
            style={{
              width:'100%',padding:'14px 20px',borderRadius:14,
              border:`2px solid ${primaryColor}40`,background:'rgba(255,255,255,0.08)',
              color:'#fff',fontSize:20,fontWeight:600,textAlign:'center',
              fontFamily:'monospace',letterSpacing:3,outline:'none',
            }}
          />
          <div style={{ display:'flex',justifyContent:'center',gap:20,marginTop:6 }}>
            <span style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Accuracy: {accuracy}%</span>
            <span style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Words: {correctCount}</span>
            {combo > 1 && <span style={{ fontSize:11,color:'#f59e0b',fontWeight:700 }}>🔥 {combo}x combo!</span>}
          </div>
        </div>
      </div>

      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)' }}>
          <div style={{ background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:28,padding:'clamp(28px,7vw,44px) clamp(20px,6vw,36px)',maxWidth:400,width:'100%',textAlign:'center',backdropFilter:'blur(20px)' }}>
            <div style={{ fontSize:64,marginBottom:16 }}>{score > 500 ? '🏆' : score > 200 ? '🎯' : '⌨️'}</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#fff',marginBottom:20 }}>Game Over!</h2>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24 }}>
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:14 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>SCORE</div><div style={{ fontSize:24,fontWeight:800,color:primaryColor }}>{score}</div></div>
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:14 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>WPM</div><div style={{ fontSize:24,fontWeight:800,color:'#22c55e' }}>{wpm}</div></div>
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:14 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>MAX COMBO</div><div style={{ fontSize:24,fontWeight:800,color:'#f59e0b' }}>{maxCombo}x</div></div>
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:12,padding:14 }}><div style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>ACCURACY</div><div style={{ fontSize:24,fontWeight:800,color:'#fff' }}>{accuracy}%</div></div>
            </div>
            <p style={{ color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:20 }}>{wordsCleared} words typed | {missCount} missed</p>
            <button onClick={handleComplete} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 8px 28px ${primaryColor}55`,width:'100%' }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes comboFlash { 0%{opacity:1;transform:translate(-50%,-50%) scale(0.5)} 20%{transform:translate(-50%,-50%) scale(1.3)} 100%{opacity:0;transform:translate(-50%,-80%) scale(1)} }
        @keyframes flashFade { 0%{opacity:1} 100%{opacity:0} }
      `}</style>
    </div>
  )
}
