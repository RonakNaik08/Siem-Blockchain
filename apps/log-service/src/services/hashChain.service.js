import crypto from "crypto";

// ⚠️ In production → store this in DB or Redis
let lastHash = "GENESIS_HASH";

export const createLogWithHash = (log) => {
  const logString = JSON.stringify(log);

  const hash = crypto
    .createHash("sha256")
    .update(logString + lastHash)
    .digest("hex");

  const newLog = {
    ...log,
    hash,
    prevHash: lastHash,
    timestamp: log.timestamp || Date.now(),
  };

  // update chain
  lastHash = hash;

  return newLog;
};