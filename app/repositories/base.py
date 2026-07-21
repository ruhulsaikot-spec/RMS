"""
RMS Backend - Base Repository Pattern

Abstract base repository implementing common CRUD operations
with async SQLAlchemy sessions. All repository classes should
inherit from this base.
"""

from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar, Sequence

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    """
    Abstract base repository providing standard CRUD operations.

    All repositories inherit from this class and can override
    or extend methods for domain-specific operations.

    Usage:
        class UserRepository(BaseRepository[User]):
            async def get_by_email(self, email: str) -> User | None:
                stmt = select(User).where(User.email == email, User.is_deleted == False)
                result = await self.db.execute(stmt)
                return result.scalar_one_or_none()
    """

    def __init__(self, model: type[ModelType], db: AsyncSession) -> None:
        self.model = model
        self.db = db

    async def get_by_id(self, id: uuid.UUID) -> ModelType | None:
        """Retrieve a single record by primary key."""
        stmt = select(self.model).where(
            self.model.id == id,
            self.model.is_deleted == False,  # noqa: E712
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        offset: int = 0,
        limit: int = 20,
    ) -> Sequence[ModelType]:
        """Retrieve paginated list of active records."""
        stmt = (
            select(self.model)
            .where(self.model.is_deleted == False)  # noqa: E712
            .offset(offset)
            .limit(limit)
            .order_by(self.model.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def count(self) -> int:
        """Count total active records."""
        stmt = select(func.count()).select_from(self.model).where(
            self.model.is_deleted == False  # noqa: E712
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def create(self, data: dict[str, Any]) -> ModelType:
        """Create a new record."""
        instance = self.model(**data)
        self.db.add(instance)
        await self.db.flush()
        return instance

    async def update_by_id(self, id: uuid.UUID, data: dict[str, Any]) -> ModelType | None:
        """Update a record by primary key."""
        stmt = (
            update(self.model)
            .where(self.model.id == id, self.model.is_deleted == False)  # noqa: E712
            .values(**data)
            .returning(self.model)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def soft_delete(self, id: uuid.UUID, deleted_by: uuid.UUID | None = None) -> bool:
        """Soft delete a record by marking it as deleted."""
        from datetime import datetime, timezone

        stmt = (
            update(self.model)
            .where(self.model.id == id, self.model.is_deleted == False)  # noqa: E712
            .values(is_deleted=True, deleted_at=datetime.now(timezone.utc), deleted_by=deleted_by)
        )
        result = await self.db.execute(stmt)
        return result.rowcount > 0
