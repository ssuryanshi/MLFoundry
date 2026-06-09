import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LINES = [
  '> Initializing MLFoundry v1.0.0...',
  '> Loading AutoML engine...',
  '> SHAP explainability module ready.',
  '> Optuna optimizer ready.',
  '> All systems operational.',
  '> Type "start" to begin.',
]

export default function Home() {
  const navigate = useNavigate()
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [showPrompt, setShowPrompt] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < LINES.length) {
        setVisibleLines(prev => [...prev, LINES[i]])
        i++
      } else {
        setShowPrompt(true)
        clearInterval(interval)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const cmd = input.trim().toLowerCase()
    if (cmd === 'start' || cmd === 'mlfoundry --start') {
      navigate('/upload')
    } else if (cmd === 'help') {
      setVisibleLines(prev => [...prev, '> Available commands: start, help, clear'])
      setInput('')
    } else if (cmd === 'clear') {
      setVisibleLines([])
      setInput('')
    } else {
      setError(`command not found: ${input}`)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg font-mono p-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8 border border-terminal-dim p-4">
          <pre className="text-terminal-amber text-xs leading-tight">{`
 __  __ _     _____                    _          
|  \\/  | |   |  ___|__  _   _ _ __   __| |_ __ _   _ 
| |\\/| | |   | |_ / _ \\| | | | '_ \\ / _\` | '__| | | |
| |  | | |___| _| (_) | |_| | | | | (_| | |  | |_| |
|_|  |_|_____|_|  \\___/ \\__,_|_| |_|\\__,_|_|   \\__, |
                                                 |___/ `}</pre>
          <p className="text-terminal-dim mt-2 text-sm">
            Explainable AutoML Platform for Tabular Data — v1.0.0
          </p>
        </div>

        {/* Boot lines */}
        <div className="mb-4 space-y-1">
{visibleLines.filter(Boolean).map((line, i) => (            <p key={i} className={
              line.includes('operational') || line.includes('ready')
                ? 'text-terminal-green'
                : 'text-terminal-white'
            }>
              {line}
            </p>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-terminal-red mb-2">zsh: {error}</p>
        )}

        {/* Prompt */}
        {showPrompt && (
          <div className="flex items-center gap-2">
            <span className="text-terminal-green">mlfoundry@automl:~$</span>
            <input
              autoFocus
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              onKeyDown={handleCommand}
              className="bg-transparent border-none outline-none text-terminal-green flex-1 caret-terminal-green"
              spellCheck={false}
            />
          </div>
        )}

      </div>
    </div>
  )
}