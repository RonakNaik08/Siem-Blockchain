"use client";

import React, { useEffect, useRef } from "react";
import AlertCard from "./AlertCard";
import { useAlerts } from "../../hooks/useAlerts";

export default function AlertsPanel() {
  const { alerts } = useAlerts();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 SOUND ON CRITICAL ALERT
  useEffect(() => {
    if (!alerts.length) return;

    const latest = alerts[0];

    if (latest.severity === "CRITICAL") {
      audioRef.current?.play().catch(() => {});
    }
  }, [alerts]);

  return (
    <div className="card h-full flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-danger text-sm">⚠</span>
          <h2 className="text-sm font-semibold text-slate-200">Alerts</h2>
        </div>
        <span className={`badge ${alerts.length > 0 ? "badge-red" : "badge-green"}`}>
          {alerts.length > 0 ? `${alerts.length} active` : "Clear"}
        </span>
      </div>

      {/* ALERT LIST */}
      <div className="overflow-y-auto flex-1 max-h-[360px] p-3 space-y-2">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-2xl mb-2">✓</span>
            <p className="text-slate-500 text-sm">No active alerts</p>
            <p className="text-slate-600 text-xs mt-1">System is operating normally</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <AlertCard key={i} alert={alert} />
          ))
        )}
      </div>

      {/* AUDIO */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
    </div>
  );
}