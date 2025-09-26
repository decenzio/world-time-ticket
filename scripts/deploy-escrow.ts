import { ethers } from "ethers"

async function deployEscrowContract() {
  // This script would be run to deploy the contract to testnet
  console.log("Deploying TimeSlot Escrow Contract...")

  // Contract deployment code would go here
  // For now, this is a placeholder showing the deployment structure

  const contractFactory = await ethers.getContractFactory("TimeSlotEscrow")
  const contract = await contractFactory.deploy(
    "0x...", // Owner address
  )

  await contract.deployed()

  console.log("Escrow contract deployed to:", contract.address)

  // Add supported tokens
  await contract.addSupportedToken("0x...") // USDC testnet address
  await contract.addSupportedToken("0x...") // WLD testnet address

  console.log("Supported tokens added")

  return contract.address
}

// Run deployment
deployEscrowContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
