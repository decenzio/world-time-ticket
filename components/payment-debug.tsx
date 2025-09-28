"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react"

interface DebugLog {
  id: string
  timestamp: Date
  level: "info" | "success" | "warning" | "error"
  message: string
  data?: any
}

interface PaymentDebugProps {
  logs: DebugLog[]
  onClearLogs: () => void
  isVisible: boolean
  onToggle: () => void
}

export function PaymentDebug({ logs, onClearLogs, isVisible, onToggle }: PaymentDebugProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, logId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(logId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getLevelColor = (level: DebugLog["level"]) => {
    switch (level) {
      case "success": return "bg-green-100 text-green-800 border-green-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      fractionalSecondDigits: 3
    })
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            🔍 Payment Debug Panel
            <Badge variant="outline" className="text-xs">
              {logs.length} logs
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearLogs}
              className="h-8 px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="h-8 px-2"
            >
              {isVisible ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No debug logs yet. Click the payment button to see what happens.
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-3 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground font-mono">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(log, null, 2), log.id)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedId === log.id ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="font-medium">{log.message}</p>
                  
                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
