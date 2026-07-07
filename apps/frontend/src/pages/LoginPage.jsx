import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { AvatarGrid, DEFAULT_AVATARS } from '../components/AvatarData'

const STEP_EMAIL     = 'email'
const STEP_PASSWORD  = 'password'
const STEP_BD_PASS   = 'bd_password'
const STEP_IT_PASS   = 'it_password'
const STEP_OTP       = 'otp'
const STEP_REGISTER  = 'register'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --p1:#9B59B6;--p2:#7D3C98;--p3:#C39BD3;
  --text:#1a0533;--text2:rgba(26,5,51,0.58);--text3:rgba(26,5,51,0.32);
  --success:#27ae60;--danger:#e53e6d;--danger-l:rgba(229,62,109,0.10);
  --font:'Nunito',sans-serif;
}
html,body{height:100%;font-family:var(--font);-webkit-font-smoothing:antialiased}

@keyframes blink      {0%,100%{opacity:1}50%{opacity:0}}
@keyframes fadeUp     {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardIn     {from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
@keyframes dotBounce  {0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
@keyframes shimBar    {from{transform:translateX(-100%)}to{transform:translateX(250%)}}
@keyframes ring1spin  {to{transform:rotate(360deg)}}
@keyframes ring2spin  {to{transform:rotate(-360deg)}}
@keyframes glowPulse  {0%,100%{opacity:0.18;transform:scale(1)}50%{opacity:0.35;transform:scale(1.10)}}
@keyframes shake      {0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes btnShine   {from{left:-100%}to{left:160%}}

/* ── Page ── */
.pg-page{
  min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  padding:24px 16px;
  position:relative;overflow:hidden;
  /* BG IMAGE — swap src in img tag or set background-image here */
  background: linear-gradient(135deg,#2d0050 0%,#6a0dad 40%,#9b59b6 70%,#c39bd3 100%);
}
.pg-bg-img{
  position:fixed;inset:0;width:100%;height:100%;
  object-fit:cover;z-index:0;
}
.pg-bg-overlay{
  position:fixed;inset:0;z-index:1;
  background:rgba(20,0,40,0.38);
  backdrop-filter:blur(0px);
}

/* ── Single glass card ── */
.pg-card{
  position:relative;z-index:2;
  width:100%;max-width:320px;
  background:rgba(255,255,255,0.16);
  border:1.5px solid rgba(255, 255, 255, 0.07);
  border-radius:28px;
  box-shadow:
    0 8px 48px rgba(60,0,100,0.28),
    0 2px 12px rgba(60,0,100,0.14),
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 1px 0 0 rgba(255,255,255,0.30);
  backdrop-filter:blur(22px) saturate(0.8);
  -webkit-backdrop-filter:blur(52px) saturate(0.08);
  overflow:hidden;
  animation:cardIn 0.45s cubic-bezier(0.34,1.4,0.64,1);
}
/* top sheen */
.pg-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1.5px;
  background:linear-gradient(90deg,transparent,rgba(255, 255, 255, 0.44) 40%,rgba(255,255,255,0.55) 60%,transparent);
  pointer-events:none;z-index:3;
}

/* ── Progress bar ── */
.pg-prog{height:3px;background:rgba(255,255,255,0.12);position:relative;overflow:hidden}
.pg-prog-fill{
  position:absolute;left:0;top:0;height:100%;
  background:linear-gradient(90deg,var(--p1),#d7b3f0);
  border-radius:0 2px 2px 0;
  transition:width 0.5s cubic-bezier(0.4,0,0.2,1);
}
.pg-prog-shim{
  position:absolute;inset:0;display:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent);
  transform:translateX(-100%);
}
.is-loading-bar .pg-prog-shim{display:block;animation:shimBar 1.3s linear infinite}

/* ── Card inner ── */
.pg-inner{padding:32px 30px 28px}

/* ── Logo section ── */
.pg-logo-area{
  display:flex;flex-direction:column;align-items:center;
  margin-bottom:44px;
}
.pg-logo-wrap{position:relative;width:72px;height:72px;margin-bottom:12px}
.pg-logo-img{
  width:272px;height:72px;border-radius:18px;
  margin-left:-100px;
  object-fit:contain;display:block;position:relative;z-index:2;
  background:rgba(255,255,255,0.18);
  // backdrop-filter:blur(150px);-webkit-backdrop-filter:blur(150px);

}
.pg-logo-r{position:absolute;border-radius:22px;pointer-events:none}
.pg-logo-r1{
  inset:-8px;
  border:2px solid transparent;
  border-top-color:rgba(195,155,211,0.9);
  border-right-color:rgba(255,255,255,0.6);
  opacity:0;transition:opacity 0.4s;
  animation:ring1spin 1.4s linear infinite;
}
.pg-logo-r2{
  inset:-14px;border-radius:26px;
  border:1.5px dashed rgba(255,255,255,0.28);
  opacity:0;transition:opacity 0.4s;
  animation:ring2spin 2.8s linear infinite;
}
.pg-logo-glow{
  inset:-6px;border-radius:24px;
  background:radial-gradient(ellipse,rgba(195,155,211,0.35) 0%,transparent 70%);
  opacity:0;transition:opacity 0.4s;
  animation:glowPulse 1.8s ease-in-out infinite;
}
.is-loading .pg-logo-r1,
.is-loading .pg-logo-r2,
.is-loading .pg-logo-glow{opacity:1}

.pg-brand{
  font-size:24px;font-weight:900;letter-spacing:-0.02em;
  color:#fff;margin-bottom:4px;text-shadow:0 1px 8px rgba(60,0,100,0.25);
}
.pg-tagline{
  display:flex;gap:8px;align-items:center;
  font-size:10.5px;font-weight:800;letter-spacing:0.14em;
  color:rgba(255,255,255,0.60);text-transform:uppercase;
}
.pg-tagline-dot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.35)}

/* ── Divider ── */
.pg-div{
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
  margin-bottom:22px;
}

/* ── Step title ── */
.pg-title{
  font-size:19px;font-weight:900;color:#fff;
  margin-bottom:4px;letter-spacing:-0.02em;
}
.pg-sub{font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.60);margin-bottom:20px;line-height:1.5}

/* ── Label ── */
.pg-lbl{
  display:block;font-size:11px;font-weight:800;
  color:rgba(255,255,255,0.55);letter-spacing:0.09em;
  text-transform:uppercase;margin-bottom:7px;
}

/* ── Input ── */
.pg-inp{
  width:100%;padding:13px 15px;
  font-family:var(--font);font-size:15px;font-weight:600;
  color:#fff;caret-color:#fff;
  background:rgba(255,255,255,0.12);
  border:1.5px solid rgba(255,255,255,0.28);
  border-radius:12px;outline:none;
  transition:all 0.22s ease;
  -webkit-appearance:none;
}
.pg-inp::placeholder{color:rgba(255,255,255,0.32);font-weight:500}
.pg-inp:focus{
  border-color:rgba(255,255,255,0.65);
  background:rgba(255,255,255,0.20);
  box-shadow:0 0 0 4px rgba(155,89,182,0.22);
}
.pg-inp:disabled{opacity:0.40;cursor:not-allowed}
.pg-fg{margin-bottom:24px}
.pg-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* ── Primary button ── */
.pg-btn{
  width:100%;padding:14px 20px;
  font-family:var(--font);font-size:15px;font-weight:800;
  color:#fff;border:none;border-radius:12px;cursor:pointer;
  background:linear-gradient(135deg,#9B59B6 0%,#7D3C98 100%);
  box-shadow:0 4px 22px rgba(100,30,160,0.45);
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all 0.2s ease;position:relative;overflow:hidden;
  letter-spacing:0.01em;border:1px solid rgba(255,255,255,0.18);
}
.pg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(100,30,160,0.60)}
.pg-btn:active:not(:disabled){transform:scale(0.975)}
.pg-btn:disabled{opacity:0.38;cursor:not-allowed;transform:none;box-shadow:none}
.pg-btn::after{
  content:'';position:absolute;top:0;width:50%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.20),transparent);
  left:-100%;transition:left 0.55s ease;
}
.pg-btn:hover:not(:disabled)::after{left:160%}

/* ── Back ── */
.pg-back{
  background:none;border:none;color:rgba(255,255,255,0.55);font-size:13px;
  font-weight:700;font-family:var(--font);cursor:pointer;padding:0;
  margin-bottom:18px;display:inline-flex;align-items:center;gap:5px;
  transition:color 0.15s;
}
.pg-back:hover{color:rgba(255,255,255,0.90)}

/* ── Link btn ── */
.pg-lnk{
  background:none;border:none;color:rgba(210,170,255,0.90);font-size:13px;
  font-weight:700;font-family:var(--font);cursor:pointer;padding:0;
}
.pg-lnk:hover{color:#fff}

/* ── Error ── */
.pg-err{
  background:rgba(229,62,109,0.18);border:1px solid rgba(229,62,109,0.35);
  border-radius:10px;padding:11px 14px;margin-bottom:16px;
  color:#ffaec5;font-size:13.5px;font-weight:700;
  display:flex;align-items:center;gap:8px;
  animation:shake 0.4s ease;
}

/* ── OTP ── */
.otp-row{display:flex;gap:10px;justify-content:center;margin:22px 0;cursor:text}
.otp-box{
  width:60px;height:66px;
  display:flex;align-items:center;justify-content:center;
  font-size:28px;font-weight:900;
  background:rgba(255,255,255,0.12);
  border:1.5px solid rgba(255,255,255,0.28);
  border-radius:12px;color:#fff;
  transition:all 0.2s ease;user-select:none;
}
.otp-box.active{
  border-color:rgba(255,255,255,0.70);
  background:rgba(255,255,255,0.22);
  box-shadow:0 0 0 4px rgba(155,89,182,0.25);
}
.otp-box.filled{
  border-color:rgba(39,174,96,0.70);
  background:rgba(39,174,96,0.16);
  color:#a8ffcc;transform:scale(1.05);
}

/* ── Dot loader ── */
.dots{display:flex;gap:4px;align-items:center}
.dots span{
  width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.80);
  animation:dotBounce 1s ease infinite;
}
.dots span:nth-child(2){animation-delay:0.14s}
.dots span:nth-child(3){animation-delay:0.28s}

/* ── Step dots ── */
.steps{display:flex;gap:5px;justify-content:center;margin-bottom:22px}
.step-dot{height:4px;border-radius:2px;background:rgba(255,255,255,0.18);transition:all 0.35s ease}
.step-dot.active{background:rgba(255,255,255,0.85);width:22px}
.step-dot.done{background:rgba(39,174,96,0.70);width:12px}
.step-dot.pending{width:8px}

/* ── Email badge ── */
.email-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);
  border-radius:100px;padding:4px 12px 4px 8px;
  font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);
  margin:4px 0 2px;
}

/* ── Admin badge ── */
.admin-badge{
  display:flex;align-items:center;gap:12px;
  padding:13px 14px;
  background:rgba(255,255,255,0.09);
  border:1px solid rgba(255,255,255,0.18);
  border-radius:12px;margin-bottom:18px;
}

/* ── Bonus ── */
.bonus{
  background:rgba(39,174,96,0.14);border:1px solid rgba(39,174,96,0.28);
  border-radius:12px;padding:13px 14px;margin-bottom:16px;
  display:flex;align-items:center;gap:10px;
  font-size:14px;font-weight:600;color:rgba(255,255,255,0.85);
}

/* ── Timer ── */
.timer{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.20);
  border-radius:100px;padding:3px 10px;
  font-size:12px;font-weight:800;color:rgba(255,255,255,0.65);
  font-variant-numeric:tabular-nums;
}
.resend{
  text-align:center;margin-top:16px;
  font-size:13px;font-weight:600;color:rgba(255,255,255,0.50);
  display:flex;align-items:center;justify-content:center;gap:6px;
}

/* ── Footer ── */
.pg-footer{
  text-align:center;margin-top:60px;padding-bottom:4px;
  font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.35);
  letter-spacing:0.03em;
}
.pg-footer span{color:rgba(210,170,255,0.70);cursor:pointer}
.pg-footer span:hover{color:#fff}

/* ── Anim ── */
.fadeup{animation:fadeUp 0.38s cubic-bezier(0.34,1.4,0.64,1)}
`

function useStyles() {
  useEffect(() => {
    const id = 'pg-v4-css'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id; el.textContent = CSS
    document.head.appendChild(el)
  }, [])
}

function Dots() { return <div className="dots"><span/><span/><span/></div> }

function StepDots({ step }) {
  const order = [STEP_EMAIL, STEP_OTP, STEP_REGISTER]
  const i = order.indexOf(step)
  return (
    <div className="steps">
      {order.map((s,j) => (
        <div key={s} className={`step-dot ${j===i?'active':j<i?'done':'pending'}`}/>
      ))}
    </div>
  )
}

function OTPInput({ value, onChange }) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)
  const digits = (value+'    ').slice(0,4).split('')
  const handleChange = e => {
    const v = e.target.value.replace(/\D/g,'').slice(0,4)
    onChange(v)
    requestAnimationFrame(() => { if(ref.current) ref.current.setSelectionRange(v.length,v.length) })
  }
  return (
    <div className="otp-row" onClick={() => ref.current?.focus()}>
      <input ref={ref} type="text" inputMode="numeric" value={value}
        onChange={handleChange}
        onKeyDown={e => e.key==='Backspace' && value.length===0 && e.preventDefault()}
        onPaste={e => { e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,4); if(p) onChange(p) }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        maxLength={4}
        style={{position:'absolute',opacity:0,pointerEvents:'none',width:1,height:1}}/>
      {digits.map((d,i) => {
        const filled = d.trim()!==''
        const active = focused && i===value.length
        return (
          <div key={i} className={`otp-box${active?' active':''}${filled?' filled':''}`}>
            {filled ? d : active
              ? <div style={{width:2,height:26,background:'rgba(255,255,255,0.85)',borderRadius:1,animation:'blink 1s step-end infinite'}}/>
              : null}
          </div>
        )
      })}
    </div>
  )
}

// ── Card — single glass shell, defined OUTSIDE to prevent remount ─────────────
function Card({ error, loading, step, children }) {
  useStyles()
  const pct = {[STEP_EMAIL]:15,[STEP_PASSWORD]:50,[STEP_OTP]:58,[STEP_REGISTER]:88}[step]||0
  return (
    <div className="pg-page">
      {/* ↓ REPLACE src with your actual bg image path, e.g. src="/images/bg.jpg" */}
      <img className="pg-bg-img" src="" alt="" onError={e=>e.target.style.display='none'}/>
      <div className="pg-bg-overlay"/>

      <div className="pg-card">
        {/* progress bar */}
        <div className={`pg-prog${loading?' is-loading-bar':''}`}>
          <div className="pg-prog-fill" style={{width:`${pct}%`}}/>
          <div className="pg-prog-shim"/>
        </div>

        <div className="pg-inner">
          {/* ── Logo + brand always visible at top ── */}
          <div className="pg-logo-area">
            <div className={`pg-logo-wrap${loading?' is-loading':''}`}>
              <div className="pg-logo-r pg-logo-glow"/>
              <div className="pg-logo-r pg-logo-r2"/>
              <div className="pg-logo-r pg-logo-r1"/>
              <img src="/favicon3.png" alt="PromoGames" className="pg-logo-img"/>
            </div>
            {/* <div className="pg-brand">PromoGames</div> */}
            <div className="pg-tagline">
              <span>Play</span>
              <div className="pg-tagline-dot"/>
              <span>Earn</span>
              <div className="pg-tagline-dot"/>
              <span>Redeem</span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="pg-div"/>

          {/* ── Error ── */}
          {error && <div className="pg-err"><span>⚠</span><span>{error}</span></div>}

          {/* ── Step content ── */}
          {children}
<div className="pg-div"/>
          {/* ── Footer ── */}
          <div className="pg-footer">
            Secured by PromoGames &nbsp;·&nbsp; <span>Help</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    // Auto-redirect removed to prevent loop on dashboard failure
  }, [navigate])

  const [step,      setStep]      = useState(STEP_EMAIL)
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [otp,       setOtp]       = useState('')
  const [tempToken, setTempToken] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [resendCD,  setResendCD]  = useState(0)
  const [rememberMe, setRememberMe] = useState(true)
  const [form, setForm] = useState({name:'',dob:'',whatsapp:'',city:'',pincode:'',avatar_id:DEFAULT_AVATARS[0].id})

  const setField = (k,v) => setForm(f=>({...f,[k]:v}))
  const storeAuth = (token, player) => {
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('playerToken', token)
    storage.setItem('playerUser', JSON.stringify(player))
  }
  const clearErr = () => setError('')

  const startCountdown = () => {
    setResendCD(30)
    const t = setInterval(() => setResendCD(s => { if(s<=1){clearInterval(t);return 0} return s-1 }),1000)
  }

  const handleEmailSubmit = async () => {
    if (!email) return setError('Please enter your email')
    clearErr(); setLoading(true)
    try {
      const { data } = await api.post('/pauth/check-email', { email })
      if (data.type === 'admin') {
        setStep(STEP_PASSWORD)
      } else if (data.type === 'bd') {
        setStep(STEP_BD_PASS)
      } else if (data.type === 'internal_team') {
        setStep(STEP_IT_PASS)
      } else {
        await api.post('/pauth/send-otp', { email })
        setStep(STEP_OTP)
        startCountdown()
      }
    } catch(err) { setError(err.response?.data?.message || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleBDLogin = async () => {
    if (!password) return setError('Please enter your password')
    clearErr(); setLoading(true)
    try {
      const { data } = await api.post('/bd/login', { email, password })
      localStorage.setItem('bdToken', data.token)
      localStorage.setItem('bdUser', JSON.stringify(data.bd))
      navigate('/crm/dashboard')
    } catch(err) { setError(err.response?.data?.message || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleITLogin = async () => {
    if (!password) return setError('Please enter your password')
    clearErr(); setLoading(true)
    try {
      const { data } = await api.post('/internal-team/login', { email, password })
      localStorage.setItem('itToken', data.token)
      localStorage.setItem('itUser', JSON.stringify(data.member))
      navigate('/internal-team/dashboard')
    } catch(err) { setError(err.response?.data?.message || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleAdminLogin = async () => {
    if (!password) return setError('Please enter your password')
    clearErr(); setLoading(true)
    try { await login(email, password); navigate('/dashboard') }
    catch(err) { setError(err.response?.data?.message || 'Incorrect password.') }
    finally { setLoading(false) }
  }

  const handleOTPSubmit = async () => {
    if (otp.length < 4) return setError('Enter the 4-digit code')
    clearErr(); setLoading(true)
    try {
      const { data } = await api.post('/pauth/verify-otp', { email, otp })
      if (data.type === 'player') {
      storeAuth(data.token, { ...data.player, avatar_id: form.avatar_id })
        navigate('/')
      } else { setTempToken(data.tempToken); setStep(STEP_REGISTER) }
    } catch(err) { setError(err.response?.data?.message || 'Invalid or expired code.'); setOtp('') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!form.name.trim()) return setError('Name is required')
    clearErr(); setLoading(true)
    try {
      const { data } = await api.post('/pauth/register', {
        tempToken, name: form.name.trim(),
        dob: form.dob||null,
        whatsapp: form.whatsapp||null, city: form.city||null, pincode: form.pincode||null,
      })
      storeAuth(data.token, { ...data.player, avatar_id: form.avatar_id })
      navigate('/')
    } catch(err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendCD > 0) return
    clearErr(); setOtp('')
    try { await api.post('/pauth/send-otp', { email }); startCountdown() }
    catch { setError('Failed to resend.') }
  }

  // EMAIL
  if (step === STEP_EMAIL) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <div className="pg-title">Welcome back 👋</div>
        <div className="pg-sub">Enter your email to get started.</div>
        <div className="pg-fg">
          <label className="pg-lbl">Email Address</label>
          <input className="pg-inp" type="email" value={email} autoFocus
            onChange={e=>{setEmail(e.target.value);clearErr()}}
            onKeyDown={e=>e.key==='Enter'&&!loading&&email&&handleEmailSubmit()}
            placeholder="you@example.com"/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <div onClick={()=>setRememberMe(!rememberMe)} style={{width:20,height:20,flexShrink:0,border:`2px solid ${rememberMe?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)'}`,borderRadius:5,background:rememberMe?'rgba(255,255,255,0.18)':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
            {rememberMe && <span style={{color:'#fff',fontSize:11,fontWeight:700}}>✓</span>}
          </div>
          <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.55)',cursor:'pointer',userSelect:'none'}} onClick={()=>setRememberMe(!rememberMe)}>Remember me</span>
        </div>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleEmailSubmit} disabled={loading||!email}>
          {loading ? <><Dots/>&nbsp;Checking…</> : 'Continue →'}
        </button>
      </div>
    </Card>
  )

  // BD PASSWORD
  if (step === STEP_BD_PASS) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <button className="pg-back" onClick={()=>{setStep(STEP_EMAIL);setPassword('');clearErr()}}>← Back</button>
        <div className="admin-badge">
          <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🤝</div>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:'#fff'}}>Business Developer</div>
            <div style={{fontSize:12,color:'rgba(210,170,255,0.85)',fontWeight:700}}>{email}</div>
          </div>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">Password (Phone Number)</label>
          <input className="pg-inp" type="password" value={password} autoFocus
            onChange={e=>{setPassword(e.target.value);clearErr()}}
            onKeyDown={e=>e.key==='Enter'&&!loading&&password&&handleBDLogin()}
            placeholder="Enter your phone number"/>
        </div>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleBDLogin} disabled={loading||!password}>
          {loading ? <><Dots/>&nbsp;Signing in…</> : 'Sign In →'}
        </button>
      </div>
    </Card>
  )

  // INTERNAL TEAM PASSWORD
  if (step === STEP_IT_PASS) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <button className="pg-back" onClick={()=>{setStep(STEP_EMAIL);setPassword('');clearErr()}}>← Back</button>
        <div className="admin-badge">
          <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🛠️</div>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:'#fff'}}>Internal Team</div>
            <div style={{fontSize:12,color:'rgba(210,170,255,0.85)',fontWeight:700}}>{email}</div>
          </div>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">Password (Phone Number)</label>
          <input className="pg-inp" type="password" value={password} autoFocus
            onChange={e=>{setPassword(e.target.value);clearErr()}}
            onKeyDown={e=>e.key==='Enter'&&!loading&&password&&handleITLogin()}
            placeholder="Enter your phone number"/>
        </div>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleITLogin} disabled={loading||!password}>
          {loading ? <><Dots/>&nbsp;Signing in…</> : 'Sign In →'}
        </button>
      </div>
    </Card>
  )

  // ADMIN PASSWORD
  if (step === STEP_PASSWORD) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <button className="pg-back" onClick={()=>{setStep(STEP_EMAIL);setPassword('');clearErr()}}>← Back</button>
        <div className="admin-badge">
          <div style={{width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🛡️</div>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:'#fff'}}>Admin Login</div>
            <div style={{fontSize:12,color:'rgba(210,170,255,0.85)',fontWeight:700}}>{email}</div>
          </div>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">Password</label>
          <input className="pg-inp" type="password" value={password} autoFocus
            onChange={e=>{setPassword(e.target.value);clearErr()}}
            onKeyDown={e=>e.key==='Enter'&&!loading&&password&&handleAdminLogin()}
            placeholder="••••••••"/>
        </div>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleAdminLogin} disabled={loading||!password}>
          {loading ? <><Dots/>&nbsp;Signing in…</> : 'Sign In →'}
        </button>
      </div>
    </Card>
  )

  // OTP
  if (step === STEP_OTP) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <button className="pg-back" onClick={()=>{setStep(STEP_EMAIL);setOtp('');clearErr()}}>← Back</button>
        <StepDots step={step}/>
        <div className="pg-title">Check your email ✉️</div>
        <p style={{color:'rgba(255,255,255,0.55)',fontSize:14,fontWeight:500,marginBottom:6}}>
          We sent a 4-digit code to
        </p>
        <span className="email-badge">✉ {email}</span>
        <OTPInput value={otp} onChange={v=>{setOtp(v);clearErr()}}/>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleOTPSubmit} disabled={loading||otp.length<4}>
          {loading ? <><Dots/>&nbsp;Verifying…</> : 'Verify Code →'}
        </button>
        <div className="resend">
          Didn't receive it?
          {resendCD>0
            ? <span className="timer">⏱ {resendCD}s</span>
            : <button className="pg-lnk" onClick={handleResend}>Resend code</button>}
        </div>
      </div>
    </Card>
  )

  // REGISTER
  if (step === STEP_REGISTER) return (
    <Card error={error} loading={loading} step={step}>
      <div className="fadeup">
        <StepDots step={step}/>
        <div className="pg-title">Almost there! 🎉</div>
        <div className="pg-sub">A few details to set up your wallet.</div>
        <div className="pg-fg">
          <label className="pg-lbl">Email Address</label>
          <input className="pg-inp" type="email" value={email} disabled/>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">Full Name <span style={{color:'#ffaec5'}}>*</span></label>
          <input className="pg-inp" type="text" value={form.name} autoFocus
            onChange={e=>{setField('name',e.target.value);clearErr()}} placeholder="Your full name"/>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">Date of Birth</label>
          <input className="pg-inp" type="date" value={form.dob} onChange={e=>setField('dob',e.target.value)}/>
        </div>
        <div className="pg-fg">
          <label className="pg-lbl">WhatsApp Number</label>
          <input className="pg-inp" type="tel" value={form.whatsapp}
            onChange={e=>setField('whatsapp',e.target.value)} placeholder="+91 9876543210"/>
        </div>
        <div className="pg-row pg-fg">
          <div>
            <label className="pg-lbl">City</label>
            <input className="pg-inp" type="text" value={form.city}
              onChange={e=>setField('city',e.target.value)} placeholder="Bangalore"/>
          </div>
          <div>
            <label className="pg-lbl">Pincode</label>
            <input className="pg-inp" type="text" value={form.pincode}
              onChange={e=>setField('pincode',e.target.value)} placeholder="560001" maxLength={6}/>
          </div>
        </div>
        <div className="bonus">
          <span style={{fontSize:22}}>🎁</span>
          <span>You'll get <strong style={{color:'#a8ffcc'}}>100 Promo Coins</strong> as a welcome bonus!</span>
        </div>
        <div style={{marginBottom:16}}>
          <label className="pg-lbl" style={{marginBottom:8,display:'block'}}>Choose Your Avatar</label>
          <AvatarGrid selected={form.avatar_id} onSelect={id => setField('avatar_id', id)} size={68} />
        </div>
        <button className={`pg-btn${loading?' busy':''}`} onClick={handleRegister} disabled={loading||!form.name.trim()}>
          {loading ? <><Dots/>&nbsp;Creating account…</> : 'Create Account & Claim 100 PC 🎉'}
        </button>
      </div>
    </Card>
  )

  return null
}