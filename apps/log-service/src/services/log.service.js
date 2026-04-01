import { normalizeLog } from "../utils/normalize.util.js";
import { generateHash } from "../utils/hash.util.js";
import { storeHashOnChain } from "./blockchain.service.js";
import { emitLog } from "../websocket/socket.server.js";

export async function processLog(rawLog) {
  // ✅ normalize
  const log = normalizeLog(rawLog);

  // ✅ generate hash
  const hash = generateHash(log);

  // ✅ store in DB (you already do this)
  // await LogModel.create(log);

  // ✅ blockchain
  await storeHashOnChain(hash);

  // 🔥🔥🔥 THIS IS THE MISSING PIECE
  emitLog({
    id: log._id || log.id,
    severity: log.severity || log.logData?.severity || "LOW",
    level: log.level || log.logData?.level || "info",
    message: log.message || log.logData?.message || "No message",
    timestamp: log.timestamp || log.logData?.timestamp,
    source_ip: log.source_ip || log.ip || "unknown",
    hash,
  });

  return { log, hash };
}