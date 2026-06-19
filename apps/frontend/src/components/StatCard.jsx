export default function StatCard({ icon, label, value, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 50, height: 50,
        background: `${color}18`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}
