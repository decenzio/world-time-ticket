import { miniKit } from "@/lib/minikit"

export interface NotificationRequest {
  title: string
  body: string
  data?: Record<string, any>
  imageUrl?: string
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
}

export class NotificationService {
  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if (!miniKit.isAvailable()) {
        console.warn("MiniKit not available for notifications")
        return false
      }

      const response = await miniKit.requestPermission("notifications")
      return response.success
    } catch (error) {
      console.error("Failed to request notification permission:", error)
      return false
    }
  }

  /**
   * Check if notifications are enabled
   */
  static async hasPermission(): Promise<boolean> {
    try {
      if (!miniKit.isAvailable()) {
        return false
      }

      const response = await miniKit.getPermissions()
      return response.success && response.permissions?.notifications === true
    } catch (error) {
      console.error("Failed to check notification permissions:", error)
      return false
    }
  }

  /**
   * Send a notification to the user
   */
  static async sendNotification(request: NotificationRequest): Promise<NotificationResult> {
    try {
      if (!miniKit.isAvailable()) {
        return {
          success: false,
          error: "World App is required for notifications"
        }
      }

      // Check if we have permission
      const hasPermission = await this.hasPermission()
      if (!hasPermission) {
        const granted = await this.requestPermission()
        if (!granted) {
          return {
            success: false,
            error: "Notification permission denied"
          }
        }
      }

      // In a real implementation, you would send this to your backend
      // which would then use the World ID notification API
      console.log("Notification would be sent:", request)
      
      return {
        success: true,
        notificationId: `notif_${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send notification"
      }
    }
  }

  /**
   * Send booking confirmation notification
   */
  static async sendBookingConfirmation(bookingId: string, sellerName: string, timeSlot: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: "Booking Confirmed! 🎉",
      body: `Your session with ${sellerName} is confirmed for ${timeSlot}`,
      data: {
        type: "booking_confirmation",
        bookingId,
        sellerName,
        timeSlot
      }
    })
  }

  /**
   * Send payment confirmation notification
   */
  static async sendPaymentConfirmation(amount: string, currency: string, bookingId: string): Promise<NotificationResult> {
    return this.sendNotification({
      title: "Payment Successful! 💰",
      body: `Payment of ${amount} ${currency} completed for booking ${bookingId}`,
      data: {
        type: "payment_confirmation",
        amount,
        currency,
        bookingId
      }
    })
  }

  /**
   * Send session reminder notification
   */
  static async sendSessionReminder(sellerName: string, timeSlot: string, minutesUntil: number): Promise<NotificationResult> {
    return this.sendNotification({
      title: "Session Reminder ⏰",
      body: `Your session with ${sellerName} starts in ${minutesUntil} minutes`,
      data: {
        type: "session_reminder",
        sellerName,
        timeSlot,
        minutesUntil
      }
    })
  }
}
