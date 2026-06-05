import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

/* ─── Wheel SVG ───────────────────────────────────────────────────────── */
function SpinWheel({ segments, rotation, spinning, settings, onSpin }) {
  const size   = Math.min(window.innerWidth - 48, 340)
  const cx     = size / 2
  const cy     = size / 2
  const r      = size / 2 - 6
  const total  = segments.reduce((s, seg) => s + (parseInt(seg.weight) || 1), 0)

  let startAngle = -Math.PI / 2
  const slices = segments.map(seg => {
    const w     = parseInt(seg.weight) || 1
    const sweep = (w / total) * 2 * Math.PI
    const endAngle = startAngle + sweep
    const mid   = startAngle + sweep / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = sweep > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    const tx = cx + (r * 0.62) * Math.cos(mid)
    const ty = cy + (r * 0.62) * Math.sin(mid)
    const angle = (mid * 180) / Math.PI
    const slice = { d, tx, ty, angle, color: seg.bg_color || '#7C6FF7', textColor: seg.text_color || '#fff', label: seg.label }
    startAngle = endAngle
    return slice
  })

  const btnR    = size * 0.115
  const center  = settings?.center_color  || '#1F2937'
  const pointer = settings?.pointer_color || '#EF4444'
  const label   = settings?.center_label  || 'SPIN'

  return (
    <div style={{ position: 'relative', width: size, height: size + 24, margin: '0 auto', flexShrink: 0 }}>
      {/* pointer arrow */}
      <div style={{
        position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>
        <svg width="28" height="34" viewBox="0 0 28 34">
          <polygon points="14,2 2,28 14,22 26,28" fill={pointer} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>

      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${spinning}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))',
          display: 'block',
        }}
      >
        {/* outer ring */}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" />
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.d} fill={s.color} stroke={settings?.wheel_bg_color || '#fff'} strokeWidth="2" />
            <text
              x={s.tx} y={s.ty}
              textAnchor="middle" dominantBaseline="middle"
              fill={s.textColor}
              fontSize={Math.max(8, Math.min(13, size / 26))}
              fontWeight="800"
              transform={`rotate(${s.angle + 90}, ${s.tx}, ${s.ty})`}
              style={{ pointerEvents: 'none', fontFamily: 'inherit' }}
            >
              {s.label.length > 11 ? s.label.slice(0, 10) + '…' : s.label}
            </text>
          </g>
        ))}

        {/* center button */}
        <circle cx={cx} cy={cy} r={btnR + 6} fill="rgba(255,255,255,0.25)" />
        <circle cx={cx} cy={cy} r={btnR} fill={center} stroke="#fff" strokeWidth="4"
          style={{ cursor: spinning ? 'not-allowed' : 'pointer' }}
          onClick={!spinning ? onSpin : undefined}
        />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff"
          fontSize={size * 0.065} fontWeight="900" style={{ pointerEvents: 'none', fontFamily: 'inherit', letterSpacing: 1 }}>
          {label}
        </text>
      </svg>
    </div>
  )
}

/* ─── Result Overlay ──────────────────────────────────────────────────── */
function ResultOverlay({ segment, settings, onClose }) {
  const isPrize = segment.segment_type === 'prize'
  const emoji   = isPrize ? '🎉' : segment.segment_type === 'try_again' ? '🔄' : '😔'
  const msg     = isPrize ? (settings?.win_message || 'Congratulations! You won!') : (settings?.lose_message || 'Better luck next time!')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn .3s ease'
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}} @keyframes popIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{
        background: '#fff', borderRadius: 24, padding: 36, maxWidth: 380, width: '100%',
        textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'popIn .35s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'inherit',
      }}>
        {segment.overlay_image_url
          ? <img src={segment.overlay_image_url} alt="" style={{ width: '100%', borderRadius: 14, marginBottom: 20, objectFit: 'contain', maxHeight: 200 }} />
          : <div style={{ fontSize: 60, marginBottom: 16 }}>{emoji}</div>
        }

        <div style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 20,
          background: segment.bg_color || '#7C6FF7', color: segment.text_color || '#fff',
          fontWeight: 800, fontSize: 18, marginBottom: 14
        }}>{segment.label}</div>

        <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 12px', lineHeight: 1.5 }}>{msg}</p>

        {segment.prize_description && (
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>{segment.prize_description}</p>
        )}

        {segment.coupon_code && (
          <div style={{
            background: '#F9FAFB', border: '2px dashed #D1D5DB', borderRadius: 12,
            padding: '14px 20px', marginBottom: 20
          }}>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>YOUR COUPON CODE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1F2937', letterSpacing: 3, fontFamily: 'monospace' }}>
              {segment.coupon_code}
            </div>
          </div>
        )}

        {segment.coupon_image_url && (
          <img src={segment.coupon_image_url} alt="coupon" style={{ width: '80%', borderRadius: 10, marginBottom: 16 }} />
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: segment.bg_color || '#7C6FF7', color: segment.text_color || '#fff',
            fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          {isPrize ? '🎊 Claim Reward' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

/* ─── Confetti ────────────────────────────────────────────────────────── */
function Confetti() {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: 6 + Math.random() * 8,
      d: Math.random() * 90,
      color: ['#7C6FF7','#F59E0B','#EC4899','#10B981','#3B82F6','#EF4444'][Math.floor(Math.random() * 6)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0, tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    }))
    let frame
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        p.tiltAngle += p.tiltAngleIncrement
        p.y += (Math.cos(p.d) + 1.5)
        p.tilt = Math.sin(p.tiltAngle) * 15
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
        ctx.beginPath()
        ctx.lineWidth = p.r / 2
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4)
        ctx.stroke()
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }} />
}

/* ─── Main SpinPlayerPage ─────────────────────────────────────────────── */
export default function SpinPlayerPage({ gameData, sessionToken: initToken, sessionId: initSessionId, onSessionStart, onComplete }) {
  const [phase,         setPhase]         = useState('ready') // ready | spinning | result | done
  const [rotation,      setRotation]      = useState(0)
  const [spinDuration,  setSpinDuration]  = useState(null)
  const [resultSegment, setResultSegment] = useState(null)
  const [sessionToken,  setSessionToken]  = useState(initToken)
  const [sessionId,     setSessionId]     = useState(initSessionId)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [errorMsg,      setErrorMsg]      = useState(null)
  const spinLock = useRef(false)
  const currentRotation = useRef(0)

  const settings  = gameData?.settings  || {}
  const segments  = gameData?.segments  || []
  const soundMap  = gameData?.soundMap  || {}

  const resolveSound = (id) => {
    if (!id) return null
    const n = parseInt(id)
    if (!isNaN(n)) return soundMap[n] || null
    return id
  }

  const playSound = (url) => {
    if (!url) return
    try { new Audio(url).play().catch(() => {}) } catch (_) {}
  }

  /* ── Pick winner by weight ── */
  const pickWinner = useCallback(() => {
    if (!segments.length) return null
    const total = segments.reduce((s, seg) => s + (parseInt(seg.weight) || 1), 0)
    let rand = Math.random() * total
    for (let i = 0; i < segments.length; i++) {
      rand -= (parseInt(segments[i].weight) || 1)
      if (rand <= 0) return i
    }
    return segments.length - 1
  }, [segments])

  /* ── Calculate target rotation to land on segment i ── */
  const segmentRotation = useCallback((winnerIdx) => {
    const total = segments.reduce((s, seg) => s + (parseInt(seg.weight) || 1), 0)
    let startFrac = 0
    for (let i = 0; i < winnerIdx; i++) {
      startFrac += (parseInt(segments[i].weight) || 1) / total
    }
    const midFrac = startFrac + (parseInt(segments[winnerIdx].weight) || 1) / total / 2
    // the wheel starts at -90deg (top). We want midFrac to land at top (pointer).
    // segment at angle (midFrac * 360 - 90) should end up at 0 (pointer at top)
    const segMidDeg = midFrac * 360  // degrees from start
    // we need to rotate so that segMidDeg aligns with the pointer (which is at top = 0 after accounting for -90 start)
    // extra spins for drama: 5–8 full rotations
    const extra = (5 + Math.floor(Math.random() * 4)) * 360
    return extra + (360 - segMidDeg)
  }, [segments])

  /* ── Spin ── */
  const handleSpin = async () => {
    if (spinLock.current || phase !== 'ready') return
    spinLock.current = true

    // If no session yet, create one
    let token = sessionToken
    let sid   = sessionId
    if (!token) {
      try {
        const playerUser = JSON.parse(localStorage.getItem('playerUser') || '{}')
        const src = new URLSearchParams(window.location.search).get('source') === 'direct' ? 'direct' : 'link'
        const res = await api.post('/play/session/start', {
          game_id: gameData.id,
          player_data: {},
          source_type: src,
          promo_player_id: playerUser.id || null,
        })
        if (!res.data.success) {
          if (res.data.message === 'already_played') {
            setAlreadyPlayed(true)
            spinLock.current = false
            return
          }
          throw new Error(res.data.message)
        }
        token = res.data.session_token
        sid   = res.data.session_id
        setSessionToken(token)
        setSessionId(sid)
        if (onSessionStart) onSessionStart(token, sid)
      } catch (err) {
        setErrorMsg(err.message || 'Could not start game')
        spinLock.current = false
        return
      }
    }

    const winnerIdx = pickWinner()
    if (winnerIdx === null) { spinLock.current = false; return }

    const winner  = segments[winnerIdx]
    const addDeg  = segmentRotation(winnerIdx)
    const finalRot = currentRotation.current + addDeg
    const duration = 3800 + Math.random() * 1200

    playSound(resolveSound(settings.sound_spin_id))
    setPhase('spinning')
    setSpinDuration(duration)
    setRotation(finalRot)
    currentRotation.current = finalRot % 360

    // After spin completes
    setTimeout(async () => {
      setSpinDuration(null)
      setResultSegment(winner)
      setPhase('result')
      playSound(resolveSound(winner.sound_id || (winner.segment_type === 'prize' ? settings.sound_win_id : settings.sound_lose_id)))

      // Complete session
      try {
        const res = await api.post('/play/session/complete', {
          session_token: token,
          score: winner.segment_type === 'prize' ? 1 : 0,
          player_data: {
            segment_id: winner.id,
            segment_label: winner.label,
            segment_type: winner.segment_type,
            coupon_code: winner.coupon_code || null,
            prize_description: winner.prize_description || null,
          }
        })
        if (onComplete && res.data) {
          // Store for after overlay close
          window.__spinCompleteData = res.data
        }
      } catch (_) {}

      spinLock.current = false
    }, duration + 100)
  }

  const handleResultClose = () => {
    const data = window.__spinCompleteData || {}
    if (settings.spin_mode === 'unlimited') {
      // Reset for another spin
      window.__spinCompleteData = null
      setResultSegment(null)
      setPhase('ready')
    } else {
      if (onComplete) onComplete({ ...data, redirect_url: gameData.redirect_url })
      else setPhase('done')
    }
  }

  const primaryColor = settings.primary_color || '#7C6FF7'
  const bgStyle = settings.bg_image_url
    ? { backgroundImage: `url(${settings.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: settings.bg_color || '#F8F8FF' }

  const font = settings.font_family ? `'${settings.font_family}', sans-serif` : "'DM Sans', sans-serif"

  if (alreadyPlayed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...bgStyle, fontFamily: font }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎡</div>
          <h2 style={{ margin: '0 0 10px', fontWeight: 800 }}>Already Played!</h2>
          <p style={{ color: '#6B7280', margin: 0 }}>You've already spun this wheel. Come back for more games!</p>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...bgStyle, fontFamily: font }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
          <p style={{ color: '#374151' }}>{errorMsg}</p>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...bgStyle, fontFamily: font }}>
        <Confetti />
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 360, position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎊</div>
          <h2 style={{ margin: '0 0 10px', fontWeight: 800 }}>Thanks for playing!</h2>
          <p style={{ color: '#6B7280' }}>Check out more games from this brand.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...bgStyle, fontFamily: font, padding: '24px 16px' }}>
      {/* Brand logos */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 420, marginBottom: 20 }}>
        {settings.game_logo_url && (
          <img src={settings.game_logo_url} alt="Game logo" style={{ height: 44, objectFit: 'contain', borderRadius: 8 }} />
        )}
        {gameData.client_logo && (
          <img src={gameData.client_logo} alt="Brand logo" style={{ height: 40, objectFit: 'contain', marginLeft: 'auto' }} />
        )}
      </div>

      {/* Headings */}
      {(settings.heading_1 || settings.heading_2) && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {settings.heading_1 && (
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: primaryColor, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {settings.heading_1}
            </h1>
          )}
          {settings.heading_2 && (
            <h2 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>
              {settings.heading_2}
            </h2>
          )}
        </div>
      )}

      {/* Description */}
      {settings.description_text && (
        <p style={{ textAlign: 'center', maxWidth: 340, margin: '0 0 20px', color: 'rgba(0,0,0,0.55)', fontSize: 14, lineHeight: 1.5 }}>
          {settings.description_text}
        </p>
      )}

      {/* Wheel */}
      {segments.length > 0 ? (
        <SpinWheel
          segments={segments}
          rotation={rotation}
          spinning={phase === 'spinning' ? spinDuration : null}
          settings={settings}
          onSpin={handleSpin}
        />
      ) : (
        <div style={{ width: 280, height: 280, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>
          No segments configured
        </div>
      )}

      {/* Spin button (outside wheel for accessibility) */}
      {segments.length > 0 && (
        <button
          onClick={handleSpin}
          disabled={phase !== 'ready'}
          style={{
            marginTop: 28, padding: '16px 48px', borderRadius: 50, border: 'none',
            background: phase !== 'ready' ? '#D1D5DB' : primaryColor,
            color: '#fff', fontSize: 18, fontWeight: 900, cursor: phase !== 'ready' ? 'not-allowed' : 'pointer',
            boxShadow: phase === 'ready' ? `0 6px 24px ${primaryColor}55` : 'none',
            transition: 'all .2s', fontFamily: 'inherit',
            transform: phase === 'ready' ? 'none' : 'scale(0.97)',
            letterSpacing: 1,
          }}
        >
          {phase === 'spinning' ? '🎡 Spinning…' : '🎡 SPIN!'}
        </button>
      )}

      {settings.spin_mode === 'unlimited' && phase === 'ready' && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>Spin as many times as you like!</div>
      )}

      {/* Result overlay */}
      {phase === 'result' && resultSegment && (
        <ResultOverlay segment={resultSegment} settings={settings} onClose={handleResultClose} />
      )}
    </div>
  )
}
