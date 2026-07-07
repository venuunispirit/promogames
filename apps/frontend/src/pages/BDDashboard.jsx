import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORY_META = {
  quiz:{label:'Quiz'},survey:{label:'Survey'},poll:{label:'Poll'},
  crossword:{label:'Crossword'},spin:{label:'Spin Wheel'},memory:{label:'Memory Match'},
  jigsaw:{label:'Jigsaw Puzzle'},wordsearch:{label:'Word Search'},pouring:{label:'Pouring Water'},
  typer:{label:'Speed Typer'},math:{label:'Math Game'},maze:{label:'Maze'},
  screw:{label:'Screw & Reveal'},'2048':{label:'2048'},snake:{label:'Snake'},
  catch:{label:'Catch'},reaction:{label:'Reaction'},simon:{label:'Simon Says'},
  flappy:{label:'Flappy Bird'},bounce:{label:'Bounce Ball'},space:{label:'Space Fighter'},
  connect4:{label:'Connect 4'},tetris:{label:'Tetris'},stack:{label:'Stack'},
  bowling:{label:'Bowling'},sudoku:{label:'Sudoku'},minesweeper:{label:'Minesweeper'},
  wordscramble:{label:'Word Scramble'},rps:{label:'Rock Paper Scissors'},
  whackamole:{label:'Whack a Mole'},hanoi:{label:'Hanoi Tower'},breakout:{label:'Breakout'},
  bubbleshooter:{label:'Bubble Shooter'},carlaunch:{label:'Car Launch'},
  arrowescape:{label:'Arrow Escape'},stressbuster:{label:'Stress Buster'},
  soundify:{label:'Soundify'},tictactoe:{label:'Tic Tac Toe'},
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');
.bd-page *,.bd-page *::before,.bd-page *::after{box-sizing:border-box;margin:0;padding:0}
.bd-page{font-family:'DM Sans',sans-serif;color:#111827;background:#F8F9FB;min-height:calc(100vh - 62px);padding:36px 40px;max-width:1200px;margin:0 auto}
.bd-title{font-family:'Fraunces',serif;font-weight:600;font-size:32px;color:#0D0D1A;margin-bottom:8px}
.bd-sub{color:#6B7280;font-size:14px;margin-bottom:28px}
.bd-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;border:none;background:#059669;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:background .14s}
.bd-primary-btn:hover{background:#047857}
.bd-card{background:#fff;border-radius:16px;border:1.5px solid #EAECF0;padding:24px}
`

export default function BDDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total:0, approved:0, live:0 })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ business_name:'', gmaps_url:'', social_url:'', game_category:'quiz' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get('/bd/requests').then(r => {
      const reqs = r.data.requests || []
      setStats({
        total: reqs.length,
        approved: reqs.filter(x => x.status === 'approved' || x.status === 'started_working' || x.status === 'game_creating' || x.status === 'testing').length,
        live: reqs.filter(x => x.status === 'live').length,
      })
    }).catch(() => {})
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.business_name) return
    setSubmitting(true)
    try {
      await api.post('/bd/requests', form)
      setShowModal(false)
      setForm({ business_name:'', gmaps_url:'', social_url:'', game_category:'quiz' })
      setToast('Request submitted successfully!')
      setTimeout(() => {
        navigate('/crm/requests')
      }, 800)
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to submit request')
    }
    setSubmitting(false)
  }

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  return (
    <div className="bd-page">
      <style>{CSS}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 className="bd-title">Business Developer Dashboard</h1>
          <p className="bd-sub">Manage your client requests and track their progress.</p>
        </div>
        <button className="bd-primary-btn" onClick={() => setShowModal(true)}>
          + Add New Request
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
        {[
          { label:'Total Requests', value: stats.total, color:'#059669' },
          { label:'In Progress', value: stats.approved, color:'#D97706' },
          { label:'Live', value: stats.live, color:'#4F46E5' },
        ].map(s => (
          <div key={s.label} className="bd-card">
            <div style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:"'Fraunces',serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'rgba(8,8,18,.48)', backdropFilter:'blur(5px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:520, padding:'34px 30px', boxShadow:'0 24px 64px rgba(0,0,0,.22)', fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:600, fontSize:20, color:'#0D0D1A' }}>New Request</h2>
                <p style={{ color:'#9CA3AF', fontSize:13, marginTop:4 }}>Submit a new game request for your client.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width:30, height:30, borderRadius:7, border:'1.5px solid #E5E7EB', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#374151', fontSize:16 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:6 }}>Business Name <span style={{ color:'#EF4444' }}>*</span></label>
                <input required value={form.business_name} onChange={set('business_name')} placeholder="e.g. Acme Corp" style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'DM Sans', color:'#111', background:'#FAFAFA', outline:'none' }} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:6 }}>Google Maps URL</label>
                <input value={form.gmaps_url} onChange={set('gmaps_url')} placeholder="https://maps.google.com/..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'DM Sans', color:'#111', background:'#FAFAFA', outline:'none' }} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:6 }}>Website / Instagram URL</label>
                <input value={form.social_url} onChange={set('social_url')} placeholder="https://instagram.com/..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'DM Sans', color:'#111', background:'#FAFAFA', outline:'none' }} />
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:6 }}>Game Module <span style={{ color:'#EF4444' }}>*</span></label>
                <select required value={form.game_category} onChange={set('game_category')} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'DM Sans', color:'#111', background:'#FAFAFA', outline:'none', appearance:'none' }}>
                  {Object.entries(CATEGORY_META).sort((a,b) => a[1].label.localeCompare(b[1].label)).map(([k,v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, justifyContent:'center', padding:'11px 0', borderRadius:10, border:'1.5px solid #E5E7EB', background:'#fff', color:'#6B7280', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:2, justifyContent:'center', padding:'12px 0', borderRadius:10, border:'none', background: submitting?'#9CA3AF':'#059669', color:'#fff', fontSize:14, fontWeight:700, cursor: submitting?'not-allowed':'pointer', fontFamily:'DM Sans' }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:9999, background:'#052E16', color:'#fff', padding:'13px 20px', borderRadius:12, fontSize:13.5, fontWeight:500, fontFamily:'DM Sans', boxShadow:'0 8px 32px rgba(0,0,0,.24)', borderLeft:'3px solid #22C55E' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
