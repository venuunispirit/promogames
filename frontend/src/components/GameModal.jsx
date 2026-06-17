import { useState, useEffect, useRef } from 'react'

const COLORS = ['#9210f6', '#610497', '#7C3AED', '#4F46E5', '#9210f6', '#610497', '#7C3AED', '#4F46E5', '#9210f6', '#610497']

function GameModal({ game, allGames, onClose, onSwitch, isLoggedIn }) {
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef(null)
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

export default GameModal