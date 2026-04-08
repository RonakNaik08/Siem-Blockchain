"use client";
import React from "react";
import BlockchainViewer from "@/components/blockchain/BlockchainViewer";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ShieldCheck, History } from "lucide-react";

const VerificationLab = dynamic(() => import("@/components/blockchain/VerificationLab"), { ssr: false });

export default function BlockchainPage() {
  return (
    <div className="space-y-10">
      
      {/* ── Page Header ── */}
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
          <span className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <History size={32} />
          </span>
          Immutable Ledger
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl">
          Complete transparency into the SIEM 2.0 blockchain backend. Monitor real-time block formation 
          and audit log integrity directly from the ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Main Ledger Feed (Left) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Chain History
            </h2>
          </div>
          <BlockchainViewer />
        </div>

        {/* ── Verification Tools (Right) ── */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Audit Tools
            </h2>
          </div>
          
          <VerificationLab />

          {/* Educational Note */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">How it works</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              SIEM 2.0 caches logs in a local high-performance buffer. Every 5 logs are consolidated into a 
              <strong> Merkle Tree</strong>. The root of this tree is then cryptographically signed and 
              anchored to the <strong>Ethereum Blockchain</strong>, providing mathematical proof of non-tampering.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
