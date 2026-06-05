import { useState, useEffect, useRef } from "react";

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
function playCrowdCheer(ctx) {
  if (!ctx) return;
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    playTone(ctx, f, "sine", 0.35, 0.15, i * 0.06);
    playTone(ctx, f * 1.5, "sine", 0.25, 0.08, i * 0.06 + 0.1);
  });
}
function playRankReveal(ctx, rank) {
  if (!ctx) return;
  const freqs = { 1: [784, 1047, 1319, 1568], 2: [659, 880, 1047, 1319], 3: [523, 659, 784, 1047] };
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

const INITIALS = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

/* ── Animated counter (preserved exactly) ── */
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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; }

.lb {
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #1a1228 40%, #0d0c1a 100%);
  font-family: 'Nunito', sans-serif;
  color: #fff;
  overflow-x: hidden;
}

/* ── Nav ── */
.lb-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 28px;
  background: rgba(15, 10, 30, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(255,200,50,0.2);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
}
.lb-nav img { width: 30px; height: 30px; border-radius: 8px; }
.lb-nav-brand {
  font-family: 'Fredoka One', cursive;
  font-size: 18px;
  color: #ffd700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(255,215,0,0.4);
}
.lb-nav-back {
  margin-left: auto;
  font-size: 13px; font-weight: 800;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: color .2s;
  letter-spacing: .3px;
  background: rgba(255,255,255,0.07);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
}
.lb-nav-back:hover { color: #ffd700; border-color: rgba(255,215,0,0.3); }

/* ── Page wrapper ── */
.lb-page { display: flex; flex-direction: column; align-items: center; padding: 40px 16px 80px; }

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
  font-family: 'Fredoka One', cursive;
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
.lb-row:hover { transform: scale(1.025) translateX(2px); }

.row-rank-badge {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  font-family: 'Fredoka One', cursive;
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
  font-family: 'Fredoka One', cursive;
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
  font-family: 'Fredoka One', cursive;
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

@media (max-width: 520px) {
  .lb-board { border-radius: 20px; }
  .lb-ribbon-text { font-size: 18px; letter-spacing: 2px; }
  .row-name { font-size: 11px; }
  .row-score { font-size: 13px; }
}
`;

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsReady, setRowsReady] = useState([]);
  const audioRef = useRef(null);

  // Init audio
  useEffect(() => {
    audioRef.current = createAudioCtx();
    const init = () => {
      if (!audioRef.current || audioRef.current.state === "suspended") {
        audioRef.current = createAudioCtx();
      }
    };
    window.addEventListener("click", init, { once: true });
  }, []);

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

  // Staggered row reveals + sounds
  useEffect(() => {
    if (loading || entries.length === 0) return;
    playGrandEntrance(audioRef.current);
    setRowsReady(new Array(entries.length).fill(false));
    entries.forEach((_, i) => {
      setTimeout(() => {
        setRowsReady(prev => { const n = [...prev]; n[i] = true; return n; });
        playRowPop(audioRef.current, i);
        if (i === 0) {
          setTimeout(() => playRankReveal(audioRef.current, 1), 100);
          setTimeout(() => playCrowdCheer(audioRef.current), 400);
        } else if (i === 1) setTimeout(() => playRankReveal(audioRef.current, 2), 100);
        else if (i === 2) setTimeout(() => playRankReveal(audioRef.current, 3), 100);
      }, 300 + i * 120);
    });
  }, [loading, entries.length]);

  return (
    <>
      <style>{CSS}</style>
      <div className="lb">

        {/* Nav bar (preserved from original) */}
        <nav className="lb-nav">
          <img src="/favicon.png" alt="Promogames" />
          <span className="lb-nav-brand">Promogames</span>
          <a href="/" className="lb-nav-back">← Back to Home</a>
        </nav>

        <div className="lb-page">
          <div className="lb-board">

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
                {entries.map((entry, i) => {
                  const rank = i + 1;
                  const style = getRowStyle(rank);
                  const isBottom3 = i >= entries.length - 2;
                  return (
                    <div
                      key={entry.player_email || entry.player_name}
                      className={`lb-row${rowsReady[i] ? " visible" : ""}`}
                      style={{
                        background: style.bg,
                        boxShadow: style.shadow,
                        border: `2px solid ${style.border}`,
                        transitionDelay: `${i * 0.06}s`,
                        opacity: rowsReady[i] ? (isBottom3 ? Math.max(0.3, 1 - (i - (entries.length - 3)) * 0.25) : 1) : 0,
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
                            target={entry.promo_points}
                            duration={900 + i * 80}
                            onTick={() => playCountUp(audioRef.current)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Fade mask at bottom like reference */}
                {entries.length > 6 && <div className="lb-fade-mask" />}
              </div>
            )}

            {/* PP info strip */}
            <div className="lb-info">
              🎮 Each game = <span className="pp-hl">50 PP</span> · Play more, climb higher
            </div>

          </div>
        </div>
      </div>
    </>
  );
}