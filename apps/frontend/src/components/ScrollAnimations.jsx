import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

// ─── Smooth Scroll Progress Bar ───
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #9210f6, #c040ff, #f5c842)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 9999,
      }}
    />
  )
}

// ─── Parallax Background Layer ───
export function ParallaxBg({ children, speed = 0.3, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 150, speed * -150])

  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <motion.div style={{ y, position: 'absolute', inset: '-20% 0', zIndex: 0 }}>
        {children}
      </motion.div>
    </div>
  )
}

// ─── Parallax Content (moves slower than scroll) ───
export function ParallaxContent({ children, speed = 0.2, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 80, speed * -80])

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Smooth Reveal on Scroll ───
export function SmoothReveal({ children, direction = 'up', delay = 0, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.35'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.3, 1])
  const y = useTransform(scrollYProgress, [0, 0.3, 1],
    direction === 'up' ? [60, 30, 0] :
    direction === 'down' ? [-60, -30, 0] : [0, 0, 0]
  )
  const x = useTransform(scrollYProgress, [0, 0.3, 1],
    direction === 'left' ? [60, 30, 0] :
    direction === 'right' ? [-60, -30, 0] : [0, 0, 0]
  )
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.95, 0.98, 1])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, x, scale, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Sticky Section ───
export function StickySection({ children, className = '', style = {}, height = '100vh' }) {
  return (
    <div className={className} style={{ position: 'sticky', top: 0, height, zIndex: 1, ...style }}>
      {children}
    </div>
  )
}

// ─── Text Reveal (word by word) ───
export function TextReveal({ text, className = '', style = {}, stagger = 0.08 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.4'],
  })

  const words = text.split(' ')

  return (
    <div ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block',
            opacity: useTransform(scrollYProgress, [i * 0.05, i * 0.05 + 0.15], [0, 1]),
            y: useTransform(scrollYProgress, [i * 0.05, i * 0.05 + 0.15], [20, 0]),
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

// ─── Character Reveal ───
export function CharReveal({ text, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.4'],
  })

  const chars = text.split('')

  return (
    <div ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block',
            opacity: useTransform(scrollYProgress, [i * 0.02, i * 0.02 + 0.1], [0, 1]),
            y: useTransform(scrollYProgress, [i * 0.02, i * 0.02 + 0.1], [15, 0]),
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  )
}

// ─── Stagger Container ───
export function StaggerContainer({ children, className = '', style = {}, stagger = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger Item ───
export function StaggerItem({ children, className = '', style = {} }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Slide In from Side ───
export function SlideIn({ children, from = 'left', className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.88', 'start 0.35'],
  })

  const x = useTransform(scrollYProgress, [0, 0.3, 1],
    from === 'left' ? [-100, -50, 0] :
    from === 'right' ? [100, 50, 0] : [0, 0, 0]
  )
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1])

  return (
    <motion.div ref={ref} style={{ x, opacity, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Scale on Scroll ───
export function ScaleReveal({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.35'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.88, 0.95, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1])

  return (
    <motion.div ref={ref} style={{ scale, opacity, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Magnetic Element ───
export function MagneticElement({ children, strength = 0.25, className = '', style = {} }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)', ...style }}
      className={className}
    >
      {children}
    </div>
  )
}

// ─── Blur Reveal ───
export function BlurReveal({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.88', 'start 0.4'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.4, 1])
  const filter = useTransform(scrollYProgress, [0, 0.3, 1], ['blur(16px)', 'blur(4px)', 'blur(0px)'])
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.96, 0.99, 1])

  return (
    <motion.div ref={ref} style={{ opacity, filter, scale, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Floating Element (follows scroll with offset) ───
export function FloatingElement({ children, amplitude = 30, className = '', style = {} }) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [amplitude, -amplitude])

  return (
    <motion.div style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Gradient Shift on Scroll ───
export function GradientShift({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <div ref={ref} className={className} style={{ position: 'relative', ...style }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: '-50%',
          background: 'radial-gradient(circle, rgba(146,16,246,0.15) 0%, transparent 50%)',
          rotate,
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  )
}

// ─── Section Divider (animated line) ───
export function SectionDivider({ color = 'rgba(146,16,246,0.3)', className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.5'],
  })

  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div ref={ref} className={className} style={{ ...style }}>
      <motion.div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          scaleX,
          transformOrigin: 'center',
        }}
      />
    </div>
  )
}

// ─── Parallax Image ───
export function ParallaxImage({ src, alt, speed = 0.3, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale, width: '100%', height: '120%', objectFit: 'cover' }}
      />
    </div>
  )
}

// ─── Scroll-linked Counter ───
export function ScrollCounter({ target, suffix = '', className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.4'],
  })

  const value = useTransform(scrollYProgress, [0, 1], [0, target])

  return (
    <motion.span ref={ref} className={className} style={style}>
      <motion.span>{Math.round(target)}</motion.span>
      {suffix}
    </motion.span>
  )
}
