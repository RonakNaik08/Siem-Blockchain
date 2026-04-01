import { sha256 } from "./hash.util.js";

export function generateProof(log, logs) {
  const targetHash = sha256(JSON.stringify(log));
  const hashes = logs.map((l) => sha256(JSON.stringify(l)));

  return {
    targetHash,
    exists: hashes.includes(targetHash)
  };
}