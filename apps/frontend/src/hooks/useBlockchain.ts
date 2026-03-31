"use client";

import { useState } from "react";
import { api } from "../services/api";

/** Hook for blockchain-backed log verification via the backend API */
export function useBlockchain() {
  const [loading, setLoading] = useState(false);

  /**
   * Ask the backend to verify a log against its on-chain hash.
   * Returns { isValid, currentHash, chainHash } or null on error.
   */
  const verifyLog = async (id: string) => {
    setLoading(true);
    try {
      return await api.verifyLog(id);
    } catch (err) {
      console.error("[useBlockchain] verifyLog failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { verifyLog, loading };
}
