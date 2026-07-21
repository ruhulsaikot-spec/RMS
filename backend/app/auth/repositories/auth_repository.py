"""
RMS Backend - Auth Repository Layer

Data access layer for User, Role, Permission, and AuthEvent models.
All methods are async and use SQLAlchemy 2.0 query patterns.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models.auth import AuthEvent, Permission, Role, User


class UserRepository:
    """Repository for User model CRUD and authentication queries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        stmt = (
        select(User)
        .where(User.id == user_id, User.is_deleted == False)
    )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = (
        select(User)
        .where(User.email == email, User.is_deleted == False)
    )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_employee_id(self, employee_id: str) -> User | None:
        stmt = (
        select(User)
        .where(User.employee_id == employee_id, User.is_deleted == False)
    )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_data: dict) -> User:
        """Create a new user."""
        user = User(**user_data)
        self.db.add(user)
        await self.db.flush()
        return user

    async def update(self, user_id: str, data: dict) -> User | None:
        """Update user fields by ID."""
        stmt = (
            update(User)
            .where(User.id == user_id, User.is_deleted == False)  # noqa: E712
            .values(**data)
            .returning(User)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_login_success(
        self, user_id: str, ip_address: str | None = None
    ) -> None:
        """Reset failed attempts and update last login timestamp."""
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(
                failed_login_attempts=0,
                account_status="active",
                locked_until=None,
                last_login_at=datetime.now(timezone.utc),
                last_login_ip=ip_address,
            )
        )
        await self.db.execute(stmt)

    async def increment_failed_attempts(self, user_id: str) -> int:
        """Increment failed login attempts and return new count."""
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(failed_login_attempts=User.failed_login_attempts + 1)
            .returning(User.failed_login_attempts)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def lock_account(self, user_id: str, lock_duration_minutes: int) -> None:
        """Lock user account until the specified duration."""
        locked_until = datetime.now(timezone.utc) + __import__("datetime").timedelta(minutes=lock_duration_minutes)
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(
                account_status="locked",
                locked_until=locked_until,
            )
        )
        await self.db.execute(stmt)

    async def assign_role(self, user_id: str, role_id: str, assigned_by: str | None = None) -> None:
        """Assign a role to a user."""
        from app.auth.models.auth import user_roles
        stmt = user_roles.insert().values(
            user_id=user_id, role_id=role_id, assigned_by=assigned_by
        )
        await self.db.execute(stmt)

    async def list_active(self, offset: int = 0, limit: int = 20) -> Sequence[User]:
        """List active users with pagination."""
        stmt = (
            select(User)
            .where(User.is_deleted == False, User.is_active == True)  # noqa: E712
            .offset(offset)
            .limit(limit)
            .order_by(User.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()


class RoleRepository:
    """Repository for Role model queries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, role_id: str) -> Role | None:
        stmt = select(Role).where(Role.id == role_id).options(selectinload(Role.permissions))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Role | None:
        stmt = select(Role).where(Role.name == name).options(selectinload(Role.permissions))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self) -> Sequence[Role]:
        stmt = select(Role).options(selectinload(Role.permissions)).order_by(Role.priority.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, role_data: dict) -> Role:
        role = Role(**role_data)
        self.db.add(role)
        await self.db.flush()
        return role


class PermissionRepository:
    """Repository for Permission model queries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_code(self, code: str) -> Permission | None:
        stmt = select(Permission).where(Permission.code == code)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_resource(self, resource: str) -> Sequence[Permission]:
        stmt = select(Permission).where(Permission.resource == resource, Permission.is_active == True)  # noqa: E712
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def list_all(self) -> Sequence[Permission]:
        stmt = select(Permission).where(Permission.is_active == True).order_by(Permission.resource, Permission.action)  # noqa: E712
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, perm_data: dict) -> Permission:
        perm = Permission(**perm_data)
        self.db.add(perm)
        await self.db.flush()
        return perm

    async def get_by_id(self, permission_id: str) -> Permission | None:
        stmt = select(Permission).where(Permission.id == permission_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


    async def update(self, permission_id: str, data: dict) -> Permission | None:
        stmt = (
            update(Permission)
            .where(Permission.id == permission_id)
            .values(**data)
            .returning(Permission)
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


    async def delete(self, permission_id: str) -> None:
        stmt = (
            update(Permission)
            .where(Permission.id == permission_id)
            .values(is_active=False)
        )

        await self.db.execute(stmt)    


class AuthEventRepository:
    """Repository for AuthEvent audit log queries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, event_data: dict) -> AuthEvent:
        event = AuthEvent(**event_data)
        self.db.add(event)
        await self.db.flush()
        return event

    async def get_by_user(
        self, user_id: str, offset: int = 0, limit: int = 50
    ) -> Sequence[AuthEvent]:
        stmt = (
            select(AuthEvent)
            .where(AuthEvent.user_id == user_id)
            .offset(offset)
            .limit(limit)
            .order_by(AuthEvent.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_recent_failures(
        self, user_id: str, minutes: int = 15
    ) -> Sequence[AuthEvent]:
        """Get recent failed login events for a user."""
        cutoff = datetime.now(timezone.utc) - __import__("datetime").timedelta(minutes=minutes)
        stmt = (
            select(AuthEvent)
            .where(
                AuthEvent.user_id == user_id,
                AuthEvent.event_type == "login_failure",
                AuthEvent.created_at >= cutoff,
            )
            .order_by(AuthEvent.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
