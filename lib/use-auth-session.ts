"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getSession } from "next-auth/react"

export function useAuthSession() {
  const { data: session, status, update } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const initializeSession = async () => {
      if (status === 'loading') {
        console.log('useAuthSession - Session is loading...')
        return
      }

      if (status === 'unauthenticated') {
        console.log('useAuthSession - User is not authenticated')
        setIsInitialized(true)
        return
      }

      if (status === 'authenticated' && session?.user) {
        console.log('useAuthSession - User is authenticated:', {
          id: session.user.id,
          username: session.user.username,
          walletAddress: session.user.walletAddress
        })
        setIsInitialized(true)
        return
      }

      // If we're in an unknown state, try to refresh the session
      if (retryCount < 3) {
        console.log(`useAuthSession - Unknown state, retrying... (${retryCount + 1}/3)`)
        try {
          const refreshedSession = await getSession()
          console.log('useAuthSession - Refreshed session:', refreshedSession)
          if (refreshedSession?.user) {
            setIsInitialized(true)
          } else {
            setRetryCount(prev => prev + 1)
          }
        } catch (error) {
          console.error('useAuthSession - Error refreshing session:', error)
          setRetryCount(prev => prev + 1)
        }
      } else {
        console.log('useAuthSession - Max retries reached, giving up')
        setIsInitialized(true)
      }
    }

    initializeSession()
  }, [status, session, retryCount])

  return {
    session,
    status,
    isInitialized,
    update
  }
}
