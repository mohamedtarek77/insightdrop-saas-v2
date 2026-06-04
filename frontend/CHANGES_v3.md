# InsightDrop Frontend — v3 Redesign

## What changed

### New design system
- **Fonts**: Fraunces (display serif) + Outfit (UI sans) + JetBrains Mono
- **Accent color**: Violet `#7c6af7` (dark) / `#5b48e8` (light)
- **KPI colors**: Gold (revenue) · Teal (profit) · Rose (error/orders) · Accent (avg)
- All colors are CSS custom properties — theme switch is instant with no flicker

### New files
| File | Purpose |
|------|---------|
| `lib/theme.tsx` | `ThemeProvider` + `useTheme()` hook — manages dark/light + EN/AR |
| `components/ui/Topbar.tsx` | Unified nav bar with theme toggle + language switcher |

### Updated files
| File | What changed |
|------|-------------|
| `app/globals.css` | Full CSS token system for dark + light themes |
| `app/layout.tsx` | New fonts, FOUC-prevention script, `data-theme` attribute |
| `tailwind.config.js` | Tokens mapped to CSS vars, `darkMode: 'class'` |
| `app/page.tsx` | Full redesign — editorial hero, pills, feature cards |
| `app/login/page.tsx` | Segmented control, field focus rings, themed card |
| `app/dashboard/page.tsx` | ThemeProvider wrapping, new spinner, themed states |
| `components/KpiCard.tsx` | Emoji badges, CSS var colors, hover lift |
| `components/FileUploadZone.tsx` | Hover color transition, themed file preview |
| `components/ExportButtons.tsx` | Rose/Teal themed, i18n labels |
| `components/charts/*.tsx` | CSS var colors for grid + tooltips + axes |

## How to run

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in Supabase + API URL
npm run dev
```

## Theme & Language

Both persist in `localStorage`:
- `id-theme` → `"dark"` | `"light"`
- `id-lang`  → `"en"` | `"ar"`

The `<html>` element gets `data-theme` and `dir` attributes on every page load
before paint (via inline script in layout.tsx) — **no flash of wrong theme**.

The `useTheme()` hook exposes:
```ts
const { theme, lang, toggleTheme, setLang, t } = useTheme();
// t("English text", "النص العربي") → returns correct string for current lang
```
