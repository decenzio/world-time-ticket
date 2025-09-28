import { useState, useCallback } from "react"

export interface DebugLog {
  id: string
  timestamp: Date
  level: "info" | "success" | "warning" | "error"
  message: string
  data?: any
}

export function useDebugLogger() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addLog = useCallback((
    level: DebugLog["level"],
    message: string,
    data?: any
  ) => {
    const log: DebugLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      data
    }
    
    setLogs(prev => [...prev, log])
    
    // Also log to console for development
    console.log(`[${level.toUpperCase()}] ${message}`, data || "")
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  return {
    logs,
    isVisible,
    addLog,
    clearLogs,
    toggleVisibility
  }
}
