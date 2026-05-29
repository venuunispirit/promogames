import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

// ── Step constants ────────────────────────────────────────────────────────────
const STEP_EMAIL    = 'email'
const STEP_PASSWORD = 'password'
const STEP_OTP      = 'otp'
const STEP_REGISTER = 'register'

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  )
}

// ── OTP Input ─────────────────────────────────────────────────────────────────
// Uses a single hidden input that retains focus naturally.
// The key fix: value is kept as a real controlled string (not "") so React
// never forcibly re-renders the input node, which would steal/drop focus.
function OTPInput({ value, onChange }) {
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(false)

  const digits = (value + '    ').slice(0, 4).split('')

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(raw)
    // Keep cursor at end
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (el) el.setSelectionRange(raw.length, raw.length)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value.length === 0) e.preventDefault()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted) onChange(pasted)
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '24px 0', cursor: 'text' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Real input — value mirrors actual digits so React never remounts it */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={4}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 1,
          height: 1,
        }}
      />

      {/* Visual boxes */}
      {digits.map((d, i) => {
        const filled   = d.trim() !== ''
        const isActive = focused && i === value.length
        return (
          <div
            key={i}
            style={{
              width: 56, height: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700,
              background: 'var(--surface)',
              border: `2px solid ${isActive ? 'var(--primary)' : filled ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              transition: 'border-color 0.2s',
              boxShadow: isActive ? '0 0 0 3px rgba(124,111,247,0.2)' : 'none',
              userSelect: 'none',
            }}
          >
            {filled ? d : (
              isActive
                ? <div style={{
                    width: 2, height: 28,
                    background: 'var(--primary)',
                    animation: 'blink 1s step-end infinite',
                  }} />
                : null
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}

// ── Card — defined OUTSIDE LoginPage so it never remounts on state change ─────
// If Card were defined inside LoginPage, every setState call would recreate
// a brand-new Card function reference, causing React to unmount+remount the
// entire DOM subtree and drop focus from whatever input the user was typing in.
function Card({ error, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img
            src="/favicon.png"
            alt="PromoGames Logo"
            style={{
              width: 64, height: 64,
              objectFit: 'contain',
              marginBottom: 10,
              display: 'block',
              marginLeft: 'auto', marginRight: 'auto',
              background: 'transparent',
              border: 'none', boxShadow: 'none',
            }}
          />
          <h1 style={{ fontSize: 26, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            PromoGames
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Play. Earn. Redeem.</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#ef4444',
              fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [step,      setStep]      = useState(STEP_EMAIL)
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [otp,       setOtp]       = useState('')
  const [tempToken, setTempToken] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [resendCD,  setResendCD]  = useState(0)

  const [form, setForm] = useState({
    name: '', age: '', dob: '', whatsapp: '', city: '', pincode: '',
  })

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const clearErr = () => setError('')

  // ── Resend countdown ──────────────────────────────────────────────────────
  const startCountdown = () => {
    setResendCD(30)
    const t = setInterval(() => {
      setResendCD(s => { if (s <= 1) { clearInterval(t); return 0 } return s - 1 })
    }, 1000)
  }

  // ── STEP 1: check email type ──────────────────────────────────────────────
  const handleEmailSubmit = async () => {
    if (!email) return setError('Please enter your email')
    clearErr()
    setLoading(true)
    try {
      const { data } = await api.post('/pauth/check-email', { email })
      if (data.type === 'admin') {
        setStep(STEP_PASSWORD)
      } else {
        await api.post('/pauth/send-otp', { email })
        startCountdown()
        setStep(STEP_OTP)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2a: admin password login ─────────────────────────────────────────
  const handleAdminLogin = async () => {
    if (!password) return setError('Please enter your password')
    clearErr()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2b: verify OTP ───────────────────────────────────────────────────
  const handleOTPSubmit = async () => {
    if (otp.length < 4) return setError('Enter the 4-digit code')
    clearErr()
    setLoading(true)
    try {
      const { data } = await api.post('/pauth/verify-otp', { email, otp })
      if (data.type === 'player') {
        sessionStorage.setItem('playerToken', data.token)
        sessionStorage.setItem('playerUser',  JSON.stringify(data.player))
        navigate('/player/dashboard')
      } else {
        setTempToken(data.tempToken)
        setStep(STEP_REGISTER)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 3: register new player ───────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.name.trim()) return setError('Name is required')
    clearErr()
    setLoading(true)
    try {
      const { data } = await api.post('/pauth/register', {
        tempToken,
        name:     form.name.trim(),
        age:      form.age      || null,
        dob:      form.dob      || null,
        whatsapp: form.whatsapp || null,
        city:     form.city     || null,
        pincode:  form.pincode  || null,
      })
      sessionStorage.setItem('playerToken', data.token)
      sessionStorage.setItem('playerUser',  JSON.stringify(data.player))
      navigate('/player/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCD > 0) return
    clearErr()
    setOtp('')
    try {
      await api.post('/pauth/send-otp', { email })
      startCountdown()
    } catch {
      setError('Failed to resend. Try again.')
    }
  }

  // ─── STEP: EMAIL ────────────────────────────────────────────────────────────
  if (step === STEP_EMAIL) return (
    <Card error={error}>
      <h2 style={{ marginBottom: 4, fontSize: 20 }}>Welcome!</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
        Enter your email to continue.
      </p>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); clearErr() }}
          onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
          placeholder="you@example.com"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleEmailSubmit}
        disabled={loading || !email}
        style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
      >
        {loading ? <><Spinner />&nbsp;Checking...</> : 'Continue →'}
      </button>
    </Card>
  )

  // ─── STEP: ADMIN PASSWORD ───────────────────────────────────────────────────
  if (step === STEP_PASSWORD) return (
    <Card error={error}>
      <button
        onClick={() => { setStep(STEP_EMAIL); setPassword(''); clearErr() }}
        style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(124,111,247,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          flexShrink: 0,
        }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Admin Login</div>
          <div style={{ fontSize: 13, color: 'var(--primary)' }}>{email}</div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); clearErr() }}
          onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
          placeholder="••••••••"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleAdminLogin}
        disabled={loading || !password}
        style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
      >
        {loading ? <><Spinner />&nbsp;Signing in...</> : 'Sign In →'}
      </button>
    </Card>
  )

  // ─── STEP: OTP ──────────────────────────────────────────────────────────────
  if (step === STEP_OTP) return (
    <Card error={error}>
      <button
        onClick={() => { setStep(STEP_EMAIL); setOtp(''); clearErr() }}
        style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: 4, fontSize: 20 }}>Check your email</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 0 }}>
        We sent a 4-digit code to
      </p>
      <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {email}
      </p>

      <OTPInput value={otp} onChange={v => { setOtp(v); clearErr() }} />

      <button
        className="btn btn-primary"
        onClick={handleOTPSubmit}
        disabled={loading || otp.length < 4}
        style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
      >
        {loading ? <><Spinner />&nbsp;Verifying...</> : 'Verify Code →'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
        Didn't receive it?{' '}
        {resendCD > 0
          ? <span>Resend in {resendCD}s</span>
          : (
            <button
              onClick={handleResend}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              Resend code
            </button>
          )
        }
      </div>
    </Card>
  )

  // ─── STEP: REGISTER ─────────────────────────────────────────────────────────
  if (step === STEP_REGISTER) return (
    <Card error={error}>
      <h2 style={{ marginBottom: 4, fontSize: 20 }}>Create your account</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
        Just a few details to set up your PromoGames wallet 🎁
      </p>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input type="email" value={email} disabled style={{ opacity: 0.6 }} />
      </div>

      <div className="form-group">
        <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={e => { setField('name', e.target.value); clearErr() }}
          placeholder="Your full name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={e => setField('age', e.target.value)}
            placeholder="25"
            min={5} max={120}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={e => setField('dob', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">WhatsApp Number</label>
        <input
          type="tel"
          value={form.whatsapp}
          onChange={e => setField('whatsapp', e.target.value)}
          placeholder="+91 9876543210"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            value={form.city}
            onChange={e => setField('city', e.target.value)}
            placeholder="Bangalore"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input
            type="text"
            value={form.pincode}
            onChange={e => setField('pincode', e.target.value)}
            placeholder="560001"
            maxLength={6}
          />
        </div>
      </div>

      {/* Welcome bonus */}
      <div style={{
        background: 'rgba(124,111,247,0.08)',
        border: '1px solid rgba(124,111,247,0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
      }}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <span>
          You'll receive <strong style={{ color: 'var(--primary)' }}>100 PromoPoints</strong> instantly as a welcome bonus!
        </span>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleRegister}
        disabled={loading || !form.name.trim()}
        style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
      >
        {loading ? <><Spinner />&nbsp;Creating account...</> : 'Create Account & Claim 100 PP 🎉'}
      </button>
    </Card>
  )

  return null
}