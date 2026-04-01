import { sha256 } from "./hash.util.js";

export class Block {
  constructor(index, logs, previousHash = "0") {
    this.index = index;
    this.timestamp = Date.now();
    this.logs = logs;
    this.previousHash = previousHash;
    this.merkleRoot = null;
    this.hash = null;
  }

  finalize(merkleRoot) {
    this.merkleRoot = merkleRoot;

    this.hash = sha256(
      this.index +
        this.timestamp +
        this.previousHash +
        this.merkleRoot
    );
  }
}