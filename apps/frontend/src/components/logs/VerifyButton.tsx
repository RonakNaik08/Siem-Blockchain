"use client";
import React from "react";
import { useState } from "react";
import { api } from "../../services/api";
import { Button } from "../ui/Button";

export default function VerifyButton({ log }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setResult(null);

      const res = await api.verifyLog(log._id || log.id);

      setResult(res.isValid);
    } catch (err) {
      console.error("Verify error:", err);
      setResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={handleVerify}
        disabled={loading}
        className="text-xs px-3 py-1"
      >
        {loading ? "Verifying..." : "Verify"}
      </Button>

      {result !== null && (
        <span
          className={`text-xs font-semibold ${
            result ? "text-green-400" : "text-red-400"
          }`}
        >
          {result ? "Valid" : "Tampered"}
        </span>
      )}
    </div>
  );
}