# 🎉 WorldTimeTicket - Complete Setup Guide

## ✅ What's Been Done

Your app has been completely reworked to use **NextAuth.js with World ID OAuth** instead of MiniKit. This approach is much more reliable and works in both regular browsers and World App.

### 🔄 **Major Changes Made**

1. **✅ Replaced MiniKit with NextAuth.js**
   - Removed complex MiniKit implementation
   - Added NextAuth.js with World ID OAuth provider
   - Much simpler and more reliable authentication

2. **✅ Updated App Structure**
   - Added session management with NextAuth
   - Created proper auth components
   - Added auth pages (signin, error)
   - Updated main page to use sessions

3. **✅ Environment Configuration**
   - Created `.env.example` with all required variables
   - Simplified environment setup
   - Removed complex MiniKit configuration

## 🚀 **How to Set Up Your App**

### **Step 1: Get World ID OAuth Credentials**

1. **Go to [World ID Developer Portal](https://developer.world.org)**
2. **Sign in with your World ID**
3. **Create a new app** (if you don't have one)
4. **Get your OAuth credentials**:
   - **Client ID** (starts with `client_`)
   - **Client Secret** (starts with `secret_`)

### **Step 2: Set Up Environment Variables**

Create a `.env.local` file in your project root:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# World ID OAuth Configuration
WLD_CLIENT_ID=your_world_id_client_id_here
WLD_CLIENT_SECRET=your_world_id_client_secret_here

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For production**, also set these in your Vercel dashboard:
- `NEXTAUTH_URL=https://your-domain.com`
- `NEXTAUTH_SECRET=your_production_secret`
- `WLD_CLIENT_ID=your_client_id`
- `WLD_CLIENT_SECRET=your_client_secret`

### **Step 3: Configure World ID App**

In your World ID Developer Portal:

1. **Add Callback URLs**:
   - Development: `http://localhost:3000/api/auth/callback/worldcoin`
   - Production: `https://your-domain.com/api/auth/callback/worldcoin`

2. **Set Redirect URLs**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

### **Step 4: Run Your App**

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## 🎯 **How It Works Now**

### **Authentication Flow**
1. **User clicks "Sign in with World ID"**
2. **Redirects to World ID OAuth provider**
3. **User verifies with World ID**
4. **World ID redirects back with authorization code**
5. **NextAuth exchanges code for tokens**
6. **User is authenticated and redirected to app**

### **Key Benefits**
- ✅ **Works in regular browsers** (not just World App)
- ✅ **Works in World App** (as mini app)
- ✅ **Much simpler setup** (no complex MiniKit configuration)
- ✅ **More reliable** (standard OAuth flow)
- ✅ **Better error handling** (proper error pages)
- ✅ **Session management** (automatic token refresh)

## 🔧 **Environment Variables Explained**

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXTAUTH_URL` | Your app's URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `your-secret-key` |
| `WLD_CLIENT_ID` | World ID OAuth Client ID | `client_1234567890` |
| `WLD_CLIENT_SECRET` | World ID OAuth Client Secret | `secret_1234567890` |

## 🧪 **Testing Your App**

### **Local Testing**
1. **Start your app**: `pnpm dev`
2. **Open**: `http://localhost:3000`
3. **Click "Sign in with World ID"**
4. **Complete World ID verification**
5. **You should be logged in!**

### **Production Testing**
1. **Deploy to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Test the authentication flow**
4. **Test in both regular browser and World App**

## 🆚 **Old vs New Approach**

| Aspect | Old (MiniKit) | New (NextAuth + OAuth) |
|--------|---------------|------------------------|
| **Setup** | Complex (Action ID, App ID) | Simple (Client ID, Secret) |
| **Browser Support** | World App only | All browsers + World App |
| **Reliability** | Unreliable | Very reliable |
| **Error Handling** | Basic | Comprehensive |
| **Session Management** | Manual | Automatic |
| **Configuration** | Many env vars | Few env vars |

## 🎉 **You're All Set!**

Your app now uses a much more reliable and standard authentication approach. The World ID integration will work seamlessly in both regular browsers and World App.

**Next steps:**
1. Set up your environment variables
2. Deploy to Vercel
3. Test the authentication flow
4. Enjoy your working World ID authentication! 🚀
