"use client";

import React, { useEffect, useState } from "react";
import StatsCards from "../../components/charts/StatsCards"; 
import LogPanel from "../../components/dashboard/LogPanel"; 
import AlertPane from "../../components/alerts/AlertPanel";
 import { useWallet } from "../../hooks/useWallet";
  import { useSocket } from "../../hooks/useSocket"; 



export default function DashboardPage() {

  const [logs, setLogs] = useState<any[]>([]);

  // 🦊 Wallet
  const { account, connectWallet } = useWallet();

  // 🔌 Real-time socket
  useSocket((data: any) => {
    setLogs((prev) => [data, ...prev.slice(0, 199)]);
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="card-glow flex justify-between items-center p-5">

        {/* LEFT */}
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-primary">▦</span> Security Overview
          </h1>
          <p className="text-xs text-slate-500">
            Real-time monitoring &amp; blockchain log integrity
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* SYSTEM STATUS */}
          <div className="flex items-center gap-2 badge-green px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full glow-dot" />
            <span className="text-xs font-medium">System Active</span>
          </div>

          {/* WALLET */}
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent
                       hover:bg-accent/20 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ boxShadow: "0 0 12px rgba(167,139,250,0.15)" }}
          >
            <span className="text-xs">⛓</span>
            {account
              ? account.slice(0, 6) + "..." + account.slice(-4)
              : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* 📊 STATS */}
      <StatsCards logs={logs} />

      {/* 🧩 MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT SIDE (LOGS) */}
        <div className="col-span-8 space-y-6">

          {/* LOG TABLE (REAL-TIME) */}
          <div>LogTable component is missing. Please implement or import it.</div>

        </div>

        {/* RIGHT SIDE (ALERTS + RISK) */}
        <div className="col-span-4 space-y-6">

          {/* 🚨 ALERT PANEL */}
          <AlertPane />

          {/* RISK CARD */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">Risk Analysis</h2>
              <span className="text-warning text-xs">⚠ Live</span>
            </div>

            {(() => {
              const highCount = logs.filter(
                (l) => l.severity === "HIGH" || l.severity === "CRITICAL"
              ).length;
              const isHigh   = highCount > 5;
              const isMedium = !isHigh && logs.length > 5;
              const label    = isHigh ? "High Risk" : isMedium ? "Medium Risk" : "Low Risk";
              const color    = isHigh ? "text-danger" : isMedium ? "text-warning" : "text-success";
              const barColor = isHigh ? "bg-danger"  : isMedium ? "bg-warning"  : "bg-success";
              const pct      = Math.min(logs.length * 5, 100);
              return (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Threat Level</p>
                    <p className={`text-2xl font-bold ${color}`}>{label}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Activity</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-2 h-1.5 rounded-full">
                      <div
                        className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Based on live log activity</p>
                </div>
              );
            })()}
          </div>

        </div>

      </div>
    </div>
  );
}