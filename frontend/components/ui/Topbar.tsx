"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface TopbarProps {
  userEmail?: string;
  showDashNav?: boolean;
}

export function Topbar({ userEmail, showDashNav = false }: TopbarProps) {
  const { theme, lang, toggleTheme, setLang, t } = useTheme();
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const navLinks = [
    { href: "/",          labelEn: "Home",      labelAr: "الرئيسية" },
    { href: "/login",     labelEn: "Login",     labelAr: "الدخول"  },
    { href: "/dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14",
        "flex items-center px-6 gap-3",
        "border-b border-[var(--border-dim)]",
        "theme-transition"
      )}
      style={{ background: "var(--nav-bg)", backdropFilter: "blur(20px) saturate(1.8)" }}
    >
      {/* Brand */}
      <Link href="/" className="flex-1 font-display font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
        Insight<em className="not-italic" style={{ color: "var(--accent)" }}>Drop</em>
      </Link>

      {/* Page tabs */}
      <div
        className="hidden sm:flex gap-0.5 rounded-[10px] p-0.5"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--border-dim)" }}
      >
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 py-1.5 rounded-[7px] text-xs font-medium transition-all",
              pathname === l.href
                ? "text-white shadow-sm"
                : "theme-transition hover:opacity-90"
            )}
            style={
              pathname === l.href
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--text-secondary)" }
            }
          >
            {lang === "ar" ? l.labelAr : l.labelEn}
          </Link>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border-dim)", background: "var(--bg-raised)" }}
        >
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-2.5 py-1 text-xs font-mono font-medium transition-all",
                lang === l ? "text-white" : "theme-transition"
              )}
              style={
                lang === l
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              {l === "en" ? "EN" : "ع"}
            </button>
          ))}
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg theme-transition"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-secondary)",
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Logout (dashboard only) */}
        {showDashNav && userEmail && (
          <>
            <span className="text-xs hidden md:block" style={{ color: "var(--text-tertiary)" }}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg theme-transition"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-dim)",
                background: "var(--bg-raised)",
              }}
            >
              <LogOut size={12} />
              {t("Sign out", "خروج")}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
