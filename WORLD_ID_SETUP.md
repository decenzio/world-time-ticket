# World ID Authentication Setup Guide

This guide will help you set up World ID authentication for your WorldTimeTicket mini app.

## Prerequisites

1. A World ID Developer Portal account
2. Your mini app deployed and accessible via HTTPS
3. Node.js and pnpm installed

## Step 1: Create a World ID App

1. Go to [World ID Developer Portal](https://developer.world.org)
2. Sign in with your World ID
3. Click "Create App" or "New App"
4. Fill in the app details:
   - **App Name**: WorldTimeTicket
   - **Description**: Time Marketplace - Connect with people and sell your time
   - **App URL**: Your deployed app URL (e.g., `https://your-app.vercel.app`)

## Step 2: Create an Incognito Action

1. In your app dashboard, go to "Actions" section
2. Click "Create Action" or "New Action"
3. Choose "Incognito Action"
4. Fill in the action details:
   - **Action Name**: verify-human
   - **Description**: Verify human identity for marketplace access
   - **Max Verifications**: 1 (one verification per user)
   - **Verification Level**: Orb (recommended for marketplace)

## Step 3: Configure Mini App Settings

1. In your app dashboard, go to "Mini Apps" section
2. Click "Create Mini App" or "New Mini App"
3. Upload your `mini-app.json` file or configure manually:
   ```json
   {
     "name": "WorldTimeTicket",
     "description": "Time Marketplace - Connect with people and sell your time",
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
       },
       "notifications": {
         "enabled": true
       }
     }
   }
   ```

## Step 4: Get Your App ID

1. After creating your app, you'll get an App ID in the format `app_xxxxxxxxxxxxxxxx`
2. Copy this App ID - you'll need it for verification

## Step 5: Update Your Code (Already Done)

The code has already been updated to use the correct World ID authentication:

- ✅ Uses `verify` command instead of deprecated `worldIdAuth`
- ✅ Proper verification level handling
- ✅ Correct payload structure
- ✅ Error handling

## Step 6: Test the Authentication

### Development Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Open the app in your browser
3. Enable "Development Mode" to test without World App
4. Click "Continue as Test User" to bypass authentication

### Production Testing

1. Deploy your app to Vercel or another hosting service
2. Update your World ID app URL in the Developer Portal
3. Open World App on your mobile device
4. Navigate to Mini Apps
5. Find and open your WorldTimeTicket app
6. Test the "Verify with World ID" button

## Step 7: Backend Verification (Optional but Recommended)

For production use, you should verify the World ID proofs on your backend:

1. Install the World ID verification library:
   ```bash
   pnpm add @worldcoin/idkit
   ```

2. Create an API route to verify proofs:
   ```typescript
   // app/api/verify-proof/route.ts
   import { verifyCloudProof } from '@worldcoin/idkit'
   
   export async function POST(request: Request) {
     const { proof, action, signal } = await request.json()
     
     try {
       const result = await verifyCloudProof(proof, process.env.APP_ID!, action, signal)
       
       if (result.success) {
         // User is verified, create session or update database
         return Response.json({ success: true, user: result })
       } else {
         return Response.json({ success: false, error: result.error }, { status: 400 })
       }
     } catch (error) {
       return Response.json({ success: false, error: 'Verification failed' }, { status: 500 })
     }
   }
   ```

3. Update your frontend to send proofs to backend:
   ```typescript
   // After successful verification
   const backendResponse = await fetch('/api/verify-proof', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       proof: response.finalPayload,
       action: 'verify-human',
       signal: 'timeslot-marketplace-auth'
     })
   })
   ```

## Troubleshooting

### Common Issues

1. **"MiniKit not available"**
   - Ensure the app is opened in World App, not a regular browser
   - Check that the iframe detection is working
   - Verify the app is properly deployed and accessible

2. **"Verification failed"**
   - Check that the action ID matches what you created in the Developer Portal
   - Ensure the app is running in World App
   - Verify the verification level is correct

3. **"Action not found"**
   - Make sure you created the incognito action in the Developer Portal
   - Check that the action name matches exactly: "verify-human"
   - Ensure the action is published and not in draft mode

### Debug Mode

Enable debug logging by adding this to your browser console:
```javascript
localStorage.setItem('debug', 'minikit:*')
```

## Next Steps

1. Test the authentication flow thoroughly
2. Implement backend verification for production
3. Add proper error handling and user feedback
4. Test with different verification levels (orb vs device)
5. Deploy and test in the World App

## Support

- [World ID Documentation](https://docs.world.org/world-id)
- [Mini Apps Documentation](https://docs.world.org/mini-apps)
- [World Developer Portal](https://developer.world.org)
- [World ID Discord](https://discord.gg/worldid)
