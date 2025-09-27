#!/usr/bin/env node

/**
 * Test script to verify World ID authentication setup
 * Run with: node scripts/test-world-id.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🔍 World ID Authentication Setup Test\n')

// Test 1: Check mini-app.json
console.log('1. Checking mini-app.json...')
try {
  const miniAppConfig = JSON.parse(readFileSync(join(projectRoot, 'mini-app.json'), 'utf8'))
  
  const requiredPermissions = ['world_id_auth', 'pay', 'notifications']
  const hasRequiredPermissions = requiredPermissions.every(perm => 
    miniAppConfig.permissions?.includes(perm)
  )
  
  if (hasRequiredPermissions) {
    console.log('   ✅ Required permissions found')
  } else {
    console.log('   ❌ Missing required permissions')
    console.log('   Required:', requiredPermissions)
    console.log('   Found:', miniAppConfig.permissions)
  }
  
  if (miniAppConfig.features?.world_id_auth?.verification_levels?.includes('orb')) {
    console.log('   ✅ Orb verification level configured')
  } else {
    console.log('   ❌ Orb verification level not configured')
  }
  
} catch (error) {
  console.log('   ❌ Error reading mini-app.json:', error.message)
}

// Test 2: Check package.json for minikit
console.log('\n2. Checking @worldcoin/minikit-js dependency...')
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
  
  if (packageJson.dependencies?.['@worldcoin/minikit-js']) {
    console.log('   ✅ @worldcoin/minikit-js found')
    console.log(`   Version: ${packageJson.dependencies['@worldcoin/minikit-js']}`)
  } else {
    console.log('   ❌ @worldcoin/minikit-js not found in dependencies')
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message)
}

// Test 3: Check if code uses verify command
console.log('\n3. Checking code implementation...')
try {
  const minikitCode = readFileSync(join(projectRoot, 'lib/minikit.ts'), 'utf8')
  
  if (minikitCode.includes('commandsAsync.verify')) {
    console.log('   ✅ Using correct verify command')
  } else {
    console.log('   ❌ Not using verify command (may be using deprecated worldIdAuth)')
  }
  
  if (minikitCode.includes('VerificationLevel')) {
    console.log('   ✅ VerificationLevel imported')
  } else {
    console.log('   ❌ VerificationLevel not imported')
  }
  
} catch (error) {
  console.log('   ❌ Error reading minikit.ts:', error.message)
}

// Test 4: Check main page implementation
console.log('\n4. Checking main page implementation...')
try {
  const pageCode = readFileSync(join(projectRoot, 'app/page.tsx'), 'utf8')
  
  if (pageCode.includes('miniKit.verify')) {
    console.log('   ✅ Main page uses verify command')
  } else {
    console.log('   ❌ Main page not using verify command')
  }
  
  if (pageCode.includes('VerificationLevel.Orb')) {
    console.log('   ✅ Main page uses proper verification level')
  } else {
    console.log('   ❌ Main page not using proper verification level')
  }
  
} catch (error) {
  console.log('   ❌ Error reading page.tsx:', error.message)
}

console.log('\n📋 Next Steps:')
console.log('1. Create a World ID app at https://developer.world.org')
console.log('2. Create an incognito action named "verify-human"')
console.log('3. Deploy your app to Vercel or another hosting service')
console.log('4. Update your World ID app URL in the Developer Portal')
console.log('5. Test in World App on your mobile device')
console.log('\n📖 See WORLD_ID_SETUP.md for detailed instructions')
