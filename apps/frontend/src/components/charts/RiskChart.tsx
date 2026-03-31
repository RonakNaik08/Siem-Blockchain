"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function RiskChart({ logs }: any) {
  const threats = logs.filter((l: any) =>
    l.message.toLowerCase().includes("attack") ||
    l.message.toLowerCase().includes("failed")
  ).length;

  const safe = logs.length - threats;

  const data = [
    { name: "Safe", value: safe },
    { name: "Threats", value: threats },
  ];

  return (
    <div className="card p-4">
      <h2 className="mb-3">🧠 Risk Distribution</h2>

      <PieChart width={250} height={200}>
        <Pie data={data} dataKey="value" outerRadius={80}>
          <Cell fill="#22c55e" />
          <Cell fill="#ef4444" />
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}