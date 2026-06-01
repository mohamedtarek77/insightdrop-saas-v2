"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { downloadExport } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Props {
  file: File;
}

type ExportState = "idle" | "loading-pdf" | "loading-excel" | "done";

export function ExportButtons({ file }: Props) {
  const supabase = createClient();
  const [state, setState] = useState<ExportState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function triggerDownload(format: "pdf" | "excel") {
    setError(null);
    setState(format === "pdf" ? "loading-pdf" : "loading-excel");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Session expired. Please sign in again.");

      const { blob, filename } = await downloadExport(file, token, format);

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed.");
      setState("idle");
    }
  }

  return (
    <div className="space-y-2">
      {/* Section header */}
      <p className="text-xs text-ink-400 font-medium uppercase tracking-wider px-1">
        Download
      </p>

      {/* Buttons row */}
      <div className="flex gap-3">
        {/* PDF Report */}
        <button
          onClick={() => triggerDownload("pdf")}
          disabled={state !== "idle"}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
            "bg-coral/10 border border-coral/20 text-coral",
            "hover:bg-coral/20 hover:border-coral/40",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {state === "loading-pdf" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileDown size={15} />
          )}
          {state === "loading-pdf" ? "Generating…" : "PDF Report"}
        </button>

        {/* Excel Export */}
        <button
          onClick={() => triggerDownload("excel")}
          disabled={state !== "idle"}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
            "bg-acid/10 border border-acid/20 text-acid",
            "hover:bg-acid/20 hover:border-acid/40",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {state === "loading-excel" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={15} />
          )}
          {state === "loading-excel" ? "Generating…" : "Excel + Data"}
        </button>
      </div>

      {/* Excel description */}
      <p className="text-ink-500 text-xs px-1">
        Excel includes 5 sheets: cleaned data, monthly summary, top products, regions & categories.
      </p>

      {error && (
        <p className="text-coral text-xs bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
