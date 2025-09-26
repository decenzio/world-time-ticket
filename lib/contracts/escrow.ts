import { ethers } from "ethers"

// Contract ABI (simplified for key functions)
export const ESCROW_ABI = [
  "function createBooking(address _seller, address _token, uint256 _amount, uint256 _scheduledTime, string calldata _sessionNotes) external returns (bytes32)",
  "function submitFeedback(bytes32 _bookingId) external",
  "function refundFunds(bytes32 _bookingId) external",
  "function initiateDispute(bytes32 _bookingId) external",
  "function autoReleaseFunds(bytes32 _bookingId) external",
  "function getBooking(bytes32 _bookingId) external view returns (address, address, address, uint256, uint256, uint256, uint8, bool, bool, string)",
  "function getUserBookings(address _user) external view returns (bytes32[])",
  "event BookingCreated(bytes32 indexed bookingId, address indexed buyer, address indexed seller, uint256 amount, address token)",
  "event FundsReleased(bytes32 indexed bookingId, address indexed seller, uint256 amount)",
  "event FundsRefunded(bytes32 indexed bookingId, address indexed buyer, uint256 amount)",
  "event BookingDisputed(bytes32 indexed bookingId, address indexed initiator)",
  "event FeedbackSubmitted(bytes32 indexed bookingId, address indexed user, bool isBuyer)",
]

// Contract addresses (testnet)
export const ESCROW_CONTRACT_ADDRESS = "0x..." // Deploy address will go here
export const USDC_TOKEN_ADDRESS = "0x..." // Testnet USDC address
export const WLD_TOKEN_ADDRESS = "0x..." // Testnet WLD address

export enum BookingStatus {
  Deposited = 0,
  Released = 1,
  Refunded = 2,
  Disputed = 3,
}

export interface BookingDetails {
  buyer: string
  seller: string
  token: string
  amount: bigint
  createdAt: bigint
  scheduledTime: bigint
  status: BookingStatus
  buyerFeedback: boolean
  sellerFeedback: boolean
  sessionNotes: string
}

export class EscrowContract {
  private contract: ethers.Contract
  private signer: ethers.Signer

  constructor(signer: ethers.Signer) {
    this.signer = signer
    this.contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)
  }

  async createBooking(
    seller: string,
    token: string,
    amount: bigint,
    scheduledTime: bigint,
    sessionNotes: string,
  ): Promise<string> {
    const tx = await this.contract.createBooking(seller, token, amount, scheduledTime, sessionNotes)

    const receipt = await tx.wait()

    // Extract booking ID from event
    const event = receipt.events?.find((e: any) => e.event === "BookingCreated")
    return event?.args?.bookingId
  }

  async submitFeedback(bookingId: string): Promise<void> {
    const tx = await this.contract.submitFeedback(bookingId)
    await tx.wait()
  }

  async refundFunds(bookingId: string): Promise<void> {
    const tx = await this.contract.refundFunds(bookingId)
    await tx.wait()
  }

  async initiateDispute(bookingId: string): Promise<void> {
    const tx = await this.contract.initiateDispute(bookingId)
    await tx.wait()
  }

  async autoReleaseFunds(bookingId: string): Promise<void> {
    const tx = await this.contract.autoReleaseFunds(bookingId)
    await tx.wait()
  }

  async getBooking(bookingId: string): Promise<BookingDetails> {
    const result = await this.contract.getBooking(bookingId)

    return {
      buyer: result[0],
      seller: result[1],
      token: result[2],
      amount: result[3],
      createdAt: result[4],
      scheduledTime: result[5],
      status: result[6],
      buyerFeedback: result[7],
      sellerFeedback: result[8],
      sessionNotes: result[9],
    }
  }

  async getUserBookings(user: string): Promise<string[]> {
    return await this.contract.getUserBookings(user)
  }

  // Helper function to approve token spending
  async approveToken(tokenAddress: string, amount: bigint): Promise<void> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function approve(address spender, uint256 amount) external returns (bool)"],
      this.signer,
    )

    const tx = await tokenContract.approve(ESCROW_CONTRACT_ADDRESS, amount)
    await tx.wait()
  }
}
