import {NextRequest, NextResponse} from "next/server"
import {supabaseAdmin} from "@/lib/database"
import {profileService} from "@/lib/services"

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        ok: false,
        error: "Service role key missing. Set SUPABASE_SERVICE_ROLE_KEY in .env.local",
      }, { status: 500 })
    }

    const { walletAddress, username, profilePictureUrl } = await req.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ ok: false, error: "walletAddress is required" }, { status: 400 })
    }

    const normalizedAddress = (walletAddress as string).toLowerCase()
    const pseudoEmail = `wallet-${normalizedAddress}@wallet.worldapp`

    // Try to create an auth user tied to this wallet (idempotent by email)
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: pseudoEmail,
      email_confirm: true,
      user_metadata: {
        walletAddress: normalizedAddress,
        username: username || null,
        avatar_url: profilePictureUrl || null,
      },
    })

    let userId: string | null = null

    if (createError) {
      // Likely already exists. Look up the profile by email to fetch the UUID
      const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', pseudoEmail)
        .maybeSingle()

      if (profileError || !existingProfile) {
        return NextResponse.json({ ok: false, error: createError.message }, { status: 500 })
      }

      userId = existingProfile.id
    } else {
      userId = createData.user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Failed to resolve user id" }, { status: 500 })
    }

    // Update profile name/avatar for convenience using the service layer
    // Retry a few times in case the trigger hasn't created the profile yet
    let updateResult = null
    let retries = 3
    
    while (retries > 0) {
      updateResult = await profileService.updateProfile(userId, {
        full_name: username || null,
        avatar_url: profilePictureUrl || null,
      })
      
      if (updateResult.success) {
        break
      }
      
      // If it's a "not found" error, wait and retry
      if (updateResult.error?.message?.includes('Profile') && updateResult.error?.message?.includes('not found')) {
        await new Promise(resolve => setTimeout(resolve, 200))
        retries--
      } else {
        break
      }
    }

    if (!updateResult?.success) {
      console.warn('Failed to update profile after retries:', updateResult?.error?.message)
      
      // If profile still doesn't exist, try to create it manually
      if (updateResult?.error?.message?.includes('Profile') && updateResult?.error?.message?.includes('not found')) {
        try {
          const { error: createError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: userId,
              email: pseudoEmail,
              full_name: username || null,
              avatar_url: profilePictureUrl || null,
            })
          
          if (createError) {
            console.error('Failed to create profile manually:', createError.message)
          } else {
            console.log('Profile created manually successfully')
          }
        } catch (err) {
          console.error('Error creating profile manually:', err)
        }
      }
    }

    return NextResponse.json({ ok: true, userId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}


