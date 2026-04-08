"use client";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, Clock, CheckCircle, AlertTriangle, 
  ExternalLink, Layers, ArrowRight, Loader2
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  merkleRoot: string;
  txHash?: string | null;
  logs?: { hash: string }[];
}

interface ChainStatus {
  chainLength: number;
  isValid: boolean;
}

export default function BlockchainViewer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [status, setStatus] = useState<ChainStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [blocksRes, statusRes, pendingRes] = await Promise.all([
        fetch(`${BACKEND}/blockchain`),
        fetch(`${BACKEND}/blockchain/status`),
        fetch(`${BACKEND}/blockchain/pending`)
      ]);
      
      const [blocksData, statusData, pendingData] = await Promise.all([
        blocksRes.json(),
        statusRes.json(),
        pendingRes.json()
      ]);

      setBlocks(blocksData);
      setStatus(statusData);
      setPending(pendingData);
    } catch (err) {
      console.error("Blockchain fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    
    socket.on("new-block", (block: Block) => {
      setBlocks((prev) => [block, ...prev]);
      setPending([]); // Clear pending as they are now in a block
      setStatus((prev) => prev ? { ...prev, chainLength: (prev.chainLength || 0) + 1 } : null);
    });

    socket.on("alert:new", (alert: any) => {
      if (alert.type === "BLOCKCHAIN_TAMPER") {
        setStatus((prev) => prev ? { ...prev, isValid: false } : null);
      }
    });

    // Listen for new logs to update pending count
    socket.on("new-log", (log: any) => {
      setPending((prev) => [...prev, log]);
    });

    return () => {
      socket.off("new-block");
      socket.off("alert:new");
      socket.off("new-log");
    };
  }, []);

  const isValid = status?.isValid ?? true;

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-medium animate-pulse">Synchronizing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* ── Status Banner ── */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center justify-between ${
        isValid ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isValid ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"}`}>
            {isValid ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="text-white font-bold tracking-tight">Ledger Integrity Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isValid 
                ? "The immutability of the chain is currently verified and intact." 
                : "TAMPER DETECTED: Hash mismatch found in the immutable chain!"}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chain Length</p>
          <p className="text-2xl font-black text-white">{blocks.length} Blocks</p>
        </div>
      </div>

      {/* ── Pending Batch Visualization ── */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formation: Next Block In-Progress</h3>
          </div>
          
          <div className="relative group p-6 rounded-3xl bg-yellow-500/5 border border-dashed border-yellow-500/20">
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 min-w-[120px] h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
                    i < pending.length 
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" 
                      : "bg-white/5 border-white/5 text-slate-700"
                  }`}
                >
                  {i < pending.length ? (
                    <>
                      <Layers size={14} />
                      <span className="text-[10px] font-mono">LOG_HASHED</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold">SLOT #{i+1}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-yellow-500/70">
                <span className="font-bold">{pending.length} / 5</span> logs received in current batch.
              </div>
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-tighter">
                Waiting for {5 - pending.length} more logs to anchor
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Main Ledger Feed ── */}
      <section className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Database size={14} /> On-Chain Immutable Blocks
        </h3>

        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="p-20 text-center border border-dashed border-white/5 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center text-slate-700">
                <Database size={32} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Ledger is empty. No blocks have been anchored yet.</p>
            </div>
          ) : (
            blocks.map((block, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                key={block.index}
                className="group relative bg-white/5 border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-all overflow-hidden"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                   <Layers size={120} />
                </div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  {/* Left: Metadata */}
                  <div className="w-full md:w-48 space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter bg-cyan-400/10 px-2 py-0.5 rounded">
                        Block #{block.index}
                      </span>
                      <h4 className="text-white font-bold mt-2">Verified Segment</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <Clock size={10} /> {new Date(block.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {block.txHash && (
                      <a 
                        href={`https://etherscan.io/tx/${block.txHash}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                      >
                        Ledger Receipt <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* Right: Hashes */}
                  <div className="flex-1 space-y-4 group-hover:translate-x-1 transition-transform">
                    <HashRow label="Block Hash" value={block.hash} color="text-green-400" />
                    <HashRow label="Merkle Root" value={block.merkleRoot} color="text-yellow-300" />
                    <div className="pt-2 flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div key={j} className="w-6 h-6 rounded-full bg-cyan-500/20 border border-white/10 flex items-center justify-center">
                            <Layers size={10} className="text-cyan-400" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Consolidated 5 log hashes</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function HashRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      <p className={`text-xs font-mono break-all leading-relaxed ${color} opacity-80`}>{value}</p>
    </div>
  );
}