"""
Stateless Sales Analytics Dashboard - FastAPI Backend
Zero business data persistence. All analytics are computed in-memory.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routers.analyze import router as analyze_router
from routers.export import router as export_router
from routers.health import router as health_router

# Configure logging (no sensitive data logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Stateless Analytics API starting up")
    yield
    logger.info("🛑 Stateless Analytics API shutting down")


app = FastAPI(
    title="Stateless Sales Analytics API",
    description=(
        "Zero-persistence sales analytics. Upload your data, get instant insights. "
        "No data is ever stored."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS – allow your Vercel frontend (and localhost for development)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        # Add your production domain here, e.g. "https://yourdomain.com"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(analyze_router, prefix="/analyze", tags=["Analytics"])
app.include_router(export_router, prefix="/export", tags=["Export"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "Stateless Sales Analytics API",
        "version": "1.0.0",
        "status": "operational",
        "data_policy": "Zero persistence. All uploaded data is discarded immediately after processing.",
    }
