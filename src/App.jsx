import React, { useState, useCallback } from 'react'
import { scripts } from './data/scripts'

const NODE_LABELS = {
  start: 'Start',
  intro_confirm: 'Intro',
  intro_rebuttal: 'Rebuttal',
  location: 'Location',
  location_home: 'At Home',
  location_work: 'At Work',
  info_confirm: 'Info',
  spouse_check: 'Spouse',
  spouse_home: 'Spouse Home',
  spouse_single: 'Single',
  zoom_spouse: 'Zoom',
  why_zoom_spouse: 'Zoom Time',
  time_pick_spouse: 'Pick Time',
  email_capture: 'Email',
  end: 'End',
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
      <button
        className="btn btn-restart"
        style={{ background: color }}
        onClick={onRestart}
      >
        Restart Script
      </button>
    </div>
  )
}

function StepCard({ node, color, nodeId, totalSteps, onYes, onNo }) {
  const isEnd = node.yes === null && node.no === null
  const hasYes = node.yes !== undefined
  const hasNo = node.no !== undefined && node.no !== null

  return (
    <div className="card">
      <div className="step-indicator">Step {totalSteps}</div>
      <div className="script-text">{node.text}</div>

      {isEnd ? (
        <div style={{ marginTop: 24 }}>
          <button
            className="btn btn-yes"
            style={{ background: color, opacity: 0.5, cursor: 'default' }}
            disabled
          >
            ✅ Script Complete
          </button>
        </div>
      ) : (
        <div className="buttons">
          {hasYes && (
            <button className="btn btn-yes" onClick={onYes}>
              YES
            </button>
          )}
          {hasNo && (
            <button className="btn btn-no" onClick={onNo}>
              NO
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeScriptId, setActiveScriptId] = useState(scripts[0].id)
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [stepCount, setStepCount] = useState(1)
  const [animKey, setAnimKey] = useState(0)

  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0]
  const currentNode = activeScript.nodes[currentNodeId]
  const trail = getTrail(currentNodeId, activeScript.nodes)
  const isAtEnd = currentNode && currentNode.yes === null && currentNode.no === null

  const navigate = useCallback((nextNodeId) => {
    if (!nextNodeId) return
    setCurrentNodeId(nextNodeId)
    setStepCount((c) => c + 1)
    setAnimKey((k) => k + 1)
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
    setAnimKey((k) => k + 1)
  }, [])

  const handleScriptChange = useCallback((id) => {
    setActiveScriptId(id)
    setCurrentNodeId('start')
    setStepCount(1)
    setAnimKey((k) => k + 1)
  }, [])

  const handleStart = useCallback(() => {
    setShowLanding(false)
  }, [])

  if (showLanding) {
    return (
      <div className="landing">
        <div className="landing-bg" />
        <div className="landing-content">
          <div className="landing-logo">Sales Flow</div>
          <div className="landing-logo-sub">Sales Script Engine</div>
          <button className="landing-btn" onClick={handleStart}>
            Get Paid Sonnn
          </button>
          <div className="landing-tagline">It's MoneyMaxxing time.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div
          className="accent-bar"
          style={{ background: activeScript.color }}
        />
        <div className="header-title">Sales Script</div>
        <div className="progress">
          {trail.length > 0 ? trail.join(' → ') : 'Start'}
        </div>
      </div>

      {/* Card area */}
      <div className="step-wrapper" key={animKey}>
        <StepCard
          node={currentNode}
          color={activeScript.color}
          nodeId={currentNodeId}
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

      {/* Script tabs */}
      <div className="tabs">
        {scripts.map((script) => (
          <button
            key={script.id}
            className={`tab${activeScriptId === script.id ? ' active' : ''}`}
            style={
              activeScriptId === script.id
                ? { background: script.color }
                : {}
            }
            onClick={() => handleScriptChange(script.id)}
          >
            {script.title}
          </button>
        ))}
      </div>
    </div>
  )
}
