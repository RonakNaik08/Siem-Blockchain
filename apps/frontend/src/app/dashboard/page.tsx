"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/services/api";
import dynamic from "next/dynamic";

const TimeSeriesChart = dynamic(() => import("@/components/charts/TimeSeriesChart"), { ssr: false });
const GeoIPMap = dynamic(() => import("@/components/charts/GeoIPMap"), { ssr: false });
const LiveAttackMap = dynamic(() => import("@/components/charts/LiveAttackMap"), { ssr: false });

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Log {
  id: string;
  message: string;
  level: string;
  severity: string;
  source_ip?: string;
  timestamp: number;
  hash?: string;
  prevHash?: string;
  txHash?: string | null;
  blockNumber?: number | null;
  verified?: boolean;
  type?: string;
  anomaly_score?: number;
  is_anomaly?: boolean;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  ip?: string;
  timestamp: number;
  score?: number;
  details?: string;
}

interface BlockchainStatus {
  chainLength: number;
  isValid: boolean;
  latestBlock?: { index: number; hash: string; timestamp: number };
}

interface SoarAction {
  id: string;
  action: string;
  target: string;
  timestamp: number;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeLog = (raw: any): Log => ({
  id: raw.id || raw._id || `${Date.now()}-${Math.random()}`,
  message: raw.message || raw.logData?.message || "No message",
  level: raw.level || raw.logData?.level || "info",
  severity: raw.severity || raw.logData?.severity || "LOW",
  source_ip: raw.source_ip || raw.ip || raw.logData?.ip || "unknown",
  timestamp: Number(raw.timestamp || (raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now())),
  hash: raw.hash,
  prevHash: raw.prevHash,
  txHash: raw.txHash ?? null,
  blockNumber: raw.blockNumber ?? null,
  verified: raw.verified,
  type: raw.type || raw.logData?.type || "",
  anomaly_score: raw.anomaly_score || 0,
  is_anomaly: raw.is_anomaly || false,
});

const levelColor = (l: string) =>
  l === "error" ? "#f87171" : l === "warn" ? "#fbbf24" : "#34d399";

const severityBg = (s: string) =>
  s === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/30" :
  s === "HIGH"     ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
  s === "MEDIUM"   ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                     "bg-green-500/20 text-green-400 border-green-500/30";

function timeAgo(ts: number) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

// ─── Mini spark-bar chart ──────────────────────────────────────────────────
function SparkBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          style={{ height: `${Math.max(4, (v / max) * 100)}%`, backgroundColor: color, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5 }}
          className="w-1.5 rounded-sm transition-all duration-300"
        />
      ))}
    </div>
  );
}

// ─── Animated counter ──────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const diff = value - display;
    if (diff === 0) return;
    const step = Math.ceil(Math.abs(diff) / 8);
    const timer = setTimeout(() => setDisplay(d => diff > 0 ? Math.min(d + step, value) : Math.max(d - step, value)), 40);
    return () => clearTimeout(timer);
  }, [value, display]);
  return <>{display}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color, spark, unit = ""
}: {
  label: string; value: number | string; sub: string; icon: string;
  color: string; spark?: number[]; unit?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 space-y-3 ${color}`}
         style={{ background: "rgba(10,15,30,0.8)", backdropFilter: "blur(8px)" }}>
      {/* Glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
           style={{ background: "currentColor" }} />
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {spark && <SparkBar data={spark} color="currentColor" />}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}{unit}
        </p>
        <p className="text-xs font-medium opacity-60 mt-0.5">{label}</p>
      </div>
      <p className="text-xs opacity-40">{sub}</p>
    </div>
  );
}

// ─── Activity Timeline ─────────────────────────────────────────────────────
function ActivityTimeline({ logs }: { logs: Log[] }) {
  const recent = logs.slice(0, 8);
  return (
    <div className="space-y-0">
      {recent.length === 0 && (
        <p className="text-slate-500 text-sm py-4 text-center">Waiting for logs…</p>
      )}
      {recent.map((log, i) => (
        <div key={log.id} className="flex gap-3 group">
          {/* Timeline spine */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                 style={{ backgroundColor: levelColor(log.level), boxShadow: `0 0 6px ${levelColor(log.level)}` }} />
            {i < recent.length - 1 && <div className="w-px flex-1 bg-gray-800 mt-1" />}
          </div>
          {/* Content */}
          <div className={`pb-3 flex-1 min-w-0 ${i === 0 ? "group-first:pb-0" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-300 truncate font-mono">{log.message}</p>
              <span className="text-xs text-slate-600 flex-shrink-0">{timeAgo(log.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-600">{log.source_ip || "—"}</span>
              <span className={`text-xs px-1.5 py-0 rounded border ${severityBg(log.severity)}`}>
                {log.severity}
              </span>
              {log.txHash && <span className="text-xs text-blue-400/60">⛓ #{log.blockNumber}</span>}
              {log.anomaly_score !== undefined && log.anomaly_score > 0 && (
                <span className={`text-[10px] px-1 rounded flex items-center gap-1 ${
                  log.anomaly_score > 70 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                }`}>
                  <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  AI: {log.anomaly_score}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Threat Feed ──────────────────────────────────────────────────────────
function ThreatFeed({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mb-3">✓</div>
        <p className="text-slate-400 text-sm font-medium">No Active Threats</p>
        <p className="text-slate-600 text-xs mt-1">System operating normally</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {alerts.slice(0, 6).map((alert, i) => (
        <div key={alert.id || i}
             className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition group">
          <span className="text-lg mt-0.5">
            {alert.type?.includes("AI") ? "🧠" : alert.severity === "CRITICAL" ? "🚨" : alert.severity === "HIGH" ? "⚠️" : "🔔"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">{alert.type?.replace(/_/g, " ")}</p>
              <span className="text-xs text-slate-600">{timeAgo(alert.timestamp)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{alert.message || alert.details}</p>
            {alert.ip && <p className="text-[10px] text-slate-600 mt-1 font-mono">SOURCE: {alert.ip}</p>}
            {alert.score && (
              <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${alert.score}%` }} />
              </div>
            )}
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 ${severityBg(alert.severity)}`}>
            {alert.severity}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Hash Chain Widget ────────────────────────────────────────────────────
function ChainWidget({ logs }: { logs: Log[] }) {
  const withHash = logs.filter(l => l.hash);
  const onChain = logs.filter(l => l.txHash);
  const pct = withHash.length > 0 ? Math.round((onChain.length / withHash.length) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="44" cy="44" r="36" fill="none" stroke="#22d3ee" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 44 44)"
                  style={{ transition: "stroke-dashoffset 0.6s ease", filter: "drop-shadow(0 0 6px rgba(34,211,238,0.5))" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-cyan-400">{pct}%</span>
          <span className="text-[9px] text-slate-500">anchored</span>
        </div>
      </div>
      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-slate-400 text-xs">{onChain.length} on-chain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="text-slate-500 text-xs">{withHash.length - onChain.length} pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-slate-400 text-xs">{withHash.length} hashed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Log Activity Bars (last 12 minutes) ─────────────────────────────────
function useActivityBuckets(logs: Log[], buckets = 12) {
  const now = Date.now();
  const bucketMs = 60_000; // 1 min each
  return Array.from({ length: buckets }, (_, i) => {
    const start = now - (buckets - i) * bucketMs;
    const end = start + bucketMs;
    return logs.filter(l => l.timestamp >= start && l.timestamp < end).length;
  });
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soarActions, setSoarActions] = useState<SoarAction[]>([]);
  const [connected, setConnected] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [tick, setTick] = useState(0); // force re-render for timeAgo

  // Re-render every 10s for time-ago display
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // Load initial logs
  useEffect(() => {
    api.getLogs().then(data => setLogs(data.map(normalizeLog))).catch(() => {});
  }, []);

  // Load blockchain status
  useEffect(() => {
    fetch(`${BACKEND}/blockchain/status`)
      .then(r => r.json())
      .then(d => setBlockchainStatus(d))
      .catch(() => {});
    const t = setInterval(() => {
      fetch(`${BACKEND}/blockchain/status`)
        .then(r => r.json())
        .then(d => setBlockchainStatus(d))
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(t);
  }, []);

  // Socket
  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNewLog = (raw: any) => {
      const log = normalizeLog(raw);
      setLogs(prev => {
        if (prev.find(l => l.id === log.id)) return prev;
        return [log, ...prev.slice(0, 299)];
      });
    };
    const onAlert = (alert: any) => {
      setAlerts(prev => [{ ...alert, timestamp: alert.timestamp || Date.now() }, ...prev.slice(0, 49)]);
      
      // Auto-populate SOAR actions for critical threats
      if (alert.severity === "CRITICAL") {
        const action = {
          id: Math.random().toString(),
          action: "BLOCK_IP",
          target: alert.ip || "unknown",
          timestamp: Date.now(),
          status: "ENFORCED"
        };
        setSoarActions(prev => [action, ...prev.slice(0, 9)]);
      }
    };
    const onConfirmed = ({ id, _id, txHash, blockNumber }: any) => {
      const matchId = id || _id;
      setLogs(prev => prev.map(l => l.id === matchId ? { ...l, txHash, blockNumber } : l));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-log", onNewLog);
    socket.on("alert:new", onAlert);
    socket.on("log:confirmed", onConfirmed);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-log", onNewLog);
      socket.off("alert:new", onAlert);
      socket.off("log:confirmed", onConfirmed);
    };
  }, []);

  // Computed stats
  const threats = logs.filter(l =>
    l.severity === "HIGH" || l.severity === "CRITICAL" ||
    l.message?.toLowerCase().includes("attack") ||
    l.message?.toLowerCase().includes("failed")
  ).length;
  const onChain = logs.filter(l => l.txHash).length;
  const integrity = logs.length > 0 ? Math.round((logs.filter(l => l.verified !== false).length / logs.length) * 100) : 100;
  const activityBuckets = useActivityBuckets(logs);
  const threatBuckets = useActivityBuckets(logs.filter(l => l.severity === "HIGH" || l.severity === "CRITICAL"));

  const systemStatus = alerts.filter(a => a.severity === "CRITICAL").length > 0 ? "CRITICAL"
    : threats > 5 ? "AT RISK"
    : threats > 0 ? "WARNING"
    : "SECURE";

  const statusColor =
    systemStatus === "CRITICAL" ? "text-red-400" :
    systemStatus === "AT RISK"  ? "text-orange-400" :
    systemStatus === "WARNING"  ? "text-yellow-400" : "text-green-400";

  const statusBg =
    systemStatus === "CRITICAL" ? "bg-red-500/10 border-red-500/40" :
    systemStatus === "AT RISK"  ? "bg-orange-500/10 border-orange-500/40" :
    systemStatus === "WARNING"  ? "bg-yellow-500/10 border-yellow-500/40" : "bg-green-500/10 border-green-500/40";

  return (
    <div className="space-y-5">

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security Overview</h1>
          <p className="text-slate-500 text-xs mt-0.5">Tamper-proof SIEM • Blockchain-anchored • Real-time</p>
        </div>
        <div className="flex items-center gap-3">
          {/* System status pill */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-wide ${statusBg} ${statusColor}`}>
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === "SECURE" ? "bg-green-400 animate-pulse" : "bg-red-400 animate-pulse"
            }`} />
            {systemStatus}
          </div>
          {/* Live indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border ${
            connected ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-slate-800 border-slate-700 text-slate-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
            {connected ? "Live" : "Offline"}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📊" label="Total Logs" value={logs.length}
          sub="events captured" color="border-cyan-500/20 text-cyan-400"
          spark={activityBuckets}
        />
        <StatCard
          icon="🚨" label="Threats Detected" value={threats}
          sub={threats === 0 ? "all clear" : "requires attention"}
          color={`border-red-500/20 ${threats > 0 ? "text-red-400" : "text-green-400"}`}
          spark={threatBuckets}
        />
        <StatCard
          icon="⛓" label="On-chain Anchored" value={onChain}
          sub={`${logs.length > 0 ? Math.round((onChain / logs.length) * 100) : 0}% of logs`}
          color="border-purple-500/20 text-purple-400"
        />
        <StatCard
          icon="🔐" label="Integrity Score" value={integrity}
          sub="hash-chain verified" color="border-emerald-500/20 text-emerald-400"
          unit="%"
        />
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Left column — 8 */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Live Activity Feed
              </h2>
              <span className="text-xs text-slate-500">{logs.length} events</span>
            </div>
            <ActivityTimeline logs={logs} key={tick} />
          </div>

          {/* Bottom row: Blockchain widget + Recent Errors */}
          <div className="grid grid-cols-2 gap-4">

            {/* Blockchain anchor status */}
            <div className="rounded-2xl border border-gray-800 p-5"
                 style={{ background: "rgba(10,15,30,0.8)" }}>
              <h2 className="text-sm font-semibold text-slate-200 mb-4">⛓ Blockchain Anchor</h2>
              <ChainWidget logs={logs} />
              {blockchainStatus && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">In-memory blocks</span>
                    <span className="text-slate-300 font-mono">{blockchainStatus.chainLength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chain valid</span>
                    <span className={blockchainStatus.isValid ? "text-green-400" : "text-red-400"}>
                      {blockchainStatus.isValid ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  {blockchainStatus.latestBlock && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Latest block</span>
                      <span className="text-slate-300 font-mono">#{blockchainStatus.latestBlock.index}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top threat IPs */}
            <div className="rounded-2xl border border-gray-800 p-5"
                 style={{ background: "rgba(10,15,30,0.8)" }}>
              <h2 className="text-sm font-semibold text-slate-200 mb-4">🌐 Top Threat Sources</h2>
              {(() => {
                const ipMap: Record<string, number> = {};
                logs.filter(l => l.severity === "HIGH" || l.severity === "CRITICAL")
                    .forEach(l => { if (l.source_ip) ipMap[l.source_ip] = (ipMap[l.source_ip] || 0) + 1; });
                const sorted = Object.entries(ipMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
                if (sorted.length === 0) return (
                  <p className="text-slate-600 text-xs py-4 text-center">No threat IPs detected</p>
                );
                const max = sorted[0][1];
                return (
                  <div className="space-y-2.5">
                    {sorted.map(([ip, count]) => (
                      <div key={ip}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-mono">{ip}</span>
                          <span className="text-red-400 font-semibold">{count} hits</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right column — 4 */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Threat Feed */}
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                ⚠ Threat Feed
              </h2>
              {alerts.length > 0 && (
                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {alerts.length} active
                </span>
              )}
            </div>
            <div className="mb-4">
              <LiveAttackMap alerts={alerts} />
            </div>
            <ThreatFeed alerts={alerts} />
          </div>

          {/* SOAR Active Response */}
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-blue-400">🛡️</span> SOAR Active Response
            </h2>
            {soarActions.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-4 italic">No recent defensive actions</p>
            ) : (
              <div className="space-y-3">
                {soarActions.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-2 rounded bg-blue-500/5 border border-blue-500/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-400 font-bold uppercase">{act.action}</span>
                      <span className="text-xs text-slate-400">{act.target}</span>
                    </div>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded uppercase font-bold">{act.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log level breakdown */}
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <h2 className="text-sm font-semibold text-slate-200 mb-4">📊 Log Breakdown</h2>
            {(() => {
              const counts = {
                error: logs.filter(l => l.level === "error").length,
                warn:  logs.filter(l => l.level === "warn").length,
                info:  logs.filter(l => l.level === "info").length,
              };
              const total = logs.length || 1;
              const bars = [
                { label: "Error", count: counts.error, color: "from-red-600 to-red-400", text: "text-red-400" },
                { label: "Warn",  count: counts.warn,  color: "from-yellow-600 to-yellow-400", text: "text-yellow-400" },
                { label: "Info",  count: counts.info,  color: "from-cyan-600 to-cyan-400", text: "text-cyan-400" },
              ];
              return (
                <div className="space-y-3">
                  {bars.map(({ label, count, color, text }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${text}`}>{label}</span>
                        <span className="text-slate-500">{count} <span className="text-slate-700">/ {logs.length}</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                             style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-gray-800 p-5"
               style={{ background: "rgba(10,15,30,0.8)" }}>
            <h2 className="text-sm font-semibold text-slate-200 mb-3">⚡ Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "View All Logs", href: "/logs", icon: "📋", color: "hover:border-cyan-500/40 hover:text-cyan-400" },
                { label: "Blockchain Ledger", href: "/blockchain", icon: "⛓", color: "hover:border-purple-500/40 hover:text-purple-400" },
                { label: "Alerts Center", href: "/alerts", icon: "🚨", color: "hover:border-red-500/40 hover:text-red-400" },
              ].map(({ label, href, icon, color }) => (
                <a key={href} href={href}
                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800 text-slate-400 text-sm transition group ${color}`}>
                  <span className="text-base">{icon}</span>
                  <span className="font-medium group-hover:text-current transition">{label}</span>
                  <span className="ml-auto text-slate-700 group-hover:text-current transition">→</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}