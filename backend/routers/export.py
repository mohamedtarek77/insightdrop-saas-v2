"""
POST /export/pdf    – generate + stream a PDF analytics report
POST /export/excel  – generate + stream a styled Excel workbook

Both endpoints accept the same multipart file upload as /analyze,
run the full ETL pipeline, produce the export in memory, stream it
to the client, then immediately discard all data.
"""

import gc
import logging
from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from etl.pipeline import run_pipeline_full
from services.auth import verify_supabase_token
from services.excel_export import generate_excel_export
from services.report import generate_pdf_report
from utils.validators import MAX_FILE_SIZE_BYTES, validate_file_type

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


async def _get_analytics_and_df(
    file: UploadFile,
    credentials: HTTPAuthorizationCredentials,
):
    """Shared auth + ingest logic for both export endpoints."""
    user = await verify_supabase_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    validate_file_type(file.filename or "")

    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {MAX_FILE_SIZE_BYTES // (1024*1024)} MB limit.",
        )

    try:
        analytics, df = run_pipeline_full(BytesIO(raw_bytes), file.filename or "upload.csv")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("ETL error during export: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to process file.") from exc
    finally:
        del raw_bytes
        gc.collect()

    return analytics, df


# ── PDF ───────────────────────────────────────────────────────────────────────

@router.post(
    "/pdf",
    summary="Download analytics as PDF report",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF analytics report",
        }
    },
)
async def export_pdf(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    analytics, df = await _get_analytics_and_df(file, credentials)

    try:
        pdf_bytes = generate_pdf_report(analytics)
    finally:
        del df
        gc.collect()
        logger.info("DataFrame discarded after PDF export.")

    date_start = analytics["meta"]["date_range"]["start"].replace("-", "")
    date_end   = analytics["meta"]["date_range"]["end"].replace("-", "")
    filename   = f"insightdrop_report_{date_start}_{date_end}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Data-Policy": "no-persistence",
        },
    )


# ── Excel ─────────────────────────────────────────────────────────────────────

@router.post(
    "/excel",
    summary="Download cleaned + enriched data as Excel workbook",
    response_class=Response,
    responses={
        200: {
            "content": {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}
            },
            "description": "Styled multi-sheet Excel workbook",
        }
    },
)
async def export_excel(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    analytics, df = await _get_analytics_and_df(file, credentials)

    try:
        xlsx_bytes = generate_excel_export(df, analytics)
    finally:
        del df
        gc.collect()
        logger.info("DataFrame discarded after Excel export.")

    date_start = analytics["meta"]["date_range"]["start"].replace("-", "")
    date_end   = analytics["meta"]["date_range"]["end"].replace("-", "")
    filename   = f"insightdrop_data_{date_start}_{date_end}.xlsx"

    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Data-Policy": "no-persistence",
        },
    )
