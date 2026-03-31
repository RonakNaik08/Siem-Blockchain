import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-8 max-w-lg">

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl"
             style={{ boxShadow: "0 0 32px rgba(34,211,238,0.15)" }}>
          🛡
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-100 tracking-tight">
            SIEM <span className="text-neon">Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Blockchain Log Integrity &amp; Real-time Security Monitoring
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 justify-center text-center">
          {[
            { label: "Blockchain", value: "Secured" },
            { label: "Monitoring", value: "Live" },
            { label: "Integrity",  value: "100%" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-primary font-semibold text-sm">{value}</p>
              <p className="text-slate-600 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">
            Open Dashboard
          </Link>
          <Link href="/logs" className="btn-secondary">
            View Logs
          </Link>
        </div>

      </div>
    </div>
  );
}
