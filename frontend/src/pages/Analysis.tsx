import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { analyzeDataset } from '../api/client'
import { useSessionStore } from '../store/sessionStore'

export default function Analysis() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { targetColumn, taskType } = useSessionStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const log = (msg: string) => setLogs(prev => [...prev, msg])

  useEffect(() => {
    if (!sessionId || !targetColumn) return
    const fetch = async () => {
      try {
        log(`> Loading analysis for session ${sessionId.slice(0, 8)}...`)
        const { data } = await analyzeDataset(sessionId, targetColumn)
        setProfile(data.profile)
        log(`> Dataset shape: ${data.profile.shape[0]} rows x ${data.profile.shape[1]} columns`)
        log(`> Task type: ${data.task_type}`)
        log(`> Analysis loaded.`)
      } catch (err: any) {
        log(`> [ERROR] ${err.response?.data?.detail || 'Failed to load analysis'}`)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sessionId, targetColumn])

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-terminal-amber font-bold text-lg">
            {'>'} codeml --analyze
          </p>
          <p className="text-terminal-dim text-sm">
            session: {sessionId?.slice(0, 8)}... | target: {targetColumn} | task: {taskType}
          </p>
        </div>

        {/* Logs */}
        <div className="mb-6 space-y-1">
          {logs.map((line, i) => (
            <p key={i} className={
              line.includes('ERROR') ? 'text-terminal-red' :
              line.includes('loaded') ? 'text-terminal-green' :
              'text-terminal-white'
            }>
              {line}
            </p>
          ))}
          {loading && (
            <p className="text-terminal-amber animate-pulse">{'>'} Loading...</p>
          )}
        </div>

        {profile && (
          <>
            {/* Shape */}
            <div className="mb-6">
              <p className="text-terminal-amber mb-2">
                {'>'} DATASET OVERVIEW
              </p>
              <div className="border border-terminal-dim p-4 space-y-1">
                <p className="text-terminal-white">
                  Rows    <span className="text-terminal-green ml-4">{profile.shape[0]}</span>
                </p>
                <p className="text-terminal-white">
                  Columns <span className="text-terminal-green ml-4">{profile.shape[1]}</span>
                </p>
                <p className="text-terminal-white">
                  Target  <span className="text-terminal-green ml-4">{targetColumn}</span>
                </p>
                <p className="text-terminal-white">
                  Task    <span className="text-terminal-amber ml-4">{taskType}</span>
                </p>
              </div>
            </div>

            {/* Missing Values */}
            {Object.keys(profile.missing || {}).length > 0 && (
              <div className="mb-6">
                <p className="text-terminal-amber mb-2">
                  {'>'} MISSING VALUES
                </p>
                <div className="border border-terminal-dim p-4">
                  <div className="grid grid-cols-3 gap-2 mb-2 text-terminal-dim text-xs">
                    <span>COLUMN</span>
                    <span>COUNT</span>
                    <span>PCT</span>
                  </div>
                  {Object.entries(profile.missing).map(([col, stats]: any) => (
                    <div key={col} className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-terminal-white">{col}</span>
                      <span className="text-terminal-red">{stats.count}</span>
                      <span className="text-terminal-red">{stats.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dtypes */}
            <div className="mb-6">
              <p className="text-terminal-amber mb-2">
                {'>'} COLUMN TYPES
              </p>
              <div className="border border-terminal-dim p-4">
                <div className="grid grid-cols-2 gap-2 mb-2 text-terminal-dim text-xs">
                  <span>COLUMN</span>
                  <span>DTYPE</span>
                </div>
                {Object.entries(profile.dtypes || {}).map(([col, dtype]: any) => (
                  <div key={col} className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-terminal-white">{col}</span>
                    <span className="text-terminal-cyan">{dtype}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigate to Training */}
            <div className="mt-8">
              <p className="text-terminal-green mb-2">
                codeml@automl:~$ <span className="text-terminal-white">ready to train</span>
              </p>
              <button
                onClick={() => navigate(`/training/${sessionId}`)}
                className="border border-terminal-green text-terminal-green px-6 py-2 hover:bg-terminal-selection transition-colors"
              >
                {'>'} Proceed to Training
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}