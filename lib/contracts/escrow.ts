import { ethers } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, USDC_TOKEN_ADDRESS } from "@/lib/config";

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
];

// Contract addresses (testnet)
// WLD token left as env/config-driven value in lib/config if needed

export enum BookingStatus {
  Deposited = 0,
  Released = 1,
  Refunded = 2,
  Disputed = 3,
}

export interface BookingDetails {
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  createdAt: bigint;
  scheduledTime: bigint;
  status: BookingStatus;
  buyerFeedback: boolean;
  sellerFeedback: boolean;
  sessionNotes: string;
}

export class EscrowContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;
  private contractAddress: string;

  /**
   * Create an EscrowContract instance.
   * @param signer ethers.Signer used to send transactions
   * @param contractAddress optional contract address override; falls back to config
   */
  constructor(signer: ethers.Signer, contractAddress?: string) {
    this.signer = signer;
    this.contractAddress = contractAddress || ESCROW_CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(
      this.contractAddress,
      ESCROW_ABI,
      signer
    );
  }

  async createBooking(
    seller: string,
    token: string,
    amount: bigint,
    scheduledTime: bigint,
    sessionNotes: string
  ): Promise<string> {
    const tx = await this.contract.createBooking(
      seller,
      token,
      amount,
      scheduledTime,
      sessionNotes
    );

    const receipt = await tx.wait();

    // Extract booking ID from event
    const event = receipt.events?.find(
      (e: any) => e.event === "BookingCreated"
    );
    const bookingId = event?.args?.bookingId;
    if (!bookingId)
      throw new Error("BookingCreated event not found in receipt");
    return bookingId;
  }

  async submitFeedback(bookingId: string): Promise<void> {
    const tx = await this.contract.submitFeedback(bookingId);
    await tx.wait();
  }

  async refundFunds(bookingId: string): Promise<void> {
    const tx = await this.contract.refundFunds(bookingId);
    await tx.wait();
  }

  async initiateDispute(bookingId: string): Promise<void> {
    const tx = await this.contract.initiateDispute(bookingId);
    await tx.wait();
  }

  async autoReleaseFunds(bookingId: string): Promise<void> {
    const tx = await this.contract.autoReleaseFunds(bookingId);
    await tx.wait();
  }

  async getBooking(bookingId: string): Promise<BookingDetails> {
    const result = await this.contract.getBooking(bookingId);

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
    };
  }

  async getUserBookings(user: string): Promise<string[]> {
    return await this.contract.getUserBookings(user);
  }

  // Helper function to approve token spending
  async approveToken(tokenAddress: string, amount: bigint): Promise<void> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ],
      this.signer
    );

    // Approve the escrow contract (use instance contract address)
    const tx = await tokenContract.approve(this.contractAddress, amount);
    await tx.wait();
  }
}

// Factory helper so callers can use dependency injection style creation
export function createEscrowContract(
  signer: ethers.Signer,
  contractAddress?: string
) {
  return new EscrowContract(signer, contractAddress);
}

// Convenience helper: in-browser flow to approve token and call createBooking
export async function createBookingWithApproval(
  signer: ethers.Signer,
  seller: string,
  tokenAddress: string,
  humanAmount: number,
  scheduledTimeSec: number,
  sessionNotes: string
): Promise<string> {
  // Determine decimals: USDC commonly 6, WLD assumed 18
  const decimals =
    tokenAddress.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase() ? 6 : 18;

  const amount = (ethers as any).parseUnits
    ? (ethers as any).parseUnits(humanAmount.toString(), decimals)
    : ethers.parseUnits(humanAmount.toString(), decimals);

  const escrow = new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    ESCROW_ABI,
    signer
  );

  // Approve tokens to escrow
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ["function approve(address spender, uint256 amount) external returns (bool)"],
    signer
  );

  const approveTx = await tokenContract.approve(ESCROW_CONTRACT_ADDRESS, amount);
  await approveTx.wait();

  // Call createBooking on escrow contract
  const tx = await escrow.createBooking(
    seller,
    tokenAddress,
    amount,
    scheduledTimeSec,
    sessionNotes
  );
  const receipt = await tx.wait();

  const event = receipt.events?.find((e: any) => e.event === "BookingCreated");
  const bookingId = event?.args?.bookingId ?? event?.args?.[0];
  if (!bookingId) throw new Error("BookingCreated event not found in receipt");
  return bookingId as string;
}
