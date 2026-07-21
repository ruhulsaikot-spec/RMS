"""
RMS Backend - Base Pydantic Schemas

Common schema patterns for API request/response serialization
using Pydantic v2 with ORM mode support.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field


# ── Base Schema Configuration ────────────────────────────────
class BaseSchema(BaseModel):
    """
    Base Pydantic schema with common configuration.

    Enables ORM mode for SQLAlchemy model serialization
    and enforces strict type checking.
    """

    model_config = ConfigDict(
        from_attributes=True,
        strict=False,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


# ── Audit Fields Schema ─────────────────────────────────────
class AuditFieldsSchema(BaseSchema):
    """Schema for common audit fields included in responses."""

    created_at: datetime | None = None
    updated_at: datetime | None = None
    created_by: uuid.UUID | None = None
    updated_by: uuid.UUID | None = None


# ── Soft Delete Schema ──────────────────────────────────────
class SoftDeleteSchema(BaseSchema):
    """Schema for soft delete fields included in responses."""

    is_deleted: bool = False
    deleted_at: datetime | None = None
    deleted_by: uuid.UUID | None = None


# ── Pagination Schemas ──────────────────────────────────────
class PaginationRequest(BaseSchema):
    """Pagination parameters for list endpoints."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")


class PaginationMeta(BaseSchema):
    """Pagination metadata included in paginated responses."""

    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool


# ── Generic Paginated Response ───────────────────────────────
T = TypeVar("T")


class PaginatedResponse(BaseSchema, Generic[T]):
    """
    Generic paginated response wrapper.

    Usage:
        class UserResponse(BaseSchema):
            id: uuid.UUID
            email: str

        PaginatedResponse[UserResponse]
    """

    success: bool = True
    data: list[T] = []
    pagination: PaginationMeta | None = None


# ── Standard API Response ────────────────────────────────────
class APIResponse(BaseSchema, Generic[T]):
    """
    Generic API response wrapper with success/error indication.

    Usage:
        @router.get("/users/{id}")
        async def get_user(id: str) -> APIResponse[UserResponse]:
            return APIResponse(data=user)
    """

    success: bool = True
    data: T | None = None
    message: str | None = None


# ── Health Check Schemas ────────────────────────────────────
class HealthCheckResponse(BaseSchema):
    """Health check endpoint response schema."""

    status: str
    timestamp: datetime
    version: str
    environment: str
    components: dict[str, Any] | None = None
