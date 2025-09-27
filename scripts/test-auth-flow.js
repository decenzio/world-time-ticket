// Simple test script to debug authentication flow
// Run this in the browser console to check MiniKit availability

console.log('=== WorldTimeTicket Auth Debug ===');
console.log('1. MiniKit installed:', typeof MiniKit !== 'undefined' && MiniKit.isInstalled());
console.log('2. In iframe (World App):', window.self !== window.top);
console.log('3. User agent:', navigator.userAgent);
console.log('4. Current URL:', window.location.href);

if (typeof MiniKit !== 'undefined') {
  console.log('5. MiniKit object:', MiniKit);
  console.log('6. MiniKit commands available:', !!MiniKit.commandsAsync);
  console.log('7. MiniKit walletAuth available:', !!MiniKit.commandsAsync?.walletAuth);
} else {
  console.log('5. MiniKit not available');
}

// Check NextAuth session
if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
  console.log('8. Next.js app detected');
} else {
  console.log('8. Next.js app not detected');
}

console.log('=== End Debug ===');
