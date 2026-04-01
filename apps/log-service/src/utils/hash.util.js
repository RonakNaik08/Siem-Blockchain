import crypto from "crypto";

export function generateHash(log) {
  const data = JSON.stringify(log);
  return crypto.createHash("sha256").update(data).digest("hex");
}