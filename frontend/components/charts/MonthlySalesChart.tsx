"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { month: string; revenue: number; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs">
      <p className="text-ink-300 mb-1">{label}</p>
      <p className="text-acid font-medium">{formatCurrency(payload[0]?.value ?? 0)}</p>
      <p className="text-ink-400">{payload[1]?.value ?? 0} orders</p>
    </div>
  );
};

export function MonthlySalesChart({ data }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-sm mb-1">Monthly Revenue Trend</h3>
      <p className="text-ink-500 text-xs mb-5">Revenue over time</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8FA64" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C8FA64" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9494A0", fontSize: 10 }}
            tickFormatter={(v) => v.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9494A0", fontSize: 10 }}
            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C8FA64"
            strokeWidth={2}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
