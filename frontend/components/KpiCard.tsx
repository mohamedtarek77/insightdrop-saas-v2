"use client";

interface Props {
  label:  string;
  value:  string;
  sub?:   string;
  emoji:  string;
  colorVar: string;   /* CSS var name e.g. "--gold" */
  bgVar:    string;   /* CSS var name e.g. "--gold-bg" */
  delay?:   number;
}

export function KpiCard({ label, value, sub, emoji, colorVar, bgVar, delay = 0 }: Props) {
  return (
    <div
      className="rounded-[18px] p-5 card-hover theme-transition animate-rise"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-dim)",
        animationDelay: `${delay * 0.07}s`,
        opacity: 0,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base"
          style={{ background: `var(${bgVar})` }}
        >
          {emoji}
        </div>
      </div>
      <p className="font-display font-bold text-[26px] tracking-tight leading-none" style={{ color: `var(${colorVar})` }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
    </div>
  );
}
