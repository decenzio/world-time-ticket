import { MiniKit, VerifyCommandInput, PayCommandInput, ResponseEvent, VerificationLevel } from '@worldcoin/minikit-js'

export interface PaymentPayload {
  reference: string
  to: string
  tokens: Array<{
    symbol: string
    token_amount: string
  }>
  description?: string
}

export class MiniKitService {
  private static instance: MiniKitService
  private isInitialized = false
  private isInIframe = false

  static getInstance(): MiniKitService {
    if (!MiniKitService.instance) {
      MiniKitService.instance = new MiniKitService()
    }
    return MiniKitService.instance
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    // Check if running in World App
    if (typeof window === "undefined") {
      console.log("MiniKit: Not in browser environment")
      return false
    }

    try {
      // Check if we're in an iframe (World App environment)
      this.isInIframe = window.self !== window.top
      console.log("MiniKit: In iframe:", this.isInIframe)

      // Check if MiniKit is already available
      console.log("MiniKit: isInstalled() before wait:", MiniKit.isInstalled())

      // Wait for MiniKit to be available
      let attempts = 0
      while (!MiniKit.isInstalled() && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
        if (attempts % 10 === 0) {
          console.log(`MiniKit: Waiting... attempt ${attempts}/50`)
        }
      }

      console.log("MiniKit: isInstalled() after wait:", MiniKit.isInstalled())
      console.log("MiniKit: Total attempts:", attempts)

      if (!MiniKit.isInstalled()) {
        console.warn("MiniKit not available - running outside World App")
        return false
      }

      this.isInitialized = true
      console.log("MiniKit: Successfully initialized")
      return true
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error)
      return false
    }
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && this.isInitialized && MiniKit.isInstalled()
  }

  isInWorldApp(): boolean {
    return this.isInIframe && this.isAvailable()
  }

  async verify(payload: VerifyCommandInput): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      const result = await MiniKit.commandsAsync.verify(payload)
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error("World ID verification failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed"
      }
    }
  }

  async pay(payload: PayCommandInput): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      const result = await MiniKit.commandsAsync.pay(payload)
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error("Payment failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed"
      }
    }
  }

  async requestPermission(permission: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      const result = await MiniKit.commandsAsync.requestPermission({
        permission: permission as any
      })
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error("Permission request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Permission request failed"
      }
    }
  }

  async getPermissions(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      const result = await MiniKit.commandsAsync.getPermissions()
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error("Get permissions failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Get permissions failed"
      }
    }
  }

  // Subscribe to MiniKit events
  subscribe(event: ResponseEvent, callback: (data: any) => void): void {
    if (!this.isAvailable()) {
      console.warn("MiniKit not available for subscription")
      return
    }

    MiniKit.subscribe(event, callback)
  }

  // Unsubscribe from MiniKit events
  unsubscribe(event: ResponseEvent): void {
    if (!this.isAvailable()) {
      console.warn("MiniKit not available for unsubscription")
      return
    }

    MiniKit.unsubscribe(event)
  }
}

// Export singleton instance
export const miniKit = MiniKitService.getInstance()
