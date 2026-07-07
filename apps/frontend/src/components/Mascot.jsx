import { useState, useEffect, useRef } from 'react'

export default function Mascot({
  variant = 'main',
  mouseX,
  mouseY,
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
  loginFailed = false,
  loginSuccess = false,
  hasEntered = false,
  style = {},
}) {
  const containerRef = useRef(null)
  const [blink, setBlink] = useState(false)
  const [tilt, setTilt] = useState(0)
  const [floatY, setFloatY] = useState(0)
  const [peeking, setPeeking] = useState(false)
  const peekTimeout = useRef(null)
  const floatRef = useRef(null)

  // Blink
  useEffect(() => {
    let t
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 180)
      }, 2500 + Math.random() * 4000)
    }
    schedule()
    return () => clearTimeout(t)
  }, [])

  // Floating animation
  useEffect(() => {
    let start = performance.now()
    const speed = variant === 'main' ? 0.0015 : variant === 'small' ? 0.002 : 0.0018
    const amp = variant === 'main' ? 8 : variant === 'small' ? 5 : 4
    const offset = variant === 'main' ? 0 : variant === 'small' ? 1000 : 2000
    const animate = (now) => {
      setFloatY(Math.sin((now + offset) * speed) * amp)
      floatRef.current = requestAnimationFrame(animate)
    }
    floatRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(floatRef.current)
  }, [variant])

  // Mouse tilt
  useEffect(() => {
    if (!hasEntered || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const dx = mouseX - cx
    setTilt(Math.max(-8, Math.min(8, dx / 40)))
  }, [mouseX, hasEntered])

  // Peek when password visible
  useEffect(() => {
    if (passwordLength > 0 && showPassword && variant === 'main') {
      const schedule = () => {
        peekTimeout.current = setTimeout(() => {
          setPeeking(true)
          setTimeout(() => setPeeking(false), 900)
          schedule()
        }, 2500 + Math.random() * 3000)
      }
      schedule()
      return () => { clearTimeout(peekTimeout.current); setPeeking(false) }
    }
    setPeeking(false)
    clearTimeout(peekTimeout.current)
  }, [passwordLength, showPassword, variant])

  const configs = {
    main: { size: 280, eyeSize: 28, eyeGap: 52, eyeTop: '38%', eyeLeft: '50%', pupilMax: 6 },
    small: { size: 180, eyeSize: 20, eyeGap: 34, eyeTop: '36%', eyeLeft: '50%', pupilMax: 4 },
    tiny: { size: 130, eyeSize: 15, eyeGap: 24, eyeTop: '35%', eyeLeft: '50%', pupilMax: 3 },
  }
  const c = configs[variant] || configs.main

  // Eye tracking
  const [lookX, setLookX] = useState(0)
  const [lookY, setLookY] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height * 0.4
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const scale = dist > 0 ? Math.min(c.pupilMax, dist / 30) / dist : 0
    setLookX(dx * scale)
    setLookY(dy * scale)
  }, [mouseX, mouseY, c.pupilMax])

  const forceX = loginSuccess ? 0 : (passwordLength > 0 && showPassword) ? (peeking ? 6 : -6) : undefined
  const forceY = loginSuccess ? -3 : (passwordLength > 0 && showPassword) ? (peeking ? 8 : -6) : undefined

  const eyeX = forceX !== undefined ? forceX : lookX
  const eyeY = forceY !== undefined ? forceY : lookY

  // Tilt body on typing
  const bodyTilt = isTyping ? tilt + (variant === 'main' ? -5 : -3) : tilt

  // Error shake
  const shakeStyle = loginFailed ? {
    animation: 'mascot-shake 0.4s ease',
  } : {}

  // Success bounce
  const successStyle = loginSuccess ? {
    animation: 'mascot-bounce 0.6s ease',
  } : {}

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: c.size,
        height: c.size,
        transform: `translateY(${floatY}px) rotate(${bodyTilt}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        opacity: hasEntered ? 1 : 0,
        ...shakeStyle,
        ...successStyle,
        ...style,
      }}
    >
      {/* Mascot image */}
      <img
        src="/mascot.jpeg"
        alt="PromoGames Mascot"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: `drop-shadow(0 12px 32px rgba(139,92,246,0.3))`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Animated eyes overlay */}
      <div style={{
        position: 'absolute',
        top: c.eyeTop,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: c.eyeGap - c.eyeSize,
        pointerEvents: 'none',
      }}>
        {/* Left eye */}
        <div style={{
          width: c.eyeSize,
          height: c.eyeSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #c084fc 0%, #7c3aed 60%, #4c1d95 100%)',
          boxShadow: '0 0 12px rgba(139,92,246,0.6), inset 0 0 6px rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scaleY(${blink ? 0.1 : 1})`,
          transition: 'transform 0.12s ease',
        }}>
          <div style={{
            width: c.eyeSize * 0.45,
            height: c.eyeSize * 0.45,
            borderRadius: '50%',
            background: '#0d0d1a',
            transform: `translate(${eyeX}px, ${eyeY}px)`,
            transition: 'transform 0.06s ease-out',
          }}>
            <div style={{
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '10%',
              right: '10%',
            }} />
          </div>
        </div>

        {/* Right eye */}
        <div style={{
          width: c.eyeSize,
          height: c.eyeSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #c084fc 0%, #7c3aed 60%, #4c1d95 100%)',
          boxShadow: '0 0 12px rgba(139,92,246,0.6), inset 0 0 6px rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scaleY(${blink ? 0.1 : 1})`,
          transition: 'transform 0.12s ease',
        }}>
          <div style={{
            width: c.eyeSize * 0.45,
            height: c.eyeSize * 0.45,
            borderRadius: '50%',
            background: '#0d0d1a',
            transform: `translate(${eyeX}px, ${eyeY}px)`,
            transition: 'transform 0.06s ease-out',
          }}>
            <div style={{
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '10%',
              right: '10%',
            }} />
          </div>
        </div>
      </div>

      {/* Mouth indicator (subtle) */}
      <div style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: `translate(-50%, -50%) translateX(${eyeX * 0.3}px) translateY(${eyeY * 0.3}px)`,
        width: loginSuccess ? 16 : loginFailed ? 14 : isTyping ? 6 : 10,
        height: loginSuccess ? 8 : loginFailed ? 6 : isTyping ? 6 : 4,
        borderRadius: loginSuccess ? '0 0 10px 10px' : loginFailed ? '10px 10px 0 0' : '50%',
        background: 'rgba(255,255,255,0.15)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes mascot-shake {
          0%, 100% { transform: translateX(0) translateY(${floatY}px) rotate(${bodyTilt}deg); }
          25% { transform: translateX(-6px) translateY(${floatY}px) rotate(${bodyTilt - 3}deg); }
          75% { transform: translateX(6px) translateY(${floatY}px) rotate(${bodyTilt + 3}deg); }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(${floatY}px); }
          40% { transform: translateY(${floatY - 15}px); }
          60% { transform: translateY(${floatY - 8}px); }
        }
      `}</style>
    </div>
  )
}
