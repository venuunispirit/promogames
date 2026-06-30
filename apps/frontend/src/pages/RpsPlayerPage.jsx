import { useState, useEffect, useRef, useCallback } from 'react'
function playSound(url) { if (!url) return; try { const a = new Audio(url); a.play().catch(() => {}) } catch {} }

const CHOICES = [
  { name: 'rock', emoji: '🪨', beats: 'scissors' },
  { name: 'paper', emoji: '📄', beats: 'rock' },
  { name: 'scissors', emoji: '✂️', beats: 'paper' },
]

export default function RpsPlayerPage({ gameData, sessionToken, onComplete }) {
  const { settings, soundMap } = gameData
  const soundMapRef = useRef(soundMap || {})
  const resolveSound = useCallback((id) => { if (!id) return null; const n = parseInt(id); return isNaN(n) ? id : (soundMapRef.current[n] || null) }, [])
  const ff = `'${settings?.font_family || 'DM Sans'}', sans-serif`
  const primaryColor = settings?.primary_color || '#ef4444'
  const totalRounds = settings?.rounds || 5
  const difficulty = settings?.difficulty || 'medium'

  const [showIntro, setShowIntro] = useState(true)
  const [currentRound, setCurrentRound] = useState(0)
  const [playerChoice, setPlayerChoice] = useState(null)
  const [aiChoice, setAiChoice] = useState(null)
  const [result, setResult] = useState(null) // 'win', 'lose', 'draw'
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async (score) => {
    if (completedRef.current) return; completedRef.current = true
    try {
      if (sessionToken) await fetch('/api/play/session/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken, score, player_data: { wins, losses, rounds: totalRounds } })
      })
    } catch {}
    onComplete?.()
  }, [sessionToken, onComplete, wins, losses, totalRounds])

  const startGame = () => { setShowIntro(false); setCurrentRound(0); setWins(0); setLosses(0); setGameOver(false); completedRef.current = false }

  const getAiChoice = () => {
    if (difficulty === 'easy') return CHOICES[Math.floor(Math.random() * 3)]
    if (difficulty === 'hard') {
      const loseTo = CHOICES.find(c => c.beats === 'rock')
      return Math.random() > 0.6 ? loseTo : CHOICES[Math.floor(Math.random() * 3)]
    }
    return CHOICES[Math.floor(Math.random() * 3)]
  }

  const play = (choice) => {
    const ai = getAiChoice()
    setPlayerChoice(choice); setAiChoice(ai)
    let r = 'draw'
    if (choice.beats === ai.beats) r = 'win'
    else if (ai.beats === choice.name) r = 'lose'
    setResult(r); setShowResult(true)

    if (r === 'win') { setWins(w => w + 1); playSound(resolveSound(settings?.sound_win_id)) }
    else if (r === 'lose') { setLosses(l => l + 1); playSound(resolveSound(settings?.sound_lose_id)) }
    else playSound(resolveSound(settings?.sound_draw_id))

    setTimeout(() => {
      setShowResult(false); setPlayerChoice(null); setAiChoice(null); setResult(null)
      if (currentRound + 1 >= totalRounds) {
        const finalWins = r === 'win' ? wins + 1 : wins
        const score = finalWins * 200
        setGameOver(true)
        setTimeout(() => handleComplete(score), 1500)
      } else {
        setCurrentRound(rnd => rnd + 1)
      }
    }, 1500)
  }

  const bgStyle = settings?.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings?.bg_color || '#0f172a' }

  if (showIntro) return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px',fontFamily:ff }}>
      <div style={{ width:'100%',maxWidth:440,padding:'clamp(24px,6vw,36px)',borderRadius:28,background:'rgba(255,255,255,0.93)',backdropFilter:'blur(28px)',boxShadow:'0 8px 40px rgba(0,0,0,0.12)',textAlign:'center' }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="" style={{ maxWidth:'100%',maxHeight:60,marginBottom:16,objectFit:'contain' }} />}
        <h1 style={{ fontSize:'clamp(22px,6vw,30px)',fontWeight:800,color:settings?.heading_1_color||'#1a1a2e',marginBottom:8,fontFamily:ff }}>{settings?.heading_1||'Rock Paper Scissors'}</h1>
        {settings?.heading_2 && <p style={{ fontSize:15,fontWeight:600,color:settings?.heading_2_color||'#666',marginBottom:8 }}>{settings.heading_2}</p>}
        <div style={{ background:'#FEE2E2',borderRadius:12,padding:16,marginBottom:20 }}>
          <p style={{ fontSize:13,color:'#991B1B',lineHeight:1.6 }}>✊ Rock beats Scissors, Scissors beats Paper, Paper beats Rock. Beat the AI {totalRounds} times!</p>
        </div>
        <button onClick={startGame} style={{ background:settings?.start_button_bg_color||`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`,color:settings?.start_button_text_color||'#fff',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:ff,width:'100%',maxWidth:280 }}>{settings?.start_button_text||'Start Game →'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh',...bgStyle,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:ff,padding:'12px 16px' }}>
      <h2 style={{ fontSize:18,fontWeight:800,color:settings?.heading_1_color||'#fff',marginBottom:4,textAlign:'center' }}>{settings?.heading_1||'Rock Paper Scissors'}</h2>
      <div style={{ display:'flex',gap:12,marginBottom:16 }}>
        <span style={{ background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#fff' }}>Round: {currentRound+1}/{totalRounds}</span>
        <span style={{ background:'rgba(34,197,94,0.2)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#22c55e' }}>W: {wins}</span>
        <span style={{ background:'rgba(239,68,68,0.2)',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,color:'#ef4444' }}>L: {losses}</span>
      </div>

      {!showResult ? (
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:16,color:'rgba(255,255,255,0.7)',marginBottom:24 }}>Choose your weapon!</p>
          <div style={{ display:'flex',gap:20,justifyContent:'center' }}>
            {CHOICES.map(choice => (
              <button key={choice.name} onClick={() => play(choice)} style={{
                width:100,height:100,borderRadius:20,border:'3px solid rgba(255,255,255,0.2)',
                background:'rgba(255,255,255,0.1)',fontSize:40,cursor:'pointer',transition:'all 0.2s',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,
              }}
              onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.borderColor=primaryColor }}
              onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}>
                {choice.emoji}
                <span style={{ fontSize:12,color:'rgba(255,255,255,0.6)',fontWeight:600 }}>{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex',gap:40,alignItems:'center',justifyContent:'center',marginBottom:24 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8 }}>You</p>
              <div style={{ fontSize:64 }}>{playerChoice?.emoji}</div>
            </div>
            <div style={{ fontSize:24,color:'rgba(255,255,255,0.5)',fontWeight:800 }}>VS</div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8 }}>AI</p>
              <div style={{ fontSize:64 }}>{aiChoice?.emoji}</div>
            </div>
          </div>
          <div style={{ fontSize:28,fontWeight:800,color:result==='win'?'#22c55e':result==='lose'?'#ef4444':'#f59e0b',marginBottom:8 }}>
            {result==='win'?'🎉 You Win!':result==='lose'?'😔 You Lose!':'🤝 Draw!'}
          </div>
        </div>
      )}

      {gameOver && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff',borderRadius:28,padding:36,maxWidth:360,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:56,marginBottom:12 }}>{wins>losses?'🏆':wins===losses?'🤝':'💪'}</div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:8 }}>Game Over!</h2>
            <p style={{ color:'#666',fontSize:14,marginBottom:4 }}>Wins: {wins} | Losses: {losses}</p>
            <p style={{ color:'#999',fontSize:13,marginBottom:20 }}>Score: {wins * 200}</p>
            <button onClick={() => handleComplete(wins * 200)} style={{ background:settings?.continue_button_bg_color||primaryColor,color:settings?.continue_button_text_color||'#fff',border:'none',borderRadius:50,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',width:'100%' }}>{settings?.continue_button_text||'Continue →'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
