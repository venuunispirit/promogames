import { useState, useEffect } from 'react'
import api from '../api'

export default function BOGames() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/business/games').then(r => {
      setGames(r.data.games || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color:'rgba(167,139,250,0.5)', textAlign:'center', padding:40 }}>Loading...</div>

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', color:'#f8fafc' }}>
      <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 4px', background:'linear-gradient(135deg,#c084fc,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        My Games
      </h1>
      <p style={{ color:'rgba(167,139,250,0.4)', fontSize:13, marginBottom:20 }}>Games linked to your business</p>
      {games.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'rgba(167,139,250,0.3)', fontSize:14 }}>
          No games linked to your account yet.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {games.map(g => (
            <div key={g.id} style={{
              background:'rgba(20,10,40,0.85)', border:'1px solid rgba(139,92,246,0.1)',
              borderRadius:16, padding:'20px', boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
            }}>
              {g.game_logo_url && (
                <img src={g.game_logo_url} alt="" style={{ height:40, objectFit:'contain', marginBottom:12 }} />
              )}
              <div style={{ fontWeight:700, fontSize:15 }}>{g.game_name}</div>
              {g.location_name && (
                <div style={{ fontSize:12, color:'rgba(167,139,250,0.5)', marginTop:4 }}>
                  📍 {g.location_name}
                </div>
              )}
              {g.reward_text && (
                <div style={{ fontSize:12, color:'#4ade80', marginTop:4 }}>
                  🎁 {g.reward_text}
                </div>
              )}
              <div style={{ marginTop:10, display:'flex', gap:8, alignItems:'center' }}>
                <span style={{
                  fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
                  background: g.game_status === 'live' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                  color: g.game_status === 'live' ? '#4ade80' : '#fbbf24',
                }}>
                  {g.game_status}
                </span>
              </div>
              {g.slug && (
                <div style={{ fontSize:11, color:'rgba(167,139,250,0.3)', marginTop:8, wordBreak:'break-all' }}>
                  QR: {window.location.origin}/play/{g.game_slug}/{g.client_slug || 'play'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
