import crypto from "crypto";
import { storeLogOnChain } from "../services/blockchain.service.js";

export const processLog = async (logMessage) => {
  try {
    // 1️⃣ unique ID
    const logId = Date.now().toString();

    // 2️⃣ hash
    const hash = crypto
      .createHash("sha256")
      .update(logMessage)
      .digest("hex");

    // 3️⃣ store in blockchain (graceful if not connected)
    const result = await storeLogOnChain(logId, hash);

    if (result.success) {
      const { txHash, blockNumber } = result;
      console.log(`✅ Stored on blockchain: logId=${logId} block=${blockNumber} tx=${txHash?.slice(0, 10)}...`);
      return { logId, hash, txHash, blockNumber };
    } else {
      console.warn(`⚠ Blockchain skipped for logId=${logId}: ${result.reason}`);
      return { logId, hash };
    }

  } catch (err) {
    console.error("❌ Error processing log:", err);
  }
};
