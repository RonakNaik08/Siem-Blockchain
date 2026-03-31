import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
});

export const api = {
  /** Fetch most recent 200 logs from MongoDB */
  getLogs: async () => {
    const res = await client.get("/api/logs");
    // Flatten nested logData for consistent shape
    return res.data.map((log: any) => ({
      _id: log._id,
      message: log.logData?.message || "",
      level: log.logData?.level || "info",
      severity: log.logData?.severity || "LOW",
      type: log.logData?.type || "",
      ip: log.logData?.ip || null,
      timestamp: log.logData?.timestamp || new Date(log.createdAt).getTime(),
      verified: log.verified,
      hash: log.hash,
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
