import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = '/api'

/* ─── helpers ───────────────────────────────────────────── */
function buildGrid(words, rows, cols) {
  // grid[r][c] = { letter, wordIds: [] }
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ letter: null, wordIds: [] }))
  )
  for (const w of words) {
    if (!w.word_text) continue
    for (let i = 0; i < w.word_text.length; i++) {
      const r = w.direction === 'down'   ? w.start_row + i : w.start_row
      const c = w.direction === 'across' ? w.start_col + i : w.start_col
      if (r < rows && c < cols) {
        grid[r][c].letter = w.word_text[i]
        grid[r][c].wordIds.push(w.id)
      }
    }
  }
  return grid
}

function buildNumberMap(words) {
  // returns { 'r,c': number }
  const map = {}
  let num = 1
  const sorted = [...words].sort((a, b) =>
    a.start_row !== b.start_row ? a.start_row - b.start_row : a.start_col - b.start_col
  )
  for (const w of sorted) {
    const key = `${w.start_row},${w.start_col}`
    if (!map[key]) map[key] = num++
  }
  return map
}

function playSound(url) {
  if (!url) return
  try { new Audio(url).play() } catch {}
}

/* ─── timer ─────────────────────────────────────────────── */
function useTimer(active, limitSeconds) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  const remaining = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : null
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return { elapsed, remaining, display: remaining !== null ? fmt(remaining) : fmt(elapsed) }
}

/* ─── main component ────────────────────────────────────── */
export default function CrosswordPlayerPage({ gameData, sessionToken, sessionId, onComplete }) {
  const { settings, words, soundMap } = gameData
  const rows = settings?.grid_rows || 10
  const cols = settings?.grid_cols || 10
  const cellSize = settings?.cell_size || 40
  const primaryColor = settings?.primary_color || '#7c6ff7'

  const grid = buildGrid(words, rows, cols)
  const numberMap = buildNumberMap(words)

  // State
  const [inputs, setInputs] = useState(() => {
    const m = {}
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c].letter) m[`${r},${c}`] = ''
    return m
  })
  const [correct, setCorrect] = useState({})   // wordId -> true
  const [wrong, setWrong]     = useState({})   // wordId -> true
  const [selected, setSelected] = useState(null) // { wordId }
  const [gameOver, setGameOver] = useState(false)
  const [submitted, setSubmitted] = useState({}) // wordId -> true (already sent to server)
  const cellRefs = useRef({})

  const { display: timerDisplay, remaining } = useTimer(!gameOver, settings?.time_limit_seconds || 0)

  // Time up
  useEffect(() => {
    if (remaining === 0 && !gameOver) setGameOver(true)
  }, [remaining])

  // All correct -> game over
  useEffect(() => {
    if (words.length > 0 && words.every(w => correct[w.id])) setGameOver(true)
  }, [correct])

  const selectedWord = words.find(w => w.id === selected?.wordId) || null

  /* get highlighted cells for selected word */
  const highlightedCells = new Set()
  if (selectedWord) {
    for (let i = 0; i < selectedWord.word_text.length; i++) {
      const r = selectedWord.direction === 'down'   ? selectedWord.start_row + i : selectedWord.start_row
      const c = selectedWord.direction === 'across' ? selectedWord.start_col + i : selectedWord.start_col
      highlightedCells.add(`${r},${c}`)
    }
  }

  /* focus first empty cell of a word */
  const focusWord = (w) => {
    setSelected({ wordId: w.id })
    for (let i = 0; i < w.word_text.length; i++) {
      const r = w.direction === 'down'   ? w.start_row + i : w.start_row
      const c = w.direction === 'across' ? w.start_col + i : w.start_col
      if (!inputs[`${r},${c}`]) {
        cellRefs.current[`${r},${c}`]?.focus()
        return
      }
    }
    cellRefs.current[`${w.start_row},${w.start_col}`]?.focus()
  }

  /* check a single word */
  const checkWord = useCallback(async (w, currentInputs) => {
    if (correct[w.id] || submitted[w.id]) return
    let attempt = ''
    for (let i = 0; i < w.word_text.length; i++) {
      const r = w.direction === 'down'   ? w.start_row + i : w.start_row
      const c = w.direction === 'across' ? w.start_col + i : w.start_col
      attempt += (currentInputs[`${r},${c}`] || '').toUpperCase()
    }
    if (attempt.length < w.word_text.length) return // incomplete

    const isCorrect = attempt === w.word_text

    // mark
    if (isCorrect) {
      setCorrect(p => ({ ...p, [w.id]: true }))
      setWrong(p => { const n = { ...p }; delete n[w.id]; return n })
      playSound(soundMap[w.sound_correct_id] || soundMap[settings?.sound_correct_id])
    } else {
      setWrong(p => ({ ...p, [w.id]: true }))
      playSound(soundMap[w.sound_wrong_id] || soundMap[settings?.sound_wrong_id])
    }

    // send to server if session exists
    if (sessionToken && !submitted[w.id]) {
      setSubmitted(p => ({ ...p, [w.id]: true }))
      try {
        await fetch(`${API_BASE}/play/session/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_token: sessionToken,
            crossword_word_id: w.id,
            answer_text: attempt,
            is_correct: isCorrect
          })
        })
      } catch {}
    }
  }, [correct, submitted, soundMap, settings, sessionToken])

  /* handle cell input */
  const handleInput = (r, c, val) => {
    const ch = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(-1)
    const key = `${r},${c}`
    const newInputs = { ...inputs, [key]: ch }
    setInputs(newInputs)

    // auto-advance in selected word direction
    if (ch && selectedWord) {
      let nr = r, nc = c
      if (selectedWord.direction === 'across') nc++
      else nr++
      if (nr < rows && nc < cols && grid[nr][nc].letter) {
        cellRefs.current[`${nr},${nc}`]?.focus()
      }
    }

    // check word when last cell of selected word is filled
    if (selectedWord) {
      const lastIdx = selectedWord.word_text.length - 1
      const lr = selectedWord.direction === 'down'   ? selectedWord.start_row + lastIdx : selectedWord.start_row
      const lc = selectedWord.direction === 'across' ? selectedWord.start_col + lastIdx : selectedWord.start_col
      if (r === lr && c === lc && ch) {
        checkWord(selectedWord, newInputs)
      }
    }
  }

  const handleKeyDown = (r, c, e) => {
    if (e.key === 'Backspace' && !inputs[`${r},${c}`] && selectedWord) {
      let pr = r, pc = c
      if (selectedWord.direction === 'across') pc--
      else pr--
      if (pr >= 0 && pc >= 0 && grid[pr]?.[pc]?.letter) {
        cellRefs.current[`${pr},${pc}`]?.focus()
        setInputs(p => ({ ...p, [`${pr},${pc}`]: '' }))
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const idx = words.findIndex(w => w.id === selected?.wordId)
      const next = words[(idx + 1) % words.length]
      if (next) focusWord(next)
    }
  }

  /* complete game */
  const completeGame = async () => {
    if (!sessionToken) { onComplete?.(); return }
    try {
      const res = await fetch(`${API_BASE}/play/session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken })
      })
      const data = await res.json()
      onComplete?.(data)
    } catch {
      onComplete?.()
    }
  }

  const correctCount = Object.keys(correct).length
  const totalWords   = words.length

  /* ── render ── */
  return (
    <div style={{ fontFamily: settings?.font_family || 'DM Sans, sans-serif', minHeight: '100vh',
      background: settings?.bg_image_url ? `url(${settings.bg_image_url}) center/cover no-repeat` : (settings?.bg_color || '#f8f8ff'),
      padding: '20px 16px' }}>

      {/* header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {settings?.game_logo_url && <img src={settings.game_logo_url} alt="logo" style={{ height: 56, marginBottom: 10, objectFit: 'contain' }} />}
        {settings?.heading_1 && <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800 }}>{settings.heading_1}</h1>}
        {settings?.heading_2 && <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, opacity: 0.8 }}>{settings.heading_2}</h2>}
        {settings?.heading_3 && <p  style={{ margin: '0 0 8px', fontSize: 14, opacity: 0.7 }}>{settings.heading_3}</p>}
        {settings?.description_text && <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 13, opacity: 0.65 }}>{settings.description_text}</p>}
      </div>

      {/* score + timer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
        <span>✅ {correctCount} / {totalWords}</span>
        {settings?.show_timer && <span>⏱ {timerDisplay}</span>}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>

        {/* ── grid ── */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 2 }}>
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const key = `${r},${c}`
                const cell = grid[r][c]
                if (!cell.letter) {
                  return <div key={key} style={{ width: cellSize, height: cellSize, background: 'transparent' }} />
                }

                const isHighlighted = highlightedCells.has(key)
                const wordId = cell.wordIds.find(id => correct[id] || wrong[id]) || cell.wordIds[0]
                const isCorrect = cell.wordIds.some(id => correct[id])
                const isWrong   = !isCorrect && cell.wordIds.some(id => wrong[id])
                const num = numberMap[key]

                let bg = 'white'
                if (isCorrect)     bg = '#dcfce7'
                else if (isWrong)  bg = '#fee2e2'
                else if (isHighlighted) bg = `${primaryColor}22`

                return (
                  <div key={key} style={{ position: 'relative', width: cellSize, height: cellSize }}>
                    {num && <span style={{ position: 'absolute', top: 1, left: 2, fontSize: cellSize * 0.22, color: '#666', lineHeight: 1, zIndex: 2, pointerEvents: 'none' }}>{num}</span>}
                    <input
                      ref={el => cellRefs.current[key] = el}
                      maxLength={1}
                      value={inputs[key] || ''}
                      readOnly={isCorrect}
                      onChange={e => handleInput(r, c, e.target.value)}
                      onKeyDown={e => handleKeyDown(r, c, e)}
                      onFocus={() => {
                        // select the first word that owns this cell that isn't yet correct
                        const owningWord = words.find(w => cell.wordIds.includes(w.id) && !correct[w.id])
                          || words.find(w => cell.wordIds.includes(w.id))
                        if (owningWord) setSelected({ wordId: owningWord.id })
                      }}
                      style={{
                        width: '100%', height: '100%', border: `2px solid ${isHighlighted ? primaryColor : '#ccc'}`,
                        borderRadius: 4, textAlign: 'center', fontSize: cellSize * 0.42, fontWeight: 700,
                        background: bg, color: '#1a1a2e', outline: 'none', cursor: isCorrect ? 'default' : 'text',
                        textTransform: 'uppercase', padding: 0, boxSizing: 'border-box', paddingTop: num ? cellSize * 0.2 : 0
                      }}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── clue list ── */}
        <div style={{ minWidth: 220, maxWidth: 300, flex: 1 }}>
          {['across', 'down'].map(dir => (
            <div key={dir} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, color: primaryColor }}>
                {dir === 'across' ? '→ Across' : '↓ Down'}
              </div>
              {words.filter(w => w.direction === dir).sort((a, b) => a.word_order - b.word_order).map(w => {
                const num = numberMap[`${w.start_row},${w.start_col}`]
                const isSelected = selected?.wordId === w.id
                const isSolved   = !!correct[w.id]
                return (
                  <div key={w.id} onClick={() => focusWord(w)}
                    style={{ padding: '6px 8px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', fontSize: 13,
                      background: isSelected ? `${primaryColor}18` : 'transparent',
                      border: `1px solid ${isSelected ? primaryColor : 'transparent'}`,
                      textDecoration: isSolved ? 'line-through' : 'none', opacity: isSolved ? 0.5 : 1,
                      color: isSolved ? 'var(--text2, #888)' : 'inherit' }}>
                    <span style={{ fontWeight: 700, marginRight: 6 }}>{num}.</span>
                    {w.clue_text || w.word_text}
                  </div>
                )
              })}
            </div>
          ))}

          {/* check / finish button */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {settings?.allow_hints && selectedWord && !correct[selectedWord.id] && (
              <button onClick={() => {
                // reveal selected word
                const newInputs = { ...inputs }
                for (let i = 0; i < selectedWord.word_text.length; i++) {
                  const r = selectedWord.direction === 'down'   ? selectedWord.start_row + i : selectedWord.start_row
                  const c = selectedWord.direction === 'across' ? selectedWord.start_col + i : selectedWord.start_col
                  newInputs[`${r},${c}`] = selectedWord.word_text[i]
                }
                setInputs(newInputs)
                setCorrect(p => ({ ...p, [selectedWord.id]: true }))
              }} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${primaryColor}`, background: 'transparent', color: primaryColor, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                💡 Reveal Selected Word
              </button>
            )}
            <button onClick={() => { setGameOver(true); completeGame() }}
              style={{ padding: '10px 16px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              {correctCount === totalWords ? '🎉 Complete!' : '✅ Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}