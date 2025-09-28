// Centralized runtime configuration for addresses and RPC
// Use NEXT_PUBLIC_* env vars so values are available in client bundles
export const ESCROW_CONTRACT_ADDRESS: string =
  (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as string) ||
  "0xA22904796F46f016017E4efad6e891C1106Fb44F";

export const USDC_TOKEN_ADDRESS: string =
  (process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as string) ||
  "0x0Ddfaa53cED6490ee2AceEA07ace6E06Cf07967d";

export const WLD_TOKEN_ADDRESS: string =
  (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS as string) || "";

export const NEXT_PUBLIC_RPC_URL: string =
  (process.env.NEXT_PUBLIC_RPC_URL as string) || "worldchain-sepolia.g.alchemy.com/public";

// Optional expected chain id (useful for dev/testnets). Set as a decimal string in env.
export const CHAIN_ID: number | undefined = process.env.NEXT_PUBLIC_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  : undefined;

// Small helper to assert addresses at runtime in dev/test
export function isAddressSet(addr: string | undefined): boolean {
  return typeof addr === "string" && addr.length > 0 && addr !== "0x...";
}
