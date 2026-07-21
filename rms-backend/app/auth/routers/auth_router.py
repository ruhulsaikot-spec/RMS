"""
RMS Backend - Authentication Router

FastAPI router with all authentication endpoints including
login, logout, token refresh, password management, session
management, and account lockout administration.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import (
    CurrentUser,
    CurrentUserId,
    OptionalUser,
    VerifiedToken,
    require_permission,
    require_roles,
)
from app.auth.schemas.auth import (
    APIResponse,
    AuthEventResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    PasswordResetConfirm,
    PasswordResetConfirmResponse,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SessionListResponse,
    TokenVerifyResponse,
)
from app.auth.services.auth_service import AuthService
from app.core.database import get_db_session
from app.core.dependencies import get_redis
from app.core.exceptions import AuthenticationError
from app.core.logging import get_logger
from app.main import limiter

logger = get_logger(__name__)

router = APIRouter()


# ── Dependency: Create AuthService ────────────────────────────
async def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> AuthService:
    """Provide an AuthService instance with DB and Redis connections."""
    return AuthService(db=db, redis=redis)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


# ── Helper: Extract client info from request ──────────────────
def _client_ip(request: Request) -> str | None:
    """Extract client IP from request, considering X-Forwarded-For."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def _user_agent(request: Request) -> str | None:
    """Extract User-Agent from request."""
    return request.headers.get("User-Agent")


# ══════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS (No authentication required)
# ══════════════════════════════════════════════════════════════

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate with email and password to receive JWT access and refresh tokens.",
)
async def login(
    request: LoginRequest,
    http_request: Request,
    auth_service: AuthServiceDep,
    response: Response,
) -> LoginResponse:
    """
    Authenticate user and issue JWT tokens.
    Returns access token (short-lived) and refresh token (long-lived)
    along with user profile information. Implements account lockout
    after consecutive failed attempts.
    """
    result = await auth_service.login(
        request=request,
        ip_address=_client_ip(http_request),
        user_agent=_user_agent(http_request),
    )
    # Set httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=result.access_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=result.expires_in,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=result.refresh_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/",
    )
    return result


@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access/refresh token pair (token rotation).",
)
async def refresh_token(
    request: RefreshTokenRequest,
    http_request: Request,
    auth_service: AuthServiceDep,
) -> RefreshTokenResponse:
    """
    Rotate refresh token for new token pair.

    The old refresh token is immediately blacklisted (one-time use).
    If a reused refresh token is detected, all user sessions are revoked.
    """
    return await auth_service.refresh_token(
        request=request,
        ip_address=_client_ip(http_request),
        user_agent=_user_agent(http_request),
    )


@router.post(
    "/password-reset/request",
    response_model=PasswordResetRequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Request a password reset token for the given email address. Always returns success to prevent email enumeration.",
)
async def request_password_reset(
    request: PasswordResetRequest,
    http_request: Request,
    auth_service: AuthServiceDep,
) -> PasswordResetRequestResponse:
    """Request password reset token. Always returns success for security."""
    return await auth_service.request_password_reset(
        request=request,
        ip_address=_client_ip(http_request),
    )


@router.post(
    "/password-reset/confirm",
    response_model=PasswordResetConfirmResponse,
    status_code=status.HTTP_200_OK,
    summary="Confirm password reset",
    description="Reset password using a valid password reset token. The token is one-time use.",
)
async def confirm_password_reset(
    request: PasswordResetConfirm,
    http_request: Request,
    auth_service: AuthServiceDep,
) -> PasswordResetConfirmResponse:
    """Confirm password reset with token and new password."""
    return await auth_service.confirm_password_reset(
        request=request,
        ip_address=_client_ip(http_request),
    )


# ══════════════════════════════════════════════════════════════
# AUTHENTICATED ENDPOINTS (Bearer token required)
# ══════════════════════════════════════════════════════════════

@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="User logout",
    description="Blacklist the current access token and optionally the refresh token to end the session.",
)
async def logout(
    token: VerifiedToken,
    http_request: Request,
    auth_service: AuthServiceDep,
    refresh_token: str | None = None,
) -> LogoutResponse:
    """
    Logout user and revoke tokens.

    Blacklists the current access token. If a refresh token is
    provided in the request body, it is also blacklisted and the
    associated session is destroyed.
    """
    return await auth_service.logout(
        access_token_payload=token,
        refresh_token=refresh_token,
        ip_address=_client_ip(http_request),
        user_agent=_user_agent(http_request),
    )


@router.get(
    "/verify",
    response_model=TokenVerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify access token",
    description="Verify the current access token and return its claims and validity status.",
)
async def verify_token(
    token: VerifiedToken,
    auth_service: AuthServiceDep,
) -> TokenVerifyResponse:
    """Verify the current access token and return its claims."""
    return await auth_service.verify_access_token(token)


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Get the authenticated user's profile including roles and permissions.",
)
async def get_current_user_profile(
    user: CurrentUser,
) -> dict:
    """
    Get the current authenticated user's full profile.

    Returns user info, roles, permissions, and account status.
    """
    return {
        "success": True,
        "data": user,
    }


@router.post(
    "/change-password",
    response_model=ChangePasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Change password",
    description="Change the authenticated user's password. All other sessions are revoked after password change.",
)
async def change_password(
    request: ChangePasswordRequest,
    user: CurrentUser,
    http_request: Request,
    auth_service: AuthServiceDep,
) -> ChangePasswordResponse:
    """
    Change password for the authenticated user.

    After a successful password change, all other sessions are
    revoked. The current session remains active.
    """
    await auth_service.change_password(
        user_id=user["id"],
        request=request,
        ip_address=_client_ip(http_request),
        user_agent=_user_agent(http_request),
    )
    return ChangePasswordResponse(message="Password changed successfully")


# ══════════════════════════════════════════════════════════════
# SESSION MANAGEMENT ENDPOINTS
# ══════════════════════════════════════════════════════════════

@router.get(
    "/sessions",
    response_model=SessionListResponse,
    status_code=status.HTTP_200_OK,
    summary="List active sessions",
    description="List all active sessions for the authenticated user.",
)
async def list_sessions(
    user: CurrentUser,
    auth_service: AuthServiceDep,
) -> SessionListResponse:
    """Get all active sessions for the current user."""
    return await auth_service.get_active_sessions(user["id"])


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Revoke a specific session",
    description="Revoke a specific session by session ID. Useful for logging out other devices.",
)
async def revoke_session(
    session_id: str,
    user: CurrentUser,
    auth_service: AuthServiceDep,
) -> dict:
    """Revoke a specific session."""
    revoked = await auth_service.revoke_session(user["id"], session_id)
    if not revoked:
        return {"success": False, "message": "Session not found or already expired"}
    return {"success": True, "message": "Session revoked successfully"}


@router.delete(
    "/sessions",
    status_code=status.HTTP_200_OK,
    summary="Revoke all sessions",
    description="Revoke all sessions for the authenticated user (logout everywhere).",
)
async def revoke_all_sessions(
    user: CurrentUser,
    auth_service: AuthServiceDep,
) -> dict:
    """Revoke all sessions for the current user."""
    count = await auth_service.revoke_all_sessions(user["id"])
    return {
        "success": True,
        "message": f"All sessions revoked ({count} sessions terminated)",
        "revoked_count": count,
    }


# ══════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS (Admin role required)
# ══════════════════════════════════════════════════════════════

@router.post(
    "/admin/unlock/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Unlock user account",
    description="Unlock a locked user account. Requires admin role.",
    dependencies=[Depends(require_roles("admin"))],
)
async def unlock_account(
    user_id: str,
    admin_user: CurrentUser,
    http_request: Request,
    auth_service: AuthServiceDep,
) -> dict:
    """
    Unlock a user account (admin only).

    Resets the account status to active and clears failed login
    attempt counters in both the database and Redis.
    """
    await auth_service.unlock_account(
        admin_user_id=admin_user["id"],
        target_user_id=user_id,
        ip_address=_client_ip(http_request),
    )
    return {"success": True, "message": f"Account {user_id} unlocked successfully"}


@router.post(
    "/logout-cookie",
    status_code=status.HTTP_200_OK,
    summary="Logout Cookie",
    description="Clear authentication cookies and logout.",
)
async def logout_cookie(
    response: Response,
) -> dict:
    """Clear httpOnly cookies on logout."""
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=0,
        expires=0,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=0,
        expires=0,
        path="/",
    )
    return {"message": "Logged out successfully"}


@router.get(
    "/admin/events/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Get user auth events",
    description="Get authentication audit events for a specific user. Requires admin role.",
    dependencies=[Depends(require_roles("admin"))],
)
async def get_user_auth_events(
    user_id: str,
    admin_user: CurrentUser,
    auth_service: AuthServiceDep,
    offset: int = 0,
    limit: int = 50,
) -> dict:
    """
    Get authentication audit events for a user (admin only).

    Returns login/logout/password change events for security
    monitoring and forensic analysis.
    """
    events = await auth_service.get_auth_events(
        user_id=user_id,
        requesting_user_id=admin_user["id"],
        offset=offset,
        limit=limit,
    )
    return {"success": True, "data": events, "count": len(events)}


# ══════════════════════════════════════════════════════════════
# PERSONAL AUTH EVENTS
# ══════════════════════════════════════════════════════════════

@router.get(
    "/events",
    status_code=status.HTTP_200_OK,
    summary="Get my auth events",
    description="Get authentication audit events for the authenticated user.",
)
async def get_my_auth_events(
    user: CurrentUser,
    auth_service: AuthServiceDep,
    offset: int = 0,
    limit: int = 50,
) -> dict:
    """Get authentication audit events for the current user."""
    events = await auth_service.get_auth_events(
        user_id=user["id"],
        requesting_user_id=user["id"],
        offset=offset,
        limit=limit,
    )
    return {"success": True, "data": events, "count": len(events)}
