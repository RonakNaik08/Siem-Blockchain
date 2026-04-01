import { Blockchain } from "./blockchain.js";
import { detectTampering } from "./tamperDetector.js";

const blockchain = new Blockchain();

export function addLog(log, io = null) {
  const newBlock = blockchain.addLog(log);

  const result = detectTampering(blockchain);

  // Emit real-time alert if tampered
  if (result.alert && io) {
    io.emit("alert", result);
  }

  // Emit new block event
  if (newBlock && io) {
    io.emit("new_block", newBlock);
  }

  return {
    blockCreated: !!newBlock,
    tamperAlert: result
  };
}

export function getBlockchain() {
  return blockchain.getChain();
}

export function verifyBlockchain() {
  return blockchain.isValid();
}