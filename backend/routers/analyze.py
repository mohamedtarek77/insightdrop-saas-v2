"""
POST /analyze  –  The single analytics endpoint.

Accepts a multipart file upload (CSV or Excel), runs the ETL pipeline
entirely in memory, and returns a structured JSON analytics response.
The file is NEVER persisted; all objects are deleted after processing.
"""

import gc
import logging
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from etl.pipeline import run_pipeline
from utils.validators import validate_file_type, MAX_FILE_SIZE_BYTES
from services.auth import verify_supabase_token

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


@router.post(
    "/",
    summary="Analyze uploaded sales data",
    description=(
        "Upload a CSV or Excel file containing sales data. "
        "Returns KPIs and chart-ready data instantly. "
        "The file is discarded immediately after processing."
    ),
    response_description="KPIs and chart data derived entirely from the uploaded file.",
)
async def analyze(
    file: UploadFile = File(..., description="CSV or Excel sales data file"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    # ── 1. Authenticate ────────────────────────────────────────────────────
    user = await verify_supabase_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    # ── 2. Validate file type ──────────────────────────────────────────────
    filename = file.filename or ""
    validate_file_type(filename)

    # ── 3. Read raw bytes (enforce size limit) ─────────────────────────────
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {MAX_FILE_SIZE_BYTES // (1024*1024)} MB limit.",
        )

    logger.info(
        "Processing file: size=%d bytes, type=%s, user=%s",
        len(raw_bytes),
        filename.split(".")[-1].lower(),
        user.get("sub", "unknown"),
    )

    # ── 4. Run ETL pipeline in memory ─────────────────────────────────────
    try:
        file_buffer = BytesIO(raw_bytes)
        result = run_pipeline(file_buffer, filename)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Unexpected ETL error: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to process file.") from exc
    finally:
        # ── 5. Discard all uploaded data immediately ───────────────────────
        del raw_bytes
        gc.collect()
        logger.info("File data discarded from memory.")

    return result
