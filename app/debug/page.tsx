"use client"

import { useSession } from "next-auth/react"
import { useAuthSession } from "@/lib/use-auth-session"
import { useState, useEffect } from "react"

export default function DebugPage() {
  const { data: session, status } = useSession()
  const { isInitialized } = useAuthSession()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog(`Status changed to: ${status}`)
  }, [status])

  useEffect(() => {
    addLog(`Session updated: ${session ? 'Present' : 'None'}`)
    if (session?.user) {
      addLog(`User: ${session.user.username || session.user.walletAddress}`)
    }
  }, [session])

  useEffect(() => {
    addLog(`Initialized: ${isInitialized}`)
  }, [isInitialized])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</p>
              <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
              <p><strong>Has User:</strong> {session?.user ? 'Yes' : 'No'}</p>
              {session?.user && (
                <div className="mt-4">
                  <p><strong>User ID:</strong> {session.user.id}</p>
                  <p><strong>Username:</strong> {session.user.username || 'None'}</p>
                  <p><strong>Wallet:</strong> {session.user.walletAddress || 'None'}</p>
                  <p><strong>Verification:</strong> {session.user.verificationLevel || 'None'}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Event Log</h2>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No events yet...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <p key={index} className="text-sm font-mono">{log}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  )
}
