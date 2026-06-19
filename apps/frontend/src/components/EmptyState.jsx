export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>{description}</p>}
      {action}
    </div>
  )
}
