import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExplanation } from '../api/client'

interface ExplainData {
  feature_names: string[]
  global_importance: number[]
  local_shap_row0: number[]
  base_value: number
}

export default function Explainability() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<ExplainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const log = (msg: string) => setLogs(prev => [...prev, msg])

  useEffect(() => {
    if (!sessionId) return
    const fetch = async () => {
      try {
        log(`> Loading SHAP explanations...`)
        log(`> Using TreeExplainer for best model...`)
        const { data: res } = await getExplanation(sessionId)
        setData(res)
        log(`> ${res.feature_names.length} features analyzed.`)
        log(`> Base value: ${res.base_value?.toFixed(4)}`)
        log(`> Explanation complete.`)
      } catch (err: any) {
        log(`> [ERROR] ${err.response?.data?.detail || 'Failed to load explanation'}`)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sessionId])

  const maxImportance = data
    ? Math.max(...data.global_importance)
    : 1

  const bar = (value: number, max: number) => {
    const len = Math.floor((value / max) * 30)
    return '█'.repeat(len) + '░'.repeat(30 - len)
  }

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-terminal-amber font-bold text-lg">
            {'>'} codeml --explain --method shap
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
              line.includes('complete') || line.includes('analyzed') ? 'text-terminal-green' :
              'text-terminal-white'
            }>
              {line}
            </p>
          ))}
          {loading && (
            <p className="text-terminal-amber animate-pulse">
              {'>'} Computing SHAP values...
            </p>
          )}
        </div>

        {data && (
          <>
            {/* Global Importance */}
            <div className="mb-8">
              <p className="text-terminal-amber mb-4">
                {'>'} GLOBAL FEATURE IMPORTANCE (mean |SHAP|)
              </p>
              <div className="border border-terminal-dim p-4 space-y-3">
                <div className="grid grid-cols-3 text-terminal-dim text-xs mb-3">
                  <span>FEATURE</span>
                  <span>IMPORTANCE BAR</span>
                  <span>VALUE</span>
                </div>
                {data.feature_names.slice(0, 15).map((name, i) => (
                  <div key={name} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-terminal-white text-xs truncate">
                      {name}
                    </span>
                    <span className="text-terminal-green text-xs font-mono">
                      {bar(data.global_importance[i], maxImportance)}
                    </span>
                    <span className="text-terminal-amber text-xs">
                      {data.global_importance[i].toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Explanation */}
            <div className="mb-8">
              <p className="text-terminal-amber mb-4">
                {'>'} LOCAL EXPLANATION (row 0) | base value: {data.base_value?.toFixed(4)}
              </p>
              <div className="border border-terminal-dim p-4 space-y-3">
                <div className="grid grid-cols-3 text-terminal-dim text-xs mb-3">
                  <span>FEATURE</span>
                  <span>DIRECTION</span>
                  <span>SHAP VALUE</span>
                </div>
                {data.feature_names.slice(0, 15).map((name, i) => {
                  const val = data.local_shap_row0[i]
                  return (
                    <div key={name} className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-terminal-white text-xs truncate">
                        {name}
                      </span>
                      <span className={
                        val > 0 ? 'text-terminal-green text-xs' : 'text-terminal-red text-xs'
                      }>
                        {val > 0 ? '▲ pushes UP' : '▼ pushes DOWN'}
                      </span>
                      <span className={
                        val > 0 ? 'text-terminal-green text-xs' : 'text-terminal-red text-xs'
                      }>
                        {val > 0 ? '+' : ''}{val.toFixed(4)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/leaderboard/${sessionId}`)}
                className="border border-terminal-dim text-terminal-dim px-6 py-2 hover:border-terminal-green hover:text-terminal-green transition-colors"
              >
                {'<'} Back to Leaderboard
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