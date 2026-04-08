import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config(); // ✅ Explicit dotenv load — fixes ESM module-hoisting issue


// ABI aligned with LogIntegrity.sol
const ABI = [
  // Per-log anchoring
  "function storeLog(string logId, string hash) public",
  "function verifyLog(string logId, string hash) public view returns (bool)",
  "function getLog(string logId) public view returns (string, uint256)",
  // Batch Merkle-root anchoring
  "function storeMerkleRoot(bytes32 root) public",
  "function getMerkleRoots() public view returns (bytes32[])",
  "function getMerkleRootCount() public view returns (uint256)",
];

let contract = null;
let initialized = false;

export const initBlockchain = async () => {
  // ✅ Read inside function — guarantees dotenv is loaded first
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";

  try {
    if (!privateKey || !contractAddress) {
      console.warn("⚠ Blockchain env vars missing — check .env (PRIVATE_KEY, CONTRACT_ADDRESS)");
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, ABI, wallet);
    initialized = true;
    console.log("✅ Blockchain initialized at:", contractAddress);
  } catch (err) {
    console.error("❌ Blockchain init failed:", err.message);
  }
};

// ─── Per-log functions ────────────────────────────────────────────────────

export const storeHashOnChain = async (logId, hash) => {
  if (!contract) throw new Error("Blockchain not initialized");
  try {
    const tx = await contract.storeLog(logId, hash);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (err) {
    console.error("❌ storeLog failed:", err.message);
    throw err;
  }
};

export const verifyHashOnChain = async (logId, hash) => {
  if (!contract) throw new Error("Blockchain not initialized");
  return await contract.verifyLog(logId, hash);
};

export const getHashFromChain = async (logId) => {
  if (!contract) throw new Error("Blockchain not initialized");
  const [hash, timestamp] = await contract.getLog(logId);
  return { hash, timestamp: Number(timestamp) };
};

// ─── Batch Merkle-root functions ──────────────────────────────────────────

export const storeMerkleRoot = async (root) => {
  if (!contract) throw new Error("Blockchain not initialized");
  try {
    // root is a hex string from sha256 — pad/convert to bytes32
    const rootBytes = root.startsWith("0x") ? root : "0x" + root;
    const tx = await contract.storeMerkleRoot(rootBytes);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (err) {
    console.error("❌ storeMerkleRoot failed:", err.message);
    throw err;
  }
};

export const getStoredRoots = async () => {
  if (!contract) throw new Error("Blockchain not initialized");
  return await contract.getMerkleRoots();
};

export const isInitialized = () => initialized;