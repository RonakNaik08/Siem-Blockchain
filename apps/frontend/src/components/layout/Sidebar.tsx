"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard",  href: "/dashboard", icon: "▦" },
  { label: "Logs",       href: "/logs",      icon: "≡" },
  { label: "Alerts",     href: "/alerts",    icon: "⚠" },
  { label: "Blockchain", href: "/blockchain",icon: "⛓" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 h-full bg-surface border-r border-border flex flex-col">

      {/* LOGO */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">SIEM</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Blockchain Security</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-slate-400 hover:bg-surface-2 hover:text-slate-200"
              }`}
              style={active ? { boxShadow: "0 0 12px rgba(34,211,238,0.1)" } : {}}
            >
              <span className={`text-base ${active ? "text-primary" : "text-slate-600"}`}>{icon}</span>
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary glow-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success glow-dot" />
          <span className="text-xs text-slate-500">System Online</span>
        </div>
      </div>

    </div>
  );
}
