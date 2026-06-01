# Deployment Guide

## Overview

| Layer | Provider | Cost |
|-------|----------|------|
| Frontend | Vercel | Free tier |
| Backend | Render | Free tier |
| Auth | Supabase | Free tier |
| Database | None (stateless) | $0 |

---

## 1. Supabase Auth Setup (5 min)

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to **Project Settings → API**
4. Note your:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT Secret` (under API settings) → `SUPABASE_JWT_SECRET` (for backend)
5. (Optional) Enable Google OAuth under **Authentication → Providers → Google**

---

## 2. Backend – Deploy on Render (10 min)

1. Push `backend/` to a GitHub repository
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
5. Add environment variables:
   ```
   SUPABASE_JWT_SECRET = <from Supabase dashboard>
   SUPABASE_URL       = https://your-project.supabase.co
   ```
6. Deploy. Note the URL, e.g. `https://stateless-analytics-api.onrender.com`

> **Free tier note:** Render free services spin down after 15 min of inactivity.
> First request after spin-down takes ~30s. Upgrade to Starter ($7/mo) to keep it warm.

---

## 3. Frontend – Deploy on Vercel (5 min)

1. Push `frontend/` to a GitHub repository
2. Go to https://vercel.com → New Project → Import repo
3. Framework preset: **Next.js**
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
   NEXT_PUBLIC_API_URL           = https://stateless-analytics-api.onrender.com
   ```
5. Deploy. Your app is live at `https://your-app.vercel.app`

---

## 4. Configure CORS on Backend

Edit `backend/main.py` and add your Vercel URL to `allow_origins`:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",  # ← add this
],
```

---

## 5. Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your values
uvicorn main:app --reload
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local  # fill in your values
npm run dev
# App at http://localhost:3000
```

---

## 6. Verify Deployment

```bash
# Health check
curl https://stateless-analytics-api.onrender.com/health/

# Expected:
# {"status":"healthy","timestamp":"...","persistence":"none"}
```
