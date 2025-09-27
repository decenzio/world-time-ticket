"use client"

import {useEffect, useState} from "react"
import {miniKit} from "@/lib/minikit"
import {VerificationLevel} from '@worldcoin/minikit-js'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)
  const [isInWorldApp, setIsInWorldApp] = useState(false)

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const debugMessage = `[${timestamp}] ${message}`
    console.log(debugMessage)
    setDebugInfo(prev => [...prev, debugMessage])
  }

  const clearDebugInfo = () => {
    setDebugInfo([])
  }

  useEffect(() => {
    addDebugInfo("=== DEBUG PAGE LOADED ===")
    addDebugInfo(`User Agent: ${navigator.userAgent}`)
    addDebugInfo(`URL: ${window.location.href}`)
    addDebugInfo(`In iframe: ${window.self !== window.top}`)
    addDebugInfo(`Window location: ${window.location.origin}`)
    
    // Check environment variables
    addDebugInfo(`NODE_ENV: ${process.env.NODE_ENV}`)
    addDebugInfo(`APP_ID: ${process.env.APP_ID ? 'Set' : 'Not set'}`)
    addDebugInfo(`NEXT_PUBLIC_WORLD_ID_ACTION_ID: ${process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || 'Not set'}`)
    
    // Check if MiniKit is available globally
    addDebugInfo(`MiniKit global: ${typeof window !== 'undefined' && 'MiniKit' in window ? 'Available' : 'Not available'}`)
    
    const initMiniKit = async () => {
      try {
        addDebugInfo("Initializing MiniKit...")
        const available = await miniKit.initialize()
        setMiniKitAvailable(available)
        addDebugInfo(`MiniKit available: ${available}`)
        
        if (available) {
          const inWorldApp = miniKit.isInWorldApp()
          setIsInWorldApp(inWorldApp)
          addDebugInfo(`MiniKit detects World App: ${inWorldApp}`)
          addDebugInfo(`MiniKit isAvailable(): ${miniKit.isAvailable()}`)
        }
      } catch (error) {
        addDebugInfo(`MiniKit initialization error: ${error}`)
      }
    }
    
    initMiniKit()
  }, [])

  const testVerification = async () => {
    if (!miniKitAvailable) {
      addDebugInfo("ERROR: MiniKit not available")
      return
    }

    setIsLoading(true)
    addDebugInfo("Starting verification test...")
    
    try {
      const actionId = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || "verify-human"
      addDebugInfo(`Using action ID: ${actionId}`)
      
      const response = await miniKit.verify({
        action: actionId,
        signal: "debug-test",
        verification_level: VerificationLevel.Orb,
      })
      
      addDebugInfo(`Verification response: ${JSON.stringify(response, null, 2)}`)
      
      if (response.success) {
        addDebugInfo("✅ Verification successful!")
      } else {
        addDebugInfo(`❌ Verification failed: ${response.error}`)
      }
    } catch (error) {
      addDebugInfo(`❌ Verification error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">World ID Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">In iframe (World App):</span>
              <span className={`ml-2 ${isInWorldApp ? 'text-green-600' : 'text-red-600'}`}>
                {isInWorldApp ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div>
              <span className="font-medium">MiniKit available:</span>
              <span className={`ml-2 ${miniKitAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {miniKitAvailable ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Action ID:</span>
              <span className="ml-2 font-mono text-sm">
                {process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || 'verify-human (default)'}
              </span>
            </div>
            <div>
              <span className="font-medium">Environment:</span>
              <span className="ml-2">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Log</h2>
            <button
              onClick={clearDebugInfo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Clear Log
            </button>
          </div>
          <div className="bg-black text-green-400 p-4 rounded text-sm font-mono max-h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <div className="text-gray-500">No debug messages yet...</div>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Verification</h2>
          <button
            onClick={testVerification}
            disabled={!miniKitAvailable || isLoading}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test World ID Verification'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will attempt to verify your identity using World ID. Make sure you're in World App.
          </p>
        </div>
      </div>
    </div>
  )
}
