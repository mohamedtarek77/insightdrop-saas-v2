"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, BarChart2, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,250,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,250,100,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <span className="font-display font-bold text-xl tracking-tight">
          Insight<span className="text-acid">Drop</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-ink-300 hover:text-ink-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm bg-acid text-ink font-semibold px-4 py-2 rounded-lg hover:bg-acid-dim transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-ink-300 mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse2 inline-block" />
          Zero data storage · GDPR ready · Free to start
        </div>

        <h1
          className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6 animate-fade-up-delay-1"
          style={{ animationFillMode: "both" }}
        >
          Sales analytics
          <br />
          <span className="text-gradient">without the baggage.</span>
        </h1>

        <p
          className="text-ink-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-delay-2"
          style={{ animationFillMode: "both" }}
        >
          Upload your CSV or Excel. Get instant KPIs, charts, and insights.
          Your data is processed in memory and{" "}
          <strong className="text-ink-100">never stored on our servers</strong>.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3"
          style={{ animationFillMode: "both" }}
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-acid text-ink font-semibold px-7 py-3.5 rounded-xl text-base hover:bg-acid-dim transition-all hover:scale-105 acid-glow"
          >
            Start free analysis
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-ink-400 text-sm">No credit card required</span>
        </div>
      </section>

      {/* Trust badges */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Zap size={20} />, label: "Instant results", sub: "< 10 seconds" },
            { icon: <Shield size={20} />, label: "Zero storage", sub: "Data never saved" },
            { icon: <BarChart2 size={20} />, label: "8+ chart types", sub: "KPIs + visuals" },
            { icon: <Lock size={20} />, label: "Private by design", sub: "GDPR compliant" },
          ].map((item, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-5 flex flex-col gap-2"
              style={{ animation: `fadeUp 0.5s ${0.1 + i * 0.1}s ease both` }}
            >
              <span className="text-acid">{item.icon}</span>
              <p className="font-display font-semibold text-sm text-ink-100">{item.label}</p>
              <p className="text-ink-400 text-xs">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-32">
        <h2 className="font-display font-bold text-3xl text-center mb-12">
          Three steps to clarity
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Upload your file",
              desc: "Drop in any CSV or Excel export from your store, CRM, or ERP.",
            },
            {
              step: "02",
              title: "We crunch the numbers",
              desc: "Our engine processes revenue, profit, trends, and top performers in seconds.",
            },
            {
              step: "03",
              title: "Read your dashboard",
              desc: "Interactive charts and KPIs render instantly. Export or screenshot anything.",
            },
          ].map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="font-mono text-acid text-xs mb-3 opacity-60">{item.step}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-ink-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="glass rounded-3xl p-10">
          <h2 className="font-display font-bold text-3xl mb-3">
            Ready to see your data differently?
          </h2>
          <p className="text-ink-300 mb-7 text-sm">
            Join teams who trust InsightDrop for quick, private sales analytics.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-acid text-ink font-semibold px-7 py-3.5 rounded-xl hover:bg-acid-dim transition-all hover:scale-105 acid-glow"
          >
            Start for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center pb-8 text-ink-500 text-xs">
        © {new Date().getFullYear()} InsightDrop · Zero data storage · Built with FastAPI & Next.js
      </footer>
    </div>
  );
}
