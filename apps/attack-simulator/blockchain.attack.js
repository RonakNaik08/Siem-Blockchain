import { getBlockchain } from "../log-service/src/blockchain/index.js";

export function tamperBlock() {
  const chain = getBlockchain();

  if (chain.length > 1) {
    chain[1].logs[0].message = "HACKED_LOG";
    console.log("⚠️ Blockchain tampered!");
  }
}