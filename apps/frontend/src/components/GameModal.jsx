import { useState, useEffect, useRef } from 'react'

const COLORS = ['#9210f6', '#610497', '#7C3AED', '#4F46E5', '#9210f6', '#610497', '#7C3AED', '#4F46E5', '#9210f6', '#610497']

const STYLES = `
  .gm-overlay{position:fixed;inset:0;z-index:8000;background:rgba(5,2,12,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:0;animation:gmFadeIn .2s ease both}
  @keyframes gmFadeIn{from{opacity:0}to{opacity:1}}
  .gm-modal{position:relative;width:100%;height:100dvh;display:flex;flex-direction:column;background:#0a0514;animation:gmSlideUp .28s cubic-bezier(.22,1,.36,1) both;overflow:hidden}
  @media(min-width:640px){
    .gm-modal{width:calc(100% - 48px);height:94dvh;max-width:1000px;border-radius:20px;border:1px solid rgba(146,16,246,0.25);box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(146,16,246,0.08)}
  }
  @keyframes gmSlideUp{from{opacity:0;transform:translateY(30px) scale(0.96)}to{opacity:1;transform:none}}
  .gm-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-bottom:1px solid rgba(146,16,246,0.15);flex-shrink:0;min-height:52px}
  .gm-bar-cat{font-family:'Karla',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.35);color:#c084fc;flex-shrink:0}
  .gm-bar-name{font-family:'Karla',sans-serif;font-size:15px;color:#fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gm-bar-plays{font-family:'Karla',sans-serif;font-size:11px;color:rgba(255,255,255,0.58);display:flex;align-items:center;gap:4px;flex-shrink:0}
  .gm-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:15px;transition:background .2s,transform .2s,color .2s}
  .gm-close:hover{background:rgba(255,255,255,0.16);color:#fff;transform:rotate(90deg)}
  .gm-iframe-wrap{flex:1;position:relative;overflow:hidden;background:#0a0514;min-height:0}
  .gm-iframe{width:100%;height:100%;border:none;display:block}
  .gm-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0a0514;z-index:5;transition:opacity .35s,visibility .35s}
  .gm-loader.gone{opacity:0;visibility:hidden}
  .gm-loader-ring{width:40px;height:40px;border-radius:50%;border:3px solid rgba(146,16,246,0.18);border-top-color:#9210f6;animation:gmSpin .75s linear infinite}
  @keyframes gmSpin{to{transform:rotate(360deg)}}
  .gm-loader-txt{font-family:'Karla',sans-serif;font-size:13px;color:rgba(255,255,255,0.58)}
  .gm-strip{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-top:1px solid rgba(146,16,246,0.10);overflow-x:auto;flex-shrink:0;scrollbar-width:none;min-height:58px}
  .gm-strip::-webkit-scrollbar{display:none}
  .gm-strip-label{font-family:'Karla',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.58);white-space:nowrap;flex-shrink:0}
  .gm-chip{display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);cursor:pointer;transition:background .2s,border-color .2s;flex-shrink:0}
  .gm-chip:hover{background:rgba(146,16,246,0.18);border-color:rgba(146,16,246,0.4)}
  .gm-chip.active-chip{background:rgba(146,16,246,0.22);border-color:rgba(146,16,246,0.5)}
  .gm-chip-thumb{width:28px;height:28px;border-radius:6px;object-fit:cover;flex-shrink:0}
  .gm-chip-fallback{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
  .gm-chip-info{display:flex;flex-direction:column;gap:1px}
  .gm-chip-name{font-family:'Karla',sans-serif;font-size:12px;font-weight:700;color:#fff;white-space:nowrap}
  .gm-chip-plays{font-family:'Karla',sans-serif;font-size:10px;color:rgba(255,255,255,0.58);white-space:nowrap}
`

function GameModal({ game, allGames, onClose, onSwitch, isLoggedIn }) {
  const [loaded, setLoaded] = useState(false)
  const [playCount, setPlayCount] = useState(game.play_count || 0)
  const iframeRef = useRef(null)
  const src = `/play/${game.slug}/${game.client_slug}?source=${isLoggedIn ? 'player' : 'direct'}`

  useEffect(() => { setLoaded(false); setPlayCount(game.play_count || 0) }, [game.id])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`/api/play/game/${game.id}/play-count`)
        const d = await r.json()
        if (d.play_count !== undefined) setPlayCount(d.play_count)
      } catch {}
    }, 10000)
    return () => clearInterval(poll)
  }, [game.id])

  const others = allGames.filter(g => g.id !== game.id)

  return (
    <>
      <style>{STYLES}</style>
      <div className="gm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="gm-modal">
          <div className="gm-bar">
            <span className="gm-bar-cat">{game.category || 'Quiz'}</span>
            <span className="gm-bar-name">{game.name}</span>
            <span className="gm-bar-plays">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {playCount.toLocaleString()} plays
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
    </>
  )
}

export default GameModal
