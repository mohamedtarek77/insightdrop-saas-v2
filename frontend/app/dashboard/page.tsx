"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { analyzeFile, type AnalyticsResponse } from "@/lib/api";
import { FileUploadZone } from "@/components/FileUploadZone";
import { KpiCard } from "@/components/KpiCard";
import { ExportButtons } from "@/components/ExportButtons";
import { MonthlySalesChart } from "@/components/charts/MonthlySalesChart";
import { TopProductsChart } from "@/components/charts/TopProductsChart";
import { RegionSalesChart } from "@/components/charts/RegionSalesChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingUp, DollarSign, ShoppingCart, BarChart2,
  LogOut, RefreshCw, AlertCircle,
} from "lucide-react";

type Stage = "idle" | "loading" | "done" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage]       = useState<Stage>("idle");
  const [result, setResult]     = useState<AnalyticsResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  // Keep a ref to file so export buttons can always access the latest
  const fileRef = useRef<File | null>(null);
  useEffect(() => { fileRef.current = file; }, [file]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUserEmail(data.user.email ?? "");
    });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setStage("loading");
    setProgress(0);
    setErrorMsg("");

    const tick = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
    }, 400);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { router.push("/login"); return; }

      const data = await analyzeFile(file, token);
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setStage("done");
      }, 300);
    } catch (err: unknown) {
      clearInterval(tick);
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed.");
      setStage("error");
    }
  }, [file]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleReset() {
    setStage("idle");
    setFile(null);
    setResult(null);
    setProgress(0);
    setErrorMsg("");
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="font-display font-bold text-lg">
          Insight<span className="text-acid">Drop</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-ink-400 text-xs hidden sm:block">{userEmail}</span>
          {stage === "done" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-ink-300 hover:text-ink-50 transition-colors"
            >
              <RefreshCw size={14} /> New analysis
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-coral transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── IDLE / UPLOAD ── */}
        {(stage === "idle" || stage === "error") && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <h1 className="font-display font-bold text-3xl mb-2">
              Analyze your sales data
            </h1>
            <p className="text-ink-400 text-sm mb-8">
              Upload a CSV or Excel file. Your data is processed in-memory and{" "}
              <strong className="text-ink-200">never stored</strong>.
            </p>

            <FileUploadZone file={file} onFileChange={setFile} />

            {stage === "error" && (
              <div className="mt-4 flex items-start gap-3 bg-coral/10 border border-coral/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-coral mt-0.5 shrink-0" />
                <p className="text-coral text-sm">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-acid text-ink font-semibold py-4 rounded-xl text-base hover:bg-acid-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed acid-glow"
            >
              <BarChart2 size={18} />
              Start Analysis
            </button>

            <div className="mt-6 glass rounded-xl p-4">
              <p className="text-xs text-ink-500 font-mono mb-2">Required columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {["order_id","product_name","category","quantity","price","cost","order_date","region"].map(c => (
                  <span key={c} className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-ink-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {stage === "loading" && (
          <div className="max-w-2xl mx-auto animate-fade-up text-center">
            <div className="glass rounded-2xl p-10 mb-8">
              <div className="w-16 h-16 rounded-full bg-acid/10 border-2 border-acid/30 flex items-center justify-center mx-auto mb-6 animate-pulse2">
                <BarChart2 size={28} className="text-acid" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-2">Crunching your numbers…</h2>
              <p className="text-ink-400 text-sm mb-6">
                Running ETL, computing KPIs, preparing charts
              </p>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-acid rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-ink-500 text-xs mt-2 font-mono">{Math.round(progress)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {stage === "done" && result && (
          <div className="animate-fade-up space-y-6">

            {/* Header + export row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <h1 className="font-display font-bold text-2xl">Analysis complete</h1>
                <p className="text-ink-400 text-xs mt-0.5">
                  {formatNumber(result.meta.rows_processed)} rows ·{" "}
                  {result.meta.date_range.start} → {result.meta.date_range.end} ·{" "}
                  <span className="text-acid">Data not stored</span>
                </p>
              </div>

              {/* ── EXPORT BUTTONS ── */}
              {file && <ExportButtons file={file} />}
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Revenue"
                value={formatCurrency(result.kpis.total_revenue)}
                icon={<DollarSign size={18} />}
                accent="acid"
                delay={0}
              />
              <KpiCard
                label="Total Profit"
                value={formatCurrency(result.kpis.total_profit)}
                sub={`${result.kpis.profit_margin_pct}% margin`}
                icon={<TrendingUp size={18} />}
                accent="sky"
                delay={1}
              />
              <KpiCard
                label="Total Orders"
                value={formatNumber(result.kpis.total_orders)}
                icon={<ShoppingCart size={18} />}
                accent="coral"
                delay={2}
              />
              <KpiCard
                label="Avg Order Value"
                value={formatCurrency(result.kpis.avg_order_value)}
                icon={<BarChart2 size={18} />}
                accent="acid"
                delay={3}
              />
            </div>

            {/* Charts grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <MonthlySalesChart data={result.charts.monthly_sales} />
              <TopProductsChart  data={result.charts.top_products} />
              <RegionSalesChart  data={result.charts.region_sales} />
              <CategoryChart     data={result.charts.category_sales} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
