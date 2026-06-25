import { useState, useEffect, useRef, useCallback } from 'react'
function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const WORD_LIST = ['javascript','programming','developer','keyboard','algorithm','function','variable','database','network','browser','terminal','package','module','export','import','react','angular','python','docker','kubernetes','typescript','webpack','github','deploy','server','cloud','api','json','html','css','bootstrap','jquery','nodejs','mongodb','mysql','redis','nginx','linux','windows','macos']

function scramble(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('') === word ? scramble(word) : arr.join('')
}

export default function WordScramblePlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])
  const ff = `'${settings?.font_family || 'DM Sans'}', sans-serif`
  const primaryColor = settings?.primary_color || '#8b5cf6'
  const totalRounds = settings?.rounds || 10
  const timePerWord = settings?.time_per_word || 30

  const [showIntro, setShowIntro] = useState(true)
  const [words, setWords] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [scrambledWord, setScrambledWord] = useState('')
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(timePerWord)
  const [gameOver, setGameOver] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [resultMsg, setResultMsg] = useState('')
  const timerRef = useRef(null)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async (finalScore) => {
    if (completedRef.current) return; completedRef.current = true
    try {
      if (sessionToken) await fetch('/api/play/session/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, score: finalScore, player_data: { words: totalRounds, score: finalScore } })
      })
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, totalRounds])

  const startGame = () => {
    const selected = []
    const pool = [...WORD_LIST]
    for (let i = 0; i < totalRounds && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      selected.push(pool.splice(idx, 1)[0])
    }
    setWords(selected); setCurrentRound(0); setScore(0); setGameOver(false); completedRef.current = false
    setScrambledWord(scramble(selected[0])); setShowIntro(false); setUserInput(''); setTimer(timePerWord); setShowHint(false); setResultMsg('')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); nextRound(0); return 0 }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const nextRound = (currentScore) => {
    if (currentRound + 1 >= totalRounds) {
      clearInterval(timerRef.current); setGameOver(true)
      setTimeout(() => handleComplete(currentScore), 1500)
    } else {
      setCurrentRound(r => r + 1)
      const nextWord = words[currentRound + 1]
      setScrambledWord(scramble(nextWord)); setUserInput(''); setTimer(timePerWord); setShowHint(false); setResultMsg('')
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { clearInterval(timerRef.current); nextRound(currentScore); return 0 }
          return t - 1
        })
      }, 1000)
    }
  }

  const checkAnswer = () => {
    if (!userInput.trim()) return
    clearInterval(timerRef.current)
    const correct = words[currentRound]
    if (userInput.toLowerCase() === correct.toLowerCase()) {
      const bonus = timer * 10
      const newScore = score + 100 + bonus
      setScore(newScore); setResultMsg(`✅ Correct! +${100 + bonus} pts`)
      playSound(resolveSound(settings?.sound_correct_id))
      setTimeout(() => nextRound(newScore), 1000)
    } else {
      setResultMsg(`❌ Wrong! It was "${correct}"`)
      playSound(resolveSound(settings?.sound_wrong_id))
      setTimeout(() => nextRound(score), 1500)
    }
  }

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#0f172a' }

  if (showIntro) return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
      <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
        <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Word Scramble'}</h1>
        {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
        <div style={{ background:'#F5F3FF',borderRadius:12,padding:16,marginBottom:20 }}>
          <p style={{ fontSize:13,color:'#6D28D9',lineHeight:1.6 }}>🔤 Unscramble the letters to find the hidden word. You have {timePerWord} seconds per word!</p>
        </div>
        <button onClick={startGame} style={{ background:settings?.start_button_bg_color||`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:settings?.start_button_text_color||'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Game →'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Word Scramble'}</h2>
      <div style={{ display:'flex',gap:12,marginBottom:12 }}>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>Round: {currentRound+1}/{totalRounds}</span>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#f59e0b' }}>Score: {score}</span>
        <span style={{ background:timer<=5?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:timer<=5?'#ef4444':'#fff' }}>⏱ {timer}s</span>
      </div>

      <div style={{ background:'rgba(255,255,255,0.1)',borderRadius:16,padding:24,textAlign:'center',marginBottom:16,width:'100%',maxWidth:400 }}>
        <p style={{ fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8 }}>Unscramble this word:</p>
        <h3 style={{ fontSize:32,fontWeight:800,color:'#f59e0b',letterSpacing:8,marginBottom:16,fontFamily:'monospace' }}>{scrambledWord.toUpperCase()}</h3>
        {showHint && <p style={{ fontSize:14,color:'#22c55e',marginBottom:12 }}>💡 Hint: {words[currentRound][0]}{Array(words[currentRound].length-1).fill('*').join('')}</p>}
        <div style={{ display:'flex',gap:8,marginBottom:12 }}>
          <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key==='Enter' && checkAnswer()}
            placeholder="Type your answer..." disabled={!!resultMsg}
            style={{ flex:1,padding:'12px 16px',borderRadius:12,border:'2px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:16,fontWeight:600,fontFamily:ff,outline:'none' }} />
          <button onClick={checkAnswer} disabled={!!resultMsg || !userInput.trim()} style={{
            padding:'12px 20px',borderRadius:12,border:'none',background:primaryColor,color:'#fff',fontSize:16,fontWeight:700,cursor:'pointer',
          }}>✓</button>
        </div>
        {!showHint && !resultMsg && <button onClick={() => setShowHint(true)} style={{ background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13 }}>💡 Need a hint? (-50 pts)</button>}
        {resultMsg && <p style={{ fontSize:16,fontWeight:700,color:resultMsg.startsWith('✅')?'#22c55e':'#ef4444',marginTop:8 }}>{resultMsg}</p>}
      </div>

      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>Game Over!</h2>
            <p style={{ color:'#666',fontSize:16,marginBottom:20 }}>Final Score: <strong>{score}</strong></p>
            <button onClick={() => handleComplete(score)} style={{ background:settings?.continue_button_bg_color||primaryColor,color:settings?.continue_button_text_color||'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
