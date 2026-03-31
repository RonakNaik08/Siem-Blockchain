import crypto from "crypto";
import { contract } from "../blockchain.js";
import axios from "axios";

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
    const tx = await contract.storeLog(logId, hash);
    await tx.wait();

    console.log("✅ Stored on blockchain:", logId);

    // 4️⃣ send to API gateway (WebSocket trigger)
    await axios.post("http://localhost:4000/logs", {
      id: logId,
      message: logMessage,
      hash,
    });

    return { logId, hash };

  } catch (err) {
    console.error("❌ Error processing log:", err);
  }
};