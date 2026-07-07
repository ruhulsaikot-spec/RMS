"""
RMS Backend - Base Service Pattern

Abstract base service implementing the service layer pattern.
Services contain business logic and orchestrate repository calls.
"""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel
from app.repositories.base import BaseRepository

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseService(Generic[ModelType]):
    """
    Abstract base service for business logic orchestration.

    Services sit between API endpoints and repositories,
    enforcing business rules, validation, and cross-cutting
    concerns like authorization and notifications.

    Usage:
        class UserService(BaseService[User]):
            def __init__(self, db: AsyncSession):
                super().__init__(UserRepository(User, db))

            async def register(self, data: UserCreateSchema) -> User:
                # Business validation
                existing = await self.repo.get_by_email(data.email)
                if existing:
                    raise ConflictError("User already exists")
                return await self.repo.create(data.model_dump())
    """

    def __init__(self, repository: BaseRepository[ModelType]) -> None:
        self.repository = repository

    async def get_by_id(self, id: Any) -> ModelType | None:
        """Get entity by ID with business context."""
        return await self.repository.get_by_id(id)

    async def get_all(self, offset: int = 0, limit: int = 20) -> list[ModelType]:
        """Get paginated list of entities."""
        return list(await self.repository.get_all(offset=offset, limit=limit))

    async def count(self) -> int:
        """Count total entities."""
        return await self.repository.count()
