"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MetricsChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1a2d4a"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#111d35",
            border: "1px solid #1a2d4a",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "12px",
          }}
          cursor={{ fill: "rgba(79,110,247,0.08)" }}
        />
        <Bar
          dataKey="count"
          fill="#4f6ef7"
          radius={[4, 4, 0, 0]}
          name="Signups"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
