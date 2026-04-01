"use client";

import React, { useEffect, useState } from "react";
import StatsCards from "../../components/charts/StatsCards";
import AlertPane from "../../components/alerts/AlertPanel";
import LogTable from "../../components/logs/LogTable";
import { useWallet } from "../../hooks/useWallet";
import { getSocket } from "../../lib/socket"; // ✅ FIXED

// TYPES
type Log = {
  id: string;
  severity: string;
  level: string;
  message: string;
  source_ip: string;
  timestamp: string | number;
  threat?: string | null;
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
});

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  const { account, connectWallet } = useWallet();

  useEffect(() => {
    const socket = getSocket(); // 🔥 SINGLE INSTANCE

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
        if (prev.some((l) => l.id === log.id)) return prev;
        return [log, ...prev.slice(0, 199)];
      });

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

    // ✅ REGISTER EVENTS
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_log", onNewLog);

    // 🧹 CLEANUP
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_log", onNewLog);
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
            Real-time SIEM • Kafka • Socket.IO • Threat Detection
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* CONNECTION STATUS */}
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
          <LogTable logs={logs} />
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          <AlertPane logs={logs} alerts={alerts} />

          {/* RISK ANALYSIS */}
          <div className="card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300">
              Risk Analysis
            </h2>

            {(() => {
              const highCount = logs.filter(
                (l) =>
                  l.severity === "HIGH" ||
                  l.severity === "CRITICAL"
              ).length;

              const isHigh = highCount > 5;
              const isMedium = !isHigh && logs.length > 5;

              const label = isHigh
                ? "High Risk"
                : isMedium
                ? "Medium Risk"
                : "Low Risk";

              const color = isHigh
                ? "text-red-500"
                : isMedium
                ? "text-yellow-400"
                : "text-green-400";

              const pct = Math.min(logs.length * 5, 100);

              return (
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${color}`}>
                    {label}
                  </p>

                  <div className="w-full bg-gray-800 h-1.5 rounded">
                    <div
                      className="bg-purple-500 h-1.5 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    Based on real-time stream
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