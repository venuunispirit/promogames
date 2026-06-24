import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useRef } from 'react'

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

// ─── Parallax Section ───
export function ParallaxSection({ children, speed = 0.5, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100])

  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}

// ─── Reveal on Scroll (smooth) ───
export function RevealOnScroll({ children, direction = 'up', delay = 0, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.4'],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1],
    direction === 'up' ? [80, 0] :
    direction === 'down' ? [-80, 0] : [0, 0]
  )
  const x = useTransform(scrollYProgress, [0, 1],
    direction === 'left' ? [80, 0] :
    direction === 'right' ? [-80, 0] : [0, 0]
  )
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])

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

// ─── Text Reveal (character by character) ───
export function TextReveal({ text, className = '', style = {}, delay = 0 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.4'],
  })

  const words = text.split(' ')

  return (
    <div ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block',
            opacity: useTransform(scrollYProgress, [0, 1], [0, 1]),
            y: useTransform(scrollYProgress, [0, 1], [20, 0]),
          }}
          transition={{ delay: delay + i * 0.05 }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

// ─── Scale on Scroll ───
export function ScaleOnScroll({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.3'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div ref={ref} style={{ scale, opacity, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Sticky Section ───
export function StickySection({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Stagger Container ───
export function StaggerContainer({ children, className = '', style = {}, stagger = 0.1 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      style={{
        opacity: useTransform(scrollYProgress, [0, 1], [0, 1]),
        ...style,
      }}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
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
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Slide In ───
export function SlideIn({ children, from = 'left', className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  })

  const x = useTransform(scrollYProgress, [0, 1],
    from === 'left' ? [-120, 0] :
    from === 'right' ? [120, 0] : [0, 0]
  )
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div ref={ref} style={{ x, opacity, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Floating Element ───
export function FloatingElement({ children, amplitude = 20, speed = 2, className = '', style = {} }) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [amplitude, -amplitude])

  return (
    <motion.div style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Count Up Animation ───
export function CountUpOnScroll({ target, suffix = '', className = '', style = {} }) {
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

// ─── Magnetic Hover ───
export function MagneticElement({ children, strength = 0.3, className = '', style = {} }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0, 0)'
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease-out', ...style }}
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
    offset: ['start 0.85', 'start 0.4'],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const filter = useTransform(scrollYProgress, [0, 1], ['blur(12px)', 'blur(0px)'])
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1])

  return (
    <motion.div ref={ref} style={{ opacity, filter, scale, ...style }} className={className}>
      {children}
    </motion.div>
  )
}
