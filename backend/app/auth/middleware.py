"""
RMS Backend - RBAC Middleware

FastAPI middleware for automatic role-based and permission-based
access control at the route level. Integrates with the authentication
system to enforce authorization policies on every request.
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.auth.jwt_utils import decode_token, get_token_subject, validate_token_type, TOKEN_TYPE_ACCESS
from app.auth.redis_store import TokenBlacklist
from app.auth.security_config import security_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


# ── Route Permission Mapping ─────────────────────────────────
# Maps API route patterns to required permissions.
# This is a fallback for routes that don't use explicit dependency guards.

ROUTE_PERMISSION_MAP: list[dict[str, Any]] = [
    # User management
    {"pattern": r"^/api/v1/users$", "methods": ["POST"], "permission": "user:create"},
    {"pattern": r"^/api/v1/users/.+$", "methods": ["GET"], "permission": "user:read"},
    {"pattern": r"^/api/v1/users/.+$", "methods": ["PUT", "PATCH"], "permission": "user:update"},
    {"pattern": r"^/api/v1/users/.+$", "methods": ["DELETE"], "permission": "user:delete"},

    # Reimbursement management
    {"pattern": r"^/api/v1/reimbursements$", "methods": ["POST"], "permission": "reimbursement:create"},
    {"pattern": r"^/api/v1/reimbursements/.+$", "methods": ["GET"], "permission": "reimbursement:read"},
    {"pattern": r"^/api/v1/reimbursements/.+$", "methods": ["PUT", "PATCH"], "permission": "reimbursement:update"},
    {"pattern": r"^/api/v1/reimbursements/.+$", "methods": ["DELETE"], "permission": "reimbursement:delete"},

    # Approval management
    {"pattern": r"^/api/v1/approvals$", "methods": ["GET"], "permission": "approval:read"},
    {"pattern": r"^/api/v1/approvals/.+/approve$", "methods": ["POST"], "permission": "approval:approve"},
    {"pattern": r"^/api/v1/approvals/.+/reject$", "methods": ["POST"], "permission": "approval:reject"},

    # Payment management
    {"pattern": r"^/api/v1/payments$", "methods": ["POST"], "permission": "payment:create"},
    {"pattern": r"^/api/v1/payments/.+$", "methods": ["GET"], "permission": "payment:read"},
    {"pattern": r"^/api/v1/payments/.+/process$", "methods": ["POST"], "permission": "payment:process"},

    # Report management
    {"pattern": r"^/api/v1/reports$", "methods": ["GET"], "permission": "report:read"},
    {"pattern": r"^/api/v1/reports/export$", "methods": ["POST"], "permission": "report:export"},

    # Department management
    {"pattern": r"^/api/v1/departments$", "methods": ["POST"], "permission": "department:create"},
    {"pattern": r"^/api/v1/departments/.+$", "methods": ["PUT", "PATCH"], "permission": "department:update"},
    {"pattern": r"^/api/v1/departments/.+$", "methods": ["DELETE"], "permission": "department:delete"},

    # Workflow management
    {"pattern": r"^/api/v1/workflows$", "methods": ["POST"], "permission": "workflow:create"},
    {"pattern": r"^/api/v1/workflows/.+$", "methods": ["PUT", "PATCH"], "permission": "workflow:update"},

    # Notification management
    {"pattern": r"^/api/v1/notifications$", "methods": ["POST"], "permission": "notification:create"},
    {"pattern": r"^/api/v1/notifications/.+$", "methods": ["PUT", "PATCH"], "permission": "notification:update"},
]

# Public routes that bypass RBAC middleware checks entirely
PUBLIC_ROUTES: list[str] = [
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/api/v1/auth/password-reset/request",
    "/api/v1/auth/password-reset/confirm",
    "/api/v1/health/live",
    "/api/v1/health/ready",
    "/api/v1/health",
    "/api/v1/health/",
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
]


class RBACMiddleware(BaseHTTPMiddleware):
    """
    Role-Based Access Control middleware for automatic route-level authorization.

    This middleware provides a second layer of defense beyond explicit
    dependency guards. It checks incoming authenticated requests against
    the route permission map and verifies the user has the required
    permission for the requested action.

    Features:
    - Public route bypass (no auth required)
    - Route-to-permission mapping via regex patterns
    - Superuser bypass (full access)
    - Audit logging for denied requests
    - Graceful handling of missing/invalid tokens
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process request through RBAC checks."""

        # Skip non-API routes
        path = request.url.path
        if not path.startswith("/api/"):
            return await call_next(request)

        # Skip public routes
        if path in PUBLIC_ROUTES or any(path.startswith(r) for r in PUBLIC_ROUTES):
            return await call_next(request)

        # Skip OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Try to extract and validate token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            # No token — let the endpoint's own auth dependency handle this
            return await call_next(request)

        token_str = auth_header.split(" ", 1)[1]

        try:
            payload = decode_token(token_str)

            # Only process access tokens
            if not validate_token_type(payload, TOKEN_TYPE_ACCESS):
                return await call_next(request)

            user_id = get_token_subject(payload)
            is_superuser = payload.get("is_superuser", False)
            permissions = payload.get("permissions", [])

            # Superusers bypass all RBAC checks
            if is_superuser:
                return await call_next(request)

            # Check route permission mapping
            required_permission = self._get_required_permission(path, request.method)

            if required_permission and required_permission not in permissions:
                logger.warning(
                    "rbac_middleware_denied",
                    user_id=user_id,
                    path=path,
                    method=request.method,
                    required_permission=required_permission,
                    user_permissions=permissions,
                )
                from fastapi.responses import JSONResponse

                return JSONResponse(
                    status_code=403,
                    content={
                        "success": False,
                        "error": {
                            "type": "rms:authorization-error",
                            "title": "Authorization Error",
                            "status": 403,
                            "detail": (
                                f"Access denied. Required permission: '{required_permission}'. "
                                f"Contact your administrator to request access."
                            ),
                        },
                    },
                )

        except Exception as exc:
            # If token decoding fails, let the endpoint's own auth handle it
            logger.debug("rbac_middleware_token_error", error=str(exc))

        return await call_next(request)

    @staticmethod
    def _get_required_permission(path: str, method: str) -> str | None:
        """
        Look up the required permission for a route.

        Args:
            path: Request URL path.
            method: HTTP method.

        Returns:
            Required permission code or None if no mapping exists.
        """
        for mapping in ROUTE_PERMISSION_MAP:
            if re.match(mapping["pattern"], path) and method in mapping["methods"]:
                return mapping["permission"]
        return None


def register_rbac_middleware(app: FastAPI) -> None:
    """
    Register the RBAC middleware on the FastAPI application.

    Should be called during application setup, after other middleware
    but before route registration.

    Args:
        app: The FastAPI application instance.
    """
    app.add_middleware(RBACMiddleware)
    logger.info("rbac_middleware_registered")
