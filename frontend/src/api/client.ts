import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

export const uploadDataset = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const analyzeDataset = (session_id: string, target_column: string) =>
  api.post('/api/analyze', { session_id, target_column })

export const trainModels = (
  session_id: string,
  target_column: string,
  task_type: string,
  n_trials: number = 50,
  test_size: number = 0.2
) =>
  api.post('/api/train', { session_id, target_column, task_type, n_trials, test_size })

export const getStatus = (session_id: string) =>
  api.get(`/api/status/${session_id}`)

export const getLeaderboard = (session_id: string) =>
  api.get(`/api/leaderboard/${session_id}`)

export const getExplanation = (session_id: string) =>
  api.get(`/api/explain/${session_id}`)

export const downloadModel = (session_id: string) =>
  api.get(`/api/download/${session_id}`, { responseType: 'blob' })