# Architecture – Stateless Sales Analytics

## Core Principle

**Zero business data persistence.** Every file upload is processed entirely in RAM and discarded
immediately after the API response is sent. No file, no row, no aggregate is ever written to disk
or a database.

## Request Lifecycle

```
User Browser
    │
    │  1. Authenticate (Supabase JWT)
    │  2. POST /analyze  (multipart, Bearer token)
    │
    ▼
Vercel CDN / Next.js
    │
    │  3. Forward file + token to FastAPI
    │
    ▼
Render – FastAPI
    │
    ├─ 4. Verify JWT (python-jose, local, no network call)
    ├─ 5. Validate file type + size
    ├─ 6. Read bytes into BytesIO buffer
    │
    ▼
ETL Pipeline (in-memory, pandas)
    │
    ├─ Ingest   → read_csv / read_excel
    ├─ Validate → assert required columns
    ├─ Clean    → dedup, null-fill, coerce types
    ├─ Engineer → revenue, profit, order_month
    └─ Aggregate→ KPIs + chart arrays
    │
    │  7. Serialize to JSON dict
    │  8. del df, del raw_bytes, gc.collect()
    │
    ▼
JSON Response → Next.js → Recharts dashboard
```

## Component Map

```
monorepo/
├── backend/
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── routers/
│   │   ├── analyze.py       # POST /analyze – auth + ETL orchestration
│   │   └── health.py        # GET /health/
│   ├── etl/
│   │   └── pipeline.py      # 6-stage stateless ETL
│   ├── services/
│   │   └── auth.py          # Supabase JWT verification
│   └── utils/
│       └── validators.py    # File type + size checks
│
└── frontend/
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── login/page.tsx    # Supabase auth (email + Google OAuth)
    │   └── dashboard/page.tsx# Upload → analyze → charts
    ├── components/
    │   ├── FileUploadZone.tsx
    │   ├── KpiCard.tsx
    │   └── charts/
    │       ├── MonthlySalesChart.tsx  # AreaChart (Recharts)
    │       ├── TopProductsChart.tsx   # Horizontal BarChart
    │       ├── RegionSalesChart.tsx   # PieChart / Donut
    │       └── CategoryChart.tsx      # Grouped BarChart
    └── lib/
        ├── supabase.ts        # Browser Supabase client
        ├── api.ts             # analyzeFile() fetch wrapper
        └── utils.ts           # cn(), formatCurrency(), formatNumber()
```

## Security Model

| Threat | Mitigation |
|--------|-----------|
| Unauthenticated requests | JWT verified on every /analyze call |
| Oversized files | 50 MB hard limit before pandas parse |
| Malicious file content | pandas parse inside try/except; no eval |
| Data leakage | No DB writes; del + gc after each request |
| CORS abuse | Strict allowlist of origins |

## ETL Schema Contract

Required columns (case-insensitive, whitespace-normalised):

| Column | Type | Notes |
|--------|------|-------|
| order_id | string | Dedup key |
| product_name | string | — |
| category | string | — |
| quantity | numeric | Must be > 0 |
| price | numeric | Unit price, must be > 0 |
| cost | numeric | Unit cost |
| order_date | date | Any parseable format |
| region | string | — |

Common aliases are automatically mapped (e.g. `qty` → `quantity`, `date` → `order_date`).
