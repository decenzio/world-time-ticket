// MiniKit SDK utilities for World App integration
declare global {
  interface Window {
    MiniKit?: {
      isInstalled: () => boolean
      install: () => Promise<void>
      commands: {
        worldIdAuth: (payload: any) => Promise<any>
        pay: (payload: any) => Promise<any>
        walletAuth: (payload: any) => Promise<any>
        sendTransaction: (payload: any) => Promise<any>
      }
    }
  }
}

export interface WorldIDAuthPayload {
  action: string
  signal?: string
  verification_level?: "orb" | "device"
}

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

  static getInstance(): MiniKitService {
    if (!MiniKitService.instance) {
      MiniKitService.instance = new MiniKitService()
    }
    return MiniKitService.instance
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    // Check if running in World App
    if (typeof window === "undefined") return false

    try {
      // Wait for MiniKit to be available
      let attempts = 0
      while (!window.MiniKit && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }

      if (!window.MiniKit) {
        console.warn("MiniKit not available - running outside World App")
        return false
      }

      this.isInitialized = window.MiniKit.isInstalled()
      return this.isInitialized
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error)
      return false
    }
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.MiniKit && this.isInitialized
  }

  async worldIdAuth(payload: WorldIDAuthPayload): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      return await window.MiniKit!.commands.worldIdAuth(payload)
    } catch (error) {
      console.error("World ID auth failed:", error)
      throw error
    }
  }

  async pay(payload: PaymentPayload): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      return await window.MiniKit!.commands.pay(payload)
    } catch (error) {
      console.error("Payment failed:", error)
      throw error
    }
  }

  async walletAuth(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      return await window.MiniKit!.commands.walletAuth({})
    } catch (error) {
      console.error("Wallet auth failed:", error)
      throw error
    }
  }

  async sendTransaction(payload: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available")
    }

    try {
      return await window.MiniKit!.commands.sendTransaction(payload)
    } catch (error) {
      console.error("Send transaction failed:", error)
      throw error
    }
  }
}

// Export singleton instance
export const miniKit = MiniKitService.getInstance()
