export default function PlayerRewardsPage() {
  return (
    <div className="fade-in" style={{ padding: '0 20px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Redeem Rewards</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Turn your PC into real-world value</p>

      <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(168, 85, 247, 0.03)' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }} className="animate-float">🎁</div>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Rewards Store</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 32px' }}>
          We're currently stocking up on exciting vouchers and gifts. Stay tuned!
        </p>
        <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '100px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--neon-purple)', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          Coming Soon
        </div>
      </div>
    </div>
  )
}
