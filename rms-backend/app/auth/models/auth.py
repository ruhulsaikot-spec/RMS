"""
RMS Backend - Auth SQLAlchemy Models

Enterprise-grade User, Role, and Permission models with
RBAC support, account status tracking, and audit fields.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Column,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

from sqlalchemy.dialects.postgresql import JSONB


# ── Association Tables (Many-to-Many) ────────────────────────
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_at", DateTime(timezone=True), server_default=text("NOW()"), nullable=False),
    Column("assigned_by", String(36), nullable=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    Column("granted_at", DateTime(timezone=True), server_default=text("NOW()"), nullable=False),
    Column("granted_by", String(36), nullable=True),
)


# ── User Model ────────────────────────────────────────────────
from app.modules.user.models.user import User

# ── Role Model ────────────────────────────────────────────────

class Role(Base):
    """
    System role for RBAC (Role-Based Access Control).

    Predefined roles: admin, employee, approver, finance.
    Each role has a set of associated permissions.
    """
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True,
        comment="Role name (e.g., admin, employee, approver, finance)",
    )
    display_name: Mapped[str] = mapped_column(
        String(100), nullable=False,
        comment="Human-readable role name",
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True,
        comment="Role description and scope",
    )
    is_system_role: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False,
        comment="System roles cannot be modified or deleted",
    )
    priority: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False,
        comment="Role priority for conflict resolution (higher = more authority)",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"), nullable=False,
    )

    # Relationships
    users: Mapped[list["User"]] = relationship(
    secondary=user_roles,
    back_populates="roles",
    lazy="selectin",
)
    permissions: Mapped[list[Permission]] = relationship(
        secondary=role_permissions, back_populates="roles", lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Role(name={self.name})>"


# ── Permission Model ──────────────────────────────────────────
class Permission(Base):
    """
    Granular permission for authorization checks.

    Permissions follow a resource:action naming convention
    (e.g., "reimbursement:create", "approval:approve", "payment:process").
    """
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()"),
    )
    code: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True,
        comment="Permission code (e.g., reimbursement:create)",
    )
    name: Mapped[str] = mapped_column(
        String(150), nullable=False,
        comment="Human-readable permission name",
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True,
        comment="Detailed permission description",
    )
    resource: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True,
        comment="Resource part of the permission (e.g., reimbursement)",
    )
    action: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="Action part of the permission (e.g., create, read, update, delete)",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), nullable=False,
    )

    # Relationships
    roles: Mapped[list["Role"]] = relationship(
        secondary=role_permissions, back_populates="permissions", lazy="selectin",
    )

    __table_args__ = (
        Index("ix_permissions_resource_action", "resource", "action"),
    )

    def __repr__(self) -> str:
        return f"<Permission(code={self.code})>"


# ── Auth Event Model (Audit Log) ──────────────────────────────
class AuthEvent(Base):
    """
    Authentication audit event log.

    Records all authentication-related events for security
    monitoring, compliance, and forensic analysis.
    """
    __tablename__ = "auth_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True,
        comment="Event type: login_success, login_failure, logout, etc.",
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45), nullable=True,
        comment="Client IP address",
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(500), nullable=True,
        comment="Client User-Agent header",
    )
    session_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True,
        comment="Session identifier",
    )
    details: Mapped[dict | None] = mapped_column(
    JSONB,
    nullable=True,
    comment="Additional event details as JSON",
    )
    success: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False,
        comment="Whether the event was successful",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), nullable=False,
    )

    # Relationships
    user: Mapped[User | None] = relationship(back_populates="auth_events")

    __table_args__ = (
        Index("ix_auth_events_user_type", "user_id", "event_type"),
        Index("ix_auth_events_created", "created_at"),
        Index("ix_auth_events_type", "event_type"),
    )

    def __repr__(self) -> str:
        return f"<AuthEvent(type={self.event_type}, user_id={self.user_id})>"
