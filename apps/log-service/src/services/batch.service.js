import { buildMerkleRoot } from "../utils/merkleTree.js";
import { storeMerkleRoot, isInitialized } from "../blockchain/blockchainClient.js";

let logBuffer = [];

export const addToBatch = async (log) => {
  logBuffer.push(log);

  if (logBuffer.length >= 5) {
    const hashes = logBuffer.map((l) => l.hash);
    const root = buildMerkleRoot(hashes);
    console.log("✅ Merkle Root computed:", root?.slice(0, 16) + "...");

    if (isInitialized()) {
      try {
        const txHash = await storeMerkleRoot(root);
        console.log("📦 Merkle root anchored on-chain. TX:", txHash);
      } catch (err) {
        console.error("❌ Blockchain store failed:", err.message);
      }
    } else {
      console.warn("⚠ Blockchain not connected — Merkle root stored in-memory only");
    }

    logBuffer = [];
  }
};

export const getPendingLogs = () => [...logBuffer];