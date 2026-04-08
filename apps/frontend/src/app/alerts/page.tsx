"use client";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Alert {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message?: string;
  ip?: string;
  timestamp: number;
  dismissed?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts: number) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const SEVERITY_CONFIG = {
  CRITICAL: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400", glow: "rgba(239,68,68,0.2)", icon: "🚨", left: "border-l-red-500" },
  HIGH:     { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", glow: "rgba(249,115,22,0.15)", icon: "⚠️", left: "border-l-orange-400" },
  MEDIUM:   { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "rgba(234,179,8,0.12)", icon: "🔔", left: "border-l-yellow-400" },
  LOW:      { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  glow: "rgba(52,211,153,0.1)",  icon: "ℹ️", left: "border-l-green-500"  },
};

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW;
  return (
    <div
      className={`relative border-l-4 ${cfg.left} ${cfg.bg} ${cfg.border} border rounded-xl p-4 transition-all duration-300 group`}
      style={{ boxShadow: `0 0 20px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.4)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-sm font-bold ${cfg.text}`}>
                {alert.type.replace(/_/g, " ")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.text} ${cfg.border} bg-black/20`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {alert.message || "Suspicious activity detected"}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              {alert.ip && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-600">🌐</span>
                  <span className="font-mono">{alert.ip}</span>
                </span>
              )}
              <span>{timeAgo(alert.timestamp)}</span>
              <span className="font-mono text-slate-700">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="opacity-0 group-hover:opacity-100 transition text-slate-600 hover:text-slate-300 text-lg flex-shrink-0 mt-0.5"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Summary stat ─────────────────────────────────────────────────────────────
function SummaryBadge({ severity, count }: { severity: string; count: number }) {
  const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}
         style={{ boxShadow: `0 0 24px ${cfg.glow}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{cfg.icon}</span>
        <span className={`text-3xl font-bold ${cfg.text}`}>{count}</span>
      </div>
      <p className={`text-xs font-semibold ${cfg.text}`}>{severity}</p>
      <p className="text-xs text-slate-600 mt-0.5">{count === 0 ? "all clear" : count === 1 ? "1 alert" : `${count} alerts`}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setSevFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  // Time-ago auto-refresh
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // Socket
  useEffect(() => {
    const socket = getSocket();
    const onAlert = (raw: any) => {
      const alert: Alert = {
        id: raw.id || `${Date.now()}-${Math.random()}`,
        type: raw.type || "UNKNOWN",
        severity: raw.severity || "LOW",
        message: raw.message,
        ip: raw.ip || raw.source_ip,
        timestamp: raw.timestamp || Date.now(),
      };
      if (alert.severity === "CRITICAL") toast.error(`🚨 CRITICAL: ${alert.type.replace(/_/g, " ")}`);
      else if (alert.severity === "HIGH") toast(`⚠️ ${alert.type.replace(/_/g, " ")}`, { icon: "⚠️" });
      setAlerts(prev => [alert, ...prev.slice(0, 199)]);
    };
    socket.on("alert:new", onAlert);
    return () => { socket.off("alert:new", onAlert); };
  }, []);

  const dismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const dismissAll = () => setAlerts([]);

  // Counts
  const counts = {
    CRITICAL: alerts.filter(a => a.severity === "CRITICAL").length,
    HIGH:     alerts.filter(a => a.severity === "HIGH").length,
    MEDIUM:   alerts.filter(a => a.severity === "MEDIUM").length,
    LOW:      alerts.filter(a => a.severity === "LOW").length,
  };

  // Filtered
  const filtered = alerts.filter(a => {
    const matchSev = filter === "ALL" || a.severity === filter;
    const matchQ = !query || a.message?.toLowerCase().includes(query.toLowerCase()) ||
      a.type.toLowerCase().includes(query.toLowerCase()) ||
      a.ip?.includes(query);
    return matchSev && matchQ;
  });

  const hasCritical = counts.CRITICAL > 0;

  return (
    <div className="space-y-6" key={tick}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">🚨 Alerts Center</h1>
          <p className="text-slate-500 text-sm">Real-time threat detection • Blockchain SIEM</p>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <button
              onClick={dismissAll}
              className="text-xs text-slate-500 hover:text-slate-300 border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition"
            >
              Clear all
            </button>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            hasCritical
              ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse"
              : alerts.length > 0
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
              : "bg-green-500/10 border-green-500/20 text-green-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasCritical ? "bg-red-400" : alerts.length > 0 ? "bg-orange-400" : "bg-green-400"}`} />
            {hasCritical ? "CRITICAL ALERT" : alerts.length > 0 ? `${alerts.length} Active` : "All Clear"}
          </div>
        </div>
      </div>

      {/* ── Severity summary row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SEVERITY_ORDER.map(s => (
          <SummaryBadge key={s} severity={s} count={counts[s as keyof typeof counts]} />
        ))}
      </div>

      {/* ── Critical banner ── */}
      {hasCritical && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/40"
             style={{ boxShadow: "0 0 32px rgba(239,68,68,0.15)" }}>
          <span className="text-3xl">🚨</span>
          <div className="flex-1">
            <p className="text-red-400 font-bold text-sm">CRITICAL THREAT DETECTED</p>
            <p className="text-red-300/60 text-xs mt-0.5">
              {counts.CRITICAL} critical alert{counts.CRITICAL > 1 ? "s" : ""} requiring immediate attention
            </p>
          </div>
          <button
            onClick={() => setSevFilter("CRITICAL")}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition"
          >
            View Critical
          </button>
        </div>
      )}

      {/* ── Feed ── */}
      <div className="rounded-2xl border border-gray-800 overflow-hidden"
           style={{ background: "rgba(10,15,30,0.8)" }}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-800">
          <input
            className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-slate-200
                       placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition flex-1 min-w-[160px]"
            placeholder="Search type, message, IP…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex gap-1.5 flex-wrap">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => {
              const cfg = s === "ALL" ? null : SEVERITY_CONFIG[s as keyof typeof SEVERITY_CONFIG];
              return (
                <button
                  key={s}
                  onClick={() => setSevFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    filter === s
                      ? cfg ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "bg-slate-700 text-slate-200 border-slate-600"
                      : "bg-gray-800/60 text-slate-500 border-gray-700 hover:border-gray-600 hover:text-slate-300"
                  }`}
                >
                  {s}{s !== "ALL" && counts[s as keyof typeof counts] > 0 && (
                    <span className="ml-1.5 opacity-70">({counts[s as keyof typeof counts]})</span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-600 ml-auto">{filtered.length} shown</span>
        </div>

        {/* Alert list */}
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mb-4">
                ✓
              </div>
              <p className="text-slate-300 font-semibold text-sm">
                {alerts.length === 0 ? "No alerts yet" : "No alerts match filter"}
              </p>
              <p className="text-slate-600 text-xs mt-1">
                {alerts.length === 0
                  ? "System is operating normally. Threats will appear here in real-time."
                  : "Try changing the filter or search."}
              </p>
            </div>
          ) : (
            filtered.map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={() => dismiss(alert.id)} />
            ))
          )}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-slate-600">
            <span>Total: {alerts.length} • Dismissed shows on refresh</span>
            <span>Hover a card to dismiss</span>
          </div>
        )}
      </div>

      {/* ── Threat type breakdown ── */}
      {alerts.length > 0 && (() => {
        const typeMap: Record<string, number> = {};
        alerts.forEach(a => { typeMap[a.type] = (typeMap[a.type] || 0) + 1; });
        const sorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const max = sorted[0]?.[1] || 1;
        return (
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <h2 className="text-sm font-semibold text-slate-200 mb-4">📊 Threat Type Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {sorted.map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">{type.replace(/_/g, " ")}</span>
                    <span className="text-slate-500">{count}x</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-700"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}