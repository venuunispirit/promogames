import { useRef, useEffect, useState } from 'react'

export default function EyeBall({
  size = 20,
  pupilSize = 8,
  maxDistance = 5,
  eyeColor = '#ffffff',
  pupilColor = '#1a1a2e',
  isBlinking = false,
  isSad = false,
  sadRotate = 0,
  forceLookX,
  forceLookY,
  mouseX,
  mouseY,
  eyeRef,
}) {
  const [lookX, setLookX] = useState(0)
  const [lookY, setLookY] = useState(0)
  const innerRef = useRef(null)
  const ref = eyeRef || innerRef

  useEffect(() => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      setLookX(forceLookX)
      setLookY(forceLookY)
      return
    }
    if (!ref.current || mouseX === undefined || mouseY === undefined) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const scale = dist > 0 ? Math.min(maxDistance, dist / 20) / dist : 0
    setLookX(dx * scale)
    setLookY(dy * scale)
  }, [mouseX, mouseY, maxDistance, forceLookX, forceLookY])

  const blinkScale = isBlinking ? 0.1 : 1
  const sadTilt = isSad ? `rotate(${sadRotate}deg)` : 'none'

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: eyeColor,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scaleY(${blinkScale}) ${sadTilt}`,
        transition: 'transform 0.12s ease',
        boxShadow: `0 0 ${size / 4}px rgba(139,92,246,0.3)`,
      }}
    >
      <div
        style={{
          width: pupilSize,
          height: pupilSize,
          borderRadius: '50%',
          background: pupilColor,
          position: 'absolute',
          transform: `translate(${lookX}px, ${lookY}px)`,
          transition: 'transform 0.08s ease-out',
        }}
      />
      <div
        style={{
          width: pupilSize * 0.35,
          height: pupilSize * 0.35,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          transform: `translate(${lookX + pupilSize * 0.15}px, ${lookY - pupilSize * 0.15}px)`,
          transition: 'transform 0.08s ease-out',
        }}
      />
    </div>
  )
}
