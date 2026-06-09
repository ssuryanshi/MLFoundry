import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api/client'

interface ModelEntry {
  rank: number
  model: string
  cv_score: number
  cv_std: number
  train_time_sec: number
  is_best: boolean
  params: Record<string, any>
}

export default function Leaderboard() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<ModelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  const log = (msg: string) => setLogs(prev => [...prev, msg])

  useEffect(() => {
    if (!sessionId) return
    const fetch = async () => {
      try {
        log(`> Loading leaderboard...`)
        const { data } = await getLeaderboard(sessionId)
        setEntries(data.leaderboard)
        log(`> ${data.leaderboard.length} models evaluated.`)
        log(`> Best model: ${data.leaderboard[0]?.model}`)
        log(`> Best CV score: ${data.leaderboard[0]?.cv_score}`)
      } catch (err: any) {
        log(`> [ERROR] ${err.response?.data?.detail || 'Failed to load leaderboard'}`)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sessionId])

  const scoreBar = (score: number) => {
    const filled = Math.floor(score * 20)
    return '█'.repeat(filled) + '░'.repeat(20 - filled)
  }

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-terminal-amber font-bold text-lg">
            {'>'} codeml --leaderboard
          </p>
          <p className="text-terminal-dim text-sm">
            session: {sessionId?.slice(0, 8)}...
          </p>
        </div>

        {/* Logs */}
        <div className="mb-6 space-y-1">
          {logs.map((line, i) => (
            <p key={i} className={
              line.includes('ERROR') ? 'text-terminal-red' :
              line.includes('Best') || line.includes('models') ? 'text-terminal-green' :
              'text-terminal-white'
            }>
              {line}
            </p>
          ))}
          {loading && (
            <p className="text-terminal-amber animate-pulse">{'>'} Loading...</p>
          )}
        </div>

        {/* Table Header */}
        {entries.length > 0 && (
          <>
            <div className="border border-terminal-dim">
              <div className="grid grid-cols-5 gap-2 p-3 text-terminal-dim text-xs border-b border-terminal-dim">
                <span>RANK</span>
                <span>MODEL</span>
                <span>CV SCORE</span>
                <span>STD</span>
                <span>TIME</span>
              </div>

              {entries.map((entry) => (
                <div key={entry.model}>
                  <div
                    className={`grid grid-cols-5 gap-2 p-3 cursor-pointer hover:bg-terminal-selection transition-colors ${
                      entry.is_best ? 'border-l-2 border-terminal-green' : ''
                    }`}
                    onClick={() =>
                      setExpanded(expanded === entry.model ? null : entry.model)
                    }
                  >
                    <span className={
                      entry.rank === 1 ? 'text-terminal-amber font-bold' : 'text-terminal-dim'
                    }>
                      #{entry.rank}
                    </span>
                    <span className={
                      entry.is_best ? 'text-terminal-green font-bold' : 'text-terminal-white'
                    }>
                      {entry.is_best ? '★ ' : ''}{entry.model}
                    </span>
                    <div>
                      <span className="text-terminal-green">
                        {entry.cv_score.toFixed(4)}
                      </span>
                      <p className="text-terminal-dim text-xs">
                        {scoreBar(entry.cv_score)}
                      </p>
                    </div>
                    <span className="text-terminal-dim">
                      ±{entry.cv_std.toFixed(4)}
                    </span>
                    <span className="text-terminal-dim">
                      {entry.train_time_sec}s
                    </span>
                  </div>

                  {/* Expanded params */}
                  {expanded === entry.model && (
                    <div className="bg-terminal-selection px-6 py-3 text-xs space-y-1 border-t border-terminal-dim">
                      <p className="text-terminal-amber mb-2">
                        {'>'} Best hyperparameters:
                      </p>
                      {Object.entries(entry.params).map(([k, v]) => (
                        <p key={k} className="text-terminal-white">
                          <span className="text-terminal-dim">{k}</span>
                          <span className="text-terminal-green ml-4">{String(v)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate(`/explain/${sessionId}`)}
                className="border border-terminal-green text-terminal-green px-6 py-2 hover:bg-terminal-selection transition-colors"
              >
                {'>'} Explain Best Model
              </button>
              <button
                onClick={() => {
                  window.open(
                    `http://127.0.0.1:8000/api/download/${sessionId}`,
                    '_blank'
                  )
                }}
                className="border border-terminal-amber text-terminal-amber px-6 py-2 hover:bg-terminal-selection transition-colors"
              >
                {'>'} Download Model
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}