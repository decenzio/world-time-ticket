#!/usr/bin/env node

/**
 * Debug Authentication Script
 * 
 * This script helps debug authentication issues by testing each step
 * of the authentication flow independently.
 */

import { MiniKit } from "@worldcoin/minikit-js"

console.log('🔍 WorldTimeTicket Authentication Debug Script')
console.log('==============================================')

// Test 1: Check if MiniKit is available
console.log('\n1. Testing MiniKit availability...')
try {
  const isInstalled = MiniKit.isInstalled()
  console.log(`   ✅ MiniKit.isInstalled(): ${isInstalled}`)
} catch (error) {
  console.log(`   ❌ MiniKit.isInstalled() failed: ${error.message}`)
}

// Test 2: Check MiniKit methods
console.log('\n2. Testing MiniKit methods...')
try {
  console.log(`   ✅ MiniKit.install: ${typeof MiniKit.install}`)
  console.log(`   ✅ MiniKit.commandsAsync: ${typeof MiniKit.commandsAsync}`)
  console.log(`   ✅ MiniKit.commandsAsync.walletAuth: ${typeof MiniKit.commandsAsync?.walletAuth}`)
} catch (error) {
  console.log(`   ❌ MiniKit methods check failed: ${error.message}`)
}

// Test 3: Test API endpoints
console.log('\n3. Testing API endpoints...')

// Test nonce endpoint
try {
  const nonceResponse = await fetch('http://localhost:3000/api/nonce')
  if (nonceResponse.ok) {
    const nonceData = await nonceResponse.json()
    console.log(`   ✅ /api/nonce: ${nonceResponse.status} - ${JSON.stringify(nonceData)}`)
  } else {
    console.log(`   ❌ /api/nonce: ${nonceResponse.status} ${nonceResponse.statusText}`)
  }
} catch (error) {
  console.log(`   ❌ /api/nonce failed: ${error.message}`)
}

// Test NextAuth endpoint
try {
  const authResponse = await fetch('http://localhost:3000/api/auth/providers')
  if (authResponse.ok) {
    const authData = await authResponse.json()
    console.log(`   ✅ /api/auth/providers: ${authResponse.status} - ${JSON.stringify(authData)}`)
  } else {
    console.log(`   ❌ /api/auth/providers: ${authResponse.status} ${authResponse.statusText}`)
  }
} catch (error) {
  console.log(`   ❌ /api/auth/providers failed: ${error.message}`)
}

console.log('\n4. Environment check...')
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`)
console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`)

console.log('\n5. Next steps:')
console.log('   - Make sure the app is running: pnpm dev')
console.log('   - Open the app in World App (not regular browser)')
console.log('   - Check browser console for detailed logs')
console.log('   - Use the "Test MiniKit" button in the app')
console.log('   - Look for error messages in the debug info section')

console.log('\n✨ Debug script complete!')
