import {
  MiniKit,
  PayCommandInput,
  VerifyCommandInput,
} from "@worldcoin/minikit-js";

export interface PaymentPayload {
  amount: string;
  currency: string;
  recipient: string;
  description?: string;
}

export class MiniKitService {
  private static instance: MiniKitService;
  private isInitialized = false;
  private isInIframe = false;

  static getInstance(): MiniKitService {
    if (!MiniKitService.instance) {
      MiniKitService.instance = new MiniKitService();
    }
    return MiniKitService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    // Check if running in World App
    if (typeof window === "undefined") {
      console.log("MiniKit: Not in browser environment");
      return false;
    }

    try {
      // Check if we're in an iframe (World App environment)
      this.isInIframe = window.self !== window.top;
      console.log("MiniKit: In iframe:", this.isInIframe);

      // Check if MiniKit is already available
      console.log("MiniKit: isInstalled() before wait:", MiniKit.isInstalled());

      // Wait for MiniKit to be available
      let attempts = 0;
      while (!MiniKit.isInstalled() && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`MiniKit: Waiting... attempt ${attempts}/50`);
        }
      }

      console.log("MiniKit: isInstalled() after wait:", MiniKit.isInstalled());
      console.log("MiniKit: Total attempts:", attempts);

      if (!MiniKit.isInstalled()) {
        console.warn("MiniKit not available - running outside World App");
        return false;
      }

      this.isInitialized = true;
      console.log("MiniKit: Successfully initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error);
      return false;
    }
  }

  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      this.isInitialized &&
      MiniKit.isInstalled()
    );
  }

  isInWorldApp(): boolean {
    return typeof window !== "undefined" && window.self !== window.top;
  }

  async verify(payload: VerifyCommandInput): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available");
    }

    try {
      const result = await MiniKit.commandsAsync.verify(payload);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("Verification failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  async requestPermission(permission: any): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await MiniKit.commandsAsync.requestPermission(permission);
      // library return shapes vary; check finalPayload.granted or granted
      const anyRes: any = result;
      return (anyRes.finalPayload?.granted ?? anyRes.granted) || false;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  }

  async getPermissions(): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const result = await MiniKit.commandsAsync.getPermissions();
      const anyRes: any = result;
      return anyRes.finalPayload?.permissions ?? anyRes.permissions ?? [];
    } catch (error) {
      console.error("Failed to get permissions:", error);
      return [];
    }
  }

  subscribe(event: string, callback: (data: any) => void): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      // event type from library may be a specific enum; allow any to avoid type mismatch
      MiniKit.subscribe(event as any, callback);
    } catch (error) {
      console.error("Failed to subscribe to event:", error);
    }
  }

  unsubscribe(event: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      MiniKit.unsubscribe(event as any);
    } catch (error) {
      console.error("Failed to unsubscribe from event:", error);
    }
  }

  async pay(payload: PayCommandInput): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error("MiniKit not available");
    }

    try {
      const result = await MiniKit.commandsAsync.pay(payload);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("Payment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }
}

// Export singleton instance
export const miniKit = MiniKitService.getInstance();
