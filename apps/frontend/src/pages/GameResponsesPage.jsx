import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const CSS = `
@import url('${FONT_URL}');
.gp *,.gp *::before,.gp *::after{box-sizing:border-box;margin:0;padding:0}
.gp{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:100vh}
@keyframes gpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gpSpin{to{transform:rotate(360deg)}}
.gp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color:#111;background:#FAFAFA;outline:none;transition:border-color .15s}
.gp-input:focus{border-color:#818CF8;background:#fff}
.gp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background:#18181B;color:#fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:background .14s,transform .1s}
.gp-primary-btn:hover{background:#27272A}
.gp-primary-btn:active{transform:scale(.98)}
.gp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.gp-ghost-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.gp-ghost-btn:hover{background:#F3F4F6;border-color:#D1D5DB}
`

const Ico = {
  search: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  download: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  back: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  spin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'gpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
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
    }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

// ── Game-specific column configs ──────────────────────────────────────────────
const GAME_COLUMNS = {
  quiz: {
    label: 'Quiz',
    getColumns: (questions) => [
      ...questions.map((q, i) => ({ key: `q_${q.id}`, label: `Q${i+1}`, type: 'question', question: q })),
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  survey: {
    label: 'Survey',
    getColumns: (questions) => [
      ...questions.map((q, i) => ({ key: `q_${q.id}`, label: `Q${i+1}`, type: 'question', question: q })),
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  poll: {
    label: 'Poll',
    getColumns: (questions) => [
      ...questions.map((q, i) => ({ key: `q_${q.id}`, label: `Q${i+1}`, type: 'question', question: q })),
    ],
  },
  crossword: {
    label: 'Crossword',
    getColumns: () => [
      { key: 'words_found', label: 'Words Found', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  memory: {
    label: 'Memory',
    getColumns: () => [
      { key: 'pairs_matched', label: 'Pairs Matched', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  spin: {
    label: 'Spin Wheel',
    getColumns: () => [
      { key: 'prize', label: 'Prize Won', type: 'stat' },
    ],
  },
  jigsaw: {
    label: 'Jigsaw',
    getColumns: () => [
      { key: 'pieces_placed', label: 'Pieces', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  wordsearch: {
    label: 'Word Search',
    getColumns: () => [
      { key: 'words_found', label: 'Words Found', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  pouring: {
    label: 'Pouring',
    getColumns: () => [
      { key: 'accuracy', label: 'Accuracy', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  typer: {
    label: 'Speed Typer',
    getColumns: () => [
      { key: 'wpm', label: 'WPM', type: 'stat' },
      { key: 'accuracy', label: 'Accuracy', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  math: {
    label: 'Math',
    getColumns: () => [
      { key: 'level', label: 'Level', type: 'stat' },
      { key: 'correct', label: 'Correct', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  maze: {
    label: 'Maze',
    getColumns: () => [
      { key: 'level', label: 'Level', type: 'stat' },
      { key: 'collectibles', label: 'Collectibles', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  screw: {
    label: 'Screw & Reveal',
    getColumns: () => [
      { key: 'screws_removed', label: 'Screws', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  '2048': {
    label: '2048',
    getColumns: () => [
      { key: 'best_tile', label: 'Best Tile', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  snake: {
    label: 'Snake',
    getColumns: () => [
      { key: 'food_eaten', label: 'Food Eaten', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  catch: {
    label: 'Catch',
    getColumns: () => [
      { key: 'caught', label: 'Caught', type: 'stat' },
      { key: 'missed', label: 'Missed', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  reaction: {
    label: 'Reaction',
    getColumns: () => [
      { key: 'avg_time', label: 'Avg Time (ms)', type: 'stat' },
      { key: 'best_time', label: 'Best Time (ms)', type: 'stat' },
    ],
  },
  simon: {
    label: 'Simon',
    getColumns: () => [
      { key: 'rounds_completed', label: 'Rounds', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  flappy: {
    label: 'Flappy Bird',
    getColumns: () => [
      { key: 'pipes_passed', label: 'Pipes Passed', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
  bounce: {
    label: 'Bounce Ball',
    getColumns: () => [
      { key: 'level', label: 'Level', type: 'stat' },
      { key: 'score', label: 'Score', type: 'score' },
    ],
  },
}

// ── Extract game-specific stats from player_data ─────────────────────────────
function extractGameStats(playerData, category) {
  const pd = typeof playerData === 'string' ? JSON.parse(playerData || '{}') : (playerData || {})
  const stats = {}

  switch (category) {
    case 'crossword':
      stats.words_found = pd.words_found || pd.wordsFound || '—'
      break
    case 'memory':
      stats.pairs_matched = pd.pairs_matched || pd.pairsMatched || pd.matched || '—'
      break
    case 'spin':
      stats.prize = pd.prize || pd.prize_name || pd.won || '—'
      break
    case 'jigsaw':
      stats.pieces_placed = pd.pieces_placed || pd.piecesPlaced || '—'
      break
    case 'wordsearch':
      stats.words_found = pd.words_found || pd.wordsFound || '—'
      break
    case 'pouring':
      stats.accuracy = pd.accuracy ? `${pd.accuracy}%` : '—'
      break
    case 'typer':
      stats.wpm = pd.wpm || pd.speed || '—'
      stats.accuracy = pd.accuracy ? `${pd.accuracy}%` : '—'
      break
    case 'math':
      stats.level = pd.level || pd.current_level || '—'
      stats.correct = pd.correct || pd.total_correct || '—'
      break
    case 'maze':
      stats.level = pd.level || pd.current_level || '—'
      stats.collectibles = pd.collectibles || pd.total_collectibles || '—'
      break
    case 'screw':
      stats.screws_removed = pd.screws_removed || pd.screwsRemoved || '—'
      break
    case '2048':
      stats.best_tile = pd.best_tile || pd.bestTile || '—'
      break
    case 'snake':
      stats.food_eaten = pd.food_eaten || pd.foodEaten || pd.score || '—'
      break
    case 'catch':
      stats.caught = pd.caught || pd.items_caught || '—'
      stats.missed = pd.missed || pd.misses || '—'
      break
    case 'reaction':
      stats.avg_time = pd.avgTime || pd.avg_time || '—'
      stats.best_time = pd.bestTime || pd.best_time || '—'
      break
    case 'simon':
      stats.rounds_completed = pd.rounds || pd.roundsCompleted || '—'
      break
    case 'flappy':
      stats.pipes_passed = pd.pipes_passed || pd.pipesPassed || pd.score || '—'
      break
    case 'bounce':
      stats.level = pd.level || pd.current_level || pd.currentLevel || '—'
      break
    default:
      break
  }
  return stats
}

// ── Source type display helpers ───────────────────────────────────────────────
function getSourceBadge(sourceType) {
  switch (sourceType) {
    case 'direct':
      return <span style={{background:'#EEF2FF',color:'#4338CA',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>🌐 Website</span>
    case 'player':
      return <span style={{background:'#FFF7ED',color:'#C2410C',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>👤 Account</span>
    case 'link':
    default:
      return <span style={{background:'#F0FDF4',color:'#15803D',padding:'2px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>🔗 Link</span>
  }
}

function getUTMBadge(utm) {
  if (!utm) return null
  return <span style={{background:'#F5F3FF',color:'#6D28D9',padding:'2px 8px',borderRadius:100,fontSize:10,fontWeight:600,marginLeft:4}} title={utm}>{utm}</span>
}

export default function GameResponsesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [sessions, setSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [category, setCategory] = useState('quiz')
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
      setCategory(respRes.data.category || gameRes.data.game.category || 'quiz')
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
      const gameStats = extractGameStats(pd, category)
      return { session: s, playerData: pd, ansMap, gameStats }
    })
  }

  const rows = buildRows()
  const formKeys = rows.length > 0 ? Object.keys(rows[0].playerData) : []

  // Get game-specific columns
  const gameColumnConfig = GAME_COLUMNS[category] || GAME_COLUMNS.quiz
  const gameColumns = gameColumnConfig.getColumns(questions)

  // Filter
  const filtered = rows.filter(r => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const playerDataMatch = Object.values(r.playerData).some(val =>
      val?.toString().toLowerCase().includes(searchLower)
    )
    const scoreMatch = (r.session.score || 0).toString().includes(searchLower)
    const dateMatch = r.session.completed_at &&
      new Date(r.session.completed_at).toLocaleString().toLowerCase().includes(searchLower)
    const statsMatch = Object.values(r.gameStats).some(val =>
      val?.toString().toLowerCase().includes(searchLower)
    )
    const utmMatch = [r.session.utm_source, r.session.utm_medium, r.session.utm_campaign].some(v =>
      v?.toLowerCase().includes(searchLower)
    )
    return playerDataMatch || scoreMatch || dateMatch || statsMatch || utmMatch
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
    } else if (sortField.startsWith('stat_')) {
      const statKey = sortField.replace('stat_', '')
      av = a.gameStats[statKey] || ''
      bv = b.gameStats[statKey] || ''
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
      ...gameColumns.map(c => c.label),
      'Completed',
      'Source',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
    ]

    const csvRows = sorted.map((r, idx) => {
      const pd = r.playerData
      const gameData = gameColumns.map(c => {
        if (c.type === 'score') return r.session.score || 0
        if (c.type === 'question') {
          const a = r.ansMap[c.question.id]
          if (!a) return ''
          if (a.answer_text) return a.answer_text
          return a.option_text || `Option #${a.option_id}`
        }
        return r.gameStats[c.key] || ''
      })
      return [
        idx + 1,
        ...formKeys.map(k => `"${(pd[k] || '').toString().replace(/"/g, '""')}"`),
        ...gameData.map(v => `"${v.toString().replace(/"/g, '""')}"`),
        r.session.completed_at ? new Date(r.session.completed_at).toLocaleString() : '',
        r.session.source_type || '',
        r.session.utm_source || '',
        r.session.utm_medium || '',
        r.session.utm_campaign || '',
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
      <div style={{padding:'36px 40px',maxWidth:1600,margin:'0 auto'}}>

        {/* Header */}
        <div style={{
          display:'grid',gridTemplateColumns:'auto 1fr 1.5fr auto',gap:20,alignItems:'center',marginBottom:28
        }}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <button
              style={{width:36,height:36,borderRadius:8,border:'1.5px solid #E5E7EB',background:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#374151',flexShrink:0}}
              onClick={() => navigate('/dashboard/games')} title="Back to Games">
              <Ico.back/>
            </button>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:'#0D0D1A',fontFamily:"'Fraunces',serif",lineHeight:1.2}}>
                {game?.name}
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'#6366F1',textTransform:'uppercase',letterSpacing:'.08em',marginTop:2}}>
                {gameColumnConfig.label} Responses
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            {[
              { label:'Total', value: sessions.length, color:'#6366F1' },
              { label:'Completed', value: completedCount, color:'#22C55E' },
              { label:'Avg Score', value: avgScore, color:'#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{flex:1,background:'#fff',borderRadius:10,border:'1.5px solid #EAECF0',padding:'6px 14px',display:'flex',alignItems:'center',gap:8,height:38}}>
                <div style={{fontSize:17,fontWeight:700,color:s.color,fontFamily:"'Fraunces',serif",lineHeight:1,flex:1}}>{s.value}</div>
                <div style={{fontSize:8.5,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap',flexShrink:0}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',zIndex:1}}>
              <Ico.search/>
            </span>
            <input
              className="gp-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, score, UTM..."
              style={{paddingLeft:38,fontSize:13.5,height:38,width:'100%'}}
            />
            {search && (
              <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:10.5,fontWeight:600,color:'#4F46E5',whiteSpace:'nowrap',pointerEvents:'none'}}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button className="gp-primary-btn" onClick={downloadExcel} disabled={sorted.length === 0} style={{padding:'8px 18px',fontSize:12.5}}>
            <Ico.download/> Download Excel
          </button>
        </div>

        {/* Table */}
        {sorted.length === 0 && !search ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:'#F0F9FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="32" height="32" fill="none" stroke="#0EA5E9" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
              </svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:8}}>No responses yet</h3>
            <p style={{color:'#9CA3AF',fontSize:14}}>Players who complete the game will appear here.</p>
          </div>
        ) : sorted.length === 0 && search ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:18,color:'#0D0D1A',marginBottom:8}}>No matching responses</h3>
            <p style={{color:'#9CA3AF',fontSize:14}}>Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            <div style={{overflowX:'auto',borderRadius:14,border:'1.5px solid #EAECF0',background:'#fff',boxShadow:'0 4px 16px rgba(0,0,0,0.04)'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#F8F9FB',borderBottom:'2px solid #EAECF0'}}>
                    <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}> # </th>
                    {formKeys.map(k => (
                      <th key={k} onClick={() => handleSort(k)} style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>
                        <div style={{display:'inline-flex',alignItems:'center'}}>{k}<SortIcon field={k} /></div>
                      </th>
                    ))}
                    {gameColumns.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.type === 'score' ? 'score' : col.type === 'stat' ? `stat_${col.key}` : col.key)} style={{padding:'14px 16px',textAlign:col.type === 'question' ? 'center' : 'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap',minWidth:80}}>
                        <div style={{display:'inline-flex',alignItems:'center'}}>{col.label}<SortIcon field={col.type === 'score' ? 'score' : col.type === 'stat' ? `stat_${col.key}` : col.key} /></div>
                      </th>
                    ))}
                    <th onClick={() => handleSort('completed_at')} style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>
                      <div style={{display:'inline-flex',alignItems:'center'}}>Completed<SortIcon field="completed_at" /></div>
                    </th>
                    <th onClick={() => handleSort('source_type')} style={{padding:'14px 16px',textAlign:'center',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>
                      <div style={{display:'inline-flex',alignItems:'center'}}>Source<SortIcon field="source_type" /></div>
                    </th>
                    <th style={{padding:'14px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}>UTM</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => {
                    const pd = r.playerData
                    return (
                      <tr key={r.session.id} style={{borderBottom:'1px solid #F3F4F6',transition:'background .13s',background: idx % 2 === 0 ? '#fff' : '#FAFAFA'}}>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#9CA3AF',fontWeight:600,fontFamily:'monospace'}}>{idx + 1}</td>
                        {formKeys.map(k => (
                          <td key={k} title={pd[k] || ''} style={{padding:'12px 16px',fontSize:13.5,color:'#374151',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {pd[k] || <span style={{color:'#D1D5DB'}}>—</span>}
                          </td>
                        ))}
                        {gameColumns.map(col => {
                          if (col.type === 'score') {
                            return (
                              <td key={col.key} style={{padding:'12px 16px',fontSize:15,fontWeight:700,color:'#4F46E5',textAlign:'center'}}>
                                {r.session.score || 0}
                                {r.session.total_scoreable > 0 && (
                                  <span style={{color:'#9CA3AF',fontWeight:400,fontSize:12}}>/ {r.session.total_scoreable}</span>
                                )}
                              </td>
                            )
                          }
                          if (col.type === 'stat') {
                            return (
                              <td key={col.key} style={{padding:'12px 16px',fontSize:13.5,color:'#374151',textAlign:'center',fontWeight:600}}>
                                {r.gameStats[col.key] || <span style={{color:'#D1D5DB'}}>—</span>}
                              </td>
                            )
                          }
                          if (col.type === 'question') {
                            const a = r.ansMap[col.question.id]
                            if (!a) return (
                              <td key={col.key} style={{padding:'12px 16px',color:'#D1D5DB',textAlign:'center',fontSize:13}}>—</td>
                            )
                            const isOpinion = a.question_type === 'opinion'
                            const isShortAnswer = a.question_type === 'short_answer'
                            const correct = a.is_correct === 1
                            return (
                              <td key={col.key} style={{padding:'12px 16px',textAlign:'center'}} title={a.answer_text || a.option_text || ''}>
                                <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
                                  {!isOpinion && !isShortAnswer && (
                                    <span style={{width:14,height:14,borderRadius:'50%',background: correct ? '#22C55E' : '#EF4444',flexShrink:0}} title={correct ? 'Correct' : 'Wrong'} />
                                  )}
                                  {isShortAnswer && (
                                    <span style={{width:14,height:14,borderRadius:'50%',background: correct ? '#22C55E' : '#EF4444',flexShrink:0}} title={correct ? 'Correct' : 'Wrong'} />
                                  )}
                                  <span style={{maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5,color:'#6B7280'}}>
                                    {a.answer_text || a.option_text || `#${a.option_id}`}
                                  </span>
                                </div>
                              </td>
                            )
                          }
                          return <td key={col.key}>—</td>
                        })}
                        <td style={{padding:'12px 16px',fontSize:12.5,color:'#6B7280',whiteSpace:'nowrap'}}>
                          {r.session.completed_at
                            ? new Date(r.session.completed_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
                            : <span style={{color:'#D1D5DB'}}>—</span>}
                        </td>
                        <td style={{padding:'12px 16px',textAlign:'center'}}>
                          {getSourceBadge(r.session.source_type)}
                        </td>
                        <td style={{padding:'12px 16px',fontSize:11,color:'#6B7280',whiteSpace:'nowrap'}}>
                          {r.session.utm_source && <span style={{display:'inline-flex',flexDirection:'column',gap:2}}>
                            {r.session.utm_source && <span>src: {getUTMBadge(r.session.utm_source)}</span>}
                            {r.session.utm_medium && <span>med: {getUTMBadge(r.session.utm_medium)}</span>}
                            {r.session.utm_campaign && <span>cmp: {getUTMBadge(r.session.utm_campaign)}</span>}
                          </span>}
                          {!r.session.utm_source && !r.session.utm_medium && !r.session.utm_campaign && <span style={{color:'#D1D5DB'}}>—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{marginTop:16,fontSize:12.5,color:'#9CA3AF',textAlign:'right',fontWeight:500}}>
              Showing {sorted.length} of {sessions.length} response{sessions.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
