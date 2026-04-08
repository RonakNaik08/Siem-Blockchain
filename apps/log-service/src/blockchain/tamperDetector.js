import { verifyChain } from "./verifier.js";

/**
 * Detect tampering in the in-memory blockchain.
 * @param {Block[]} chain - The raw chain array (from blockchain.getChain())
 */
export function detectTampering(chain) {
  const isTampered = !verifyChain(chain);

  if (isTampered) {
    return {
      isTampered: true,
      alert: true,
      type: "BLOCKCHAIN_TAMPER",
      severity: "CRITICAL",
      message: "Blockchain integrity compromised",
    };
  }

  return { isTampered: false, alert: false };
}