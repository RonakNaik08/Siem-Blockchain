"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Activity, Database, ExternalLink, Cpu } from "lucide-react";

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
}

interface LogDetailsPanelProps {
  log: Log | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LogDetailsPanel({ log, isOpen, onClose }: LogDetailsPanelProps) {
  if (!log) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-950/95 border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  log.severity === "CRITICAL" ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                }`}>
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Log Details</h2>
                  <p className="text-xs text-slate-500 font-mono">{log.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Core Information */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Core Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Timestamp" value={new Date(log.timestamp).toLocaleString()} />
                  <DetailItem label="Source IP" value={log.source_ip || "Unknown"} />
                  <DetailItem label="Level" value={log.level} highlight={log.level === "error"} />
                  <DetailItem label="Severity" value={log.severity} highlight={log.severity === "CRITICAL" || log.severity === "HIGH"} />
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm text-slate-300 break-all">
                  <p className="text-xs text-slate-600 mb-2 uppercase select-none">Raw Message</p>
                  {log.message}
                </div>
              </section>

              {/* Integrity & Hash Chain */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Database size={14} /> Integrity Metadata
                </h3>
                <div className="space-y-3">
                  <DetailRow label="Current Hash" value={log.hash || "Not generated"} mono />
                  <DetailRow label="Previous Hash" value={log.prevHash || "Genesis Block"} mono />
                </div>
              </section>

              {/* Blockchain Anchor */}
              <section className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={14} /> Blockchain Anchor
                  </h3>
                  {log.txHash ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase tracking-tighter">
                      Anchored
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase tracking-tighter animate-pulse">
                      Pending
                    </span>
                  )}
                </div>

                {log.txHash ? (
                  <div className="space-y-4">
                    <DetailRow label="Transaction" value={log.txHash} mono truncate />
                    <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <div>
                        <p className="text-[10px] text-purple-400/60 uppercase font-bold">Block Number</p>
                        <p className="text-lg font-mono font-bold text-purple-400">#{log.blockNumber}</p>
                      </div>
                      <a 
                        href={`/blockchain?hash=${log.txHash}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 transition"
                      >
                        Verify <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-sm text-slate-500 italic">Waiting for log to be verified in the next batch...</p>
                  </div>
                )}
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/40">
              <button 
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition border border-white/10"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-red-400" : "text-slate-200"}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value, mono = false, truncate = false }: { label: string; value: string; mono?: boolean, truncate?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
      <p className={`text-xs p-2 rounded-lg bg-black/40 border border-white/5 text-slate-400 break-all ${mono ? "font-mono" : ""} ${truncate ? "truncate" : ""}`}>
        {value}
      </p>
    </div>
  );
}
