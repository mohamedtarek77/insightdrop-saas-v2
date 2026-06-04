"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";
type Lang  = "en" | "ar";

interface ThemeCtx {
  theme: Theme;
  lang:  Lang;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
  t: (en: string, ar: string) => string;
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark", lang: "en",
  toggleTheme: () => {}, setLang: () => {},
  t: (en) => en,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang,  setLangState] = useState<Lang>("en");

  /* Sync from localStorage on mount */
  useEffect(() => {
    const t = (localStorage.getItem("id-theme") as Theme) || "dark";
    const l = (localStorage.getItem("id-lang")  as Lang)  || "en";
    applyTheme(t);
    applyLang(l);
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("id-theme", t);
  }

  function applyLang(l: Lang) {
    setLangState(l);
    document.documentElement.setAttribute("lang", l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    localStorage.setItem("id-lang", l);
  }

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const setLang = useCallback((l: Lang) => applyLang(l), []);

  const t = useCallback(
    (en: string, ar: string) => (lang === "ar" ? ar : en),
    [lang]
  );

  return (
    <Ctx.Provider value={{ theme, lang, toggleTheme, setLang, t }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
