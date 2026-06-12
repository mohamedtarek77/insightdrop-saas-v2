"use client";

import { useRouter } from "next/navigation";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { Topbar } from "@/components/ui/Topbar";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

function LandingContent() {
  const { t } = useTheme();
  const router = useRouter();

  const features = [
    {
      num: "01",
      titleEn: "Upload your file",
      titleAr: "ارفع ملفك",
      descEn:  "Drop any CSV or Excel export. No template required — columns are auto-detected.",
      descAr:  "أرفع أي ملف CSV أو Excel. لا قالب مطلوب — نكتشف الأعمدة تلقائيًا.",
    },
    {
      num: "02",
      titleEn: "We crunch the numbers",
      titleAr: "نحلل الأرقام",
      descEn:  "ETL engine cleans and aggregates in-memory. Revenue, profit, trends — all in seconds.",
      descAr:  "محرك ETL ينظف ويجمع البيانات في الذاكرة. إيرادات وأرباح واتجاهات — في ثوانٍ.",
    },
    {
      num: "03",
      titleEn: "Download your report",
      titleAr: "حمّل تقريرك",
      descEn:  "PDF analytics report or a styled 5-sheet Excel workbook. Data discarded immediately after.",
      descAr:  "تقرير PDF أو مصنف Excel بـ5 أوراق منسقة. تُحذف البيانات فورًا بعد ذلك.",
    },
  ];

  const pills = [
    { icon: "⚡", en: "Results in <10s",        ar: "نتائج في أقل من 10 ثوانٍ" },
    { icon: "🔒", en: "Zero data stored",        ar: "لا يُخزَّن أي بيانات"     },
    { icon: "📊", en: "4 interactive charts",    ar: "4 رسوم بيانية"             },
    { icon: "🌍", en: "GDPR compliant",           ar: "متوافق مع GDPR"            },
    { icon: "📁", en: "CSV & Excel",              ar: "CSV و Excel"               },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Topbar />

      {/* ── HERO ── */}
      <section className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center overflow-hidden">
        {/* Orb */}
        <div
          className="orb pointer-events-none"
          style={{ width: 640, height: 640, top: -100, left: "50%", transform: "translateX(-50%)" }}
        />

        {/* Eyebrow */}
        <div
          className="animate-rise inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-8 theme-transition"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-secondary)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background: "var(--accent)" }} />
          {t("Zero data storage · GDPR ready", "لا تخزين للبيانات · متوافق مع GDPR")}
        </div>

        {/* Headline */}
        <h1
          className="animate-rise-1 font-display font-bold leading-[1.02] tracking-tight mb-6"
          style={{ fontSize: "clamp(44px,7.5vw,88px)", color: "var(--text-primary)" }}
        >
          {t("Sales analytics", "تحليلات المبيعات")}<br />
          <em className="not-italic" style={{ color: "var(--accent)" }}>
            {t("without the baggage.", "بدون تعقيد.")}
          </em>
        </h1>

        {/* Sub */}
        <p
          className="animate-rise-2 max-w-xl mx-auto text-lg font-light leading-relaxed mb-10"
          style={{ color: "var(--text-secondary)" }}
        >
          {t(
            "Upload your CSV or Excel. Get instant KPIs, charts & insights. Your data is processed in memory and ",
            "ارفع ملف CSV أو Excel. احصل على مؤشرات أداء وتحليلات فورية. بياناتك تُعالَج في الذاكرة و"
          )}
          <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {t("never stored on our servers.", "لا تُحفظ أبدًا على خوادمنا.")}
          </strong>
        </p>

        {/* CTA */}
        <div className="animate-rise-3 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/login")}
            className="group inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-white transition-all accent-glow"
            style={{ background: "var(--accent)", fontSize: 15 }}
          >
            {t("Start free analysis", "ابدأ التحليل مجانًا")}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {t("No credit card required", "لا يلزم بطاقة ائتمان")}
          </span>
        </div>

        {/* Pills */}
        <div className="animate-rise-4 flex flex-wrap justify-center gap-3 mt-14">
          {pills.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium theme-transition card-hover cursor-default"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-dim)",
                color: "var(--text-secondary)",
              }}
            >
              <span>{p.icon}</span>
              <span>{t(p.en, p.ar)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <p
          className="text-center font-mono text-xs tracking-widest uppercase mb-10"
          style={{ color: "var(--text-tertiary)" }}
        >
          {t("How it works", "كيف يعمل")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-[18px] p-7 theme-transition card-hover"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-dim)",
              }}
            >
              <div className="font-mono text-xs mb-4 opacity-60" style={{ color: "var(--accent)" }}>
                {f.num} ——
              </div>
              <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                {t(f.titleEn, f.titleAr)}
              </h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {t(f.descEn, f.descAr)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div
          className="relative rounded-3xl p-14 overflow-hidden theme-transition"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
        >
          {/* inner orb */}
          <div
            className="orb"
            style={{ width: 400, height: 300, top: -80, left: "50%", transform: "translateX(-50%)" }}
          />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
              {t("Ready to see your data differently?", "هل أنت مستعد لرؤية بياناتك بشكل مختلف؟")}
            </h2>
            <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
              {t(
                "Join teams who trust InsightDrop for quick, private sales analytics.",
                "انضم إلى الفرق التي تثق في InsightDrop لتحليلات مبيعات سريعة وخاصة."
              )}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="group inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-white transition-all accent-glow"
              style={{ background: "var(--accent)", fontSize: 15 }}
            >
              {t("Get started free", "ابدأ مجانًا")}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="text-center pb-10 font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
        © 2025 InsightDrop · {t("Zero data storage · FastAPI + Next.js", "لا تخزين للبيانات · FastAPI + Next.js")}
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
                  <Suspense fallback={null}>

      <LandingContent />
      </Suspense>
    </ThemeProvider>
  );
}
