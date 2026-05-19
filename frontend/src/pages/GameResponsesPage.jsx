import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const CSS = `
@import url('${FONT_URL}');
.gp *,.gp *::before,.gp *::after{box-sizing:border-box;margin:0;padding:0}
.gp{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes gpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gpModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes gpToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes gpSpin{to{transform:rotate(360deg)}}
@keyframes gpPulse{0%,100%{opacity:1}50%{opacity:.5}}
.gp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s,background .15s}
.gp-input:focus{border-color:#818CF8;background:#fff}
.gp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.gp-primary-btn:hover{background:#27272A}
.gp-primary-btn:active{transform:scale(.98)}
.gp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.gp-ghost-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.gp-ghost-btn:hover{background:#F3F4F6;border-color:#D1D5DB}
.gp-stat-card{background:#fff;border-radius:14px;border:1.5px solid #EAECF0;padding:18px 20px;transition:border-color .18s,box-shadow .18s,transform .18s;animation:gpFadeUp .3s ease both}
.gp-stat-card:hover{border-color:#C7D2FE;box-shadow:0 4px 20px rgba(99,102,241,.08);transform:translateY(-1px)}
`

const Ico = {
  search: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  download: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  back: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  spin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'gpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  users: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  target: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  help: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  arrowSort: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>,
  arrowUp: () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>,
  arrowDown: () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>,
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background: ok ? '#052E16' : '#450A0A', color:'#fff',
      padding:'13px 20px 13px 16px',borderRadius:12,fontSize:13.5,
      fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok?'#22C55E':'#EF4444'}`,
      animation:'gpToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:420,
    }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

export default function GameResponsesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [sessions, setSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('completed_at')
  const [sortDir, setSortDir] = useState('desc')

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  useEffect(() => {
    Promise.all([
      api.get(`/games/${id}`),
      api.get(`/games/${id}/responses`)
    ]).then(([gameRes, respRes]) => {
      setGame(gameRes.data.game)
      setQuestions(gameRes.data.game.questions || [])
      setSessions(respRes.data.sessions || [])
    }).catch(err => {
      showToast(err.response?.data?.message || 'Failed to load', 'error')
    }).finally(() => setLoading(false))
  }, [id])

  const parsePlayerData = (raw) => {
    try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}) }
    catch { return {} }
  }

  const getAnswerMap = (answers) => {
    const map = {}
    if (!answers) return map
    for (const a of answers) map[a.question_id] = a
    return map
  }

  const buildRows = () => {
    return sessions.map(s => {
      const pd = parsePlayerData(s.player_data)
      const ansMap = getAnswerMap(s.answers)
      return { session: s, playerData: pd, ansMap }
    })
  }

  const rows = buildRows()
  const formKeys = rows.length > 0 ? Object.keys(rows[0].playerData) : []

  // Enhanced filter - searches across ALL player data fields, score, and completion date
  const filtered = rows.filter(r => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    
    // Search in all player data fields
    const playerDataMatch = Object.values(r.playerData).some(val => 
      val?.toString().toLowerCase().includes(searchLower)
    )
    
    // Search in score
    const scoreMatch = (r.session.score || 0).toString().includes(searchLower)
    
    // Search in completion date
    const dateMatch = r.session.completed_at && 
      new Date(r.session.completed_at).toLocaleString().toLowerCase().includes(searchLower)
    
    return playerDataMatch || scoreMatch || dateMatch
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av, bv
    if (sortField === 'completed_at') {
      av = new Date(a.session.completed_at || 0).getTime()
      bv = new Date(b.session.completed_at || 0).getTime()
    } else if (sortField === 'score') {
      av = a.session.score || 0
      bv = b.session.score || 0
    } else if (sortField === 'source_type') {
      av = (a.session.source_type || '').toLowerCase()
      bv = (b.session.source_type || '').toLowerCase()
    } else {
      av = (a.playerData[sortField] || '').toLowerCase()
      bv = (b.playerData[sortField] || '').toLowerCase()
    }
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{color:'#9CA3AF',marginLeft:4}}><Ico.arrowSort/></span>
    return <span style={{color:'#4F46E5',marginLeft:4}}>{sortDir === 'asc' ? <Ico.arrowUp/> : <Ico.arrowDown/>}</span>
  }

  const downloadExcel = () => {
    const headers = [
      '#',
      ...formKeys,
      'Score',
      'Total Questions',
      ...questions.map((q, i) => `Q${i + 1}: ${(q.question_text || '').substring(0, 40)}`),
      ...questions.map((q, i) => `Q${i + 1} Correct?`),
      'Completed At',
      'Source',
      'Email Sent'
    ]

    const csvRows = sorted.map((r, idx) => {
      const pd = r.playerData
      const ansMap = r.ansMap
      const qAnswers = questions.map(q => {
        const a = ansMap[q.id]
        return a ? (a.option_text || `Option #${a.option_id}`) : ''
      })
      const qCorrect = questions.map(q => {
        const a = ansMap[q.id]
        if (!a) return ''
        if (a.question_type === 'opinion') return 'N/A'
        return a.is_correct ? 'Yes' : 'No'
      })
      return [
        idx + 1,
        ...formKeys.map(k => `"${(pd[k] || '').toString().replace(/"/g, '""')}"`),
        r.session.score || 0,
        r.session.total_scoreable || 0,
        ...qAnswers.map(v => `"${v.replace(/"/g, '""')}"`),
        ...qCorrect,
        r.session.completed_at ? new Date(r.session.completed_at).toLocaleString() : '',
        r.session.source_type === 'direct' ? 'Website' : 'Link',
        r.session.email_sent ? 'Yes' : 'No'
      ]
    })

    const csvContent = [
      headers.map(h => `"${h.toString().replace(/"/g, '""')}"`).join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${game?.name || 'game'}_responses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded as CSV (open with Excel)')
  }

  if (loading) {
    return (
      <div className="gp">
        <style>{CSS}</style>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',gap:10,color:'#9CA3AF',fontSize:14}}>
          <Ico.spin/> Loading responses…
        </div>
      </div>
    )
  }

  const completedCount = sessions.filter(s => s.completed).length
  const avgScore = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length).toFixed(1)
    : 0

  return (
    <div className="gp">
      <style>{CSS}</style>
      <div style={{padding:'36px 40px',maxWidth:1400,margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <button className="gp-ghost-btn" onClick={() => navigate('/dashboard/games')} style={{marginBottom:16}}>
            <Ico.back/> Back to Games
          </button>
          
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>
                Game Responses
              </p>
              <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:32,color:'#0D0D1A',letterSpacing:'-0.03em',lineHeight:1.2,marginBottom:8}}>
                {game?.name}
              </h1>
              <p style={{fontSize:13.5,color:'#9CA3AF'}}>
                {game?.company_name} · {completedCount} completed responses
              </p>
            </div>
            <button
              className="gp-primary-btn"
              onClick={downloadExcel}
              disabled={sorted.length === 0}
            >
              <Ico.download/> Download Excel
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:28}}>
          {[
            { label: 'Total Responses', value: sessions.length, icon: Ico.users, color: '#6366F1' },
            { label: 'Completed', value: completedCount, icon: Ico.check, color: '#22C55E' },
            { label: 'Avg Score', value: avgScore, icon: Ico.target, color: '#F59E0B' },
            { label: 'Questions', value: questions.length, icon: Ico.help, color: '#8B5CF6' },
          ].map((stat, i) => (
            <div key={stat.label} className="gp-stat-card" style={{animationDelay:`${i*50}ms`}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${stat.color}15`,display:'flex',alignItems:'center',justifyContent:'center',color:stat.color}}>
                  <stat.icon/>
                </div>
                <div style={{fontSize:10.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em'}}>
                  {stat.label}
                </div>
              </div>
              <div style={{fontSize:28,fontWeight:700,color:'#0D0D1A',fontFamily:"'Fraunces',serif",letterSpacing:'-0.02em'}}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Search Pill */}
        <div style={{
          background:'#fff',
          borderRadius:16,
          border:'1.5px solid #EAECF0',
          padding:'20px 24px',
          marginBottom:24,
          boxShadow:'0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',zIndex:1}}>
              <Ico.search/>
            </span>
            <input
              className="gp-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, city, score, date, or any field..."
              style={{
                paddingLeft:48,
                fontSize:15,
                height:48,
                border:'none',
                background:'transparent'
              }}
            />
          </div>
          {search && (
            <div style={{marginTop:12,fontSize:12.5,color:'#6B7280',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:600,color:'#4F46E5'}}>{filtered.length}</span> 
              result{filtered.length !== 1 ? 's' : ''} found
              {filtered.length !== sessions.length && (
                <span style={{color:'#9CA3AF'}}>
                  · {sessions.length - filtered.length} hidden
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        {sorted.length === 0 && !search ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:'#F0F9FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="32" height="32" fill="none" stroke="#0EA5E9" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
              </svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>
              No responses yet
            </h3>
            <p style={{color:'#9CA3AF',fontSize:14}}>
              Players who complete the game will appear here.
            </p>
          </div>
        ) : sorted.length === 0 && search ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:18,color:'#0D0D1A',marginBottom:8}}>
              No matching responses
            </h3>
            <p style={{color:'#9CA3AF',fontSize:14}}>
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <>
            <div style={{
              overflowX:'auto',
              borderRadius:14,
              border:'1.5px solid #EAECF0',
              background:'#fff',
              boxShadow:'0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#F8F9FB',borderBottom:'2px solid #EAECF0'}}>
                    <th style={{
                      padding:'14px 16px',
                      textAlign:'left',
                      fontSize:11,
                      fontWeight:700,
                      color:'#6B7280',
                      textTransform:'uppercase',
                      letterSpacing:'.08em',
                      whiteSpace:'nowrap'
                    }}>
                      #
                    </th>
                    {formKeys.map(k => (
                      <th
                        key={k}
                        onClick={() => handleSort(k)}
                        style={{
                          padding:'14px 16px',
                          textAlign:'left',
                          fontSize:11,
                          fontWeight:700,
                          color:'#6B7280',
                          textTransform:'uppercase',
                          letterSpacing:'.08em',
                          cursor:'pointer',
                          userSelect:'none',
                          whiteSpace:'nowrap',
                          transition:'color .15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                        onMouseLeave={e => e.currentTarget.style.color = sortField === k ? '#4F46E5' : '#6B7280'}
                      >
                        <div style={{display:'inline-flex',alignItems:'center'}}>
                          {k}
                          <SortIcon field={k} />
                        </div>
                      </th>
                    ))}
                    <th
                      onClick={() => handleSort('score')}
                      style={{
                        padding:'14px 16px',
                        textAlign:'center',
                        fontSize:11,
                        fontWeight:700,
                        color:'#6B7280',
                        textTransform:'uppercase',
                        letterSpacing:'.08em',
                        cursor:'pointer',
                        userSelect:'none',
                        whiteSpace:'nowrap',
                        transition:'color .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                      onMouseLeave={e => e.currentTarget.style.color = sortField === 'score' ? '#4F46E5' : '#6B7280'}
                    >
                      <div style={{display:'inline-flex',alignItems:'center'}}>
                        Score
                        <SortIcon field="score" />
                      </div>
                    </th>
                    {questions.map((q, i) => (
                      <th
                        key={q.id}
                        title={q.question_text}
                        style={{
                          padding:'14px 16px',
                          textAlign:'center',
                          fontSize:11,
                          fontWeight:700,
                          color:'#6B7280',
                          textTransform:'uppercase',
                          letterSpacing:'.08em',
                          whiteSpace:'nowrap'
                        }}
                      >
                        Q{i + 1}
                      </th>
                    ))}
                    <th
                      onClick={() => handleSort('completed_at')}
                      style={{
                        padding:'14px 16px',
                        textAlign:'left',
                        fontSize:11,
                        fontWeight:700,
                        color:'#6B7280',
                        textTransform:'uppercase',
                        letterSpacing:'.08em',
                        cursor:'pointer',
                        userSelect:'none',
                        whiteSpace:'nowrap',
                        transition:'color .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                      onMouseLeave={e => e.currentTarget.style.color = sortField === 'completed_at' ? '#4F46E5' : '#6B7280'}
                    >
                      <div style={{display:'inline-flex',alignItems:'center'}}>
                        Completed
                        <SortIcon field="completed_at" />
                      </div>
                    </th>
                    {/* SOURCE COLUMN HEADER */}
                    <th
                      onClick={() => handleSort('source_type')}
                      style={{
                        padding:'14px 16px',
                        textAlign:'center',
                        fontSize:11,
                        fontWeight:700,
                        color:'#6B7280',
                        textTransform:'uppercase',
                        letterSpacing:'.08em',
                        cursor:'pointer',
                        userSelect:'none',
                        whiteSpace:'nowrap',
                        transition:'color .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                      onMouseLeave={e => e.currentTarget.style.color = sortField === 'source_type' ? '#4F46E5' : '#6B7280'}
                    >
                      <div style={{display:'inline-flex',alignItems:'center'}}>
                        Source
                        <SortIcon field="source_type" />
                      </div>
                    </th>
                    <th style={{
                      padding:'14px 16px',
                      textAlign:'center',
                      fontSize:11,
                      fontWeight:700,
                      color:'#6B7280',
                      textTransform:'uppercase',
                      letterSpacing:'.08em',
                      whiteSpace:'nowrap'
                    }}>
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => {
                    const pd = r.playerData
                    const ansMap = r.ansMap
                    return (
                      <tr
                        key={r.session.id}
                        style={{
                          borderBottom:'1px solid #F3F4F6',
                          transition:'background .13s',
                          background: idx % 2 === 0 ? '#fff' : '#FAFAFA'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFAFA'}
                      >
                        <td style={{
                          padding:'12px 16px',
                          fontSize:13,
                          color:'#9CA3AF',
                          fontWeight:600,
                          fontFamily:'monospace'
                        }}>
                          {idx + 1}
                        </td>
                        {formKeys.map(k => (
                          <td
                            key={k}
                            title={pd[k] || ''}
                            style={{
                              padding:'12px 16px',
                              fontSize:13.5,
                              color:'#374151',
                              maxWidth:200,
                              overflow:'hidden',
                              textOverflow:'ellipsis',
                              whiteSpace:'nowrap'
                            }}
                          >
                            {pd[k] || <span style={{color:'#D1D5DB'}}>—</span>}
                          </td>
                        ))}
                        <td style={{
                          padding:'12px 16px',
                          fontSize:15,
                          fontWeight:700,
                          color:'#4F46E5',
                          textAlign:'center'
                        }}>
                          {r.session.score || 0}
                          {r.session.total_scoreable > 0 && (
                            <span style={{color:'#9CA3AF',fontWeight:400,fontSize:12}}>
                              /{r.session.total_scoreable}
                            </span>
                          )}
                        </td>
                        {questions.map(q => {
                          const a = ansMap[q.id]
                          if (!a) return (
                            <td key={q.id} style={{padding:'12px 16px',color:'#D1D5DB',textAlign:'center',fontSize:13}}>
                              —
                            </td>
                          )
                          const isOpinion = a.question_type === 'opinion'
                          const correct = a.is_correct === 1
                          return (
                            <td key={q.id} style={{padding:'12px 16px',textAlign:'center'}} title={a.option_text || ''}>
                              <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
                                {!isOpinion && (
                                  <span style={{
                                    width:14,
                                    height:14,
                                    borderRadius:'50%',
                                    background: correct ? '#22C55E' : '#EF4444',
                                    flexShrink:0
                                  }} title={correct ? 'Correct' : 'Wrong'} />
                                )}
                                <span style={{
                                  maxWidth:100,
                                  overflow:'hidden',
                                  textOverflow:'ellipsis',
                                  whiteSpace:'nowrap',
                                  fontSize:12.5,
                                  color:'#6B7280'
                                }}>
                                  {a.option_text || `#${a.option_id}`}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                        <td style={{
                          padding:'12px 16px',
                          fontSize:12.5,
                          color:'#6B7280',
                          whiteSpace:'nowrap'
                        }}>
                          {r.session.completed_at
                            ? new Date(r.session.completed_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : <span style={{color:'#D1D5DB'}}>—</span>}
                        </td>
                        {/* SOURCE COLUMN CELL */}
                        <td style={{padding:'12px 16px',textAlign:'center'}}>
                          {r.session.source_type === 'direct'
                            ? <span style={{background:'#EEF2FF',color:'#4338CA',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>🌐 Website</span>
                            : <span style={{background:'#F0FDF4',color:'#15803D',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>🔗 Link</span>}
                        </td>
                        <td style={{padding:'12px 16px',textAlign:'center'}}>
                          {r.session.email_sent ? (
                            <span style={{
                              display:'inline-flex',
                              alignItems:'center',
                              justifyContent:'center',
                              width:22,
                              height:22,
                              borderRadius:6,
                              background:'#DCFCE7',
                              color:'#16A34A',
                              fontWeight:700,
                              fontSize:12
                            }}>
                              ✓
                            </span>
                          ) : (
                            <span style={{color:'#D1D5DB'}}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop:16,
              fontSize:12.5,
              color:'#9CA3AF',
              textAlign:'right',
              fontWeight:500
            }}>
              Showing {sorted.length} of {sessions.length} response{sessions.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}