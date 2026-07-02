import { useNavigate } from 'react-router-dom'

const HEADER_CSS = `
.bh-wrap {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 10px 28px;
  background: #ffffff;
  border-bottom: 1.5px solid #e8eaf0;
  position: sticky;
  top: 0;
  z-index: 50;
  min-height: 56px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  font-family: 'DM Sans', sans-serif;
}
.bh-left {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-self: start;
}
.bh-back {
  padding: 6px 8px;
  font-size: 16px;
  line-height: 1;
  margin-top: 1px;
  border: none;
  background: none;
  cursor: pointer;
  color: #374151;
  border-radius: 6px;
  transition: background .12s;
}
.bh-back:hover { background: #f3f4f6; }
.bh-info { display: flex; flex-direction: column; }
.bh-name {
  font-weight: 700;
  font-size: 14px;
  color: #1e1e2e;
  cursor: pointer;
  line-height: 1.3;
}
.bh-name:hover { color: #6366f1; }
.bh-name-edit {
  width: 180px;
  font-size: 14px;
  font-weight: 700;
  padding: 3px 6px;
  border: 1.5px solid #6366f1;
  border-radius: 6px;
  outline: none;
}
.bh-type {
  font-size: 9.5px;
  font-weight: 600;
  color: #9899b8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-top: 1px;
}
.bh-center {
  justify-self: center;
}
.bh-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  border-bottom: none;
}
.bh-tab {
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color .15s;
  white-space: nowrap;
  font-family: inherit;
}
.bh-tab.active {
  color: #8f38ce;
  border-bottom-color: #8f38ce;
}
.bh-tab:hover:not(.active) { color: #1e1e2e; }
.bh-right {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-self: end;
}
.bh-action {
  padding: 6px 8px;
  font-size: 16px;
  line-height: 1;
  border: none;
  background: none;
  cursor: pointer;
  color: #374151;
  border-radius: 6px;
  transition: background .12s;
  text-decoration: none;
  display: flex;
  align-items: center;
}
.bh-action:hover { background: #f3f4f6; }
`

export default function BuilderHeader({
  gameName,
  gameType,
  tabs,
  activeTab,
  onTabChange,
  onSave,
  saving,
  gameLink,
  onNameChange,
}) {
  const navigate = useNavigate()
  const [editingName, setEditingName] = React.useState(false)
  const [nameInput, setNameInput] = React.useState(gameName || '')

  const handleSaveName = () => {
    if (nameInput.trim() && onNameChange) {
      onNameChange(nameInput.trim())
    }
    setEditingName(false)
  }

  return (
    <>
      <style>{HEADER_CSS}</style>
      <div className="bh-wrap">
        {/* LEFT — Back + Game Name + Type */}
        <div className="bh-left">
          <button className="bh-back" onClick={() => navigate('/dashboard/games')} title="Back to games">←</button>
          <div className="bh-info">
            {editingName ? (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  className="bh-name-edit"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') setEditingName(false)
                  }}
                  onBlur={handleSaveName}
                  autoFocus
                />
                <button className="bh-back" onClick={() => setEditingName(false)} style={{ padding: '2px 6px', fontSize: 12 }}>✕</button>
              </div>
            ) : (
              <div className="bh-name" onClick={() => { setNameInput(gameName || ''); setEditingName(true) }} title="Click to edit">
                {gameName || 'Untitled'} <span style={{ fontSize: 10, color: '#9899b8', fontWeight: 400 }}>✎</span>
              </div>
            )}
            <div className="bh-type">{gameType} Builder</div>
          </div>
        </div>

        {/* CENTER — Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="bh-center">
            <div className="bh-tabs">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`bh-tab${activeTab === t.id ? ' active' : ''}`}
                  onClick={() => onTabChange(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT — Actions */}
        <div className="bh-right">
          {gameLink && (
            <>
              <button
                className="bh-action"
                onClick={() => { navigator.clipboard.writeText(gameLink); }}
                title="Copy game link"
              >🔗</button>
              <a
                href={gameLink}
                target="_blank"
                rel="noreferrer"
                className="bh-action"
                title="Preview game"
              >👁</a>
            </>
          )}
          {onSave && (
            <button
              className="bh-action"
              onClick={onSave}
              disabled={saving}
              style={{ fontSize: 12, padding: '6px 12px', fontWeight: 600, color: saving ? '#ccc' : '#6366f1' }}
            >
              {saving ? '⏳ Saving…' : '💾 Save'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
