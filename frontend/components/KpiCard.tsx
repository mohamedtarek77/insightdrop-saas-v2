"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: "acid" | "sky" | "coral";
  delay?: number;
}

const accentMap = {
  acid: { bg: "bg-acid/10", text: "text-acid", val: "text-acid" },
  sky: { bg: "bg-sky/10", text: "text-sky", val: "text-sky" },
  coral: { bg: "bg-coral/10", text: "text-coral", val: "text-coral" },
};

export function KpiCard({ label, value, sub, icon, accent, delay = 0 }: Props) {
  const a = accentMap[accent];

  return (
    <div
      className="glass rounded-2xl p-5"
      style={{ animation: `fadeUp 0.4s ${delay * 0.08}s ease both` }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-ink-400">{label}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", a.bg, a.text)}>
          {icon}
        </div>
      </div>
      <p className={cn("font-display font-bold text-2xl", a.val)}>{value}</p>
      {sub && <p className="text-ink-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
