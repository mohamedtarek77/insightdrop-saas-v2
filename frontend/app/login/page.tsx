"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Clock } from "lucide-react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { Topbar } from "@/components/ui/Topbar";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup";

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { t }        = useTheme();
  const supabase     = createClient();

  const [mode,     setMode]     = useState<Mode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [info,     setInfo]     = useState<string | null>(null);

  const expired = searchParams.get("expired") === "1";

  // If already logged in and NOT expired → go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !expired) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo(t(
          "Check your email to confirm your account, then sign in.",
          "تحقق من بريدك الإلكتروني لتأكيد حسابك، ثم سجّل الدخول."
        ));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("Authentication failed.", "فشل المصادقة."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div
          className="w-10 h-10 rounded-full animate-spin-slow"
          style={{ border: "2px solid var(--border-dim)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border-mid)",
    borderRadius: 11,
    padding: "11px 14px",
    color: "var(--text-primary)",
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-14 relative"
      style={{ background: "var(--bg-base)" }}
    >
      <Topbar />

      {/* Orb */}
      <div
        className="orb pointer-events-none absolute"
        style={{ width: 500, height: 500, top: "50%", left: "50%", transform: "translate(-50%, -60%)" }}
      />

      <div className="relative z-10 w-full max-w-sm animate-rise">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="font-display font-bold text-2xl tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Insight<em className="not-italic" style={{ color: "var(--accent)" }}>Drop</em>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            {mode === "login"
              ? t("Welcome back", "مرحبًا بعودتك")
              : t("Create your account", "أنشئ حسابك")}
          </p>
        </div>

        {/* Expired notice */}
        {expired && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
            style={{
              background: "var(--gold-bg)",
              border: "1px solid rgba(240,192,96,.25)",
              color: "var(--gold)",
            }}
          >
            <Clock size={14} className="shrink-0" />
            {t(
              "Your session expired after 3 days. Please sign in again.",
              "انتهت جلستك بعد 3 أيام. يرجى تسجيل الدخول مرة أخرى."
            )}
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-[22px] p-8 theme-transition"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
        >
          {/* Mode toggle */}
          <div
            className="flex rounded-[10px] p-0.5 mb-6 theme-transition"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border-dim)" }}
          >
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setInfo(null); }}
                className="flex-1 py-2 rounded-[7px] text-xs font-medium transition-all"
                style={
                  mode === m
                    ? { background: "var(--accent)", color: "#fff" }
                    : { background: "transparent", color: "var(--text-secondary)" }
                }
              >
                {m === "login"
                  ? t("Sign in", "تسجيل الدخول")
                  : t("Sign up", "إنشاء حساب")}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-medium mb-5 transition-all theme-transition"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {t("Continue with Google", "المتابعة عبر جوجل")}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--border-dim)" }} />
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{t("or", "أو")}</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-dim)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("Email", "البريد الإلكتروني")}
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-light)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-mid)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("Password", "كلمة المرور")}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-light)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-mid)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-xs rounded-xl px-3 py-2.5"
                style={{
                  background: "var(--rose-bg)",
                  color: "var(--rose)",
                  border: "1px solid rgba(240,96,128,.2)",
                }}
              >
                {error}
              </p>
            )}
            {info && (
              <p
                className="text-xs rounded-xl px-3 py-2.5"
                style={{
                  background: "var(--teal-bg)",
                  color: "var(--teal)",
                  border: "1px solid rgba(64,208,176,.2)",
                }}
              >
                {info}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-white text-sm transition-all disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading
                ? t("Processing…", "جارٍ المعالجة…")
                : mode === "login"
                  ? t("Sign in", "تسجيل الدخول")
                  : t("Create account", "إنشاء حساب")}
            </button>
          </form>
        </div>

        {/* 3-day session note */}
        <div
          className="flex items-center justify-center gap-1.5 mt-4 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Clock size={11} />
          {t(
            "Sessions are kept for 3 days, then require re-login.",
            "تبقى الجلسة 3 أيام، ثم تحتاج لإعادة تسجيل الدخول."
          )}
        </div>

        <p className="text-center text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
          {t("By continuing you agree to our ", "بالمتابعة فإنك توافق على ")}
          <span className="underline cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            {t("Terms", "الشروط")}
          </span>
          {t(" and ", " و ")}
          <span className="underline cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            {t("Privacy Policy", "سياسة الخصوصية")}
          </span>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}
