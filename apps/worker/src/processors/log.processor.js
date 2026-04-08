import crypto from "crypto";
import axios from "axios";

/**
 * Process a log job from the BullMQ queue.
 * - Computes SHA-256 hash
 * - Sends to log-service for storage + blockchain anchoring
 */
export async function processLog(logData) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(logData))
    .digest("hex");

  const enriched = {
    ...logData,
    hash,
    processedAt: new Date().toISOString(),
  };

  // Severity enrichment
  if (["FAILED_LOGIN", "BRUTE_FORCE"].includes(logData.type)) {
    enriched.severity = "HIGH";
    enriched.level = "error";
  } else if (["INJECTION", "TAMPER_DETECTED"].includes(logData.type)) {
    enriched.severity = "CRITICAL";
    enriched.level = "error";
  } else if ((logData.requests || 0) > 100 || logData.type === "DDOS") {
    enriched.severity = "MEDIUM";
    enriched.level = "warn";
  }

  try {
    await axios.post(
      process.env.LOG_SERVICE_URL || "http://localhost:5000/api/logs",
      enriched
    );
    console.log(`📨 Log forwarded: ${logData.type || "GENERIC"} severity=${enriched.severity}`);
  } catch (err) {
    console.error("❌ Failed to forward log:", err.message);
    throw err; // Re-throw so BullMQ marks the job as failed for retry
  }
}
