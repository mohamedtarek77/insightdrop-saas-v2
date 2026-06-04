"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { region: string; revenue: number; orders: number }[];
}

const COLORS = ["var(--accent)", "var(--teal)", "var(--gold)", "var(--rose)", "rgba(124,106,247,.45)"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-bright)", borderRadius: 12, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>{d.region}</p>
      <p style={{ color: payload[0].fill }}>{formatCurrency(d.revenue)}</p>
      <p style={{ color: "var(--text-tertiary)" }}>{d.orders} orders</p>
    </div>
  );
};

export function RegionSalesChart({ data }: Props) {
  const { t } = useTheme();
  return (
    <div className="rounded-[18px] p-6 theme-transition" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
        {t("Sales by Region", "المبيعات حسب المنطقة")}
      </h3>
      <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>{t("Revenue distribution", "توزيع الإيرادات")}</p>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie data={data} cx="50%" cy="48%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="revenue" nameKey="region">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(v) => <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
