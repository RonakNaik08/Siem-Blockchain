import crypto from "crypto";
import { ENV } from "../config/env.js";

const ALGO = "aes-256-gcm";

export const encrypt = (data) => {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGO,
    Buffer.from(ENV.ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex")
  };
};

export const decrypt = (payload) => {
  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(ENV.ENCRYPTION_KEY),
    Buffer.from(payload.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

  let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
};