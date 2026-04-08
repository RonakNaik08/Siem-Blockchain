"use client";

import React, { useEffect, useState, useRef } from "react";

interface Threat {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  opacity: number;
}

export default function LiveAttackMap({ alerts }: { alerts: any[] }) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[0];
      const newThreat: Threat = {
        id: Math.random().toString(),
        // Randomized positions to simulate a "global" map
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: latest.severity === "CRITICAL" ? "#ef4444" : "#f97316",
        size: 2,
        opacity: 1
      };
      setThreats(prev => [newThreat, ...prev.slice(0, 20)]);
    }
  }, [alerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prev => 
        prev.map(t => ({ 
          ...t, 
          size: t.size + 1.5, 
          opacity: t.opacity - 0.05 
        })).filter(t => t.opacity > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      {/* Simulation Background Map */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 60" className="w-full h-full fill-slate-700">
          <rect x="10" y="10" width="10" height="8" rx="2" />
          <rect x="30" y="15" width="15" height="12" rx="2" />
          <rect x="60" y="5" width="20" height="15" rx="2" />
          <rect x="15" y="30" width="25" height="18" rx="2" />
          <rect x="65" y="35" width="12" height="10" rx="2" />
        </svg>
      </div>

      <div className="absolute top-2 left-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="text-[10px] uppercase font-bold text-red-500 tracking-widest">Live Threat Activity</span>
      </div>

      {threats.map(t => (
        <div 
          key={t.id}
          className="absolute rounded-full border border-current transition-all duration-300 pointer-events-none"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `${t.size}px`,
            height: `${t.size}px`,
            color: t.color,
            opacity: t.opacity,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${t.size}px ${t.color}`
          }}
        />
      ))}

      {/* Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
        {Array.from({length: 24}).map((_, i) => (
          <div key={i} className="border-t border-l border-white" />
        ))}
      </div>
    </div>
  );
}
