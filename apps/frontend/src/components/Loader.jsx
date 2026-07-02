export default function Loader({ text = 'Loading...', fullPage = false }) {
  const style = fullPage
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260, flexDirection: 'column', gap: 16 }

  return (
    <div style={style}>
      <div className="loader-spin" />
      <span style={{ color: 'var(--text2)', fontSize: 14 }}>{text}</span>
    </div>
  )
}
