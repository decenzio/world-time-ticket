// Notification service for handling app notifications
export class NotificationService {
  private static instance: NotificationService;
  private permissionGranted = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permissionGranted = permission === 'granted';
    return this.permissionGranted;
  }

  isEnabled(): boolean {
    return this.permissionGranted && 'Notification' in window;
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled');
      return;
    }

    try {
      new Notification(title, {
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendBookingConfirmation(bookingId: string, personName: string): Promise<void> {
    await this.sendNotification(
      'Booking Confirmed!',
      {
        body: `Your session with ${personName} has been confirmed.`,
        tag: `booking-${bookingId}`,
      }
    );
  }

  async sendPaymentConfirmation(amount: string, currency: string): Promise<void> {
    await this.sendNotification(
      'Payment Successful!',
      {
        body: `Payment of ${amount} ${currency} has been processed.`,
        tag: 'payment-success',
      }
    );
  }

  async sendSessionReminder(personName: string, timeUntil: string): Promise<void> {
    await this.sendNotification(
      'Session Reminder',
      {
        body: `Your session with ${personName} starts in ${timeUntil}.`,
        tag: 'session-reminder',
      }
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
