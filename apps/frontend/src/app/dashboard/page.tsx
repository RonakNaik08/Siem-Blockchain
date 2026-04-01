"use client";

import React, { useEffect, useState } from "react";
import StatsCards from "../../components/charts/StatsCards";
import AlertPane from "../../components/alerts/AlertPanel";
import LogTable from "../../components/logs/LogTable";
import { useWallet } from "../../hooks/useWallet";
import { getSocket } from "../../lib/socket";

// TYPES
type Log = {
  id: string;
  severity: string;
  level: string;
  message: string;
  source_ip: string;
  timestamp: string | number;
  threat?: string | null;

  // 🔥 NEW FIELDS
  hash: string;
  prevHash: string;
  verified?: boolean;
};

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  source_ip: string;
  timestamp: string;
};

// NORMALIZER
const normalizeLog = (log: any): Log => ({
  id: log.id || `${Date.now()}-${Math.random()}`,
  severity: log.severity || (log.threat ? "HIGH" : "LOW"),
  level: log.level || "info",
  message: log.message || "No message",
  source_ip: log.source_ip || "unknown",
  timestamp: log.timestamp || Date.now(),
  threat: log.threat || null,

  // 🔥 blockchain fields
  hash: log.hash || "N/A",
  prevHash: log.prevHash || "N/A",
  verified: true, // default
});

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  const { account, connectWallet } = useWallet();

  // 🔥 VERIFY CHAIN FUNCTION
  const verifyChain = (logs: Log[]) => {
    return logs.map((log, i) => {
      if (i === logs.length - 1) return { ...log, verified: true };

      const prev = logs[i + 1];

      const valid = log.prevHash === prev.hash;

      return { ...log, verified: valid };
    });
  };

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      console.log("✅ Socket connected");
      setConnected(true);
    };

    const onDisconnect = () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    };

    const onNewLog = (rawData: any) => {
      console.log("📥 Incoming log:", rawData);

      const log = normalizeLog(rawData);

      setLogs((prev) => {
        const updated = [log, ...prev.slice(0, 199)];

        // 🔥 VERIFY CHAIN HERE
        return verifyChain(updated);
      });

      // 🚨 ALERT LOGIC
      if (log.threat) {
        const alert: Alert = {
          id: log.id,
          type: log.threat,
          severity: "HIGH",
          message: log.message,
          source_ip: log.source_ip,
          timestamp: new Date().toISOString(),
        };

        setAlerts((prev) => [alert, ...prev.slice(0, 49)]);
      }
    };

    // ✅ EVENTS (FIXED NAME)
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-log", onNewLog); // 🔥 FIXED

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-log", onNewLog);
    };
  }, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="card-glow flex justify-between items-center p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-primary">▦</span> Security Overview
          </h1>
          <p className="text-xs text-slate-500">
            Tamper-Proof SIEM • Blockchain • Real-time Logs
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* CONNECTION */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
            ${connected
              ? "badge-green"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {connected ? "Live Connected" : "Disconnected"}
          </div>

          {/* WALLET */}
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent
                       hover:bg-accent/20 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ⛓
            {account
              ? account.slice(0, 6) + "..." + account.slice(-4)
              : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* STATS */}
      <StatsCards logs={logs} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT */}
        <div className="col-span-8 space-y-6">

          {/* 🔥 LOG TABLE WITH STATUS */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">
              Logs (Integrity View)
            </h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="border border-slate-700 p-3 rounded-md text-xs space-y-1"
                >
                  <div className="flex justify-between">
                    <span className="text-slate-300">{log.message}</span>

                    {/* 🔥 STATUS BADGE */}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold
                      ${log.verified
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {log.verified ? "✔ Verified" : "⚠ Tampered"}
                    </span>
                  </div>

                  <p className="text-slate-500">
                    {log.source_ip} • {new Date(log.timestamp).toLocaleTimeString()}
                  </p>

                  {/* 🔥 HASH INFO */}
                  <p className="text-purple-400 break-all">
                    Hash: {log.hash.slice(0, 20)}...
                  </p>
                  <p className="text-slate-600 break-all">
                    Prev: {log.prevHash.slice(0, 20)}...
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          <AlertPane logs={logs} alerts={alerts} />

          {/* RISK */}
          <div className="card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300">
              Risk Analysis
            </h2>

            {(() => {
              const tampered = logs.filter(l => !l.verified).length;

              const label =
                tampered > 3
                  ? "🚨 Integrity Breach"
                  : tampered > 0
                  ? "⚠ Suspicious"
                  : "✅ Secure";

              const color =
                tampered > 3
                  ? "text-red-500"
                  : tampered > 0
                  ? "text-yellow-400"
                  : "text-green-400";

              return (
                <div>
                  <p className={`text-xl font-bold ${color}`}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-500">
                    Based on hash-chain validation
                  </p>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}