import { generateHash } from "../utils/hash.util.js";

export class Blockchain {
  constructor() {
    this.chain = [];
  }

  addLog(log) {
    const prevBlock = this.chain[this.chain.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : "0";

    const hash = generateHash({
      ...log,
      prevHash,
    });

    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      data: log,
      prevHash,
      hash,
    };

    this.chain.push(block);
    return block;
  }

  getChain() {
    return this.chain;
  }

  isValid() {
    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      const expectedPrevHash = prev ? prev.hash : "0";

      if (current.prevHash !== expectedPrevHash) return false;

      const recalculated = generateHash({
        ...current.data,
        prevHash: current.prevHash,
      });

      if (recalculated !== current.hash) return false;
    }

    return true;
  }
}