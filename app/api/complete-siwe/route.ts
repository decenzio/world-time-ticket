import {cookies} from "next/headers"
import {NextRequest, NextResponse} from "next/server"
import {MiniAppWalletAuthSuccessPayload, verifySiweMessage,} from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export const POST = async (req: NextRequest) => {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    
    if (nonce != cookies().get("siwe")?.value) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      });
    }
    
    try {
      const validMessage = await verifySiweMessage(payload, nonce);
      return NextResponse.json({
        status: "success",
        isValid: validMessage.isValid,
      });
    } catch (error: any) {
      // Handle errors in validation or processing
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: error.message,
      });
    }
  } catch (error: any) {
    console.error("SIWE verification error:", error)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    }, { status: 500 })
  }
}
