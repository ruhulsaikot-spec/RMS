"""
RMS Backend - JWT Utility Functions

Enterprise-grade JWT token creation, validation, and decoding
with support for access tokens, refresh tokens, and token rotation.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.auth.security_config import security_settings


# ── Token Types ───────────────────────────────────────────────
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"
TOKEN_TYPE_PASSWORD_RESET = "password_reset"


def create_access_token(
    subject: str,
    roles: list[str] | None = None,
    permissions: list[str] | None = None,
    department_id: str | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """
    Create a JWT access token with user identity and authorization claims.

    Args:
        subject: User ID (UUID string).
        roles: List of role names assigned to the user.
        permissions: List of permission codes granted to the user.
        department_id: User's department ID for department-scoped access.
        extra_claims: Additional custom claims to embed in the token.

    Returns:
        Encoded JWT access token string.
    """
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=security_settings.jwt_access_token_expire_minutes)
    jti = str(uuid.uuid4())

    payload: dict[str, Any] = {
        "sub": subject,
        "type": TOKEN_TYPE_ACCESS,
        "iat": now,
        "exp": expires,
        "iss": security_settings.jwt_issuer,
        "aud": security_settings.jwt_audience,
        "jti": jti,
        "roles": roles or [],
        "permissions": permissions or [],
    }

    if department_id:
        payload["department_id"] = department_id

    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(
        payload,
        security_settings.jwt_secret_key,
        algorithm=security_settings.jwt_algorithm,
    )


def create_refresh_token(
    subject: str,
    session_id: str | None = None,
) -> tuple[str, str, datetime]:
    """
    Create a JWT refresh token for token rotation.

    Refresh tokens have a longer expiry and are used to obtain new
    access tokens without re-authentication. Each refresh token gets
    a unique JTI for blacklist tracking.

    Args:
        subject: User ID (UUID string).
        session_id: Optional session identifier for concurrent session tracking.

    Returns:
        Tuple of (encoded_token, jti, expires_at).
    """
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=security_settings.jwt_refresh_token_expire_days)
    jti = str(uuid.uuid4())

    payload: dict[str, Any] = {
        "sub": subject,
        "type": TOKEN_TYPE_REFRESH,
        "iat": now,
        "exp": expires,
        "iss": security_settings.jwt_issuer,
        "aud": security_settings.jwt_audience,
        "jti": jti,
    }

    if session_id:
        payload["session_id"] = session_id

    token = jwt.encode(
        payload,
        security_settings.jwt_secret_key,
        algorithm=security_settings.jwt_algorithm,
    )

    return token, jti, expires


def create_password_reset_token(subject: str) -> tuple[str, str]:
    """
    Create a short-lived JWT token for password reset flow.

    Args:
        subject: User ID (UUID string).

    Returns:
        Tuple of (encoded_token, jti).
    """
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=security_settings.password_reset_token_expire_minutes)
    jti = str(uuid.uuid4())

    payload: dict[str, Any] = {
        "sub": subject,
        "type": TOKEN_TYPE_PASSWORD_RESET,
        "iat": now,
        "exp": expires,
        "iss": security_settings.jwt_issuer,
        "aud": security_settings.jwt_audience,
        "jti": jti,
    }

    token = jwt.encode(
        payload,
        security_settings.jwt_secret_key,
        algorithm=security_settings.jwt_algorithm,
    )

    return token, jti


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Verifies signature, expiration, issuer, and audience.

    Args:
        token: Encoded JWT token string.

    Returns:
        Decoded token payload dictionary.

    Raises:
        JWTError: If the token is invalid, expired, or malformed.
    """
    return jwt.decode(
        token,
        security_settings.jwt_secret_key,
        algorithms=[security_settings.jwt_algorithm],
        issuer=security_settings.jwt_issuer,
        audience=security_settings.jwt_audience,
    )


def validate_token_type(payload: dict[str, Any], expected_type: str) -> bool:
    """
    Verify that a decoded token matches the expected type.

    Args:
        payload: Decoded JWT payload.
        expected_type: Expected token type (access/refresh/password_reset).

    Returns:
        True if the token type matches.
    """
    return payload.get("type") == expected_type


def get_token_jti(payload: dict[str, Any]) -> str | None:
    """Extract the JTI (token ID) from a decoded payload."""
    return payload.get("jti")


def get_token_subject(payload: dict[str, Any]) -> str | None:
    """Extract the subject (user ID) from a decoded payload."""
    return payload.get("sub")


def get_token_expiry(payload: dict[str, Any]) -> datetime | None:
    """Extract the expiration timestamp from a decoded payload."""
    exp = payload.get("exp")
    if exp:
        return datetime.fromtimestamp(exp, tz=timezone.utc)
    return None


def is_token_expired(payload: dict[str, Any]) -> bool:
    """Check if a decoded token has expired."""
    exp = payload.get("exp")
    if not exp:
        return True
    return datetime.now(timezone.utc) > datetime.fromtimestamp(exp, tz=timezone.utc)
