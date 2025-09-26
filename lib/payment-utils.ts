import { miniKit } from "@/lib/minikit"

export interface PaymentRequest {
  reference: string
  to: string
  amount: number
  currency: "WLD" | "USDC"
  description: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

export class PaymentService {
  /**
   * Process payment through MiniKit Pay
   */
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      if (!miniKit.isAvailable()) {
        throw new Error("World App is required for payments")
      }

      const response = await miniKit.pay({
        reference: request.reference,
        to: request.to,
        tokens: [
          {
            symbol: request.currency,
            token_amount: request.amount.toString(),
          },
        ],
        description: request.description,
      })

      if (response.success) {
        return {
          success: true,
          transactionId: response.transaction_id,
        }
      } else {
        return {
          success: false,
          error: response.error_code || "Payment failed",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown payment error",
      }
    }
  }

  /**
   * Calculate total amount including platform fee
   */
  static calculateTotal(baseAmount: number, feePercentage = 2.5): number {
    return baseAmount * (1 + feePercentage / 100)
  }

  /**
   * Format currency amount for display
   */
  static formatAmount(amount: number, currency: string): string {
    return `$${amount.toFixed(2)} ${currency}`
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000 // Max $10k per transaction
  }
}
