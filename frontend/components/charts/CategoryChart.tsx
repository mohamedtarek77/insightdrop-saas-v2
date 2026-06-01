"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { category: string; revenue: number; profit: number; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs">
      <p className="text-ink-200 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export function CategoryChart({ data }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-sm mb-1">Category Performance</h3>
      <p className="text-ink-500 text-xs mb-5">Revenue vs Profit</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="category"
            tick={{ fill: "#9494A0", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.length > 9 ? v.slice(0, 9) + "…" : v}
          />
          <YAxis
            tick={{ fill: "#9494A0", fontSize: 10 }}
            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            formatter={(v) => <span style={{ color: "#9494A0", fontSize: 11 }}>{v}</span>}
          />
          <Bar dataKey="revenue" name="Revenue" fill="#C8FA64" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill="#64C8FA" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
