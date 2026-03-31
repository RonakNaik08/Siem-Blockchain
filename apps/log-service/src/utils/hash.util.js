import crypto from "crypto";

export const generateHash = (data) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");