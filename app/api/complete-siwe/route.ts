import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export const POST = async (req: NextRequest) => {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload
    
    // Get the stored nonce from cookies
    const storedNonce = cookies().get("siwe")?.value
    
    if (!storedNonce || nonce !== storedNonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      }, { status: 400 })
    }

    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (!validMessage.isValid) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid signature",
      }, { status: 400 })
    }

    // Clear the nonce after successful verification
    cookies().delete("siwe")

    return NextResponse.json({
      status: "success",
      isValid: true,
      user: {
        address: payload.address,
        message: payload.message,
        signature: payload.signature,
        version: payload.version,
      }
    })
  } catch (error: any) {
    console.error("SIWE verification error:", error)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    }, { status: 500 })
  }
}
