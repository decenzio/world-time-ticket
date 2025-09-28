"use client"

import { Button } from "@/components/ui/button"
import { useDebugLogger } from "@/lib/use-debug-logger"

export function DebugTestButton() {
  const { addLog } = useDebugLogger()

  const testDebugLogs = () => {
    addLog("info", "Test info message", { timestamp: new Date().toISOString() })
    addLog("success", "Test success message", { data: { test: true } })
    addLog("warning", "Test warning message", { warning: "This is a test warning" })
    addLog("error", "Test error message", { error: "This is a test error" })
  }

  return (
    <Button onClick={testDebugLogs} variant="outline" size="sm">
      Test Debug Logs
    </Button>
  )
}
