import crypto from "crypto";
import { storeHashOnChain } from "../blockchain.js";

export const processLog = async (logMessage) => {
  try {
    // 1️⃣ unique ID
    const logId = Date.now().toString();

    // 2️⃣ hash
    const hash = crypto
      .createHash("sha256")
      .update(logMessage)
      .digest("hex");

    // 3️⃣ store in blockchain
    const { txHash, blockNumber } = await storeHashOnChain(logId, hash);

    console.log(`✅ Stored on blockchain: logId=${logId} block=${blockNumber} tx=${txHash.slice(0, 10)}...`);

    return { logId, hash, txHash, blockNumber };

  } catch (err) {
    console.error("❌ Error processing log:", err);
  }
};
