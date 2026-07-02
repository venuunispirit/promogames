import { useRef, useState, useCallback, useEffect } from 'react';

export default function ArcadeLever() {
  const leverRef = useRef(null);
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showGameOn, setShowGameOn] = useState(false);
  const [springBack, setSpringBack] = useState(false);
  const startY = useRef(0);
  const currentPull = useRef(0);
  const animRef = useRef(null);
  const triggeredRef = useRef(false);

  const MAX_TRAVEL = 90;
  const TRIGGER_THRESHOLD = 0.8;

  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    return audioCtxRef.current;
  };

  const playClick = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.06);
  };

  const playReturn = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  };

  const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  const handleStart = useCallback((clientY) => {
    if (triggeredRef.current) return;
    setDragging(true);
    setSpringBack(false);
    startY.current = clientY;
    currentPull.current = 0;
  }, []);

  const handleMove = useCallback((clientY) => {
    if (!dragging || triggeredRef.current) return;
    const dy = Math.max(0, clientY - startY.current);
    const newPull = Math.min(dy / MAX_TRAVEL, 1);
    currentPull.current = newPull;
    setPull(newPull);
  }, [dragging]);

  const handleEnd = useCallback(() => {
    if (!dragging || triggeredRef.current) return;
    setDragging(false);

    if (currentPull.current >= TRIGGER_THRESHOLD) {
      triggeredRef.current = true;
      setTriggered(true);
      playClick();
      vibrate(50);

      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);

      setShowGameOn(true);
      setTimeout(() => setShowGameOn(false), 500);

      const featured = document.getElementById('featured');
      if (featured) {
        setTimeout(() => featured.scrollIntoView({ behavior: 'smooth' }), 400);
      }

      setSpringBack(true);
      const returnSpring = () => {
        setPull(prev => {
          if (prev <= 0.01) {
            setSpringBack(false);
            setTimeout(() => {
              setTriggered(false);
              triggeredRef.current = false;
            }, 300);
            return 0;
          }
          const next = prev * 0.85;
          playReturn();
          return next;
        });
      };
      let raf;
      const animate = () => {
        setPull(prev => {
          if (prev <= 0.01) {
            setSpringBack(false);
            setTimeout(() => {
              setTriggered(false);
              triggeredRef.current = false;
            }, 300);
            return 0;
          }
          return prev * 0.88;
        });
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      setTimeout(() => cancelAnimationFrame(raf), 800);
    } else {
      setSpringBack(true);
      const raf = requestAnimationFrame(function animate() {
        setPull(prev => {
          if (prev <= 0.01) { setSpringBack(false); return 0; }
          return prev * 0.85;
        });
      });
    }
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => handleMove(e.clientY || e.touches?.[0]?.clientY || 0);
    const onEnd = () => handleEnd();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging, handleMove, handleEnd]);

  const onPointerDown = (e) => {
    e.preventDefault();
    handleStart(e.clientY || e.touches?.[0]?.clientY || 0);
  };

  const rotation = pull * 35;
  const glowIntensity = pull * 0.6;
  const leverY = pull * MAX_TRAVEL;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, userSelect: 'none' }}>
      {showFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'radial-gradient(circle at center, rgba(146,16,246,0.4) 0%, rgba(192,64,255,0.2) 50%, transparent 80%)',
          pointerEvents: 'none',
          animation: 'flashFade 0.15s ease-out forwards',
        }} />
      )}
      {showGameOn && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          animation: 'gameOnFade 0.5s ease-out forwards',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 8vw, 96px)',
            letterSpacing: 8,
            background: 'linear-gradient(90deg, #9210f6, #c040ff, #f5c842)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            textShadow: '0 0 60px rgba(146,16,246,0.6)',
            filter: 'drop-shadow(0 0 30px rgba(146,16,246,0.4))',
          }}>GAME ON</div>
        </div>
      )}

      {/* Instruction text */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(14px, 1.6vw, 20px)',
        letterSpacing: 3,
        lineHeight: 1.1,
        color: '#fff',
        textShadow: `0 0 ${10 + glowIntensity * 20}px rgba(146,16,246,${0.4 + glowIntensity})`,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        minWidth: 60,
      }}>
        <div>PULL</div>
        <div>LEVER</div>
        <div>TO PLAY</div>
        <div style={{
          fontSize: 18,
          marginTop: 4,
          opacity: 0.4 + glowIntensity,
          transform: `translateY(${pull * 6}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}>▼</div>
      </div>

      {/* Lever assembly */}
      <div
        ref={leverRef}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!triggeredRef.current) {
              handleStart(0);
              setPull(TRIGGER_THRESHOLD);
              currentPull.current = TRIGGER_THRESHOLD;
              handleEnd();
            }
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Pull lever to play"
        style={{
          position: 'relative',
          width: 120,
          height: 180,
          cursor: dragging ? 'grabbing' : 'grab',
          outline: 'none',
          transform: `scale(${dragging ? 1 : pull > 0 ? 1 + pull * 0.03 : 1})`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          filter: `drop-shadow(0 0 ${8 + glowIntensity * 25}px rgba(146,16,246,${0.2 + glowIntensity * 0.6}))`,
        }}
      >
        {/* Baseplate */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 40,
          borderRadius: '8px 8px 12px 12px',
          background: 'linear-gradient(180deg, #4a4a52 0%, #2a2a30 40%, #1a1a1e 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 ${20 + glowIntensity * 40}px rgba(146,16,246,${0.1 + glowIntensity * 0.3})`,
        }}>
          {/* Brushed metal texture */}
          <div style={{
            position: 'absolute', inset: 2, borderRadius: 6,
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 3px)',
          }} />
          {/* Purple accent light */}
          <div style={{
            position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 8, borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(146,16,246,${0.3 + glowIntensity * 0.5}) 0%, transparent 70%)`,
          }} />
        </div>

        {/* Shaft */}
        <div style={{
          position: 'absolute',
          bottom: 35,
          left: '50%',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transformOrigin: 'center bottom',
          width: 12,
          height: 110,
          background: 'linear-gradient(90deg, #888 0%, #ddd 30%, #fff 50%, #ddd 70%, #888 100%)',
          borderRadius: 6,
          boxShadow: '2px 0 8px rgba(0,0,0,0.3), -1px 0 4px rgba(0,0,0,0.2)',
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Chrome highlight */}
          <div style={{
            position: 'absolute', left: 2, top: 0, width: 3, height: '100%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 100%)',
            borderRadius: 2,
          }} />
        </div>

        {/* Ball handle */}
        <div style={{
          position: 'absolute',
          bottom: 135,
          left: '50%',
          transform: `translateX(-50%) rotate(${rotation}deg) translateY(${leverY}px)`,
          transformOrigin: 'center 45px',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #e879f9 0%, #9210f6 40%, #6b21a8 80%, #3b0764 100%)',
          boxShadow: `0 4px 20px rgba(146,16,246,0.5), inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 ${15 + glowIntensity * 30}px rgba(146,16,246,${0.3 + glowIntensity * 0.5})`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Glossy highlight */}
          <div style={{
            position: 'absolute', top: 6, left: 8, width: 18, height: 10,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes flashFade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes gameOnFade { 0% { opacity: 0; transform: scale(0.8); } 30% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}
