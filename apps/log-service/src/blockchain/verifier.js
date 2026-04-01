export const verifyChain = (chain) => {
  for (let i = 1; i < chain.length; i++) {
    const curr = chain[i];
    const prev = chain[i - 1];

    // Check hash integrity
    if (curr.hash !== curr.calculateHash()) {
      return false;
    }

    // Check linkage
    if (curr.previousHash !== prev.hash) {
      return false;
    }
  }

  return true;
};