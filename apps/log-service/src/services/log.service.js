import { normalizeLog } from "../utils/normalize.util.js";
import { createLogWithHash } from "./hashChain.service.js";
import { addToBatch } from "./batch.service.js";
import { emitLog } from "../websocket/socket.server.js";

export async function processLog(rawLog) {
  // ✅ 1. Normalize
  const normalized = normalizeLog(rawLog);

  // ✅ 2. Apply HASH CHAIN (IMPORTANT)
  const log = createLogWithHash(normalized);

  // ✅ 3. Store in DB (uncomment when ready)
  // await LogModel.create(log);

  // ✅ 4. Send to batch → Merkle → Blockchain
  await addToBatch(log);

  // ✅ 5. Emit to UI (real-time)
  emitLog({
    id: log._id || log.id,
    severity: log.severity || "LOW",
    level: log.level || "info",
    message: log.message || "No message",
    timestamp: log.timestamp,
    source_ip: log.source_ip || "unknown",
    hash: log.hash,
    prevHash: log.prevHash, // 🔥 IMPORTANT for UI/debug
  });

  return log;
}