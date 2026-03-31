import { getContract } from "@/lib/blockchain/contract";

// hash function (browser safe)
const hashLog = async (log) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(log);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const verifyLog = async (logId, message) => {
  const contract = await getContract();

  const hash = await hashLog(message);

  return await contract.verifyLog(logId, hash);
};