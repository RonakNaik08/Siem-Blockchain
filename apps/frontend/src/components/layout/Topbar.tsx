"use client";

import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
  "/":           "Home",
  "/dashboard":  "Dashboard",
  "/logs":       "Logs",
  "/alerts":     "Alerts",
  "/blockchain": "Blockchain",
};

export default function Topbar() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] ?? "SIEM";

  return (
    <div className="h-14 flex items-center justify-between px-6">

      {/* LEFT: breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">SIEM</span>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 font-medium">{pageName}</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">⌕</span>
          <input
            placeholder="Search logs, alerts..."
            className="bg-surface border border-border text-sm text-slate-300 placeholder-slate-600
                       pl-8 pr-3 py-1.5 rounded-lg outline-none w-52
                       focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-semibold"
             style={{ boxShadow: "0 0 10px rgba(34,211,238,0.2)" }}>
          R
        </div>

      </div>
    </div>
  );
}
