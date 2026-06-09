import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadDataset, analyzeDataset } from '../api/client'
import { useSessionStore } from '../store/sessionStore'

export default function Upload() {
  const navigate = useNavigate()
  const { setSession, setTaskType } = useSessionStore()

  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'analyze' | 'done'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const log = (msg: string) => setLogs(prev => [...prev, msg])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.name.endsWith('.csv')) {
      log('> [ERROR] Only CSV files accepted.')
      return
    }
    setFile(f)
    setLoading(true)
    log(`> Uploading ${f.name}...`)

    try {
      const { data } = await uploadDataset(f)
      setSessionId(data.session_id)
      setColumns(data.column_names)
      setSession(data.session_id, data.filename, data.column_names)
      log(`> Upload complete. Session: ${data.session_id.slice(0, 8)}...`)
      log(`> Rows: ${data.rows}  Columns: ${data.columns}  Size: ${data.file_size_kb}KB`)
      log(`> Select target column to continue.`)
      setStep('analyze')
    } catch (err: any) {
      log(`> [ERROR] ${err.response?.data?.detail || 'Upload failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!target) {
      log('> [ERROR] Please select a target column.')
      return
    }
    setLoading(true)
    log(`> Running analysis on column: ${target}...`)

    try {
      const { data } = await analyzeDataset(sessionId, target)
      setTaskType(data.task_type, data.target_column)
      log(`> Task detected: ${data.task_type}`)
      log(`> Classes: ${data.n_classes}`)
      log(`> Analysis complete. Redirecting...`)
      setStep('done')
      setTimeout(() => navigate(`/analysis/${sessionId}`), 1000)
    } catch (err: any) {
      log(`> [ERROR] ${err.response?.data?.detail || 'Analysis failed'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-terminal-dim">
            ┌─────────────────────────────────────┐
          </p>
          <p className="text-terminal-dim">
            │  <span className="text-terminal-amber font-bold">codeml --upload</span>
            <span className="text-terminal-dim">                    │</span>
          </p>
          <p className="text-terminal-dim">
            └─────────────────────────────────────┘
          </p>
        </div>

        {/* Logs */}
        <div className="mb-6 space-y-1 min-h-[100px]">
          {logs.map((line, i) => (
            <p
              key={i}
              className={
                line.includes('ERROR')
                  ? 'text-terminal-red'
                  : line.includes('complete') || line.includes('detected')
                  ? 'text-terminal-green'
                  : 'text-terminal-white'
              }
            >
              {line}
            </p>
          ))}
          {loading && (
            <p className="text-terminal-amber animate-pulse">
               {'>'} Processing...
            </p>
          )}
        </div>

        {/* Step 1 — File Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-terminal-green">
              codeml@automl:~$ <span className="text-terminal-white">select dataset</span>
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-terminal-dim hover:border-terminal-green p-8 text-center cursor-pointer transition-colors"
            >
              <p className="text-terminal-dim text-sm mb-2">
                [ DROP CSV FILE HERE OR CLICK TO BROWSE ]
              </p>
              <p className="text-terminal-green text-xs">
                .csv only — max 50MB
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        )}

        {/* Step 2 — Select Target */}
        {step === 'analyze' && (
          <div className="space-y-4">
            <p className="text-terminal-green">
              codeml@automl:~$ <span className="text-terminal-white">select target column</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-terminal-dim">--target</span>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="bg-terminal-bg border border-terminal-dim text-terminal-green px-3 py-2 flex-1"
              >
                <option value="">[ select column ]</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !target}
              className="border border-terminal-green text-terminal-green px-6 py-2 hover:bg-terminal-selection disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '> Analyzing...' : '> Run Analyze'}
            </button>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 'done' && (
          <p className="text-terminal-green animate-pulse">
            {'>'} Redirecting to analysis...
          </p>
        )}

      </div>
    </div>
  )
}