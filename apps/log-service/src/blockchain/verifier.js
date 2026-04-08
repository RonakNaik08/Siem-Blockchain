import { generateHash } from "../utils/hash.util.js";

export const verifyChain = (chain) => {
  for (let i = 0; i < chain.length; i++) {
    const curr = chain[i];
    const prev = chain[i - 1];

    const expectedPrevHash = prev ? prev.hash : "0";

    // 🔗 Check chain linkage
    if (curr.prevHash !== expectedPrevHash) {
      return {
        isTampered: true,
        error: `Broken chain at index ${i}`,
      };
    }

    // 🔐 Recalculate hash (FIXED)
    const recalculated = generateHash({
      ...curr.data,
      prevHash: curr.prevHash,
    });

    if (recalculated !== curr.hash) {
      return {
        isTampered: true,
        error: `Tampered data at index ${i}`,
      };
    }
  }

  return {
    isTampered: false,
  };
};