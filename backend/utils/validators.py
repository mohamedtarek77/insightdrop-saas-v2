"""
Input validation utilities.
"""

from fastapi import HTTPException

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


def validate_file_type(filename: str) -> None:
    if "." not in filename:
        raise HTTPException(status_code=400, detail="File must have an extension.")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '.{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}.",
        )
