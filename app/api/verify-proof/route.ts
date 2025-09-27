import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { proof, action, signal } = await request.json()
    
    // Validate required fields
    if (!proof || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: proof and action' },
        { status: 400 }
      )
    }

    // Get app ID from environment
    const appId = process.env.APP_ID
    if (!appId) {
      console.error('APP_ID environment variable is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify the proof using World ID API directly
    const verificationResponse = await fetch(
      `https://developer.world.org/api/v2/verify/${appId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          action,
          signal: signal || '',
        }),
      }
    )

    const result = await verificationResponse.json()
    
    if (verificationResponse.ok && result.success) {
      // User is verified, you can create session or update database here
      console.log('User verified successfully:', {
        nullifier_hash: result.nullifier_hash,
        merkle_root: result.merkle_root,
        action,
        signal
      })
      
      return NextResponse.json({ 
        success: true, 
        user: {
          nullifier_hash: result.nullifier_hash,
          merkle_root: result.merkle_root,
          action,
          signal
        }
      })
    } else {
      console.error('Verification failed:', result.error || result)
      return NextResponse.json(
        { success: false, error: result.error || 'Verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
