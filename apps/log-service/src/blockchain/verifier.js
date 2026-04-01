import { sha256 } from "./hash.util.js";

export function verifyChain(chain) {
  for (let i = 1; i < chain.length; i++) {
    const curr = chain[i];
    const prev = chain[i - 1];

    if (curr.previousHash !== prev.hash) return false;

    const recalculatedHash = sha256(
      curr.index +
        curr.timestamp +
        curr.previousHash +
        curr.merkleRoot
    );

    if (curr.hash !== recalculatedHash) return false;
  }

  return true;
}