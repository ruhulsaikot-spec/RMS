"""
RMS Backend - Dependency Injection

FastAPI dependency providers for database sessions, Redis connections,
authentication, authorization, and common request context.
All dependencies are async-compatible and follow FastAPI's Depends pattern.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db_session
from app.core.exceptions import AuthenticationError, AuthorizationError


# ── Security Schemes ─────────────────────────────────────────
bearer_scheme = HTTPBearer(
    scheme_name="Bearer",
    description="JWT Bearer token obtained from /api/v1/auth/login",
    auto_error=False,
)


# ── Database Session Dependency ──────────────────────────────
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
"""
Type-annotated dependency for async database sessions.

Usage:
    @router.get("/users")
    async def list_users(db: DBSession):
        result = await db.execute(select(User))
        return result.scalars().all()
"""


# ── Redis Dependency ─────────────────────────────────────────
_redis_pool: Redis | None = None


async def _init_redis_pool() -> Redis:
    """Initialize the Redis connection pool."""
    global _redis_pool
    _redis_pool = Redis.from_url(
        settings.redis.dsn,
        max_connections=settings.redis.max_connections,
        socket_timeout=settings.redis.socket_timeout,
        socket_connect_timeout=settings.redis.socket_connect_timeout,
        decode_responses=settings.redis.decode_responses,
    )
    return _redis_pool


async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    Provide a Redis client instance from the connection pool.

    Usage:
        @router.get("/cached-data")
        async def get_cached(redis: RedisDep):
            data = await redis.get("some_key")
            return {"data": data}
    """
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = await _init_redis_pool()
    yield _redis_pool


RedisDep = Annotated[Redis, Depends(get_redis)]
"""Type-annotated dependency for Redis client."""


async def close_redis_pool() -> None:
    """Close the Redis connection pool on application shutdown."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None


# ── Authentication Dependencies ──────────────────────────────
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    """
    Extract and validate the current authenticated user from JWT token.

    Decodes the Bearer token, validates signature and expiration,
    and returns the user payload for downstream use.

    Raises:
        AuthenticationError: If no token provided or token is invalid.

    Returns:
        Dictionary with user claims (sub, email, roles, etc.)
    """
    if credentials is None:
        raise AuthenticationError("Authentication required: no Bearer token provided")

    token = credentials.credentials

    try:
        from jose import JWTError, jwt

        payload = jwt.decode(
            token,
            settings.jwt.secret_key,
            algorithms=[settings.jwt.algorithm],
            issuer=settings.jwt.issuer,
            audience=settings.jwt.audience,
        )
        return payload

    except JWTError as exc:
        raise AuthenticationError(f"Invalid authentication token: {str(exc)}") from exc


CurrentUser = Annotated[dict, Depends(get_current_user)]
"""
Type-annotated dependency for the current authenticated user.

Usage:
    @router.get("/me")
    async def get_profile(user: CurrentUser):
        return {"email": user["email"]}
"""


async def get_current_user_id(
    user: CurrentUser,
) -> str:
    """
    Extract just the user ID from the current user payload.

    Convenience dependency for endpoints that only need the user ID.
    """
    user_id = user.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token: missing user identifier")
    return user_id


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
"""Type-annotated dependency for the current user's ID."""


# ── Authorization Dependencies ───────────────────────────────
def require_roles(*required_roles: str):
    """
    Factory dependency that checks if the current user has required roles.

    Returns a FastAPI dependency that raises AuthorizationError
    if the user lacks any of the specified roles.

    Usage:
        @router.delete("/users/{id}", dependencies=[Depends(require_roles("admin"))])
        async def delete_user(id: str):
            ...

        @router.post("/approve", dependencies=[Depends(require_roles("admin", "manager"))])
        async def approve_reimbursement():
            ...
    """

    async def _check_roles(user: CurrentUser) -> dict:
        user_roles = user.get("roles", [])
        if isinstance(user_roles, str):
            user_roles = [user_roles]

        if not any(role in user_roles for role in required_roles):
            raise AuthorizationError(
                f"Required role(s): {', '.join(required_roles)}. "
                f"User has: {', '.join(user_roles) or 'none'}"
            )
        return user

    return _check_roles


def require_permission(permission: str):
    """
    Factory dependency that checks if the current user has a specific permission.

    Usage:
        @router.post("/reimbursements", dependencies=[Depends(require_permission("reimb:create"))])
        async def create_reimbursement():
            ...
    """

    async def _check_permission(user: CurrentUser) -> dict:
        user_permissions = user.get("permissions", [])
        if permission not in user_permissions:
            raise AuthorizationError(
                f"Required permission: {permission}. User does not have this permission."
            )
        return user

    return _check_permission


# ── Pagination Dependencies ──────────────────────────────────
class PaginationParams:
    """
    Common pagination parameters for list endpoints.

    Provides page and page_size with sensible defaults
    and validation constraints.
    """

    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
    ):
        self.page = max(1, page)
        self.page_size = min(max(1, page_size), 100)  # Cap at 100

    @property
    def offset(self) -> int:
        """Calculate SQL OFFSET value."""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """Get SQL LIMIT value."""
        return self.page_size


Pagination = Annotated[PaginationParams, Depends()]
"""Type-annotated dependency for pagination parameters."""
