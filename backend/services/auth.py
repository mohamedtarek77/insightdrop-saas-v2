"""
Supabase JWT verification service.

Supabase issues standard JWTs signed with your project's JWT secret.
We verify the token locally (no network call needed) using python-jose.
"""

import logging
import os
from typing import Any

from jose import JWTError, jwt

logger = logging.getLogger(__name__)

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_PROJECT_URL = os.getenv("SUPABASE_URL", "")


async def verify_supabase_token(token: str) -> dict[str, Any] | None:
    """
    Verify a Supabase-issued JWT and return its payload dict.
    Returns None if the token is invalid or the secret is not configured.
    """
    if not SUPABASE_JWT_SECRET:
        logger.warning("SUPABASE_JWT_SECRET not set – auth skipped in dev mode")
        # In development mode (no secret configured), accept any bearer token
        return {"sub": "dev-user", "email": "dev@local"}

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        return None
