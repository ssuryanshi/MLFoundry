import { useState, useEffect, useRef } from 'react'
import { getStatus } from '../api/client'

interface TrainingStatus {
  status: 'idle' | 'queued' | 'training' | 'complete' | 'failed'
  progress_pct: number
  message: string
}

export function useTrainingStatus(sessionId: string | null) {
  const [training, setTraining] = useState<TrainingStatus>({
    status: 'idle',
    progress_pct: 0,
    message: '',
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) return
    if (training.status === 'complete' || training.status === 'failed') return

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await getStatus(sessionId)
        setTraining(data)

        if (data.status === 'complete' || data.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch (err) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sessionId])

  return training
}