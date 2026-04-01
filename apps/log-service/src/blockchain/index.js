import { Blockchain } from "./blockchain.js";
import { detectTampering } from "./tamperDetector.js";

const blockchain = new Blockchain();

/**
 * Add log → create block → check tampering → emit events
 */
export async function addLog(log, io = null) {
  // 🔥 FIX: await because createBlock is async
  const newBlock = await blockchain.addLog(log);

  // ✅ FIX: pass chain, not blockchain object
  const chain = blockchain.getChain();
  const result = detectTampering(chain);

  // 🚨 Emit tamper alert
  if (result.isTampered && io) {
    io.emit("alert", result);
  }

  // 📦 Emit new block
  if (newBlock && io) {
    io.emit("new-block", newBlock); // 🔥 consistent naming
  }

  return {
    blockCreated: !!newBlock,
    tamperAlert: result,
  };
}

/**
 * Get full blockchain
 */
export function getBlockchain() {
  return blockchain.getChain();
}

/**
 * Verify chain integrity
 */
export function verifyBlockchain() {
  return blockchain.isValid();
}