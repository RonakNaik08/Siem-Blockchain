"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/services/api";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Terminal, List, Shield, 
  Database, Activity, ChevronRight, Download,
  CloudUpload, CheckCircle, AlertTriangle
} from "lucide-react";

const LogDetailsPanel = dynamic(() => import("@/components/logs/LogDetailsPanel"), { ssr: false });

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Log {
  id: string;
  _id?: string;
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
  chainIntegrity?: "ok" | "broken" | "genesis" | "unknown";
}

// ─── Hash-chain verifier ──────────────────────────────────────────────────────
function tagChainIntegrity(logs: Log[]): Log[] {
  return logs.map((log, i) => {
    if (!log.hash) return { ...log, chainIntegrity: "unknown" };
    if (!log.prevHash || log.prevHash === "0") return { ...log, chainIntegrity: "genesis" };
    const olderLog = logs[i + 1];
    if (!olderLog?.hash) return { ...log, chainIntegrity: "unknown" };
    return {
      ...log,
      chainIntegrity: log.prevHash === olderLog.hash ? "ok" : "broken",
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeLog = (raw: any): Log => ({
  id: raw.id || raw._id || `${Date.now()}-${Math.random()}`,
  message: raw.message || raw.logData?.message || "No message",
  level: raw.level || raw.logData?.level || "info",
  severity: raw.severity || raw.logData?.severity || "LOW",
  source_ip: raw.source_ip || raw.ip || raw.logData?.ip || "unknown",
  timestamp: Number(raw.timestamp || raw.logData?.timestamp || (raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now())),
  hash: raw.hash,
  prevHash: raw.prevHash,
  txHash: raw.txHash ?? null,
  blockNumber: raw.blockNumber ?? null,
  verified: raw.verified,
});

const levelColor = (l: string) =>
  l === "error" ? "text-red-400" : l === "warn" ? "text-yellow-400" : "text-green-400";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [isPulseMode, setIsPulseMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const pulseEndRef = useRef<HTMLDivElement>(null);

  // States for Modals/Tools
  const [showTools, setShowTools] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [uploadSource, setUploadSource] = useState("manual-upload");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Initial Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.getLogs()
      .then((data) => setLogs(tagChainIntegrity(data.map(normalizeLog))))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Live Socket ────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    const onNew = (raw: any) => {
      const log = normalizeLog(raw);
      setLogs((prev) => {
        if (prev.find((l) => l.id === log.id)) return prev;
        return tagChainIntegrity([log, ...prev.slice(0, 499)]);
      });
    };
    const onConfirmed = ({ id, _id, txHash, blockNumber }: any) => {
      const matchId = id || _id;
      setLogs((prev) => prev.map((l) => l.id === matchId ? { ...l, txHash, blockNumber } : l));
    };
    socket.on("new-log", onNew);
    socket.on("log:confirmed", onConfirmed);
    return () => { socket.off("new-log", onNew); socket.off("log:confirmed", onConfirmed); };
  }, []);

  // Scroll to bottom in pulse mode
  useEffect(() => {
    if (isPulseMode) {
      pulseEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPulseMode]);

  const handleUpload = async () => {
    if (!uploadText.trim()) return;
    setSubmitLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${BACKEND}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: uploadText, source: uploadSource, level: "info" }),
      });
      const data = await res.json();
      if (data.success || data.data) {
        setStatusMsg({ type: "success", text: "Log anchored to blockchain!" });
        setUploadText("");
      } else {
        setStatusMsg({ type: "error", text: data.error || "Submission failed" });
      }
    } catch (e: any) {
      setStatusMsg({ type: "error", text: "Backend unreachable" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchLevel = filter === "ALL" || l.level === filter;
    const matchQuery = !query || l.message.toLowerCase().includes(query.toLowerCase()) || l.source_ip?.toLowerCase().includes(query.toLowerCase());
    return matchLevel && matchQuery;
  });

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col gap-6">
      
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database size={24} />
            </span>
            Log Explorer
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Secure, hash-chained log telemetry anchored directly to the blockchain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setIsPulseMode(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${!isPulseMode ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              <List size={14} /> Classic
            </button>
            <button 
              onClick={() => setIsPulseMode(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${isPulseMode ? "bg-cyan-500 text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              <Terminal size={14} /> Pulse
            </button>
          </div>
          <button 
            onClick={() => setShowTools(!showTools)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition flex items-center gap-2"
          >
            <CloudUpload size={16} /> Ingenst Tool
          </button>
        </div>
      </header>

      {/* ── Quick Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill label="Telemetric Stream" value={`${logs.length}`} icon={<Activity size={14} />} color="text-cyan-400" />
        <StatPill label="Tamper Status" value={logs.some(l => l.chainIntegrity === 'broken') ? 'WARNING' : 'SECURE'} 
                  icon={<Shield size={14} />} color={logs.some(l => l.chainIntegrity === 'broken') ? 'text-red-400' : 'text-green-400'} />
        <StatPill label="Avg Severity" value="LOW" icon={<AlertTriangle size={14} />} color="text-blue-400" />
        <StatPill label="Live Ops" value="ACTIVE" icon={<div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>} color="text-green-500" />
      </div>

      <AnimatePresence>
        {showTools && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manual Log Ingiestion</h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Blockchain Anchor v2.0</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <textarea 
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Enter raw log payload..."
                  className="flex-1 min-h-[100px] bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-cyan-400 placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition"
                />
                <div className="w-full md:w-64 space-y-3">
                  <input 
                    value={uploadSource}
                    onChange={(e) => setUploadSource(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                    placeholder="Source Identifier"
                  />
                  <button 
                    onClick={handleUpload}
                    disabled={submitLoading}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {submitLoading ? "Anchoring..." : "Submit to Ledger"}
                  </button>
                  {statusMsg && (
                    <p className={`text-[10px] font-bold text-center uppercase tracking-wider ${statusMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {statusMsg.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Log Display ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by message, IP, or hash..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/5 rounded-xl">
              <Filter size={14} className="text-slate-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Events</option>
                <option value="error">Critical Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">General Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic List */}
        <div className="flex-1 min-h-[500px] overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isPulseMode ? (
              <motion.div 
                key="pulse"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-black/80 custom-scrollbar"
              >
                {filteredLogs.slice().reverse().map((log) => (
                  <div key={log.id} className="group flex gap-3 hover:bg-white/5 p-1 rounded transition select-none cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <span className="text-slate-600 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`flex-shrink-0 font-bold ${levelColor(log.level)}`}>{log.level.toUpperCase()}</span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 transition break-all">
                      <span className="opacity-40">{log.source_ip} - </span>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={pulseEndRef} />
              </motion.div>
            ) : (
              <motion.div 
                key="classic"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-900 z-10 text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Level</th>
                      <th className="px-6 py-3">Telemetry Data</th>
                      <th className="px-6 py-3">Origin</th>
                      <th className="px-6 py-3 text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        className={`group hover:bg-white/5 transition cursor-pointer ${log.chainIntegrity === 'broken' ? 'bg-red-500/5' : ''}`}
                      >
                        <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-tighter ${levelColor(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-300 group-hover:text-white transition line-clamp-1">{log.message}</span>
                            <span className="text-[9px] text-slate-600 font-mono truncate max-w-[300px]">{log.hash}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                          {log.source_ip}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {log.txHash && <span className="text-[10px] text-purple-400 font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">#{log.blockNumber}</span>}
                             <IntegrityTag status={log.chainIntegrity} />
                             <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-200 transition" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-600">
                      <Search size={48} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">No Records Found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Either our system is very quiet or your filters are too strict. Try a broader search.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5 pt-px">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Continuous Sync
             </span>
             <span>Records: {filteredLogs.length}</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="hover:text-white transition flex items-center gap-1.5"><Download size={12} /> CSV Export</button>
             <span className="opacity-20">|</span>
             <span>SIEM v2.0.4 - Core v1.1.0</span>
          </div>
        </footer>
      </div>

      {/* Details Side-Panel */}
      <LogDetailsPanel 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />

    </div>
  );
}

function StatPill({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl bg-white/5 ${color} opacity-60`}>
        {icon}
      </div>
    </div>
  );
}

function IntegrityTag({ status }: { status: Log["chainIntegrity"] }) {
  if (status === "ok") return <CheckCircle size={16} className="text-green-500/60" />;
  if (status === "broken") return <AlertTriangle size={16} className="text-red-500 animate-pulse" />;
  if (status === "genesis") return <div className="text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 rounded">GEN</div>;
  return <div className="w-4 h-4 rounded-full border border-dashed border-slate-700" />;
}