#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Generate a random secret
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, envPath + '.backup');
}

// Create .env.local with default values
const envContent = `# NextAuth Configuration
NEXTAUTH_SECRET=${generateSecret()}
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
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env.local with default values');
console.log('');
console.log('📝 Next steps:');
console.log('1. Get your World ID App ID from https://developer.worldcoin.org/');
console.log('2. Replace "your-world-id-app-id-here" with your actual App ID');
console.log('3. If using Supabase, add your database credentials');
console.log('4. Restart your development server: npm run dev');
console.log('');
console.log('🔗 For detailed setup instructions, see ENVIRONMENT_SETUP.md');
