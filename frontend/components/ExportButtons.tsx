"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { downloadExport } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

interface Props { file: File; }
type ExportState = "idle" | "loading-pdf" | "loading-excel";

export function ExportButtons({ file }: Props) {
  const supabase = createClient();
  const { t } = useTheme();
  const [state, setState] = useState<ExportState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function triggerDownload(format: "pdf" | "excel") {
    setError(null);
    setState(format === "pdf" ? "loading-pdf" : "loading-excel");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error(t("Session expired.", "انتهت الجلسة."));
      const { blob, filename } = await downloadExport(file, token, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("Export failed.", "فشل التصدير."));
      setState("idle");
    }
  }

  const busy = state !== "idle";

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider px-0.5" style={{ color: "var(--text-tertiary)" }}>
        {t("Download", "تنزيل")}
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => triggerDownload("pdf")}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: "var(--rose-bg)", border: "1px solid rgba(240,96,128,.25)", color: "var(--rose)" }}
        >
          {state === "loading-pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          {state === "loading-pdf" ? t("Generating…", "جارٍ التوليد…") : t("PDF Report", "تقرير PDF")}
        </button>
        <button
          onClick={() => triggerDownload("excel")}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: "var(--teal-bg)", border: "1px solid rgba(64,208,176,.25)", color: "var(--teal)" }}
        >
          {state === "loading-excel" ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
          {state === "loading-excel" ? t("Generating…", "جارٍ التوليد…") : t("Excel + Data", "Excel + البيانات")}
        </button>
      </div>
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {t("Excel: 5 sheets — cleaned data, monthly, products, regions, categories.", "Excel: 5 أوراق — بيانات منظفة، شهري، منتجات، مناطق، فئات.")}
      </p>
      {error && (
        <p className="text-xs rounded-xl px-3 py-2" style={{ background: "var(--rose-bg)", color: "var(--rose)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
