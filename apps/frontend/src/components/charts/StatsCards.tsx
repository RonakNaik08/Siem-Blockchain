export default function StatsCards({ logs }: any) {
  const total = logs.length;

  const threats = logs.filter((l: any) =>
    l.message?.toLowerCase().includes("attack") ||
    l.message?.toLowerCase().includes("failed")
  ).length;

  const verified = logs.filter((l: any) => l.verified).length;

  const stats = [
    {
      label: "Total Logs",
      value: total,
      sub: "events captured",
      color: "text-primary",
      glow: "rgba(34,211,238,0.3)",
      border: "border-primary/20",
      bg: "bg-primary/5",
    },
    {
      label: "Threats Detected",
      value: threats,
      sub: threats > 0 ? "requires attention" : "all clear",
      color: threats > 0 ? "text-danger" : "text-success",
      glow: threats > 0 ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)",
      border: threats > 0 ? "border-danger/20" : "border-success/20",
      bg: threats > 0 ? "bg-danger/5" : "bg-success/5",
    },
    {
      label: "System Health",
      value: threats === 0 ? "Safe" : "At Risk",
      sub: "blockchain verified",
      color: threats === 0 ? "text-success" : "text-warning",
      glow: threats === 0 ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)",
      border: threats === 0 ? "border-success/20" : "border-warning/20",
      bg: threats === 0 ? "bg-success/5" : "bg-warning/5",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, sub, color, glow, border, bg }) => (
        <div
          key={label}
          className={`card ${bg} border ${border} p-5 space-y-2`}
          style={{ boxShadow: `0 0 0 1px ${glow.replace("0.3", "0.08")}, 0 4px 24px rgba(0,0,0,0.4)` }}
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold ${color}`}
             style={{ textShadow: `0 0 16px ${glow}` }}>
            {value}
          </p>
          <p className="text-xs text-slate-600">{sub}</p>
        </div>
      ))}
    </div>
  );
}
