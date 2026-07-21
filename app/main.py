"""
RMS Backend - FastAPI Application Entry Point

Main application factory with lifespan management, middleware registration,
exception handlers, and API router mounting. Follows the application factory
pattern for testability and environment-specific configuration.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import check_database_connection, close_database_connection
from app.core.dependencies import close_redis_pool, _init_redis_pool
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.core.middleware import register_middleware
from fastapi.staticfiles import StaticFiles

logger = get_logger(__name__)


# ── Application Lifespan ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manage application startup and shutdown lifecycle events.

    Startup:
    - Initialize structured logging
    - Verify database connectivity
    - Initialize Redis connection pool
    - Log application readiness

    Shutdown:
    - Close database connections
    - Close Redis connection pool
    - Log application shutdown
    """
    # ── STARTUP ──────────────────────────────────────────
    logger.info(
        "application_starting",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env.value,
    )

    # Initialize logging
    setup_logging()
    logger.info("logging_initialized", format=settings.logging.format)

    # Verify database connection
    db_health = await check_database_connection()
    if db_health["status"] == "healthy":
        logger.info(
            "database_connected",
            version=db_health.get("postgresql_version", "unknown"),
        )
    else:
        logger.error(
            "database_connection_failed",
            error=db_health.get("error", "unknown"),
        )

    # Initialize Redis
    try:
        redis_client = await _init_redis_pool()
        await redis_client.ping()
        logger.info("redis_connected", dsn=settings.redis.dsn)
    except Exception as exc:
        logger.warning("redis_connection_failed", error=str(exc))

    logger.info(
        "application_ready",
        host=settings.app_host,
        port=settings.app_port,
        docs_url="/docs",
    )

    yield  # Application is running

    # ── SHUTDOWN ─────────────────────────────────────────
    logger.info("application_shutting_down")

    await close_database_connection()
    logger.info("database_connections_closed")

    await close_redis_pool()
    logger.info("redis_connections_closed")

    logger.info("application_stopped")


# ── Application Factory ──────────────────────────────────────
def create_application() -> FastAPI:
    """Create and configure FastAPI application."""

    application = FastAPI(
        title=settings.app_name,
        description=(
            "Enterprise-grade Reimbursement Management System API. "
            "Provides comprehensive reimbursement lifecycle management including "
            "submission, workflow-driven approval, payment processing, and reporting."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        contact={
            "name": "RMS Engineering Team",
            "email": "engineering@rms-enterprise.com",
        },
        license_info={
            "name": "MIT License",
        },
    )

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Register middleware stack
    register_middleware(application)
    # Add GZip compression
    application.add_middleware(
        GZipMiddleware,
        minimum_size=1000,
    )
    # Register exception handlers
    register_exception_handlers(application)
    # Rate limiter
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Mount API routers
    application.include_router(
        api_v1_router,
        prefix="/api",
    )

    application.mount(
        "/uploads",
        StaticFiles(directory="uploads"),
        name="uploads",
    )

    @application.get("/test-upload")
    async def test_upload():
        return {
            "status": "upload route active"
        }

    @application.get("/", include_in_schema=False)
    async def root_redirect() -> dict:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    return application


# ── Application Instance ─────────────────────────────────────
app = create_application()



# ── CLI Entry Point ──────────────────────────────────────────
def cli() -> None:
    """CLI entry point for running the application with uvicorn."""
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.is_development,
        log_level=settings.logging.level.lower(),
        access_log=True,
        use_colors=True,
    )


if __name__ == "__main__":
    cli()
