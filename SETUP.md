# World Time Ticket - Setup Guide

## Issues Fixed

The payment button was not working due to several critical issues that have now been resolved:

### 1. **Missing MiniKit App ID Configuration**
- **Problem**: The app was missing the required `NEXT_PUBLIC_MINIKIT_APP_ID` environment variable
- **Solution**: Added proper environment variable validation and error handling

### 2. **Incorrect Transaction Structure**
- **Problem**: The transaction structure didn't match World App MiniKit requirements
- **Solution**: Fixed the `createBookingWithPermit2` function call to use proper struct format

### 3. **Missing Permit2 ABI**
- **Problem**: The transaction was trying to use Permit2 but the ABI was not properly defined
- **Solution**: Added complete Permit2 ABI definition

### 4. **Poor Error Handling**
- **Problem**: Transaction failures were not properly logged or displayed
- **Solution**: Added comprehensive error handling and debugging

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# MiniKit Configuration (REQUIRED)
NEXT_PUBLIC_MINIKIT_APP_ID=your_app_id_here

# Contract Addresses (World Chain)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xA22904796F46f016017E4efad6e891C1106Fb44F
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x0Ddfaa53cED6490ee2AceEA07ace6E06Cf07967d
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=

# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
NEXT_PUBLIC_CHAIN_ID=480

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Getting Your MiniKit App ID

1. Go to the [World App Developer Portal](https://developer.worldcoin.org/)
2. Create a new mini app or select an existing one
3. Navigate to **Configuration → Advanced**
4. Add the following tokens to your supported tokens list:
   - USDC: `0x0Ddfaa53cED6490ee2AceEA07ace6E06Cf07967d`
   - WLD: (add your WLD token address if you have one)
5. Copy your App ID and set it as `NEXT_PUBLIC_MINIKIT_APP_ID`

## Key Changes Made

### 1. Fixed Transaction Structure
```typescript
// Before (incorrect)
args: [
  [tokenAddress, amountStr],
  permit2[0].nonce,
  permit2[0].deadline,
],
[ESCROW_CONTRACT_ADDRESS, amountStr],

// After (correct)
args: [
  {
    permitted: {
      token: tokenAddress,
      amount: amountStr,
    },
    nonce: permit2[0].nonce,
    deadline: permit2[0].deadline,
  },
  {
    to: ESCROW_CONTRACT_ADDRESS,
    requestedAmount: amountStr,
  },
  // ... other args
]
```

### 2. Added Permit2 ABI
```typescript
export const PERMIT2_ABI = [
  {
    "inputs": [
      // ... complete Permit2 ABI structure
    ],
    "name": "permitTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
```

### 3. Enhanced Error Handling
- Added comprehensive console logging
- Better error messages for users
- Proper validation of required environment variables

## Testing the Fix

1. **Set up environment variables** as described above
2. **Run the development server**: `npm run dev`
3. **Open in World App** (not regular browser)
4. **Navigate to a payment page** and try to make a payment
5. **Check browser console** for detailed logs

## Debugging

If the payment still doesn't work:

1. **Check browser console** for error messages
2. **Verify MiniKit is installed**: Look for "MiniKit installed successfully" in console
3. **Check transaction logs**: Look for "Sending transaction with payload" in console
4. **Verify app ID**: Ensure `NEXT_PUBLIC_MINIKIT_APP_ID` is set correctly
5. **Check token configuration**: Ensure your app supports USDC token in Developer Portal

## Common Issues

### "MiniKit not available"
- **Cause**: App not running in World App or missing app ID
- **Solution**: Open in World App and ensure app ID is configured

### "Transaction failed: simulation_failed"
- **Cause**: Contract call parameters are incorrect
- **Solution**: Check the transaction structure and ensure all parameters are correct

### "Missing buyer wallet address"
- **Cause**: MiniKit not properly initialized
- **Solution**: Ensure app is running in World App with proper configuration

## Next Steps

1. Configure your environment variables
2. Test the payment flow in World App
3. Monitor console logs for any remaining issues
4. Deploy to production with proper environment configuration

The payment button should now work correctly when properly configured and running in World App!
