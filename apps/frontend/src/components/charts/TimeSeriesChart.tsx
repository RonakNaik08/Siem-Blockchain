"use client";
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Log {
  timestamp: number;
  level?: string;
  severity?: string;
}

interface Props {
  logs: Log[];
  /** Bucket window in minutes, default 5 */
  bucketMinutes?: number;
  /** How many buckets to show, default 24 */
  bucketCount?: number;
}

function format(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({ logs, bucketMinutes = 5, bucketCount = 24 }: Props) {
  const data = useMemo(() => {
    const now = Date.now();
    const bucketMs = bucketMinutes * 60_000;

    return Array.from({ length: bucketCount }, (_, i) => {
      const bucketStart = now - (bucketCount - i) * bucketMs;
      const bucketEnd = bucketStart + bucketMs;

      const inBucket = logs.filter(
        (l) => l.timestamp >= bucketStart && l.timestamp < bucketEnd
      );

      return {
        time: format(bucketStart),
        total: inBucket.length,
        errors: inBucket.filter((l) => l.level === "error" || l.severity === "HIGH" || l.severity === "CRITICAL").length,
        warnings: inBucket.filter((l) => l.level === "warn" || l.severity === "MEDIUM").length,
        info: inBucket.filter((l) => l.level === "info" && l.severity !== "HIGH" && l.severity !== "CRITICAL").length,
      };
    });
  }, [logs, bucketMinutes, bucketCount]);

  const hasData = data.some((d) => d.total > 0);

  return (
    <div
      className="rounded-2xl border border-gray-800 p-5"
      style={{ background: "rgba(10,15,30,0.8)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">📈 Log Volume Over Time</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {bucketMinutes}min buckets · last {bucketCount * bucketMinutes}min
          </p>
        </div>
        {!hasData && (
          <span className="text-xs text-slate-600">Waiting for events…</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradErrors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradWarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#475569" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#475569" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>}
          />

          <Area
            type="monotone" dataKey="info" name="Info"
            stroke="#22d3ee" strokeWidth={1.5} fill="url(#gradInfo)"
          />
          <Area
            type="monotone" dataKey="warnings" name="Warnings"
            stroke="#f59e0b" strokeWidth={1.5} fill="url(#gradWarnings)"
          />
          <Area
            type="monotone" dataKey="errors" name="Errors/Threats"
            stroke="#ef4444" strokeWidth={2} fill="url(#gradErrors)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
