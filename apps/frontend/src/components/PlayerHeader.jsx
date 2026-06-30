import { AvatarDisplay } from './AvatarData'

export default function PlayerHeader({ name, avatarId }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1500,
      background: 'rgba(15, 7, 32, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarDisplay avatarId={avatarId} size={40} style={{ border: '2px solid rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>Hi, {name.split(' ')[0]} 👋</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Welcome Back</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="glass-card" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--glass-bg)', fontSize: 18, borderRadius: '12px' }}>🔔</button>
        <button className="glass-card" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--glass-bg)', fontSize: 18, borderRadius: '12px' }}>🎁</button>
      </div>
    </div>
  )
}
