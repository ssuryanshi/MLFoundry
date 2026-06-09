import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trainModels } from '../api/client'
import { useSessionStore } from '../store/sessionStore'
import { useTrainingStatus } from '../hooks/useTrainingStatus'

export default function Training() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { targetColumn, taskType } = useSessionStore()

  const [nTrials, setNTrials] = useState(50)
  const [testSize, setTestSize] = useState(0.2)
  const [started, setStarted] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const status = useTrainingStatus(started ? sessionId || null : null)

  const log = (msg: string) => setLogs(prev => [...prev, msg])

  const handleTrain = async () => {
    if (!sessionId || !targetColumn || !taskType) return
    try {
      log(`> codeml --train --target ${targetColumn} --trials ${nTrials}`)
      log(`> Task type: ${taskType}`)
      log(`> Test size: ${testSize * 100}%`)
      log(`> Submitting training job...`)
      await trainModels(sessionId, targetColumn, taskType, nTrials, testSize)
      setStarted(true)
      log(`> Training started. Polling for updates...`)
    } catch (err: any) {
      log(`> [ERROR] ${err.response?.data?.detail || 'Failed to start training'}`)
    }
  }

  const progressBar = (pct: number) => {
    const filled = Math.floor(pct / 5)
    const empty = 20 - filled
    return `[${'='.repeat(filled)}${'>'}${'.'.repeat(empty)}] ${pct}%`
  }

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-terminal-amber font-bold text-lg">
            {'>'} codeml --train
          </p>
          <p className="text-terminal-dim text-sm">
            session: {sessionId?.slice(0, 8)}... | target: {targetColumn} | task: {taskType}
          </p>
        </div>

        {/* Config */}
        {!started && (
          <div className="mb-8 border border-terminal-dim p-4 space-y-4">
            <p className="text-terminal-amber">{'>'} TRAINING CONFIG</p>

            <div className="flex items-center gap-4">
              <span className="text-terminal-dim w-32">--trials</span>
              <input
                type="number"
                value={nTrials}
                onChange={e => setNTrials(Number(e.target.value))}
                min={10}
                max={200}
                className="bg-terminal-bg border border-terminal-dim text-terminal-green px-3 py-1 w-24"
              />
              <span className="text-terminal-dim text-xs">
                (10-200, default: 50)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-terminal-dim w-32">--test-size</span>
              <input
                type="number"
                value={testSize}
                onChange={e => setTestSize(Number(e.target.value))}
                min={0.1}
                max={0.4}
                step={0.05}
                className="bg-terminal-bg border border-terminal-dim text-terminal-green px-3 py-1 w-24"
              />
              <span className="text-terminal-dim text-xs">
                (0.1-0.4, default: 0.2)
              </span>
            </div>

            <button
              onClick={handleTrain}
              className="border border-terminal-green text-terminal-green px-6 py-2 hover:bg-terminal-selection transition-colors"
            >
              {'>'} Start Training
            </button>
          </div>
        )}

        {/* Logs */}
        <div className="mb-6 space-y-1">
          {logs.map((line, i) => (
            <p key={i} className={
              line.includes('ERROR') ? 'text-terminal-red' :
              line.includes('started') || line.includes('complete') ? 'text-terminal-green' :
              'text-terminal-white'
            }>
              {line}
            </p>
          ))}
        </div>

        {/* Progress */}
        {started && (
          <div className="space-y-2">
            <p className="text-terminal-amber">
              {progressBar(status.progress_pct)}
            </p>
            <p className={
              status.status === 'failed' ? 'text-terminal-red' :
              status.status === 'complete' ? 'text-terminal-green' :
              'text-terminal-white animate-pulse'
            }>
              {'>'} {status.message || 'Waiting...'}
            </p>

            {status.status === 'complete' && (
              <div className="mt-6">
                <p className="text-terminal-green mb-2">
                  {'>'} Training complete. View results:
                </p>
                <button
                  onClick={() => navigate(`/leaderboard/${sessionId}`)}
                  className="border border-terminal-green text-terminal-green px-6 py-2 hover:bg-terminal-selection transition-colors"
                >
                  {'>'} View Leaderboard
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}