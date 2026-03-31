import crypto from "crypto";

export const generateHash = (log) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(log))
    .digest("hex");
};