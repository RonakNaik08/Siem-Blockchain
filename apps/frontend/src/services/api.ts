import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
});

export const api = {
  /** Fetch most recent 100 logs from MongoDB */
  getLogs: async () => {
    const res = await client.get("/api/logs");
    // Logs are stored FLAT by hashChain.service.js — but support nested logData as fallback
    return res.data.map((log: any) => ({
      _id: log._id,
      id: log._id,
      message: log.message || log.logData?.message || "",
      level: log.level || log.logData?.level || "info",
      severity: log.severity || log.logData?.severity || "LOW",
      type: log.type || log.logData?.type || "",
      source_ip: log.source_ip || log.ip || log.logData?.ip || "unknown",
      timestamp: log.timestamp || log.logData?.timestamp || new Date(log.createdAt).getTime(),
      verified: log.verified,
      hash: log.hash,
      prevHash: log.prevHash,
      txHash: log.txHash || null,
      blockNumber: log.blockNumber || null,
      createdAt: log.createdAt,
    }));
  },

  /** Verify a log's integrity against its blockchain hash */
  verifyLog: async (id: string) => {
    const res = await client.get(`/api/logs/${id}/verify`);
    return res.data as { isValid: boolean; currentHash: string; chainHash: string };
  },
};

