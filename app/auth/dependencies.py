"""
RMS Backend - Authentication Dependencies

FastAPI dependency providers for JWT token verification, current user
extraction, role-based access control (RBAC), and permission-based
authorization. Integrates with Redis token blacklist for revocation checks.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_utils import (
    TOKEN_TYPE_ACCESS,
    decode_token,
    get_token_jti,
    get_token_subject,
    is_token_expired,
    validate_token_type,
)
from app.auth.redis_store import TokenBlacklist
from app.auth.repositories.auth_repository import UserRepository
from app.auth.security_config import security_settings
from app.core.database import get_db_session
from app.core.dependencies import get_redis
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── Bearer Security Scheme ────────────────────────────────────
bearer_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    description="JWT Bearer token obtained from /api/v1/auth/login",
    auto_error=False,
)


# ── Token Verification Dependency ─────────────────────────────
async def verify_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> dict:
    """
    Verify JWT access token and return decoded payload.

    Performs the following checks:
    1. Bearer token presence
    2. JWT signature validation
    3. Token expiration check
    4. Token type verification (must be 'access')
    5. Redis blacklist check (revoked tokens)

    Args:
        credentials: HTTP Bearer credentials from request header.
        redis: Redis client for blacklist checks.

    Returns:
        Decoded JWT payload dictionary with user claims.

    Raises:
        AuthenticationError: If token is missing, invalid, expired, or revoked.
    """
    print("CREDENTIALS =>", credentials)

    if credentials is None:
        raise AuthenticationError("Authentication required: no Bearer token provided")

    token = credentials.credentials

    # Decode and validate JWT signature
    try:
        payload = decode_token(token)
    except Exception as exc:
        logger.warning("token_decode_failed", error=str(exc))
        raise AuthenticationError(f"Invalid authentication token: {str(exc)}") from exc

    # Verify token type is 'access'
    if not validate_token_type(payload, TOKEN_TYPE_ACCESS):
        raise AuthenticationError(
            "Invalid token type: access token required. "
            "Do not use refresh tokens for API authentication."
        )

    # Check token expiration
    if is_token_expired(payload):
        raise AuthenticationError("Token has expired. Please refresh or re-authenticate.")

    # Check Redis blacklist
    jti = get_token_jti(payload)
    if jti:
        blacklist = TokenBlacklist(redis)
        if await blacklist.is_blacklisted(jti, token_type="access"):
            raise AuthenticationError("Token has been revoked. Please re-authenticate.")

    # Check user-level blacklist (force logout all)
    user_id = get_token_subject(payload)
    if user_id:
        blacklist = TokenBlacklist(redis)
        if await blacklist.is_user_blacklisted(user_id):
            raise AuthenticationError(
                "All sessions have been revoked. Please re-authenticate."
            )

    return payload


# ── Verified Token Dependency ─────────────────────────────────
VerifiedToken = Annotated[dict, Depends(verify_token)]
"""
Type-annotated dependency for verified JWT token payload.

Usage:
    @router.get("/protected")
    async def protected_route(token: VerifiedToken):
        user_id = token["sub"]
        roles = token.get("roles", [])
"""


# ── Current User Dependency ───────────────────────────────────
async def get_current_user(
    token: VerifiedToken,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> dict:
    """
    Get the current authenticated user with full profile data.

    Combines JWT token claims with database user record for
    complete authorization context. Loads roles and permissions
    from the database for up-to-date access control.

    Args:
        token: Verified JWT payload from verify_token dependency.
        db: Async database session.

    Returns:
        Dictionary with user profile, roles, and permissions.

    Raises:
        AuthenticationError: If user not found or account is inactive.
    """
    user_id = get_token_subject(token)
    if not user_id:
        raise AuthenticationError("Invalid token: missing user identifier")

    # Fetch user with roles and permissions
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if user is None:
        raise AuthenticationError("User not found or account deactivated")

    if not user.is_active:
        raise AuthenticationError("Account is inactive. Contact your administrator.")

    if user.is_locked:
        raise AuthenticationError(
            "Account is locked due to too many failed login attempts. "
            "Please contact your administrator or wait for the lockout to expire."
        )

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "employee_id": user.employee_id,
        "department_id": user.department_id,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "account_status": user.account_status,
        "must_change_password": user.must_change_password,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "roles": user.role_names,
        "permissions": user.permission_codes,
    }


CurrentUser = Annotated[dict, Depends(get_current_user)]
"""
Type-annotated dependency for the current authenticated user.

Usage:
    @router.get("/me")
    async def get_profile(user: CurrentUser):
        return user
"""


# ── Current User ID Dependency ────────────────────────────────
async def get_current_user_id(token: VerifiedToken) -> str:
    """
    Extract just the user ID from the verified token.

    Lightweight dependency for endpoints that only need the user ID
    without loading the full user profile from the database.
    """
    user_id = get_token_subject(token)
    if not user_id:
        raise AuthenticationError("Invalid token: missing user identifier")
    return user_id


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
"""Type-annotated dependency for the current user's ID."""


# ── Role-Based Access Control (RBAC) Dependencies ─────────────
def require_roles(*required_roles: str):
    """
    Factory dependency that enforces role-based access control.

    Checks if the current user has at least one of the required roles.
    Superusers bypass all role checks.

    Args:
        *required_roles: One or more role names (e.g., "admin", "finance").
            User must have at least ONE of the specified roles.

    Usage:
        # Single role required
        @router.delete("/users/{id}", dependencies=[Depends(require_roles("admin"))])
        async def delete_user(id: str): ...

        # Multiple roles (ANY match)
        @router.post("/approve", dependencies=[Depends(require_roles("admin", "approver"))])
        async def approve(): ...
    """

    async def _check_roles(user: CurrentUser) -> dict:
        # Superusers bypass all role checks
        if user.get("is_superuser"):
            return user

        user_roles = user.get("roles", [])

        if not any(role in user_roles for role in required_roles):
            raise AuthorizationError(
                f"Access denied. Required role(s): {', '.join(required_roles)}. "
                f"Your roles: {', '.join(user_roles) or 'none'}"
            )

        return user

    return _check_roles


def require_all_roles(*required_roles: str):
    """
    Factory dependency that requires ALL specified roles.

    Unlike require_roles which allows ANY match, this requires
    the user to have ALL of the specified roles.

    Args:
        *required_roles: All role names the user must have.

    Usage:
        @router.post("/admin-finance-action",
                     dependencies=[Depends(require_all_roles("admin", "finance"))])
        async def admin_finance_action(): ...
    """

    async def _check_all_roles(user: CurrentUser) -> dict:
        if user.get("is_superuser"):
            return user

        user_roles = user.get("roles", [])
        missing = [r for r in required_roles if r not in user_roles]

        if missing:
            raise AuthorizationError(
                f"Access denied. Missing required role(s): {', '.join(missing)}. "
                f"Your roles: {', '.join(user_roles) or 'none'}"
            )

        return user

    return _check_all_roles


# ── Permission-Based Authorization Dependencies ───────────────
def require_permission(permission: str):
    """
    Factory dependency that checks for a specific permission.

    Permissions follow the resource:action convention
    (e.g., "reimbursement:create", "approval:approve").

    Args:
        permission: Permission code string.

    Usage:
        @router.post("/reimbursements",
                     dependencies=[Depends(require_permission("reimbursement:create"))])
        async def create_reimbursement(): ...
    """

    async def _check_permission(user: CurrentUser) -> dict:
        if user.get("is_superuser"):
            return user

        user_permissions = user.get("permissions", [])

        if permission not in user_permissions:
            raise AuthorizationError(
                f"Access denied. Required permission: '{permission}'. "
                f"Contact your administrator to request access."
            )

        return user

    return _check_permission


def require_any_permission(*permissions: str):
    """
    Factory dependency that checks for ANY of the specified permissions.

    Args:
        *permissions: Permission codes (user needs at least one).

    Usage:
        @router.get("/reports",
                     dependencies=[Depends(require_any_permission(
                         "report:view", "report:export", "report:admin"
                     ))])
        async def view_reports(): ...
    """

    async def _check_any_permission(user: CurrentUser) -> dict:
        if user.get("is_superuser"):
            return user

        user_permissions = user.get("permissions", [])

        if not any(p in user_permissions for p in permissions):
            raise AuthorizationError(
                f"Access denied. Required one of: {', '.join(permissions)}. "
                f"Contact your administrator to request access."
            )

        return user

    return _check_any_permission


def require_all_permissions(*permissions: str):
    """
    Factory dependency that checks for ALL specified permissions.

    Args:
        *permissions: Permission codes (user needs all of them).

    Usage:
        @router.post("/payments/process",
                     dependencies=[Depends(require_all_permissions(
                         "payment:create", "payment:approve"
                     ))])
        async def process_payment(): ...
    """

    async def _check_all_permissions(user: CurrentUser) -> dict:
        if user.get("is_superuser"):
            return user

        user_permissions = user.get("permissions", [])
        missing = [p for p in permissions if p not in user_permissions]

        if missing:
            raise AuthorizationError(
                f"Access denied. Missing permission(s): {', '.join(missing)}. "
                f"Contact your administrator to request access."
            )

        return user

    return _check_all_permissions


# ── Resource Ownership Dependency ─────────────────────────────
def require_owner_or_roles(
    resource_user_id_param: str = "user_id",
    *allowed_roles: str,
):
    """
    Factory dependency that allows access if the user owns the resource
    OR has one of the specified roles.

    Useful for endpoints where users can access their own resources,
    but admins/approvers can access anyone's resources.

    Args:
        resource_user_id_param: Path/query parameter name containing the resource owner's user ID.
        *allowed_roles: Roles that can access any user's resources.

    Usage:
        @router.get("/users/{user_id}/reimbursements",
                     dependencies=[Depends(require_owner_or_roles("user_id", "admin", "approver"))])
        async def get_user_reimbursements(user_id: str): ...
    """

    async def _check_ownership(request: Request, user: CurrentUser) -> dict:
        # Superusers and allowed roles can access any resource
        if user.get("is_superuser"):
            return user

        user_roles = user.get("roles", [])
        if any(role in user_roles for role in allowed_roles):
            return user

        # Check if the user is the resource owner
        resource_user_id = request.path_params.get(resource_user_id_param)
        if not resource_user_id:
            resource_user_id = request.query_params.get(resource_user_id_param)

        if resource_user_id and str(resource_user_id) == str(user.get("id")):
            return user

        raise AuthorizationError(
            "Access denied. You can only access your own resources. "
            "Contact an administrator for broader access."
        )

    return _check_ownership


# ── Optional Auth Dependency ──────────────────────────────────
async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    redis: Annotated[Redis, Depends(get_redis)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> dict | None:
    """
    Get the current user if authenticated, or None if not.

    Unlike get_current_user, this dependency does not raise
    AuthenticationError if no token is provided. Useful for
    endpoints that behave differently for authenticated vs
    anonymous users.

    Usage:
        @router.get("/public-data")
        async def get_data(user: OptionalUser):
            if user:
                return get_personalized_data(user)
            return get_public_data()
    """
    if credentials is None:
        return None

    try:
        token = await verify_token(credentials, redis)
        user_id = get_token_subject(token)
        if not user_id:
            return None

        user_repo = UserRepository(db)
        user = await user_repo.get_by_id(user_id)

        if user is None or not user.is_active or user.is_locked:
            return None

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "roles": user.role_names,
            "permissions": user.permission_codes,
            "is_superuser": user.is_superuser,
        }
    except Exception:
        return None


OptionalUser = Annotated[dict | None, Depends(get_optional_user)]
"""Type-annotated dependency for optional authentication."""
