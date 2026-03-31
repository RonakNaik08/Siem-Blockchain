"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ActivityChart({ logs }: any) {
  // Convert logs into chart data
  const data = logs.map((log: any, index: number) => ({
    time: index + 1,
    logs: index + 1,
  }));

  return (
    <div className="card p-4 h-64">
      <h2 className="mb-3">📈 Log Activity</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="logs"
            stroke="#00ffff"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}