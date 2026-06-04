"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { category: string; revenue: number; profit: number; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-bright)", borderRadius: 12, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export function CategoryChart({ data }: Props) {
  const { t } = useTheme();
  const tickStyle = { fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "'Outfit'" };

  return (
    <div className="rounded-[18px] p-6 theme-transition" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
        {t("Category Performance", "أداء الفئات")}
      </h3>
      <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>{t("Revenue vs Profit", "الإيرادات مقابل الأرباح")}</p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="category" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => v.length > 8 ? v.slice(0,8)+"…" : v} />
          <YAxis tick={tickStyle} tickFormatter={(v) => `$${v>=1000?(v/1000).toFixed(0)+"k":v}`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend formatter={(v) => <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{v}</span>} />
          <Bar dataKey="revenue" name={t("Revenue","إيرادات")} fill="var(--accent)" radius={[4,4,0,0]} />
          <Bar dataKey="profit"  name={t("Profit","أرباح")}   fill="var(--teal)"   radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
