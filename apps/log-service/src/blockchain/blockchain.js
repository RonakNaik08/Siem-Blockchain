import { Block } from "./block.js";
import { buildMerkleRoot } from "./merkleTree.js";
import { verifyChain } from "./verifier.js";
import { storeMerkleRoot } from "./blockchainClient.js"; // 👈 NEW

export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingLogs = [];
    this.blockSize = 5;
  }

  createGenesisBlock() {
    const block = new Block(0, [], "0");
    block.finalize("GENESIS_ROOT");
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add log to buffer
   */
  async addLog(log) {
    this.pendingLogs.push(log);

    if (this.pendingLogs.length >= this.blockSize) {
      return await this.createBlock(); // 👈 async now
    }

    return null;
  }

  /**
   * Create block + Merkle root + store on blockchain
   */
  async createBlock() {
    const logs = this.pendingLogs;

    // ✅ IMPORTANT: use hashes, not raw logs
    const hashes = logs.map((l) => l.hash);

    const merkleRoot = buildMerkleRoot(hashes);

    const newBlock = new Block(
      this.chain.length,
      logs,
      this.getLatestBlock().hash
    );

    newBlock.finalize(merkleRoot);

    // 🔥 STORE ROOT ON BLOCKCHAIN
    let txHash = null;
    try {
      txHash = await storeMerkleRoot(merkleRoot);
      console.log("✅ Stored on blockchain:", txHash);
    } catch (err) {
      console.error("❌ Blockchain store failed:", err.message);
    }

    // attach metadata
    newBlock.txHash = txHash;
    newBlock.timestamp = Date.now();

    this.chain.push(newBlock);
    this.pendingLogs = [];

    return newBlock;
  }

  /**
   * Full chain validation
   */
  isValid() {
    return verifyChain(this.chain);
  }

  getChain() {
    return this.chain;
  }
}