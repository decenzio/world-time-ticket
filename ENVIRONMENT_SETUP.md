# Environment Setup Guide

This guide will help you set up the required environment variables for the WorldTimeTicket Mini App.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# World ID Configuration
NEXT_PUBLIC_WORLD_ID_ACTION_ID=verify-human
NEXT_PUBLIC_WORLD_ID_APP_ID=your-world-id-app-id-here

# Database Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# App Configuration
NODE_ENV=development
```

## How to Get These Values

### 1. NEXTAUTH_SECRET
Generate a random secret key:
```bash
openssl rand -base64 32
```
Or use an online generator: https://generate-secret.vercel.app/32

### 2. NEXTAUTH_URL
- For development: `http://localhost:3000`
- For production: Your deployed app URL (e.g., `https://your-app.vercel.app`)

### 3. World ID Configuration

#### NEXT_PUBLIC_WORLD_ID_ACTION_ID
This is a custom identifier for your app's verification action. You can use:
- `verify-human` (default)
- `world-time-ticket-verification`
- Any custom string that identifies your app

#### NEXT_PUBLIC_WORLD_ID_APP_ID
1. Go to [World ID Developer Portal](https://developer.worldcoin.org/)
2. Create a new app or use an existing one
3. Copy the App ID from your app settings

### 4. Supabase Configuration (Optional)
If you're using Supabase for database:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy the Project URL and anon key
5. Copy the service_role key (keep this secret!)

## Quick Setup

1. Copy the example above to `.env.local`
2. Replace the placeholder values with your actual values
3. Restart your development server: `npm run dev`

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Keep service role keys secure and never expose them to the client
- Use different secrets for development and production environments

## Troubleshooting

### Common Issues:

1. **"NEXTAUTH_SECRET is not defined"**
   - Make sure you have `NEXTAUTH_SECRET` in your `.env.local` file
   - Restart your development server after adding it

2. **"World ID verification failed"**
   - Check that `NEXT_PUBLIC_WORLD_ID_ACTION_ID` is set
   - Verify you're testing in World App, not a regular browser
   - Check the browser console for detailed error messages

3. **"MiniKit not available"**
   - Make sure you're opening the app in World App
   - Check that the app is properly configured in your World ID app settings

### Testing the Setup:

1. Visit `/debug` to see the current configuration status
2. Check the browser console for any error messages
3. Try the authentication flow in World App
