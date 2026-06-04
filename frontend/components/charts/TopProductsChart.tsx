"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { product: string; revenue: number; quantity: number }[];
}

const COLORS = ["var(--accent)", "rgba(124,106,247,.72)", "rgba(124,106,247,.55)", "var(--teal)", "rgba(64,208,176,.72)", "rgba(64,208,176,.50)", "var(--rose)"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-bright)", borderRadius: 12, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>{payload[0]?.payload?.product}</p>
      <p style={{ color: "var(--accent)" }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
      <p style={{ color: "var(--text-tertiary)" }}>{payload[0]?.payload?.quantity} units</p>
    </div>
  );
};

export function TopProductsChart({ data }: Props) {
  const { t } = useTheme();
  const top = data.slice(0, 7);
  const tickStyle = { fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "'Outfit'" };

  return (
    <div className="rounded-[18px] p-6 theme-transition" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
        {t("Top Products", "أفضل المنتجات")}
      </h3>
      <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>{t("By revenue", "حسب الإيرادات")}</p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" tick={tickStyle} tickFormatter={(v) => `$${v>=1000?(v/1000).toFixed(0)+"k":v}`} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="product" tick={tickStyle} width={80} axisLine={false} tickLine={false} tickFormatter={(v) => v.length > 11 ? v.slice(0,11)+"…" : v} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[0, 5, 5, 0]}>
            {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
