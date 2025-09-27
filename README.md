# WorldTimeTicket

A marketplace for booking time with verified humans, built as a World App mini app.

## Features

- **Wallet Authentication**: Secure login using World ID and SIWE (Sign-In with Ethereum)
- **Verified Humans**: Connect with orb-verified or device-verified users
- **Time Booking**: Schedule and manage time slots with other users
- **Marketplace**: Browse and discover available time slots
- **Payment Integration**: Built-in payment processing for time bookings

## Authentication

This app uses **Wallet Authentication** with World ID, which provides:

- **SIWE (Sign-In with Ethereum)**: Secure authentication using wallet signatures
- **User Information**: Access to wallet address, username, profile picture, and permissions
- **Verification Levels**: Support for both orb and device verification
- **World App Integration**: Native integration with World App for seamless user experience

### How Authentication Works

1. User opens the app in World App
2. App requests wallet authentication with SIWE
3. User signs a message with their wallet
4. App verifies the signature and creates a session
5. User gains access to the marketplace with their wallet identity

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with custom wallet provider
- **Database**: Supabase
- **World ID**: @worldcoin/idkit for IDKit integration
- **Mini App**: @worldcoin/minikit-js for World App integration
- **UI**: Radix UI with Tailwind CSS
- **TypeScript**: Full type safety

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

**Note**: You don't need `NEXT_PUBLIC_WORLD_ID_APP_ID` anymore since we're using MiniKit directly for wallet authentication in World App.

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up your environment variables
4. Run the development server: `pnpm dev`
5. Open the app in World App for full functionality

## API Endpoints

- `GET /api/nonce` - Generate nonce for SIWE authentication
- `POST /api/complete-siwe` - Verify SIWE message and create session
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication routes

## Components

- `WalletAuth` - Main authentication component using IDKit
- `AuthButton` - Sign in/out button with user info display
- `WorldIDAuth` - Legacy World ID verification component

## Development

The app is built with modern React patterns and TypeScript for type safety. The authentication system is designed to work seamlessly within World App while providing a secure and user-friendly experience.