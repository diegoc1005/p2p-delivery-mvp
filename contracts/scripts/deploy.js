const hre = require("hardhat");

async function main() {
  console.log("Deploying P2PDeliveryEscrow...");

  const Escrow = await hre.ethers.getContractFactory("P2PDeliveryEscrow");
  const escrow = await Escrow.deploy();

  await escrow.waitForDeployment();

  console.log(`P2PDeliveryEscrow deployed to: ${await escrow.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
