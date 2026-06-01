"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
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

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,250,100,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl">
            Insight<span className="text-acid">Drop</span>
          </Link>
          <p className="text-ink-400 text-sm mt-1">
            {mode === "login" ? "Welcome back" : "Create your free account"}
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden mb-6 bg-ink-900 border border-white/5">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setInfo(null); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-acid text-ink"
                    : "text-ink-300 hover:text-ink-50"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 text-sm font-medium hover:bg-white/5 transition-colors mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-ink-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-ink-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-ink-50 placeholder-ink-500 focus:outline-none focus:border-acid/50 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-ink-50 placeholder-ink-500 focus:outline-none focus:border-acid/50 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-coral text-xs bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-acid text-xs bg-acid/10 border border-acid/20 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-acid text-ink font-semibold py-3 rounded-xl hover:bg-acid-dim transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Processing…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-500 text-xs mt-6">
          By continuing you agree to our{" "}
          <span className="text-ink-300 cursor-pointer hover:text-ink-50 transition-colors">
            Terms
          </span>{" "}
          and{" "}
          <span className="text-ink-300 cursor-pointer hover:text-ink-50 transition-colors">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
