import React, { useState, useCallback } from 'react'
import { scripts } from './data/scripts'

const PLACEHOLDER_FIELDS = [
  { key: 'clientName',      label: 'Client First Name',  placeholder: 'Maria' },
  { key: 'clientLast',     label: 'Client Last Name',   placeholder: 'Garcia' },
  { key: 'yourName',       label: 'Your Name',           placeholder: 'James' },
  { key: 'unionName',      label: 'Union / Sponsor Org', placeholder: 'Iron Workers Local 17' },
  { key: 'sponsorName',    label: 'Sponsor Name',        placeholder: 'Carlos' },
  { key: 'beneficiary',    label: 'Beneficiary Name',    placeholder: 'Alex' },
  { key: 'spouseName',     label: 'Spouse / Partner',   placeholder: 'Rosa' },
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

function StepCard({ node, color, totalSteps, onYes, onNo }) {
  const isEnd = node.yes === null && node.no === null
  return (
    <div className="card">
      <div className="step-indicator">Step {totalSteps}</div>
      <div className="script-text">{node.text}</div>
      {isEnd ? (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-yes" style={{ background: color, opacity: 0.5, cursor: 'default' }} disabled>
            ✅ Script Complete
          </button>
        </div>
      ) : (
        <div className="buttons">
          {node.yes !== undefined && (
            <button className="btn btn-yes" onClick={onYes}>YES</button>
          )}
          {node.no !== undefined && node.no !== null && (
            <button className="btn btn-no" onClick={onNo}>NO</button>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   LEAD CAPTURE PAGE
   ============================================================ */
function LeadCapture({ onStart }) {
  const [fields, setFields] = useState(() =>
    Object.fromEntries(PLACEHOLDER_FIELDS.map(f => [f.key, '']))
  )

  const handleChange = useCallback((key, val) => {
    setFields(prev => ({ ...prev, [key]: val }))
  }, [])

  return (
    <div className="capture-page">
      <div className="capture-header">
        <div className="capture-title">Lead Info</div>
        <div className="capture-subtitle">Fill in what you know — the script adapts automatically.</div>
      </div>

      <div className="capture-form">
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

      {/* Script selector — lives below fields */}
      <div className="capture-script-section">
        <div className="capture-script-label">Select Script</div>
        <div className="capture-script-grid">
          {scripts.map(s => (
            <div key={s.id} className="capture-script-chip" style={{ '--chip-color': s.color }}>
              {s.title}
            </div>
          ))}
        </div>
      </div>

      <div className="capture-footer">
        <button className="capture-go-btn" onClick={() => onStart(fields)}>
          Go →
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [view, setView] = useState('landing') // landing | capture | script
  const [vars, setVars] = useState({})
  const [activeScriptId, setActiveScriptId] = useState(scripts[0].id)
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [stepCount, setStepCount] = useState(1)
  const [animKey, setAnimKey] = useState(0)

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0]
  const currentNode = activeScript.nodes[currentNodeId]
  const trail = getTrail(currentNodeId, activeScript.nodes)
  const isAtEnd = currentNode && currentNode.yes === null && currentNode.no === null

  // Replace [VAR] tokens in script text with actual values
  const resolveText = useCallback((text) => {
    if (!text) return ''
    return text.replace(/\[([A-Z_]+)\]/g, (_, key) => {
      const lookup = {
        NAME: vars.clientName || '[NAME]',
        LAST_NAME: vars.clientLast || '[LAST NAME]',
        YOUR_NAME: vars.yourName || '[YOUR NAME]',
        UNION: vars.unionName || '[UNION]',
        SPONSOR: vars.sponsorName || '[SPONSOR]',
        BENEFICIARY_NAME: vars.beneficiary || '[BENEFICIARY NAME]',
        SPOUSE_NAME: vars.spouseName || '[SPOUSE NAME]',
        SPOUSE: vars.spouseName || '[SPOUSE]',
        TIME: '3:00 PM',
      }
      return lookup[key] || _ // leave unknown tokens as-is
    })
  }, [vars])

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
    return (
      <div className="app">
        <div className="header">
          <div className="accent-bar" style={{ background: activeScript.color }} />
          <div className="header-title">Lead Info</div>
        </div>
        <LeadCapture onStart={(fields) => { setVars(fields); setView('script') }} />
      </div>
    )
  }

  /* ---- Script View ---- */
  return (
    <div className="app">
      <div className="header">
        <div className="accent-bar" style={{ background: activeScript.color }} />
        <div className="header-title">Sales Script</div>
        <div className="progress">{trail.length > 0 ? trail.join(' → ') : 'Start'}</div>
      </div>

      <div className="step-wrapper" key={animKey}>
        <StepCard
          node={{ ...currentNode, text: resolveText(currentNode.text) }}
          color={activeScript.color}
          totalSteps={stepCount}
          onYes={handleYes}
          onNo={handleNo}
        />
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
