import { buildMerkleRoot } from "../utils/merkleTree.js";
import { storeMerkleRoot } from "../blockchain/blockchainClient.js";

let logBuffer = [];

export const addToBatch = async (log) => {
  logBuffer.push(log);

  if (logBuffer.length >= 5) {
    const hashes = logBuffer.map((l) => l.hash); // ✅ ONLY HASHES

    const root = buildMerkleRoot(hashes);

    try {
      const txHash = await storeMerkleRoot(root);

      console.log("✅ Merkle Root:", root);
      console.log("📦 TX:", txHash);
    } catch (err) {
      console.error("❌ Blockchain error:", err.message);
    }

    logBuffer = [];
  }
};