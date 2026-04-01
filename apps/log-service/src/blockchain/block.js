import crypto from "crypto";

export class Block {
  constructor(index, logs, previousHash) {
    this.index = index;
    this.logs = logs;
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.merkleRoot = "";
    this.hash = "";
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          this.merkleRoot
      )
      .digest("hex");
  }

  finalize(merkleRoot) {
    this.merkleRoot = merkleRoot;
    this.hash = this.calculateHash();
  }
}