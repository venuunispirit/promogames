import { useState, useEffect, useCallback } from 'react'
import api from '../api'

const STATE_META = {
  played_not_redeemed:  { label: 'Played · Not Redeemed', color: '#64748b', bg: '#f1f5f9' },
  accepted_with_code:   { label: 'Accepted · 6-digit code', color: '#059669', bg: '#dcfce7' },
  accepted_without_code:{ label: 'Accepted · no code',      color: '#b45309', bg: '#fef3c7' },
}

const mBtn = { padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', cursor:'pointer', fontSize:12, fontWeight:600, color:'var(--text)', fontFamily:'inherit', transition:'all .12s', textAlign:'center', width:'100%' }

/* Compact BO entries modal (reuses /bo-logs/:id/entries) */
function BoEntriesModal({ bo, clientName, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (start) params.set('start_date', start)
      if (end) params.set('end_date', end)
      const { data } = await api.get(`/internal-team/bo-logs/${bo.id}/entries?${params}`)
      setEntries(data.entries || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [bo.id, start, end])

  useEffect(() => { load() }, [load])

  return (
    <div style={{position:'fixed',inset:0,zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'rgba(8,8,18,.55)',backdropFilter:'blur(5px)'}} onClick={onClose}>
      <div className="mgm-modal" style={{background:'var(--surface)',borderRadius:20,width:'100%',maxWidth:1000,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 30px 80px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
          <div>
            <h2 style={{margin:0,fontFamily:"'Fraunces',serif",fontSize:20}}>{bo.business_name}</h2>
            <p style={{margin:'4px 0 0',fontSize:13,opacity:.85}}>{bo.kind === 'brand' ? 'Brand (head-office) login' : 'Location login'} · {clientName || '—'}</p>
          </div>
          <button onClick={onClose} style={{border:'none',background:'rgba(255,255,255,.18)',color:'#fff',cursor:'pointer',padding:'8px 14px',borderRadius:10,fontSize:12,fontWeight:700,fontFamily:'inherit'}}>Close</button>
        </div>
        <div style={{display:'flex',gap:12,padding:'16px 24px',flexWrap:'wrap',alignItems:'flexEnd',borderBottom:'1px solid var(--border-light)'}}>
          <div style={{display:'flex',flexDirection:'column',gap:4}}><label style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase'}}>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)} style={{padding:8,borderRadius:9,border:'1.5px solid var(--border)',fontSize:12.5,fontFamily:'inherit'}}/></div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}><label style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase'}}>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)} style={{padding:8,borderRadius:9,border:'1.5px solid var(--border)',fontSize:12.5,fontFamily:'inherit'}}/></div>
          <button onClick={load} style={{padding:'9px 18px',borderRadius:9,border:'none',background:'var(--primary)',color:'#fff',fontSize:12.5,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Apply</button>
        </div>
        <div style={{overflow:'auto',maxHeight:480}}>
          {loading ? <div style={{padding:48,textAlign:'center',color:'var(--text3)'}}>Loading…</div> :
            entries.length === 0 ? <div style={{padding:48,textAlign:'center',color:'var(--text3)'}}>No activity found</div> :
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
              <thead><tr>
                <th style={th}>Player</th><th style={th}>Game</th><th style={th}>Played At</th><th style={th}>Score</th>
                <th style={th}>Redemption</th><th style={th}>Code</th><th style={th}>Accepted At</th><th style={th}>Accepted By</th>
              </tr></thead>
              <tbody>
                {entries.map(r => {
                  const m = STATE_META[r.redemption_state] || STATE_META.played_not_redeemed
                  return (
                    <tr key={r.session_id} style={{borderBottom:'1px solid var(--border-light)'}}>
                      <td style={td}><div style={{fontWeight:700,color:'var(--text)'}}>{r.player_name||'—'}</div><div style={{fontSize:11,color:'var(--text3)'}}>{r.player_email||r.player_phone||'Guest'}</div></td>
                      <td style={td}>{r.game_name}</td>
                      <td style={td}>{r.played_at?new Date(r.played_at).toLocaleString():'—'}</td>
                      <td style={td}>{r.score}{r.total_scoreable?` / ${r.total_scoreable}`:''}</td>
                      <td style={td}><span style={{padding:'3px 9px',borderRadius:999,fontSize:10.5,fontWeight:700,background:m.bg,color:m.color}}>{m.label}</span></td>
                      <td style={td}>{r.redemption_id?(r.code_present?`Yes (${r.code})`:'No'):'—'}</td>
                      <td style={td}>{r.accepted_at?new Date(r.accepted_at).toLocaleString():'—'}</td>
                      <td style={td}>{r.accepted_by_name||'—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  )
}

const th = { position:'sticky',top:0,background:'#f8fafc',color:'#475569',fontWeight:700,textAlign:'left',padding:'12px 14px',fontSize:11,textTransform:'uppercase',letterSpacing:'.03em',borderBottom:'1px solid var(--border-light)',whiteSpace:'nowrap' }
const td = { padding:'12px 14px',borderBottom:'1px solid var(--border-light)',color:'#334155',verticalAlign:'top' }

export default function MasterGameModal({ game, clientName, boLogs, catMeta, onClose, onBuilder, onToggle, onStatusToggle, onDuplicate, onDelete, onSelectChild }) {
  const [responses, setResponses] = useState(null)
  const [respLoading, setRespLoading] = useState(true)
  const [activeBo, setActiveBo] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const clientBos = (boLogs || []).filter(b => b.client_id === game.client_id)

  useEffect(() => {
    let cancelled = false
    setRespLoading(true)
    api.get(`/games/${game.id}/responses`).then(({ data }) => {
      if (!cancelled) setResponses(data.sessions || [])
    }).catch(() => { if (!cancelled) setResponses([]) }).finally(() => { if (!cancelled) setRespLoading(false) })
    return () => { cancelled = true }
  }, [game.id])

  const cat = catMeta ? catMeta(game.category) : { label: game.category, bg:'#F3F6F9', fg:'var(--text)' }

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.5)',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="mgm-modal" style={{background:'var(--surface)',borderRadius:20,width:'100%',maxWidth:1120,maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 30px 80px rgba(0,0,0,.3)',fontFamily:"'DM Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{padding:'20px 26px',borderBottom:'1px solid var(--border-light)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:cat.bg,color:cat.fg}}>{cat.label}</span>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:'var(--primary-bg)',color:'#4338CA'}}>📦 Master</span>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:game.is_active?'#ECFDF5':'var(--border-light)',color:game.is_active?'#059669':'var(--text3)'}}>{game.status||'Draft'}</span>
            </div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,color:'var(--text)',margin:0}}>{game.name}</h2>
            <p style={{margin:'4px 0 0',fontSize:13,color:'var(--text2)'}}>{clientName || '—'}</p>
          </div>
          <button onClick={onClose} style={{border:'none',background:'var(--surface2)',cursor:'pointer',color:'var(--text3)',padding:8,borderRadius:10}}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* 3-column body */}
        <div style={{display:'grid',gridTemplateColumns:'20% 30% 50%',minHeight:0,flex:1}}>
          {/* COL 1 — Fields & Controls */}
          <div style={{padding:20,borderRight:'1px solid var(--border-light)',overflowY:'auto'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Fields &amp; Controls</div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',marginBottom:4}}>Game Name</div>
            <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:16}}>{game.name}</div>

            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
              <button onClick={()=>onBuilder?.(game)} style={{...mBtn,background:'var(--primary)',color:'#fff',border:'none'}}>🔧 Open Builder</button>
              <button onClick={()=>onDuplicate?.(game.id)} style={mBtn}>⧉ Duplicate</button>
              <button onClick={()=>{if(confirm('Delete this master game?')) onDelete?.(game.id)}} style={{...mBtn,border:'1px solid #FECACA',background:'#FEF2F2',color:'#DC2626'}}>🗑 Delete</button>
            </div>

            <div style={{borderTop:'1px solid var(--border-light)',paddingTop:12}}>
              {[
                {label:'Active',field:'is_active'},
                {label:'Show in Play Page',field:'show_in_play_page'},
                {label:'Show in Hero Page',field:'show_in_hero_page'},
              ].map(t => (
                <div key={t.field} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                  <span style={{fontSize:12.5,color:'var(--text)'}}>{t.label}</span>
                  <button onClick={()=>onToggle?.(game,t.field)} style={{width:40,height:22,borderRadius:11,border:'none',cursor:'pointer',background:game[t.field]?'#059669':'var(--border-light)',position:'relative',transition:'background .15s'}}>
                    <span style={{position:'absolute',top:2,left:game[t.field]?20:2,width:18,height:18,borderRadius:9,background:'#fff',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                  </button>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                <span style={{fontSize:12.5,color:'var(--text)'}}>Status</span>
                <button onClick={()=>onStatusToggle?.(game)} style={{padding:'3px 10px',borderRadius:6,border:'1.5px solid var(--border)',background:'var(--surface)',fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans',color:'var(--text2)'}}>Cycle →</button>
              </div>
            </div>

            <button onClick={()=>setShowTemplates(true)} style={{...mBtn,marginTop:14,background:'var(--primary-bg)',color:'#4338CA',border:'1px solid #C7D2FE'}}>🧩 Templates &amp; Brand Owner</button>
          </div>

          {/* COL 2 — Responses */}
          <div style={{padding:20,borderRight:'1px solid var(--border-light)',overflowY:'auto'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Responses</div>
            {respLoading ? <div style={{color:'var(--text3)',fontSize:13}}>Loading…</div> :
              <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                  <div style={{background:'#EEF2FF',borderRadius:10,padding:'10px 12px',textAlign:'center'}}><div style={{fontSize:18,fontWeight:800,color:'#4F46E5'}}>{responses?.length||0}</div><div style={{fontSize:9,fontWeight:700,color:'#7C3AED',textTransform:'uppercase'}}>Sessions</div></div>
                  <div style={{background:'#ECFDF5',borderRadius:10,padding:'10px 12px',textAlign:'center'}}><div style={{fontSize:18,fontWeight:800,color:'#059669'}}>{responses?.filter(r=>r.completed).length||0}</div><div style={{fontSize:9,fontWeight:700,color:'#10B981',textTransform:'uppercase'}}>Completed</div></div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {(responses||[]).slice(0,40).map((r,i) => (
                    <div key={i} style={{border:'1px solid var(--border-light)',borderRadius:10,padding:'8px 10px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          {(() => { try { return JSON.parse(r.player_data||'{}').Name || JSON.parse(r.player_data||'{}').name || 'Player' } catch { return 'Player' } })()}
                        </span>
                        <span style={{fontSize:11,color:'var(--text2)',whiteSpace:'nowrap'}}>{r.score??0}{r.total_scoreable?`/${r.total_scoreable}`:''}</span>
                      </div>
                      <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{r.completed_at?new Date(r.completed_at).toLocaleString():'—'}</div>
                    </div>
                  ))}
                  {(responses||[]).length === 0 && <div style={{color:'var(--text3)',fontSize:13}}>No responses yet</div>}
                </div>
              </>}
          </div>

          {/* COL 3 — BO Logs */}
          <div style={{padding:20,overflowY:'auto',background:'var(--surface2)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>BO Logs</div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>{clientBos.length} linked {clientBos.length===1?'account':'accounts'} for this client</div>
            {clientBos.length === 0 ? <div style={{color:'var(--text3)',fontSize:13}}>No business owners linked</div> :
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {/* Brand first, then locations */}
                {[...clientBos].sort((a,b)=>(a.kind==='brand'?-1:1)-(b.kind==='brand'?-1:1)).map(bo => (
                  <button key={bo.id} onClick={()=>setActiveBo(bo)} style={{textAlign:'left',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:14,cursor:'pointer',fontFamily:'inherit',transition:'transform .15s, box-shadow .15s',display:'flex',gap:12,alignItems:'center'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 24px rgba(15,23,42,.08)'}} onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                    <div style={{width:40,height:40,borderRadius:11,flexShrink:0,background:bo.kind==='brand'?'linear-gradient(135deg,#7C3AED,#6366F1)':'linear-gradient(135deg,#0ea5e9,#6366f1)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14}}>
                      {bo.business_name.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{bo.business_name}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{bo.kind==='brand'?'Brand login':'Location login'}{bo.total_games?` · ${bo.total_games} games`:''}</div>
                    </div>
                    <div style={{display:'flex',gap:6,textAlign:'center'}}>
                      <div><div style={{fontSize:15,fontWeight:800,color:'#4F46E5'}}>{bo.total_plays}</div><div style={{fontSize:8.5,fontWeight:700,color:'var(--text3)',textTransform:'uppercase'}}>Plays</div></div>
                      <div><div style={{fontSize:15,fontWeight:800,color:'#059669'}}>{bo.total_redemptions}</div><div style={{fontSize:8.5,fontWeight:700,color:'var(--text3)',textTransform:'uppercase'}}>Redeem</div></div>
                    </div>
                  </button>
                ))}
              </div>}
          </div>
        </div>
      </div>

      {activeBo && <BoEntriesModal bo={activeBo} clientName={clientName} onClose={()=>setActiveBo(null)} />}

      {showTemplates && (
        <TemplateControlsModal game={game} clientBos={clientBos} onClose={()=>setShowTemplates(false)} onSelectChild={onSelectChild} />
      )}
    </div>
  )
}

/* Nested modal: template variants + brand owner controls */
function TemplateControlsModal({ game, clientBos, onClose, onSelectChild }) {
  const brand = clientBos.find(b => b.kind === 'brand')
  return (
    <div style={{position:'fixed',inset:0,zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'rgba(8,8,18,.6)',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="mgm-modal" style={{background:'var(--surface)',borderRadius:20,width:'100%',maxWidth:640,maxHeight:'90vh',overflow:'auto',padding:26,boxShadow:'0 30px 80px rgba(0,0,0,.35)',fontFamily:"'DM Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,margin:0,color:'var(--text)'}}>Templates &amp; Brand Owner</h2>
          <button onClick={onClose} style={{border:'none',background:'var(--surface2)',cursor:'pointer',color:'var(--text3)',padding:8,borderRadius:10}}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.08em',margin:'8px 0 10px'}}>Brand Owner (controls everything)</div>
        {brand ? (
          <div style={{background:'linear-gradient(135deg,#7C3AED,#6366F1)',color:'#fff',borderRadius:14,padding:16,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:42,height:42,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15}}>{brand.business_name.slice(0,2).toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{brand.business_name}</div>
              <div style={{fontSize:12,opacity:.85}}>{brand.email}{brand.phone?` · ${brand.phone}`:''}</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800}}>{brand.total_games}</div>
              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',opacity:.85}}>Games</div>
            </div>
          </div>
        ) : <div style={{color:'var(--text3)',fontSize:13}}>No brand owner linked to this client</div>}

        <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.08em',margin:'18px 0 10px'}}>Template Variants (location deployments)</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {clientBos.filter(b=>b.kind==='location').map(bo => (
            <button key={bo.id} onClick={()=>onSelectChild?.(bo)} style={{textAlign:'left',background:'var(--surface2)',border:'1px solid var(--border-light)',borderRadius:12,padding:12,cursor:'pointer',fontFamily:'inherit',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:'var(--text)'}}>{bo.business_name}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{bo.email} · {bo.total_games} game{bo.total_games===1?'':'s'}</div>
              </div>
              <span style={{fontSize:12,color:'var(--primary)',fontWeight:700}}>Open →</span>
            </button>
          ))}
            {clientBos.filter(b=>b.kind==='location').length===0 && <div style={{color:'var(--text3)',fontSize:13}}>No location templates deployed yet</div>}
        </div>
      </div>
    </div>
  )
}
