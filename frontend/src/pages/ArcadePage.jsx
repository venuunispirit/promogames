import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prata&family=Karla:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:  #0a0514;
  --purple:  #9210f6;
  --purple2:  #610497;
  --purple3:  #7C3AED;
  --purple4:  #4F46E5;
  --muted: rgba(255,255,255,0.55);
  --fh: 'Prata', serif;
  --fb: 'Karla', sans-serif;
}
html,body{background:var(--bg);color:  #fff;font-family:var(--fb);overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100dvh}
img{display:block;max-width:100%}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--purple);border-radius:3px}

/* SCROLL BAR */
.arc-scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,var(--purple),var(--purple3));width:var(--scroll-pct,0%);transition:width .05s linear;box-shadow:0 0 10px var(--purple)}

/* NAV */
.arc-nav{position:sticky;top:0;z-index:500;background:rgba(10,5,20,0.92);backdrop-filter:blur(24px);border-bottom:1px solid rgba(146,16,246,0.18);padding:0 20px;display:flex;align-items:center;gap:16px;height:54px}
.arc-nav-logo{display:flex;align-items:center;gap:9px;text-decoration:none;flex-shrink:0}
.arc-nav-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--purple2),var(--purple));display:flex;align-items:center;justify-content:center;font-size:15px}
.arc-nav-name{font-family:var(--fh);font-size:13px;color: #fff;letter-spacing:.3px}
.arc-nav-sep{width:1px;height:18px;background:rgba(255,255,255,0.12);flex-shrink:0}
.arc-nav-title{font-family:var(--fb);font-size:12px;font-weight:700;color:var(--purple);letter-spacing:1.5px;text-transform:uppercase}

/* SEARCH in nav */
.arc-nav-search-wrap{flex:1;max-width:320px;position:relative;margin-left:8px}
.arc-nav-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.arc-nav-search{width:100%;padding:7px 14px 7px 34px;border-radius:100px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color: #fff;font-family:var(--fb);font-size:13px;outline:none;transition:border-color .2s}
.arc-nav-search:focus{border-color:rgba(146,16,246,0.5)}
.arc-nav-search::placeholder{color:var(--muted)}

.arc-nav-back{margin-left:auto;display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.7);font-family:var(--fb);font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;transition:background .2s,color .2s;flex-shrink:0}
.arc-nav-back:hover{background:rgba(255,255,255,0.07);color:  #fff}

/* SIDEBAR + CONTENT LAYOUT */
.arc-layout{display:flex;min-height:calc(100dvh - 54px)}

/* SIDEBAR */
.arc-sidebar{width:200px;flex-shrink:0;padding:20px 12px;border-right:1px solid rgba(146,16,246,0.12);position:sticky;top:54px;height:calc(100dvh - 54px);overflow-y:auto}
.arc-sidebar::-webkit-scrollbar{width:0}
.arc-sidebar-label{font-family:var(--fb);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);padding:0 8px;margin-bottom:6px}
.arc-cat-btn{width:100%;display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,0.65);font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;transition:background .18s,color .18s;text-align:left}
.arc-cat-btn:hover{background:rgba(255,255,255,0.06);color: #fff}
.arc-cat-btn.active{background:rgba(146,16,246,0.2);color: #fff}
.arc-cat-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
.arc-sidebar-stats{margin-top:24px;padding:14px 10px;border-radius:10px;background:rgba(146,16,246,0.1);border:1px solid rgba(146,16,246,0.2)}
.arc-stat-row{display:flex;flex-direction:column;gap:1px;margin-bottom:10px}
.arc-stat-row:last-child{margin-bottom:0}
.arc-stat-val{font-family:var(--fh);font-size:18px;color:var(--purple)}
.arc-stat-lbl{font-family:var(--fb);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}

/* MAIN CONTENT */
.arc-main{flex:1;min-width:0;padding:16px 16px 60px}

/* FILTER CHIPS (mobile) */
.arc-chips{display:none;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;scrollbar-width:none}
.arc-chips::-webkit-scrollbar{display:none}
.arc-chip-btn{padding:6px 14px;border-radius:100px;border:1.5px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.6);font-family:var(--fb);font-size:11px;font-weight:700;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}
.arc-chip-btn:hover{border-color:rgba(146,16,246,0.4);color: #fff}
.arc-chip-btn.active{border-color:var(--purple);background:rgba(146,16,246,0.18);color: #fff}

/* SECTION HEADER */
.arc-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.arc-section-label{font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px}
.arc-section-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.07)}
.arc-count-badge{font-family:var(--fb);font-size:10px;color:var(--muted)}

/* POKI-STYLE DENSE GRID */
.arc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}

/* GAME CARD - square thumbnail dominant */
.arc-card{border-radius:10px;overflow:hidden;cursor:pointer;position:relative;animation:arcCardIn .35s cubic-bezier(.22,1,.36,1) both;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s}
@keyframes arcCardIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:none}}
.arc-card:hover{transform:scale(1.04);box-shadow:0 10px 32px rgba(146,16,246,0.28),0 0 0 2px rgba(146,16,246,0.5)}

/* Square image */
.arc-card-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;transition:transform .3s}
.arc-card:hover .arc-card-thumb{transform:scale(1.08)}
.arc-card-fallback{width:100%;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(135deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15));transition:transform .3s}
.arc-card:hover .arc-card-fallback{transform:scale(1.06)}

/* Bottom info strip */
.arc-card-body{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(5,2,12,0.95) 0%,rgba(5,2,12,0.7) 60%,transparent 100%);padding:24px 8px 8px}
.arc-card-name{font-family:var(--fb);font-size:11px;font-weight:700;color: #fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.arc-card-plays{font-family:var(--fb);font-size:9.5px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:3px}

/* Play button overlay */
.arc-card-overlay{position:absolute;inset:0;background:rgba(146,16,246,0.12);opacity:0;transition:opacity .22s;display:flex;align-items:center;justify-content:center}
.arc-card:hover .arc-card-overlay{opacity:1}
.arc-card-play-ico{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);transform:scale(0.5);transition:transform .25s cubic-bezier(.34,1.56,.64,1);margin-bottom:32px}
.arc-card:hover .arc-card-play-ico{transform:scale(1)}

/* Category badge on card */
.arc-card-cat{position:absolute;top:6px;left:6px;font-family:var(--fb);font-size:8.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:2px 7px;border-radius:100px;background:rgba(10,5,20,0.75);border:1px solid rgba(146,16,246,0.4);color: #c084fc;backdrop-filter:blur(6px)}

/* FEATURED ROW (first 3 games bigger) */
.arc-featured{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}
.arc-feat-card{border-radius:12px;overflow:hidden;cursor:pointer;position:relative;animation:arcCardIn .35s cubic-bezier(.22,1,.36,1) both;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s}
.arc-feat-card:hover{transform:scale(1.03);box-shadow:0 12px 36px rgba(146,16,246,0.3),0 0 0 2px rgba(146,16,246,0.5)}
.arc-feat-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;transition:transform .3s}
.arc-feat-card:hover .arc-feat-thumb{transform:scale(1.06)}
.arc-feat-fallback{width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;font-size:56px;background:linear-gradient(135deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15))}
.arc-feat-body{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(5,2,12,0.96) 0%,rgba(5,2,12,0.6) 60%,transparent 100%);padding:32px 12px 10px}
.arc-feat-name{font-family:var(--fh);font-size:13px;color: #fff;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.arc-feat-meta{display:flex;align-items:center;gap:6px}
.arc-feat-cat{font-family:var(--fb);font-size:8.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:2px 7px;border-radius:100px;background:rgba(146,16,246,0.25);border:1px solid rgba(146,16,246,0.4);color: #c084fc}
.arc-feat-plays{font-family:var(--fb);font-size:9.5px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:3px}
.arc-feat-overlay{position:absolute;inset:0;background:rgba(146,16,246,0.12);opacity:0;transition:opacity .22s;display:flex;align-items:center;justify-content:center}
.arc-feat-card:hover .arc-feat-overlay{opacity:1}
.arc-feat-play-ico{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);transform:scale(0.5);transition:transform .25s cubic-bezier(.34,1.56,.64,1);margin-bottom:48px}
.arc-feat-card:hover .arc-feat-play-ico{transform:scale(1)}

/* EMPTY / LOADING */
.arc-empty{text-align:center;padding:80px 20px;grid-column:1/-1}
.arc-empty-ico{font-size:48px;margin-bottom:16px}
.arc-empty-txt{font-family:var(--fb);font-size:15px;color:var(--muted);line-height:1.7}
.arc-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:80px 20px;font-family:var(--fb);font-size:14px;color:var(--muted);grid-column:1/-1}
.arc-spin{width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(146,16,246,0.2);border-top-color:var(--purple);animation:arcSpin .7s linear infinite;flex-shrink:0}
@keyframes arcSpin{to{transform:rotate(360deg)}}

/* GAME MODAL */
.gm-overlay{position:fixed;inset:0;z-index:8000;background:rgba(5,2,12,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:0;animation:gmFadeIn .2s ease both}
@keyframes gmFadeIn{from{opacity:0}to{opacity:1}}
.gm-modal{position:relative;width:100%;height:100dvh;display:flex;flex-direction:column;background: #0a0514;animation:gmSlideUp .28s cubic-bezier(.22,1,.36,1) both;overflow:hidden}
@media(min-width:640px){
  .gm-modal{width:calc(100% - 48px);height:94dvh;max-width:1000px;border-radius:20px;border:1px solid rgba(146,16,246,0.25);box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(146,16,246,0.08)}
}
@keyframes gmSlideUp{from{opacity:0;transform:translateY(30px) scale(0.96)}to{opacity:1;transform:none}}
.gm-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-bottom:1px solid rgba(146,16,246,0.15);flex-shrink:0;min-height:52px}
.gm-bar-cat{font-family:var(--fb);font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.35);color: #c084fc;flex-shrink:0}
.gm-bar-name{font-family:var(--fh);font-size:15px;color: #fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-bar-plays{font-family:var(--fb);font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;flex-shrink:0}
.gm-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:15px;transition:background .2s,transform .2s,color .2s}
.gm-close:hover{background:rgba(255,255,255,0.16);color: #fff;transform:rotate(90deg)}
.gm-iframe-wrap{flex:1;position:relative;overflow:hidden;background: #0a0514;min-height:0}
.gm-iframe{width:100%;height:100%;border:none;display:block}
.gm-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background: #0a0514;z-index:5;transition:opacity .35s,visibility .35s}
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
.gm-chip-name{font-family:var(--fb);font-size:12px;font-weight:700;color: #fff;white-space:nowrap}
.gm-chip-plays{font-family:var(--fb);font-size:10px;color:var(--muted);white-space:nowrap}

@media(max-width:768px){
  .arc-sidebar{display:none}
  .arc-chips{display:flex}
  .arc-featured{grid-template-columns:repeat(2,1fr)}
  .arc-grid{grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px}
  .gm-bar-plays{display:none}
  .arc-nav-search-wrap{max-width:160px}
}
`

const COLORS = [' #9210f6',' #610497',' #7C3AED',' #4F46E5',' #9210f6',' #610497',' #7C3AED',' #4F46E5',' #9210f6',' #610497']

const CAT_ICONS = { quiz: '🧠', trivia: '❓', sport: '⚽', action: '🔥', puzzle: '🧩', arcade: '🕹️', all: '🎮' }
const getCatIcon = (cat) => CAT_ICONS[cat?.toLowerCase()] || '🎮'

function GameModal({ game, allGames, onClose, onSwitch }) {
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef(null)
  const isLoggedIn = !!(localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken'))
  const src = `/play/${game.slug}/${game.client_slug}?source=${isLoggedIn ? 'player' : 'direct'}`

  useEffect(() => { setLoaded(false) }, [game.id])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const others = allGames.filter(g => g.id !== game.id)

  return (
    <div className="gm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="gm-modal">
        <div className="gm-bar">
          <span className="gm-bar-cat">{game.category || 'Quiz'}</span>
          <span className="gm-bar-name">{game.name}</span>
          <span className="gm-bar-plays">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {(game.play_count || 0).toLocaleString()} plays
          </span>
          <button className="gm-close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>
        <div className="gm-iframe-wrap">
          <div className={`gm-loader${loaded ? ' gone' : ''}`}>
            <div className="gm-loader-ring" />
            <div className="gm-loader-txt">Loading {game.name}…</div>
          </div>
          <iframe
            ref={iframeRef}
            key={game.id}
            src={src}
            className="gm-iframe"
            title={game.name}
            allow="fullscreen"
            onLoad={() => setLoaded(true)}
          />
        </div>
        {others.length > 0 && (
          <div className="gm-strip">
            <span className="gm-strip-label">More Games</span>
            {others.map((g, i) => (
              <div key={g.id} className={`gm-chip${g.id === game.id ? ' active-chip' : ''}`} onClick={() => onSwitch(g)}>
                {g.game_logo_url || g.bg_image_url
                  ? <img className="gm-chip-thumb" src={g.game_logo_url || g.bg_image_url} alt={g.name} loading="lazy" />
                  : <div className="gm-chip-fallback" style={{ background: `${COLORS[i % COLORS.length]}33` }}>🎮</div>
                }
                <div className="gm-chip-info">
                  <span className="gm-chip-name">{g.name}</span>
                  <span className="gm-chip-plays">{(g.play_count || 0).toLocaleString()} plays</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeatCard({ game, index, onPlay }) {
  return (
    <div className="arc-feat-card" style={{ animationDelay: `${index * 60}ms` }} onClick={() => onPlay(game)}>
      {game.game_logo_url || game.bg_image_url
        ? <img className="arc-feat-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
        : <div className="arc-feat-fallback">🎮</div>
      }
      <div className="arc-feat-body">
        <div className="arc-feat-name">{game.name}</div>
        <div className="arc-feat-meta">
          <span className="arc-feat-cat">{game.category || 'Quiz'}</span>
          <span className="arc-feat-plays">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {(game.play_count || 0).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="arc-feat-overlay">
        <div className="arc-feat-play-ico">
          <svg width="18" height="18" viewBox="0 0 24 24" fill=" #9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  )
}

function GameCard({ game, index, onPlay }) {
  return (
    <div className="arc-card" style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }} onClick={() => onPlay(game)}>
      {game.game_logo_url || game.bg_image_url
        ? <img className="arc-card-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
        : <div className="arc-card-fallback">🎮</div>
      }
      <span className="arc-card-cat">{game.category || 'Quiz'}</span>
      <div className="arc-card-body">
        <div className="arc-card-name">{game.name}</div>
        <div className="arc-card-plays">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {(game.play_count || 0).toLocaleString()}
        </div>
      </div>
      <div className="arc-card-overlay">
        <div className="arc-card-play-ico">
          <svg width="16" height="16" viewBox="0 0 24 24" fill=" #9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  )
}

export default function ArcadePage() {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [activeGame, setActiveGame] = useState(null)

  useEffect(() => {
    fetch('/api/play/play-page-games')
      .then(r => r.json())
      .then(d => { if (d.success) setGames(d.games || []) })
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

  const categories = ['all', ...Array.from(new Set(games.map(g => g.category).filter(Boolean)))]
  const totalPlays = games.reduce((a, g) => a + (g.play_count || 0), 0)

  const filtered = games.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || g.category === filterCat
    return matchSearch && matchCat
  })

  // Split: first 3 as featured (wide cards), rest as dense grid
  const featured = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  const handlePlay = useCallback((game) => setActiveGame(game), [])
  const handleSwitch = useCallback((game) => setActiveGame(game), [])
  const handleClose = useCallback(() => setActiveGame(null), [])

  return (
    <>
      <style>{CSS}</style>
      <div className="arc-scroll-bar" />

      {/* NAV */}
      <nav className="arc-nav">
        <a href="/" className="arc-nav-logo">
          <div className="arc-nav-mark">🎮</div>
          <span className="arc-nav-name">Promogames</span>
        </a>
        <div className="arc-nav-sep" />
        <span className="arc-nav-title">Arcade</span>
        <div className="arc-nav-search-wrap">
          <span className="arc-nav-search-ico">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            className="arc-nav-search"
            placeholder="Search games…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <a href="/" className="arc-nav-back">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Home
        </a>
      </nav>

      <div className="arc-layout">
        {/* SIDEBAR */}
        <aside className="arc-sidebar">
          <div className="arc-sidebar-label" style={{marginBottom:10}}>Categories</div>
          {categories.map(cat => (
            <button
              key={cat}
              className={`arc-cat-btn${filterCat === cat ? ' active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              <span className="arc-cat-icon">{getCatIcon(cat)}</span>
              {cat === 'all' ? 'All Games' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}

          {!loading && (
            <div className="arc-sidebar-stats">
              <div className="arc-stat-row">
                <span className="arc-stat-val">{games.length}</span>
                <span className="arc-stat-lbl">Games</span>
              </div>
              <div className="arc-stat-row">
                <span className="arc-stat-val">{totalPlays.toLocaleString()}</span>
                <span className="arc-stat-lbl">Total Plays</span>
              </div>
              <div className="arc-stat-row">
                <span className="arc-stat-val" style={{color:' #22c55e'}}>Free</span>
                <span className="arc-stat-lbl">Always</span>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="arc-main">
          {/* Mobile filter chips */}
          <div className="arc-chips">
            {categories.map(cat => (
              <button
                key={cat}
                className={`arc-chip-btn${filterCat === cat ? ' active' : ''}`}
                onClick={() => setFilterCat(cat)}
              >
                {getCatIcon(cat)} {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="arc-loading"><div className="arc-spin" /> Loading games…</div>
          ) : filtered.length === 0 ? (
            <div className="arc-empty">
              <div className="arc-empty-ico">🎮</div>
              <div className="arc-empty-txt">
                {search ? `No games matching "${search}"` : 'No games available right now — check back soon!'}
              </div>
            </div>
          ) : (
            <>
              {/* Featured row */}
              {featured.length > 0 && !search && (
                <>
                  <div className="arc-section-head" style={{marginBottom:10}}>
                    <div className="arc-section-label" style={{flex:1}}>
                      {filterCat === 'all' ? '⭐ Featured' : `${getCatIcon(filterCat)} ${filterCat.charAt(0).toUpperCase() + filterCat.slice(1)}`}
                    </div>
                    <span className="arc-count-badge">{filtered.length} game{filtered.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="arc-featured">
                    {featured.map((game, i) => (
                      <FeatCard key={game.id} game={game} index={i} onPlay={handlePlay} />
                    ))}
                  </div>
                </>
              )}

              {/* Dense grid */}
              {(rest.length > 0 || search) && (
                <>
                  <div className="arc-section-head" style={{margin:'16px 0 10px'}}>
                    <div className="arc-section-label" style={{flex:1}}>
                      {search ? `Results for "${search}"` : 'All Games'}
                    </div>
                    {search && <span className="arc-count-badge">{filtered.length} found</span>}
                  </div>
                  <div className="arc-grid">
                    {(search ? filtered : rest).map((game, i) => (
                      <GameCard key={game.id} game={game} index={i} onPlay={handlePlay} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {activeGame && (
        <GameModal
          game={activeGame}
          allGames={games}
          onClose={handleClose}
          onSwitch={handleSwitch}
        />
      )}
    </>
  )
}