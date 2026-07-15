import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import api from '../api'

const FONT_URL = `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap`

const CATEGORY_META = {
  quiz:      { label:'Quiz',          bg:'#EEF2FF', fg:'#4338CA', dot:'#818CF8', icon:'🧠', desc:'Test knowledge with questions' },
  survey:    { label:'Survey',        bg:'#F0FDF4', fg:'#15803D', dot:'#4ADE80', icon:'📋', desc:'Collect feedback & opinions' },
  poll:      { label:'Poll',          bg:'#FFF7ED', fg:'#C2410C', dot:'#FB923C', icon:'📊', desc:'Quick audience polls' },
  registration:{ label:'Registration',bg:'#F0FDF4', fg:'#166534', dot:'#22C55E', icon:'📝', desc:'Collect user registrations' },
  crossword: { label:'Crossword',     bg:'#FDF2F8', fg:'#BE185D', dot:'#EC4899', icon:'🔤', desc:'Word grid puzzle' },
  spin:      { label:'Spin Wheel',    bg:'#FFFBEB', fg:'#B45309', dot:'#F59E0B', icon:'🎡', desc:'Spin to win prizes' },
  memory:    { label:'Memory Match',  bg:'#F5F3FF', fg:'#6D28D9', dot:'#A78BFA', icon:'🃏', desc:'Match pairs of cards' },
  jigsaw:    { label:'Jigsaw Puzzle', bg:'#FFF1F2', fg:'#BE123C', dot:'#FB7185', icon:'🧩', desc:'Drag-drop image puzzle' },
  wordsearch:{ label:'Word Search',   bg:'#FEF3C7', fg:'#92400E', dot:'#F59E0B', icon:'🔍', desc:'Find hidden words in grid' },
  pouring:   { label:'Pouring Water', bg:'#DBEAFE', fg:'#1E40AF', dot:'#3B82F6', icon:'💧', desc:'Pour exact amount challenge' },
  typer:     { label:'Speed Typer',   bg:'#F0FDF4', fg:'#166534', dot:'#22C55E', icon:'⌨️', desc:'Type falling words fast' },
  screw:     { label:'Screw & Reveal',bg:'#FEF3C7', fg:'#92400E', dot:'#D97706', icon:'🔩', desc:'Unscrew blocks to reveal' },
  math:      { label:'Math Game',     bg:'#F0FDF4', fg:'#15803D', dot:'#22C55E', icon:'🔢', desc:'Solve math questions' },
  maze:      { label:'Maze Game',     bg:'#EEF2FF', fg:'#4338CA', dot:'#6366F1', icon:'🌀', desc:'Navigate the maze' },
  '2048':    { label:'2048',           bg:'#FFF7ED', fg:'#C2410C', dot:'#FB923C', icon:'🔢', desc:'Merge tiles to reach 2048' },
  snake:     { label:'Snake',          bg:'#F0FDF4', fg:'#166534', dot:'#22C55E', icon:'🐍', desc:'Classic snake game' },
  catch:     { label:'Catch',          bg:'#F5F3FF', fg:'#7C3AED', dot:'#A78BFA', icon:'🧺', desc:'Catch falling objects' },
  reaction:  { label:'Reaction',       bg:'#FDF2F8', fg:'#BE185D', dot:'#EC4899', icon:'⚡', desc:'Test reaction speed' },
  simon:     { label:'Simon Says',     bg:'#EEF2FF', fg:'#4338CA', dot:'#818CF8', icon:'🎯', desc:'Repeat the color sequence' },
  flappy:    { label:'Flappy Bird',    bg:'#FFFBEB', fg:'#B45309', dot:'#F59E0B', icon:'🐦', desc:'Fly through the pipes' },
  bounce:    { label:'Bounce Ball',    bg:'#F0FDF4', fg:'#166534', dot:'#22C55E', icon:'🏀', desc:'Bounce ball through levels' },
  space:     { label:'Space Fighter',  bg:'#0F172A', fg:'#38BDF8', dot:'#0EA5E9', icon:'🚀', desc:'Shoot enemies in space' },
  connect4:  { label:'Connect 4',      bg:'#EFF6FF', fg:'#1D4ED8', dot:'#3B82F6', icon:'🔴', desc:'Connect 4 in a row to win' },
  bejeweled: { label:'Bejeweled',      bg:'#FDF2F8', fg:'#BE185D', dot:'#EC4899', icon:'💎', desc:'Match gems in a grid' },
  tetris:    { label:'Tetris',         bg:'#0F172A', fg:'#00f0f0', dot:'#00f0f0', icon:'🧱', desc:'Classic block-stacking puzzle' },
  stack:     { label:'Stack',          bg:'#0F172A', fg:'#6366f1', dot:'#818CF8', icon:'📦', desc:'Stack blocks as high as you can' },
  bowling:   { label:'Bowling',        bg:'#FEF3C7', fg:'#92400E', dot:'#F59E0B', icon:'🎳', desc:'Roll strikes and spares' },
  sudoku:    { label:'Sudoku',         bg:'#EFF6FF', fg:'#1E40AF', dot:'#3B82F6', icon:'🔢', desc:'Fill the grid with numbers' },
  minesweeper:{ label:'Minesweeper',   bg:'#F0FDF4', fg:'#166534', dot:'#22C55E', icon:'💣', desc:'Find all safe cells' },
  wordscramble:{ label:'Word Scramble', bg:'#F5F3FF', fg:'#6D28D9', dot:'#8B5CF6', icon:'🔤', desc:'Unscramble the letters' },
  rps:       { label:'Rock Paper Scissors', bg:'#FEE2E2', fg:'#991B1B', dot:'#EF4444', icon:'✊', desc:'Beat the AI in RPS' },
  whackamole:{ label:'Whack a Mole',       bg:'#FEF3C7', fg:'#B45309', dot:'#F59E0B', icon:'🔨', desc:'Whack moles in the grid' },
  hanoi:     { label:'Hanoi Tower',        bg:'#F5F3FF', fg:'#6D28D9', dot:'#A78BFA', icon:'🗼', desc:'Move disks between pegs' },
  breakout:  { label:'Breakout',           bg:'#0F172A', fg:'#f43f5e', dot:'#f43f5e', icon:'🧱', desc:'Break bricks with a ball' },
  bubbleshooter:{ label:'Bubble Shooter',  bg:'#ECFEFF', fg:'#0E7490', dot:'#06B6D4', icon:'🫧', desc:'Pop matching bubbles' },
  carlaunch:   { label:'Car Launch',       bg:'#0F172A', fg:'#ef4444', dot:'#ef4444', icon:'🏎️', desc:'3D car configurator + drag race' },
  arrowescape:{ label:'Arrow Escape',    bg:'#FEF3C7', fg:'#92400E', dot:'#F59E0B', icon:'➡️', desc:'Guide arrows through mazes' },
  stressbuster:{ label:'Stress Buster',  bg:'#FEF2F2', fg:'#991B1B', dot:'#F87171', icon:'😤', desc:'Click-based stress relief game' },
  soundify:    { label:'Soundify',       bg:'#F5F3FF', fg:'#6D28D9', dot:'#A78BFA', icon:'🔊', desc:'Sound-based interactive quiz' },
  tictactoe:   { label:'Tic Tac Toe',    bg:'#EFF6FF', fg:'#1D4ED8', dot:'#3B82F6', icon:'❌', desc:'Classic noughts and crosses' },
  chess:      { label:'Chess',          bg:'#F7F7F7', fg:'#1F2937', dot:'#374151', icon:'♟️', desc:'Two-player online chess' },
}
const catMeta = (cat) => CATEGORY_META[cat] || { label: cat, bg:'#F3F4F6', fg:'#374151', dot:'#9CA3AF' }

const CSS = `
@import url('${FONT_URL}');
.gp *,.gp *::before,.gp *::after{box-sizing:border-box;margin:0;padding:0}
.gp *::-webkit-scrollbar{display:none}
.gp *{-ms-overflow-style:none;scrollbar-width:none}
@media(max-width:820px){.gp [style*="column-count:4"]{column-count:3!important}}
@media(max-width:600px){.gp [style*="column-count:4"]{column-count:2!important}}
@media(max-width:440px){.gp [style*="column-count:4"]{column-count:1!important}}
.gp{font-family:'DM Sans',sans-serif;color: #111827;background: #F8F9FB;min-height:100vh}
@keyframes gpFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes gpModalIn{from{opacity:0;transform:scale(0.96)translateY(6px)}to{opacity:1;transform:none}}
@keyframes gpToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes gpSpin{to{transform:rotate(360deg)}}
@keyframes gpPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes gpRowIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* Inputs & selects */
.gp-input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid  #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color: #111;background: #FAFAFA;outline:none;transition:border-color .15s,background .15s}
.gp-input:focus{border-color: #818CF8;background: #fff}
.gp-select{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid  #E5E7EB;font-size:14px;font-family:'DM Sans',sans-serif;color: #111;background: #FAFAFA;outline:none;appearance:none;cursor:pointer;transition:border-color .15s}
.gp-select:focus{border-color: #818CF8}
.gp-label{display:block;font-size:10.5px;font-weight:700;color: #9CA3AF;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px}
.gp-field{margin-bottom:16px}

/* Buttons */
.gp-primary-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;background: #18181B;color: #fff;font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.01em;transition:background .14s,transform .1s}
.gp-primary-btn:hover{background: #27272A}
.gp-primary-btn:active{transform:scale(.98)}
.gp-primary-btn:disabled{opacity:.55;cursor:not-allowed}
.gp-ghost-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1.5px solid  #E5E7EB;background: #fff;color: #374151;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:background .13s,border-color .13s;white-space:nowrap}
.gp-ghost-btn:hover{background: #F3F4F6;border-color: #D1D5DB}
.gp-icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid  #E5E7EB;background: #F9FAFB;display:flex;align-items:center;justify-content:center;cursor:pointer;color: #374151;transition:background .13s;flex-shrink:0}
.gp-icon-btn:hover{background: #F0F0F0}
.gp-icon-btn.del{border-color: #FEE2E2;background: #FFF5F5;color: #DC2626}
.gp-icon-btn.del:hover{background: #FEE2E2}

/* Toggle */
.gp-toggle{width:34px;height:20px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;padding:0}
.gp-toggle::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background: #fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.gp-toggle.on{background: #4F46E5}
.gp-toggle.on::after{transform:translateX(14px)}
.gp-toggle.off{background: #D1D5DB}

/* Table */
.gp-table-wrap{background: #fff;border-radius:16px;border:1.5px solid  #EAECF0;overflow:hidden;animation:gpFadeUp .3s ease both}
.gp-table{width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif}
.gp-table thead tr{background: #F9FAFB;border-bottom:1.5px solid  #EAECF0}
.gp-table thead th{padding:11px 14px;text-align:center;font-size:11px;font-weight:700;color: #6B7280;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;user-select:none}
.gp-table tbody tr{border-bottom:1px solid  #F3F4F6;transition:background .13s;animation:gpRowIn .25s ease both}
.gp-table tbody tr:last-child{border-bottom:none}
.gp-table tbody tr:hover{background: #FAFBFF}
.gp-table tbody tr.inactive-row{opacity:.7}
.gp-table tbody td{padding:13px 14px;font-size:13px;color: #374151;vertical-align:middle;text-align:center}

/* Sort caret */
.gp-th-btn{background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color: #6B7280;text-transform:uppercase;letter-spacing:.08em;padding:0;font-family:'DM Sans',sans-serif}
.gp-th-btn:hover{color: #374151}

/* Tooltip toggle label */
.gp-toggle-wrap{display:flex;flex-direction:column;align-items:center;gap:3px}
.gp-toggle-label{font-size:10px;color: #9CA3AF;font-weight:500;white-space:nowrap}
`

const Ico = {
  plus:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  close:    () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  search:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  wrench:   () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  chart:    () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  link:     () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  trash:    () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  question: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  play:     () => <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  spin:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{animation:'gpSpin .75s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  globe:    () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  star:     () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  caretUp:  () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>,
  caretDn:  () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>,
  copy:     () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  qr:       () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="4" height="4"/><line x1="3" y1="18" x2="3" y2="21"/><line x1="7" y1="21" x2="7" y2="21"/><line x1="18" y1="14" x2="21" y2="14"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="18" y2="21"/><line x1="14" y1="21" x2="14" y2="21"/></svg>,
  download: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [])
  const ok = type === 'success'
  return (
    <div style={{
      position:'fixed',bottom:28,right:28,zIndex:9999,
      background: ok ? ' #052E16' : ' #450A0A', color:' #fff',
      padding:'13px 20px 13px 16px',borderRadius:12,fontSize:13.5,
      fontFamily:"'DM Sans',sans-serif",fontWeight:500,
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,.24)',
      borderLeft:`3px solid ${ok?' #22C55E':' #EF4444'}`,
      animation:'gpToastIn .28s cubic-bezier(.34,1.56,.64,1)',maxWidth:420,
    }}>
      {ok?'✓':'✕'} {msg}
    </div>
  )
}

// Inline toggle that calls API immediately
function FieldToggle({ gameId, field, value, label, onUpdated, onError }) {
  const [loading, setLoading] = useState(false)
  const toggle = async e => {
    e.stopPropagation()
    setLoading(true)
    try {
      await api.put(`/games/${gameId}`, { [field]: value ? 0 : 1 })
      onUpdated()
    } catch { onError('Failed to update') }
    finally { setLoading(false) }
  }
  return (
    <div className="gp-toggle-wrap">
      <button
        className={`gp-toggle ${value ? 'on' : 'off'}`}
        onClick={toggle}
        disabled={loading}
        title={`${value ? 'Disable' : 'Enable'} ${label}`}
        style={loading ? { opacity: 0.5 } : {}}
      />
      <span className="gp-toggle-label">{value ? 'On' : 'Off'}</span>
    </div>
  )
}

function QRCodeModal({ game, onClose, onError }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const host = typeof window !== 'undefined' ? window.location.origin : ''
  const link = `${host}/play/${game.slug}/${game.client_slug}`

  useEffect(() => {
    QRCode.toDataURL(link, {
      width: 260,
      margin: 2,
      color: { dark:'#0D0D1A', light:'#FFFFFF' }
    }).then(setQrDataUrl).catch(() => onError('Failed to generate QR'))
  }, [])

  const handleCopyQr = async () => {
    try {
      const res = await fetch(qrDataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch { onError('Failed to copy QR image') }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = game.name.replace(/ /g, '-') + '-qr.png'
    a.click()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{position:'relative',background:' #fff',borderRadius:24,width:'100%',maxWidth:400,padding:'34px 28px 28px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif",textAlign:'center'}}>
        <button className="gp-icon-btn" onClick={onClose} style={{position:'absolute',top:14,right:14}}><Ico.close/></button>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:22}}>
          <img src="/favicon3.png" alt="" style={{width:30,height:30,borderRadius:8,objectFit:'cover'}} onError={e=>{e.target.style.display='none'}} />
          <span style={{fontSize:15,fontWeight:700,color:' #0D0D1A',letterSpacing:'-0.01em'}}>{game.company_name}</span>
        </div>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code" style={{width:200,height:200,borderRadius:16,margin:'0 auto 20px',display:'block',padding:12,background:' #FAFAFA',border:'1px solid  #EAECF0'}} />
        ) : (
          <div style={{width:200,height:200,borderRadius:16,margin:'0 auto 20px',background:' #F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',color:' #9CA3AF'}}><Ico.spin/></div>
        )}
        <p style={{fontSize:13.5,fontWeight:600,color:' #0D0D1A',marginBottom:4}}>{game.name}</p>
        <p style={{fontSize:12,color:' #9CA3AF',marginBottom:24,wordBreak:'break-all'}}>{link}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button className="gp-primary-btn" onClick={handleCopyQr} disabled={!qrDataUrl} style={{justifyContent:'center',padding:'11px 0',borderRadius:10,fontSize:13.5}}><Ico.copy/> Copy QR Image</button>
          <button className="gp-ghost-btn" onClick={handleCopyLink} style={{justifyContent:'center',padding:'10px 0',borderRadius:10,fontSize:13}}><Ico.link/> Copy Game Link</button>
          <button className="gp-ghost-btn" onClick={handleDownload} disabled={!qrDataUrl} style={{justifyContent:'center',padding:'10px 0',borderRadius:10,fontSize:13}}><Ico.download/> Download QR</button>
        </div>
      </div>
    </div>
  )
}

function QuickAddClientModal({ onClose, onCreated, onError }) {
  const [form, setForm] = useState({company_name:'',contact_name:'',email:'',phone:''})
  const [submitting, setSubmitting] = useState(false)
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.company_name) return
    setSubmitting(true)
    try {
      const res = await api.post('/clients', form)
      onCreated(res.data.client)
      onClose()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to create client')
      setSubmitting(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:700,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}}>
      <div style={{background:' #fff',borderRadius:20,width:'100%',maxWidth:480,padding:'34px 30px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',animation:'gpModalIn .22s cubic-bezier(.22,1,.36,1)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:' #0D0D1A',letterSpacing:'-0.02em'}}>Add Client</h2>
            <p style={{color:' #9CA3AF',fontSize:13,marginTop:4}}>Create a client to associate this game with.</p>
          </div>
          <button className="gp-icon-btn" onClick={onClose}><Ico.close/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="gp-field">
            <label className="gp-label">Company Name <span style={{color:' #EF4444'}}>*</span></label>
            <input className="gp-input" value={form.company_name} onChange={set('company_name')} placeholder="e.g. Acme Corp" required />
          </div>
          <div className="gp-field">
            <label className="gp-label">Contact Name</label>
            <input className="gp-input" value={form.contact_name} onChange={set('contact_name')} placeholder="Full name" />
          </div>
          <div className="gp-field">
            <label className="gp-label">Email</label>
            <input className="gp-input" type="email" value={form.email} onChange={set('email')} placeholder="contact@acme.com" />
          </div>
          <div className="gp-field" style={{marginBottom:26}}>
            <label className="gp-label">Phone</label>
            <input className="gp-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="button" className="gp-ghost-btn" onClick={onClose} style={{flex:1,justifyContent:'center',padding:'11px 0'}}>Cancel</button>
            <button type="submit" className="gp-primary-btn" disabled={submitting} style={{flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,fontSize:14}}>
              {submitting ? <><Ico.spin/> Adding…</> : 'Add Client & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateModal({ clients, onClose, onCreated, onError, onAddClient }) {
  const [form, setForm] = useState({client_id:'',name:'',category:'quiz',description:'',redirect_url:''})
  const [submitting, setSubmitting] = useState(false)
  const [gameTypeSearch, setGameTypeSearch] = useState('')
  const navigate = useNavigate()
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

const handleSubmit = async e => {
  e.preventDefault()
  setSubmitting(true)

  try {
    const res = await api.post('/games', form)

    const game = res.data.game

    onCreated()
    onClose()

    if (game.category === 'crossword') {
      navigate(`/dashboard/games/${game.id}/crossword-builder`)
    } else if (game.category === 'spin') {
      navigate(`/dashboard/games/${game.id}/spin-builder`)
    } else if (game.category === 'memory') {
      navigate(`/dashboard/games/${game.id}/memory-builder`)
    } else if (game.category === 'jigsaw') {
      navigate(`/dashboard/games/${game.id}/jigsaw-builder`)
    } else if (game.category === 'wordsearch') {
      navigate(`/dashboard/games/${game.id}/wordsearch-builder`)
    } else if (game.category === 'pouring') {
      navigate(`/dashboard/games/${game.id}/pouring-builder`)
    } else if (game.category === 'typer') {
      navigate(`/dashboard/games/${game.id}/typer-builder`)
    } else if (game.category === 'math') {
      navigate(`/dashboard/games/${game.id}/math-builder`)
    } else if (game.category === 'maze') {
      navigate(`/dashboard/games/${game.id}/maze-builder`)
    } else if (game.category === 'screw') {
      navigate(`/dashboard/games/${game.id}/screw-builder`)
    } else if (game.category === '2048') {
      navigate(`/dashboard/games/${game.id}/2048-builder`)
    } else if (game.category === 'snake') {
      navigate(`/dashboard/games/${game.id}/snake-builder`)
    } else if (game.category === 'catch') {
      navigate(`/dashboard/games/${game.id}/catch-builder`)
    } else if (game.category === 'reaction') {
      navigate(`/dashboard/games/${game.id}/reaction-builder`)
    } else if (game.category === 'simon') {
      navigate(`/dashboard/games/${game.id}/simon-builder`)
    } else if (game.category === 'flappy') {
      navigate(`/dashboard/games/${game.id}/flappy-builder`)
    } else if (game.category === 'bounce') {
      navigate(`/dashboard/games/${game.id}/bounce-builder`)
    } else if (game.category === 'space') {
      navigate(`/dashboard/games/${game.id}/space-builder`)
    } else if (game.category === 'connect4') {
      navigate(`/dashboard/games/${game.id}/connect4-builder`)
    } else if (game.category === 'bowling') {
      navigate(`/dashboard/games/${game.id}/bowling-builder`)
    } else if (game.category === 'sudoku') {
      navigate(`/dashboard/games/${game.id}/sudoku-builder`)
    } else if (game.category === 'minesweeper') {
      navigate(`/dashboard/games/${game.id}/minesweeper-builder`)
    } else if (game.category === 'wordscramble') {
      navigate(`/dashboard/games/${game.id}/wordscramble-builder`)
    } else if (game.category === 'rps') {
      navigate(`/dashboard/games/${game.id}/rps-builder`)
    } else if (game.category === 'arrowescape') {
      navigate(`/dashboard/games/${game.id}/arrowescape-builder`)
    } else if (game.category === 'bejeweled') {
      navigate(`/dashboard/games/${game.id}/bejeweled-builder`)
    } else if (game.category === 'tetris') {
      navigate(`/dashboard/games/${game.id}/tetris-builder`)
    } else if (game.category === 'stack') {
      navigate(`/dashboard/games/${game.id}/stack-builder`)
    } else if (game.category === 'whackamole') {
      navigate(`/dashboard/games/${game.id}/whackamole-builder`)
    } else if (game.category === 'hanoi') {
      navigate(`/dashboard/games/${game.id}/hanoi-builder`)
    } else if (game.category === 'breakout') {
      navigate(`/dashboard/games/${game.id}/breakout-builder`)
    } else if (game.category === 'bubbleshooter') {
      navigate(`/dashboard/games/${game.id}/bubbleshooter-builder`)
    } else if (game.category === 'carlaunch') {
      navigate(`/dashboard/games/${game.id}/carlaunch-builder`)
    } else if (game.category === 'frustration' || game.category === 'stressbuster') {
      navigate(`/dashboard/games/${game.id}/frustration-builder`)
    } else if (game.category === 'soundify') {
      navigate(`/dashboard/games/${game.id}/soundify-builder`)
    } else if (game.category === 'tictactoe') {
      navigate(`/dashboard/games/${game.id}/tictactoe-builder`)
    } else if (game.category === 'chess') {
      navigate(`/dashboard/games/${game.id}/chess-builder`)
    } else {
      navigate(`/dashboard/games/${game.id}/builder`)
    }

  } catch (err) {
    onError(err.response?.data?.message || 'Error creating game')
    setSubmitting(false)
  }
}

  return (
    <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(15,23,42,.65)',backdropFilter:'blur(20px) saturate(1.3)',WebkitBackdropFilter:'blur(20px) saturate(1.3)',animation:'gpFadeIn .3s ease'}}>
      {/* Decorative orbs */}
      <div style={{position:'fixed',top:'15%',left:'10%',width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)',filter:'blur(70px)',pointerEvents:'none',animation:'gpOrbFloat 12s ease-in-out infinite'}} />
      <div style={{position:'fixed',bottom:'5%',right:'8%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)',filter:'blur(60px)',pointerEvents:'none',animation:'gpOrbFloat 15s ease-in-out infinite reverse'}} />

      {/* ── Glass Modal ── */}
      <div className="gp-no-scrollbar" style={{
        background:'rgba(255,255,255,0.78)',
        backdropFilter:'blur(32px) saturate(1.5)',
        WebkitBackdropFilter:'blur(32px) saturate(1.5)',
        borderRadius:28,width:'85vw',maxWidth:1100,maxHeight:'92vh',overflow:'auto',
        padding:'0',
        border:'1px solid rgba(255,255,255,0.35)',
        boxShadow:'0 32px 80px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        animation:'gpModalIn .35s cubic-bezier(.34,1.56,.64,1)',fontFamily:"'DM Sans',sans-serif",
        scrollbarWidth:'none',msOverflowStyle:'none',
      }}>
        {/* ── Header ── */}
        <div style={{
          padding:'28px 36px 18px',
          background:'rgba(255,255,255,0.5)',
          borderBottom:'1px solid rgba(0,0,0,0.06)',
          position:'sticky',top:0,zIndex:10,
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:28}}>🎮</span>
              <div>
                <h2 style={{fontWeight:800,fontSize:22,color:'#111827',margin:0,lineHeight:1.2,letterSpacing:'-0.02em'}}>New Game</h2>
                <p style={{color:'#6B7280',fontSize:13,marginTop:3}}>Choose a game type to get started</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width:36,height:36,borderRadius:10,
              border:'1px solid rgba(0,0,0,0.1)',background:'rgba(255,255,255,0.6)',
              display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
              color:'#9CA3AF',fontSize:16,transition:'all .15s',flexShrink:0,
            }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.9)';e.currentTarget.style.color='#374151'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.6)';e.currentTarget.style.color='#9CA3AF'}}><Ico.close/></button>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} style={{padding:'24px 36px 32px'}}>

          {/* Client */}
          <div style={{marginBottom:18}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Client <span style={{color:'#EF4444'}}>*</span></label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{position:'relative',flex:1}}>
                <select value={form.client_id} onChange={set('client_id')} required style={{
                  width:'100%',padding:'9px 36px 9px 12px',borderRadius:8,
                  border:'1.5px solid rgba(0,0,0,0.08)',
                  background:'rgba(255,255,255,0.6)',
                  fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#111',outline:'none',
                  appearance:'none',cursor:'pointer',transition:'all .2s',
                }} onFocus={e=>{e.target.style.borderColor='#8B5CF6';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)';e.target.style.background='rgba(255,255,255,0.9)'}} onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.6)'}}>
                  <option value="">Select a client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
                <svg style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9CA3AF'}} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <button type="button" onClick={onAddClient} style={{
                padding:'9px 12px',whiteSpace:'nowrap',fontSize:12,fontWeight:600,
                borderRadius:8,border:'1.5px dashed rgba(0,0,0,0.12)',background:'rgba(255,255,255,0.4)',
                color:'#8B5CF6',cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif",
              }} onMouseOver={e=>{e.currentTarget.style.borderColor='#8B5CF6';e.currentTarget.style.background='rgba(139,92,246,0.08)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(0,0,0,0.12)';e.currentTarget.style.background='rgba(255,255,255,0.4)'}}>
                + Add Client
              </button>
            </div>
          </div>

          {/* Game Name */}
          <div style={{marginBottom:18}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Game Name <span style={{color:'#EF4444'}}>*</span></label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Product Knowledge Quiz" required style={{
              width:'100%',padding:'11px 14px',borderRadius:10,
              border:'1.5px solid rgba(0,0,0,0.08)',
              background:'rgba(255,255,255,0.6)',
              fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#111',outline:'none',
              transition:'all .2s',
            }} onFocus={e=>{e.target.style.borderColor='#8B5CF6';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)';e.target.style.background='rgba(255,255,255,0.9)'}} onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.6)'}} />
          </div>

          {/* Category Grid */}
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>Choose Game Type</label>
            <div style={{position:'relative',marginBottom:12}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#9CA3AF'}} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Search game types..."
                value={gameTypeSearch}
                onChange={e => setGameTypeSearch(e.target.value)}
                style={{
                  width:'100%',padding:'9px 12px 9px 36px',borderRadius:8,
                  border:'1.5px solid rgba(0,0,0,0.08)',
                  background:'rgba(255,255,255,0.6)',
                  fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#111',outline:'none',
                  transition:'all .2s',
                }}
                onFocus={e=>{e.target.style.borderColor='#8B5CF6';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)';e.target.style.background='rgba(255,255,255,0.9)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.6)'}}
              />
              {gameTypeSearch && (
                <button type="button" onClick={() => setGameTypeSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',padding:2,fontSize:14,lineHeight:1}}>×</button>
              )}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))',gap:12}}>
              {Object.entries(CATEGORY_META).sort((a, b) => a[1].label.localeCompare(b[1].label)).filter(([k,v]) => !gameTypeSearch || v.label.toLowerCase().includes(gameTypeSearch.toLowerCase()) || v.desc.toLowerCase().includes(gameTypeSearch.toLowerCase())).map(([k,v]) => {
                const selected = form.category === k
                return (
                  <button key={k} type="button"
                    onClick={() => setForm(f=>({...f,category:k}))}
                    onMouseOver={e=>{if(!selected){e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.1)'}}}
                    onMouseOut={e=>{if(!selected){e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}}
                    style={{
                      padding:'22px 12px 18px',borderRadius:16,
                      border:selected ? '2px solid #8B5CF6' : '1px solid rgba(0,0,0,0.06)',
                      background: selected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.5)',
                      cursor:'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
                      display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                      position:'relative',overflow:'hidden',
                      boxShadow: selected ? '0 4px 20px rgba(139,92,246,0.2), inset 0 0 0 1px rgba(139,92,246,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                      transform: selected ? 'scale(1.03)' : 'scale(1)',
                    }}>
                    {selected && <div style={{
                      position:'absolute',top:6,right:6,
                      width:18,height:18,borderRadius:'50%',
                      background:'#8B5CF6',color:'#fff',fontSize:10,fontWeight:800,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxShadow:'0 2px 8px rgba(139,92,246,0.4)',
                      animation:'gpBounceIn .3s ease',zIndex:2,
                    }}>✓</div>}
                    <span style={{fontSize:30,lineHeight:1}}>{v.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:selected?'#6D28D9':'#1F2937',lineHeight:1.2}}>
                      {v.label}
                    </span>
                    <span style={{fontSize:9.5,color:selected?'#7C3AED':'#9CA3AF',lineHeight:1.3,textAlign:'center'}}>
                      {v.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{marginBottom:18}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Description</label>
            <textarea rows={2} value={form.description} onChange={set('description')} placeholder="Optional game description" style={{
              width:'100%',padding:'11px 14px',borderRadius:10,
              border:'1.5px solid rgba(0,0,0,0.08)',
              background:'rgba(255,255,255,0.6)',
              fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#111',outline:'none',
              resize:'vertical',transition:'all .2s',
            }} onFocus={e=>{e.target.style.borderColor='#8B5CF6';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)';e.target.style.background='rgba(255,255,255,0.9)'}} onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.6)'}} />
          </div>

          {/* Redirect URL */}
          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>
              Redirect URL <span style={{color:'#9CA3AF',fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:10}}>(after game ends)</span>
            </label>
            <input type="url" value={form.redirect_url} onChange={set('redirect_url')} placeholder="https://yoursite.com/thankyou" style={{
              width:'100%',padding:'11px 14px',borderRadius:10,
              border:'1.5px solid rgba(0,0,0,0.08)',
              background:'rgba(255,255,255,0.6)',
              fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#111',outline:'none',
              transition:'all .2s',
            }} onFocus={e=>{e.target.style.borderColor='#8B5CF6';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)';e.target.style.background='rgba(255,255,255,0.9)'}} onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,0.08)';e.target.style.boxShadow='none';e.target.style.background='rgba(255,255,255,0.6)'}} />
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:10,borderTop:'1px solid rgba(0,0,0,0.06)',paddingTop:18}}>
            <button type="button" onClick={onClose} style={{
              flex:1,justifyContent:'center',padding:'12px 0',fontSize:14,fontWeight:600,
              borderRadius:10,border:'1.5px solid rgba(0,0,0,0.08)',background:'rgba(255,255,255,0.5)',
              color:'#6B7280',cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif",
            }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.8)';e.currentTarget.style.borderColor='rgba(0,0,0,0.12)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.5)';e.currentTarget.style.borderColor='rgba(0,0,0,0.08)'}}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              flex:2,justifyContent:'center',padding:'12px 0',borderRadius:10,border:'none',
              background:submitting ? 'rgba(0,0,0,0.15)' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color:submitting?'#9CA3AF':'#fff',fontSize:14,fontWeight:700,
              cursor:submitting?'not-allowed':'pointer',
              fontFamily:"'DM Sans',sans-serif",transition:'all .2s',
              boxShadow:submitting?'none':'0 4px 16px rgba(139,92,246,0.3)',
            }} onMouseOver={e=>{if(!submitting){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 24px rgba(139,92,246,0.4)'}}} onMouseOut={e=>{if(!submitting){e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(139,92,246,0.3)'}}}>
              {submitting ? <><Ico.spin/> Creating…</> : '🚀 Create & Open Builder'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes gpFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes gpBounceIn{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes gpOrbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
        .gp-no-scrollbar::-webkit-scrollbar{display:none}
        .gp-no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  )
}

// Column definitions — order here = order in table
const STATUS_META = {
  development: { label:'Development', color:'#D97706', bg:'#FFFBEB' },
  testing:     { label:'Testing',     color:'#DC2626', bg:'#FEF2F2' },
  live:        { label:'Live',        color:'#059669', bg:'#F0FDF4' },
}

const COLUMNS = [
  { key:'name',         label:'Game',          sortable:true  },
  { key:'category',     label:'Category',      sortable:false },
  { key:'qty_plays',    label:'Qty / Plays',   sortable:false, center:true },
  { key:'is_active',    label:'Active',        sortable:false, center:true },
  { key:'show_in_play_page', label:'Play Page', sortable:false, center:true },
  { key:'show_in_hero_page', label:'Hero',     sortable:false, center:true },
  { key:'game_type',    label:'Game Type',     sortable:false, center:true },
  { key:'status',       label:'Status',        sortable:false, center:true },
  { key:'created_edited', label:'Created / Edited', sortable:false },
  { key:'actions',      label:'Actions',       sortable:false, center:true },
  { key:'qr',           label:'QR',            sortable:false, center:true },
]

function SortTh({ col, sortKey, sortDir, onSort }) {
  const active = sortKey === col.key
  return (
    <th className={col.center ? 'center' : ''}>
      {col.sortable ? (
        <button className="gp-th-btn" onClick={() => onSort(col.key)}
          style={active ? {color:' #4338CA'} : {}}>
          {col.label}
          <span style={{color: active ? ' #4338CA' : ' #D1D5DB', marginLeft:2}}>
            {active && sortDir === 'asc' ? <Ico.caretUp/> : <Ico.caretDn/>}
          </span>
        </button>
      ) : (
        <span style={{fontSize:11,fontWeight:700,color:' #6B7280',textTransform:'uppercase',letterSpacing:'.08em'}}>
          {col.label}
        </span>
      )}
    </th>
  )
}

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [qrModalGame, setQrModalGame] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [expandedParents, setExpandedParents] = useState({})
  const navigate = useNavigate()

  const load = () =>
    Promise.all([api.get('/games'), api.get('/clients')])
      .then(([gr,cr]) => { setGames(gr.data.games||[]); setClients(cr.data.clients||[]) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const showToast = (msg, type='success') => setToast({msg, type})

  const handleDelete = async id => {
    if (!confirm('Delete this game and all its questions, images and sounds?')) return
    try { await api.delete(`/games/${id}`); showToast('Game deleted'); load() }
    catch { showToast('Delete failed','error') }
  }

  const toggleField = async (game, field) => {
    if (field === 'is_active' && game.status !== 'live') {
      showToast('Set status to Live first before activating','error')
      return
    }
    try {
      await api.put(`/games/${game.id}`, { [field]: game[field] ? 0 : 1 })
      load()
    } catch { showToast('Failed to update','error') }
  }

  const handleDuplicate = async id => {
    try {
      await api.post(`/games/${id}/duplicate`)
      showToast('Game duplicated')
      load()
    } catch { showToast('Duplicate failed','error') }
  }

  const STATUS_CYCLE = ['development', 'testing', 'live']

  const navigateBuilder = (game) => {
    const builders = {crossword:'crossword',spin:'spin',memory:'memory',jigsaw:'jigsaw',wordsearch:'wordsearch',pouring:'pouring',typer:'typer',screw:'screw',math:'math',maze:'maze','2048':'2048',snake:'snake',catch:'catch',reaction:'reaction',simon:'simon',flappy:'flappy',bounce:'bounce',space:'space',connect4:'connect4',bejeweled:'bejeweled',tetris:'tetris',stack:'stack',bowling:'bowling',sudoku:'sudoku',minesweeper:'minesweeper',wordscramble:'wordscramble',rps:'rps',whackamole:'whackamole',hanoi:'hanoi',breakout:'breakout',bubbleshooter:'bubbleshooter',carlaunch:'carlaunch',arrowescape:'arrowescape',frustration:'frustration',stressbuster:'frustration',soundify:'soundify',tictactoe:'tictactoe',chess:'chess'}
    const slug = builders[game.category]
    navigate(`/dashboard/games/${game.id}${slug ? '/' + slug + '-builder' : '/builder'}`)
  }

  const handleStatusToggle = async (game, e) => {
    e.stopPropagation()
    const currentIndex = STATUS_CYCLE.indexOf(game.status)
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]
    try {
      await api.put(`/games/${game.id}/status`, { status: nextStatus })
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error')
    }
  }

  const handleGameTypeToggle = async (game, e) => {
    e.stopPropagation()
    const newType = game.game_type === 'branded' ? 'promogames' : 'branded'
    try {
      await api.put(`/games/${game.id}`, { game_type: newType })
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update game type','error')
    }
  }

  const copyLink = (game, e) => {
    e.stopPropagation()
    const link = `${window.location.origin}/play/${game.slug}/${game.client_slug}`
    navigator.clipboard.writeText(link)
    if (!game.is_active) showToast('Link copied — game is currently inactive.','error')
    else showToast('Game link copied!')
  }

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // Filter
  const filtered = games.filter(g => {
    const matchSearch = !search || [g.name, g.company_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat === 'all' || g.category === filterCat
    return matchSearch && matchCat
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'created_at') { av = new Date(av); bv = new Date(bv) }
    else if (typeof av === 'string') { av = av?.toLowerCase() || ''; bv = bv?.toLowerCase() || '' }
    else { av = av ?? 0; bv = bv ?? 0 }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const stats = {
    total: games.length,
    active: games.filter(g => g.is_active).length,
    plays: games.reduce((a,g) => a + (g.play_count||0), 0),
    onPlayPage: games.filter(g => g.show_in_play_page).length,
    onHero: games.filter(g => g.show_in_hero_page).length,
    branded: games.filter(g => g.game_type === 'branded').length,
    promogames: games.filter(g => g.game_type === 'promogames').length,
  }

  const fmtDate = dt => {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})
  }

  return (
    <div className="gp">
      <style>{CSS}</style>
      <div style={{padding:'36px 40px',maxWidth:1400,margin:'0 auto'}}>

        {/* Header — 3-col: Title | Search | Add Game */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr 1fr',alignItems:'center',marginBottom:28,gap:16}}>
          <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:36,color:' #0D0D1A',letterSpacing:'-0.03em',lineHeight:1}}>
            Games
          </h1>
          {games.length > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{position:'relative',flex:1}}>
                <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:' #9CA3AF'}}><Ico.search/></span>
                <input className="gp-input" style={{paddingLeft:40,height:38,padding:'0 14px 0 40px',width:'100%'}} placeholder="Search games or client…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              {/* View toggle */}
              <div style={{display:'flex',background:'#F3F4F6',borderRadius:8,padding:3,gap:2}}>
                <button onClick={() => setViewMode('list')} style={{padding:'6px 10px',borderRadius:6,border:'none',background:viewMode==='list'?'#fff':'transparent',cursor:'pointer',boxShadow:viewMode==='list'?'0 1px 3px rgba(0,0,0,0.1)':'none',transition:'all .15s',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:viewMode==='list'?'#4F46E5':'#6B7280',fontFamily:'inherit'}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                    List
                  </button>
                  <button onClick={() => setViewMode('tree')} style={{padding:'6px 10px',borderRadius:6,border:'none',background:viewMode==='tree'?'#fff':'transparent',cursor:'pointer',boxShadow:viewMode==='tree'?'0 1px 3px rgba(0,0,0,0.1)':'none',transition:'all .15s',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:viewMode==='tree'?'#4F46E5':'#6B7280',fontFamily:'inherit'}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Grid
                  </button>
                </div>
              </div>
          )}
          <div style={{justifySelf:'end'}}>
            <button className="gp-primary-btn" onClick={() => setShowForm(true)}><Ico.plus/> Create Game</button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'80px 0',color:' #9CA3AF',fontSize:14}}>
            <Ico.spin/> Loading games…
          </div>
        ) : games.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div style={{width:72,height:72,borderRadius:18,background:' #F5F3FF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="30" height="30" fill="none" stroke=" #6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 12h.01M18 12h.01"/></svg>
            </div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:' #0D0D1A',marginBottom:8}}>No games yet</h3>
            <p style={{color:' #9CA3AF',fontSize:14,marginBottom:24}}>Create your first game to get started.</p>
            <button className="gp-primary-btn" onClick={()=>setShowForm(true)}><Ico.plus/> Create Game</button>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:' #9CA3AF',fontSize:14}}>
            No games match your filters.
          </div>
        ) : viewMode === 'list' ? (
          <>
          <div className="gp-table-wrap" style={{overflowX:'auto'}}>
            <table className="gp-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <SortTh key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((game, i) => {
                  const cat = catMeta(game.category)
                  return (
                    <tr
                      key={game.id}
                      className={game.is_active ? '' : 'inactive-row'}
                      style={{animationDelay:`${i*30}ms`, cursor:'pointer'}}
                      onClick={() => navigate(`/dashboard/games/${game.id}/responses`)}
                    >
                      {/* Game + Client */}
                      <td style={{minWidth:160}}>
                        <div style={{fontWeight:600,color:' #0D0D1A',fontSize:13.5,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>
                          {game.name}
                        </div>
                        <div style={{fontSize:11.5,color:' #6B7280',fontWeight:500}}>
                          {game.company_name || '—'}
                        </div>
                      </td>
                      {/* Category */}
                      <td style={{minWidth:90}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,background:cat.bg,color:cat.fg,fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:100,letterSpacing:'.01em'}}>
                          <span style={{width:5,height:5,borderRadius:'50%',background:cat.dot,flexShrink:0}} />
                          {cat.label}
                        </span>
                      </td>

                      {/* Qty / Plays */}
                      <td className="center" style={{minWidth:90}}>
                        <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,fontSize:12,color:' #374151'}}>
                          <span style={{display:'flex',alignItems:'center',gap:4,fontWeight:600}}><Ico.question/> {game.question_count||0}</span>
                          <span style={{display:'flex',alignItems:'center',gap:4,color:' #6B7280'}}><Ico.play/> {(game.play_count||0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Active toggle — only toggleable when status is live */}
                      <td className="center" style={{minWidth:72}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.status === 'live' && game.is_active ? 'on' : 'off'}`}
                            disabled={game.status !== 'live'}
                            title={game.status !== 'live' ? 'Set status to Live first' : (game.is_active ? 'Deactivate game' : 'Activate game')}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'is_active') }}
                            style={game.status !== 'live' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                          />
                          <span className="gp-toggle-label">{game.status === 'live' ? (game.is_active ? 'On' : 'Off') : 'Off'}</span>
                        </div>
                      </td>

                      {/* Show in Play Page */}
                      <td className="center" style={{minWidth:80}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.show_in_play_page ? 'on' : 'off'}`}
                            title={game.show_in_play_page ? 'Remove from play page' : 'Show on play page'}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'show_in_play_page') }}
                          />
                          <span className="gp-toggle-label">{game.show_in_play_page ? 'On' : 'Off'}</span>
                        </div>
                      </td>

                      {/* Show in Hero Page */}
                      <td className="center" style={{minWidth:80}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.show_in_hero_page ? 'on' : 'off'}`}
                            title={game.show_in_hero_page ? 'Remove from hero' : 'Feature on homepage hero'}
                            onClick={e => { e.stopPropagation(); toggleField(game, 'show_in_hero_page') }}
                          />
                          <span className="gp-toggle-label">{game.show_in_hero_page ? 'On' : 'Off'}</span>
                        </div>
                      </td>

                      {/* Game Type */}
                      <td className="center" style={{minWidth:90}} onClick={e => e.stopPropagation()}>
                        <div className="gp-toggle-wrap">
                          <button
                            className={`gp-toggle ${game.game_type === 'branded' ? 'on' : 'off'}`}
                            onClick={e => handleGameTypeToggle(game, e)}
                          />
                          <span className="gp-toggle-label">
                            {game.game_type === 'branded' ? 'Branded' : 'PromoGames'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="center" style={{minWidth:80}} onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                          <span style={{
                            padding:'3px 10px', borderRadius:100, fontSize:10.5, fontWeight:700,
                            background: (STATUS_META[game.status]||STATUS_META.development).bg,
                            color: (STATUS_META[game.status]||STATUS_META.development).color,
                          }}>
                            {(STATUS_META[game.status]||STATUS_META.development).label}
                          </span>
                          <button
                            style={{
                              padding:'3px 8px', borderRadius:6, border:'1.5px solid #E5E7EB',
                              background:'#fff', fontSize:10, fontWeight:600, cursor:'pointer',
                              fontFamily:'DM Sans', color:'#6B7280', transition:'all .13s',
                            }}
                            onClick={e => handleStatusToggle(game, e)}
                            onMouseOver={e=>{e.currentTarget.style.borderColor='#818CF8';e.currentTarget.style.color='#4F46E5'}}
                            onMouseOut={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='#6B7280'}}
                          >
                            Cycle →
                          </button>
                        </div>
                      </td>

                      {/* Created / Edited */}
                      <td style={{minWidth:130,fontSize:11.5,color:' #9CA3AF',whiteSpace:'nowrap'}}>
                        <div>Created {fmtDate(game.created_at)}</div>
                        {game.updated_at && new Date(game.updated_at).getTime() !== new Date(game.created_at).getTime() && (
                          <div style={{color:' #6B7280',marginTop:2}}>
                            Edited {fmtDate(game.updated_at)}
                            {game.updated_by_name && <span> by {game.updated_by_name}</span>}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="center" style={{minWidth:100}} onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); handleDuplicate(game.id) }} title="Duplicate">
                              <Ico.copy/>
                            </button>
                            <button className="gp-ghost-btn" style={{background:' #18181B',color:' #fff',borderColor:' #18181B',padding:'4px 10px',justifyContent:'center',fontSize:10.5,gap:3}}
                              onClick={() => {
                                if (game.category === 'crossword') navigate(`/dashboard/games/${game.id}/crossword-builder`)
                                else if (game.category === 'spin') navigate(`/dashboard/games/${game.id}/spin-builder`)
                                else if (game.category === 'memory') navigate(`/dashboard/games/${game.id}/memory-builder`)
                                else if (game.category === 'jigsaw') navigate(`/dashboard/games/${game.id}/jigsaw-builder`)
                                else if (game.category === 'wordsearch') navigate(`/dashboard/games/${game.id}/wordsearch-builder`)
                                else if (game.category === 'pouring') navigate(`/dashboard/games/${game.id}/pouring-builder`)
                                else if (game.category === 'typer') navigate(`/dashboard/games/${game.id}/typer-builder`)
                                else if (game.category === 'screw') navigate(`/dashboard/games/${game.id}/screw-builder`)
                                else if (game.category === 'math') navigate(`/dashboard/games/${game.id}/math-builder`)
                                else if (game.category === 'maze') navigate(`/dashboard/games/${game.id}/maze-builder`)
                                else if (game.category === '2048') navigate(`/dashboard/games/${game.id}/2048-builder`)
                                else if (game.category === 'snake') navigate(`/dashboard/games/${game.id}/snake-builder`)
                                else if (game.category === 'catch') navigate(`/dashboard/games/${game.id}/catch-builder`)
                                else if (game.category === 'reaction') navigate(`/dashboard/games/${game.id}/reaction-builder`)
                                else if (game.category === 'simon') navigate(`/dashboard/games/${game.id}/simon-builder`)
                                else if (game.category === 'flappy') navigate(`/dashboard/games/${game.id}/flappy-builder`)
                                else if (game.category === 'bounce') navigate(`/dashboard/games/${game.id}/bounce-builder`)
                                else if (game.category === 'space') navigate(`/dashboard/games/${game.id}/space-builder`)
                                else if (game.category === 'connect4') navigate(`/dashboard/games/${game.id}/connect4-builder`)
                                else if (game.category === 'bejeweled') navigate(`/dashboard/games/${game.id}/bejeweled-builder`)
                                else if (game.category === 'tetris') navigate(`/dashboard/games/${game.id}/tetris-builder`)
                                else if (game.category === 'stack') navigate(`/dashboard/games/${game.id}/stack-builder`)
                                else if (game.category === 'bowling') navigate(`/dashboard/games/${game.id}/bowling-builder`)
                                else if (game.category === 'sudoku') navigate(`/dashboard/games/${game.id}/sudoku-builder`)
                                else if (game.category === 'minesweeper') navigate(`/dashboard/games/${game.id}/minesweeper-builder`)
                                else if (game.category === 'wordscramble') navigate(`/dashboard/games/${game.id}/wordscramble-builder`)
                                else if (game.category === 'rps') navigate(`/dashboard/games/${game.id}/rps-builder`)
                                else if (game.category === 'whackamole') navigate(`/dashboard/games/${game.id}/whackamole-builder`)
                                else if (game.category === 'hanoi') navigate(`/dashboard/games/${game.id}/hanoi-builder`)
                                else if (game.category === 'breakout') navigate(`/dashboard/games/${game.id}/breakout-builder`)
                                else if (game.category === 'bubbleshooter') navigate(`/dashboard/games/${game.id}/bubbleshooter-builder`)
                                else if (game.category === 'carlaunch') navigate(`/dashboard/games/${game.id}/carlaunch-builder`)
                                else if (game.category === 'arrowescape') navigate(`/dashboard/games/${game.id}/arrowescape-builder`)
                                else if (game.category === 'frustration' || game.category === 'stressbuster') navigate(`/dashboard/games/${game.id}/frustration-builder`)
                                else if (game.category === 'soundify') navigate(`/dashboard/games/${game.id}/soundify-builder`)
                                else if (game.category === 'tictactoe') navigate(`/dashboard/games/${game.id}/tictactoe-builder`)
                                else if (game.category === 'chess') navigate(`/dashboard/games/${game.id}/chess-builder`)
                                else navigate(`/dashboard/games/${game.id}/builder`)
                              }} title="Builder">
                              <Ico.wrench/> Builder
                            </button>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <button className="gp-icon-btn" onClick={() => navigate(`/dashboard/games/${game.id}/responses`)} title="Responses">
                              <Ico.chart/>
                            </button>
                            <button className="gp-icon-btn" onClick={e => copyLink(game, e)} title="Copy link">
                              <Ico.link/>
                            </button>
                            <button className="gp-icon-btn del" onClick={e => { e.stopPropagation(); handleDelete(game.id) }} title="Delete">
                              <Ico.trash/>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* QR */}
                      <td className="center" style={{minWidth:50}} onClick={e => e.stopPropagation()}>
                        <button className="gp-icon-btn" onClick={() => setQrModalGame(game)} title="Show QR Code">
                          <Ico.qr/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Table footer */}
            <div style={{padding:'12px 16px',borderTop:'1px solid  #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between',background:' #FAFAFA'}}>
              <span style={{fontSize:12,color:' #9CA3AF'}}>
                Showing {sorted.length} of {games.length} game{games.length!==1?'s':''}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:16,marginTop:20}}>
            {[
              { label:'Active Games', value: stats.active, color:' #4F46E5' },
              { label:'On Play Page', value: stats.onPlayPage, color:' #059669' },
              { label:'On Hero', value: stats.onHero, color:' #D97706' },
              { label:'Total Plays', value: stats.plays.toLocaleString(), color:' #0D0D1A' },
              { label:'Branded', value: stats.branded, color:' #15803D' },
              { label:'PromoGames', value: stats.promogames, color:' #B45309' },
              { label:'Live', value: games.filter(g=>g.status==='live').length, color:' #059669' },
            ].map(s => (
              <div key={s.label} style={{background:' #fff',borderRadius:12,border:'1.5px solid  #EAECF0',padding:'16px 20px'}}>
                <div style={{fontSize:11,fontWeight:700,color:' #9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"'Fraunces',serif"}}>{s.value}</div>
              </div>
            ))}
          </div>
          </>
        ) : (
          /* ─── TREE VIEW (Masonry Grid by Client) ─── */
          <div style={{columnCount:4,columnGap:16}}>
            {clients.filter(c => sorted.some(g => g.client_id === c.id) || sorted.some(g => !g.client_id)).map((client, ci) => {
              const clientGames = sorted.filter(g => g.client_id === client.id)
              const templates = clientGames.filter(g => !g.parent_game_id)
              const locations = clientGames.filter(g => g.parent_game_id)
              if (clientGames.length === 0) return null
              return (
                <div key={client.id} style={{breakInside:'avoid',marginBottom:16,background:'#fff',borderRadius:16,border:'1.5px solid #EAECF0',overflow:'hidden',animation:`crmFadeUp .3s ease ${ci*40}ms both`}}>
                  {/* Client header */}
                  <div style={{padding:'14px 16px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:8,background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:700,flexShrink:0}}>
                      {client.company_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#0D0D1A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{client.company_name}</div>
                      <div style={{fontSize:10,color:'#9CA3AF',marginTop:1}}>{templates.length} template{templates.length!==1?'s':''} · {locations.length} location{locations.length!==1?'s':''}</div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{padding:'8px 12px',display:'flex',gap:6,borderBottom:'1px solid #F3F4F6'}}>
                    <button onClick={() => navigate(`/dashboard/games/${templates[0]?.id}/responses`)} style={{flex:1,padding:'6px 0',borderRadius:6,border:'1px solid #E5E7EB',background:'#fff',fontSize:10,fontWeight:600,cursor:'pointer',color:'#374151',fontFamily:'inherit'}}>
                      📊 Responses
                    </button>
                    <button onClick={() => setSelectedClient(selectedClient?.id===client.id?null:client)} style={{flex:1,padding:'6px 0',borderRadius:6,border:`1px solid ${selectedClient?.id===client.id?'#4F46E5':'#E5E7EB'}`,background:selectedClient?.id===client.id?'#EEF2FF':'#fff',fontSize:10,fontWeight:600,cursor:'pointer',color:selectedClient?.id===client.id?'#4F46E5':'#374151',fontFamily:'inherit'}}>
                      {selectedClient?.id===client.id?'▾ Expanded':'▸ Expand'}
                    </button>
                  </div>
                  {/* Game list - hidden until expanded */}
                  {selectedClient?.id === client.id && (
                  <div style={{padding:'6px 10px'}}>
                    {templates.map(g => {
                      const isExpanded = expandedParents[g.id]
                      const childLocs = locations.filter(l => l.parent_game_id === g.id)
                      return (
                        <div key={g.id}>
                          <div onClick={() => childLocs.length > 0 ? setExpandedParents(p => ({...p,[g.id]:!p[g.id]})) : setSelectedGame(g)}
                            style={{padding:'7px 8px',borderRadius:6,marginBottom:3,cursor:'pointer',border:'1px solid #F3F4F6',background:'#FAFAFA',transition:'all .12s'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor='#A5B4FC';e.currentTarget.style.background='#EEF2FF'}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor='#F3F4F6';e.currentTarget.style.background='#FAFAFA'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <div style={{fontWeight:700,fontSize:11,color:'#1F2937',display:'flex',alignItems:'center',gap:4}}>
                                {childLocs.length > 0 && <span style={{fontSize:8,color:'#9CA3AF',transition:'transform .2s',transform:isExpanded?'rotate(90deg)':'rotate(0deg)',display:'inline-block'}}>▶</span>}
                                {g.name}
                              </div>
                              <span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:3,background:g.is_active?'#ECFDF5':'#F3F4F6',color:g.is_active?'#059669':'#9CA3AF'}}>{g.status||'Draft'}</span>
                            </div>
                            <div style={{fontSize:9,color:'#6B7280',marginTop:1}}>{g.category} · {g.question_count||0}q · {g.play_count||0}p</div>
                          </div>
                          {isExpanded && childLocs.map(loc => (
                            <div key={loc.id} onClick={() => setSelectedGame(loc)}
                              style={{marginLeft:12,marginBottom:3,padding:'5px 8px',borderRadius:5,border:'1px solid #F3F4F6',background:'#F9FAFB',cursor:'pointer',transition:'all .12s'}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor='#C7D2FE';e.currentTarget.style.background='#EEF2FF'}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='#F3F4F6';e.currentTarget.style.background='#F9FAFB'}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <div style={{fontSize:10,fontWeight:600,color:'#374151'}}>↳ {loc.location_name||loc.name}</div>
                                <span style={{fontSize:7,fontWeight:700,padding:'1px 4px',borderRadius:3,background:loc.is_active?'#ECFDF5':'#F3F4F6',color:loc.is_active?'#059669':'#9CA3AF'}}>{loc.status||'Draft'}</span>
                              </div>
                              <div style={{fontSize:8,color:'#9CA3AF',marginTop:1}}>{loc.question_count||0}q · {loc.play_count||0}p</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                    {templates.length === 0 && (
                      <div style={{fontSize:10,color:'#9CA3AF',padding:'8px 0',textAlign:'center'}}>No games</div>
                    )}
                  </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <div style={{position:'fixed',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(8,8,18,.48)',backdropFilter:'blur(5px)'}} onClick={()=>setSelectedGame(null)}>
          <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:480,maxHeight:'90vh',overflow:'auto',padding:'28px 24px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',fontFamily:"'DM Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
              <div>
                <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:20,color:'#0D0D1A',marginBottom:4}}>
                  {selectedGame.name}
                  {selectedGame.location_name && <span style={{color:'#6B7280',fontWeight:500,fontSize:14,marginLeft:8}}>- {selectedGame.location_name}</span>}
                </h2>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6,background:catMeta(selectedGame.category).bg,color:catMeta(selectedGame.category).fg}}>
                    {selectedGame.category}
                  </span>
                  <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6,background:selectedGame.is_active?'#ECFDF5':'#F3F4F6',color:selectedGame.is_active?'#059669':'#9CA3AF'}}>
                    {selectedGame.status||'Draft'}
                  </span>
                </div>
              </div>
              <button onClick={()=>setSelectedGame(null)} style={{border:'none',background:'none',cursor:'pointer',color:'#9CA3AF',padding:4}}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Stats */}
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <div style={{flex:1,background:'#F5F3FF',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:700,color:'#4F46E5'}}>{selectedGame.question_count||0}</div>
                <div style={{fontSize:9,fontWeight:700,color:'#7C3AED',textTransform:'uppercase'}}>Questions</div>
              </div>
              <div style={{flex:1,background:'#ECFDF5',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:700,color:'#059669'}}>{selectedGame.play_count||0}</div>
                <div style={{fontSize:9,fontWeight:700,color:'#10B981',textTransform:'uppercase'}}>Plays</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Quick Actions</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>{navigateBuilder(selectedGame);setSelectedGame(null)}} style={{padding:'10px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',fontFamily:'inherit',transition:'all .12s',textAlign:'center'}}>
                  🔧 Open Builder
                </button>
                <button onClick={()=>{navigate(`/dashboard/games/${selectedGame.id}/responses`);setSelectedGame(null)}} style={{padding:'10px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',fontFamily:'inherit',transition:'all .12s',textAlign:'center'}}>
                  📊 Responses
                </button>
                <button onClick={()=>{setQrModalGame(selectedGame);setSelectedGame(null)}} style={{padding:'10px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',fontFamily:'inherit',transition:'all .12s',textAlign:'center'}}>
                  📱 Show QR
                </button>
                <button onClick={()=>{copyLink(selectedGame);setSelectedGame(null)}} style={{padding:'10px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',fontFamily:'inherit',transition:'all .12s',textAlign:'center'}}>
                  🔗 Copy Link
                </button>
              </div>
            </div>

            {/* Settings Toggles */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Settings</div>
              {[
                {label:'Active',field:'is_active',disabled:selectedGame.status!=='live'},
                {label:'Show in Play Page',field:'show_in_play_page'},
                {label:'Show in Hero Page',field:'show_in_hero_page'},
              ].map(t => (
                <div key={t.field} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #F3F4F6'}}>
                  <span style={{fontSize:13,color:'#374151'}}>{t.label}</span>
                  <button disabled={t.disabled} onClick={()=>toggleField(selectedGame,t.field)} style={{width:42,height:24,borderRadius:12,border:'none',cursor:t.disabled?'not-allowed':'pointer',background:selectedGame[t.field]?'#059669':'#D1D5DB',position:'relative',transition:'background .15s',opacity:t.disabled?0.4:1}}>
                    <span style={{position:'absolute',top:3,left:selectedGame[t.field]?21:3,width:18,height:18,borderRadius:9,background:'#fff',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                  </button>
                </div>
              ))}
              {/* Game Type */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #F3F4F6'}}>
                <span style={{fontSize:13,color:'#374151'}}>Game Type</span>
                <button onClick={()=>handleGameTypeToggle(selectedGame)} style={{width:42,height:24,borderRadius:12,border:'none',cursor:'pointer',background:selectedGame.game_type==='branded'?'#059669':'#D1D5DB',position:'relative',transition:'background .15s'}}>
                  <span style={{position:'absolute',top:3,left:selectedGame.game_type==='branded'?21:3,width:18,height:18,borderRadius:9,background:'#fff',transition:'left .15s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{handleDuplicate(selectedGame.id);setSelectedGame(null)}} style={{flex:1,padding:'8px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',fontFamily:'inherit'}}>
                📋 Duplicate
              </button>
              <button onClick={()=>{if(confirm('Delete this game?')){handleDelete(selectedGame.id);setSelectedGame(null)}}} style={{flex:1,padding:'8px',borderRadius:8,border:'1px solid #FECACA',background:'#FEF2F2',cursor:'pointer',fontSize:12,fontWeight:600,color:'#DC2626',fontFamily:'inherit'}}>
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && !showClientForm && (
        <CreateModal
          clients={clients}
          onClose={() => setShowForm(false)}
          onCreated={load}
          onError={msg => showToast(msg,'error')}
          onAddClient={() => setShowClientForm(true)}
        />
      )}
      {showClientForm && (
        <QuickAddClientModal
          onClose={() => setShowClientForm(false)}
          onCreated={client => {
            setShowClientForm(false)
            setClients(prev => [client, ...prev])
          }}
          onError={msg => showToast(msg,'error')}
        />
      )}
      {qrModalGame && (
        <QRCodeModal game={qrModalGame} onClose={() => setQrModalGame(null)} onError={msg => showToast(msg,'error')} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}