const { ethers } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("LogIntegrity");

  const contract = await Contract.deploy();

  // ✅ NEW (v6)
  await contract.waitForDeployment();

  // ✅ NEW way to get address
  const address = await contract.getAddress();

  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});