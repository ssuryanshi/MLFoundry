import { create } from 'zustand'

interface SessionStore {
  sessionId: string | null
  filename: string | null
  taskType: string | null
  targetColumn: string | null
  columnNames: string[]

  setSession: (sessionId: string, filename: string, columnNames: string[]) => void
  setTaskType: (taskType: string, targetColumn: string) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  filename: null,
  taskType: null,
  targetColumn: null,
  columnNames: [],

  setSession: (sessionId, filename, columnNames) =>
    set({ sessionId, filename, columnNames }),

  setTaskType: (taskType, targetColumn) =>
    set({ taskType, targetColumn }),

  reset: () =>
    set({
      sessionId: null,
      filename: null,
      taskType: null,
      targetColumn: null,
      columnNames: [],
    }),
}))