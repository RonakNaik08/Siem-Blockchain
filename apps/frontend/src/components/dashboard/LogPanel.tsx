"use client";

import { useState } from "react";
import { useBlockchain } from "../../hooks/useBlockchain";

export default function LogPanel({ onNewLog }: any) {
  const { addLog } = useBlockchain();
  const [logText, setLogText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!logText) return;

    setLoading(true);

    try {
      const res = await addLog(logText);

      onNewLog({
        id: res.logId,
        message: logText,
        hash: res.hash,
        verified: true,
        timestamp: Date.now(),
      });

      setLogText("");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="card p-4">
      <h2 className="text-lg font-bold mb-2">Add Security Log</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter security event..."
        value={logText}
        onChange={(e) => setLogText(e.target.value)}
      />

      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Storing..." : "Store on Blockchain"}
      </button>
    </div>
  );
}