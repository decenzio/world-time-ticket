# WorldTimeTicket - World Mini App

A professional time marketplace built as a World Mini App with World ID authentication and secure payments.

## Features

- ✅ **World ID Authentication** - Verify users with World ID orb verification
- ✅ **Secure Payments** - Process payments using World ID's payment system
- ✅ **Booking System** - Integrate with Calendly for time slot management
- ✅ **Escrow Protection** - Smart contract-based escrow for secure transactions
- ✅ **Notifications** - Send booking confirmations and reminders
- ✅ **Mobile Optimized** - Designed for mobile-first experience in World App

## World Mini App Integration

This app is fully integrated with the World ecosystem:

### Authentication
- Uses `@worldcoin/minikit-js` for World ID authentication
- Supports both orb and device verification levels
- Automatically detects if running in World App vs browser

### Payments
- Integrated with World ID payment system
- Supports WLD, USDC, and USDT tokens
- Proper decimal handling for different token types

### Notifications
- Request and manage notification permissions
- Send booking confirmations and reminders
- Integrated with World App notification system

### Mobile Optimization
- Responsive design optimized for mobile iframe
- Touch-friendly interface
- Proper viewport and scaling settings

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the database setup scripts:
```bash
pnpm run check-db
```

### 4. Development
```bash
pnpm dev
```

## Deployment as World Mini App

### 1. Build the App
```bash
pnpm build
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Configure World Mini App
1. Go to [World Developer Portal](https://developer.world.org)
2. Create a new mini app
3. Set the app URL to your deployed Vercel URL
4. Upload the `mini-app.json` manifest
5. Configure permissions for:
   - `world_id_auth`
   - `pay`
   - `notifications`

### 4. Test in World App
1. Open World App on your mobile device
2. Navigate to Mini Apps
3. Find and open WorldTimeTicket
4. Test authentication and booking flow

## Mini App Manifest

The `mini-app.json` file contains the configuration for the World Mini App:

```json
{
  "name": "WorldTimeTicket",
  "description": "Professional Time Marketplace - Book verified experts and sell your time",
  "version": "1.0.0",
  "icon": "/placeholder-logo.svg",
  "start_url": "/",
  "permissions": [
    "world_id_auth",
    "pay", 
    "notifications"
  ],
  "features": {
    "world_id_auth": {
      "verification_levels": ["orb", "device"]
    },
    "pay": {
      "supported_tokens": ["WLD", "USDC", "USDT"]
    }
  }
}
```

## Key Files

- `lib/minikit.ts` - World Mini App SDK integration
- `lib/payment-utils.ts` - Payment processing with World ID
- `lib/notification-service.ts` - Notification management
- `mini-app.json` - Mini app manifest
- `app/page.tsx` - Main authentication and landing page

## Testing

### Development Mode
The app includes a development mode that allows testing without World App:
1. Click "Enable Development Mode" on the login page
2. Use "Continue as Test User" to bypass authentication
3. Test the full booking and payment flow

### Production Testing
1. Deploy to Vercel
2. Open in World App
3. Test World ID authentication
4. Test payment flow with real tokens
5. Test notification permissions

## Troubleshooting

### MiniKit Not Available
- Ensure the app is opened in World App, not a regular browser
- Check that the iframe detection is working
- Verify the app is properly deployed and accessible

### Authentication Issues
- Check that the app is running in World App
- Verify the World ID action and signal parameters
- Ensure proper error handling for failed verifications

### Payment Issues
- Verify token amounts are properly converted to decimals
- Check that the recipient address is valid
- Ensure proper error handling for failed payments

## Support

For issues with World Mini App integration, refer to:
- [World Mini Apps Documentation](https://docs.world.org/mini-apps)
- [MiniKit SDK Reference](https://docs.world.org/mini-apps/reference/sdk)
- [World Developer Portal](https://developer.world.org)
