import {
  storeHashOnChain,
  verifyHashOnChain,
  getHashFromChain,
  isInitialized,
} from "../blockchain/blockchainClient.js";
import Log from "../models/log.model.js";

/**
 * Store a log hash on the Ethereum chain.
 * Falls back gracefully when blockchain is not connected.
 */
export async function storeLogOnChain(logId, hash) {
  if (!isInitialized()) {
    console.warn("⚠ Blockchain not initialized — skipping on-chain store");
    return { success: false, reason: "not_initialized" };
  }
  const { txHash, blockNumber } = await storeHashOnChain(logId, hash);
  return { success: true, txHash, blockNumber };
}

/**
 * Verify a log hash directly on-chain.
 */
export async function verifyLogOnChain(logId, hash) {
  // If we only have a hash (manual file verification)
  if (!logId && hash) {
    const existingLog = await Log.findOne({ hash });
    if (existingLog) {
      logId = existingLog._id.toString();
    } else {
      return { verified: false, reason: "No matching record found in system logs." };
    }
  }

  if (!isInitialized()) return { verified: false, reason: "blockchain_not_initialized" };
  const verified = await verifyHashOnChain(logId, hash);
  return { verified, logId };
}

/**
 * Fetch a log record from the chain.
 */
export async function fetchLogFromChain(logId) {
  if (!isInitialized()) return null;
  return await getHashFromChain(logId);
}