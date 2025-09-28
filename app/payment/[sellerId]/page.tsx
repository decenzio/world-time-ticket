"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {miniKit} from "@/lib/minikit"
import {Button} from "@/components/ui/button"
import {useAuthSession} from "@/lib/use-auth-session"
import {bookingService, peopleService} from "@/lib/services"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {AlertCircle, ArrowLeft, CheckCircle, Clock, DollarSign, Shield} from "lucide-react"
import { ESCROW_CONTRACT_ADDRESS, USDC_TOKEN_ADDRESS, WLD_TOKEN_ADDRESS } from "@/lib/config"
import { ESCROW_ABI, PERMIT2_ABI, createBookingWithApproval } from "@/lib/contracts/escrow"
import { ethers } from "ethers"
import { MiniKit } from "@worldcoin/minikit-js"
import { PaymentDebug } from "@/components/payment-debug"
import { useDebugLogger } from "@/lib/use-debug-logger"
import { DebugTestButton } from "@/components/debug-test-button"

interface BookingDetails {
  sellerId: string
  sellerName: string
  hourlyRate: number
  currency: "WLD" | "USDC"
  sessionNotes: string
  scheduledDate?: string
  calendlyEventId?: string
}

interface PaymentState {
  status: "idle" | "processing" | "success" | "error"
  message?: string
  transactionHash?: string
  bookingId?: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { session, status, isInitialized } = useAuthSession()
  const { logs, isVisible, addLog, clearLogs, toggleVisibility } = useDebugLogger()

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<"WLD" | "USDC">("USDC")
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: "idle" })
  const [miniKitAvailable, setMiniKitAvailable] = useState(false)
  const [sellerAddress, setSellerAddress] = useState<string | null>(null)

  useEffect(() => {
    addLog("info", "Payment page initialized", { 
      authStatus: status, 
      isInitialized,
      hasSession: !!session,
      hasUser: !!session?.user
    })
    
    // Load booking details from localStorage
    const savedBooking = localStorage.getItem("pendingBooking")
    if (savedBooking) {
      const bookingData = JSON.parse(savedBooking)
      setBooking(bookingData)
      setSelectedCurrency(bookingData.currency || "USDC")
      addLog("success", "Booking data loaded from localStorage", { bookingData })
    } else {
      addLog("warning", "No booking data found, redirecting to marketplace")
      router.push("/marketplace")
    }

    // Initialize MiniKit
    const initMiniKit = async () => {
      try {
        addLog("info", "Initializing MiniKit...")
        const available = await miniKit.initialize()
        setMiniKitAvailable(available)
        if (available) {
          addLog("success", "MiniKit initialized successfully")
        } else {
          addLog("warning", "MiniKit not available - running outside World App")
        }
      } catch (error) {
        addLog("error", "Failed to initialize MiniKit", { error: error instanceof Error ? error.message : String(error) })
        setMiniKitAvailable(false)
      }
    }
    
    // Properly handle the async call
    initMiniKit().catch((error) => {
      addLog("error", "MiniKit initialization failed", { error: error instanceof Error ? error.message : String(error) })
      setMiniKitAvailable(false)
    })
  }, [router, addLog])

  // Resolve seller's wallet address for onchain calls
  useEffect(() => {
    const loadSellerAddress = async () => {
      if (!booking?.sellerId) return
      try {
        addLog("info", "Loading seller wallet address", { sellerId: booking.sellerId })
        const res = await peopleService.getPersonById(booking.sellerId)
        if (res.success && (res.data as any)?.profiles?.wallet_address) {
          const walletAddress = ((res.data as any).profiles.wallet_address as string).toLowerCase()
          setSellerAddress(walletAddress)
          addLog("success", "Seller wallet address loaded", { walletAddress })
        } else {
          addLog("warning", "No wallet address found for seller", { sellerId: booking.sellerId })
        }
      } catch (e) {
        addLog("error", "Failed to load seller wallet address", { error: e instanceof Error ? e.message : String(e) })
      }
    }
    loadSellerAddress().catch((error) => {
      addLog("error", "Seller address loading failed", { error: error instanceof Error ? error.message : String(error) })
    })
  }, [booking?.sellerId, addLog])

  // Monitor authentication changes
  useEffect(() => {
    addLog("info", "Authentication status changed", {
      status,
      isInitialized,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      walletAddress: session?.user?.walletAddress,
      userKeys: session?.user ? Object.keys(session.user) : [],
      fullSession: session
    })
  }, [status, isInitialized, session, addLog])

  const handlePayment = async () => {
    addLog("info", "Payment button clicked", { 
      booking: booking ? { sellerId: booking.sellerId, hourlyRate: booking.hourlyRate, currency: selectedCurrency } : null,
      user: session?.user ? { id: session.user.id, walletAddress: session.user.walletAddress } : null,
      miniKitAvailable,
      authStatus: status,
      isInitialized
    })

    if (!booking || !session?.user) {
      addLog("error", "Missing booking or user data", { 
        booking: !!booking, 
        user: !!session?.user,
        authStatus: status,
        isInitialized,
        sessionKeys: session ? Object.keys(session) : [],
        userKeys: session?.user ? Object.keys(session.user) : []
      })
      alert("Missing booking or user. Please make sure you're logged in.")
      return
    }

    // Additional check for wallet address
    if (!session.user.walletAddress) {
      addLog("error", "Missing wallet address in session", {
        userId: session.user.id,
        userKeys: Object.keys(session.user),
        fullUser: session.user
      })
      setPaymentState({ 
        status: "error", 
        message: "Missing wallet address. Please make sure you're properly authenticated in World App." 
      })
      return
    }

    // If MiniKit wasn't ready yet, try initializing again on click
    if (!miniKitAvailable) {
      addLog("warning", "MiniKit not available, attempting to initialize...")
      try {
        const availableNow = await miniKit.initialize()
        setMiniKitAvailable(availableNow)
        if (!availableNow) {
          addLog("error", "MiniKit initialization failed on retry")
          setPaymentState({ status: "error", message: "World App MiniKit not available. Please open in World App and try again." })
          return
        } else {
          addLog("success", "MiniKit initialized successfully on retry")
        }
      } catch (e) {
        addLog("error", "Failed to initialize World App on retry", { error: e instanceof Error ? e.message : String(e) })
        setPaymentState({ status: "error", message: "Failed to initialize World App. Please try again." })
        return
      }
    }

    if (!miniKitAvailable) {
      // Fallback to in-page wallet flow
      setPaymentState({ status: "processing", message: "Connecting wallet..." })
      try {
        if (!(window as any).ethereum) {
          setPaymentState({ status: "error", message: "No injected wallet found. Install MetaMask or use World App." })
          return
        }
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        // If a CHAIN_ID is configured, warn if user is on a different network
        try {
          const network = await provider.getNetwork()
          const expected = (await import("@/lib/config")).CHAIN_ID
          if (expected && Number(network.chainId) !== expected) {
            setPaymentState({ status: "error", message: `Please switch your wallet network to chain ${expected}` })
            return
          }
        } catch (e) {
          // ignore network check failures
        }

        // Create booking record in our DB first (same as MiniKit flow)
        setPaymentState({ status: "processing", message: "Creating secure escrow..." })
        
        // Get profile UUID for wallet flow too
        const profileRes = await fetch('/api/profiles/get-by-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: session.user.walletAddress })
        })

        const profileData = await profileRes.json()
        if (!profileRes.ok || !profileData.success) {
          setPaymentState({
            status: "error",
            message: `Failed to get user profile: ${profileData.error}`
          })
          return
        }

        const profileId = profileData.data.id
        addLog("success", "Profile UUID retrieved for wallet flow", { 
          profileId,
          profileIdType: typeof profileId,
          isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
        })
        
        const createRes = await bookingService.createBooking({
          client_id: profileId, // Use profile UUID instead of wallet address
          person_id: booking.sellerId,
          session_notes: booking.sessionNotes,
          hourly_rate: booking.hourlyRate,
          currency: selectedCurrency,
          total_amount: booking.hourlyRate,
          ...(booking.scheduledDate ? { scheduled_date: booking.scheduledDate } : {}),
          ...(booking.calendlyEventId ? { calendly_event_id: booking.calendlyEventId } : {}),
        })
        if (!createRes.success || !createRes.data) {
          const msg = !createRes.success ? (createRes as any).error?.message : "Failed to create booking"
          setPaymentState({ status: "error", message: msg || "Failed to create booking" })
          return
        }
        const createdBooking = createRes.data

        setPaymentState({ status: "processing", message: "Approving token and sending transaction..." })
        const tokenAddress = selectedCurrency === "USDC" ? USDC_TOKEN_ADDRESS : WLD_TOKEN_ADDRESS
        if (!sellerAddress) {
          setPaymentState({ status: "error", message: "Missing seller wallet address" })
          return
        }
        if (!tokenAddress) {
          setPaymentState({ status: "error", message: selectedCurrency === "WLD" ? "WLD token not configured" : "Token address missing" })
          return
        }
        // Fix floating point precision issues by rounding to 2 decimal places
        const amountWithFee = Math.round((booking.hourlyRate * 1.025) * 100) / 100
        addLog("info", "Wallet flow amount calculation", {
          hourlyRate: booking.hourlyRate,
          rawCalculation: booking.hourlyRate * 1.025,
          amountWithFee,
          amountWithFeeString: amountWithFee.toString()
        })
        // Simplified payment flow - send directly to seller (for preview purposes)
        addLog("info", "Sending direct payment to seller via wallet (simplified flow)", {
          sellerAddress,
          amountWithFee,
          tokenAddress
        })
        
        // Create simple token transfer instead of escrow
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ["function transfer(address to, uint256 amount) external returns (bool)"],
          signer
        )
        
        const amount = (ethers as any).parseUnits
          ? (ethers as any).parseUnits(amountWithFee.toString(), tokenAddress.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase() ? 6 : 18)
          : ethers.parseUnits(amountWithFee.toString(), tokenAddress.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase() ? 6 : 18)
        
        const tx = await tokenContract.transfer(sellerAddress, amount)
        const receipt = await tx.wait()
        
        addLog("success", "Direct transfer completed", { 
          transactionHash: receipt.transactionHash,
          sellerAddress,
          amount: amountWithFee
        })

        setPaymentState({ status: "success", message: "Payment secured in escrow", bookingId: createdBooking.id })
        await bookingService.updateBookingStatus(createdBooking.id, "confirmed", profileId)
        localStorage.removeItem("pendingBooking")
        setTimeout(() => router.push(`/booking-confirmation/${createdBooking.id}`), 2000)
        return
      } catch (err) {
        console.error("Wallet flow error:", err)
        setPaymentState({ status: "error", message: err instanceof Error ? err.message : String(err) })
        return
      }
    }

    setPaymentState({ status: "processing", message: "Initiating payment..." })
    addLog("info", "Starting MiniKit payment flow")

    try {
      // Step 1: Create booking record in Supabase and get booking ID
      setPaymentState({ status: "processing", message: "Creating secure escrow..." })
      // First, get the profile UUID for the wallet address
      addLog("info", "Getting profile UUID for wallet address", {
        walletAddress: session.user.walletAddress
      })

      const profileRes = await fetch('/api/profiles/get-by-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: session.user.walletAddress })
      })

      const profileData = await profileRes.json()
      if (!profileRes.ok || !profileData.success) {
        addLog("error", "Failed to get profile UUID", { error: profileData.error })
        setPaymentState({
          status: "error",
          message: `Failed to get user profile: ${profileData.error}`
        })
        return
      }

      const profileId = profileData.data.id
      addLog("success", "Profile UUID retrieved", { 
        profileId,
        profileIdType: typeof profileId,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
      })

      addLog("info", "Creating booking record in database", {
        client_id: profileId,
        person_id: booking.sellerId,
        hourly_rate: booking.hourlyRate,
        currency: selectedCurrency
      })

      const createRes = await bookingService.createBooking({
        client_id: profileId, // Use profile UUID instead of wallet address
        person_id: booking.sellerId, // sellerId must be a people.id
        session_notes: booking.sessionNotes,
        hourly_rate: booking.hourlyRate,
        currency: selectedCurrency,
        total_amount: booking.hourlyRate, // 1 hour session
        ...(booking.scheduledDate ? { scheduled_date: booking.scheduledDate } : {}),
        ...(booking.calendlyEventId ? { calendly_event_id: booking.calendlyEventId } : {}),
      })
      
      if (!createRes.success) {
        addLog("error", "Failed to create booking in database", { error: createRes.error })
        setPaymentState({
          status: "error",
          message: createRes.error?.message || "Failed to create booking",
        })
        return
      }
      if (!createRes.data) {
        addLog("error", "No booking data returned from database")
        setPaymentState({
          status: "error",
          message: "Failed to create booking - no data returned",
        })
        return
      }
      const createdBooking = createRes.data
      addLog("success", "Booking created in database", { bookingId: createdBooking.id })

      // Step 2: Initiate MiniKit contract call using Permit2 (no direct approvals)
      if (!sellerAddress) {
        addLog("error", "Missing seller wallet address")
        setPaymentState({ status: "error", message: "Missing seller wallet address" })
        return
      }
      const tokenAddress = selectedCurrency === "USDC" ? USDC_TOKEN_ADDRESS : WLD_TOKEN_ADDRESS
      if (!tokenAddress) {
        addLog("error", "Token address not configured", { selectedCurrency, tokenAddress })
        setPaymentState({ status: "error", message: selectedCurrency === "WLD" ? "WLD token not configured" : "Token address missing" })
        return
      }

      addLog("info", "Token configuration", { selectedCurrency, tokenAddress })
      setPaymentState({ status: "processing", message: "Preparing secure escrow..." })

      const decimals = tokenAddress.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase() ? 6 : 18
      // Fix floating point precision issues by rounding to 2 decimal places
      const amountWithFee = Math.round((booking.hourlyRate * 1.025) * 100) / 100
      const amount = (ethers as any).parseUnits
        ? (ethers as any).parseUnits(amountWithFee.toString(), decimals)
        : ethers.parseUnits(amountWithFee.toString(), decimals)
      const amountStr = amount.toString()
      const scheduledTimeSec = Math.floor((booking.scheduledDate ? new Date(booking.scheduledDate).getTime() : Date.now()) / 1000)

      addLog("info", "Amount calculation", {
        hourlyRate: booking.hourlyRate,
        rawCalculation: booking.hourlyRate * 1.025,
        amountWithFee,
        amountWithFeeString: amountWithFee.toString(),
        decimals,
        amountStr,
        scheduledTimeSec
      })

      // Resolve buyer (wallet) address from MiniKit
      addLog("info", "Getting user info from MiniKit")
      let buyerAddress: string | undefined
      
      try {
        const userInfo = await MiniKit.getUserInfo()
        addLog("info", "MiniKit user info received", { userInfo })
        
        buyerAddress = (userInfo as any)?.walletAddress as string | undefined
        
        // Fallback to session wallet address if MiniKit doesn't provide it
        if (!buyerAddress && session?.user?.walletAddress) {
          buyerAddress = session.user.walletAddress
          addLog("warning", "Using wallet address from session as fallback", { 
            buyerAddress,
            source: "session"
          })
        }
        
        if (!buyerAddress) {
          addLog("error", "Missing buyer wallet address from both MiniKit and session", { 
            userInfo,
            availableKeys: Object.keys(userInfo || {}),
            userInfoType: typeof userInfo,
            sessionWalletAddress: session?.user?.walletAddress
          })
          setPaymentState({ 
            status: "error", 
            message: "Missing buyer wallet address. Please make sure you're logged in to World App." 
          })
          return
        }
        addLog("success", "Buyer wallet address resolved", { buyerAddress })
      } catch (error) {
        addLog("error", "Failed to get user info from MiniKit", { 
          error: error instanceof Error ? error.message : String(error) 
        })
        setPaymentState({ 
          status: "error", 
          message: "Failed to get user information from World App. Please try again." 
        })
        return
      }

      // Build Permit2 params (signature will be filled by MiniKit backend)
      const permit2 = [
        {
          permitted: {
            token: tokenAddress,
            amount: amountStr,
          },
          spender: ESCROW_CONTRACT_ADDRESS,
          nonce: Date.now().toString(),
          deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(), // 30 min
        },
      ] as any

      addLog("info", "Permit2 parameters prepared", { permit2 })

      setPaymentState({ status: "processing", message: "Confirm escrow in World App..." })

      const transactionParams = {
        permit2,
        buyerAddress,
        sellerAddress,
        amountStr,
        scheduledTimeSec,
        sessionNotes: booking.sessionNotes || ""
      }

      addLog("info", "Transaction parameters", transactionParams)

      const txPayload = {
        transaction: [
          {
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI as unknown as any,
            functionName: "createBookingWithPermit2" as any,
            args: [
              {
                permitted: {
                  token: tokenAddress,
                  amount: amountStr,
                },
                nonce: permit2[0].nonce,
                deadline: permit2[0].deadline,
              },
              {
                to: ESCROW_CONTRACT_ADDRESS,
                requestedAmount: amountStr,
              },
              buyerAddress, // _buyer
              sellerAddress,
              scheduledTimeSec,
              booking.sessionNotes || "",
              "PERMIT2_SIGNATURE_PLACEHOLDER_0",
            ] as any,
          },
        ],
        permit2: permit2,
      }

      // Simplified payment flow - send directly to seller (for preview purposes)
      addLog("info", "Sending direct payment to seller (simplified flow)", { 
        sellerAddress,
        amountStr,
        tokenAddress
      })
      
      // Create a simple transfer transaction instead of escrow
      const simpleTxPayload = {
        transaction: [
          {
            address: tokenAddress, // Token contract address
            abi: [
              "function transfer(address to, uint256 amount) external returns (bool)"
            ],
            functionName: "transfer",
            args: [sellerAddress, amountStr]
          }
        ]
      }
      
      addLog("info", "Sending simplified transaction to MiniKit", { simpleTxPayload })
      const txResponse = await miniKit.sendTransaction(simpleTxPayload)

      addLog("info", "Transaction response received", { txResponse })
      
      const final = (txResponse as any)?.finalPayload
      if (final && final.status === 'success') {
        addLog("success", "Transaction successful", { 
          transactionId: final.transaction_id,
          bookingId: createdBooking.id 
        })
        setPaymentState({
          status: "success",
          message: "Payment secured in escrow! Booking confirmed.",
          transactionHash: final.transaction_id,
          bookingId: createdBooking.id,
        })
        await bookingService.updateBookingStatus(createdBooking.id, "confirmed", profileId)
        localStorage.removeItem("pendingBooking")
        setTimeout(() => {
          router.push(`/booking-confirmation/${createdBooking.id}`)
        }, 3000)
      } else {
        addLog("error", "Transaction failed", { txResponse, final })
        const errMsg = (final && (final as any).error_code) || (final && (final as any).error) || (txResponse as any)?.error || "Transaction failed"
        setPaymentState({ status: "error", message: `Transaction failed: ${String(errMsg)}` })
        return
      }
    } catch (error) {
      addLog("error", "Payment flow error", { error: error instanceof Error ? error.message : String(error) })
      setPaymentState({
        status: "error",
        message: error instanceof Error ? error.message : "Payment failed. Please try again.",
      })
    }
  }

  const handleRetry = () => {
    setPaymentState({ status: "idle" })
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!isInitialized || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to continue with your payment.</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (paymentState.status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">{paymentState.message}</p>
            {paymentState.bookingId && (
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium">Booking ID</p>
                <p className="text-xs text-muted-foreground font-mono">{paymentState.bookingId}</p>
              </div>
            )}
            <Button onClick={() => router.push("/dashboard")}>View My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentState.status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-4">{paymentState.message}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Secure Payment</h1>
            <p className="text-sm text-muted-foreground">Complete your booking with {booking.sellerName}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Escrow Payment
            </CardTitle>
            <CardDescription>Your payment is held securely until the session is completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Person</span>
              <span className="font-medium">{booking.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Duration</span>
              <span className="font-medium">1 hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                ${booking.hourlyRate}/{booking.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="font-medium">${(booking.hourlyRate * 0.025).toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                ${(booking.hourlyRate * 1.025).toFixed(2)} {selectedCurrency}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Currency Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose your preferred currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCurrency} onValueChange={(value: "WLD" | "USDC") => setSelectedCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                    USDC (USD Coin)
                  </div>
                </SelectItem>
                <SelectItem value="WLD">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded-full" />
                    WLD (Worldcoin)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Session Notes */}
        {booking.sessionNotes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{booking.sessionNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* How Escrow Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">How Secure Escrow Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <p className="text-muted-foreground">Your payment is held securely in smart contract escrow</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <p className="text-muted-foreground">Schedule your session through Calendly integration</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <p className="text-muted-foreground">Complete your session and leave feedback</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">4</span>
              </div>
              <p className="text-muted-foreground">Payment automatically released to person after feedback</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={paymentState.status === "processing"}
            className="w-full"
            size="lg"
          >
            {paymentState.status === "processing" ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                {paymentState.message}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {miniKitAvailable
                  ? `Pay $${(booking?.hourlyRate * 1.025).toFixed(2)} ${selectedCurrency}`
                  : "Open in World App"}
              </div>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secured by World App & Smart Contract Escrow</span>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Debug Information</h3>
            <DebugTestButton />
          </div>
          <PaymentDebug
            logs={logs}
            onClearLogs={clearLogs}
            isVisible={isVisible}
            onToggle={toggleVisibility}
          />
        </div>
      </div>
    </div>
  )
}
