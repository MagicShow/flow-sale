import React, { useState, useCallback } from 'react'
import { scripts } from './data/scripts'

const PLACEHOLDER_FIELDS = [
  { key: 'clientName',   label: 'Client First Name',  placeholder: 'Maria' },
  { key: 'clientLast',  label: 'Client Last Name',   placeholder: 'Garcia' },
  { key: 'yourName',    label: 'Your Name',           placeholder: 'Dagen', defaultValue: 'Dagen' },
  { key: 'unionName',   label: 'Union / Sponsor Org', placeholder: 'Iron Workers Local 17' },
  { key: 'sponsorName', label: 'Sponsor Name',        placeholder: 'Carlos' },
  { key: 'beneficiary', label: 'Beneficiary Name',    placeholder: 'Alex' },
  { key: 'spouseName',  label: 'Spouse / Partner',   placeholder: 'Rosa' },
]

const NODE_LABELS = {
  start: 'Start', intro_confirm: 'Intro', intro_rebuttal: 'Rebuttal',
  location: 'Location', location_home: 'At Home', location_work: 'At Work',
  info_confirm: 'Info', spouse_check: 'Spouse', spouse_home: 'Spouse Home',
  spouse_single: 'Single', zoom_spouse: 'Zoom', why_zoom_spouse: 'Zoom Time',
  time_pick_spouse: 'Pick Time', email_capture: 'Email', end: 'End',
}

function getTrail(nodeId, nodes, visited = []) {
  if (!nodeId) return visited
  const label = NODE_LABELS[nodeId] || nodeId
  return getTrail(nodes[nodeId]?.yes, nodes, [...visited, label])
}

/* Split raw script text into {text, highlight} segments */
function tokenize(text, vars) {
  if (!text) return [{ text: '', highlight: false }]
  const lookup = {
    NAME: vars.clientName || null,
    'LAST NAME': vars.clientLast || null,
    LAST_NAME: vars.clientLast || null,
    'YOUR NAME': vars.yourName || null,
    UNION: vars.unionName || null,
    'INSERT UNION': vars.unionName || null,
    SPONSOR: vars.sponsorName || null,
    'BENEFICIARY NAME': vars.beneficiary || null,
    'SPOUSE NAME': vars.spouseName || null,
    SPOUSE: vars.spouseName || null,
    TIME: '3:00 PM',
  }
  const parts = []
  const regex = /\[([A-Z_ ]+)\]/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false })
    }
    const resolved = lookup[match[1]]
    parts.push({ text: resolved || match[0], highlight: !!resolved })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }
  return parts
}

function EndCard({ color, onRestart }) {
  return (
    <div className="end-card">
      <div className="end-icon">🎉</div>
      <div className="end-title">End of Script</div>
      <div className="end-sub">Great job! Restart when ready.</div>
      <button className="btn btn-restart" style={{ background: color }} onClick={onRestart}>
        Restart Script
      </button>
    </div>
  )
}

function StepCard({ segments, color, totalSteps, onYes, onNo }) {
  const [yesFlash, setYesFlash] = useState(false)
  const isEnd = !segments // no segments = end node

  const handleYes = () => {
    setYesFlash(true)
    setTimeout(() => setYesFlash(false), 550)
    onYes()
  }

  return (
    <div className="card">
      <div className="step-indicator">Step {totalSteps}</div>
      <div className="script-text">
        {segments.map((seg, i) =>
          seg.highlight ? (
            <span key={i} className="script-token">{seg.text}</span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
      <div className="buttons">
        <button className={`btn btn-yes${yesFlash ? ' flash' : ''}`} onClick={handleYes}>
          YES
        </button>
        <button className="btn btn-no" onClick={onNo}>
          NO
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   LEAD CAPTURE PAGE
   ============================================================ */
function LeadCapture({ onStart }) {
  const [fields, setFields] = useState(() =>
    Object.fromEntries(PLACEHOLDER_FIELDS.map(f => [f.key, f.defaultValue || '']))
  )
  const [selectedScript, setSelectedScript] = useState(scripts[0].id)

  const handleChange = useCallback((key, val) => {
    setFields(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSkip = useCallback(() => {
    onStart(Object.fromEntries(PLACEHOLDER_FIELDS.map(f => [f.key, ''])), selectedScript)
  }, [selectedScript, onStart])

  return (
    <div className="capture-page">
      <div className="capture-form-wrap">
        {PLACEHOLDER_FIELDS.map(f => (
          <div className="field-group" key={f.key}>
            <label className="field-label">{f.label}</label>
            <input
              className="field-input"
              type="text"
              placeholder={f.placeholder}
              value={fields[f.key]}
              onChange={e => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="capture-script-section">
        <div className="capture-script-label">Select Script</div>
        <div className="capture-script-grid">
          {scripts.map(s => (
            <button
              key={s.id}
              className={`capture-script-chip${selectedScript === s.id ? ' selected' : ''}`}
              style={selectedScript === s.id ? { background: s.color } : {}}
              onClick={() => setSelectedScript(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="capture-footer">
        <div className="capture-footer-inner">
          <button className="capture-go-btn" onClick={() => onStart(fields, selectedScript)}>
            Launch <span aria-hidden="true">🚀</span>
          </button>
          <button className="capture-skip-btn" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [view, setView] = useState('landing')
  const [vars, setVars] = useState({ yourName: 'Dagen' })
  const [activeScriptId, setActiveScriptId] = useState(scripts[0].id)
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [stepCount, setStepCount] = useState(1)
  const [animKey, setAnimKey] = useState(0)

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0]
  const currentNode = activeScript.nodes[currentNodeId]
  const trail = getTrail(currentNodeId, activeScript.nodes)
  const isAtEnd = currentNode && currentNode.yes === null && currentNode.no === null
  const segments = isAtEnd ? null : tokenize(currentNode.text, vars)

  const displayName = vars.clientName
    ? `${vars.clientName}${vars.clientLast ? ' ' + vars.clientLast : ''}`
    : 'Generic'

  const navigate = useCallback((nextNodeId) => {
    if (!nextNodeId) return
    setCurrentNodeId(nextNodeId)
    setStepCount(c => c + 1)
    setAnimKey(k => k + 1)
  }, [])

  const handleYes = useCallback(() => {
    if (currentNode.yes) navigate(currentNode.yes)
  }, [currentNode, navigate])

  const handleNo = useCallback(() => {
    if (currentNode.no) navigate(currentNode.no)
  }, [currentNode, navigate])

  const handleRestart = useCallback(() => {
    setCurrentNodeId('start')
    setStepCount(1)
    setAnimKey(k => k + 1)
  }, [])

  const handleScriptChange = useCallback((id) => {
    setActiveScriptId(id)
    setCurrentNodeId('start')
    setStepCount(1)
    setAnimKey(k => k + 1)
  }, [])

  const handleClear = useCallback(() => {
    setVars({ yourName: 'Dagen' })
    setActiveScriptId(scripts[0].id)
    setCurrentNodeId('start')
    setStepCount(1)
    setAnimKey(k => k + 1)
  }, [])

  /* ---- Landing ---- */
  if (view === 'landing') {
    return (
      <div className="landing">
        <div className="landing-bg" />
        <div className="landing-content">
          <div className="landing-logo">Sales Flow</div>
          <div className="landing-logo-sub">Sales Script Engine</div>
          <div className="landing-tagline">It's MoneyMaxxing time.</div>
          <button className="landing-btn" onClick={() => setView('capture')}>
            Get Started
          </button>
        </div>
      </div>
    )
  }

  /* ---- Lead Capture ---- */
  if (view === 'capture') {
    return <LeadCapture onStart={(fields, scriptId) => {
      setVars(fields)
      if (scriptId) setActiveScriptId(scriptId)
      setView('script')
    }} />
  }

  /* ---- Script View ---- */
  return (
    <div className="app">
      <div className="header">
        <div className="accent-bar" style={{ background: activeScript.color }} />
        <div className="nav-bar">
          <button className="nav-btn" onClick={() => setView('capture')}>← Back</button>
          <div className="nav-title-group">
            <div className="nav-script-name">Sales Script — {activeScript.title}</div>
            <div className="nav-lead-name">{displayName}</div>
          </div>
          <button className="nav-btn" onClick={handleClear}>Clear</button>
        </div>
        <div className="progress">{trail.length > 0 ? trail.join(' → ') : 'Start'}</div>
      </div>

      <div className="step-wrapper" key={animKey}>
        {isAtEnd ? (
          <div className="card">
            <div className="step-indicator">Step {stepCount}</div>
            <div className="script-text">{currentNode.text}</div>
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-yes" style={{ background: activeScript.color, opacity: 0.5, cursor: 'default' }} disabled>
                ✅ Script Complete
              </button>
            </div>
          </div>
        ) : (
          <StepCard
            segments={segments}
            color={activeScript.color}
            totalSteps={stepCount}
            onYes={handleYes}
            onNo={handleNo}
          />
        )}
        {isAtEnd && (
          <div style={{ padding: '0 16px 8px' }}>
            <EndCard color={activeScript.color} onRestart={handleRestart} />
          </div>
        )}
      </div>

      <div className="tabs">
        {scripts.map(script => (
          <button
            key={script.id}
            className={`tab${activeScriptId === script.id ? ' active' : ''}`}
            style={activeScriptId === script.id ? { background: script.color } : {}}
            onClick={() => handleScriptChange(script.id)}
          >
            {script.title}
          </button>
        ))}
      </div>
    </div>
  )
}
