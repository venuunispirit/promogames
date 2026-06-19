import { useState, useEffect, useRef, useCallback } from 'react'
import GameModal from '../components/GameModal'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07040f;
  --bg2:#0d0820;
  --purple:#9210f6;
  --purple2:#610497;
  --purple3:#7C3AED;
  --purple4:#4F46E5;
  --accent:#c040ff;
  --gold:#f5c842;
  --glass:rgba(255,255,255,0.05);
  --gb:rgba(255,255,255,0.10);
  --muted:rgba(255,255,255,0.52);
  --fh:'Bebas Neue',sans-serif;
  --fb:'DM Sans',sans-serif;
  --fm:'Space Mono',monospace;
}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--purple);border-radius:3px}

/* SCROLL BAR */
.arc-scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,var(--purple),var(--purple3));width:var(--scroll-pct,0%);transition:width .05s linear;box-shadow:0 0 10px var(--purple)}

/* NAV (LandingPage style) */
.nav-wrap{position:fixed;top:0;left:0;right:0;z-index:1000;padding:18px 0;pointer-events:none;display:flex;justify-content:center}
.navbar{pointer-events:all;width:62%;max-width:700px;min-width:580px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding:11px 20px 11px 18px;border-radius:100px;background:rgba(7,4,15,0.88);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(146,16,246,0.22);box-shadow:0 8px 48px rgba(0,0,0,0.60)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-mark{width:auto;height:60px;border-radius:9px;flex-shrink:0;background:transparent;display:grid;place-items:center;font-family:var(--fb);font-weight:800;font-size:18px;margin-right:0}
.logo-name{font-family:var(--fh);font-weight:400;font-size:20px;color:#fff;white-space:nowrap;letter-spacing:2px}
.nav-links{list-style:none;display:flex;gap:26px;align-items:center}
.nav-links a{font-family:var(--fb);font-size:14px;font-weight:600;color:var(--muted);text-decoration:none;position:relative;transition:color .22s}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:linear-gradient(90deg,var(--purple),var(--purple3));transition:width .25s}
.nav-links a:hover{color:#fff}
.nav-links a:hover::after{width:100%}
.nav-btn-cta{position:relative;overflow:hidden;display:inline-flex;align-items:center;height:38px;padding:0 22px;border-radius:100px;border:none;background:linear-gradient(90deg,var(--purple2),var(--purple));text-decoration:none;font-family:var(--fb);font-weight:700;font-size:13px;color:#fff!important;transition:opacity .2s;margin-left:0}
.nav-btn-cta:hover{opacity:.85;color:#fff!important}
.nav-btn-cta::after{display:none!important}
.ham{display:none;flex-direction:column;gap:5px;background:none;border:none;padding:4px}
.ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s}
.ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ham.open span:nth-child(2){opacity:0}
.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mob-overlay{display:none;position:fixed;inset:0;top:74px;background:rgba(7,4,15,0.97);backdrop-filter:blur(20px);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:30px}
.mob-overlay.open{display:flex}
.mob-overlay a{font-family:var(--fh);font-size:26px;color:#fff;text-decoration:none;opacity:.80;transition:opacity .2s;letter-spacing:2px}
.mob-overlay a:hover{opacity:1}
.mob-cta{margin-top:8px;padding:14px 40px;border-radius:100px;background:linear-gradient(90deg,var(--purple2),var(--purple));color:#fff;font-family:var(--fb);font-size:17px;font-weight:700;text-decoration:none}

/* CONTENT */
.arc-content{padding-top:100px;padding-bottom:40px;min-height:100vh}

/* NETFLIX ROWS */
.arc-row{margin-bottom:36px;padding:0 4%}
.arc-row-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;padding:0 4px}
.arc-row-label{font-family:var(--fh);font-size:clamp(22px,2.8vw,36px);font-weight:400;letter-spacing:2px;color:#fff;display:flex;align-items:center;gap:12px}
.arc-row-count{font-family:var(--fm);font-size:11px;color:var(--muted);font-weight:400;letter-spacing:1px}
.arc-row-seeall{font-family:var(--fb);font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;transition:color .2s}
.arc-row-seeall:hover{color:var(--accent)}
.arc-row-track{display:flex;gap:10px;overflow-x:auto;padding:4px 0 12px;scrollbar-width:none;-ms-overflow-style:none;scroll-behavior:smooth}
.arc-row-track::-webkit-scrollbar{display:none}

/* ROW CARD */
.arc-row-card{flex-shrink:0;width:200px;border-radius:12px;overflow:hidden;cursor:pointer;position:relative;animation:arcCardIn .35s cubic-bezier(.22,1,.36,1) both;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s}
.arc-row-card:hover{transform:scale(1.06);box-shadow:0 10px 32px rgba(146,16,246,0.28),0 0 0 2px rgba(146,16,246,0.5)}
@keyframes arcCardIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:none}}
.arc-row-thumb{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;transition:transform .3s}
.arc-row-card:hover .arc-row-thumb{transform:scale(1.08)}
.arc-row-fallback{width:100%;aspect-ratio:2/3;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(135deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15));transition:transform .3s}
.arc-row-card:hover .arc-row-fallback{transform:scale(1.06)}
.arc-row-rank{position:absolute;top:6px;left:6px;font-family:var(--fh);font-size:32px;line-height:1;color:rgba(255,255,255,0.9);text-shadow:0 2px 12px rgba(0,0,0,0.7);-webkit-text-stroke:1px rgba(0,0,0,0.3)}
.arc-row-rank.gold{color:var(--gold)}
.arc-row-rank.silver{color:#c0c0c0}
.arc-row-rank.bronze{color:#cd7f32}
.arc-row-body{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(5,2,12,0.95) 0%,rgba(5,2,12,0.7) 60%,transparent 100%);padding:36px 8px 8px}
.arc-row-name{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.arc-row-meta{font-family:var(--fb);font-size:10px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:4px}
.arc-row-cat{position:absolute;top:6px;right:6px;font-family:var(--fb);font-size:8.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:2px 7px;border-radius:100px;background:rgba(10,5,20,0.75);border:1px solid rgba(146,16,246,0.4);color:#c084fc;backdrop-filter:blur(6px)}
.arc-row-play-overlay{position:absolute;inset:0;background:rgba(146,16,246,0.12);opacity:0;transition:opacity .22s;display:flex;align-items:center;justify-content:center}
.arc-row-card:hover .arc-row-play-overlay{opacity:1}
.arc-row-play-ico{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);transform:scale(0.5);transition:transform .25s cubic-bezier(.34,1.56,.64,1);margin-bottom:32px}
.arc-row-card:hover .arc-row-play-ico{transform:scale(1)}

/* EMPTY / LOADING */
.arc-empty{text-align:center;padding:80px 20px}
.arc-empty-ico{font-size:48px;margin-bottom:16px}
.arc-empty-txt{font-family:var(--fb);font-size:15px;color:var(--muted);line-height:1.7}
.arc-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:80px 20px;font-family:var(--fb);font-size:14px;color:var(--muted)}
.arc-spin{width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(146,16,246,0.2);border-top-color:var(--purple);animation:arcSpin .7s linear infinite;flex-shrink:0}
@keyframes arcSpin{to{transform:rotate(360deg)}}

/* GAME MODAL (unchanged) */
.gm-overlay{position:fixed;inset:0;z-index:8000;background:rgba(5,2,12,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:0;animation:gmFadeIn .2s ease both}
@keyframes gmFadeIn{from{opacity:0}to{opacity:1}}
.gm-modal{position:relative;width:100%;height:100dvh;display:flex;flex-direction:column;background:#0a0514;animation:gmSlideUp .28s cubic-bezier(.22,1,.36,1) both;overflow:hidden}
@media(min-width:640px){
  .gm-modal{width:calc(100% - 48px);height:94dvh;max-width:1000px;border-radius:20px;border:1px solid rgba(146,16,246,0.25);box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(146,16,246,0.08)}
}
@keyframes gmSlideUp{from{opacity:0;transform:translateY(30px) scale(0.96)}to{opacity:1;transform:none}}
.gm-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-bottom:1px solid rgba(146,16,246,0.15);flex-shrink:0;min-height:52px}
.gm-bar-cat{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.35);color:#c084fc;flex-shrink:0}
.gm-bar-name{font-family:var(--fb);font-size:15px;color:#fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-bar-plays{font-family:var(--fb);font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;flex-shrink:0}
.gm-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:15px;transition:background .2s,transform .2s,color .2s}
.gm-close:hover{background:rgba(255,255,255,0.16);color:#fff;transform:rotate(90deg)}
.gm-iframe-wrap{flex:1;position:relative;overflow:hidden;background:#0a0514;min-height:0}
.gm-iframe{width:100%;height:100%;border:none;display:block}
.gm-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0a0514;z-index:5;transition:opacity .35s,visibility .35s}
.gm-loader.gone{opacity:0;visibility:hidden}
.gm-loader-ring{width:40px;height:40px;border-radius:50%;border:3px solid rgba(146,16,246,0.18);border-top-color:var(--purple);animation:arcSpin .75s linear infinite}
.gm-loader-txt{font-family:var(--fb);font-size:13px;color:var(--muted)}
.gm-strip{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-top:1px solid rgba(146,16,246,0.10);overflow-x:auto;flex-shrink:0;scrollbar-width:none;min-height:58px}
.gm-strip::-webkit-scrollbar{display:none}
.gm-strip-label{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);white-space:nowrap;flex-shrink:0}
.gm-chip{display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);cursor:pointer;transition:background .2s,border-color .2s;flex-shrink:0}
.gm-chip:hover{background:rgba(146,16,246,0.18);border-color:rgba(146,16,246,0.4)}
.gm-chip.active-chip{background:rgba(146,16,246,0.22);border-color:rgba(146,16,246,0.5)}
.gm-chip-thumb{width:28px;height:28px;border-radius:6px;object-fit:cover;flex-shrink:0}
.gm-chip-fallback{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.gm-chip-info{display:flex;flex-direction:column;gap:1px}
.gm-chip-name{font-family:var(--fb);font-size:12px;font-weight:700;color:#fff;white-space:nowrap}
.gm-chip-plays{font-family:var(--fb);font-size:10px;color:var(--muted);white-space:nowrap}

/* FOOTER (LandingPage style) */
.footer{border-top:1px solid rgba(255,255,255,0.07);margin-top:60px}
.footer-main{padding:60px 6%;display:grid;grid-template-columns:1.4fr 1fr 1.6fr;gap:40px;max-width:1440px;margin:0 auto}
.footer-brand-name{font-family:var(--fh);font-size:32px;letter-spacing:4px;margin-bottom:8px}
.footer-tagline{font-family:var(--fm);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.footer-desc{font-family:var(--fb);font-size:14px;color:var(--muted);line-height:1.75;max-width:360px;margin-bottom:28px}
.socials{display:flex;gap:10px}
.soc{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid var(--gb);display:grid;place-items:center;color:#fff;font-family:var(--fb);font-size:12px;font-weight:700;text-decoration:none;transition:background .2s}
.soc:hover{background:rgba(146,16,246,0.25)}
.footer-links-title{font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
.footer-links{display:flex;flex-direction:column;gap:12px}
.footer-links a{font-family:var(--fb);font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-links a:hover{color:#fff}
.footer-contact{display:flex;flex-direction:column;gap:10px;margin-top:28px}
.footer-contact a{font-family:var(--fb);font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-contact a:hover{color:#fff}
.footer-map{border-top:1px solid rgba(255,255,255,0.07);padding:40px 6%;max-width:1440px;margin:0 auto}
.footer-map iframe{width:100%;height:280px;border-radius:16px;border:none}
.footer-bar{border-top:1px solid rgba(255,255,255,0.07);padding:18px 6%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-family:var(--fm);font-size:11px;color:rgba(255,255,255,0.3);max-width:1440px;margin:0 auto;letter-spacing:.5px}
.footer-bar a{color:rgba(255,255,255,0.3);text-decoration:none;transition:color .2s}
.footer-bar a:hover{color:#fff}

@media(max-width:1100px){.navbar{width:78%}}
@media(max-width:900px){
  .nav-links,.nav-btn-cta{display:none}
  .ham{display:flex}
  .nav-wrap{padding:12px 20px;display:block}
  .navbar{width:100%;max-width:100%;min-width:unset;padding:10px 20px;border-radius:18px}
  .arc-row-track{gap:8px}
  .arc-row-card{width:160px}
  .footer-main{grid-template-columns:1fr}
}
@media(max-width:640px){
  .arc-row-card{width:140px}
  .arc-row-rank{font-size:24px}
}
`

const COLORS = ['#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497']

const NAV = [
  { label: "Leaderboard", href: "/leaderboard" },
]



function RowCard({ game, index, rank, onPlay }) {
  const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
  return (
    <div className="arc-row-card" style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }} onClick={() => onPlay(game)}>
      {game.game_logo_url || game.bg_image_url
        ? <img className="arc-row-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
        : <div className="arc-row-fallback">🎮</div>
      }
      {rank && <span className={`arc-row-rank ${rankClass}`}>#{rank}</span>}
      <span className="arc-row-cat">{game.category || 'Quiz'}</span>
      <div className="arc-row-body">
        <div className="arc-row-name">{game.name}</div>
        <div className="arc-row-meta">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {(game.play_count || 0).toLocaleString()}
        </div>
      </div>
      <div className="arc-row-play-overlay">
        <div className="arc-row-play-ico">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  )
}

export default function ArcadePage() {
  const [games, setGames] = useState([])
  const [featured, setFeatured] = useState([])
  const [promogames, setPromogames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/play/play-page-games')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setGames(d.games || [])
          setFeatured(d.featured || [])
          setPromogames(d.promogames || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      document.documentElement.style.setProperty('--scroll-pct', `${pct}%`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePlay = useCallback((game) => setActiveGame(game), [])
  const handleSwitch = useCallback((game) => setActiveGame(game), [])
  const handleClose = useCallback(() => setActiveGame(null), [])

  const allGames = [...featured, ...promogames]

  return (
    <>
      <style>{CSS}</style>
      <div className="arc-scroll-bar" />

      {/* NAV (LandingPage style) */}
      <div className="nav-wrap">
        <nav className="navbar">
          <a href="/" className="logo">
            <img src="/favicon2.png" alt="Promogames" className="logo-mark"
              style={{ borderRadius:'9px', objectFit:'cover' }} />
          </a>
          <ul className="nav-links" style={{ justifySelf:'center' }}>
            {NAV.map(n => <li key={n.label}><a href={n.href}>{n.label}</a></li>)}
          </ul>
          <a href="/login" className="nav-btn-cta">Signup &amp; Play</a>
          <button className={`ham${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(p => !p)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      <div className={`mob-overlay${menuOpen ? ' open' : ''}`}>
        {[{label:"Play",href:"/arcade"},...NAV].map(n => <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
        <a href="/login" className="mob-cta">Signup &amp; Play</a>
      </div>

      {/* CONTENT */}
      <div className="arc-content">
        {loading ? (
          <div className="arc-loading" style={{ paddingTop:140 }}><div className="arc-spin" /> Loading games…</div>
        ) : allGames.length === 0 ? (
          <div className="arc-empty" style={{ paddingTop:140 }}>
            <div className="arc-empty-ico">🎮</div>
            <div className="arc-empty-txt">No games available right now — check back soon!</div>
          </div>
        ) : (
          <>
            {/* Row 1: Featured Games (hero games with rank badges) */}
            {featured.length > 0 && (
              <div className="arc-row">
                <div className="arc-row-header">
                  <div className="arc-row-label">
                    🏆 Featured Games
                    <span className="arc-row-count">{featured.length} games</span>
                  </div>
                </div>
                <div className="arc-row-track">
                  {featured.map((game, i) => (
                    <RowCard key={game.id} game={game} index={i} rank={i + 1} onPlay={handlePlay} />
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: PromoGames */}
            {promogames.length > 0 && (
              <div className="arc-row">
                <div className="arc-row-header">
                  <div className="arc-row-label">
                    🎮 PromoGames
                    <span className="arc-row-count">{promogames.length} games</span>
                  </div>
                </div>
                <div className="arc-row-track">
                  {promogames.map((game, i) => (
                    <RowCard key={game.id} game={game} index={i} rank={i + 1} onPlay={handlePlay} />
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: if no featured/promogames, show all as one row */}
            {featured.length === 0 && promogames.length === 0 && games.length > 0 && (
              <div className="arc-row">
                <div className="arc-row-header">
                  <div className="arc-row-label">
                    🎮 All Games
                    <span className="arc-row-count">{games.length} games</span>
                  </div>
                </div>
                <div className="arc-row-track">
                  {games.map((game, i) => (
                    <RowCard key={game.id} game={game} index={i} rank={null} onPlay={handlePlay} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER (LandingPage style) */}
      <footer className="footer" id="contact">
        <div className="footer-main">
          <div>
            <p className="footer-tagline">Play Everyday. Win Everyday.</p>
            <img src="/favicon2.png" alt="Promogames" style={{ height: 48, width: 'auto', marginBottom: 12, borderRadius: 8 }} />
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
              {[["Play Now","/arcade"],["Leaderboard","/leaderboard"],["Business","/business"],["Log In","/login"]].map(([label, href]) => (
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
            <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
              #14 AMS Layout, Near Jelly Machine<br />
              Vidyaranyapura, Bangalore
            </p>
          </div>
        </div>
        <div className="footer-bar" style={{ width:'100%' }}>
          <p>© 2026 Promogames. Fun Games. Exciting Gifts.</p>
          <div style={{ display:'flex', gap:8 }}>
            <a href="#">Terms of Use</a><span>|</span><a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {activeGame && (
        <GameModal
          game={activeGame}
          allGames={allGames}
          onClose={handleClose}
          onSwitch={handleSwitch}
          isLoggedIn={!!(localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken'))}
        />
      )}
    </>
  )
}