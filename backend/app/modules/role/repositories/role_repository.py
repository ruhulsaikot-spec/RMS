from sqlalchemy import insert
from sqlalchemy import select
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models.auth import Role
from app.auth.models.auth import role_permissions


class RoleRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(
            select(Role)
        )
        return result.scalars().all()

    async def get_by_id(
        self,
        role_id: str,
    ):
        result = await self.db.execute(
            select(Role).where(
                Role.id == role_id
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        role: Role,
    ):
        self.db.add(role)

        await self.db.flush()
        await self.db.refresh(role)

        return role

    async def update(
        self,
        role: Role,
    ):
        await self.db.flush()
        await self.db.refresh(role)

        return role

    async def delete(
        self,
        role: Role,
    ):
        await self.db.delete(role)
        await self.db.commit()

    async def replace_permissions(
        self,
        role_id: str,
        permission_ids: list[str],
    ):
        await self.db.execute(
            delete(role_permissions).where(
                role_permissions.c.role_id == role_id
            )
        )

        for permission_id in permission_ids:

            await self.db.execute(
                insert(role_permissions).values(
                    role_id=role_id,
                    permission_id=permission_id,
                )
            )

        await self.db.commit()

        return {
            "message": "Permissions updated successfully",
            "assigned": len(permission_ids),
        }

    async def assign_permissions(
        self,
        role_id: str,
        permission_ids: list[str],
    ):
        assigned = 0
        skipped = 0

        for permission_id in permission_ids:

            existing = await self.db.execute(
                select(role_permissions).where(
                    role_permissions.c.role_id == role_id,
                    role_permissions.c.permission_id == permission_id,
                )
            )

            if existing.first():
                skipped += 1
                continue

            await self.db.execute(
                insert(role_permissions).values(
                    role_id=role_id,
                    permission_id=permission_id,
                )
            )

            assigned += 1

        await self.db.commit()

        return {
            "message": "Permissions processed successfully",
            "assigned": assigned,
            "skipped": skipped,
        }