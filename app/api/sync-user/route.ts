import {NextRequest, NextResponse} from "next/server"
import {supabaseAdmin} from "@/lib/database"
import {profileService} from "@/lib/services"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, username, profilePictureUrl } = await req.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ ok: false, error: "walletAddress is required" }, { status: 400 })
    }

    // Require admin client (no mock fallback)
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Supabase admin is not configured. Set SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 })
    }

    const normalizedAddress = (walletAddress as string).toLowerCase()

    // Profiles are keyed by id; match or create by wallet_address (email optional)
    let userId: string | null = null

    const { data: existingByWallet, error: findErr } = await (supabaseAdmin as any)
      .from('profiles')
      .select('id')
      .eq('wallet_address', normalizedAddress)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ ok: false, error: findErr.message }, { status: 500 })
    }

    if (existingByWallet?.id) {
      userId = existingByWallet.id
      // best-effort metadata refresh
      await (supabaseAdmin as any)
        .from('profiles')
        .update({ username: username || null, avatar_url: profilePictureUrl || null })
        .eq('id', userId)
    } else {
      const { data: created, error: insertErr } = await (supabaseAdmin as any)
        .from('profiles')
        .insert({
          wallet_address: normalizedAddress,
          username: username || null,
          full_name: username || null,
          avatar_url: profilePictureUrl || null,
        } as any)
        .select('id')
        .single()
      if (insertErr || !created?.id) {
        return NextResponse.json({ ok: false, error: insertErr?.message || 'Failed to create profile' }, { status: 500 })
      }
      userId = created.id
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
          const { error: createError } = await (supabaseAdmin as any)
            .from('profiles')
            .insert({
              id: userId,
              wallet_address: normalizedAddress,
              username: username || null,
              full_name: username || null,
              avatar_url: profilePictureUrl || null,
            } as any)
          
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


