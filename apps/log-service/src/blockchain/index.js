import { Blockchain } from "./blockchain.js";
import { detectTampering } from "./tamperDetector.js";

const blockchain = new Blockchain();

/**
 * 🚀 Add log → create block → validate → emit events
 */
export async function addLog(log, io = null) {
  try {
    // -------------------------------
    // 🛡 PRE-VALIDATION (important)
    // -------------------------------
    const isValidBefore = blockchain.isValid();

    if (!isValidBefore) {
      const alert = {
        isTampered: true,
        stage: "BEFORE_INSERT",
        message: "Blockchain already compromised before adding new log",
        timestamp: Date.now(),
      };

      io?.emit("alert:new", alert);

      return {
        blockCreated: false,
        tamperAlert: alert,
      };
    }

    // -------------------------------
    // ⛓ CREATE BLOCK (async)
    // -------------------------------
    const newBlock = await blockchain.addLog(log);

    // -------------------------------
    // 🔍 POST-VALIDATION
    // -------------------------------
    const chain = blockchain.getChain();
    const tamperResult = detectTampering(chain);

    // -------------------------------
    // 🚨 EMIT TAMPER ALERT
    // -------------------------------
    if (tamperResult?.isTampered) {
      const alertPayload = {
        ...tamperResult,
        type: "BLOCKCHAIN_TAMPER",
        severity: "CRITICAL",
        timestamp: Date.now(),
      };

      io?.emit("alert:new", alertPayload);
    }

    // -------------------------------
    // 📦 EMIT NEW BLOCK (UI FIXED)
    // -------------------------------
    if (newBlock && io) {
      io.emit("block:new", {
        index: newBlock.index,
        hash: newBlock.hash,
        prevHash: newBlock.prevHash,
        timestamp: newBlock.timestamp,
      });
    }

    return {
      success: true,
      blockCreated: !!newBlock,
      block: newBlock,
      tamperAlert: tamperResult,
      chainLength: chain.length,
    };

  } catch (err) {
    console.error("❌ Blockchain Error:", err);

    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * 📦 Get full blockchain
 */
export function getBlockchain() {
  return blockchain.getChain();
}

/**
 * 🔍 Verify full chain integrity
 */
export function verifyBlockchain() {
  const isValid = blockchain.isValid();

  return {
    valid: isValid,
    message: isValid
      ? "Blockchain integrity intact"
      : "Blockchain compromised",
  };
}