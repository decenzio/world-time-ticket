# World ID Setup Guide

## 🚨 Current Issues

Based on your debug output:
- ❌ **APP_ID: Not set** - You need your App ID from World ID Developer Portal
- ❌ **Action ID format wrong** - `wttlogin` should be `action_0x...`
- ❌ **Not running in World App** - Make sure you open it in World App

## Step 1: Get Your World ID Credentials

### 1.1 Go to World ID Developer Portal
1. Visit [https://developer.world.org](https://developer.world.org)
2. Sign in with your World ID
3. If you don't have an app yet, click "Create App"

### 1.2 Get Your App ID
1. In your app dashboard, find the **App ID**
2. It looks like: `app_1234567890abcdef1234567890abcdef12345678`
3. Copy this value

### 1.3 Create an Incognito Action
1. Go to **"Actions"** section in your app dashboard
2. Click **"Create Action"** or **"New Action"**
3. Choose **"Incognito Action"**
4. Fill in:
   - **Action Name**: `verify-human` (or any name)
   - **Description**: `Verify human identity for marketplace access`
   - **Max Verifications**: `1`
   - **Verification Level**: `Orb`
5. Click **"Create"**
6. Copy the **Action ID** - it should look like: `action_0x1234567890abcdef1234567890abcdef12345678`

## Step 2: Set Environment Variables

### 2.1 In Vercel Dashboard
1. Go to your project settings
2. Go to **"Environment Variables"**
3. Add these variables:

```
APP_ID = app_your_actual_app_id_here
NEXT_PUBLIC_WORLD_ID_ACTION_ID = action_your_actual_action_id_here
```

**Replace with your actual values!**

### 2.2 Redeploy
1. After adding environment variables, redeploy your app
2. Or trigger a new deployment

## Step 3: Test in World App

### 3.1 Open in World App
1. Open World App on your iPhone
2. Go to Mini Apps
3. Find your app and open it
4. Check the debug panel

### 3.2 What You Should See
After fixing the environment variables:
- ✅ **APP_ID: Set**
- ✅ **NEXT_PUBLIC_WORLD_ID_ACTION_ID: Set**
- ✅ **Action ID format valid: true**
- ✅ **MiniKit available: true**

## Common Mistakes

❌ **Wrong Action ID format**: `wttlogin` → Should be `action_0x...`
❌ **Missing App ID**: You need both APP_ID and Action ID
❌ **Not in World App**: Make sure you open the app inside World App, not in a regular browser

## Need Help?

If you're still having issues:
1. Check the debug panel for specific error messages
2. Make sure you're opening the app in World App (not regular browser)
3. Verify your environment variables are set correctly in Vercel
4. Ensure your Action ID starts with `action_` and is long enough
