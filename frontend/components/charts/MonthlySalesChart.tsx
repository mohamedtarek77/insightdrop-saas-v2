"use client";

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { month: string; revenue: number; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-bright)", borderRadius: 12, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "var(--accent)", fontWeight: 600 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
      <p style={{ color: "var(--text-tertiary)" }}>{payload[1]?.value ?? 0} orders</p>
    </div>
  );
};

export function MonthlySalesChart({ data }: Props) {
  const { t } = useTheme();
  const tickStyle = { fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "'Outfit'" };

  return (
    <div className="rounded-[18px] p-6 theme-transition" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
        {t("Monthly Revenue Trend", "اتجاه الإيرادات الشهرية")}
      </h3>
      <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>{t("Revenue over time", "الإيرادات عبر الزمن")}</p>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="month" tick={tickStyle} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
          <YAxis tick={tickStyle} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2.5} fill="url(#accGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
