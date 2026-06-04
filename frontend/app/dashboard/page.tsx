"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, RefreshCw, AlertCircle, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { Topbar } from "@/components/ui/Topbar";
import { createClient } from "@/lib/supabase";
import { analyzeFile, type AnalyticsResponse } from "@/lib/api";
import { FileUploadZone } from "@/components/FileUploadZone";
import { KpiCard } from "@/components/KpiCard";
import { ExportButtons } from "@/components/ExportButtons";
import { MonthlySalesChart }  from "@/components/charts/MonthlySalesChart";
import { TopProductsChart }   from "@/components/charts/TopProductsChart";
import { RegionSalesChart }   from "@/components/charts/RegionSalesChart";
import { CategoryChart }      from "@/components/charts/CategoryChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";

type Stage = "idle" | "loading" | "done" | "error";

function DashboardContent() {
  const router   = useRouter();
  const supabase = createClient();
  const { t }    = useTheme();

  const [stage,     setStage]     = useState<Stage>("idle");
  const [result,    setResult]    = useState<AnalyticsResponse | null>(null);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [file,      setFile]      = useState<File | null>(null);
  const [progress,  setProgress]  = useState(0);
  const [userEmail, setUserEmail] = useState("");
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
    }, 380);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { router.push("/login"); return; }
      const data = await analyzeFile(file, token);
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => { setResult(data); setStage("done"); }, 300);
    } catch (err: unknown) {
      clearInterval(tick);
      setErrorMsg(err instanceof Error ? err.message : t("Analysis failed.", "فشل التحليل."));
      setStage("error");
    }
  }, [file]);

  function handleReset() {
    setStage("idle"); setFile(null); setResult(null); setProgress(0); setErrorMsg("");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Topbar userEmail={userEmail} showDashNav />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16">

        {/* ── IDLE / ERROR ── */}
        {(stage === "idle" || stage === "error") && (
          <div className="max-w-[600px] mx-auto animate-rise">
            <h1 className="font-display font-bold text-3xl tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
              {t("Analyze your sales data", "حلّل بيانات مبيعاتك")}
            </h1>
            <p className="text-sm font-light mb-8" style={{ color: "var(--text-secondary)" }}>
              {t("Upload a CSV or Excel file. Processed in-memory — ", "ارفع ملف CSV أو Excel. يُعالَج في الذاكرة — ")}
              <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {t("never stored.", "لا يُحفظ أبدًا.")}
              </strong>
            </p>

            <FileUploadZone file={file} onFileChange={setFile} />

            {stage === "error" && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
                style={{ background: "var(--rose-bg)", border: "1px solid rgba(240,96,128,.2)", color: "var(--rose)" }}>
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Schema box */}
            <div className="rounded-[14px] p-4 mb-5 theme-transition"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
              <p className="font-mono text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                {t("Required columns:", "الأعمدة المطلوبة:")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["order_id","product_name","category","quantity","price","cost","order_date","region"].map(c => (
                  <span key={c} className="font-mono text-xs px-2 py-1 rounded-md theme-transition"
                    style={{ background: "var(--bg-raised)", border: "1px solid var(--border-dim)", color: "var(--text-secondary)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file}
              className="w-full flex items-center justify-center gap-2.5 font-semibold py-4 rounded-[14px] text-white text-base transition-all disabled:opacity-35 disabled:cursor-not-allowed accent-glow"
              style={{ background: "var(--accent)" }}
            >
              <BarChart2 size={18} />
              {t("Start Analysis", "ابدأ التحليل")}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {stage === "loading" && (
          <div className="max-w-[600px] mx-auto text-center animate-rise">
            <div className="rounded-[22px] p-10 mb-6 theme-transition"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 animate-spin-slow"
                style={{ border: "2px solid var(--border-dim)", borderTopColor: "var(--accent)" }}
              />
              <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
                {t("Crunching your numbers…", "جارٍ تحليل بياناتك…")}
              </h2>
              <p className="text-sm font-light mb-6" style={{ color: "var(--text-secondary)" }}>
                {t("Running ETL · Computing KPIs · Preparing charts", "تشغيل ETL · حساب المؤشرات · تحضير الرسوم البيانية")}
              </p>
              <div className="w-full rounded-full h-1 overflow-hidden mb-2" style={{ background: "var(--bg-raised)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--accent)" }}
                />
              </div>
              <p className="font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
                {Math.round(progress)}%
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {stage === "done" && result && (
          <div className="animate-rise space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div>
                <h1 className="font-display font-bold text-2xl tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {t("Analysis complete", "اكتمل التحليل")}
                </h1>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {formatNumber(result.meta.rows_processed)} {t("rows", "صف")} ·{" "}
                  {result.meta.date_range.start} → {result.meta.date_range.end} ·{" "}
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md"
                    style={{ background: "var(--teal-bg)", color: "var(--teal)", border: "1px solid rgba(64,208,176,.2)" }}
                  >
                    🔒 {t("Data not stored", "البيانات غير محفوظة")}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                {file && <ExportButtons file={file} />}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg self-start sm:self-auto theme-transition"
                  style={{ color: "var(--text-secondary)", background: "var(--bg-surface)", border: "1px solid var(--border-mid)" }}
                >
                  <RefreshCw size={12} /> {t("New analysis", "تحليل جديد")}
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label={t("Total Revenue",    "إجمالي الإيرادات")}
                value={formatCurrency(result.kpis.total_revenue)}
                emoji="💰" colorVar="--gold" bgVar="--gold-bg" delay={0}
              />
              <KpiCard
                label={t("Total Profit",     "إجمالي الأرباح")}
                value={formatCurrency(result.kpis.total_profit)}
                sub={`${result.kpis.profit_margin_pct}% ${t("margin","هامش")}`}
                emoji="📈" colorVar="--teal" bgVar="--teal-bg" delay={1}
              />
              <KpiCard
                label={t("Total Orders",     "إجمالي الطلبات")}
                value={formatNumber(result.kpis.total_orders)}
                emoji="🛒" colorVar="--rose" bgVar="--rose-bg" delay={2}
              />
              <KpiCard
                label={t("Avg Order Value",  "متوسط قيمة الطلب")}
                value={formatCurrency(result.kpis.avg_order_value)}
                emoji="📊" colorVar="--accent" bgVar="--accent-light" delay={3}
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-5">
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

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
