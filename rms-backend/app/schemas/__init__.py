"""
RMS Backend - Pydantic Schemas Package

Import schemas organized by module for API serialization.
"""

from app.schemas.base import (
    APIResponse,
    AuditFieldsSchema,
    BaseSchema,
    HealthCheckResponse,
    PaginatedResponse,
    PaginationMeta,
    PaginationRequest,
    SoftDeleteSchema,
)

__all__ = [
    "BaseSchema",
    "AuditFieldsSchema",
    "SoftDeleteSchema",
    "PaginationRequest",
    "PaginationMeta",
    "PaginatedResponse",
    "APIResponse",
    "HealthCheckResponse",
]
