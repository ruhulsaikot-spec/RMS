"""
RMS Backend - Custom Middleware

Enterprise middleware stack for request processing, logging,
timing, and security headers. All middleware follows ASGI conventions.
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Callable

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.logging import bind_request_context, clear_request_context, get_logger
from collections import defaultdict
import asyncio

logger = get_logger(__name__)

# Simple in-memory rate limiter for login endpoint
_login_attempts: dict = defaultdict(list)
_login_lock = asyncio.Lock()

class LoginRateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limit login endpoint to 5 attempts per minute per IP."""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path == "/api/auth/login" and request.method == "POST":
            client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or (request.client.host if request.client else "unknown")
            now = time.time()
            
            async with _login_lock:
                # Remove attempts older than 60 seconds
                _login_attempts[client_ip] = [t for t in _login_attempts[client_ip] if now - t < 60]
                
                if len(_login_attempts[client_ip]) >= 5:
                    from fastapi.responses import JSONResponse
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many login attempts. Please wait 1 minute and try again."}
                    )
                
                _login_attempts[client_ip].append(now)
        
        return await call_next(request)


# ── Request ID Middleware ─────────────────────────────────────
class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Assign a unique trace ID to every incoming request.

    Generates a UUID-based request ID and adds it to:
    - Response headers (X-Request-ID)
    - Structured logging context (bound via contextvars)
    - Request state (accessible in route handlers)

    If the client sends an X-Request-ID header, it is preserved
    and used instead of generating a new one (for distributed tracing).
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Use client-provided request ID or generate one
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        # Bind to logging context
        bind_request_context(
            request_id=request_id,
            ip_address=self._get_client_ip(request),
        )

        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        # Clean up logging context
        clear_request_context()

        return response

    @staticmethod
    def _get_client_ip(request: Request) -> str:
        """Extract client IP from request, considering proxy headers."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"


# ── Request Timing Middleware ────────────────────────────────
class RequestTimingMiddleware(BaseHTTPMiddleware):
    """
    Measure and log request processing duration.

    Adds X-Process-Time header to responses and logs
    request duration for performance monitoring.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Process-Time"] = f"{duration_ms}ms"

        # Log request timing
        logger.info(
            "request_completed",
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        return response


# ── Security Headers Middleware ──────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security-related headers to all responses.

    Implements OWASP-recommended security headers for
    production deployments including XSS protection,
    content type sniffing prevention, and HSTS.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS Protection (legacy, but still recommended)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Prevent clickjacking
        #response.headers["X-Frame-Options"] = "DENY"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Content Security Policy (basic)
        #response.headers[
        #    "Content-Security-Policy"
        #] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"

        # HSTS (only in production with HTTPS)
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Permissions policy
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        return response


# ── CORS Configuration ───────────────────────────────────────
def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS middleware for cross-origin requests.

    Reads allowed origins, methods, and headers from application
    settings. In development, allows all origins. In production,
    restricts to explicitly configured origins.

    Args:
        app: The FastAPI application instance.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.origins_list,
        allow_credentials=settings.cors.allow_credentials,
        allow_methods=settings.cors.methods_list,
        allow_headers=settings.cors.headers_list,
        max_age=86400,  # Preflight cache: 24 hours
    )


# ── Register All Middleware ──────────────────────────────────
def register_middleware(app: FastAPI) -> None:
    """
    Register all middleware on the FastAPI application.

    Order matters: middleware is applied in reverse registration order.
    First registered = outermost layer = processes request first and response last.

    Registration order (inside-out):
    1. RequestIDMiddleware   - assigns trace ID (outermost)
    2. RequestTimingMiddleware - measures duration
    3. SecurityHeadersMiddleware - adds security headers
    4. CORSMiddleware - handles CORS (innermost)

    Args:
        app: The FastAPI application instance.
    """
    # Register custom middleware (applied LIFO, so first = outermost)
    app.add_middleware(LoginRateLimitMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    # CORS (should be innermost for proper preflight handling)
    setup_cors(app)

    logger.info(
        "middleware_registered",
        middleware=[
            "RequestIDMiddleware",
            "RequestTimingMiddleware",
            "SecurityHeadersMiddleware",
            "CORSMiddleware",
        ],
    )
