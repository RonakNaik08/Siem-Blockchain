import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000", // ✅ FIX
});

export const api = {
  getLogs: async () => {
    // Implementation for getLogs
  },
  verifyLog: async (id: string) => {
    // Mock implementation for verifyLog
    return { isValid: id === "validId" };
  },
};