import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  "function storeRoot(bytes32 root) public",
  "function getRoots() public view returns (bytes32[])",
];

let contract;

export const initBlockchain = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || "http://127.0.0.1:8545"
    );

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log("✅ Blockchain initialized");
  } catch (err) {
    console.error("❌ Blockchain init failed:", err.message);
  }
};

export const storeMerkleRoot = async (root) => {
  if (!contract) throw new Error("Blockchain not initialized");

  try {
    const tx = await contract.storeRoot("0x" + root);
    await tx.wait();

    return tx.hash;
  } catch (err) {
    console.error("❌ Store root failed:", err.message);
    throw err;
  }
};

export const getStoredRoots = async () => {
  if (!contract) throw new Error("Blockchain not initialized");

  return await contract.getRoots();
};