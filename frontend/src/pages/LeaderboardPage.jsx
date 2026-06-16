import { useState, useEffect, useRef, useCallback } from "react";

/* ── Sound engine (preserved exactly from original) ── */
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

const INITIALS = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

/* ── Animated counter ── */
function Counter({ target, duration = 1200, suffix = "" }) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ── Row color config matching reference ── */
const ROW_STYLES = {
  1: { bg: "linear-gradient(90deg, #f9c846 0%, #f5a623 100%)", border: "#e09010", text: "#7a4a00", rankBg: "#e09010", shadow: "0 6px 20px rgba(245,166,35,0.45)" },
  2: { bg: "linear-gradient(90deg, #5bc8f5 0%, #3aaee0 100%)", border: "#2a8fc0", text: "#0a4a6e", rankBg: "#2a8fc0", shadow: "0 6px 20px rgba(58,174,224,0.4)" },
  3: { bg: "linear-gradient(90deg, #f76e8a 0%, #e0435e 100%)", border: "#c02040", text: "#6e0020", rankBg: "#c02040", shadow: "0 6px 20px rgba(224,67,94,0.4)" },
  4: { bg: "linear-gradient(90deg, #6a85c8 0%, #5570b8 100%)", border: "#3a50a0", text: "#e8eeff", rankBg: "#3a50a0", shadow: "0 4px 14px rgba(85,112,184,0.35)" },
  5: { bg: "linear-gradient(90deg, #5a78bc 0%, #4565ac 100%)", border: "#334e98", text: "#dce5ff", rankBg: "#334e98", shadow: "0 4px 12px rgba(69,101,172,0.3)" },
  6: { bg: "linear-gradient(90deg, #4d6caf 0%, #3c5a9e 100%)", border: "#2d4888", text: "#ccd8f8", rankBg: "#2d4888", shadow: "0 3px 10px rgba(60,90,158,0.25)" },
  7: { bg: "linear-gradient(90deg, #415fa0 0%, #344e90 100%)", border: "#263d7a", text: "#b8c8f0", rankBg: "#263d7a", shadow: "0 3px 8px rgba(52,78,144,0.2)" },
};
function getRowStyle(rank) {
  return ROW_STYLES[rank] || {
    bg: "linear-gradient(90deg, #374d85 0%, #2c4078 100%)",
    border: "#1e3060",
    text: "#a0b0e0",
    rankBg: "#1e3060",
    shadow: "0 2px 6px rgba(44,64,120,0.15)"
  };
}

const FOOTER_NAV = [
  ["Play Now", "/arcade"],
  ["Leaderboard", "/leaderboard"],
  ["Business", "/business"],
  ["Log In", "/login"],
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Poppins:wght@600;700;800;900&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; }

.lb {
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #1a1228 40%, #0d0c1a 100%);
  font-family: 'Nunito', sans-serif;
  color: #fff;
  overflow-x: hidden;
}

/* NAV (LandingPage pill style) */
.nav-wrap{position:fixed;top:0;left:0;right:0;z-index:1000;padding:18px 0;pointer-events:none;display:flex;justify-content:center}
.navbar{pointer-events:all;width:62%;max-width:700px;min-width:580px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding:11px 20px 11px 18px;border-radius:100px;background:rgba(7,4,15,0.88);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(146,16,246,0.22);box-shadow:0 8px 48px rgba(0,0,0,0.60)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-mark{width:auto;height:60px;border-radius:9px;flex-shrink:0;background:transparent;display:grid;place-items:center;font-family:var(--fb);font-weight:800;font-size:18px;margin-right:0}
.logo-name{font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:20px;color:#fff;white-space:nowrap;letter-spacing:2px}
.nav-links{list-style:none;display:flex;gap:26px;align-items:center}
.nav-links a{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,0.52);text-decoration:none;position:relative;transition:color .22s}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:linear-gradient(90deg,#610497,#9210f6);transition:width .25s}
.nav-links a:hover{color:#fff}
.nav-links a:hover::after{width:100%}
.nav-btn-cta{position:relative;overflow:hidden;display:inline-flex;align-items:center;height:38px;padding:0 22px;border-radius:100px;border:none;background:linear-gradient(90deg,#610497,#9210f6);text-decoration:none;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;color:#fff!important;transition:opacity .2s;margin-left:0}
.nav-btn-cta:hover{opacity:.85;color:#fff!important}
.nav-btn-cta::after{display:none!important}
.ham{display:none;flex-direction:column;gap:5px;background:none;border:none;padding:4px}
.ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s}
.ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ham.open span:nth-child(2){opacity:0}
.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mob-overlay{display:none;position:fixed;inset:0;top:74px;background:rgba(7,4,15,0.97);backdrop-filter:blur(20px);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:30px}
.mob-overlay.open{display:flex}
.mob-overlay a{font-family:'Bebas Neue',sans-serif;font-size:26px;color:#fff;text-decoration:none;opacity:.80;transition:opacity .2s;letter-spacing:2px}
.mob-overlay a:hover{opacity:1}
.mob-cta{margin-top:8px;padding:14px 40px;border-radius:100px;background:linear-gradient(90deg,#610497,#9210f6);color:#fff;font-family:'DM Sans',sans-serif;font-size:17px;font-weight:700;text-decoration:none}

@media(max-width:1100px){.navbar{width:78%}}
@media(max-width:900px){
  .nav-links,.nav-btn-cta{display:none}
  .ham{display:flex}
  .nav-wrap{padding:12px 20px;display:block}
  .navbar{width:100%;max-width:100%;min-width:unset;padding:10px 20px;border-radius:18px}
}
@media(max-width:640px){
  .nav-links{display:none}
}

.lb-page { display: flex; flex-direction: column; align-items: center; padding: 130px 16px 80px; }

/* ── Outer board card (the navy bordered rounded rect from reference) ── */
.lb-board {
  width: 100%;
  max-width: 480px;
  background: linear-gradient(180deg, #1e2a5e 0%, #16225a 40%, #0f1a4a 100%);
  border-radius: 28px;
  border: 3px solid #c8a020;
  box-shadow:
    0 0 0 6px rgba(200,160,32,0.15),
    0 24px 60px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,220,80,0.1);
  position: relative;
  overflow: hidden;
  padding-bottom: 24px;
}
.lb-board::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,215,0,0.08) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(80,100,200,0.12) 0%, transparent 50%);
  pointer-events: none;
}

/* ── Ribbon header ── */
.lb-ribbon-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: -3px;
  margin-bottom: 8px;
  z-index: 10;
}
.lb-ribbon {
  background: linear-gradient(180deg, #e83030 0%, #c01818 60%, #a01010 100%);
  padding: 14px 56px 16px;
  border-radius: 0 0 12px 12px;
  position: relative;
  clip-path: polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%);
  box-shadow: 0 6px 20px rgba(180,0,0,0.5), inset 0 1px 0 rgba(255,120,120,0.3);
  animation: ribbon-bounce 0.7s 0.2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes ribbon-bounce {
  from { transform: translateY(-60px) scaleX(0.6); opacity: 0; }
  to   { transform: translateY(0) scaleX(1); opacity: 1; }
}
.lb-ribbon::before, .lb-ribbon::after {
  content: '';
  position: absolute;
  bottom: -12px;
  width: 18px; height: 12px;
  background: #800000;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.lb-ribbon::before { left: -6px; }
.lb-ribbon::after  { right: -6px; }
.lb-ribbon-text {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  letter-spacing: 3px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,150,150,0.3);
}

/* ── Stars under ribbon ── */
.lb-stars {
  display: flex; justify-content: center; gap: 8px;
  margin: 16px 0 20px;
  animation: fade-up 0.5s 0.7s ease both;
}
.lb-star { font-size: 20px; animation: star-twinkle 2s ease-in-out infinite; }
.lb-star:nth-child(2) { animation-delay: 0.3s; font-size: 26px; }
.lb-star:nth-child(3) { animation-delay: 0.6s; }
@keyframes star-twinkle {
  0%,100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  50% { transform: scale(1.2) rotate(15deg); filter: brightness(1.4) drop-shadow(0 0 6px #ffd700); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Rows ── */
.lb-rows { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }

.lb-row {
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 100px;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-40px);
  transition: transform 0.12s ease, box-shadow 0.2s;
  position: relative;
  cursor: default;
}
.lb-row.visible {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(.34,1.4,.64,1), box-shadow 0.2s;
}
.lb-row:hover {
  transform: scale(1.04) translateX(4px);
  box-shadow: 0 0 24px rgba(124,111,247,0.4);
  z-index: 2;
  position: relative;
}
.lb-row-top { animation: row-glow 2s ease-in-out infinite; }
@keyframes row-glow {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}

.row-rank-badge {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

.row-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  display: grid;
  place-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.row-avatar-inner {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  display: grid; place-items: center;
  font-size: 13px; font-weight: 900;
}

.row-name {
  flex: 1;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-coin-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  border-radius: 100px;
  padding: 6px 14px 6px 6px;
  margin-right: 8px;
  flex-shrink: 0;
}
.row-coin-icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffe066, #f5a623 60%, #c07010 100%);
  border: 2px solid #a06000;
  display: grid; place-items: center;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,240,100,0.5);
  flex-shrink: 0;
}
.row-score {
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  min-width: 48px;
  text-align: right;
}

/* ── Fade out bottom rows ── */
.lb-fade-mask {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: linear-gradient(transparent, rgba(15,26,74,0.95));
  pointer-events: none;
  border-radius: 0 0 25px 25px;
}

/* ── Loading ── */
.lb-loading { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 80px 24px; }
.lb-spinner { width: 48px; height: 48px; border: 4px solid rgba(255,215,0,0.15); border-top-color: #ffd700; border-radius: 50%; animation: spin .7s linear infinite; }
.lb-loading-txt { font-size: 13px; font-weight: 800; color: rgba(255,215,0,0.5); letter-spacing: 2px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }

.lb-empty { text-align: center; padding: 60px 24px; color: rgba(255,255,255,0.4); font-size: 15px; font-weight: 700; }

/* ── Bottom info strip ── */
.lb-info {
  margin: 20px 16px 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
}
.lb-info .pp-hl { color: #ffd700; font-size: 15px; font-weight: 900; }

/* FOOTER */
.footer{border-top:1px solid rgba(255,255,255,0.07);margin-top:60px}
.footer-main{padding:60px 6%;display:grid;grid-template-columns:1.4fr 1fr 1.6fr;gap:40px;max-width:1440px;margin:0 auto}
.footer-tagline{font-family:'Poppins',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9210f6;margin-bottom:16px}
.footer-brand-img{height:48px;width:auto;margin-bottom:12px;border-radius:8px}
.footer-desc{font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.75;max-width:360px;margin-bottom:28px}
.socials{display:flex;gap:10px}
.soc{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:grid;place-items:center;color:#fff;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;text-decoration:none;transition:background .2s}
.soc:hover{background:rgba(146,16,246,0.25)}
.footer-links-title{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9210f6;margin-bottom:20px}
.footer-links{display:flex;flex-direction:column;gap:12px}
.footer-links a{font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none;transition:color .2s}
.footer-links a:hover{color:#fff}
.footer-contact{display:flex;flex-direction:column;gap:10px;margin-top:28px}
.footer-contact a{font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none;transition:color .2s}
.footer-contact a:hover{color:#fff}
.footer-map-wrap{padding:0 6%;max-width:1440px;margin:0 auto}
.footer-map-wrap iframe{width:100%;height:280px;border-radius:16px;border:none}
.footer-bar{border-top:1px solid rgba(255,255,255,0.07);padding:18px 6%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.3);max-width:1440px;margin:0 auto;letter-spacing:.5px}
.footer-bar a{color:rgba(255,255,255,0.3);text-decoration:none;transition:color .2s}
.footer-bar a:hover{color:#fff}

@media (max-width: 520px) {
  .lb-board { border-radius: 20px; }
  .lb-ribbon-text { font-size: 18px; letter-spacing: 2px; }
  .row-name { font-size: 11px; }
  .row-score { font-size: 13px; }
  .footer-main{grid-template-columns:1fr}
}
`;

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsReady, setRowsReady] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [entrancePlayed, setEntrancePlayed] = useState(false);
  const audioRef = useRef(null);

  const initAudio = useCallback(() => {
    const ctx = createAudioCtx();
    audioRef.current = ctx;
    return ctx;
  }, []);

  const playHover = useCallback(() => {
    let ctx = audioRef.current;
    if (!ctx) ctx = initAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    playTone(ctx, 880, "sine", 0.06, 0.04);
  }, [initAudio]);

  const playEntrance = useCallback(() => {
    let ctx = audioRef.current;
    if (!ctx) ctx = initAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    playGrandEntrance(ctx);
    setEntrancePlayed(true);
  }, [initAudio]);

  // Fetch leaderboard
  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Staggered row reveals + single entrance sound
  useEffect(() => {
    if (loading || entries.length === 0) return;
    const top = entries.slice(0, 8);
    setRowsReady(new Array(top.length).fill(false));
    top.forEach((_, i) => {
      setTimeout(() => {
        setRowsReady(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 200 + i * 100);
    });
  }, [loading, entries.length]);

  return (
    <>
      <style>{CSS}</style>
      <div className="lb">

        {/* Nav (LandingPage pill style) */}
        <div className="nav-wrap">
          <nav className="navbar">
            <a href="/" className="logo">
              <img src="/favicon2.png" alt="Promogames" className="logo-mark"
                style={{ borderRadius:'9px', objectFit:'cover' }} />
            </a>
            <ul className="nav-links" style={{ justifySelf:'center' }}>
              <li><a href="/arcade">Play</a></li>
            </ul>
            <a href="/login" className="nav-btn-cta">Signup &amp; Play</a>
            <button className={`ham${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(p => !p)}>
              <span /><span /><span />
            </button>
          </nav>
        </div>

        <div className={`mob-overlay${menuOpen ? ' open' : ''}`}>
          {[{label:"Play",href:"/arcade"},{label:"Leaderboard",href:"/leaderboard"}].map(n => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
          ))}
          <a href="/login" className="mob-cta">Signup &amp; Play</a>
        </div>

        <div className="lb-page">
          <div className="lb-board">

            {/* Logo - click to play entrance melody */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <img
                src="/favicon.png"
                alt="Promogames"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 4px 16px rgba(146,16,246,0.5))',
                  transition: 'transform 0.2s, filter 0.2s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; e.target.style.filter = 'drop-shadow(0 8px 24px rgba(146,16,246,0.7))'; }}
                onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.filter = 'drop-shadow(0 4px 16px rgba(146,16,246,0.5))'; }}
                onClick={playEntrance}
                title={entrancePlayed ? "Promogames" : "Tap to play entrance melody"}
              />
            </div>

            {/* Red ribbon header */}
            <div className="lb-ribbon-wrap">
              <div className="lb-ribbon">
                <span className="lb-ribbon-text">LEADERBOARD</span>
              </div>
            </div>

            {/* Stars */}
            <div className="lb-stars">
              <span className="lb-star">⭐</span>
              <span className="lb-star">⭐</span>
              <span className="lb-star">⭐</span>
            </div>

            {loading ? (
              <div className="lb-loading">
                <div className="lb-spinner" />
                <div className="lb-loading-txt">LOADING...</div>
              </div>
            ) : entries.length === 0 ? (
              <div className="lb-empty">No players yet — be the first! 🎮</div>
            ) : (
              <div className="lb-rows" style={{ position: "relative" }}>
                {entries.slice(0, 8).map((entry, i) => {
                  const rank = i + 1;
                  const style = getRowStyle(rank);
                  const isTop3 = i < 3;
                  return (
                    <div
                      key={entry.player_email || entry.player_name}
                      className={`lb-row${rowsReady[i] ? " visible" : ""}${isTop3 ? " lb-row-top" : ""}`}
                      onMouseEnter={playHover}
                      style={{
                        background: style.bg,
                        boxShadow: style.shadow,
                        border: `2px solid ${style.border}`,
                        transitionDelay: `${i * 0.1}s`,
                      }}
                    >
                      {/* Rank badge */}
                      <div className="row-rank-badge" style={{ background: style.rankBg }}>
                        {rank}
                      </div>

                      {/* Avatar */}
                      <div className="row-avatar">
                        <div className="row-avatar-inner">
                          {INITIALS(entry.player_name)}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="row-name" style={{ color: style.text }}>
                        {entry.player_name}
                      </div>

                      {/* Coin chip with score */}
                      <div className="row-coin-chip">
                        <div className="row-coin-icon">$</div>
                        <div className="row-score">
                          <Counter
                            target={entry.total_pc}
                            duration={900 + i * 80}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Fade mask */}
                {entries.length > 8 && <div className="lb-fade-mask" />}
              </div>
            )}

            {/* PC info strip */}
            <div className="lb-info">
              🎮 Each game = <span className="pp-hl">50 PC</span> · Play more, climb higher
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <p className="footer-tagline">Play Everyday. Win Everyday.</p>
            <img src="/favicon2.png" alt="Promogames" className="footer-brand-img" />
            <p className="footer-desc">
              Quick games, real rewards, and a leaderboard that keeps you coming back. Your reward journey starts here.
            </p>
            <div className="socials">
              {[["in","https://www.linkedin.com"],["f","https://www.facebook.com/profile.php?id=61579982040453"],["𝕏","#"],["▶","#"],["📷","#"]].map(([s, href], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="soc">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-links-title">Quick Links</div>
            <div className="footer-links">
              {FOOTER_NAV.map(([label, href]) => (
                <a key={label} href={href}>{label}</a>
              ))}
            </div>
            <div className="footer-contact">
              <div className="footer-links-title" style={{ marginTop: 24 }}>Get in Touch</div>
              <a href="tel:+916366870248">📞 +91 6366 870 248</a>
              <a href="mailto:offers.promogames@gmail.com">📧 offers.promogames@gmail.com</a>
            </div>
          </div>
          <div>
            <div className="footer-links-title">Our Office</div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15543.255684115567!2d77.548492!3d13.105036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae230b7c2c9c6f%3A0x9b6d0c5e5c5e5c5e!2sVidyaranyapura%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1712345678901!5m2!1sen!2sin"
              width="100%" height="260" style={{ borderRadius: 14, border: 'none' }}
              loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Office Address"
            />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10, lineHeight: 1.6 }}>
              #14 AMS Layout, Near Jelly Machine<br />
              Vidyaranyapura, Bangalore
            </p>
          </div>
        </div>
        <div className="footer-bar">
          <p>© 2026 Promogames. Fun Games. Exciting Gifts.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="#">Terms of Use</a><span>|</span><a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
}