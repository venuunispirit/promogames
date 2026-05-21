import { useState, useEffect, useRef } from "react";

/* ── Sound engine using Web Audio API ── */
function createAudioCtx() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}

function playTone(ctx, freq, type = "sine", duration = 0.15, vol = 0.18, delay = 0) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

// Enhanced fanfare with triumphant melody
function playGrandEntrance(ctx) {
  if (!ctx) return;
  const melody = [
    { freq: 523, delay: 0, duration: 0.15 },
    { freq: 659, delay: 0.12, duration: 0.15 },
    { freq: 784, delay: 0.24, duration: 0.2 },
    { freq: 1047, delay: 0.4, duration: 0.3 },
    { freq: 880, delay: 0.55, duration: 0.15 },
    { freq: 1047, delay: 0.7, duration: 0.4 }
  ];
  melody.forEach(({ freq, delay, duration }) => {
    playTone(ctx, freq, "triangle", duration, 0.22, delay);
  });
}

function playCrowdCheer(ctx) {
  if (!ctx) return;
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    playTone(ctx, f, "sine", 0.35, 0.15, i * 0.06);
    playTone(ctx, f * 1.5, "sine", 0.25, 0.08, i * 0.06 + 0.1);
  });
}

function playRankReveal(ctx, rank) {
  if (!ctx) return;
  const freqs = { 
    1: [784, 1047, 1319, 1568], 
    2: [659, 880, 1047, 1319], 
    3: [523, 659, 784, 1047] 
  };
  const f = freqs[rank] || [440, 554, 659, 784];
  f.forEach((freq, i) => playTone(ctx, freq, "triangle", 0.25, 0.18, i * 0.08));
}

function playRowPop(ctx, index) {
  if (!ctx) return;
  playTone(ctx, 350 + index * 25, "sine", 0.1, 0.12);
}

function playCountUp(ctx) {
  if (!ctx) return;
  playTone(ctx, 880, "sine", 0.04, 0.08);
}

function playConfettiBurst(ctx) {
  if (!ctx) return;
  [400, 600, 800, 1000].forEach((f, i) => {
    playTone(ctx, f, "sawtooth", 0.15, 0.1, i * 0.03);
  });
}

const INITIALS = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const RANK_COLORS = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
const RANK_GLOW   = { 1: "0 0 40px #FFD70088, 0 0 60px #FFD70044", 2: "0 0 32px #C0C0C066", 3: "0 0 24px #CD7F3255" };

/* ── Animated counter ── */
function Counter({ target, duration = 1200, onTick, suffix = "" }) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(ease * target);
      setVal(cur);
      if (onTick && cur !== val) onTick();
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ── Confetti blaster ── */
function ConfettiBlaster({ active, centerX = "50%", centerY = "50%" }) {
  const particles = Array.from({ length: 60 }, (_, i) => i);
  if (!active) return null;
  
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 100 }}>
      {particles.map(i => {
        const angle = Math.random() * 360;
        const dist = 80 + Math.random() * 120;
        const size = 6 + Math.random() * 10;
        const colors = ["#FFD700", "#FF6B9D", "#4ECDC4", "#95E1D3", "#FFA07A", "#C084FC", "#60A5FA"];
        const color = colors[i % colors.length];
        const rotation = Math.random() * 360;
        const shape = i % 3 === 0 ? "50%" : i % 3 === 1 ? "0%" : "2px";
        
        return (
          <div key={i} style={{
            position: "absolute",
            top: centerY, left: centerX,
            width: size, height: size,
            borderRadius: shape,
            background: color,
            animation: `confetti-burst-${i % 5} ${0.8 + Math.random() * 0.4}s ease-out forwards`,
            transform: `rotate(${rotation}deg)`,
            "--dx": `${Math.cos(angle * Math.PI / 180) * dist}px`,
            "--dy": `${Math.sin(angle * Math.PI / 180) * dist}px`,
          }} />
        );
      })}
    </div>
  );
}

/* ── Spotlight effect ── */
function Spotlight({ active, x = "50%", y = "30%" }) {
  if (!active) return null;
  return (
    <div style={{
      position: "fixed",
      top: y,
      left: x,
      width: "300px",
      height: "300px",
      transform: "translate(-50%, -50%)",
      background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 50,
      animation: "spotlight-pulse 2s ease-in-out infinite"
    }} />
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700&display=swap');

:root {
  --gold: #FFD700;
  --silver: #C0C0C0;
  --bronze: #CD7F32;
  --pp: #c084fc;
  --bg: #06020f;
  --surface: rgba(255,255,255,0.03);
  --border: rgba(255,255,255,0.07);
  --purple: #9210f6;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body { background: var(--bg); }

.lb { min-height: 100vh; background: var(--bg); color: #fff; font-family: 'Outfit', sans-serif; overflow-x: hidden; }

/* ── Animated bg ── */
.lb-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(146,16,246,0.2) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 80% 80%, rgba(100,10,200,0.1) 0%, transparent 60%);
}
.lb-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.04;
  background-image: linear-gradient(rgba(146,16,246,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(146,16,246,0.5) 1px, transparent 1px);
  background-size: 60px 60px;
}
.lb-orb {
  position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
  animation: orb-drift 8s ease-in-out infinite alternate;
}
@keyframes orb-drift { from { transform: translate(0,0); } to { transform: translate(30px, -20px); } }

/* ── Nav ── */
.lb-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 12px;
  padding: 16px 32px;
  background: rgba(6,2,15,0.9); backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(146,16,246,0.2);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.lb-nav img { width: 32px; height: 32px; border-radius: 8px; }
.lb-nav-brand { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
.lb-nav-back { margin-left: auto; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); text-decoration: none; transition: color .2s; letter-spacing: .3px; }
.lb-nav-back:hover { color: #fff; }

/* ── Hero with grand entrance ── */
.lb-hero { text-align: center; padding: 80px 24px 20px; position: relative; z-index: 1; }
.lb-trophy {
  font-size: 96px; display: block; margin: 0 auto 24px;
  animation: grand-trophy-entrance 1.2s cubic-bezier(.34,1.56,.64,1) both;
  filter: drop-shadow(0 0 40px #FFD700AA) drop-shadow(0 0 80px #FFD70066);
}
@keyframes grand-trophy-entrance {
  0%   { transform: scale(0) rotate(-180deg) translateY(-100px); opacity: 0; }
  50%  { transform: scale(1.3) rotate(20deg) translateY(0); opacity: 1; }
  70%  { transform: scale(0.9) rotate(-10deg); }
  85%  { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}
.lb-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: clamp(3rem, 8vw, 5.5rem);
  background: linear-gradient(135deg, #fff 10%, #FFD700 40%, #c084fc 70%, #FF6B9D 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -2px; line-height: 1;
  opacity: 0; animation: title-grand-entrance 0.8s 0.6s cubic-bezier(.34,1.56,.64,1) forwards;
  text-shadow: 0 0 60px rgba(255,215,0,0.3);
}
@keyframes title-grand-entrance {
  from { opacity: 0; transform: translateY(40px) scale(0.8); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.lb-sub {
  color: rgba(255,255,255,0.5); font-size: 15px; margin-top: 16px; font-weight: 500;
  opacity: 0; animation: fade-up 0.6s 1s ease forwards; letter-spacing: 0.5px;
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── PP badge ── */
.lb-badge-wrap { display: flex; justify-content: center; margin: 32px 0 56px; opacity: 0; animation: fade-up 0.5s 1.2s ease forwards; position: relative; z-index: 1; }
.lb-badge { display: inline-flex; align-items: center; gap: 12px; padding: 12px 28px; border-radius: 100px; background: rgba(192,132,252,0.12); border: 1px solid rgba(192,132,252,0.3); font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.65); box-shadow: 0 4px 24px rgba(192,132,252,0.15); }
.lb-badge .pp-hl { color: var(--pp); font-weight: 900; font-size: 16px; }

/* ── Podium ── */
.lb-podium-wrap { display: flex; justify-content: center; align-items: flex-end; gap: 16px; margin-bottom: 64px; position: relative; z-index: 1; padding: 0 16px; flex-wrap: wrap; }

.podium-card { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: default; position: relative; }

.podium-avatar {
  border-radius: 50%; display: grid; place-items: center;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  position: relative; color: #fff;
  transition: transform .3s;
}
.podium-card:hover .podium-avatar { transform: scale(1.1) rotate(5deg); }

.podium-crown { position: absolute; top: -28px; font-size: 32px; animation: crown-grand-float 2s ease-in-out infinite alternate; filter: drop-shadow(0 4px 8px rgba(255,215,0,0.4)); }
@keyframes crown-grand-float { from { transform: translateY(0) rotate(-8deg) scale(1); } to { transform: translateY(-8px) rotate(8deg) scale(1.1); } }

.podium-name { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; text-align: center; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: 0.3px; }
.podium-pp { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
.podium-plays { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; }

.podium-block {
  border-radius: 16px 16px 0 0; width: 110px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px;
  color: rgba(255,255,255,0.25);
}

/* ── List ── */
.lb-list-wrap { max-width: 800px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
.lb-list-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 16px; padding-left: 4px; }

.lb-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-radius: 16px;
  background: var(--surface); border: 1px solid var(--border);
  margin-bottom: 10px;
  opacity: 0; transform: translateX(-30px);
  transition: background .2s, border-color .2s, transform .15s, box-shadow .2s;
}
.lb-row.visible { opacity: 1; transform: translateX(0); transition: opacity 0.5s ease, transform 0.5s ease, background .2s, border-color .2s, box-shadow .2s; }
.lb-row:hover { background: rgba(146,16,246,0.08); border-color: rgba(146,16,246,0.25); box-shadow: 0 4px 20px rgba(146,16,246,0.15); }

.row-rank { width: 36px; text-align: center; font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.3); flex-shrink: 0; font-family: 'Space Grotesk', sans-serif; }
.row-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg,#1a0a2e,#2d0a4e); border: 2px solid rgba(146,16,246,0.25); display: grid; place-items: center; font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; flex-shrink: 0; color: #fff; box-shadow: 0 4px 12px rgba(146,16,246,0.2); }
.row-info { flex: 1; min-width: 0; }
.row-name { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.3px; }
.row-plays { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; font-weight: 500; }
.row-pp { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.row-pp-val { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--pp); }
.row-pp-lbl { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 700; letter-spacing: .8px; }

/* ── States ── */
.lb-empty { text-align: center; padding: 100px 24px; color: rgba(255,255,255,0.3); font-size: 16px; position: relative; z-index: 1; font-weight: 500; }
.lb-loading { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 120px 24px; position: relative; z-index: 1; }
.lb-spinner { width: 48px; height: 48px; border: 4px solid rgba(146,16,246,0.2); border-top-color: #9210f6; border-radius: 50%; animation: spin .7s linear infinite; }
.lb-loading-txt { font-size: 14px; color: rgba(255,255,255,0.4); letter-spacing: 1.5px; animation: pulse 1.4s ease-in-out infinite; font-weight: 600; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }

/* ── Confetti keyframes ── */
@keyframes confetti-burst-0 { to { transform: translate(var(--dx), var(--dy)) rotate(720deg) scale(0); opacity: 0; } }
@keyframes confetti-burst-1 { to { transform: translate(calc(var(--dx)*1.2), calc(var(--dy)*0.9)) rotate(-540deg) scale(0); opacity: 0; } }
@keyframes confetti-burst-2 { to { transform: translate(calc(var(--dx)*0.9), calc(var(--dy)*1.3)) rotate(900deg) scale(0); opacity: 0; } }
@keyframes confetti-burst-3 { to { transform: translate(calc(var(--dx)*1.1), calc(var(--dy)*1.1)) rotate(-720deg) scale(0); opacity: 0; } }
@keyframes confetti-burst-4 { to { transform: translate(calc(var(--dx)*1.3), calc(var(--dy)*0.8)) rotate(1080deg) scale(0); opacity: 0; } }

/* ── Podium entrance ── */
.podium-card { opacity: 0; }
.podium-card.visible { animation: podium-grand-rise 0.8s cubic-bezier(.34,1.56,.64,1) forwards; }
@keyframes podium-grand-rise {
  0%   { opacity: 0; transform: translateY(60px) scale(0.6) rotate(-10deg); }
  60%  { opacity: 1; transform: translateY(-10px) scale(1.1) rotate(5deg); }
  80%  { transform: translateY(5px) scale(0.95) rotate(-2deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
}

/* ── Spotlight ── */
@keyframes spotlight-pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.2); }
}

@media (max-width: 600px) {
  .lb-nav { padding: 14px 16px; }
  .lb-list-wrap { padding: 0 12px; }
  .lb-podium-wrap { gap: 10px; }
  .row-plays { display: none; }
  .lb-trophy { font-size: 72px; }
  .lb-title { font-size: 2.5rem; }
}
`;

export default function LeaderboardPage() {
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [podiumReady, setPodiumReady] = useState([false, false, false]);
  const [rowsReady, setRowsReady] = useState([]);
  const [confettiActive, setConfettiActive] = useState([false, false, false]);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const audioRef = useRef(null);
  const rowRefs  = useRef([]);

  // Init audio on first interaction
  useEffect(() => {
    const init = () => { 
      audioRef.current = createAudioCtx();
      window.removeEventListener("click", init);
    };
    window.addEventListener("click", init, { once: true });
    audioRef.current = createAudioCtx();
  }, []);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Grand entrance sequence
  useEffect(() => {
    if (loading || entries.length === 0) return;
    
    // Play grand entrance fanfare
    playGrandEntrance(audioRef.current);
    
    // Activate spotlight
    setTimeout(() => setSpotlightActive(true), 300);
    
    const delays = [600, 300, 900]; // 2nd, 1st, 3rd
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setPodiumReady(prev => { const n=[...prev]; n[i]=true; return n; });
        const rank = [2,1,3][i];
        playRankReveal(audioRef.current, rank);
        
        // Confetti burst
        setConfettiActive(prev => { const n=[...prev]; n[i]=true; return n; });
        playConfettiBurst(audioRef.current);
        setTimeout(() => {
          setConfettiActive(prev => { const n=[...prev]; n[i]=false; return n; });
        }, 1000);
        
        if (rank === 1) {
          setTimeout(() => playCrowdCheer(audioRef.current), 300);
        }
      }, delay);
    });
    
    // Turn off spotlight after all podium reveals
    setTimeout(() => setSpotlightActive(false), 2500);
  }, [loading, entries.length]);

  // Staggered row reveal
  useEffect(() => {
    if (loading) return;
    const rest = entries.slice(3);
    setRowsReady(new Array(rest.length).fill(false));
    rest.forEach((_, i) => {
      setTimeout(() => {
        setRowsReady(prev => { const n=[...prev]; n[i]=true; return n; });
        playRowPop(audioRef.current, i);
      }, 1400 + i * 100);
    });
  }, [loading, entries.length]);

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  // Podium display order: silver(2nd), gold(1st), bronze(3rd)
  const podiumOrder = top3.length === 3
    ? [{ ...top3[1], podiumRank: 2, animIdx: 0 },
       { ...top3[0], podiumRank: 1, animIdx: 1 },
       { ...top3[2], podiumRank: 3, animIdx: 2 }]
    : top3.map((e, i) => ({ ...e, podiumRank: i + 1, animIdx: i }));

  const podiumSizes = { 1: 100, 2: 76, 3: 68 };
  const podiumHeights = { 1: 90, 2: 64, 3: 48 };

  return (
    <>
      <style>{CSS}</style>
      <div className="lb">

        {/* Background */}
        <div className="lb-bg" />
        <div className="lb-grid" />
        <div className="lb-orb" style={{ width:400,height:400,top:-100,left:"30%",background:"rgba(146,16,246,0.15)" }} />
        <div className="lb-orb" style={{ width:300,height:300,bottom:100,right:"10%",background:"rgba(192,132,252,0.08)",animationDelay:"3s" }} />

        {/* Spotlight */}
        <Spotlight active={spotlightActive} y="35%" />

        {/* Nav */}
        <nav className="lb-nav">
          <img src="/favicon.png" alt="Promogames" />
          <span className="lb-nav-brand">Promogames</span>
          <a href="/" className="lb-nav-back">← Back to Home</a>
        </nav>

        {/* Hero */}
        <div className="lb-hero">
          <span className="lb-trophy">🏆</span>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-sub">Top players ranked by PromoPoints · Play more, climb higher</p>
        </div>

        {/* PP badge */}
        <div className="lb-badge-wrap">
          <div className="lb-badge">
            🎮 Each completed game = <span className="pp-hl">50 PP</span> &nbsp;·&nbsp; More plays = higher rank
          </div>
        </div>

        {loading ? (
          <div className="lb-loading">
            <div className="lb-spinner" />
            <div className="lb-loading-txt">LOADING RANKINGS...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="lb-empty">No players yet — be the first to earn PP! 🎮</div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 2 && (
              <div className="lb-podium-wrap">
                {podiumOrder.map((entry) => {
                  const rank = entry.podiumRank;
                  const size = podiumSizes[rank] || 68;
                  const h    = podiumHeights[rank] || 48;
                  const color = RANK_COLORS[rank] || "#9210f6";
                  return (
                    <div
                      key={entry.player_email || entry.player_name}
                      className={`podium-card${podiumReady[entry.animIdx] ? " visible" : ""}`}
                      style={{ animationDelay: `0s` }}
                    >
                      <div className="podium-avatar" style={{
                        width: size, height: size, fontSize: size * 0.32,
                        border: `4px solid ${color}`,
                        boxShadow: RANK_GLOW[rank],
                        background: `radial-gradient(circle at 40% 30%, #2d0a4e, #0d0118)`,
                        position: "relative",
                      }}>
                        {rank === 1 && <span className="podium-crown">👑</span>}
                        {INITIALS(entry.player_name)}
                        {confettiActive[entry.animIdx] && <ConfettiBlaster active centerY="50%" />}
                      </div>
                      <div className="podium-name">{entry.player_name}</div>
                      <div className="podium-pp" style={{ color }}>
                        <Counter target={entry.promo_points} duration={1200} onTick={() => playCountUp(audioRef.current)} suffix=" PP" />
                      </div>
                      <div className="podium-plays">{entry.total_plays} game{entry.total_plays !== 1 ? "s" : ""}</div>
                      <div className="podium-block" style={{
                        height: h,
                        background: `linear-gradient(180deg, ${color}20, ${color}06)`,
                        border: `2px solid ${color}40`,
                        borderBottom: "none",
                      }}>#{rank}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rankings list */}
            <div className="lb-list-wrap">
              {(rest.length > 0 || top3.length > 0) && (
                <div className="lb-list-title">All Rankings</div>
              )}
              {(rest.length > 0 ? rest : entries).map((entry, i) => {
                const rank = rest.length > 0 ? i + 4 : i + 1;
                return (
                  <div
                    key={entry.player_email || entry.player_name}
                    ref={el => rowRefs.current[i] = el}
                    className={`lb-row${(rest.length > 0 ? rowsReady[i] : true) ? " visible" : ""}`}
                    style={{ transitionDelay: `${i * 0.05}s` }}
                  >
                    <div className="row-rank">#{rank}</div>
                    <div className="row-avatar">{INITIALS(entry.player_name)}</div>
                    <div className="row-info">
                      <div className="row-name">{entry.player_name}</div>
                      <div className="row-plays">{entry.total_plays} game{entry.total_plays !== 1 ? "s" : ""} played</div>
                    </div>
                    <div className="row-pp">
                      <div className="row-pp-val">{entry.promo_points}</div>
                      <div className="row-pp-lbl">PP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ height: 80 }} />
      </div>
    </>
  );
}