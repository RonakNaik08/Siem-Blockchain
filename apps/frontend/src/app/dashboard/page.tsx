"use client";

import { useState } from "react";
import StatsCards from "../../components/charts/StatsCards";
import LogPanel from "../../components/dashboard/LogPanel";
import AlertPanel from "../../components/alerts/AlertPanel";

import { useWallet } from "../../hooks/useWallet";
import { useSocket } from "../../hooks/useSocket";
import { verifyLog } from "../../hooks/useBlockchain";

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);

  // 🦊 MetaMask
  const { account, connectWallet } = useWallet();

  // 🔌 WebSocket (real-time logs + alerts)
  useSocket((data: any) => {
    // 🚨 handle alerts separately
    if (data.type === "ALERT") {
      alert("🚨 " + data.message);
    }

    setLogs((prev) => [data, ...prev]);
  });

  // Manual add (from LogPanel)
  const addLogToState = (log: any) => {
    setLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold glow">
          🛡 SIEM Security Dashboard
        </h1>

        <div className="flex items-center gap-4">

          {/* STATUS */}
          <div className="text-sm text-green-400">
            ● System Active
          </div>

          {/* 🦊 WALLET BUTTON */}
          <button
            onClick={connectWallet}
            className="bg-purple-600 px-4 py-2 rounded text-white"
          >
            {account
              ? account.slice(0, 6) + "..."
              : "Connect Wallet"}
          </button>

        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-8 space-y-6">

          <StatsCards logs={logs} />

          <LogPanel onNewLog={addLogToState} />

          {/* LOG TABLE */}
          <div className="card p-4">
            <h2 className="text-lg mb-3">📜 Live Logs</h2>

            <div className="space-y-2 max-h-60 overflow-y-auto">

              {logs.length === 0 && (
                <p className="text-gray-400">
                  No logs yet...
                </p>
              )}

              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center border-b border-gray-700 py-2"
                >
                  {/* LEFT: log info */}
                  <div>
                    <p>{log.message || "No message"}</p>

                    <p className="text-xs text-cyan-400">
                      {log.hash
                        ? log.hash.slice(0, 10) + "..."
                        : "N/A"}
                    </p>
                  </div>

                  {/* RIGHT: verify button */}
                  <button
                    onClick={async () => {
                      try {
                        const valid = await verifyLog(
                          log.id,
                          log.message
                        );

                        alert(
                          valid
                            ? "✅ Log Verified"
                            : "❌ Log Tampered"
                        );
                      } catch (err) {
                        console.error(err);
                        alert("Verification failed");
                      }
                    }}
                    className="bg-green-600 px-2 py-1 rounded text-xs"
                  >
                    Verify
                  </button>
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-4 space-y-6">

          {/* REAL ALERT PANEL */}
          <AlertPanel logs={logs || []} />

          {/* RISK CARD */}
          <div className="card p-4">
            <h2 className="text-lg mb-2">📊 Risk Analysis</h2>

            <p className="text-yellow-400">
              {logs.filter((l) => l.type === "ALERT").length > 0
                ? "High Risk"
                : logs.length > 5
                ? "Medium Risk"
                : "Low Risk"}
            </p>

            <p className="text-sm text-gray-400">
              Score: {logs.length * 10}%
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}