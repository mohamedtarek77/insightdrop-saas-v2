"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { product: string; revenue: number; quantity: number }[];
}

const COLORS = ["#C8FA64", "#A8E040", "#88C420", "#64C8FA", "#44A8DA", "#FF6B6B", "#FF4B4B"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs">
      <p className="text-ink-100 font-medium mb-1">{payload[0]?.payload?.product}</p>
      <p className="text-acid">{formatCurrency(payload[0]?.value ?? 0)}</p>
      <p className="text-ink-400">{payload[0]?.payload?.quantity} units</p>
    </div>
  );
};

export function TopProductsChart({ data }: Props) {
  const top = data.slice(0, 7);
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-sm mb-1">Top Products</h3>
      <p className="text-ink-500 text-xs mb-5">By revenue</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#9494A0", fontSize: 10 }}
            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="product"
            tick={{ fill: "#9494A0", fontSize: 10 }}
            width={80}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + "…" : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {top.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
