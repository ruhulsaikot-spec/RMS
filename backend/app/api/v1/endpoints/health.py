"""
RMS Backend - Health Check Endpoint

Provides liveness, readiness, and detailed health check endpoints
for Kubernetes probes, load balancers, and monitoring systems.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import check_database_connection
from app.core.dependencies import get_redis

router = APIRouter()


# ── Response Models ──────────────────────────────────────────
class HealthStatus(BaseModel):
    """Basic health check response."""

    status: str
    timestamp: str
    version: str
    environment: str


class DetailedHealthStatus(BaseModel):
    """Detailed health check response with component status."""

    status: str
    timestamp: str
    version: str
    environment: str
    components: dict[str, Any]


# ── Liveness Probe ──────────────────────────────────────────
@router.get(
    "/live",
    summary="Liveness probe",
    description="Returns OK if the application process is alive and responsive.",
    response_model=HealthStatus,
)
async def liveness_probe() -> HealthStatus:
    """
    Kubernetes liveness probe endpoint.

    Returns a simple OK response to indicate the application process
    is alive and can handle requests. If this endpoint fails,
    Kubernetes will restart the pod.
    """
    return HealthStatus(
        status="alive",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.app_version,
        environment=settings.app_env.value,
    )


# ── Readiness Probe ─────────────────────────────────────────
@router.get(
    "/ready",
    summary="Readiness probe",
    description="Returns OK if the application is ready to accept traffic.",
    response_model=DetailedHealthStatus,
)
async def readiness_probe() -> DetailedHealthStatus:
    """
    Kubernetes readiness probe endpoint.

    Checks all critical dependencies (database, Redis) and returns
    their individual health status. If any critical dependency is
    unhealthy, the overall status is 'degraded' but not 'unhealthy'
    to prevent unnecessary pod restarts.
    """
    components: dict[str, Any] = {}

    # Check database
    db_health = await check_database_connection()
    components["database"] = db_health

    # Check Redis
    try:
        redis_client = await get_redis().__anext__()
        await redis_client.ping()
        components["redis"] = {"status": "healthy"}
    except Exception as exc:
        components["redis"] = {"status": "unhealthy", "error": str(exc)}

    # Determine overall status
    critical_statuses = [
        components["database"]["status"],
        components["redis"]["status"],
    ]
    if all(s == "healthy" for s in critical_statuses):
        overall_status = "healthy"
    elif any(s == "unhealthy" for s in critical_statuses):
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    return DetailedHealthStatus(
        status=overall_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.app_version,
        environment=settings.app_env.value,
        components=components,
    )


# ── Detailed Health Check ────────────────────────────────────
@router.get(
    "",
    summary="Detailed health check",
    description="Returns comprehensive health status of all system components.",
    response_model=DetailedHealthStatus,
)
async def health_check() -> DetailedHealthStatus:
    """
    Detailed health check endpoint for monitoring dashboards.

    Returns comprehensive status of all system components including
    database version, connection pool stats, Redis connectivity,
    and application metadata.
    """
    components: dict[str, Any] = {}

    # Database health with details
    db_health = await check_database_connection()
    components["database"] = db_health

    # Redis health
    try:
        redis_client = await get_redis().__anext__()
        await redis_client.ping()
        info = await redis_client.info("server")
        components["redis"] = {
            "status": "healthy",
            "version": info.get("redis_version", "unknown"),
            "uptime_seconds": info.get("uptime_in_seconds", 0),
        }
    except Exception as exc:
        components["redis"] = {"status": "unhealthy", "error": str(exc)}

    # Application info
    components["application"] = {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env.value,
        "debug": settings.app_debug,
    }

    # Determine overall status
    all_statuses = [
        components["database"]["status"],
        components["redis"]["status"],
    ]
    if all(s == "healthy" for s in all_statuses):
        overall_status = "healthy"
    elif any(s == "unhealthy" for s in all_statuses):
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    return DetailedHealthStatus(
        status=overall_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.app_version,
        environment=settings.app_env.value,
        components=components,
    )
