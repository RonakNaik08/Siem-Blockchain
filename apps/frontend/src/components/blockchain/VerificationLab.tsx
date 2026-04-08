"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSearch, ShieldCheck, ShieldAlert, FileText, Loader2, Copy } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function VerificationLab() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; data?: any; reason?: string } | null>(null);

  // Helper to calculate SHA-256 hash of a file
  async function calculateHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setLoading(true);
      setResult(null);
      try {
        const h = await calculateHash(selected);
        setHash(h);
      } catch (err) {
        console.error("Hashing failed", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    if (!hash) return;
    setLoading(true);
    setResult(null);
    try {
      // We'll use the existing verify endpoint which we'll upgrade to handle hash-only search if needed
      // For now, we hit the log-service verification
      const res = await fetch(`${BACKEND}/api/blockchain/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const data = await res.json();
      setResult(data.onChain ?? data);
    } catch (e: any) {
      setResult({ verified: false, reason: "Network error: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
          <FileSearch size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Manual Verification Lab</h2>
          <p className="text-xs text-slate-500">Hash and verify any file against the Immutable Ledger.</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Upload Zone */}
        <div className="relative group">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-white/10 group-hover:border-purple-500/50 rounded-2xl p-10 flex flex-col items-center justify-center transition-all bg-white/5">
            <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">Drop log file here to verify</p>
                <p className="text-xs text-slate-600 mt-1">Accepts .log, .txt, .json</p>
              </div>
            )}
          </div>
        </div>

        {/* Hash Display */}
        <AnimatePresence>
          {hash && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Computed SHA-256 Hash</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(hash)}
                  className="text-slate-600 hover:text-purple-400 transition"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-xs font-mono text-cyan-400 break-all leading-relaxed">{hash}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Action */}
        <div className="space-y-4">
          <button
            onClick={handleVerify}
            disabled={!hash || loading}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Scanning Ledger...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Integrity on Blockchain
              </>
            )}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${
                  result.verified
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                } flex items-start gap-4`}
              >
                <div className={`p-2 rounded-lg ${result.verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {result.verified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold uppercase tracking-tight ${result.verified ? "text-green-400" : "text-red-400"}`}>
                    {result.verified ? "Integrity Verified" : "Verification Failed"}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {result.verified 
                      ? "This file matches a record anchored to the blockchain. The content is authentic and untampered." 
                      : (result.reason || "No record found matching this file hash on the blockchain ledger.")
                    }
                  </p>
                  {result.verified && result.data && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Anchored on Ethereum</p>
                      <p className="text-[10px] font-mono text-green-400 truncate">TX: {result.data.txHash || "Local Sync Only"}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
