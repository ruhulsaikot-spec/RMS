"""
RMS Backend - SQLAlchemy Base Model

Base model class with common mixins for audit fields, soft delete,
and timezone-aware timestamps. All RMS models should inherit from
the BaseModel class defined here.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    declared_attr,
    mapped_column,
)

from app.core.database import Base


# ── UUID Primary Key Mixin ───────────────────────────────────
class UUIDPrimaryKey:
    """
    Mixin providing a UUID primary key column.

    Uses PostgreSQL gen_random_uuid() for server-side UUID generation.
    All RMS entities use UUID v4 as primary keys for distributed
    system compatibility and non-sequential security.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=func.gen_random_uuid(),
        comment="Primary key - UUID v4",
    )


# ── Audit Fields Mixin ──────────────────────────────────────
class AuditFields:
    """
    Mixin providing standard audit trail columns.

    Tracks who created/updated each record and when, following
    enterprise audit requirements. All fields are nullable to
    support data migration and system-level operations.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Record creation timestamp (UTC)",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Record last update timestamp (UTC)",
    )

    created_by: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        comment="UUID of the user who created this record",
    )

    updated_by: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        comment="UUID of the user who last updated this record",
    )


# ── Soft Delete Mixin ───────────────────────────────────────
class SoftDelete:
    """
    Mixin providing soft delete capability.

    Instead of physically deleting records, marks them as deleted
    with a timestamp. Supports data recovery and audit compliance.
    Queries should filter by is_deleted=False for active records.
    """

    is_deleted: Mapped[bool] = mapped_column(
        default=False,
        server_default="false",
        nullable=False,
        comment="Soft delete flag - true if record is deleted",
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when record was soft-deleted (UTC)",
    )

    deleted_by: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        comment="UUID of the user who soft-deleted this record",
    )


# ── Base Model ───────────────────────────────────────────────
class BaseModel(Base, UUIDPrimaryKey, AuditFields, SoftDelete):
    """
    Abstract base model for all RMS database entities.

    Combines UUID primary key, audit fields, and soft delete
    into a single inheritable base. All models must subclass
    this to be registered with SQLAlchemy metadata.

    Usage:
        class User(BaseModel):
            __tablename__ = "users"

            email: Mapped[str] = mapped_column(String(255), unique=True)
            full_name: Mapped[str] = mapped_column(String(255))
    """

    __abstract__ = True

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """Auto-generate table name from class name in snake_case."""
        import re

        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        # Remove trailing '_model' if present
        if name.endswith("_model"):
            name = name[:-6]
        return name

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to a dictionary."""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name, None)
            if isinstance(value, datetime):
                value = value.isoformat()
            elif isinstance(value, uuid.UUID):
                value = str(value)
            result[column.name] = value
        return result

    def __repr__(self) -> str:
        """String representation showing table name and primary key."""
        return f"<{self.__class__.__name__}(id={self.id})>"
