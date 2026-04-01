import { Block } from "./block.js";
import { buildMerkleRoot } from "./merkleTree.js";
import { verifyChain } from "./verifier.js";

export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingLogs = [];
    this.blockSize = 5; // adjust if needed
  }

  createGenesisBlock() {
    const block = new Block(0, [], "0");
    block.finalize("GENESIS_ROOT");
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addLog(log) {
    this.pendingLogs.push(log);

    if (this.pendingLogs.length >= this.blockSize) {
      return this.createBlock();
    }
    return null;
  }

  createBlock() {
    const newBlock = new Block(
      this.chain.length,
      this.pendingLogs,
      this.getLatestBlock().hash
    );

    const merkleRoot = buildMerkleRoot(this.pendingLogs);
    newBlock.finalize(merkleRoot);

    this.chain.push(newBlock);
    this.pendingLogs = [];

    return newBlock;
  }

  isValid() {
    return verifyChain(this.chain);
  }

  getChain() {
    return this.chain;
  }
}