"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { region: string; revenue: number; orders: number }[];
}

const COLORS = ["#C8FA64", "#64C8FA", "#FF6B6B", "#A8E040", "#FFB864", "#B464FF"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs">
      <p className="text-ink-100 font-medium mb-1">{d.region}</p>
      <p style={{ color: payload[0].fill }}>{formatCurrency(d.revenue)}</p>
      <p className="text-ink-400">{d.orders} orders</p>
    </div>
  );
};

export function RegionSalesChart({ data }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-sm mb-1">Sales by Region</h3>
      <p className="text-ink-500 text-xs mb-5">Revenue distribution</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="revenue"
            nameKey="region"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span style={{ color: "#9494A0", fontSize: 11 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
