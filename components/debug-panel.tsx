"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, RefreshCw, Bug } from "lucide-react"

interface DebugLog {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export function DebugPanel() {
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<DebugLog[]>([])

  const addLog = (message: string, type: DebugLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-9), { timestamp, message, type }])
  }

  useEffect(() => {
    addLog(`Status: ${status}`, status === 'authenticated' ? 'success' : 'info')
  }, [status])

  useEffect(() => {
    if (session?.user) {
      addLog(`User: ${session.user.username || session.user.walletAddress}`, 'success')
    } else {
      addLog('No user session', 'warning')
    }
  }, [session])

  const clearLogs = () => {
    setLogs([])
  }

  const refreshSession = () => {
    addLog('Refreshing session...', 'info')
    window.location.reload()
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
        variant="outline"
      >
        <Bug className="w-4 h-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 z-50 bg-background border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug Panel</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={refreshSession}>
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={clearLogs}>
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
              {status}
            </Badge>
            <Badge variant={session?.user ? 'default' : 'outline'}>
              {session?.user ? 'User' : 'No User'}
            </Badge>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs">
                  <span className="text-muted-foreground">[{log.timestamp}]</span>
                  <span className={`ml-2 ${
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'success' ? 'text-green-500' :
                    log.type === 'warning' ? 'text-yellow-500' :
                    'text-foreground'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
