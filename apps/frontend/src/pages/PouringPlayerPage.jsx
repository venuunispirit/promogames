import { useState, useEffect, useRef, useCallback } from 'react'

function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

function useTimer(active, limitSeconds) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => { if (!active) return; const id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id) }, [active])
  const remaining = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : null
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return { elapsed, remaining, display: remaining !== null ? fmt(remaining) : fmt(elapsed) }
}

export default function PouringPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => {
    if (!id) return null
    const n = parseInt(id)
    return isNaN(n) ? id : (soundMapRef.current[n] || null)
  }, [])

  const primaryColor = settings?.primary_color || '#6366f1'
  const fontFamily = settings?.font_family || 'DM Sans'
  const ff = `'${fontFamily}', sans-serif`
  const waterColor = settings?.water_color || '#4da6ff'
  const targetMl = settings?.target_ml || 50
  const toleranceMl = settings?.tolerance_ml || 5
  const maxMl = settings?.max_ml || 200
  const pourSpeed = settings?.pour_speed || 1
  const viscosity = settings?.viscosity || 1
  const allowRetries = Number(settings?.allow_retries) === 1
  const maxRetries = settings?.max_retries || 3

  const [showIntro, setShowIntro] = useState(true)
  const [gamePhase, setGamePhase] = useState('idle') // idle, pouring, stopped, result
  const [currentMl, setCurrentMl] = useState(0)
  const [retriesLeft, setRetriesLeft] = useState(maxRetries)
  const [isPouring, setIsPouring] = useState(false)
  const [bottleTilt, setBottleTilt] = useState(0)
  const [result, setResult] = useState(null) // 'win' | 'lose'
  const [totalWon, setTotalWon] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [ripples, setRipples] = useState([])
  const completedRef = useRef(false)
  const pourIntervalRef = useRef(null)
  const [timerStarted, setTimerStarted] = useState(false)

  const { display: timerDisplay, remaining } = useTimer(timerStarted && !gameOver, settings?.time_limit_seconds || 0)

  useEffect(() => {
    if (remaining === 0 && !gameOver && timerStarted) { setGameOver(true); handleComplete() }
  }, [remaining, gameOver, timerStarted])

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      if (sessionToken) {
        await fetch('/api/play/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken, score: totalWon, player_data: {} })
        })
      }
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, totalWon])

  const startPouring = useCallback(() => {
    if (gamePhase === 'stopped' || gameOver) return
    setIsPouring(true)
    setBottleTilt(35)
    setGamePhase('pouring')
    playSound(resolveSound(settings?.sound_pour_id))

    const effectiveSpeed = pourSpeed / Math.max(viscosity * 0.5, 0.3)
    const tickMs = 30
    const mlPerTick = (effectiveSpeed * 0.8) * (tickMs / 1000) * 40

    pourIntervalRef.current = setInterval(() => {
      setCurrentMl(prev => {
        const next = prev + mlPerTick
        if (next >= maxMl) {
          clearInterval(pourIntervalRef.current)
          setIsPouring(false)
          setBottleTilt(0)
          setGamePhase('stopped')
          return maxMl
        }
        return Math.round(next * 10) / 10
      })
    }, tickMs)

    // Add splashes periodically
    const splashInterval = setInterval(() => {
      setShowSplash(true)
      setRipples(prev => [...prev.slice(-5), { id: Date.now(), x: 45 + Math.random() * 10 }])
      setTimeout(() => setShowSplash(false), 200)
    }, 150)
    pourIntervalRef.current._splash = splashInterval
  }, [gamePhase, gameOver, pourSpeed, viscosity, maxMl, settings, resolveSound])

  const stopPouring = useCallback(() => {
    if (!isPouring) return
    clearInterval(pourIntervalRef.current)
    if (pourIntervalRef.current._splash) clearInterval(pourIntervalRef.current._splash)
    setIsPouring(false)
    setBottleTilt(0)
    setGamePhase('stopped')

    const diff = Math.abs(currentMl - targetMl)
    const won = diff <= toleranceMl
    setResult(won ? 'win' : 'lose')
    setTotalAttempts(prev => prev + 1)

    if (won) {
      setTotalWon(prev => prev + 1)
      playSound(resolveSound(settings?.sound_correct_id))
    } else {
      playSound(resolveSound(settings?.sound_wrong_id))
    }
  }, [isPouring, currentMl, targetMl, toleranceMl, settings, resolveSound])

  const resetRound = useCallback(() => {
    setCurrentMl(0)
    setGamePhase('idle')
    setResult(null)
    setShowSplash(false)
    setRipples([])
  }, [])

  const handleRetries = useCallback(() => {
    if (!allowRetries) {
      setGameOver(true)
      handleComplete()
      return
    }
    if (retriesLeft <= 1) {
      setGameOver(true)
      handleComplete()
      return
    }
    setRetriesLeft(prev => prev - 1)
    resetRound()
  }, [allowRetries, retriesLeft, handleComplete, resetRound])

  const handleStart = () => { setShowIntro(false); setTimerStarted(true) }

  const fillPct = Math.min((currentMl / maxMl) * 100, 100)
  const targetPct = Math.min((targetMl / maxMl) * 100, 100)
  const winMin = targetMl - toleranceMl
  const winMax = targetMl + toleranceMl

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#f0f4ff' }

  if (showIntro) {
    return (
      <div style={{ minHeight:'100dvh', ...bgStyle, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 16px', fontFamily:ff }}>
        <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
          {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
          <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Pouring Water'}</h1>
          {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
          {settings?.heading_3 && <p style={{ fontSize:13,color:settings?.heading_3_color||'#888',marginBottom:16 }}>{settings.heading_3}</p>}
          <div style={{ background:`${primaryColor}12`,border:`2px solid ${primaryColor}30`,borderRadius:12,padding:16,marginBottom:20 }}>
            <p style={{ fontSize:18,fontWeight:800,color:primaryColor,marginBottom:4 }}>Target: {targetMl}ml</p>
            <p style={{ fontSize:13,color:'#666' }}>Tolerance: ±{toleranceMl}ml ({winMin}ml – {winMax}ml)</p>
            <p style={{ fontSize:12,color:'#999',marginTop:6 }}>Viscosity: {viscosity}x | Speed: {pourSpeed}x</p>
          </div>
          {allowRetries && <p style={{ fontSize:12,color:'#999',marginBottom:16 }}>🔄 {maxRetries} retries allowed</p>}
          {settings?.show_timer===1 && settings?.time_limit_seconds>0 && <p style={{ fontSize:12,color:'#999',marginBottom:16 }}>⏱ {Math.floor(settings.time_limit_seconds/60)}m {settings.time_limit_seconds%60}s</p>}
          <button onClick={handleStart} style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,boxShadow:`0 6px 20px ${primaryColor}44`,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px',userSelect:'none',WebkitUserSelect:'none' }}>
      {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ height:40,marginBottom:4,objectFit:'contain' }} />}
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Pouring Water'}</h2>

      <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12,flexWrap:'wrap',justifyContent:'center' }}>
        <div style={{ background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderRadius:12,padding:'8px 16px',display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:14,fontWeight:700,color:primaryColor }}>Target: {targetMl}ml</span>
          <span style={{ fontSize:12,color:'#888' }}>±{toleranceMl}ml</span>
        </div>
        {settings?.show_timer===1 && <div style={{ background:'rgba(255,255,255,0.85)',borderRadius:12,padding:'8px 16px' }}><span style={{ fontSize:12,color:'#888',fontWeight:600 }}>⏱ {timerDisplay}</span></div>}
        {allowRetries && <div style={{ background:'rgba(255,255,255,0.85)',borderRadius:12,padding:'8px 16px' }}><span style={{ fontSize:12,color:'#888' }}>🔄 {retriesLeft} left</span></div>}
        <div style={{ background:'rgba(255,255,255,0.85)',borderRadius:12,padding:'8px 16px' }}><span style={{ fontSize:12,fontWeight:700,color:primaryColor }}>Won: {totalWon}/{totalAttempts}</span></div>
      </div>

      {/* Main pouring area */}
      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'center',gap:24,margin:'20px 0',flex:1,minHeight:280 }}>
        {/* Bottle */}
        <div style={{ position:'relative',width:90,display:'flex',flexDirection:'column',alignItems:'center' }}>
          <div style={{
            width:60,height:140,
            borderRadius:'8px 8px 12px 12px',
            border:`3px solid ${waterColor}60`,
            background:`linear-gradient(180deg, rgba(255,255,255,0.3) 0%, ${waterColor}20 30%, ${waterColor}80 100%)`,
            position:'relative',
            overflow:'hidden',
            transformOrigin:'bottom center',
            transform:`rotate(${-bottleTilt}deg)`,
            transition: isPouring ? 'transform 0.3s ease' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
          }}>
            {/* Water inside bottle */}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,height:`${Math.max(0,fillPct)}%`,background:waterColor,transition:isPouring?'height 0.05s linear':'height 0.3s',opacity:0.85 }} />
            {/* Bottle neck */}
            <div style={{ position:'absolute',top:-20,left:'50%',transform:'translateX(-50%)',width:24,height:20,background:`${waterColor}30`,borderRadius:'4px 4px 0 0',border:`2px solid ${waterColor}40`,borderBottom:'none' }} />
            {/* Water pouring stream */}
            {isPouring && (
              <div style={{
                position:'absolute',top:15,right:-8,
                width:6,height:60,
                background:`linear-gradient(180deg, ${waterColor} 0%, ${waterColor}80 50%, ${waterColor}00 100%)`,
                borderRadius:4,
                animation:'pourStream 0.3s ease-in-out infinite alternate',
                transformOrigin:'top center',
                transform:`rotate(${bottleTilt * 0.5}deg)`,
              }} />
            )}
          </div>
          <span style={{ fontSize:10,color:'#999',marginTop:24 }}>Bottle</span>
        </div>

        {/* Tumbler */}
        <div style={{ position:'relative',width:110,display:'flex',flexDirection:'column',alignItems:'center' }}>
          <div style={{
            width:100,height:160,
            borderRadius:'6px 6px 16px 16px',
            border:'3px solid #d1d5db',
            background:'rgba(255,255,255,0.6)',
            position:'relative',
            overflow:'hidden',
            boxShadow:'0 4px 16px rgba(0,0,0,0.08)',
          }}>
            {/* Win zone marker */}
            <div style={{ position:'absolute',bottom:`${(winMin/maxMl)*100}%`,left:0,right:0,height:`${((winMax-winMin)/maxMl)*100}%`,background:`${primaryColor}15`,borderTop:`2px dashed ${primaryColor}40`,borderBottom:`2px dashed ${primaryColor}40`,zIndex:1 }}>
              <span style={{ position:'absolute',top:-8,right:2,fontSize:9,fontWeight:700,color:primaryColor }}>🎯</span>
            </div>
            {/* Water fill */}
            <div style={{
              position:'absolute',bottom:0,left:0,right:0,
              height:`${fillPct}%`,
              background:`linear-gradient(180deg, ${waterColor}90 0%, ${waterColor} 100%)`,
              transition: isPouring ? 'height 0.05s linear' : 'height 0.3s ease',
              borderRadius:'0 0 12px 12px',
              zIndex:2,
            }}>
              {/* Water surface wave */}
              {isPouring && (
                <div style={{ position:'absolute',top:-3,left:0,right:0,height:6,overflow:'hidden' }}>
                  <div style={{ width:'200%',height:'100%',background:`radial-gradient(ellipse at 30% 50%, ${waterColor}00, ${waterColor}60, ${waterColor}00)`,animation:'wave 0.6s linear infinite' }} />
                </div>
              )}
            </div>
            {/* ML markings */}
            {[25,50,75,100,150].filter(v=>v<=maxMl).map(v => (
              <div key={v} style={{ position:'absolute',bottom:`${(v/maxMl)*100}%`,left:4,right:4,height:1,background:'rgba(0,0,0,0.1)',zIndex:3 }}>
                <span style={{ position:'absolute',right:-30,top:-6,fontSize:9,color:'#aaa',fontWeight:600 }}>{v}ml</span>
              </div>
            ))}
            {/* Current amount display */}
            <div style={{ position:'absolute',bottom:4,left:0,right:0,textAlign:'center',zIndex:4 }}>
              <span style={{ fontSize:20,fontWeight:800,color:'#fff',textShadow:'0 1px 4px rgba(0,0,0,0.4)' }}>{Math.round(currentMl)}</span>
              <span style={{ fontSize:10,color:'rgba(255,255,255,0.8)',marginLeft:2 }}>ml</span>
            </div>
          </div>
          <span style={{ fontSize:10,color:'#999',marginTop:8 }}>Tumbler</span>
        </div>
      </div>

      {/* Action button */}
      <div style={{ width:'100%',maxWidth:360,marginBottom:20 }}>
        {gamePhase === 'idle' && (
          <button
            onMouseDown={startPouring}
            onMouseUp={stopPouring}
            onMouseLeave={stopPouring}
            onTouchStart={startPouring}
            onTouchEnd={stopPouring}
            style={{
              width:'100%',padding:'18px',borderRadius:16,
              background:`linear-gradient(135deg,${waterColor},${waterColor}cc)`,
              color:'#fff',border:'none',fontSize:18,fontWeight:800,cursor:'pointer',
              fontFamily:ff,boxShadow:`0 6px 24px ${waterColor}55`,
              touchAction:'none',
            }}
          >
            🖐️ Hold to Pour
          </button>
        )}

        {gamePhase === 'pouring' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32,fontWeight:900,color:waterColor,marginBottom:4 }}>{Math.round(currentMl)}ml</div>
            <button
              onMouseUp={stopPouring}
              onMouseLeave={stopPouring}
              onTouchEnd={stopPouring}
              style={{
                width:'100%',padding:'18px',borderRadius:16,
                background:`linear-gradient(135deg,${waterColor},${waterColor}cc)`,
                color:'#fff',border:'none',fontSize:18,fontWeight:800,cursor:'pointer',
                fontFamily:ff,boxShadow:`0 6px 24px ${waterColor}55`,
                touchAction:'none',animation:'pulse 0.8s ease-in-out infinite',
              }}
            >
              ⏹️ Release to Stop!
            </button>
          </div>
        )}

        {gamePhase === 'stopped' && result && (
          <div style={{ textAlign:'center' }}>
            <div style={{
              fontSize:48,marginBottom:8,
              animation:result==='win'?'bounceIn 0.5s ease':'shake 0.5s ease',
            }}>{result==='win'?'🎉':'😅'}</div>
            <div style={{
              fontSize:22,fontWeight:800,
              color:result==='win'?'#16a34a':'#dc2626',
              marginBottom:4,
            }}>
              {result==='win'?'Perfect Pour!':'Not Quite!'}
            </div>
            <p style={{ fontSize:14,color:'#666',marginBottom:4 }}>
              You poured <strong>{Math.round(currentMl)}ml</strong> (target: {targetMl}ml ±{toleranceMl}ml)
            </p>
            {result==='lose' && (
              <p style={{ fontSize:12,color:'#999',marginBottom:12 }}>
                {currentMl < targetMl ? `Need ${Math.round(targetMl-currentMl)}ml more` : `Poured ${Math.round(currentMl-targetMl)}ml too much`}
              </p>
            )}
            <div style={{ display:'flex',gap:8,justifyContent:'center',marginTop:12 }}>
              {allowRetries && retriesLeft > 1 && (
                <button onClick={() => { resetRound(); handleRetries() }} style={{
                  padding:'12px 28px',borderRadius:12,background:primaryColor,color:'#fff',border:'none',
                  fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:ff,
                }}>
                  🔄 Try Again ({retriesLeft-1} left)
                </button>
              )}
              <button onClick={() => { setGameOver(true); handleComplete() }} style={{
                padding:'12px 28px',borderRadius:12,background:'#f3f4f6',color:'#333',
                border:'1px solid #e5e7eb',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:ff,
              }}>
                {result==='win'?'Next Round →':'Finish →'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Win zone legend */}
      <div style={{ fontSize:11,color:'#999',textAlign:'center',marginBottom:12 }}>
        Win zone: <span style={{ color:primaryColor,fontWeight:700 }}>{winMin}ml – {winMax}ml</span> | Max: {maxMl}ml
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:'clamp(28px,7vw,44px) clamp(20px,6vw,36px)',maxWidth:400,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize:64,marginBottom:16 }}>{totalWon > 0 ? '🏆' : '💧'}</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>
              {totalWon > 0 ? 'Great Pouring!' : 'Keep Practicing!'}
            </h2>
            <p style={{ color:'#666',fontSize:14,marginBottom:24 }}>
              Won {totalWon} of {totalAttempts} attempts
            </p>
            <button onClick={handleComplete} style={{
              background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,
              color:'#fff',border:'none',borderRadius:50,padding:'14px 36px',
              fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,
              boxShadow:`0 8px 28px ${primaryColor}55`,width:'100%',
            }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pourStream { 0%{transform:rotate(${bottleTilt*0.4}deg) scaleY(0.9)} 100%{transform:rotate(${bottleTilt*0.6}deg) scaleY(1.1)} }
        @keyframes wave { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 6px 24px ${waterColor}55} 50%{transform:scale(1.02);box-shadow:0 8px 30px ${waterColor}88} }
        @keyframes bounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px) rotate(-3deg)} 30%{transform:translateX(8px) rotate(2deg)} 45%{transform:translateX(-6px)} 60%{transform:translateX(4px)} 75%{transform:translateX(-2px)} }
      `}</style>
    </div>
  )
}
